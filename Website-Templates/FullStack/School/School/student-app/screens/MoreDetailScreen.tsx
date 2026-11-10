import { ArrowLeft, BookOpen, CalendarDays, CircleHelp, UserRound } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants'
import { Card, Heading, Screen, styles } from '../components/ui'
import type { StudentTab } from '../types'

const details: Record<'Timetable' | 'Notices' | 'Profile' | 'Help', { eyebrow: string; title: string; lines: string[] }> = {
  Timetable: { eyebrow: 'THURSDAY · JSS 3 GOLD', title: 'My timetable', lines: ['08:00 · Mathematics · Room 12', '09:00 · English Language · Room 8', '10:00 · Basic Science · Lab 2', '11:30 · Social Studies · Room 12', '13:00 · ICT · Computer lab'] },
  Notices: { eyebrow: 'SCHOOL COMMUNITY', title: 'Notices & messages', lines: ['Mid-term parent meeting · Friday, 7:45 AM', 'Science practical moved to Lab 2 · Tomorrow', 'Library books due next Wednesday'] },
  Profile: { eyebrow: 'STUDENT RECORD', title: 'My profile', lines: ['Adaeze Okafor', 'Student ID · 2026/033-042', 'JSS 3 Gold · Term 1, 2026/27', 'Parent contact · On file'] },
  Help: { eyebrow: 'STUDENT SUPPORT', title: 'Help & support', lines: ['Ask your class teacher for help with assignments.', 'Visit the school office for fee account questions.', 'This demo app does not send messages to school staff.'] },
}
const icons = { Timetable: CalendarDays, Notices: BookOpen, Profile: UserRound, Help: CircleHelp }

export function MoreDetailScreen({ page, onBack }: { page: 'Timetable' | 'Notices' | 'Profile' | 'Help'; onBack: () => void }) {
  const content = details[page]
  const Icon = icons[page]
  return <Screen><Heading eyebrow={content.eyebrow} title={content.title} action={<TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><ArrowLeft size={14} color={colors.blue}/><Text style={{ color: colors.blue, fontSize: 10, fontWeight: '700' }}>More</Text></TouchableOpacity>}/>{content.lines.map((line) => <Card key={line} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon size={16} color={colors.blue}/><Text style={{ flex: 1, color: colors.navy, fontSize: 11, lineHeight: 17 }}>{line}</Text></Card>)}</Screen>
}
