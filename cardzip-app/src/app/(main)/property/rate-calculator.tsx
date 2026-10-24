import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchGiftCards } from '../../../store/slices/giftCardSlice';
import KeyboardAwareScrollView from '../../../components/KeyboardAwareScrollView';

export default function RateCalculatorScreen() {
  const dispatch = useAppDispatch();
  const { catalog, catalogLoading } = useAppSelector((state) => state.giftCards);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [amount, setAmount] = useState('100');

  useEffect(() => {
    if (!catalog.length && !catalogLoading) dispatch(fetchGiftCards({ page: 1 }));
  }, [catalog.length, catalogLoading, dispatch]);

  useEffect(() => {
    if (!selectedCardId && catalog.length) setSelectedCardId(catalog[0].id);
  }, [catalog, selectedCardId]);

  const selectedCard = catalog.find((card) => card.id === selectedCardId);
  const selectedRate = selectedCard?.types[0];
  const numericAmount = Number(amount.replace(/,/g, '')) || 0;
  const payout = numericAmount * (selectedRate?.rate ?? 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={21} color="#12201B" />
        </TouchableOpacity>
        <Text style={styles.title}>Rate Calculator</Text>
        <View style={styles.iconButton} />
      </View>

      <Text style={styles.sectionTitle}>Select gift card</Text>
      {catalogLoading && !catalog.length ? <ActivityIndicator color="#059669" /> : (
        <View style={styles.cardsGrid}>
          {catalog.map((card) => (
            <TouchableOpacity
              key={card.id}
              onPress={() => setSelectedCardId(card.id)}
              style={[styles.cardChoice, selectedCardId === card.id && styles.selectedCard]}
            >
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardRate}>{card.types[0] ? `₦${card.types[0].rate.toLocaleString()} / ${card.types[0].currency}` : 'Rate unavailable'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.amountPanel}>
        <Text style={styles.sectionTitle}>Card value ({selectedRate?.currency ?? 'USD'})</Text>
        <TextInput
          value={amount}
          onChangeText={(value) => setAmount(value.replace(/[^\d.]/g, ''))}
          keyboardType="decimal-pad"
          style={styles.amountInput}
          placeholder="Enter amount"
        />
        <Text style={styles.payoutLabel}>Estimated payout</Text>
        <Text style={styles.payout}>{selectedRate ? `₦${payout.toLocaleString()}` : 'Select a card with a rate'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.tradeButton, (!selectedCard || !selectedRate || numericAmount <= 0) && styles.disabledButton]}
        disabled={!selectedCard || !selectedRate || numericAmount <= 0}
        onPress={() => selectedCard && router.push({ pathname: '/(main)/property/trade', params: { cardId: selectedCard.id, cardName: selectedCard.name } })}
      >
        <Text style={styles.tradeButtonText}>Continue to Trade</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F5' },
  container: { flexGrow: 1, backgroundColor: '#F4F6F5', padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#12201B', fontSize: 19, fontWeight: '800' },
  sectionTitle: { color: '#12201B', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 },
  cardChoice: { width: '48%', backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  selectedCard: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  cardName: { color: '#12201B', fontSize: 13, fontWeight: '800' },
  cardRate: { color: '#059669', fontSize: 11, marginTop: 6 },
  amountPanel: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 18 },
  amountInput: { height: 48, backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, fontSize: 18, fontWeight: '700', color: '#12201B' },
  payoutLabel: { color: '#82918B', fontSize: 12, marginTop: 18 },
  payout: { color: '#059669', fontSize: 25, fontWeight: '900', marginTop: 4 },
  tradeButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#059669', borderRadius: 12 },
  tradeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  disabledButton: { opacity: 0.5 },
});