import React, { useEffect, useState } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchCurrentAdApi, trackAdCampaignEventApi } from '../services/api/advertisementApi';
import { getCampaignAnalyticsVisitorId } from '../services/campaignAnalytics';

const fallbackCampaigns = [
  {
    image: require('../../assets/ad-banners/business.jpg'),
    eyebrow: 'GROW YOUR BUSINESS',
    title: 'Your next customer is already browsing.',
    copy: 'Open a Cardzip business shop and put your products in front of more customers.',
    action: 'Explore business shops',
    destination: '/(main)/market/business',
    imageAlt: 'Small business owners collaborating at a table',
  },
  {
    image: require('../../assets/ad-banners/community.jpg'),
    eyebrow: 'CARDZIP COMMUNITY',
    title: 'Find your people. Build your community.',
    copy: 'Discover community listings, local services, and new ways to connect.',
    action: 'Explore the community',
    destination: '/market/community',
    imageAlt: 'People coming together at a community event',
  },
  {
    image: require('../../assets/ad-banners/digital.jpg'),
    eyebrow: 'WEBSITES & APPS',
    title: 'Discover your next digital project.',
    copy: 'Browse websites, apps, and source-code templates with secure downloads.',
    action: 'Browse websites & apps',
    destination: '/(main)/market/digital-assets',
    imageAlt: 'A laptop displaying a web development workspace',
  },
];

const getInitialCampaignIndex = (placementKey: string) => {
  if (placementKey.includes('market')) return 2;
  if (placementKey.includes('home')) return 1;
  return 0;
};

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
  const [fallbackIndex, setFallbackIndex] = useState(() => getInitialCampaignIndex(placementKey));

  useEffect(() => {
    let active = true;
    fetchCurrentAdApi(placementKey)
      .then((result) => { if (active) setAd(result); })
      .catch((error: unknown) => console.error(`Could not load ${placementKey} advertisement:`, error));
    return () => { active = false; };
  }, [placementKey]);

  useEffect(() => {
    if (ad?.imageUrl) return undefined;
    const timer = setInterval(() => {
      setFallbackIndex((current) => (current + 1) % fallbackCampaigns.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [ad?.imageUrl]);

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
    const campaign = fallbackCampaigns[fallbackIndex];
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        accessibilityRole="link"
        accessibilityLabel={`${campaign.eyebrow}: ${campaign.title}`}
        onPress={() => router.push(campaign.destination as never)}
        style={{ overflow: 'hidden', marginVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#DCE8E0', backgroundColor: '#FFFFFF' }}
      >
        <Image source={campaign.image} accessibilityLabel={campaign.imageAlt} style={{ width: '100%', height: 142, backgroundColor: '#EDF4EF' }} resizeMode="cover" />
        <View style={{ padding: 12 }}>
          <Text style={{ color: '#087A4C', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>{campaign.eyebrow}</Text>
          <Text style={{ marginTop: 4, color: '#14251B', fontSize: 15, fontWeight: '800' }}>{campaign.title}</Text>
          <Text style={{ marginTop: 4, color: '#64746A', fontSize: 11, lineHeight: 16 }}>{campaign.copy}</Text>
          <Text style={{ marginTop: 7, color: '#087A4C', fontSize: 11, fontWeight: '800' }}>{campaign.action}  →</Text>
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
