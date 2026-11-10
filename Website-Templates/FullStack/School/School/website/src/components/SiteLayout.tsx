import { ArrowRight, BookOpen, Menu, X } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'

export function SiteLayout({ children }: PropsWithChildren) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <>
    <header className="site-header">
      <a className="brand" href="/" aria-label="Greenfield College home"><span className="brand-mark"><BookOpen size={20} /></span><span>GREENFIELD<small>COLLEGE</small></span></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? 'site-nav show' : 'site-nav'} onClick={() => setMenuOpen(false)}>
        <a href="/about">About</a><a href="/academics">Academics</a><a href="/admissions">Admissions</a><a href="/campus-life">Campus life</a><a href="/contact">Contact</a>
      </nav>
      <div className="site-actions"><a className="login-link" href="/portal">Student portal</a><a className="button button-navy" href="/admissions">Apply now <ArrowRight size={16} /></a></div>
    </header>
    {children}
    <footer className="site-footer"><div className="footer-main"><div><a className="brand brand-light" href="/"><span className="brand-mark"><BookOpen size={20} /></span><span>GREENFIELD<small>COLLEGE</small></span></a><p>Curious minds. Kind hearts. Bright futures.</p></div><div><b>Explore</b><a href="/about">Our school</a><a href="/academics">Academics</a><a href="/campus-life">Campus life</a></div><div><b>Get started</b><a href="/admissions">Admissions</a><a href="/portal">Student portal</a><a href="/contact">Contact us</a></div><div><b>Visit us</b><span>14 College Road, Ikeja</span><span>Lagos, Nigeria</span><a href="mailto:hello@greenfield.example">hello@greenfield.example</a></div></div><div className="footer-bottom"><span>© 2026 Greenfield College. All rights reserved.</span><a href="/privacy">Privacy</a></div></footer>
  </>
}
