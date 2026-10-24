import React, { useState } from 'react';
import { StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, googleSignInUser, appleSignInUser, clearError } from '../../store/slices/authSlice';
import FeedbackModal from '../(main)/components/FeedbackModal';
import KeyboardAwareScrollView from '../../components/KeyboardAwareScrollView';
import GoogleLogo from '../../components/GoogleLogo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage: number): number => Math.round((percentage * SCREEN_WIDTH) / 100);
const hp = (percentage: number): number => Math.round((percentage * SCREEN_HEIGHT) / 100);
const scale = (size: number): number => wp((size / SCREEN_WIDTH) * 100);

const COLORS = {
  bgDark: '#FFFFFF',
  primaryGreen: '#10B981',
  inputBg: '#F7F8FA',
  textMain: '#111827',
  textMuted: '#64748B',
  border: '#E5E7EB',
  errorRed: '#DC2626',
  accentYellow: '#059669',
};

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
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
    if (Constants.executionEnvironment === 'storeClient') {
      setFeedback({
        title: 'Google sign-in unavailable in Expo Go',
        message: 'Use a Cardzip development build to sign in with Google. Email and password sign-in are still available here.',
        tone: 'info',
      });
      return;
    }
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      setFeedback({ title: 'Google sign-in unavailable', message: 'Google sign-in is only available in the Cardzip Android and iOS apps.', tone: 'error' });
      return;
    }
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    if (!webClientId) {
      setFeedback({ title: 'Google sign-in unavailable', message: 'Google sign-in is not configured for this app build.', tone: 'error' });
      return;
    }
    setGoogleLoading(true);
    try {
      const { GoogleSignin, isSuccessResponse } = await import('@react-native-google-signin/google-signin');
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

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      if (!(await AppleAuthentication.isAvailableAsync())) {
        setFeedback({
          title: 'Apple sign-in unavailable',
          message: 'Expo Go supports Apple sign-in on iOS. This runtime did not load the native Apple module. Open the app in Expo Go on an iPhone or iPad, update Expo Go, and make sure an Apple ID is set up on the device. A rebuild is only needed for a custom development or standalone app after native configuration changes. Google and email sign-in are still available.',
          tone: 'info',
        });
        return;
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('Apple did not return an identity token. Please try again.');
      const name = [credential.fullName?.givenName, credential.fullName?.middleName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ');
      const result = await dispatch(appleSignInUser({ idToken: credential.identityToken, ...(name ? { name } : {}) })).unwrap();
      if (result.token) router.replace('/(main)/(tabs)/home' as any);
    } catch (error) {
      if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
      setFeedback({ title: 'Apple sign-in failed', message: error instanceof Error ? error.message : 'Could not sign in with Apple.', tone: 'error' });
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandBar}>
          <View style={styles.brandRow}>
            <Image source={require('../../../assets/images/logo.jpg')} style={styles.brandMark} />
            <Text style={styles.brandName}>Cardzip</Text>
          </View>
          <View style={styles.secureLabel}>
            <Ionicons name="shield-checkmark-outline" size={scale(13)} color={COLORS.primaryGreen} />
            <Text style={styles.secureLabelText}>SECURE LOGIN</Text>
          </View>
        </View>
        <View style={styles.authTabs}>
          <View style={[styles.authTab, styles.authTabActive]}>
            <Text style={[styles.authTabText, styles.authTabTextActive]}>Sign In</Text>
          </View>
          <TouchableOpacity style={styles.authTab} onPress={() => router.replace('/(auth)/register' as any)}>
            <Text style={styles.authTabText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome Back to Cardzip</Text>
          <Text style={styles.subtitleText}>Your everyday essentials, on one secure account. Pick up where you left off.</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <Text style={styles.fieldLabel}>Email address</Text>
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

          <Text style={styles.fieldLabel}>Password</Text>
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
            {googleLoading ? <ActivityIndicator color={COLORS.primaryGreen} /> : <GoogleLogo size={scale(20)} />}
            <Text style={styles.googleButtonText}>{googleLoading ? 'Signing in…' : 'Continue with Google'}</Text>
          </View>
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <View style={styles.appleButtonContainer}>
            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => { void handleAppleSignIn(); }}
              disabled={appleLoading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Apple"
            >
              {appleLoading ? <ActivityIndicator color="#FFFFFF" /> : <>
                <Ionicons name="logo-apple" size={scale(19)} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>Sign in with Apple</Text>
              </>}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.registerContainer}>
          <Text style={styles.dontHaveText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register' as any)}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.securityFooter}>
          <Ionicons name="shield-checkmark-outline" size={scale(14)} color={COLORS.primaryGreen} />
          <Text style={styles.securityText}>Your account is protected with secure encryption</Text>
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
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  brandBar: {
    minHeight: hp(7),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 25, height: 25, borderRadius: 7 },
  brandName: { color: COLORS.textMain, fontSize: 17, fontWeight: '800' },
  secureLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  secureLabelText: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  authTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    minHeight: 44,
    borderRadius: 24,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    marginTop: 8,
    marginBottom: 25,
  },
  authTab: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  authTabActive: { backgroundColor: '#111827' },
  authTabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  authTabTextActive: { color: '#FFFFFF' },
  errorBanner: {
    marginHorizontal: 0,
    marginBottom: hp(2),
    padding: wp(3),
    borderRadius: wp(2),
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: COLORS.errorRed,
  },
  errorText: {
    color: COLORS.errorRed,
    fontFamily: 'Poppins',
    fontSize: scale(14),
  },
  fieldLabel: { color: COLORS.textMain, fontSize: scale(12), fontWeight: '600', marginBottom: 7 },

  /* Header Section */
  header: {
    alignItems: 'flex-start',
    marginBottom: hp(3),
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: scale(32),
    fontWeight: '900',
  },
  welcomeText: {
    color: COLORS.textMain,
    fontFamily: 'Poppins',
    fontSize: scale(25),
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitleText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '400',
    lineHeight: scale(19),
  },

  /* Input Form Section (Matching Reference layout precisely) */
  formContainer: {
    paddingHorizontal: 0,
    marginBottom: hp(2),
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: wp(3),
    height: hp(6),
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
    backgroundColor: '#111827',
  },
  tabText: {
    color: COLORS.textMuted,
    marginLeft: 8,
    fontFamily: 'Poppins',
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
    borderRadius: 11,
    height: hp(6.5),
    paddingHorizontal: wp(3.5),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: scale(14),
    height: '100%',
  },

  // Link/Buttons (Matching Reference styles)
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: hp(2.2),
  },
  forgotPasswordText: {
    color: COLORS.primaryGreen,
    fontFamily: 'Poppins',
    fontSize: scale(11),
    fontWeight: '600',
  },
  // Main Sign In button with Glow effect
  signInButton: {
    width: '100%',
    height: hp(6.5),
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  signInButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInButtonText: {
    color: 'white',
    fontFamily: 'Poppins',
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
    paddingHorizontal: 0,
    marginBottom: hp(2),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(13),
    marginHorizontal: wp(4),
  },

  /* Social Button (Google) style matching reference */
  googleButton: {
    marginHorizontal: 0,
    height: hp(6),
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: hp(2.5),
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: wp(3),
  },
  googleButtonText: {
    color: COLORS.textMain,
    fontFamily: 'Poppins',
    fontSize: scale(16),
    fontWeight: '600',
  },
  appleButtonContainer: {
    position: 'relative',
    marginBottom: hp(2.5),
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: hp(6),
    borderRadius: 10,
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: scale(15),
    fontWeight: '600',
  },

  /* Register link style matching image precisely */
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  dontHaveText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(14),
    marginRight: 6,
  },
  registerText: {
    color: COLORS.primaryGreen,
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: scale(12),
    marginLeft: 6,
  },
});