import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchWalletBalance } from '../../../store/slices/walletSlice';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';
import { initializeWalletFundingApi, verifyWalletFundingApi } from '../../../services/api/paymentApi';
import { isDefinitivePaystackFailure, openPaystackCheckout, verifyPaystackUntilSettled } from '../../../services/api/paystackFlow';

const configuredCallbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();
const WALLET_FUNDING_VAT_RATE = 0.075;
const WALLET_FUNDING_VAT = 100;

export default function AddMoneyScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultStatus, setResultStatus] = useState<'success' | 'failed' | 'pending' | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [successfulAmount, setSuccessfulAmount] = useState(0);
  const numericAmount = Number(amount);
  const hasValidAmount = Number.isSafeInteger(numericAmount) && numericAmount >= 100 && numericAmount <= 5000000;
  const vatAmount = hasValidAmount ? Math.round(numericAmount * WALLET_FUNDING_VAT_RATE) + WALLET_FUNDING_VAT : 0;
  const totalAmount = numericAmount + vatAmount;

  const verifyPayment = useCallback(async (paymentReference: string, paidAmount: number) => {
    if (!token) throw new Error('Sign in before funding your wallet.');
    await verifyPaystackUntilSettled({
      verify: () => verifyWalletFundingApi(token, paymentReference),
      getStatus: (result) => result.status === 'completed' ? 'completed' : 'pending',
      attempts: 30,
      intervalMs: 2000,
      failureMessage: 'Paystack did not complete this wallet payment.',
      pendingMessage: 'Payment confirmation is taking longer than expected.',
    });
    await dispatch(fetchWalletBalance(token)).unwrap();
    setReference('');
    setAmount('');
    setSuccessfulAmount(paidAmount);
    setResultStatus('success');
    setResultMessage('Paystack confirmed your payment and your wallet has been credited.');
  }, [dispatch, token]);

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
    let paymentReference = '';
    try {
      const callbackUrl = configuredCallbackUrl || Linking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeWalletFundingApi(token, numericAmount, callbackUrl);
      paymentReference = payment.reference;
      setReference(payment.reference);
      await openPaystackCheckout(payment.authorizationUrl, callbackUrl);
      await verifyPayment(payment.reference, numericAmount);
    } catch (paymentError) {
      const message = paymentError instanceof Error ? paymentError.message : 'Could not start Paystack checkout.';
      if (paymentReference) {
        const isPending = !isDefinitivePaystackFailure(paymentError);
        setResultStatus(isPending ? 'pending' : 'failed');
        setResultMessage(message);
        if (!isPending) setReference('');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resultStatus !== 'pending' || !reference || !token || loading) return undefined;
    const retryTimer = setTimeout(() => {
      setLoading(true);
      setError('');
      void verifyPayment(reference, successfulAmount)
        .catch((verificationError) => {
          const message = verificationError instanceof Error ? verificationError.message : 'Could not verify this payment.';
          if (isDefinitivePaystackFailure(verificationError)) {
            setReference('');
            setResultStatus('failed');
          }
          setResultMessage(message);
        })
        .finally(() => setLoading(false));
    }, 4000);
    return () => clearTimeout(retryTimer);
  }, [loading, reference, resultStatus, successfulAmount, token, verifyPayment]);

  return (
    <SafeAreaView style={styles.safeArea}>
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
          {hasValidAmount ? (
            <View style={styles.fundingCosts} accessibilityLiveRegion="polite">
              <View style={styles.fundingCostRow}>
                <Text style={styles.fundingCostLabel}>Wallet credit</Text>
                <Text style={styles.fundingCostValue}>₦{numericAmount.toLocaleString('en-NG')}</Text>
              </View>
              <View style={styles.fundingCostRow}>
                <Text style={styles.fundingCostLabel}>VAT</Text>
                <Text style={styles.fundingCostValue}>₦{vatAmount.toLocaleString('en-NG')}</Text>
              </View>
              <View style={[styles.fundingCostRow, styles.fundingTotalRow]}>
                <Text style={styles.fundingTotalLabel}>Total to pay</Text>
                <Text style={styles.fundingTotalValue}>₦{totalAmount.toLocaleString('en-NG')}</Text>
              </View>
            </View>
          ) : null}
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <TouchableOpacity style={styles.primaryButton} onPress={() => { void startFunding(); }} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Continue to Paystack</Text>}
          </TouchableOpacity>
          {reference && resultStatus === 'pending' ? <Text style={styles.note}>Verifying payment reference: {reference}</Text> : null}
        </View>
      </KeyboardAwareScrollView>
      <Modal
        visible={Boolean(resultStatus)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          const wasSuccessful = resultStatus === 'success';
          setResultStatus(null);
          if (wasSuccessful) router.back();
        }}
      >
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            <View style={[styles.successIcon, resultStatus !== 'success' && styles.resultIconNonSuccess]}>
              <Feather name={resultStatus === 'success' ? 'check' : resultStatus === 'pending' ? 'clock' : 'x'} size={27} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>{resultStatus === 'success' ? 'Payment successful' : resultStatus === 'pending' ? 'Payment processing' : 'Payment not completed'}</Text>
            {resultStatus === 'success' ? <Text style={styles.successAmount}>₦{successfulAmount.toLocaleString('en-NG')}</Text> : null}
            <Text style={styles.successMessage}>{resultMessage}</Text>
            {resultStatus === 'pending' && reference ? <Text style={styles.pendingReference}>Reference: {reference}</Text> : null}
            <TouchableOpacity style={styles.successButton} onPress={() => {
              const wasSuccessful = resultStatus === 'success';
              setResultStatus(null);
              if (wasSuccessful) router.back();
            }} activeOpacity={0.85}>
              <Text style={styles.successButtonText}>{resultStatus === 'success' ? 'Done' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  fundingCosts: { gap: 10, padding: 14, borderRadius: 12, backgroundColor: '#F3F6F4' },
  fundingCostRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fundingCostLabel: { color: '#66736D', fontSize: 13, fontFamily: 'Poppins' },
  fundingCostValue: { color: '#12201B', fontSize: 13, fontWeight: '600', fontFamily: 'Poppins' },
  fundingTotalRow: { paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#D5DDD8' },
  fundingTotalLabel: { color: '#12201B', fontSize: 14, fontWeight: '800', fontFamily: 'Poppins' },
  fundingTotalValue: { color: '#047857', fontSize: 15, fontWeight: '900', fontFamily: 'Poppins' },
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
  primaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#00B856' },
  primaryText: { color: '#FFFFFF', fontWeight: '800' },
  successBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 22, backgroundColor: 'rgba(8, 15, 13, 0.62)' },
  successCard: { width: '100%', maxWidth: 380, alignItems: 'center', padding: 24, borderRadius: 20, backgroundColor: '#FFFFFF' },
  successIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 29, backgroundColor: '#059669' },
  resultIconNonSuccess: { backgroundColor: '#B45309' },
  successTitle: { color: '#12201B', fontSize: 20, fontWeight: '800', marginTop: 16 },
  successAmount: { color: '#047857', fontSize: 26, fontWeight: '900', marginTop: 8 },
  successMessage: { color: '#66736D', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  pendingReference: { color: '#64746C', fontSize: 11, marginTop: 10 },
  successButton: { minHeight: 46, width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#00B856', marginTop: 20 },
  successButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
