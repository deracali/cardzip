import type { PropsWithChildren, ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native'
import { colors } from '../constants'

export function Screen({ children }: PropsWithChildren) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView>
}
export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>
}
export function Heading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <View style={styles.heading}><View><Text style={styles.eyebrow}>{eyebrow?.toUpperCase()}</Text><Text style={styles.title}>{title}</Text></View>{action}</View>
}
export function Button({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return <TouchableOpacity onPress={onPress} style={[styles.button, secondary && styles.secondary]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text></TouchableOpacity>
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.pale },
  content: { padding: 18, paddingBottom: 28, gap: 14 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  eyebrow: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 1.3, marginBottom: 5 },
  title: { color: colors.navy, fontSize: 21, fontWeight: '800' },
  card: { backgroundColor: colors.white, borderRadius: 13, padding: 15, borderWidth: 1, borderColor: colors.line },
  button: { minHeight: 44, borderRadius: 9, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15 },
  buttonText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  secondaryText: { color: colors.navy },
})
