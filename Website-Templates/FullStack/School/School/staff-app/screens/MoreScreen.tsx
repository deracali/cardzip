import { LogOut, UserRound } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants'
import { Card, Heading, Screen, styles } from '../components/ui'

export function MoreScreen({ onSignOut }: { onSignOut: () => void }) {
  return <Screen><Heading eyebrow="STAFF ACCOUNT" title="Your profile" /><Card style={{ backgroundColor: colors.navy, borderColor: colors.navy, flexDirection: 'row', gap: 12, alignItems: 'center' }}><UserRound color={colors.white} size={24}/><View><Text style={{ color: colors.white, fontWeight: '800', fontSize: 12 }}>Mrs. Ada Okafor</Text><Text style={{ color: '#c2d0de', fontSize: 9, marginTop: 4 }}>Mathematics · Form teacher</Text></View></Card><Card><Text style={{ color: colors.navy, fontWeight: '800', fontSize: 12 }}>School notices</Text><Text style={{ color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 7 }}>Staff planning meeting · Friday, 7:45 AM · Main hall</Text></Card><TouchableOpacity onPress={onSignOut}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><LogOut color={colors.red} size={16}/><Text style={{ color: colors.red, fontSize: 11, fontWeight: '700' }}>Sign out</Text></Card></TouchableOpacity><Text style={{ color: colors.muted, fontSize: 9, textAlign: 'center' }}>Staff portal demo · Greenfield College</Text></Screen>
}
