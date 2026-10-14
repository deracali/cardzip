import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { createStoreOrder } from '../../store/slices/storeSlice';
import { clearCart } from '../../store/slices/cartSlice';
import PaymentOptionsSheet from '../../../components/PaymentOptionsSheet';

const { width, height } = Dimensions.get('window');

// Responsive scaling helpers using reference screen size (375 x 812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

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
  const [activeTab, setActiveTab] = useState('Cart');
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);

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

  const handlePlaceOrder = () => setPaymentSheetVisible(true);

  const submitOrder = async (selectedPaymentMethod: 'wallet' | 'card') => {
    setPaymentSheetVisible(false);
    if (!deliveryDetailsLoaded) {
      Alert.alert('Loading delivery details', 'Wait for your saved delivery information to load.');
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim() || !state.trim()) {
      Alert.alert('Delivery details required', 'Enter your name, phone number, address, and state before placing the order.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Your cart is empty', 'Add an item before checking out.');
      return;
    }

    if (!token) {
      Alert.alert('Authentication required', 'Please sign in to place this order.');
      return;
    }

    if (selectedPaymentMethod === 'wallet' && walletBalance < total) {
      Alert.alert('Insufficient wallet balance', 'Top up your wallet or switch to card payment.');
      return;
    }

    try {
      const resultAction = await dispatch(createStoreOrder({
        token,
        payload: {
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name ?? item.title ?? 'Product',
            price: item.price,
            quantity: item.quantity,
            image: item.image ?? '',
          })),
          shippingAddress: { name, phone, address, state },
          paymentMethod: selectedPaymentMethod,
        },
      }));

      if (createStoreOrder.fulfilled.match(resultAction)) {
        dispatch(clearCart());
        Alert.alert('Order placed', 'Your order was submitted successfully.');
        router.push('/market/orders');
      } else {
        Alert.alert('Order failed', typeof resultAction.payload === 'string' ? resultAction.payload : 'Unable to place your order.');
      }
    } catch (error) {
      Alert.alert('Order failed', error instanceof Error ? error.message : 'Unable to place your order.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

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
              <Text style={styles.paymentTitle}>
                Wallet Balance <Text style={styles.walletAmount}>({`₦${walletBalance.toLocaleString('en-US')}.00`})</Text>
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
            <Text style={styles.summaryItemsText}>{cartItems.map((item) => item.name ?? item.title ?? 'Item').join(', ') || 'No items selected'}</Text>
              <Text style={styles.summaryCountBadge}>{cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} item{cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0) === 1 ? '' : 's'}</Text>
          </View>

          <Text style={styles.summarySubtext}>
            {`₦${subtotal.toLocaleString('en-US')}.00 subtotal + ₦${shippingFee.toLocaleString('en-US')}.00 shipping`}
          </Text>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalAmount}>{`₦${total.toLocaleString('en-US')}.00`}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.authorizeButton} activeOpacity={0.85} onPress={handlePlaceOrder}>
          <Feather name="lock" size={scale(16)} color="#0F172A" style={{ marginRight: scale(8) }} />
          <Text style={styles.authorizeButtonText}>Authorize & Place Order</Text>
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Home' && styles.activeNavItem]}
          onPress={() => router.push('/(main)/(tabs)/store')}
        >
          <Feather
            name="home"
            size={scale(18)}
            color={activeTab === 'Home' ? '#10B981' : '#64748B'}
          />
          <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Cart' && styles.activeNavItem]}
          onPress={() => router.push('/(main)/market/cart')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather
              name="shopping-bag"
              size={scale(18)}
              color={activeTab === 'Cart' ? '#10B981' : '#64748B'}
            />
            <Text
              style={[
                styles.navText,
                { marginLeft: scale(6) },
                activeTab === 'Cart' && styles.activeNavText,
              ]}
            >
              Cart
            </Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Orders' && styles.activeNavItem]}
          onPress={() => router.push('/(main)/market/orders')}
        >
          <Feather
            name="file-text"
            size={scale(18)}
            color={activeTab === 'Orders' ? '#10B981' : '#64748B'}
          />
          <Text style={[styles.navText, activeTab === 'Orders' && styles.activeNavText]}>Orders</Text>
        </TouchableOpacity>
      </View>
      <PaymentOptionsSheet
        visible={paymentSheetVisible}
        amount={total}
        walletBalance={walletBalance}
        walletEnabled
        onClose={() => setPaymentSheetVisible(false)}
        onPayFromWallet={() => { void submitOrder('wallet'); }}
        onContinueWithProvider={paymentMethod === 'card' ? () => { void submitOrder('card'); } : undefined}
        providerLabel="Continue with card"
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
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: verticalScale(2),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
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
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  progressTextInactive: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  sectionTitle: {
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
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  walletAmount: {
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentSubtitle: {
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
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  summaryItemsText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryCountBadge: {
    fontSize: moderateScale(11),
    color: '#64748B',
  },
  summarySubtext: {
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
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  totalAmount: {
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
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  securityNoteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  securityNoteText: {
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
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#0F172A',
  },
});