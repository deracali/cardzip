import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { fetchAdPlacementsApi, AdPlacement, createAdCampaignApi, fetchMyAdCampaignsApi, uploadAdCreativeApi } from '../../../services/api/advertisementApi';
import { initializeBannerAdPaymentApi, verifyBannerAdPaymentApi } from '../../../services/api/paymentApi';
import { isDefinitivePaystackFailure, openPaystackCheckout, verifyPaystackUntilSettled } from '../../../services/api/paystackFlow';
import { useAppSelector } from '../../../store';
import { formatNaira } from '../../../utils/currency';

const callbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();

export default function AdvertiseScreen() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [campaigns, setCampaigns] = useState<Awaited<ReturnType<typeof fetchMyAdCampaignsApi>>>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [months, setMonths] = useState<1 | 12>(1);
  const [title, setTitle] = useState('');
  const [copy, setCopy] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const placement = placements.find((item) => item.key === selectedKey);
  const price = useMemo(() => Number(placement?.durationPrices.find((item) => item.months === months)?.price || 0), [months, placement]);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    Promise.all([fetchAdPlacementsApi(), fetchMyAdCampaignsApi(token)])
      .then(([available, existing]) => {
        if (!active) return;
        const appPlacements = available.filter((item) => item.platform === 'app');
        setPlacements(appPlacements);
        setSelectedKey(appPlacements[0]?.key || '');
        setCampaigns(existing);
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Could not load advertising options.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const chooseImage = async () => {
    if (!token) {
      setError('Sign in to upload a campaign banner.');
      return;
    }
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo-library access to choose your banner image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    setSubmitting(true);
    try {
      const upload = await uploadAdCreativeApi(token, asset.uri, asset.fileName || `banner.${mimeType.split('/')[1]}`, mimeType);
      setImageUrl(upload.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the banner image.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCampaign = async () => {
    if (!token || !placement || !imageUrl || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const reservation = await createAdCampaignApi(token, { placementKey: placement.key, months, title, copy, imageUrl, destinationUrl });
      const returnUrl = callbackUrl || Linking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeBannerAdPaymentApi(token, reservation.campaignId, returnUrl);
      await openPaystackCheckout(payment.authorizationUrl, returnUrl);
      const verification = await verifyPaystackUntilSettled({
        verify: () => verifyBannerAdPaymentApi(token, payment.reference),
        getStatus: (result) => result.status === 'completed' && result.campaign ? 'completed' : 'pending',
        failureMessage: 'Paystack did not complete this campaign payment.',
        pendingMessage: 'Campaign payment is still being confirmed. Verify again from your campaigns shortly.',
      });
      setCampaigns((current) => [verification.campaign, ...current]);
      setTitle('');
      setCopy('');
      setDestinationUrl('');
      setImageUrl('');
      setError('Payment confirmed. Your campaign is reserved and awaiting creative review.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not complete this campaign payment.');
      if (isDefinitivePaystackFailure(submitError)) {
        try { setCampaigns(await fetchMyAdCampaignsApi(token)); } catch (refreshError) { console.error('Could not refresh ad campaigns:', refreshError); }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}><Feather name="arrow-left" size={16} color="#52665A" /><Text style={styles.backText}>Back to market</Text></TouchableOpacity>
        <View style={styles.heading}><Text style={styles.eyebrow}>CARDZIP MOBILE ADVERTISING</Text><Text style={styles.title}>Promote your business</Text><Text style={styles.subtitle}>Choose an app placement, pay securely with Paystack, and get reviewed before your banner goes live.</Text></View>
        {loading && token ? <ActivityIndicator color="#087A4C" /> : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Create a campaign</Text>
            <Text style={styles.label}>App placement</Text>
            {placements.map((item) => <TouchableOpacity key={item.key} style={[styles.option, selectedKey === item.key && styles.optionSelected]} onPress={() => { setSelectedKey(item.key); setMonths(1); }}><Text style={styles.optionTitle}>{item.name}</Text><Text style={styles.optionHint}>{item.location}</Text><Text style={styles.placementStatus}>{item.active ? 'Placement open' : 'Setup in progress'}</Text></TouchableOpacity>)}
            {placement && <Text style={styles.nextDate}>Next available start: {new Date(placement.nextAvailableAt).toLocaleDateString()}</Text>}
            <Text style={styles.label}>Campaign duration</Text>
            <View style={styles.durationRow}>{([1, 12] as const).map((value) => {
              const durationPrice = placement?.durationPrices.find((item) => item.months === value)?.price;
              return <TouchableOpacity key={value} onPress={() => setMonths(value)} style={[styles.duration, months === value && styles.optionSelected]}><Text style={styles.optionTitle}>{value} {value === 1 ? 'month' : 'months'}</Text><Text style={styles.optionHint}>{durationPrice ? formatNaira(durationPrice) : 'Price being set'}</Text></TouchableOpacity>;
            })}</View>
            {placement && (!placement.active || price < 1) ? <Text style={styles.setupNote}>This location is visible so you can plan your campaign. Cardzip is setting up the placement and pricing before checkout opens.</Text> : null}
            <Text style={styles.label}>Headline</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={90} placeholder="A short, memorable headline" />
            <Text style={styles.label}>Description</Text><TextInput style={[styles.input, styles.multiline]} value={copy} onChangeText={setCopy} maxLength={220} multiline placeholder="Tell customers why they should take a look." />
            <Text style={styles.label}>Destination link (optional)</Text><TextInput style={styles.input} value={destinationUrl} onChangeText={setDestinationUrl} autoCapitalize="none" keyboardType="url" placeholder="https://your-business.com" />
            <TouchableOpacity style={styles.uploadButton} disabled={submitting} onPress={() => void chooseImage()}><Feather name="image" size={17} color="#087A4C" /><Text style={styles.uploadText}>{imageUrl ? 'Change banner image' : 'Choose banner image'}</Text></TouchableOpacity>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.preview} resizeMode="cover" />}
            {price > 0 && <View style={styles.total}><Text style={styles.totalLabel}>Pay securely via Paystack</Text><Text style={styles.totalPrice}>{formatNaira(price)}</Text></View>}
            {!token || error ? <Text accessibilityRole="alert" style={styles.error}>{token ? error : 'Sign in to create and manage advertising campaigns.'}</Text> : null}
            <TouchableOpacity style={[styles.submitButton, (!placement?.active || !price || !imageUrl || title.trim().length < 3 || copy.trim().length < 8 || submitting) && styles.disabled]} disabled={!placement?.active || !price || !imageUrl || title.trim().length < 3 || copy.trim().length < 8 || submitting} onPress={() => void submitCampaign()}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Pay & submit for review</Text>}
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.campaigns}>
          <Text style={styles.sectionTitle}>Your campaigns</Text>
          {campaigns.map((campaign) => <View key={campaign._id} style={styles.campaignCard}>
            {campaign.imageUrl ? <Image source={{ uri: campaign.imageUrl }} style={styles.campaignImage} /> : null}
            <View style={styles.campaignCopy}><Text style={styles.campaignTitle}>{campaign.title}</Text><Text style={styles.optionHint}>{campaign.placementName} · {campaign.months} month(s)</Text><Text style={styles.status}>{campaign.status.replaceAll('_', ' ')}</Text><Text style={styles.optionHint}>Scheduled {new Date(campaign.startAt).toLocaleDateString()} – {new Date(campaign.endAt).toLocaleDateString()}</Text><Text style={styles.performanceMetrics}>{campaign.impressions ?? 0} unique impressions  ·  {campaign.clicks ?? 0} unique clicks  ·  {campaign.clickThroughRate ?? 0}% CTR</Text></View>
          </View>)}
          {campaigns.length === 0 && (!loading || !token) ? <Text style={styles.optionHint}>Your booked campaigns will appear here.</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6FAF7' },
  container: { padding: 18, paddingBottom: 45, gap: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6 },
  backText: { color: '#52665A', fontSize: 12, fontWeight: '700' },
  heading: { gap: 7, marginBottom: 3 },
  eyebrow: { color: '#087A4C', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#14251B', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#68766D', fontSize: 12, lineHeight: 18 },
  card: { gap: 11, padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#E1E9E3', backgroundColor: '#FFF' },
  sectionTitle: { color: '#1C3024', fontSize: 16, fontWeight: '800' },
  label: { marginTop: 3, color: '#35493C', fontSize: 11, fontWeight: '800' },
  option: { padding: 11, borderWidth: 1, borderColor: '#E0E8E2', borderRadius: 10 },
  optionSelected: { borderColor: '#07804E', backgroundColor: '#F1FAF4' },
  optionTitle: { color: '#213328', fontSize: 12, fontWeight: '800' },
  optionHint: { marginTop: 4, color: '#6D7A71', fontSize: 10, lineHeight: 15 },
  placementStatus: { marginTop: 6, color: '#087A4C', fontSize: 9, fontWeight: '800' },
  setupNote: { padding: 10, borderRadius: 8, backgroundColor: '#FFF8E8', color: '#8A671B', fontSize: 10, lineHeight: 15 },
  nextDate: { color: '#087A4C', fontSize: 10, fontWeight: '700' },
  durationRow: { flexDirection: 'row', gap: 8 },
  duration: { flex: 1, padding: 11, borderWidth: 1, borderColor: '#E0E8E2', borderRadius: 10 },
  input: { minHeight: 42, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: '#DBE5DE', borderRadius: 9, color: '#18281E', fontSize: 12 },
  multiline: { minHeight: 84, textAlignVertical: 'top' },
  uploadButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#CFE2D6', borderRadius: 9, backgroundColor: '#F1FAF4' },
  uploadText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  preview: { width: '100%', height: 165, borderRadius: 10 },
  total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 9, backgroundColor: '#F3F8F4' },
  totalLabel: { color: '#617067', fontSize: 11 },
  totalPrice: { color: '#087A4C', fontSize: 17, fontWeight: '800' },
  submitButton: { minHeight: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#087A4C' },
  disabled: { opacity: 0.5 },
  submitText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  error: { color: '#B42318', fontSize: 11, lineHeight: 16 },
  campaigns: { gap: 11, padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#E1E9E3', backgroundColor: '#FFF' },
  campaignCard: { flexDirection: 'row', gap: 10, padding: 10, borderWidth: 1, borderColor: '#E8EEE9', borderRadius: 10 },
  campaignImage: { width: 65, height: 65, borderRadius: 7 },
  campaignCopy: { flex: 1, gap: 3 },
  campaignTitle: { color: '#1D3024', fontSize: 12, fontWeight: '800' },
  performanceMetrics: { marginTop: 5, color: '#087A4C', fontSize: 10, fontWeight: '700' },
  status: { alignSelf: 'flex-start', marginTop: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, overflow: 'hidden', backgroundColor: '#FFF6DF', color: '#996C09', fontSize: 9, fontWeight: '800' },
});
