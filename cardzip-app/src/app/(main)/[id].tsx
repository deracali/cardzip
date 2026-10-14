import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Octicons, Feather } from '@expo/vector-icons';

const keyFeatures = [
  '4 Bedrooms / 3.5 Bathrooms',
  '2,840 sq ft of living space',
  'Chef-inspired kitchen with honed quartz countertops',
  'Wide-plank white oak flooring throughout',
  'Breathtaking mountain views',
  'Fully paid-off home solar system',
  'Attached 2-car garage with EV charging',
];

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [selectedTab, setSelectedTab] = useState('1. Details & Upload');
  const [selectedTone, setSelectedTone] = useState('Luxury');

  // Form states initialized with item dynamic context
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [price, setPrice] = useState('$850,000');
  const [beds, setBeds] = useState('4');
  const [baths, setBaths] = useState('3.5');
  const [sqft, setSqft] = useState('2,840');

  // Dynamic responsive scaling helper
  const scale = (size: number) => (width / 375) * size;
  const isTablet = width > 600;

  const listingPhotos = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=80',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Header */}
      <View style={[styles.header, { paddingHorizontal: scale(16) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ marginRight: scale(8) }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={scale(20)} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="home-city" size={scale(18)} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.brandTitle, { fontSize: scale(14) }]}>RealtyAI Studio</Text>
            <TouchableOpacity style={styles.workspaceSelector}>
              <Text style={[styles.workspaceText, { fontSize: scale(11) }]}>Asset ID: {id ?? '1'}</Text>
              <Ionicons name="chevron-down" size={scale(12)} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.creditsBadge}>
            <Ionicons name="sparkles" size={scale(12)} color="#10B981" />
            <Text style={[styles.creditsText, { fontSize: scale(11) }]}>14/20 Left</Text>
          </View>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
            style={[
              styles.avatar,
              { width: scale(32), height: scale(32), borderRadius: scale(16) },
            ]}
          />
        </View>
      </View>

      {/* Keyboard Avoiding Container */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            {
              paddingHorizontal: scale(16),
              paddingBottom: scale(32),
              maxWidth: isTablet ? 600 : '100%',
              alignSelf: isTablet ? 'center' : 'stretch',
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Active Listing Card Header */}
          <View style={[styles.card, { padding: scale(16) }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.metaLabel, { fontSize: scale(10) }]}>ACTIVE LISTING #{id}</Text>
                <Text style={[styles.listingTitle, { fontSize: scale(16) }]}>{address}</Text>
                <Text style={[styles.priceText, { fontSize: scale(13) }]}>{price}</Text>
              </View>
              <View style={styles.cardHeaderActions}>
                <View style={styles.draftBadge}>
                  <Text style={[styles.draftText, { fontSize: scale(11) }]}>Draft</Text>
                </View>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="ellipsis-horizontal" size={scale(18)} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Segmented Control Tabs */}
            <View style={[styles.segmentContainer, { marginTop: scale(14) }]}>
              {['1. Details & Upload', '2. AI Outputs'].map((tab) => {
                const active = selectedTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.segmentButton, active && styles.activeSegment]}
                    onPress={() => setSelectedTab(tab)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { fontSize: scale(12) },
                        active && styles.activeSegmentText,
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* TAB CONTENT */}
          {selectedTab === '1. Details & Upload' ? (
            <View style={{ gap: scale(16), marginTop: scale(12) }}>
              {/* Photos & Media Upload Card */}
              <View style={[styles.card, { padding: scale(16) }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="images-outline" size={scale(18)} color="#1E293B" />
                    <Text style={[styles.sectionTitle, { fontSize: scale(14) }]}>
                      Property Media
                    </Text>
                  </View>
                  <Text style={[styles.counterText, { fontSize: scale(11) }]}>3 Photos</Text>
                </View>

                {/* Photo Preview Grid */}
                <View style={[styles.photoGrid, { marginTop: scale(12) }]}>
                  {listingPhotos.map((uri, idx) => (
                    <View key={idx} style={styles.photoContainer}>
                      <Image source={{ uri }} style={styles.photoThumb} />
                      <TouchableOpacity style={styles.removePhotoBadge}>
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.uploadTile} activeOpacity={0.7}>
                    <Feather name="upload-cloud" size={scale(20)} color="#0D9488" />
                    <Text style={[styles.uploadTileText, { fontSize: scale(10) }]}>Add Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Property Details Form Card */}
              <View style={[styles.card, { padding: scale(16) }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Feather name="edit-3" size={scale(16)} color="#1E293B" />
                    <Text style={[styles.sectionTitle, { fontSize: scale(14) }]}>
                      Property Information
                    </Text>
                  </View>
                </View>

                <View style={{ gap: scale(12), marginTop: scale(14) }}>
                  <View>
                    <Text style={[styles.inputLabel, { fontSize: scale(11) }]}>Street Address</Text>
                    <TextInput
                      style={[styles.textInput, { fontSize: scale(12) }]}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter street address"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { fontSize: scale(11) }]}>Listing Price</Text>
                      <TextInput
                        style={[styles.textInput, { fontSize: scale(12) }]}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        placeholder="$850,000"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { fontSize: scale(11) }]}>Sq Footage</Text>
                      <TextInput
                        style={[styles.textInput, { fontSize: scale(12) }]}
                        value={sqft}
                        onChangeText={setSqft}
                        keyboardType="numeric"
                        placeholder="2,840"
                      />
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { fontSize: scale(11) }]}>Bedrooms</Text>
                      <TextInput
                        style={[styles.textInput, { fontSize: scale(12) }]}
                        value={beds}
                        onChangeText={setBeds}
                        keyboardType="numeric"
                        placeholder="4"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { fontSize: scale(11) }]}>Bathrooms</Text>
                      <TextInput
                        style={[styles.textInput, { fontSize: scale(12) }]}
                        value={baths}
                        onChangeText={setBaths}
                        keyboardType="numeric"
                        placeholder="3.5"
                      />
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.generateCtaButton,
                  { height: scale(46), borderRadius: scale(23) },
                ]}
                onPress={() => setSelectedTab('2. AI Outputs')}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={scale(18)} color="#FFFFFF" />
                <Text style={[styles.generateCtaText, { fontSize: scale(13) }]}>
                  Generate Marketing Assets
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: scale(16), marginTop: scale(12) }}>
              <View style={[styles.banner, { padding: scale(10) }]}>
                <Ionicons name="sparkles" size={scale(16)} color="#0F766E" />
                <Text style={[styles.bannerText, { fontSize: scale(11) }]}>
                  AI assets generated from your uploaded photos & specs.
                </Text>
              </View>

              <View style={[styles.card, { padding: scale(16) }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialCommunityIcons name="text-box-outline" size={scale(18)} color="#1E293B" />
                    <Text style={[styles.sectionTitle, { fontSize: scale(14) }]}>MLS Description</Text>
                  </View>
                  <View style={styles.wordCounter}>
                    <View style={styles.greenDot} />
                    <Text style={[styles.counterText, { fontSize: scale(11) }]}>185/200 words</Text>
                  </View>
                </View>

                <View style={[styles.chipGroup, { marginVertical: scale(12) }]}>
                  {['Luxury', 'Professional', 'Casual'].map((tone) => {
                    const active = selectedTone === tone;
                    return (
                      <TouchableOpacity
                        key={tone}
                        style={[
                          styles.chip,
                          active ? styles.activeChip : styles.inactiveChip,
                          { paddingHorizontal: scale(14), paddingVertical: scale(6) },
                        ]}
                        onPress={() => setSelectedTone(tone)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { fontSize: scale(11) },
                            active ? styles.activeChipText : styles.inactiveChipText,
                          ]}
                        >
                          {tone}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={[styles.outputBox, { padding: scale(14) }]}>
                  <Text style={[styles.outputParagraph, { fontSize: scale(12), lineHeight: scale(18) }]}>
                    Welcome to this exceptional residence at 742 Evergreen Terrace — where refined elegance meets modern living. Spanning 2,840 square feet across four bedrooms and three-and-a-half baths, this home commands breathtaking mountain views from nearly every room. The chef-inspired kitchen features honed quartz countertops...
                  </Text>
                </View>

                <View style={[styles.actionRow, { marginTop: scale(14) }]}>
                  <TouchableOpacity style={[styles.actionButton, styles.copyButton]}>
                    <Ionicons name="copy-outline" size={scale(16)} color="#1E293B" />
                    <Text style={[styles.copyButtonText, { fontSize: scale(12) }]}>Copy Text</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionButton, styles.regenButton]}>
                    <Ionicons name="refresh" size={scale(16)} color="#0D9488" />
                    <Text style={[styles.regenButtonText, { fontSize: scale(12) }]}>Regenerate</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.card, { padding: scale(16) }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Octicons name="sliders" size={scale(16)} color="#1E293B" />
                    <Text style={[styles.sectionTitle, { fontSize: scale(14) }]}>Key Features</Text>
                  </View>
                  <Text style={[styles.countBadge, { fontSize: scale(11) }]}>7 items</Text>
                </View>

                <View style={{ gap: scale(10), marginTop: scale(12) }}>
                  {keyFeatures.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <View style={[styles.checkCircle, { width: scale(18), height: scale(18) }]}>
                        <Ionicons name="checkmark" size={scale(12)} color="#059669" />
                      </View>
                      <Text style={[styles.featureText, { fontSize: scale(12), lineHeight: scale(17) }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#0D9488', justifyContent: 'center', alignItems: 'center' },
  brandTitle: { fontWeight: '700', color: '#0F172A' },
  workspaceSelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workspaceText: { color: '#64748B', fontWeight: '500' },
  creditsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  creditsText: { color: '#059669', fontWeight: '600' },
  avatar: { backgroundColor: '#E2E8F0' },
  scrollContainer: { paddingTop: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  metaLabel: { fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  listingTitle: { fontWeight: '700', color: '#0F172A', marginTop: 2 },
  priceText: { color: '#0D9488', fontWeight: '600', marginTop: 2 },
  cardHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  draftBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  draftText: { color: '#475569', fontWeight: '600' },
  iconButton: { padding: 4 },
  segmentContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 3 },
  segmentButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeSegment: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { color: '#64748B', fontWeight: '600' },
  activeSegmentText: { color: '#0F172A' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontWeight: '700', color: '#0F172A' },
  counterText: { color: '#64748B', fontWeight: '500' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoContainer: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  removePhotoBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  uploadTile: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#0D9488', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#CCFBF1' },
  uploadTileText: { color: '#0D9488', fontWeight: '600', marginTop: 4 },
  inputLabel: { fontWeight: '600', color: '#475569', marginBottom: 4 },
  textInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#0F172A', backgroundColor: '#FFFFFF' },
  inputRow: { flexDirection: 'row', gap: 12 },
  generateCtaButton: { backgroundColor: '#0D9488', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  generateCtaText: { color: '#FFFFFF', fontWeight: '700' },
  banner: { backgroundColor: '#CCFBF1', borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerText: { color: '#0F766E', fontWeight: '500', flex: 1 },
  wordCounter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  chipGroup: { flexDirection: 'row', gap: 8 },
  chip: { borderRadius: 16, borderWidth: 1 },
  activeChip: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  inactiveChip: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  chipText: { fontWeight: '600' },
  activeChipText: { color: '#FFFFFF' },
  inactiveChipText: { color: '#64748B' },
  outputBox: { backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  outputParagraph: { color: '#334155' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  copyButton: { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
  copyButtonText: { color: '#1E293B', fontWeight: '600' },
  regenButton: { backgroundColor: '#CCFBF1', borderColor: '#0D9488' },
  regenButtonText: { color: '#0D9488', fontWeight: '600' },
  countBadge: { color: '#64748B', fontWeight: '500' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkCircle: { borderRadius: 9, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' },
  featureText: { color: '#334155', flex: 1 },
});