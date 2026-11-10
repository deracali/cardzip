import { useState } from 'react'
import { Menu, Plus, X } from 'lucide-react'
import './HomeHeader.css'

function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <a className="home-brand" href="/" aria-label="Carewell home">
          <span className="home-brand-mark"><Plus size={16} strokeWidth={4} /></span>
          <span>carewell<span>.</span></span>
        </a>

        <button
          className="home-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={menuOpen ? 'home-nav is-open' : 'home-nav'} aria-label="Main navigation">
          <a href="#doctors" onClick={closeMenu}>Find Doctors</a>
          <a href="#specialties" onClick={closeMenu}>Specialties</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <div className="home-nav-actions">
            <a className="home-login-link" href="/login" onClick={closeMenu}>Sign In</a>
            <a className="home-book-link" href="/signup" onClick={closeMenu}>Book Now <span aria-hidden="true">→</span></a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default HomeHeader
