import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Responsive scaling helpers based on reference screen size (375 x 812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface OrderSuccessModalProps {
  visible?: boolean;
  onClose?: () => void;
  onViewOrders?: () => void;
}

export default function OrderSuccessModal({
  visible = true,
  onClose,
  onViewOrders,
}: OrderSuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Feather name="x" size={scale(18)} color="#94A3B8" />
          </TouchableOpacity>

          {/* Success Check Badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.badgeOuterRing}>
              <View style={styles.badgeInnerCircle}>
                <Ionicons name="checkmark" size={scale(28)} color="#0F172A" />
              </View>
            </View>
          </View>

          {/* Title and Order Info */}
          <Text style={styles.title}>Order Placed{"\n"}Successfully!</Text>

          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdText}>#ORD-58241</Text>
            <Text style={styles.bulletDot}> • </Text>
            <Text style={styles.statusText}>PROCESSING</Text>
          </View>

          <Text style={styles.subtitle}>
            Your everyday upgrade is on its way. We'll notify you as soon as it ships.
          </Text>

          {/* Order Summary Box */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryHeader}>ORDER SUMMARY</Text>

            <Text style={styles.itemText}>Wireless Developer Headset × 1</Text>
            <Text style={styles.itemText}>Aluminium Laptop Stand × 1</Text>

            <View style={styles.priceRow}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>₦33,000.00</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.label}>Shipping</Text>
              <Text style={styles.value}>₦1,500.00</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.label}>Wallet deduction</Text>
              <Text style={styles.deductionValue}>-₦34,500.00</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.label}>Previous balance</Text>
              <Text style={styles.value}>₦45,200.00</Text>
            </View>

            <View style={[styles.priceRow, { marginTop: verticalScale(4) }]}>
              <Text style={styles.label}>Remaining balance</Text>
              <Text style={styles.remainingBalanceValue}>₦10,700.00</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onViewOrders} activeOpacity={0.85}>
            <Feather name="arrow-right" size={scale(18)} color="#0F172A" style={{ marginRight: scale(6) }} />
            <Text style={styles.actionButtonText}>View Active Orders</Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <Text style={styles.footerNote}>Your receipt is saved in Order History.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(16),
  },
  modalCard: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#0B1220',
    borderRadius: scale(24),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(24),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: verticalScale(16),
    right: scale(16),
    padding: scale(6),
    zIndex: 10,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  badgeOuterRing: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInnerCircle: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: moderateScale(28),
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  orderIdText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  bulletDot: {
    fontSize: moderateScale(11),
    color: '#64748B',
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: moderateScale(17),
    marginTop: verticalScale(8),
    paddingHorizontal: scale(10),
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#131C2E',
    borderRadius: scale(16),
    padding: scale(16),
    marginTop: verticalScale(18),
    marginBottom: verticalScale(18),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryHeader: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: verticalScale(10),
  },
  itemText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: verticalScale(4),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  value: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: verticalScale(10),
  },
  deductionValue: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#CBD5E1',
  },
  remainingBalanceValue: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#10B981',
  },
  actionButton: {
    width: '100%',
    height: verticalScale(48),
    backgroundColor: '#10B981',
    borderRadius: scale(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  actionButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  footerNote: {
    fontSize: moderateScale(11),
    color: '#64748B',
    textAlign: 'center',
  },
});