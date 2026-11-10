import { useEffect, type ReactElement } from 'react'
import { Shell } from './components/Shell'
import { useAdminState } from './hooks/useAdminState'
import { OverviewPage } from './pages/OverviewPage'
import { StudentsPage } from './pages/StudentsPage'
import { FeesPage } from './pages/FeesPage'
import { ResultsPage } from './pages/ResultsPage'
import { AttendancePage } from './pages/AttendancePage'
import { PinsPage } from './pages/PinsPage'
import { BroadcastPage } from './pages/BroadcastPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'
import type { AdminPath } from './types'

const pageTitles: Record<AdminPath, string> = {
  '/': 'Dashboard', '/students': 'Student records', '/fees': 'Fee collection',
  '/results': 'Results & performance', '/attendance': 'Attendance',
  '/pins': 'Scratch card PINs', '/broadcast': 'Broadcast center',
  '/settings': 'School settings', '/login': 'Admin sign in',
}

export default function App() {
  const path = (window.location.pathname.replace(/\/+$/, '') || '/') as AdminPath
  const { state, toggleAttendance, markPaid, addPins } = useAdminState()
  useEffect(() => { document.title = `Greenfield College | ${pageTitles[path] ?? 'Page not found'}` }, [path])
  const routes: Partial<Record<AdminPath, ReactElement>> = {
    '/': <OverviewPage state={state}/>,
    '/students': <StudentsPage/>,
    '/fees': <FeesPage fees={state.fees} onMarkPaid={markPaid}/>,
    '/results': <ResultsPage/>,
    '/attendance': <AttendancePage records={state.attendance} onToggle={toggleAttendance}/>,
    '/pins': <PinsPage pins={state.pins} onGenerate={addPins}/>,
    '/broadcast': <BroadcastPage/>,
    '/settings': <SettingsPage/>,
    '/login': <LoginPage/>,
  }
  const content = routes[path] ?? <section className="not-found"><span>404 · PAGE NOT FOUND</span><h1>That operations page is unavailable.</h1><p>Use the menu to return to a working section.</p><a className="primary-button" href="/">Back to dashboard</a></section>
  if (path === '/login') return content
  return <Shell path={path}>{content}</Shell>
}
