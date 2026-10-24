import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator,
  Image,
Modal,
PanResponder,
Pressable,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchGiftCards, submitGiftCardTrade } from '../../../store/slices/giftCardSlice';
import { getGiftCardLogoUrls } from '../../../utils/giftCardLogos';
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
  const cardCarouselInterval = width * 0.58 + scale(12);

  // Slider State
  const minVal = 10;
  const maxVal = 500;
  const [usdAmount, setUsdAmount] = useState<number>(200);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [cardPickerVisible, setCardPickerVisible] = useState(false);
  const [failedCardLogos, setFailedCardLogos] = useState<Set<string>>(() => new Set());
  const [tradeSpeed, setTradeSpeed] = useState<'fast' | 'slow'>(params.tradeSpeed === 'slow' ? 'slow' : 'fast');
  const [pickedImages, setPickedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'success' | 'error' | 'info' } | null>(null);
  const sliderViewRef = useRef<View>(null);
  const cardCarouselRef = useRef<ScrollView>(null);
  const selectedCard = catalog[activeCardIndex]
    ?? catalog.find((card) => card.id === params.cardId || card.name === params.cardName);
  const selectedRate = selectedCard?.types[0];

  useEffect(() => {
    if (catalog.length === 0 && !catalogLoading) dispatch(fetchGiftCards({ page: 1 }));
  }, [catalog.length, catalogLoading, dispatch]);

  useEffect(() => {
    const selectedIndex = catalog.findIndex((card) => card.id === params.cardId || card.name === params.cardName);
    if (selectedIndex >= 0) {
      setActiveCardIndex(selectedIndex);
      requestAnimationFrame(() => {
        cardCarouselRef.current?.scrollTo({
          x: selectedIndex * cardCarouselInterval,
          animated: false,
        });
      });
    }
  }, [cardCarouselInterval, catalog, params.cardId, params.cardName]);

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
        const normalizedImages = await Promise.all(result.assets.map(async (asset, index) => {
          const resize = asset.width >= asset.height
            ? { width: Math.min(asset.width, 2000) }
            : { height: Math.min(asset.height, 2000) };
          const normalized = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
          );
          const originalName = asset.fileName?.replace(/\.[^.]+$/, '') || `gift-card-${index + 1}`;
          return {
            ...asset,
            uri: normalized.uri,
            fileName: `${originalName}.jpg`,
            mimeType: 'image/jpeg',
            width: normalized.width,
            height: normalized.height,
          };
        }));
        setPickedImages((current) => [...current, ...normalizedImages].slice(0, 5));
      }
    } catch (error) {
      setFeedback({
        title: 'Photo processing failed',
        message: error instanceof Error ? error.message : 'Could not prepare the selected photos for upload.',
        tone: 'error',
      });
    }
  };

  const renderCardLogo = (card: (typeof catalog)[number]) => {
    const logoUri = [...new Set([card.logo, ...getGiftCardLogoUrls(card.name)].filter(Boolean))]
      .find((url) => !failedCardLogos.has(`${card.id}:${url}`));
    if (logoUri) {
      return (
        <Image
          source={{ uri: logoUri }}
          style={styles.tradeLogoImage}
          resizeMode="contain"
          onError={() => {
            setFailedCardLogos((current) => new Set(current).add(`${card.id}:${logoUri}`));
          }}
        />
      );
    }
    const brand = card.name.toLowerCase();
    if (brand.includes('amazon')) return <FontAwesome5 name="amazon" size={scale(22)} color="#FF9900" />;
    if (brand.includes('itunes')) return <FontAwesome5 name="itunes" size={scale(22)} color="#FFFFFF" />;
    if (brand.includes('apple')) return <FontAwesome5 name="apple" size={scale(22)} color="#FFFFFF" />;
    if (brand.includes('steam')) return <Ionicons name="logo-steam" size={scale(22)} color="#FFFFFF" />;
    if (brand.includes('foot locker') || brand.includes('footlocker')) return <FontAwesome5 name="shoe-prints" size={scale(20)} color="#E31837" />;
    if (brand.includes('goldrazer') || brand.includes('goldrazor') || brand.includes('gold razor')) return <FontAwesome5 name="coins" size={scale(20)} color="#F4C542" />;
    if (brand.includes('xbox')) return <FontAwesome5 name="xbox" size={scale(22)} color="#107C10" />;
    if (brand.includes('google')) return <Text style={[styles.cardFallbackLogo, styles.googleFallbackLogo]}>G</Text>;
    if (brand.includes('roblox')) return <Text style={[styles.cardFallbackLogo, styles.robloxFallbackLogo]}>R</Text>;
    if (brand.includes('playstation') || brand.includes('psn')) return <FontAwesome5 name="playstation" size={scale(22)} color="#FFFFFF" />;
    if (brand.includes('spotify')) return <FontAwesome5 name="spotify" size={scale(22)} color="#1ED760" />;
    if (brand.includes('nintendo')) return <MaterialCommunityIcons name="nintendo-switch" size={scale(24)} color="#E60012" />;
    if (brand.includes('sephora')) return <Text style={[styles.sephoraIcon, { color: '#111827' }]}>S</Text>;
    const initials = card.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    return <Text style={styles.cardFallbackLogo}>{initials || '?'}</Text>;
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

        <View style={[styles.cardPickerSection, { marginBottom: verticalScale(16) }]}>
          <Text style={[styles.cardPickerLabel, { fontSize: scale(14) }]}>Gift card to sell</Text>
          {catalogLoading && catalog.length === 0 ? (
            <ActivityIndicator color="#00B856" />
          ) : catalog.length === 0 ? (
            <Text style={styles.emptyText}>No gift cards are available.</Text>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Selected gift card: ${selectedCard?.name ?? 'None'}. Tap to choose a gift card.`}
              activeOpacity={0.8}
              onPress={() => setCardPickerVisible(true)}
              style={[styles.cardPickerButton, { minHeight: scale(78), padding: scale(14), borderRadius: scale(14) }]}
            >
              <View style={[styles.cardPickerLogo, { backgroundColor: selectedCard?.color ?? '#E9EFEB' }]}>
                {selectedCard ? renderCardLogo(selectedCard) : null}
              </View>
              <View style={styles.cardPickerCopy}>
                <Text style={[styles.cardPickerName, { fontSize: scale(15) }]}>
                  {selectedCard?.name ?? 'Choose a gift card'}
                </Text>
                <Text style={[styles.cardPickerRate, { fontSize: scale(12) }]}>
                  {selectedRate
                    ? `Rate: 1 ${selectedRate.currency} = ₦${selectedRate.rate.toLocaleString()}`
                    : 'Rate unavailable'}
                </Text>
              </View>
              <Feather name="chevron-down" size={scale(20)} color="#52615A" />
            </TouchableOpacity>
          )}
          <Text style={[styles.cardPickerHint, { fontSize: scale(11) }]}>Tap to choose the gift card you want to trade.</Text>
        </View>

        {catalog.length > 0 && (
          <View style={[styles.carouselSection, { marginBottom: verticalScale(12) }]}>
            <Text style={[styles.carouselHint, { fontSize: scale(11) }]}>Or swipe through the cards and tap one to select it.</Text>
            <ScrollView
              ref={cardCarouselRef}
              horizontal
              snapToInterval={cardCarouselInterval}
              decelerationRate="fast"
              disableIntervalMomentum
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const slide = Math.round(event.nativeEvent.contentOffset.x / cardCarouselInterval);
                if (slide !== activeCardIndex && slide >= 0 && slide < catalog.length) setActiveCardIndex(slide);
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ gap: scale(12) }}
            >
              {catalog.map((card, index) => (
                <TouchableOpacity
                  key={card.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: index === activeCardIndex }}
                  activeOpacity={0.85}
                  onPress={() => {
                    setActiveCardIndex(index);
                    cardCarouselRef.current?.scrollTo({
                      x: index * cardCarouselInterval,
                      animated: true,
                    });
                  }}
                >
                  <LinearGradient
                    colors={[card.color, '#1C1E21', '#121315']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.cardItem,
                      index === activeCardIndex && styles.cardItemSelected,
                      { width: width * 0.58, height: verticalScale(105), borderRadius: scale(16), padding: scale(14) },
                    ]}
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
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.carouselPosition, { fontSize: scale(10) }]}>
              {activeCardIndex + 1} of {catalog.length} cards
            </Text>
          </View>
        )}

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
      <Modal
        visible={cardPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCardPickerVisible(false)}
      >
        <View style={styles.cardPickerModalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close gift card selection"
            style={styles.cardPickerBackdrop}
            onPress={() => setCardPickerVisible(false)}
          />
          <View style={[styles.cardPickerModal, { maxHeight: height * 0.78 }]}>
            <View style={styles.cardPickerModalHeader}>
              <View>
                <Text style={[styles.cardPickerModalTitle, { fontSize: scale(18) }]}>Choose a gift card</Text>
                <Text style={[styles.cardPickerHint, { fontSize: scale(12) }]}>Select the card you want to sell.</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close gift card selection"
                onPress={() => setCardPickerVisible(false)}
                style={styles.cardPickerClose}
              >
                <Feather name="x" size={scale(20)} color="#52615A" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {catalog.map((card, index) => {
                const rate = card.types[0];
                const isSelected = index === activeCardIndex;
                return (
                  <TouchableOpacity
                    key={card.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    activeOpacity={0.75}
                    onPress={() => {
                      setActiveCardIndex(index);
                      setCardPickerVisible(false);
                      cardCarouselRef.current?.scrollTo({
                        x: index * cardCarouselInterval,
                        animated: true,
                      });
                    }}
                    style={[styles.cardPickerOption, isSelected && styles.cardPickerOptionSelected]}
                  >
                    <View style={[styles.cardPickerLogo, { backgroundColor: card.color }]}>
                      {renderCardLogo(card)}
                    </View>
                    <View style={styles.cardPickerCopy}>
                      <Text style={[styles.cardPickerName, { fontSize: scale(14) }]}>{card.name}</Text>
                      <Text style={[styles.cardPickerRate, { fontSize: scale(12) }]}>
                        {rate ? `1 ${rate.currency} = ₦${rate.rate.toLocaleString()}` : 'Rate unavailable'}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={scale(20)} color="#00B856" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
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
    fontFamily: 'Poppins',
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

  cardPickerSection: {
    gap: 8,
  },
  cardPickerLabel: {
    color: '#12201B',
    fontWeight: '800',
  },
  cardPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2DC',
  },
  cardPickerLogo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardPickerCopy: {
    flex: 1,
    gap: 4,
  },
  cardPickerName: {
    color: '#12201B',
    fontWeight: '800',
  },
  cardPickerRate: {
    color: '#52615A',
    fontWeight: '600',
  },
  cardPickerHint: {
    color: '#82918B',
    fontWeight: '500',
  },
  cardPickerModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardPickerBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cardPickerModal: {
    backgroundColor: '#F4F6F5',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  cardPickerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardPickerModalTitle: {
    color: '#12201B',
    fontWeight: '900',
    marginBottom: 4,
  },
  cardPickerClose: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
  },
  cardPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  cardPickerOptionSelected: {
    borderColor: '#00B856',
    backgroundColor: '#F0FDF4',
  },
  carouselSection: {
    gap: 8,
  },
  carouselHint: {
    color: '#52615A',
    fontWeight: '600',
  },
  carouselPosition: {
    color: '#82918B',
    textAlign: 'right',
    fontWeight: '600',
  },
  cardItem: {
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardItemSelected: {
    borderColor: '#B3F05C',
  },
  cardBrandLogo: {
    fontWeight: '900',
  },
  cardFallbackLogo: {
    fontFamily: 'Poppins',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  googleFallbackLogo: {
    color: '#4285F4',
    fontFamily: 'Poppins',
    fontSize: 22,
  },
  robloxFallbackLogo: {
    color: '#E2231A',
    fontFamily: 'Poppins',
    fontSize: 24,
  },
  sephoraIcon: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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