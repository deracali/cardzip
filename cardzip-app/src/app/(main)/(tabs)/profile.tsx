import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  useWindowDimensions,
  Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  Octicons,
  Feather,
  FontAwesome5,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { logoutUser, setUserProfileImage } from '../../../store/slices/authSlice';
import { setNotificationsEnabled } from '../../../store/slices/preferencesSlice';
import FeedbackModal from '../components/FeedbackModal';
import CardzipLoader from '../../../components/CardzipLoader';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadProfileImageApi } from '../../../services/api/accountApi';
import { setAccountProfileImage } from '../../../store/slices/accountSlice';



export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { summary, loading } = useAppSelector((state) => state.account);
  const { notificationsEnabled } = useAppSelector((state) => state.preferences);
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [profileImageError, setProfileImageError] = useState('');
  const [pendingProfileImage, setPendingProfileImage] = useState<string | null>(null);

  // Responsive scaling dynamic helper based on 375px reference width
  const scale = (size: number) => (width / 375) * size;
  const profileImage = pendingProfileImage || user?.profileImage || summary?.user.profileImage;

  const chooseProfileImage = async () => {
    if (!token || profileImageLoading) return;
    setProfileImageError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setProfileImageError('Allow photo-library access to choose your profile image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const previousImage = profileImage;
    setPendingProfileImage(asset.uri);
    setProfileImageLoading(true);
    try {
      const imageUrl = await uploadProfileImageApi(token, {
        uri: asset.uri,
        name: asset.fileName || `profile.${asset.mimeType?.split('/')[1] || 'jpg'}`,
        type: asset.mimeType || 'image/jpeg',
      });
      dispatch(setUserProfileImage(imageUrl));
      dispatch(setAccountProfileImage(imageUrl));
      const stored = await AsyncStorage.getItem('cardzip.auth.session');
      if (stored) {
        const session = JSON.parse(stored) as { user: typeof user; token: string };
        if (session.user) {
          await AsyncStorage.setItem('cardzip.auth.session', JSON.stringify({
            ...session,
            user: { ...session.user, profileImage: imageUrl },
          }));
        }
      }
      setPendingProfileImage(null);
    } catch (requestError) {
      setPendingProfileImage(previousImage || null);
      setProfileImageError(requestError instanceof Error ? requestError.message : 'Could not update your profile image.');
    } finally {
      setProfileImageLoading(false);
    }
  };

  if (!summary && loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CardzipLoader label="Preparing your profile…" fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingHorizontal: scale(16) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Banner Card */}
        <View style={styles.bannerCard}>
          {/* Decorative Circle Path in Banner */}
          <View style={styles.decorativeCircle} />

          {/* Avatar Container */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity onPress={() => void chooseProfileImage()} accessibilityRole="button" accessibilityLabel="Change profile image" disabled={profileImageLoading}>
              {profileImage
                ? <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                : <View style={[styles.avatarImage, styles.avatarPlaceholder]}><Ionicons name="person" size={scale(34)} color="#FFFFFF" /></View>}
              <View style={styles.avatarEditBadge}>
                {profileImageLoading
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Feather name="plus" size={scale(15)} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
            {profileImageError ? <Text style={styles.profileImageError} accessibilityRole="alert">{profileImageError}</Text> : null}
          </View>

          {/* Name */}
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail" adjustsFontSizeToFit minimumFontScale={0.75}>{user?.name ?? 'Your account'}</Text>

          {/* Level Pill & Points */}
          <View style={styles.levelRow}>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>{summary?.memberLevel ?? 'BRONZE'} MEMBER</Text>
            </View>
              {summary
                ? <Text style={styles.levelPointsText}>{summary.nextLevel ? `${summary.pointsToNextLevel} pts to ${summary.nextLevel}` : `${summary.points} pts · max level`}</Text>
                : <Text style={styles.levelPointsText}>Points unavailable</Text>}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${summary?.progressPercent ?? 0}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.rewardsCard} activeOpacity={0.8} onPress={() => router.push('/(main)/property/rewards')}>
          <View style={[styles.iconContainer, { backgroundColor: '#0F261C' }]}>
            <FontAwesome5 name="award" size={scale(16)} color="#B3F05C" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Rewards & activity</Text>
            <Text style={styles.menuSubTitle}>{`${summary?.points ?? 0} pts · ${summary?.successfulTrades ?? 0} trades · ${summary?.referralCount ?? 0} referrals`}</Text>
          </View>
          <Feather name="chevron-right" size={scale(20)} color="#12201B" />
        </TouchableOpacity>

        {/* Menu Items Group */}
        <View style={styles.menuGroup}>
          {/* 1. Account Verification (KYC) */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/(main)/property/kyc')}>
            <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' }]}>
              <Octicons name="verified" size={scale(18)} color="#FFFFFF" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Account Verification (KYC)</Text>
              <Text style={styles.menuSubTitle}>{summary?.kyc.status === 'approved' ? 'Verified' : summary?.kyc.status === 'pending' ? 'Pending review' : 'Complete identity verification'}</Text>
            </View>
            {summary?.kyc.status === 'approved' && <View style={styles.verifiedTag}><Text style={styles.verifiedTagText}>Verified</Text></View>}
          </TouchableOpacity>

          {/* 2. Bank Details */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/(main)/property/bank-details')}>
            <View style={[styles.iconContainer, { backgroundColor: '#1C2723' }]}>
              <Ionicons name="business" size={scale(18)} color="#FFFFFF" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Bank Details</Text>
              <Text style={styles.menuSubTitle}>
                {summary?.user.bankAccount
                  ? `${summary.user.bankAccount.bankName} • ****${summary.user.bankAccount.accountNumber.slice(-4)}`
                  : 'Add a payout account'}
              </Text>
            </View>
            <Feather name="chevron-right" size={scale(20)} color="#12201B" />
          </TouchableOpacity>

          {/* Notifications */}
          <View style={styles.menuItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#F97316' }]}>
              <Ionicons name="notifications" size={scale(18)} color="#FFFFFF" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSubTitle}>{notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => { void dispatch(setNotificationsEnabled(value)); }}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Refer & Earn Card */}
          <TouchableOpacity style={styles.referralCard} activeOpacity={0.85} onPress={() => router.push('/(main)/property/referral')}>
            <View style={[styles.iconContainer, { backgroundColor: '#1C2723' }]}>
              <FontAwesome5 name="gift" size={scale(16)} color="#A3E635" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: '#12201B', fontWeight: '700' }]}>
                Earn 2% from referrals
              </Text>
              {summary
                ? <Text style={[styles.menuSubTitle, { color: '#374151' }]}>{`${summary.referralCount} friends • ₦${summary.referralRewardNgn.toLocaleString()} earned`}</Text>
                : <Text style={[styles.menuSubTitle, { color: '#374151' }]}>Referral activity unavailable</Text>}
            </View>
            <View style={styles.inviteButton}>
              <Text style={styles.inviteButtonText}>Invite</Text>
            </View>
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/(main)/property/support')}>
            <View style={[styles.iconContainer, { backgroundColor: '#10B981' }]}>
              <Ionicons name="headset" size={scale(18)} color="#FFFFFF" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Help & Support</Text>
              <Text style={styles.menuSubTitle}>24/7 live chat</Text>
            </View>
            <Feather name="chevron-right" size={scale(20)} color="#12201B" />
          </TouchableOpacity>
        </View>

        {/* Log out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={() => {
            void dispatch(logoutUser()).unwrap()
              .then(() => router.replace('/(auth)/login'))
              .catch(() => setFeedback({ title: 'Logout failed', message: 'Unable to clear the saved session. Please try again.' }));
          }}
        >
          <Feather name="log-out" size={scale(16)} color="#FF4D4D" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
      <FeedbackModal
        visible={feedback !== null}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        tone="error"
        onClose={() => setFeedback(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F5',
  },
  container: {
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 110, // Extra clearance for the bottom floating navigation bar
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: 22,
    fontWeight: '800',
    color: '#12201B',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  /* Banner Card */
  bannerCard: {
    backgroundColor: '#0F261C', // Dark forest green
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  /* Decorative Circle Path in the banner top right */
  decorativeCircle: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#38583E', // Soft lighter green accent circle
    opacity: 0.45,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#537260' },
  avatarEditBadge: { position: 'absolute', right: 0, bottom: 8, width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0F261C', borderRadius: 13, backgroundColor: '#087A4C' },
  profileImageError: { marginBottom: 8, color: '#FECACA', fontSize: 10, textAlign: 'center' },
  userName: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    maxWidth: '100%',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  levelPill: {
    backgroundColor: '#A3E635', // Lime green pill
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelPillText: {
    fontFamily: 'Poppins',
    fontSize: 10,
    fontWeight: '800',
    color: '#12201B',
  },
  levelPointsText: {
    fontFamily: 'Poppins',
    fontSize: 11,
    color: '#A2B3AC',
    fontWeight: '500',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#1E3A2F',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A3E635',
    borderRadius: 3,
  },

  /* Menu Items */
  menuGroup: {
    gap: 10,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '700',
    color: '#12201B',
    marginBottom: 2,
  },
  menuSubTitle: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#82918B',
  },
  verifiedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontFamily: 'Poppins',
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },

  /* Refer & Earn Special Card */
  rewardsCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE5DF',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  referralCard: {
    backgroundColor: '#B3F05C', // Distinct bright lime background
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteButton: {
    backgroundColor: '#12201B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '800',
  },

  /* Logout */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  logoutText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '700',
    color: '#FF4D4D',
  },
});