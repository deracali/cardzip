import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from './store';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen() {
  const router = useRouter();
  const { sessionReady, isAuthenticated } = useAppSelector((state) => state.auth);
  const { width } = useWindowDimensions();
  const scale = (size: number) => (width / 375) * size;

  // Animation shared values
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    // 1. Animate Logo Scale and Opacity
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    // 2. Animate Text Fade-In and Slide-Up after short delay
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    const timer = setTimeout(() => {
      router.replace((isAuthenticated ? '/(main)/(tabs)/home' : '/(auth)/login') as any);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router, sessionReady]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Main Brand Animation */}
      <View style={styles.centerContent}>
        <Animated.View style={[styles.logoBadge, logoAnimatedStyle, { width: scale(72), height: scale(72), borderRadius: scale(18) }]}>
          <MaterialCommunityIcons name="home-city" size={scale(40)} color="#FFFFFF" />
        </Animated.View>

        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={[styles.brandTitle, { fontSize: scale(24) }]}>RealtyAI Studio</Text>
          <Text style={[styles.tagline, { fontSize: scale(13) }]}>Intelligent Real Estate Automation</Text>
        </Animated.View>
      </View>

      {/* Footer Indicator */}
      <Animated.View style={[styles.footer, textAnimatedStyle]}>
        <View style={styles.badgeRow}>
          <View style={styles.activeDot} />
          <Text style={[styles.footerText, { fontSize: scale(11) }]}>Powered by AI Engine</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  logoBadge: {
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  footerText: {
    color: '#64748B',
    fontWeight: '600',
  },
});