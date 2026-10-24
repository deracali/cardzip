import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FeedbackModal from '../(main)/components/FeedbackModal';
import { requestPasswordResetCode, resetPasswordWithCode } from '../../services/api/authRecoveryApi';
import KeyboardAwareScrollView from '../../components/KeyboardAwareScrollView';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'complete'>('email');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone: 'error' | 'success' } | null>(null);

  const requestCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFeedback({ title: 'Check your email', message: 'Enter the email address on your Cardzip account.', tone: 'error' });
      return;
    }
    setLoading(true);
    try {
      await requestPasswordResetCode(email.trim());
      setStep('reset');
      setFeedback({ title: 'Check your email', message: 'Enter the six-digit code we sent. It expires in 15 minutes.', tone: 'success' });
    } catch (error) {
      setFeedback({ title: 'Could not send code', message: error instanceof Error ? error.message : 'Please try again later.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async () => {
    if (!/^\d{6}$/.test(code)) {
      setFeedback({ title: 'Invalid code', message: 'Enter the six-digit code from your email.', tone: 'error' });
      return;
    }
    if (password.length < 8) {
      setFeedback({ title: 'Password too short', message: 'Choose a password with at least 8 characters.', tone: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ title: 'Passwords do not match', message: 'Re-enter the same password in both fields.', tone: 'error' });
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithCode(email.trim(), code, password);
      setStep('complete');
      setFeedback({ title: 'Password updated', message: 'You can now sign into Cardzip with your email and new password.', tone: 'success' });
    } catch (error) {
      setFeedback({ title: 'Could not update password', message: error instanceof Error ? error.message : 'Check the code and try again.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
            <Ionicons name="arrow-back" size={20} color="#111827" />
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>
          <View style={styles.brand}>
            <Image source={require('../../../assets/images/logo.jpg')} style={styles.brandMark} />
            <Text style={styles.brandName}>Cardzip</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={step === 'complete' ? 'checkmark' : 'lock-closed-outline'} size={25} color="#10B981" />
          </View>
          <Text style={styles.title}>{step === 'complete' ? 'Password updated' : 'Set your password'}</Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? 'Enter your Cardzip email and we will send a six-digit reset code.'
              : step === 'reset'
                ? `Enter the code sent to ${email} and choose a new password.`
                : 'Your password is ready. Sign in with your email and new password.'}
          </Text>

          {step === 'email' && (
            <>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#8A96A8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={() => { void requestCode(); }} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Send reset code</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 'reset' && (
            <>
              <Text style={styles.label}>Six-digit code</Text>
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor="#8A96A8"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
              />
              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 8 characters"
                placeholderTextColor="#8A96A8"
                secureTextEntry
                autoComplete="new-password"
                value={password}
                onChangeText={setPassword}
              />
              <Text style={styles.label}>Confirm new password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor="#8A96A8"
                secureTextEntry
                autoComplete="new-password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={() => { void submitNewPassword(); }} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Set new password</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => { void requestCode(); }} disabled={loading}>
                <Text style={styles.secondaryText}>Send a new code</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'complete' && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(auth)/login' as never)}>
              <Text style={styles.primaryText}>Sign in</Text>
            </TouchableOpacity>
          )}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  topBar: { position: 'absolute', top: 18, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { color: '#111827', fontSize: 14, fontWeight: '600' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandMark: { width: 24, height: 24, borderRadius: 6 },
  brandName: { color: '#111827', fontSize: 16, fontWeight: '800' },
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, padding: 24 },
  iconCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E8F8F1', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { color: '#111827', fontSize: 25, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#64748B', fontSize: 14, lineHeight: 21, marginBottom: 22 },
  label: { color: '#111827', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { color: '#111827', backgroundColor: '#F7F8FA', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  primaryButton: { minHeight: 48, backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secondaryButton: { alignItems: 'center', justifyContent: 'center', padding: 14 },
  secondaryText: { color: '#059669', fontWeight: '600', fontSize: 14 },
});
