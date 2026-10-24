import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { RentalProfile, SmsMessage } from '../../../services/api/numberHubApi';

type NumberHubRentalsProps = {
  activeTab: 'rentals' | 'inbox';
  rentals: RentalProfile[];
  messages: SmsMessage[];
  loading: boolean;
  inboxLoading: boolean;
  setAutoRenew: (rentalId: string, value: boolean) => void;
  codeCopied: boolean;
  onCopyCode: () => void;
  onRefresh: () => void;
  onOpenInbox: (rentalId?: string) => void;
  onRenew: (rentalId: string) => void;
  onCancel: (rentalId: string) => void;
  onManageRental?: (rental: RentalProfile) => void;
  styles: any;
  colors: any;
};

export default function NumberHubRentals({
  activeTab,
  rentals,
  messages,
  loading,
  inboxLoading,
  setAutoRenew,
  codeCopied,
  onCopyCode,
  onRefresh,
  onOpenInbox,
  onRenew,
  onCancel,
  onManageRental,
  styles,
  colors,
}: NumberHubRentalsProps) {
  const openManageMenu = (rental: RentalProfile) => {
    if (onManageRental) {
      onManageRental(rental);
      return;
    }
    onRenew(rental.id);
  };

  return (
    <View style={styles.sectionContainer}>
      {activeTab === 'rentals' && <>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Rentals ({rentals.length})</Text>
          <TouchableOpacity onPress={() => rentals[0] ? openManageMenu(rentals[0]) : onRefresh()} disabled={loading}>
            <Text style={styles.manageAllText}>Manage all</Text>
          </TouchableOpacity>
        </View>

        {rentals.length === 0 ? (
          <View style={styles.activeCard}>
            <Text style={styles.metaValue}>{loading ? 'Loading active rentals...' : 'No active rentals found.'}</Text>
          </View>
        ) : rentals.map((rental) => (
          <View key={rental.id} style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <Text style={styles.rentalIdText} numberOfLines={1}>RENTAL #{rental.id} <Text style={{ fontSize: 9 }}>{rental.area}</Text></Text>
              <View style={styles.activeStatusPill}><View style={styles.activeDot} /><Text style={styles.activeStatusText}>{rental.status}</Text></View>
            </View>
            <Text style={styles.phoneNumberText}>{rental.phoneNumber}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>App service</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <FontAwesome5 name="mobile-alt" size={13} color={colors.accentGreen} />
                  <Text style={styles.metaValue}> {rental.appName}</Text>
                </View>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Expires</Text>
                <Text style={styles.metaValue}>{rental.expiresAt || 'Not provided'}</Text>
              </View>
            </View>
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={15} color={colors.warningRedText} />
              <Text style={styles.warningText}>{rental.area || 'This'} rental cannot be cancelled once purchased.</Text>
            </View>
            <View style={styles.autoRenewRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="refresh-cw" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.autoRenewText}>Auto-renew</Text>
              </View>
              <Switch
                value={rental.autoRenew}
                onValueChange={(value) => setAutoRenew(rental.id, value)}
                trackColor={{ false: '#2C3A4E', true: colors.accentGreen }}
                thumbColor="#FFFFFF"
              />
            </View>
            <TouchableOpacity style={styles.viewInboxButton} onPress={() => onOpenInbox(rental.id)}>
              <Ionicons name="mail-open-outline" size={15} color="#000000" />
              <Text style={styles.viewInboxText}> View SMS Inbox & OTPs</Text>
            </TouchableOpacity>
          </View>
        ))}
      </>}

      {activeTab === 'inbox' && <>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Live SMS Inbox</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.rateDot, { backgroundColor: colors.accentGreen }]} />
            <Text style={[styles.rateText, { color: colors.accentGreen }]}>{inboxLoading ? 'Loading...' : 'Live'}</Text>
          </View>
        </View>
        {messages.length === 0 ? (
          <View style={styles.smsCard}>
            <Text style={styles.smsBodyText}>{inboxLoading ? 'Loading messages...' : 'No SMS messages received yet.'}</Text>
          </View>
        ) : messages.map((message) => {
          const code = message.message.match(/\b\d{4,8}\b/)?.[0];
          return (
            <View key={message.id} style={styles.smsCard}>
              <View style={styles.smsHeader}>
                <View style={styles.smsAppIcon}><MaterialCommunityIcons name="message-text-outline" size={18} color={colors.accentGreen} /></View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.smsAppTitle}>{message.appName}</Text>
                  <Text style={styles.smsTime}>{message.receivedAt} {message.phoneNumber ? `• ${message.phoneNumber}` : ''}</Text>
                </View>
                {code && <View style={styles.newBadge}><View style={styles.activeDot} /><Text style={styles.newBadgeText}>OTP</Text></View>}
              </View>
              <View style={styles.smsBodyBox}><Text style={styles.smsBodyText}>{message.message}</Text></View>
              {code && (
                <TouchableOpacity style={styles.copyButton} onPress={onCopyCode}>
                  <Ionicons name="copy-outline" size={14} color={colors.accentGreen} />
                  <Text style={styles.copyButtonText}>{codeCopied ? 'Copied to Clipboard!' : `Copy Code (${code})`}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </>}
    </View>
  );
}
