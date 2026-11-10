import { ArrowDown, ArrowRight, BadgeCheck, Check, MapPin, Sparkles } from 'lucide-react'
import { isValidZipCode, sampleCoveredZipCodes } from './serviceData'

function ServiceHero({ zipCode, coverage, onZipCodeChange, onAvailabilityCheck }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onAvailabilityCheck(zipCode)
  }

  const zipIsValid = isValidZipCode(zipCode)

  return (
    <section className="service-hero" aria-labelledby="service-hero-title">
      <div className="service-hero-grid">
        <div className="service-hero-copy">
          <span className="service-eyebrow"><span className="status-dot" /> HOME CARE THAT JUST GETS IT</span>
          <h1 id="service-hero-title">A little less mess.<br />A lot more <span>living.</span></h1>
          <p>Come home to the good kind of clean. Thoughtful pros, easy booking, and a fresh start on your schedule.</p>
          <div className="service-hero-actions">
            <a className="button-primary" href="#estimate">Build your estimate <ArrowRight size={16} /></a>
            <a className="button-quiet" href="#services"><span className="play-mark"><ArrowDown size={13} /></span> Explore services</a>
          </div>
          <div className="service-hero-trust"><BadgeCheck size={16} /> Background-checked pros · Supplies included · Satisfaction promise</div>
        </div>

        <div className="service-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
            alt="A bright, freshly cleaned living room"
          />
          <div className="hero-image-shade" />
          <span className="hero-image-label"><Sparkles size={13} /> THE SIGNATURE RESET</span>
          <div className="hero-proof-card">
            <span className="proof-icon"><Check size={18} /></span>
            <span><strong>Coming home feels different.</strong><small>4.9/5 average customer rating</small></span>
            <span className="proof-stars">★★★★★</span>
          </div>
          <div className="hero-booking-card">
            <span className="booking-card-icon"><Sparkles size={15} /></span>
            <span><strong>Your clean, your way</strong><small>Flexible plans · No long-term contracts</small></span>
          </div>
        </div>
      </div>

      <div className="service-availability" id="availability">
        <div className="availability-copy">
          <span className="availability-icon"><MapPin size={18} /></span>
          <span><strong>Is NOVA in your neighborhood?</strong><small>Check your ZIP to see if we can come by.</small></span>
        </div>
        <form className="availability-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="availability-zip">Your ZIP code</label>
          <input
            id="availability-zip"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(event) => onZipCodeChange(event.target.value.replace(/\D/g, '').slice(0, 5))}
            required
          />
          <button type="submit">Check availability <ArrowRight size={15} /></button>
        </form>
        {coverage !== null && zipIsValid && (
          <p className={coverage ? 'availability-result is-covered' : 'availability-result'}>
            {coverage
              ? `Great news — ${zipCode} is in our sample service area.`
              : `${zipCode} is outside our sample service area for now.`}
          </p>
        )}
        <small className="availability-note">Demo coverage: {sampleCoveredZipCodes.slice(0, 4).join(', ')} and nearby ZIPs.</small>
      </div>

      <div className="service-proof-strip" aria-label="NOVA at a glance">
        <div><strong>4.9<span>/5</span></strong><small>average customer rating</small></div>
        <div><strong>2,400<span>+</span></strong><small>happy homes refreshed</small></div>
        <div><strong>100<span>%</span></strong><small>supplies included</small></div>
        <a href="#reviews">See why neighbors love us <ArrowRight size={14} /></a>
      </div>
    </section>
  )
}

export default ServiceHero
