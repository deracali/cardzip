import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector } from '../../../../store';
import CardzipLoader from '../../../../components/CardzipLoader';
import MarketBottomTab from '../bottomtab/bottomtab';
import {
  CommunityPromotionDuration,
  fetchCommunityListingApi,
  fetchCommunityListingReviewsApi,
  fetchMyCommunityListingReviewApi,
  fetchCommunityPromotionPricingApi,
  fetchRelatedCommunityListingsApi,
  saveCommunityListingReviewApi,
  startCommunityConversationApi,
} from '../../../../services/api/storeApi';
import { CommunityListing, CommunityListingReview, CommunityListingReviewSummary } from '../../../../types/store';
import { initializeCommunityPromotionPaymentApi, verifyCommunityPromotionPaymentApi } from '../../../../services/api/paymentApi';
import { openPaystackCheckout, verifyPaystackUntilSettled } from '../../../../services/api/paystackFlow';
import { recordCommunityCategoryInterest } from '../../../../services/communityPreferences';
import { formatNaira } from '../../../../utils/currency';

const callbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();
const ReviewStars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <View style={styles.reviewStars} accessibilityLabel={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => <MaterialCommunityIcons key={index} name={index < Math.round(rating) ? 'star' : 'star-outline'} size={size} color={index < Math.round(rating) ? '#D78A1F' : '#C6CFC9'} />)}
  </View>
);

export default function CommunityListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = String(id || '');
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const [listing, setListing] = useState<CommunityListing | null>(null);
  const [relatedListings, setRelatedListings] = useState<CommunityListing[]>([]);
  const [pricing, setPricing] = useState<CommunityPromotionDuration[]>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadedListingId, setLoadedListingId] = useState('');
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [error, setError] = useState('');
  const [promotionError, setPromotionError] = useState('');
  const [notice, setNotice] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<CommunityListingReviewSummary>({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [myReview, setMyReview] = useState<CommunityListingReview | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const ownerId = String(user?.id || '');
  const isOwner = Boolean(listing && listing.sellerId === ownerId);
  const images = useMemo(() => (
    listing?.images?.length ? listing.images : listing?.imageUrl ? [listing.imageUrl] : []
  ), [listing]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchCommunityListingApi(listingId),
      fetchRelatedCommunityListingsApi(listingId),
      fetchCommunityPromotionPricingApi(),
    ])
      .then(([item, related, packages]) => {
        if (!active) return;
        setListing(item);
        setLoadedListingId(listingId);
        void recordCommunityCategoryInterest(item.category || 'General');
        setSelectedImage(item.images?.[0] || item.imageUrl || '');
        setRelatedListings(related);
        setPricing(packages);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setListing(null);
          setLoadedListingId(listingId);
          setError(requestError instanceof Error ? requestError.message : 'Could not load this community listing.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listingId]);

  useEffect(() => {
    let active = true;
    setReviewSummary({ reviews: [], averageRating: 0, totalReviews: 0 });
    setMyReview(null);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    void fetchCommunityListingReviewsApi(listingId)
      .then((summary) => { if (active) setReviewSummary(summary); })
      .catch((requestError: unknown) => { if (active) setReviewError(requestError instanceof Error ? requestError.message : 'Could not load reviews.'); });
    if (token) {
      void fetchMyCommunityListingReviewApi(token, listingId)
        .then((review) => {
          if (!active) return;
          setMyReview(review);
          if (review) {
            setReviewRating(review.rating);
            setReviewComment(review.comment);
          } else {
            setReviewRating(5);
            setReviewComment('');
          }
        })
        .catch((requestError: unknown) => { if (active) setReviewError(requestError instanceof Error ? requestError.message : 'Could not load your review.'); });
    } else {
      setMyReview(null);
      setReviewRating(5);
      setReviewComment('');
    }
    return () => { active = false; };
  }, [listingId, token]);

  const contactSeller = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open contact', 'Try calling or messaging the seller from your phone.');
    }
  };

  const chatWithSeller = async () => {
    const chatListingId = listing?._id;
    if (!chatListingId) return;
    if (!token) {
      Alert.alert('Sign in to chat', 'Sign in to message this seller about their listing.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login' as Href) },
      ]);
      return;
    }
    setChatLoading(true);
    try {
      const conversation = await startCommunityConversationApi(token, chatListingId);
      router.push(`/(main)/market/community/chat/${conversation._id}` as Href);
    } catch (requestError) {
      Alert.alert('Unable to start chat', requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const startPromotion = async (duration: CommunityPromotionDuration) => {
    if (!token || !listing) return;
    setPromotionLoading(true);
    setPromotionError('');
    try {
      const returnUrl = callbackUrl || ExpoLinking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeCommunityPromotionPaymentApi(token, listing._id, duration.key, returnUrl);
      await openPaystackCheckout(payment.authorizationUrl, returnUrl);
      await verifyPaystackUntilSettled({
        verify: () => verifyCommunityPromotionPaymentApi(token, payment.reference),
        getStatus: (result) => result.status === 'completed' && result.promotion ? 'completed' : 'pending',
        failureMessage: 'Paystack did not complete this promotion payment.',
        pendingMessage: 'Promotion payment is still being confirmed. Try verifying again shortly.',
      });
      setPromotionOpen(false);
      setNotice('Payment confirmed. Your promotion is waiting for administrator approval.');
    } catch (requestError) {
      setPromotionError(requestError instanceof Error ? requestError.message : 'Could not complete this promotion payment.');
    } finally {
      setPromotionLoading(false);
    }
  };

  const submitReview = async () => {
    if (!token) {
      Alert.alert('Sign in to review', 'Sign in to share your experience with this product.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login' as Href) },
      ]);
      return;
    }
    if (reviewComment.trim().length < 3 || reviewSubmitting) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const saved = await saveCommunityListingReviewApi(token, listingId, reviewRating, reviewComment.trim());
      setMyReview(saved);
      setReviewComment(saved.comment);
      const summary = await fetchCommunityListingReviewsApi(listingId);
      setReviewSummary(summary);
    } catch (requestError) {
      setReviewError(requestError instanceof Error ? requestError.message : 'Could not save your review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading || loadedListingId !== listingId) return <SafeAreaView style={styles.safeArea}><CardzipLoader label="Loading community listing…" /></SafeAreaView>;
  if (!listing) {
    return <SafeAreaView style={styles.safeArea}>
      <View style={styles.emptyState}><Text style={styles.errorTitle}>Listing unavailable</Text><Text style={styles.errorText}>{error || 'This listing could not be found.'}</Text><TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Text style={styles.backButtonText}>Go back</Text></TouchableOpacity></View>
    </SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back"><Feather name="arrow-left" size={20} color="#0F172A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Community listing</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.heroImage} resizeMode="cover" /> : <View style={[styles.heroImage, styles.imagePlaceholder]}><Feather name="camera" size={27} color="#82918B" /></View>}
          {listing.isPromoted ? <Text style={styles.promotedBadge}>PROMOTED</Text> : null}
          {listing.isSold ? <Text style={styles.soldBadge}>SOLD</Text> : null}
        </View>
        {images.length > 1 ? <ScrollView horizontal contentContainerStyle={styles.thumbnailRow} showsHorizontalScrollIndicator={false}>
          {images.map((image, index) => <TouchableOpacity key={`${image}-${index}`} style={[styles.thumbnailButton, selectedImage === image && styles.thumbnailSelected]} onPress={() => setSelectedImage(image)} accessibilityLabel={`View photo ${index + 1}`}><Image source={{ uri: image }} style={styles.thumbnail} /></TouchableOpacity>)}
        </ScrollView> : null}
        <View style={styles.details}>
          <Text style={styles.category}>{listing.category || 'General'}</Text>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.sellerRow}>
            {listing.sellerImage
              ? <Image source={{ uri: listing.sellerImage }} style={styles.sellerAvatar} />
              : <View style={[styles.sellerAvatar, styles.sellerAvatarPlaceholder]}><Feather name="user" size={14} color="#087A4C" /></View>}
            <Text style={styles.condition}>{listing.condition === 'used' ? 'Used' : 'Brand new'} · Listed by {listing.sellerName}</Text>
          </View>
          <Text style={styles.price}>{Number(listing.price) === 0 ? 'Free' : formatNaira(Number(listing.price))}</Text>
          <Text style={styles.description}>{listing.description}</Text>
          <View style={styles.safetyNotice}><Feather name="shield" size={17} color="#B96A12" /><Text style={styles.safetyText}>Meet in a safe public place, inspect the item, and never pay in advance.</Text></View>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {listing.isSold ? <Text style={styles.soldMessage}>This item has been sold.</Text> : !isOwner ? <>
            <TouchableOpacity style={styles.chatSellerButton} disabled={chatLoading} onPress={() => void chatWithSeller()} accessibilityRole="button" accessibilityLabel={`Chat with ${listing.sellerName}`}>
              {chatLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Feather name="message-circle" size={16} color="#FFFFFF" />}
              <Text style={styles.chatSellerButtonText}>Chat with seller</Text>
            </TouchableOpacity>
            <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactButton} onPress={() => void contactSeller(`tel:${listing.phone}`)}><Feather name="phone" size={15} color="#087A4C" /><Text style={styles.contactText}>Call seller</Text></TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={() => void contactSeller(`https://wa.me/${listing.phone.replace(/\D/g, '')}`)}><Feather name="message-square" size={15} color="#087A4C" /><Text style={styles.contactText}>WhatsApp</Text></TouchableOpacity>
            </View>
          </> : null}
          {isOwner && !listing.isSold ? <TouchableOpacity style={styles.promoteButton} onPress={() => { setPromotionError(''); setPromotionOpen(true); }}><Feather name="trending-up" size={16} color="#087A4C" /><Text style={styles.promoteText}>Promote this product</Text><Feather name="arrow-right" size={15} color="#087A4C" /></TouchableOpacity> : null}
        </View>
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeading}>
            <View><Text style={styles.reviewsEyebrow}>COMMUNITY REVIEWS</Text><Text style={styles.reviewsTitle}>Product reviews</Text></View>
            <View style={styles.reviewSummary}><ReviewStars rating={reviewSummary.averageRating} /><Text style={styles.reviewAverage}>{reviewSummary.averageRating ? reviewSummary.averageRating.toFixed(1) : 'New'}</Text><Text style={styles.reviewCount}>{reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'}</Text></View>
          </View>
          {reviewError ? <Text style={styles.reviewError}>{reviewError}</Text> : null}
          {reviewSummary.reviews.length ? reviewSummary.reviews.map((review) => <View key={review._id} style={styles.reviewItem}>
            <View style={styles.reviewItemHeading}><Text style={styles.reviewAuthor}>{review.reviewer?.name || 'Cardzip member'}</Text><ReviewStars rating={review.rating} size={12} /><Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text></View>
            <Text style={styles.reviewBody}>{review.comment}</Text>
          </View>) : <Text style={styles.noReviews}>No reviews yet. Share your experience with this product.</Text>}
          {!isOwner ? token ? <View style={styles.reviewForm}>
            <Text style={styles.reviewFormTitle}>{myReview ? 'Update your review' : 'Leave a review'}</Text>
            <View style={styles.reviewPicker} accessibilityLabel="Your rating">
              {Array.from({ length: 5 }, (_, index) => <TouchableOpacity key={index} style={styles.reviewStarButton} onPress={() => setReviewRating(index + 1)} accessibilityRole="button" accessibilityLabel={`Rate ${index + 1} out of 5`} accessibilityState={{ selected: reviewRating === index + 1 }}><MaterialCommunityIcons name={index < reviewRating ? 'star' : 'star-outline'} size={23} color={index < reviewRating ? '#D78A1F' : '#C6CFC9'} /></TouchableOpacity>)}
            </View>
            <TextInput value={reviewComment} onChangeText={setReviewComment} placeholder="What should other customers know?" placeholderTextColor="#82918B" multiline maxLength={1000} style={styles.reviewInput} accessibilityLabel="Review comment" />
            <View style={styles.reviewFormFooter}><Text style={styles.reviewCharacterCount}>{reviewComment.length}/1000</Text><TouchableOpacity style={[styles.reviewSubmitButton, (reviewSubmitting || reviewComment.trim().length < 3) && styles.reviewSubmitDisabled]} disabled={reviewSubmitting || reviewComment.trim().length < 3} onPress={() => void submitReview()}>{reviewSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.reviewSubmitText}>{myReview ? 'Update review' : 'Post review'}</Text>}</TouchableOpacity></View>
          </View> : <View style={styles.reviewSignIn}><Text style={styles.noReviews}>Sign in to share your experience.</Text><TouchableOpacity onPress={() => router.push('/(auth)/login' as Href)}><Text style={styles.reviewSignInText}>Sign in</Text></TouchableOpacity></View> : null}
        </View>
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related community listings</Text>
          {relatedListings.length ? relatedListings.map((item) => <TouchableOpacity key={item._id} style={styles.relatedCard} onPress={() => router.push(`/(main)/market/community/${item._id}` as Href)}>
            {(item.images?.[0] || item.imageUrl) ? <Image source={{ uri: item.images?.[0] || item.imageUrl }} style={styles.relatedImage} /> : <View style={[styles.relatedImage, styles.imagePlaceholder]}><Feather name="camera" size={20} color="#82918B" /></View>}
            <View style={styles.relatedCopy}><Text style={styles.category}>{item.category || 'General'}{item.isPromoted ? ' · PROMOTED' : ''}</Text><Text style={styles.relatedName}>{item.title}</Text><Text style={styles.relatedPrice}>{Number(item.price) === 0 ? 'Free' : formatNaira(Number(item.price))}</Text></View>
            <Feather name="chevron-right" size={18} color="#82918B" />
          </TouchableOpacity>) : <Text style={styles.noRelated}>More similar items will appear here.</Text>}
        </View>
      </ScrollView>
      <Modal visible={promotionOpen} transparent animationType="fade" onRequestClose={() => setPromotionOpen(false)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPromotionOpen(false)} accessibilityLabel="Close promotion packages"><Feather name="x" size={19} color="#52645A" /></TouchableOpacity>
          <Text style={styles.modalEyebrow}>COMMUNITY PROMOTION</Text><Text style={styles.modalTitle}>Choose a package</Text>
          <Text style={styles.modalHint}>Payment is confirmed with Paystack. Your promotion starts after admin approval.</Text>
          {pricing.map((duration) => <TouchableOpacity key={duration.key} style={styles.durationOption} disabled={!duration.price || promotionLoading} onPress={() => void startPromotion(duration)}>
            <Text style={styles.durationLabel}>{duration.label}</Text><Text style={styles.durationPrice}>{duration.price ? formatNaira(duration.price) : 'Not available'}</Text>
          </TouchableOpacity>)}
          {promotionError ? <Text style={styles.errorText}>{promotionError}</Text> : null}
          {promotionLoading ? <ActivityIndicator color="#087A4C" /> : null}
        </View></View>
      </Modal>
      <MarketBottomTab activeTab="Store" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  headerTitle: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#F1F5F9' },
  content: { paddingBottom: 30 },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 310, backgroundColor: '#E2E8F0' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  promotedBadge: { position: 'absolute', top: 12, right: 12, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 5, backgroundColor: '#087A4C', color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  soldBadge: { position: 'absolute', top: 12, left: 12, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 5, backgroundColor: '#991B1B', color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  thumbnailRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  thumbnailButton: { padding: 2, borderWidth: 2, borderColor: 'transparent', borderRadius: 8 },
  thumbnailSelected: { borderColor: '#087A4C' },
  thumbnail: { width: 58, height: 58, borderRadius: 6, backgroundColor: '#E2E8F0' },
  details: { paddingHorizontal: 18, paddingTop: 6 },
  category: { color: '#087A4C', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { marginTop: 7, color: '#0F172A', fontSize: 22, lineHeight: 28, fontWeight: '800' },
  condition: { marginTop: 5, color: '#64748B', fontSize: 11, fontWeight: '600' },
  sellerRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sellerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F5EC' },
  sellerAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  price: { marginTop: 14, color: '#047857', fontSize: 21, fontWeight: '800' },
  description: { marginTop: 14, color: '#475569', fontSize: 13, lineHeight: 20 },
  safetyNotice: { marginTop: 16, padding: 11, flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderColor: '#E9C78C', borderRadius: 8, backgroundColor: '#FFF8EA' },
  safetyText: { flex: 1, color: '#654C2D', fontSize: 10, lineHeight: 15 },
  notice: { marginTop: 12, color: '#087A4C', fontSize: 11, fontWeight: '700' },
  contactRow: { flexDirection: 'row', gap: 7, marginTop: 16 },
  chatSellerButton: { minHeight: 44, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 7, backgroundColor: '#087A4C' },
  chatSellerButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  contactButton: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#CFE2D6', borderRadius: 7, backgroundColor: '#FFFFFF' },
  contactText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  soldMessage: { marginTop: 16, color: '#991B1B', fontSize: 12, fontWeight: '800' },
  reviewsSection: { gap: 12, marginTop: 24, paddingHorizontal: 18, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#DFE8E2' },
  reviewsHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  reviewsEyebrow: { color: '#07804E', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  reviewsTitle: { marginTop: 4, color: '#0F172A', fontSize: 17, fontWeight: '800' },
  reviewSummary: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reviewStars: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  reviewAverage: { color: '#1E293B', fontSize: 12, fontWeight: '800' },
  reviewCount: { color: '#64748B', fontSize: 9 },
  reviewItem: { paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#E6ECE8' },
  reviewItemHeading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  reviewAuthor: { color: '#26392E', fontSize: 11, fontWeight: '800' },
  reviewDate: { marginLeft: 'auto', color: '#718077', fontSize: 9 },
  reviewBody: { marginTop: 7, color: '#56665C', fontSize: 11, lineHeight: 17 },
  noReviews: { color: '#64748B', fontSize: 11, lineHeight: 17 },
  reviewForm: { gap: 10, padding: 13, borderWidth: 1, borderColor: '#DCE6DF', borderRadius: 8, backgroundColor: '#FFFFFF' },
  reviewFormTitle: { color: '#26392E', fontSize: 12, fontWeight: '800' },
  reviewPicker: { flexDirection: 'row', gap: 3 },
  reviewStarButton: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  reviewInput: { minHeight: 84, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: '#DCE6DF', borderRadius: 6, color: '#26392E', fontSize: 11, textAlignVertical: 'top' },
  reviewFormFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewCharacterCount: { color: '#718077', fontSize: 9 },
  reviewSubmitButton: { minHeight: 37, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#087A4C' },
  reviewSubmitDisabled: { opacity: 0.55 },
  reviewSubmitText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  reviewSignIn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewSignInText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  reviewError: { color: '#A32836', fontSize: 10, lineHeight: 15 },
  promoteButton: { minHeight: 44, marginTop: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderWidth: 1, borderColor: '#B9D9C6', borderRadius: 8, backgroundColor: '#EFF8F2' },
  promoteText: { flex: 1, color: '#087A4C', fontSize: 11, fontWeight: '800' },
  relatedSection: { gap: 10, marginTop: 28, paddingHorizontal: 18 },
  relatedTitle: { marginBottom: 2, color: '#0F172A', fontSize: 16, fontWeight: '800' },
  relatedCard: { minHeight: 82, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 9, backgroundColor: '#FFFFFF' },
  relatedImage: { width: 62, height: 62, borderRadius: 7, backgroundColor: '#E2E8F0' },
  relatedCopy: { flex: 1, gap: 4 },
  relatedName: { color: '#1E293B', fontSize: 12, fontWeight: '800' },
  relatedPrice: { color: '#047857', fontSize: 11, fontWeight: '800' },
  noRelated: { color: '#64748B', fontSize: 11 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10, 22, 16, 0.62)' },
  modalCard: { gap: 10, padding: 20, borderRadius: 12, backgroundColor: '#FFFFFF' },
  modalClose: { position: 'absolute', top: 10, right: 10, zIndex: 1, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  modalEyebrow: { color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  modalTitle: { color: '#14231C', fontSize: 20, fontWeight: '800' },
  modalHint: { color: '#64746A', fontSize: 11, lineHeight: 16 },
  durationOption: { minHeight: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#DCE6DF', borderRadius: 7 },
  durationLabel: { color: '#26392E', fontSize: 12, fontWeight: '800' },
  durationPrice: { color: '#087A4C', fontSize: 12, fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  errorTitle: { color: '#0F172A', fontSize: 20, fontWeight: '800' },
  errorText: { marginTop: 8, color: '#991B1B', fontSize: 11, lineHeight: 16 },
  backButton: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9, backgroundColor: '#059669' },
  backButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
