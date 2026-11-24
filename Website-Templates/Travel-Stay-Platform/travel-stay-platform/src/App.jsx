import { useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import BookingPage from './pages/BookingPage'
import CheckoutPage from './pages/CheckoutPage'
import ExplorePage from './pages/ExplorePage'
import HomePage from './pages/HomePage'
import StayDetailPage from './pages/StayDetailPage'
import StayListPage from './pages/StayListPage'
import ClientDashboardPage from './pages/ClientDashboardPage'
import AdminAuthPage from './pages/AdminAuthPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import PaymentCallbackPage from './pages/PaymentCallbackPage'
import { getStays } from './services/escapesApi'
import './App.css'

function getPageTitle(pathname, stay) {
  if (pathname === '/stays') return 'Stays in Bali | Escapes'
  if (pathname === '/checkout') return 'Checkout | Escapes'
  if (pathname === '/payment/callback') return 'Payment result | Escapes'
  if (pathname === '/signin') return 'Sign in | Escapes'
  if (pathname === '/signup') return 'Create an account | Escapes'
  if (pathname === '/client/dashboard') return 'My trips | Escapes'
  if (pathname.startsWith('/admin')) return 'Admin portal | Escapes'
  if (stay) return `${stay.name} | Escapes`
  if (pathname === '/destinations') return 'Explore destinations | Escapes'
  if (pathname === '/experiences') return 'Travel experiences | Escapes'
  if (pathname === '/list-property') return 'List your property | Escapes'
  if (pathname === '/support') return 'Guest support | Escapes'
  if (pathname === '/about') return 'About Escapes'
  return 'Escapes | Extraordinary stays & travel experiences'
}

export default function App() {
  const pathname = window.location.pathname
  const stayMatch = pathname.match(/^\/(?:stays|reserve)\/([^/]+)$/)
  const selectedStay = stayMatch ? getStays().find((stay) => stay.slug === stayMatch[1]) : null
  const title = getPageTitle(pathname, selectedStay)

  useEffect(() => {
    document.title = title
  }, [title])

  if (pathname === '/') return <HomePage />
  if (pathname === '/stays') return <StayListPage />
  if (pathname === '/checkout') return <CheckoutPage />
  if (pathname === '/payment/callback') return <PaymentCallbackPage />
  if (pathname === '/signin') return <AuthPage />
  if (pathname === '/signup') return <AuthPage signup />
  if (pathname === '/client/dashboard') return <ClientDashboardPage />
  if (pathname === '/admin/login') return <AdminAuthPage />
  if (pathname === '/admin/signup') return <AdminAuthPage signup />
  if (pathname === '/admin/dashboard') return <AdminDashboardPage section="overview" />
  if (pathname === '/admin/reservations') return <AdminDashboardPage section="reservations" />
  if (pathname === '/admin/stays') return <AdminDashboardPage section="properties" />
  if (pathname === '/admin/guests') return <AdminDashboardPage section="guests" />
  if (pathname.startsWith('/reserve/')) {
    return selectedStay
      ? <BookingPage stay={selectedStay} />
      : <ExplorePage title="Stay not found" description="We couldn’t find that property. Browse our collection to find your next escape." />
  }
  if (pathname.startsWith('/stays/')) {
    return selectedStay
      ? <StayDetailPage stay={selectedStay} />
      : <ExplorePage title="Stay not found" description="We couldn’t find that property. Browse our collection to find your next escape." />
  }
  if (pathname === '/destinations') return <ExplorePage title="Explore destinations" description="Find a place that feels a little different. Start with one of our favorite escapes." />
  if (pathname === '/experiences') return <ExplorePage title="Travel your way" description="Thoughtful stays and memorable experiences, chosen to make every trip yours." />
  if (pathname === '/list-property') return <ExplorePage title="Share your space with the world" description="Welcome travelers to a home they’ll remember. Connect with our hosting team to get started." />
  if (pathname === '/support') return <ExplorePage title="We’re here to help" description="Find a stay, make a change, or get in touch with the Escapes guest support team." />
  if (pathname === '/about') return <ExplorePage title="A better way to get away" description="Escapes brings together thoughtful hosts and memorable places, so your next trip feels effortless." />
  return <ExplorePage title="Page not found" description="This page may have moved. Explore our stays and find somewhere wonderful." />
}
