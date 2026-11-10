import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

function ServiceHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="service-header">
      <div className="service-header-inner">
        <a className="service-brand" href="/" aria-label="NOVA Studio home">
          <img className="service-brand-mark" src="/favicon.svg" alt="" />
          <span>NOVA Studio<small>HOME SERVICES</small></span>
        </a>

        <button
          className="service-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={menuOpen ? 'service-nav is-open' : 'service-nav'} aria-label="Main navigation">
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#reviews" onClick={closeMenu}>Reviews</a>
          <a href="#estimate" onClick={closeMenu}>Pricing</a>
          <a className="service-nav-cta" href="#estimate" onClick={closeMenu}>Get an estimate <ArrowUpRight size={14} /></a>
        </nav>
      </div>
    </header>
  )
}

export default ServiceHeader
