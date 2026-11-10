import { useState } from 'react'
import { CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants'
import { Button, Card, Heading, Screen, styles } from '../components/ui'
import type { PaymentMethod } from '../types'

const methods: PaymentMethod[] = ['Card', 'Bank transfer', 'Wallet']

export function FeesScreen({ paid, method, onMethodChange, onPay }: { paid: boolean; method: PaymentMethod; onMethodChange: (method: PaymentMethod) => void; onPay: () => void }) {
  const [message, setMessage] = useState('')
  const checkout = () => {
    if (paid) { setMessage('Your payment receipt is ready in this demo.'); return }
    onPay()
    setMessage('Payment successful in demo mode. No money was charged.')
  }
  return <Screen>
    <Heading eyebrow="STUDENT ACCOUNT" title="Fees & payments" />
    <Card><Text style={{ color: colors.muted, fontSize: 10 }}>TERM 1 · 2026/27</Text><Text style={{ color: colors.navy, fontSize: 28, fontWeight: '800', marginVertical: 8 }}>{paid ? '₦45,000 paid' : '₦45,000'}</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.muted, fontSize: 10 }}>Due 15 November 2026</Text><Text style={{ color: paid ? colors.green : '#cf8c1f', fontSize: 10, fontWeight: '800' }}>{paid ? 'PAID' : '₦15,000 remaining'}</Text></View></Card>
    <Heading eyebrow="FEE BREAKDOWN" title="Your statement" />
    <Card>{[['Tuition', '₦35,000'], ['Learning materials', '₦5,000'], ['Activities & sports', '₦3,000'], ['Technology levy', '₦2,000']].map(([label, amount]) => <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.line }}><Text style={{ color: colors.text, fontSize: 11 }}>{label}</Text><Text style={{ color: colors.navy, fontWeight: '700', fontSize: 11 }}>{amount}</Text></View>)}<View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 13 }}><Text style={{ fontWeight: '800', color: colors.navy, fontSize: 12 }}>Total</Text><Text style={{ fontWeight: '800', color: colors.navy, fontSize: 12 }}>₦45,000</Text></View></Card>
    <Heading eyebrow="CHECKOUT" title="Choose a payment method" />
    {methods.map((item) => <TouchableOpacity key={item} onPress={() => onMethodChange(item)}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: method === item ? colors.blue : colors.line }}><CreditCard color={method === item ? colors.blue : colors.muted} size={17}/><View style={{ flex: 1 }}><Text style={{ color: colors.navy, fontSize: 11, fontWeight: '700' }}>{item === 'Card' ? 'Card ending •••• 4014' : item}</Text><Text style={{ color: colors.muted, fontSize: 9, marginTop: 3 }}>{item === 'Card' ? 'Paystack · secure checkout' : item === 'Wallet' ? 'Available balance ₦52,450' : 'Transfer to school account'}</Text></View><Text style={{ color: method === item ? colors.blue : colors.muted, fontSize: 16 }}>{method === item ? '●' : '○'}</Text></Card></TouchableOpacity>)}
    <Card style={{ flexDirection: 'row', gap: 9, alignItems: 'center', backgroundColor: '#f1f8f5' }}><ShieldCheck color={colors.green} size={18}/><Text style={{ flex: 1, color: colors.muted, fontSize: 9, lineHeight: 15 }}>Checkout is a prototype. No card details are collected and no payment provider is connected.</Text></Card>
    <Button label={paid ? 'View receipt' : 'Pay ₦45,000 securely'} onPress={checkout} />
    {message ? <Card style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><CheckCircle2 size={17} color={colors.green}/><Text style={{ flex: 1, color: colors.green, fontSize: 10 }}>{message}</Text></Card> : null}
  </Screen>
}
