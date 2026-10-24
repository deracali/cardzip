import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { useAppSelector } from '../../../../../store';
import { CommunityConversation, fetchCommunityConversationsApi } from '../../../../../services/api/storeApi';

export default function CommunityChatsScreen() {
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const [conversations, setConversations] = useState<CommunityConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadChats = useCallback(async () => {
    if (!token) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setConversations(await fetchCommunityConversationsApi(token));
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load your chats.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    const timer = setTimeout(() => { void loadChats(); }, 0);
    return () => clearTimeout(timer);
  }, [loadChats]));

  const userId = String(user?.id || '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} accessibilityLabel="Go back"><Feather name="arrow-left" size={19} color="#14231C" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Community chats</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => void loadChats()} accessibilityLabel="Refresh chats"><Feather name="refresh-cw" size={17} color="#52645A" /></TouchableOpacity>
      </View>
      {!token ? (
        <View style={styles.center}>
          <Feather name="lock" size={25} color="#087A4C" />
          <Text style={styles.emptyTitle}>Sign in to view chats</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/login' as Href)}><Text style={styles.primaryButtonText}>Sign in</Text></TouchableOpacity>
        </View>
      ) : loading ? <ActivityIndicator style={styles.loader} size="large" color="#087A4C" /> : error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.primaryButton} onPress={() => void loadChats()}><Text style={styles.primaryButtonText}>Try again</Text></TouchableOpacity></View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}><Feather name="message-circle" size={26} color="#82918B" /><Text style={styles.emptyTitle}>No chats yet</Text><Text style={styles.emptyCopy}>Start a chat from a community listing to message its seller.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {conversations.map((conversation) => {
            const isBuyer = String(conversation.buyer?._id) === userId;
            const otherPerson = isBuyer ? conversation.seller : conversation.buyer;
            const image = conversation.listing?.images?.[0] || conversation.listing?.imageUrl;
            return (
              <TouchableOpacity key={conversation._id} style={styles.conversation} onPress={() => router.push(`/(main)/market/community/chat/${conversation._id}` as Href)}>
                {image ? <Image source={{ uri: image }} style={styles.listingImage} /> : <View style={[styles.listingImage, styles.imagePlaceholder]}><Feather name="package" size={19} color="#82918B" /></View>}
                <View style={styles.conversationCopy}>
                  <Text style={styles.listingTitle} numberOfLines={1}>{conversation.listing?.title || 'Community listing'}</Text>
                  <Text style={styles.personName} numberOfLines={1}>{otherPerson?.name || 'Cardzip user'}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>{conversation.lastMessage || 'Conversation started. Send a message.'}</Text>
                </View>
                {conversation.unreadCount ? <View style={styles.unreadBadge}><Text style={styles.unreadCount}>{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}</Text></View> : null}
                <Feather name="chevron-right" size={18} color="#819087" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F8F6' },
  header: { minHeight: 54, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DCE6DF', backgroundColor: '#FFFFFF' },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#14231C', fontSize: 15, fontWeight: '800' },
  loader: { marginTop: 40 },
  list: { padding: 14, gap: 9 },
  conversation: { minHeight: 80, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E0E7E2', borderRadius: 10, backgroundColor: '#FFFFFF' },
  listingImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#EDF2EE' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  conversationCopy: { flex: 1, minWidth: 0, gap: 3 },
  listingTitle: { color: '#14231C', fontSize: 12, fontWeight: '800' },
  personName: { color: '#087A4C', fontSize: 10, fontWeight: '700' },
  lastMessage: { color: '#718077', fontSize: 10 },
  unreadBadge: { minWidth: 20, height: 20, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#B91C1C' },
  unreadCount: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  emptyTitle: { color: '#26392E', fontSize: 15, fontWeight: '800' },
  emptyCopy: { maxWidth: 260, color: '#718077', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  errorText: { color: '#A32836', fontSize: 12, textAlign: 'center' },
  primaryButton: { minHeight: 40, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#087A4C' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
