import { ArrowUpRight, Menu, Phone, Wrench, X } from 'lucide-react'
import { useState } from 'react'
import { getHomeServiceSession } from '../../services/homeServiceDemoStore'

function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [session] = useState(getHomeServiceSession)
  const closeMenu = () => setMenuOpen(false)
  const dashboardHref = session?.user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <header className="ff-header">
      <div className="ff-header-inner">
        <a className="ff-brand" href="/" aria-label="FixFlow Pro home">
          <span className="ff-brand-mark"><Wrench size={17} /></span>
          <span>FixFlow Pro<small>PLUMBING · HVAC · REPAIR</small></span>
        </a>

        <button
          className="ff-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="ff-main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav id="ff-main-nav" className={menuOpen ? 'ff-nav is-open' : 'ff-nav'} aria-label="Main navigation">
          <a href="/services" onClick={closeMenu}>Services</a>
          <a href="/pricing" onClick={closeMenu}>Pricing</a>
          <a href="/service-area" onClick={closeMenu}>Service area</a>
          <a className="ff-button ff-button-orange ff-header-account" href={session ? dashboardHref : '/login'} onClick={closeMenu}>
            {session ? 'Dashboard' : 'Sign in'}
          </a>
          <div className="ff-header-actions">
            <a className="ff-phone-link" href="tel:+18005550199"><Phone size={14} /> (800) 555-0199</a>
            <a className="ff-button ff-button-orange ff-header-cta" href="/book-now" onClick={closeMenu}>
              Request service <ArrowUpRight size={14} />
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default HomeHeader
