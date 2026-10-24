import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
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
import {
  bookShopAppointmentApi,
  fetchMyBookedShopAppointmentsApi,
  fetchShopApi,
  fetchShopAppointmentsApi,
} from '../../../../services/api/storeApi';
import type { ShopAppointment, ShopProfile } from '../../../../types/shop';
import { useAppSelector } from '../../../../store';

const formatAppointmentDate = (date: string) => new Date(date).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const publicWebsiteUrl = (process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://cardzip.com.ng').replace(/\/$/, '');

export default function PublicBusinessScreen() {
  const router = useRouter();
  const { slug: routeSlug } = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(routeSlug) ? routeSlug[0] : routeSlug;
  const token = useAppSelector((state) => state.auth.token);
  const [business, setBusiness] = useState<ShopProfile | null>(null);
  const [appointments, setAppointments] = useState<ShopAppointment[]>([]);
  const [myBookings, setMyBookings] = useState<ShopAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState('');
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
        if (result.shopType !== 'business') {
          setError('This profile is not an appointment-based business.');
          setLoading(false);
          return;
        }
        setBusiness(result);
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
      setMyBookings((current) => [bookedAppointment, ...current]);
      setNotice('Your booking request was sent. The business will review and confirm it.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not book this appointment.');
    } finally {
      setBookingId('');
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
        <Text style={styles.headerTitle}>Business page</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator style={styles.loader} color="#087A4C" /> : null}
        {error && !business ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        {business ? (
          <>
            <View style={styles.hero}>
              {business.bannerImage ? <Image source={{ uri: business.bannerImage }} style={styles.businessBanner} resizeMode="cover" /> : <View style={styles.heroIcon}><Feather name="briefcase" size={23} color="#C8F7D7" /></View>}
              <Text style={styles.eyebrow}>VERIFIED CARDZIP BUSINESS</Text>
              <Text style={styles.businessName}>{business.businessName}</Text>
              <Text style={styles.description}>{business.description || 'Choose an available time to request an appointment.'}</Text>
              <View style={styles.addressRow}><Feather name="map-pin" size={15} color="#A8DBB8" /><Text style={styles.address}>{business.address}</Text></View>
              <TouchableOpacity style={styles.contactButton} onPress={() => void Linking.openURL(`tel:${business.contactPhone}`)}>
                <Feather name="phone" size={15} color="#0D3826" /><Text style={styles.contactButtonText}>Call business</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton} onPress={() => void copyBusinessPage()}>
                <Feather name="copy" size={15} color="#0D3826" /><Text style={styles.contactButtonText}>Copy business page link</Text>
              </TouchableOpacity>
            </View>
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
  bookButton: { minWidth: 62, minHeight: 35, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#087A4C' },
  bookButtonDisabled: { opacity: 0.55 },
  bookButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  emptyCard: { padding: 22, alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  emptyTitle: { color: '#193A29', fontSize: 13, fontWeight: '800' },
  emptyDescription: { color: '#6E7C73', fontSize: 10, lineHeight: 15, textAlign: 'center' },
  bookingNote: { marginTop: 11, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 9, backgroundColor: '#EAF7EE' },
  bookingNoteText: { flex: 1, color: '#52665A', fontSize: 10, lineHeight: 15 },
  notice: { marginTop: 13, padding: 11, borderRadius: 9, backgroundColor: '#EAF7EE', color: '#087A4C', fontSize: 10, lineHeight: 15 },
  error: { marginTop: 13, color: '#B4232F', fontSize: 11, lineHeight: 16 },
});
