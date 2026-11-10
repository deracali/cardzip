import { useState } from 'react'
import { ArrowRight, BadgeCheck, Clock3, MapPin, Sparkles } from 'lucide-react'

function SalonHero() {
  const [zipCode, setZipCode] = useState('')
  const [availabilityMessage, setAvailabilityMessage] = useState('')

  const checkLocation = (event) => {
    event.preventDefault()
    if (!/^\d{5}$/.test(zipCode.trim())) {
      setAvailabilityMessage('Enter a 5-digit ZIP code to check your area.')
      return
    }

    setAvailabilityMessage(`Call (212) 555-0148 to confirm today's openings near ${zipCode.trim()}.`)
  }

  return (
    <section className="salon-hero" id="home" aria-labelledby="salon-hero-title">
      <div className="salon-hero-copy">
        <div className="salon-rating"><span aria-hidden="true">★★★★★</span> <strong>4.9</strong><i /> 12k+ verified visits <i /> Soho · Williamsburg</div>
        <h1 id="salon-hero-title">Elevate Your<br /><em>Beauty</em> Experience</h1>
        <p>Precision cuts, restorative rituals and skin science — thoughtfully tailored to you. Call us to ask about today's openings.</p>
        <div className="salon-hero-actions">
          <a className="salon-button salon-button-primary" href="#booking">Book Appointment <ArrowRight size={14} /></a>
          <a className="salon-text-link" href="#services">Explore packages</a>
        </div>
        <div className="salon-hero-trust"><span className="salon-avatar-stack" aria-hidden="true"><i>M</i><i>A</i><i>S</i></span><strong>48 stylists online</strong><i /><BadgeCheck size={14} /> Certified clean studio</div>
      </div>

      <div className="salon-hero-visual">
        <img src="/images/salon/salon-interior.jpg" alt="Warm, sunlit Lumière salon with styling stations" />
        <div className="salon-glow-badge"><span><Sparkles size={16} /></span><div><strong>Glow Guarantee</strong><small>Love it or we refine</small></div></div>
        <form className="salon-availability" onSubmit={checkLocation}>
          <label htmlFor="salon-zip"><MapPin size={14} /> Check availability near you</label>
          <div className="salon-zip-row">
            <input id="salon-zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="Enter zip code" value={zipCode} onChange={(event) => setZipCode(event.target.value)} />
            <button type="submit">Check</button>
          </div>
          {availabilityMessage
            ? <p className="salon-availability-message" role="status">{availabilityMessage}</p>
            : <span className="salon-location-note"><i /> Soho flagship · Williamsburg studio</span>}
        </form>
      </div>
    </section>
  )
}

export default SalonHero
