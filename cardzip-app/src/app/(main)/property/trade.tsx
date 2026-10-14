import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  PanResponder,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchGiftCards, submitGiftCardTrade } from '../../store/slices/giftCardSlice';
import FeedbackModal from '../components/FeedbackModal';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';

export default function TradeCardsScreen() {
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{ cardId?: string; cardName?: string; tradeSpeed?: string }>();
  const dispatch = useAppDispatch();
  const { catalog, catalogLoading, submittingTrade } = useAppSelector((state) => state.giftCards);
  const token = useAppSelector((state) => state.auth.token);

  // Dynamic scaling factors relative to standard 375x812 mobile screen
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;

  // Slider State
  const minVal = 10;
  const maxVal = 500;
  const [usdAmount, setUsdAmount] = useState<number>(200);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [tradeSpeed, setTradeSpeed] = useState<'fast' | 'slow'>(params.tradeSpeed === 'slow' ? 'slow' : 'fast');
  const [pickedImages, setPickedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'success' | 'error' | 'info' } | null>(null);
  const sliderViewRef = useRef<View>(null);
  const selectedCard = catalog[activeCardIndex]
    ?? catalog.find((card) => card.id === params.cardId || card.name === params.cardName);
  const selectedRate = selectedCard?.types[0];

  useEffect(() => {
    if (catalog.length === 0 && !catalogLoading) dispatch(fetchGiftCards({ page: 1 }));
  }, [catalog.length, catalogLoading, dispatch]);

  useEffect(() => {
    const selectedIndex = catalog.findIndex((card) => card.id === params.cardId || card.name === params.cardName);
    if (selectedIndex >= 0) setActiveCardIndex(selectedIndex);
  }, [catalog, params.cardId, params.cardName]);

  useEffect(() => {
    if (params.tradeSpeed === 'fast' || params.tradeSpeed === 'slow') setTradeSpeed(params.tradeSpeed);
  }, [params.tradeSpeed]);

  const ratePerDollar = selectedRate?.rate ?? 0;
  const calculatedNaira = usdAmount * ratePerDollar;

  // Calculate percentage filled for the gradient slider track
  const sliderPercentage = Math.min(
    Math.max(((usdAmount - minVal) / (maxVal - minVal)) * 100, 0),
    100
  );
  const sliderWidth = useRef(0);
  const sliderLeft = useRef(0);
  const updateAmountFromPosition = (positionX: number) => {
    if (sliderWidth.current <= 0) return;
    const progress = Math.max(0, Math.min(1, positionX / sliderWidth.current));
    setUsdAmount(Math.round(minVal + progress * (maxVal - minVal)));
  };
  const sliderResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: (_, gesture) => updateAmountFromPosition(gesture.x0 - sliderLeft.current),
    onPanResponderMove: (_, gesture) => updateAmountFromPosition(gesture.moveX - sliderLeft.current),
  })).current;

  const handleSubmitTrade = async () => {
    if (!selectedCard || !selectedRate) {
      setFeedback({ title: 'Gift card unavailable', message: 'Select a gift card with an active rate first.', tone: 'error' });
      return;
    }
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
      setFeedback({ title: 'Invalid amount', message: 'Enter a card value greater than zero.', tone: 'error' });
      return;
    }
    if (!token) {
      setFeedback({ title: 'Sign in required', message: 'Sign in before submitting a gift card trade.', tone: 'error' });
      return;
    }

    try {
      await dispatch(submitGiftCardTrade({
        type: selectedCard.name,
        amount: usdAmount,
        currency: selectedRate.currency,
        token,
        catalogCardId: selectedCard.id,
        region: selectedRate.country,
        ngnAmount: calculatedNaira,
        exchangeRate: selectedRate.rate,
        tradeSpeed,
        images: pickedImages.map((image) => ({
          uri: image.uri,
          fileName: image.fileName,
          mimeType: image.mimeType,
        })),
      })).unwrap();
      setPickedImages([]);
      setFeedback({ title: 'Trade submitted', message: 'Your gift card trade has been submitted for review.', tone: 'success' });
    } catch (error) {
      setFeedback({ title: 'Trade failed', message: String(error || 'Could not submit this gift card trade.'), tone: 'error' });
    }
  };

  const pickGiftCardImages = async () => {
    if (pickedImages.length >= 5) {
      setFeedback({ title: 'Image limit reached', message: 'You can attach up to 5 images.', tone: 'info' });
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5 - pickedImages.length,
        quality: 0.85,
      });
      if (!result.canceled) {
        setPickedImages((current) => [...current, ...result.assets].slice(0, 5));
      }
    } catch {
      setFeedback({ title: 'Photo library unavailable', message: 'Could not open your photo library.', tone: 'error' });
    }
  };

  const renderCardLogo = (card: (typeof catalog)[number]) => {
    if (card.logo) return <Image source={{ uri: card.logo }} style={styles.tradeLogoImage} resizeMode="contain" />;
    const brand = card.name.toLowerCase();
    if (brand.includes('amazon')) return <FontAwesome5 name="amazon" size={scale(22)} color={card.color} />;
    if (brand.includes('itunes')) return <FontAwesome5 name="itunes" size={scale(22)} color="#FFFFFF" />;
    if (brand.includes('apple')) return <FontAwesome5 name="apple" size={scale(22)} color="#FFFFFF" />;
    if (brand.includes('steam')) return <Ionicons name="logo-steam" size={scale(22)} color={card.color} />;
    if (brand.includes('foot locker') || brand.includes('footlocker')) return <FontAwesome5 name="shoe-prints" size={scale(20)} color="#E31837" />;
    if (brand.includes('goldrazer')) return <FontAwesome5 name="coins" size={scale(20)} color="#D4AF37" />;
    if (brand.includes('xbox')) return <FontAwesome5 name="xbox" size={scale(22)} color="#107C10" />;
    if (brand.includes('sephora')) return <Text style={[styles.sephoraIcon, { color: card.color }]}>S</Text>;
    return <MaterialCommunityIcons name="gift-outline" size={scale(22)} color={card.color} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F5" />
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: scale(16), paddingTop: Platform.OS === 'android' ? verticalScale(12) : 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={[styles.headerRow, { marginBottom: verticalScale(16) }]}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.back()}>
            <Feather name="chevron-left" size={scale(22)} color="#12201B" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>Trade Cards</Text>
          <View style={styles.liveRateBadge}>
            <View style={styles.greenDot} />
            <Text style={[styles.liveRateText, { fontSize: scale(11) }]}>Live rates</Text>
          </View>
        </View>

        <View style={styles.tradeSpeedControl}>
          {(['fast', 'slow'] as const).map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[styles.tradeSpeedOption, tradeSpeed === speed && styles.tradeSpeedOptionSelected]}
              onPress={() => setTradeSpeed(speed)}
            >
              <Text style={[styles.tradeSpeedText, tradeSpeed === speed && styles.tradeSpeedTextSelected]}>
                {speed === 'fast' ? 'Fast trade' : 'Slow trade'}
              </Text>
              {tradeSpeed === speed && <Ionicons name="checkmark-circle" size={scale(15)} color="#00B856" />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const slide = Math.round(event.nativeEvent.contentOffset.x / (width * 0.7));
            if (slide !== activeCardIndex && slide < catalog.length) setActiveCardIndex(slide);
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{ gap: scale(12) }}
        >
          {catalog.map((card) => (
            <LinearGradient
              key={card.id}
              colors={[card.color, '#1C1E21', '#121315']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cardItem, { width: width * 0.58, height: verticalScale(105), borderRadius: scale(16), padding: scale(14) }]}
            >
              {renderCardLogo(card)}
              <View>
                <Text style={[styles.cardTitle, { fontSize: scale(12) }]}>
                  {card.name} · {card.types[0] ? `1 ${card.types[0].currency} = ₦${card.types[0].rate.toLocaleString()}` : 'Rate unavailable'}
                </Text>
                {card.popular && (
                  <View style={styles.hotBadge}>
                    <Text style={[styles.hotBadgeText, { fontSize: scale(10) }]}>POPULAR</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          ))}
          {catalogLoading && catalog.length === 0 && <ActivityIndicator color="#00B856" />}
          {!catalogLoading && catalog.length === 0 && <Text style={styles.emptyText}>No gift cards are available.</Text>}
        </ScrollView>

        <View style={[styles.paginationRow, { marginVertical: verticalScale(12) }]}>
          {catalog.map((card, index) => (
            <View key={card.id} style={[styles.paginationDot, index === activeCardIndex ? styles.activeDot : styles.inactiveDot]} />
          ))}
        </View>

        {/* Rate Calculator Section */}
        <View style={[styles.calculatorCard, { borderRadius: scale(20), padding: scale(16) }]}>
          <View style={styles.calcHeader}>
            <Text style={[styles.calcTitle, { fontSize: scale(15) }]}>Rate Calculator</Text>
            <View style={styles.tagBadge}>
              <Text style={[styles.tagText, { fontSize: scale(11) }]}>{selectedCard ? `${selectedCard.name} · ${selectedCard.category}` : 'Select a gift card'}</Text>
            </View>
          </View>

          {/* Amount Display / Input Box */}
          <View style={[styles.amountInputBox, { height: scale(48), borderRadius: scale(12), marginVertical: verticalScale(14) }]}>
            <Text style={[styles.inputLabel, { fontSize: scale(12) }]}>Card value (USD)</Text>
            <View style={styles.currencyRow}>
              <Text style={[styles.dollarSymbol, { fontSize: scale(18) }]}>$</Text>
              <TextInput
                value={String(usdAmount)}
                onChangeText={(val) => {
                  const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
                  setUsdAmount(isNaN(parsed) ? 0 : parsed);
                }}
                keyboardType="numeric"
                style={[styles.numericInput, { fontSize: scale(18) }]}
              />
            </View>
          </View>

          {/* Range Labels */}
          <View style={styles.rangeLabelsRow}>
            <Text style={[styles.rangeText, { fontSize: scale(11) }]}>${minVal}</Text>
            <Text style={[styles.rangeText, { fontSize: scale(11) }]}>${maxVal}</Text>
          </View>

          {/* Custom Responsive Gradient Slider */}
          <View
            ref={sliderViewRef}
            style={[styles.sliderTrackContainer, { marginVertical: verticalScale(10) }]}
            onLayout={(event) => {
              sliderWidth.current = event.nativeEvent.layout.width;
              sliderViewRef.current?.measureInWindow((left) => { sliderLeft.current = left; });
            }}
            accessibilityRole="adjustable"
            accessibilityValue={{ min: minVal, max: maxVal, now: usdAmount }}
            {...sliderResponder.panHandlers}
          >
            {/* Background Grey Track */}
            <View style={styles.sliderBackgroundTrack} />

            {/* Active Gradient Filled Track */}
            <LinearGradient
              colors={['#2563EB', '#00B856']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.sliderGradientTrack, { width: `${sliderPercentage}%` }]}
            />

            {/* Thumb Indicator with Outer Glow */}
            <View
              pointerEvents="none"
              style={[
                styles.sliderThumb,
                styles.thumbGlow,
                { left: `${Math.min(Math.max(sliderPercentage, 2), 96)}%` },
              ]}
            />
          </View>

          {/* Output Card */}
          <View style={[styles.outputBanner, { borderRadius: scale(14), padding: scale(14), marginTop: verticalScale(8) }]}>
            <View>
              <Text style={[styles.outputLabel, { fontSize: scale(11) }]}>You receive</Text>
              <Text style={[styles.outputNaira, { fontSize: scale(22) }]}>
                {selectedRate ? `₦${calculatedNaira.toLocaleString()}` : 'Rate unavailable'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.rateMetaText, { fontSize: scale(11) }]}>
                {selectedRate ? `Rate ₦${selectedRate.rate.toLocaleString()}/${selectedRate.currency}` : 'No active rate'}
              </Text>
              <Text style={[styles.rateMetaText, { fontSize: scale(11) }]}>Fee ₦0 · Instant</Text>
            </View>
          </View>
        </View>

        {/* Scan / Upload Dashed Box */}
        <View style={[styles.uploadBox, { borderRadius: scale(18), padding: scale(16), marginVertical: verticalScale(14) }]}>
          <View style={styles.uploadIconContainer}>
            <MaterialCommunityIcons name="qrcode-scan" size={scale(22)} color="#00B856" />
          </View>
          <Text style={[styles.uploadTitle, { fontSize: scale(14) }]}>Scan or upload card</Text>
          <Text style={[styles.uploadSubtitle, { fontSize: scale(11), marginBottom: verticalScale(12) }]}>
            JPG, PNG, or WEBP up to 10 MB. Google image check runs when available; otherwise your upload is sent for staff review.
          </Text>

          <View style={styles.uploadBtnRow}>
            <TouchableOpacity
              style={[styles.darkUploadBtn, pickedImages.length >= 5 && styles.disabledUploadButton]}
              activeOpacity={0.8}
              onPress={() => { void pickGiftCardImages(); }}
              disabled={pickedImages.length >= 5}
            >
              <Text style={[styles.darkBtnText, { fontSize: scale(12) }]}>Choose photos</Text>
            </TouchableOpacity>
          </View>
          {pickedImages.length > 0 && (
            <>
              <Text style={[styles.selectedImagesLabel, { fontSize: scale(11), marginTop: verticalScale(10) }]}>
                {pickedImages.length} of 5 photos selected
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagePreviewRow}>
                {pickedImages.map((image, index) => (
                  <TouchableOpacity
                    key={`${image.uri}-${index}`}
                    activeOpacity={0.85}
                    onPress={() => setPickedImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                    accessibilityLabel={`Remove selected photo ${index + 1}`}
                  >
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    <View style={styles.removeImageBadge}><Ionicons name="close" size={scale(12)} color="#FFFFFF" /></View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>

        {/* Bottom Continue Button */}
        <TouchableOpacity
          style={[styles.submitButton, { height: scale(48), borderRadius: scale(24), opacity: submittingTrade || !selectedRate ? 0.65 : 1 }]}
          activeOpacity={0.85}
          disabled={submittingTrade || !selectedRate}
          onPress={() => { void handleSubmitTrade(); }}
        >
          <Text style={[styles.submitBtnText, { fontSize: scale(15) }]}>{submittingTrade ? 'Submitting...' : 'Continue to Sell'}</Text>
          <Ionicons name="arrow-forward" size={scale(18)} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </KeyboardAwareScrollView>
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
    backgroundColor: '#F4F6F5',
  },
  container: {
    paddingBottom: 40,
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
  tradeSpeedControl: {
    flexDirection: 'row',
    backgroundColor: '#E9EFEB',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tradeSpeedOption: {
    flex: 1,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 8,
  },
  tradeSpeedOptionSelected: {
    backgroundColor: '#FFFFFF',
  },
  tradeSpeedText: {
    color: '#52615A',
    fontSize: 12,
    fontWeight: '700',
  },
  tradeSpeedTextSelected: {
    color: '#0F261C',
  },
  liveRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F261C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00B856',
  },
  liveRateText: {
    color: '#00B856',
    fontWeight: '700',
  },

  /* Horizontal Card Slider */
  cardItem: {
    justifyContent: 'space-between',
  },
  cardBrandLogo: {
    fontWeight: '900',
  },
  sephoraIcon: {
    fontSize: 24,
    fontWeight: '900',
  },
  tradeLogoImage: {
    width: 42,
    height: 42,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyText: {
    color: '#82918B',
    fontSize: 13,
    paddingVertical: 12,
  },
  hotBadge: {
    backgroundColor: '#B3F05C',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  hotBadgeText: {
    color: '#0F261C',
    fontWeight: '800',
  },

  /* Pagination */
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: '#00B856',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },

  /* Rate Calculator */
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calcTitle: {
    fontWeight: '800',
    color: '#12201B',
  },
  tagBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#056839',
    fontWeight: '700',
  },

  /* Amount Box */
  amountInputBox: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  inputLabel: {
    color: '#82918B',
    fontWeight: '600',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dollarSymbol: {
    fontWeight: '800',
    color: '#12201B',
  },
  numericInput: {
    fontWeight: '800',
    color: '#12201B',
    marginLeft: 2,
  },

  /* Range Labels */
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: '#82918B',
    fontWeight: '600',
  },

  /* Custom Gradient Slider Track */
  sliderTrackContainer: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderBackgroundTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  sliderGradientTrack: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#00B856',
    top: 1,
    marginLeft: -11,
  },
  thumbGlow: {
    shadowColor: '#00B856',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },

  /* Output Banner */
  outputBanner: {
    backgroundColor: '#0F261C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outputLabel: {
    color: '#A2B3AC',
    fontWeight: '500',
  },
  outputNaira: {
    color: '#B3F05C',
    fontWeight: '900',
  },
  rateMetaText: {
    color: '#A2B3AC',
    fontWeight: '600',
  },

  /* Upload Box */
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    fontWeight: '800',
    color: '#12201B',
  },
  uploadSubtitle: {
    color: '#82918B',
    fontWeight: '500',
  },
  uploadBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  disabledUploadButton: {
    opacity: 0.55,
  },
  selectedImagesLabel: {
    alignSelf: 'flex-start',
    color: '#52615A',
    fontWeight: '700',
  },
  imagePreviewRow: {
    gap: 8,
    paddingTop: 8,
  },
  imagePreview: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  removeImageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkUploadBtn: {
    backgroundColor: '#0F261C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  darkBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  /* Submit Button */
  submitButton: {
    backgroundColor: '#00B856',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00B856',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});