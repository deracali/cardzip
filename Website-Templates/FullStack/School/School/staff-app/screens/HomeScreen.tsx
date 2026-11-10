import { useState } from 'react'
import { Bell, BookOpen, CalendarDays, CheckCircle2, Megaphone, Users } from 'lucide-react-native'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants'
import { Button, Card, Heading, Screen, styles } from '../components/ui'
import type { StaffTab } from '../types'

export function HomeScreen({ attendanceCount, goTo }: { attendanceCount: number; goTo: (tab: StaffTab) => void }) {
  const [announcement, setAnnouncement] = useState('')
  const [sent, setSent] = useState(false)
  return <Screen><View style={styles.heading}><View><Text style={styles.eyebrow}>WEDNESDAY · 5 NOVEMBER</Text><Text style={styles.title}>Good morning, Mrs. Okafor</Text></View><Bell size={18} color={colors.navy}/></View>
    <Card style={{ backgroundColor: colors.navy, borderColor: colors.navy }}><Text style={{ color: '#b8ccdf', fontSize: 10 }}>GREENFIELD COLLEGE · STAFF PORTAL</Text><Text style={{ color: colors.white, fontSize: 17, fontWeight: '800', marginTop: 8 }}>Your class is ready.</Text><Text style={{ color: '#b8ccdf', fontSize: 10, marginTop: 5 }}>JSS 3 Gold · Form teacher</Text></Card>
    <View style={{ flexDirection: 'row', gap: 10 }}><Card style={{ flex: 1 }}><Users color={colors.blue} size={17}/><Text style={{ color: colors.navy, fontSize: 22, fontWeight: '800', marginTop: 10 }}>{attendanceCount}/32</Text><Text style={{ color: colors.muted, fontSize: 9, marginTop: 3 }}>Students present</Text></Card><Card style={{ flex: 1 }}><BookOpen color={colors.green} size={17}/><Text style={{ color: colors.navy, fontSize: 22, fontWeight: '800', marginTop: 10 }}>3</Text><Text style={{ color: colors.muted, fontSize: 9, marginTop: 3 }}>Results to review</Text></Card></View>
    <Heading eyebrow="QUICK MANAGEMENT" title="Today's schedule"/>
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}><CalendarDays color={colors.blue} size={18}/><View style={{ flex: 1 }}><Text style={{ color: colors.navy, fontWeight: '800', fontSize: 11 }}>Mathematics · JSS 3 Gold</Text><Text style={{ color: colors.muted, fontSize: 9, marginTop: 4 }}>Block A · Room 12 · 10:00 AM</Text></View><Text style={{ color: colors.green, fontWeight: '800', fontSize: 9 }}>UP NEXT</Text></Card>
    <Button label="Take today's attendance" onPress={() => goTo('Attendance')}/>
    <Button label="Enter class results" secondary onPress={() => goTo('Results')}/>
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}><Megaphone color={colors.blue} size={16}/><Text style={{ color: colors.navy, fontSize: 12, fontWeight: '800' }}>Class announcement</Text></View><TextInput value={announcement} onChangeText={setAnnouncement} placeholder="Type a note for JSS 3 Gold..." multiline style={{ minHeight: 64, color: colors.navy, fontSize: 11, textAlignVertical: 'top', backgroundColor: colors.pale, borderRadius: 8, padding: 10 }}/><View style={{ marginTop: 9 }}><Button label={sent ? 'Announcement saved' : 'Save announcement'} onPress={() => { if (announcement.trim()) setSent(true) }}/></View>{sent&&<Text style={{ color: colors.green, fontSize: 9, marginTop: 8 }}>Saved locally for this demo. No message was sent.</Text>}</Card>
    <TouchableOpacity onPress={() => goTo('More')} style={{ flexDirection: 'row', justifyContent: 'center', gap: 7, padding: 9 }}><CheckCircle2 color={colors.green} size={15}/><Text style={{ color: colors.muted, fontSize: 9 }}>School year 2026/27 · Staff actions are demo-only</Text></TouchableOpacity>
  </Screen>
}
