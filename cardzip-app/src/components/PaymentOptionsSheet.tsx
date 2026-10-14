import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentOptionsSheetProps {
  visible: boolean;
  amount?: number;
  walletBalance?: number;
  walletEnabled?: boolean;
  allowInsufficientWallet?: boolean;
  providerLabel?: string;
  onClose: () => void;
  onPayFromWallet?: () => void;
  onContinueWithProvider?: () => void;
}

const formatCurrency = (amount: number) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

export default function PaymentOptionsSheet({
  visible,
  amount,
  walletBalance = 0,
  walletEnabled = false,
  allowInsufficientWallet = false,
  providerLabel = 'Pay with Paystack',
  onClose,
  onPayFromWallet,
  onContinueWithProvider,
}: PaymentOptionsSheetProps) {
  const hasAmount = Number.isFinite(amount) && Number(amount) > 0;
  const hasFunds = !hasAmount || walletBalance >= Number(amount);
  const canPayFromWallet = walletEnabled && (hasFunds || allowInsufficientWallet) && Boolean(onPayFromWallet);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headingRow}>
            <View>
              <Text style={styles.title}>Choose payment method</Text>
              {hasAmount ? <Text style={styles.subtitle}>Amount due · {formatCurrency(Number(amount))}</Text> : null}
            </View>
            <TouchableOpacity accessibilityLabel="Close payment options" onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.option, !canPayFromWallet && styles.optionDisabled]}
            disabled={!canPayFromWallet}
            onPress={onPayFromWallet}
          >
            <View style={[styles.optionIcon, styles.walletIcon]}>
              <Feather name="credit-card" size={19} color="#047857" />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Pay from wallet</Text>
              <Text style={styles.optionSubtitle}>
                {walletEnabled
                  ? `Available · ${formatCurrency(walletBalance)}${hasFunds ? '' : ' · Insufficient balance'}`
                  : 'Wallet payment is not available for this service yet'}
              </Text>
            </View>
            <Feather name={canPayFromWallet ? 'chevron-right' : 'lock'} size={18} color="#64748B" />
          </TouchableOpacity>

          {onContinueWithProvider ? (
            <TouchableOpacity style={styles.option} onPress={onContinueWithProvider}>
              <View style={[styles.optionIcon, styles.providerIcon]}>
                <Feather name="arrow-up-right" size={19} color="#1D4ED8" />
              </View>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{providerLabel}</Text>
                <Text style={styles.optionSubtitle}>Pay securely with Paystack</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
          ) : null}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2, 6, 23, 0.52)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginBottom: 18 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: '#0F172A', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  option: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, marginBottom: 10 },
  optionDisabled: { opacity: 0.58 },
  optionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  walletIcon: { backgroundColor: '#D1FAE5' },
  providerIcon: { backgroundColor: '#DBEAFE' },
  optionCopy: { flex: 1 },
  optionTitle: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  optionSubtitle: { color: '#64748B', fontSize: 11, marginTop: 4 },
});