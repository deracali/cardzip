import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useAppSelector } from '../../../../store';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;
const moderateScale = (size: number) => size + (scale(size) - size) * 0.5;

type MarketTab = 'App Home' | 'Store' | 'Cart' | 'Orders';

const tabs: { key: MarketTab; icon: keyof typeof Feather.glyphMap; route: Href }[] = [
  { key: 'App Home', icon: 'grid', route: '/(main)/(tabs)/home' },
  { key: 'Store', icon: 'home', route: '/(main)/(tabs)/store' },
  { key: 'Cart', icon: 'shopping-cart', route: '/(main)/market/cart' },
  { key: 'Orders', icon: 'file-text', route: '/(main)/market/orders' },
];

interface MarketBottomTabProps {
  activeTab: MarketTab;
}

export default function MarketBottomTab({ activeTab }: MarketBottomTabProps) {
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => router.replace(tab.route)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={tab.key}
            accessibilityState={{ selected: active }}
          >
            <View style={styles.iconWrap}>
              <Feather name={tab.icon} size={scale(18)} color={active ? '#059669' : '#64748B'} />
              {tab.key === 'Cart' && cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
              {tab.key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: scale(8),
    paddingVertical: scale(10),
    marginHorizontal: scale(16),
    borderRadius: scale(20),
  },
  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
    paddingVertical: scale(3),
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#64748B',
    fontFamily: 'Poppins',
    fontSize: moderateScale(10),
    fontWeight: '500',
  },
  activeLabel: {
    color: '#047857',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -scale(6),
    right: -scale(11),
    minWidth: scale(15),
    height: scale(15),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(3),
    borderRadius: scale(8),
    backgroundColor: '#059669',
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: moderateScale(8),
    fontWeight: '700',
  },
});
