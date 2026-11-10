import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { fetchDigitalProductsApi } from '../../../../services/api/storeApi';
import { StoreProduct } from '../../../../types/store';
import { formatNaira } from '../../../../utils/currency';
import { getStorefrontPreferences, recordStoreSearch } from '../../../../services/storePreferences';
import MarketBottomTab from '../bottomtab/bottomtab';

type DigitalFilter = 'all' | 'website' | 'app' | 'ios_app' | 'full_stack' | 'admin';

const filters: { key: DigitalFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'website', label: 'Websites' },
  { key: 'app', label: 'Android apps' },
  { key: 'ios_app', label: 'iOS apps' },
  { key: 'full_stack', label: 'Full stack' },
  { key: 'admin', label: 'Admin' },
];

const startingPrice = (asset: StoreProduct) => {
  const prices = [Number(asset.usePrice), Number(asset.templatePrice)].filter((price) => price > 0);
  if (asset.isSellerListing && prices.length === 0 && Number(asset.price) > 0) prices.push(Number(asset.price));
  return prices.sort((left, right) => left - right)[0];
};

export default function DigitalAssetsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<DigitalFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getStorefrontPreferences(), Promise.resolve(searchTerm)])
      .then(([preferences, term]) => fetchDigitalProductsApi(filter, term, preferences))
      .then((items) => { if (active) setAssets(items); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load digital products.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter, searchTerm]);

  const submitSearch = async () => {
    const term = searchInput.trim().slice(0, 100);
    await recordStoreSearch(term);
    setError('');
    setLoading(true);
    setSearchTerm(term);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back"><Feather name="arrow-left" size={19} color="#15263A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Websites & apps</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Feather name="code" size={24} color="#8BF0B9" /></View>
          <Text style={styles.eyebrow}>CARDZIP DIGITAL STUDIO</Text>
          <Text style={styles.heroTitle}>Build on a head start.</Text>
          <Text style={styles.heroCopy}>Explore websites, iOS and Android apps with flexible use options, or get the full project with backend and two weeks of setup and upload.</Text>
          <TouchableOpacity style={styles.sellButton} onPress={() => router.push('/(main)/market/digital-assets/sell' as Href)}><Text style={styles.sellButtonText}>Sell your website or app</Text><Feather name="arrow-right" size={16} color="#13283B" /></TouchableOpacity>
        </View>
        <View style={styles.filters}>
          {filters.map((item) => (
            <TouchableOpacity key={item.key} style={[styles.filter, filter === item.key && styles.filterActive]} onPress={() => { if (filter !== item.key) { setLoading(true); setError(''); setFilter(item.key); } }} accessibilityState={{ selected: filter === item.key }}>
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.searchRow}>
          <TextInput style={styles.searchInput} value={searchInput} onChangeText={setSearchInput} placeholder="Search templates, apps, or categories" placeholderTextColor="#82918B" maxLength={100} returnKeyType="search" onSubmitEditing={() => void submitSearch()} />
          <TouchableOpacity style={styles.searchButton} onPress={() => void submitSearch()}><Feather name="search" size={15} color="#FFFFFF" /><Text style={styles.searchButtonText}>Search</Text></TouchableOpacity>
          {searchTerm ? <TouchableOpacity style={styles.clearSearchButton} onPress={() => { setSearchInput(''); setSearchTerm(''); setLoading(true); setError(''); }}><Text style={styles.clearSearchText}>Clear</Text></TouchableOpacity> : null}
        </View>
        {loading ? <ActivityIndicator style={styles.loader} color="#087A4C" /> : null}
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        {!loading && !error && assets.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="layers" size={27} color="#087A4C" />
            <Text style={styles.emptyTitle}>{searchTerm ? 'No matching websites or apps' : 'Digital products are coming soon'}</Text>
            <Text style={styles.emptyCopy}>{searchTerm ? 'Try another search or clear your search.' : 'Check back for new websites and apps curated by Cardzip.'}</Text>
          </View>
        ) : null}
        <View style={styles.grid}>
          {assets.map((asset) => {
            const id = String(asset._id || asset.id);
            const price = startingPrice(asset);
            return (
              <TouchableOpacity key={id} style={styles.card} activeOpacity={0.88} onPress={() => router.push(`/(main)/market/digital-assets/${encodeURIComponent(asset.slug || id)}` as Href)}>
                <View style={styles.cardImage}>
                  {asset.image ? <Image source={{ uri: asset.image }} style={styles.image} resizeMode="cover" /> : <Feather name={asset.productType === 'website' || asset.productType === 'full_stack' || asset.productType === 'admin' ? 'globe' : 'smartphone'} size={33} color="#8BF0B9" />}
                  {asset.isPromoted ? <Text style={styles.promotedBadge}>PROMOTED</Text> : null}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.typeLabel}>{asset.productType === 'app' ? 'ANDROID APP' : asset.productType === 'ios_app' ? 'IOS APP' : asset.productType === 'full_stack' ? 'FULL STACK' : asset.productType === 'admin' ? 'ADMIN' : 'WEBSITE'}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>{asset.name}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>{asset.description || asset.usageInstructions || 'Explore usage options and setup support.'}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>{price ? `From ${formatNaira(price)}` : 'View options'}</Text>
                    <Feather name="arrow-up-right" size={17} color="#087A4C" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  hero: { padding: 22, borderRadius: 18, backgroundColor: '#13283B' },
  heroIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#FFFFFF18', marginBottom: 19 },
  eyebrow: { color: '#8BF0B9', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  heroTitle: { marginTop: 9, color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.7 },
  heroCopy: { marginTop: 9, color: '#D1E0E5', fontSize: 12, lineHeight: 19 },
  sellButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 15, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 10, backgroundColor: '#8BF0B9' },
  sellButtonText: { color: '#13283B', fontSize: 11, fontWeight: '800' },
  filters: { flexDirection: 'row', gap: 8, marginVertical: 18 },
  filter: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE7E3' },
  filterActive: { backgroundColor: '#087A4C', borderColor: '#087A4C' },
  filterText: { color: '#586A65', fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: -5, marginBottom: 17 },
  searchInput: { minWidth: 0, minHeight: 42, flex: 1, paddingHorizontal: 11, borderRadius: 10, borderWidth: 1, borderColor: '#DDE7E3', backgroundColor: '#FFFFFF', color: '#183044', fontSize: 10 },
  searchButton: { minHeight: 42, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, backgroundColor: '#087A4C' },
  searchButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  clearSearchButton: { paddingHorizontal: 5 },
  clearSearchText: { color: '#526A60', fontSize: 10, fontWeight: '800' },
  loader: { marginVertical: 28 },
  error: { marginVertical: 16, color: '#A12E3B', fontSize: 12 },
  empty: { minHeight: 165, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E9E6', borderRadius: 16 },
  emptyTitle: { color: '#1B2E3C', fontSize: 14, fontWeight: '800' },
  emptyCopy: { color: '#68777F', fontSize: 11, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3EAE8', borderRadius: 15 },
  cardImage: { position: 'relative', height: 128, alignItems: 'center', justifyContent: 'center', backgroundColor: '#153547' },
  image: { width: '100%', height: '100%' },
  promotedBadge: { position: 'absolute', top: 8, left: 8, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, backgroundColor: '#087A4C', color: '#FFFFFF', fontSize: 8, fontWeight: '900' },
  cardBody: { padding: 12 },
  typeLabel: { color: '#087A4C', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  cardTitle: { marginTop: 6, color: '#162C40', fontSize: 13, fontWeight: '800' },
  cardDescription: { minHeight: 34, marginTop: 5, color: '#6B7A81', fontSize: 9, lineHeight: 14 },
  cardFooter: { marginTop: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: '#087A4C', fontSize: 9, fontWeight: '800' },
});
