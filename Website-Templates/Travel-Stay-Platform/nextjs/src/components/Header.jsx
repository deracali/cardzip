import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import { getSession } from '../services/escapesApi'

const navItems = [
  ['Destinations', '/destinations'],
  ['Stays', '/stays'],
  ['Experiences', '/experiences'],
  ['List Your Property', '/list-property'],
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const session = getSession()
  const dashboardHref = session?.user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <span className="currency-link">EN · USD</span>
          <a className="sign-in-link" href={dashboardHref}>Dashboard</a>
          {!session && <a className="button button-primary button-small" href="/signin">Sign in</a>}
        </div>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  )
}
