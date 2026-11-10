function SalonFooter() {
  return (
    <footer className="salon-footer">
      <div className="salon-footer-main">
        <div className="salon-footer-brand">
          <a className="salon-brand salon-brand-light" href="#home">
            <span className="salon-brand-mark">L</span>
            <span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span>
          </a>
          <p>A modern sanctuary for hair, skin &amp; self. Your next beautiful ritual starts around the corner.</p>
          <div className="salon-socials"><a href="https://www.instagram.com/" aria-label="Instagram">ig</a><a href="https://www.facebook.com/" aria-label="Facebook">f</a><a href="https://www.tiktok.com/" aria-label="TikTok">♪</a></div>
        </div>
        <div className="salon-footer-column"><h3>VISIT</h3><a href="https://maps.google.com/?q=12+Mercer+St+New+York+NY">12 Mercer St, Soho</a><a href="https://maps.google.com/?q=42+Berry+St+Williamsburg+NY">42 Berry Ave, Williamsburg</a><a href="#booking">Open daily 9am — 8pm</a></div>
        <div className="salon-footer-column"><h3>EXPLORE</h3><a href="#services">Services &amp; pricing</a><a href="#stylists">Meet the stylists</a><a href="#services">Gift cards</a><a href="#booking">Careers</a></div>
        <div className="salon-newsletter"><strong>Get $20 off your first ritual</strong><p>Ask our team about openings &amp; members-only hours.</p><a href="tel:+12125550148">Call our studio <span>→</span></a></div>
      </div>
      <div className="salon-footer-bottom">
        <span>© {new Date().getFullYear()} Lumière Salon &amp; Spa. All rights reserved.</span>
        <div><a href="#privacy">Privacy</a><span>·</span><a href="#terms">Terms</a><span>·</span><a href="#accessibility">Accessibility</a></div>
      </div>
    </footer>
  )
}

export default SalonFooter
