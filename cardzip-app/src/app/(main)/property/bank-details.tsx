import React, { useEffect, useState } from 'react';
import { ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchMyAccount } from '../../../store/slices/accountSlice';
import { fetchWalletAccountApi, saveBankAccountApi } from '../../../services/api/walletApi';

export default function BankDetailsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState(user?.name || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) {
      setError('Sign in to add your payout account.');
      setLoading(false);
      return () => { active = false; };
    }
    void fetchWalletAccountApi(token)
      .then(({ user: accountUser }) => {
        if (!active || !accountUser.bankAccount) return;
        setBankName(accountUser.bankAccount.bankName);
        setAccountName(accountUser.bankAccount.accountName);
        setAccountNumber(accountUser.bankAccount.accountNumber);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load your saved payout account.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const saveAccount = async () => {
    const details = {
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.replace(/\D/g, ''),
    };
    if (!token) {
      setError('Sign in to save your payout account.');
      return;
    }
    if (!details.bankName || !details.accountName || !/^\d{10}$/.test(details.accountNumber)) {
      setError('Enter the bank name, account holder name, and a valid 10-digit account number.');
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await saveBankAccountApi(token, details);
      await dispatch(fetchMyAccount(token));
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the payout account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
            <Feather name="chevron-left" size={22} color="#12201B" />
          </TouchableOpacity>
          <Text style={styles.title}>Bank details</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.intro}>
          <View style={styles.introIcon}><Feather name="shield" size={19} color="#047857" /></View>
          <Text style={styles.introTitle}>Your payout account</Text>
          <Text style={styles.introText}>Save the bank account you want to use for withdrawals. The same details will appear on the withdrawal page.</Text>
        </View>

        {loading ? (
          <View style={styles.loading}><ActivityIndicator color="#059669" /><Text style={styles.loadingText}>Loading saved account…</Text></View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Bank name</Text>
            <TextInput style={styles.input} value={bankName} onChangeText={(value) => { setBankName(value); setSaved(false); }} placeholder="e.g. GTBank" placeholderTextColor="#94A3B8" autoCapitalize="words" />

            <Text style={styles.label}>Account holder name</Text>
            <TextInput style={styles.input} value={accountName} onChangeText={(value) => { setAccountName(value); setSaved(false); }} placeholder="Name on bank account" placeholderTextColor="#94A3B8" autoCapitalize="words" />

            <Text style={styles.label}>Account number</Text>
            <TextInput style={styles.input} value={accountNumber} onChangeText={(value) => { setAccountNumber(value.replace(/\D/g, '').slice(0, 10)); setSaved(false); }} placeholder="10-digit account number" placeholderTextColor="#94A3B8" keyboardType="number-pad" maxLength={10} />

            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            {saved ? <View style={styles.savedNotice}><Feather name="check-circle" size={16} color="#047857" /><Text style={styles.savedText}>Payout account saved and ready for withdrawals.</Text></View> : null}

            <TouchableOpacity style={styles.saveButton} onPress={() => { void saveAccount(); }} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <><Feather name="save" size={16} color="#FFFFFF" /><Text style={styles.saveButtonText}>Save bank details</Text></>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F5' },
  container: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#12201B', fontSize: 19, fontWeight: '800' },
  intro: { alignItems: 'center', padding: 20, borderRadius: 14, backgroundColor: '#EAF8F0', marginBottom: 16 },
  introIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#D1FAE5' },
  introTitle: { color: '#12201B', fontSize: 17, fontWeight: '800', marginTop: 12 },
  introText: { color: '#52635B', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  form: { padding: 18, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  label: { color: '#12201B', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#DCE5E0', borderRadius: 10, backgroundColor: '#FAFCFB', color: '#12201B', paddingHorizontal: 12, fontSize: 14 },
  loading: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: '#64746C', fontSize: 12 },
  error: { color: '#B42318', fontSize: 12, lineHeight: 17, marginTop: 12 },
  savedNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  savedText: { color: '#047857', fontSize: 12, fontWeight: '600', flex: 1 },
  saveButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 11, backgroundColor: '#047857', marginTop: 18 },
  saveButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
