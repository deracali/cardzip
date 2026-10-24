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
import { StoreOrder } from '../../../types/store';
import { formatNaira } from '../../../utils/currency';

const { width, height } = Dimensions.get('window');

// Responsive scaling helpers based on reference screen size (375 x 812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface OrderSuccessModalProps {
  visible: boolean;
  order: StoreOrder | null;
  onClose: () => void;
  onViewReceipt: () => void;
}

export default function OrderSuccessModal({
  visible,
  order,
  onClose,
  onViewReceipt,
}: OrderSuccessModalProps) {
  if (!order) return null;

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
            <Text style={styles.orderIdText}>#{order.orderNumber}</Text>
            <Text style={styles.bulletDot}> • </Text>
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>

          <Text style={styles.subtitle}>
            Your order is confirmed. Track its progress and download your receipt anytime.
          </Text>

          {/* Order Summary Box */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryHeader}>ORDER SUMMARY</Text>

            {order.items.slice(0, 2).map((item) => (
              <Text key={item.id || item.product || item.name} style={styles.itemText} numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
            ))}
            {order.items.length > 2 ? <Text style={styles.itemText}>and {order.items.length - 2} more item(s)</Text> : null}

            <View style={styles.priceRow}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>{formatNaira(order.subtotal, { minimumFractionDigits: 2 })}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.label}>Shipping</Text>
              <Text style={styles.value}>{formatNaira(order.shippingFee, { minimumFractionDigits: 2 })}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.label}>Total paid</Text>
              <Text style={styles.remainingBalanceValue}>{formatNaira(order.total, { minimumFractionDigits: 2 })}</Text>
            </View>
            <Text style={styles.label}>Paid with {order.paymentMethod === 'paystack' ? 'Paystack' : 'Cardzip wallet'}</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onViewReceipt} activeOpacity={0.85}>
            <Feather name="file-text" size={scale(18)} color="#0F172A" style={{ marginRight: scale(6) }} />
            <Text style={styles.actionButtonText}>View receipt & track</Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <Text style={styles.footerNote}>Order details are available in Order History.</Text>
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  bulletDot: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#64748B',
  },
  statusText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: verticalScale(10),
  },
  itemText: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  value: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#CBD5E1',
  },
  remainingBalanceValue: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  footerNote: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#64748B',
    textAlign: 'center',
  },
});