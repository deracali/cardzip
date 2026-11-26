import { useEffect } from 'react'
import HomePage from './components/HomePage'
import { AdminDashboard, AuthPage, BookingPage, ClientDashboard } from './pages/AccountPortals'
import InformationPage from './pages/InformationPage'

export default function App() {
  const { pathname } = window.location

  useEffect(() => {
    const titles = {
      '/': 'FixFlow Pro | Local Plumbing & HVAC Experts',
      '/book-now': 'Request Service | FixFlow Pro',
      '/login': 'Client Sign In | FixFlow Pro',
      '/signup': 'Create Client Account | FixFlow Pro',
      '/dashboard': 'Client Dashboard | FixFlow Pro',
      '/dashboard/requests': 'Service Requests | FixFlow Pro',
      '/dashboard/profile': 'Profile | FixFlow Pro',
      '/admin': 'Admin Dashboard | FixFlow Pro',
      '/admin/requests': 'Service Requests | FixFlow Pro',
      '/admin/clients': 'Clients | FixFlow Pro',
      '/admin/settings': 'Admin Settings | FixFlow Pro',
      '/admin/login': 'Administrator Sign In | FixFlow Pro',
      '/services': 'Home Services | FixFlow Pro',
      '/pricing': 'Service Pricing | FixFlow Pro',
      '/service-area': 'Service Area | FixFlow Pro',
    }
    document.title = titles[pathname] || 'FixFlow Pro | Local Plumbing & HVAC Experts'
  }, [pathname])

  if (pathname === '/login') return <AuthPage />
  if (pathname === '/signup') return <AuthPage signup />
  if (pathname === '/admin/login') return <AuthPage expectedRole="admin" />
  if (pathname === '/book-now') return <BookingPage />
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return <ClientDashboard />
  if (pathname === '/admin' || pathname === '/admin/dashboard' || pathname.startsWith('/admin/')) return <AdminDashboard />
  if (pathname === '/services' || pathname === '/pricing' || pathname === '/service-area') return <InformationPage page={pathname.slice(1)} />

  return <HomeServiceHome />
}

function HomeServiceHome() {
  return <HomePage />
}
