import { useState } from 'react'
import { BookOpen, CreditCard, FileText, Grid2X2 } from 'lucide-react-native'
import { SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { colors } from './constants'
import { useStudentState } from './hooks/useStudentState'
import { HomeScreen } from './screens/HomeScreen'
import { FeesScreen } from './screens/FeesScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { MoreScreen } from './screens/MoreScreen'
import { LoginScreen } from './screens/LoginScreen'
import { MoreDetailScreen } from './screens/MoreDetailScreen'
import type { PaymentMethod, StudentTab } from './types'

const tabs: { name: StudentTab; Icon: typeof BookOpen }[] = [
  { name: 'Home', Icon: BookOpen }, { name: 'Fees', Icon: CreditCard },
  { name: 'Results', Icon: FileText }, { name: 'More', Icon: Grid2X2 },
]

export default function App() {
  const { state, setPaymentMethod, payFees, signOut, signIn } = useStudentState()
  const [tab, setTab] = useState<StudentTab>('Home')
  if (!state.signedIn) return <><StatusBar barStyle="dark-content"/><SafeAreaView style={{ flex: 1 }}><LoginScreen onLogin={signIn}/></SafeAreaView></>
  let page
  if (tab === 'Home') page = <HomeScreen feesPaid={state.feesPaid} goTo={setTab}/>
  else if (tab === 'Fees') page = <FeesScreen paid={state.feesPaid} method={state.paymentMethod} onMethodChange={(method: PaymentMethod) => setPaymentMethod(method)} onPay={payFees}/>
  else if (tab === 'Results') page = <ResultsScreen/>
  else if (tab === 'More') page = <MoreScreen onSelect={setTab} onSignOut={signOut}/>
  else page = <MoreDetailScreen page={tab} onBack={() => setTab('More')}/>
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.pale }}><StatusBar barStyle="dark-content"/><View style={{ flex: 1 }}>{page}</View><View style={{ height: 62, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white }}>{tabs.map(({ name, Icon }) => <TouchableOpacity key={name} onPress={() => setTab(name)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}><Icon size={18} color={tab === name ? colors.blue : colors.muted}/><Text style={{ color: tab === name ? colors.blue : colors.muted, fontWeight: tab === name ? '800' : '500', fontSize: 9 }}>{name}</Text></TouchableOpacity>)}</View></SafeAreaView>
}
