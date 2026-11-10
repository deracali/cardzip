import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchShopProductApi, fetchShopProductsApi } from '../../../../services/api/storeApi';
import type { ShopProduct, ShopProfile } from '../../../../types/shop';
import { formatNaira } from '../../../../utils/currency';
import MarketBottomTab from '../bottomtab/bottomtab';

const whatsappNumber = (phone: string) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.startsWith('0') && digits.length === 11 ? `234${digits.slice(1)}` : digits;
};

export default function ShopProductDetailsScreen() {
  const router = useRouter();
  const { slug: routeSlug, shopSlug: routeShopSlug } = useLocalSearchParams<{ slug: string; shopSlug: string }>();
  const productSlug = Array.isArray(routeSlug) ? routeSlug[0] : routeSlug;
  const shopSlug = Array.isArray(routeShopSlug) ? routeShopSlug[0] : routeShopSlug;
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<ShopProduct[]>([]);
  const [relatedProductsError, setRelatedProductsError] = useState('');
  const [loading, setLoading] = useState(Boolean(shopSlug && productSlug));
  const [error, setError] = useState(shopSlug && productSlug ? '' : 'Product not found.');

  useEffect(() => {
    let active = true;
    if (!shopSlug || !productSlug) return () => { active = false; };
    fetchShopProductApi(shopSlug, productSlug)
      .then((result) => {
        if (!active) return;
        setProduct(result.product);
        setShop(result.shop);
        setSelectedImage(result.product.images?.[0] || result.product.imageUrl || '');
        setRelatedProductsError('');
        fetchShopProductsApi(shopSlug, 1, 12)
          .then((shopProducts) => {
            if (!active) return;
            setRelatedProducts(shopProducts.items
              .filter((item) => item._id !== result.product._id && item.category === result.product.category)
              .slice(0, 4));
          })
          .catch((requestError) => {
            if (active) setRelatedProductsError(requestError instanceof Error ? requestError.message : 'Could not load related products.');
          });
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load this product.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [shopSlug, productSlug]);

  const images = product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : [];
  const contactWhatsApp = () => {
    if (!product || !shop) return;
    const message = encodeURIComponent(`Hi, I'm interested in ${product.name} from ${shop.businessName}.`);
    void Linking.openURL(`https://wa.me/${whatsappNumber(shop.contactPhone)}?text=${message}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={20} color="#14253A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product details</Text>
        <View style={styles.headerButton} />
      </View>
      {loading ? <ActivityIndicator style={styles.loader} color="#087A4C" /> : !product || !shop ? (
        <View style={styles.emptyCard}>
          <Text style={styles.title}>Product unavailable</Text>
          <Text style={styles.muted}>{error || 'This product could not be found.'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.productImage} resizeMode="contain" /> : (
            <View style={[styles.productImage, styles.imagePlaceholder]}><Feather name="camera" size={32} color="#8B9A90" /></View>
          )}
          {images.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={`${image}-${index}`}
                style={[styles.thumbnailButton, selectedImage === image && styles.thumbnailSelected]}
                onPress={() => setSelectedImage(image)}
                accessibilityLabel={`Show photo ${index + 1}`}
              >
                <Image source={{ uri: image }} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
          </ScrollView>}
          <Text style={styles.category}>{product.category || 'STORE PRODUCT'} · {product.condition === 'used' ? 'USED' : 'BRAND NEW'}</Text>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>{formatNaira(product.price)}</Text>
          <Text style={styles.muted}>{product.stock} available</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.storeCard}>
            <Text style={styles.storeName}>{shop.businessName}</Text>
            <Text style={styles.storeAddress}>{shop.address}</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={contactWhatsApp}>
            <Feather name="message-circle" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Ask about this product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => void Linking.openURL(`tel:${shop.contactPhone}`)}>
            <Feather name="phone" size={15} color="#087A4C" />
            <Text style={styles.secondaryButtonText}>Call store</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>Contact the store directly to arrange a purchase. Cardzip does not process payment or delivery for this product.</Text>
          <View style={styles.relatedSection}>
            <Text style={styles.relatedHeading}>Related products</Text>
            {relatedProductsError ? <Text style={styles.relatedError}>{relatedProductsError}</Text> : null}
            {relatedProducts.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.relatedCard}
                onPress={() => router.push(`/(main)/market/shop-product/${encodeURIComponent(item.slug)}?shopSlug=${encodeURIComponent(shopSlug)}` as Href)}
              >
                {item.images?.[0] || item.imageUrl
                  ? <Image source={{ uri: item.images?.[0] || item.imageUrl }} style={styles.relatedImage} resizeMode="cover" />
                  : <View style={[styles.relatedImage, styles.imagePlaceholder]}><Feather name="camera" size={17} color="#8B9A90" /></View>}
                <View style={styles.relatedCopy}>
                  <Text style={styles.relatedName}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>{formatNaira(item.price)}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#087A4C" />
              </TouchableOpacity>
            ))}
            {!relatedProductsError && relatedProducts.length === 0 ? <Text style={styles.muted}>More products from this store will appear here.</Text> : null}
          </View>
        </ScrollView>
      )}
      <MarketBottomTab activeTab="Store" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  header: { minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0EAE3' },
  headerButton: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { color: '#14253A', fontSize: 16, fontWeight: '800' },
  loader: { marginTop: 40 },
  content: { padding: 16, paddingBottom: 36 },
  productImage: { width: '100%', height: 300, borderRadius: 15, backgroundColor: '#FFFFFF' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  thumbnails: { gap: 8, marginTop: 10 },
  thumbnailButton: { width: 62, height: 62, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', borderRadius: 9, backgroundColor: '#FFFFFF' },
  thumbnailSelected: { borderColor: '#087A4C' },
  thumbnail: { width: '100%', height: '100%' },
  category: { marginTop: 20, color: '#087A4C', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  title: { marginTop: 7, color: '#193A29', fontSize: 22, fontWeight: '800' },
  price: { marginTop: 12, color: '#087A4C', fontSize: 20, fontWeight: '800' },
  muted: { marginTop: 4, color: '#6E7C73', fontSize: 11, lineHeight: 17 },
  description: { marginTop: 18, color: '#52665A', fontSize: 13, lineHeight: 21 },
  storeCard: { marginTop: 20, padding: 14, gap: 5, borderRadius: 12, backgroundColor: '#FFFFFF' },
  storeName: { color: '#193A29', fontSize: 13, fontWeight: '800' },
  storeAddress: { color: '#6E7C73', fontSize: 10 },
  primaryButton: { minHeight: 45, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, backgroundColor: '#087A4C' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  secondaryButton: { minHeight: 42, marginTop: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#C9DDD1', borderRadius: 10, backgroundColor: '#FFFFFF' },
  secondaryButtonText: { color: '#087A4C', fontSize: 11, fontWeight: '800' },
  disclaimer: { marginTop: 14, color: '#6E7C73', fontSize: 10, lineHeight: 15, textAlign: 'center' },
  relatedSection: { marginTop: 24, gap: 9 },
  relatedHeading: { color: '#193A29', fontSize: 15, fontWeight: '800' },
  relatedError: { color: '#B4232F', fontSize: 10 },
  relatedCard: { minHeight: 72, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E0EAE3', borderRadius: 11, backgroundColor: '#FFFFFF' },
  relatedImage: { width: 54, height: 54, borderRadius: 8, backgroundColor: '#EEF3EF' },
  relatedCopy: { flex: 1, gap: 4 },
  relatedName: { color: '#193A29', fontSize: 10, fontWeight: '800' },
  relatedPrice: { color: '#087A4C', fontSize: 10, fontWeight: '800' },
  emptyCard: { margin: 20, padding: 22, alignItems: 'center', gap: 9, borderRadius: 14, backgroundColor: '#FFFFFF' },
});
