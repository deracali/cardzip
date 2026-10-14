import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Scaling helpers for responsive sizing across different screens
const guidelineBaseWidth = 375;
const scale = (size: number) => (width / guidelineBaseWidth) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export type TabType = 'Home' | 'Cart' | 'Orders';

export interface TabItem {
  key: TabType;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

export interface BottomTabBarProps {
  activeTab?: TabType;
  cartCount?: number;
  onTabPress?: (tab: TabType) => void;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_TABS: TabItem[] = [
  { key: 'Home', label: 'Home', icon: 'home' },
  { key: 'Cart', label: 'Cart', icon: 'shopping-bag' },
  { key: 'Orders', label: 'Orders', icon: 'file-text' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab = 'Cart',
  cartCount = 2,
  onTabPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.tabRow}>
        {DEFAULT_TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          if (isActive) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.activePill}
                onPress={() => onTabPress?.(tab.key)}
                activeOpacity={0.8}
              >
                <Feather name={tab.icon} size={scale(16)} color="#10B981" />
                <Text style={styles.activeLabel}>{tab.label}</Text>
                {tab.key === 'Cart' && cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.inactiveTab}
              onPress={() => onTabPress?.(tab.key)}
              activeOpacity={0.7}
            >
              <Feather name={tab.icon} size={scale(18)} color="#64748B" />
              <Text style={styles.inactiveLabel}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* iOS Home Bar Indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#070C16',
    paddingTop: scale(10),
    paddingBottom: scale(12),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: scale(20),
  },
  inactiveTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
  },
  inactiveLabel: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#94A3B8',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: scale(16),
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: scale(8),
  },
  activeLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    color: '#0F172A',
  },
  homeIndicator: {
    width: scale(120),
    height: scale(4),
    backgroundColor: '#1E293B',
    borderRadius: scale(2),
    marginTop: scale(12),
  },
});