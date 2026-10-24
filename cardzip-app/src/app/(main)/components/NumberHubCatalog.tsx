import React, { useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NumberHubOption, RentalDuration, RentalPricing } from '../../../services/api/numberHubApi';

type NumberHubCatalogProps = {
  selectedRegion: string;
  selectedService: string;
  selectedDuration: string;
  areas: NumberHubOption[];
  apps: NumberHubOption[];
  durations: RentalDuration[];
  pricing: RentalPricing | null;
  walletBalance: number;
  walletCurrency: string;
  walletLoading: boolean;
  walletEnabled: boolean;
  pricingLoading: boolean;
  durationLoading: boolean;
  loading: boolean;
  purchasing: boolean;
  error: string | null;
  onSelectRegion: (region: string) => void;
  onSelectService: (service: string) => void;
  onSelectDuration: (duration: string) => void;
  onRent: () => void;
  styles: any;
  colors: any;
};

export default function NumberHubCatalog({
  selectedRegion,
  selectedService,
  selectedDuration,
  areas,
  apps,
  durations,
  pricing,
  walletBalance,
  walletCurrency,
  walletLoading,
  walletEnabled,
  pricingLoading,
  durationLoading,
  loading,
  purchasing,
  error,
  onSelectRegion,
  onSelectService,
  onSelectDuration,
  onRent,
  styles,
  colors,
}: NumberHubCatalogProps) {
  const [serviceSearch, setServiceSearch] = useState('');
  const selectedArea = areas.find((area) => area.value === selectedRegion) ?? areas[0];
  const isUnitedStates = /united states|^usa$/i.test(selectedArea?.label ?? '')
    || selectedArea?.code?.toUpperCase() === 'US';
  const selectedAreaFlag = isUnitedStates
    ? '🇺🇸'
    : selectedArea?.code ?? selectedArea?.label.slice(0, 2).toUpperCase() ?? '--';
  const selectedApp = apps.find((app) => app.value === selectedService) ?? apps[0];
  const selectedDurationOption = durations.find((duration) => duration.value === selectedDuration) ?? durations[0];
  const otherAreas = areas.filter((area) => area.value !== selectedArea?.value).slice(0, 2);
  const preferredServices = ['whatsapp', 'telegram', 'google', 'razorpay', 'opay', 'palmpay', 'moniepoint', 'paystack', 'flutterwave', 'walmart', 'woocommerce', 'jumia', 'konga', 'amazon', 'facebook', 'instagram', 'tiktok', 'bolt', 'uber'];
  const visibleApps = apps
    .filter((app) => `${app.label} ${app.value}`.toLowerCase().includes(serviceSearch.trim().toLowerCase()))
    .sort((first, second) => {
      const firstIndex = preferredServices.indexOf(first.value.toLowerCase());
      const secondIndex = preferredServices.indexOf(second.value.toLowerCase());
      return (firstIndex < 0 ? Number.MAX_SAFE_INTEGER : firstIndex) - (secondIndex < 0 ? Number.MAX_SAFE_INTEGER : secondIndex);
    });
  const formatPrice = (price?: number, isLoading = false) => isLoading
    ? 'Loading price...'
    : price === undefined ? 'Price unavailable' : `₦${price.toLocaleString('en-NG')}`;
  const walletCanCoverRental = pricing ? walletBalance >= pricing.price : null;
  const walletAmount = `${walletCurrency === 'NGN' ? '₦' : `${walletCurrency} `}${walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <View style={[styles.sectionContainer, { alignItems: 'center', justifyContent: 'center', minHeight: 260 }]}>
        <ActivityIndicator size="large" color={colors.accentGreen} />
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Loading store catalog…</Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Select Region / Country</Text>

      <TouchableOpacity
        style={[styles.countryCardLarge, selectedArea && styles.countryCardSelected]}
        disabled={!selectedArea}
        onPress={() => selectedArea && onSelectRegion(selectedArea.value)}
      >
        <View style={styles.flagCircle}>
          <Text style={[styles.flagText, isUnitedStates && { fontSize: 22 }]}>{selectedAreaFlag}</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.countryName}>{selectedArea?.label ?? (loading ? 'Loading destinations...' : 'No destinations available')}</Text>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{selectedArea?.code ?? selectedArea?.value ?? '--'}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View style={styles.greenDot} />
            <Text style={styles.availText}>{selectedArea?.available === undefined ? 'Availability from provider' : `${selectedArea.available} numbers available`}</Text>
          </View>
        </View>

        {selectedArea && <Ionicons name="checkmark-circle" size={22} color={colors.accentGreen} />}
      </TouchableOpacity>

      <View style={styles.countryRow}>
        {otherAreas.map((area) => (
          <TouchableOpacity key={area.value} style={styles.countryCardSmall} onPress={() => onSelectRegion(area.value)}>
            <Text style={styles.flagTextSmall}>{area.code ?? area.label.slice(0, 2).toUpperCase()}</Text>
            <View style={{ marginLeft: 6 }}>
              <Text style={styles.countrySmallName} numberOfLines={1}>{area.label}</Text>
              <Text style={styles.smallAvail}>{area.available === undefined ? 'Available' : `${area.available} left`}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.countryCardSmall}>
          <Text style={styles.moreCountryText}>+{Math.max(0, areas.length - otherAreas.length - (selectedArea ? 1 : 0))} more  ›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Select Target Service</Text>

      <TextInput
        value={serviceSearch}
        onChangeText={setServiceSearch}
        placeholder="Search services (WhatsApp, Telegram, Google...)"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        style={styles.serviceSearchInput}
      />

      <TouchableOpacity
        style={[styles.serviceCardLarge, selectedApp && styles.serviceCardSelected]}
        disabled={!selectedApp}
        onPress={() => selectedApp && onSelectService(selectedApp.value)}
      >
        <View style={styles.whatsappCircle}>
          {selectedApp?.value.includes('whatsapp')
            ? <FontAwesome5 name="whatsapp" size={22} color="#FFFFFF" />
            : <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{selectedApp?.label.slice(0, 1).toUpperCase() ?? '?'}</Text>}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.serviceNameDark} numberOfLines={1}>{selectedApp?.label ?? (loading ? 'Loading services...' : 'No services available')}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>LIVE PRICING</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            {pricingLoading && <ActivityIndicator size="small" color={colors.accentGreen} />}
            <Text style={styles.priceNaira}>{formatPrice(pricing?.price, pricingLoading)}</Text>
            {pricing?.originalPrice !== undefined && <Text style={styles.strikePrice}>{formatPrice(pricing.originalPrice)}</Text>}
            {pricing?.currency && pricing.currency !== 'NGN' && <Text style={styles.priceUsd}>{pricing.currency}</Text>}
          </View>
        </View>

        {selectedApp && <Ionicons name="checkmark-circle" size={22} color={colors.accentGreen} />}
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.serviceRow}
        contentContainerStyle={styles.serviceRowContent}
      >
        {visibleApps.filter((app) => app.value !== selectedApp?.value).map((app) => (
          <TouchableOpacity key={app.value} style={styles.servicePill} onPress={() => onSelectService(app.value)}>
            <Text style={styles.servicePillText} numberOfLines={1}>{app.label}</Text>
          </TouchableOpacity>
        ))}
        {visibleApps.length === 0 && <Text style={styles.availText}>No matching services</Text>}
      </ScrollView>

      <Text style={styles.sectionTitle}>Rental Duration</Text>

      <View style={styles.durationRow}>
        {durationLoading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }}>
            <ActivityIndicator size="small" color={colors.accentGreen} />
            <Text style={styles.availText}>Loading durations...</Text>
          </View>
        ) : durations.slice(0, 3).map((duration, index) => {
          const isSelected = selectedDuration === duration.value;
          return (
            <TouchableOpacity
              key={duration.value}
              style={[styles.durationCard, isSelected ? styles.durationSelected : styles.durationUnselected]}
              onPress={() => onSelectDuration(duration.value)}
            >
              {index === 2 && <View style={styles.bestBadge}><Text style={styles.bestBadgeText}>BEST</Text></View>}
              <Text style={[isSelected ? styles.durationTitle : styles.durationTitleDark, isSelected && { color: colors.accentGreen }]} numberOfLines={1}>{duration.label}</Text>
              <Text style={[isSelected ? styles.durationPrice : styles.durationPriceDark, isSelected && { color: '#FFFFFF' }]}>
                {formatPrice(duration.price ?? (isSelected ? pricing?.price : undefined), isSelected && pricingLoading)}
              </Text>
              {isSelected
                ? <View style={styles.selectedPill}><View style={styles.selectedDot} /><Text style={styles.selectedText}>Selected</Text></View>
                : <Text style={styles.saveText}>{duration.time} month{duration.time === 1 ? '' : 's'}</Text>}
            </TouchableOpacity>
          );
        })}
        {!durationLoading && durations.length === 0 && <Text style={styles.availText}>No rental durations available</Text>}
      </View>

      {error && <Text style={[styles.sectionTitle, { color: colors.warningRedText }]}>{error}</Text>}

      <TouchableOpacity style={styles.rentButton} onPress={onRent} disabled={purchasing || !selectedApp || !selectedDuration}>
        <Text style={styles.rentButtonText}>{purchasing ? 'Processing...' : `Rent Number (${formatPrice(pricing?.price, pricingLoading)})`}</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      <View style={styles.walletBalanceRow}>
        <Ionicons name="wallet-outline" size={13} color={colors.textMuted} />
        <Text style={styles.walletBalanceText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
          {!walletEnabled ? ' Sign in to view your wallet balance' : walletLoading ? ' Loading wallet balance' : ` Wallet ${walletAmount}`}
          {walletEnabled && !walletLoading && (pricingLoading ? ' • Checking price' : walletCanCoverRental === null ? '' : walletCanCoverRental ? ' • Sufficient balance' : ' • Insufficient balance')}
        </Text>
      </View>
    </View>
  );
}
