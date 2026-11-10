import { ArrowRight } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-about"><Logo light /><p>We bring people together to build a kinder, healthier, more hopeful world.</p><div className="footer-social"><a href="/impact" aria-label="Instagram">ig</a><a href="/impact" aria-label="Facebook">f</a><a href="/impact" aria-label="LinkedIn">in</a></div></div>
        <div className="footer-column"><strong>Explore</strong><a href="/about">Our story</a><a href="/causes">Our causes</a><a href="/impact">Our impact</a><a href="/volunteer">Volunteer</a></div>
        <div className="footer-column"><strong>Support</strong><a href="/support">Help center</a><a href="/support">Donor support</a><a href="/support">Contact us</a><a href="/privacy">Privacy policy</a></div>
        <div className="footer-newsletter"><strong>A little hope in your inbox</strong><p>Stories of change, sent with care.</p><form onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset() }}><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" placeholder="Email address" required /><button className="button button-green button-small" type="submit" aria-label="Subscribe"><ArrowRight size={15} /></button></form></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Kindred. Making good things happen together.</span><span>Registered nonprofit · EIN 84-2050194</span></div>
    </footer>
  )
}
