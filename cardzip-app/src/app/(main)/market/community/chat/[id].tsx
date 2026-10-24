import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector } from '../../../../../store';
import { CommunityConversation, CommunityMessage, fetchCommunityMessagesApi, markCommunityConversationReadApi, sendCommunityMessageApi } from '../../../../../services/api/storeApi';

export default function CommunityChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const [conversation, setConversation] = useState<CommunityConversation | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const knownMessageIds = useRef<Set<string>>(new Set());
  const conversationId = String(id || '');

  const loadMessages = useCallback(async (showLoader = false) => {
    if (!token || !conversationId) return;
    if (showLoader) setLoading(true);
    try {
      const result = await fetchCommunityMessagesApi(token, conversationId);
      const hasNewIncomingMessage = result.messages.some((message) => (
        !knownMessageIds.current.has(message._id)
        && String(message.sender?._id) !== String(user?.id || '')
      ));
      result.messages.forEach((message) => knownMessageIds.current.add(message._id));
      setConversation(result.conversation);
      setMessages(result.messages);
      if (result.messages.length === 0 && result.conversation.listing?.title) {
        setDraft((current) => current || `Hi, I'm interested in ${result.conversation.listing?.title}. Is it still available?`);
      }
      setError('');
      if (showLoader || hasNewIncomingMessage) {
        try {
          await markCommunityConversationReadApi(token, conversationId);
        } catch (readError) {
          console.error('Could not mark community chat as read:', readError);
        }
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load this chat.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [conversationId, token, user?.id]);

  useEffect(() => {
    const initialTimer = setTimeout(() => { void loadMessages(true); }, 0);
    const timer = setInterval(() => { void loadMessages(); }, 5000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, [loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const sendMessage = async () => {
    const body = draft.trim();
    if (!token || !body || sending) return;
    setSending(true);
    setError('');
    try {
      const message = await sendCommunityMessageApi(token, conversationId, body);
      setMessages((current) => [...current, message]);
      setConversation((current) => current ? { ...current, lastMessage: message.body, lastMessageAt: message.createdAt } : current);
      setDraft('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  const isBuyer = String(conversation?.buyer?._id) === String(user?.id || '');
  const otherPerson = isBuyer ? conversation?.seller : conversation?.buyer;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} accessibilityLabel="Go back"><Feather name="arrow-left" size={19} color="#14231C" /></TouchableOpacity>
        <View style={styles.headerCopy}><Text style={styles.headerTitle} numberOfLines={1}>{otherPerson?.name || 'Community chat'}</Text><Text style={styles.headerSubtitle} numberOfLines={1}>{conversation?.listing?.title || 'Listing unavailable'}</Text></View>
        <TouchableOpacity style={styles.headerButton} onPress={() => conversation?.listing?._id && router.push(`/(main)/market/community/${conversation.listing._id}` as Href)} accessibilityLabel="View listing"><Feather name="external-link" size={17} color="#52645A" /></TouchableOpacity>
      </View>
      {!token ? <View style={styles.center}><Text style={styles.errorText}>Sign in to access community chats.</Text><TouchableOpacity style={styles.sendButton} onPress={() => router.push('/(auth)/login' as Href)}><Text style={styles.sendButtonText}>Sign in</Text></TouchableOpacity></View>
        : loading ? <ActivityIndicator style={styles.loader} size="large" color="#087A4C" />
          : <KeyboardAvoidingView style={styles.chatLayout} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
            <ScrollView ref={scrollRef} contentContainerStyle={styles.messageList} keyboardShouldPersistTaps="handled">
              {messages.length === 0 ? <Text style={styles.emptyHint}>Say hello and ask about the listing.</Text> : messages.map((message) => {
                const mine = String(message.sender?._id) === String(user?.id || '');
                return <View key={message._id} style={[styles.messageBubble, mine ? styles.myMessage : styles.theirMessage]}>
                  <Text style={[styles.messageText, mine && styles.myMessageText]}>{message.body}</Text>
                  <Text style={[styles.messageTime, mine && styles.myMessageTime]}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
                </View>;
              })}
            </ScrollView>
            {error ? <Text style={styles.errorInline} accessibilityRole="alert">{error}</Text> : null}
            <View style={styles.composer}>
              <TextInput style={styles.input} value={draft} onChangeText={setDraft} placeholder="Write a message…" placeholderTextColor="#8A978F" multiline maxLength={2000} />
              <TouchableOpacity style={[styles.sendButton, (!draft.trim() || sending) && styles.disabled]} onPress={() => void sendMessage()} disabled={!draft.trim() || sending} accessibilityLabel="Send message">
                {sending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Feather name="arrow-up" size={18} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F8F6' },
  header: { minHeight: 58, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DCE6DF', backgroundColor: '#FFFFFF' },
  headerButton: { width: 36, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, minWidth: 0 },
  headerTitle: { color: '#14231C', fontSize: 13, fontWeight: '800' },
  headerSubtitle: { marginTop: 2, color: '#718077', fontSize: 9 },
  chatLayout: { flex: 1 },
  loader: { marginTop: 40 },
  messageList: { flexGrow: 1, padding: 14, gap: 9, justifyContent: 'flex-end' },
  emptyHint: { alignSelf: 'center', marginVertical: 22, color: '#718077', fontSize: 11 },
  messageBubble: { maxWidth: '84%', paddingHorizontal: 12, paddingTop: 9, paddingBottom: 6, borderRadius: 12 },
  myMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 3, backgroundColor: '#087A4C' },
  theirMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 3, borderWidth: 1, borderColor: '#E1E9E3', backgroundColor: '#FFFFFF' },
  messageText: { color: '#26392E', fontSize: 12, lineHeight: 17 },
  myMessageText: { color: '#FFFFFF' },
  messageTime: { alignSelf: 'flex-end', marginTop: 4, color: '#82918B', fontSize: 8 },
  myMessageTime: { color: '#D0EBDD' },
  composer: { padding: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#DCE6DF', backgroundColor: '#FFFFFF' },
  input: { flex: 1, maxHeight: 110, minHeight: 42, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#D8E2DB', borderRadius: 18, color: '#14231C', fontSize: 12 },
  sendButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: '#087A4C' },
  sendButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  disabled: { opacity: 0.55 },
  errorInline: { paddingHorizontal: 12, paddingBottom: 6, color: '#A32836', fontSize: 10 },
  errorText: { color: '#A32836', fontSize: 11, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 22 },
});
