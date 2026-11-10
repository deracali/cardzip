import { ArrowRight, Bell, BookOpen, CalendarDays, Clock3, FileText } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants'
import { Button, Card, Heading, Screen, styles } from '../components/ui'
import type { StudentTab } from '../types'

const assignments = [
  { subject: 'Mathematics', title: 'Quadratic Equations · Ex 4b', due: 'Due tomorrow · Ms. Akinola', state: 'Pending' },
  { subject: 'English', title: 'Summary & Comprehension', due: 'Submitted · awaiting marking', state: 'Submitted' },
  { subject: 'Basic Science', title: 'Lab Report: Photosynthesis', due: 'Graded · 92% Excellent', state: 'Graded' },
]

export function HomeScreen({ feesPaid, goTo }: { feesPaid: boolean; goTo: (tab: StudentTab) => void }) {
  return <Screen>
    <View style={styles.heading}><View><Text style={styles.eyebrow}>WEDNESDAY, 5 NOVEMBER</Text><Text style={styles.title}>Welcome, Adaeze</Text></View><TouchableOpacity accessibilityLabel="Notifications"><Bell color={colors.navy} size={19}/></TouchableOpacity></View>
    <Card style={{ backgroundColor: colors.navy, borderColor: colors.navy }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={{ color: '#b8ccdf', fontSize: 10 }}>JSS 3 Gold</Text><Text style={{ color: colors.white, fontWeight: '800', fontSize: 15, marginTop: 4 }}>Term 1, 2025/26</Text><Text style={{ color: '#b8ccdf', fontSize: 10, marginTop: 6 }}>Class teacher: Mrs. Okafor</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: colors.gold, fontWeight: '800', fontSize: 20 }}>A</Text><Text style={{ color: '#b8ccdf', fontSize: 9 }}>Good standing</Text></View></View></Card>
    <Card><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ color: colors.muted, fontSize: 10 }}>TERM 1 SCHOOL FEES</Text><Text style={{ color: colors.navy, fontSize: 21, fontWeight: '800', marginTop: 5 }}>₦45,000</Text><Text style={{ color: colors.muted, fontSize: 10, marginTop: 4 }}>Due 15 November · First term</Text></View><Text style={{ color: feesPaid ? colors.green : '#dc8d22', fontWeight: '800', fontSize: 10 }}>{feesPaid ? 'PAID' : '75% PAID'}</Text></View><View style={{ height: 6, backgroundColor: '#edf1f4', borderRadius: 9, marginTop: 13 }}><View style={{ width: feesPaid ? '100%' : '75%', height: 6, backgroundColor: colors.green, borderRadius: 9 }} /></View><View style={{ marginTop: 13 }}><Button label={feesPaid ? 'View payment receipt' : 'Pay remaining ₦15,000'} onPress={() => goTo('Fees')} /></View><Text style={{ color: colors.muted, fontSize: 9, textAlign: 'center', marginTop: 8 }}>Secure checkout · Demo payment only</Text></Card>
    <Heading eyebrow="LEARNING & ASSIGNMENTS" title="Homework" action={<TouchableOpacity onPress={() => goTo('Results')}><Text style={{ color: colors.blue, fontWeight: '700', fontSize: 10 }}>View all</Text></TouchableOpacity>} />
    {assignments.map((item) => <Card key={item.title} style={{ padding: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 31, height: 31, borderRadius: 8, backgroundColor: item.state === 'Graded' ? '#e5f7ef' : '#f0f3f8', alignItems: 'center', justifyContent: 'center' }}><BookOpen color={item.state === 'Graded' ? colors.green : colors.blue} size={15}/></View><View style={{ flex: 1 }}><Text style={{ color: colors.navy, fontWeight: '700', fontSize: 11 }}>{item.title}</Text><Text style={{ color: colors.muted, fontSize: 9, marginTop: 3 }}>{item.subject} · {item.due}</Text></View><Text style={{ color: item.state === 'Pending' ? '#d48c19' : colors.green, fontSize: 9, fontWeight: '800' }}>{item.state}</Text></View></Card>)}
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#eef7ff' }}><CalendarDays color={colors.blue} size={18}/><View style={{ flex: 1 }}><Text style={{ color: colors.navy, fontWeight: '800', fontSize: 11 }}>Next up: Science practical</Text><Text style={{ color: colors.muted, fontSize: 9, marginTop: 3 }}>Tomorrow · Lab 2 · 10:00 AM</Text></View><Clock3 color={colors.blue} size={16}/></Card>
    <TouchableOpacity onPress={() => goTo('Results')} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, padding: 8 }}><FileText size={14} color={colors.blue}/><Text style={{ color: colors.blue, fontSize: 10, fontWeight: '700' }}>Check your term results</Text><ArrowRight size={13} color={colors.blue}/></TouchableOpacity>
  </Screen>
}
