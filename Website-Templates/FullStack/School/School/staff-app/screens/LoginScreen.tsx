import { BookOpen, ShieldCheck } from 'lucide-react-native'
import { Text, TextInput, View } from 'react-native'
import { colors } from '../constants'
import { Button, Card, styles } from '../components/ui'

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return <View style={{ flex: 1, backgroundColor: colors.pale, justifyContent: 'center', padding: 22 }}><Card style={{ padding: 22, gap: 15 }}><BookOpen color={colors.navy} size={28}/><View><Text style={styles.eyebrow}>GREENFIELD COLLEGE · STAFF</Text><Text style={styles.title}>Welcome back.</Text><Text style={{ color: colors.muted, fontSize: 10, marginTop: 5 }}>Sign in to your teacher portal.</Text></View><TextInput placeholder="Staff email" autoCapitalize="none" style={inputStyle}/><TextInput placeholder="Password" secureTextEntry style={inputStyle}/><Button label="Sign in" onPress={onLogin}/><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><ShieldCheck color={colors.green} size={14}/><Text style={{ color: colors.muted, fontSize: 9 }}>Demo only. Authentication is not connected.</Text></View></Card></View>
}

const inputStyle = { backgroundColor: '#f9fbfc', borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 12, fontSize: 11, color: colors.text }
