import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createStoreOrder } from '../../../store/slices/storeSlice';
import FeedbackModal from '../components/FeedbackModal';
import { clearCart } from '../../../store/slices/cartSlice';
import { StoreOrder } from '../../../types/store';
import { formatNaira } from '../../../utils/currency';
import { initializeStorePaymentApi, verifyStorePaymentApi } from '../../../services/api/paymentApi';
import { isDefinitivePaystackFailure, openPaystackCheckout, verifyPaystackUntilSettled } from '../../../services/api/paystackFlow';
import OrderSuccessModal from './successModel';
import MarketBottomTab from './bottomtab/bottomtab';

const { width, height } = Dimensions.get('window');

// Responsive scaling helpers using reference screen size (375 x 812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
const configuredPaymentCallbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();

export default function SecureCheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { user } = useAppSelector((state) => state.auth);
  const { balance } = useAppSelector((state) => state.wallet);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [deliveryDetailsLoaded, setDeliveryDetailsLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [successOrder, setSuccessOrder] = useState<StoreOrder | null>(null);
  const [pendingPaymentReference, setPendingPaymentReference] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'success' | 'error' | 'info' } | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0), 0);
  const shippingFee = cartItems.length > 0 ? 1500 : 0;
  const total = subtotal + shippingFee;
  const walletBalance = Number(balance ?? 0);
  const deliveryStorageKey = user?.id ? `cardzip.market.delivery.${user.id}` : null;

  useEffect(() => {
    let cancelled = false;
    setDeliveryDetailsLoaded(false);
    setName('');
    setPhone('');
    setAddress('');
    setState('');

    if (!deliveryStorageKey) {
      setDeliveryDetailsLoaded(true);
      return () => { cancelled = true; };
    }

    AsyncStorage.getItem(deliveryStorageKey)
      .then((savedDetails) => {
        if (!savedDetails || cancelled) return;
        const details = JSON.parse(savedDetails) as { name?: string; phone?: string; address?: string; state?: string };
        setName(details.name ?? '');
        setPhone(details.phone ?? '');
        setAddress(details.address ?? '');
        setState(details.state ?? '');
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setDeliveryDetailsLoaded(true);
      });

    return () => { cancelled = true; };
  }, [deliveryStorageKey]);

  useEffect(() => {
    if (!deliveryDetailsLoaded || !deliveryStorageKey) return;
    const timeoutId = setTimeout(() => {
      void AsyncStorage.setItem(deliveryStorageKey, JSON.stringify({ name, phone, address, state })).catch(() => undefined);
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [address, deliveryDetailsLoaded, deliveryStorageKey, name, phone, state]);

  const handlePlaceOrder = () => { void submitOrder(paymentMethod); };

  const verifyPaystackOrder = async (reference: string) => {
    if (!token) throw new Error('Sign in before verifying this payment.');
    const verification = await verifyPaystackUntilSettled({
      verify: () => verifyStorePaymentApi(token, reference),
      getStatus: (result) => result.status === 'completed' && result.order ? 'completed' : 'pending',
      attempts: 12,
      intervalMs: 2000,
      failureMessage: 'Paystack did not complete this order.',
      pendingMessage: 'Order payment is still being confirmed. Do not start another payment.',
    });
    dispatch(clearCart());
    setPendingPaymentReference(null);
    setPaymentError('');
    setSuccessOrder(verification.order);
  };

  const checkPendingPayment = useCallback(async () => {
    if (!pendingPaymentReference || !token) return;
    setVerifyingPayment(true);
    setPaymentError('');
    try {
      await verifyPaystackOrder(pendingPaymentReference);
    } catch (verificationError) {
      const message = verificationError instanceof Error ? verificationError.message : 'Could not verify this payment.';
      setPaymentError(message);
      if (isDefinitivePaystackFailure(verificationError)) {
        setPendingPaymentReference(null);
      }
    } finally {
      setVerifyingPayment(false);
    }
  }, [pendingPaymentReference, token]);

  useEffect(() => {
    if (!pendingPaymentReference || !token || isSubmitting || verifyingPayment) return undefined;
    const retryTimer = setTimeout(() => { void checkPendingPayment(); }, 3000);
    return () => clearTimeout(retryTimer);
  }, [checkPendingPayment, isSubmitting, pendingPaymentReference, token, verifyingPayment]);

  const submitOrder = async (selectedPaymentMethod: 'wallet' | 'card') => {
    if (!deliveryDetailsLoaded) {
      setFeedback({ title: 'Loading delivery details', message: 'Wait for your saved delivery information to load.', tone: 'info' });
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim() || !state.trim()) {
      setFeedback({ title: 'Delivery details required', message: 'Enter your name, phone number, address, and state before placing the order.', tone: 'info' });
      return;
    }

    if (cartItems.length === 0) {
      setFeedback({ title: 'Your cart is empty', message: 'Add an item before checking out.', tone: 'info' });
      return;
    }

    if (!token) {
      setFeedback({ title: 'Authentication required', message: 'Please sign in to place this order.', tone: 'info' });
      return;
    }

    if (selectedPaymentMethod === 'wallet' && walletBalance < total) {
      setFeedback({ title: 'Insufficient wallet balance', message: 'Top up your wallet or switch to card payment.', tone: 'error' });
      return;
    }
    if (selectedPaymentMethod === 'card' && pendingPaymentReference) {
      setPaymentError('Your existing Paystack checkout is still being confirmed. Its status will update automatically.');
      return;
    }

    let paymentReference = '';
    setIsSubmitting(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId ?? item.id,
          name: item.name ?? item.title ?? 'Product',
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? '',
          selectedColor: item.selectedColor,
        })),
        shippingAddress: { name, phone, address, state },
        paymentMethod: selectedPaymentMethod,
      };

      if (selectedPaymentMethod === 'wallet') {
        const resultAction = await dispatch(createStoreOrder({ token, payload }));
        if (!createStoreOrder.fulfilled.match(resultAction)) {
          throw new Error(typeof resultAction.payload === 'string' ? resultAction.payload : 'Unable to place order.');
        }
        dispatch(clearCart());
        setSuccessOrder(resultAction.payload);
      } else {
        setPaymentError('');
        const callbackUrl = configuredPaymentCallbackUrl || Linking.createURL('payment/callback', { scheme: 'cardzip' });
        const payment = await initializeStorePaymentApi(token, payload, callbackUrl);
        paymentReference = payment.reference;
        setPendingPaymentReference(payment.reference);
        await openPaystackCheckout(payment.authorizationUrl, callbackUrl);
        await verifyPaystackOrder(payment.reference);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to place your order.';
      if (paymentReference) {
        setPaymentError(message);
        if (isDefinitivePaystackFailure(error)) setPendingPaymentReference(null);
      } else {
        setFeedback({ title: 'Order failed', message, tone: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header Bar */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Feather name="arrow-left" size={scale(18)} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerCategory}>FLEEXA MARKET</Text>
            <Text style={styles.headerTitle}>Secure Checkout</Text>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>One last step. Make it yours.</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        {/* Progress Tracker */}
        <View style={styles.progressRow}>
          <View style={styles.progressStep}>
            <Ionicons name="checkmark-circle" size={scale(16)} color="#10B981" />
            <Text style={styles.progressTextActive}>Cart</Text>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressStep}>
            <View style={styles.activeDot} />
            <Text style={styles.progressTextCurrent}>Delivery & payment</Text>
          </View>

          <View style={styles.progressLineInactive} />

          <View style={styles.progressStep}>
            <Text style={styles.progressTextInactive}>Done</Text>
          </View>
        </View>

        {/* Section: Delivery Address */}
        <Text style={styles.sectionTitle}>Delivery address</Text>

        <View style={styles.twoColumnRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor="#94A3B8"
              editable={deliveryDetailsLoaded}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor="#94A3B8"
              editable={deliveryDetailsLoaded}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={styles.textInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Street address"
            placeholderTextColor="#94A3B8"
            editable={deliveryDetailsLoaded}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>State</Text>
          <TextInput
            style={styles.textInput}
            value={state}
            onChangeText={setState}
            placeholder="State"
            placeholderTextColor="#94A3B8"
            editable={deliveryDetailsLoaded}
            returnKeyType="done"
          />
        </View>

        {/* Section: Payment Method */}
        <View style={styles.paymentHeaderRow}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <Text style={styles.secureEncryptedText}>Secure & encrypted</Text>
        </View>

        {/* Option 1: Wallet Balance */}
        <TouchableOpacity
          style={[
            styles.paymentCard,
            paymentMethod === 'wallet' && styles.paymentCardSelected,
          ]}
          onPress={() => setPaymentMethod('wallet')}
          activeOpacity={0.85}
        >
          <View style={styles.paymentLeft}>
            <View style={styles.walletIconBox}>
              <Ionicons name="wallet-outline" size={scale(20)} color="#10B981" />
            </View>
            <View>
              <Text style={styles.paymentTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                Wallet Balance <Text style={styles.walletAmount}>({formatNaira(walletBalance, { minimumFractionDigits: 2 })})</Text>
              </Text>
              <Text style={styles.paymentSubtitle}>Pay instantly, no extra fees.</Text>
            </View>
          </View>

          <View style={styles.radioOuter}>
            {paymentMethod === 'wallet' && (
              <Ionicons name="checkmark-circle" size={scale(22)} color="#10B981" />
            )}
          </View>
        </TouchableOpacity>

        {/* Option 2: Card / Bank Transfer */}
        <TouchableOpacity
          style={[
            styles.paymentCard,
            styles.paymentCardUnselected,
            paymentMethod === 'card' && styles.paymentCardSelected,
          ]}
          onPress={() => setPaymentMethod('card')}
          activeOpacity={0.85}
        >
          <View style={styles.paymentLeft}>
            <View style={styles.cardIconBox}>
              <Feather name="credit-card" size={scale(18)} color="#64748B" />
            </View>
            <Text style={styles.paymentTitle}>Card / Bank Transfer</Text>
          </View>

          <View style={styles.radioCircleUnchecked}>
            {paymentMethod === 'card' && <View style={styles.radioInnerChecked} />}
          </View>
        </TouchableOpacity>

        {/* Order Summary Box */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryItemsText} numberOfLines={2} ellipsizeMode="tail">{cartItems.map((item) => item.name ?? item.title ?? 'Item').join(', ') || 'No items selected'}</Text>
            <Text style={styles.summaryCountBadge}>{cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} item{cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0) === 1 ? '' : 's'}</Text>
          </View>

          <Text style={styles.summarySubtext}>
            {`${formatNaira(subtotal, { minimumFractionDigits: 2 })} subtotal + ${formatNaira(shippingFee, { minimumFractionDigits: 2 })} shipping`}
          </Text>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalAmount}>{formatNaira(total, { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {pendingPaymentReference ? (
          <View style={styles.pendingPaymentCard}>
            <Text style={styles.pendingPaymentTitle}>Paystack checkout pending</Text>
            <Text style={styles.pendingPaymentMessage}>{paymentError || 'We are confirming your payment automatically. Do not start another checkout.'}</Text>
            <Text style={styles.pendingPaymentReference}>Reference: {pendingPaymentReference}</Text>
            <View style={styles.pendingPaymentProgress}>
              <ActivityIndicator color="#047857" />
              <Text style={styles.pendingPaymentProgressText}>{verifyingPayment ? 'Checking Paystack…' : 'Next automatic check shortly'}</Text>
            </View>
          </View>
        ) : null}
        {!pendingPaymentReference && paymentError ? (
          <View style={styles.paymentFailureCard} accessibilityRole="alert">
            <Text style={styles.paymentFailureTitle}>Payment not completed</Text>
            <Text style={styles.paymentFailureMessage}>{paymentError}</Text>
          </View>
        ) : null}

        {/* Action Button */}
        <TouchableOpacity style={styles.authorizeButton} activeOpacity={0.85} onPress={handlePlaceOrder} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#0F172A" /> : <Feather name="lock" size={scale(16)} color="#0F172A" style={{ marginRight: scale(8) }} />}
          <Text style={styles.authorizeButtonText}>{isSubmitting ? 'Opening secure checkout…' : paymentMethod === 'card' ? 'Continue to Paystack' : 'Authorize & Place Order'}</Text>
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNoteRow}>
          <MaterialIcons name="security" size={scale(14)} color="#94A3B8" />
          <Text style={styles.securityNoteText}>
            Your wallet is charged only when you place your order.
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <MarketBottomTab activeTab="Cart" />
      <FeedbackModal
        visible={feedback !== null}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        tone={feedback?.tone}
        onClose={() => setFeedback(null)}
      />
      <OrderSuccessModal
        visible={Boolean(successOrder)}
        order={successOrder}
        onClose={() => {
          setSuccessOrder(null);
          router.replace('/(main)/market/orders');
        }}
        onViewReceipt={() => {
          if (!successOrder) return;
          const orderNumber = successOrder.orderNumber;
          setSuccessOrder(null);
          router.push({ pathname: '/(main)/market/receipt', params: { orderNumber } });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardArea: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#0B1220',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  backButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  headerTextContainer: {
    flex: 1,
  },
  headerCategory: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: verticalScale(2),
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(30),
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTextActive: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#10B981',
    marginLeft: scale(4),
  },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#10B981',
    marginHorizontal: scale(8),
  },
  progressLineInactive: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: scale(8),
  },
  activeDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#10B981',
    marginRight: scale(6),
  },
  progressTextCurrent: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  progressTextInactive: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: verticalScale(12),
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: verticalScale(14),
  },
  inputLabel: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#334155',
    marginBottom: verticalScale(6),
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    height: verticalScale(44),
    fontFamily: 'Poppins',
    fontSize: moderateScale(13),
    color: '#0F172A',
  },
  dropdownInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    height: verticalScale(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(13),
    color: '#0F172A',
  },
  paymentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(4),
  },
  secureEncryptedText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#64748B',
  },
  paymentCard: {
    borderRadius: scale(16),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  paymentCardSelected: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  paymentCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  cardIconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  paymentTitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  walletAmount: {
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentSubtitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#64748B',
    marginTop: verticalScale(2),
  },
  radioOuter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleUnchecked: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerChecked: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: '#10B981',
  },
  summaryCard: {
    backgroundColor: '#0B1220',
    borderRadius: scale(18),
    padding: scale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: scale(8),
    marginBottom: verticalScale(4),
  },
  summaryItemsText: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    fontFamily: 'Poppins',
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryCountBadge: {
    flexShrink: 0,
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#64748B',
  },
  summarySubtext: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#64748B',
    marginBottom: verticalScale(14),
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: verticalScale(12),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  totalAmount: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#10B981',
  },
  authorizeButton: {
    backgroundColor: '#10B981',
    height: verticalScale(48),
    borderRadius: scale(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  authorizeButtonText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  pendingPaymentCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: scale(12),
    padding: scale(14),
    marginBottom: verticalScale(14),
  },
  pendingPaymentTitle: {
    color: '#92400E',
    fontFamily: 'Poppins',
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  pendingPaymentMessage: {
    color: '#78350F',
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    marginTop: verticalScale(5),
  },
  pendingPaymentReference: {
    color: '#78350F',
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    marginTop: verticalScale(7),
  },
  pendingPaymentProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: verticalScale(10),
  },
  pendingPaymentProgressText: {
    color: '#047857',
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  paymentFailureCard: { padding: scale(14), marginBottom: verticalScale(14), borderRadius: scale(12), borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  paymentFailureTitle: { color: '#991B1B', fontSize: moderateScale(13), fontWeight: '800' },
  paymentFailureMessage: { color: '#7F1D1D', fontSize: moderateScale(11), lineHeight: moderateScale(16), marginTop: verticalScale(5) },
  verifyPaymentButton: {
    minHeight: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(9),
    backgroundColor: '#047857',
    marginTop: verticalScale(10),
  },
  verifyPaymentText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    fontWeight: '800',
  },
  securityNoteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  securityNoteText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#94A3B8',
    marginLeft: scale(6),
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
  },
  activeNavItem: {
    backgroundColor: '#0B1220',
  },
  navText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: '#64748B',
    marginLeft: scale(6),
  },
  activeNavText: {
    color: '#10B981',
    fontWeight: '600',
  },
  cartBadge: {
    backgroundColor: '#10B981',
    borderRadius: scale(8),
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(1),
    marginLeft: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#0F172A',
  },
});