import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  bookShopAppointmentApi,
  fetchMyBookedShopAppointmentsApi,
  fetchShopApi,
  fetchShopAppointmentsApi,
  fetchShopProductsApi,
} from '../../../../services/api/storeApi';
import type { ShopAppointment, ShopProduct, ShopProfile } from '../../../../types/shop';
import { useAppSelector } from '../../../../store';
import { formatNaira } from '../../../../utils/currency';

const formatAppointmentDate = (date?: string | null) => date
  ? new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  : 'Not available';

const publicWebsiteUrl = (process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://cardzip.com.ng').replace(/\/$/, '');

export default function PublicBusinessScreen() {
  const router = useRouter();
  const { slug: routeSlug } = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(routeSlug) ? routeSlug[0] : routeSlug;
  const token = useAppSelector((state) => state.auth.token);
  const [business, setBusiness] = useState<ShopProfile | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [appointments, setAppointments] = useState<ShopAppointment[]>([]);
  const [myBookings, setMyBookings] = useState<ShopAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState('');
  const [downloadingReceiptId, setDownloadingReceiptId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    const loadBusiness = async () => {
      if (!slug) {
        setError('Business page not found.');
        setLoading(false);
        return;
      }
      try {
        const result = await fetchShopApi(slug);
        if (!active) return;
        setBusiness(result);
        if (result.shopType === 'store') {
          const productResult = await fetchShopProductsApi(slug);
          if (active) setProducts(productResult.items);
          return;
        }
        const [available, bookings] = await Promise.all([
          fetchShopAppointmentsApi(slug),
          token ? fetchMyBookedShopAppointmentsApi(token) : Promise.resolve([]),
        ]);
        if (active) {
          setAppointments(available);
          setMyBookings(bookings.filter((appointment) => typeof appointment.shop === 'object' && appointment.shop.slug === result.slug));
        }
      } catch (requestError) {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load this business page.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadBusiness();
    return () => { active = false; };
  }, [slug, token]);

  const bookAppointment = async (appointmentId: string) => {
    if (!token) {
      router.push('/(auth)/login' as Href);
      return;
    }
    if (!slug) return;
    setBookingId(appointmentId);
    setError('');
    setNotice('');
    try {
      const bookedAppointment = await bookShopAppointmentApi(token, slug, appointmentId);
      setAppointments((current) => current.filter((appointment) => appointment._id !== appointmentId));
      setMyBookings((current) => [{ ...bookedAppointment, shop: business || bookedAppointment.shop }, ...current]);
      setNotice('Your booking request was sent. The business will review and confirm it.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not book this appointment.');
    } finally {
      setBookingId('');
    }
  };

  const downloadAppointmentReceipt = async (appointment: ShopAppointment) => {
    if (!business) return;
    const appointmentShop = typeof appointment.shop === 'object' ? appointment.shop : business;
    setDownloadingReceiptId(appointment._id);
    setError('');
    try {
      const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[character] || character));
      const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
        body{font-family:Arial,sans-serif;color:#17281f;margin:36px}header{display:flex;align-items:center;gap:12px;border-bottom:1px solid #dce9df;padding-bottom:16px}.brand{display:flex;align-items:center;gap:12px}.brand img{width:48px;height:48px;border-radius:10px;object-fit:cover}h1{margin:0;color:#087a4c;font-size:24px}.eyebrow{margin-top:5px;color:#718077;font-size:10px;letter-spacing:1.5px}.status{margin:18px 0;padding:10px;border-radius:8px;background:#f1f8f3;font-weight:bold;text-transform:uppercase}dl{margin-top:20px}dt{margin-top:14px;color:#718077;font-size:10px;text-transform:uppercase}dd{margin:4px 0 0;font-size:13px}footer{margin-top:30px;padding-top:12px;border-top:1px solid #dce9df;color:#718077;font-size:10px}
      </style></head><body><header><div class="brand"><img src="${publicWebsiteUrl}/cardzip-logo.jpg" alt="Cardzip logo"><div><h1>Cardzip</h1><div class="eyebrow">APPOINTMENT BOOKING RECEIPT</div></div></div></header>
      <p><strong>Receipt reference:</strong> ${escapeHtml(appointment._id)}</p>
      <div class="status">${escapeHtml(appointment.status)} appointment</div>
      <dl><dt>Business</dt><dd>${escapeHtml(appointmentShop.businessName)}</dd>
      <dt>Service</dt><dd>${escapeHtml(appointment.serviceName)}</dd>
      <dt>Appointment date and time</dt><dd>${escapeHtml(formatAppointmentDate(appointment.startsAt))}</dd>
      <dt>Duration</dt><dd>${escapeHtml(appointment.durationMinutes)} minutes</dd>
      <dt>Request submitted</dt><dd>${escapeHtml(formatAppointmentDate(appointment.requestedAt || appointment.createdAt))}</dd>
      <dt>Business address</dt><dd>${escapeHtml(appointmentShop.address || business.address)}</dd>
      <dt>Business phone</dt><dd>${escapeHtml(appointmentShop.contactPhone || business.contactPhone)}</dd>
      ${appointment.cancellationReason ? `<dt>Update reason</dt><dd>${escapeHtml(appointment.cancellationReason)}</dd>` : ''}</dl>
      <footer>This receipt confirms your appointment request; it is not a payment receipt. Keep it for your records.</footer></body></html>`;
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }
      const file = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        setError('The receipt PDF was created, but sharing is unavailable on this device.');
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Appointment receipt ${appointment._id.slice(-8)}`,
        UTI: 'com.adobe.pdf',
      });
    } catch (receiptError) {
      console.error('Appointment receipt could not be generated:', receiptError);
      setError('Could not prepare the appointment receipt. Please try again.');
    } finally {
      setDownloadingReceiptId('');
    }
  };

  const copyBusinessPage = async () => {
    if (!slug) return;
    try {
      await Clipboard.setStringAsync(`${publicWebsiteUrl}/shops/${encodeURIComponent(slug)}`);
      setError('');
      setNotice('Business page link copied. Share it with others.');
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : 'Could not copy the business page link.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={19} color="#15263A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{business?.shopType === 'store' ? 'Store page' : 'Business page'}</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator style={styles.loader} color="#087A4C" /> : null}
        {error && !business ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        {business ? (
          <>
            <View style={styles.hero}>
              {business.bannerImage ? <Image source={{ uri: business.bannerImage }} style={styles.businessBanner} resizeMode="cover" /> : <View style={styles.heroIcon}><Feather name="briefcase" size={23} color="#C8F7D7" /></View>}
              <Text style={styles.eyebrow}>{business.shopType === 'store' ? 'VERIFIED CARDZIP STORE' : 'VERIFIED CARDZIP BUSINESS'}</Text>
              <Text style={styles.businessName}>{business.businessName}</Text>
              <Text style={styles.description}>{business.description || (business.shopType === 'store' ? 'Browse products from this local store.' : 'Choose an available time to request an appointment.')}</Text>
              <View style={styles.addressRow}><Feather name="map-pin" size={15} color="#A8DBB8" /><Text style={styles.address}>{business.address}</Text></View>
              <TouchableOpacity style={styles.contactButton} onPress={() => void Linking.openURL(`tel:${business.contactPhone}`)}>
                <Feather name="phone" size={15} color="#0D3826" /><Text style={styles.contactButtonText}>Call business</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton} onPress={() => void copyBusinessPage()}>
                <Feather name="copy" size={15} color="#0D3826" /><Text style={styles.contactButtonText}>Copy business page link</Text>
              </TouchableOpacity>
            </View>
            {business.shopType === 'store' ? (
              <>
                <View style={styles.sectionHeading}>
                  <View><Text style={styles.sectionEyebrow}>AVAILABLE FROM THIS STORE</Text><Text style={styles.sectionTitle}>Products</Text></View>
                  <Feather name="shopping-bag" size={20} color="#087A4C" />
                </View>
                {products.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Feather name="camera" size={25} color="#087A4C" />
                    <Text style={styles.emptyTitle}>No products available yet</Text>
                    <Text style={styles.emptyDescription}>Check back later to see what this store has listed.</Text>
                  </View>
                ) : products.map((product) => (
                  <TouchableOpacity
                    key={product._id}
                    style={styles.productCard}
                    onPress={() => router.push(`/(main)/market/shop-product/${encodeURIComponent(product.slug)}?shopSlug=${encodeURIComponent(business.slug)}` as Href)}
                    activeOpacity={0.85}
                  >
                    {product.images?.[0] || product.imageUrl
                      ? <Image source={{ uri: product.images?.[0] || product.imageUrl }} style={styles.productImage} resizeMode="cover" />
                      : <View style={[styles.productImage, styles.productPlaceholder]}><Feather name="camera" size={20} color="#8B9A90" /></View>}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>{formatNaira(product.price)}</Text>
                      <Text style={styles.productStock}>{product.stock} available · Tap for details</Text>
                    </View>
                    <Feather name="chevron-right" size={19} color="#087A4C" />
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            {myBookings.length ? (
              <>
                <View style={styles.sectionHeading}>
                  <View><Text style={styles.sectionEyebrow}>YOUR BOOKINGS</Text><Text style={styles.sectionTitle}>Appointment updates</Text></View>
                  <Feather name="check-circle" size={20} color="#087A4C" />
                </View>
                {myBookings.map((appointment) => (
                  <View key={appointment._id} style={styles.appointmentCard}>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.serviceName}>{appointment.serviceName}</Text>
                      <Text style={styles.appointmentTime}>{formatAppointmentDate(appointment.startsAt)}</Text>
                      <Text style={styles.duration}>{appointment.durationMinutes} minutes · {appointment.status.toUpperCase()}</Text>
                      {appointment.cancellationReason ? <Text style={styles.cancellationReason}>Reason: {appointment.cancellationReason}</Text> : null}
                      <TouchableOpacity
                        style={styles.receiptButton}
                        disabled={Boolean(downloadingReceiptId)}
                        onPress={() => void downloadAppointmentReceipt(appointment)}
                      >
                        {downloadingReceiptId === appointment._id
                          ? <ActivityIndicator size="small" color="#087A4C" />
                          : <Feather name="download" size={14} color="#087A4C" />}
                        <Text style={styles.receiptButtonText}>{downloadingReceiptId === appointment._id ? 'Preparing receipt…' : 'Download appointment receipt'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <View style={styles.bookingNote}>
                  <Feather name="info" size={16} color="#087A4C" />
                  <Text style={styles.bookingNoteText}>Your request is pending until the business confirms it. The business may contact you using your account details.</Text>
                </View>
              </>
              ) : null}
            <View style={styles.sectionHeading}>
              <View><Text style={styles.sectionEyebrow}>BOOK WITH THIS BUSINESS</Text><Text style={styles.sectionTitle}>Available appointments</Text></View>
              <Feather name="calendar" size={20} color="#087A4C" />
            </View>
            {appointments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="calendar" size={25} color="#087A4C" />
                <Text style={styles.emptyTitle}>No times available right now</Text>
                <Text style={styles.emptyDescription}>Check back later or call the business for availability.</Text>
              </View>
            ) : appointments.map((appointment) => (
              <View key={appointment._id} style={styles.appointmentCard}>
                <View style={styles.appointmentIcon}><Feather name="clock" size={18} color="#087A4C" /></View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.serviceName}>{appointment.serviceName}</Text>
                  <Text style={styles.appointmentTime}>{formatAppointmentDate(appointment.startsAt)}</Text>
                  <Text style={styles.duration}>{appointment.durationMinutes} minutes</Text>
                </View>
                <TouchableOpacity style={[styles.bookButton, Boolean(bookingId) && styles.bookButtonDisabled]} disabled={Boolean(bookingId)} onPress={() => void bookAppointment(appointment._id)}>
                  <Text style={styles.bookButtonText}>{bookingId === appointment._id ? 'Sending…' : 'Book'}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.bookingNote}>
              <Feather name="info" size={16} color="#087A4C" />
              <Text style={styles.bookingNoteText}>Your request is pending until the business confirms it. The business may contact you using your account details.</Text>
            </View>
          </>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  header: { minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0EAE3' },
  backButton: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { color: '#14253A', fontSize: 16, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 32 },
  loader: { marginVertical: 30 },
  hero: { padding: 20, borderRadius: 18, backgroundColor: '#103624' },
  businessBanner: { width: '100%', height: 140, marginBottom: 14, borderRadius: 12, backgroundColor: '#24543D' },
  heroIcon: { width: 46, height: 46, marginBottom: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#FFFFFF18' },
  eyebrow: { color: '#9EE8B5', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  businessName: { marginTop: 6, color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  description: { marginTop: 7, color: '#D4E6D9', fontSize: 11, lineHeight: 17 },
  addressRow: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  address: { flex: 1, color: '#E0EFE4', fontSize: 10, lineHeight: 15 },
  contactButton: { minHeight: 38, marginTop: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', gap: 7, borderRadius: 9, backgroundColor: '#D9F9E3' },
  contactButtonText: { color: '#0D3826', fontSize: 10, fontWeight: '800' },
  sectionHeading: { marginTop: 23, marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionEyebrow: { color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { marginTop: 4, color: '#153426', fontSize: 17, fontWeight: '800' },
  appointmentCard: { marginBottom: 10, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 13, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  appointmentIcon: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#EAF7EE' },
  appointmentInfo: { flex: 1, minWidth: 0 },
  serviceName: { color: '#193A29', fontSize: 12, fontWeight: '800' },
  appointmentTime: { marginTop: 3, color: '#52665A', fontSize: 10, lineHeight: 15 },
  duration: { marginTop: 2, color: '#839087', fontSize: 9 },
  cancellationReason: { marginTop: 5, padding: 8, borderRadius: 7, backgroundColor: '#FFF0EF', color: '#8F3831', fontSize: 9, lineHeight: 14 },
  receiptButton: { minHeight: 34, marginTop: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#C9DDD1', borderRadius: 8, backgroundColor: '#FFFFFF' },
  receiptButtonText: { color: '#087A4C', fontSize: 9, fontWeight: '800' },
  bookButton: { minWidth: 62, minHeight: 35, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#087A4C' },
  bookButtonDisabled: { opacity: 0.55 },
  bookButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  emptyCard: { padding: 22, alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  emptyTitle: { color: '#193A29', fontSize: 13, fontWeight: '800' },
  emptyDescription: { color: '#6E7C73', fontSize: 10, lineHeight: 15, textAlign: 'center' },
  bookingNote: { marginTop: 11, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 9, backgroundColor: '#EAF7EE' },
  bookingNoteText: { flex: 1, color: '#52665A', fontSize: 10, lineHeight: 15 },
  productCard: { marginBottom: 10, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 13, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  productImage: { width: 68, height: 68, borderRadius: 10, backgroundColor: '#EEF3EF' },
  productPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, gap: 4 },
  productName: { color: '#193A29', fontSize: 12, fontWeight: '800' },
  productPrice: { color: '#087A4C', fontSize: 12, fontWeight: '800' },
  productStock: { color: '#75847A', fontSize: 9 },
  notice: { marginTop: 13, padding: 11, borderRadius: 9, backgroundColor: '#EAF7EE', color: '#087A4C', fontSize: 10, lineHeight: 15 },
  error: { marginTop: 13, color: '#B4232F', fontSize: 11, lineHeight: 16 },
});
