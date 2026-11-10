import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
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

export default function DigitalAssetDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const assetSlug = String(slug || '');
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [asset, setAsset] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedSlug, setLoadedSlug] = useState('');
  const [busyOption, setBusyOption] = useState<'use' | 'template' | ''>('');
  const [error, setError] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [receipt, setReceipt] = useState<({ productId: string; purchaseType: 'use' | 'template'; accessUrl?: string; sourceCodeAvailable?: boolean; templateSourceCodeAvailable?: boolean; documents: { name: string; mimeType: string }[]; templateDocuments?: { name: string; mimeType: string }[]; reference: string }) | null>(null);
  const [sellerReceipt, setSellerReceipt] = useState<(SellerDigitalAssetPaystackVerification['sellerDigitalAsset'] & { reference: string }) | null>(null);
  const [downloadingFile, setDownloadingFile] = useState('');
  const [ownerAssetId, setOwnerAssetId] = useState('');
  const [promotionPrices, setPromotionPrices] = useState<CommunityPromotionDuration[]>([]);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionError, setPromotionError] = useState('');
  const [promotionNotice, setPromotionNotice] = useState('');
  const isApp = asset?.productType === 'app' || asset?.productType === 'ios_app';
  const isAndroidApp = asset?.productType === 'app';
  const productId = String(asset?._id || asset?.id || '');

  useEffect(() => {
    let active = true;
    if (!token || !productId) {
      setReceipt(null);
      setSellerReceipt(null);
      return () => { active = false; };
    }
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
        const latestPurchase = verified.find(Boolean);
        if (!latestPurchase) return;
        if (latestPurchase.purpose === 'seller_digital_asset') {
          setSellerReceipt({ ...latestPurchase.purchased, reference: latestPurchase.reference });
          setReceipt(null);
        } else {
          setReceipt({ ...latestPurchase.purchased, reference: latestPurchase.reference });
          setSellerReceipt(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active) setPurchaseError(requestError instanceof Error ? requestError.message : 'Could not load your purchase history.');
      });
    return () => { active = false; };
  }, [productId, token]);

  useEffect(() => {
    let active = true;
    fetchStoreProductBySlugApi(assetSlug)
      .then((result) => {
        if (!active) return;
        setAsset(result);
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

  const purchase = async (option: 'use' | 'template') => {
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
      await openPaystackCheckout(payment.authorizationUrl, returnUrl);
      const result = await verifyPaystackUntilSettled({
        verify: () => verifyDigitalProductPaymentApi(token, payment.reference),
        getStatus: (verification) => verification.status === 'completed' && verification.digitalProduct ? 'completed' : 'pending',
        failureMessage: 'Paystack did not complete this digital-product payment.',
        pendingMessage: 'Payment is still being confirmed. Verify again shortly.',
      });
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
    if (!token) {
      Alert.alert('Sign in required', 'Sign in to purchase this digital listing.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login' as Href) },
      ]);
      return;
    }
    if (!productId) return;
    setBusyOption('use');
    setPurchaseError('');
    try {
      const returnUrl = callbackUrl || ExpoLinking.createURL('payment/callback', { scheme: 'cardzip' });
      const payment = await initializeSellerDigitalAssetPaymentApi(token, productId, option, returnUrl);
      await openPaystackCheckout(payment.authorizationUrl, returnUrl);
      const result = await verifyPaystackUntilSettled({
        verify: () => verifySellerDigitalAssetPaymentApi(token, payment.reference),
        getStatus: (verification) => verification.status === 'completed' && verification.sellerDigitalAsset ? 'completed' : 'pending',
        failureMessage: 'Paystack did not complete this digital-listing payment.',
        pendingMessage: 'Payment is still being confirmed. Verify again shortly.',
      });
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
      await openPaystackCheckout(payment.authorizationUrl, returnUrl);
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

  const openWebsite = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      setPurchaseError('Could not open the website preview. Please try again.');
    }
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
        <View style={styles.art}>
          {asset.image ? <Image source={{ uri: asset.image }} style={styles.artImage} resizeMode="cover" /> : <Feather name={isApp ? 'smartphone' : 'globe'} size={42} color="#8BF0B9" />}
        </View>
        <Text style={styles.typeLabel}>{isAndroidApp ? 'ANDROID APPLICATION' : asset.productType === 'ios_app' ? 'IOS APPLICATION' : asset.productType === 'full_stack' ? 'FULL STACK' : asset.productType === 'admin' ? 'ADMIN DASHBOARD' : 'WEBSITE'}</Text>
        <Text style={styles.title}>{asset.name}</Text>
        <Text style={styles.copy}>{asset.description || 'A digital product from the Cardzip collection.'}</Text>
        {!asset.isSellerListing && asset.websiteUrl ? <TouchableOpacity style={styles.previewLink} onPress={() => void Linking.openURL(asset.websiteUrl!)}><Text style={styles.previewText}>Visit website</Text><Feather name="arrow-up-right" size={15} color="#087A4C" /></TouchableOpacity> : null}

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
            {(Number(asset.usePrice) > 0 || (!Number(asset.usePrice) && !Number(asset.templatePrice) && Number(asset.price) > 0)) ? <TouchableOpacity style={styles.option} disabled={Boolean(busyOption)} onPress={() => void purchaseSellerListing('use')}>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>Use / rent</Text><Text style={styles.optionDescription}>Use access, rental ZIP and buyer files.</Text></View>
              <Text style={styles.optionPrice}>{busyOption === 'use' ? 'Opening…' : formatNaira(Number(asset.usePrice) || Number(asset.price))}</Text>
            </TouchableOpacity> : null}
            {Number(asset.templatePrice) > 0 ? <TouchableOpacity style={styles.option} disabled={Boolean(busyOption)} onPress={() => void purchaseSellerListing('template')}>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>Full project template</Text><Text style={styles.optionDescription}>Full source ZIP and legal documents.</Text></View>
              <Text style={styles.optionPrice}>{busyOption === 'template' ? 'Opening…' : formatNaira(Number(asset.templatePrice))}</Text>
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
            <TouchableOpacity style={styles.option} disabled={Boolean(busyOption)} onPress={() => void purchase('use')}>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>Use / rent</Text><Text style={styles.optionDescription}>Use the ready-made {isApp ? 'app' : 'website'} with setup guidance.</Text></View>
              <Text style={styles.optionPrice}>{busyOption === 'use' ? 'Opening…' : formatNaira(Number(asset.usePrice))}</Text>
            </TouchableOpacity>
          ) : null}
          {!asset.isSellerListing && Number(asset.templatePrice) > 0 ? (
            <TouchableOpacity style={styles.option} disabled={Boolean(busyOption)} onPress={() => void purchase('template')}>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>Full project template</Text><Text style={styles.optionDescription}>Source project, backend and two weeks of setup/upload.</Text></View>
              <Text style={styles.optionPrice}>{busyOption === 'template' ? 'Opening…' : formatNaira(Number(asset.templatePrice))}</Text>
            </TouchableOpacity>
          ) : null}
          {purchaseError ? <Text style={styles.error} accessibilityRole="alert">{purchaseError}</Text> : null}
          {receipt?.purchaseType === 'use' && receipt.accessUrl ? <TouchableOpacity style={styles.accessButton} onPress={() => void openAccess(receipt.accessUrl!)}><Feather name={isApp ? 'download' : 'external-link'} size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>{isAndroidApp ? 'Download hosted APK' : asset.productType === 'ios_app' ? 'Open iOS app access' : 'Open your website'}</Text></TouchableOpacity> : null}
          {receipt?.purchaseType === 'template' ? <Text style={styles.success}>Template purchase confirmed. Your source archive and files are ready below.</Text> : null}
          {(receipt?.sourceCodeAvailable || receipt?.templateSourceCodeAvailable || sellerReceipt?.sourceCodeAvailable) ? <TouchableOpacity style={styles.accessButton} disabled={Boolean(downloadingFile)} onPress={() => void downloadPurchasedFile('source-code', 0, `${asset.name}-${sellerReceipt?.purchaseType === 'template' || receipt?.purchaseType === 'template' ? 'full-template' : 'rental'}-source-code.zip`, 'application/zip')}><Feather name="download" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>{downloadingFile.includes('source-code') ? 'Downloading source ZIP…' : `Download ${sellerReceipt?.purchaseType === 'template' || receipt?.purchaseType === 'template' ? 'full-template' : 'rental'} source ZIP`}</Text></TouchableOpacity> : null}
          {(sellerReceipt?.documents || receipt?.documents || []).map((document, index) => <TouchableOpacity key={`${document.name}-${index}`} style={styles.accessButton} disabled={Boolean(downloadingFile)} onPress={() => void downloadPurchasedFile('document', index, document.name, document.mimeType)}><Feather name="file-text" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>{downloadingFile === `document-${index}` ? 'Downloading…' : `Download ${document.name}`}</Text></TouchableOpacity>)}
          {(sellerReceipt?.templateDocuments || receipt?.templateDocuments || []).map((document, index) => <TouchableOpacity key={`legal-${document.name}-${index}`} style={styles.accessButton} disabled={Boolean(downloadingFile)} onPress={() => void downloadPurchasedFile('template-document', index, document.name, document.mimeType)}><Feather name="file-text" size={16} color="#FFFFFF" /><Text style={styles.accessButtonText}>{downloadingFile === `template-document-${index}` ? 'Downloading…' : `Download legal document: ${document.name}`}</Text></TouchableOpacity>)}
          {sellerReceipt ? <>
            <Text style={styles.success}>Payment confirmed. The seller received {formatNaira(sellerReceipt.sellerShare)} (70%).</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sellerGallery}>{sellerReceipt.screenshots.map((image, index) => <Image key={`${image}-${index}`} source={{ uri: image }} style={styles.sellerScreenshot} />)}</ScrollView>
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
  art: { height: 190, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 18, backgroundColor: '#153547' },
  artImage: { width: '100%', height: '100%' },
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
