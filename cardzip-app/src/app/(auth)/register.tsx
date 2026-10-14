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
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useAppDispatch, useAppSelector } from '../store';
import { signupUser, googleSignInUser, clearError } from '../store/slices/authSlice';
import KeyboardAwareScrollView from '../../components/KeyboardAwareScrollView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage: number): number => Math.round((percentage * SCREEN_WIDTH) / 100);
const hp = (percentage: number): number => Math.round((percentage * SCREEN_HEIGHT) / 100);
const scale = (size: number): number => wp((size / SCREEN_WIDTH) * 100);

const COLORS = {
  bgDark: '#0A111F',
  inputBg: '#1C2637',
  primaryGreen: '#1DB954',
  accentYellow: '#FFD166',
  textMain: '#FFFFFF',
  textMuted: '#A1ACB9',
  border: '#2A3C55',
  errorRed: '#FF4D4D',
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
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    if (!webClientId) {
      Alert.alert('Google sign-in unavailable', 'Google sign-in is not configured for this app build.');
      return;
    }
    setGoogleLoading(true);
    try {
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
      Alert.alert('Google sign-in failed', error instanceof Error ? error.message : 'Could not sign in with Google.');
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
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitleText}>Start trading gift cards instantly</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
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
              : <MaterialCommunityIcons name="google" size={scale(20)} color="#4285F4" style={styles.googleIcon} />}
            <Text style={styles.googleButtonText}>{googleLoading ? 'Signing in…' : 'Continue with Google'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.alreadyHaveText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
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
    paddingBottom: hp(5),
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
    marginBottom: hp(2),
  },
  statusTime: {
    color: COLORS.textMain,
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
    fontSize: scale(28),
    fontWeight: '900',
  },
  welcomeText: {
    color: COLORS.textMain,
    fontSize: scale(28),
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitleText: {
    color: COLORS.textMuted,
    fontSize: scale(16),
    fontWeight: '400',
  },

  /* Inputs Container */
  formContainer: {
    paddingHorizontal: wp(6),
    marginBottom: hp(3),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: wp(3),
    height: hp(7),
    paddingHorizontal: wp(4),
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: 'transparent',
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
    fontSize: scale(15),
    height: '100%',
  },
  showPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showPasswordText: {
    color: COLORS.accentYellow,
    fontSize: scale(13),
    fontWeight: '700',
  },

  /* Primary Button */
  createAccountButton: {
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
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: 'white',
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
    paddingHorizontal: wp(6),
    marginBottom: hp(3),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: scale(12),
    fontWeight: '600',
    marginHorizontal: wp(4),
  },

  /* Google Button */
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
    fontSize: scale(11),
    fontWeight: '800',
  },
  googleButtonText: {
    color: COLORS.textMain,
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
    fontSize: scale(14),
    marginRight: 6,
  },
  loginText: {
    color: COLORS.accentYellow,
    fontSize: scale(14),
    fontWeight: '700',
  },

  /* Terms Footer */
  termsText: {
    color: COLORS.textMuted,
    fontSize: scale(12),
    textAlign: 'center',
    paddingHorizontal: wp(8),
  },
  termsLink: {
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});