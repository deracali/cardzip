import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchMyAccount } from '../../../store/slices/accountSlice';

const tiers = [
  { name: 'Bronze', points: 0 },
  { name: 'Silver', points: 100 },
  { name: 'Gold', points: 300 },
  { name: 'Platinum', points: 600 },
];

const formatNaira = (amount: number) => `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

export default function RewardsScreen() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { summary, loading, error } = useAppSelector((state) => state.account);

  useEffect(() => {
    if (token) dispatch(fetchMyAccount(token));
  }, [dispatch, token]);

  const points = summary?.points ?? 0;
  const tierProgress = summary?.progressPercent ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={21} color="#12201B" />
          </TouchableOpacity>
          <Text style={styles.title}>Rewards</Text>
          <View style={styles.iconButton} />
        </View>

        {loading && !summary ? <ActivityIndicator color="#059669" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.membershipPanel}>
          <View style={styles.panelTop}>
            <View>
              <Text style={styles.eyebrow}>YOUR MEMBERSHIP</Text>
              <Text style={styles.level}>{summary?.memberLevel ?? 'Bronze'}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>POINTS</Text>
            </View>
          </View>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${tierProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {summary?.nextLevel ? `${summary.pointsToNextLevel} points to ${summary.nextLevel}` : 'Top tier reached'}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="swap-horizontal" size={19} color="#047857" />
            <Text style={styles.statValue}>{summary?.successfulTrades ?? 0}</Text>
            <Text style={styles.statLabel}>Successful trades</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={19} color="#047857" />
            <Text style={styles.statValue}>{summary?.referralCount ?? 0}</Text>
            <Text style={styles.statLabel}>People referred</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={19} color="#047857" />
            <Text style={styles.statValue}>{formatNaira(summary?.referralRewardNgn ?? 0)}</Text>
            <Text style={styles.statLabel}>Referral earnings</Text>
          </View>
        </View>

        <View style={styles.activityPanel}>
          <Text style={styles.sectionTitle}>How you earn points</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityIcon}><Ionicons name="swap-horizontal" size={17} color="#047857" /></View>
            <Text style={styles.activityLabel}>{summary?.successfulTrades ?? 0} successful trades</Text>
            <Text style={styles.activityPoints}>+{(summary?.pointsFromTrades ?? 0).toLocaleString()} pts</Text>
          </View>
          <View style={styles.activityRow}>
            <View style={styles.activityIcon}><Ionicons name="person-add-outline" size={17} color="#047857" /></View>
            <Text style={styles.activityLabel}>{summary?.referralCount ?? 0} people referred</Text>
            <Text style={styles.activityPoints}>+{(summary?.pointsFromReferrals ?? 0).toLocaleString()} pts</Text>
          </View>
          <Text style={styles.formula}>10 points per successful trade · 20 points per person who joins with your referral code</Text>
        </View>

        <View style={styles.tiersPanel}>
          <Text style={styles.sectionTitle}>Membership tiers</Text>
          {tiers.map((tier) => {
            const achieved = points >= tier.points;
            const current = summary?.memberLevel?.toLowerCase() === tier.name.toLowerCase();
            return (
              <View key={tier.name} style={styles.tierRow}>
                <View style={[styles.tierIcon, achieved && styles.tierIconAchieved]}>
                  <Ionicons name={achieved ? 'checkmark' : 'lock-closed-outline'} size={15} color={achieved ? '#047857' : '#82918B'} />
                </View>
                <Text style={[styles.tierName, current && styles.currentTier]}>{tier.name}{current ? ' · Current' : ''}</Text>
                <Text style={styles.tierPoints}>{tier.points.toLocaleString()} pts</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F5' },
  container: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#12201B', fontSize: 19, fontWeight: '800' },
  membershipPanel: { backgroundColor: '#0F261C', borderRadius: 16, padding: 18, marginBottom: 14 },
  panelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  eyebrow: { color: '#A2B3AC', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  level: { color: '#FFFFFF', fontSize: 25, fontWeight: '800', marginTop: 5 },
  pointsBadge: { alignItems: 'flex-end' },
  pointsValue: { color: '#B3F05C', fontSize: 25, fontWeight: '900' },
  pointsLabel: { color: '#A2B3AC', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  progressBackground: { height: 7, overflow: 'hidden', borderRadius: 4, backgroundColor: '#294438' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#B3F05C' },
  progressText: { marginTop: 9, color: '#D1D5DB', fontSize: 11 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: { flex: 1, minHeight: 112, justifyContent: 'center', gap: 7, padding: 11, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  statValue: { color: '#12201B', fontSize: 17, fontWeight: '900' },
  statLabel: { color: '#82918B', fontSize: 10 },
  activityPanel: { padding: 16, marginBottom: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  sectionTitle: { color: '#12201B', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  activityIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#ECFDF3' },
  activityLabel: { flex: 1, color: '#34423B', fontSize: 12, fontWeight: '600' },
  activityPoints: { color: '#047857', fontSize: 12, fontWeight: '800' },
  formula: { color: '#82918B', fontSize: 11, lineHeight: 16, marginTop: 8 },
  tiersPanel: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  tierIcon: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#F3F4F6' },
  tierIconAchieved: { backgroundColor: '#DCFCE7' },
  tierName: { flex: 1, color: '#52615A', fontSize: 12, fontWeight: '700' },
  currentTier: { color: '#047857' },
  tierPoints: { color: '#82918B', fontSize: 11, fontWeight: '700' },
  error: { color: '#B42318', marginBottom: 10 },
});