import { useState } from 'react'
import { CheckCircle2, FileText } from 'lucide-react-native'
import { Text, TextInput, View } from 'react-native'
import { colors } from '../constants'
import { Button, Card, Heading, Screen, styles } from '../components/ui'

const students = [['Adaeze Okafor', '88'], ['Tunde Bakare', '76'], ['Fatima Musa', '92'], ['Emeka Obi', '69'], ['Zainab Ali', '84']]
export function ResultsScreen({ published, onPublish }: { published: boolean; onPublish: () => void }) {
  const [scores, setScores] = useState(students.map((item) => item[1]))
  return <Screen><Heading eyebrow="ACADEMIC RECORDS" title="Class results" /><Card><Text style={{ color: colors.muted, fontSize: 10 }}>MATHEMATICS · JSS 3 GOLD · TERM 1</Text><Text style={{ color: colors.navy, fontWeight: '800', fontSize: 16, marginTop: 6 }}>Continuous assessment</Text><Text style={{ color: colors.muted, fontSize: 9, marginTop: 4 }}>Enter a score out of 100. Demo values only.</Text></Card>{students.map(([name], index) => <Card key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}><FileText color={colors.blue} size={16}/><Text style={{ flex: 1, color: colors.navy, fontSize: 10, fontWeight: '700' }}>{name}</Text><TextInput keyboardType="numeric" value={scores[index]} onChangeText={(value) => setScores((current) => current.map((score, itemIndex) => itemIndex === index ? value.replace(/\D/g, '').slice(0, 3) : score))} style={{ width: 55, textAlign: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 7, padding: 8, color: colors.navy, fontWeight: '800' }}/><Text style={{ fontSize: 9, color: colors.muted }}>/ 100</Text></Card>)}<Button label={published ? 'Results published' : 'Save & publish results'} onPress={onPublish}/>{published&&<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' }}><CheckCircle2 size={15} color={colors.green}/><Text style={{ color: colors.green, fontSize: 10 }}>Saved locally in this demo.</Text></View>}</Screen>
}
