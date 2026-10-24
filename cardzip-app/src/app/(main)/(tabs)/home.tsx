import React, { useCallback, useEffect, useState } from 'react';
import { Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Href, router, useFocusEffect } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchGiftCards, fetchGiftCardTrades } from '../../../store/slices/giftCardSlice';
import { fetchStoreProducts } from '../../../store/slices/storeSlice';
import { fetchWalletBalance } from '../../../store/slices/walletSlice';
import { GiftCard, GiftCardTrade } from '../../../types/giftCard';
import { StoreProduct } from '../../../types/store';
import CardzipLoader from '../../../components/CardzipLoader';
import AdvertisementBanner from '../../../components/AdvertisementBanner';
import {
  fetchNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  UserNotification,
} from '../../../services/api/notificationApi';
import { getGiftCardLogoUrls } from '../../../utils/giftCardLogos';
import { formatNaira } from '../../../utils/currency';
import { getStorefrontPreferences } from '../../../services/storePreferences';
import { getStoreImageUrl } from '../../../utils/storeImages';
import { Image as CachedImage } from 'expo-image';
import { fetchDigitalProductsApi } from '../../../services/api/storeApi';


// Screen Dimensions for responsiveness
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive helper function based on a standard 375px screen width
const wp = (percentage: number): number => {
  return (percentage * SCREEN_WIDTH) / 100;
};

export default function HomeScreen() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [seeAllModal, setSeeAllModal] = useState<'giftCards' | 'transactions' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<GiftCardTrade | null>(null);
  const [seeAllPage, setSeeAllPage] = useState(0);
  const [failedGiftCardLogos, setFailedGiftCardLogos] = useState<Record<string, string[]>>({});
  const [promotedProducts, setPromotedProducts] = useState<StoreProduct[]>([]);
  const [promotedProductsError, setPromotedProductsError] = useState('');
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [updatingNotificationId, setUpdatingNotificationId] = useState('');
  const dispatch = useAppDispatch();
  const { token, user, sessionReady } = useAppSelector((state) => state.auth);
  const notificationsEnabled = useAppSelector((state) => state.preferences.notificationsEnabled);
  const { balance } = useAppSelector((state) => state.wallet);
  const { products: featuredProducts, loading: featuredProductsLoading } = useAppSelector((state) => state.store);
  const homeStoreProducts = (promotedProducts.length ? promotedProducts : featuredProducts).slice(0, 50);
  const {
    catalog,
    transactions,
    catalogPagination,
    transactionsPagination,
    catalogLoading,
    transactionsLoading,
    catalogError,
    transactionsError,
  } = useAppSelector((state) => state.giftCards);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const result = await fetchNotificationsApi(token);
      setNotifications(result.data);
      setUnreadNotifications(result.unreadCount);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Could not load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    dispatch(fetchGiftCards({ page: 1 }));
  }, [dispatch]);

  useFocusEffect(useCallback(() => {
    let active = true;
    const scheduleIdle = globalThis.requestIdleCallback ?? ((callback: IdleRequestCallback) => setTimeout(callback, 0) as unknown as number);
    const cancelIdle = globalThis.cancelIdleCallback ?? ((handle: number) => clearTimeout(handle));
    const preloadHandle = scheduleIdle(() => {
      void getStorefrontPreferences().then((preferences) => {
        if (!active) return [];
        void dispatch(fetchStoreProducts({ page: 1, limit: 50, preferences, force: true }));
        return fetchDigitalProductsApi('all', '', preferences);
      }).then((digitalProducts) => {
        if (!active) return;
        setPromotedProducts(digitalProducts.filter((product) => product.isPromoted).slice(0, 50));
        setPromotedProductsError('');
      }).catch((error: unknown) => {
        if (active) setPromotedProductsError(error instanceof Error ? error.message : 'Could not load promoted products.');
      });
    });
    return () => {
      active = false;
      cancelIdle(preloadHandle);
    };
  }, [dispatch]));

  useEffect(() => {
    if (token) {
      dispatch(fetchGiftCardTrades({ token, page: 1, limit: 15 }));
      dispatch(fetchWalletBalance(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (!token) return undefined;
    const initialLoad = setTimeout(() => { void loadNotifications(); }, 0);
    const interval = setInterval(() => { void loadNotifications(); }, 30000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadNotifications, token]);

  const markNotificationRead = async (notification: UserNotification) => {
    if (!token || notification.readAt || updatingNotificationId) return;
    setUpdatingNotificationId(notification._id);
    setNotificationsError('');
    try {
      const updated = await markNotificationReadApi(token, notification._id);
      setNotifications((current) => current.map((item) => item._id === updated._id ? updated : item));
      setUnreadNotifications((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Could not mark notification as read.');
    } finally {
      setUpdatingNotificationId('');
    }
  };

  const openNotification = async (notification: UserNotification) => {
    if (!notification.readAt) await markNotificationRead(notification);
    if (!notification.route || !notification.route.startsWith('/(main)/') || notification.route.includes('..') || notification.route.includes('\\')) return;
    setNotificationsVisible(false);
    router.push(notification.route as Href);
  };

  const markAllNotificationsRead = async () => {
    if (!token || unreadNotifications === 0 || updatingNotificationId) return;
    setUpdatingNotificationId('all');
    setNotificationsError('');
    try {
      await markAllNotificationsReadApi(token);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      setUnreadNotifications(0);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Could not mark notifications as read.');
    } finally {
      setUpdatingNotificationId('');
    }
  };

  const getGiftCardTheme = (name: string) => {
    const brand = name.toLowerCase();
    if (brand.includes('amazon')) return '#1A1813';
    if (brand.includes('apple')) return '#121214';
    if (brand.includes('itunes')) return '#121214';
    if (brand.includes('steam')) return '#171D25';
    if (brand.includes('foot locker') || brand.includes('footlocker')) return '#171717';
    if (brand.includes('goldrazer') || brand.includes('goldrazor')) return '#171717';
    if (brand.includes('sephora')) return '#1F1416';
    if (brand.includes('walmart')) return '#0071CE';
    if (brand.includes('target')) return '#CC0000';
    if (brand.includes('netflix')) return '#141414';
    if (brand.includes('razer')) return '#111111';
    if (brand.includes('xbox')) return '#107C10';
    if (brand.includes('playstation')) return '#171D25';
    const fallbackColors = ['#1A1813', '#1B2028', '#211A18', '#17231D', '#201B25'];
    const colorIndex = [...brand].reduce((sum, character) => sum + character.charCodeAt(0), 0) % fallbackColors.length;
    return fallbackColors[colorIndex];
  };

  const renderGiftCardLogo = (card: GiftCard) => {
    const brand = card.name.toLowerCase();
    const logoUri = getGiftCardLogoUrls(card.name, card.logo)
      .find((url) => !failedGiftCardLogos[card.id]?.includes(url));
    if (logoUri) {
      return (
        <Image
          source={{ uri: logoUri }}
          style={styles.giftCardLogoImage}
          resizeMode="contain"
          onError={() => setFailedGiftCardLogos((current) => ({
            ...current,
            [card.id]: [...(current[card.id] || []), logoUri],
          }))}
        />
      );
    }
    if (brand.includes('amazon')) return <FontAwesome5 name="amazon" size={wp(6)} color="#FF9900" />;
    if (brand.includes('itunes')) return <FontAwesome5 name="itunes" size={wp(6)} color="#FFFFFF" />;
    if (brand.includes('apple')) return <FontAwesome5 name="apple" size={wp(6)} color="#FFFFFF" />;
    if (brand.includes('steam')) return <Ionicons name="logo-steam" size={wp(6)} color="#66C0F4" />;
    if (brand.includes('foot locker') || brand.includes('footlocker')) return <FontAwesome5 name="shoe-prints" size={wp(5.5)} color="#E31837" />;
    if (brand.includes('goldrazer') || brand.includes('goldrazor')) return <FontAwesome5 name="coins" size={wp(5.5)} color="#D4AF37" />;
    if (brand.includes('sephora')) return <Text style={styles.sephoraIcon}>S</Text>;
    if (brand.includes('facebook')) return <FontAwesome5 name="facebook" size={wp(6)} color="#1877F2" />;
    if (brand.includes('instagram')) return <FontAwesome5 name="instagram" size={wp(6)} color="#E4405F" />;
    if (brand.includes('walmart')) return <FontAwesome5 name="shopping-basket" size={wp(5.5)} color="#FFC220" />;
    if (brand.includes('google')) return <Text style={[styles.cardFallbackLogo, styles.googleFallbackLogo]}>G</Text>;
    if (brand.includes('roblox')) return <Text style={[styles.cardFallbackLogo, styles.robloxFallbackLogo]}>R</Text>;
    if (brand.includes('netflix')) return <FontAwesome5 name="netflix" size={wp(6)} color="#E50914" />;
    if (brand.includes('playstation')) return <FontAwesome5 name="playstation" size={wp(6)} color="#FFFFFF" />;
    if (brand.includes('xbox')) return <FontAwesome5 name="xbox" size={wp(6)} color="#107C10" />;
    const initials = card.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    return <Text style={styles.cardFallbackLogo}>{initials || '?'}</Text>;
  };

  const formatTransactionDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? 'Date unavailable'
      : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const openSeeAll = (modal: 'giftCards' | 'transactions') => {
    setSeeAllPage(0);
    setSeeAllModal(modal);
  };

  const modalPageSize = 15;
  const modalItems = seeAllModal === 'giftCards' ? catalog : transactions;
  const modalPagination = seeAllModal === 'giftCards' ? catalogPagination : transactionsPagination;
  const modalPageCount = Math.max(1, modalPagination?.totalPages ?? 1);
  const visibleModalItems = modalItems.slice(seeAllPage * modalPageSize, (seeAllPage + 1) * modalPageSize);

  const goToModalPage = (nextPage: number) => {
    setSeeAllPage(nextPage);
    if (!modalPagination?.hasNextPage || nextPage + 1 <= modalPagination.page) return;
    if (seeAllModal === 'giftCards') {
      void dispatch(fetchGiftCards({ page: nextPage + 1, append: true }));
    } else if (seeAllModal === 'transactions' && token) {
      void dispatch(fetchGiftCardTrades({ token, page: nextPage + 1, limit: 15, append: true }));
    }
  };

  const renderGiftCard = (card: GiftCard, inModal = false) => {
    const rate = card.types[0];
    return (
      <TouchableOpacity
        key={card.id}
        style={[styles.cardBox, inModal && styles.modalCardBox]}
        activeOpacity={0.8}
        onPress={() => {
          if (inModal) setSeeAllModal(null);
          router.push({ pathname: '/(main)/property/trade', params: { cardId: card.id, cardName: card.name } });
        }}
      >
        <View style={[styles.cardHeaderBanner, { backgroundColor: getGiftCardTheme(card.name) }]}>
          {renderGiftCardLogo(card)}
          <View style={styles.cardTitleBox}>
            <Text style={styles.cardBrand} numberOfLines={1}>{card.name}</Text>
            <Text style={styles.cardSub} numberOfLines={1}>{card.category}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.rateBadge}>
            <Text style={styles.rateText} numberOfLines={1}>
              {rate ? `1 ${rate.currency} = ₦${rate.rate.toLocaleString()}` : 'Rate unavailable'}
            </Text>
          </View>
          {card.popular ? <Text style={[styles.changeText, { color: '#10B981' }]}>Popular</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTransaction = (transaction: GiftCardTrade) => {
    const isSuccessful = transaction.status === 'successful';
    const statusColor = isSuccessful ? '#047857' : transaction.status === 'failed' ? '#B91C1C' : '#B45309';
    const statusBackground = isSuccessful ? '#D1FAE5' : transaction.status === 'failed' ? '#FEE2E2' : '#FEF3C7';
    return (
      <TouchableOpacity key={transaction.id} style={styles.txCard} activeOpacity={0.75} onPress={() => setSelectedTransaction(transaction)} accessibilityRole="button" accessibilityLabel={`View ${transaction.type} transaction details`}>
        <View style={[styles.txIconContainer, { backgroundColor: statusBackground }]}>
          <MaterialCommunityIcons name="shopping" size={wp(5.5)} color={statusColor} />
        </View>
        <View style={styles.txDetails}>
          <Text style={styles.txTitle} numberOfLines={1}>{transaction.type} · {transaction.currency} {transaction.amount.toLocaleString()}</Text>
          <Text style={styles.txSub}>{formatTransactionDate(transaction.createdAt)}</Text>
        </View>
        <View style={styles.txAmountContainer}>
          <Text style={styles.txAmount} numberOfLines={1}>
            {transaction.ngnAmount == null ? 'Amount pending' : `₦${transaction.ngnAmount.toLocaleString()}`}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBackground }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{transaction.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER SECTION ================= */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {user?.profileImage
              ? <Image source={{ uri: user.profileImage }} style={styles.avatar} />
              : <View style={[styles.avatar, styles.avatarPlaceholder]}><Ionicons name="person" size={wp(5.5)} color="#FFFFFF" /></View>}
            <View style={styles.userTextContainer}>
              <View style={styles.greetingRow}>
                <Text style={styles.greetingText}>Good morning</Text>
                <Text style={styles.waveEmoji}> 👋</Text>
              </View>
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail" adjustsFontSizeToFit minimumFontScale={0.75}>{user?.name ?? (sessionReady ? 'Your account' : 'Cardzip account')}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.historyBtn} activeOpacity={0.7} onPress={() => router.push('/(main)/wallet-history')}>
              <Ionicons name="time-outline" size={wp(4.6)} color="#0F172A" />
              <Text style={styles.historyBtnText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7} onPress={() => { setNotificationsVisible(true); void loadNotifications(); }}>
              <Ionicons name={notificationsEnabled ? 'notifications-outline' : 'notifications-off-outline'} size={wp(5.5)} color="#1F2937" />
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotifications > 99 ? '99+' : unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= BALANCE CARD ================= */}
<LinearGradient
  colors={['#092F1C', '#0B4527', '#0A3521']}
  start={{ x: 0, y: 0.5 }}
  end={{ x: 1, y: 0.5 }}
  style={styles.balanceCard}
>
  {/* Soft green glow on the right side */}
  <LinearGradient
    colors={[
      'rgba(77, 190, 35, 0)',
      'rgba(77, 190, 35, 0.12)',
      'rgba(77, 190, 35, 0.42)',
      'rgba(77, 190, 35, 0.12)',
      'rgba(77, 190, 35, 0)',
    ]}
    locations={[0, 0.25, 0.5, 0.75, 1]}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={styles.rightGlow}
    pointerEvents="none"
  />

  {/* Subtle green light from the top-right */}
  <LinearGradient
    colors={[
      'rgba(106, 220, 45, 0.28)',
      'rgba(106, 220, 45, 0.08)',
      'rgba(106, 220, 45, 0)',
    ]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={styles.topGlow}
    pointerEvents="none"
  />

  {/* Your existing content */}
  <View style={styles.cardHeader}>
    <TouchableOpacity
      style={styles.balanceTitleRow}
      onPress={() => setBalanceVisible(!balanceVisible)}
      activeOpacity={0.7}
    >
      <Ionicons
        name="wallet-outline"
        size={wp(4.2)}
        color="#A3B8CC"
      />

      <Text style={styles.balanceTitle}>
        Available Balance
      </Text>

      <Ionicons
        name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
        size={wp(4.2)}
        color="#A3B8CC"
        style={{ marginLeft: 4 }}
      />
    </TouchableOpacity>

    <View style={styles.badgePercentage}>
      <Ionicons
        name="wallet-outline"
        size={wp(3.4)}
        color="#B3F05C"
      />
      <Text style={styles.badgeText}>YOUR WALLET</Text>
    </View>
  </View>

  <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
    {balanceVisible ? `₦${balance.toLocaleString('en-US')}.00` : '₦ ••••••••'}
  </Text>

  <Text style={styles.updatedText}>
    Your Cardzip balance, ready when you are
  </Text>

  <View style={styles.actionRow}>
    <TouchableOpacity
      style={styles.withdrawBtn}
      activeOpacity={0.8}
      onPress={() => router.push('/(main)/property/withdrawal')}
    >
      <Ionicons
        name="download-outline"
        size={wp(4.5)}
        color="#FFFFFF"
      />
      <Text style={styles.withdrawText}>
        Withdraw
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.sellBtn}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/(main)/property/trade', params: { tradeSpeed: 'fast' } })}
    >
      <Ionicons
        name="add-outline"
        size={wp(4.5)}
        color="#FFFFFF"
      />
      <Text style={styles.sellText}>
        Sell Card
      </Text>
    </TouchableOpacity>
  </View>
</LinearGradient>

        <AdvertisementBanner placementKey="app-home-hero" />
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => router.push('/(main)/market/advertise' as never)}
          style={{ marginBottom: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 11, borderWidth: 1, borderColor: '#D7E9DD', backgroundColor: '#F4FAF6' }}
        >
          <View><Text style={{ color: '#087A4C', fontSize: 12, fontWeight: '800' }}>Advertise on Cardzip</Text><Text style={{ marginTop: 3, color: '#64746A', fontSize: 10 }}>Promote your business across the app.</Text></View>
          <Ionicons name="arrow-forward" size={17} color="#087A4C" />
        </TouchableOpacity>

        {/* ================= QUICK ACTIONS GRID ================= */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/(main)/property/trade', params: { tradeSpeed: 'fast' } })}
          >
            <View style={styles.quickIconContainer}>
              <Ionicons name="flash-outline" size={wp(5.5)} color="#10B981" />
            </View>
            <Text style={styles.quickLabel}>Instant Sell</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/property/add-money')}
          >
            <View style={styles.quickIconContainer}>
              <Ionicons name="wallet-outline" size={wp(5.5)} color="#10B981" />
            </View>
            <Text style={styles.quickLabel}>Add money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/property/rate-calculator')}
          >
            <View style={styles.quickIconContainer}>
              <Ionicons name="calculator-outline" size={wp(5.5)} color="#10B981" />
            </View>
            <Text style={styles.quickLabel}>Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.7}
            onPress={() => router.push('/(main)/property/support')}
          >
            <View style={styles.quickIconContainer}>
              <Ionicons name="headset-outline" size={wp(5.5)} color="#10B981" />
            </View>
            <Text style={styles.quickLabel}>Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Store products</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(main)/(tabs)/store')}><Text style={styles.seeAllText}>Explore store</Text></TouchableOpacity>
        </View>
        <Text style={styles.homeSectionSubtitle}>{promotedProducts.length ? 'Promoted products from Cardzip sellers.' : 'Everyday essentials picked for you.'}</Text>
        {promotedProductsError ? <Text style={styles.txSub}>Promoted products are temporarily unavailable. Showing products picked for you.</Text> : null}
        {featuredProductsLoading && featuredProducts.length === 0 ? <CardzipLoader label="Loading store products…" compact /> : null}
        {!featuredProductsLoading && featuredProducts.length === 0 ? <Text style={styles.txSub}>No store products are available right now.</Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.homeProductRow}>
          {homeStoreProducts.map((product: StoreProduct) => {
            const image = product.image || product.images?.[0];
            const homePrice = product.productType && product.productType !== 'product'
              ? Number(product.price) > 0 ? product.price : product.usePrice || product.templatePrice || 0
              : product.price;
            const productPath = product.productType && product.productType !== 'product'
              ? `/(main)/market/digital-assets/${encodeURIComponent(product.slug ?? String(product._id ?? product.id))}`
              : `/market/product/${encodeURIComponent(product.slug ?? String(product._id ?? product.id))}`;
            return (
              <TouchableOpacity key={product._id ?? product.id} style={styles.homeProductCard} activeOpacity={0.82} onPress={() => router.push(productPath as never)}>
                {image ? <CachedImage source={{ uri: getStoreImageUrl(image, 520) }} style={styles.homeProductImage} contentFit="cover" cachePolicy="disk" transition={120} /> : <View style={[styles.homeProductImage, styles.homeProductImageEmpty]}><MaterialCommunityIcons name="storefront-outline" size={wp(7)} color="#7D9184" /></View>}
                <Text style={styles.homeProductName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.homeProductPrice} numberOfLines={1}>{formatNaira(Number(homePrice))}</Text>
                <Text style={styles.homeProductCondition} numberOfLines={1}>{product.productType && product.productType !== 'product' ? 'Digital product' : product.isSold ? 'Sold' : product.condition === 'used' ? 'Used' : 'Brand new'}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.homePromotionBanner} activeOpacity={0.85} onPress={() => router.push('/market/community' as never)}>
          <View style={styles.homePromotionTag}><Text style={styles.homePromotionTagText}>AD</Text></View>
          <View style={styles.homePromotionCopy}><Text style={styles.homePromotionTitle}>Promote your product to local buyers</Text><Text style={styles.homePromotionSubtitle}>Post a community listing. No Cardzip payment.</Text></View>
          <Ionicons name="arrow-forward" size={wp(4.5)} color="#8B651F" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeNumberHubCard}
          activeOpacity={0.88}
          onPress={() => router.push({ pathname: '/(main)/(tabs)/esims', params: { tab: 'catalog' } })}
          accessibilityRole="button"
          accessibilityLabel="Explore virtual numbers and SMS verification"
        >
          <LinearGradient
            colors={['#102D22', '#0A4932', '#087A4C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeNumberHubGradient}
          >
            <View style={styles.homeNumberHubTop}>
              <View style={styles.homeNumberHubIcon}>
                <MaterialCommunityIcons name="sim" size={wp(6)} color="#C8F7D7" />
              </View>
              <View style={styles.homeNumberHubBadge}><View style={styles.homeNumberHubDot} /><Text style={styles.homeNumberHubBadgeText}>NUMBER HUB</Text></View>
              <Ionicons name="arrow-forward" size={wp(5)} color="#D8FBE2" />
            </View>
            <Text style={styles.homeNumberHubTitle}>Virtual numbers, made simple.</Text>
            <Text style={styles.homeNumberHubDescription}>Get a number for your chosen service and read verification texts in one place.</Text>
            <View style={styles.homeNumberHubFeatures}>
              <View style={styles.homeNumberHubFeature}><Ionicons name="globe-outline" size={wp(4)} color="#C8F7D7" /><Text style={styles.homeNumberHubFeatureText}>Choose a destination</Text></View>
              <View style={styles.homeNumberHubFeature}><Ionicons name="chatbubble-ellipses-outline" size={wp(4)} color="#C8F7D7" /><Text style={styles.homeNumberHubFeatureText}>SMS inbox included</Text></View>
            </View>
            <View style={styles.homeNumberHubAction}><Text style={styles.homeNumberHubActionText}>Explore virtual numbers</Text><Ionicons name="chevron-forward" size={wp(4)} color="#0D3826" /></View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ================= NEW BILLS & UTILITIES SECTION ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pay Bills & Utilities</Text>
        </View>

        <View style={styles.billsGrid}>
          <TouchableOpacity style={styles.billItem} activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/(main)/property/bills', params: { tab: 'airtime' } })}>
            <View style={[styles.billIconBg, { backgroundColor: '#030303' }]}>
              <Ionicons name="call-outline" size={wp(5.5)} color="#0284C7" />
            </View>
            <Text style={styles.billLabel}>Airtime</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.billItem} activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/(main)/property/bills', params: { tab: 'data' } })}>
            <View style={[styles.billIconBg, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="wifi-outline" size={wp(5.5)} color="#16A34A" />
            </View>
            <Text style={styles.billLabel}>Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.billItem} activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/(main)/property/bills', params: { tab: 'electricity' } })}>
            <View style={[styles.billIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bulb-outline" size={wp(5.5)} color="#D97706" />
            </View>
            <Text style={styles.billLabel}>Electricity</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.billItem} activeOpacity={0.7} onPress={() => router.push({ pathname: '/(main)/property/bills', params: { tab: 'tv' } })}>
            <View style={[styles.billIconBg, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="tv-outline" size={wp(5.5)} color="#9333EA" />
            </View>
            <Text style={styles.billLabel}>Television</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.billItem} activeOpacity={0.7} onPress={() => router.push({ pathname: '/(main)/property/bills', params: { tab: 'waec' } })}>
            <View style={[styles.billIconBg, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="book-open-page-variant" size={wp(5.5)} color="#B45309" />
            </View>
            <Text style={styles.billLabel}>WAEC</Text>
          </TouchableOpacity>
        </View>

        {/* ================= TRADE GIFT CARDS SECTION ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trade Gift Cards</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => openSeeAll('giftCards')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsGrid}>
          {catalogLoading && catalog.length === 0 ? <CardzipLoader label="Loading gift cards…" compact /> : null}
          {catalogError ? <Text style={styles.txSub}>{catalogError}</Text> : null}
          {!catalogLoading && catalog.length === 0 && !catalogError ? <Text style={styles.txSub}>No gift cards available.</Text> : null}
          {catalog.slice(0, 4).map((card) => renderGiftCard(card))}
        </View>

        {/* ================= RECENT TRANSACTIONS SECTION ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => openSeeAll('transactions')}>
            <Text style={styles.seeAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {transactionsLoading && transactions.length === 0 ? <CardzipLoader label="Loading transactions…" compact /> : null}
        {transactionsError ? <Text style={styles.txSub}>{transactionsError}</Text> : null}
        {!transactionsLoading && transactions.length === 0 && !transactionsError ? <Text style={styles.txSub}>No recent transactions.</Text> : null}
        {transactions.slice(0, 6).map(renderTransaction)}

      </ScrollView>

      <Modal
        visible={seeAllModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSeeAllModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.seeAllModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {seeAllModal === 'giftCards' ? 'All Gift Cards' : 'Recent Transactions'}
              </Text>
              <TouchableOpacity onPress={() => setSeeAllModal(null)} style={styles.modalClose} accessibilityLabel="Close">
                <Ionicons name="close" size={wp(5)} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalList}>
              {seeAllModal === 'giftCards' ? (
                <View style={styles.cardsGrid}>
                  {visibleModalItems.map((item) => 'name' in item ? renderGiftCard(item, true) : null)}
                </View>
              ) : visibleModalItems.map((item) => 'status' in item ? renderTransaction(item) : null)}
              {(seeAllModal === 'giftCards' ? catalogLoading : transactionsLoading) ? (
                <CardzipLoader label="Loading…" compact />
              ) : null}
              {modalItems.length === 0 && !(seeAllModal === 'giftCards' ? catalogLoading : transactionsLoading) && (
                <Text style={styles.modalEmptyText}>
                  {seeAllModal === 'giftCards' ? 'No gift cards are available.' : 'No recent transactions.'}
                </Text>
              )}
            </ScrollView>

            <View style={styles.modalPagination}>
              <TouchableOpacity
                style={[styles.pageButton, seeAllPage === 0 && styles.disabledPageButton]}
                disabled={seeAllPage === 0}
                onPress={() => goToModalPage(Math.max(0, seeAllPage - 1))}
              >
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageNumber}>Page {seeAllPage + 1} of {modalPageCount}</Text>
              <TouchableOpacity
                style={[styles.pageButton, (seeAllPage >= modalPageCount - 1 || catalogLoading || transactionsLoading) && styles.disabledPageButton]}
                disabled={seeAllPage >= modalPageCount - 1 || catalogLoading || transactionsLoading}
                onPress={() => goToModalPage(Math.min(modalPageCount - 1, seeAllPage + 1))}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedTransaction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.transactionDetailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction details</Text>
              <TouchableOpacity onPress={() => setSelectedTransaction(null)} style={styles.modalClose} accessibilityLabel="Close transaction details">
                <Ionicons name="close" size={wp(5)} color="#1F2937" />
              </TouchableOpacity>
            </View>
            {selectedTransaction ? (
              <>
                <View style={styles.transactionDetailStatus}>
                  <View style={[styles.statusDot, { backgroundColor: selectedTransaction.status === 'successful' ? '#047857' : selectedTransaction.status === 'failed' ? '#B91C1C' : '#B45309' }]} />
                  <Text style={styles.transactionDetailStatusText}>{selectedTransaction.status.toUpperCase()}</Text>
                </View>
                <View style={styles.transactionDetailRow}><Text style={styles.transactionDetailLabel}>Transaction type</Text><Text style={styles.transactionDetailValue}>{selectedTransaction.type}</Text></View>
                <View style={styles.transactionDetailRow}><Text style={styles.transactionDetailLabel}>Gift card amount</Text><Text style={styles.transactionDetailValue}>{selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}</Text></View>
                <View style={styles.transactionDetailRow}><Text style={styles.transactionDetailLabel}>Naira value</Text><Text style={styles.transactionDetailValue}>{selectedTransaction.ngnAmount == null ? 'Pending' : formatNaira(selectedTransaction.ngnAmount)}</Text></View>
                {selectedTransaction.exchangeRate != null ? <View style={styles.transactionDetailRow}><Text style={styles.transactionDetailLabel}>Exchange rate</Text><Text style={styles.transactionDetailValue}>{formatNaira(selectedTransaction.exchangeRate)} per {selectedTransaction.currency}</Text></View> : null}
                <View style={styles.transactionDetailRow}><Text style={styles.transactionDetailLabel}>Date</Text><Text style={styles.transactionDetailValue}>{formatTransactionDate(selectedTransaction.createdAt)}</Text></View>
                <Text style={styles.transactionDetailReference}>Transaction ID: {selectedTransaction.id}</Text>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={notificationsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.seeAllModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <View style={styles.notificationHeaderActions}>
                <TouchableOpacity
                  onPress={() => { void markAllNotificationsRead(); }}
                  disabled={unreadNotifications === 0 || updatingNotificationId !== ''}
                  style={[styles.markAllButton, unreadNotifications === 0 && styles.disabledMarkButton]}
                >
                  <Text style={styles.markAllText}>{updatingNotificationId === 'all' ? 'Saving…' : 'Mark all read'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setNotificationsVisible(false)} style={styles.modalClose} accessibilityLabel="Close notifications">
                  <Ionicons name="close" size={wp(5)} color="#1F2937" />
                </TouchableOpacity>
              </View>
            </View>
            {notificationsError ? <Text style={styles.notificationError} accessibilityRole="alert">{notificationsError}</Text> : null}
            {notificationsLoading && notifications.length === 0 ? (
              <CardzipLoader label="Loading your notifications…" />
            ) : notifications.length === 0 ? (
              <Text style={styles.modalEmptyText}>No notifications yet.</Text>
            ) : (
              <ScrollView contentContainerStyle={styles.modalList}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification._id}
                    activeOpacity={0.85}
                    disabled={updatingNotificationId !== ''}
                    style={[styles.notificationRow, !notification.readAt && styles.unreadNotificationRow]}
                    onPress={() => { void openNotification(notification); }}
                  >
                    <View style={styles.txIconContainer}>
                      <MaterialCommunityIcons
                        name={notification.category === 'business_appointment' ? 'calendar-check' : notification.category === 'withdrawal' ? 'bank-transfer' : notification.category === 'bill_payment' ? 'receipt-text-check' : notification.category === 'virtual_number' ? 'sim' : notification.category === 'gift_card' ? 'gift' : 'shopping'}
                        size={wp(5)}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={styles.notificationDetails}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationDate}>{formatTransactionDate(notification.occurredAt)}</Text>
                    </View>
                    {!notification.readAt && <Text style={styles.markReadText}>{updatingNotificationId === notification._id ? '…' : 'Mark read'}</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ================= STYLESHEET =================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F7F3',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4.5),
    paddingBottom: wp(26),
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: wp(2),
    marginBottom: wp(4.5),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#537260',
  },
  userTextContainer: {
    marginLeft: wp(3),
    flex: 1,
    minWidth: 0,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: 'Poppins',
    fontSize: wp(3.3),
    color: '#527461',
    fontWeight: '500',
  },
  waveEmoji: {
    fontFamily: 'Poppins',
    fontSize: wp(3.3),
  },
  userName: {
    fontFamily: 'Poppins',
    fontSize: wp(4.2),
    fontWeight: '700',
    color: '#12291D',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.2),
  },
  historyBtn: {
    minWidth: wp(16),
    height: wp(10.5),
    paddingHorizontal: wp(2.8),
    borderRadius: wp(5.25),
    backgroundColor: '#E7F7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6E8D2',
    flexDirection: 'row',
  },
  historyBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontFamily: 'Poppins',
    fontSize: wp(3),
    marginLeft: 4,
  },
  notificationBtn: {
    width: wp(10.5),
    height: wp(10.5),
    borderRadius: wp(5.25),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE8E2',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },

  /* Balance Card */
balanceCard: {
  borderRadius: wp(5.5),
  padding: wp(5),
  marginBottom: wp(4),
  overflow: 'hidden',
  position: 'relative',
  borderWidth: 1,
  borderColor: 'rgba(190, 255, 210, 0.18)',
  shadowColor: '#073A21',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.16,
  shadowRadius: 14,
  elevation: 5,
},
rightGlow: {
  position: 'absolute',
  top: -wp(8),
  right: -wp(12),
  width: wp(65),
  height: '125%',
  borderRadius: wp(30),
},

topGlow: {
  position: 'absolute',
  top: -wp(12),
  right: wp(5),
  width: wp(55),
  height: wp(45),
  borderRadius: wp(25),
},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceTitle: {
    color: '#C5D9CC',
    fontFamily: 'Poppins',
    fontSize: wp(3.3),
    fontWeight: '500',
    marginLeft: 6,
  },
  badgePercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: wp(2.5),
    paddingVertical: wp(1),
    borderRadius: wp(4),
  },
  badgeText: {
    color: '#D5F3A0',
    fontFamily: 'Poppins',
    fontSize: wp(2.5),
    fontWeight: '700',
    marginLeft: 4,
  },
  balanceAmount: {
    fontFamily: 'Poppins',
    fontSize: wp(8),
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: wp(2.5),
    maxWidth: '100%',
  },
  updatedText: {
    color: '#B3C8B9',
    fontFamily: 'Poppins',
    fontSize: wp(3),
    marginTop: wp(1),
    fontWeight: '400',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: wp(5),
  },
  withdrawBtn: {
    flex: 1,
    backgroundColor: '#159B63',
    borderRadius: wp(3),
    paddingVertical: wp(3),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },
  withdrawText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Poppins',
    fontSize: wp(3.6),
    marginLeft: 6,
  },
  sellBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: wp(3),
    paddingVertical: wp(3),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
  },
  sellText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Poppins',
    fontSize: wp(3.6),
    marginLeft: 6,
  },

  /* Quick Actions Grid */
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(5),
  },
  quickItem: {
    width: wp(21),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    paddingVertical: wp(4),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE9DF',
    shadowColor: '#163D2A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  quickIconContainer: {
    width: wp(11),
    height: wp(11),
    marginBottom: wp(2),
    borderRadius: wp(3.5),
    backgroundColor: '#E5F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: 'Poppins',
    fontSize: wp(2.9),
    fontWeight: '600',
    color: '#1F2937',
  },

  /* Bills & Utilities Grid */
  billsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    columnGap: wp(3),
    marginBottom: wp(5),
  },
  billItem: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    paddingVertical: wp(3),
    marginBottom: wp(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0EAE3',
    shadowColor: '#163D2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  billIconBg: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(1.5),
  },
  billLabel: {
    fontFamily: 'Poppins',
    fontSize: wp(2.8),
    fontWeight: '600',
    color: '#374151',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(3),
    marginTop: wp(2.5),
    paddingBottom: wp(2.2),
    borderBottomWidth: 1,
    borderBottomColor: '#DDEAE0',
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: wp(4.1),
    fontWeight: '700',
    color: '#153426',
  },
  homeSectionSubtitle: { marginTop: -wp(1.5), marginBottom: wp(3), color: '#718078', fontFamily: 'Poppins', fontSize: wp(3), lineHeight: wp(4.5) },
  homeProductRow: { gap: wp(2.5), paddingBottom: wp(3) },
  homeProductCard: { width: wp(40), padding: wp(2.5), borderRadius: wp(3.5), borderWidth: 1, borderColor: '#DFE8E2', backgroundColor: '#FFFFFF', shadowColor: '#163D2A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  homeProductImage: { width: '100%', height: wp(30), borderRadius: wp(2.5), backgroundColor: '#EDF2EE' },
  homeProductImageEmpty: { alignItems: 'center', justifyContent: 'center' },
  homeProductName: { marginTop: wp(2), color: '#153426', fontFamily: 'Poppins', fontSize: wp(3.1), fontWeight: '700' },
  homeProductPrice: { marginTop: wp(1), color: '#087A4C', fontFamily: 'Poppins', fontSize: wp(3.2), fontWeight: '800' },
  homeProductCondition: { marginTop: wp(0.7), color: '#728077', fontFamily: 'Poppins', fontSize: wp(2.6), fontWeight: '600' },
  homePromotionBanner: { minHeight: wp(18), marginBottom: wp(4), paddingHorizontal: wp(3), paddingVertical: wp(2.5), flexDirection: 'row', alignItems: 'center', gap: wp(2.5), borderWidth: 1, borderColor: '#D9C698', borderRadius: wp(2), backgroundColor: '#FFF8E8' },
  homePromotionTag: { width: wp(9), height: wp(7), alignItems: 'center', justifyContent: 'center', borderRadius: wp(1), backgroundColor: '#966519' },
  homePromotionTagText: { color: '#FFFFFF', fontFamily: 'Poppins', fontSize: wp(2.4), fontWeight: '800' },
  homePromotionCopy: { flex: 1, minWidth: 0 },
  homePromotionTitle: { color: '#49381D', fontFamily: 'Poppins', fontSize: wp(3.1), fontWeight: '800' },
  homePromotionSubtitle: { marginTop: wp(0.7), color: '#766442', fontFamily: 'Poppins', fontSize: wp(2.5), lineHeight: wp(3.6) },
  homeNumberHubCard: { overflow: 'hidden', marginTop: wp(2), marginBottom: wp(4), borderRadius: wp(5), shadowColor: '#0B3A25', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.16, shadowRadius: 13, elevation: 4 },
  homeNumberHubGradient: { padding: wp(4.5), borderWidth: 1, borderColor: 'rgba(206, 250, 221, 0.2)', borderRadius: wp(5) },
  homeNumberHubTop: { flexDirection: 'row', alignItems: 'center', gap: wp(2.2) },
  homeNumberHubIcon: { width: wp(11), height: wp(11), alignItems: 'center', justifyContent: 'center', borderRadius: wp(3.5), borderWidth: 1, borderColor: 'rgba(211, 255, 225, 0.24)', backgroundColor: 'rgba(220, 255, 231, 0.12)' },
  homeNumberHubBadge: { flexDirection: 'row', alignItems: 'center', gap: wp(1.5), marginRight: 'auto', paddingHorizontal: wp(2.5), paddingVertical: wp(1.2), borderRadius: wp(5), backgroundColor: 'rgba(220, 255, 231, 0.12)' },
  homeNumberHubDot: { width: wp(1.6), height: wp(1.6), borderRadius: wp(1), backgroundColor: '#8EF0AF' },
  homeNumberHubBadgeText: { color: '#D5F8E0', fontFamily: 'Poppins', fontSize: wp(2.35), fontWeight: '800', letterSpacing: 0.7 },
  homeNumberHubTitle: { marginTop: wp(4), color: '#FFFFFF', fontFamily: 'Poppins', fontSize: wp(5), fontWeight: '800', lineHeight: wp(6.5) },
  homeNumberHubDescription: { marginTop: wp(1.3), color: '#D4E9DC', fontFamily: 'Poppins', fontSize: wp(3), lineHeight: wp(4.6) },
  homeNumberHubFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(2.5), marginTop: wp(3.5) },
  homeNumberHubFeature: { flexDirection: 'row', alignItems: 'center', gap: wp(1.5), paddingHorizontal: wp(2.5), paddingVertical: wp(1.8), borderWidth: 1, borderColor: 'rgba(211, 255, 225, 0.2)', borderRadius: wp(2.5), backgroundColor: 'rgba(7, 31, 21, 0.18)' },
  homeNumberHubFeatureText: { color: '#E3F4E8', fontFamily: 'Poppins', fontSize: wp(2.5), fontWeight: '600' },
  homeNumberHubAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(1.5), marginTop: wp(4), paddingVertical: wp(3), borderRadius: wp(3), backgroundColor: '#D9F9E3' },
  homeNumberHubActionText: { color: '#0D3826', fontFamily: 'Poppins', fontSize: wp(3.1), fontWeight: '800' },
  seeAllText: {
    fontFamily: 'Poppins',
    fontSize: wp(3.3),
    color: '#059669',
    fontWeight: '600',
  },

  /* Gift Cards Grid */
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: wp(3),
  },
  cardBox: {
    width: wp(43.5),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4.5),
    padding: wp(3),
    marginBottom: wp(3.5),
    borderWidth: 1,
    borderColor: '#DFE8E2',
    shadowColor: '#163D2A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  cardHeaderBanner: {
    borderRadius: wp(3),
    padding: wp(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(3),
  },
  cardTitleBox: {
    marginLeft: wp(2.5),
  },
  giftCardLogoImage: {
    width: wp(8),
    height: wp(8),
  },
  cardFallbackLogo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: wp(5.5),
    fontWeight: '800',
    textAlign: 'center',
  },
  googleFallbackLogo: {
    color: '#4285F4',
  },
  robloxFallbackLogo: {
    color: '#E2231A',
  },
  cardBrand: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Poppins',
    fontSize: wp(3.3),
  },
  cardSub: {
    color: '#9CA3AF',
    fontFamily: 'Poppins',
    fontSize: wp(2.5),
  },
  sephoraIcon: {
    color: '#EC4899',
    fontFamily: 'Poppins',
    fontSize: wp(5.5),
    fontWeight: '900',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateBadge: {
    backgroundColor: '#E7F7ED',
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
    borderRadius: wp(1.5),
  },
  rateText: {
    fontFamily: 'Poppins',
    fontSize: wp(2.6),
    fontWeight: '700',
    color: '#059669',
  },
  changeText: {
    fontFamily: 'Poppins',
    fontSize: wp(2.8),
    fontWeight: '700',
  },

  /* Recent Transactions */
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    padding: wp(3.5),
    marginBottom: wp(3),
    borderWidth: 1,
    borderColor: '#DFE8E2',
    shadowColor: '#163D2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  txIconContainer: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  txDetails: {
    flex: 1,
    marginLeft: wp(3),
  },
  txTitle: {
    fontFamily: 'Poppins',
    fontSize: wp(3.6),
    fontWeight: '700',
    color: '#111827',
  },
  txSub: {
    fontFamily: 'Poppins',
    fontSize: wp(3),
    color: '#9CA3AF',
    marginTop: 2,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: 'Poppins',
    fontSize: wp(3.8),
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: wp(0.8),
    borderRadius: wp(3),
  },
  statusDot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    marginRight: 4,
  },
  statusText: {
    fontFamily: 'Poppins',
    fontSize: wp(2.5),
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(4),
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  seeAllModal: {
    maxHeight: '84%',
    backgroundColor: '#F5F7F8',
    borderRadius: wp(4),
    padding: wp(4),
  },
  transactionDetailsModal: { width: '100%', maxWidth: 420, padding: wp(5), borderRadius: wp(4), backgroundColor: '#FFFFFF' },
  transactionDetailStatus: { marginBottom: wp(3), paddingHorizontal: wp(3), paddingVertical: wp(2), flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: wp(2), borderRadius: wp(4), backgroundColor: '#F1F6F2' },
  transactionDetailStatusText: { color: '#33473B', fontSize: wp(2.8), fontWeight: '800' },
  transactionDetailRow: { minHeight: wp(11), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp(3), borderBottomWidth: 1, borderBottomColor: '#EDF1EE' },
  transactionDetailLabel: { color: '#64746A', fontSize: wp(3), fontWeight: '600' },
  transactionDetailValue: { flex: 1, color: '#14231C', fontSize: wp(3.1), fontWeight: '700', textAlign: 'right' },
  transactionDetailReference: { marginTop: wp(4), color: '#849188', fontSize: wp(2.6) },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: wp(3),
  },
  modalTitle: {
    color: '#111827',
    fontFamily: 'Poppins',
    fontSize: wp(4.2),
    fontWeight: '700',
  },
  modalClose: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalList: {
    paddingBottom: wp(2),
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: wp(2),
  },
  unreadNotificationRow: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  notificationHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
  markAllButton: {
    minHeight: wp(8),
    paddingHorizontal: wp(2.5),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },
  markAllText: { color: '#047857', fontSize: wp(2.9), fontWeight: '700' },
  disabledMarkButton: { opacity: 0.5 },
  notificationMessage: { marginTop: 3, color: '#475569', fontSize: wp(3), lineHeight: wp(4) },
  notificationDate: { marginTop: 4, color: '#94A3B8', fontSize: wp(2.7) },
  markReadText: { color: '#047857', fontSize: wp(2.7), fontWeight: '700' },
  notificationError: { marginBottom: wp(2), color: '#B91C1C', fontSize: wp(3), lineHeight: wp(4) },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    color: '#111827',
    fontFamily: 'Poppins',
    fontSize: wp(3.4),
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  modalCardBox: {
    width: '47%',
  },
  modalEmptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins',
    fontSize: wp(3.4),
    paddingVertical: wp(8),
    textAlign: 'center',
  },
  modalPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: wp(3),
    marginTop: wp(2),
  },
  pageButton: {
    minWidth: wp(21),
    alignItems: 'center',
    paddingVertical: wp(2.2),
    paddingHorizontal: wp(2.5),
    backgroundColor: '#059669',
    borderRadius: wp(2),
  },
  disabledPageButton: {
    opacity: 0.45,
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: wp(3),
    fontWeight: '700',
  },
  pageNumber: {
    color: '#374151',
    fontFamily: 'Poppins',
    fontSize: wp(3),
    fontWeight: '600',
  },
});