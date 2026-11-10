import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Droplets,
  Flame,
  Gauge,
  Home,
  KeyRound,
  LockKeyhole,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Snowflake,
  Star,
  Thermometer,
  UserRound,
  Wind,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

const services = [
  {
    id: 'ac-tune-up',
    name: 'AC Tune-Ups',
    description: 'A 21-point inspection, coil cleaning, and refrigerant check for peak summer efficiency.',
    price: 89,
    duration: '60 min',
    icon: Snowflake,
    category: 'Cooling',
  },
  {
    id: 'furnace-repair',
    name: 'Furnace Repair',
    description: 'Fast diagnostics and dependable repairs to keep your home warm when it matters.',
    price: 129,
    duration: '60–90 min',
    icon: Flame,
    category: 'Heating',
  },
  {
    id: 'heat-pump-install',
    name: 'Heat Pump Service',
    description: 'Installation, seasonal maintenance, and repair for efficient year-round comfort.',
    price: 169,
    duration: '90 min',
    icon: Wind,
    category: 'Heating & cooling',
  },
  {
    id: 'thermostat-install',
    name: 'Smart Thermostats',
    description: 'Professional installation and setup with a walkthrough of your new thermostat.',
    price: 99,
    duration: '45 min',
    icon: Thermometer,
    category: 'Smart home',
  },
  {
    id: 'emergency-repair',
    name: 'Emergency Repair',
    description: 'Priority, around-the-clock help for urgent heating or cooling breakdowns.',
    price: 189,
    duration: 'Priority dispatch',
    icon: Zap,
    category: '24/7 service',
  },
  {
    id: 'duct-cleaning',
    name: 'Duct Cleaning',
    description: 'Clear built-up dust and debris from your ductwork for cleaner airflow.',
    price: 149,
    duration: '2–3 hours',
    icon: Wind,
    category: 'Indoor air',
  },
  {
    id: 'air-quality',
    name: 'Indoor Air Quality',
    description: 'Find the right filtration and humidity solution for the air in your home.',
    price: 79,
    duration: '45 min',
    icon: Droplets,
    category: 'Indoor air',
  },
  {
    id: 'maintenance-plan',
    name: 'Home Comfort Plan',
    description: 'Two seasonal tune-ups, priority scheduling, and a year of worry-free comfort.',
    price: 199,
    duration: 'Annual plan',
    icon: ShieldCheck,
    category: 'Maintenance plan',
  },
]

const serviceById = Object.fromEntries(services.map((service) => [service.id, service]))
const money = (amount) => `$${Number(amount).toLocaleString('en-US')}`
const today = new Date()
const minBookingDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

function useNavigation() {
  const [route, setRoute] = useState(() => `${window.location.pathname}${window.location.search}`)

  useEffect(() => {
    const updateRoute = () => setRoute(`${window.location.pathname}${window.location.search}`)
    window.addEventListener('popstate', updateRoute)
    return () => window.removeEventListener('popstate', updateRoute)
  }, [])

  const navigate = (to) => {
    window.history.pushState({}, '', to)
    setRoute(`${window.location.pathname}${window.location.search}`)
    window.scrollTo(0, 0)
  }

  const handleLinkClick = (event) => {
    const link = event.target.closest('a')
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (link.target || link.hasAttribute('download')) return
    const destination = new URL(link.href, window.location.href)
    if (destination.origin !== window.location.origin) return
    if (destination.hash && destination.pathname === window.location.pathname && destination.search === window.location.search) return
    event.preventDefault()
    navigate(`${destination.pathname}${destination.search}${destination.hash}`)
  }

  return { route, navigate, handleLinkClick }
}

function Brand({ light = false }) {
  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="PolarFlow HVAC home">
      <span className="brand-mark"><img src="/favicon.svg" alt="" /></span>
      <span className="brand-copy"><strong>PolarFlow HVAC</strong><small>Comfort, on your terms.</small></span>
    </a>
  )
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav${menuOpen ? ' nav-open' : ''}`} aria-label="Main navigation">
          <a href="/services" onClick={closeMenu}>Services</a>
          <a href="/maintenance" onClick={closeMenu}>Maintenance plans</a>
          <a href="/about" onClick={closeMenu}>Why PolarFlow</a>
          <a className="nav-phone" href="tel:+18005550147"><Phone size={15} /> (800) 555-0147</a>
          <a className="button button-primary nav-cta" href="/book" onClick={closeMenu}>Schedule a tech <ArrowRight size={15} /></a>
          <a className="nav-portal" href="/portal/login" onClick={closeMenu}>Customer portal</a>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-about">
          <Brand light />
          <p>Local HVAC experts, here to keep your home comfortable through every season.</p>
        </div>
        <div className="footer-column"><strong>Explore</strong><a href="/services">All services</a><a href="/maintenance">Maintenance plans</a><a href="/about">About us</a></div>
        <div className="footer-column"><strong>Get help</strong><a href="/contact">Contact</a><a href="/portal/login">Customer portal</a><a href="/warranty">Our warranty</a></div>
        <div className="footer-column"><strong>Call anytime</strong><a href="tel:+18005550147">(800) 555-0147</a><span>24/7 emergency dispatch</span></div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} PolarFlow HVAC. All rights reserved.</span>
        <div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/warranty">Warranty</a></div>
      </div>
    </footer>
  )
}

function SiteShell({ children }) {
  return <><SiteHeader />{children}<SiteFooter /></>
}

function SectionHeading({ eyebrow, title, description, link, linkLabel }) {
  return (
    <div className="section-heading">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>
      {link && <a className="text-link" href={link}>{linkLabel || 'Explore services'} <ArrowRight size={15} /></a>}
    </div>
  )
}

function ServiceCard({ service }) {
  const Icon = service.icon
  return (
    <article className="service-card">
      <div className="service-icon"><Icon size={20} /></div>
      <span className="service-category">{service.category}</span>
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <div className="service-card-bottom"><span>From <strong>{money(service.price)}</strong></span><span className="duration"><Clock3 size={13} /> {service.duration}</span></div>
      <a className="service-card-link" href={`/services/${service.id}`}>View details <ArrowRight size={14} /></a>
    </article>
  )
}

function QuoteCalculator() {
  const [serviceId, setServiceId] = useState('ac-tune-up')
  const [urgency, setUrgency] = useState('standard')
  const [zip, setZip] = useState('')
  const [availability, setAvailability] = useState('')
  const selected = serviceById[serviceId]
  const estimate = selected.price + (urgency === 'emergency' ? 100 : 0)
  const checkAvailability = (event) => {
    event.preventDefault()
    if (!/^\d{5}$/.test(zip)) {
      setAvailability('Enter a valid 5-digit ZIP code to check your area.')
      return
    }
    setAvailability(`Great news — PolarFlow serves ${zip}. Choose a time that works for you.`)
  }
  return (
    <section className="quote-card" aria-labelledby="quote-title">
      <div className="quote-header">
        <div><span className="service-icon quote-icon"><Gauge size={18} /></span><div><h2 id="quote-title">Instant HVAC quote calculator</h2><p>Know the price before we wrench. No hidden fees.</p></div></div>
        <span className="quote-step"><i /> QUICK ESTIMATE</span>
      </div>
      <div className="quote-content">
        <div className="quote-controls">
          <label className="input-label" htmlFor="quote-service">01 — Service type</label>
          <select id="quote-service" value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
            {services.slice(0, 5).map((service) => <option value={service.id} key={service.id}>{service.name}</option>)}
          </select>
          <label className="input-label urgency-label">02 — When do you need us?</label>
          <div className="urgency-options">
            <label className={`urgency-option${urgency === 'standard' ? ' selected' : ''}`}><input type="radio" name="urgency" value="standard" checked={urgency === 'standard'} onChange={() => setUrgency('standard')} /><span><Clock3 size={14} /> Standard (1–2 days)</span><strong>Included</strong></label>
            <label className={`urgency-option${urgency === 'emergency' ? ' selected' : ''}`}><input type="radio" name="urgency" value="emergency" checked={urgency === 'emergency'} onChange={() => setUrgency('emergency')} /><span><Zap size={14} /> Emergency (today)</span><strong>+$100</strong></label>
          </div>
        </div>
        <div className="quote-estimate">
          <span className="input-label">YOUR FLAT-RATE ESTIMATE</span>
          <div className="estimate-price">{money(estimate)}<small>+ tax</small></div>
          <p><ShieldCheck size={14} /> Price locked for 14 days</p>
          <span className="estimate-note">Includes diagnosis and the listed service.</span>
          <a className="button button-primary estimate-cta" href={`/book?service=${serviceId}&urgency=${urgency}&estimate=${estimate}`}>Book this price <ArrowRight size={15} /></a>
          <span className="estimate-small">Free diagnosis with repair</span>
        </div>
      </div>
      <form className="availability-form" onSubmit={checkAvailability}>
        <label htmlFor="hero-zip"><MapPin size={15} /> Check service in your ZIP</label>
        <input id="hero-zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, ''))} placeholder="e.g. 78704" />
        <button className="button button-secondary" type="submit">Check availability <ArrowRight size={14} /></button>
      </form>
      {availability && <p className="availability-message" role="status">{availability}</p>}
    </section>
  )
}

function HomePage() {
  const [heroZip, setHeroZip] = useState('')
  const [heroNotice, setHeroNotice] = useState('')
  return (
    <SiteShell>
      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="trust-pill"><BadgeCheck size={14} /> Certified techs. Right on time.</span>
              <h1>Fast, reliable AC &amp; heating repairs—<span>24/7 emergency service.</span></h1>
              <p className="hero-description">Upfront flat-rate pricing, EPA-certified technicians, and help at your door in 60 minutes or less. The diagnosis is free.</p>
              <form className="hero-search" onSubmit={(event) => {
                event.preventDefault()
                if (!/^\d{5}$/.test(heroZip)) {
                  setHeroNotice('Enter a valid 5-digit ZIP code to check your area.')
                  return
                }
                setHeroNotice(`Enter ${heroZip} in the quote checker below to see local availability.`)
                document.getElementById('hero-zip')?.focus()
              }}>
                <MapPin size={17} /><input aria-label="ZIP code" inputMode="numeric" autoComplete="postal-code" placeholder="Enter your ZIP code" maxLength={5} value={heroZip} onChange={(event) => setHeroZip(event.target.value.replace(/\D/g, ''))} />
                <button className="button button-primary" type="submit">Check availability <ArrowRight size={15} /></button>
              </form>
              {heroNotice && <p className="hero-availability" role="status">{heroNotice}</p>}
              <div className="hero-proof"><span className="rating-stars" aria-label="5 out of 5 stars"><Star /><Star /><Star /><Star /><Star /></span><strong>4.9</strong><span>from 1,200+ local homeowners</span><i /><span><ShieldCheck size={14} /> EPA-certified techs</span></div>
              <div className="hero-actions"><a className="button button-emergency" href="/services/emergency-repair"><Zap size={15} /> Emergency dispatch</a><a className="text-link" href="/about"><CheckCircle2 size={15} /> How flat-rate works <ArrowRight size={14} /></a></div>
            </div>
            <div className="hero-visual">
              <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85" alt="HVAC technician working on a home heating and cooling system" />
              <div className="locked-price-card"><span><LockKeyhole size={14} /></span><div><strong>Upfront price locked</strong><small>No surprises. Ever.</small></div></div>
              <div className="dispatch-card"><div className="dispatch-avatar"><UserRound size={17} /></div><div><strong>Marcus R. — Tech #42</strong><small>EPA certified · 4.9 star rating</small></div><span className="dispatch-status">EN ROUTE</span><div className="dispatch-progress"><i /></div><b>12 min</b></div>
            </div>
          </div>
          <div className="container"><QuoteCalculator /></div>
        </section>

        <section className="services-section container" id="services">
          <SectionHeading eyebrow="Services & upfront pricing" title="Every fix, quoted before we wrench" description="Straightforward pricing for a more comfortable home." link="/services" linkLabel="View all services" />
          <div className="services-grid home-services">{services.slice(0, 4).map((service) => <ServiceCard service={service} key={service.id} />)}</div>
          <div className="trust-strip"><div className="review-score"><Star size={16} fill="currentColor" /> <strong>4.9</strong> <span>Google Reviews · 1,200+ local homeowners</span></div><span><ShieldCheck size={14} /> EPA Certified</span><span><BadgeCheck size={14} /> Licensed &amp; insured</span><span><CheckCircle2 size={14} /> 5-Year Warranty</span></div>
        </section>

        <section className="how-section">
          <div className="container">
            <SectionHeading eyebrow="Easy from start to finish" title="Comfort in three simple steps" description="No guesswork, no pressure. Just great service." />
            <div className="steps-grid">
              <article className="step-card"><span>01</span><div className="service-icon"><CalendarDays size={20} /></div><h3>Pick a time</h3><p>Book online in under a minute. Choose a convenient arrival window.</p></article>
              <article className="step-card"><span>02</span><div className="service-icon"><UserRound size={20} /></div><h3>Meet your tech</h3><p>Get your technician’s details and live arrival updates before the visit.</p></article>
              <article className="step-card"><span>03</span><div className="service-icon"><CheckCircle2 size={20} /></div><h3>Approve the price</h3><p>Know the flat-rate price before work begins. Pay only when the work is done.</p></article>
            </div>
          </div>
        </section>

        <section className="cta-section container"><div><span className="eyebrow">Here when you need us</span><h2>Let's get your home comfortable again.</h2><p>Local experts, transparent pricing, and 24/7 emergency help.</p></div><a className="button button-primary" href="/book">Schedule a technician <ArrowRight size={16} /></a></section>
      </main>
    </SiteShell>
  )
}

function PageIntro({ eyebrow, title, description }) {
  return <section className="page-intro"><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></section>
}

function ServicesPage() {
  return (
    <SiteShell>
      <main><PageIntro eyebrow="Services & upfront pricing" title="The right fix, at the right price." description="Browse our most-requested home comfort services. Every estimate is upfront, flat-rate, and free of surprises." />
        <section className="container page-section"><div className="services-grid">{services.map((service) => <ServiceCard service={service} key={service.id} />)}</div></section>
        <section className="container"><QuoteCalculator /></section>
      </main>
    </SiteShell>
  )
}

function ServiceDetailPage({ serviceId }) {
  const service = serviceById[serviceId]
  if (!service) return <NotFoundPage />
  const Icon = service.icon
  return (
    <SiteShell>
      <main><div className="container breadcrumbs"><a href="/">Home</a><ArrowRight size={13} /><a href="/services">Services</a><ArrowRight size={13} /><span>{service.name}</span></div>
        <section className="container detail-layout">
          <div className="detail-main"><div className="service-icon detail-icon"><Icon size={25} /></div><span className="eyebrow">{service.category}</span><h1>{service.name}</h1><p className="detail-lead">{service.description}</p>
            <div className="detail-benefits"><h2>What to expect</h2><p><Check size={16} /> A certified technician arrives within your selected time window.</p><p><Check size={16} /> We explain the diagnosis and price before starting any work.</p><p><Check size={16} /> Workmanship is backed by our 5-year service warranty.</p></div>
            <a className="text-link" href="/warranty">Read about our warranty <ArrowRight size={14} /></a>
          </div>
          <aside className="detail-book-card"><span className="eyebrow">Upfront flat-rate pricing</span><div className="detail-price">{money(service.price)}<small>+ tax</small></div><p>Starting price. Final quote is confirmed before work begins.</p><div className="detail-meta"><span><Clock3 size={15} /> {service.duration}</span><span><ShieldCheck size={15} /> EPA-certified pros</span></div><a className="button button-primary full-button" href={`/book?service=${service.id}&estimate=${service.price}`}>Book this service <ArrowRight size={15} /></a><a className="detail-phone" href="tel:+18005550147"><Phone size={14} /> Need help? (800) 555-0147</a></aside>
        </section>
        <section className="container page-section"><SectionHeading eyebrow="More ways to get comfortable" title="You might also need" link="/services" linkLabel="All services" /><div className="services-grid related-services">{services.filter((item) => item.id !== service.id).slice(0, 3).map((item) => <ServiceCard service={item} key={item.id} />)}</div></section>
      </main>
    </SiteShell>
  )
}

function BookingPage({ navigate }) {
  const query = new URLSearchParams(window.location.search)
  const initialService = serviceById[query.get('service')] ? query.get('service') : 'ac-tune-up'
  const [serviceId, setServiceId] = useState(initialService)
  const [urgency, setUrgency] = useState(query.get('urgency') === 'emergency' ? 'emergency' : 'standard')
  const [formError, setFormError] = useState('')
  const [zip, setZip] = useState('')
  const service = serviceById[serviceId]
  const estimate = service.price + (urgency === 'emergency' ? 100 : 0)
  const submitBooking = (event) => {
    event.preventDefault()
    setFormError('')
    if (!/^\d{5}$/.test(zip)) {
      setFormError('Please enter a valid 5-digit ZIP code.')
      return
    }
    const formData = new FormData(event.currentTarget)
    const booking = {
      serviceId,
      urgency,
      estimate,
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      zip,
      date: formData.get('date'),
      time: formData.get('time'),
      notes: formData.get('notes'),
      reference: `PF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    }
    try {
      window.localStorage.setItem('polarflow-booking', JSON.stringify(booking))
      navigate('/checkout')
    } catch {
      setFormError('We could not save your booking on this device. Please check your browser storage settings and try again.')
    }
  }

  return (
    <SiteShell>
      <main><PageIntro eyebrow="Schedule a technician" title="Book a time that works for you." description="Tell us what you need and choose an arrival window. Review your request before confirming." />
        <section className="container booking-layout">
          <form className="form-card booking-form" onSubmit={submitBooking}>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="form-section-title"><span>01</span><div><h2>Your service</h2><p>Choose the help you need.</p></div></div>
            <div className="field-grid">
              <label className="field-label full-span">Service<select name="service" value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{services.map((item) => <option value={item.id} key={item.id}>{item.name} — from {money(item.price)}</option>)}</select></label>
              <label className="field-label">ZIP code<input name="zip" value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" autoComplete="postal-code" placeholder="78704" required /></label>
              <label className="field-label">Appointment date<input name="date" type="date" min={minBookingDate} required /></label>
              <label className="field-label full-span">Arrival window<select name="time" defaultValue="" required><option value="" disabled>Select a time window</option><option>8:00 AM – 10:00 AM</option><option>10:00 AM – 12:00 PM</option><option>12:00 PM – 2:00 PM</option><option>2:00 PM – 4:00 PM</option><option>4:00 PM – 6:00 PM</option></select></label>
              <fieldset className="dispatch-priority full-span">
                <legend>How soon do you need us?</legend>
                <div className="dispatch-choice-list">
                  <label className={urgency === 'standard' ? 'dispatch-choice is-selected' : 'dispatch-choice'}>
                    <input type="radio" name="dispatchPriority" value="standard" checked={urgency === 'standard'} onChange={() => setUrgency('standard')} />
                    <span><strong>Standard</strong><small>Next 1–2 days · included</small></span>
                  </label>
                  <label className={urgency === 'emergency' ? 'dispatch-choice is-selected' : 'dispatch-choice'}>
                    <input type="radio" name="dispatchPriority" value="emergency" checked={urgency === 'emergency'} onChange={() => setUrgency('emergency')} />
                    <span><strong>Emergency today</strong><small>Priority dispatch · +$100</small></span>
                  </label>
                </div>
              </fieldset>
            </div>
            <div className="form-section-title form-section-spaced"><span>02</span><div><h2>Your details</h2><p>So our technician can reach you.</p></div></div>
            <div className="field-grid">
              <label className="field-label">Full name<input name="name" autoComplete="name" placeholder="Jordan Mitchell" required /></label>
              <label className="field-label">Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="(512) 555-0100" required /></label>
              <label className="field-label full-span">Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
              <label className="field-label full-span">Anything we should know? <span className="optional">(optional)</span><textarea name="notes" rows="3" placeholder="Tell us about the issue or your home's system." /></label>
            </div>
            <button className="button button-primary full-button form-submit" type="submit">Continue to review <ArrowRight size={16} /></button>
            <p className="form-footnote"><LockKeyhole size={13} /> Your contact details are used only to coordinate this service visit.</p>
          </form>
          <aside className="booking-summary">
            <span className="eyebrow">Your estimate</span><h2>{service.name}</h2><p>{service.description}</p>
            <div className="summary-row"><span>Flat-rate estimate</span><strong>{money(estimate)} <small>+ tax</small></strong></div>
            <div className="summary-row"><span>Dispatch</span><strong>{urgency === 'emergency' ? 'Priority' : 'Standard'}</strong></div>
            <div className="summary-total"><span>Due today</span><strong>$0</strong></div>
            <p className="summary-note"><ShieldCheck size={15} /> No charge today. You’ll approve the final price before work starts.</p>
            <a href="tel:+18005550147"><Phone size={14} /> Questions? Call (800) 555-0147</a>
          </aside>
        </section>
      </main>
    </SiteShell>
  )
}

function readBooking() {
  try {
    const stored = window.localStorage.getItem('polarflow-booking')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function CheckoutPage({ navigate }) {
  const [booking] = useState(readBooking)
  const [error, setError] = useState('')
  const service = booking ? serviceById[booking.serviceId] : null
  const confirmBooking = () => {
    if (!booking || !service) {
      setError('Your booking details are missing. Please schedule your visit again.')
      return
    }
    navigate('/booking-confirmation')
  }
  if (!booking || !service) {
    return <SiteShell><main className="empty-state container"><div className="service-icon"><CalendarDays size={22} /></div><h1>No booking to review yet</h1><p>Choose a service and appointment time before continuing to checkout.</p><a className="button button-primary" href="/book">Schedule a service <ArrowRight size={15} /></a></main></SiteShell>
  }
  return (
    <SiteShell>
      <main><PageIntro eyebrow="Review & checkout" title="One last look before we book." description="Review your visit details. There’s no charge until your service is complete." />
        <section className="container checkout-layout">
          <div className="form-card checkout-review">
            <div className="form-section-title"><span><Check size={17} /></span><div><h2>Appointment details</h2><p>Your technician will confirm the arrival window.</p></div><a href="/book">Edit</a></div>
            <div className="review-details">
              <div><CalendarDays size={17} /><span><small>Date &amp; time</small><strong>{booking.date} · {booking.time}</strong></span></div>
              <div><Home size={17} /><span><small>Service address ZIP</small><strong>{booking.zip}</strong></span></div>
              <div><UserRound size={17} /><span><small>Contact</small><strong>{booking.name} · {booking.phone}</strong><small>{booking.email}</small></span></div>
            </div>
            <div className="payment-panel">
              <div className="payment-panel-icon"><CreditCard size={19} /></div>
              <div><h3>Payment after service</h3><p>Pay your technician once you’ve approved the completed work. We don’t collect card details here.</p><span><LockKeyhole size={13} /> No payment due today</span></div>
            </div>
            <p className="checkout-disclaimer">Online card payments and appointment dispatch aren’t connected on this demo site. Save your request on this device, then call our team to confirm a real appointment.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="button" className="button button-primary full-button form-submit" onClick={confirmBooking}>Save request and view next steps <ArrowRight size={16} /></button>
            <a className="checkout-back" href="/book"><ArrowLeft size={14} /> Back to appointment details</a>
          </div>
          <aside className="booking-summary">
            <span className="eyebrow">Price summary</span><h2>{service.name}</h2>
            <div className="summary-row"><span>Flat-rate estimate</span><strong>{money(booking.estimate)}</strong></div>
            <div className="summary-row"><span>Sales tax</span><strong>Calculated after service</strong></div>
            <div className="summary-total"><span>Due today</span><strong>$0</strong></div>
            <p className="summary-note"><ShieldCheck size={15} /> Your technician confirms the final price before any work begins.</p>
            <p className="small-muted">Estimate valid for 14 days. The final amount may vary if additional work is requested.</p>
          </aside>
        </section>
      </main>
    </SiteShell>
  )
}

function BookingConfirmationPage() {
  const [booking] = useState(readBooking)
  const service = booking ? serviceById[booking.serviceId] : null
  return (
    <SiteShell>
      <main className="confirmation-wrap container">
        <div className="confirmation-card">
          <div className="confirmation-icon"><CheckCircle2 size={32} /></div>
          <span className="eyebrow">{booking ? 'Saved on this device' : 'Appointment request'}</span><h1>{booking ? 'Your request is saved.' : 'No appointment found.'}</h1>
          <p>{booking ? `Thanks, ${booking.name}. Your request is saved in this browser only; this demo does not send it to a dispatch team. Call (800) 555-0147 to confirm a real appointment.` : 'Schedule a service to see your appointment confirmation here.'}</p>
          {booking && service && <div className="confirmation-details"><span>Request number<strong>{booking.reference}</strong></span><span>Service<strong>{service.name}</strong></span><span>Appointment<strong>{booking.date} · {booking.time}</strong></span><span>Estimate<strong>{money(booking.estimate)} + tax</strong></span></div>}
          <div className="confirmation-actions"><a className="button button-primary" href="tel:+18005550147"><Phone size={15} /> Call to confirm appointment</a><a className="text-link" href="/portal/login">Customer portal</a><a className="text-link" href="/">Back to home</a></div>
        </div>
      </main>
    </SiteShell>
  )
}

function PortalPage({ isSignUp }) {
  const [notice, setNotice] = useState('')
  return (
    <main className="portal-page">
      <section className="portal-promo">
        <Brand light />
        <div className="portal-dashboard">
          <div className="dashboard-top"><span>Portal preview · sample data</span><strong><i /> SAMPLE</strong></div>
          <div className="dashboard-title"><strong>Smart Controller — Living Room</strong><span>72°F</span></div>
          <div className="dashboard-bar"><i /></div>
          <div className="dashboard-stats"><span><Thermometer size={14} /><strong>72°F</strong><small>Inside</small></span><span><Wind size={14} /><strong>Good</strong><small>Airflow</small></span><span><Droplets size={14} /><strong>42%</strong><small>Humidity</small></span></div>
          <div className="tech-status"><span><UserRound size={15} /></span><div><strong>Tech Marcus is 12 min away</strong><i /></div><b>ETA 12m</b></div>
        </div>
        <div className="portal-promo-copy"><h1>Track your technician.<br />Feel at home.</h1><p><ShieldCheck size={14} /> EPA Certified <Star size={13} fill="currentColor" /> 4.9 · 1,200+ reviews</p></div>
      </section>
      <section className="portal-form-side">
        <a href="/" className="portal-back"><ArrowLeft size={15} /> Back to PolarFlow</a>
        <div className="portal-form-card">
          <span className="service-icon"><Snowflake size={20} /></span>
          <h2>{isSignUp ? 'Create your account' : 'HVAC portal sign in'}</h2>
          <p className="portal-subtitle">{isSignUp ? 'Book faster, track history, and manage your home’s comfort.' : 'View upcoming service appointments and maintenance logs.'}</p>
          <form onSubmit={(event) => { event.preventDefault(); setNotice(isSignUp ? 'Account creation is not connected yet. Please call us and we’ll help you get set up.' : 'Portal sign-in is not connected yet. Please call (800) 555-0147 for help.') }}>
            {isSignUp && <label className="field-label">Full name<input autoComplete="name" placeholder="Jordan Mitchell" required /></label>}
            {isSignUp && <label className="field-label">Phone number<input type="tel" autoComplete="tel" placeholder="(512) 555-0100" required /></label>}
            <label className="field-label">Email address<input type="email" autoComplete="email" placeholder="you@example.com" required /></label>
            <label className="field-label">Password<input type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={8} placeholder="Enter your password" required /></label>
            <div className="portal-form-options">{!isSignUp && <label><input type="checkbox" defaultChecked /> Remember me</label>}{!isSignUp && <a href="/portal/reset-password">Forgot password?</a>}</div>
            <button className="button button-primary full-button" type="submit">{isSignUp ? 'Create account' : 'Sign in'} <ArrowRight size={15} /></button>
          </form>
          {notice && <p className="form-notice" role="status">{notice}</p>}
          {!isSignUp && <><div className="portal-divider"><span>or continue with</span></div><div className="social-buttons"><button type="button" onClick={() => setNotice('Google sign-in is not configured for this site.')}>G&nbsp; Google</button><button type="button" onClick={() => setNotice('Apple sign-in is not configured for this site.')}>&nbsp; Apple</button></div></>}
          <p className="portal-switch">{isSignUp ? 'Already have an account?' : 'Need a customer account?'} <a href={isSignUp ? '/portal/login' : '/portal/signup'}>{isSignUp ? 'Sign in' : 'Sign up'}</a></p>
          <p className="portal-secure"><ShieldCheck size={13} /> Your information stays private and secure.</p>
        </div>
      </section>
    </main>
  )
}

const information = {
  about: {
    eyebrow: 'About PolarFlow',
    title: 'The comfort of a job done right.',
    description: 'We’re your neighborhood team for reliable heating, cooling, and indoor air quality.',
    sections: [
      ['Local people. Real expertise.', 'Our EPA-certified technicians are licensed, insured, and trained to work on the systems that keep your home comfortable.'],
      ['Clear prices, always.', 'We share a flat-rate estimate before work begins. You decide what happens next—no pressure and no surprise charges.'],
      ['Here around the clock.', 'When your system needs urgent attention, our dispatch team is available 24/7 to help arrange service.'],
    ],
  },
  contact: {
    eyebrow: 'Contact us',
    title: 'We’re here to help.',
    description: 'Talk to a real person about scheduling, a service visit, or your home comfort questions.',
    sections: [
      ['Call anytime', 'Our dispatch team is available 24/7. Call (800) 555-0147.'],
      ['Service area', 'We currently serve Austin, TX and nearby communities. Enter your ZIP code when booking to check availability.'],
    ],
  },
  privacy: {
    eyebrow: 'Your privacy',
    title: 'Privacy policy.',
    description: 'We use the information you provide only to coordinate service, communicate about your appointment, and improve your experience.',
    sections: [
      ['Information we collect', 'When you request service, we ask for your name, phone number, email, service ZIP code, and appointment preferences.'],
      ['How we use it', 'We use your details to respond to requests, schedule technicians, and provide service updates. We do not sell your personal information.'],
      ['Your choices', 'You can contact our support team to ask about or update information associated with a service request. This demo does not collect card details.'],
    ],
  },
  terms: {
    eyebrow: 'The fine print',
    title: 'Terms of service.',
    description: 'Our goal is to make every service visit straightforward. These terms explain how estimates and appointment requests work.',
    sections: [
      ['Estimates', 'Online estimates are starting prices and may exclude tax or additional work. Your technician will review the final price with you before beginning.'],
      ['Appointments', 'Online requests are not confirmed until a PolarFlow team member contacts you. We’ll do our best to accommodate your preferred time.'],
      ['Payment', 'Payment is due after completed service. This website demo does not process payments or collect credit card information.'],
    ],
  },
  warranty: {
    eyebrow: 'Our promise',
    title: 'Service backed by a 5-year warranty.',
    description: 'We stand behind our workmanship. If something isn’t right, we’ll work with you to make it right.',
    sections: [
      ['Workmanship coverage', 'Eligible repairs performed by PolarFlow include a five-year workmanship warranty, starting on the service completion date.'],
      ['Manufacturer parts', 'Parts are covered by the applicable manufacturer warranty. Coverage varies by product and is explained before installation.'],
      ['Need warranty support?', 'Call (800) 555-0147 and share your service request number. We’ll help review the work and arrange next steps.'],
    ],
  },
  maintenance: {
    eyebrow: 'Comfort all year long',
    title: 'A little maintenance goes a long way.',
    description: 'Keep your system running smoothly with scheduled care from a technician who knows your home.',
    sections: [
      ['Two seasonal tune-ups', 'Get a spring cooling check and a fall heating check to help catch small issues before they become bigger repairs.'],
      ['Priority scheduling', 'Plan members get priority when booking routine service and access to our 24/7 emergency dispatch team.'],
      ['Member estimate', 'Home Comfort Plan membership starts at $199 per year. We’ll confirm the plan details with you before enrollment.'],
    ],
  },
}

function InformationPage({ page }) {
  const content = information[page]
  if (!content) return <NotFoundPage />
  return (
    <SiteShell>
      <main><PageIntro eyebrow={content.eyebrow} title={content.title} description={content.description} />
        <section className="container info-content">
          {content.sections.map(([title, text]) => <article className="info-card" key={title}><span className="service-icon"><Check size={18} /></span><div><h2>{title}</h2><p>{text}</p></div></article>)}
          {page === 'maintenance' && <a className="button button-primary" href="/book?service=maintenance-plan&estimate=199">Ask about a maintenance plan <ArrowRight size={15} /></a>}
          {page === 'contact' && <div className="contact-actions"><a className="button button-primary" href="tel:+18005550147"><Phone size={15} /> Call (800) 555-0147</a></div>}
          {page !== 'privacy' && page !== 'terms' && page !== 'warranty' && page !== 'contact' && <a className="button button-primary" href="/services">Explore our services <ArrowRight size={15} /></a>}
        </section>
      </main>
    </SiteShell>
  )
}

function ResetPasswordPage() {
  const [notice, setNotice] = useState('')
  return <SiteShell><main className="simple-form-page container"><div className="form-card"><span className="service-icon"><KeyRound size={20} /></span><h1>Reset your password</h1><p>Enter the email address associated with your customer portal account.</p><form onSubmit={(event) => { event.preventDefault(); setNotice('Password reset is not connected yet. Call (800) 555-0147 and we’ll help you regain access.') }}><label className="field-label">Email address<input type="email" autoComplete="email" placeholder="you@example.com" required /></label><button className="button button-primary full-button form-submit" type="submit">Request reset link <ArrowRight size={15} /></button></form>{notice && <p className="form-notice" role="status">{notice}</p>}<a className="text-link" href="/portal/login"><ArrowLeft size={14} /> Back to sign in</a></div></main></SiteShell>
}

function NotFoundPage() {
  return <SiteShell><main className="empty-state container"><div className="service-icon"><Wrench size={22} /></div><span className="eyebrow">404 · Page not found</span><h1>Looks like this page needs a tune-up.</h1><p>The page may have moved. Head home or browse our HVAC services.</p><div className="not-found-actions"><a className="button button-primary" href="/">Back to home <ArrowRight size={15} /></a><a className="text-link" href="/services">Browse services</a></div></main></SiteShell>
}

export default function App() {
  const { route, navigate, handleLinkClick } = useNavigation()
  const [pathname, search = ''] = route.split('?')
  const serviceId = decodeURIComponent(pathname.split('/').filter(Boolean).at(-1) || '')
  let page
  if (pathname === '/') page = <HomePage />
  else if (pathname === '/services') page = <ServicesPage />
  else if (pathname.startsWith('/services/')) page = <ServiceDetailPage serviceId={serviceId} />
  else if (pathname === '/book') page = <BookingPage key={route} navigate={navigate} />
  else if (pathname === '/checkout') page = <CheckoutPage navigate={navigate} />
  else if (pathname === '/booking-confirmation') page = <BookingConfirmationPage />
  else if (pathname === '/portal/login') page = <PortalPage isSignUp={false} />
  else if (pathname === '/portal/signup') page = <PortalPage isSignUp />
  else if (pathname === '/portal/reset-password') page = <ResetPasswordPage />
  else if (information[pathname.slice(1)]) page = <InformationPage page={pathname.slice(1)} />
  else page = <NotFoundPage />
  return <div onClick={handleLinkClick} data-search={search}>{page}</div>
}
