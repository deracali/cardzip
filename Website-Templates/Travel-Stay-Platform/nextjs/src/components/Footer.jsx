import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-about">
          <Logo light />
          <p>Extraordinary stays, unforgettable experiences, and a little more room to breathe.</p>
          <div className="social-dots" aria-label="Social channels"><a href="/about" aria-label="Instagram">ig</a><a href="/about" aria-label="Facebook">f</a><a href="/about" aria-label="Pinterest">p</a></div>
        </div>
        <div className="footer-column"><strong>Company</strong><a href="/about">About us</a><a href="/destinations">Destinations</a><a href="/experiences">Experiences</a><a href="/list-property">List your property</a></div>
        <div className="footer-column"><strong>Support</strong><a href="/support">Help center</a><a href="/support">Booking options</a><a href="/support">Safety information</a><a href="/support">Contact us</a></div>
        <div className="footer-newsletter"><strong>Get travel notes</strong><p>Inspiration, delivered occasionally.</p><form onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset() }}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Email address" required /><button className="button button-primary button-small" type="submit">Join</button></form></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Escapes. All rights reserved.</span><a href="/support">Privacy &amp; terms</a></div>
    </footer>
  )
}
