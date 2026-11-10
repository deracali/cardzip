import React, { useState, useEffect } from 'react';
import { StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Contact, requestPermissionsAsync } from 'expo-contacts';
import { router, useLocalSearchParams } from 'expo-router';
import PaymentOptionsSheet from '../../../components/PaymentOptionsSheet';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';
import { API_BASE_URL as API_ROOT_URL } from '../../../services/api/config';
import * as Linking from 'expo-linking';
import { isDefinitivePaystackFailure, openPaystackCheckout } from '../../../services/api/paystackFlow';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchWalletBalance } from '../../../store/slices/walletSlice';
import useFeatureSettings from '../../../hooks/useFeatureSettings';

const API_BASE_URL = `${API_ROOT_URL}/api`;
const configuredPaymentCallbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();

// Category Tabs
type CategoryType = 'airtime' | 'data' | 'electricity' | 'tv' | 'jamb' | 'waec';

interface Provider {
  id: string;
  name: string;
  letter: string;
  color: string;
}

interface WaecVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

const NETWORKS: Provider[] = [
  { id: 'mtn', name: 'MTN', letter: 'M', color: '#EAB308' },
  { id: 'airtel', name: 'Airtel', letter: 'A', color: '#EF4444' },
  { id: 'glo', name: 'Glo', letter: 'G', color: '#22C55E' },
  { id: '9mobile', name: '9mobile', letter: '9', color: '#10B981' },
];


interface DataVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

interface VerifiedCustomer {
  name?: string;
  address?: string;
}

const DATA_SERVICE_IDS: Record<string, string> = {
  mtn: 'mtn-data',
  airtel: 'airtel-data',
  glo: 'glo-data',
  '9mobile': 'etisalat-data',
};

const DISCOS: Provider[] = [
  { id: 'ikeja', name: 'Ikeja Electric', letter: 'IE', color: '#3B82F6' },
  { id: 'eko', name: 'Eko Electric', letter: 'EK', color: '#6366F1' },
  { id: 'kedco', name: 'Kano Electric', letter: 'KE', color: '#F59E0B' },
  { id: 'phed', name: 'Port Harcourt Electric', letter: 'PH', color: '#10B981' },
  { id: 'jed', name: 'Jos Electric', letter: 'JED', color: '#8B5CF6' },
  { id: 'ibedc', name: 'Ibadan Electric', letter: 'IB', color: '#EC4899' },
  { id: 'kaedco', name: 'Kaduna Electric', letter: 'KA', color: '#14B8A6' },
  { id: 'aedc', name: 'Abuja Electric', letter: 'AE', color: '#F59E0B' },
  { id: 'eedc', name: 'Enugu Electric', letter: 'EN', color: '#EF4444' },
  { id: 'bedc', name: 'Benin Electric', letter: 'BE', color: '#6366F1' },
  { id: 'aba', name: 'Aba Electric', letter: 'ABA', color: '#84CC16' },
  { id: 'yedc', name: 'Yola Electric', letter: 'YO', color: '#F97316' },
];

const ELECTRICITY_SERVICE_IDS: Record<string, string> = {
  ikeja: 'ikeja-electric',
  eko: 'eko-electric',
  kedco: 'kano-electric',
  phed: 'portharcourt-electric',
  jed: 'jos-electric',
  ibedc: 'ibadan-electric',
  kaedco: 'kaduna-electric',
  aedc: 'abuja-electric',
  eedc: 'enugu-electric',
  bedc: 'benin-electric',
  aba: 'aba-electric',
  yedc: 'yola-electric',
};

const TV_PROVIDERS: Provider[] = [
  { id: 'dstv', name: 'DStv', letter: 'D', color: '#0284C7' },
  { id: 'gotv', name: 'GOtv', letter: 'G', color: '#EA580C' },
  { id: 'startimes', name: 'StarTimes', letter: 'S', color: '#DC2626' },
  { id: 'showmax', name: 'Showmax', letter: 'S', color: '#7C3AED' },
];

const EDUCATION_PROVIDERS: Record<'jamb' | 'waec', Provider[]> = {
  jamb: [{ id: 'jamb-epin', name: 'JAMB ePIN', letter: 'J', color: '#0F766E' }],
  waec: [{ id: 'waec', name: 'WAEC PIN', letter: 'W', color: '#B45309' }],
};

const AMOUNT_PRESETS = [
  { label: '₦500', value: '500' },
  { label: '₦1,000', value: '1000' },
  { label: '₦2,000', value: '2000' },
  { label: '₦5,000', value: '5000' },
];

export default function BillsScreen() {
  const { featureSettings, error, loading } = useFeatureSettings();

  if (loading) {
    return <SafeAreaView style={[styles.safeArea, styles.container]}><ActivityIndicator color="#16A34A" /></SafeAreaView>;
  }
  if (!featureSettings?.vtpassBillsEnabled) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ color: '#0D1527', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
          {error || 'VTPass bill payments are temporarily unavailable.'}
        </Text>
      </SafeAreaView>
    );
  }
  return <BillsScreenContent />;
}

function BillsScreenContent() {
  const { width, height } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const walletBalance = useAppSelector((state) => state.wallet.balance);

  // Retrieve incoming category from Home
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  // Dynamic scaling
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;

  // Helper to normalize route params
  const normalizeTab = (paramTab?: string): CategoryType => {
    if (paramTab === 'television') return 'tv';
    if (paramTab === 'data' || paramTab === 'electricity' || paramTab === 'tv' || paramTab === 'waec') {
      return paramTab;
    }
    return 'airtime';
  };

  // Form States
  const [activeTab, setActiveTab] = useState<CategoryType>(normalizeTab(tab));
  const [selectedProvider, setSelectedProvider] = useState<string>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tvPhoneNumber, setTvPhoneNumber] = useState('');
  const [electricityPhoneNumber, setElectricityPhoneNumber] = useState('');
  const [jambPhoneNumber, setJambPhoneNumber] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('0');
  const [dataVariations, setDataVariations] = useState<DataVariation[]>([]);
const [selectedPlan, setSelectedPlan] = useState('');
const [selectedBundleCode, setSelectedBundleCode] = useState('');
const [loadingDataVariations, setLoadingDataVariations] = useState(false);
const [tvVariations, setTvVariations] = useState<DataVariation[]>([]);
const [loadingTvVariations, setLoadingTvVariations] = useState(false);
const [tvVariationsError, setTvVariationsError] = useState<string | null>(null);
const [verifiedCustomer, setVerifiedCustomer] = useState<VerifiedCustomer | null>(null);
const [verificationLoading, setVerificationLoading] = useState(false);
const [verificationError, setVerificationError] = useState<string | null>(null);
const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);

  // WAEC Integration States
  const [waecVariations, setWaecVariations] = useState<WaecVariation[]>([]);
  const [selectedWaecVariation, setSelectedWaecVariation] = useState<WaecVariation | null>(null);
  const [waecQuantity, setWaecQuantity] = useState<number>(1);
  const [loadingWaecVariations, setLoadingWaecVariations] = useState<boolean>(false);
  const [jambVariations, setJambVariations] = useState<WaecVariation[]>([]);
  const [selectedJambVariation, setSelectedJambVariation] = useState<WaecVariation | null>(null);
  const [loadingJambVariations, setLoadingJambVariations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [pendingBillPaystackReference, setPendingBillPaystackReference] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}>({
  visible: false,
  title: '',
  message: '',
  type: 'info',
});

// Helper function to trigger custom alert
const showAlert = (
  title: string,
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  setAlertConfig({ visible: true, title, message, type });
};

const fetchJambVariations = async () => {
  setLoadingJambVariations(true);
  try {
    const response = await fetch(`${API_BASE_URL}/education/variations/jamb?serviceID=jamb`);
    const data = await response.json();
    const variations = data?.content?.variations;
    if (!response.ok || !Array.isArray(variations) || variations.length === 0) {
      throw new Error(data?.message || data?.response_description || 'Could not load JAMB packages.');
    }
    setJambVariations(variations);
    setSelectedJambVariation(variations[0]);
  } catch (error) {
    setJambVariations([]);
    setSelectedJambVariation(null);
    showAlert('JAMB packages', error instanceof Error ? error.message : 'Could not load JAMB packages.', 'error');
  } finally {
    setLoadingJambVariations(false);
  }
};

useEffect(() => {
  if (token) void dispatch(fetchWalletBalance(token));
}, [dispatch, token]);

useEffect(() => {
  if (!token || !pendingBillPaystackReference || isSubmitting) return undefined;
  let stopped = false;
  let checking = false;
  const checkBillPaystackPayment = async () => {
    if (checking || stopped) return;
    checking = true;
    try {
      const response = await fetch(`${API_BASE_URL}/bills/paystack/verify`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference: pendingBillPaystackReference }),
      });
      const result = await response.json().catch(() => ({}));
      const billPayment = result.data?.billPayment;
      if (billPayment?.status === 'processing' || billPayment?.status === 'completed') {
        stopped = true;
        setPendingBillPaystackReference(null);
        const transaction = billPayment.providerResponse?.content?.transactions || {};
        const purchaseCode = billPayment.providerResponse?.purchased_code || transaction.token || transaction.purchased_code;
        setAlertConfig({
          visible: true,
          title: 'Payment successful',
          message: purchaseCode
            ? `Your purchase is complete.\nPIN / token: ${purchaseCode}`
            : billPayment.status === 'processing'
              ? 'Paystack confirmed your payment. The bill provider is completing the purchase; your bill history will update automatically.'
              : 'Your bill payment was completed successfully.',
          type: 'success',
        });
        return;
      }
      const message = String(result.message || billPayment?.failureReason || '');
      if (billPayment?.status === 'failed' || (message && isDefinitivePaystackFailure(new Error(message)))) {
        stopped = true;
        setPendingBillPaystackReference(null);
        setAlertConfig({ visible: true, title: 'Payment not completed', message: message || 'Paystack did not complete this bill payment.', type: 'error' });
      }
    } catch {
      // A transient network error leaves the reference pending for the next automatic check.
    } finally {
      checking = false;
    }
  };

  void checkBillPaystackPayment();
  const retryTimer = setInterval(() => { void checkBillPaystackPayment(); }, 4000);
  return () => {
    stopped = true;
    clearInterval(retryTimer);
  };
}, [isSubmitting, pendingBillPaystackReference, token]);

  // Sync activeTab whenever user navigates with a different 'tab' param
  useEffect(() => {
    if (tab) {
      setActiveTab(normalizeTab(tab));
    }
  }, [tab]);

  // Sync default selected provider when activeTab changes
 useEffect(() => {
  setAmount('0');
  setSelectedBundleCode('');
  setSelectedPlan('');
  setWaecQuantity(1);

  if (activeTab === 'airtime') {
    setSelectedProvider('mtn');
  } else if (activeTab === 'data') {
    setSelectedProvider('mtn');

    // Load MTN data variations when Data tab opens
    fetchDataVariations('mtn');
  } else if (activeTab === 'electricity') {
    setSelectedProvider('ikeja');
  } else if (activeTab === 'tv') {
    setSelectedProvider('dstv');
    void fetchTvVariations('dstv');
  } else if (activeTab === 'jamb') {
    setSelectedProvider('jamb-epin');
    void fetchJambVariations();
  } else if (activeTab === 'waec') {
    setSelectedProvider('waec');
    fetchWaecVariations();
  }
}, [activeTab]);





  const detectNetwork = (phone: string): string | null => {
  const number = phone.replace(/\D/g, '');

  if (number.length < 4) {
    return null;
  }

  const mtnPrefixes = [
    '0803',
    '0806',
    '0810',
    '0813',
    '0814',
    '0816',
    '0903',
    '0906',
    '0913',
    '0916',
  ];

  const airtelPrefixes = [
    '0802',
    '0808',
    '0812',
    '0701',
    '0708',
    '0901',
    '0902',
    '0904',
    '0907',
    '0912',
  ];

  const gloPrefixes = [
    '0805',
    '0807',
    '0811',
    '0815',
    '0705',
    '0905',
    '0915',
  ];

  const nineMobilePrefixes = [
    '0809',
    '0817',
    '0818',
    '0908',
    '0909',
  ];

  const prefix = number.substring(0, 4);

  if (mtnPrefixes.includes(prefix)) {
    return 'mtn';
  }

  if (airtelPrefixes.includes(prefix)) {
    return 'airtel';
  }

  if (gloPrefixes.includes(prefix)) {
    return 'glo';
  }

  if (nineMobilePrefixes.includes(prefix)) {
    return '9mobile';
  }

  return null;
};



const fetchDataVariations = async (networkId: string) => {
  const serviceID = DATA_SERVICE_IDS[networkId];

  if (!serviceID) {
    setDataVariations([]);
    setSelectedPlan('');
    setSelectedBundleCode('');
    return;
  }

  try {
    setLoadingDataVariations(true);
    setDataVariations([]);
    setSelectedPlan('');
    setSelectedBundleCode('');

    const url = `${API_BASE_URL}/data/variations/${serviceID}?serviceID=${serviceID}`;

    console.log('Fetching data variations:', url);

    const response = await fetch(url);

    const result = await response.json();

    console.log('Data variations response:', result);

    if (
      result.response_description === '000' &&
      result.content?.variations
    ) {
      const variations: DataVariation[] = result.content.variations;

      setDataVariations(variations);

      // Automatically select the first package
      if (variations.length > 0) {
        const first = variations[0];

        setSelectedBundleCode(first.variation_code);
        setSelectedPlan(first.name);
      }
    } else {
      setDataVariations([]);

      showAlert(
        'Data Plans',
        result.response_description || 'Unable to load data plans',
        'error'
      );
    }
  } catch (error) {
    console.error('Fetch data variations error:', error);

    setDataVariations([]);

    showAlert(
      'Connection Error',
      'Unable to load data plans. Please try again.',
      'error'
    );
  } finally {
    setLoadingDataVariations(false);
  }
};

const fetchTvVariations = async (serviceID: string) => {
  setLoadingTvVariations(true);
  setTvVariations([]);
  setTvVariationsError(null);
  setSelectedBundleCode('');
  setSelectedPlan('');

  try {
    const response = await fetch(`${API_BASE_URL}/tv/variations?serviceID=${encodeURIComponent(serviceID)}`);
    const result = await response.json();
    const variations = result?.content?.variations;

    if (!response.ok || result?.response_description !== '000' || !Array.isArray(variations)) {
      const details = result?.details;
      const reason = typeof details === 'string'
        ? details
        : details?.response_description || details?.message || details?.error;
      throw new Error(reason || result?.message || result?.error || result?.response_description || 'Could not load TV packages.');
    }

    setTvVariations(variations);
  } catch (error) {
    setTvVariationsError(error instanceof Error ? error.message : 'Could not load TV packages.');
  } finally {
    setLoadingTvVariations(false);
  }
};

useEffect(() => {
  const isVerifiableService = activeTab === 'electricity' || activeTab === 'tv';
  const billersCode = meterNumber.replace(/\D/g, '');
  const serviceID = activeTab === 'electricity'
    ? ELECTRICITY_SERVICE_IDS[selectedProvider]
    : selectedProvider;
  const minimumLength = activeTab === 'tv' ? 8 : 8;

  setVerifiedCustomer(null);
  setVerificationError(null);

  if (!isVerifiableService || !serviceID || billersCode.length < minimumLength) {
    setVerificationLoading(false);
    return;
  }

  let cancelled = false;
  const timeoutId = setTimeout(async () => {
    setVerificationLoading(true);
    try {
      const verificationPath = activeTab === 'tv' ? '/tv/verify-card' : '/verify-card';
      const response = await fetch(`${API_BASE_URL}${verificationPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billersCode, serviceID, type: meterType }),
      });
      const result = await response.json();
      if (cancelled) return;

      if (!response.ok || result?.code !== '000' || result?.content?.WrongBillersCode === true) {
        const details = result?.details;
        const reason = typeof details === 'string'
          ? details
          : details?.response_description || details?.message || details?.error;
        setVerificationError(result?.content?.error || reason || result?.message || result?.response_description || result?.error || 'Could not verify this number.');
        return;
      }

      const content = result.content as Record<string, unknown>;
      const name = content.Customer_Name ?? content.customerName ?? content.name;
      const address = content.Address ?? content.customerAddress ?? content.address;
      setVerifiedCustomer({
        name: typeof name === 'string' && name.trim() ? name.trim() : undefined,
        address: typeof address === 'string' && address.trim() ? address.trim() : undefined,
      });
    } catch (error) {
      if (!cancelled) setVerificationError(error instanceof Error ? error.message : 'Could not verify this number.');
    } finally {
      if (!cancelled) setVerificationLoading(false);
    }
  }, 600);

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}, [activeTab, meterNumber, meterType, selectedProvider]);




const handlePhoneNumberChange = (text: string) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 11);

  setPhoneNumber(cleaned);

  if (activeTab !== 'airtime' && activeTab !== 'data') {
    return;
  }

  const detectedNetwork = detectNetwork(cleaned);

  if (detectedNetwork) {
    setSelectedProvider(detectedNetwork);

    // Only fetch plans for data
    if (activeTab === 'data') {
      fetchDataVariations(detectedNetwork);
    }
  }
};

const openPhoneContactPicker = async (target: 'phone' | 'electricity' | 'tv') => {
  try {
    const permission = await requestPermissionsAsync();
    if (!permission.granted) {
      showAlert('Contacts permission needed', 'Allow Cardzip to access contacts to select a phone number.', 'warning');
      return;
    }

    const contact = await Contact.presentPicker();
    if (!contact) return;

    const phone = (await contact.getPhones()).find((entry) => entry.number?.trim())?.number;
    if (!phone) {
      showAlert('No phone number', 'This contact does not have a phone number saved.', 'warning');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    const localNumber = digits.startsWith('234') ? `0${digits.slice(3)}` : digits;
    const selectedNumber = localNumber.slice(0, 11);
    if (target === 'electricity') {
      setElectricityPhoneNumber(selectedNumber);
    } else if (target === 'tv') {
      setTvPhoneNumber(selectedNumber);
    } else {
      handlePhoneNumberChange(selectedNumber);
    }
  } catch (error) {
    showAlert('Contacts unavailable', error instanceof Error ? error.message : 'Could not open your contacts.', 'error');
  }
};



  // Fetch WAEC Variations from Backend
  const fetchWaecVariations = async () => {
    setLoadingWaecVariations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/education/variations/waec?serviceID=waec`);
      const data = await response.json();

      if (data?.content?.variations && data.content.variations.length > 0) {
        const variations: WaecVariation[] = data.content.variations;
        setWaecVariations(variations);
        setSelectedWaecVariation(variations[0]); // Default to 'waecdirect'
      } else {
        showAlert('WAEC packages', 'Could not load WAEC packages. Please try again.', 'warning');
      }
    } catch (error) {
      console.error('Error fetching WAEC variations:', error);
      showAlert('WAEC packages', 'Failed to connect to the server for WAEC packages.', 'error');
    } finally {
      setLoadingWaecVariations(false);
    }
  };

  // Handle Purchase Submission
 const submitBillPayment = async (paymentMethod: 'wallet' | 'paystack') => {
  if (paymentMethod === 'paystack' && pendingBillPaystackReference) {
    showAlert('Payment is being confirmed', 'Your existing Paystack payment is being checked automatically. Do not start another payment.', 'info');
    return;
  }
  if (!token) {
    showAlert('Sign in required', 'Sign in before paying for bills.', 'warning');
    return;
  }

  const serviceID = activeTab === 'data'
    ? DATA_SERVICE_IDS[selectedProvider]
    : activeTab === 'electricity'
      ? ELECTRICITY_SERVICE_IDS[selectedProvider]
      : activeTab === 'waec'
        ? 'waec'
        : activeTab === 'jamb'
          ? 'jamb'
          : selectedProvider;
  const variation = activeTab === 'data'
    ? dataVariations.find((item) => item.variation_code === selectedBundleCode)
    : activeTab === 'tv'
      ? tvVariations.find((item) => item.variation_code === selectedBundleCode)
      : activeTab === 'waec'
        ? selectedWaecVariation
        : activeTab === 'jamb'
          ? selectedJambVariation
        : null;
  const cleanPhone = (activeTab === 'electricity'
    ? electricityPhoneNumber
    : activeTab === 'tv'
      ? tvPhoneNumber
      : activeTab === 'jamb'
        ? jambPhoneNumber
        : phoneNumber).replace(/\D/g, '');
  const selectedAmount = activeTab === 'waec'
    ? Number(selectedWaecVariation?.variation_amount || 0) * waecQuantity
    : variation
      ? Number(variation.variation_amount)
      : Number(amount);
  if (!serviceID || !Number.isFinite(selectedAmount) || selectedAmount <= 0) {
    showAlert('Incomplete bill details', 'Choose a provider and valid package or amount before paying.', 'warning');
    return;
  }
  if (cleanPhone.length !== 11) {
    showAlert('Invalid phone number', 'Enter a valid 11-digit phone number before paying.', 'warning');
    return;
  }
  if (activeTab === 'airtime' && detectNetwork(cleanPhone) && detectNetwork(cleanPhone) !== selectedProvider) {
    showAlert('Network mismatch', `This phone number belongs to ${detectNetwork(cleanPhone)?.toUpperCase()}, not the selected provider.`, 'warning');
    return;
  }
  if ((activeTab === 'data' || activeTab === 'tv') && !variation) {
    showAlert('Choose a package', 'Select an available package before paying.', 'warning');
    return;
  }
  if ((activeTab === 'waec' && !selectedWaecVariation) || (activeTab === 'jamb' && !selectedJambVariation)) {
    showAlert('Choose a package', `Select a ${activeTab.toUpperCase()} package before paying.`, 'warning');
    return;
  }
  if ((activeTab === 'electricity' || activeTab === 'tv') && meterNumber.replace(/\D/g, '').length < 8) {
    showAlert('Invalid account number', 'Enter a valid meter or smartcard number before paying.', 'warning');
    return;
  }
  if (activeTab === 'jamb' && meterNumber.replace(/\D/g, '').length < 5) {
    showAlert('Invalid profile code', 'Enter the JAMB profile code before paying.', 'warning');
    return;
  }
  if (activeTab === 'electricity' && selectedAmount < 1000) {
    showAlert('Invalid amount', 'Electricity payments must be at least ₦1,000.', 'warning');
    return;
  }
  if (activeTab === 'airtime' && selectedAmount < 100) {
    showAlert('Invalid amount', 'Airtime payments must be at least ₦100.', 'warning');
    return;
  }

  const requestBody = {
    category: activeTab === 'airtime' ? 'Airtime'
      : activeTab === 'data' ? 'Data'
        : activeTab === 'electricity' ? 'Electricity'
          : activeTab === 'tv' ? 'Pay TV'
            : activeTab === 'jamb' ? 'JAMB PINs' : 'WAEC PINs',
    serviceID,
    serviceName: getProviders().find((provider) => provider.id === selectedProvider)?.name,
    amount: selectedAmount,
    phone: cleanPhone,
    ...(activeTab === 'electricity' ? {
      billersCode: meterNumber.replace(/\D/g, ''),
      variation_code: meterType,
    } : {}),
    ...(activeTab === 'tv' ? {
      billersCode: meterNumber.replace(/\D/g, ''),
      variation_code: selectedBundleCode,
    } : {}),
    ...(activeTab === 'data' ? { variation_code: selectedBundleCode } : {}),
    ...(activeTab === 'waec' ? {
      billersCode: cleanPhone,
      variation_code: selectedWaecVariation?.variation_code,
      quantity: waecQuantity,
    } : {}),
    ...(activeTab === 'jamb' ? {
      billersCode: meterNumber.replace(/\D/g, ''),
      variation_code: selectedJambVariation?.variation_code,
    } : {}),
  };

  setIsSubmitting(true);
  try {
    let paystackPaymentConfirmed = false;
    const callbackUrl = configuredPaymentCallbackUrl || Linking.createURL('payment/callback', { scheme: 'cardzip' });
    const endpoint = paymentMethod === 'wallet' ? '/bills/pay' : '/bills/paystack/initialize';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...requestBody,
        ...(paymentMethod === 'paystack' ? { callbackUrl } : {}),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) {
      throw new Error(result.message || 'Could not start this bill payment.');
    }

    let billPayment = result.data?.billPayment;
    if (paymentMethod === 'paystack') {
      const reference = result.data?.reference;
      const authorizationUrl = result.data?.authorizationUrl;
      const returnUrl = result.data?.callbackUrl || callbackUrl;
      if (!reference || !authorizationUrl) throw new Error('Paystack checkout did not return a payment reference.');
      setPendingBillPaystackReference(reference);
      await openPaystackCheckout(authorizationUrl, returnUrl);
      return;
    }

    let walletRefreshFailed = false;
    try {
      await dispatch(fetchWalletBalance(token)).unwrap();
    } catch {
      walletRefreshFailed = true;
    }
    const providerTransaction = billPayment?.providerResponse?.content?.transactions || {};
    const purchaseCode = billPayment?.providerResponse?.purchased_code || providerTransaction.token || providerTransaction.purchased_code;
    const walletRefreshNote = walletRefreshFailed ? '\nWallet balance could not refresh; reopen your wallet to check the updated balance.' : '';
    showAlert(
      billPayment?.status === 'processing'
        ? paystackPaymentConfirmed ? 'Payment successful' : 'Payment processing'
        : 'Payment successful',
      purchaseCode
        ? `Your purchase is complete.\nPIN / token: ${purchaseCode}${walletRefreshNote}`
        : billPayment?.status === 'processing'
          ? paystackPaymentConfirmed
            ? `Paystack confirmed your payment. The bill provider is completing the purchase; your bill history will update automatically.${walletRefreshNote}`
            : `Your payment is recorded and the provider is still processing the purchase.${walletRefreshNote}`
          : `Your bill payment was completed successfully.${walletRefreshNote}`,
      billPayment?.status === 'processing' && !paystackPaymentConfirmed ? 'info' : 'success',
    );
  } catch (error) {
    showAlert('Payment failed', error instanceof Error ? error.message : 'Could not complete this bill payment.', 'error');
  } finally {
    setIsSubmitting(false);
  }
 };

 const submitPayment = async (paymentMethod?: 'wallet' | 'paystack') => {
  if (paymentMethod) {
    await submitBillPayment(paymentMethod);
    return;
  }

  // ==========================================
  // WAEC PAYMENT
  // ==========================================
  if (activeTab === 'waec') {

    if (!selectedWaecVariation) {
      showAlert('Error', 'Please select a WAEC package.', 'warning');
      return;
    }

    if (!phoneNumber || phoneNumber.trim().length < 11) {
      showAlert(
        'Invalid Phone Number',
        'Please enter a valid 11-digit phone number.',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/education/pay-waec`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variation_code: selectedWaecVariation.variation_code,
            phone: phoneNumber.replace(/\s+/g, ''),
            quantity: waecQuantity,
          }),
        }
      );

      const data = await response.json();

      if (
        data.code === '000' ||
        data.response_description === 'TRANSACTION SUCCESSFUL'
      ) {
        const pinInfo =
          data.purchased_code ||
          'PIN purchase completed successfully.';

        showAlert(
          'Purchase Successful!',
          `PIN Details: ${pinInfo}`,
          'success'
        );
      } else {
        showAlert(
          'Transaction Failed',
          data.response_description ||
            data.error ||
            'Payment failed.',
          'error'
        );
      }

    } catch (error) {
      console.error('WAEC Payment Error:', error);

      showAlert(
        'Error',
        'An error occurred processing your payment. Please try again.',
        'error'
      );

    } finally {
      setIsSubmitting(false);
    }

    return;
  }

  if (activeTab === 'tv') {
    const cleanSmartcard = meterNumber.replace(/\D/g, '');
    const cleanPhone = tvPhoneNumber.replace(/\D/g, '');
    if (!selectedBundleCode) {
      showAlert('Select Package', 'Choose a TV subscription package first.', 'warning');
      return;
    }
    if (cleanSmartcard.length < 8) {
      showAlert('Invalid Smartcard', 'Enter a valid smartcard or IUC number.', 'warning');
      return;
    }
    if (cleanPhone.length !== 11) {
      showAlert('Invalid Phone Number', 'Enter a valid 11-digit phone number.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const verifyResponse = await fetch(`${API_BASE_URL}/tv/verify-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billersCode: cleanSmartcard, serviceID: selectedProvider }),
      });
      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok || verifyData?.code !== '000' || verifyData?.content?.WrongBillersCode === true) {
        const details = verifyData?.details;
        const reason = typeof details === 'string'
          ? details
          : details?.response_description || details?.message || details?.error;
        showAlert(
          'Smartcard Verification Failed',
          verifyData?.content?.error || reason || verifyData?.message || verifyData?.response_description || verifyData?.error || 'Check the smartcard number and try again.',
          'error'
        );
        return;
      }

      const payResponse = await fetch(`${API_BASE_URL}/tv/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: Date.now().toString(),
          serviceID: selectedProvider,
          variation_code: selectedBundleCode,
          billersCode: cleanSmartcard,
          phone: cleanPhone,
        }),
      });
      const payData = await payResponse.json();
      const transaction = payData?.content?.transactions;

      if (payResponse.ok && payData?.code === '000' && String(transaction?.status).toLowerCase() === 'delivered') {
        showAlert(
          'Subscription Successful!',
          `Provider: ${transaction.product_name || selectedProvider.toUpperCase()}\n` +
            `Smartcard: ${transaction.unique_element || cleanSmartcard}\n` +
            `Amount paid: ₦${Number(transaction.total_amount || tvVariations.find((item) => item.variation_code === selectedBundleCode)?.variation_amount || 0).toLocaleString()}\n` +
            `Transaction ID: ${transaction.transactionId || transaction.transaction_id || 'Successful'}`,
          'success'
        );
        setMeterNumber('');
        setTvPhoneNumber('');
        setSelectedBundleCode('');
        setSelectedPlan('');
      } else {
        showAlert('Subscription Failed', payData?.response_description || payData?.error || transaction?.status || 'Unable to complete the TV subscription.', 'error');
      }
    } catch (error) {
      showAlert('Connection Error', error instanceof Error ? error.message : 'Unable to connect to the TV payment service.', 'error');
    } finally {
      setIsSubmitting(false);
    }
    return;
  }






  // ==========================================
// AIRTIME PAYMENT
// ==========================================
if (activeTab === 'airtime') {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const numericAmount = Number(amount);

  // Validate phone number
const cleanElectricityPhone =
  electricityPhoneNumber.replace(/\D/g, '');

if (cleanElectricityPhone.length !== 11) {
  showAlert(
    'Invalid Phone Number',
    'Please enter a valid 11-digit phone number.',
    'warning'
  );
  return;
}

  // Validate provider
  if (!selectedProvider) {
    showAlert(
      'Select Network',
      'Please select your network provider.',
      'warning'
    );
    return;
  }

  // Validate amount
  if (!amount || numericAmount <= 0) {
    showAlert(
      'Invalid Amount',
      'Please enter an airtime amount greater than ₦0.',
      'warning'
    );
    return;
  }

  if (numericAmount < 100) {
    showAlert(
      'Invalid Amount',
      'Minimum airtime amount is ₦100.',
      'warning'
    );
    return;
  }

  // Make sure the selected network matches the phone number
  const detectedNetwork = detectNetwork(cleanPhone);

  if (detectedNetwork && detectedNetwork !== selectedProvider) {
    showAlert(
      'Network Mismatch',
      `This phone number appears to belong to ${detectedNetwork.toUpperCase()}, but ${selectedProvider.toUpperCase()} is selected.`,
      'warning'
    );
    return;
  }

  setIsSubmitting(true);

  try {
    const now = new Date();

    const request_id =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      '89htyyo';

    const paymentData = {
      request_id,
      serviceID: selectedProvider,
      amount: amount,
      phone: cleanPhone,
    };

    console.log(
      'AIRTIME PAYMENT REQUEST:',
      paymentData
    );

    const response = await fetch(
      `${API_BASE_URL}/pay`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }
    );

    const result = await response.json();

    console.log(
      'AIRTIME PAYMENT RESPONSE:',
      result
    );

    const transaction =
      result.content?.transactions;

    const transactionStatus = String(
      transaction?.status || ''
    ).toLowerCase();

    if (
      result.code === '000' &&
      transactionStatus === 'delivered'
    ) {
      showAlert(
        'Purchase Successful!',
        `Airtime purchase was successful.\n\n` +
          `Network: ${selectedProvider.toUpperCase()}\n` +
          `Amount: ₦${numericAmount.toLocaleString()}\n` +
          `Phone: ${cleanPhone}\n\n` +
          `Transaction ID: ${
            transaction.transactionId ||
            transaction.transaction_id ||
            'Successful'
          }`,
        'success'
      );

      // Clear airtime fields
      setPhoneNumber('');
      setAmount('0');
    } else {
      showAlert(
        'Purchase Failed',
        result.response_description ||
          transaction?.status ||
          'Unable to complete the airtime purchase.',
        'error'
      );
    }
  } catch (error) {
    console.error(
      'AIRTIME PAYMENT ERROR:',
      error
    );

    showAlert(
      'Connection Error',
      'Unable to connect to the payment server. Please try again.',
      'error'
    );
  } finally {
    setIsSubmitting(false);
  }

  return;
}










// ==========================================
// ELECTRICITY PAYMENT
// ==========================================

if (activeTab === 'electricity') {
  const cleanMeterNumber = meterNumber.replace(/\D/g, '');
  const numericAmount = Number(amount);


  const cleanElectricityPhone =
  electricityPhoneNumber.replace(/\D/g, '');

if (cleanElectricityPhone.length !== 11) {
  showAlert(
    'Invalid Phone Number',
    'Please enter a valid 11-digit phone number.',
    'warning'
  );
  return;
}


  // Validate meter number
  if (!cleanMeterNumber) {
    showAlert(
      'Invalid Meter Number',
      'Please enter your meter number.',
      'warning'
    );
    return;
  }

  // Validate electricity provider
  if (!selectedProvider) {
    showAlert(
      'Select Provider',
      'Please select your electricity provider.',
      'warning'
    );
    return;
  }

  // Make sure the service ID exists
  const electricityServiceID =
    ELECTRICITY_SERVICE_IDS[selectedProvider];

  if (!electricityServiceID) {
    showAlert(
      'Invalid Provider',
      'Unable to determine the electricity provider service ID.',
      'error'
    );
    return;
  }

  // Validate amount
  if (!amount || numericAmount <= 0) {
    showAlert(
      'Invalid Amount',
      'Please enter an electricity amount greater than ₦0.',
      'warning'
    );
    return;
  }

  if (numericAmount < 100) {
    showAlert(
      'Invalid Amount',
      'Minimum electricity payment is ₦100.',
      'warning'
    );
    return;
  }

  setIsSubmitting(true);

  try {
    // ==========================================
    // STEP 1: VERIFY METER
    // ==========================================

    console.log('VERIFYING ELECTRICITY METER:', {
      billersCode: cleanMeterNumber,
      serviceID: electricityServiceID,
    });

    const verifyResponse = await fetch(
      `${API_BASE_URL}/verify-card`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billersCode: cleanMeterNumber,
          serviceID: electricityServiceID,
          type: meterType,
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    console.log(
      'ELECTRICITY METER VERIFICATION RESPONSE:',
      verifyData
    );

    // Verification failed
 if (
  verifyData.code !== '000' ||
  verifyData.content?.WrongBillersCode === true
) {
  showAlert(
    'Meter Verification Failed',
    verifyData.content?.error ||
      verifyData.response_description ||
      'Unable to verify this meter number. Please check the meter number and meter type.',
    'error'
  );
  return;
}

    // ==========================================
    // STEP 2: GET METER TYPE
    // ==========================================



const variation_code = meterType;


    // ==========================================
    // STEP 3: PAY ELECTRICITY
    // ==========================================

    const request_id = Date.now().toString();

  const paymentData = {
  request_id,
  serviceID: electricityServiceID,
  billersCode: cleanMeterNumber,
  variation_code: meterType,
  amount: numericAmount,
  phone: cleanElectricityPhone,
};

    console.log(
      'ELECTRICITY PAYMENT REQUEST:',
      paymentData
    );

    const response = await fetch(
      `${API_BASE_URL}/pay`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }
    );

    const result = await response.json();

    console.log(
      'ELECTRICITY PAYMENT RESPONSE:',
      result
    );

    const transaction =
      result.content?.transactions;

    const transactionStatus = String(
      transaction?.status || ''
    ).toLowerCase();

    // ==========================================
    // PAYMENT SUCCESS
    // ==========================================

    if (
      result.code === '000' &&
      transactionStatus === 'delivered'
    ) {
      const providerName =
        transaction?.product_name ||
        selectedProvider.toUpperCase();

      const transactionId =
        transaction?.transactionId ||
        transaction?.transaction_id ||
        'Successful';

      const meter =
        transaction?.unique_element ||
        cleanMeterNumber;

      const paidAmount =
        transaction?.total_amount ||
        numericAmount;

      const token =
        transaction?.Token ||
        transaction?.token ||
        'N/A';

      showAlert(
        'Electricity Payment Successful!',
        `Provider: ${providerName}\n\n` +
          `Meter Number: ${meter}\n\n` +
          `Amount Paid: ₦${Number(
            paidAmount
          ).toLocaleString()}\n\n` +
          `Transaction ID: ${transactionId}\n\n` +
          `Meter Type: ${meterType}\n\n` +
          `Token: ${token}`,
        'success'
      );

      // Clear electricity fields
      setMeterNumber('');
      setAmount('0');
    } else {
      showAlert(
        'Payment Failed',
        result.response_description ||
          transaction?.status ||
          'Unable to complete the electricity payment.',
        'error'
      );
    }
  } catch (error) {
    console.error(
      'ELECTRICITY PAYMENT ERROR:',
      error
    );

    showAlert(
      'Connection Error',
      'Unable to connect to the payment server. Please try again.',
      'error'
    );
  } finally {
    setIsSubmitting(false);
  }

  return;
}











  // ==========================================
  // DATA PAYMENT
  // ==========================================
  if (activeTab === 'data') {

    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Validate phone number
    if (cleanPhone.length !== 11) {
      showAlert(
        'Invalid Phone Number',
        'Please enter a valid 11-digit phone number.',
        'warning'
      );
      return;
    }

    // Validate provider
    if (!selectedProvider) {
      showAlert(
        'Select Network',
        'Please select your network provider.',
        'warning'
      );
      return;
    }

    // Validate selected data plan
    if (!selectedBundleCode) {
      showAlert(
        'Select Data Plan',
        'Please select a data plan before continuing.',
        'warning'
      );
      return;
    }

    // Get correct service ID
    const serviceID = DATA_SERVICE_IDS[selectedProvider];

    if (!serviceID) {
      showAlert(
        'Invalid Network',
        'Unable to determine the service ID for this network.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();

      const request_id =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        'dataTx';

      const paymentData = {
        request_id,
        serviceID,
        variation_code: selectedBundleCode,
        phone: cleanPhone,
      };

      console.log(
        'DATA PAYMENT REQUEST:',
        paymentData
      );

      const response = await fetch(
        `${API_BASE_URL}/pay`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();

      console.log(
        'DATA PAYMENT RESPONSE:',
        result
      );

      const transaction =
        result.content?.transactions;

      if (
        (result.code === '000' ||
          result.response_description === '000') &&
        transaction?.status === 'delivered'
      ) {

        showAlert(
          'Purchase Successful!',
          `Data purchase was successful.\n\n` +
            `Network: ${selectedProvider.toUpperCase()}\n` +
            `Plan: ${selectedPlan}\n` +
            `Phone: ${cleanPhone}\n\n` +
            `Transaction ID: ${
              transaction.transactionId ||
              transaction.transaction_id ||
              'Successful'
            }`,
          'success'
        );

        // Clear data purchase fields
        setPhoneNumber('');
        setSelectedBundleCode('');
        setSelectedPlan('');
        setDataVariations([]);

      } else {

        showAlert(
          'Purchase Failed',
          result.response_description ||
            transaction?.status ||
            'Unable to complete the data purchase.',
          'error'
        );
      }

    } catch (error) {

      console.error(
        'DATA PAYMENT ERROR:',
        error
      );

      showAlert(
        'Connection Error',
        'Unable to connect to the payment server. Please try again.',
        'error'
      );

    } finally {
      setIsSubmitting(false);
    }

    return;
  }

};

  const getProviders = () => {
    switch (activeTab) {
      case 'airtime':
      case 'data':
        return NETWORKS;
      case 'electricity':
        return DISCOS;
      case 'tv':
        return TV_PROVIDERS;
      case 'jamb':
      case 'waec':
        return EDUCATION_PROVIDERS[activeTab];
    }
  };

  // Unit price calculation for WAEC
  const unitPrice = selectedWaecVariation ? parseFloat(selectedWaecVariation.variation_amount) : 0;
  const totalWaecAmount = (unitPrice * waecQuantity).toLocaleString();



  // Icon Helper Functions
const getIconName = (type: 'success' | 'error' | 'warning' | 'info') => {
  switch (type) {
    case 'success': return 'checkmark-circle-outline';
    case 'error': return 'alert-circle-outline';
    case 'warning': return 'warning-outline';
    default: return 'information-circle-outline';
  }
};

const getIconColor = (type: 'success' | 'error' | 'warning' | 'info') => {
  switch (type) {
    case 'success': return '#00B856';
    case 'error': return '#EF4444';
    case 'warning': return '#F59E0B';
    default: return '#3B82F6';
  }
};

const getIconBgColor = (type: 'success' | 'error' | 'warning' | 'info') => {
  switch (type) {
    case 'success': return '#E6F4EA';
    case 'error': return '#FEE2E2';
    case 'warning': return '#FEF3C7';
    default: return '#DBEAFE';
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: scale(16), paddingTop: Platform.OS === 'android' ? verticalScale(12) : 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerRow, { marginBottom: verticalScale(16) }]}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.back()}>
            <Feather name="chevron-left" size={scale(22)} color="#12201B" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>Bills & Utilities</Text>
          <View style={{ width: scale(36) }} />
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabsScroll}>
          <View style={[styles.categoryTabsContainer, { borderRadius: scale(16), marginBottom: verticalScale(16) }]}>
            <TouchableOpacity style={[styles.categoryTab, activeTab === 'airtime' && styles.activeCategoryTab]} onPress={() => setActiveTab('airtime')}>
              <Feather name="phone-call" size={scale(14)} color={activeTab === 'airtime' ? '#FFFFFF' : '#82918B'} />
              <Text style={[styles.categoryTabText, activeTab === 'airtime' && styles.activeCategoryTabText]}>Airtime</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryTab, activeTab === 'data' && styles.activeCategoryTab]} onPress={() => setActiveTab('data')}>
              <Feather name="wifi" size={scale(14)} color={activeTab === 'data' ? '#FFFFFF' : '#82918B'} />
              <Text style={[styles.categoryTabText, activeTab === 'data' && styles.activeCategoryTabText]}>Data</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryTab, activeTab === 'electricity' && styles.activeCategoryTab]} onPress={() => setActiveTab('electricity')}>
              <Feather name="zap" size={scale(14)} color={activeTab === 'electricity' ? '#FFFFFF' : '#82918B'} />
              <Text style={[styles.categoryTabText, activeTab === 'electricity' && styles.activeCategoryTabText]}>Electricity</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryTab, activeTab === 'tv' && styles.activeCategoryTab]} onPress={() => setActiveTab('tv')}>
              <Feather name="tv" size={scale(14)} color={activeTab === 'tv' ? '#FFFFFF' : '#82918B'} />
              <Text style={[styles.categoryTabText, activeTab === 'tv' && styles.activeCategoryTabText]}>TV</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryTab, activeTab === 'waec' && styles.activeCategoryTab]} onPress={() => setActiveTab('waec')}>
              <MaterialCommunityIcons name="book-open-page-variant" size={scale(14)} color={activeTab === 'waec' ? '#FFFFFF' : '#82918B'} />
              <Text style={[styles.categoryTabText, activeTab === 'waec' && styles.activeCategoryTabText]}>WAEC</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      {/* 1. Select Provider */}
{/* 1. Select Provider */}
<View
  style={[
    styles.cardContainer,
    {
      borderRadius: scale(20),
      padding: scale(16),
      marginBottom: verticalScale(12),
    },
  ]}
>
  <Text
    style={[
      styles.sectionTitle,
      {
        fontFamily: 'Poppins',
        fontSize: scale(12),
        marginBottom: verticalScale(10),
      },
    ]}
  >
    Select Provider
  </Text>

  {/* Selected Provider */}
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => setProviderDropdownOpen(prev => !prev)}
    style={[
      styles.providerDropdown,
      {
        minHeight: scale(54),
        borderRadius: scale(14),
        paddingHorizontal: scale(12),
      },
    ]}
  >
    {getProviders().find(
      provider => provider.id === selectedProvider
    ) ? (
      <>
        <View
          style={[
            styles.providerLogo,
            {
              backgroundColor:
                getProviders().find(
                  provider => provider.id === selectedProvider
                )?.color,
              width: scale(34),
              height: scale(34),
              borderRadius: scale(10),
            },
          ]}
        >
          <Text
            style={[
              styles.providerLogoText,
              {
                fontFamily: 'Poppins',
                fontSize: scale(12),
              },
            ]}
          >
            {
              getProviders().find(
                provider => provider.id === selectedProvider
              )?.letter
            }
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: scale(10),
          }}
        >
          <Text
            style={[
              styles.providerDropdownName,
              {
                fontFamily: 'Poppins',
                fontSize: scale(13),
              },
            ]}
          >
            {
              getProviders().find(
                provider => provider.id === selectedProvider
              )?.name
            }
          </Text>

          <Text
            style={[
              styles.providerDropdownSubText,
              {
                fontFamily: 'Poppins',
                fontSize: scale(10),
              },
            ]}
          >
            {activeTab === 'electricity'
              ? 'Electricity provider'
              : activeTab === 'data'
              ? 'Mobile data network'
              : activeTab === 'airtime'
              ? 'Mobile network'
              : activeTab === 'tv'
              ? 'TV provider'
              : 'Education provider'}
          </Text>
        </View>

        <Feather
          name={
            providerDropdownOpen
              ? 'chevron-up'
              : 'chevron-down'
          }
          size={scale(19)}
          color="#12201B"
        />
      </>
    ) : (
      <Text
        style={[
          styles.providerDropdownPlaceholder,
          {
            fontFamily: 'Poppins',
            fontSize: scale(13),
          },
        ]}
      >
        Select Provider
      </Text>
    )}
  </TouchableOpacity>

  {/* Provider Options */}
  {providerDropdownOpen && (
    <View
      style={[
        styles.providerDropdownMenu,
        {
          marginTop: verticalScale(8),
          borderRadius: scale(14),
        },
      ]}
    >
      {getProviders().map(provider => {
        const isSelected =
          selectedProvider === provider.id;

        return (
          <TouchableOpacity
            key={provider.id}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedProvider(provider.id);
              setProviderDropdownOpen(false);

              if (activeTab === 'data') {
                fetchDataVariations(provider.id);
              } else if (activeTab === 'tv') {
                void fetchTvVariations(provider.id);
              }
            }}
            style={[
              styles.providerDropdownItem,
              {
                minHeight: scale(50),
                paddingHorizontal: scale(10),
                borderRadius: scale(10),
              },
              isSelected &&
                styles.providerDropdownItemActive,
            ]}
          >
            <View
              style={[
                styles.providerLogo,
                {
                  backgroundColor: provider.color,
                  width: scale(32),
                  height: scale(32),
                  borderRadius: scale(9),
                },
              ]}
            >
              <Text
                style={[
                  styles.providerLogoText,
                  {
                    fontFamily: 'Poppins',
                    fontSize: scale(11),
                  },
                ]}
              >
                {provider.letter}
              </Text>
            </View>

            <Text
              style={[
                styles.providerDropdownItemText,
                {
                  fontFamily: 'Poppins',
                  fontSize: scale(12),
                  marginLeft: scale(10),
                },
                isSelected &&
                  styles.providerDropdownItemTextActive,
              ]}
            >
              {provider.name}
            </Text>

            {isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={scale(18)}
                color="#00B856"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  )}
  {activeTab === 'jamb' && (
    <View style={[styles.cardContainer, { borderRadius: scale(20), padding: scale(16), marginBottom: verticalScale(12) }]}>
      <Text style={[styles.sectionTitle, { fontSize: scale(12), marginBottom: verticalScale(8) }]}>Phone Number</Text>
      <View style={[styles.inputBox, { height: scale(46), borderRadius: scale(14), paddingHorizontal: scale(12) }]}>
        <TextInput
          value={jambPhoneNumber}
          onChangeText={(text) => setJambPhoneNumber(text.replace(/\D/g, '').slice(0, 11))}
          keyboardType="phone-pad"
          placeholder="08012345678"
          placeholderTextColor="#9CA3AF"
          style={[styles.inputText, { fontSize: scale(15), flex: 1 }]}
        />
        <Ionicons name="call-outline" size={scale(20)} color="#00B856" />
      </View>
    </View>
  )}
</View>

              {/* 2. Target Number Input */}
        <View style={[styles.cardContainer, { borderRadius: scale(20), padding: scale(16), marginBottom: verticalScale(12) }]}>
          <Text style={[styles.sectionTitle, { fontSize: scale(12), marginBottom: verticalScale(8) }]}>
            {activeTab === 'electricity'
              ? 'Meter Number'
              : activeTab === 'tv'
              ? 'Smartcard / IUC Number'
              : activeTab === 'jamb'
              ? 'JAMB Profile Code'
              : activeTab === 'waec'
              ? 'Candidate Phone Number'
              : 'Phone Number'}
          </Text>

          <View style={[styles.inputBox, { height: scale(46), borderRadius: scale(14), paddingHorizontal: scale(12) }]}>
            <TextInput
              value={
                activeTab === 'electricity' ||
                activeTab === 'tv' ||
                activeTab === 'jamb'
                  ? meterNumber
                  : phoneNumber
              }
              onChangeText={
                activeTab === 'electricity' ||
                activeTab === 'tv' ||
                activeTab === 'jamb'
                  ? setMeterNumber
                  : handlePhoneNumberChange
              }
              keyboardType="numeric"
              placeholder={activeTab === 'waec' ? '08012345678' : ''}
              style={[styles.inputText, { fontSize: scale(15) }]}
            />

            {['airtime', 'data', 'waec'].includes(activeTab) ? (
              <TouchableOpacity
                style={styles.contactPickerBtn}
                accessibilityRole="button"
                accessibilityLabel="Choose phone number from contacts"
                onPress={() => void openPhoneContactPicker('phone')}
              >
                <Ionicons name="person-circle-outline" size={scale(22)} color="#00B856" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {(activeTab === 'electricity' || activeTab === 'tv') && (verificationLoading || verificationError || verifiedCustomer) ? (
          <View style={[styles.cardContainer, { borderRadius: scale(14), padding: scale(14), marginBottom: verticalScale(12) }]}>
            {verificationLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
                <ActivityIndicator size="small" color="#00B856" />
                <Text style={[styles.providerDropdownSubText, { fontSize: scale(12) }]}>Verifying customer details…</Text>
              </View>
            ) : verificationError ? (
              <Text style={{ color: '#B91C1C', fontSize: scale(12) }}>{verificationError}</Text>
            ) : (
              <>
                {verifiedCustomer?.name ? (
                  <Text style={{ color: '#12201B', fontSize: scale(13), fontWeight: '700' }}>
                    Customer: {verifiedCustomer.name}
                  </Text>
                ) : null}
                {verifiedCustomer?.address ? (
                  <Text style={{ color: '#64748B', fontSize: scale(12), marginTop: scale(4) }}>
                    Address: {verifiedCustomer.address}
                  </Text>
                ) : null}
                {!verifiedCustomer?.name && !verifiedCustomer?.address ? (
                  <Text style={{ color: '#64748B', fontSize: scale(12) }}>Number verified. Customer details were not provided.</Text>
                ) : null}
              </>
            )}
          </View>
        ) : null}

        {/* METER TYPE - ELECTRICITY ONLY */}
        {activeTab === 'electricity' && (
          <View
            style={[
              styles.cardContainer,
              {
                borderRadius: scale(20),
                padding: scale(16),
                marginBottom: verticalScale(12),
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontFamily: 'Poppins',
                  fontSize: scale(12),
                  marginBottom: verticalScale(8),
                },
              ]}
            >
              Meter Type
            </Text>

            <View
              style={{
                flexDirection: 'row',
                gap: scale(10),
              }}
            >
              <TouchableOpacity
                style={[
                  styles.meterTypeButton,
                  meterType === 'prepaid' &&
                    styles.meterTypeButtonActive,
                  {
                    height: scale(46),
                    borderRadius: scale(14),
                  },
                ]}
                onPress={() => setMeterType('prepaid')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.meterTypeText,
                    meterType === 'prepaid' &&
                      styles.meterTypeTextActive,
                    { fontSize: scale(13) },
                  ]}
                >
                  Prepaid
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.meterTypeButton,
                  meterType === 'postpaid' &&
                    styles.meterTypeButtonActive,
                  {
                    height: scale(46),
                    borderRadius: scale(14),
                  },
                ]}
                onPress={() => setMeterType('postpaid')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.meterTypeText,
                    meterType === 'postpaid' &&
                      styles.meterTypeTextActive,
                    { fontSize: scale(13) },
                  ]}
                >
                  Postpaid
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'electricity' && (
  <View
    style={[
      styles.cardContainer,
      {
        borderRadius: scale(20),
        padding: scale(16),
        marginBottom: verticalScale(12),
      },
    ]}
  >
    <Text
      style={[
        styles.sectionTitle,
        {
          fontFamily: 'Poppins',
          fontSize: scale(12),
          marginBottom: verticalScale(8),
        },
      ]}
    >
      Phone Number
    </Text>

    <View
      style={[
        styles.inputBox,
        {
          height: scale(46),
          borderRadius: scale(14),
          paddingHorizontal: scale(12),
        },
      ]}
    >
      <TextInput
        value={electricityPhoneNumber}
        onChangeText={(text) =>
          setElectricityPhoneNumber(
            text.replace(/\D/g, '').slice(0, 11)
          )
        }
        keyboardType="phone-pad"
        placeholder="08012345678"
        placeholderTextColor="#9CA3AF"
        style={[
          styles.inputText,
          {
            fontFamily: 'Poppins',
            fontSize: scale(15),
            flex: 1,
          },
        ]}
      />

      <TouchableOpacity
        style={styles.contactPickerBtn}
        accessibilityRole="button"
        accessibilityLabel="Choose phone number from contacts"
        onPress={() => void openPhoneContactPicker('electricity')}
      >
        <Ionicons name="person-circle-outline" size={scale(22)} color="#00B856" />
      </TouchableOpacity>
    </View>
  </View>
)}

        {activeTab === 'tv' && (
          <View style={[styles.cardContainer, { borderRadius: scale(20), padding: scale(16), marginBottom: verticalScale(12) }]}>
            <Text style={[styles.sectionTitle, { fontSize: scale(12), marginBottom: verticalScale(8) }]}>Phone Number</Text>
            <View style={[styles.inputBox, { height: scale(46), borderRadius: scale(14), paddingHorizontal: scale(12) }]}>
              <TextInput
                value={tvPhoneNumber}
                onChangeText={(text) => setTvPhoneNumber(text.replace(/\D/g, '').slice(0, 11))}
                keyboardType="phone-pad"
                placeholder="08012345678"
                placeholderTextColor="#9CA3AF"
                style={[styles.inputText, { fontSize: scale(15), flex: 1 }]}
              />
              <TouchableOpacity
                style={styles.contactPickerBtn}
                accessibilityRole="button"
                accessibilityLabel="Choose phone number from contacts"
                onPress={() => void openPhoneContactPicker('tv')}
              >
                <Ionicons name="person-circle-outline" size={scale(22)} color="#00B856" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        

        {/* 3. Package Selection (For Data / Cable TV / WAEC Variations) */}
        {(activeTab === 'waec' || activeTab === 'jamb') && (
          <View style={[styles.cardContainer, { borderRadius: scale(20), padding: scale(16), marginBottom: verticalScale(12) }]}>
            <Text style={[styles.sectionTitle, { fontSize: scale(12), marginBottom: verticalScale(8) }]}>{activeTab === 'waec' ? 'WAEC Package' : 'JAMB ePIN Package'}</Text>

            {(activeTab === 'waec' ? loadingWaecVariations : loadingJambVariations) ? (
              <ActivityIndicator color="#00B856" style={{ marginVertical: 10 }} />
            ) : (
              (activeTab === 'waec' ? waecVariations : jambVariations).map((item) => {
                const selected = activeTab === 'waec'
                  ? selectedWaecVariation?.variation_code === item.variation_code
                  : selectedJambVariation?.variation_code === item.variation_code;
                return (
                <TouchableOpacity
                  key={item.variation_code}
                  style={[
                    styles.dropdownBox,
                    { height: scale(46), borderRadius: scale(14), paddingHorizontal: scale(12), borderColor: selected ? '#00B856' : '#E2E8F0', borderWidth: 1 },
                  ]}
                  onPress={() => activeTab === 'waec' ? setSelectedWaecVariation(item) : setSelectedJambVariation(item)}
                >
                  <Text style={[styles.dropdownText, { fontSize: scale(13) }]}>
                    {item.name} (₦{parseFloat(item.variation_amount).toLocaleString()})
                  </Text>
                  {selected ? <Ionicons name="checkmark-circle" size={scale(18)} color="#00B856" /> : null}
                </TouchableOpacity>
                )
              })
            )}

            {/* WAEC Quantity Selector */}
            {activeTab === 'waec' ? <View style={{ marginTop: verticalScale(12) }}>
              <Text style={[styles.sectionTitle, { fontSize: scale(12), marginBottom: verticalScale(6) }]}>Quantity</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setWaecQuantity((prev) => Math.max(1, prev - 1))}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyText}>{waecQuantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setWaecQuantity((prev) => Math.min(5, prev + 1))}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View> : null}
          </View>
        )}

      {(activeTab === 'data' || activeTab === 'tv') && (
  <View
    style={[
      styles.cardContainer,
      {
        borderRadius: scale(20),
        padding: scale(16),
        marginBottom: verticalScale(12),
      },
    ]}
  >
    <Text
      style={[
        styles.sectionTitle,
        {
          fontFamily: 'Poppins',
          fontSize: scale(12),
          marginBottom: verticalScale(8),
        },
      ]}
    >
      Select Bundle
    </Text>

    {activeTab === 'data' ? (
      loadingDataVariations ? (
        <View
          style={[
            styles.dropdownBox,
            {
              height: scale(46),
              borderRadius: scale(14),
              paddingHorizontal: scale(12),
              justifyContent: 'center',
            },
          ]}
        >
          <ActivityIndicator color="#00B856" />
        </View>
      ) : (
        <ScrollView
          style={{ maxHeight: scale(220) }}
          showsVerticalScrollIndicator={false}
        >
         {dataVariations.map((item, index) => {
  const variationCode = String(item?.variation_code ?? '');
  const planName = String(item?.name ?? 'Data Plan');
  const variationAmount = Number(item?.variation_amount ?? 0);

  if (!variationCode) {
    return null;
  }

  const isSelected = selectedBundleCode === variationCode;

  return (
    <TouchableOpacity
      key={`${variationCode}-${index}`}
      onPress={() => {
        setSelectedBundleCode(variationCode);
        setSelectedPlan(planName);
      }}
      style={[
        styles.dropdownBox,
        {
          minHeight: scale(46),
          borderRadius: scale(14),
          paddingHorizontal: scale(12),
          marginBottom: scale(8),
          borderWidth: isSelected ? 1 : 0,
          borderColor: '#00B856',
          backgroundColor: isSelected
            ? '#F0FDF4'
            : '#F7F9F8',
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.dropdownText,
            { fontSize: scale(13) },
          ]}
        >
          {planName}
        </Text>

        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: scale(11),
            color: '#82918B',
            marginTop: 3,
          }}
        >
          ₦{variationAmount.toLocaleString()}
        </Text>
      </View>

      {isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={scale(18)}
          color="#00B856"
        />
      )}
    </TouchableOpacity>
  );
})}
        </ScrollView>
      )
    ) : loadingTvVariations ? (
      <View style={[styles.dropdownBox, { height: scale(46), justifyContent: 'center' }]}>
        <ActivityIndicator color="#00B856" />
      </View>
    ) : tvVariationsError ? (
      <Text style={{ color: '#B91C1C', fontSize: scale(12) }}>{tvVariationsError}</Text>
    ) : (
      <ScrollView style={{ maxHeight: scale(220) }} showsVerticalScrollIndicator={false}>
        {tvVariations.map((item) => {
          const isSelected = selectedBundleCode === item.variation_code;
          return (
            <TouchableOpacity
              key={item.variation_code}
              onPress={() => {
                setSelectedBundleCode(item.variation_code);
                setSelectedPlan(item.name);
              }}
              style={[
                styles.dropdownBox,
                {
                  minHeight: scale(50),
                  borderRadius: scale(14),
                  paddingHorizontal: scale(12),
                  marginBottom: scale(8),
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: '#00B856',
                  backgroundColor: isSelected ? '#F0FDF4' : '#F7F9F8',
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.dropdownText, { fontSize: scale(13) }]}>{item.name}</Text>
                <Text style={{ color: '#82918B', fontSize: scale(11), marginTop: 3 }}>
                  ₦{Number(item.variation_amount).toLocaleString()}
                </Text>
              </View>
              {isSelected ? <Ionicons name="checkmark-circle" size={scale(18)} color="#00B856" /> : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    )}
  </View>
)}

        {/* 4. Amount Section */}
        {activeTab === 'waec' ? (
          <View style={[styles.cardContainer, { borderRadius: scale(20), padding: scale(16), marginBottom: verticalScale(14) }]}>
            <Text style={[styles.sectionTitle, { fontSize: scale(12) }]}>Total Amount</Text>
            <View style={[styles.amountRow, { marginVertical: verticalScale(8) }]}>
              <View style={styles.amountInputGroup}>
                <Text style={[styles.nairaSymbol, { fontSize: scale(22) }]}>₦</Text>
                <Text style={[styles.amountInput, { fontSize: scale(22), lineHeight: scale(28) }]}>
                  {totalWaecAmount}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          (activeTab === 'airtime' || activeTab === 'electricity') && (
            <View style={[styles.cardContainer, { borderRadius: scale(20), padding: scale(16), marginBottom: verticalScale(14) }]}>
              <Text style={[styles.sectionTitle, { fontSize: scale(12) }]}>Amount</Text>

              <View style={[styles.amountRow, { marginVertical: verticalScale(8) }]}>
                <View style={styles.amountInputGroup}>
                  <Text style={[styles.nairaSymbol, { fontSize: scale(22) }]}>₦</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    style={[styles.amountInput, { fontSize: scale(22) }]}
                  />
                </View>
                <Text style={[styles.minAmountText, { fontSize: scale(11) }]}>Min ₦100</Text>
              </View>

              <View style={styles.presetsRow}>
                {AMOUNT_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setAmount(p.value)}
                    style={[styles.presetBtn, { borderRadius: scale(10), height: scale(36) }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.presetText, { fontSize: scale(12) }]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )
        )}

        {/* Cashback Callout */}
        <View style={[styles.cashbackBanner, { borderRadius: scale(14), padding: scale(12), marginBottom: verticalScale(16) }]}>
          <MaterialCommunityIcons name="lightning-bolt-circle" size={scale(20)} color="#B3F05C" />
          <Text style={[styles.cashbackText, { fontSize: scale(11), marginLeft: 6 }]}>
            Earn 2% instant cashback on this transaction
          </Text>
        </View>

        {pendingBillPaystackReference ? (
          <View style={styles.paystackAutoCheck}>
            <ActivityIndicator size="small" color="#047857" />
            <Text style={styles.paystackAutoCheckText}>Paystack payment is being confirmed automatically. Don’t submit another payment.</Text>
          </View>
        ) : null}

        {/* Submit Action Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, styles.confirmBtnGlow, { height: scale(48), borderRadius: scale(16) }]}
          activeOpacity={0.85}
          onPress={() => setPaymentSheetVisible(true)}
          disabled={isSubmitting || Boolean(pendingBillPaystackReference)}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={[styles.confirmBtnText, { fontSize: scale(15) }]}>
                {pendingBillPaystackReference ? 'Confirming payment…' : `Pay ${activeTab.toUpperCase()}`}
              </Text>
              <Ionicons name="arrow-forward" size={scale(18)} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <Modal
  transparent
  animationType="fade"
  visible={alertConfig.visible}
  onRequestClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
>
  <View style={styles.modalBackdrop}>
    <View style={styles.modalContainer}>
      <View style={[styles.modalIconBox, { backgroundColor: getIconBgColor(alertConfig.type) }]}>
        <Ionicons
          name={getIconName(alertConfig.type)}
          size={scale(28)}
          color={getIconColor(alertConfig.type)}
        />
      </View>

      <Text style={styles.modalTitle}>{alertConfig.title}</Text>
      <Text style={styles.modalMessage}>{alertConfig.message}</Text>

      <TouchableOpacity
        style={[styles.modalBtn, { backgroundColor: getIconColor(alertConfig.type) }]}
        onPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        activeOpacity={0.8}
      >
        <Text style={styles.modalBtnText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
      <PaymentOptionsSheet
        visible={paymentSheetVisible}
        amount={activeTab === 'tv'
          ? Number(tvVariations.find((item) => item.variation_code === selectedBundleCode)?.variation_amount) || undefined
          : activeTab === 'data'
            ? Number(dataVariations.find((item) => item.variation_code === selectedBundleCode)?.variation_amount) || undefined
            : activeTab === 'waec'
              ? Number(totalWaecAmount.replace(/,/g, '')) || undefined
              : activeTab === 'jamb'
                ? Number(selectedJambVariation?.variation_amount) || undefined
              : Number(amount) || undefined}
        walletBalance={Number(walletBalance) || 0}
        walletEnabled={Boolean(token)}
        providerLabel="Pay with Paystack"
        onClose={() => setPaymentSheetVisible(false)}
        onPayFromWallet={() => {
          setPaymentSheetVisible(false);
          void submitPayment('wallet');
        }}
        onContinueWithProvider={() => {
          setPaymentSheetVisible(false);
          void submitPayment('paystack');
        }}
      />
    </SafeAreaView>
  );
}




const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F5',
  },
  container: {
    paddingBottom: 30,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
    color: '#12201B',
  },

  /* Category Navigation Pills */
  categoryTabsScroll: {
    marginBottom: 16,
  },
  categoryTabsContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 4,
    marginBottom: 0,
  },
  categoryTab: {
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  activeCategoryTab: {
    backgroundColor: '#0F261C',
  },
  categoryTabText: {
    color: '#82918B',
    fontWeight: '700',
    fontFamily: 'Poppins',
    fontSize: 11,
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },

  /* Generic Card Container */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  sectionTitle: {
    color: '#82918B',
    fontWeight: '600',
  },

  /* Provider Grid */
  providersGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  providerCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  activeProviderCard: {
    borderColor: '#00B856',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
  },
  providerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  providerLogoText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  providerName: {
    fontWeight: '700',
    color: '#12201B',
  },

  /* Input Box */
  inputBox: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontWeight: '800',
    color: '#12201B',
    flex: 1,
  },
  contactPickerBtn: {
    padding: 2,
  },
  verifiedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedStatusText: {
    color: '#00B856',
    fontWeight: '700',
  },
providerDropdown: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F7F9F8',
  borderWidth: 1,
  borderColor: '#E5EAE7',
},

providerDropdownPlaceholder: {
  color: '#82918B',
  fontWeight: '500',
},

providerDropdownName: {
  color: '#12201B',
  fontWeight: '700',
},

providerDropdownSubText: {
  color: '#82918B',
  marginTop: 2,
},

providerDropdownMenu: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAE7',
  padding: 6,

  // Keeps the dropdown visually above the other content
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
},

providerDropdownItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
},

providerDropdownItemActive: {
  backgroundColor: '#F0FDF4',
},

providerDropdownItemText: {
  color: '#12201B',
  fontWeight: '600',
},

providerDropdownItemTextActive: {
  color: '#00B856',
  fontWeight: '700',
},
  /* Dropdown Select Box */
  dropdownBox: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#12201B',
    fontWeight: '700',
  },

  /* Amount Input & Presets */
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nairaSymbol: {
    fontWeight: '900',
    color: '#12201B',
  },
  meterTypeButton: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  backgroundColor: '#F7F9F8',
  alignItems: 'center',
  justifyContent: 'center',
},

meterTypeButtonActive: {
  backgroundColor: '#00B856',
  borderColor: '#00B856',
},

meterTypeText: {
  fontWeight: '600',
  color: '#82918B',
},

meterTypeTextActive: {
  color: '#FFFFFF',
},
  amountInput: {
    fontWeight: '900',
    color: '#12201B',
    marginLeft: 2,
  },
  minAmountText: {
    color: '#82918B',
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  presetText: {
    fontWeight: '800',
    color: '#12201B',
  },

  qtyBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E4EAE7', justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#12201B' },
  qtyText: { marginHorizontal: 16, fontSize: 16, fontWeight: 'bold', color: '#12201B' },

  /* Cashback Banner */
  cashbackBanner: {
    backgroundColor: '#0F261C',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashbackText: {
    color: '#B3F05C',
    fontWeight: '700',
  },

  /* Action Button & Glow */
  confirmBtn: {
    backgroundColor: '#00B856',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paystackAutoCheck: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, marginBottom: 12, borderRadius: 10, backgroundColor: '#ECFDF5' },
  paystackAutoCheckText: { color: '#047857', fontSize: 12, fontWeight: '600', flex: 1 },
  confirmBtnGlow: {
    shadowColor: '#00B856',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '700',
    color: '#12201B',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#52605B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Poppins',
    fontSize: 15,
  },
});