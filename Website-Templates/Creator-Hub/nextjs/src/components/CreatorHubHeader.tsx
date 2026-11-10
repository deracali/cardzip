"use client";

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

function CreatorHubHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="creator-header">
      <div className="creator-header-inner">
        <a className="creator-brand" href="/" aria-label="CreatorHub home">
          <img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" />
          <span>CreatorHub</span>
        </a>
        <button
          className="creator-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? 'creator-nav is-open' : 'creator-nav'} aria-label="Main navigation">
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#pricing" onClick={closeMenu}>Pricing</a>
          <a href="#examples" onClick={closeMenu}>Examples</a>
          <a href="#latest-drops" onClick={closeMenu}>Blog</a>
          <div className="creator-nav-actions">
            <a className="creator-sign-in" href="/login" onClick={closeMenu}>Sign in</a>
            <a className="creator-button creator-button-dark" href="/signup" onClick={closeMenu}>Claim your link — free</a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default CreatorHubHeader
