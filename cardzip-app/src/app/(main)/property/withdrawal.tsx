import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppSelector } from '../../../store';
import FeedbackModal from '../components/FeedbackModal';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';
import {
  fetchWalletAccountApi,
  fetchWalletBalanceApi,
  fetchWithdrawalHistoryApi,
  saveBankAccountApi,
  SavedBankAccount,
  WithdrawalRequest,
  withdrawWalletApi,
} from '../../../services/api/walletApi';
import {
  fetchNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  UserNotification,
} from '../../../services/api/notificationApi';

const naira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;

export default function WithdrawScreen() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [balance, setBalance] = useState<number | null>(null);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState(user?.name ?? '');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBank, setSavingBank] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [updatingNotificationId, setUpdatingNotificationId] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ title: string; message: string; tone?: 'success' | 'error' | 'info' } | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError('Sign in to view your wallet and request withdrawals.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [wallet, account, requests] = await Promise.all([
        fetchWalletBalanceApi(token),
        fetchWalletAccountApi(token),
        fetchWithdrawalHistoryApi(token),
      ]);
      setBalance(wallet.balance);
      const savedAccount = account.user.bankAccount;
      if (savedAccount) {
        setBankName(savedAccount.bankName);
        setAccountName(savedAccount.accountName);
        setAccountNumber(savedAccount.accountNumber);
      }
      setHistory(requests);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your withdrawal details.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadData();
  }, [loadData]));

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const result = await fetchNotificationsApi(token);
      setNotifications(result.data);
      setUnreadNotifications(result.unreadCount);
    } catch (loadError) {
      setNotificationsError(loadError instanceof Error ? loadError.message : 'Could not load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const initialLoad = setTimeout(() => { void loadNotifications(); }, 0);
    const interval = setInterval(() => { void loadNotifications(); }, 30000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadNotifications, token]);

  const markNotificationRead = async (notification: UserNotification) => {
    if (!token || notification.readAt || updatingNotificationId) return;
    setUpdatingNotificationId(notification._id);
    setNotificationsError('');
    try {
      const updated = await markNotificationReadApi(token, notification._id);
      setNotifications((current) => current.map((item) => item._id === updated._id ? updated : item));
      setUnreadNotifications((count) => Math.max(0, count - 1));
    } catch (readError) {
      setNotificationsError(readError instanceof Error ? readError.message : 'Could not mark notification as read.');
    } finally {
      setUpdatingNotificationId('');
    }
  };

  const markAllNotificationsRead = async () => {
    if (!token || unreadNotifications === 0 || updatingNotificationId) return;
    setUpdatingNotificationId('all');
    setNotificationsError('');
    try {
      await markAllNotificationsReadApi(token);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      setUnreadNotifications(0);
    } catch (readError) {
      setNotificationsError(readError instanceof Error ? readError.message : 'Could not mark notifications as read.');
    } finally {
      setUpdatingNotificationId('');
    }
  };

  const account = (): SavedBankAccount => ({ bankName: bankName.trim(), accountName: accountName.trim(), accountNumber: accountNumber.replace(/\D/g, '') });

  const saveAccount = async () => {
    const details = account();
    if (!token || !details.bankName || !details.accountName || !/^\d{10}$/.test(details.accountNumber)) {
      setError('Enter the bank name, account holder name, and a valid 10-digit account number.');
      return;
    }
    setSavingBank(true);
    setError('');
    try {
      await saveBankAccountApi(token, details);
      setFeedback({
        title: 'Bank account saved',
        message: 'Your payout account has been saved securely.',
        tone: 'success',
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the bank account.');
    } finally {
      setSavingBank(false);
    }
  };

  const submitWithdrawal = async () => {
    const details = account();
    const amountValue = Number(amount.replace(/[,\s]/g, ''));
    if (!token || !Number.isSafeInteger(amountValue) || amountValue < 100) {
      setError('Enter a whole-number withdrawal amount of at least ₦100.');
      return;
    }
    if (!details.bankName || !details.accountName || !/^\d{10}$/.test(details.accountNumber)) {
      setError('Enter the bank name, account holder name, and a valid 10-digit account number.');
      return;
    }
    setError('');
    setConfirmModalVisible(true);
  };

  const confirmWithdrawal = async () => {
    if (!token) {
      setConfirmModalVisible(false);
      setError('Sign in to request a withdrawal.');
      return;
    }
    const details = account();
    const amountValue = Number(amount.replace(/[,\s]/g, ''));
    setSubmitting(true);
    try {
      const result = await withdrawWalletApi(token, amountValue, details.bankName, details.accountName, details.accountNumber);
      setConfirmModalVisible(false);
      setBalance(result.balance);
      setHistory((current) => [result.request, ...current].slice(0, 10));
      setAmount('');
      setFeedback({
        title: result.request.riskStatus === 'clear' ? 'Request submitted — clear to withdraw' : 'Withdrawal review',
        message: `Reference: ${result.request.reference}\nStatus: ${result.request.status}\nPayouts are processed manually by Cardzip. Your wallet balance has been reserved.`,
        tone: 'success',
      });
    } catch (submitError) {
      setConfirmModalVisible(false);
      await loadData();
      setError(submitError instanceof Error ? submitError.message : 'Could not submit the withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back">
            <Feather name="chevron-left" size={22} color="#12201B" />
          </TouchableOpacity>
          <Text style={styles.title}>Withdraw</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => { void loadNotifications(); setNotificationsVisible(true); }}
              accessibilityLabel={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`}
            >
              <Feather name="bell" size={17} color="#12201B" />
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotifications > 99 ? '99+' : unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyButton} onPress={() => { void loadData(); }} accessibilityLabel="Refresh withdrawal details">
              <Feather name="refresh-cw" size={17} color="#12201B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.label}>Available wallet balance</Text>
          {loading ? <ActivityIndicator color="#00B856" /> : <Text style={styles.balance}>{balance === null ? '—' : naira(balance)}</Text>}
          <Text style={styles.note}>Withdrawal requests are reviewed and paid manually.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payout bank account</Text>
          <TextInput style={styles.input} value={bankName} onChangeText={setBankName} placeholder="Bank name" placeholderTextColor="#82918B" />
          <TextInput style={styles.input} value={accountName} onChangeText={setAccountName} placeholder="Account holder name" placeholderTextColor="#82918B" />
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={(value) => setAccountNumber(value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit account number"
            placeholderTextColor="#82918B"
            keyboardType="number-pad"
            maxLength={10}
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={() => { void saveAccount(); }} disabled={savingBank}>
            {savingBank ? <ActivityIndicator color="#087A40" /> : <Text style={styles.secondaryButtonText}>Save bank account</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Withdrawal amount</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={(value) => setAmount(value.replace(/[^\d]/g, ''))}
            placeholder="Enter amount in naira"
            placeholderTextColor="#82918B"
            keyboardType="number-pad"
          />
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <TouchableOpacity style={styles.submitButton} onPress={() => { void submitWithdrawal(); }} disabled={submitting || loading}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Submit withdrawal request</Text>}
          </TouchableOpacity>
          <Text style={styles.note}>Your balance is checked against transaction history. Requests with a balance mismatch are marked failed and explain why.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent withdrawal requests</Text>
          {loading ? <ActivityIndicator color="#00B856" /> : history.length === 0
            ? <Text style={styles.note}>No withdrawal requests yet.</Text>
            : history.map((request) => (
              <View key={request._id || request.reference} style={styles.requestRow}>
                <View style={styles.requestCopy}>
                  <Text style={styles.requestAmount}>{naira(request.amount)}</Text>
                  <Text style={styles.note}>{request.reference} · {new Date(request.createdAt).toLocaleDateString()}</Text>
                  {request.riskReason ? <Text style={styles.error}>{request.riskReason}</Text> : null}
                </View>
                <Text style={[styles.status, request.riskStatus === 'failed' && styles.failedStatus]}>
                  {request.riskStatus === 'clear' ? 'Clear to withdraw' : request.status}
                </Text>
              </View>
            ))}
        </View>
      </KeyboardAwareScrollView>
      <Modal
        transparent
        animationType="fade"
        visible={confirmModalVisible}
        onRequestClose={() => { if (!submitting) setConfirmModalVisible(false); }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModal}>
            <View style={styles.modalIcon}>
              <Feather name="arrow-up-right" size={22} color="#087A40" />
            </View>
            <Text style={styles.modalTitle}>Confirm withdrawal</Text>
            <Text style={styles.modalMessage}>Review the amount and payout account before submitting your request.</Text>
            <View style={styles.confirmDetails}>
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmLabel}>Withdrawal amount</Text>
                <Text style={styles.confirmAmount}>{naira(Number(amount.replace(/[,\s]/g, '')) || 0)}</Text>
              </View>
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmLabel}>Bank</Text>
                <Text style={styles.confirmValue}>{bankName.trim()}</Text>
              </View>
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmLabel}>Account name</Text>
                <Text style={styles.confirmValue}>{accountName.trim()}</Text>
              </View>
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmLabel}>Account number</Text>
                <Text style={styles.confirmValue}>{accountNumber.replace(/\D/g, '')}</Text>
              </View>
            </View>
            <Text style={styles.modalNote}>Your balance will be reserved when the request is submitted. Payouts are reviewed and processed manually.</Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => { void confirmWithdrawal(); }}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Confirm and submit</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setConfirmModalVisible(false)}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.notificationsModal}>
            <View style={styles.notificationsHeader}>
              <View>
                <Text style={styles.modalTitle}>Notifications</Text>
                <Text style={styles.notificationsSubtitle}>{unreadNotifications} unread</Text>
              </View>
              <View style={styles.notificationHeaderActions}>
                <TouchableOpacity
                  onPress={() => { void markAllNotificationsRead(); }}
                  disabled={unreadNotifications === 0 || updatingNotificationId !== ''}
                  style={styles.markAllButton}
                >
                  <Text style={styles.markAllText}>{updatingNotificationId === 'all' ? 'Saving…' : 'Mark all read'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setNotificationsVisible(false)} style={styles.closeButton} accessibilityLabel="Close notifications">
                  <Feather name="x" size={20} color="#12201B" />
                </TouchableOpacity>
              </View>
            </View>
            {notificationsError ? <Text style={styles.error} accessibilityRole="alert">{notificationsError}</Text> : null}
            {notificationsLoading && notifications.length === 0 ? (
              <ActivityIndicator color="#00B856" />
            ) : notifications.length === 0 ? (
              <Text style={styles.note}>No notifications yet.</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.notificationList}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification._id}
                    activeOpacity={0.85}
                    disabled={Boolean(notification.readAt) || updatingNotificationId !== ''}
                    style={[styles.notificationRow, !notification.readAt && styles.unreadNotificationRow]}
                    onPress={() => { void markNotificationRead(notification); }}
                  >
                    <View style={styles.notificationIcon}>
                      <Feather name="bell" size={16} color="#087A40" />
                    </View>
                    <View style={styles.notificationCopy}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationDate}>{new Date(notification.occurredAt).toLocaleString()}</Text>
                    </View>
                    {!notification.readAt && (
                      <Text style={styles.markReadText}>{updatingNotificationId === notification._id ? '…' : 'Mark read'}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  container: { padding: 16, paddingBottom: 36, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  historyButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  notificationBadge: { position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#B42318' },
  notificationBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  title: { color: '#12201B', fontSize: 19, fontWeight: '800' },
  balanceCard: { alignItems: 'center', padding: 22, borderRadius: 20, backgroundColor: '#FFFFFF', gap: 8 },
  label: { color: '#82918B', fontWeight: '600' },
  balance: { color: '#12201B', fontSize: 30, fontWeight: '900' },
  note: { color: '#82918B', fontSize: 12, lineHeight: 18 },
  card: { padding: 16, borderRadius: 18, backgroundColor: '#FFFFFF', gap: 10 },
  sectionTitle: { color: '#12201B', fontSize: 15, fontWeight: '800' },
  input: { minHeight: 46, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F3F6F4', color: '#12201B' },
  amountInput: { minHeight: 52, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F3F6F4', color: '#12201B', fontSize: 18, fontWeight: '700' },
  secondaryButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E8F8EE' },
  secondaryButtonText: { color: '#087A40', fontWeight: '700' },
  submitButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#00B856' },
  submitText: { color: '#FFFFFF', fontWeight: '800' },
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
  requestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5EAE7' },
  requestCopy: { flex: 1, gap: 3 },
  requestAmount: { color: '#12201B', fontWeight: '800' },
  status: { color: '#087A40', fontSize: 12, fontWeight: '700', textAlign: 'right' },
  failedStatus: { color: '#B42318' },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(9, 20, 15, 0.55)' },
  confirmModal: { padding: 20, borderRadius: 20, backgroundColor: '#FFFFFF', gap: 12 },
  modalIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: '#E8F8EE' },
  modalTitle: { color: '#12201B', fontSize: 20, fontWeight: '900' },
  modalMessage: { color: '#64746D', fontSize: 13, lineHeight: 19 },
  confirmDetails: { padding: 14, borderRadius: 12, backgroundColor: '#F4F6F5', gap: 12 },
  confirmDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  confirmLabel: { flex: 1, color: '#82918B', fontSize: 12 },
  confirmValue: { flex: 1, color: '#12201B', fontSize: 13, fontWeight: '700', textAlign: 'right' },
  confirmAmount: { color: '#087A40', fontSize: 16, fontWeight: '900', textAlign: 'right' },
  modalNote: { color: '#82918B', fontSize: 12, lineHeight: 18 },
  cancelButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F3F6F4' },
  cancelButtonText: { color: '#12201B', fontWeight: '700' },
  notificationsModal: { maxHeight: '82%', padding: 18, borderRadius: 20, backgroundColor: '#FFFFFF', gap: 12 },
  notificationsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  notificationsSubtitle: { marginTop: 3, color: '#82918B', fontSize: 12 },
  notificationHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  markAllButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E8F8EE' },
  markAllText: { color: '#087A40', fontSize: 12, fontWeight: '700' },
  closeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#F3F6F4' },
  notificationList: { gap: 8, paddingBottom: 4 },
  notificationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12, backgroundColor: '#F7F9F8' },
  unreadNotificationRow: { backgroundColor: '#E8F8EE' },
  notificationIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFF' },
  notificationCopy: { flex: 1, gap: 3 },
  notificationTitle: { color: '#12201B', fontSize: 13, fontWeight: '800' },
  notificationMessage: { color: '#47564F', fontSize: 12, lineHeight: 17 },
  notificationDate: { color: '#82918B', fontSize: 10 },
  markReadText: { color: '#087A40', fontSize: 10, fontWeight: '700' },
});
