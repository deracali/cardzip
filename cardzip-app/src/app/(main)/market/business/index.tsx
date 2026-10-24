import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  createShopApi,
  fetchMyShopApi,
  fetchShopsApi,
} from '../../../../services/api/storeApi';
import type { ShopApplicationPayload, ShopProfile, ShopType } from '../../../../types/shop';
import { useAppSelector } from '../../../../store';

type PageMode = 'directory' | 'manage';

const publicWebsiteUrl = (process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://cardzip.com.ng').replace(/\/$/, '');

const emptyApplication: ShopApplicationPayload = {
  shopType: 'store',
  businessName: '',
  address: '',
  contactPhone: '',
  description: '',
};

export default function BusinessHubScreen() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const [mode, setMode] = useState<PageMode>('directory');
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [application, setApplication] = useState(emptyApplication);
  const [banner, setBanner] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDirectory = useCallback(async () => {
    try {
      const result = await fetchShopsApi();
      setShops(result.items.filter((item) => item.shopType === 'business'));
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load businesses.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOwnerShop = useCallback(async () => {
    if (!token) {
      setShop(null);
      return;
    }
    try {
      const result = await fetchMyShopApi(token);
      const ownerShop = result?.shop ?? null;
      setShop(ownerShop);
      if (ownerShop?.status === 'rejected') {
        setApplication({
          shopType: ownerShop.shopType,
          businessName: ownerShop.businessName,
          address: ownerShop.address,
          contactPhone: ownerShop.contactPhone,
          description: ownerShop.description || '',
        });
      }
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load your business profile.');
    }
  }, [token]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadDirectory();
      void loadOwnerShop();
    });
    return () => cancelAnimationFrame(frame);
  }, [loadDirectory, loadOwnerShop]);

  const submitApplication = async () => {
    if (!token) {
      router.push('/(auth)/login' as Href);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await createShopApi(token, application, banner ? {
        uri: banner.uri,
        fileName: banner.fileName,
        mimeType: banner.mimeType,
      } : undefined);
      setShop(result.shop);
      setMode('manage');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not submit your application.');
    } finally {
      setSubmitting(false);
    }
  };

  const chooseBanner = async () => {
    setError('');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Allow photo-library access to choose a profile image.');
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
      const resized = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: asset.width >= asset.height ? { width: Math.min(asset.width, 2000) } : { height: Math.min(asset.height, 2000) } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
      );
      setBanner({
        ...asset,
        uri: resized.uri,
        fileName: `${asset.fileName?.replace(/\.[^.]+$/, '') || 'shop-banner'}.jpg`,
        mimeType: 'image/jpeg',
        width: resized.width,
        height: resized.height,
      });
    } catch (pickerError) {
      setError(pickerError instanceof Error ? pickerError.message : 'Could not prepare the selected profile image.');
    }
  };

  const updateApplication = <K extends keyof ShopApplicationPayload>(key: K, value: ShopApplicationPayload[K]) => {
    setApplication((current) => ({ ...current, [key]: value }));
  };

  const openBusiness = (slug: string) => {
    router.push(`/(main)/market/business/${encodeURIComponent(slug)}` as Href);
  };

  const copyPublicPage = async (slug: string) => {
    try {
      const pageUrl = `${publicWebsiteUrl}/shops/${encodeURIComponent(slug)}`;
      await Clipboard.setStringAsync(pageUrl);
      setError('');
      setNotice('Public page link copied. Share it with your customers.');
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : 'Could not copy the public page link.');
    }
  };

  const renderTypeOption = (value: ShopType, title: string, description: string, icon: 'shopping-bag' | 'calendar') => (
    <TouchableOpacity
      key={value}
      style={[styles.typeOption, application.shopType === value && styles.typeOptionSelected]}
      onPress={() => updateApplication('shopType', value)}
      accessibilityRole="radio"
      accessibilityState={{ selected: application.shopType === value }}
    >
      <Feather name={icon} size={20} color={application.shopType === value ? '#087A4C' : '#69786F'} />
      <View style={styles.flexCopy}>
        <Text style={styles.typeTitle}>{title}</Text>
        <Text style={styles.typeDescription}>{description}</Text>
      </View>
      <Feather name={application.shopType === value ? 'check-circle' : 'circle'} size={18} color={application.shopType === value ? '#087A4C' : '#A8B3AC'} />
    </TouchableOpacity>
  );

  const renderApplication = () => (
    <View style={styles.panel}>
      <View style={styles.panelHeading}>
        <Feather name="briefcase" size={20} color="#087A4C" />
        <View style={styles.flexCopy}>
          <Text style={styles.panelTitle}>{shop?.status === 'rejected' ? 'Update your application' : 'Create a profile'}</Text>
          <Text style={styles.panelDescription}>{shop?.status === 'rejected' ? 'Your existing details are prefilled. Update the items mentioned in the review feedback, then resubmit.' : 'Choose Store for product listings or Business for appointments.'}</Text>
        </View>
      </View>
      {shop?.status === 'rejected' && shop.reviewNote ? <Text style={styles.reviewNote}>Requested changes: {shop.reviewNote}</Text> : null}
      <View style={styles.typeOptions}>
        {renderTypeOption('store', 'Store', 'List products and connect with customers.', 'shopping-bag')}
        {renderTypeOption('business', 'Business', 'Publish appointment times and manage bookings.', 'calendar')}
      </View>
      <Text style={styles.label}>Business name</Text>
      <TextInput style={styles.input} value={application.businessName} onChangeText={(value) => updateApplication('businessName', value)} maxLength={100} placeholder="Your business name" />
      <Text style={styles.label}>Contact phone</Text>
      <TextInput style={styles.input} value={application.contactPhone} onChangeText={(value) => updateApplication('contactPhone', value)} maxLength={24} keyboardType="phone-pad" placeholder="080… or +234…" />
      <Text style={styles.label}>Full business address</Text>
      <TextInput style={[styles.input, styles.multiline]} value={application.address} onChangeText={(value) => updateApplication('address', value)} maxLength={300} multiline placeholder="Street, area, city, state" />
      <Text style={styles.label}>About your business (optional · up to 500 characters)</Text>
      <TextInput style={[styles.input, styles.multiline]} value={application.description} onChangeText={(value) => updateApplication('description', value)} maxLength={500} multiline placeholder="What should customers know?" />
      <Text style={styles.descriptionCount}>{application.description?.length || 0}/500</Text>
      <Text style={styles.label}>Profile logo or banner (optional)</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={() => void chooseBanner()} accessibilityRole="button" accessibilityLabel="Choose profile logo or banner image">
        {banner ? <Image source={{ uri: banner.uri }} style={styles.bannerPreview} resizeMode="cover" /> : shop?.status === 'rejected' && shop.bannerImage ? <Image source={{ uri: shop.bannerImage }} style={styles.bannerPreview} resizeMode="cover" /> : <View style={styles.uploadIcon}><Feather name="image" size={19} color="#087A4C" /></View>}
        <View style={styles.flexCopy}>
          <Text style={styles.uploadTitle}>{banner || shop?.bannerImage ? 'Change profile image' : 'Choose an image'}</Text>
          <Text style={styles.uploadDescription}>{banner?.fileName || (shop?.status === 'rejected' && shop.bannerImage ? 'Current image retained unless you choose another' : 'JPEG, PNG or WebP · up to 8 MB')}</Text>
        </View>
        <Feather name="upload" size={17} color="#087A4C" />
      </TouchableOpacity>
      <View style={styles.disclosure}>
        <Feather name="info" size={17} color="#976414" />
        <Text style={styles.disclosureText}>Your business address will appear on your public profile.</Text>
      </View>
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <TouchableOpacity
        style={[styles.primaryButton, (submitting || application.businessName.trim().length < 2 || application.address.trim().length < 8 || application.contactPhone.replace(/\D/g, '').length < 7) && styles.buttonDisabled]}
        disabled={submitting || application.businessName.trim().length < 2 || application.address.trim().length < 8 || application.contactPhone.replace(/\D/g, '').length < 7}
        onPress={() => void submitApplication()}
      >
        {submitting ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={styles.primaryButtonText}>{shop?.status === 'rejected' ? 'Resubmit updated application' : 'Submit for review'}</Text><Feather name="arrow-right" size={17} color="#FFFFFF" /></>}
      </TouchableOpacity>
    </View>
  );

  const renderOwnerProfile = () => {
    if (!token) {
      return (
        <View style={styles.emptyCard}>
          <Feather name="lock" size={25} color="#087A4C" />
          <Text style={styles.emptyTitle}>Sign in to manage your profile</Text>
          <Text style={styles.emptyDescription}>Apply for a Store or Business profile and manage it from this screen.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/login' as Href)}>
            <Text style={styles.primaryButtonText}>Sign in</Text><Feather name="arrow-right" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    }
    if (!shop) return renderApplication();
    if (shop.status !== 'approved') {
      return (
        <View style={styles.emptyCard}>
          <Feather name={shop.status === 'pending' ? 'clock' : 'alert-circle'} size={25} color="#087A4C" />
          <Text style={styles.emptyTitle}>{shop.businessName}</Text>
          <Text style={styles.statusPill}>{shop.status === 'pending' ? 'UNDER REVIEW' : 'CHANGES REQUESTED'}</Text>
          <Text style={styles.emptyDescription}>{shop.status === 'pending' ? 'Your application will be visible after it has been reviewed.' : shop.reviewNote || 'Please contact support for help updating your application.'}</Text>
          {shop.status === 'rejected' ? <TouchableOpacity style={styles.primaryButton} onPress={() => { setApplication({ shopType: shop.shopType, businessName: shop.businessName, address: shop.address, contactPhone: shop.contactPhone, description: shop.description || '' }); setMode('manage'); }}>
            <Text style={styles.primaryButtonText}>Correct and resubmit</Text><Feather name="edit-2" size={16} color="#FFFFFF" />
          </TouchableOpacity> : null}
        </View>
      );
    }
    if (shop.shopType !== 'business') {
      return (
        <View style={styles.emptyCard}>
          <Feather name="shopping-bag" size={25} color="#087A4C" />
          <Text style={styles.emptyTitle}>{shop.businessName} is a Store profile</Text>
          <Text style={styles.emptyDescription}>Appointment management is available to approved Business profiles. Each account can have one profile.</Text>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <TouchableOpacity style={styles.secondaryButton} onPress={() => void copyPublicPage(shop.slug)}>
            <Feather name="copy" size={15} color="#087A4C" /><Text style={styles.secondaryButtonText}>Copy public store page</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(main)/(tabs)/store' as Href)}>
            <Text style={styles.secondaryButtonText}>Go to Store</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeading}>
          {shop.bannerImage ? <Image source={{ uri: shop.bannerImage }} style={styles.ownerBusinessLogo} resizeMode="cover" /> : <Feather name="check-circle" size={20} color="#087A4C" />}
          <View style={styles.flexCopy}>
            <Text style={styles.panelTitle}>{shop.businessName}</Text>
            <Text style={styles.panelDescription}>Approved Business profile · {shop.address}</Text>
          </View>
        </View>
        <Text style={styles.ownerHint}>Add available times and review customer booking requests on your business page.</Text>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(main)/market/business/manage' as Href)}>
          <Text style={styles.primaryButtonText}>Manage appointments</Text><Feather name="arrow-right" size={17} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => openBusiness(shop.slug)}>
          <Text style={styles.secondaryButtonText}>View public business page</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => void copyPublicPage(shop.slug)}>
          <Feather name="copy" size={15} color="#087A4C" /><Text style={styles.secondaryButtonText}>Copy public business page</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={19} color="#15263A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Businesses</Text>
        <TouchableOpacity style={styles.headerAction} onPress={() => setMode((current) => current === 'directory' ? 'manage' : 'directory')}>
          <Text style={styles.headerActionText}>{mode === 'directory' ? 'Manage' : 'Explore'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Feather name="calendar" size={24} color="#C8F7D7" /></View>
          <Text style={styles.eyebrow}>CARDZIP BUSINESS</Text>
          <Text style={styles.heroTitle}>{mode === 'directory' ? 'Discover local businesses.' : 'Your business, organized.'}</Text>
          <Text style={styles.heroDescription}>{mode === 'directory' ? 'Find services, book an available time, and hear back from the business.' : 'Create a Store or Business profile and manage bookings in one place.'}</Text>
          {mode === 'directory' ? (
            <TouchableOpacity style={styles.heroAction} onPress={() => setMode('manage')}>
              <Text style={styles.heroActionText}>Create or manage a profile</Text><Feather name="arrow-right" size={16} color="#0D3826" />
            </TouchableOpacity>
          ) : null}
        </View>
        {mode === 'directory' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View><Text style={styles.sectionEyebrow}>APPROVED BUSINESSES</Text><Text style={styles.sectionTitle}>Book an appointment</Text></View>
              <Feather name="map-pin" size={20} color="#087A4C" />
            </View>
            {loading ? <ActivityIndicator style={styles.loader} color="#087A4C" /> : null}
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            {!loading && !error && shops.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="briefcase" size={24} color="#087A4C" />
                <Text style={styles.emptyTitle}>No approved businesses yet</Text>
                <Text style={styles.emptyDescription}>Check back soon or create a Business profile to get started.</Text>
              </View>
            ) : null}
            {shops.map((item) => (
              <TouchableOpacity key={item._id} style={styles.businessCard} onPress={() => openBusiness(item.slug)} activeOpacity={0.85}>
                {item.bannerImage ? <Image source={{ uri: item.bannerImage }} style={styles.businessLogo} resizeMode="cover" /> : <View style={styles.businessIcon}><Feather name="briefcase" size={19} color="#087A4C" /></View>}
                <View style={styles.flexCopy}>
                  <Text style={styles.businessName}>{item.businessName}</Text>
                  <Text style={styles.businessAddress} numberOfLines={2}>{item.address}</Text>
                  {item.description ? <Text style={styles.businessDescription} numberOfLines={2}>{item.description}</Text> : null}
                </View>
                <Feather name="chevron-right" size={19} color="#087A4C" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View><Text style={styles.sectionEyebrow}>OWNER DASHBOARD</Text><Text style={styles.sectionTitle}>Manage your profile</Text></View>
              <Feather name="settings" size={20} color="#087A4C" />
            </View>
            {loading && token ? <ActivityIndicator style={styles.loader} color="#087A4C" /> : renderOwnerProfile()}
            {error && (shop || !token) ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            {notice && shop?.status !== 'approved' ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  header: { minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0EAE3' },
  backButton: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { color: '#14253A', fontSize: 16, fontWeight: '800' },
  headerAction: { minWidth: 56, alignItems: 'flex-end', justifyContent: 'center' },
  headerActionText: { color: '#087A4C', fontSize: 12, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 35 },
  hero: { padding: 20, borderRadius: 18, backgroundColor: '#103624' },
  heroIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#FFFFFF18', marginBottom: 16 },
  eyebrow: { color: '#9EE8B5', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  heroTitle: { marginTop: 7, color: '#FFFFFF', fontSize: 23, fontWeight: '800', lineHeight: 29 },
  heroDescription: { marginTop: 8, color: '#D4E6D9', fontSize: 12, lineHeight: 18 },
  heroAction: { minHeight: 42, marginTop: 16, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'flex-start', borderRadius: 10, backgroundColor: '#D9F9E3' },
  heroActionText: { color: '#0D3826', fontSize: 11, fontWeight: '800' },
  section: { marginTop: 23 },
  sectionHeader: { marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionEyebrow: { color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { marginTop: 4, color: '#153426', fontSize: 17, fontWeight: '800' },
  loader: { marginVertical: 22 },
  businessCard: { marginBottom: 10, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  businessIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#EAF7EE' },
  businessLogo: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#EAF7EE' },
  ownerBusinessLogo: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EAF7EE' },
  flexCopy: { flex: 1, minWidth: 0 },
  businessName: { color: '#193A29', fontSize: 13, fontWeight: '800' },
  businessAddress: { marginTop: 4, color: '#65756B', fontSize: 10, lineHeight: 15 },
  businessDescription: { marginTop: 5, color: '#7B877F', fontSize: 10, lineHeight: 15 },
  emptyCard: { padding: 20, alignItems: 'center', gap: 9, borderRadius: 15, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  emptyTitle: { color: '#193A29', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  emptyDescription: { color: '#6E7C73', fontSize: 11, lineHeight: 17, textAlign: 'center' },
  statusPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: '#FFF5DF', color: '#94600E', fontSize: 9, fontWeight: '800' },
  panel: { padding: 16, borderRadius: 15, borderWidth: 1, borderColor: '#E0EAE3', backgroundColor: '#FFFFFF' },
  panelHeading: { marginBottom: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  panelTitle: { color: '#193A29', fontSize: 14, fontWeight: '800' },
  panelDescription: { marginTop: 3, color: '#6E7C73', fontSize: 10, lineHeight: 15 },
  typeOptions: { gap: 9, marginBottom: 14 },
  typeOption: { minHeight: 67, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 11, borderWidth: 1, borderColor: '#DDE7E0', backgroundColor: '#FFFFFF' },
  typeOptionSelected: { borderColor: '#087A4C', backgroundColor: '#F1FAF4' },
  typeTitle: { color: '#193A29', fontSize: 12, fontWeight: '800' },
  typeDescription: { marginTop: 4, color: '#6E7C73', fontSize: 10, lineHeight: 14 },
  label: { marginTop: 10, marginBottom: 6, color: '#33473B', fontSize: 11, fontWeight: '700' },
  input: { minHeight: 43, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 9, borderWidth: 1, borderColor: '#D9E3DC', backgroundColor: '#FFFFFF', color: '#17281F', fontSize: 12 },
  multiline: { minHeight: 75, textAlignVertical: 'top' },
  descriptionCount: { marginTop: -5, color: '#75847A', fontSize: 9, textAlign: 'right' },
  uploadButton: { minHeight: 64, marginTop: 6, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#BFD8C7', backgroundColor: '#F7FBF8' },
  uploadIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#EAF7EE' },
  bannerPreview: { width: 58, height: 42, borderRadius: 7, backgroundColor: '#EAF7EE' },
  uploadTitle: { color: '#193A29', fontSize: 11, fontWeight: '800' },
  uploadDescription: { marginTop: 3, color: '#75847A', fontSize: 9 },
  disclosure: { marginTop: 14, padding: 11, flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 9, backgroundColor: '#FFF8E8' },
  disclosureText: { flex: 1, color: '#705B3C', fontSize: 10, lineHeight: 15 },
  primaryButton: { minHeight: 44, marginTop: 14, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 10, backgroundColor: '#087A4C' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  buttonDisabled: { opacity: 0.55 },
  secondaryButton: { minHeight: 42, marginTop: 10, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#C9DDD1', backgroundColor: '#FFFFFF' },
  secondaryButtonText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  ownerHint: { color: '#6E7C73', fontSize: 11, lineHeight: 17 },
  reviewNote: { marginTop: 12, padding: 11, borderRadius: 9, backgroundColor: '#FFF4F2', color: '#805A55', fontSize: 10, lineHeight: 15 },
  notice: { marginTop: 9, color: '#087A4C', fontSize: 10, lineHeight: 15 },
  error: { marginTop: 10, color: '#B4232F', fontSize: 11, lineHeight: 16 },
});
