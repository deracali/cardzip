import { useState } from 'react'
import { BookOpen, ClipboardCheck, FileText, Grid2X2 } from 'lucide-react-native'
import { SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { colors } from './constants'
import { useStaffState } from './hooks/useStaffState'
import { HomeScreen } from './screens/HomeScreen'
import { AttendanceScreen } from './screens/AttendanceScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { MoreScreen } from './screens/MoreScreen'
import { LoginScreen } from './screens/LoginScreen'
import type { StaffTab } from './types'

const tabs: { name: StaffTab; Icon: typeof BookOpen }[] = [
  { name: 'Home', Icon: BookOpen }, { name: 'Attendance', Icon: ClipboardCheck },
  { name: 'Results', Icon: FileText }, { name: 'More', Icon: Grid2X2 },
]

export default function App() {
  const { state, toggleAttendance, submitAttendance, publishResults, signIn, signOut } = useStaffState()
  const [tab, setTab] = useState<StaffTab>('Home')
  if (!state.signedIn) return <><StatusBar barStyle="dark-content"/><SafeAreaView style={{ flex: 1 }}><LoginScreen onLogin={signIn}/></SafeAreaView></>
  let page
  if (tab === 'Home') page = <HomeScreen attendanceCount={state.attendance.filter((student) => student.present).length} goTo={setTab}/>
  else if (tab === 'Attendance') page = <AttendanceScreen records={state.attendance} onToggle={toggleAttendance} submitted={state.attendanceSubmitted} onSubmit={submitAttendance}/>
  else if (tab === 'Results') page = <ResultsScreen published={state.resultsPublished} onPublish={publishResults}/>
  else page = <MoreScreen onSignOut={signOut}/>
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.pale }}><StatusBar barStyle="dark-content"/><View style={{ flex: 1 }}>{page}</View><View style={{ height: 62, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white }}>{tabs.map(({ name, Icon }) => <TouchableOpacity key={name} onPress={() => setTab(name)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}><Icon size={18} color={tab === name ? colors.blue : colors.muted}/><Text style={{ color: tab === name ? colors.blue : colors.muted, fontWeight: tab === name ? '800' : '500', fontSize: 9 }}>{name}</Text></TouchableOpacity>)}</View></SafeAreaView>
}
