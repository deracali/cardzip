import { ArrowUpRight, Phone, Wrench } from 'lucide-react'

function HomeFooter() {
  return (
    <footer className="ff-footer">
      <div className="ff-container">
        <div className="ff-footer-main">
          <div className="ff-footer-about">
            <a className="ff-brand ff-footer-brand" href="/" aria-label="FixFlow Pro home">
              <span className="ff-brand-mark"><Wrench size={17} /></span>
              <span>FixFlow Pro<small>PLUMBING · HVAC · REPAIR</small></span>
            </a>
            <p>Local plumbing &amp; HVAC experts. Upfront flat rates, 60-minute emergency response.</p>
          </div>
          <div className="ff-footer-links">
            <h3>Services</h3>
            <a href="#services">Pipe repair &amp; repiping</a>
            <a href="#services">AC install &amp; maintenance</a>
            <a href="#services">Drain cleaning</a>
            <a href="#services">Heating &amp; furnace</a>
          </div>
          <div className="ff-footer-links">
            <h3>Company</h3>
            <a href="#estimate">Pricing</a>
            <a href="#service-area">Areas served</a>
            <a href="#reviews">Customer reviews</a>
            <a href="mailto:hello@fixflowpro.example">Support</a>
          </div>
          <div className="ff-footer-emergency">
            <span><Phone size={13} /> 24/7 Emergency line</span>
            <a href="tel:+18005550199">(800) 555-0199 <ArrowUpRight size={13} /></a>
            <a className="ff-button ff-button-orange" href="tel:+18005550199">Request service</a>
          </div>
        </div>
        <div className="ff-footer-bottom">
          <span>© {new Date().getFullYear()} FixFlow Pro. Licensed &amp; insured.</span>
          <div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#license">License #HVAC-884201</a></div>
        </div>
      </div>
    </footer>
  )
}

export default HomeFooter
