import React, { useEffect, useState } from 'react';
import { ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAppSelector } from '../../../store';
import { fetchStoreOrderApi } from '../../../services/api/storeApi';
import { StoreOrder } from '../../../types/store';
import { formatNaira } from '../../../utils/currency';
import MarketBottomTab from './bottomtab/bottomtab';

const formatDate = (value?: string | null) => value
  ? new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
  : 'Not available';
const statusLabel = (status: StoreOrder['status']) => status.charAt(0).toUpperCase() + status.slice(1);
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character] || character));
const publicWebsiteUrl = (process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://cardzip.com.ng').replace(/\/$/, '');

const makeReceiptHtml = (order: StoreOrder) => {
  const itemRows = order.items.map((item) => `
    <tr><td>${escapeHtml(item.name)}<small>Qty ${item.quantity}</small></td><td>${formatNaira(item.price * item.quantity, { minimumFractionDigits: 2 })}</td></tr>
  `).join('');
  const address = order.shippingAddress;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#0f172a;margin:36px}header{display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:18px}.brand{display:flex;align-items:center;gap:12px}.brand img{width:48px;height:48px;border-radius:10px;object-fit:cover}h1{font-size:22px;margin:0;color:#047857}h2{font-size:15px;margin:28px 0 10px}.eyebrow{font-size:9px;letter-spacing:1.5px;color:#64748b;margin-top:5px}.status{text-align:right;color:#047857;font-weight:bold}p{color:#475569;font-size:12px;line-height:1.6}.meta{display:flex;justify-content:space-between;margin:18px 0;color:#64748b;font-size:11px}table{width:100%;border-collapse:collapse;margin-top:14px}td{padding:12px 4px;border-bottom:1px solid #e2e8f0;font-size:12px}td:last-child{text-align:right;white-space:nowrap}small{display:block;color:#64748b;margin-top:4px}.totals{margin:18px 0 0 auto;width:250px}.totals div{display:flex;justify-content:space-between;padding:7px 0;font-size:12px}.total{border-top:1px solid #cbd5e1;font-weight:bold;font-size:15px!important;color:#047857}.address{background:#f8fafc;padding:14px;border-radius:8px}footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;text-align:center;font-size:10px;color:#64748b}
  </style></head><body>
    <header><div class="brand"><img src="${publicWebsiteUrl}/cardzip-logo.jpg" alt="Cardzip logo"><div><h1>Cardzip</h1><div class="eyebrow">E-COMMERCE RECEIPT</div></div></div><div class="status">PAYMENT ${escapeHtml(order.paymentStatus.toUpperCase())}</div></header>
    <div class="meta"><span>Order ${escapeHtml(order.orderNumber)}</span><span>Placed ${escapeHtml(formatDate(order.createdAt))}</span></div>
    <p>Order status: <strong>${escapeHtml(statusLabel(order.status))}</strong></p>
    <h2>Items</h2><table>${itemRows}</table>
    <div class="totals"><div><span>Subtotal</span><strong>${formatNaira(order.subtotal, { minimumFractionDigits: 2 })}</strong></div><div><span>Delivery</span><strong>${formatNaira(order.shippingFee, { minimumFractionDigits: 2 })}</strong></div><div class="total"><span>Total paid</span><strong>${formatNaira(order.total, { minimumFractionDigits: 2 })}</strong></div></div>
    <h2>Delivery details</h2><p class="address">${escapeHtml(address.name)}<br>${escapeHtml(address.phone)}<br>${escapeHtml(address.address)}, ${escapeHtml(address.state)}</p>
    <p>Paid with ${escapeHtml(order.paymentMethod === 'paystack' ? 'Paystack' : 'Cardzip wallet')}</p>
    <footer>Thank you for shopping with Cardzip. Keep this receipt for your records.</footer>
  </body></html>`;
};

export default function OrderReceiptScreen() {
  const { width } = useWindowDimensions();
  const token = useAppSelector((state) => state.auth.token);
  const params = useLocalSearchParams<{ orderNumber?: string | string[] }>();
  const orderNumber = Array.isArray(params.orderNumber) ? params.orderNumber[0] : params.orderNumber;
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const scale = (size: number) => (width / 375) * size;

  useEffect(() => {
    let active = true;
    if (!token || !orderNumber) {
      setError('Sign in and open a valid order reference to view its receipt.');
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setError('');
    void fetchStoreOrderApi(token, orderNumber)
      .then((result) => { if (active) setOrder(result); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load this order.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderNumber, token]);

  const downloadReceipt = async () => {
    if (!order) return;
    if (order.paymentStatus !== 'paid') {
      setDownloadError('A receipt is available after payment is confirmed.');
      return;
    }
    setDownloading(true);
    setDownloadError('');
    try {
      const html = makeReceiptHtml(order);
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }
      const file = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        setDownloadError('The PDF was created, but sharing is unavailable on this device.');
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Receipt for order ${order.orderNumber}`,
        UTI: 'com.adobe.pdf',
      });
    } catch (downloadFailure) {
      console.error('Order receipt PDF could not be generated:', downloadFailure);
      setDownloadError('Could not prepare the PDF receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}><ActivityIndicator size="large" color="#10B981" /><Text style={styles.loadingText}>Loading order…</Text></View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorState}>
          <Feather name="package" size={scale(34)} color="#10B981" />
          <Text style={styles.errorTitle}>Order unavailable</Text>
          <Text style={styles.errorMessage}>{error || 'We could not find this order.'}</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(main)/market/orders')}>
            <Feather name="arrow-left" size={scale(16)} color="#0F172A" /><Text style={styles.secondaryButtonText}>Back to orders</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const isShipped = order.status === 'shipped' || order.status === 'delivered';
  const isDelivered = order.status === 'delivered';
  const statusIcon = isCancelled ? 'close-circle-outline' : isDelivered ? 'checkmark-circle-outline' : 'time-outline';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} accessibilityLabel="Back to orders" onPress={() => router.replace('/(main)/market/orders')}>
          <Feather name="arrow-left" size={scale(19)} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>CARDZIP MARKET</Text><Text style={styles.headerTitle}>Order receipt</Text></View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: scale(16) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroStatus}><Ionicons name={statusIcon as never} size={scale(15)} color={isCancelled ? '#F87171' : '#6EE7B7'} /><Text style={[styles.heroStatusText, isCancelled && styles.cancelledText]}>{statusLabel(order.status).toUpperCase()}</Text></View>
          <Text style={styles.heroTitle}>{isDelivered ? 'Your order has arrived.' : isCancelled ? 'This order was cancelled.' : isShipped ? 'Your order has shipped.' : 'Your order is being prepared.'}</Text>
          <Text style={styles.heroDescription}>{order.courierService ? `Courier: ${order.courierService}. ` : 'Delivery tracking details will appear once the order is dispatched. '}{order.estimatedDelivery ? `Estimated delivery: ${formatDate(order.estimatedDelivery)}.` : ''}</Text>
          <View style={styles.orderReference}><Text style={styles.referenceLabel}>ORDER NUMBER</Text><Text style={styles.referenceNumber}>{order.orderNumber}</Text><Text style={styles.referenceDate}>Placed {formatDate(order.createdAt)}</Text></View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}><MaterialCommunityIcons name="timeline-clock-outline" size={scale(19)} color="#047857" /><Text style={styles.sectionTitle}>Order status</Text></View>
          {order.status === 'cancelled' ? <View style={styles.infoRow}><Text style={styles.infoLabel}>Cancellation reason</Text><Text style={styles.infoValue}>{order.cancellationReason || 'Contact support for more details.'}</Text></View> : null}
          {order.courierService ? <View style={styles.infoRow}><Text style={styles.infoLabel}>Courier</Text><Text style={styles.infoValue}>{order.courierService}</Text></View> : null}
          {order.trackingNumber ? <View style={styles.infoRow}><Text style={styles.infoLabel}>Tracking number</Text><Text selectable style={styles.infoValue}>{order.trackingNumber}</Text></View> : null}
          {order.estimatedDelivery ? <View style={styles.infoRow}><Text style={styles.infoLabel}>Estimated delivery</Text><Text style={styles.infoValue}>{formatDate(order.estimatedDelivery)}</Text></View> : null}
          {order.trackingUrl ? <TouchableOpacity style={styles.trackLink} onPress={() => void Linking.openURL(order.trackingUrl!)}><Text style={styles.trackLinkText}>Track with {order.courierService || 'courier'}</Text><Feather name="arrow-up-right" size={scale(15)} color="#047857" /></TouchableOpacity> : null}
          <View style={styles.timeline}>
            <TimelineStep title="Order placed" detail="Order received by Cardzip" date={formatDate(order.createdAt)} complete />
            {order.status !== 'cancelled' ? <TimelineStep title="Shipped" detail={isShipped ? `${order.courierService || 'Courier'}${order.trackingNumber ? ` · ${order.trackingNumber}` : ''}` : 'Awaiting dispatch'} date={isShipped ? 'In progress' : '—'} complete={isShipped} /> : null}
            {order.status !== 'cancelled' ? <TimelineStep title="Delivered" detail={isDelivered ? 'Order marked as delivered' : 'Not yet delivered'} date={isDelivered ? 'Complete' : '—'} complete={isDelivered} last /> : <TimelineStep title="Cancelled" detail={order.cancellationReason || 'Order cancelled'} date="—" complete last cancelled />}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}><Feather name="shopping-bag" size={scale(18)} color="#047857" /><Text style={styles.sectionTitle}>Items in this order</Text></View>
          <Text style={styles.sectionCaption}>{order.items.length} product line(s)</Text>
          {order.items.map((item, index) => (
            <View key={item.id || item.product || `${item.name}-${index}`} style={styles.itemRow}>
              <View style={styles.itemIcon}><Feather name="package" size={scale(17)} color="#047857" /></View>
              <View style={styles.itemCopy}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemQuantity}>Qty {item.quantity}</Text></View>
              <Text style={styles.itemPrice}>{formatNaira(item.price * item.quantity, { minimumFractionDigits: 2 })}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}><Feather name="map-pin" size={scale(18)} color="#047857" /><Text style={styles.sectionTitle}>Delivery address</Text></View>
          <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
          <Text style={styles.addressDetail}>{order.shippingAddress.phone}{'\n'}{order.shippingAddress.address}, {order.shippingAddress.state}</Text>
        </View>

        <View style={styles.receiptCard}>
          <View style={styles.receiptHeading}><Feather name="file-text" size={scale(18)} color="#047857" /><View style={styles.receiptHeadingCopy}><Text style={styles.sectionTitle}>Payment receipt</Text><Text style={styles.sectionCaption}>Order {order.orderNumber}</Text></View><View style={[styles.paymentBadge, order.paymentStatus !== 'paid' && styles.paymentBadgePending]}><Text style={styles.paymentBadgeText}>{order.paymentStatus.toUpperCase()}</Text></View></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Subtotal</Text><Text style={styles.infoValue}>{formatNaira(order.subtotal, { minimumFractionDigits: 2 })}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Delivery</Text><Text style={styles.infoValue}>{formatNaira(order.shippingFee, { minimumFractionDigits: 2 })}</Text></View>
          <View style={[styles.infoRow, styles.totalRow]}><Text style={styles.totalLabel}>{order.paymentStatus === 'paid' ? 'Total paid' : 'Order total'}</Text><Text style={styles.totalAmount}>{formatNaira(order.total, { minimumFractionDigits: 2 })}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Paid with</Text><Text style={styles.infoValue}>{order.paymentMethod === 'paystack' ? 'Paystack' : 'Cardzip wallet'}</Text></View>
          {downloadError ? <Text style={styles.downloadError}>{downloadError}</Text> : null}
          <TouchableOpacity style={[styles.downloadButton, (downloading || order.paymentStatus !== 'paid') && styles.downloadButtonDisabled]} onPress={() => void downloadReceipt()} disabled={downloading || order.paymentStatus !== 'paid'}>
            {downloading ? <ActivityIndicator color="#FFFFFF" /> : <Feather name="download" size={scale(17)} color="#FFFFFF" />}
            <Text style={styles.downloadButtonText}>{downloading ? 'Preparing PDF…' : order.paymentStatus === 'paid' ? 'Download PDF receipt' : 'Receipt available after payment'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.helpButton} onPress={() => router.push('/(main)/property/support')}>
          <Feather name="message-circle" size={scale(17)} color="#047857" /><Text style={styles.helpText}>Need help with this order?</Text><Feather name="arrow-right" size={scale(16)} color="#047857" />
        </TouchableOpacity>
      </ScrollView>
      <MarketBottomTab activeTab="Orders" />
    </SafeAreaView>
  );
}

function TimelineStep({ title, detail, date, complete, last = false, cancelled = false }: { title: string; detail: string; date: string; complete: boolean; last?: boolean; cancelled?: boolean }) {
  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineTrack}>
        <View style={[styles.timelineDot, complete && styles.timelineDotComplete, cancelled && styles.timelineDotCancelled]}>{complete ? <Feather name={cancelled ? 'x' : 'check'} size={10} color="#FFFFFF" /> : null}</View>
        {!last ? <View style={[styles.timelineLine, complete && styles.timelineLineComplete]} /> : null}
      </View>
      <View style={styles.timelineCopy}><Text style={styles.timelineTitle}>{title}</Text><Text style={styles.timelineDetail}>{detail}</Text></View>
      <Text style={styles.timelineDate}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F5' },
  header: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#0B1220' },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.09)' },
  headerCopy: { flex: 1 },
  headerSpacer: { width: 38 },
  eyebrow: { color: '#6EE7B7', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginTop: 3 },
  content: { paddingTop: 16, paddingBottom: 34, gap: 12 },
  hero: { backgroundColor: '#0B1220', padding: 18, borderRadius: 16 },
  heroStatus: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.14)' },
  heroStatusText: { color: '#6EE7B7', fontSize: 10, fontWeight: '800' },
  cancelledText: { color: '#FCA5A5' },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 14 },
  heroDescription: { color: '#CBD5E1', fontSize: 12, lineHeight: 18, marginTop: 7 },
  orderReference: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', marginTop: 16, paddingTop: 13 },
  referenceLabel: { color: '#94A3B8', fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  referenceNumber: { color: '#6EE7B7', fontSize: 17, fontWeight: '800', marginTop: 4 },
  referenceDate: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  section: { padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 },
  sectionTitle: { color: '#0F172A', fontSize: 15, fontWeight: '800', flexShrink: 1 },
  sectionCaption: { color: '#64748B', fontSize: 11, marginBottom: 8 },
  infoRow: { minHeight: 33, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 7 },
  infoLabel: { color: '#64748B', fontSize: 12, flex: 1 },
  infoValue: { color: '#0F172A', fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'right' },
  trackLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 12, paddingVertical: 7 },
  trackLinkText: { color: '#047857', fontSize: 12, fontWeight: '700' },
  timeline: { marginTop: 14 },
  timelineStep: { minHeight: 48, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  timelineTrack: { width: 18, alignItems: 'center', alignSelf: 'stretch' },
  timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineDotComplete: { backgroundColor: '#059669' },
  timelineDotCancelled: { backgroundColor: '#DC2626' },
  timelineLine: { position: 'absolute', top: 15, bottom: -2, width: 2, backgroundColor: '#E2E8F0' },
  timelineLineComplete: { backgroundColor: '#6EE7B7' },
  timelineCopy: { flex: 1, paddingBottom: 12 },
  timelineTitle: { color: '#0F172A', fontSize: 12, fontWeight: '700' },
  timelineDetail: { color: '#64748B', fontSize: 11, marginTop: 3 },
  timelineDate: { color: '#94A3B8', fontSize: 10, maxWidth: '32%', textAlign: 'right' },
  itemRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  itemIcon: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5' },
  itemCopy: { flex: 1 },
  itemName: { color: '#0F172A', fontSize: 12, fontWeight: '700' },
  itemQuantity: { color: '#64748B', fontSize: 11, marginTop: 3 },
  itemPrice: { color: '#0F172A', fontSize: 12, fontWeight: '800' },
  addressName: { color: '#0F172A', fontSize: 13, fontWeight: '700', marginTop: 4 },
  addressDetail: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 5 },
  receiptCard: { padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1FAE5' },
  receiptHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  receiptHeadingCopy: { flex: 1 },
  paymentBadge: { backgroundColor: '#DCFCE7', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  paymentBadgePending: { backgroundColor: '#FEF3C7' },
  paymentBadgeText: { color: '#047857', fontSize: 9, fontWeight: '800' },
  totalRow: { borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 4, paddingTop: 12 },
  totalLabel: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
  totalAmount: { color: '#047857', fontSize: 16, fontWeight: '900' },
  downloadButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 11, backgroundColor: '#047857', marginTop: 14, paddingHorizontal: 12 },
  downloadButtonDisabled: { opacity: 0.55 },
  downloadButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  downloadError: { color: '#B91C1C', fontSize: 11, marginTop: 8 },
  helpButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  helpText: { flex: 1, color: '#0F172A', fontSize: 12, fontWeight: '700' },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26, gap: 12 },
  errorTitle: { color: '#0F172A', fontSize: 20, fontWeight: '800' },
  errorMessage: { color: '#64748B', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  secondaryButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#10B981', marginTop: 5 },
  secondaryButtonText: { color: '#0F172A', fontSize: 12, fontWeight: '800' },
});
