import { ArrowRight, Phone } from 'lucide-react'

function EmergencyBanner() {
  return (
    <section className="ff-container ff-emergency-banner" aria-labelledby="ff-emergency-title">
      <div>
        <h2 id="ff-emergency-title">Burst pipe? No heat? Don’t wait.</h2>
        <p>Emergency crews are on the road now in your ZIP — average arrival 38 minutes.</p>
      </div>
      <div className="ff-emergency-actions">
        <a className="ff-button ff-button-light" href="tel:+18005550199"><Phone size={14} /> Call (800) 555-0199</a>
        <a className="ff-button ff-button-dark" href="tel:+18005550199">Request service <ArrowRight size={14} /></a>
      </div>
    </section>
  )
}

export default EmergencyBanner
