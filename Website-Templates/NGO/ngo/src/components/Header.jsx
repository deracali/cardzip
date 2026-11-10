import { useState } from 'react'
import { Heart, Menu, X } from 'lucide-react'
import Logo from './Logo'

const links = [
  ['Our Causes', '/causes'],
  ['Impact Stories', '/impact'],
  ['Ways to Give', '/ways-to-give'],
  ['About Us', '/about'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <a className="header-icon" href="/signin" aria-label="Sign in"><Heart size={16} /></a>
          <a className="button button-green button-small" href="/donate">♡ &nbsp; Donate Now</a>
        </div>
        <button className="menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
  )
}
