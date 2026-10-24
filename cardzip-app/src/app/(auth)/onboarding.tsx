import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  FadeOutLeft,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const slides = [
  {
    eyebrow: 'TRADE WITH CONFIDENCE',
    title: 'Turn gift cards into money.',
    description: 'Trade your gift cards in a few simple steps and track every payout right from your wallet.',
    icon: 'gift-outline',
    iconColor: '#059669',
    accent: '#10B981',
    symbol: '↗',
    badge: 'Fast, simple payouts',
  },
  {
    eyebrow: 'MONEY, MADE SIMPLE',
    title: 'Your wallet, all in one place.',
    description: 'Keep an eye on your balance, manage payments, and stay in control of your money.',
    icon: 'wallet-outline',
    iconColor: '#059669',
    accent: '#10B981',
    symbol: '₦',
    badge: 'Your money at a glance',
  },
  {
    eyebrow: 'MORE TO DISCOVER',
    title: 'A little more life in every day.',
    description: 'Shop useful essentials and explore digital services, all from one secure Cardzip account.',
    icon: 'shopping-outline',
    iconColor: '#059669',
    accent: '#10B981',
    symbol: '✦',
    badge: 'One app. More possibilities.',
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const floatProgress = useSharedValue(0);
  const currentSlide = slides[activeIndex];

  useEffect(() => {
    floatProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [floatProgress]);

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatProgress.value, [0, 1], [0, -9]) },
      { rotate: `${interpolate(floatProgress.value, [0, 1], [-1.5, 1.5])}deg` },
    ],
  }));

  const goToLogin = () => router.replace('/(auth)/login');
  const advance = () => {
    if (activeIndex === slides.length - 1) {
      router.replace('/(auth)/register');
      return;
    }
    setActiveIndex((index) => index + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Image source={require('../../../assets/images/logo.jpg')} style={styles.brandMark} />
          </View>
          <Pressable onPress={goToLogin} hitSlop={12} accessibilityRole="button">
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={[styles.content, { maxWidth: Math.min(width - 40, 520) }]}>
          <Animated.View key={`art-${activeIndex}`} entering={FadeIn.duration(400)} style={styles.artwork}>
            <View style={[styles.artGlow, { backgroundColor: `${currentSlide.accent}20` }]} />
            <Animated.View style={[styles.artCard, illustrationStyle]}>
              <View style={[styles.artIcon, { backgroundColor: `${currentSlide.accent}18` }]}>
                <MaterialCommunityIcons name={currentSlide.icon} size={58} color={currentSlide.iconColor} />
              </View>
              <View style={styles.artBottomRow}>
                <View>
                  <View style={styles.artLineLong} />
                  <View style={styles.artLineShort} />
                </View>
                <View style={[styles.artSymbol, { backgroundColor: currentSlide.accent }]}>
                  <Text style={styles.artSymbolText}>{currentSlide.symbol}</Text>
                </View>
              </View>
            </Animated.View>
            <Animated.View entering={FadeInRight.delay(180).duration(420)} style={styles.artBadge}>
              <View style={[styles.badgeDot, { backgroundColor: currentSlide.accent }]} />
              <Text style={styles.artBadgeText}>{currentSlide.badge}</Text>
            </Animated.View>
            <View style={[styles.orbitDot, styles.orbitDotOne, { backgroundColor: currentSlide.accent }]} />
            <View style={[styles.orbitDot, styles.orbitDotTwo, { backgroundColor: currentSlide.accent }]} />
          </Animated.View>

          <Animated.View key={`copy-${activeIndex}`} entering={FadeInRight.duration(380)} exiting={FadeOutLeft.duration(180)} style={styles.copy}>
            <Text style={[styles.eyebrow, { color: currentSlide.accent }]}>{currentSlide.eyebrow}</Text>
            <Text style={styles.title}>{currentSlide.title}</Text>
            <Text style={styles.description}>{currentSlide.description}</Text>
          </Animated.View>

          <View style={styles.pagination} accessibilityLabel={`Page ${activeIndex + 1} of ${slides.length}`}>
            {slides.map((slide, index) => (
              <Pressable
                key={slide.eyebrow}
                onPress={() => setActiveIndex(index)}
                accessibilityRole="button"
                accessibilityLabel={`Go to introduction page ${index + 1}`}
                style={[styles.paginationDot, index === activeIndex && { backgroundColor: currentSlide.accent, width: 25 }]}
              />
            ))}
          </View>

          <Pressable style={[styles.primaryButton, { backgroundColor: currentSlide.accent }]} onPress={advance} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>{activeIndex === slides.length - 1 ? 'Create your account' : 'Continue'}</Text>
            <Feather name={activeIndex === slides.length - 1 ? 'arrow-up-right' : 'arrow-right'} size={18} color="#FFFFFF" />
          </Pressable>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account?</Text>
            <Pressable onPress={goToLogin} hitSlop={8} accessibilityRole="button">
              <Text style={styles.loginLink}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topBar: {
    width: '100%',
    maxWidth: 520,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  skipText: {
    paddingVertical: 8,
    color: '#64748B',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 18,
  },
  artwork: {
    height: 290,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  artGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  artCard: {
    width: 230,
    height: 220,
    justifyContent: 'space-between',
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  artIcon: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  artBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  artLineLong: {
    width: 104,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  artLineShort: {
    width: 68,
    height: 6,
    marginTop: 8,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  artSymbol: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  artSymbolText: {
    color: '#09150F',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '900',
  },
  artBadge: {
    position: 'absolute',
    right: 4,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  artBadgeText: {
    color: '#334155',
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '700',
  },
  orbitDot: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.85,
  },
  orbitDotOne: {
    top: 37,
    right: '17%',
    width: 12,
    height: 12,
  },
  orbitDotTwo: {
    bottom: 53,
    left: '16%',
    width: 8,
    height: 8,
    opacity: 0.5,
  },
  copy: {
    alignItems: 'center',
  },
  eyebrow: {
    marginBottom: 12,
    fontFamily: 'Poppins',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    maxWidth: 390,
    color: '#111827',
    fontFamily: 'Poppins',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 39,
    textAlign: 'center',
  },
  description: {
    maxWidth: 390,
    marginTop: 12,
    color: '#64748B',
    fontFamily: 'Poppins',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 25,
    marginBottom: 24,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  primaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '800',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 19,
  },
  loginPromptText: {
    color: '#64748B',
    fontFamily: 'Poppins',
    fontSize: 13,
  },
  loginLink: {
    color: '#059669',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '700',
  },
});
