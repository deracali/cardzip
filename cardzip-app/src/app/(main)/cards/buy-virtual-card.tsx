import React, { useRef, useState } from 'react';

import { StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Modal,
  Animated,
  Easing,
  Pressable, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import FeedbackModal from '../components/FeedbackModal';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';

// Types
type CardType = 'shopping' | 'subscription';

interface ColorOption {
  id: string;
  colors: [string, string, ...string[]];
  name: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { id: 'emerald', colors: ['#0B3C2B', '#042017', '#02120D'], name: 'Emerald Glow' },
  { id: 'teal', colors: ['#0E5A52', '#083B36', '#03201D'], name: 'Teal Mist' },
  { id: 'darkGreen', colors: ['#052B1E', '#021A12', '#010B08'], name: 'Forest Dark' },
];

const PRESET_BALANCES = ['50', '100', '250', 'Custom'];

export default function BuyVirtualCardScreen() {
  const { width, height } = useWindowDimensions();

  // Responsive Scaling Helpers (Base on 375x812 design viewport)
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;

  // Screen States
  const [cardType, setCardType] = useState<CardType>('shopping');
  const [selectedTheme, setSelectedTheme] = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [cardNickname, setCardNickname] = useState('AWS Billing');
  const [selectedPreset, setSelectedPreset] = useState('50');
  const [amount, setAmount] = useState('50');
  const [isCustom, setIsCustom] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'success' | 'error' | 'info' } | null>(null);

  // Payment Modal State
const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

const [selectedPaymentMethod, setSelectedPaymentMethod] =
  useState<'wallet' | 'bank' | 'card' | 'crypto'>('wallet');

const paymentSlideAnim = useRef(new Animated.Value(0)).current;
const paymentOverlayAnim = useRef(new Animated.Value(0)).current;



const openPaymentModal = () => {
  setIsPaymentModalVisible(true);

  paymentSlideAnim.setValue(0);
  paymentOverlayAnim.setValue(0);

  Animated.parallel([
    Animated.timing(paymentSlideAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),

    Animated.timing(paymentOverlayAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }),
  ]).start();
};




const closePaymentModal = () => {
  Animated.parallel([
    Animated.timing(paymentSlideAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }),

    Animated.timing(paymentOverlayAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }),
  ]).start(({ finished }) => {
    if (finished) {
      setIsPaymentModalVisible(false);
    }
  });
};

  // Exchange rate calculation
  const exchangeRate = 1480;
  const fee = 2.0;
  const numericAmount = parseFloat(amount) || 0;
  const totalInNaira = Math.round((numericAmount + fee) * exchangeRate).toLocaleString();

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === 'Custom') {
      setIsCustom(true);
      setAmount('');
    } else {
      setIsCustom(false);
      setAmount(preset);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: scale(16),
            paddingTop: Platform.OS === 'android' ? verticalScale(12) : scale(8),
            paddingBottom: verticalScale(32),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
        <View style={[styles.headerRow, { marginBottom: verticalScale(12) }]}>
          <TouchableOpacity
            style={[styles.backButton, { width: scale(36), height: scale(36), borderRadius: scale(18) }]}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={scale(18)} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { fontSize: scale(17) }]}>Buy New Virtual Card</Text>
            <Text style={[styles.headerSubtitle, { fontSize: scale(11) }]}>Step 2 of 3 • Setup & funding</Text>
          </View>
        </View>

        {/* Progress Bar (Step 2 active) */}
        <View style={[styles.progressTrack, { height: scale(4), marginBottom: verticalScale(16) }]}>
          <View style={[styles.progressFill, { width: '66%', height: scale(4) }]} />
        </View>

        {/* STEP 1: CARD TYPE */}
        <Text style={[styles.stepLabel, { fontSize: scale(11), marginBottom: verticalScale(8) }]}>
          STEP 1 — CARD TYPE
        </Text>
        <View style={[styles.stepRow, { gap: scale(10), marginBottom: verticalScale(18) }]}>
          {/* Shopping Card Option */}
          <TouchableOpacity
            style={[
              styles.typeCard,
              { borderRadius: scale(14), padding: scale(12) },
              cardType === 'shopping' && styles.typeCardActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setCardType('shopping')}
          >
            <View
              style={[
                styles.typeIconContainer,
                { width: scale(34), height: scale(34), borderRadius: scale(10) },
                cardType === 'shopping' ? styles.typeIconContainerActive : styles.typeIconContainerInactive,
              ]}
            >
              <MaterialCommunityIcons
                name="shopping-outline"
                size={scale(18)}
                color={cardType === 'shopping' ? '#FFFFFF' : '#64748B'}
              />
            </View>
            <Text style={[styles.typeTitle, { fontSize: scale(13), marginTop: verticalScale(8) }]}>
              Shopping Card
            </Text>
            <Text style={[styles.typeSubtitle, { fontSize: scale(10) }]}>Multi-purpose Visa</Text>
          </TouchableOpacity>

          {/* Subscription Card Option */}
          <TouchableOpacity
            style={[
              styles.typeCard,
              { borderRadius: scale(14), padding: scale(12) },
              cardType === 'subscription' && styles.typeCardActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setCardType('subscription')}
          >
            <View
              style={[
                styles.typeIconContainer,
                { width: scale(34), height: scale(34), borderRadius: scale(10) },
                cardType === 'subscription' ? styles.typeIconContainerActive : styles.typeIconContainerInactive,
              ]}
            >
              <Feather
                name="repeat"
                size={scale(18)}
                color={cardType === 'subscription' ? '#FFFFFF' : '#334155'}
              />
            </View>
            <Text style={[styles.typeTitle, { fontSize: scale(13), marginTop: verticalScale(8) }]}>
              Subscription Card
            </Text>
            <Text style={[styles.typeSubtitle, { fontSize: scale(10) }]}>Recurring Mastercard</Text>
          </TouchableOpacity>
        </View>

        {/* STEP 2: CUSTOMIZE */}
        <Text style={[styles.stepLabel, { fontSize: scale(11), marginBottom: verticalScale(8) }]}>
          STEP 2 — CUSTOMIZE
        </Text>

        {/* Live Virtual Card Preview */}
        <LinearGradient
          colors={selectedTheme.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.virtualCard,
            { borderRadius: scale(20), padding: scale(18), height: verticalScale(185), marginBottom: verticalScale(12) },
          ]}
        >
          {/* Card Top Row */}
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={[styles.cardNicknameText, { fontSize: scale(13) }]}>
                {cardNickname || 'AWS Billing'}
              </Text>
              <View style={styles.previewBadgeRow}>
                <View style={[styles.previewDot, { width: scale(5), height: scale(5), borderRadius: scale(2.5) }]} />
                <Text style={[styles.previewBadgeText, { fontSize: scale(10) }]}>Preview</Text>
              </View>
            </View>
            <Text style={[styles.cardBrandText, { fontSize: scale(18) }]}>Visa</Text>
          </View>

          {/* EMV Chip & Number Mask */}
          <View style={[styles.chipRow, { marginVertical: verticalScale(12) }]}>
            <View style={[styles.emvChip, { width: scale(38), height: scale(28), borderRadius: scale(6) }]} />
            <Text style={[styles.cardNumberMask, { fontSize: scale(13), letterSpacing: scale(2) }]}>
              •••• •••• •••• ••••
            </Text>
          </View>

          {/* Card Footer Details */}
          <View style={styles.cardFooterRow}>
            <View style={styles.cardDetailCol}>
              <Text style={[styles.cardDetailLabel, { fontSize: scale(9) }]}>Expiry</Text>
              <Text style={[styles.cardDetailValue, { fontSize: scale(12) }]}>••/••</Text>
            </View>
            <View style={[styles.cardDetailCol, { marginLeft: scale(24) }]}>
              <Text style={[styles.cardDetailLabel, { fontSize: scale(9) }]}>Balance</Text>
              <Text style={[styles.cardDetailValue, { fontSize: scale(13) }]}>
                ${numericAmount ? numericAmount.toFixed(2) : '0.00'}
              </Text>
            </View>

            {/* Overlapping Circles Icon */}
            <View style={styles.cardLogoCircles}>
              <View style={[styles.circleLeft, { width: scale(22), height: scale(22), borderRadius: scale(11) }]} />
              <View style={[styles.circleRight, { width: scale(22), height: scale(22), borderRadius: scale(11) }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Color Palette Selector */}
        <View style={[styles.colorSelectorRow, { marginBottom: verticalScale(14) }]}>
          <Text style={[styles.colorThemeLabel, { fontSize: scale(12) }]}>{selectedTheme.name}</Text>
          <View style={[styles.paletteContainer, { gap: scale(8) }]}>
            {COLOR_OPTIONS.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                activeOpacity={0.8}
                onPress={() => setSelectedTheme(theme)}
                style={[
                  styles.colorSwatchOuter,
                  { width: scale(28), height: scale(28), borderRadius: scale(14) },
                  selectedTheme.id === theme.id && styles.colorSwatchActive,
                ]}
              >
                <View
                  style={[
                    styles.colorSwatchInner,
                    {
                      width: scale(22),
                      height: scale(22),
                      borderRadius: scale(11),
                      backgroundColor: theme.colors[0],
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Card Nickname Input Card */}
        <View style={[styles.inputCard, { borderRadius: scale(14), padding: scale(12), marginBottom: verticalScale(18) }]}>
          <Text style={[styles.inputFieldLabel, { fontSize: scale(10) }]}>Card Nickname</Text>
          <View style={styles.inputFieldRow}>
            <TextInput
              value={cardNickname}
              onChangeText={setCardNickname}
              placeholder="e.g. AWS Billing"
              placeholderTextColor="#94A3B8"
              style={[styles.textInput, { fontSize: scale(14) }]}
            />
            <Feather name="edit-2" size={scale(14)} color="#0F172A" />
          </View>
        </View>

        {/* STEP 3: INITIAL FUNDING */}
        <Text style={[styles.stepLabel, { fontSize: scale(11), marginBottom: verticalScale(8) }]}>
          STEP 3 — INITIAL FUNDING
        </Text>

        {/* Amount Input Display Card */}
        <View style={[styles.fundingCard, { borderRadius: scale(14), padding: scale(14), marginBottom: verticalScale(10) }]}>
          <Text style={[styles.fundingCardLabel, { fontSize: scale(11) }]}>Initial Card Balance</Text>
          <View style={styles.amountDisplayRow}>
            <Text style={[styles.currencySymbol, { fontSize: scale(26) }]}>$</Text>
            {isCustom ? (
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                autoFocus
                style={[styles.amountInputText, { fontSize: scale(28) }]}
              />
            ) : (
              <View style={styles.formattedAmountRow}>
                <Text style={[styles.amountMainText, { fontSize: scale(28) }]}>
                  {amount || '0'}
                </Text>
                <Text style={[styles.amountCentsText, { fontSize: scale(18) }]}>.00</Text>
              </View>
            )}
          </View>
        </View>

        {/* Preset Amount Pills */}
        <View style={[styles.presetsGrid, { gap: scale(8), marginBottom: verticalScale(14) }]}>
          {PRESET_BALANCES.map((p) => {
            const isSelected = selectedPreset === p;
            return (
              <TouchableOpacity
                key={p}
                activeOpacity={0.8}
                onPress={() => handlePresetSelect(p)}
                style={[
                  styles.presetPill,
                  { borderRadius: scale(10), height: scale(38) },
                  isSelected ? styles.presetPillActive : styles.presetPillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.presetPillText,
                    { fontSize: scale(13) },
                    isSelected ? styles.presetPillTextActive : styles.presetPillTextInactive,
                  ]}
                >
                  {p === 'Custom' ? 'Custom' : `$${p}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rate & Total Breakdown Banner */}
        <View style={[styles.summaryBanner, { borderRadius: scale(14), padding: scale(14), marginBottom: verticalScale(18) }]}>
          <View>
            <Text style={[styles.summaryMetaText, { fontSize: scale(10) }]}>
              Rate: $1 = ₦{exchangeRate.toLocaleString()} • Fee: ${fee.toFixed(2)}
            </Text>
            <View style={styles.totalPayRow}>
              <Text style={[styles.totalPayLabel, { fontSize: scale(13) }]}>Total to Pay: </Text>
              <Text style={[styles.totalPayValue, { fontSize: scale(14) }]}>₦{totalInNaira}</Text>
            </View>
          </View>
          <View style={[styles.liveBadge, { borderRadius: scale(6), paddingHorizontal: scale(8), paddingVertical: scale(3) }]}>
            <Text style={[styles.liveBadgeText, { fontSize: scale(9) }]}>LIVE</Text>
          </View>
        </View>

        {/* Submit Action Button */}
 {/* Submit Action Button */}
<TouchableOpacity
  style={[
    styles.submitButton,
    {
      borderRadius: scale(14),
      height: scale(48),
    },
  ]}
  activeOpacity={0.85}
  onPress={openPaymentModal}
>
  <Text
    style={[
      styles.submitButtonText,
      { fontSize: scale(15) },
    ]}
  >
    Proceed to Payment
  </Text>
</TouchableOpacity>
      </KeyboardAwareScrollView>
      {/* PAYMENT SLIDE-UP MODAL */}
<Modal
  visible={isPaymentModalVisible}
  transparent
  animationType="none"
  statusBarTranslucent
  onRequestClose={closePaymentModal}
>
  <View style={styles.paymentModalRoot}>

    {/* Dark Overlay */}
    <Animated.View
      style={[
        styles.paymentOverlay,
        {
          opacity: paymentOverlayAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.45],
          }),
        },
      ]}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={closePaymentModal}
      />
    </Animated.View>

    {/* Sliding Payment Sheet */}
    <Animated.View
      style={[
        styles.paymentSheet,
        {
          transform: [
            {
              translateY: paymentSlideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0],
              }),
            },
          ],
        },
      ]}
    >

      {/* Drag Handle */}
      <View style={styles.paymentDragHandle} />

      {/* Header */}
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentHeaderTitle}>
          Complete Payment
        </Text>

        <TouchableOpacity
          style={styles.paymentCloseButton}
          onPress={closePaymentModal}
          activeOpacity={0.7}
        >
          <Feather
            name="x"
            size={16}
            color="#334155"
          />
        </TouchableOpacity>
      </View>

      {/* Payment Summary */}
      <View style={styles.paymentSummaryCard}>

        <View style={styles.paymentSummaryRow}>
          <Text style={styles.paymentSummaryLabel}>
            Card Creation Fee
          </Text>

          <Text style={styles.paymentSummaryValue}>
            $2.00
          </Text>
        </View>

        <View style={styles.paymentSummaryRow}>
          <Text style={styles.paymentSummaryLabel}>
            Initial Card Deposit
          </Text>

          <Text style={styles.paymentSummaryValue}>
            ${numericAmount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.paymentSummaryDivider} />

        <View style={styles.paymentTotalRow}>
          <Text style={styles.paymentTotalLabel}>
            Total due
          </Text>

          <Text style={styles.paymentTotalValue}>
            ₦{totalInNaira}
          </Text>
        </View>

      </View>

      {/* Pay With Label */}
      <Text style={styles.payWithLabel}>
        PAY WITH
      </Text>

      {/* PAYMENT METHODS */}
      <View style={styles.paymentMethodsContainer}>

        {/* WALLET */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPaymentMethod('wallet')}
          style={[
            styles.paymentMethodCard,
            selectedPaymentMethod === 'wallet' &&
              styles.paymentMethodCardActive,
          ]}
        >
          <View
            style={[
              styles.paymentMethodIcon,
              selectedPaymentMethod === 'wallet' &&
                styles.paymentMethodIconActive,
            ]}
          >
            <Feather
              name="credit-card"
              size={16}
              color={
                selectedPaymentMethod === 'wallet'
                  ? '#FFFFFF'
                  : '#475569'
              }
            />
          </View>

          <View style={styles.paymentMethodDetails}>
            <View style={styles.paymentMethodTitleRow}>
              <Text style={styles.paymentMethodTitle}>
                In-App Wallet
              </Text>

              <View style={styles.instantBadge}>
                <Text style={styles.instantBadgeText}>
                  Instant
                </Text>
              </View>
            </View>

            <Text style={styles.paymentMethodSubtitle}>
              Balance: ₦145,200.00
            </Text>
          </View>

          <View
            style={[
              styles.paymentRadio,
              selectedPaymentMethod === 'wallet' &&
                styles.paymentRadioActive,
            ]}
          >
            {selectedPaymentMethod === 'wallet' && (
              <View style={styles.paymentRadioDot} />
            )}
          </View>
        </TouchableOpacity>

        {/* BANK TRANSFER */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPaymentMethod('bank')}
          style={[
            styles.paymentMethodCard,
            selectedPaymentMethod === 'bank' &&
              styles.paymentMethodCardActive,
          ]}
        >
          <View style={styles.paymentMethodIcon}>
            <MaterialCommunityIcons
              name="bank"
              size={16}
              color="#475569"
            />
          </View>

          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodTitle}>
              Bank Transfer
            </Text>

            <Text style={styles.paymentMethodSubtitle}>
              GTBank • 0123456789
            </Text>
          </View>

          <View style={styles.paymentMethodRight}>
            <TouchableOpacity
              style={styles.copyAccountButton}
              activeOpacity={0.7}
              onPress={() => {
                setFeedback({
                  title: 'Account Details',
                  message: 'Copy account functionality can be connected here.',
                  tone: 'info',
                });
              }}
            >
              <Text style={styles.copyAccountText}>
                Copy Account
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.paymentRadio,
                selectedPaymentMethod === 'bank' &&
                  styles.paymentRadioActive,
              ]}
            >
              {selectedPaymentMethod === 'bank' && (
                <View style={styles.paymentRadioDot} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* DEBIT CARD */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPaymentMethod('card')}
          style={[
            styles.paymentMethodCard,
            selectedPaymentMethod === 'card' &&
              styles.paymentMethodCardActive,
          ]}
        >
          <View style={styles.paymentMethodIcon}>
            <Feather
              name="credit-card"
              size={16}
              color="#475569"
            />
          </View>

          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodTitle}>
              Debit Card
            </Text>

            <Text style={styles.paymentMethodSubtitle}>
              Paystack • Flutterwave secured
            </Text>
          </View>

          <View
            style={[
              styles.paymentRadio,
              selectedPaymentMethod === 'card' &&
                styles.paymentRadioActive,
            ]}
          >
            {selectedPaymentMethod === 'card' && (
              <View style={styles.paymentRadioDot} />
            )}
          </View>
        </TouchableOpacity>

        {/* CRYPTO */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPaymentMethod('crypto')}
          style={[
            styles.paymentMethodCard,
            selectedPaymentMethod === 'crypto' &&
              styles.paymentMethodCardActive,
          ]}
        >
          <View style={styles.paymentMethodIcon}>
            <FontAwesome5
              name="bitcoin"
              size={15}
              color="#475569"
            />
          </View>

          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodTitle}>
              Crypto
            </Text>

            <Text style={styles.paymentMethodSubtitle}>
              USDT / USDC • Auto-convert
            </Text>
          </View>

          <View
            style={[
              styles.paymentRadio,
              selectedPaymentMethod === 'crypto' &&
                styles.paymentRadioActive,
            ]}
          >
            {selectedPaymentMethod === 'crypto' && (
              <View style={styles.paymentRadioDot} />
            )}
          </View>
        </TouchableOpacity>

      </View>

      {/* Payment Security Note */}
      <View style={styles.paymentSecurityRow}>
        <MaterialCommunityIcons
          name="shield-check"
          size={12}
          color="#059669"
        />

        <Text style={styles.paymentSecurityText}>
          Instant Activation Upon Payment
        </Text>
      </View>

      {/* PAY NOW BUTTON */}
      <TouchableOpacity
        style={styles.payNowButton}
        activeOpacity={0.85}
        onPress={() => {
          if (selectedPaymentMethod === 'wallet') {
            setFeedback({
              title: 'Confirm Payment',
              message: `Pay ₦${totalInNaira} from your wallet?`,
              tone: 'info',
            });
          } else {
            setFeedback({
              title: 'Payment Method',
              message: `You selected ${selectedPaymentMethod}. Connect your payment provider here.`,
              tone: 'info',
            });
          }
        }}
      >
        <Text style={styles.payNowButtonText}>
          Pay ₦{totalInNaira} Now
        </Text>
      </TouchableOpacity>

    </Animated.View>
  </View>
</Modal>
    <FeedbackModal
      visible={feedback !== null}
      title={feedback?.title ?? ''}
      message={feedback?.message ?? ''}
      tone={feedback?.tone}
      onClose={() => setFeedback(null)}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFCFB',
  },
  container: {
    flexGrow: 1,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },

  /* Progress Bar */
  progressTrack: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#10B981',
    borderRadius: 2,
  },

  /* Step Labels */
  stepLabel: {
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  /* Step 1 Type Selection */
  stepRow: {
    flexDirection: 'row',
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  typeCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  typeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconContainerActive: {
    backgroundColor: '#10B981',
  },
  typeIconContainerInactive: {
    backgroundColor: '#F1F5F9',
  },
  typeTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  typeSubtitle: {
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },

  /* Virtual Card Component */
  virtualCard: {
    justifyContent: 'space-between',
    shadowColor: '#042017',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardNicknameText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  previewDot: {
    backgroundColor: '#34D399',
    marginRight: 4,
  },
  previewBadgeText: {
    fontWeight: '700',
    color: '#A7F3D0',
  },
  cardBrandText: {
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },

  /* EMV Chip & Number */
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emvChip: {
    backgroundColor: '#D97706',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  cardNumberMask: {
    color: '#FFFFFF',
    fontWeight: '800',
    opacity: 0.9,
  },

  /* Card Footer Details */
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetailCol: {},
  cardDetailLabel: {
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardDetailValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 1,
  },
  cardLogoCircles: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  circleLeft: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  circleRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: -8,
  },

  /* Palette Selector */
  colorSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorThemeLabel: {
    fontWeight: '700',
    color: '#0F172A',
  },
  paletteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatchOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#10B981',
  },
  colorSwatchInner: {},

  /* Card Nickname Input */
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputFieldLabel: {
    fontWeight: '600',
    color: '#64748B',
  },
  inputFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontWeight: '800',
    color: '#0F172A',
    padding: 0,
  },

  /* Step 3 Initial Funding */
  fundingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundingCardLabel: {
    fontWeight: '600',
    color: '#64748B',
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  currencySymbol: {
    fontWeight: '900',
    color: '#0F172A',
  },
  formattedAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountMainText: {
    fontWeight: '900',
    color: '#0F172A',
  },
  amountCentsText: {
    fontWeight: '700',
    color: '#64748B',
  },
  amountInputText: {
    fontWeight: '900',
    color: '#0F172A',
    padding: 0,
    marginLeft: 2,
    minWidth: 60,
  },

  /* Preset Pills */
  presetsGrid: {
    flexDirection: 'row',
  },
  presetPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  presetPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  presetPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  presetPillText: {
    fontWeight: '800',
  },
  presetPillTextActive: {
    color: '#FFFFFF',
  },
  presetPillTextInactive: {
    color: '#0F172A',
  },

  /* Rate & Fee Breakdown Banner */
  summaryBanner: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryMetaText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  totalPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  totalPayLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  totalPayValue: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  liveBadge: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadgeText: {
    fontWeight: '900',
    color: '#0F172A',
  },

  /* Primary Action Button */
  submitButton: {
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },



  /* ========================================= */
/* PAYMENT SLIDE-UP MODAL */
/* ========================================= */

paymentModalRoot: {
  flex: 1,
  justifyContent: 'flex-end',
},

paymentOverlay: {
  ...StyleSheet.absoluteFill,
  backgroundColor: '#000000',
},

paymentSheet: {
  backgroundColor: '#F8FAFC',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  maxHeight: '92%',
},

paymentDragHandle: {
  width: 38,
  height: 4,
  borderRadius: 10,
  backgroundColor: '#CBD5E1',
  alignSelf: 'center',
  marginBottom: 14,
},

/* Header */

paymentHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
},

paymentHeaderTitle: {
  fontFamily: 'Poppins',
  fontSize: 13,
  fontWeight: '800',
  color: '#0F172A',
},

paymentCloseButton: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#E2E8F0',
  alignItems: 'center',
  justifyContent: 'center',
},

/* Summary */

paymentSummaryCard: {
  backgroundColor: '#0F172A',
  borderRadius: 10,
  paddingHorizontal: 10,
  paddingVertical: 10,
  marginBottom: 10,
},

paymentSummaryRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 6,
},

paymentSummaryLabel: {
  fontFamily: 'Poppins',
  fontSize: 9,
  fontWeight: '500',
  color: '#FFFFFF',
},

paymentSummaryValue: {
  fontFamily: 'Poppins',
  fontSize: 10,
  fontWeight: '800',
  color: '#FFFFFF',
},

paymentSummaryDivider: {
  height: 1,
  backgroundColor: '#334155',
  marginVertical: 6,
},

paymentTotalRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

paymentTotalLabel: {
  fontFamily: 'Poppins',
  fontSize: 9,
  fontWeight: '500',
  color: '#CBD5E1',
},

paymentTotalValue: {
  fontFamily: 'Poppins',
  fontSize: 15,
  fontWeight: '900',
  color: '#FFFFFF',
},

/* Pay With */

payWithLabel: {
  fontFamily: 'Poppins',
  fontSize: 9,
  fontWeight: '800',
  color: '#64748B',
  marginBottom: 6,
  letterSpacing: 0.3,
},

/* Payment Methods */

paymentMethodsContainer: {
  gap: 6,
},

paymentMethodCard: {
  minHeight: 54,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderRadius: 9,
  paddingHorizontal: 8,
  paddingVertical: 7,
},

paymentMethodCardActive: {
  borderColor: '#10B981',
  backgroundColor: '#F0FDF4',
},

paymentMethodIcon: {
  width: 30,
  height: 30,
  borderRadius: 8,
  backgroundColor: '#F1F5F9',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 8,
},

paymentMethodIconActive: {
  backgroundColor: '#10B981',
},

paymentMethodDetails: {
  flex: 1,
  minWidth: 0,
},

paymentMethodTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},

paymentMethodTitle: {
  fontFamily: 'Poppins',
  fontSize: 10,
  fontWeight: '800',
  color: '#0F172A',
},

paymentMethodSubtitle: {
  fontFamily: 'Poppins',
  fontSize: 8,
  fontWeight: '500',
  color: '#64748B',
  marginTop: 2,
},

instantBadge: {
  backgroundColor: '#D1FAE5',
  paddingHorizontal: 5,
  paddingVertical: 2,
  borderRadius: 4,
},

instantBadgeText: {
  fontFamily: 'Poppins',
  fontSize: 7,
  fontWeight: '800',
  color: '#059669',
},

paymentMethodRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginLeft: 4,
},

copyAccountButton: {
  paddingHorizontal: 5,
  paddingVertical: 4,
  borderWidth: 1,
  borderColor: '#10B981',
  borderRadius: 5,
},

copyAccountText: {
  fontFamily: 'Poppins',
  fontSize: 7,
  fontWeight: '800',
  color: '#059669',
},

/* Radio Buttons */

paymentRadio: {
  width: 12,
  height: 12,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#CBD5E1',
  alignItems: 'center',
  justifyContent: 'center',
},

paymentRadioActive: {
  borderColor: '#10B981',
},

paymentRadioDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: '#10B981',
},

/* Security Notice */

paymentSecurityRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  marginTop: 10,
  marginBottom: 6,
},

paymentSecurityText: {
  fontFamily: 'Poppins',
  fontSize: 8,
  fontWeight: '700',
  color: '#059669',
},

/* Pay Now */

payNowButton: {
  height: 42,
  borderRadius: 8,
  backgroundColor: '#10B981',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#10B981',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 4,
},

payNowButtonText: {
  fontFamily: 'Poppins',
  fontSize: 11,
  fontWeight: '900',
  color: '#FFFFFF',
},
});