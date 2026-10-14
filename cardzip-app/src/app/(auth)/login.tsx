import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, googleSignInUser, clearError } from '../store/slices/authSlice';
import FeedbackModal from '../(main)/components/FeedbackModal';
import KeyboardAwareScrollView from '../../components/KeyboardAwareScrollView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage: number): number => Math.round((percentage * SCREEN_WIDTH) / 100);
const hp = (percentage: number): number => Math.round((percentage * SCREEN_HEIGHT) / 100);
const scale = (size: number): number => wp((size / SCREEN_WIDTH) * 100);

const COLORS = {
  bgDark: '#0A111F',
  primaryGreen: '#1DB954',
  inputBg: '#1C2637',
  textMain: '#FFFFFF',
  textMuted: '#A1ACB9',
  border: '#2A3C55',
  errorRed: '#FF4D4D',
  accentYellow: '#FFD166',
};

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'error' | 'info' } | null>(null);

  const handleSignIn = () => {
    if (!email || !password) return;
    dispatch(loginUser({ email, password })).then((result) => {
      if (loginUser.fulfilled.match(result)) {
        router.replace('/(main)/(tabs)/home' as any);
      }
    });
  };

  const handleGoogleSignIn = async () => {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    if (!webClientId) {
      setFeedback({ title: 'Google sign-in unavailable', message: 'Google sign-in is not configured for this app build.', tone: 'error' });
      return;
    }
    setGoogleLoading(true);
    try {
      GoogleSignin.configure({
        webClientId,
        ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ? { iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID } : {}),
      });
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return;
      const idToken = response.data.idToken;
      if (!idToken) throw new Error('Google did not return an identity token. Check the configured OAuth client IDs.');
      const result = await dispatch(googleSignInUser(idToken)).unwrap();
      if (result.token) router.replace('/(main)/(tabs)/home' as any);
    } catch (error) {
      setFeedback({ title: 'Google sign-in failed', message: error instanceof Error ? error.message : 'Could not sign in with Google.', tone: 'error' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>G</Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue trading</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={scale(20)} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (error) dispatch(clearError());
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={scale(20)} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={passwordVisibility}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (error) dispatch(clearError());
              }}
            />
            <TouchableOpacity onPress={() => setPasswordVisibility(!passwordVisibility)}>
              <Ionicons
                name={passwordVisibility ? 'eye-off-outline' : 'eye-outline'}
                size={scale(20)}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordLink} activeOpacity={0.7} onPress={() => router.push('/(auth)/forgot-password' as never)}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, loading && { opacity: 0.7 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.signInButtonContent}>
                <Text style={styles.signInButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={scale(18)} color="white" style={styles.signInArrow} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={() => { void handleGoogleSignIn(); }} activeOpacity={0.8} disabled={googleLoading}>
          <View style={styles.googleButtonContent}>
            {googleLoading ? <ActivityIndicator color={COLORS.primaryGreen} /> : <MaterialCommunityIcons name="google" size={scale(20)} color="#4285F4" style={styles.googleIcon} />}
            <Text style={styles.googleButtonText}>{googleLoading ? 'Signing in…' : 'Continue with Google'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.dontHaveText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register' as any)}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
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

// ================= STYLESHEET (Updated for Type Safety & Glow effects) =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    paddingBottom: hp(10), // Bottom padding for scrollability
  },
  errorBanner: {
    marginHorizontal: wp(6),
    marginBottom: hp(2),
    padding: wp(3),
    borderRadius: wp(2),
    backgroundColor: '#3A1D24',
    borderWidth: 1,
    borderColor: COLORS.errorRed,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: scale(14),
  },

  /* Header Section */
  header: {
    paddingHorizontal: wp(6),
    alignItems: 'center',
    marginBottom: hp(5),
  },
  statusBarMock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: hp(5),
    alignItems: 'center',
    marginBottom: hp(4),
  },
  statusTime: {
    color: 'white',
    fontSize: scale(15),
    fontWeight: '700',
  },
  statusIconsMock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconMock: {
    marginRight: 6,
  },
  logoContainer: {
    marginBottom: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Creates the bloom/aura glow effect seen in reference picture
  logoGlow: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    backgroundColor: COLORS.primaryGreen,
    position: 'absolute',
    opacity: 0.35,
    transform: [{ scale: 1.2 }], // bloom effect scaling
  },
  logoCircle: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: scale(32),
    fontWeight: '900',
  },
  welcomeText: {
    color: COLORS.textMain,
    fontSize: scale(28),
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitleText: {
    color: COLORS.textMuted,
    fontSize: scale(16),
    fontWeight: '400',
  },

  /* Input Form Section (Matching Reference layout precisely) */
  formContainer: {
    paddingHorizontal: wp(6),
    marginBottom: hp(4),
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: wp(3),
    height: hp(6), // Dynamic height
    marginBottom: hp(3),
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(2.5),
  },
  activeTab: {
    backgroundColor: COLORS.primaryGreen,
  },
  tabText: {
    color: COLORS.textMuted,
    marginLeft: 8,
    fontSize: scale(14),
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  
  // Generic Input Container styling (Matching Reference picture exactly)
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: wp(3),
    height: hp(7), // Dynamic height
    paddingHorizontal: wp(4),
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: 'transparent', // Prepare for dynamic border changes
  },
  // Container for dynamic phone input layout
  phoneInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2.5),
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: wp(3),
    width: wp(28), // Fixed width percentage
    height: hp(7),
    paddingHorizontal: wp(3),
  },
  countryCodeText: {
    color: COLORS.textMain,
    fontSize: scale(14),
    fontWeight: '600',
    marginRight: 4,
  },
  phoneNumberInput: {
    width: wp(58), // Fill remaining width percentage
    marginBottom: 0, // override generic padding
  },
  inputIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: scale(16),
    height: '100%',
  },

  // Link/Buttons (Matching Reference styles)
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: hp(4),
  },
  forgotPasswordText: {
    color: COLORS.accentYellow,
    fontSize: scale(13),
    fontWeight: '600',
  },
  // Main Sign In button with Glow effect
  signInButton: {
    width: '100%',
    height: hp(7),
    backgroundColor: COLORS.primaryGreen,
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8, // android depth
  },
  signInButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInButtonText: {
    color: 'white',
    fontSize: scale(18),
    fontWeight: '700',
  },
  signInArrow: {
    marginLeft: 8,
  },

  /* Divider Section style strictly matching image design */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(6),
    marginBottom: hp(4),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: scale(13),
    marginHorizontal: wp(4),
  },

  /* Social Button (Google) style matching reference */
  googleButton: {
    marginHorizontal: wp(6),
    height: hp(7),
    backgroundColor: COLORS.inputBg,
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: hp(6),
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: wp(3),
  },
  googleButtonText: {
    color: 'white',
    fontSize: scale(16),
    fontWeight: '600',
  },

  /* Register link style matching image precisely */
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(8),
  },
  dontHaveText: {
    color: COLORS.textMuted,
    fontSize: scale(14),
    marginRight: 6,
  },
  registerText: {
    color: COLORS.accentYellow,
    fontSize: scale(14),
    fontWeight: '700',
  },

  /* Security Footer style matching reference precisely */
  securityFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(2),
  },
  securityText: {
    color: COLORS.textMuted,
    fontSize: scale(12),
    marginLeft: 6,
  },
});