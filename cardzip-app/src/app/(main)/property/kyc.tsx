import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchMyAccount, submitKyc } from '../../../store/slices/accountSlice';
import { KycSubmission } from '../../../types/account';
import FeedbackModal from '../components/FeedbackModal';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';

const DOCUMENTS: Array<{ value: KycSubmission['documentType']; label: string }> = [
  { value: 'nin', label: 'NIN' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's license" },
];

export default function KycScreen() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { summary, loading, kycSubmitting, kycError } = useAppSelector((state) => state.account);
  const [legalName, setLegalName] = useState(user?.name ?? '');
  const [documentType, setDocumentType] = useState<KycSubmission['documentType']>('nin');
  const [documentNumber, setDocumentNumber] = useState('');
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (token) dispatch(fetchMyAccount(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (user?.name && !legalName) setLegalName(user.name);
  }, [legalName, user?.name]);

  const submit = async () => {
    if (!token) {
      setFeedback({ title: 'Sign in required', message: 'Sign in to submit identity verification.', tone: 'error' });
      return;
    }
    try {
      await dispatch(submitKyc({ token, submission: { legalName, documentType, documentNumber } })).unwrap();
      setDocumentNumber('');
      setFeedback({ title: 'Submitted for review', message: 'Your identity details were sent for review.', tone: 'success' });
    } catch (error) {
      setFeedback({ title: 'Could not submit', message: String(error || 'Please check your details and try again.'), tone: 'error' });
    }
  };

  const status = summary?.kyc.status ?? 'not_submitted';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><Ionicons name="chevron-back" size={21} color="#12201B" /></TouchableOpacity>
        <Text style={styles.title}>Identity Verification</Text>
        <View style={styles.iconButton} />
      </View>
      {loading && !summary && <ActivityIndicator color="#059669" />}
      <View style={styles.statusPanel}>
        <Ionicons name={status === 'approved' ? 'checkmark-circle' : 'shield-checkmark-outline'} size={23} color={status === 'approved' ? '#059669' : '#B7791F'} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>{status.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.statusCaption}>{status === 'pending' ? 'Your information is awaiting review.' : status === 'approved' ? 'Your identity is verified.' : 'Submit your details for review.'}</Text>
        </View>
      </View>
      {status !== 'approved' && status !== 'pending' && (
        <View style={styles.form}>
          <Text style={styles.label}>Legal name</Text>
          <TextInput value={legalName} onChangeText={setLegalName} style={styles.input} placeholder="As shown on your document" />
          <Text style={styles.label}>Document type</Text>
          <View style={styles.documentRow}>
            {DOCUMENTS.map((document) => (
              <TouchableOpacity key={document.value} onPress={() => setDocumentType(document.value)} style={[styles.documentButton, documentType === document.value && styles.documentSelected]}>
                <Text style={[styles.documentText, documentType === document.value && styles.documentTextSelected]}>{document.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Document number</Text>
          <TextInput value={documentNumber} onChangeText={setDocumentNumber} style={styles.input} placeholder="Enter document number" autoCapitalize="characters" />
          <Text style={styles.privacyNote}>Your document number is stored as a one-way hash; only its last four characters are retained for reference.</Text>
          {kycError && <Text style={styles.error}>{kycError}</Text>}
          <TouchableOpacity onPress={() => { void submit(); }} disabled={kycSubmitting} style={[styles.submitButton, kycSubmitting && styles.disabled]}>
            <Text style={styles.submitText}>{kycSubmitting ? 'Submitting...' : 'Submit for review'}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  safeArea: { flex: 1, backgroundColor: '#F4F6F5' },
  container: { flexGrow: 1, backgroundColor: '#F4F6F5', padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#12201B', fontSize: 18, fontWeight: '800' },
  statusPanel: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, marginBottom: 16 },
  statusTitle: { color: '#12201B', fontSize: 12, fontWeight: '800' },
  statusCaption: { color: '#82918B', fontSize: 12, marginTop: 3 },
  form: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 16 },
  label: { color: '#34443D', fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  input: { minHeight: 46, borderRadius: 10, backgroundColor: '#F3F4F6', paddingHorizontal: 12, color: '#12201B' },
  documentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  documentButton: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 8, backgroundColor: '#F3F4F6' },
  documentSelected: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#059669' },
  documentText: { color: '#52615A', fontSize: 11, fontWeight: '700' },
  documentTextSelected: { color: '#047857' },
  privacyNote: { color: '#82918B', fontSize: 11, lineHeight: 16, marginTop: 10 },
  error: { color: '#B42318', fontSize: 12, marginTop: 10 },
  submitButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#059669', borderRadius: 10, marginTop: 16 },
  submitText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.55 },
});