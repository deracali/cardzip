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
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppDispatch, useAppSelector } from '../../store';
import { signupUser, googleSignInUser, appleSignInUser, clearError } from '../../store/slices/authSlice';
import FeedbackModal from '../(main)/components/FeedbackModal';
import KeyboardAwareScrollView from '../../components/KeyboardAwareScrollView';
import GoogleLogo from '../../components/GoogleLogo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage: number): number => Math.round((percentage * SCREEN_WIDTH) / 100);
const hp = (percentage: number): number => Math.round((percentage * SCREEN_HEIGHT) / 100);
const scale = (size: number): number => wp((size / SCREEN_WIDTH) * 100);

const COLORS = {
  bgDark: '#FFFFFF',
  inputBg: '#F7F8FA',
  primaryGreen: '#10B981',
  accentYellow: '#059669',
  textMain: '#111827',
  textMuted: '#64748B',
  border: '#E5E7EB',
  errorRed: '#DC2626',
};

export default function SignUpScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referrerCode, setReferrerCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'error' | 'info' } | null>(null);

  const handleSignUp = () => {
    if (!fullName || !email || !password) return;

    dispatch(
      signupUser({
        name: fullName,
        email,
        password,
        referrer: referrerCode.trim() ? referrerCode.trim() : undefined,
      })
    ).then((result) => {
      if (signupUser.fulfilled.match(result)) {
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
      setFeedback({
        title: 'Google sign-in unavailable',
        message: 'Google sign-in is only available in the Cardzip Android and iOS apps.',
        tone: 'error',
      });
      return;
    }
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    if (!webClientId) {
      setFeedback({
        title: 'Google sign-in unavailable',
        message: 'Google sign-in is not configured for this app build.',
        tone: 'error',
      });
      return;
    }
    setGoogleLoading(true);
    try {
      const { GoogleSignin, isSuccessResponse } = await import('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        webClientId,
        ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
          ? { iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID }
          : {}),
      });
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return;
      if (!response.data.idToken) throw new Error('Google did not return an identity token. Check the configured OAuth client IDs.');
      await dispatch(googleSignInUser(response.data.idToken)).unwrap();
      router.replace('/(main)/(tabs)/home' as any);
    } catch (error) {
      setFeedback({
        title: 'Google sign-in failed',
        message: error instanceof Error ? error.message : 'Could not sign in with Google.',
        tone: 'error',
      });
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
      await dispatch(appleSignInUser({ idToken: credential.identityToken, ...(name ? { name } : {}) })).unwrap();
      router.replace('/(main)/(tabs)/home' as any);
    } catch (error) {
      if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
      setFeedback({
        title: 'Apple sign-in failed',
        message: error instanceof Error ? error.message : 'Could not sign in with Apple.',
        tone: 'error',
      });
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
            <Text style={styles.secureLabelText}>SECURE SIGN UP</Text>
          </View>
        </View>
        <View style={styles.authTabs}>
          <TouchableOpacity style={styles.authTab} onPress={() => router.replace('/(auth)/login' as any)}>
            <Text style={styles.authTabText}>Sign In</Text>
          </TouchableOpacity>
          <View style={[styles.authTab, styles.authTabActive]}>
            <Text style={[styles.authTabText, styles.authTabTextActive]}>Sign Up</Text>
          </View>
        </View>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Create your account</Text>
          <Text style={styles.subtitleText}>Join Cardzip and get started in minutes.</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <Text style={styles.fieldLabel}>Full name</Text>
          <View style={styles.inputContainer}>
            <Feather name="user" size={scale(18)} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={(val) => {
                setFullName(val);
                if (error) dispatch(clearError());
              }}
            />
          </View>

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
              placeholder="Create password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (error) dispatch(clearError());
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Referral code (optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="gift-outline" size={scale(18)} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Referral Code (Optional)"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              value={referrerCode}
              onChangeText={setReferrerCode}
            />
          </View>

          <TouchableOpacity
            style={[styles.createAccountButton, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.createAccountButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={scale(18)} color="white" style={{ marginLeft: 6 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => { void handleGoogleSignIn(); }}
          activeOpacity={0.8}
          disabled={googleLoading}
        >
          <View style={styles.googleButtonContent}>
            {googleLoading
              ? <ActivityIndicator color={COLORS.primaryGreen} />
              : <GoogleLogo size={scale(20)} />}
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
              accessibilityLabel="Sign up with Apple"
            >
              {appleLoading ? <ActivityIndicator color="#FFFFFF" /> : <>
                <Ionicons name="logo-apple" size={scale(19)} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>Sign up with Apple</Text>
              </>}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.loginLinkContainer}>
          <Text style={styles.alreadyHaveText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.securityFooter}>
          <Ionicons name="shield-checkmark-outline" size={scale(14)} color={COLORS.primaryGreen} />
          <Text style={styles.securityText}>Your information is encrypted and secure</Text>
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

// ================= STYLESHEET =================
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
  brandBar: { minHeight: hp(7), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 25, height: 25, borderRadius: 7 },
  brandName: { color: COLORS.textMain, fontSize: 17, fontWeight: '800' },
  secureLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  secureLabelText: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  authTabs: { flexDirection: 'row', alignItems: 'center', padding: 3, minHeight: 44, borderRadius: 24, backgroundColor: '#F7F8FA', borderWidth: 1, borderColor: '#EEF0F3', marginTop: 8, marginBottom: 25 },
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
    paddingHorizontal: 0,
    alignItems: 'flex-start',
    marginBottom: hp(3),
  },
  statusBarMock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: hp(5),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  statusTime: {
    color: COLORS.textMain,
    fontFamily: 'Poppins',
    fontSize: scale(15),
    fontWeight: '700',
  },
  statusIconsMock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 6,
  },
  logoContainer: {
    marginBottom: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
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
    color: COLORS.textMain,
    fontFamily: 'Poppins',
    fontSize: scale(28),
    fontWeight: '900',
  },
  welcomeText: {
    color: COLORS.textMain,
    fontFamily: 'Poppins',
    fontSize: scale(25),
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitleText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '400',
    lineHeight: scale(19),
  },

  /* Inputs Container */
  formContainer: {
    paddingHorizontal: 0,
    marginBottom: hp(2),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 11,
    height: hp(6.2),
    paddingHorizontal: wp(3.5),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phoneInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: wp(3),
    width: wp(28),
    height: hp(7),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countryCodeText: {
    color: COLORS.textMain,
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '700',
    marginRight: 4,
  },
  phoneNumberInput: {
    width: wp(58),
    marginBottom: 0,
  },
  inputIcon: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    color: COLORS.textMain,
    fontFamily: 'Poppins',
    fontSize: scale(15),
    height: '100%',
  },
  showPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showPasswordText: {
    color: COLORS.primaryGreen,
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '700',
  },

  /* Primary Button */
  createAccountButton: {
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: 'white',
    fontFamily: 'Poppins',
    fontSize: scale(16),
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 8,
  },

  /* Divider */
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
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(12),
    fontWeight: '600',
    marginHorizontal: wp(4),
  },

  /* Google Button */
  googleButton: {
    marginHorizontal: 0,
    height: hp(6),
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: hp(2),
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: wp(3),
  },
  googleBadge: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2.5),
  },
  googleBadgeText: {
    color: '#4285F4',
    fontFamily: 'Poppins',
    fontSize: scale(11),
    fontWeight: '800',
  },
  googleButtonText: {
    color: COLORS.textMain,
    fontFamily: 'Poppins',
    fontSize: scale(15),
    fontWeight: '700',
  },
  appleButtonContainer: {
    position: 'relative',
    marginBottom: hp(2),
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
    fontWeight: '700',
  },

  /* Navigation Link */
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  alreadyHaveText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(14),
    marginRight: 6,
  },
  loginText: {
    color: COLORS.accentYellow,
    fontFamily: 'Poppins',
    fontSize: scale(14),
    fontWeight: '700',
  },
  securityFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: hp(1.5) },
  securityText: { color: COLORS.textMuted, fontSize: scale(11) },

  /* Terms Footer */
  termsText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins',
    fontSize: scale(12),
    textAlign: 'center',
    paddingHorizontal: wp(8),
  },
  termsLink: {
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});