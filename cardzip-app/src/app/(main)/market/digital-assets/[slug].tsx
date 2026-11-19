import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector } from '../../../../store';
import {
  CommunityPromotionDuration,
  fetchCommunityPromotionPricingApi,
  fetchMyDigitalAssetsApi,
  fetchStoreProductBySlugApi,
} from '../../../../services/api/storeApi';
import {
  downloadDigitalProductFileApi,
  initializeDigitalAssetPromotionPaymentApi,
  initializeDigitalProductPaymentApi,
  initializeSellerDigitalAssetPaymentApi,
  fetchMyDigitalProductPaymentsApi,
  SellerDigitalAssetPaystackVerification,
  verifyCommunityPromotionPaymentApi,
  verifyDigitalProductPaymentApi,
  verifySellerDigitalAssetPaymentApi,
} from '../../../../services/api/paymentApi';
import { openPaystackCheckout, verifyPaystackUntilSettled } from '../../../../services/api/paystackFlow';
import { StoreProduct } from '../../../../types/store';
import { formatNaira } from '../../../../utils/currency';
import MarketBottomTab from '../bottomtab/bottomtab';

const callbackUrl = process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL?.trim();
type DigitalProductReceipt = {
  productId: string;
  purchaseType: 'use' | 'template';
  accessUrl?: string;
  sourceCodeAvailable?: boolean;
  templateSourceCodeAvailable?: boolean;
  documents: { name: string; mimeType: string }[];
  templateDocuments?: { name: string; mimeType: string }[];
  reference: string;
};
type SellerReceipt = SellerDigitalAssetPaystackVerification['sellerDigitalAsset'] & { reference: string };
type PurchaseHistoryData = {
  key: string;
  paidOptions: { use: boolean; template: boolean };
  receipt: DigitalProductReceipt | null;
  sellerReceipt: SellerReceipt | null;
};

const normalizeHttpUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
};

const openCheckoutUrl = async (authorizationUrl: string, returnUrl: string) => {
  const checkoutUrl = normalizeHttpUrl(authorizationUrl);
  if (!checkoutUrl) throw new Error('The payment provider returned an invalid checkout URL. Please try again.');
  try {
    new URL(returnUrl);
  } catch {
    throw new Error('The payment callback URL is invalid. Check EXPO_PUBLIC_PAYSTACK_CALLBACK_URL.');
  }
  await openPaystackCheckout(checkoutUrl, returnUrl);
};

const getShortDocumentName = (name: string) => {
  const title = name.replace(/\.[^.]+$/, '').trim();
  if (/certificate/i.test(title) && /cardzip[\s-]+services/i.test(title)) return 'Certificate · Cardzip';
  return title.length > 22 ? `${title.slice(0, 21).trimEnd()}…` : title;
};

export default function DigitalAssetDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const assetSlug = String(slug || '');
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const [asset, setAsset] = useState<StoreProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageViewer, setImageViewer] = useState<{ images: string[]; index: number; source: 'asset' | 'receipt' } | null>(null);
  const [websitePreviewUrl, setWebsitePreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadedSlug, setLoadedSlug] = useState('');
  const [busyOption, setBusyOption] = useState<'use' | 'template' | ''>('');
  const [error, setError] = useState('');
  const [purchaseErrorState, setPurchaseErrorState] = useState<{ key: string; message: string } | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryData | null>(null);
  const [downloadingFile, setDownloadingFile] = useState('');
  const [ownerAssetId, setOwnerAssetId] = useState('');
  const [promotionPrices, setPromotionPrices] = useState<CommunityPromotionDuration[]>([]);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionError, setPromotionError] = useState('');
  const [promotionNotice, setPromotionNotice] = useState('');
  const isApp = asset?.productType === 'app' || asset?.productType === 'ios_app';
  const isAndroidApp = asset?.productType === 'app';
  const productId = String(asset?._id || asset?.id || '');
  const purchaseHistoryKey = `${user?.id ?? ''}:${productId}`;
  const currentPurchaseHistory = purchaseHistory?.key === purchaseHistoryKey ? purchaseHistory : null;
  const receipt = currentPurchaseHistory?.receipt ?? null;
  const sellerReceipt = currentPurchaseHistory?.sellerReceipt ?? null;
  const paidOptions = currentPurchaseHistory?.paidOptions ?? { use: false, template: false };
  const purchaseError = purchaseErrorState?.key === purchaseHistoryKey ? purchaseErrorState.message : '';
  const checkingPurchaseHistory = Boolean(token && productId && !currentPurchaseHistory);
  const updatePurchaseHistory = useCallback((changes: Partial<Omit<PurchaseHistoryData, 'key'>>) => {
    setPurchaseHistory((current) => ({
      key: purchaseHistoryKey,
      paidOptions: current?.key === purchaseHistoryKey ? current.paidOptions : { use: false, template: false },
      receipt: current?.key === purchaseHistoryKey ? current.receipt : null,
      sellerReceipt: current?.key === purchaseHistoryKey ? current.sellerReceipt : null,
      ...changes,
    }));
  }, [purchaseHistoryKey]);
  const setReceipt = (value: DigitalProductReceipt | null) => updatePurchaseHistory({ receipt: value });
  const setSellerReceipt = (value: SellerReceipt | null) => updatePurchaseHistory({ sellerReceipt: value });
  const setPaidOptions = (value: { use: boolean; template: boolean }) => updatePurchaseHistory({ paidOptions: value });
  const setPurchaseError = useCallback((message: string) => {
    setPurchaseErrorState({ key: purchaseHistoryKey, message });
  }, [purchaseHistoryKey]);
  const assetImages = asset
    ? [...new Set([asset.image, ...(asset.images ?? [])]
      .filter((image): image is string => typeof image === 'string' && Boolean(image.trim()))
      .map((image) => image.trim()))]
    : [];
  const selectedImage = assetImages[selectedImageIndex] || assetImages[0] || '';

  useEffect(() => {
    let active = true;
    if (!token || !productId) return () => { active = false; };
    fetchMyDigitalProductPaymentsApi(token, productId)
      .then(async (payments) => {
        const verified = await Promise.all(payments
          .filter((payment) => ['pending', 'completed'].includes(payment.status) && payment.reference)
          .slice(0, 10)
          .map(async (payment) => {
            try {
              if (payment.purpose === 'seller_digital_asset') {
                const verification = await verifySellerDigitalAssetPaymentApi(token, payment.reference);
                const purchased = verification.sellerDigitalAsset;
                if (verification.status !== 'completed' || purchased.productId !== productId) return null;
                return { purpose: 'seller_digital_asset' as const, reference: payment.reference, purchased };
              }
              const verification = await verifyDigitalProductPaymentApi(token, payment.reference);
              const purchased = verification.digitalProduct;
              if (verification.status !== 'completed' || purchased.productId !== productId) return null;
              return { purpose: 'digital_product' as const, reference: payment.reference, purchased };
            } catch {
              return null;
            }
          }));
        if (!active) return;
        const confirmedPurchases = verified.filter(
          (purchase): purchase is NonNullable<typeof purchase> => purchase !== null,
        );
        updatePurchaseHistory({ paidOptions: {
          use: confirmedPurchases.some((purchase) => purchase.purchased.purchaseType === 'use'),
          template: confirmedPurchases.some((purchase) => purchase.purchased.purchaseType === 'template'),
        } });
        const latestPurchase = confirmedPurchases[0];
        if (!latestPurchase) {
          updatePurchaseHistory({ receipt: null, sellerReceipt: null });
          return;
        }
        if (latestPurchase.purpose === 'seller_digital_asset') {
          updatePurchaseHistory({
            sellerReceipt: { ...latestPurchase.purchased, reference: latestPurchase.reference },
            receipt: null,
          });
        } else {
          updatePurchaseHistory({
            receipt: { ...latestPurchase.purchased, reference: latestPurchase.reference },
            sellerReceipt: null,
          });
        }
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        updatePurchaseHistory({ paidOptions: { use: false, template: false }, receipt: null, sellerReceipt: null });
        setPurchaseError(requestError instanceof Error ? requestError.message : 'Could not load your purchase history.');
      });
    return () => { active = false; };
  }, [productId, setPurchaseError, token, updatePurchaseHistory]);

  useEffect(() => {
    let active = true;
    fetchStoreProductBySlugApi(assetSlug)
      .then((result) => {
        if (!active) return;
        setAsset(result);
        setSelectedImageIndex(0);
        setImageViewer(null);
        setLoadedSlug(assetSlug);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'Could not load this digital product.');
        setLoadedSlug(assetSlug);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [assetSlug]);

  useEffect(() => {
    let active = true;
    if (!token || !asset?.isSellerListing) {
      return () => { active = false; };
    }
    Promise.all([fetchMyDigitalAssetsApi(token), fetchCommunityPromotionPricingApi()])
      .then(([myAssets, prices]) => {
        if (!active) return;
        const ownedAsset = myAssets.find((item) => item._id === productId && item.sellerListingStatus === 'approved');
        setOwnerAssetId(ownedAsset?._id || '');
        setPromotionPrices(prices);
      })
      .catch((requestError: unknown) => {
        if (active) setPromotionError(requestError instanceof Error ? requestError.message : 'Could not load promotion options.');
      });
    return () => { active = false; };
  }, [asset?.isSellerListing, productId, token]);
  const isOwner = Boolean(token && ownerAssetId === productId);

  const openAssetImage = () => {
    if (selectedImage) setImageViewer({ images: assetImages, index: selectedImageIndex, source: 'asset' });
  };

  const openReceiptImage = (index: number) => {
    const images = sellerReceipt?.screenshots || [];
    if (images.length) setImageViewer({ images, index, source: 'receipt' });
  };

  const stepImageViewer = (direction: -1 | 1) => {
    if (!imageViewer || imageViewer.images.length < 2) return;
    const index = (imageViewer.index + direction + imageViewer.images.length) % imageViewer.images.length;
    setImageViewer({ ...imageViewer, index });
    if (imageViewer.source === 'asset') setSelectedImageIndex(index);
  };

  const purchase = async (option: 'use' | 'template') => {
    if (checkingPurchaseHistory || paidOptions[option]) return;
    if (!token) {
      Alert.alert('Sign in required', 'Sign in to purchase this digital product.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login' as Href) },
      ]);
      return;
    }
    if (!productId) return;
    setBusyOption(option);
    setPurchaseError('');
    try {
      const returnUrl = callbackUrl || ExpoLinking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeDigitalProductPaymentApi(token, productId, option, returnUrl);
      await openCheckoutUrl(payment.authorizationUrl, returnUrl);
      const result = await verifyPaystackUntilSettled({
        verify: () => verifyDigitalProductPaymentApi(token, payment.reference),
        getStatus: (verification) => verification.status === 'completed' && verification.digitalProduct ? 'completed' : 'pending',
        failureMessage: 'Paystack did not complete this digital-product payment.',
        pendingMessage: 'Payment is still being confirmed. Verify again shortly.',
      });
      setPaidOptions((current) => ({ ...current, [option]: true }));
      setReceipt({
        productId,
        purchaseType: result.digitalProduct.purchaseType,
        accessUrl: result.digitalProduct.accessUrl,
        documents: result.digitalProduct.documents || [],
        sourceCodeAvailable: result.digitalProduct.sourceCodeAvailable,
        templateSourceCodeAvailable: result.digitalProduct.templateSourceCodeAvailable,
        templateDocuments: result.digitalProduct.templateDocuments || [],
        reference: payment.reference,
      });
      setSellerReceipt(null);
      Alert.alert(
        'Payment confirmed',
        option === 'template'
          ? result.digitalProduct.sourceCodeAvailable || result.digitalProduct.templateSourceCodeAvailable
            ? 'Your template source-code ZIP is ready below. Contact Cardzip support to coordinate any setup or upload help.'
            : 'Your full project template is confirmed. Contact Cardzip support to coordinate the backend handover and two weeks of setup and upload.'
          : isApp
            ? 'Your app is ready. Use the download button below to get the hosted APK.'
            : 'Your website use option is confirmed. Open it below or contact support for setup help.',
      );
    } catch (requestError) {
      setPurchaseError(requestError instanceof Error ? requestError.message : 'Could not complete this payment.');
    } finally {
      setBusyOption('');
    }
  };

  const purchaseSellerListing = async (option: 'use' | 'template') => {
    if (checkingPurchaseHistory || paidOptions[option]) return;
    if (!token) {
      Alert.alert('Sign in required', 'Sign in to purchase this digital listing.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login' as Href) },
      ]);
      return;
    }
    if (!productId) return;
    setBusyOption(option);
    setPurchaseError('');
    try {
      const returnUrl = callbackUrl || ExpoLinking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeSellerDigitalAssetPaymentApi(token, productId, option, returnUrl);
      await openCheckoutUrl(payment.authorizationUrl, returnUrl);
      const result = await verifyPaystackUntilSettled({
        verify: () => verifySellerDigitalAssetPaymentApi(token, payment.reference),
        getStatus: (verification) => verification.status === 'completed' && verification.sellerDigitalAsset ? 'completed' : 'pending',
        failureMessage: 'Paystack did not complete this digital-listing payment.',
        pendingMessage: 'Payment is still being confirmed. Verify again shortly.',
      });
      setPaidOptions((current) => ({ ...current, [option]: true }));
      setSellerReceipt({ ...result.sellerDigitalAsset, reference: payment.reference });
      setReceipt(null);
      Alert.alert('Payment confirmed', `You can now access the listing. The seller received ${formatNaira(result.sellerDigitalAsset.sellerShare)} (70%); Cardzip retained 30%.`);
    } catch (requestError) {
      setPurchaseError(requestError instanceof Error ? requestError.message : 'Could not complete this payment.');
    } finally {
      setBusyOption('');
    }
  };

  const promoteDigitalAsset = async (duration: CommunityPromotionDuration) => {
    if (!token || !productId) {
      Alert.alert('Sign in required', 'Sign in to promote your website or app.');
      return;
    }
    setPromotionLoading(true);
    setPromotionError('');
    setPromotionNotice('');
    try {
      const returnUrl = callbackUrl || ExpoLinking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeDigitalAssetPromotionPaymentApi(token, productId, duration.key, returnUrl);
      await openCheckoutUrl(payment.authorizationUrl, returnUrl);
      await verifyPaystackUntilSettled({
        verify: () => verifyCommunityPromotionPaymentApi(token, payment.reference),
        getStatus: (result) => result.status === 'completed' && result.promotion ? 'completed' : 'pending',
        failureMessage: 'Paystack did not complete this promotion payment.',
        pendingMessage: 'Promotion payment is still being confirmed. Try again shortly.',
      });
      setPromotionNotice('Payment confirmed. Your listing promotion is waiting for administrator approval.');
    } catch (requestError) {
      setPromotionError(requestError instanceof Error ? requestError.message : 'Could not complete the promotion payment.');
    } finally {
      setPromotionLoading(false);
    }
  };

  const openAccess = async (url: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      setPurchaseError('Could not open this download or access link. Please try again or contact support.');
    }
  };

  const openWebsite = (url: string) => {
    const websiteUrl = normalizeHttpUrl(url);
    if (!websiteUrl) {
      setPurchaseError('This website link is invalid. Check that it is a complete URL.');
      return;
    }
    setPurchaseError('');
    setWebsitePreviewUrl(websiteUrl);
  };

  const downloadPurchasedFile = async (
    fileType: 'source-code' | 'document' | 'template-document',
    documentIndex: number,
    filename: string,
    mimeType = 'application/octet-stream',
  ) => {
    const purchased = sellerReceipt || receipt;
    if (!purchased?.reference) {
      setPurchaseError('The verified payment reference is missing. Return to this product and check your purchase.');
      return;
    }
    const archiveType = fileType === 'source-code'
      ? purchased.purchaseType === 'template' ? 'template-source-code' : 'rental-source-code'
      : fileType;
    const key = fileType === 'source-code' ? archiveType : `${fileType}-${documentIndex}`;
    setDownloadingFile(key);
    setPurchaseError('');
    try {
      const uri = await downloadDigitalProductFileApi(
        token || '',
        productId,
        archiveType,
        documentIndex,
        purchased.reference,
        filename,
      );
      if (!(await Sharing.isAvailableAsync())) {
        setPurchaseError('The file was downloaded, but sharing is unavailable on this device.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType, dialogTitle: filename });
    } catch (requestError) {
      setPurchaseError(requestError instanceof Error ? requestError.message : 'Could not download this purchased file.');
    } finally {
      setDownloadingFile('');
    }
  };

  if (loading || loadedSlug !== assetSlug) return <SafeAreaView style={styles.safeArea}><ActivityIndicator style={styles.loader} size="large" color="#087A4C" /></SafeAreaView>;
  if (!asset) return <SafeAreaView style={styles.safeArea}><View style={styles.empty}><Text style={styles.title}>Digital product unavailable</Text><Text style={styles.copy}>{error || 'This website or app could not be found.'}</Text><TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}><Text style={styles.primaryButtonText}>Go back</Text></TouchableOpacity></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back"><Feather name="arrow-left" size={19} color="#15263A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Digital product</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gallery}>
          <TouchableOpacity style={styles.art} onPress={openAssetImage} disabled={!selectedImage} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel={`Zoom image ${selectedImageIndex + 1} of ${assetImages.length}`}>
            {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.artImage} resizeMode="cover" /> : <Feather name={isApp ? 'smartphone' : 'globe'} size={42} color="#8BF0B9" />}
            {selectedImage ? <View style={styles.zoomHint}><Feather name="maximize" size={14} color="#FFFFFF" /><Text style={styles.zoomHintText}>Zoom image</Text></View> : null}
          </TouchableOpacity>
          {assetImages.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageThumbnails}>
            {assetImages.map((image, index) => <TouchableOpacity key={`${image}-${index}`} style={[styles.imageThumbnailButton, index === selectedImageIndex && styles.imageThumbnailSelected]} onPress={() => setSelectedImageIndex(index)} accessibilityRole="button" accessibilityLabel={`Show image ${index + 1}`} accessibilityState={{ selected: index === selectedImageIndex }}>
              <Image source={{ uri: image }} style={styles.imageThumbnail} resizeMode="cover" />
            </TouchableOpacity>)}
          </ScrollView> : null}
        </View>
        <Text style={styles.typeLabel}>{isAndroidApp ? 'ANDROID APPLICATION' : asset.productType === 'ios_app' ? 'IOS APPLICATION' : asset.productType === 'full_stack' ? 'FULL STACK' : asset.productType === 'admin' ? 'ADMIN DASHBOARD' : 'WEBSITE'}</Text>
        <Text style={styles.title}>{asset.name}</Text>
        <Text style={styles.copy}>{asset.description || 'A digital product from the Cardzip collection.'}</Text>
        {!asset.isSellerListing && asset.websiteUrl ? <TouchableOpacity style={styles.previewLink} onPress={() => void openWebsite(asset.websiteUrl!)}><Text style={styles.previewText}>Visit website</Text><Feather name="arrow-up-right" size={15} color="#087A4C" /></TouchableOpacity> : null}

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About and setup</Text>
          <Text style={styles.copy}>{asset.usageInstructions || 'Choose a use option or request the complete project template. Cardzip support can help coordinate your setup.'}</Text>
          {asset.isSellerListing ? <View style={styles.note}><Feather name="lock" size={16} color="#087A4C" /><Text style={styles.noteText}>Listing screenshots, app or website access, seller contact, and the source-code ZIP become available after successful payment.</Text></View> : <View style={styles.note}><Feather name="check-circle" size={16} color="#087A4C" /><Text style={styles.noteText}>Full project includes the backend plus two weeks of setup and upload support.</Text></View>}
          {isAndroidApp ? <Text style={styles.smallCopy}>For Android apps, the hosted APK is provided after a successful use-option payment.</Text> : null}
          {asset.productType === 'ios_app' ? <Text style={styles.smallCopy}>For iOS apps, Cardzip provides the hosted access link after purchase and can help coordinate installation or account access.</Text> : null}
        </View>
        <View style={styles.optionsCard}>
          <Text style={styles.sectionTitle}>Choose your option</Text>
          {asset.isSellerListing ? <>
            <View style={styles.sellerTerms}><Text style={styles.optionTitle}>Purchase from the creator</Text><Text style={styles.optionDescription}>Each paid option unlocks its own ZIP and buyer files. Full-template buyers also receive its legal documents.</Text><Text style={styles.sellerPayout}>Seller receives 70% · Cardzip retains 30% · seller withdrawals take 1–2 business days.</Text></View>
            {(Number(asset.usePrice) > 0 || (!Number(asset.usePrice) && !Number(asset.templatePrice) && Number(asset.price) > 0)) ? <TouchableOpacity style={styles.option} disabled={Boolean(busyOption) || checkingPurchaseHistory || paidOptions.use} onPress={() => void purchaseSellerListing('use')}>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>Use / rent</Text><Text style={styles.optionDescription}>Use access, rental ZIP and buyer files.</Text></View>
              <Text style={styles.optionPrice}>{checkingPurchaseHistory ? 'Checking payment…' : paidOptions.use ? 'Already paid' : busyOption === 'use' ? 'Opening…' : formatNaira(Number(asset.usePrice) || Number(asset.price))}</Text>
            </TouchableOpacity> : null}
            {Number(asset.templatePrice) > 0 ? <TouchableOpacity style={styles.option} disabled={Boolean(busyOption) || checkingPurchaseHistory || paidOptions.template} onPress={() => void purchaseSellerListing('template')}>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>Full project template</Text><Text style={styles.optionDescription}>Full source ZIP and legal documents.</Text></View>
              <Text style={styles.optionPrice}>{checkingPurchaseHistory ? 'Checking payment…' : paidOptions.template ? 'Already paid' : busyOption === 'template' ? 'Opening…' : formatNaira(Number(asset.templatePrice))}</Text>
            </TouchableOpacity> : null}
            {isOwner ? <View style={styles.promotionBox}>
              <Text style={styles.optionTitle}>Promote in Community Marketplace</Text>
              <Text style={styles.optionDescription}>Reach people browsing similar websites and apps. Promotion starts after administrator approval.</Text>
              {promotionPrices.map((duration) => <TouchableOpacity key={duration.key} style={styles.promotionOption} disabled={!duration.price || promotionLoading} onPress={() => void promoteDigitalAsset(duration)}>
                <Text style={styles.optionTitle}>{duration.label}</Text>
                <Text style={styles.optionPrice}>{duration.price ? formatNaira(duration.price) : 'Not available'}</Text>
              </TouchableOpacity>)}
              {promotionPrices.length === 0 && promotionError ? <Text style={styles.error}>{promotionError}</Text> : null}
              {promotionError ? <Text style={styles.error}>{promotionError}</Text> : null}
              {promotionNotice ? <Text style={styles.success}>{promotionNotice}</Text> : null}
              {promotionLoading ? <ActivityIndicator color="#087A4C" /> : null}
            </View> : null}
          </> : null}
          {!asset.isSellerListing && Number(asset.usePrice) > 0 ? (
            <TouchableOpacity style={styles.option} disabled={Boolean(busyOption) || checkingPurchaseHistory || paidOptions.use} onPress={() => void purchase('use')}>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>Use / rent</Text><Text style={styles.optionDescription}>Use the ready-made {isApp ? 'app' : 'website'} with setup guidance.</Text></View>
              <Text style={styles.optionPrice}>{checkingPurchaseHistory ? 'Checking payment…' : paidOptions.use ? 'Already paid' : busyOption === 'use' ? 'Opening…' : formatNaira(Number(asset.usePrice))}</Text>
            </TouchableOpacity>
          ) : null}
          {!asset.isSellerListing && Number(asset.templatePrice) > 0 ? (
            <TouchableOpacity style={styles.option} disabled={Boolean(busyOption) || checkingPurchaseHistory || paidOptions.template} onPress={() => void purchase('template')}>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>Full project template</Text><Text style={styles.optionDescription}>Source project, backend and two weeks of setup/upload.</Text></View>
              <Text style={styles.optionPrice}>{checkingPurchaseHistory ? 'Checking payment…' : paidOptions.template ? 'Already paid' : busyOption === 'template' ? 'Opening…' : formatNaira(Number(asset.templatePrice))}</Text>
            </TouchableOpacity>
          ) : null}
          {purchaseError ? <Text style={styles.error} accessibilityRole="alert">{purchaseError}</Text> : null}
          {receipt?.purchaseType === 'use' && receipt.accessUrl ? <TouchableOpacity style={styles.accessButton} onPress={() => void openAccess(receipt.accessUrl!)}><Feather name={isApp ? 'download' : 'external-link'} size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>{isAndroidApp ? 'Download hosted APK' : asset.productType === 'ios_app' ? 'Open iOS app access' : 'Open your website'}</Text></TouchableOpacity> : null}
          {receipt?.purchaseType === 'template' ? <Text style={styles.success}>Template purchase confirmed. Your source archive and files are ready below.</Text> : null}
          {(receipt?.sourceCodeAvailable || receipt?.templateSourceCodeAvailable || sellerReceipt?.sourceCodeAvailable) ? <TouchableOpacity style={styles.accessButton} disabled={Boolean(downloadingFile)} onPress={() => void downloadPurchasedFile('source-code', 0, `${asset.name}-${sellerReceipt?.purchaseType === 'template' || receipt?.purchaseType === 'template' ? 'full-template' : 'rental'}-source-code.zip`, 'application/zip')}><Feather name="download" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>{downloadingFile.includes('source-code') ? 'Downloading source ZIP…' : `Download ${sellerReceipt?.purchaseType === 'template' || receipt?.purchaseType === 'template' ? 'full-template' : 'rental'} source ZIP`}</Text></TouchableOpacity> : null}
          {(sellerReceipt?.documents || receipt?.documents || []).map((document, index) => <TouchableOpacity key={`${document.name}-${index}`} style={styles.accessButton} disabled={Boolean(downloadingFile)} onPress={() => void downloadPurchasedFile('document', index, document.name, document.mimeType)}><Feather name="file-text" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>{downloadingFile === `document-${index}` ? 'Downloading…' : `Download ${getShortDocumentName(document.name)}`}</Text></TouchableOpacity>)}
          {(sellerReceipt?.templateDocuments || receipt?.templateDocuments || []).map((document, index) => <TouchableOpacity key={`legal-${document.name}-${index}`} style={styles.accessButton} disabled={Boolean(downloadingFile)} onPress={() => void downloadPurchasedFile('template-document', index, document.name, document.mimeType)}><Feather name="file-text" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>{downloadingFile === `template-document-${index}` ? 'Downloading…' : `Legal · ${getShortDocumentName(document.name)}`}</Text></TouchableOpacity>)}
          {sellerReceipt ? <>
            <Text style={styles.success}>Payment confirmed. The seller received {formatNaira(sellerReceipt.sellerShare)} (70%).</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sellerGallery}>{sellerReceipt.screenshots.map((image, index) => <TouchableOpacity key={`${image}-${index}`} onPress={() => openReceiptImage(index)} accessibilityRole="button" accessibilityLabel={`Zoom purchased screenshot ${index + 1}`}><Image source={{ uri: image }} style={styles.sellerScreenshot} /></TouchableOpacity>)}</ScrollView>
            {sellerReceipt.accessUrl && ['website', 'full_stack', 'admin'].includes(sellerReceipt.productType) ? <TouchableOpacity style={styles.accessButton} onPress={() => void openWebsite(sellerReceipt.accessUrl!)}><Feather name="globe" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>Open website</Text></TouchableOpacity> : null}
            {sellerReceipt.apkUrl ? <TouchableOpacity style={styles.accessButton} onPress={() => void openAccess(sellerReceipt.apkUrl!)}><Feather name="download" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>Download APK</Text></TouchableOpacity> : null}
            {sellerReceipt.iosAppUrl ? <TouchableOpacity style={styles.accessButton} onPress={() => void openAccess(sellerReceipt.iosAppUrl!)}><Feather name="smartphone" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>Open iOS app</Text></TouchableOpacity> : null}
          </> : null}
          <View style={styles.contactBox}>
            <Text style={styles.optionTitle}>Want to buy it outright?</Text>
            <Text style={styles.optionDescription}>Contact our team to discuss outright purchase and ownership.</Text>
            <TouchableOpacity style={styles.contactButton} onPress={() => router.push('/(main)/property/support' as Href)}><Feather name="life-buoy" size={15} color="#FFFFFF" /><Text style={styles.contactText}>Contact Cardzip support</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal visible={Boolean(imageViewer)} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setImageViewer(null)}>
        <View style={styles.imageViewer}>
          {imageViewer ? <Image source={{ uri: imageViewer.images[imageViewer.index] }} style={styles.imageViewerImage} resizeMode="contain" /> : null}
          <TouchableOpacity style={[styles.viewerControl, styles.viewerClose]} onPress={() => setImageViewer(null)} accessibilityRole="button" accessibilityLabel="Close image viewer"><Feather name="x" size={23} color="#FFFFFF" /></TouchableOpacity>
          {imageViewer && imageViewer.images.length > 1 ? <>
            <TouchableOpacity style={[styles.viewerControl, styles.viewerPrevious]} onPress={() => stepImageViewer(-1)} accessibilityRole="button" accessibilityLabel="Previous image"><Feather name="chevron-left" size={28} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity style={[styles.viewerControl, styles.viewerNext]} onPress={() => stepImageViewer(1)} accessibilityRole="button" accessibilityLabel="Next image"><Feather name="chevron-right" size={28} color="#FFFFFF" /></TouchableOpacity>
            <Text style={styles.viewerCount}>{imageViewer.index + 1} / {imageViewer.images.length}</Text>
          </> : null}
        </View>
      </Modal>
      <Modal visible={Boolean(websitePreviewUrl)} animationType="slide" onRequestClose={() => setWebsitePreviewUrl('')}>
        <SafeAreaView style={styles.websitePreview}>
          <WebView
            source={{ uri: websitePreviewUrl }}
            originWhitelist={['http://*', 'https://*']}
            style={styles.websiteWebView}
            startInLoadingState
            renderLoading={() => <View style={styles.websiteLoading}><ActivityIndicator size="large" color="#087A4C" /></View>}
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
            allowsBackForwardNavigationGestures
          />
          <View style={styles.websitePreviewOverlay} pointerEvents="box-none">
            <View style={styles.websitePreviewHeader}>
              <TouchableOpacity style={styles.websitePreviewClose} onPress={() => setWebsitePreviewUrl('')} accessibilityRole="button" accessibilityLabel="Close website preview">
                <Feather name="x" size={18} color="#14253A" />
                <Text style={styles.websitePreviewCloseText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.websitePreviewTitle}>Website preview</Text>
              <View style={styles.websitePreviewSpacer} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      <MarketBottomTab activeTab="Store" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F8F7' },
  header: { minHeight: 54, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#14253A', fontSize: 16, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 28 },
  gallery: { gap: 9 },
  art: { height: 220, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 16, backgroundColor: '#153547' },
  artImage: { width: '100%', height: '100%' },
  zoomHint: { position: 'absolute', right: 10, bottom: 10, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, backgroundColor: 'rgba(16, 27, 47, 0.82)' },
  zoomHintText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  imageThumbnails: { gap: 8, paddingVertical: 2 },
  imageThumbnailButton: { width: 58, height: 48, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', borderRadius: 7, backgroundColor: '#FFFFFF' },
  imageThumbnailSelected: { borderColor: '#087A4C' },
  imageThumbnail: { width: '100%', height: '100%' },
  imageViewer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#07111F' },
  imageViewerImage: { width: '100%', height: '100%' },
  viewerControl: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 22, backgroundColor: 'rgba(20,35,51,0.82)' },
  viewerClose: { top: 46, right: 16 },
  viewerPrevious: { left: 14 },
  viewerNext: { right: 14 },
  viewerCount: { position: 'absolute', bottom: 28, color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  websitePreview: { flex: 1, backgroundColor: '#FFFFFF' },
  websitePreviewOverlay: { position: 'absolute', top: 18, left: 0, right: 0, zIndex: 10, elevation: 10 },
  websitePreviewHeader: { minHeight: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0', backgroundColor: 'rgba(245,248,247,0.97)', zIndex: 10, elevation: 10 },
  websitePreviewClose: { minWidth: 76, height: 40, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderColor: '#C9D8D0', borderRadius: 20, backgroundColor: '#FFFFFF', elevation: 4 },
  websitePreviewCloseText: { color: '#14253A', fontSize: 12, fontWeight: '800' },
  websitePreviewSpacer: { width: 76 },
  websitePreviewTitle: { color: '#14253A', fontSize: 14, fontWeight: '800' },
  websiteWebView: { flex: 1, backgroundColor: '#FFFFFF' },
  websiteLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  typeLabel: { marginTop: 18, color: '#087A4C', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  title: { marginTop: 7, color: '#14253A', fontSize: 26, fontWeight: '900', letterSpacing: -0.6 },
  copy: { marginTop: 8, color: '#62727B', fontSize: 12, lineHeight: 19 },
  previewLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 12 },
  previewText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  infoCard: { marginTop: 20, padding: 17, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E9E6' },
  sectionTitle: { marginBottom: 10, color: '#183044', fontSize: 15, fontWeight: '900' },
  note: { flexDirection: 'row', gap: 8, marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: '#F0FAF4' },
  noteText: { flex: 1, color: '#246449', fontSize: 10, lineHeight: 16 },
  sellerTerms: { gap: 5, marginTop: 3, padding: 12, borderRadius: 10, backgroundColor: '#F0FAF4' },
  promotionBox: { gap: 8, marginTop: 12, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#CFE7D7', backgroundColor: '#F3FAF5' },
  promotionOption: { minHeight: 42, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 9, borderWidth: 1, borderColor: '#B8DBC5', backgroundColor: '#FFFFFF' },
  sellerPayout: { color: '#246449', fontSize: 9, lineHeight: 14 },
  sellerGallery: { gap: 8, paddingVertical: 12 },
  sellerScreenshot: { width: 150, height: 110, borderRadius: 9, backgroundColor: '#E7EFEB' },
  smallCopy: { marginTop: 11, color: '#68777F', fontSize: 10, lineHeight: 16 },
  optionsCard: { marginTop: 14, padding: 17, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E9E6' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 8, padding: 13, borderRadius: 11, borderWidth: 1, borderColor: '#DCE7E3' },
  optionCopy: { flex: 1 },
  optionTitle: { color: '#183044', fontSize: 11, fontWeight: '900' },
  optionDescription: { marginTop: 5, color: '#68777F', fontSize: 9, lineHeight: 14 },
  optionPrice: { color: '#087A4C', fontSize: 10, fontWeight: '900' },
  error: { marginTop: 10, color: '#A12E3B', fontSize: 11 },
  success: { marginTop: 12, color: '#087A4C', fontSize: 10, lineHeight: 16 },
  accessButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 42, marginTop: 12, borderRadius: 10, backgroundColor: '#087A4C' },
  accessButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  contactBox: { gap: 5, marginTop: 16, paddingTop: 15, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E2E8F0' },
  contactButton: { minHeight: 40, marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 9, backgroundColor: '#142D40' },
  contactText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  loader: { marginTop: 60 },
  empty: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { marginTop: 15, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9, backgroundColor: '#087A4C' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
});
