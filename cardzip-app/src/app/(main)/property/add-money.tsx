import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchWalletBalance } from '../../store/slices/walletSlice';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';
import { initializeWalletFundingApi, verifyWalletFundingApi } from '../../services/api/paymentApi';

const configuredCallbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();

export default function AddMoneyScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyPayment = async (paymentReference: string) => {
    if (!token) throw new Error('Sign in before funding your wallet.');
    const result = await verifyWalletFundingApi(token, paymentReference);
    if (result.status !== 'completed') throw new Error('Paystack has not confirmed this payment yet. Try verification again shortly.');
    await dispatch(fetchWalletBalance(token)).unwrap();
    setReference('');
    setAmount('');
    Alert.alert('Payment successful', 'Paystack confirmed your payment and your wallet has been credited.');
    router.back();
  };

  const startFunding = async () => {
    const numericAmount = Number(amount);
    if (!token) {
      setError('Sign in before funding your wallet.');
      return;
    }
    if (!Number.isSafeInteger(numericAmount) || numericAmount < 100 || numericAmount > 5000000) {
      setError('Enter a whole-number amount between ₦100 and ₦5,000,000.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const callbackUrl = configuredCallbackUrl || Linking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeWalletFundingApi(token, numericAmount, callbackUrl);
      setReference(payment.reference);
      const browser = await WebBrowser.openAuthSessionAsync(payment.authorizationUrl, callbackUrl);
      if (browser.type === 'success') {
        await verifyPayment(payment.reference);
      } else if (browser.type === 'dismiss') {
        setError('Checkout was closed. If you completed the payment, verify it below to update your wallet.');
      }
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Could not start Paystack checkout.');
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!reference || !token) return;
    setLoading(true);
    setError('');
    try {
      await verifyPayment(reference);
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Could not verify this payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F5" />
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
            <Feather name="chevron-left" size={22} color="#12201B" />
          </TouchableOpacity>
          <Text style={styles.title}>Add money</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Fund your Cardzip wallet</Text>
          <Text style={styles.note}>Pay securely with Paystack. Your wallet is credited only after the server verifies a successful payment.</Text>
          <Text style={styles.label}>Amount in naira</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={(value) => setAmount(value.replace(/[^\d]/g, ''))}
            placeholder="e.g. 10000"
            placeholderTextColor="#82918B"
            keyboardType="number-pad"
          />
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <TouchableOpacity style={styles.primaryButton} onPress={() => { void startFunding(); }} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Continue to Paystack</Text>}
          </TouchableOpacity>
          {reference ? (
            <View style={styles.verifyBlock}>
              <Text style={styles.note}>Payment reference: {reference}</Text>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => { void checkPayment(); }} disabled={loading}>
                <Text style={styles.secondaryText}>I have paid — verify payment</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F5' },
  container: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#12201B', fontSize: 19, fontWeight: '800' },
  card: { padding: 18, borderRadius: 18, backgroundColor: '#FFFFFF', gap: 12 },
  heading: { color: '#12201B', fontSize: 19, fontWeight: '800' },
  note: { color: '#66736D', fontSize: 13, lineHeight: 19 },
  label: { color: '#12201B', fontSize: 13, fontWeight: '700', marginTop: 8 },
  amountInput: { minHeight: 50, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F3F6F4', color: '#12201B', fontSize: 18, fontWeight: '700' },
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
  primaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#00B856' },
  primaryText: { color: '#FFFFFF', fontWeight: '800' },
  verifyBlock: { gap: 10, marginTop: 4 },
  secondaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E8F8EE' },
  secondaryText: { color: '#087A40', fontWeight: '700' },
});
