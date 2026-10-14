import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppDispatch } from '../../../store';
import { addToCart } from '../../../store/slices/cartSlice';
import { fetchStoreProductBySlugApi } from '../../../services/api/storeApi';
import { StoreProduct } from '../../../types/store';
import CardzipLoader from '../../../../components/CardzipLoader';

export default function StoreProductDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchStoreProductBySlugApi(slug)
      .then((result) => {
        if (!active) return;
        setProduct(result);
        setSelectedImage(result.image || result.images?.[0] || '');
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load this product.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  const images = product
    ? [...new Set([...(product.image ? [product.image] : []), ...(product.images ?? [])].filter(Boolean))]
    : [];
  const productId = String(product?._id || product?.id || '');

  const addProductToCart = () => {
    if (!product || !productId) return;
    dispatch(addToCart({
      id: productId,
      name: product.name,
      title: product.name,
      price: Number(product.price),
      image: product.image || images[0] || '',
      quantity: 1,
    }));
    router.push('/(main)/market/cart' as Href);
  };

  if (loading) return <SafeAreaView style={styles.safeArea}><CardzipLoader label="Loading product…" /></SafeAreaView>;
  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Product unavailable</Text>
          <Text style={styles.errorText}>{error || 'This product could not be found.'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product details</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: selectedImage || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80' }}
          style={[styles.heroImage, { height: Math.min(width * 0.9, 390) }]}
          resizeMode="cover"
        />
        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailList}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={`${image}-${index}`}
                onPress={() => setSelectedImage(image)}
                style={[styles.thumbnailButton, selectedImage === image && styles.selectedThumbnail]}
                accessibilityLabel={`View product image ${index + 1}`}
              >
                <Image source={{ uri: image }} style={styles.thumbnail} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.category}>{product.category || 'Cardzip Store'}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₦{Number(product.price).toLocaleString('en-NG')}</Text>
            {Number(product.compareAtPrice) > Number(product.price) && (
              <Text style={styles.comparePrice}>₦{Number(product.compareAtPrice).toLocaleString('en-NG')}</Text>
            )}
          </View>
          <Text style={styles.stock}>{Number(product.stock ?? 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}</Text>
          <Text style={styles.description}>{product.description || 'Contact support for more information about this product.'}</Text>
          {product.tags?.length ? (
            <View style={styles.tags}>
              {product.tags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
            </View>
          ) : null}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, Number(product.stock ?? 0) <= 0 && styles.disabledButton]}
          onPress={addProductToCart}
          disabled={Number(product.stock ?? 0) <= 0}
        >
          <Feather name="shopping-bag" size={17} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{Number(product.stock ?? 0) > 0 ? 'Add to cart' : 'Out of stock'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 24 },
  heroImage: { width: '100%', backgroundColor: '#E2E8F0' },
  thumbnailList: { gap: 9, paddingHorizontal: 16, paddingVertical: 14 },
  thumbnailButton: { padding: 2, borderRadius: 11, borderWidth: 2, borderColor: 'transparent' },
  selectedThumbnail: { borderColor: '#059669' },
  thumbnail: { width: 62, height: 62, borderRadius: 8, backgroundColor: '#E2E8F0' },
  productInfo: { paddingHorizontal: 20, paddingTop: 14 },
  category: { color: '#047857', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  name: { marginTop: 8, color: '#0F172A', fontSize: 24, lineHeight: 31, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  price: { color: '#047857', fontSize: 21, fontWeight: '800' },
  comparePrice: { color: '#94A3B8', fontSize: 14, textDecorationLine: 'line-through' },
  stock: { marginTop: 8, color: '#64748B', fontSize: 12, fontWeight: '600' },
  description: { marginTop: 18, color: '#475569', fontSize: 14, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: '#ECFDF5', color: '#047857', fontSize: 11, fontWeight: '700' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  addButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 12, backgroundColor: '#059669' },
  disabledButton: { opacity: 0.5 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  errorTitle: { color: '#0F172A', fontSize: 20, fontWeight: '800' },
  errorText: { marginTop: 8, color: '#64748B', fontSize: 13, textAlign: 'center' },
  backButton: { marginTop: 20, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 10, backgroundColor: '#059669' },
  backButtonText: { color: '#FFFFFF', fontWeight: '800' },
});
