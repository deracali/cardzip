import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchWalletHistory } from '../store/slices/walletSlice';

const formatCurrency = (value: number) => `₦${value.toLocaleString('en-US')}.00`;

const formatDate = (value?: string) => {
  if (!value) return 'Just now';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Just now' : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export default function WalletHistoryScreen() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { balance, history, historyPagination, historyLoading, error } = useAppSelector((state) => state.wallet);

  useEffect(() => {
    if (token) {
      void dispatch(fetchWalletHistory({ token, page: 1 }));
    }
  }, [dispatch, token]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Wallet History</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Current Balance</Text>
        <Text style={styles.summaryValue}>{formatCurrency(balance)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {historyLoading ? (
          <ActivityIndicator color="#10B981" size="small" />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>No wallet activity yet.</Text>
        ) : (
          history.map((item) => {
            const isCredit = item.type === 'credit';
            const direction = isCredit ? '+' : '-';
            return (
              <View key={item._id ?? item.id ?? `${item.type}-${item.createdAt}`} style={styles.transactionCard}>
                <View style={[styles.iconWrap, { backgroundColor: isCredit ? '#DCFCE7' : '#F3E8FF' }]}>
                  <Ionicons name={isCredit ? 'arrow-down-circle' : 'arrow-up-circle'} size={20} color={isCredit ? '#059669' : '#7C3AED'} />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{item.description || item.type}</Text>
                  <Text style={styles.transactionMeta}>{formatDate(item.createdAt)}</Text>
                  <Text style={styles.transactionMeta}>{item.referenceType || 'wallet'}</Text>
                </View>

                <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
                  {direction}{formatCurrency(item.amount)}
                </Text>
              </View>
            );
          })
        )}
        {!historyLoading && token && historyPagination?.hasNextPage ? (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() => void dispatch(fetchWalletHistory({ token, page: historyPagination.page + 1, append: true }))}
            activeOpacity={0.8}
          >
            <Text style={styles.loadMoreText}>Load more activity</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1220',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 18,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: { flex: 1 },
  transactionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  transactionMeta: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
  },
  credit: { color: '#059669' },
  debit: { color: '#7C3AED' },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 18,
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginVertical: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
  },
  loadMoreText: { color: '#065F46', fontSize: 12, fontWeight: '700' },
});
