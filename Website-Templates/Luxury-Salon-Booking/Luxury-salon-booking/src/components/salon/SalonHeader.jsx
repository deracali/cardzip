import { useState } from 'react'
import { ArrowRight, Menu, Phone, X } from 'lucide-react'

function SalonHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="salon-header">
      <div className="salon-header-inner">
        <a className="salon-brand" href="#home" aria-label="Lumière home">
          <span className="salon-brand-mark">L</span>
          <span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span>
        </a>

        <button
          className="salon-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={menuOpen ? 'salon-nav is-open' : 'salon-nav'} aria-label="Main navigation">
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#stylists" onClick={closeMenu}>Stylists</a>
          <a href="#services" onClick={closeMenu}>Packages</a>
          <a href="#reviews" onClick={closeMenu}>Reviews <span className="salon-nav-rating">4.9</span></a>
          <div className="salon-nav-actions">
            <a className="salon-phone-link" href="tel:+12125550148"><Phone size={13} /> (212) 555-0148</a>
            <a className="salon-button salon-button-dark" href="#booking" onClick={closeMenu}>Book Appointment <ArrowRight size={14} /></a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default SalonHeader
