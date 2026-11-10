import { useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import BookingPage from './pages/BookingPage'
import CheckoutPage from './pages/CheckoutPage'
import ExplorePage from './pages/ExplorePage'
import HomePage from './pages/HomePage'
import StayDetailPage from './pages/StayDetailPage'
import StayListPage from './pages/StayListPage'
import { stays } from './data/stays'
import './App.css'

function getPageTitle(pathname, stay) {
  if (pathname === '/stays') return 'Stays in Bali | Escapes'
  if (pathname === '/checkout') return 'Checkout | Escapes'
  if (pathname === '/signin') return 'Sign in | Escapes'
  if (pathname === '/signup') return 'Create an account | Escapes'
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
  const selectedStay = stays.find((stay) => stay.slug === stayMatch?.[1])
  const title = getPageTitle(pathname, selectedStay)

  useEffect(() => {
    document.title = title
  }, [title])

  if (pathname === '/') return <HomePage />
  if (pathname === '/stays') return <StayListPage />
  if (pathname === '/checkout') return <CheckoutPage />
  if (pathname === '/signin') return <AuthPage />
  if (pathname === '/signup') return <AuthPage signup />
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
