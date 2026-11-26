import HomePage from './components/HomePage'
import AuthPage from './pages/AuthPage'
import BookingPage from './pages/BookingPage'
import { AdminDashboard, ClientDashboard } from './pages/AccountPortals'
import PublicInfoPage from './pages/PublicInfoPage'

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/book') return <BookingPage />
  if (pathname === '/login') return <AuthPage mode="login" />
  if (pathname === '/signup') return <AuthPage mode="signup" />
  if (pathname === '/admin/login') return <AuthPage mode="login" portal="admin" />
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const view = pathname === '/admin' ? 'overview' : pathname.slice('/admin/'.length)
    if (['overview', 'appointments', 'clients', 'services'].includes(view)) return <AdminDashboard view={view} />
  }
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const view = pathname === '/dashboard' ? 'overview' : pathname.slice('/dashboard/'.length)
    if (['overview', 'appointments', 'profile'].includes(view)) return <ClientDashboard view={view} />
  }
  if (['services', 'stylists', 'packages', 'reviews'].includes(pathname.slice(1))) return <PublicInfoPage page={pathname.slice(1)} />
  if (pathname === '/') return <HomePage />

  return <main className="salon-account-page"><section className="salon-account-card"><span className="salon-kicker">404 · PAGE NOT FOUND</span><h1>This page is not part of Lumière.</h1><p>Return to the salon homepage to explore services and request an appointment.</p><a className="salon-button salon-button-primary" href="/">Back to Lumière</a></section></main>
}

export default App
