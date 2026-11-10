import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Href, useRouter } from 'expo-router';
import { useAppSelector } from '../../../../store';
import { formatNaira } from '../../../../utils/currency';
import {
  createSellerDigitalAssetApi,
  fetchMyDigitalAssetsApi,
  SellerDigitalAssetSubmission,
  uploadSellerDigitalAssetDocumentApi,
  uploadSellerDigitalAssetImageApi,
  uploadSellerDigitalAssetSourceCodeApi,
} from '../../../../services/api/storeApi';
import MarketBottomTab from '../bottomtab/bottomtab';

const MAX_SCREENSHOTS = 20;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_BUYER_DOCUMENTS = 10;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
type ListingType = 'website' | 'app' | 'ios_app' | 'full_stack' | 'admin';
const listingTypes: { key: ListingType; label: string }[] = [
  { key: 'website', label: 'Website' },
  { key: 'app', label: 'Android' },
  { key: 'ios_app', label: 'iOS' },
  { key: 'full_stack', label: 'Full stack' },
  { key: 'admin', label: 'Admin' },
];

const statusLabel: Record<SellerDigitalAssetSubmission['sellerListingStatus'], string> = {
  pending_review: 'In review',
  approved: 'Approved',
  rejected: 'Changes requested',
};

export default function SellDigitalAssetScreen() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [type, setType] = useState<ListingType>('website');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [contact, setContact] = useState('');
  const [usePrice, setUsePrice] = useState('');
  const [templatePrice, setTemplatePrice] = useState('');
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [sourceCode, setSourceCode] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [templateSourceCode, setTemplateSourceCode] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [documents, setDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [templateDocuments, setTemplateDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [submissions, setSubmissions] = useState<SellerDigitalAssetSubmission[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    fetchMyDigitalAssetsApi(token)
      .then((items) => {
        if (active) setSubmissions(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load your submissions.');
      });
    return () => { active = false; };
  }, [token]);

  const selectPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo-library access to add your listing screenshots.');
      return;
    }
    const remaining = MAX_SCREENSHOTS - photos.length;
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_SCREENSHOTS} screenshots.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
    });
    if (result.canceled) return;
    const invalid = result.assets.find((photo) => (
      !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(photo.mimeType || 'image/jpeg')
      || (typeof photo.fileSize === 'number' && photo.fileSize > MAX_IMAGE_SIZE)
    ));
    if (invalid) {
      setError('Each screenshot must be a JPEG, PNG, WebP, or AVIF image up to 8 MB.');
      return;
    }
    setPhotos((current) => [...current, ...result.assets].slice(0, MAX_SCREENSHOTS));
    setError('');
  };

  const selectSourceCode = async (option: 'use' | 'template') => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/zip', 'application/x-zip-compressed'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const selected = result.assets[0];
    if (!selected.name.toLowerCase().endsWith('.zip') || (selected.size !== undefined && selected.size > 100 * 1024 * 1024)) {
      setError('Choose a ZIP source-code archive up to 100 MB.');
      return;
    }
    if (option === 'use') setSourceCode(selected);
    else setTemplateSourceCode(selected);
    setError('');
  };

  const selectDocuments = async (option: 'use' | 'template') => {
    const current = option === 'use' ? documents : templateDocuments;
    const remaining = MAX_BUYER_DOCUMENTS - current.length;
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_BUYER_DOCUMENTS} files to this option.`);
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    if (current.length + result.assets.length > MAX_BUYER_DOCUMENTS
      || result.assets.some((file) => typeof file.size === 'number' && file.size > MAX_DOCUMENT_SIZE)) {
      setError('Add no more than 10 buyer/legal documents, up to 20 MB each.');
      return;
    }
    if (option === 'use') setDocuments((items) => [...items, ...result.assets]);
    else setTemplateDocuments((items) => [...items, ...result.assets]);
    setError('');
  };

  const submit = async () => {
    if (!token) {
      Alert.alert('Sign in required', 'Sign in to submit your app or website for review.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login' as Href) },
      ]);
      return;
    }
    if (!name.trim() || !description.trim() || !url.trim() || !contact.trim()) {
      setError('Complete the listing details, URL, and contact.');
      return;
    }
    const prices = [usePrice, templatePrice].map((value) => Number(value || 0));
    if (prices.some((value) => !Number.isSafeInteger(value) || value < 0 || value > 5000000)
      || prices.some((value) => value > 0 && value < 100)
      || prices.every((value) => value === 0)) {
      setError('Set at least one whole-naira rental or full-template price between ₦100 and ₦5,000,000.');
      return;
    }
    if (photos.length < 10) {
      setError('Add at least 10 screenshots before submitting your listing.');
      return;
    }
    if (prices[0] > 0 && !sourceCode) {
      setError('Choose a rental/use source-code ZIP for the use option.');
      return;
    }
    if (prices[1] > 0 && !templateSourceCode) {
      setError('Choose a full-template source-code ZIP for the template option.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const screenshots: string[] = [];
      for (let index = 0; index < photos.length; index += 1) {
        setProgress(`Uploading screenshot ${index + 1} of ${photos.length}…`);
        screenshots.push(await uploadSellerDigitalAssetImageApi(token, {
          uri: photos[index].uri,
          fileName: photos[index].fileName,
          mimeType: photos[index].mimeType,
        }));
      }
      const uploadArchive = async (
        file: DocumentPicker.DocumentPickerAsset | null,
        label: string,
      ): Promise<{ sourceCodeUrl: string; sourceCodeCloudinaryUrl?: string } | null> => {
        if (!file) return null;
        setProgress(`Uploading ${label} source-code ZIP…`);
        return uploadSellerDigitalAssetSourceCodeApi(token, {
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
        });
      };
      const rentalArchive = await uploadArchive(sourceCode, 'rental');
      const fullTemplateArchive = await uploadArchive(templateSourceCode, 'full-template');
      const uploadDocuments = async (files: DocumentPicker.DocumentPickerAsset[], label: string) => {
        const uploaded = [];
        for (const [index, file] of files.entries()) {
          setProgress(`Uploading ${label} document ${index + 1} of ${files.length}…`);
          uploaded.push(await uploadSellerDigitalAssetDocumentApi(token, {
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
          }));
        }
        return uploaded;
      };
      const uploadedDocuments = await uploadDocuments(documents, 'buyer');
      const uploadedTemplateDocuments = await uploadDocuments(templateDocuments, 'full-template legal');
      setProgress('Submitting your listing…');
      const submission = await createSellerDigitalAssetApi(token, {
        name: name.trim(),
        productType: type,
        category: category.trim(),
        description: description.trim(),
        price: prices[0] || prices[1],
        usePrice: prices[0],
        templatePrice: prices[1],
        sellerContact: contact.trim(),
        ...(rentalArchive ?? {}),
        ...(fullTemplateArchive?.sourceCodeUrl ? {
          templateSourceCodeUrl: fullTemplateArchive.sourceCodeUrl,
          templateSourceCodeCloudinaryUrl: fullTemplateArchive.sourceCodeCloudinaryUrl,
        } : {}),
        documents: uploadedDocuments,
        templateDocuments: uploadedTemplateDocuments,
        ...(type === 'website' || type === 'full_stack' || type === 'admin'
          ? { websiteUrl: url.trim() }
          : type === 'app'
            ? { apkUrl: url.trim() }
            : { iosAppUrl: url.trim() }),
        screenshots,
      });
      setName('');
      setCategory('');
      setDescription('');
      setUrl('');
      setContact('');
      setUsePrice('');
      setTemplatePrice('');
      setPhotos([]);
      setSourceCode(null);
      setTemplateSourceCode(null);
      setDocuments([]);
      setTemplateDocuments([]);
      setSubmissions((current) => [submission, ...current]);
      Alert.alert('Submitted for review', 'Admin approval takes 1–3 business days. Your listing will appear in the marketplace after its details and source-code ZIP are reviewed and approved.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not submit your digital listing.');
    } finally {
      setSaving(false);
      setProgress('');
    }
  };

  const urlLabel = type === 'website' || type === 'full_stack' || type === 'admin' ? 'Website URL' : type === 'app' ? 'Android APK URL' : 'iOS app URL';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back"><Feather name="arrow-left" size={19} color="#15263A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Sell an app or website</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}><Text style={styles.eyebrow}>SELL WITH CARDZIP</Text><Text style={styles.heroTitle}>Reach digital buyers</Text><Text style={styles.heroCopy}>Submit a website, app, full-stack project, or admin dashboard with separate rental and full-template options. Admin approval takes 1–3 business days.</Text></View>
        <View style={styles.payoutNote}><Feather name="clock" size={18} color="#087A4C" /><Text style={styles.payoutCopy}><Text style={styles.payoutStrong}>You receive 70% of each successful sale; Cardzip retains 30%.</Text> Your share is credited to your Cardzip wallet for normal withdrawal. Digital-listing withdrawals take 1–2 business days.</Text></View>
        <View style={styles.card}>
          <View style={styles.typePicker}>{listingTypes.map((item) => <TouchableOpacity key={item.key} style={[styles.typeButton, type === item.key && styles.typeButtonActive]} onPress={() => {
            if (type !== item.key) {
              setType(item.key);
              setUrl('');
            }
          }}><Text style={[styles.typeButtonText, type === item.key && styles.typeButtonTextActive]}>{item.label}</Text></TouchableOpacity>)}</View>
          <Text style={styles.fieldLabel}>Listing name</Text><TextInput style={styles.input} value={name} onChangeText={setName} maxLength={160} placeholder="Website or app name" />
          <Text style={styles.fieldLabel}>Category</Text><TextInput style={styles.input} value={category} onChangeText={setCategory} maxLength={80} placeholder="e.g. Education, productivity" />
          <Text style={styles.fieldLabel}>Description</Text><TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} maxLength={5000} multiline textAlignVertical="top" placeholder="Describe the app or website and what buyers get." />
          <Text style={styles.fieldLabel}>{urlLabel}</Text><TextInput style={styles.input} value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="https://…" />
          <Text style={styles.fieldLabel}>Contact details for Cardzip review</Text><TextInput style={styles.input} value={contact} onChangeText={setContact} maxLength={120} placeholder="Email or phone (not shown to buyers)" /><Text style={styles.helper}>This contact information is kept private and is not displayed to buyers.</Text>
          <Text style={styles.fieldLabel}>Rental / use price (NGN)</Text><TextInput style={styles.input} value={usePrice} onChangeText={setUsePrice} keyboardType="number-pad" placeholder="Optional · minimum ₦100" />
          <Text style={styles.estimate}>{Number(usePrice) >= 100 ? `Your share: ${formatNaira(Math.floor(Number(usePrice) * 0.7))} per purchase.` : 'Optional; your seller share is 70%.'}</Text>
          <Text style={styles.fieldLabel}>Full-template price (NGN)</Text><TextInput style={styles.input} value={templatePrice} onChangeText={setTemplatePrice} keyboardType="number-pad" placeholder="Optional · minimum ₦100" />
          <Text style={styles.estimate}>{Number(templatePrice) >= 100 ? `Your share: ${formatNaira(Math.floor(Number(templatePrice) * 0.7))} per purchase.` : 'Optional; includes the full project and legal documents.'}</Text>
          {Number(usePrice) > 0 ? <><TouchableOpacity style={styles.uploadButton} disabled={saving} onPress={() => void selectSourceCode('use')}><Feather name="archive" size={16} color="#087A4C" /><Text style={styles.uploadText}>{sourceCode ? sourceCode.name : 'Choose rental / use ZIP (required)'}</Text></TouchableOpacity><Text style={styles.helper}>Rental/use buyers can download this ZIP after successful payment. Up to 100 MB.</Text></> : null}
          {Number(templatePrice) > 0 ? <><TouchableOpacity style={styles.uploadButton} disabled={saving} onPress={() => void selectSourceCode('template')}><Feather name="archive" size={16} color="#087A4C" /><Text style={styles.uploadText}>{templateSourceCode ? templateSourceCode.name : 'Choose full-template ZIP (required)'}</Text></TouchableOpacity><Text style={styles.helper}>Full-template buyers can download this ZIP after successful payment. Up to 100 MB.</Text></> : null}
          <TouchableOpacity style={styles.uploadButton} disabled={saving} onPress={() => void selectDocuments('use')}><Feather name="file-text" size={16} color="#087A4C" /><Text style={styles.uploadText}>Add buyer files ({documents.length}/{MAX_BUYER_DOCUMENTS})</Text></TouchableOpacity>
          {documents.map((file, index) => <Text style={styles.helper} key={`buyer-${file.name}-${index}`}>{file.name}</Text>)}
          <TouchableOpacity style={styles.uploadButton} disabled={saving} onPress={() => void selectDocuments('template')}><Feather name="file-text" size={16} color="#087A4C" /><Text style={styles.uploadText}>Add full-template legal documents ({templateDocuments.length}/{MAX_BUYER_DOCUMENTS})</Text></TouchableOpacity>
          {templateDocuments.map((file, index) => <Text style={styles.helper} key={`legal-${file.name}-${index}`}>{file.name}</Text>)}
          <TouchableOpacity style={styles.uploadButton} disabled={saving} onPress={() => void selectPhotos()}><Feather name="image" size={17} color="#087A4C" /><Text style={styles.uploadText}>Choose screenshots ({photos.length}/20)</Text></TouchableOpacity>
          <Text style={styles.helper}>Add 10–20 screenshots. Buyers can see the gallery only after they pay. Each image must be 8 MB or smaller.</Text>
          <View style={styles.photoGrid}>{photos.map((photo, index) => <Image key={`${photo.uri}-${index}`} source={{ uri: photo.uri }} style={styles.photo} />)}</View>
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          {progress ? <Text style={styles.progress}>{progress}</Text> : null}
          <TouchableOpacity style={[styles.submitButton, saving && styles.disabledButton]} disabled={saving} onPress={() => void submit()}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={styles.submitText}>Submit for review</Text><Feather name="arrow-right" size={16} color="#FFFFFF" /></>}</TouchableOpacity>
        </View>
        <View style={styles.submissions}><Text style={styles.sectionTitle}>Your submissions</Text>{submissions.length === 0 ? <Text style={styles.helper}>Your review status will appear here.</Text> : submissions.map((item) => <View key={item._id} style={styles.submissionRow}><View style={styles.submissionCopy}><Text style={styles.submissionName}>{item.name}</Text><Text style={styles.helper}>{item.productType} · Use {formatNaira(item.usePrice || item.price)}{Number(item.templatePrice) > 0 ? ` · Full template ${formatNaira(Number(item.templatePrice))}` : ''}</Text>{item.sellerReviewNote ? <Text style={styles.helper}>{item.sellerReviewNote}</Text> : null}</View><Text style={[styles.status, item.sellerListingStatus === 'approved' && styles.approved, item.sellerListingStatus === 'rejected' && styles.rejected]}>{statusLabel[item.sellerListingStatus]}</Text></View>)}</View>
      </ScrollView>
      <MarketBottomTab activeTab="Store" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F8F7' },
  header: { minHeight: 54, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#14253A', fontSize: 15, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 32 },
  hero: { padding: 20, borderRadius: 17, backgroundColor: '#13283B' },
  eyebrow: { color: '#8BF0B9', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { marginTop: 8, color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  heroCopy: { marginTop: 7, color: '#D1E0E5', fontSize: 11, lineHeight: 18 },
  payoutNote: { flexDirection: 'row', gap: 9, marginVertical: 12, padding: 12, borderRadius: 11, borderWidth: 1, borderColor: '#D5EBDD', backgroundColor: '#EFF9F2' },
  payoutCopy: { flex: 1, color: '#456655', fontSize: 10, lineHeight: 16 },
  payoutStrong: { color: '#164A30', fontWeight: '800' },
  card: { padding: 15, gap: 8, borderRadius: 15, borderWidth: 1, borderColor: '#E0E8E5', backgroundColor: '#FFFFFF' },
  typePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 7 },
  typeButton: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: '#DCE6E2', backgroundColor: '#FFFFFF' },
  typeButtonActive: { borderColor: '#087A4C', backgroundColor: '#087A4C' },
  typeButtonText: { color: '#53665D', fontSize: 10, fontWeight: '700' },
  typeButtonTextActive: { color: '#FFFFFF' },
  fieldLabel: { marginTop: 5, color: '#203849', fontSize: 10, fontWeight: '800' },
  input: { minHeight: 43, paddingHorizontal: 11, borderRadius: 9, borderWidth: 1, borderColor: '#D8E2DF', backgroundColor: '#FBFDFC', color: '#1B2F3C', fontSize: 12 },
  multiline: { minHeight: 92, paddingTop: 10 },
  estimate: { color: '#087A4C', fontSize: 10, fontWeight: '700' },
  uploadButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, borderRadius: 9, borderWidth: 1, borderColor: '#BBD7C8', backgroundColor: '#F3FAF6' },
  uploadText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  helper: { color: '#6B7A81', fontSize: 9, lineHeight: 14 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginVertical: 5 },
  photo: { width: '23%', height: 70, borderRadius: 7, backgroundColor: '#E7EFEB' },
  error: { color: '#A12E3B', fontSize: 11, lineHeight: 16 },
  progress: { color: '#087A4C', fontSize: 10 },
  submitButton: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 7, borderRadius: 10, backgroundColor: '#087A4C' },
  disabledButton: { opacity: 0.65 },
  submitText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  submissions: { gap: 10, marginTop: 22 },
  sectionTitle: { color: '#1B2E3C', fontSize: 16, fontWeight: '800' },
  submissionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E1E9E6', backgroundColor: '#FFFFFF' },
  submissionCopy: { flex: 1, gap: 3 },
  submissionName: { color: '#1B3040', fontSize: 11, fontWeight: '800' },
  status: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 15, backgroundColor: '#FFF5DF', color: '#8D6412', fontSize: 8, fontWeight: '800' },
  approved: { backgroundColor: '#EAF8EF', color: '#16623A' },
  rejected: { backgroundColor: '#FFF0F0', color: '#9D3434' },
});
