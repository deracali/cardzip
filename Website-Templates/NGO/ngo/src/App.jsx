import { useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import CampaignPage from './pages/CampaignPage'
import CausesPage from './pages/CausesPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import InfoPage from './pages/InfoPage'
import { campaigns } from './data/campaigns'
import './App.css'

const pageTitles = {
  '/': 'Kindred | Give hope. Change lives.',
  '/causes': 'Our Causes | Kindred',
  '/impact': 'Our Impact | Kindred',
  '/ways-to-give': 'Ways to Give | Kindred',
  '/about': 'About Kindred',
  '/volunteer': 'Volunteer | Kindred',
  '/support': 'Donor Support | Kindred',
  '/privacy': 'Privacy | Kindred',
  '/checkout': 'Complete Your Gift | Kindred',
  '/donate': 'Donate | Kindred',
  '/signin': 'Sign In | Kindred',
  '/signup': 'Join Kindred',
}

export default function App() {
  const pathname = window.location.pathname
  const campaignSlug = pathname.match(/^\/causes\/([^/]+)$/)?.[1]
  const campaign = campaigns.find((item) => item.slug === campaignSlug)
  let title = pageTitles[pathname] || (campaign ? `${campaign.title} | Kindred` : 'Kindred | Give hope. Change lives.')
  if (pathname.startsWith('/volunteer?')) title = pageTitles['/volunteer']

  useEffect(() => {
    document.title = title
  }, [title])

  if (pathname === '/') return <HomePage />
  if (pathname === '/causes') return <CausesPage />
  if (pathname.startsWith('/causes/')) return campaign
    ? <CampaignPage campaign={campaign} />
    : <InfoPage page="impact" />
  if (pathname === '/checkout' || pathname === '/donate') return <CheckoutPage />
  if (pathname === '/signin') return <AuthPage />
  if (pathname === '/signup') return <AuthPage signup />
  if (['/about', '/impact', '/ways-to-give', '/volunteer', '/support', '/privacy'].includes(pathname)) {
    return <InfoPage page={pathname.slice(1)} />
  }
  return <InfoPage page="about" />
}
