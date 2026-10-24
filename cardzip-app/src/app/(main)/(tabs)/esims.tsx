import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import NumberHubHeader from '../components/NumberHubHeader';
import NumberHubCatalog from '../components/NumberHubCatalog';
import NumberHubRentals from '../components/NumberHubRentals';
import NumberHubConfirmModal from '../components/NumberHubConfirmModal';
import FeedbackModal from '../components/FeedbackModal';
import PaymentOptionsSheet from '../../../components/PaymentOptionsSheet';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';
import * as ExpoLinking from 'expo-linking';
import { isDefinitivePaystackFailure, openPaystackCheckout, verifyPaystackUntilSettled } from '../../../services/api/paystackFlow';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchWalletBalance } from '../../../store/slices/walletSlice';
import {
  cancelRental,
  fetchActiveRentals,
  fetchRentalApps,
  fetchRentalAreas,
  fetchRentalDurations,
  fetchRentalMessages,
  fetchRentalPricing,
  NumberHubOption,
  purchaseRental,
  RentalDuration,
  RentalPricing,
  RentalProfile,
  NumberHubApiError,
  renewRental,
  SmsMessage,
  updateRentalAutoRenew,
  verifyVirtualNumberPayment,
} from '../../../services/api/numberHubApi';

// --------------------------------------------------
// Responsive Dimensions & Scaling Helpers
// --------------------------------------------------
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage: number): number => Math.round((percentage * SCREEN_WIDTH) / 100);
const hp = (percentage: number): number => Math.round((percentage * SCREEN_HEIGHT) / 100);
const scale = (size: number): number => Math.round(wp((size / SCREEN_WIDTH) * 100));

const COLORS = {
  bgLight: '#F5F7FA',
  headerDark: '#0B131E',
  cardDark: '#0D1726',
  cardLight: '#FFFFFF',
  accentGreen: '#12B76A',
  accentGreenDark: '#0B8A4E',
  accentGreenLight: '#E6F4ED',
  textDark: '#0D1527',
  textMuted: '#6B7A90',
  textLight: '#FFFFFF',
  textMutedLight: '#94A3B8',
  border: '#E2E8F0',
  warningRedBg: '#2A171D',
  warningRedText: '#FF6B6B',
  pillBgDark: '#172334',
};

const configuredPaymentCallbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();

type PurchaseResult = {
  status: 'success' | 'pending' | 'failed';
  message: string;
  phoneNumber?: string;
};

const isFailedPaymentError = (error: unknown): error is NumberHubApiError =>
  error instanceof NumberHubApiError &&
  typeof error.data === 'object' &&
  error.data !== null &&
  'status' in error.data &&
  error.data.status === 'failed';

export default function NumberHubScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const walletBalance = useAppSelector((state) => state.wallet.balance);
  const walletCurrency = useAppSelector((state) => state.wallet.currency);
  const walletLoading = useAppSelector((state) => state.wallet.loading);
  const [activeTab, setActiveTab] = useState<'catalog' | 'rentals' | 'inbox'>(tab === 'catalog' ? 'catalog' : 'rentals');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [areas, setAreas] = useState<NumberHubOption[]>([]);
  const [apps, setApps] = useState<NumberHubOption[]>([]);
  const [durations, setDurations] = useState<RentalDuration[]>([]);
  const [pricing, setPricing] = useState<RentalPricing | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [durationLoading, setDurationLoading] = useState(false);
  const [rentals, setRentals] = useState<RentalProfile[]>([]);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet');
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const [pendingPaymentReference, setPendingPaymentReference] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'success' | 'error' | 'info' } | null>(null);
  const [manageRental, setManageRental] = useState<RentalProfile | null>(null);

  const selectedArea = areas.find((area) => area.value === selectedRegion) ?? areas[0];
  const selectedApp = apps.find((app) => app.value === selectedService) ?? apps[0];
  const selectedDurationOption = durations.find((duration) => duration.value === selectedDuration) ?? durations[0];

  useFocusEffect(useCallback(() => {
    if (tab !== 'catalog') return undefined;
    const frame = requestAnimationFrame(() => setActiveTab('catalog'));
    return () => cancelAnimationFrame(frame);
  }, [tab]));

  useEffect(() => {
    if (token) void dispatch(fetchWalletBalance(token));
  }, [dispatch, token]);

  const loadRentals = async () => {
    setRentalLoading(true);
    try {
      if (!token) throw new Error('Sign in to load your virtual-number rentals.');
      const nextRentals = await fetchActiveRentals(token);
      setRentals(nextRentals);
      setSelectedRentalId((current) => current && nextRentals.some((rental) => rental.id === current)
        ? current
        : nextRentals[0]?.id ?? null);
      return nextRentals;
    } catch (error) {
      setFeedback({
        title: 'Rentals unavailable',
        message: error instanceof Error ? error.message : 'Could not load active rentals.',
        tone: 'error',
      });
      return [];
    } finally {
      setRentalLoading(false);
    }
  };

  const loadInbox = async (rentalId?: string) => {
    setInboxLoading(true);
    try {
      if (!token) throw new Error('Sign in to load your virtual-number messages.');
      const rentalList = rentals.length ? rentals : await fetchActiveRentals(token);
      if (!rentals.length) setRentals(rentalList);
      const targetId = rentalId ?? selectedRentalId ?? rentalList[0]?.id;
      if (!targetId) {
        setMessages([]);
        return;
      }
      setSelectedRentalId(targetId);
      setMessages(await fetchRentalMessages(targetId, token));
    } catch (error) {
      setFeedback({
        title: 'Inbox unavailable',
        message: error instanceof Error ? error.message : 'Could not load SMS messages.',
        tone: 'error',
      });
    } finally {
      setInboxLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setCatalogLoading(true);
    Promise.all([fetchRentalAreas(), fetchRentalApps()])
      .then(([availableAreas, availableApps]) => {
        if (!mounted) return;
        setAreas(availableAreas);
        setApps(availableApps);
        setSelectedRegion((current) => availableAreas.some((area) => area.value === current) ? current : availableAreas[0]?.value ?? '');
        setSelectedService((current) => availableApps.some((app) => app.value === current) ? current : availableApps[0]?.value ?? '');
        setApiError(null);
      })
      .catch((error: unknown) => {
        if (mounted) setApiError(error instanceof Error ? error.message : 'Could not load the rental catalog.');
      })
      .finally(() => { if (mounted) setCatalogLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!token) {
      setRentals([]);
      setRentalLoading(false);
      return;
    }
    let mounted = true;
    setRentalLoading(true);
    fetchActiveRentals(token)
      .then((loadedRentals) => {
        if (!mounted) return;
        setRentals(loadedRentals);
        setSelectedRentalId(loadedRentals[0]?.id ?? null);
        if (loadedRentals[0]) {
          fetchRentalMessages(loadedRentals[0].id, token)
            .then((loadedMessages) => { if (mounted) setMessages(loadedMessages); })
            .catch(() => undefined);
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setFeedback({
            title: 'Rentals unavailable',
            message: error instanceof Error ? error.message : 'Could not load active rentals.',
            tone: 'error',
          });
        }
      })
      .finally(() => { if (mounted) setRentalLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  useEffect(() => {
    if (!selectedApp) {
      setDurationLoading(false);
      return;
    }
    let mounted = true;
    setDurations([]);
    setSelectedDuration('');
    setDurationLoading(true);
    fetchRentalDurations(selectedApp.value)
      .then((availableDurations) => {
        if (!mounted) return;
        setDurations(availableDurations);
        setSelectedDuration((current) => availableDurations.some((duration) => duration.value === current)
          ? current
          : availableDurations[0]?.value ?? '');
      })
      .catch((error: unknown) => {
        if (mounted) setApiError(error instanceof Error ? error.message : 'Could not load rental durations.');
      })
      .finally(() => { if (mounted) setDurationLoading(false); });
    return () => { mounted = false; };
  }, [selectedApp?.value]);

  useEffect(() => {
    if (!selectedApp || !selectedDuration) return;
    let mounted = true;
    setPricing(null);
    setPricingLoading(true);
    fetchRentalPricing(selectedApp.value, selectedDurationOption?.duration ?? selectedDuration)
      .then((currentPricing) => { if (mounted) setPricing(currentPricing); })
      .catch((error: unknown) => {
        if (mounted) setApiError(error instanceof Error ? error.message : 'Could not load rental pricing.');
      })
      .finally(() => { if (mounted) setPricingLoading(false); });
    return () => { mounted = false; };
  }, [selectedApp?.value, selectedDuration, selectedDurationOption?.duration]);

  useEffect(() => {
    if (activeTab !== 'inbox' || !selectedRentalId || !token) return;
    const interval = setInterval(() => {
      fetchRentalMessages(selectedRentalId, token).then(setMessages).catch(() => undefined);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeTab, selectedRentalId, token]);

  const handleTabChange = (tab: 'catalog' | 'rentals' | 'inbox') => {
    setActiveTab(tab);
    if (tab === 'rentals') void loadRentals();
    if (tab === 'inbox') void loadInbox();
  };

  const handlePurchase = async () => {
    if (!selectedApp || !selectedDurationOption) {
      setFeedback({
        title: 'Choose a rental option',
        message: 'Select an available service and duration first.',
        tone: 'info',
      });
      return;
    }
    if (!token) {
      setConfirmModalVisible(false);
      setPurchaseResult({ status: 'failed', message: 'Sign in before purchasing a virtual number.' });
      return;
    }
    setPurchasing(true);
    let paystackReference = '';
    try {
      const callbackUrl = configuredPaymentCallbackUrl || ExpoLinking.createURL('payment/callback', { scheme: 'cardzip' });
      const result = await purchaseRental({
        appName: selectedApp.value,
        time: selectedDurationOption.time,
        duration: selectedDurationOption.duration,
        area: selectedArea?.value,
        paymentMethod,
        ...(paymentMethod === 'paystack' ? { callbackUrl } : {}),
      }, token);
      setConfirmModalVisible(false);
      if (paymentMethod === 'paystack') {
        const authorizationUrl = result.data?.authorizationUrl;
        const reference = result.data?.reference;
        if (!authorizationUrl || !reference) throw new Error('Paystack checkout could not be started.');
        paystackReference = reference;
        setPendingPaymentReference(reference);
        await openPaystackCheckout(authorizationUrl, callbackUrl);
        const verification = await verifyPaystackUntilSettled({
          verify: () => verifyVirtualNumberPayment(reference, token),
          getStatus: (result) => result.data.status === 'completed' ? 'completed' : result.data.status === 'failed' ? 'failed' : 'pending',
          attempts: 12,
          intervalMs: 2000,
          failureMessage: 'Paystack did not complete this rental.',
          pendingMessage: 'Your payment is still being confirmed. Do not start another rental.',
        });
        setPurchaseResult({
          status: 'success',
          message: 'Paystack confirmed your payment and your virtual number is ready.',
          phoneNumber: verification.data.phoneNumber,
        });
      } else {
        if (result.data?.status !== 'completed') {
          throw new Error(result.data?.failureReason || 'Your virtual-number rental could not be completed.');
        }
        setPurchaseResult({
          status: 'success',
          message: 'Your wallet payment is complete and your virtual number is ready.',
          phoneNumber: result.data.phoneNumber,
        });
      }
      setPendingPaymentReference('');
      setActiveTab('rentals');
      await loadRentals();
      try {
        await dispatch(fetchWalletBalance(token)).unwrap();
      } catch {
        setPurchaseResult((current) => current?.status === 'success'
          ? { ...current, message: `${current.message} Refresh your wallet balance if it has not updated yet.` }
          : current);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not purchase this rental.';
      if (paymentMethod === 'paystack' && paystackReference && !isFailedPaymentError(error) && !isDefinitivePaystackFailure(error)) {
        setPurchaseResult({ status: 'pending', message: `${message} Verify the payment again shortly.` });
      } else {
        if (isFailedPaymentError(error)) setPendingPaymentReference('');
        setPurchaseResult({ status: 'failed', message });
      }
    } finally {
      setPurchasing(false);
    }
  };

  const verifyPendingPurchase = useCallback(async () => {
    if (!pendingPaymentReference || !token) return;
    setPurchasing(true);
    try {
      const verification = await verifyPaystackUntilSettled({
        verify: () => verifyVirtualNumberPayment(pendingPaymentReference, token),
        getStatus: (result) => result.data.status === 'completed' ? 'completed' : result.data.status === 'failed' ? 'failed' : 'pending',
        attempts: 10,
        intervalMs: 2000,
        failureMessage: 'Paystack did not complete this rental.',
        pendingMessage: 'Your payment is still being confirmed. Do not start another rental.',
      });
      setPendingPaymentReference('');
      setPurchaseResult({
        status: 'success',
        message: 'Paystack confirmed your payment and your virtual number is ready.',
        phoneNumber: verification.data.phoneNumber,
      });
      setActiveTab('rentals');
      await loadRentals();
      await dispatch(fetchWalletBalance(token)).unwrap();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not verify this payment.';
      if (isFailedPaymentError(error) || isDefinitivePaystackFailure(error)) {
        setPendingPaymentReference('');
        setPurchaseResult({ status: 'failed', message });
      } else {
        setPurchaseResult({
          status: 'pending',
          message: `${message} You can verify this payment again shortly.`,
        });
      }
    } finally {
      setPurchasing(false);
    }
  }, [dispatch, pendingPaymentReference, token]);

  useEffect(() => {
    if (!pendingPaymentReference || !token || purchasing) return undefined;
    const retryTimer = setTimeout(() => { void verifyPendingPurchase(); }, 3000);
    return () => clearTimeout(retryTimer);
  }, [pendingPaymentReference, purchasing, token, verifyPendingPurchase]);

  const handleAutoRenew = async (rentalId: string, value: boolean) => {
    const previousRentals = rentals;
    setRentals((current) => current.map((rental) => rental.id === rentalId ? { ...rental, autoRenew: value } : rental));
    try {
      if (!token) throw new Error('Sign in to update rental settings.');
      await updateRentalAutoRenew(rentalId, value, token);
    } catch (error) {
      setRentals(previousRentals);
      setFeedback({
        title: 'Auto-renew update failed',
        message: error instanceof Error ? error.message : 'Could not update auto-renew.',
        tone: 'error',
      });
    }
  };

  const handleRenew = async (rentalId: string) => {
    try {
      if (!token) throw new Error('Sign in to renew this rental.');
      await renewRental(rentalId, token, selectedDurationOption?.time ?? 1, selectedDurationOption?.duration);
      setFeedback({
        title: 'Rental renewed',
        message: 'The provider accepted the renewal request.',
        tone: 'success',
      });
      await loadRentals();
    } catch (error) {
      setFeedback({
        title: 'Renewal failed',
        message: error instanceof Error ? error.message : 'Could not renew this rental.',
        tone: 'error',
      });
    }
  };

  const handleCancel = async (rentalId: string) => {
    try {
      if (!token) throw new Error('Sign in to manage this rental.');
      await cancelRental(rentalId, token);
      await loadRentals();
    } catch (error) {
      setFeedback({
        title: 'Cancellation unavailable',
        message: error instanceof Error ? error.message : 'The provider does not allow this rental to be cancelled.',
        tone: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NumberHubHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeRentalCount={rentals.length}
        styles={styles}
      />

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'catalog' ? (
          <NumberHubCatalog
            selectedRegion={selectedRegion}
            selectedService={selectedService}
            selectedDuration={selectedDuration}
            areas={areas}
            apps={apps}
            durations={durations}
            pricing={pricing}
            walletBalance={Number(walletBalance) || 0}
            walletCurrency={walletCurrency}
            walletLoading={walletLoading}
            walletEnabled={Boolean(token)}
            pricingLoading={pricingLoading}
            durationLoading={durationLoading}
            loading={catalogLoading}
            purchasing={purchasing}
            error={apiError}
            onSelectRegion={setSelectedRegion}
            onSelectService={setSelectedService}
            onSelectDuration={setSelectedDuration}
            onRent={() => {
              if (!pricing) {
                setFeedback({
                  title: 'Pricing unavailable',
                  message: 'Wait for the provider price before continuing.',
                  tone: 'info',
                });
                return;
              }
              setPaymentSheetVisible(true);
            }}
            styles={styles}
            colors={COLORS}
          />
        ) : (
          <NumberHubRentals
            activeTab={activeTab}
            rentals={rentals}
            messages={messages}
            loading={rentalLoading}
            inboxLoading={inboxLoading}
            setAutoRenew={handleAutoRenew}
            codeCopied={codeCopied}
            onCopyCode={() => setCodeCopied(true)}
            onRefresh={() => { void loadRentals(); }}
            onOpenInbox={(rentalId) => { setActiveTab('inbox'); void loadInbox(rentalId); }}
            onRenew={(rentalId) => { void handleRenew(rentalId); }}
            onCancel={(rentalId) => { void handleCancel(rentalId); }}
            onManageRental={(rental) => setManageRental(rental)}
            styles={styles}
            colors={COLORS}
          />
        )}
      </KeyboardAwareScrollView>

      <Modal
        transparent
        visible={Boolean(manageRental)}
        animationType="fade"
        onRequestClose={() => setManageRental(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.manageModalCard}>
            <Text style={styles.manageModalTitle}>Manage rental</Text>
            <Text style={styles.manageModalMessage}>{manageRental?.phoneNumber ?? 'Select an action for this rental.'}</Text>
            <TouchableOpacity
              style={[styles.manageModalButton, styles.managePrimaryButton]}
              onPress={() => {
                const rental = manageRental;
                setManageRental(null);
                if (rental) void handleRenew(rental.id);
              }}
            >
              <Text style={styles.manageModalButtonText}>Renew</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.manageModalButton, styles.manageDangerButton]}
              onPress={() => {
                const rental = manageRental;
                setManageRental(null);
                if (rental) void handleCancel(rental.id);
              }}
            >
              <Text style={styles.manageModalButtonText}>Cancel rental</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.manageModalSecondary} onPress={() => setManageRental(null)}>
              <Text style={styles.manageModalSecondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NumberHubConfirmModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onAuthorize={handlePurchase}
        country={selectedArea?.label ?? selectedRegion}
        countryCode={selectedArea?.code ?? selectedRegion}
        service={selectedApp?.label}
        duration={selectedDurationOption?.label}
        price={pricing?.price ?? 0}
        originalPrice={pricing?.originalPrice}
        currency={pricing?.currency}
        purchasing={purchasing}
        styles={styles}
        colors={COLORS}
      />
      <PaymentOptionsSheet
        visible={paymentSheetVisible}
        amount={pricing?.price}
        walletBalance={Number(walletBalance) || 0}
        walletEnabled={Boolean(token)}
        allowInsufficientWallet
        providerLabel="Pay with Paystack"
        onClose={() => setPaymentSheetVisible(false)}
        onPayFromWallet={() => {
          setPaymentMethod('wallet');
          setPaymentSheetVisible(false);
          setConfirmModalVisible(true);
        }}
        onContinueWithProvider={() => {
          setPaymentMethod('paystack');
          setPaymentSheetVisible(false);
          setConfirmModalVisible(true);
        }}
      />
      <FeedbackModal
        visible={feedback !== null}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        tone={feedback?.tone}
        onClose={() => setFeedback(null)}
      />
      <Modal
        transparent
        visible={Boolean(purchaseResult)}
        animationType="fade"
        onRequestClose={() => setPurchaseResult(null)}
      >
        <View style={styles.purchaseResultBackdrop}>
          <View style={styles.purchaseResultCard} accessibilityRole="alert">
            <View style={[
              styles.purchaseResultIcon,
              purchaseResult?.status === 'success' ? styles.purchaseResultSuccess
                : purchaseResult?.status === 'pending' ? styles.purchaseResultPending
                  : styles.purchaseResultFailed,
            ]}>
              <Text style={styles.purchaseResultIconText}>
                {purchaseResult?.status === 'success' ? '✓' : purchaseResult?.status === 'pending' ? '…' : '×'}
              </Text>
            </View>
            <Text style={styles.purchaseResultTitle}>
              {purchaseResult?.status === 'success' ? 'Rental successful'
                : purchaseResult?.status === 'pending' ? 'Payment processing'
                  : 'Rental could not be completed'}
            </Text>
            <Text style={styles.purchaseResultMessage}>{purchaseResult?.message}</Text>
            {purchaseResult?.phoneNumber ? (
              <View style={styles.purchaseResultNumber}>
                <Text style={styles.purchaseResultNumberLabel}>Your new number</Text>
                <Text style={styles.purchaseResultNumberValue}>{purchaseResult.phoneNumber}</Text>
              </View>
            ) : null}
            {purchaseResult?.status === 'pending' && pendingPaymentReference ? (
              <View style={styles.purchaseResultButton}>
                {purchasing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.purchaseResultButtonText}>Checking payment automatically…</Text>}
              </View>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.purchaseResultClose}
              onPress={() => setPurchaseResult(null)}
            >
              <Text style={styles.purchaseResultCloseText}>
                {purchaseResult?.status === 'success' ? 'Done' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --------------------------------------------------
// Styles Sheet
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    backgroundColor: COLORS.headerDark,
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.8),
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.8),
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(15),
    fontWeight: '800',
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 183, 106, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(18, 183, 106, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  rateDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accentGreen,
    marginRight: 5,
  },
  rateText: {
    color: COLORS.accentGreen,
    fontFamily: 'Poppins',
    fontSize: scale(10),
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: hp(1),
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.accentGreen,
  },
  tabText: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.textLight,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  sectionContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: scale(13.5),
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: hp(1.2),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryCardLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
    padding: wp(3.5),
    marginBottom: hp(1.2),
  },
  countryCardSelected: {
    backgroundColor: '#FAFDFB',
  },
  flagCircle: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    fontWeight: '800',
    fontFamily: 'Poppins',
    fontSize: scale(13),
    color: COLORS.textDark,
  },
  countryName: {
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '800',
    color: COLORS.textDark,
  },
  codeBadge: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  codeBadgeText: {
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentGreen,
    marginRight: 6,
  },
  availText: {
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    color: COLORS.textMuted,
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  countryCardSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    flex: 0.31,
  },
  flagTextSmall: {
    fontWeight: '800',
    fontFamily: 'Poppins',
    fontSize: scale(10),
    color: COLORS.textDark,
  },
  countrySmallName: {
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '700',
    color: COLORS.textDark,
  },
  smallAvail: {
    fontFamily: 'Poppins',
    fontSize: scale(9),
    color: COLORS.textMuted,
  },
  moreCountryText: {
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    width: '100%',
  },
  serviceCardLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    padding: wp(3.5),
    marginBottom: hp(1.2),
  },
  serviceCardSelected: {
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
  },
  whatsappCircle: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceNameDark: {
    fontFamily: 'Poppins',
    fontSize: scale(13.5),
    fontWeight: '800',
    color: COLORS.textLight,
  },
  discountBadge: {
    backgroundColor: 'rgba(18, 183, 106, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  discountText: {
    fontFamily: 'Poppins',
    fontSize: scale(8.5),
    fontWeight: '800',
    color: COLORS.accentGreen,
  },
  priceNaira: {
    color: COLORS.accentGreen,
    fontFamily: 'Poppins',
    fontSize: scale(13.5),
    fontWeight: '800',
  },
  strikePrice: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  priceUsd: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
    marginLeft: 6,
  },
  serviceRow: {
    marginBottom: hp(2),
  },
  serviceRowContent: {
    alignItems: 'center',
  },
  serviceSearchInput: {
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    marginBottom: hp(1.2),
    color: COLORS.textDark,
    fontFamily: 'Poppins',
    fontSize: scale(11),
  },
  servicePill: {
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: hp(0.8),
    minWidth: wp(22),
    marginRight: wp(2),
    paddingHorizontal: wp(2),
    alignItems: 'center',
  },
  servicePillText: {
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '700',
    color: COLORS.textDark,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  durationCard: {
    flex: 0.31,
    borderRadius: 12,
    padding: wp(2.8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationSelected: {
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
  },
  durationUnselected: {
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  durationTitle: {
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '700',
  },
  durationTitleDark: {
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '700',
    color: COLORS.textDark,
  },
  durationPrice: {
    fontFamily: 'Poppins',
    fontSize: scale(12.5),
    fontWeight: '800',
    marginVertical: 2,
  },
  durationPriceDark: {
    fontFamily: 'Poppins',
    fontSize: scale(12.5),
    fontWeight: '800',
    color: COLORS.accentGreen,
    marginVertical: 2,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accentGreen,
    marginRight: 4,
  },
  selectedText: {
    color: COLORS.accentGreen,
    fontFamily: 'Poppins',
    fontSize: scale(8.5),
    fontWeight: '700',
  },
  saveText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(8.5),
  },
  bestBadge: {
    position: 'absolute',
    top: -7,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bestBadgeText: {
    fontFamily: 'Poppins',
    fontSize: scale(7.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rentButton: {
    backgroundColor: COLORS.accentGreen,
    height: hp(6),
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rentButtonText: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(13.5),
    fontWeight: '800',
  },
  walletBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1.2),
  },
  walletBalanceText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
  },
  manageAllText: {
    color: COLORS.accentGreen,
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '700',
  },
  activeCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: wp(4),
    marginTop: hp(0.5),
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalIdText: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '800',
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 183, 106, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accentGreen,
    marginRight: 4,
  },
  activeStatusText: {
    color: COLORS.accentGreen,
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
    fontWeight: '800',
  },
  phoneNumberText: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(20),
    fontWeight: '900',
    marginVertical: hp(1.2),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.2),
  },
  metaBox: {
    backgroundColor: COLORS.pillBgDark,
    borderRadius: 10,
    padding: wp(2.8),
    flex: 0.48,
  },
  metaLabel: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
  },
  metaValue: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningRedBg,
    borderRadius: 8,
    padding: wp(2.8),
    marginBottom: hp(1.2),
  },
  warningText: {
    color: COLORS.warningRedText,
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  autoRenewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  autoRenewText: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(11),
    fontWeight: '700',
  },
  viewInboxButton: {
    backgroundColor: COLORS.accentGreen,
    height: hp(5.2),
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewInboxText: {
    color: '#000000',
    fontWeight: '800',
    fontFamily: 'Poppins',
    fontSize: scale(11.5),
  },
  smsCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 14,
    padding: wp(3.5),
    marginTop: hp(1.2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smsAppIcon: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: COLORS.accentGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsAppTitle: {
    color: COLORS.textDark,
    fontFamily: 'Poppins',
    fontSize: scale(11.5),
    fontWeight: '800',
  },
  smsTime: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentGreenLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: COLORS.accentGreenDark,
    fontFamily: 'Poppins',
    fontSize: scale(8.5),
    fontWeight: '800',
  },
  smsBodyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: wp(2.8),
    marginVertical: hp(1),
  },
  smsBodyText: {
    color: COLORS.textDark,
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
  },
  copyButton: {
    backgroundColor: COLORS.accentGreenLight,
    height: hp(4.2),
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonText: {
    color: COLORS.accentGreenDark,
    fontWeight: '800',
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
    marginLeft: 6,
  },
  copiedStateBox: {
    backgroundColor: '#F1F5F9',
    height: hp(4.2),
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedStateText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontFamily: 'Poppins',
    fontSize: scale(10.5),
  },
  purchaseResultBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(2, 6, 23, 0.62)',
  },
  purchaseResultCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  purchaseResultIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    marginBottom: 14,
  },
  purchaseResultSuccess: { backgroundColor: '#DCFCE7' },
  purchaseResultPending: { backgroundColor: '#FEF3C7' },
  purchaseResultFailed: { backgroundColor: '#FEE2E2' },
  purchaseResultIconText: { color: COLORS.textDark, fontSize: 30, fontWeight: '800' },
  purchaseResultTitle: { color: COLORS.textDark, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  purchaseResultMessage: { color: COLORS.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 9 },
  purchaseResultNumber: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  purchaseResultNumberLabel: { color: COLORS.textMuted, fontSize: 12 },
  purchaseResultNumberValue: { color: COLORS.textDark, fontSize: 18, fontWeight: '800', marginTop: 4 },
  purchaseResultButton: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: COLORS.accentGreenDark,
  },
  purchaseResultButtonDisabled: { opacity: 0.65 },
  purchaseResultButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  purchaseResultClose: { paddingHorizontal: 18, paddingVertical: 12, marginTop: 5 },
  purchaseResultCloseText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  manageModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  manageModalTitle: {
    color: COLORS.textDark,
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  manageModalMessage: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  manageModalButton: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  managePrimaryButton: {
    backgroundColor: COLORS.accentGreen,
  },
  manageDangerButton: {
    backgroundColor: '#B42318',
  },
  manageModalButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '800',
  },
  manageModalSecondary: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  manageModalSecondaryText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '700',
  },

  // --------------------------------------------------
  // CENTERED MODAL STYLES
  // --------------------------------------------------
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
    padding: wp(5),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.8),
  },
  modalTitle: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(14),
    fontWeight: '800',
  },
  closeCircleBtn: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillBgDark,
    borderRadius: 12,
    padding: wp(3),
    marginBottom: hp(1.8),
  },
  previewCountryText: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(12),
    fontWeight: '800',
  },
  previewNumberText: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '800',
  },
  previewSubtext: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
    marginTop: 1,
  },
  breakdownContainer: {
    marginBottom: hp(1.8),
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  breakdownLabel: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(11),
  },
  breakdownValue: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(11),
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#1B2A3D',
    marginVertical: hp(1),
  },
  totalDueLabel: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(12),
    fontWeight: '800',
  },
  totalDueValue: {
    color: COLORS.accentGreen,
    fontFamily: 'Poppins',
    fontSize: scale(14),
    fontWeight: '900',
  },
  authorizeButton: {
    backgroundColor: COLORS.accentGreen,
    height: hp(5.5),
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1.2),
  },
  authorizeButtonText: {
    color: COLORS.textLight,
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '800',
  },
  modalFooterText: {
    color: COLORS.textMutedLight,
    fontFamily: 'Poppins',
    fontSize: scale(9.5),
    textAlign: 'center',
  },
});