"use client";

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useEffect } from 'react'
import { ApiError, apiRequest } from '../services/api'

function CreatorHubHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountHref, setAccountHref] = useState('/login')
  const [accountLabel, setAccountLabel] = useState('Sign in')
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    apiRequest<{ user: { role: string } | null }>('/auth/me')
      .then(({ user }) => {
        if (user) {
          setAccountHref(user.role === 'admin' ? '/admin' : '/dashboard')
          setAccountLabel(user.role === 'admin' ? 'Admin' : 'Dashboard')
        }
      })
      .catch((error: unknown) => {
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error('Unable to check Creator Hub session:', error)
        }
      })
  }, [])

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
          <a href="/features" onClick={closeMenu}>Features</a>
          <a href="/creators" onClick={closeMenu}>Creators</a>
          <a href="/explore" onClick={closeMenu}>Explore</a>
          <a href="/store" onClick={closeMenu}>Store</a>
          <a href="/blog" onClick={closeMenu}>Blog</a>
          <a href="/resources" onClick={closeMenu}>Resources</a>
          <a href="/#pricing" onClick={closeMenu}>Pricing</a>
          <a href="/about" onClick={closeMenu}>About</a>
          <div className="creator-nav-actions">
            <a className="creator-sign-in" href={accountHref} onClick={closeMenu}>{accountLabel}</a>
            <a className="creator-button creator-button-dark" href="/signup" onClick={closeMenu}>Claim your link — free</a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default CreatorHubHeader
