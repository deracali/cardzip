import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NumberHubConfirmModalProps = {
  visible: boolean;
  onClose: () => void;
  onAuthorize: () => void;
  country?: string;
  countryCode?: string;
  service?: string;
  duration?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  purchasing?: boolean;
  styles: any;
  colors: any;
};

export default function NumberHubConfirmModal({
  visible,
  onClose,
  onAuthorize,
  country = 'US',
  countryCode = 'US',
  service = 'WhatsApp',
  duration = '30 Days',
  price = 7920,
  originalPrice,
  currency = 'NGN',
  purchasing = false,
  styles,
  colors,
}: NumberHubConfirmModalProps) {
  const formatPrice = (amount: number) => currency === 'NGN'
    ? `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    : `${currency} ${amount.toFixed(2)}`;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Number Rental</Text>
            <TouchableOpacity style={styles.closeCircleBtn} onPress={onClose}>
              <Ionicons name="close" size={16} color={colors.textMutedLight} />
            </TouchableOpacity>
          </View>

          <View style={styles.numberPreviewBox}>
            <Text style={styles.previewCountryText}>{countryCode}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.previewNumberText}>Assigned after purchase</Text>
              <Text style={styles.previewSubtext}>{service} • {duration} • {country}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={18} color={colors.accentGreen} />
          </View>

          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Plan ({duration})</Text>
              <Text style={styles.breakdownValue}>{formatPrice(price)}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>API discount (50%)</Text>
              <Text style={[styles.breakdownValue, { color: colors.accentGreen }]}>
                {originalPrice === undefined ? 'Provider price' : `-${formatPrice(Math.max(0, originalPrice - price))}`}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Provider currency</Text>
              <Text style={styles.breakdownValue}>{currency}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.totalDueLabel}>Total due</Text>
              <Text style={styles.totalDueValue}>{formatPrice(price)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.authorizeButton} onPress={onAuthorize} disabled={purchasing}>
            <Ionicons name="lock-closed" size={15} color="#FFFFFF" />
            <Text style={styles.authorizeButtonText}>{purchasing ? ' Processing...' : ' Authorize & Pay'}</Text>
          </TouchableOpacity>

          <Text style={styles.modalFooterText}>Secured by Fleexa Pay • Instant activation</Text>
        </View>
      </View>
    </Modal>
  );
}
