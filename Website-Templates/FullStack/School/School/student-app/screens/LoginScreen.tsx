import { useState } from 'react'
import { BookOpen, ShieldCheck } from 'lucide-react-native'
import { Text, TextInput, View } from 'react-native'
import { colors } from '../constants'
import { Button, Card, styles } from '../components/ui'

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [notice, setNotice] = useState('')
  return <View style={{ flex: 1, backgroundColor: colors.pale, justifyContent: 'center', padding: 22, gap: 15 }}><Card style={{ padding: 22, gap: 15 }}><View style={{ width: 47, height: 47, backgroundColor: colors.navy, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><BookOpen color={colors.gold} size={23}/></View><View><Text style={styles.eyebrow}>GREENFIELD COLLEGE</Text><Text style={styles.title}>Welcome back.</Text><Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>Sign in to your student portal.</Text></View><TextInput placeholder="Student ID or email" autoCapitalize="none" style={inputStyle}/><TextInput placeholder="Password" secureTextEntry style={inputStyle}/><Button label="Sign in to student portal" onPress={() => { setNotice('Demo sign-in. Authentication is not connected.'); onLogin() }}/>{notice ? <Text style={{ color: colors.green, fontSize: 10 }}>{notice}</Text> : null}<View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}><ShieldCheck size={15} color={colors.green}/><Text style={{ flex: 1, color: colors.muted, fontSize: 9 }}>Demo only. Do not use real credentials.</Text></View></Card></View>
}

const inputStyle = { backgroundColor: '#f9fbfc', borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 12, fontSize: 11, color: colors.text }
