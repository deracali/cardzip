import React, { useEffect, useState } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchCurrentAdApi, trackAdCampaignEventApi } from '../services/api/advertisementApi';
import { getCampaignAnalyticsVisitorId } from '../services/campaignAnalytics';

const optimizeImageUrl = (uri: string) => {
  if (!uri) return uri;
  const cleanUri = uri.trim();
  if (!/^https?:\/\//i.test(cleanUri)) return cleanUri;
  try {
    const url = new URL(cleanUri);
    url.searchParams.set('q', '80');
    url.searchParams.set('w', '900');
    return url.toString();
  } catch {
    const separator = cleanUri.includes('?') ? '&' : '?';
    return `${cleanUri}${separator}q=80&w=900`;
  }
};

export default function AdvertisementBanner({ placementKey }: { placementKey: string }) {
  const router = useRouter();
  const [ad, setAd] = useState<Awaited<ReturnType<typeof fetchCurrentAdApi>>>(null);

  useEffect(() => {
    let active = true;
    fetchCurrentAdApi(placementKey)
      .then((result) => { if (active) setAd(result); })
      .catch((error: unknown) => console.error(`Could not load ${placementKey} advertisement:`, error));
    return () => { active = false; };
  }, [placementKey]);

  useEffect(() => {
    if (!ad?._id) return;
    getCampaignAnalyticsVisitorId()
      .then((visitorId) => trackAdCampaignEventApi(ad._id, 'impression', visitorId))
      .catch((error: unknown) => console.error('Could not record advertisement impression:', error));
  }, [ad?._id]);

  const handleAdClick = () => {
    if (ad?._id && ad.destinationUrl) {
      getCampaignAnalyticsVisitorId()
        .then((visitorId) => trackAdCampaignEventApi(ad._id, 'click', visitorId))
        .catch((error: unknown) => console.error('Could not record advertisement click:', error));
    }
    if (ad?.destinationUrl) void Linking.openURL(ad.destinationUrl);
  };

  if (!ad?.imageUrl) {
    return (
      <TouchableOpacity
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel="Advertise your business in this Cardzip banner placement"
        onPress={() => router.push('/(main)/market/advertise' as never)}
        style={{ minHeight: 116, marginVertical: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 14, borderWidth: 1, borderColor: '#CFE8D7', backgroundColor: '#F2FAF5' }}
      >
        <View style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#FFFFFF' }}>
          <Feather name="speaker" size={20} color="#087A4C" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>FEATURED ADVERTISEMENT</Text>
          <Text style={{ marginTop: 5, color: '#14251B', fontSize: 15, fontWeight: '800' }}>Your business could be here</Text>
          <Text style={{ marginTop: 4, color: '#64746A', fontSize: 10, lineHeight: 15 }}>Promote your brand with a Cardzip banner.</Text>
          <Text style={{ marginTop: 6, color: '#087A4C', fontSize: 10, fontWeight: '800' }}>Explore ad placements  →</Text>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      accessibilityRole="link"
      accessibilityLabel={`Sponsored: ${ad.title}`}
      onPress={handleAdClick}
      style={{ overflow: 'hidden', marginVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#DCE8E0', backgroundColor: '#FFFFFF' }}
    >
      <Image source={{ uri: optimizeImageUrl(ad.imageUrl) }} style={{ width: '100%', height: 142, backgroundColor: '#EDF4EF' }} resizeMode="cover" />
      <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>SPONSORED</Text>
          <Text numberOfLines={1} style={{ marginTop: 4, color: '#14251B', fontSize: 14, fontWeight: '800' }}>{ad.title}</Text>
          <Text numberOfLines={2} style={{ marginTop: 3, color: '#64746A', fontSize: 11, lineHeight: 16 }}>{ad.copy}</Text>
        </View>
        <Feather name="arrow-up-right" size={18} color="#087A4C" />
      </View>
    </TouchableOpacity>
  );
}
