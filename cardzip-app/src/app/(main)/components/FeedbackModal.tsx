import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'success' | 'error' | 'info';
}

export default function FeedbackModal({
  visible,
  title,
  message,
  onClose,
  actionLabel = 'Done',
  onAction,
  tone = 'info',
}: FeedbackModalProps) {
  const iconName = tone === 'success' ? 'checkmark-circle' : tone === 'error' ? 'alert-circle' : 'information-circle';
  const accent = tone === 'error' ? '#B42318' : '#059669';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={[styles.iconWrap, { backgroundColor: tone === 'error' ? '#FEE4E2' : '#DCFCE7' }]}>
            <Ionicons name={iconName} size={27} color={accent} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {onAction && (
              <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                <Text style={styles.secondaryText}>Not now</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: accent }, onAction && styles.actionButton]}
              onPress={onAction ?? onClose}
            >
              <Text style={styles.primaryText}>{onAction ? actionLabel : 'Done'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15, 23, 42, 0.52)' },
  modal: { width: '100%', maxWidth: 360, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { color: '#12201B', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  message: { color: '#66736C', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 10, width: '100%', marginTop: 20 },
  primaryButton: { minWidth: 112, alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 10, paddingHorizontal: 16 },
  actionButton: { flex: 1 },
  primaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  secondaryButton: { minWidth: 100, alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 10, backgroundColor: '#F3F4F6', paddingHorizontal: 16 },
  secondaryText: { color: '#34443D', fontSize: 13, fontWeight: '700' },
});