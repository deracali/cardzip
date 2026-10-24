import React, { useState } from 'react';
import { StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Switch,
  Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import { Ionicons, Feather, MaterialIcons, Octicons } from '@expo/vector-icons';

// Screen Dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling helpers
const scale = (size: number): number => Math.round((SCREEN_WIDTH / 375) * size);
const verticalScale = (size: number): number => Math.round((SCREEN_HEIGHT / 812) * size);

// --- SVG COMPONENTS ---
const ChipSvg: React.FC<{ width?: number; height?: number }> = ({
  width = scale(42),
  height = verticalScale(28),
}) => (
  <Svg width={width} height={height} viewBox="0 0 42 28" fill="none">
    <Rect width="42" height="28" rx="6" fill="#D4A340" />
    <Rect x="1" y="1" width="40" height="26" rx="5" stroke="#B38128" strokeWidth="1" />
    <Path d="M0 14H42" stroke="#8C6113" strokeWidth="0.8" />
    <Path d="M14 0V28" stroke="#8C6113" strokeWidth="0.8" />
    <Path d="M28 0V28" stroke="#8C6113" strokeWidth="0.8" />
    <Path d="M14 8H28V20H14V8Z" stroke="#8C6113" strokeWidth="0.8" fill="none" />
  </Svg>
);

const VisaSvg: React.FC<{ width?: number; height?: number }> = ({
  width = scale(48),
  height = verticalScale(16),
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 32" fill="none">
    <Path
      d="M38.86 0.8L25.38 31.2H17.1L10.37 6.72C9.97 5.12 8.7 3.65 7.1 2.8C4.5 1.4 0 0.2 0 0.2L0.2 0.8H13.88C15.68 0.8 17.27 2.1 17.58 3.9L20.9 21.6L29.49 0.8H38.86ZM73.23 21.2C73.34 13.1 61.88 12.6 62.08 9C62.18 7.9 63.29 6.7 65.68 6.4C66.88 6.2 70.18 6.1 73.53 7.6L74.83 1.5C73.03 0.8 70.63 0.2 67.53 0.2C59.23 0.2 53.43 4.6 53.33 10.9C53.13 15.6 57.33 18.2 60.53 19.8C63.83 21.4 64.93 22.4 64.83 23.8C64.73 26 62.13 27 59.73 27C55.53 27 53.13 25.8 51.23 24.9L49.83 31.2C51.73 32.1 55.33 32.8 59.03 32.8C67.83 32.8 73.13 28.5 73.23 21.2ZM93.43 0.8H86.23C84.03 0.8 82.33 1.4 81.53 3.4L69.63 31.2H78.33L80.03 26.5H90.63L91.63 31.2H99.33L93.43 0.8ZM82.33 20.3L86.03 10.3L88.13 20.3H82.33ZM49.49 0.8L42.69 31.2H34.39L41.19 0.8H49.49Z"
      fill="#FFFFFF"
    />
  </Svg>
);

export default function CardDetailsScreen() {
  const [blockOnline, setBlockOnline] = useState<boolean>(false);
  const [monthlyLimit, setMonthlyLimit] = useState<boolean>(true);
  const [paymentAlerts, setPaymentAlerts] = useState<boolean>(true);
  const [cvvRevealed, setCvvRevealed] = useState<boolean>(false);

  const cardWidth = SCREEN_WIDTH * 0.90;
  const cardHeight = cardWidth * 0.58;

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Dark Section */}
        <LinearGradient
          colors={['#061A14', '#0A2B22', '#04120E']}
          style={styles.topContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="arrow-back" size={scale(20)} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Card Details</Text>
            
            <TouchableOpacity style={styles.headerIconButton}>
              <Feather name="share" size={scale(18)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Virtual Card Graphic */}
          <LinearGradient
            colors={['#061914', '#0E3A2E', '#134D3E', '#081E18']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { width: cardWidth, height: cardHeight }]}
          >
            {/* Watermarks */}
            <View style={styles.glassFrame} />
            <View style={styles.circleLeft} />
            <View style={styles.circleRight} />

            {/* Card Header Row */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>AWS Billing •••• 4829</Text>
                <View style={styles.statusRow}>
                  <View style={styles.activeDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
              <VisaSvg />
            </View>

            {/* Card Chip and Number Row */}
            <View style={styles.cardMiddle}>
              <ChipSvg />
              <Text style={styles.cardNumber}>5312 •••• •••• 4829</Text>
            </View>

            {/* Card Footer Row */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>Expiry</Text>
                <Text style={styles.cardValue}>08/29</Text>
              </View>
              <View style={{ marginLeft: scale(28) }}>
                <Text style={styles.cardLabel}>Balance</Text>
                <Text style={styles.cardValue}>$250.00</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Tap to Flip Action Button */}
          <TouchableOpacity style={styles.flipButton} activeOpacity={0.85}>
            <Octicons name="sync" size={scale(14)} color="#E2E8F0" />
            <Text style={styles.flipButtonText}>Tap to Flip</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Bottom Light Section Details */}
        <View style={styles.detailsContainer}>

          {/* 16-Digit Card Number Box */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>16-Digit Card Number</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>5312 6478 9012 4829</Text>
              <TouchableOpacity style={styles.copyBadge}>
                <Ionicons name="copy-outline" size={scale(14)} color="#10B981" />
                <Text style={styles.badgeText}>Copy Number</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expiry Date & CVV Row */}
          <View style={styles.splitRow}>
            {/* Expiry Date */}
            <View style={[styles.infoCard, styles.halfCard]}>
              <Text style={styles.infoLabel}>Expiry Date</Text>
              <View style={styles.infoRowSmall}>
                <Text style={styles.infoValue}>08 / 29</Text>
                <TouchableOpacity style={styles.actionBadgeSmall}>
                  <Ionicons name="eye-outline" size={scale(12)} color="#10B981" />
                  <Text style={styles.badgeTextSmall}>Reveal</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CVV Box */}
            <View style={[styles.infoCard, styles.halfCard]}>
              <Text style={styles.infoLabel}>CVV</Text>
              <View style={styles.infoRowSmall}>
                <Text style={styles.infoValue}>{cvvRevealed ? '884' : '•••'}</Text>
                <TouchableOpacity
                  style={styles.actionBadgeLarge}
                  onPress={() => setCvvRevealed(!cvvRevealed)}
                >
                  <Ionicons name="copy-outline" size={scale(12)} color="#10B981" />
                  <Text style={styles.badgeTextSmall}>
                    {cvvRevealed ? 'Hide' : 'Hold to Reveal'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* US Billing Address Box */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>US Billing Address</Text>
            <Text style={styles.addressValue}>417 W 118th Street, New York, NY 10027</Text>
            <TouchableOpacity style={[styles.copyBadge, { marginTop: verticalScale(10), alignSelf: 'flex-start' }]}>
              <Ionicons name="copy-outline" size={scale(14)} color="#10B981" />
              <Text style={styles.badgeText}>Copy Billing Address</Text>
            </TouchableOpacity>
          </View>

          {/* Security Controls Section */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionHeaderTitle}>SECURITY CONTROLS</Text>

            {/* Switch Item 1 */}
            <View style={styles.controlRow}>
              <View style={styles.controlIconBox}>
                <Ionicons name="globe-outline" size={scale(18)} color="#334155" />
              </View>
              <View style={styles.controlTextContainer}>
                <Text style={styles.controlTitle}>Block Online Transactions</Text>
                <Text style={styles.controlSubtitle}>Decline all web payments</Text>
              </View>
              <Switch
                value={blockOnline}
                onValueChange={setBlockOnline}
                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Switch Item 2 */}
            <View style={styles.controlRow}>
              <View style={styles.controlIconBox}>
                <Feather name="refresh-cw" size={scale(18)} color="#334155" />
              </View>
              <View style={styles.controlTextContainer}>
                <Text style={styles.controlTitle}>Monthly Spending Limit</Text>
                <Text style={styles.controlSubtitle}>$500.00 • resets Mar 1</Text>
              </View>
              <Switch
                value={monthlyLimit}
                onValueChange={setMonthlyLimit}
                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Switch Item 3 */}
            <View style={styles.controlRow}>
              <View style={styles.controlIconBox}>
                <Feather name="bell" size={scale(18)} color="#334155" />
              </View>
              <View style={styles.controlTextContainer}>
                <Text style={styles.controlTitle}>Instant Payment Alerts</Text>
                <Text style={styles.controlSubtitle}>Push + email receipts</Text>
              </View>
              <Switch
                value={paymentAlerts}
                onValueChange={setPaymentAlerts}
                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Terminate & Delete Card Button */}
          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8}>
            <MaterialIcons name="delete-outline" size={scale(18)} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Terminate & Delete Card</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: verticalScale(30),
  },
  topContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? verticalScale(12) : 0,
    paddingBottom: verticalScale(20),
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  headerIconButton: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: scale(17),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    borderRadius: scale(20),
    padding: scale(18),
    marginTop: verticalScale(8),
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassFrame: {
    position: 'absolute',
    bottom: verticalScale(10),
    right: scale(10),
    width: '55%',
    height: '52%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: scale(14),
  },
  circleLeft: {
    position: 'absolute',
    bottom: verticalScale(18),
    right: scale(46),
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  circleRight: {
    position: 'absolute',
    bottom: verticalScale(18),
    right: scale(24),
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(3),
  },
  activeDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#00E699',
    marginRight: scale(5),
  },
  statusText: {
    fontFamily: 'Poppins',
    fontSize: scale(11),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  cardNumber: {
    fontFamily: 'Poppins',
    fontSize: scale(18),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginLeft: scale(12),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  cardLabel: {
    fontFamily: 'Poppins',
    fontSize: scale(9),
    color: '#94A3B8',
  },
  cardValue: {
    fontFamily: 'Poppins',
    fontSize: scale(15),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: verticalScale(1),
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(18),
    borderRadius: scale(20),
    marginTop: verticalScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  flipButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: scale(12),
    fontWeight: '600',
    marginLeft: scale(6),
  },
  detailsContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoLabel: {
    fontFamily: 'Poppins',
    fontSize: scale(11),
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: verticalScale(4),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRowSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  infoValue: {
    fontFamily: 'Poppins',
    fontSize: scale(14),
    fontWeight: '700',
    color: '#0F172A',
  },
  addressValue: {
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
    marginTop: verticalScale(2),
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    borderRadius: scale(8),
  },
  badgeText: {
    fontFamily: 'Poppins',
    fontSize: scale(11),
    fontWeight: '700',
    color: '#10B981',
    marginLeft: scale(4),
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48.5%',
  },
  actionBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(8),
    borderRadius: scale(6),
  },
  actionBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(8),
    borderRadius: scale(6),
  },
  badgeTextSmall: {
    fontFamily: 'Poppins',
    fontSize: scale(10),
    fontWeight: '700',
    color: '#10B981',
    marginLeft: scale(3),
  },
  sectionHeaderTitle: {
    fontFamily: 'Poppins',
    fontSize: scale(11),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: verticalScale(12),
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
  },
  controlIconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  controlTextContainer: {
    flex: 1,
  },
  controlTitle: {
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  controlSubtitle: {
    fontFamily: 'Poppins',
    fontSize: scale(10),
    color: '#94A3B8',
    marginTop: verticalScale(1),
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: verticalScale(10),
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: verticalScale(4),
  },
  deleteButtonText: {
    fontFamily: 'Poppins',
    fontSize: scale(13),
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: scale(6),
  },
});