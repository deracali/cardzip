import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';
import { useAppSelector } from '../../../store';
import CardzipLoader from '../../../components/CardzipLoader';
import {
  createSupportRequestApi,
  listSupportRequestsApi,
  replySupportRequestApi,
  SupportRequest,
} from '../../../services/api/supportApi';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How long does payout take?',
    answer: 'Instant to all major banks. Most withdrawals land in under 2 minutes, 24/7 — even on weekends.',
  },
  {
    id: '2',
    question: 'Why is my rate different today?',
    answer: 'Gift card and crypto rates fluctuate based on market demand and partner liquidity in real time.',
  },
  {
    id: '3',
    question: 'My card was rejected — what next?',
    answer: 'Ensure the gift card code is clear and fully unmined/unscratched. Contact live support for manual review.',
  },
  {
    id: '4',
    question: 'Is verification (KYC) required?',
    answer: 'Basic tier trades do not require full KYC, but higher transaction limits require Level 2 ID verification.',
  },
];

export default function HelpSupportScreen() {
  const { width, height } = useWindowDimensions();

  // Responsive scaling helpers based on 375x812 standard mobile frame
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;

  // Accordion open state (defaulting to first item opened as seen in design)
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredFAQs = normalizedSearch
    ? FAQ_DATA.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(normalizedSearch))
    : FAQ_DATA;
  const { token } = useAppSelector((state) => state.auth);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState('');
  const [supportError, setSupportError] = useState('');
  const [supportNotice, setSupportNotice] = useState('');
  const subjectInputRef = useRef<TextInput>(null);

  const startSupportRequest = (requestSubject: string) => {
    setSubject(requestSubject);
    setSupportNotice('Describe your issue below and send the support request.');
    setTimeout(() => subjectInputRef.current?.focus(), 100);
  };

  const loadRequests = useCallback(async () => {
    if (!token) {
      setLoadingRequests(false);
      return;
    }
    try {
      const result = await listSupportRequestsApi(token);
      setRequests(result);
      setSupportError('');
    } catch (error) {
      setSupportError(error instanceof Error ? error.message : 'Could not load support requests.');
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  useEffect(() => {
    const initialLoad = setTimeout(() => { void loadRequests(); }, 0);
    if (!token) return undefined;
    const interval = setInterval(() => { void loadRequests(); }, 20000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadRequests, token]);

  const submitRequest = async () => {
    if (!token) {
      setSupportError('Sign in to send a support request.');
      return;
    }
    if (subject.trim().length < 4 || description.trim().length < 10) {
      setSupportError('Enter a subject and describe the issue in at least 10 characters.');
      return;
    }
    setSubmitting(true);
    setSupportError('');
    setSupportNotice('');
    try {
      const request = await createSupportRequestApi(token, subject.trim(), description.trim());
      setRequests((current) => [request, ...current]);
      setSubject('');
      setDescription('');
      setSupportNotice('Your request was sent. Replies will appear here.');
    } catch (error) {
      setSupportError(error instanceof Error ? error.message : 'Could not send your support request.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendReply = async (request: SupportRequest) => {
    const message = String(replyDrafts[request._id] || '').trim();
    if (!token || !message || replySubmitting) return;
    setReplySubmitting(request._id);
    setSupportError('');
    try {
      const updated = await replySupportRequestApi(token, request._id, message);
      setRequests((current) => current.map((item) => item._id === request._id ? updated : item));
      setReplyDrafts((current) => ({ ...current, [request._id]: '' }));
    } catch (error) {
      setSupportError(error instanceof Error ? error.message : 'Could not send your reply.');
    } finally {
      setReplySubmitting('');
    }
  };

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: scale(16), paddingTop: Platform.OS === 'android' ? verticalScale(12) : 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Search Banner */}
        <View style={[styles.bannerCard, { borderRadius: scale(24), padding: scale(18) }]}>
          {/* Decorative Circle Path in Top Right Banner */}
          <View
            style={[
              styles.bannerCirclePath,
              {
                width: scale(220),
                height: scale(220),
                borderRadius: scale(110),
                top: scale(-60),
                right: scale(-50),
              },
            ]}
          />

          <Text style={[styles.bannerTitle, { fontSize: scale(20) }]}>
            How can we help you today?
          </Text>
          <Text style={[styles.bannerSubTitle, { fontSize: scale(12), marginBottom: verticalScale(14) }]}>
            Average reply in under 2 minutes
          </Text>

          {/* Search Input Bar with 'Ask' Button */}
          <View style={[styles.searchBarContainer, { height: scale(46), borderRadius: scale(23) }]}>
            <Ionicons name="search-outline" size={scale(18)} color="#82918B" style={styles.searchIcon} />
            <TextInput
              placeholder="Search help, rates, payouts..."
              placeholderTextColor="#82918B"
              value={searchQuery}
              onChangeText={(value) => {
                setSearchQuery(value);
                const query = value.trim().toLowerCase();
                const match = FAQ_DATA.find((item) => `${item.question} ${item.answer}`.toLowerCase().includes(query));
                if (query && match) setExpandedId(match.id);
              }}
              style={[styles.searchInput, { fontSize: scale(13) }]}
            />
            <TouchableOpacity
              style={[styles.askButton, styles.askButtonGlow]}
              activeOpacity={0.8}
              onPress={() => {
                const query = searchQuery.trim().toLowerCase();
                const match = filteredFAQs[0];
                if (match && query) {
                  setExpandedId(match.id);
                  return;
                }
                startSupportRequest(searchQuery.trim() ? `Question: ${searchQuery.trim()}` : 'Support request');
              }}
            >
              <Text style={[styles.askButtonText, { fontSize: scale(12) }]}>Ask</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2x2 Support Quick Action Cards */}
        <View style={[styles.gridContainer, { marginVertical: verticalScale(14) }]}>
          {/* 1. Live Chat Card */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#4F80FF' }, styles.blueCardGlow]}
            activeOpacity={0.85}
            onPress={() => startSupportRequest('Live chat request')}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={scale(18)} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, { color: '#FFFFFF', fontSize: scale(15) }]}>
              Live Chat 24/7
            </Text>
            <Text style={[styles.actionSubtitle, { color: 'rgba(255, 255, 255, 0.8)', fontSize: scale(11) }]}>
              Online now
            </Text>
          </TouchableOpacity>

          {/* 2. WhatsApp Card */}
          <View
            style={[styles.actionCard, { backgroundColor: '#056839' }, styles.greenCardGlow]}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="call-outline" size={scale(18)} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, { color: '#FFFFFF', fontSize: scale(15) }]}>
              WhatsApp
            </Text>
            <Text style={[styles.actionSubtitle, { color: 'rgba(255, 255, 255, 0.8)', fontSize: scale(11) }]}>
              Use Contact support below
            </Text>
          </View>

          {/* 3. Report Issue Card */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFFFFF' }]}
            activeOpacity={0.85}
            onPress={() => startSupportRequest('Trade dispute')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="flag" size={scale(18)} color="#D97706" />
            </View>
            <Text style={[styles.actionTitle, { color: '#12201B', fontSize: scale(15) }]}>
              Report Issue
            </Text>
            <Text style={[styles.actionSubtitle, { color: '#82918B', fontSize: scale(11) }]}>
              Trade dispute
            </Text>
          </TouchableOpacity>

          {/* 4. FAQs Card */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFFFFF' }]}
            activeOpacity={0.85}
            onPress={() => setExpandedId((current) => current === FAQ_DATA[0].id ? null : FAQ_DATA[0].id)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
             <Feather name="book" size={scale(18)} color="#10B981" />
            </View>
            <Text style={[styles.actionTitle, { color: '#12201B', fontSize: scale(15) }]}>
              FAQs
            </Text>
            <Text style={[styles.actionSubtitle, { color: '#82918B', fontSize: scale(11) }]}>
              42 articles
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.requestsCard, { borderRadius: scale(16), padding: scale(16), marginBottom: verticalScale(18) }]}>
          <Text style={[styles.sectionHeader, { fontSize: scale(16) }]}>Contact Cardzip support</Text>
          <Text style={styles.supportDescription}>Create a request or reply to an existing conversation. Replies appear here automatically.</Text>
          {supportError ? <Text style={styles.supportError} accessibilityRole="alert">{supportError}</Text> : null}
          {supportNotice ? <Text style={styles.supportNotice} accessibilityLiveRegion="polite">{supportNotice}</Text> : null}
          <TextInput
            ref={subjectInputRef}
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject"
            placeholderTextColor="#94A3B8"
            maxLength={120}
            style={styles.supportInput}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe how we can help"
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={4000}
            textAlignVertical="top"
            style={[styles.supportInput, styles.supportTextarea]}
          />
          <TouchableOpacity style={styles.supportSubmit} onPress={() => { void submitRequest(); }} disabled={submitting}>
            {submitting ? <CardzipLoader label="Sending request…" compact /> : <Text style={styles.supportSubmitText}>Send support request</Text>}
          </TouchableOpacity>

          <View style={styles.supportHistoryHeader}>
            <Text style={styles.supportHistoryTitle}>Your support history</Text>
            <TouchableOpacity onPress={() => { setLoadingRequests(true); void loadRequests(); }} disabled={loadingRequests}>
              <Text style={styles.supportRefresh}>{loadingRequests ? 'Refreshing…' : 'Refresh'}</Text>
            </TouchableOpacity>
          </View>
          {loadingRequests ? <CardzipLoader label="Loading your requests…" /> : requests.length === 0 ? (
            <Text style={styles.supportEmpty}>No requests yet. Send us a message whenever you need help.</Text>
          ) : requests.map((request) => (
            <View key={request._id} style={styles.supportRequest}>
              <View style={styles.supportRequestTitleWrap}>
                <Text style={styles.supportRequestTitle}>{request.subject}</Text>
                <Text style={styles.supportRequestMeta}>{request.status.replace('_', ' ')} · {new Date(request.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.supportRequestDescription}>{request.description}</Text>
              {request.messages.map((message) => (
                <View key={message._id} style={[styles.supportMessage, message.senderRole !== 'user' && styles.supportStaffMessage]}>
                  <Text style={styles.supportSender}>{message.senderRole === 'user' ? 'You' : 'Cardzip support'}</Text>
                  <Text style={styles.supportMessageText}>{message.message}</Text>
                  <Text style={styles.supportMessageDate}>{new Date(message.createdAt).toLocaleString()}</Text>
                </View>
              ))}
              <TextInput
                value={replyDrafts[request._id] || ''}
                onChangeText={(value) => setReplyDrafts((current) => ({ ...current, [request._id]: value }))}
                placeholder="Add a message"
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={4000}
                style={[styles.supportInput, styles.replyInput]}
              />
              <TouchableOpacity
                style={styles.replyButton}
                disabled={!String(replyDrafts[request._id] || '').trim() || replySubmitting !== ''}
                onPress={() => { void sendReply(request); }}
              >
                <Text style={styles.supportSubmitText}>{replySubmitting === request._id ? 'Sending…' : 'Send reply'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Popular Questions Section Title */}
        <Text style={[styles.sectionHeader, { fontSize: scale(16), marginBottom: verticalScale(10) }]}>
          Popular questions
        </Text>

        {/* FAQ Accordions List */}
        <View style={styles.faqList}>
          {filteredFAQs.length === 0 ? (
            <Text style={styles.supportEmpty}>No help articles match. Tap Ask to contact support.</Text>
          ) : filteredFAQs.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => toggleAccordion(item.id)}
                style={[
                  styles.faqCard,
                  isExpanded ? styles.activeFaqCard : styles.inactiveFaqCard,
                ]}
              >
                <View style={styles.faqHeaderRow}>
                  <Text style={[styles.faqQuestionText, { fontSize: scale(14) }]}>
                    {item.question}
                  </Text>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={scale(18)}
                    color="#12201B"
                  />
                </View>

                {isExpanded && (
                  <Text style={[styles.faqAnswerText, { fontSize: scale(12), marginTop: verticalScale(6) }]}>
                    {item.answer}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Agent Banner Card */}
        <View style={[styles.agentCard, { borderRadius: scale(16), marginVertical: verticalScale(16) }]}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            }}
            style={[styles.agentAvatar, { width: scale(42), height: scale(42), borderRadius: scale(21) }]}
          />
          <View style={styles.agentInfoContainer}>
            <Text style={[styles.agentTitle, { fontSize: scale(14) }]}>
              Still stuck? Talk to Ada
            </Text>
            <Text style={[styles.agentSubtitle, { fontSize: scale(11) }]}>
              Support hero • online
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.chatBtn, styles.chatBtnGlow]}
            activeOpacity={0.8}
            onPress={() => startSupportRequest('Live chat request')}
          >
            <Text style={[styles.chatBtnText, { fontSize: scale(12) }]}>Chat</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F5',
  },
  container: {
    paddingBottom: 90, // Clearance for bottom floating navbar
  },

  /* Banner Card */
  bannerCard: {
    backgroundColor: '#0F261C', // Deep forest green
    position: 'relative',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  /* Decorative Circle Path on Top Right */
  bannerCirclePath: {
    position: 'absolute',
    backgroundColor: '#38583E',
    opacity: 0.45,
  },
  bannerTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bannerSubTitle: {
    color: '#A2B3AC',
    fontWeight: '500',
  },

  /* Search Bar */
  searchBarContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#12201B',
    height: '100%',
  },
  askButton: {
    backgroundColor: '#00B856', // Bright lime green
    paddingHorizontal: 16,
    height: '84%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  askButtonGlow: {
    shadowColor: '#00B856',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* 2x2 Grid Action Cards */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  blueCardGlow: {
    shadowColor: '#4F80FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  greenCardGlow: {
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontWeight: '800',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontWeight: '500',
  },

  /* FAQ Accordion List */
  sectionHeader: {
    fontWeight: '800',
    color: '#12201B',
  },
  faqList: {
    gap: 10,
  },
  requestsCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  supportDescription: { color: '#64748B', fontSize: 12, lineHeight: 18 },
  supportInput: {
    minHeight: 44, borderWidth: 1, borderColor: '#DCE5E1', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, color: '#12201B', fontSize: 13, backgroundColor: '#FFFFFF',
  },
  supportTextarea: { minHeight: 100 },
  supportSubmit: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#059669' },
  supportSubmitText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  supportError: { color: '#B91C1C', fontSize: 12, lineHeight: 17 },
  supportNotice: { color: '#047857', fontSize: 12, lineHeight: 17 },
  supportHistoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  supportHistoryTitle: { color: '#12201B', fontSize: 14, fontWeight: '800' },
  supportRefresh: { color: '#047857', fontSize: 12, fontWeight: '700' },
  supportEmpty: { paddingVertical: 16, color: '#64748B', fontSize: 12, textAlign: 'center' },
  supportRequest: { gap: 9, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  supportRequestTitleWrap: { flex: 1 },
  supportRequestTitle: { color: '#12201B', fontSize: 13, fontWeight: '800' },
  supportRequestMeta: { marginTop: 3, color: '#64748B', fontSize: 10, textTransform: 'capitalize' },
  supportRequestDescription: { color: '#475569', fontSize: 12, lineHeight: 17 },
  supportMessage: { maxWidth: '92%', alignSelf: 'flex-start', gap: 3, padding: 10, borderRadius: 10, backgroundColor: '#F1F5F9' },
  supportStaffMessage: { alignSelf: 'flex-end', backgroundColor: '#ECFDF5' },
  supportSender: { color: '#475569', fontSize: 10, fontWeight: '800' },
  supportMessageText: { color: '#334155', fontSize: 12, lineHeight: 17 },
  supportMessageDate: { color: '#94A3B8', fontSize: 9 },
  replyInput: { minHeight: 64 },
  replyButton: { minHeight: 38, alignSelf: 'flex-end', paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#047857' },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  activeFaqCard: {
    borderWidth: 1.5,
    borderColor: '#00B856', // Active green border outline from image
  },
  inactiveFaqCard: {
    borderWidth: 0,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestionText: {
    fontWeight: '700',
    color: '#12201B',
    flex: 1,
    marginRight: 8,
  },
  faqAnswerText: {
    color: '#6B7280',
    lineHeight: 18,
  },

  /* Bottom Agent Callout Banner */
  agentCard: {
    backgroundColor: '#0F261C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  agentAvatar: {
    marginRight: 10,
  },
  agentInfoContainer: {
    flex: 1,
  },
  agentTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  agentSubtitle: {
    color: '#A2B3AC',
  },
  chatBtn: {
    backgroundColor: '#B3F05C', // Bright lime button
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chatBtnGlow: {
    shadowColor: '#B3F05C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  chatBtnText: {
    color: '#12201B',
    fontWeight: '800',
  },
});