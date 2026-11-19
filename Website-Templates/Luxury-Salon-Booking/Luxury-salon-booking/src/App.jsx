import HomePage from './components/HomePage'
import AuthPage from './pages/AuthPage'
import BookingPage from './pages/BookingPage'
import { AdminDashboard, ClientDashboard } from './pages/AccountPortals'

function App() {
  const { pathname } = window.location

  if (pathname === '/book') return <BookingPage />
  if (pathname === '/login') return <AuthPage mode="login" />
  if (pathname === '/signup') return <AuthPage mode="signup" />
  if (pathname === '/admin/login') return <AuthPage mode="login" portal="admin" />
  if (pathname === '/admin') return <AdminDashboard />
  if (pathname === '/dashboard') return <ClientDashboard />
  if (pathname === '/') return <HomePage />

  return <main className="salon-account-page"><section className="salon-account-card"><span className="salon-kicker">404 · PAGE NOT FOUND</span><h1>This page is not part of Lumière.</h1><p>Return to the salon homepage to explore services and request an appointment.</p><a className="salon-button salon-button-primary" href="/">Back to Lumière</a></section></main>
}

export default App
