import { useEffect } from 'react'
import HomePage from './components/HomePage'
import CreatorAuthPage from './pages/CreatorAuthPage'
import CreatorInfoPage from './pages/CreatorInfoPage'
import CreatorProfilePage from './pages/CreatorProfilePage'
import SiteContentPage from './pages/SiteContentPage'
import { featuredCreators } from './pages/creatorPageContent'

const infoPages = new Set(['/features', '/creators', '/resources', '/about', '/help', '/terms', '/privacy'])
const infoTitles = {
  '/features': 'Features — CreatorHub',
  '/creators': 'Creator directory — CreatorHub',
  '/explore': 'Explore CreatorHub',
  '/store': 'Creator storefront — CreatorHub',
  '/blog': 'CreatorHub blog',
  '/resources': 'Creator resources — CreatorHub',
  '/about': 'About CreatorHub',
  '/help': 'Help center — CreatorHub',
  '/terms': 'Terms of service — CreatorHub',
  '/privacy': 'Privacy — CreatorHub',
}

function App() {
  const { pathname } = window.location

  useEffect(() => {
    if (pathname === '/login') {
      document.title = 'Sign in — CreatorHub'
    } else if (pathname === '/signup') {
      document.title = 'Claim your creator link — CreatorHub'
    } else if (featuredCreators.some((creator) => `/${creator.handle}` === pathname)) {
      document.title = `${featuredCreators.find((creator) => `/${creator.handle}` === pathname)?.displayName} — CreatorHub`
    } else if (infoPages.has(pathname)) {
      document.title = infoTitles[pathname]
    } else if (pathname === '/blog') {
      document.title = infoTitles[pathname]
    } else if (pathname === '/store' || pathname === '/explore') {
      document.title = infoTitles[pathname]
    } else if (pathname.startsWith('/blog/')) {
      document.title = 'Creator story — CreatorHub'
    } else if (pathname.startsWith('/resources/')) {
      document.title = 'Creator guide — CreatorHub'
    } else {
      document.title = 'CreatorHub — One link for your entire creator business'
    }
  }, [pathname])

  if (pathname === '/login') return <CreatorAuthPage />
  if (pathname === '/signup') return <CreatorAuthPage signUp />
  const creator = featuredCreators.find((item) => `/${item.handle}` === pathname)
  if (creator) return <CreatorProfilePage creator={creator} />
  if (pathname === '/blog') return <SiteContentPage page="blog" />
  if (pathname.startsWith('/blog/')) return <SiteContentPage page="article" slug={pathname.split('/').filter(Boolean)[1]} />
  if (pathname === '/explore') return <SiteContentPage page="explore" />
  if (pathname === '/store') return <SiteContentPage page="store" />
  if (infoPages.has(pathname)) return <CreatorInfoPage page={pathname.slice(1)} />
  if (pathname.startsWith('/resources/')) return <CreatorInfoPage page="article" slug={pathname.split('/').filter(Boolean)[1]} />

  return <HomePage />
}

export default App
