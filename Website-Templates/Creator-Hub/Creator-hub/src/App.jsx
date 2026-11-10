import { useEffect } from 'react'
import HomePage from './components/HomePage'
import CreatorAuthPage from './pages/CreatorAuthPage'
import CreatorProfilePage from './pages/CreatorProfilePage'

function App() {
  const { pathname } = window.location

  useEffect(() => {
    if (pathname === '/login') {
      document.title = 'Sign in — CreatorHub'
    } else if (pathname === '/signup') {
      document.title = 'Claim your creator link — CreatorHub'
    } else if (pathname === '/maya-chen') {
      document.title = 'Maya Chen — CreatorHub'
    } else {
      document.title = 'CreatorHub — One link for your entire creator business'
    }
  }, [pathname])

  if (pathname === '/login') return <CreatorAuthPage />
  if (pathname === '/signup') return <CreatorAuthPage signUp />
  if (pathname === '/maya-chen') return <CreatorProfilePage />

  return <HomePage />
}

export default App
