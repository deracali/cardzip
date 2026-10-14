import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchMyAccount } from '../../store/slices/accountSlice';
import FeedbackModal from '../components/FeedbackModal';

export default function ReferralScreen() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { summary, loading, error } = useAppSelector((state) => state.account);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (token) dispatch(fetchMyAccount(token));
  }, [dispatch, token]);

  const copyReferralCode = async () => {
    if (!summary?.referralCode) return;
    await Clipboard.setStringAsync(summary.referralCode);
    setCopied(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F5" />
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><Ionicons name="chevron-back" size={21} color="#12201B" /></TouchableOpacity>
        <Text style={styles.title}>Refer & Earn</Text>
        <View style={styles.iconButton} />
      </View>

      {loading && !summary ? <ActivityIndicator color="#059669" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.codePanel}>
        <Text style={styles.eyebrow}>YOUR REFERRAL CODE</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{summary?.referralCode ?? 'Unavailable'}</Text>
          <TouchableOpacity style={styles.copyButton} disabled={!summary?.referralCode} onPress={() => { void copyReferralCode(); }}>
            <Ionicons name="copy-outline" size={17} color="#FFFFFF" />
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.rewardText}>Earn ₦2,500 for each successful referral.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statValue}>{summary?.referralCount ?? 0}</Text><Text style={styles.statLabel}>Friends joined</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>₦{(summary?.referralRewardNgn ?? 0).toLocaleString()}</Text><Text style={styles.statLabel}>Referral rewards</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Your referrals</Text>
      {summary?.referrals.length ? summary.referrals.map((referral) => (
        <View key={referral.id} style={styles.referralRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{referral.name.slice(0, 1).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.referralName}>{referral.name}</Text><Text style={styles.referralDate}>{new Date(referral.createdAt).toLocaleDateString()}</Text></View>
          <Ionicons name="checkmark-circle" size={20} color="#059669" />
        </View>
      )) : <Text style={styles.empty}>No referrals yet.</Text>}
      </ScrollView>
      <FeedbackModal
        visible={copied}
        title="Referral code copied"
        message="Your referral code is ready to share."
        tone="success"
        onClose={() => setCopied(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F5' },
  container: { flexGrow: 1, backgroundColor: '#F4F6F5', padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#12201B', fontSize: 19, fontWeight: '800' },
  codePanel: { backgroundColor: '#0F261C', borderRadius: 18, padding: 18, marginBottom: 14 },
  eyebrow: { color: '#A2B3AC', fontSize: 11, fontWeight: '700' },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  code: { color: '#B3F05C', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  copyButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#059669', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  copyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  rewardText: { color: '#D1D5DB', fontSize: 12, marginTop: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 12, padding: 14 },
  statValue: { color: '#12201B', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#82918B', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: '#12201B', fontSize: 15, fontWeight: '800', marginBottom: 10 },
  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCFCE7' },
  avatarText: { color: '#047857', fontSize: 15, fontWeight: '800' },
  referralName: { color: '#12201B', fontSize: 13, fontWeight: '700' },
  referralDate: { color: '#82918B', fontSize: 11, marginTop: 2 },
  empty: { color: '#82918B', fontSize: 13, paddingVertical: 18, textAlign: 'center' },
  error: { color: '#B42318', marginBottom: 10 },
});