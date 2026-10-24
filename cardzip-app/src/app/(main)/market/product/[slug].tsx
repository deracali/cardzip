import React, { useEffect, useState } from 'react';
import { ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image as CachedImage } from 'expo-image';
import { useAppDispatch } from '../../../../store';
import { addToCart } from '../../../../store/slices/cartSlice';
import { fetchStoreProductBySlugApi, fetchStoreProductsApi } from '../../../../services/api/storeApi';
import { StoreProduct } from '../../../../types/store';
import { formatNaira } from '../../../../utils/currency';
import { getStorefrontPreferences, recordStoreProductInterest } from '../../../../services/storePreferences';
import CardzipLoader from '../../../../components/CardzipLoader';
import MarketBottomTab from '../bottomtab/bottomtab';
import { getStoreImageUrl } from '../../../../utils/storeImages';

const colorSwatches: Record<string, string> = {
  black: '#111827',
  blue: '#2563EB',
  'midnight blue': '#172554',
  midnight: '#111827',
  white: '#FFFFFF',
  silver: '#CBD5E1',
  green: '#16A34A',
  graphite: '#475569',
  sand: '#D6C4A1',
  red: '#DC2626',
  gold: '#D4AF37',
  pink: '#EC4899',
  purple: '#7C3AED',
  gray: '#94A3B8',
  grey: '#94A3B8',
  navy: '#1E3A8A',
};

const getColorSwatch = (color: string) => {
  const value = String(color || '').trim();
  if (/^#(?:[\da-f]{3}){1,2}$/i.test(value)) return value;
  return colorSwatches[value.toLowerCase()] || '#94A3B8';
};

export default function StoreProductDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([]);
  const [relatedProductsError, setRelatedProductsError] = useState('');

  useEffect(() => {
    let active = true;
    fetchStoreProductBySlugApi(slug)
      .then((result) => {
        if (!active) return;
        setDescriptionExpanded(false);
        setProduct(result);
        setSelectedImage(result.image || result.images?.[0] || '');
        setSelectedColor(result.colors?.[0] || '');
        setRelatedProductsError('');
        recordStoreProductInterest(result).then(getStorefrontPreferences)
          .then((preferences) => fetchStoreProductsApi(1, 8, result.category || '', preferences))
          .then((products) => {
            if (!active) return;
            setRelatedProducts(products.items.filter((item) => (
              Boolean(item.slug) && String(item._id || item.id) !== String(result._id || result.id)
            )).slice(0, 4));
          })
          .catch((requestError: unknown) => {
            if (active) setRelatedProductsError(requestError instanceof Error ? requestError.message : 'Could not load similar products.');
          });
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
  const productDescription = product?.description || 'Contact support for more information about this product.';
  const keyHighlights = product?.keyHighlights || [];
  const specifications = product?.specifications || [];

  const addProductToCart = () => {
    if (!product || !productId) return;
    if (product.colors?.length && !selectedColor) return;
    void recordStoreProductInterest(product, 4);
    dispatch(addToCart({
      id: selectedColor ? `${productId}:${selectedColor.toLowerCase()}` : productId,
      productId,
      selectedColor: selectedColor || undefined,
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product details</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CachedImage
          source={{ uri: getStoreImageUrl(selectedImage || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80', 1200) }}
          style={[styles.heroImage, { height: Math.min(width * 0.9, 390) }]}
          contentFit="cover"
          cachePolicy="disk"
          priority="high"
          transition={150}
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
                <CachedImage source={{ uri: getStoreImageUrl(image, 240) }} style={styles.thumbnail} contentFit="cover" cachePolicy="disk" priority="low" transition={100} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.category}>{product.category || 'Cardzip Store'}</Text>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail" adjustsFontSizeToFit minimumFontScale={0.8}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatNaira(Number(product.price))}</Text>
            {Number(product.compareAtPrice) > Number(product.price) && (
              <Text style={styles.comparePrice}>{formatNaira(Number(product.compareAtPrice))}</Text>
            )}
          </View>
          <View style={styles.conditionRow}><Text style={styles.conditionText}>{product.condition === 'used' ? 'Used' : 'Brand new'}</Text>{product.isSold ? <Text style={styles.soldBadge}>Sold</Text> : null}</View>
          <Text style={styles.stock}>{Number(product.stock ?? 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}</Text>
          {product.colors?.length ? (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Choose a color<Text style={styles.selectedColor}> · {selectedColor}</Text></Text>
              <View style={styles.colorOptions}>
                {product.colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorOption, selectedColor === color && styles.colorOptionSelected]}
                    onPress={() => setSelectedColor(color)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selectedColor === color }}
                    accessibilityLabel={`Select ${color}`}
                  >
                    <View style={[styles.colorSwatch, { backgroundColor: getColorSwatch(color) }]} />
                    <Text style={[styles.colorOptionText, selectedColor === color && styles.colorOptionTextSelected]}>{color}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
          {product.expectedDelivery?.trim() ? (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Expected delivery</Text>
              <Text style={styles.packagingText}>{product.expectedDelivery}</Text>
            </View>
          ) : null}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description} numberOfLines={descriptionExpanded ? undefined : 4} ellipsizeMode="tail">{productDescription}</Text>
            {productDescription.length > 180 && (
              <TouchableOpacity onPress={() => setDescriptionExpanded((expanded) => !expanded)} accessibilityRole="button">
                <Text style={styles.descriptionToggle}>{descriptionExpanded ? 'Show less' : 'Read more'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {keyHighlights.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Key highlights</Text>
              {keyHighlights.map((highlight, index) => (
                <View key={`${highlight}-${index}`} style={styles.highlightRow}>
                  <Feather name="check" size={15} color="#059669" />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          )}
          {specifications.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <View style={styles.specificationsTable}>
                {specifications.map((specification, index) => (
                  <View key={`${specification.label}-${index}`} style={[styles.specificationRow, index % 2 === 0 && styles.specificationRowAlternate]}>
                    <Text style={styles.specificationLabel}>{specification.label}</Text>
                    <Text style={styles.specificationValue}>{specification.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {product.packagingDetails?.trim() ? (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Packaging details</Text>
              <Text style={styles.packagingText}>{product.packagingDetails}</Text>
            </View>
          ) : null}
          {product.tags?.length ? (
            <View style={styles.tags}>
              {product.tags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
            </View>
          ) : null}
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Related products</Text>
            {relatedProductsError ? <Text style={styles.relatedError}>{relatedProductsError}</Text> : null}
            {relatedProducts.map((item) => <TouchableOpacity key={item._id || item.id} style={styles.relatedCard} onPress={() => router.push(`/(main)/market/product/${item.slug}` as Href)}>
              {(item.image || item.images?.[0]) ? <CachedImage source={{ uri: getStoreImageUrl(item.image || item.images?.[0] || '', 320) }} style={styles.relatedImage} contentFit="cover" cachePolicy="disk" /> : <View style={[styles.relatedImage, styles.relatedPlaceholder]}><Feather name="image" size={18} color="#94A3B8" /></View>}
              <View style={styles.relatedCopy}><Text style={styles.relatedCategory}>{item.category || 'Cardzip Store'}</Text><Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text><Text style={styles.relatedPrice}>{formatNaira(Number(item.price))}</Text></View>
              <Feather name="chevron-right" size={17} color="#94A3B8" />
            </TouchableOpacity>)}
            {!relatedProductsError && relatedProducts.length === 0 ? <Text style={styles.relatedEmpty}>More products in this category will appear here.</Text> : null}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, (product.isSold || Number(product.stock ?? 0) <= 0) && styles.disabledButton]}
          onPress={addProductToCart}
          disabled={Boolean(product.isSold) || Number(product.stock ?? 0) <= 0 || Boolean(product.colors?.length && !selectedColor)}
        >
          <Feather name="shopping-bag" size={17} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{product.isSold ? 'Sold' : Number(product.stock ?? 0) > 0 ? 'Add to cart' : 'Out of stock'}</Text>
        </TouchableOpacity>
      </View>
      <MarketBottomTab activeTab="Store" />
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
  name: { marginTop: 8, color: '#0F172A', fontSize: 20, lineHeight: 26, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  price: { color: '#047857', fontSize: 21, fontWeight: '800' },
  comparePrice: { color: '#94A3B8', fontSize: 14, textDecorationLine: 'line-through' },
  stock: { marginTop: 8, color: '#64748B', fontSize: 12, fontWeight: '600' },
  conditionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  conditionText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  soldBadge: { paddingHorizontal: 7, paddingVertical: 3, overflow: 'hidden', borderRadius: 4, backgroundColor: '#FEF2F2', color: '#991B1B', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  selectedColor: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  colorOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  colorOption: { minHeight: 38, paddingHorizontal: 7, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' },
  colorOptionSelected: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  colorSwatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(15, 23, 42, 0.16)' },
  colorOptionText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  colorOptionTextSelected: { color: '#047857' },
  detailSection: { marginTop: 20 },
  sectionTitle: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  description: { marginTop: 8, color: '#475569', fontSize: 12, lineHeight: 18 },
  descriptionToggle: { marginTop: 7, color: '#047857', fontSize: 11, fontWeight: '800' },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 },
  highlightText: { flex: 1, color: '#475569', fontSize: 13, lineHeight: 20 },
  specificationsTable: { marginTop: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10 },
  specificationRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  specificationRowAlternate: { backgroundColor: '#F1F5F9' },
  specificationLabel: { flex: 0.8, color: '#64748B', fontSize: 12, fontWeight: '700' },
  specificationValue: { flex: 1.2, color: '#334155', fontSize: 12, lineHeight: 18 },
  packagingText: { marginTop: 8, color: '#475569', fontSize: 12, lineHeight: 19 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: '#ECFDF5', color: '#047857', fontSize: 11, fontWeight: '700' },
  relatedSection: { gap: 10, marginTop: 24 },
  relatedCard: { minHeight: 80, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 9, backgroundColor: '#FFFFFF' },
  relatedImage: { width: 60, height: 60, borderRadius: 7, backgroundColor: '#E2E8F0' },
  relatedPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  relatedCopy: { flex: 1, gap: 4 },
  relatedCategory: { color: '#047857', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  relatedName: { color: '#1E293B', fontSize: 12, fontWeight: '800' },
  relatedPrice: { color: '#047857', fontSize: 11, fontWeight: '800' },
  relatedError: { color: '#991B1B', fontSize: 10 },
  relatedEmpty: { color: '#64748B', fontSize: 11 },
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
