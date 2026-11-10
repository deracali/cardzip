import { Heart, Mail, Plus } from 'lucide-react'

function HomeFooter() {
  return (
    <>
      <section className="carewell-cta">
        <div>
          <h2>Your next step to feeling better.</h2>
          <p>Find a doctor who gets you. Feel better, one visit at a time.</p>
        </div>
        <a href="/signup">Find Your Doctor <span>→</span></a>
      </section>
      <footer className="carewell-footer" id="about">
        <div className="footer-main">
          <div className="footer-about">
            <a className="home-brand" href="/" aria-label="Carewell home">
              <span className="home-brand-mark"><Plus size={16} strokeWidth={4} /></span>
              <span>carewell<span>.</span></span>
            </a>
            <p>Better health begins with better care. We're here to help you find it.</p>
            <a className="footer-email" href="mailto:hello@carewell.example"><Mail size={14} /> hello@carewell.example</a>
          </div>
          <div className="footer-link-groups">
            <div><h3>For patients</h3><a href="#doctors">Find a Doctor</a><a href="#specialties">Medical Specialties</a><a href="/signup">Your Account</a></div>
            <div><h3>For providers</h3><a href="/signup">Join Carewell</a><a href="/signup">Provider Sign Up</a><a href="#about">Our Mission</a></div>
            <div><h3>About Carewell</h3><a href="#about">Our Story</a><a href="#reviews">Patient Stories</a><a href="mailto:hello@carewell.example">Contact Us</a></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Carewell. Made with <Heart size={12} fill="currentColor" /> for healthier lives.</span>
          <div><a href="#privacy">Privacy Policy</a><a href="#terms">Terms of Service</a><a href="#accessibility">Accessibility</a></div>
        </div>
      </footer>
    </>
  )
}

export default HomeFooter
