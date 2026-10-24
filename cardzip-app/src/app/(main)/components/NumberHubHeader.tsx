import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NumberHubHeaderProps = {
  activeTab: 'catalog' | 'rentals' | 'inbox';
  onTabChange: (tab: 'catalog' | 'rentals' | 'inbox') => void;
  styles: any;
  activeRentalCount: number;
};

export default function NumberHubHeader({
  activeTab,
  onTabChange,
  styles,
  activeRentalCount,
}: NumberHubHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerTitleRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>CARDZIP Number Hub</Text>
        </View>

        <View style={styles.ratePill}>
          <View style={styles.rateDot} />
          <Text style={styles.rateText}>Rate: ₦1,600/$</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'catalog' && styles.tabButtonActive]}
          onPress={() => onTabChange('catalog')}
        >
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.tabTextActive]}>
            Store Catalog
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'rentals' && styles.tabButtonActive]}
          onPress={() => onTabChange('rentals')}
        >
          <Text style={[styles.tabText, activeTab === 'rentals' && styles.tabTextActive]}>
            Active Rentals ({activeRentalCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'inbox' && styles.tabButtonActive]}
          onPress={() => onTabChange('inbox')}
        >
          <Text style={[styles.tabText, activeTab === 'inbox' && styles.tabTextActive]}>
            SMS Inbox
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
