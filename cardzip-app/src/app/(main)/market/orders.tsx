import React, { useEffect, useState } from 'react';
import { StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchStoreOrders } from '../../../store/slices/storeSlice';
import { formatNaira } from '../../../utils/currency';
import MarketBottomTab from './bottomtab/bottomtab';

const { width, height } = Dimensions.get('window');

// Responsive scaling helpers based on standard mobile dimensions (375x812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  status: 'PROCESSING' | 'DELIVERED';
  itemsCount: number;
  itemList: string[];
  totalPaid: string;
  paymentMethod: string;
  statusDetail: string;
  images: string[];
}

export default function YourOrdersScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { orders, ordersPagination, ordersLoading } = useAppSelector((state) => state.store);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Processing' | 'Delivered'>('All');

  const processingCount = orders.filter((order) => order.status !== 'delivered').length;
  const deliveredCount = orders.filter((order) => order.status === 'delivered').length;

  useEffect(() => {
    if (token) {
      void dispatch(fetchStoreOrders({ token, page: 1 }));
    }
  }, [dispatch, token]);

  const mappedOrders: OrderItem[] = orders.map((order) => ({
    id: order._id ?? order.id ?? order.orderNumber,
    orderNumber: `#${order.orderNumber}`,
    date: new Date(order.createdAt ?? Date.now()).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: order.status === 'delivered' ? 'DELIVERED' : 'PROCESSING',
    itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    itemList: order.items.map((item) => `${item.name} × ${item.quantity}`),
    totalPaid: formatNaira(order.total, { minimumFractionDigits: 2 }),
    paymentMethod: `Via ${order.paymentMethod === 'wallet' ? 'Fleexa wallet' : 'card payment'}`,
    statusDetail: order.status === 'delivered' ? 'Delivered successfully' : 'Preparing for dispatch',
    images: order.items.map((item) => item.image || '').filter(Boolean),
  }));

  const filteredOrders = mappedOrders.filter((order) => {
    if (activeFilter === 'Processing') return order.status === 'PROCESSING';
    if (activeFilter === 'Delivered') return order.status === 'DELIVERED';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerIconBox}>
            <Feather name="file-text" size={scale(20)} color="#FFFFFF" />
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerCategory}>CARDZIP MARKET</Text>
            <Text style={styles.headerTitle}>Your Orders</Text>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>Every purchase, all in one place.</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Chips Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'All' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('All')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'All' && styles.filterChipTextActive,
              ]}
            >
              All orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'Processing' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('Processing')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'Processing' && styles.filterChipTextActive,
              ]}
            >
              Processing ({processingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'Delivered' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('Delivered')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'Delivered' && styles.filterChipTextActive,
              ]}
            >
              Delivered ({deliveredCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        {ordersLoading ? <Text style={styles.emptyText}>Loading your orders...</Text> : null}
        {!ordersLoading && filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>No orders yet. Your purchases will appear here.</Text>
        ) : null}
        {filteredOrders.map((order) => {
          const isProcessing = order.status === 'PROCESSING';

          return (
            <View
              key={order.id}
              style={[
                styles.orderCard,
                isProcessing ? styles.orderCardDark : styles.orderCardLight,
              ]}
            >
              {/* Order Header Row */}
              <View style={styles.orderCardHeader}>
                <Text
                  style={[
                    styles.orderNumber,
                    isProcessing ? styles.textWhite : styles.textDark,
                  ]}
                >
                  {order.orderNumber}
                </Text>

                <View
                  style={[
                    styles.badge,
                    isProcessing ? styles.badgeProcessing : styles.badgeDelivered,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isProcessing ? styles.badgeTextProcessing : styles.badgeTextDelivered,
                    ]}
                  >
                    • {order.status}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.orderDate,
                  isProcessing ? styles.textMutedDark : styles.textMutedLight,
                ]}
              >
                {order.date}
              </Text>

              {/* Items Section */}
              <View style={styles.itemsContainer}>
                <View style={styles.thumbnailsRow}>
                  {order.images.map((imgUrl, idx) => (
                    <Image
                      key={`${order.id}-${idx}`}
                      source={{ uri: imgUrl }}
                      style={styles.itemImage}
                    />
                  ))}
                </View>

                <View style={styles.itemDetails}>
                  <Text
                    style={[
                      styles.itemsCountText,
                      isProcessing ? styles.textMutedDark : styles.textMutedLight,
                    ]}
                  >
                    ITEMS : {order.itemsCount}
                  </Text>

                  {order.itemList.map((item, idx) => (
                    <Text
                      key={idx}
                      style={[
                        styles.itemNameText,
                        isProcessing ? styles.textWhite : styles.textDark,
                      ]}
                      numberOfLines={1}
                    >
                      {item}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Total Paid Section */}
              <View
                style={[
                  styles.totalPaidRow,
                  isProcessing ? styles.dividerDark : styles.dividerLight,
                ]}
              >
                <View>
                  <Text
                    style={[
                      styles.totalLabel,
                      isProcessing ? styles.textMutedDark : styles.textMutedLight,
                    ]}
                  >
                    Total paid
                  </Text>
                  <Text
                    style={[
                      styles.paymentMethod,
                      isProcessing ? styles.textMutedDark : styles.textMutedLight,
                    ]}
                  >
                    {order.paymentMethod}
                  </Text>
                </View>

                <Text style={styles.totalPrice}>{order.totalPaid}</Text>
              </View>

              {/* Status Note */}
              <View style={styles.statusNoteRow}>
                {isProcessing ? (
                  <Ionicons
                    name="cube-outline"
                    size={scale(15)}
                    color="#10B981"
                    style={{ marginRight: scale(6) }}
                  />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={scale(15)}
                    color="#10B981"
                    style={{ marginRight: scale(6) }}
                  />
                )}
                <Text
                  style={[
                    styles.statusNoteText,
                    isProcessing ? styles.textMutedDark : styles.textMutedLight,
                  ]}
                >
                  {order.statusDetail}
                </Text>
              </View>

              {/* Receipt / Track Action Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isProcessing ? styles.actionButtonDark : styles.actionButtonLight,
                ]}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/(main)/market/receipt', params: { orderNumber: order.orderNumber.replace(/^#/, '') } })}
              >
                <Feather
                  name="arrow-up-right"
                  size={scale(16)}
                  color="#0F172A"
                  style={{ marginRight: scale(6) }}
                />
                <Text style={styles.actionButtonText}>View Receipt / Track</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        {!ordersLoading && token && ordersPagination?.hasNextPage ? (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() => void dispatch(fetchStoreOrders({ token, page: ordersPagination.page + 1, append: true }))}
            activeOpacity={0.8}
          >
            <Text style={styles.loadMoreText}>Load more orders</Text>
          </TouchableOpacity>
        ) : null}

        {/* Need Help Footer Box */}
        <TouchableOpacity
          style={styles.helpBox}
          activeOpacity={0.85}
          onPress={() => router.push('/(main)/property/support')}
          accessibilityRole="button"
          accessibilityLabel="Contact Cardzip support"
        >
          <View style={styles.helpLeft}>
            <View style={styles.helpIconBox}>
              <MaterialCommunityIcons
                name="headphones"
                size={scale(20)}
                color="#64748B"
              />
            </View>
            <View>
              <Text style={styles.helpTitle}>Need a hand with your order?</Text>
              <Text style={styles.helpSubtitle}>Our support team is here to help.</Text>
            </View>
          </View>
          <Feather name="arrow-right" size={scale(18)} color="#10B981" />
        </TouchableOpacity>
      </ScrollView>

      <MarketBottomTab activeTab="Orders" />
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
    marginBottom: verticalScale(10),
  },
  headerIconBox: {
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
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: verticalScale(2),
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    color: '#94A3B8',
    marginLeft: scale(2),
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(30),
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
    borderRadius: scale(20),
    marginRight: scale(8),
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  orderCard: {
    borderRadius: scale(18),
    padding: scale(16),
    marginBottom: verticalScale(16),
  },
  orderCardDark: {
    backgroundColor: '#0B1220',
  },
  orderCardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  orderNumber: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textDark: {
    color: '#0F172A',
  },
  textMutedDark: {
    color: '#64748B',
  },
  textMutedLight: {
    color: '#94A3B8',
  },
  orderDate: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    marginBottom: verticalScale(14),
  },
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(12),
  },
  badgeProcessing: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeDelivered: {
    backgroundColor: '#ECFDF5',
  },
  badgeText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextProcessing: {
    color: '#10B981',
  },
  badgeTextDelivered: {
    color: '#10B981',
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  thumbnailsRow: {
    flexDirection: 'row',
    marginRight: scale(10),
  },
  itemImage: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(10),
    backgroundColor: '#E2E8F0',
    marginRight: scale(6),
  },
  itemDetails: {
    flex: 1,
  },
  itemsCountText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  itemNameText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    fontWeight: '500',
    lineHeight: moderateScale(16),
  },
  totalPaidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    marginBottom: verticalScale(10),
  },
  dividerDark: {
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerLight: {
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
  },
  paymentMethod: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    marginTop: verticalScale(1),
  },
  totalPrice: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#10B981',
  },
  statusNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  statusNoteText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
  },
  actionButton: {
    height: verticalScale(40),
    borderRadius: scale(12),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDark: {
    backgroundColor: '#FFFFFF',
  },
  actionButtonLight: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  helpBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: scale(16),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(4),
    marginBottom: verticalScale(16),
  },
  helpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpIconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  helpTitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  helpSubtitle: {
    fontFamily: 'Poppins',
    fontSize: moderateScale(11),
    color: '#64748B',
    marginTop: verticalScale(1),
  },
  emptyText: {
    color: '#64748B',
    fontFamily: 'Poppins',
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginVertical: verticalScale(14),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
    backgroundColor: '#D1FAE5',
  },
  loadMoreText: { color: '#065F46', fontSize: moderateScale(12), fontWeight: '700' },
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
    backgroundColor: '#0B1220',
  },
  navText: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: '#0F172A',
  },
});