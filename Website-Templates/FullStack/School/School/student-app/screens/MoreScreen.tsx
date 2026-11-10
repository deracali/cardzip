import { ChevronRight, CircleHelp, LogOut, UserRound } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants'
import { Card, Heading, Screen } from '../components/ui'

const menu: { label: string; page: 'Timetable' | 'Notices' | 'Profile' | 'Help' }[] = [
  { label: 'My timetable', page: 'Timetable' }, { label: 'Notices & messages', page: 'Notices' },
  { label: 'My profile', page: 'Profile' }, { label: 'Help & support', page: 'Help' },
]
export function MoreScreen({ onSelect, onSignOut }: { onSelect: (page: 'Timetable' | 'Notices' | 'Profile' | 'Help') => void; onSignOut: () => void }) {
  return <Screen><Heading eyebrow="YOUR SCHOOL ACCOUNT" title="More" /><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.navy, borderColor: colors.navy }}><View style={{ width: 43, height: 43, borderRadius: 22, backgroundColor: '#315177', alignItems: 'center', justifyContent: 'center' }}><UserRound color={colors.white} size={19}/></View><View><Text style={{ color: colors.white, fontWeight: '800', fontSize: 13 }}>Adaeze Okafor</Text><Text style={{ color: '#bfd0df', fontSize: 9, marginTop: 4 }}>JSS 3 Gold · Student ID 2026/033-042</Text></View></Card>{menu.map(({ label, page }) => <TouchableOpacity key={page} onPress={() => onSelect(page)}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}><CircleHelp color={colors.blue} size={17}/><Text style={{ flex: 1, color: colors.navy, fontSize: 11, fontWeight: '700' }}>{label}</Text><ChevronRight color={colors.muted} size={15}/></Card></TouchableOpacity>)}<TouchableOpacity onPress={onSignOut}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}><LogOut color={colors.red} size={17}/><Text style={{ color: colors.red, fontSize: 11, fontWeight: '700' }}>Sign out</Text></Card></TouchableOpacity><Text style={{ color: colors.muted, fontSize: 9, textAlign: 'center' }}>Greenfield College · Student portal demo</Text></Screen>
}
