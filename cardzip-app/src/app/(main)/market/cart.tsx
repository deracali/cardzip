import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { removeFromCart, updateQuantity as updateCartQuantity } from '../../store/slices/cartSlice';

const { width, height } = Dimensions.get('window');

// Responsive scaling helpers based on standard mobile dimensions (375x812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

const SHIPPING_COST = 1500;

export default function CartScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Cart');
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const updateQuantity = (id: string, delta: number) => {
    const currentItem = cartItems.find((item) => item.id === id);
    if (!currentItem) return;

    const nextQuantity = Math.max(1, currentItem.quantity + delta);
    dispatch(updateCartQuantity({ id, quantity: nextQuantity }));
  };

  const removeItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    router.push('/market/checkout');
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const grandTotal = subtotal > 0 ? subtotal + SHIPPING_COST : 0;

  const formatCurrency = (amount: number) => {
    return '₦' + amount.toLocaleString('en-US') + '.00';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      {/* Top Navy Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton}>
            <Feather name="arrow-left" size={scale(20)} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerCategory}>FLEEXA MARKET</Text>
            <Text style={styles.headerTitle}>My Cart ({totalItemsCount} items)</Text>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>A little upgrade goes a long way.</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="shopping-bag" size={42} color="#94A3B8" />
            <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
            <Text style={styles.emptyStateText}>Add a product to begin checkout.</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push('/(main)/(tabs)/store')}>
              <Text style={styles.emptyStateButtonText}>Browse products</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Cart Items List */}
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartCard}>
            <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }} style={styles.itemImage} resizeMode="cover" />

            <View style={styles.itemDetails}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title ?? item.name ?? 'Product'}
                </Text>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteButton}>
                  <Feather name="trash-2" size={scale(16)} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.itemPrice}>{formatCurrency(Number(item.price ?? 0))}</Text>

              {/* Quantity Selector */}
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Feather name="minus" size={scale(14)} color="#64748B" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Feather name="plus" size={scale(14)} color="#10B981" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Delivery Timeline Banner */}
        <View style={styles.deliveryBanner}>
          <View style={styles.deliveryIconBox}>
            <Feather name="truck" size={scale(18)} color="#10B981" />
          </View>
          <View style={styles.deliveryTextContainer}>
            <Text style={styles.deliveryTitle}>Delivered in 2–4 business days</Text>
            <Text style={styles.deliverySubtitle}>Shipping is calculated for your delivery address.</Text>
          </View>
        </View>

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal · {totalItemsCount} items</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>{formatCurrency(SHIPPING_COST)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
          </View>

          <Text style={styles.taxNote}>All prices include applicable taxes.</Text>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity onPress={handleCheckout} style={[styles.checkoutBtn, cartItems.length === 0 && styles.checkoutBtnDisabled]} activeOpacity={0.88} disabled={cartItems.length === 0}>
          <Feather name="lock" size={scale(16)} color="#0F172A" style={{ marginRight: scale(8) }} />
          <Text style={styles.checkoutBtnText}>Proceed to Secure Checkout</Text>
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Feather name="shield" size={scale(13)} color="#64748B" style={{ marginRight: scale(6) }} />
          <Text style={styles.securityText}>Encrypted payments. Protected purchases.</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Home' && styles.activeNavItem]}
          onPress={() => router.push('/(main)/(tabs)/store')}
        >
          <Feather
            name="home"
            size={scale(18)}
            color={activeTab === 'Home' ? '#10B981' : '#64748B'}
          />
          <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Cart' && styles.activeNavItem]}
          onPress={() => router.push('/(main)/market/cart')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather
              name="shopping-bag"
              size={scale(18)}
              color={activeTab === 'Cart' ? '#10B981' : '#64748B'}
            />
            <Text style={[styles.navText, { marginLeft: scale(6) }, activeTab === 'Cart' && styles.activeNavText]}>Cart</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItemsCount}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Orders' && styles.activeNavItem]}
          onPress={() => router.push('/(main)/market/orders')}
        >
          <Feather
            name="file-text"
            size={scale(18)}
            color={activeTab === 'Orders' ? '#10B981' : '#64748B'}
          />
          <Text style={[styles.navText, activeTab === 'Orders' && styles.activeNavText]}>Orders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: '#0B1220',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  backButton: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  headerTextContainer: {
    flex: 1,
  },
  headerCategory: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: verticalScale(2),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
    marginLeft: scale(2),
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(30),
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(12),
    flexDirection: 'row',
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(12),
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: scale(12),
    justifyContent: 'space-between',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: scale(6),
  },
  deleteButton: {
    padding: scale(2),
  },
  itemPrice: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#10B981',
    marginTop: verticalScale(2),
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(8),
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(3),
    marginTop: verticalScale(6),
  },
  quantityBtn: {
    padding: scale(4),
  },
  quantityText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#0F172A',
    paddingHorizontal: scale(12),
  },
  deliveryBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: scale(14),
    padding: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(8),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  deliveryIconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#065F46',
    marginBottom: verticalScale(1),
  },
  deliverySubtitle: {
    fontSize: moderateScale(11),
    color: '#047857',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: verticalScale(14),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  summaryLabel: {
    fontSize: moderateScale(13),
    color: '#64748B',
  },
  summaryValue: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#0F172A',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: scale(16),
    borderWidth: 1,
    marginBottom: verticalScale(16),
    padding: scale(24),
  },
  emptyStateTitle: {
    color: '#0F172A',
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginTop: verticalScale(12),
  },
  emptyStateText: {
    color: '#64748B',
    fontSize: moderateScale(12),
    marginTop: verticalScale(6),
  },
  emptyStateButton: {
    backgroundColor: '#D1FAE5',
    borderRadius: scale(10),
    marginTop: verticalScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
  },
  emptyStateButtonText: {
    color: '#065F46',
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: verticalScale(12),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  totalLabel: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#10B981',
  },
  taxNote: {
    fontSize: moderateScale(11),
    color: '#94A3B8',
    marginTop: verticalScale(2),
  },
  checkoutBtn: {
    backgroundColor: '#10B981',
    borderRadius: scale(14),
    height: verticalScale(48),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  checkoutBtnDisabled: {
    opacity: 0.5,
  },
  checkoutBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  securityText: {
    fontSize: moderateScale(11),
    color: '#64748B',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
  },
  activeNavItem: {
    backgroundColor: '#0F172A',
  },
  navText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: '#64748B',
    marginLeft: scale(6),
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#0F172A',
  },
});