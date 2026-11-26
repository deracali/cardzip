import { useEffect, useState } from 'react'
import { Menu, UserRound, X } from 'lucide-react'
import Logo from './Logo'
import { getNGOSession } from '../services/localStore'

const links = [
  ['Our Causes', '/causes'],
  ['Impact Stories', '/impact'],
  ['Ways to Give', '/ways-to-give'],
  ['About Us', '/about'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(null)
  useEffect(() => {
    const syncSession = () => setSession(getNGOSession())
    syncSession()
    window.addEventListener('kindred-session-change', syncSession)
    window.addEventListener('storage', syncSession)
    return () => {
      window.removeEventListener('kindred-session-change', syncSession)
      window.removeEventListener('storage', syncSession)
    }
  }, [])
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
          {session?.user?.role === 'client' && <a href="/dashboard#gift-history" onClick={() => setOpen(false)}>My pledges</a>}
        </nav>
        <div className="header-actions">
          <a className="header-icon" href={session?.user?.role === 'admin' ? '/admin' : session ? '/dashboard' : '/signin'} aria-label={session ? 'Open your dashboard' : 'Sign in'}><UserRound size={16} /></a>
          <a className="button button-green button-small" href="/donate">♡ &nbsp; Donate Now</a>
        </div>
        <button className="menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
  )
}
