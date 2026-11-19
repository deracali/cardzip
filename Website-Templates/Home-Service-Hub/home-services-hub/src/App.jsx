import { useEffect, useState } from 'react'
import HomePage from './components/HomePage'
import { AdminDashboard, AuthPage, BookingPage, ClientDashboard } from './pages/AccountPortals'

export default function App({ apiBaseUrl = 'http://localhost:5200/api' }) {
  const { pathname } = window.location

  useEffect(() => {
    const titles = {
      '/': 'FixFlow Pro | Local Plumbing & HVAC Experts',
      '/book-now': 'Request Service | FixFlow Pro',
      '/login': 'Client Sign In | FixFlow Pro',
      '/signup': 'Create Client Account | FixFlow Pro',
      '/dashboard': 'Client Dashboard | FixFlow Pro',
      '/admin': 'Admin Dashboard | FixFlow Pro',
      '/admin/login': 'Administrator Sign In | FixFlow Pro',
    }
    document.title = titles[pathname] || 'FixFlow Pro | Local Plumbing & HVAC Experts'
  }, [pathname])

  if (pathname === '/login') return <AuthPage apiBaseUrl={apiBaseUrl} />
  if (pathname === '/signup') return <AuthPage apiBaseUrl={apiBaseUrl} signup />
  if (pathname === '/admin/login') return <AuthPage apiBaseUrl={apiBaseUrl} expectedRole="admin" />
  if (pathname === '/book-now') return <BookingPage apiBaseUrl={apiBaseUrl} />
  if (pathname === '/dashboard') return <ClientDashboard apiBaseUrl={apiBaseUrl} />
  if (pathname === '/admin' || pathname === '/admin/dashboard') return <AdminDashboard apiBaseUrl={apiBaseUrl} />

  return <HomeServiceHome />
}

function HomeServiceHome() {
  const [selectedRepair, setSelectedRepair] = useState('pipe')
  return <HomePage selectedRepair={selectedRepair} onRepairChange={setSelectedRepair} />
}
