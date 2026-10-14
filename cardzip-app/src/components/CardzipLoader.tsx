import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface CardzipLoaderProps {
  label?: string;
  compact?: boolean;
}

export default function CardzipLoader({ label = 'Loading Cardzip…', compact = false }: CardzipLoaderProps) {
  return (
    <View style={[styles.container, compact && styles.compact]} accessibilityRole="progressbar" accessibilityLabel={label}>
      <View style={styles.spinnerWrap}>
        <ActivityIndicator size={compact ? 'small' : 'large'} color="#059669" />
      </View>
      <Text style={styles.brand}>CARDZIP</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 24,
  },
  compact: {
    paddingVertical: 12,
  },
  spinnerWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },
  brand: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
