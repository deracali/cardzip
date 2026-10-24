import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import {
  createShopAppointmentApi,
  deleteShopAppointmentApi,
  fetchMyShopApi,
  fetchMyShopAppointmentsApi,
  updateShopAppointmentApi,
} from '../../../../services/api/storeApi';
import type { ShopAppointment, ShopProfile } from '../../../../types/shop';
import { useAppSelector } from '../../../../store';

const formatAppointmentDate = (date: string) => new Date(date).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ManageBusinessAppointmentsScreen() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [appointments, setAppointments] = useState<ShopAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [reasonTarget, setReasonTarget] = useState<{ appointment: ShopAppointment; status: 'rejected' | 'cancelled' } | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadAppointments = useCallback(async () => {
    if (!token) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [profile, ownerAppointments] = await Promise.all([
        fetchMyShopApi(token),
        fetchMyShopAppointmentsApi(token),
      ]);
      setShop(profile?.shop || null);
      if (profile?.shop.shopType !== 'business' || profile.shop.status !== 'approved') {
        setError('An approved Business profile is required to manage appointments.');
        setAppointments([]);
        return;
      }
      setAppointments(ownerAppointments);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your appointments.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => { void loadAppointments(); }, 0);
    return () => clearTimeout(timer);
  }, [loadAppointments]);

  const createAppointment = async () => {
    if (!token) return;
    const startsAt = new Date(`${appointmentDate}T${appointmentTime}:00`);
    const duration = Number(durationMinutes);
    if (!serviceName.trim() || serviceName.trim().length < 2 || !appointmentDate || !appointmentTime || Number.isNaN(startsAt.getTime()) || startsAt <= new Date() || !Number.isInteger(duration) || duration < 15 || duration > 480) {
      setError('Enter a service, choose a future date and time, and set a duration from 15 to 480 minutes.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const created = await createShopAppointmentApi(token, {
        serviceName: serviceName.trim(),
        startsAt: startsAt.toISOString(),
        durationMinutes: duration,
      });
      setAppointments((current) => [...current, created].sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()));
      setServiceName('');
      setAppointmentDate('');
      setAppointmentTime('');
      setNotice('Appointment time published.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not publish this appointment.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (appointmentId: string, status: 'confirmed' | 'rejected' | 'cancelled', cancellationReason = '') => {
    if (!token) return;
    setUpdatingId(appointmentId);
    setError('');
    setNotice('');
    try {
      const updated = await updateShopAppointmentApi(token, appointmentId, status, cancellationReason);
      setAppointments((current) => current.map((appointment) => appointment._id === appointmentId ? updated : appointment));
      setReasonTarget(null);
      setReason('');
      setNotice(status === 'confirmed' ? 'Appointment confirmed.' : status === 'rejected' ? 'Appointment declined with your reason.' : 'Appointment cancelled with your reason.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update this appointment.');
    } finally {
      setUpdatingId('');
    }
  };

  const deleteSlot = (appointment: ShopAppointment) => {
    Alert.alert('Delete appointment time?', `${appointment.serviceName} will be removed. Only unbooked appointments can be deleted.`, [
      { text: 'Keep appointment', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!token) return;
          setUpdatingId(appointment._id);
          setError('');
          void deleteShopAppointmentApi(token, appointment._id)
            .then(() => {
              setAppointments((current) => current.filter((item) => item._id !== appointment._id));
              setNotice('Appointment time deleted.');
            })
            .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Could not delete this appointment.'))
            .finally(() => setUpdatingId(''));
        },
      },
    ]);
  };

  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarDays: (number | null)[] = [
    ...Array.from({ length: monthStart.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);
  const todayString = formatDateInput(new Date());

  const submitReason = () => {
    if (!reasonTarget) return;
    if (reason.trim().length < 5) {
      setError('Enter a reason with at least 5 characters.');
      return;
    }
    void updateStatus(reasonTarget.appointment._id, reasonTarget.status, reason.trim());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} accessibilityLabel="Go back"><Feather name="arrow-left" size={19} color="#14231C" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Manage appointments</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => void loadAppointments()} accessibilityLabel="Refresh appointments"><Feather name="refresh-cw" size={17} color="#52645A" /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {loading ? <ActivityIndicator style={styles.loader} size="large" color="#087A4C" /> : null}
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        {shop ? (
          <>
            <View style={styles.heading}>
              {shop.bannerImage ? <Image source={{ uri: shop.bannerImage }} style={styles.headingLogo} resizeMode="cover" /> : <View style={styles.headingIcon}><Feather name="calendar" size={20} color="#087A4C" /></View>}
              <View style={styles.headingCopy}>
                <Text style={styles.eyebrow}>BUSINESS OWNER DASHBOARD</Text>
                <Text style={styles.title}>{shop.businessName}</Text>
                <Text style={styles.subtitle}>Review bookings, confirm requests, or cancel with a reason customers can see.</Text>
              </View>
              <TouchableOpacity style={styles.publicLink} onPress={() => router.push(`/(main)/market/business/${encodeURIComponent(shop.slug)}` as Href)}>
                <Text style={styles.publicLinkText}>Public page</Text>
                <Feather name="external-link" size={14} color="#087A4C" />
              </TouchableOpacity>
            </View>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Add appointment time</Text><Feather name="plus-circle" size={18} color="#087A4C" /></View>
            <Text style={styles.helper}>You can publish one or more appointment times. Customers can request any available time.</Text>
            <View style={styles.form}>
              <TextInput style={styles.input} value={serviceName} onChangeText={setServiceName} maxLength={120} placeholder="Service or appointment name" />
              <View style={styles.dateRow}>
                <TouchableOpacity style={[styles.input, styles.dateButton]} onPress={() => {
                  setCalendarMonth(appointmentDate ? new Date(`${appointmentDate}T12:00:00`) : new Date());
                  setCalendarOpen(true);
                }} accessibilityRole="button" accessibilityLabel="Choose appointment date">
                  <Feather name="calendar" size={15} color="#087A4C" />
                  <Text style={appointmentDate ? styles.dateText : styles.placeholder}>{appointmentDate || 'Choose date'}</Text>
                </TouchableOpacity>
                <TextInput style={[styles.input, styles.timeInput]} value={appointmentTime} onChangeText={setAppointmentTime} placeholder="HH:mm" />
              </View>
              <TextInput style={styles.input} value={durationMinutes} onChangeText={setDurationMinutes} keyboardType="number-pad" placeholder="Duration in minutes (15–480)" />
              <Text style={styles.hint}>Times use your local timezone. Customers will see the appointment in their timezone.</Text>
              <TouchableOpacity style={[styles.primaryButton, saving && styles.disabled]} disabled={saving} onPress={() => void createAppointment()}>
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <><Feather name="plus" size={15} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Publish time</Text></>}
              </TouchableOpacity>
            </View>
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Bookings and availability</Text><Text style={styles.count}>{appointments.length}</Text></View>
            {appointments.length === 0 ? (
              <View style={styles.emptyCard}><Feather name="calendar" size={24} color="#087A4C" /><Text style={styles.emptyTitle}>No appointment times yet</Text><Text style={styles.emptyCopy}>Publish one or more available times above to receive booking requests.</Text></View>
            ) : appointments.map((appointment) => (
              <View key={appointment._id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeading}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.serviceName}>{appointment.serviceName}</Text>
                    <Text style={styles.appointmentTime}>{formatAppointmentDate(appointment.startsAt)}</Text>
                    <Text style={styles.details}>{appointment.durationMinutes} minutes</Text>
                    <Text style={[styles.status, styles[`status_${appointment.status}`]]}>{appointment.status.toUpperCase()}</Text>
                    {appointment.customer ? <Text style={styles.customer}>Booked by {appointment.customer.name || appointment.customer.email}{appointment.customer.email ? ` · ${appointment.customer.email}` : ''}</Text> : null}
                    {appointment.cancellationReason ? <Text style={styles.reason}>Reason: {appointment.cancellationReason}</Text> : null}
                  </View>
                  {appointment.status === 'pending' ? (
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.confirmButton} disabled={Boolean(updatingId)} onPress={() => void updateStatus(appointment._id, 'confirmed')}><Text style={styles.confirmText}>{updatingId === appointment._id ? '…' : 'Confirm'}</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.rejectButton} disabled={Boolean(updatingId)} onPress={() => { setReasonTarget({ appointment, status: 'rejected' }); setReason(''); setError(''); }}><Text style={styles.rejectText}>Reject</Text></TouchableOpacity>
                    </View>
                  ) : ['available', 'confirmed'].includes(appointment.status) ? (
                    <View style={styles.actions}>
                      {appointment.status === 'available' ? <TouchableOpacity style={styles.deleteButton} disabled={Boolean(updatingId)} onPress={() => deleteSlot(appointment)}><Text style={styles.rejectText}>{updatingId === appointment._id ? '…' : 'Delete'}</Text></TouchableOpacity> : null}
                      {appointment.status === 'confirmed' ? <TouchableOpacity style={styles.rejectButton} disabled={Boolean(updatingId)} onPress={() => { setReasonTarget({ appointment, status: 'cancelled' }); setReason(''); setError(''); }}><Text style={styles.rejectText}>Cancel</Text></TouchableOpacity> : null}
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </>
        ) : !loading && !error ? <Text style={styles.emptyCopy}>No business profile is available.</Text> : null}
      </ScrollView>

      <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCalendarOpen(false)}>
          <Pressable style={styles.calendarModal} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Choose appointment date</Text><TouchableOpacity onPress={() => setCalendarOpen(false)} accessibilityLabel="Close calendar"><Feather name="x" size={20} color="#52665A" /></TouchableOpacity></View>
            <View style={styles.calendarNavigation}>
              <TouchableOpacity style={styles.monthArrow} onPress={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><Feather name="chevron-left" size={19} color="#193A29" /></TouchableOpacity>
              <Text style={styles.calendarMonth}>{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text>
              <TouchableOpacity style={styles.monthArrow} onPress={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><Feather name="chevron-right" size={19} color="#193A29" /></TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}
              {calendarDays.map((day, index) => {
                if (!day) return <View key={`blank-${index}`} style={styles.calendarCell} />;
                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const dateValue = formatDateInput(date);
                const isPast = dateValue < todayString;
                const selected = dateValue === appointmentDate;
                return <TouchableOpacity key={dateValue} style={[styles.calendarCell, selected && styles.calendarSelected]} disabled={isPast} onPress={() => { setAppointmentDate(dateValue); setCalendarOpen(false); }}>
                  <Text style={[styles.calendarDay, isPast && styles.calendarDisabled, selected && styles.calendarSelectedText]}>{day}</Text>
                </TouchableOpacity>;
              })}
            </View>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setCalendarOpen(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={Boolean(reasonTarget)} transparent animationType="fade" onRequestClose={() => setReasonTarget(null)}>
        <Pressable style={styles.backdrop} onPress={() => setReasonTarget(null)}>
          <Pressable style={styles.reasonModal} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{reasonTarget?.status === 'rejected' ? 'Decline booking' : 'Cancel appointment'}</Text><TouchableOpacity onPress={() => setReasonTarget(null)} accessibilityLabel="Close reason form"><Feather name="x" size={20} color="#52665A" /></TouchableOpacity></View>
            <Text style={styles.reasonHelp}>Add a reason. The customer will be able to see it.</Text>
            <TextInput style={styles.reasonInput} value={reason} onChangeText={setReason} maxLength={500} multiline textAlignVertical="top" placeholder="Reason for this change" />
            <Text style={styles.hint}>{reason.length}/500 characters (minimum 5)</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} disabled={Boolean(updatingId)} onPress={() => setReasonTarget(null)}><Text style={styles.cancelText}>Keep appointment</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalSubmit, (Boolean(updatingId) || reason.trim().length < 5) && styles.disabled]} disabled={Boolean(updatingId) || reason.trim().length < 5} onPress={submitReason}>
                {updatingId ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.modalSubmitText}>{reasonTarget?.status === 'rejected' ? 'Decline booking' : 'Cancel appointment'}</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  header: { minHeight: 54, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0EAE3' },
  headerButton: { width: 36, height: 38, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { color: '#14253A', fontSize: 15, fontWeight: '800' },
  content: { padding: 15, paddingBottom: 32 },
  loader: { marginVertical: 28 },
  heading: { marginBottom: 20, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 14, borderWidth: 1, borderColor: '#DCE9DF', backgroundColor: '#FFFFFF' },
  headingIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#EAF7EE' },
  headingLogo: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EAF7EE' },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#087A4C', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  title: { marginTop: 3, color: '#193A29', fontSize: 15, fontWeight: '800' },
  subtitle: { marginTop: 4, color: '#718077', fontSize: 9, lineHeight: 14 },
  publicLink: { alignItems: 'center', gap: 4 },
  publicLinkText: { color: '#087A4C', fontSize: 8, fontWeight: '700' },
  notice: { marginBottom: 12, padding: 10, borderRadius: 8, backgroundColor: '#EAF7EE', color: '#087A4C', fontSize: 10 },
  error: { marginBottom: 12, color: '#B4232F', fontSize: 10, lineHeight: 15 },
  sectionHeading: { marginTop: 17, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#193A29', fontSize: 14, fontWeight: '800' },
  helper: { marginBottom: 10, color: '#718077', fontSize: 10, lineHeight: 15 },
  count: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  form: { padding: 12, gap: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  input: { minHeight: 41, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDE8E0', color: '#193A29', fontSize: 11 },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { color: '#193A29', fontSize: 11 },
  placeholder: { color: '#8A978F', fontSize: 11 },
  timeInput: { width: 95 },
  hint: { color: '#75847A', fontSize: 9 },
  primaryButton: { minHeight: 39, marginTop: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 8, backgroundColor: '#087A4C' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  disabled: { opacity: 0.55 },
  emptyCard: { padding: 22, alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  emptyTitle: { color: '#193A29', fontSize: 12, fontWeight: '800' },
  emptyCopy: { color: '#718077', fontSize: 10, lineHeight: 15, textAlign: 'center' },
  appointmentCard: { marginBottom: 9, padding: 12, borderRadius: 11, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  appointmentHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  appointmentInfo: { flex: 1, minWidth: 0, gap: 4 },
  serviceName: { color: '#193A29', fontSize: 12, fontWeight: '800' },
  appointmentTime: { color: '#52665A', fontSize: 10, lineHeight: 15 },
  details: { color: '#839087', fontSize: 9 },
  status: { alignSelf: 'flex-start', marginTop: 2, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F0F3F1', color: '#59675E', fontSize: 8, fontWeight: '800' },
  status_pending: { backgroundColor: '#FFF5DF', color: '#94600E' },
  status_confirmed: { backgroundColor: '#E9F8EF', color: '#087A4C' },
  status_cancelled: { backgroundColor: '#FFF0EF', color: '#A33B34' },
  status_rejected: { backgroundColor: '#FFF0EF', color: '#A33B34' },
  status_available: { backgroundColor: '#EFF8F2', color: '#087A4C' },
  customer: { marginTop: 3, color: '#52665A', fontSize: 9, lineHeight: 14 },
  reason: { marginTop: 4, padding: 8, borderRadius: 7, backgroundColor: '#FFF4F2', color: '#8F3831', fontSize: 9, lineHeight: 14 },
  actions: { gap: 6 },
  confirmButton: { minHeight: 31, minWidth: 63, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#EAF7EE' },
  confirmText: { color: '#087A4C', fontSize: 9, fontWeight: '800' },
  rejectButton: { minHeight: 31, minWidth: 63, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#FFF0F0' },
  rejectText: { color: '#B4232F', fontSize: 9, fontWeight: '800' },
  deleteButton: { minHeight: 31, minWidth: 63, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: '#E7DAD8', backgroundColor: '#FFFFFF' },
  backdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#00000066' },
  calendarModal: { padding: 17, borderRadius: 15, backgroundColor: '#FFFFFF' },
  reasonModal: { padding: 17, borderRadius: 15, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: '#193A29', fontSize: 14, fontWeight: '800' },
  calendarNavigation: { marginTop: 15, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthArrow: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F0F6F1' },
  calendarMonth: { color: '#193A29', fontSize: 12, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', height: 30, color: '#718077', fontSize: 9, fontWeight: '700', textAlign: 'center', textAlignVertical: 'center' },
  calendarCell: { width: '14.2857%', height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  calendarSelected: { backgroundColor: '#087A4C' },
  calendarDay: { color: '#193A29', fontSize: 10, fontWeight: '600' },
  calendarDisabled: { color: '#C4CEC7' },
  calendarSelectedText: { color: '#FFFFFF', fontWeight: '800' },
  modalCancel: { minHeight: 38, marginTop: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F0F6F1' },
  modalCancelButton: { minHeight: 38, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F0F6F1' },
  cancelText: { color: '#52665A', fontSize: 10, fontWeight: '700' },
  reasonHelp: { marginTop: 8, marginBottom: 10, color: '#718077', fontSize: 10, lineHeight: 15 },
  reasonInput: { minHeight: 100, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDE8E0', color: '#193A29', fontSize: 11 },
  modalActions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  modalSubmit: { minHeight: 38, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#B4232F' },
  modalSubmitText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
});
