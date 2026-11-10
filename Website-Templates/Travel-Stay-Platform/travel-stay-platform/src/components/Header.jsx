import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import Logo from './Logo'

const navItems = [
  ['Destinations', '/destinations'],
  ['Stays', '/stays'],
  ['Experiences', '/experiences'],
  ['List Your Property', '/list-property'],
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
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
          <a className="currency-link" href="/stays" aria-label="Choose currency">EN · USD <ChevronDown size={13} /></a>
          <a className="sign-in-link" href="/signin">Sign in</a>
          <a className="button button-primary button-small" href="/signup">Sign up</a>
        </div>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  )
}
