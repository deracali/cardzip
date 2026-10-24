import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image as CachedImage } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchStoreProducts } from '../../../store/slices/storeSlice';
import { fetchWalletBalance } from '../../../store/slices/walletSlice';
import { addToCart } from '../../../store/slices/cartSlice';
import { formatNaira } from '../../../utils/currency';
import CardzipLoader from '../../../components/CardzipLoader';
import MarketBottomTab from '../market/bottomtab/bottomtab';
import AdvertisementBanner from '../../../components/AdvertisementBanner';
import { getStorefrontPreferences, recordStoreCategoryInterest, recordStoreProductInterest, recordStoreSearch } from '../../../services/storePreferences';
import type { StorefrontPreferences } from '../../../services/storePreferences';
import { getStoreImageUrl } from '../../../utils/storeImages';


const { width, height } = Dimensions.get('window');

// Responsive scaling helpers based on standard device dimensions (375x812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function FleexaMarketScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMarketShortcut, setSelectedMarketShortcut] = useState<'community' | 'digital' | 'advertise' | 'store' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [storePreferences, setStorePreferences] = useState<StorefrontPreferences | null>(null);
  const lastSearchRequest = useRef<string | null>(null);
  const hasEnteredStore = useRef(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { balance } = useAppSelector((state) => state.wallet);
  const { products, productsPagination, loading, error } = useAppSelector((state) => state.store);

  const walletBalance = Number(balance ?? 0);

  useFocusEffect(useCallback(() => {
    if (!hasEnteredStore.current) {
      hasEnteredStore.current = true;
      return undefined;
    }
    let active = true;
    getStorefrontPreferences().then((preferences) => {
      if (active) setStorePreferences(preferences);
    });
    return () => { active = false; };
  }, []));

  useEffect(() => {
    let active = true;
    getStorefrontPreferences().then((preferences) => {
      if (!active) return;
      setStorePreferences(preferences);
      lastSearchRequest.current = 'all|';
      void dispatch(fetchStoreProducts({ page: 1, preferences, force: true }));
    });
    if (token) {
      void dispatch(fetchWalletBalance(token));
    }
    return () => { active = false; };
  }, [dispatch, token]);

  useEffect(() => {
    const search = searchQuery.trim().slice(0, 100);
    const category = selectedCategory === 'All' ? '' : selectedCategory;
    const requestKey = `${selectedCategory.toLowerCase()}|${search.toLowerCase()}`;
    if (!storePreferences || requestKey === lastSearchRequest.current) return undefined;
    const timeout = setTimeout(async () => {
      if (search.length >= 2) await recordStoreSearch(search);
      let preferences = await getStorefrontPreferences();
      setStorePreferences(preferences);
      lastSearchRequest.current = requestKey;
      const result = await dispatch(fetchStoreProducts({ page: 1, preferences, category, search, force: true }));
      if (fetchStoreProducts.fulfilled.match(result)) {
        const matchedCategory = search ? result.payload.items.find((item) => item.category?.trim())?.category : '';
        if (matchedCategory) {
          await recordStoreCategoryInterest(matchedCategory);
          preferences = await getStorefrontPreferences();
          setStorePreferences(preferences);
        }
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [dispatch, searchQuery, selectedCategory, storePreferences]);

  const mappedProducts = (products.length ? products : []).map((product) => ({
    id: product._id ?? product.id,
    title: product.name,
    category: product.category ?? '',
    description: product.description ?? '',
    slug: product.slug ?? String(product._id ?? product.id),
    images: [...new Set([...(product.image ? [product.image] : []), ...(product.images ?? [])].filter(Boolean))],
    price: formatNaira(Number(product.price || 0), { minimumFractionDigits: 2 }),
    originalPrice: Number(product.compareAtPrice) > Number(product.price)
      ? formatNaira(Number(product.compareAtPrice), { minimumFractionDigits: 2 })
      : '',
    discount: Number(product.discountPercent) > 0
      ? `${Number(product.discountPercent)}% OFF`
      : product.compareAtPrice && product.compareAtPrice > product.price ? 'Deal' : undefined,
    image: getStoreImageUrl(product.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 520),
  }));
  const categories = ['All', ...new Set([
    ...mappedProducts.map((product) => product.category.trim()).filter(Boolean),
    ...(storePreferences?.categories || []).map((item) => item.name).filter(Boolean),
  ])];

  const filteredProducts = mappedProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'All'
      || product.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
    const searchableText = [product.title, product.category, product.description]
      .join(' ')
      .toLowerCase();
    return matchesCategory && searchableText.includes(searchQuery.trim().toLowerCase());
  });

  if (!productsPagination && !error) {
    return (
      <SafeAreaView style={styles.container}>
        <CardzipLoader label="Loading CARDZIP Market…" fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Top Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View style={styles.logoRow}>
              <Image
                source={require('../../../../assets/images/logo.jpg')}
                style={styles.logoIconBox}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>Market</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/(main)/wallet-history')}>
                <Feather name="clock" size={scale(16)} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Wallet Balance Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletLeft}>
              <View style={styles.walletIconBox}>
                <Feather name="credit-card" size={scale(16)} color="#10B981" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.walletSubtitle}>Available wallet balance</Text>
                <Text style={styles.walletBalance} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{formatNaira(walletBalance, { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addMoneyBtn} onPress={() => router.push('/(main)/property/add-money')}>
              <Feather name="plus" size={scale(18)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={scale(16)} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, gadgets, or items..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Scrollable Content Body */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          {/* Categories Horizontal Scroll */}
          <Text style={styles.categorySectionTitle}>{storePreferences?.categories.length ? 'Categories you follow' : 'Categories'}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, isSelected && styles.selectedCategoryChip]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Promotion section */}
          <View style={styles.bannerHeaderRow}>
            <Text style={styles.bannerTitle}>Upgrade your everyday.</Text>
            <Text style={styles.bannerSubtitle}>Smart essentials. Wallet-friendly prices.</Text>
            <AdvertisementBanner placementKey="app-market-banner" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marketTabs}>
              <TouchableOpacity style={[styles.marketTab, selectedMarketShortcut === 'community' && styles.marketTabPrimary]} onPress={() => { setSelectedMarketShortcut('community'); router.push('/market/community' as Href); }} accessibilityRole="button" accessibilityLabel="Open community marketplace">
                <Feather name="users" size={15} color={selectedMarketShortcut === 'community' ? '#FFFFFF' : '#087A4C'} /><Text style={selectedMarketShortcut === 'community' ? styles.marketTabPrimaryText : styles.marketTabText}>Community</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.marketTab, selectedMarketShortcut === 'digital' && styles.marketTabPrimary]} onPress={() => { setSelectedMarketShortcut('digital'); router.push('/(main)/market/digital-assets' as Href); }} accessibilityRole="button" accessibilityLabel="Explore websites and apps">
                <Feather name="code" size={15} color={selectedMarketShortcut === 'digital' ? '#FFFFFF' : '#087A4C'} /><Text style={selectedMarketShortcut === 'digital' ? styles.marketTabPrimaryText : styles.marketTabText}>Web & apps</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.marketTab, selectedMarketShortcut === 'advertise' && styles.marketTabPrimary]} onPress={() => { setSelectedMarketShortcut('advertise'); router.push('/(main)/market/advertise' as Href); }} accessibilityRole="button" accessibilityLabel="Advertise on Cardzip">
                <Feather name="volume-2" size={15} color={selectedMarketShortcut === 'advertise' ? '#FFFFFF' : '#087A4C'} /><Text style={selectedMarketShortcut === 'advertise' ? styles.marketTabPrimaryText : styles.marketTabText}>Advertise</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.marketTab, selectedMarketShortcut === 'store' && styles.marketTabPrimary]} onPress={() => { setSelectedMarketShortcut('store'); router.push('/(main)/market/business' as Href); }} accessibilityRole="button" accessibilityLabel="Create or manage a Store or Business profile">
                <Feather name="briefcase" size={15} color={selectedMarketShortcut === 'store' ? '#FFFFFF' : '#087A4C'} /><Text style={selectedMarketShortcut === 'store' ? styles.marketTabPrimaryText : styles.marketTabText}>My Store</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Product Grid */}
          <View style={styles.productGrid}>
            {loading ? (
              <CardzipLoader label="Loading products…" />
            ) : error ? (
              <Text style={styles.loadingText}>{error}</Text>
            ) : (
              filteredProducts.length === 0 ? (
                <Text style={styles.loadingText}>
                  {mappedProducts.length === 0 ? 'No products are available right now.' : 'No products match your search.'}
                </Text>
              ) : filteredProducts.map((item) => (
                <View key={item.id} style={styles.productCard}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push(`/market/product/${encodeURIComponent(item.slug)}` as Href)}
                  >
                    <View style={styles.productImageContainer}>
                      <CachedImage source={{ uri: item.image }} style={styles.productImage} contentFit="cover" cachePolicy="disk" transition={120} />
                      {item.discount && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{item.discount}</Text>
                        </View>
                      )}
                    </View>
                    {item.images.length > 1 ? (
                      <Text style={styles.imageCount}>{item.images.length} photos · tap to view</Text>
                    ) : null}
                    {item.category ? <Text style={styles.productCategoryLabel}>{item.category}</Text> : null}
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productPrice}>{item.price}</Text>
                      {item.originalPrice ? <Text style={styles.productOriginalPrice}>{item.originalPrice}</Text> : null}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => {
                      void recordStoreProductInterest({ id: String(item.id), category: item.category }, 4).then(() => (
                        getStorefrontPreferences().then(setStorePreferences)
                      ));
                      dispatch(addToCart({
                          id: String(item.id),
                          name: item.title,
                          title: item.title,
                          price: Number(String(item.price).replace(/[^\d.]/g, '')) || 0,
                          image: item.image,
                          quantity: 1,
                      }));
                    }}
                  >
                    <Feather name="plus" size={scale(14)} color="#0F172A" style={{ marginRight: scale(4) }} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {!loading && productsPagination?.hasNextPage ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => void dispatch(fetchStoreProducts({
                page: productsPagination.page + 1,
                append: true,
                preferences: storePreferences || undefined,
                category: selectedCategory === 'All' ? '' : selectedCategory,
                search: searchQuery.trim(),
              }))}
              activeOpacity={0.8}
            >
              <Text style={styles.loadMoreText}>Load more products</Text>
            </TouchableOpacity>
          ) : null}

          {/* Footer Note */}
          <View style={styles.deliveryNoteContainer}>
            <Feather name="truck" size={scale(14)} color="#64748B" style={{ marginRight: scale(6) }} />
            <Text style={styles.deliveryNoteText}>Reliable delivery, right to your doorstep.</Text>
          </View>
        </ScrollView>
      </View>

      <MarketBottomTab activeTab="Store" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#111827',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(16),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconBox: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    overflow: 'hidden',
    marginRight: scale(10),
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  walletCard: {
    backgroundColor: '#1F2937',
    borderRadius: scale(16),
    padding: scale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  walletIconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  walletSubtitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#9CA3AF',
    marginBottom: verticalScale(2),
  },
  walletBalance: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  addMoneyBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    height: verticalScale(44),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: moderateScale(13),
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  categorySectionTitle: { marginBottom: 8, color: '#506258', fontFamily: 'Poppins', fontSize: moderateScale(10), fontWeight: '700', letterSpacing: 0.4 },
  categoriesContainer: {
    paddingBottom: verticalScale(16),
  },
  categoryChip: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    backgroundColor: '#E2E8F0',
    marginRight: scale(8),
    height: verticalScale(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategoryChip: {
    backgroundColor: '#0F172A',
  },
  categoryText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#475569',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  bannerHeaderRow: {
    marginBottom: verticalScale(16),
  },
  bannerTitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: verticalScale(2),
  },
  bannerSubtitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    color: '#64748B',
    marginBottom: verticalScale(12),
  },
  marketTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 3,
    marginTop: verticalScale(9),
  },
  marketTab: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5E6DA',
    backgroundColor: '#FFFFFF',
  },
  marketTabPrimary: {
    borderColor: '#087A4C',
    backgroundColor: '#087A4C',
  },
  marketTabText: {
    color: '#33473B',
    fontSize: 10,
    fontWeight: '700',
  },
  marketTabPrimaryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  filterBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginVertical: verticalScale(14),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
    backgroundColor: '#D1FAE5',
  },
  loadMoreText: {
    color: '#065F46',
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  productCard: {
    width: (width - scale(40)) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(10),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productImageContainer: {
    width: '100%',
    height: verticalScale(130),
    backgroundColor: '#F1F5F9',
    borderRadius: scale(12),
    marginBottom: verticalScale(10),
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageCount: {
    marginTop: 4,
    color: '#64748B',
    fontFamily: 'Poppins',
    fontSize: moderateScale(9),
    fontWeight: '600',
  },
  discountBadge: {
    position: 'absolute',
    top: scale(8),
    left: scale(8),
    backgroundColor: '#10B981',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: scale(6),
  },
  discountText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productTitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: verticalScale(6),
    height: verticalScale(34),
  },
  productCategoryLabel: { marginBottom: verticalScale(4), color: '#087A4C', fontFamily: 'Poppins', fontSize: moderateScale(9), fontWeight: '800', textTransform: 'uppercase' },
  productPrice: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#10B981',
    marginBottom: verticalScale(10),
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: scale(7),
  },
  productOriginalPrice: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginBottom: verticalScale(10),
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: scale(10),
    paddingVertical: verticalScale(8),
    backgroundColor: '#FFFFFF',
  },
  addToCartText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#0F172A',
  },
  loadingText: {
    width: '100%',
    color: '#64748B',
    textAlign: 'center',
    marginTop: verticalScale(16),
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
  },
  deliveryNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  deliveryNoteText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    color: '#64748B',
  },

});