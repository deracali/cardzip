import { ArrowUpRight } from 'lucide-react'

function ServiceFooter() {
  return (
    <footer className="service-footer">
      <div className="footer-cta">
        <div><span className="section-kicker">MAKE ROOM FOR MORE</span><h2>Let the good clean in.</h2></div>
        <a className="button-primary" href="#estimate">Get your estimate <ArrowUpRight size={15} /></a>
      </div>
      <div className="footer-bottom">
        <a className="service-brand" href="/" aria-label="NOVA Studio home">
          <img className="service-brand-mark" src="/favicon.svg" alt="" />
          <span>NOVA Studio<small>HOME SERVICES</small></span>
        </a>
        <span>© {new Date().getFullYear()} NOVA Studio. Made for a little more breathing room.</span>
        <a href="#availability">Check your ZIP <ArrowUpRight size={13} /></a>
      </div>
    </footer>
  )
}

export default ServiceFooter
