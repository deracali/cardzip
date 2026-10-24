import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface CardzipLoaderProps {
  label?: string;
  compact?: boolean;
  fullScreen?: boolean;
}

export default function CardzipLoader({ label = 'Loading…', compact = false, fullScreen = false }: CardzipLoaderProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, compact && styles.compact]} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size={compact ? 'small' : 'large'} color="#059669" />
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
  fullScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F4F6F5',
  },
  compact: {
    paddingVertical: 12,
  },
  label: {
    fontFamily: 'Poppins',
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
