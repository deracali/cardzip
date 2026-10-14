import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchStoreProducts } from '../../store/slices/storeSlice';
import { fetchWalletBalance } from '../../store/slices/walletSlice';
import { addToCart } from '../../store/slices/cartSlice';
import CardzipLoader from '../../../components/CardzipLoader';


const { width, height } = Dimensions.get('window');

// Responsive scaling helpers based on standard device dimensions (375x812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function FleexaMarketScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { balance } = useAppSelector((state) => state.wallet);
  const cartItems = useAppSelector((state) => state.cart.items);
  const { products, productsPagination, loading, error } = useAppSelector((state) => state.store);

  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const walletBalance = Number(balance ?? 0);

  useEffect(() => {
    void dispatch(fetchStoreProducts({ page: 1 }));
    if (token) {
      void dispatch(fetchWalletBalance(token));
    }
  }, [dispatch, token]);

  const mappedProducts = (products.length ? products : []).map((product) => ({
    id: product._id ?? product.id,
    title: product.name,
    category: product.category ?? '',
    description: product.description ?? '',
    slug: product.slug ?? String(product._id ?? product.id),
    images: [...new Set([...(product.image ? [product.image] : []), ...(product.images ?? [])].filter(Boolean))],
    price: `₦${Number(product.price || 0).toLocaleString('en-US')}.00`,
    discount: product.compareAtPrice && product.compareAtPrice > product.price ? 'Deal' : undefined,
    image:
      product.image ||
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  }));
  const categories = ['All', ...new Set(mappedProducts.map((product) => product.category.trim()).filter(Boolean))];

  const filteredProducts = mappedProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'All'
      || product.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
    const searchableText = [product.title, product.category, product.description]
      .join(' ')
      .toLowerCase();
    return matchesCategory && searchableText.includes(searchQuery.trim().toLowerCase());
  });

  // Active state checks based on Expo Router path
  const isHome = pathname.endsWith('/store');
  const isCart = pathname.includes('/market/cart');
  const isOrders = pathname.includes('/market/orders');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121826" />

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
              <View style={styles.logoIconBox}>
                <Feather name="zap" size={scale(18)} color="#121826" />
              </View>
              <Text style={styles.headerTitle}>Fleexa Market</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/(main)/wallet-history')}>
                <Feather name="clock" size={scale(16)} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.notificationBtn}>
                <Feather name="bell" size={scale(20)} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Wallet Balance Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletLeft}>
              <View style={styles.walletIconBox}>
                <Feather name="credit-card" size={scale(16)} color="#10B981" />
              </View>
              <View>
                <Text style={styles.walletSubtitle}>Available wallet balance</Text>
                <Text style={styles.walletBalance}>{`₦${walletBalance.toLocaleString('en-US')}.00`}</Text>
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

          {/* Banner Row */}
          <View style={styles.bannerHeaderRow}>
            <View>
              <Text style={styles.bannerTitle}>Upgrade your everyday.</Text>
              <Text style={styles.bannerSubtitle}>Smart essentials. Wallet-friendly prices.</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Feather name="sliders" size={scale(16)} color="#1E293B" />
            </TouchableOpacity>
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
                      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                      {item.discount && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{item.discount}</Text>
                        </View>
                      )}
                    </View>
                    {item.images.length > 1 ? (
                      <Text style={styles.imageCount}>{item.images.length} photos · tap to view</Text>
                    ) : null}
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.productPrice}>{item.price}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() =>
                      dispatch(
                        addToCart({
                          id: String(item.id),
                          name: item.title,
                          title: item.title,
                          price: Number(String(item.price).replace(/[^\d.]/g, '')) || 0,
                          image: item.image,
                          quantity: 1,
                        })
                      )
                    }
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
              onPress={() => void dispatch(fetchStoreProducts({ page: productsPagination.page + 1, append: true }))}
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

      {/* Manual Bottom Navigation Bar */}
    <View style={styles.bottomNav}>
      {/* Home / BottomTab Screen */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/(main)/(tabs)/store')}
      >
        <Feather
          name="home"
          size={scale(18)}
          color={isHome ? '#10B981' : '#64748B'}
        />
        <Text style={[styles.navText, isHome && styles.activeNavText]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Cart Screen */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/(main)/market/cart')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather
            name="shopping-bag"
            size={scale(18)}
            color={isCart ? '#10B981' : '#64748B'}
          />
          <Text style={[styles.navText, { marginLeft: scale(6) }, isCart && styles.activeNavText]}>
            Cart
          </Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Orders Screen */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/(main)/market/orders')}
      >
        <Feather
          name="file-text"
          size={scale(18)}
          color={isOrders ? '#10B981' : '#64748B'}
        />
        <Text style={[styles.navText, isOrders && styles.activeNavText]}>
          Orders
        </Text>
      </TouchableOpacity>
    </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    // Pushes the entire view up above the outer wrapper tab bar
    paddingBottom: scale(65),
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
    width: scale(32),
    height: scale(32),
    backgroundColor: '#10B981',
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  headerTitle: {
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
  notificationBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: moderateScale(11),
    color: '#9CA3AF',
    marginBottom: verticalScale(2),
  },
  walletBalance: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
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
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#475569',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  bannerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: verticalScale(2),
  },
  bannerSubtitle: {
    fontSize: moderateScale(12),
    color: '#64748B',
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
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productTitle: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: verticalScale(6),
    height: verticalScale(34),
  },
  productPrice: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#10B981',
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
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#0F172A',
  },
  loadingText: {
    width: '100%',
    color: '#64748B',
    textAlign: 'center',
    marginTop: verticalScale(16),
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
    fontSize: moderateScale(12),
    color: '#64748B',
  },

  /* Manual Bottom Navigation Styles */
 bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    justifyContent: 'space-around',
    alignItems: 'center',

    // ADD THIS: Pushes the tab bar upward directly
    marginBottom: verticalScale(50), 
    
    // OPTIONAL: Adds rounded corners so it looks floating
    marginHorizontal: scale(16),
    borderRadius: scale(20), 
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(12),
  },
  navText: {
    fontSize: moderateScale(11),
    color: '#64748B',
    marginTop: verticalScale(4),
  },
  activeNavText: {
    color: '#10B981',
    fontWeight: '600',
  },
  cartBadge: {
    backgroundColor: '#10B981',
    borderRadius: scale(8),
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(1),
    marginLeft: scale(4),
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
});