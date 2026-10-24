import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoLinking from 'expo-linking';
import { useAppSelector } from '../../../store';
import CardzipLoader from '../../../components/CardzipLoader';
import MarketBottomTab from './bottomtab/bottomtab';
import {
  CommunityPromotionDuration,
  createCommunityListingApi,
  deleteCommunityListingApi,
  fetchCommunityListingsApi,
  fetchMyCommunityListingsApi,
  fetchMyCommunityPromotionsApi,
  fetchCommunityPromotionPricingApi,
  updateCommunityListingApi,
  updateCommunityListingSoldApi,
  startCommunityConversationApi,
  fetchCommunityConversationsApi,
  trackCommunityPromotionEventApi,
} from '../../../services/api/storeApi';
import { CommunityListing } from '../../../types/store';
import { formatNaira } from '../../../utils/currency';
import { initializeCommunityPromotionPaymentApi, verifyCommunityPromotionPaymentApi } from '../../../services/api/paymentApi';
import { openPaystackCheckout, verifyPaystackUntilSettled } from '../../../services/api/paystackFlow';
import { getCommunityCategoryPreferences } from '../../../services/communityPreferences';
import { getCampaignAnalyticsVisitorId } from '../../../services/campaignAnalytics';

const blankForm = { title: '', category: '', description: '', price: '', phone: '', condition: 'brand_new' as 'brand_new' | 'used', isSold: false };
const communityCategories = [
  'Electronics',
  'Phones & Tablets',
  'Fashion',
  'Home & Garden',
  'Vehicles',
  'Beauty & Personal Care',
  'Baby & Kids',
  'Sports & Outdoors',
  'Food & Groceries',
  'Books & Media',
  'Services',
  'Other',
];
const MAX_LISTING_IMAGES = 6;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const callbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();

const whatsappNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0') && digits.length === 11 ? `234${digits.slice(1)}` : digits;
};

export default function CommunityMarketScreen({ manageOnly = false }: { manageOnly?: boolean }) {
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const [listings, setListings] = useState<CommunityListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [updatingListingId, setUpdatingListingId] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(blankForm);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [promotionPricing, setPromotionPricing] = useState<CommunityPromotionDuration[]>([]);
  const [promotionListing, setPromotionListing] = useState<CommunityListing | null>(null);
  const [promotionError, setPromotionError] = useState('');
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionPerformance, setPromotionPerformance] = useState<Awaited<ReturnType<typeof fetchMyCommunityPromotionsApi>>>([]);
  const [unreadCommunityChats, setUnreadCommunityChats] = useState(0);

  const loadUnreadCommunityChats = useCallback(async () => {
    if (!token) {
      setUnreadCommunityChats(0);
      return;
    }
    try {
      const conversations = await fetchCommunityConversationsApi(token);
      setUnreadCommunityChats(conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0));
    } catch (requestError) {
      console.error('Could not load unread community chat count:', requestError);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    const initialTimer = setTimeout(() => { void loadUnreadCommunityChats(); }, 0);
    const refreshTimer = setInterval(() => { void loadUnreadCommunityChats(); }, 30000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(refreshTimer);
    };
  }, [loadUnreadCommunityChats]));

  const trackPromotionEvent = useCallback((listing: CommunityListing, eventType: 'impression' | 'click') => {
    if (!listing.isPromoted) return Promise.resolve();
    const targetType = listing.isDigitalAsset ? 'digital_asset' : 'community_listing';
    return getCampaignAnalyticsVisitorId()
      .then((visitorId) => trackCommunityPromotionEventApi(listing._id, targetType, eventType, visitorId))
      .then(() => undefined)
      .catch((trackingError: unknown) => console.error('Could not record community promotion activity:', trackingError));
  }, []);

  const refreshPromotionPerformance = useCallback(async () => {
    if (!token) return;
    try {
      setPromotionPerformance(await fetchMyCommunityPromotionsApi(token));
    } catch (requestError) {
      console.error('Could not load community promotion performance:', requestError);
    }
  }, [token]);

  const openListing = useCallback((listing: CommunityListing) => {
    trackPromotionEvent(listing, 'click');
    router.push((listing.isDigitalAsset ? `/(main)/market/digital-assets/${listing.slug}` : `/(main)/market/community/${listing._id}`) as Href);
  }, [router, trackPromotionEvent]);

  const loadListings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const result = manageOnly
        ? token ? await fetchMyCommunityListingsApi(token) : { items: [] as CommunityListing[] }
        : await fetchCommunityListingsApi(1, 40, await getCommunityCategoryPreferences());
      setListings(result.items);
      if (!manageOnly) {
        void Promise.all(result.items.map((listing) => trackPromotionEvent(listing, 'impression')))
          .then(refreshPromotionPerformance);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load listings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [manageOnly, refreshPromotionPerformance, token, trackPromotionEvent]);

  useEffect(() => {
    let active = true;
    const request = manageOnly
      ? token ? fetchMyCommunityListingsApi(token) : Promise.resolve({ items: [] as CommunityListing[] })
      : getCommunityCategoryPreferences().then((preferences) => fetchCommunityListingsApi(1, 40, preferences));
    request
      .then((result) => {
        if (!active) return;
        setListings(result.items);
        if (!manageOnly) {
          void Promise.all(result.items.map((listing) => trackPromotionEvent(listing, 'impression')))
            .then(() => { if (active) return refreshPromotionPerformance(); });
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load listings.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [manageOnly, refreshPromotionPerformance, token, trackPromotionEvent]);

  useEffect(() => {
    let active = true;
    fetchCommunityPromotionPricingApi()
      .then((result) => { if (active) setPromotionPricing(result); })
      .catch((requestError: unknown) => {
        if (active) setPromotionError(requestError instanceof Error ? requestError.message : 'Could not load promotion packages.');
      });
    return () => { active = false; };
  }, []);

  const startListing = () => {
    if (!token) {
      Alert.alert('Sign in to post', 'Create a Cardzip account or sign in before posting an item.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login' as Href) },
      ]);
      return;
    }
    setFormError('');
    setNotice('');
    setEditingListingId('');
    setForm(blankForm);
    setPhotos([]);
    setFormOpen((current) => !current);
  };

  const openCommunityChat = async (listing: CommunityListing) => {
    if (!token) {
      Alert.alert('Sign in to chat', 'Sign in to message this seller about their listing.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login' as Href) },
      ]);
      return;
    }
    try {
      const conversation = await startCommunityConversationApi(token, listing._id);
      router.push(`/(main)/market/community/chat/${conversation._id}` as Href);
    } catch (chatError) {
      Alert.alert('Could not start chat', chatError instanceof Error ? chatError.message : 'Try again in a moment.');
    }
  };

  const editListing = (listing: CommunityListing) => {
    setForm({
      title: listing.title,
      category: listing.category || '',
      description: listing.description,
      price: String(listing.price),
      phone: listing.phone,
      condition: listing.condition,
      isSold: listing.isSold,
    });
    setPhotos([]);
    setFormError('');
    setEditingListingId(listing._id);
    setFormOpen(true);
  };

  const closeListingForm = () => {
    setFormOpen(false);
    setEditingListingId('');
    setForm(blankForm);
    setPhotos([]);
  };

  const selectPhotos = async () => {
    const remaining = MAX_LISTING_IMAGES - photos.length;
    if (remaining < 1) {
      setFormError(`You can add up to ${MAX_LISTING_IMAGES} photos to one listing.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFormError('Allow photo-library access to upload listing photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
    });
    if (result.canceled) return;
    const selected = result.assets;
    if (selected.length + photos.length > MAX_LISTING_IMAGES) {
      setFormError(`You can add up to ${MAX_LISTING_IMAGES} photos to one listing.`);
      return;
    }
    const invalidAsset = selected.find((asset) => (
      !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType || 'image/jpeg')
      || (typeof asset.fileSize === 'number' && asset.fileSize > MAX_IMAGE_SIZE)
    ));
    if (invalidAsset) {
      setFormError('Each photo must be a JPEG, PNG, or WebP image up to 8 MB.');
      return;
    }
    setPhotos((current) => [...current, ...selected]);
    setFormError('');
  };

  const submitListing = async () => {
    if (!token) return;
    if (!form.title.trim() || !form.description.trim() || !form.phone.trim() || !form.price.trim()) {
      setFormError('Add a product name, description, phone number, and price before publishing.');
      return;
    }
    if ((!editingListingId && photos.length < 1) || photos.length > MAX_LISTING_IMAGES) {
      setFormError(`Add between 1 and ${MAX_LISTING_IMAGES} product photos before publishing.`);
      return;
    }
    setSaving(true);
    setFormError('');
    setNotice('');
    try {
      if (editingListingId) {
        const updatedListing = await updateCommunityListingApi(token, editingListingId, { ...form, price: Number(form.price) }, photos);
        setListings((current) => current.map((listing) => listing._id === editingListingId ? updatedListing : listing));
        setNotice('Your listing has been updated.');
      } else {
        await createCommunityListingApi(token, { ...form, price: Number(form.price) }, photos);
        setNotice('Your listing is live. Buyers can contact you directly.');
      }
      setForm(blankForm);
      setPhotos([]);
      setFormOpen(false);
      setEditingListingId('');
      if (!editingListingId) await loadListings(true);
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : 'Could not publish your listing.');
    } finally {
      setSaving(false);
    }
  };

  const deleteListing = (listing: CommunityListing) => {
    Alert.alert('Delete listing?', `"${listing.title}" will be removed from the marketplace. Unused paid promotion fees will be credited to your Cardzip wallet.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!token) return;
          setUpdatingListingId(listing._id);
          setError('');
          deleteCommunityListingApi(token, listing._id)
            .then(({ refundedAmount }) => {
              setListings((current) => current.filter((item) => item._id !== listing._id));
              setNotice(refundedAmount > 0
                ? `Your listing has been deleted and ₦${refundedAmount.toLocaleString('en-NG')} credited to your wallet.`
                : 'Your listing has been deleted.');
            })
            .catch((requestError: unknown) => {
              setError(requestError instanceof Error ? requestError.message : 'Could not delete your listing.');
            })
            .finally(() => setUpdatingListingId(''));
        },
      },
    ]);
  };

  const promoteListing = async (duration: CommunityPromotionDuration) => {
    if (!token || !promotionListing) return;
    setPromotionLoading(true);
    setPromotionError('');
    try {
      const returnUrl = callbackUrl || ExpoLinking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeCommunityPromotionPaymentApi(token, promotionListing._id, duration.key, returnUrl);
      await openPaystackCheckout(payment.authorizationUrl, returnUrl);
      await verifyPaystackUntilSettled({
        verify: () => verifyCommunityPromotionPaymentApi(token, payment.reference),
        getStatus: (result) => result.status === 'completed' && result.promotion ? 'completed' : 'pending',
        failureMessage: 'Paystack did not complete this promotion payment.',
        pendingMessage: 'Promotion payment is still being confirmed. Try verifying again shortly.',
      });
      setPromotionListing(null);
      setNotice(`Payment confirmed. Your listing promotion is waiting for administrator approval.`);
      await loadListings(true);
    } catch (requestError) {
      setPromotionError(requestError instanceof Error ? requestError.message : 'Could not complete the promotion payment.');
    } finally {
      setPromotionLoading(false);
    }
  };

  const updateSoldStatus = async (listing: CommunityListing) => {
    if (!token) return;
    setUpdatingListingId(listing._id);
    try {
      const updated = await updateCommunityListingSoldApi(token, listing._id, !listing.isSold);
      setListings((current) => current.map((item) => item._id === listing._id ? updated : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update listing status.');
    } finally {
      setUpdatingListingId('');
    }
  };

  const contactSeller = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open contact', 'Try calling or messaging the seller from your phone.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back"><Feather name="arrow-left" size={19} color="#14231C" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => void loadListings(true)} accessibilityLabel="Refresh listings"><Feather name="refresh-cw" size={17} color="#52645A" /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>{manageOnly ? 'SELLER DASHBOARD' : 'CARDZIP COMMUNITY'}</Text>
            <Text style={styles.title}>{manageOnly ? 'Manage your listings' : 'Buy and sell nearby'}</Text>
            <Text style={styles.subtitle}>{manageOnly ? 'Create, update, promote, or mark your community listings as sold.' : 'Contact local sellers for community items, or securely purchase promoted websites and apps on Cardzip.'}</Text>
          </View>
          <View style={styles.headingActions}>
            {manageOnly
              ? <TouchableOpacity style={styles.createButton} onPress={startListing}><Feather name="plus" size={16} color="#FFFFFF" /><Text style={styles.createButtonText}>Post item</Text></TouchableOpacity>
              : <>
                <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/(main)/market/community/manage' as Href)}><Feather name="edit-3" size={14} color="#087A4C" /><Text style={styles.manageButtonText}>My listings</Text></TouchableOpacity>
                <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/(main)/market/community/chat' as Href)}><Feather name="message-circle" size={14} color="#087A4C" /><Text style={styles.manageButtonText}>Chats</Text>{unreadCommunityChats > 0 ? <View style={styles.chatCountBadge}><Text style={styles.chatCountText}>{unreadCommunityChats > 99 ? '99+' : unreadCommunityChats}</Text></View> : null}</TouchableOpacity>
              </>}
          </View>
        </View>

        <View style={styles.safetyNotice}>
          <Feather name="alert-triangle" size={20} color="#B96A12" />
          <View style={styles.safetyCopy}>
            <Text style={styles.safetyTitle}>Safety for local community listings</Text>
            <Text style={styles.safetyText}>For local items, meet in a safe public place and inspect before paying. Promoted websites and apps are Cardzip digital listings with secure checkout.</Text>
          </View>
        </View>

        {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}
        {token && promotionPerformance.length > 0 ? <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>Your community promotion performance</Text>
          {promotionPerformance.map((promotion) => <View key={promotion._id} style={styles.performanceRow}>
            <Text style={styles.performanceName} numberOfLines={1}>{promotion.targetName} · {promotion.status.replaceAll('_', ' ')}</Text>
            <Text style={styles.performanceMetrics}>{promotion.impressions} unique impressions  ·  {promotion.clicks} unique clicks  ·  {promotion.clickThroughRate}% CTR</Text>
          </View>)}
        </View> : null}
        {formOpen && manageOnly ? (
          <View style={styles.form}>
            <View style={styles.formTitleRow}><View><Text style={styles.formEyebrow}>{editingListingId ? 'EDIT LISTING' : 'NEW LISTING'}</Text><Text style={styles.formTitle}>{editingListingId ? 'Update your listing' : 'What are you selling?'}</Text></View><TouchableOpacity onPress={closeListingForm} accessibilityLabel="Close form"><Feather name="x" size={19} color="#52645A" /></TouchableOpacity></View>
            <TextInput style={styles.input} placeholder="Product name" placeholderTextColor="#82918B" maxLength={120} value={form.title} onChangeText={(title) => setForm({ ...form, title })} />
            <View style={styles.formRow}>
              <TouchableOpacity style={[styles.input, styles.halfInput, styles.categoryPicker]} onPress={() => setCategoryPickerOpen(true)} accessibilityRole="button" accessibilityLabel="Choose listing category">
                <Text style={[styles.categoryPickerText, !form.category && styles.categoryPlaceholder]} numberOfLines={1}>{form.category || 'Choose category'}</Text>
                <Feather name="chevron-down" size={16} color="#64746A" />
              </TouchableOpacity>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Price (NGN)" placeholderTextColor="#82918B" keyboardType="numeric" value={form.price} onChangeText={(price) => setForm({ ...form, price })} />
            </View>
            <View style={styles.conditionPanel}>
              <Text style={styles.conditionPanelTitle}>Condition</Text>
              <View style={styles.conditionOptions}>
                <TouchableOpacity style={[styles.conditionOption, form.condition === 'brand_new' && styles.conditionOptionSelected]} onPress={() => setForm({ ...form, condition: 'brand_new' })}><Text style={[styles.conditionOptionText, form.condition === 'brand_new' && styles.conditionOptionTextSelected]}>Brand new</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.conditionOption, form.condition === 'used' && styles.conditionOptionSelected]} onPress={() => setForm({ ...form, condition: 'used' })}><Text style={[styles.conditionOptionText, form.condition === 'used' && styles.conditionOptionTextSelected]}>Used</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.soldCheckRow} onPress={() => setForm({ ...form, isSold: !form.isSold })} accessibilityRole="checkbox" accessibilityState={{ checked: form.isSold }}><View style={[styles.checkbox, form.isSold && styles.checkboxChecked]}>{form.isSold ? <Feather name="check" size={12} color="#FFFFFF" /> : null}</View><Text style={styles.soldCheckText}>Already sold</Text></TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Your phone number" placeholderTextColor="#82918B" keyboardType="phone-pad" maxLength={24} value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
            <TextInput style={[styles.input, styles.descriptionInput]} placeholder="Describe the condition, included items, and anything a buyer should know." placeholderTextColor="#82918B" multiline maxLength={2000} value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
            <View style={styles.photoSection}>
              <Text style={styles.photoTitle}>Product photos{editingListingId ? ' · Optional replacement' : ' · Required'}</Text>
              <Text style={styles.photoHint}>{editingListingId ? 'Select replacement images, up to 6 JPEG, PNG, or WebP files at 8 MB each. Leave empty to keep current photos.' : `Add 1–${MAX_LISTING_IMAGES} JPEG, PNG, or WebP images up to 8 MB each.`}</Text>
              <TouchableOpacity style={styles.choosePhotosButton} onPress={() => void selectPhotos()}><Feather name="image" size={16} color="#087A4C" /><Text style={styles.choosePhotosText}>Choose photos ({photos.length}/{MAX_LISTING_IMAGES})</Text></TouchableOpacity>
              {photos.length > 0 ? <View style={styles.photoPreviewRow}>{photos.map((photo, index) => <View key={`${photo.uri}-${index}`} style={styles.photoPreviewWrap}>
                <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} accessibilityLabel={`Remove photo ${index + 1}`}><Feather name="x" size={13} color="#FFFFFF" /></TouchableOpacity>
              </View>)}</View> : null}
            </View>
            <Text style={styles.formSafety}>Your phone number will be visible to buyers. Only meet in a safe public place and inspect the item before payment.</Text>
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
            <TouchableOpacity style={[styles.publishButton, saving && styles.disabledButton]} onPress={() => void submitListing()} disabled={saving}><Text style={styles.publishButtonText}>{saving ? 'Saving…' : editingListingId ? 'Save changes' : 'Publish listing'}</Text><Feather name="arrow-right" size={16} color="#FFFFFF" /></TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.listingsHeader}><View><Text style={styles.eyebrow}>{manageOnly ? 'YOUR INVENTORY' : 'DIRECT FROM SELLERS'}</Text><Text style={styles.sectionTitle}>{manageOnly ? 'Your items' : 'Community listings'}</Text></View><Text style={styles.count}>{listings.length} items</Text></View>
        {loading ? <CardzipLoader label={manageOnly ? 'Loading your listings…' : 'Loading community listings…'} /> : error ? <Text style={styles.errorText}>{error}</Text> : listings.length === 0 ? <View style={styles.emptyState}><Feather name={manageOnly ? 'package' : 'camera'} size={23} color="#82918B" /><Text style={styles.emptyTitle}>{manageOnly ? 'No listings to manage' : 'No listings yet'}</Text><Text style={styles.emptyText}>{manageOnly ? 'Post an item to manage it here.' : 'Be the first to post an item for your community.'}</Text></View> : <View style={[styles.listingGrid, manageOnly && styles.manageListingGrid]}>{listings.map((listing) => (
          <View style={[styles.listingCard, manageOnly && styles.manageListingCard]} key={listing._id}>
            <TouchableOpacity style={styles.listingImageWrap} onPress={() => openListing(listing)}>
              {(listing.images?.[0] || listing.imageUrl) ? <Image source={{ uri: listing.images?.[0] || listing.imageUrl }} style={styles.listingImage} resizeMode="cover" /> : <View style={[styles.listingImage, styles.imagePlaceholder]}><Feather name="camera" size={24} color="#82918B" /></View>}
              {listing.isPromoted ? <Text style={styles.promotedBadge}>PROMOTED</Text> : null}
              {listing.isSold ? <Text style={styles.soldBadge}>SOLD</Text> : null}
            </TouchableOpacity>
            <View style={styles.listingBody}>
              <TouchableOpacity onPress={() => openListing(listing)} accessibilityRole="button" accessibilityLabel={`Open ${listing.title}`}>
              <Text style={styles.category}>{listing.category || 'General'}</Text>
              <Text style={styles.listingTitle}>{listing.title}</Text>
              <Text style={styles.conditionLabel}>{listing.condition === 'used' ? 'Used' : 'Brand new'}</Text>
              <Text style={styles.price}>{Number(listing.price) === 0 ? 'Free' : formatNaira(Number(listing.price))}</Text>
              <Text style={styles.description} numberOfLines={3}>{listing.description}</Text>
              <Text style={styles.seller}>Listed by {listing.sellerName}</Text>
              </TouchableOpacity>
              {manageOnly && !listing.isDigitalAsset && String(user?.id || '') === listing.sellerId ? <>
                <View style={styles.ownerActions}>
                  <TouchableOpacity style={styles.ownerStatusButton} onPress={() => void updateSoldStatus(listing)} disabled={updatingListingId === listing._id}><Text style={styles.ownerStatusText}>{updatingListingId === listing._id ? 'Updating…' : listing.isSold ? 'Mark available' : 'Mark sold'}</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.ownerEditButton} onPress={() => editListing(listing)} disabled={updatingListingId === listing._id}><Text style={styles.ownerEditText}>Edit listing</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.ownerDeleteButton} onPress={() => deleteListing(listing)} disabled={updatingListingId === listing._id}><Text style={styles.ownerDeleteText}>{updatingListingId === listing._id ? 'Working…' : 'Delete'}</Text></TouchableOpacity>
                </View>
                {!listing.isSold ? <TouchableOpacity style={styles.promoteButton} onPress={() => { setPromotionError(''); setPromotionListing(listing); }}><Feather name="trending-up" size={15} color="#087A4C" /><Text style={styles.promoteButtonText}>Promote this item</Text></TouchableOpacity> : null}
              </> : null}
              {!manageOnly && !listing.isDigitalAsset && (listing.isSold ? <Text style={styles.soldMessage}>This item has been sold</Text> : <View style={styles.contactRow}>
                <TouchableOpacity style={styles.contactButton} onPress={() => void openCommunityChat(listing)} accessibilityRole="button" accessibilityLabel={`Chat with seller about ${listing.title}`}><Feather name="message-circle" size={14} color="#087A4C" /><Text style={styles.contactText}>Chat seller</Text></TouchableOpacity>
                <TouchableOpacity style={styles.contactButton} onPress={() => void contactSeller(`https://wa.me/${whatsappNumber(listing.phone)}`)}><Feather name="message-square" size={14} color="#087A4C" /><Text style={styles.contactText}>WhatsApp</Text></TouchableOpacity>
              </View>)}
              {!manageOnly && !listing.isDigitalAsset ? <Text style={styles.inspectNote}>Meet safely and inspect before paying.</Text> : null}
            </View>
          </View>
        ))}</View>}
        {refreshing ? <Text style={styles.refreshingText}>Refreshing listings…</Text> : null}
      </ScrollView>
      <Modal visible={categoryPickerOpen} transparent animationType="fade" onRequestClose={() => setCategoryPickerOpen(false)}>
        <View style={styles.promotionBackdrop}>
          <View style={styles.categoryDialog}>
            <View style={styles.categoryDialogHeader}>
              <Text style={styles.promotionTitle}>Choose a category</Text>
              <TouchableOpacity onPress={() => setCategoryPickerOpen(false)} accessibilityLabel="Close categories">
                <Feather name="x" size={19} color="#52645A" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryOptions} showsVerticalScrollIndicator={false}>
              {[...new Set([...communityCategories, ...(form.category ? [form.category] : [])])].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryOption}
                  onPress={() => {
                    setForm((current) => ({ ...current, category }));
                    setCategoryPickerOpen(false);
                  }}
                >
                  <Text style={styles.categoryOptionText}>{category}</Text>
                  {form.category === category ? <Feather name="check" size={17} color="#087A4C" /> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={Boolean(promotionListing)} transparent animationType="fade" onRequestClose={() => setPromotionListing(null)}>
        <View style={styles.promotionBackdrop}>
          <View style={styles.promotionDialog}>
            <TouchableOpacity style={styles.promotionClose} onPress={() => setPromotionListing(null)} accessibilityLabel="Close promotion packages"><Feather name="x" size={19} color="#52645A" /></TouchableOpacity>
            <Text style={styles.promotionEyebrow}>COMMUNITY PROMOTION</Text>
            <Text style={styles.promotionTitle}>Choose a package</Text>
            <Text style={styles.promotionSubtitle}>Pay with Paystack. Your listing is promoted after admin approval, and the duration starts on approval.</Text>
            {promotionPricing.map((duration) => <TouchableOpacity key={duration.key} style={styles.promotionOption} disabled={!duration.price || promotionLoading} onPress={() => void promoteListing(duration)}>
              <View><Text style={styles.promotionOptionTitle}>{duration.label}</Text><Text style={styles.promotionOptionHint}>{duration.days} day{duration.days === 1 ? '' : 's'}</Text></View>
              <Text style={styles.promotionPrice}>{duration.price ? formatNaira(duration.price) : 'Not available'}</Text>
            </TouchableOpacity>)}
            {promotionPricing.length === 0 ? <Text style={styles.promotionSubtitle}>{promotionError || 'Promotion packages are unavailable right now.'}</Text> : null}
            {promotionError ? <Text style={styles.errorText}>{promotionError}</Text> : null}
            {promotionLoading ? <ActivityIndicator color="#087A4C" /> : null}
          </View>
        </View>
      </Modal>
      <MarketBottomTab activeTab="Store" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7F5' },
  header: { minHeight: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E2E9E4', backgroundColor: '#FFFFFF' },
  backButton: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  refreshButton: { width: 36, height: 36, alignItems: 'flex-end', justifyContent: 'center' },
  headerTitle: { color: '#14231C', fontSize: 15, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 28 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 17 },
  headingCopy: { flex: 1, minWidth: 0 },
  headingActions: { alignItems: 'flex-end', gap: 7 },
  eyebrow: { color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  title: { marginTop: 5, color: '#14231C', fontSize: 23, lineHeight: 29, fontWeight: '800' },
  subtitle: { marginTop: 4, color: '#64746A', fontSize: 10, lineHeight: 15 },
  createButton: { minHeight: 39, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 7, backgroundColor: '#087A4C' },
  createButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  manageButton: { minHeight: 34, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#CFE2D6', borderRadius: 7, backgroundColor: '#FFFFFF' },
  manageButtonText: { color: '#087A4C', fontSize: 9, fontWeight: '800' },
  chatCountBadge: { minWidth: 17, height: 17, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#B91C1C' },
  chatCountText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800' },
  safetyNotice: { padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 7, borderWidth: 1, borderColor: '#E9C78C', backgroundColor: '#FFF8EA' },
  safetyCopy: { flex: 1 },
  safetyTitle: { color: '#4A3216', fontSize: 12, fontWeight: '800' },
  safetyText: { marginTop: 4, color: '#654C2D', fontSize: 10, lineHeight: 15 },
  noticeText: { marginTop: 12, color: '#087A4C', fontSize: 11, fontWeight: '700' },
  performanceCard: { gap: 9, padding: 13, borderWidth: 1, borderColor: '#CFE2D6', borderRadius: 8, backgroundColor: '#F3FAF5' },
  performanceTitle: { color: '#14231C', fontSize: 12, fontWeight: '800' },
  performanceRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#DDEBE1' },
  performanceName: { color: '#33473B', fontSize: 10, fontWeight: '700' },
  performanceMetrics: { marginTop: 3, color: '#087A4C', fontSize: 10, fontWeight: '700' },
  form: { gap: 10, marginTop: 15, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#DCE6DF', backgroundColor: '#FFFFFF' },
  formTitleRow: { marginBottom: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formEyebrow: { color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  formTitle: { marginTop: 3, color: '#14231C', fontSize: 17, fontWeight: '800' },
  input: { minHeight: 42, paddingHorizontal: 11, paddingVertical: 10, borderWidth: 1, borderColor: '#D6E0D9', borderRadius: 6, backgroundColor: '#FFFFFF', color: '#14231C', fontSize: 12 },
  formRow: { flexDirection: 'row', gap: 9 },
  categoryPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  categoryPickerText: { flex: 1, color: '#14231C', fontSize: 12 },
  categoryPlaceholder: { color: '#82918B' },
  conditionPanel: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#D6E0D9' },
  conditionPanelTitle: { color: '#33473B', fontSize: 11, fontWeight: '800' },
  conditionOptions: { marginTop: 8, flexDirection: 'row', gap: 8 },
  conditionOption: { minHeight: 33, paddingHorizontal: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#D6E0D9', borderRadius: 16, backgroundColor: '#FFFFFF' },
  conditionOptionSelected: { borderColor: '#087A4C', backgroundColor: '#E8F5EC' },
  conditionOptionText: { color: '#64746A', fontSize: 10, fontWeight: '700' },
  conditionOptionTextSelected: { color: '#087A4C' },
  soldCheckRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 17, height: 17, alignItems: 'center', justifyContent: 'center', borderRadius: 3, borderWidth: 1, borderColor: '#98A89E' },
  checkboxChecked: { borderColor: '#087A4C', backgroundColor: '#087A4C' },
  soldCheckText: { color: '#47594E', fontSize: 10, fontWeight: '700' },
  halfInput: { flex: 1, minWidth: 0 },
  descriptionInput: { minHeight: 92, textAlignVertical: 'top' },
  photoSection: { gap: 7, padding: 11, borderWidth: 1, borderColor: '#D6E0D9', borderRadius: 6, backgroundColor: '#FAFCFA' },
  photoTitle: { color: '#33473B', fontSize: 11, fontWeight: '800' },
  photoHint: { color: '#718077', fontSize: 10, lineHeight: 15 },
  choosePhotosButton: { minHeight: 38, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#B9D9C6', borderRadius: 6, backgroundColor: '#EFF8F2' },
  choosePhotosText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  photoPreviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoPreviewWrap: { position: 'relative' },
  photoPreview: { width: 58, height: 58, borderRadius: 6, backgroundColor: '#E5ECE7' },
  removePhotoButton: { position: 'absolute', top: -5, right: -5, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#991B1B' },
  formSafety: { padding: 9, borderRadius: 5, backgroundColor: '#FFF8EA', color: '#694D28', fontSize: 10, lineHeight: 15 },
  errorText: { color: '#A32836', fontSize: 11, lineHeight: 16 },
  publishButton: { minHeight: 43, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, backgroundColor: '#087A4C' },
  publishButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  disabledButton: { opacity: 0.65 },
  listingsHeader: { marginTop: 23, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { marginTop: 3, color: '#14231C', fontSize: 18, fontWeight: '800' },
  count: { color: '#748278', fontSize: 10 },
  emptyState: { minHeight: 130, alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderStyle: 'dashed', borderColor: '#CBD8CE', borderRadius: 7, backgroundColor: '#FFFFFF' },
  emptyTitle: { color: '#26392E', fontSize: 13, fontWeight: '800' },
  emptyText: { color: '#718077', fontSize: 10 },
  listingGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'space-between', rowGap: 10 },
  listingCard: { width: '49%', marginBottom: 0, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E7E2', borderRadius: 7, backgroundColor: '#FFFFFF' },
  manageListingGrid: { flexDirection: 'column' },
  manageListingCard: { width: '100%' },
  listingImage: { width: '100%', height: 126, backgroundColor: '#EDF2EE' },
  listingImageWrap: { position: 'relative' },
  soldBadge: { position: 'absolute', top: 10, left: 10, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4, backgroundColor: '#991B1B', color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  promotedBadge: { position: 'absolute', top: 10, right: 10, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4, backgroundColor: '#087A4C', color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  listingBody: { padding: 9 },
  category: { color: '#087A4C', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  listingTitle: { marginTop: 4, color: '#14231C', fontSize: 13, fontWeight: '800' },
  conditionLabel: { marginTop: 3, color: '#718077', fontSize: 10, fontWeight: '700' },
  price: { marginTop: 4, color: '#087A4C', fontSize: 16, fontWeight: '800' },
  description: { marginTop: 7, color: '#64746A', fontSize: 10, lineHeight: 15 },
  seller: { marginTop: 8, color: '#748278', fontSize: 10 },
  ownerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  ownerStatusButton: { minHeight: 32, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D6E4DC', borderRadius: 7, backgroundColor: '#F4FAF6' },
  ownerStatusText: { color: '#087A4C', fontSize: 10, fontWeight: '800' },
  ownerEditButton: { minHeight: 32, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D6E4DC', borderRadius: 7, backgroundColor: '#F4FAF6' },
  ownerEditText: { color: '#087A4C', fontSize: 10, fontWeight: '800' },
  ownerDeleteButton: { minHeight: 32, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F0D6D5', borderRadius: 7, backgroundColor: '#FFF6F5' },
  ownerDeleteText: { color: '#A33B34', fontSize: 10, fontWeight: '800' },
  promoteButton: { minHeight: 36, marginTop: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#B9D9C6', borderRadius: 6, backgroundColor: '#EFF8F2' },
  promoteButtonText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  soldMessage: { marginTop: 12, padding: 11, borderRadius: 5, backgroundColor: '#FEF2F2', color: '#991B1B', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  contactRow: { marginTop: 10, flexDirection: 'row', gap: 4 },
  contactButton: { flex: 1, minWidth: 0, minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1, borderColor: '#CFE2D6', borderRadius: 5 },
  contactText: { color: '#087A4C', fontSize: 9, fontWeight: '800' },
  inspectNote: { marginTop: 8, color: '#9B631A', fontSize: 9 },
  refreshingText: { paddingVertical: 10, color: '#748278', fontSize: 10, textAlign: 'center' },
  promotionBackdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10, 22, 16, 0.62)' },
  categoryDialog: { maxHeight: '80%', padding: 17, borderRadius: 13, backgroundColor: '#FFFFFF' },
  categoryDialogHeader: { marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryOptions: { maxHeight: 440 },
  categoryOption: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E9E4' },
  categoryOptionText: { color: '#26392E', fontSize: 12, fontWeight: '600' },
  promotionDialog: { gap: 10, padding: 20, borderRadius: 12, backgroundColor: '#FFFFFF' },
  promotionClose: { position: 'absolute', top: 12, right: 12, zIndex: 1, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  promotionEyebrow: { color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  promotionTitle: { color: '#14231C', fontSize: 20, fontWeight: '800' },
  promotionSubtitle: { color: '#64746A', fontSize: 11, lineHeight: 17 },
  promotionOption: { minHeight: 52, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderWidth: 1, borderColor: '#DCE6DF', borderRadius: 7, backgroundColor: '#FFFFFF' },
  promotionOptionTitle: { color: '#26392E', fontSize: 12, fontWeight: '800' },
  promotionOptionHint: { marginTop: 2, color: '#718077', fontSize: 9 },
  promotionPrice: { color: '#087A4C', fontSize: 12, fontWeight: '800' },
});