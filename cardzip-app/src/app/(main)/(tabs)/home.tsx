import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchGiftCards, fetchGiftCardTrades } from '../../store/slices/giftCardSlice';
import { fetchWalletBalance } from '../../store/slices/walletSlice';
import { GiftCard, GiftCardTrade } from '../../types/giftCard';
import CardzipLoader from '../../../components/CardzipLoader';
import {
  fetchNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  UserNotification,
} from '../../services/api/notificationApi';


// Screen Dimensions for responsiveness
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive helper function based on a standard 375px screen width
const wp = (percentage: number): number => {
  return (percentage * SCREEN_WIDTH) / 100;
};

const giftCardLogoDomains: Record<string, string> = {
  amazon: 'amazon.com',
  apple: 'apple.com',
  itunes: 'apple.com',
  googleplay: 'play.google.com',
  google: 'google.com',
  steam: 'steampowered.com',
  xbox: 'xbox.com',
  playstation: 'playstation.com',
  sonyplaystation: 'playstation.com',
  psn: 'playstation.com',
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  sephora: 'sephora.com',
  walmart: 'walmart.com',
  target: 'target.com',
  nike: 'nike.com',
  adidas: 'adidas.com',
  razer: 'razer.com',
  goldrazer: 'razer.com',
  goldrazor: 'razer.com',
  nintendo: 'nintendo.com',
  roblox: 'roblox.com',
  riotgames: 'riotgames.com',
  epicgames: 'epicgames.com',
  twitch: 'twitch.tv',
  disneyplus: 'disneyplus.com',
  disney: 'disney.com',
  footlocker: 'footlocker.com',
};

const getGiftCardLogoUrls = (name: string, catalogLogo?: string): string[] => {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matchedBrand = Object.keys(giftCardLogoDomains).find((brand) => normalizedName.includes(brand));
  const domain = matchedBrand ? giftCardLogoDomains[matchedBrand] : null;
  const onlineLogo = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null;
  return [onlineLogo, catalogLogo].filter((url): url is string => Boolean(url));
};

export default function HomeScreen() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [seeAllModal, setSeeAllModal] = useState<'giftCards' | 'transactions' | null>(null);
  const [seeAllPage, setSeeAllPage] = useState(0);
  const [failedGiftCardLogos, setFailedGiftCardLogos] = useState<Record<string, string[]>>({});
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [updatingNotificationId, setUpdatingNotificationId] = useState('');
  const dispatch = useAppDispatch();
  const { token, user, sessionReady } = useAppSelector((state) => state.auth);
  const notificationsEnabled = useAppSelector((state) => state.preferences.notificationsEnabled);
  const { balance } = useAppSelector((state) => state.wallet);
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
    if (brand.includes('goldrazer')) return '#171717';
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
    if (brand.includes('goldrazer')) return <FontAwesome5 name="coins" size={wp(5.5)} color="#D4AF37" />;
    if (brand.includes('sephora')) return <Text style={styles.sephoraIcon}>S</Text>;
    if (brand.includes('facebook')) return <FontAwesome5 name="facebook" size={wp(6)} color="#1877F2" />;
    if (brand.includes('instagram')) return <FontAwesome5 name="instagram" size={wp(6)} color="#E4405F" />;
    if (brand.includes('walmart')) return <FontAwesome5 name="shopping-basket" size={wp(5.5)} color="#FFC220" />;
    if (brand.includes('google')) return <FontAwesome5 name="google" size={wp(6)} color="#4285F4" />;
    if (brand.includes('netflix')) return <FontAwesome5 name="netflix" size={wp(6)} color="#E50914" />;
    if (brand.includes('playstation')) return <FontAwesome5 name="playstation" size={wp(6)} color="#FFFFFF" />;
    if (brand.includes('xbox')) return <FontAwesome5 name="xbox" size={wp(6)} color="#107C10" />;
    return <MaterialCommunityIcons name="card-account-details-outline" size={wp(6)} color="#D1D5DB" />;
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
      <View key={transaction.id} style={styles.txCard}>
        <View style={[styles.txIconContainer, { backgroundColor: '#10B981' }]}>
          <MaterialCommunityIcons name="shopping" size={wp(5.5)} color="#FFFFFF" />
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F8" translucent={false} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER SECTION ================= */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
              }}
              style={styles.avatar}
            />
            <View style={styles.userTextContainer}>
              <View style={styles.greetingRow}>
                <Text style={styles.greetingText}>Good morning</Text>
                <Text style={styles.waveEmoji}> 👋</Text>
              </View>
              <Text style={styles.userName}>{user?.name ?? (sessionReady ? 'Your account' : 'Cardzip account')}</Text>
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
        name="arrow-up"
        size={wp(3)}
        color="#00E676"
      />
      <Text style={styles.badgeText}>12.5%</Text>
    </View>
  </View>

  <Text style={styles.balanceAmount}>
    {balanceVisible ? `₦${balance.toLocaleString('en-US')}.00` : '₦ ••••••••'}
  </Text>

  <Text style={styles.updatedText}>
    ≈ $701.20 · Updated Just now
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

          <TouchableOpacity style={styles.quickItem} activeOpacity={0.7}>
            <View style={styles.quickIconContainer}>
              <Ionicons name="gift-outline" size={wp(5.5)} color="#10B981" />
            </View>
            <Text style={styles.quickLabel}>Buy Gift</Text>
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

          <TouchableOpacity style={styles.billItem} activeOpacity={0.7} onPress={() => router.push({ pathname: '/(main)/property/bills', params: { tab: 'jamb' } })}>
            <View style={[styles.billIconBg, { backgroundColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="school-outline" size={wp(5.5)} color="#0369A1" />
            </View>
            <Text style={styles.billLabel}>JAMB</Text>
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
        {transactions.slice(0, 3).map(renderTransaction)}

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
                    disabled={Boolean(notification.readAt) || updatingNotificationId !== ''}
                    style={[styles.notificationRow, !notification.readAt && styles.unreadNotificationRow]}
                    onPress={() => { void markNotificationRead(notification); }}
                  >
                    <View style={styles.txIconContainer}>
                      <MaterialCommunityIcons
                        name={notification.category === 'withdrawal' ? 'bank-transfer' : notification.category === 'bill_payment' ? 'receipt-text-check' : notification.category === 'virtual_number' ? 'sim' : notification.category === 'gift_card' ? 'gift' : 'shopping'}
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
    backgroundColor: '#F5F7F8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4.5),
    paddingBottom: wp(8),
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
  },
  avatar: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
  },
  userTextContainer: {
    marginLeft: wp(3),
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: wp(3.3),
    color: '#6B7280',
    fontWeight: '400',
  },
  waveEmoji: {
    fontSize: wp(3.3),
  },
  userName: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#EAFBF3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B7F0D3',
    flexDirection: 'row',
  },
  historyBtnText: {
    color: '#0F172A',
    fontWeight: '700',
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
    borderColor: '#E5E7EB',
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
  borderRadius: wp(5),
  padding: wp(4.5),
  marginBottom: wp(4),
  overflow: 'hidden',
  position: 'relative',
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
    color: '#9CA3AF',
    fontSize: wp(3.3),
    fontWeight: '500',
    marginLeft: 6,
  },
  badgePercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: wp(2.5),
    paddingVertical: wp(1),
    borderRadius: wp(4),
  },
  badgeText: {
    color: '#00E676',
    fontSize: wp(3.1),
    fontWeight: '600',
    marginLeft: 2,
  },
  balanceAmount: {
    fontSize: wp(8),
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: wp(2.5),
  },
  updatedText: {
    color: '#6B7280',
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
    backgroundColor: '#059669',
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
    fontSize: wp(3.6),
    marginLeft: 6,
  },
  sellBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    borderRadius: wp(3.5),
    paddingVertical: wp(3.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickIconContainer: {
    marginBottom: wp(2),
  },
  quickLabel: {
    fontSize: wp(2.9),
    fontWeight: '600',
    color: '#1F2937',
  },

  /* Bills & Utilities Grid */
  billsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: wp(5),
  },
  billItem: {
    width: wp(28),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3.5),
    paddingVertical: wp(3),
    marginBottom: wp(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    fontSize: wp(2.8),
    fontWeight: '600',
    color: '#374151',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(3.5),
    marginTop: wp(1),
  },
  sectionTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
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
    borderRadius: wp(4),
    padding: wp(3),
    marginBottom: wp(3.5),
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  cardBrand: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: wp(3.3),
  },
  cardSub: {
    color: '#9CA3AF',
    fontSize: wp(2.5),
  },
  sephoraIcon: {
    color: '#EC4899',
    fontSize: wp(5.5),
    fontWeight: '900',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
    borderRadius: wp(1.5),
  },
  rateText: {
    fontSize: wp(2.6),
    fontWeight: '700',
    color: '#059669',
  },
  changeText: {
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
    borderColor: '#E5E7EB',
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
    fontSize: wp(3.6),
    fontWeight: '700',
    color: '#111827',
  },
  txSub: {
    fontSize: wp(3),
    color: '#9CA3AF',
    marginTop: 2,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: wp(3),
  },
  modalTitle: {
    color: '#111827',
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
    fontSize: wp(3.4),
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  modalCardBox: {
    width: '47%',
  },
  modalEmptyText: {
    color: '#6B7280',
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
    fontSize: wp(3),
    fontWeight: '700',
  },
  pageNumber: {
    color: '#374151',
    fontSize: wp(3),
    fontWeight: '600',
  },
});