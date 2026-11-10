import { ArrowRight, BadgeCheck, Check, MapPin, Phone, ShieldCheck, Timer, Wrench } from 'lucide-react'
import { useState } from 'react'

function HomeHero() {
  const [zipCode, setZipCode] = useState('')
  const [availability, setAvailability] = useState('')
  const [isAvailable, setIsAvailable] = useState(false)

  const checkAvailability = (event) => {
    event.preventDefault()
    const zip = zipCode.trim()
    if (!/^\d{5}$/.test(zip)) {
      setIsAvailable(false)
      setAvailability('Enter a valid 5-digit ZIP code to check your area.')
      return
    }

    const prefix = Number(zip.slice(0, 3))
    const covered = prefix >= 800 && prefix <= 803
    setIsAvailable(covered)
    setAvailability(
      covered
        ? `Good news — ${zip} is in our Denver metro service area.`
        : `We don't serve ${zip} yet. Call us and we'll help find a solution.`,
    )
  }

  return (
    <section className="ff-hero" id="service-area" aria-labelledby="ff-hero-title">
      <div className="ff-container ff-hero-layout">
        <div className="ff-hero-copy">
          <span className="ff-eyebrow"><span /> Licensed · Insured · 60-min emergency response</span>
          <h1 id="ff-hero-title">Fast, reliable local plumbing &amp; HVAC experts</h1>
          <p>Upfront flat rates. Background-checked local techs. Same-day fixes backed by a 90-day guarantee.</p>

          <form className="ff-zip-check" onSubmit={checkAvailability} noValidate>
            <label htmlFor="ff-zip">Check availability in your area</label>
            <div className="ff-zip-controls">
              <span className="ff-zip-input">
                <MapPin size={15} aria-hidden="true" />
                <input
                  id="ff-zip"
                  name="zip"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  placeholder="Enter ZIP — e.g. 80202"
                  value={zipCode}
                  onChange={(event) => {
                    setZipCode(event.target.value.replace(/\D/g, '').slice(0, 5))
                    setAvailability('')
                  }}
                  aria-describedby={availability ? 'ff-zip-result' : undefined}
                />
              </span>
              <button className="ff-button ff-button-dark" type="submit">Check</button>
            </div>
            {availability ? (
              <p className={`ff-zip-result${isAvailable ? ' is-available' : ' is-unavailable'}`} id="ff-zip-result" role="status">
                {isAvailable ? <Check size={14} /> : <MapPin size={14} />}
                {availability}
              </p>
            ) : (
              <p className="ff-zip-hint"><Check size={13} /> Check coverage across the Denver metro area</p>
            )}
          </form>

          <div className="ff-hero-actions">
            <a className="ff-button ff-button-orange" href="tel:+18005550199">Request service <ArrowRight size={15} /></a>
            <a className="ff-text-link" href="#estimate"><Wrench size={14} /> Estimate my cost</a>
          </div>
        </div>

        <div className="ff-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=85"
            alt="A service professional repairing equipment in a home"
          />
          <div className="ff-job-badge"><span><BadgeCheck size={15} /></span><div><strong>Job completed</strong><small>Furnace fix · $149 flat</small></div></div>
          <div className="ff-arrival-badge"><span><Timer size={19} /></span><div><strong>38 min</strong><small>Avg. emergency arrival</small></div></div>
          <div className="ff-image-shield"><ShieldCheck size={14} /> Background-checked pros</div>
        </div>
      </div>

      <div className="ff-container ff-trust-strip" aria-label="Why customers choose FixFlow Pro">
        <span><strong>★ 4.9</strong> on Google · 800+ reviews</span>
        <span><ShieldCheck size={14} /> Licensed &amp; insured</span>
        <span><Check size={14} /> Upfront flat rates</span>
        <span><Phone size={14} /> 24/7 emergency dispatch</span>
      </div>
    </section>
  )
}

export default HomeHero
