import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Headphones,
  MapPin,
  Menu,
  Minus,
  Music2,
  Plus,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import './App.css'

const events = [
  {
    slug: 'neon-pulse',
    title: 'Neon Pulse Festival 2027',
    category: 'Festival',
    date: 'May 14–16, 2027',
    time: '5:00 PM',
    location: 'Chase Center, San Francisco',
    price: 89,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85',
    description: 'Three nights of boundary-pushing electronic music, immersive light, and unforgettable moments with the people who make the scene.',
    lineup: 'Maya Chen · The Midnight · Solara · DJ Kairo',
    tag: 'Selling fast',
  },
  {
    slug: 'global-tech-summit',
    title: 'Global Tech Summit 2027',
    category: 'Conference',
    date: 'June 8–10, 2027',
    time: '9:00 AM',
    location: 'Moscone Center, San Francisco',
    price: 249,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85',
    description: 'Three days of ideas, practical workshops, and conversations with the people shaping what comes next in technology.',
    lineup: 'Maya Chen · James Park · Amara Okafor',
    tag: 'Early bird',
  },
  {
    slug: 'city-lights-live',
    title: 'City Lights Live',
    category: 'Concert',
    date: 'June 21, 2027',
    time: '7:30 PM',
    location: 'The Warfield, San Francisco',
    price: 65,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&q=85',
    description: 'An intimate night of live music, big choruses, and a special one-night-only set in the heart of the city.',
    lineup: 'The Midnight · Luna Grey · special guests',
    tag: 'Just announced',
  },
  {
    slug: 'summer-sessions',
    title: 'Summer Sessions',
    category: 'Festival',
    date: 'July 10–11, 2027',
    time: '2:00 PM',
    location: 'Fort Mason, San Francisco',
    price: 74,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=85',
    description: 'Golden-hour sets, waterfront food stalls, and two days of feel-good music at San Francisco’s favorite summer party.',
    lineup: 'Solara · Benji Blue · The Coastlines',
    tag: 'Limited tickets',
  },
  {
    slug: 'creative-minds',
    title: 'Creative Minds: Design Week',
    category: 'Workshop',
    date: 'July 18, 2027',
    time: '10:00 AM',
    location: 'The Midway, San Francisco',
    price: 45,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=85',
    description: 'A hands-on day for curious creatives, with small-group workshops, inspiring speakers, and room to make something new.',
    lineup: 'Avery Brooks · Lina Moreau · Omar Reyes',
    tag: 'Workshop',
  },
  {
    slug: 'afterglow',
    title: 'Afterglow: Rooftop Sessions',
    category: 'Concert',
    date: 'August 2, 2027',
    time: '6:00 PM',
    location: 'Charmaine’s, San Francisco',
    price: 58,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85',
    description: 'A rooftop sunset, a late-night skyline, and a carefully curated line-up of local artists. Come for the view; stay for the encore.',
    lineup: 'DJ Kairo · Luna Grey · Niko Flores',
    tag: 'Almost gone',
  },
]

const sessions = [
  { time: '09:00 AM', end: '09:45 AM', track: 'MAIN STAGE', title: 'Opening Keynote: The Live Era', speaker: 'Maya Chen · PulseLive', kind: 'Keynote' },
  { time: '10:15 AM', end: '11:00 AM', track: 'STUDIO A', title: 'Designing for Real-World Audiences', speaker: 'James Park · Northstar', kind: 'Workshop' },
  { time: '11:30 AM', end: '12:15 PM', track: 'MAIN STAGE', title: 'Creative Teams That Break Boundaries', speaker: 'Amara Okafor · FutureForm', kind: 'Talk' },
  { time: '01:30 PM', end: '02:15 PM', track: 'STUDIO B', title: 'From First Note to Festival Set', speaker: 'DJ Kairo · Independent artist', kind: 'Workshop' },
  { time: '03:00 PM', end: '03:45 PM', track: 'MAIN STAGE', title: 'Make Room for the Unexpected', speaker: 'Lina Moreau · Common Ground', kind: 'Talk' },
]

const speakers = [
  { name: 'Maya Chen', role: 'Creative Director', image: 'photo-1580489944761-15a19d654956' },
  { name: 'James Park', role: 'Founder, Northstar', image: 'photo-1500648767791-00dcc994a43e' },
  { name: 'Amara Okafor', role: 'Artist & Speaker', image: 'photo-1534528741775-53994a69daeb' },
  { name: 'Lina Moreau', role: 'Design Lead', image: 'photo-1544005313-94ddf0286df2' },
]

const categories = ['All Events', 'Concert', 'Festival', 'Conference', 'Workshop']
const pageTitles = {
  '/': 'PulseLive — Find your next favorite',
  '/events': 'Explore Events — PulseLive',
  '/schedule': 'Schedule & Speakers — PulseLive',
  '/host': 'Host an Event — PulseLive',
  '/about': 'About PulseLive',
  '/login': 'Sign In — PulseLive',
  '/signup': 'Create an Account — PulseLive',
  '/forgot-password': 'Reset Password — PulseLive',
}
const eventBySlug = (slug) => events.find((event) => event.slug === slug)
const money = (amount) => `$${amount.toFixed(2)}`
const imageUrl = (image, width = 900) => `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=85`

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="PulseLive home">
        <img className="brand-mark" src="/favicon.svg" alt="" />
        <span>Pulse<span>Live</span></span>
      </a>
      <button className="mobile-menu-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
        <a href="/events" onClick={closeMenu}>Explore Events</a>
        <a href="/events?category=Conference" onClick={closeMenu}>Conferences</a>
        <a href="/events?category=Festival" onClick={closeMenu}>Festivals</a>
        <a href="/host" onClick={closeMenu}>Host an Event</a>
      </nav>
      <div className="header-actions">
        <a className="header-login" href="/login">Sign in</a>
        <a className="button button-primary button-small" href="/checkout/neon-pulse">Get Tickets <ArrowUpRight size={14} /></a>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <a className="brand" href="/" aria-label="PulseLive home">
        <img className="brand-mark" src="/favicon.svg" alt="" />
        <span>Pulse<span>Live</span></span>
      </a>
      <p>Make room for a night worth remembering.</p>
      <nav aria-label="Footer navigation">
        <a href="/events">Explore events</a>
        <a href="/about">About us</a>
        <a href="/host">Host an event</a>
        <a href="/login">Your tickets</a>
      </nav>
      <small>© 2027 PulseLive. Made for moments that move you.</small>
    </footer>
  )
}

function EventCard({ event }) {
  return (
    <article className="event-card">
      <a className="event-card-image" href={`/events/${event.slug}`} style={{ backgroundImage: `linear-gradient(180deg, transparent 38%, rgba(9, 14, 30, .78)), url("${event.image}")` }} aria-label={`View ${event.title}`}>
        <span className="event-tag">{event.tag}</span>
        <span className="event-date"><CalendarDays size={13} /> {event.date}</span>
      </a>
      <div className="event-card-content">
        <div className="event-card-category">{event.category}<span>·</span>{event.time}</div>
        <h3><a href={`/events/${event.slug}`}>{event.title}</a></h3>
        <p><MapPin size={14} />{event.location}</p>
        <div className="event-card-bottom">
          <strong>From ${event.price}</strong>
          <a className="button button-outline" href={`/events/${event.slug}`}>View event <ArrowRight size={14} /></a>
        </div>
      </div>
    </article>
  )
}

function EventGrid({ items }) {
  if (!items.length) {
    return <div className="empty-state"><Search size={22} /><h3>No events found</h3><p>Try a different search or choose another category.</p><a className="text-link" href="/events">See all events <ArrowRight size={14} /></a></div>
  }
  return <div className="event-grid">{items.map((event) => <EventCard key={event.slug} event={event} />)}</div>
}

function HomePage() {
  const [category, setCategory] = useState('All Events')
  const [search, setSearch] = useState('')
  const featured = useMemo(() => events.filter((event) => {
    const matchesCategory = category === 'All Events' || event.category === category
    const term = search.trim().toLowerCase()
    return matchesCategory && (!term || `${event.title} ${event.location} ${event.category}`.toLowerCase().includes(term))
  }), [category, search])

  const submitSearch = (event) => {
    event.preventDefault()
    const query = new URLSearchParams()
    if (search.trim()) query.set('q', search.trim())
    window.location.href = `/events${query.size ? `?${query}` : ''}`
  }

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-backdrop" />
          <div className="hero-content">
            <div className="hero-copy">
              <span className="eyebrow"><span className="live-dot" /> YOUR NEXT GREAT NIGHT STARTS HERE</span>
              <h1>Discover &amp; book<br />unforgettable live<br /><span>experiences.</span></h1>
              <p>Find your people, feel the moment, and be there when the lights go up.</p>
              <div className="hero-pills"><span><Check size={13} /> Verified events</span><span><Check size={13} /> Instant tickets</span><span><Check size={13} /> Secure checkout</span></div>
              <form className="hero-search" onSubmit={submitSearch}>
                <Search size={18} />
                <label className="sr-only" htmlFor="event-search">Search events, artists, or venues</label>
                <input id="event-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events, artists, venues..." />
                <button className="button button-primary" type="submit">Find events <ArrowRight size={15} /></button>
              </form>
            </div>
            <aside className="hero-feature">
              <div className="hero-feature-image" />
              <span className="hero-feature-kicker"><span className="live-dot" /> FEATURED · SAN FRANCISCO</span>
              <h2>Neon Pulse<br />Festival 2027</h2>
              <p><CalendarDays size={14} /> May 14–16 · Chase Center</p>
              <a className="button button-primary" href="/events/neon-pulse">Explore the festival <ArrowRight size={15} /></a>
            </aside>
            <div className="hero-count"><strong>12k+</strong><span>people found their next<br />favorite event this week</span><ArrowDownRight size={18} /></div>
          </div>
          <a className="hero-scroll" href="#events">SCROLL TO EXPLORE <span /></a>
        </section>

        <section className="section events-section" id="events">
          <div className="section-heading">
            <div><span className="eyebrow">GOOD THINGS ARE HAPPENING</span><h2>Find your next <span>favorite.</span></h2></div>
            <a className="text-link" href="/events">All events <ArrowRight size={15} /></a>
          </div>
          <div className="category-tabs" role="group" aria-label="Filter featured events">
            {categories.map((item) => <button key={item} type="button" className={category === item ? 'category-tab is-active' : 'category-tab'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <EventGrid items={featured.slice(0, 6)} />
        </section>

        <section className="feature-strip">
          <div className="feature-strip-copy"><span className="eyebrow">A LITTLE MORE THAN A TICKET</span><h2>Every detail.<br /><span>Already taken care of.</span></h2><p>Clear pricing, trusted organizers, and your tickets ready the moment you book. All you have to do is show up.</p><a className="button button-primary" href="/about">Meet PulseLive <ArrowRight size={15} /></a></div>
          <div className="feature-list">
            <article><span><ShieldCheck size={19} /></span><div><h3>Tickets you can trust</h3><p>Every event and organizer is reviewed by our team.</p></div><Check size={16} /></article>
            <article><span><Headphones size={19} /></span><div><h3>Real people, real support</h3><p>We're here to help before, during, and after the show.</p></div><Check size={16} /></article>
            <article><span><Ticket size={19} /></span><div><h3>Ready when you are</h3><p>Your mobile tickets arrive instantly after checkout.</p></div><Check size={16} /></article>
          </div>
        </section>

        <section className="section numbers-section">
          <div><strong>2M<span>+</span></strong><p>tickets sold globally</p></div>
          <div><strong>4.9<span>/5</span></strong><p>average guest rating</p></div>
          <div><strong>120<span>+</span></strong><p>cities with live events</p></div>
          <div><strong>24<span>/7</span></strong><p>here when you need us</p></div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function EventsPage() {
  const params = new URLSearchParams(window.location.search)
  const initialCategory = categories.includes(params.get('category')) ? params.get('category') : 'All Events'
  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState(params.get('q') || '')
  const filtered = events.filter((event) => {
    const term = search.trim().toLowerCase()
    return (category === 'All Events' || event.category === category) && (!term || `${event.title} ${event.location} ${event.category} ${event.lineup}`.toLowerCase().includes(term))
  })
  return (
    <>
      <Header />
      <main className="page-main">
        <div className="page-heading"><span className="eyebrow">FIND YOUR PEOPLE</span><h1>Explore live events</h1><p>Big nights, new ideas, and the moments you’ll talk about tomorrow.</p></div>
        <label className="listing-search"><Search size={18} /><span className="sr-only">Search events</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events, artists, or venues" /><span>{filtered.length} events</span></label>
        <div className="category-tabs" role="group" aria-label="Filter events by type">{categories.map((item) => <button key={item} type="button" className={category === item ? 'category-tab is-active' : 'category-tab'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <EventGrid items={filtered} />
      </main>
      <Footer />
    </>
  )
}

function EventDetailPage({ event }) {
  if (!event) return <NotFoundPage />
  return (
    <>
      <Header />
      <main className="event-detail">
        <a className="back-link" href="/events"><ArrowLeft size={15} /> All events</a>
        <section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(10, 15, 31, .96), rgba(10, 15, 31, .66) 48%, rgba(10, 15, 31, .12)), url("${event.image}")` }}>
          <div><span className="event-detail-tag">{event.category} <span>·</span> {event.tag}</span><h1>{event.title}</h1><p>{event.description}</p><div className="detail-meta"><span><CalendarDays size={16} />{event.date} · {event.time}</span><span><MapPin size={16} />{event.location}</span></div><a className="button button-primary" href={`/checkout/${event.slug}`}>Choose tickets from ${event.price} <ArrowRight size={16} /></a></div>
        </section>
        <div className="detail-columns">
          <section className="detail-panel"><span className="eyebrow">ABOUT THIS EVENT</span><h2>Be part of the moment.</h2><p>{event.description} Bring your friends, arrive early, and make the night your own. Your mobile ticket will be ready as soon as your booking is confirmed.</p><div className="lineup-note"><Music2 size={18} /><div><strong>On the lineup</strong><span>{event.lineup}</span></div></div></section>
          <aside className="ticket-panel"><span className="eyebrow">YOUR NIGHT OUT</span><h2>Make it happen.</h2><p><CalendarDays size={15} />{event.date}</p><p><MapPin size={15} />{event.location}</p><div className="ticket-price"><span>Tickets from</span><strong>${event.price}<small> / person</small></strong></div><a className="button button-primary button-full" href={`/checkout/${event.slug}`}>Book your tickets <ArrowRight size={16} /></a><small className="secure-note"><ShieldCheck size={13} />Secure checkout · Instant mobile tickets</small></aside>
        </div>
        <section className="section"><div className="section-heading"><div><span className="eyebrow">MORE WAYS TO GO OUT</span><h2>You might also <span>love.</span></h2></div><a className="text-link" href="/events">Browse all events <ArrowRight size={15} /></a></div><EventGrid items={events.filter((item) => item.slug !== event.slug).slice(0, 3)} /></section>
      </main>
      <Footer />
    </>
  )
}

function SchedulePage() {
  const [day, setDay] = useState('Day 1')
  const [savedSessions, setSavedSessions] = useState([])
  const days = ['Day 1', 'Day 2', 'Day 3']
  const toggleSession = (title) => setSavedSessions((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title])
  return (
    <>
      <Header />
      <main className="page-main schedule-page">
        <div className="schedule-banner"><span className="eyebrow">GLOBAL TECH SUMMIT 2027</span><h1>Schedule &amp; speakers</h1><p>Three days of big ideas, useful skills, and new connections.</p></div>
        <div className="schedule-toolbar"><div className="day-tabs" role="group" aria-label="Choose event day">{days.map((item, index) => <button type="button" key={item} className={day === item ? 'day-tab is-active' : 'day-tab'} aria-pressed={day === item} onClick={() => setDay(item)}><strong>{item}</strong><span>{['June 8', 'June 9', 'June 10'][index]}</span></button>)}</div><span className="schedule-location"><MapPin size={14} /> Moscone Center · San Francisco</span></div>
        <div className="schedule-layout">
          <section className="session-list" aria-label={`${day} sessions`}>{sessions.map((session, index) => <article className="session-card" key={session.title}><div className="session-time"><strong>{day === 'Day 1' ? session.time : `${String(9 + index).padStart(2, '0')}:00 AM`}</strong><span>{session.end}</span></div><div className="session-info"><span className="session-track">{session.track} <span>·</span> {session.kind}</span><h2>{day === 'Day 1' ? session.title : [`Build What Matters`, `Finding Your Creative Edge`, `Small Teams, Big Ideas`, `The Future of Live`, `Closing Conversation`][index]}</h2><p><Users size={14} />{session.speaker}</p></div><button className={savedSessions.includes(session.title) ? 'save-session is-saved' : 'save-session'} type="button" aria-label={savedSessions.includes(session.title) ? 'Remove session from schedule' : 'Add session to schedule'} aria-pressed={savedSessions.includes(session.title)} onClick={() => toggleSession(session.title)}>{savedSessions.includes(session.title) ? <Check size={16} /> : <Plus size={16} />}</button></article>)}</section>
          <aside className="my-schedule"><span className="eyebrow">YOUR DAY, YOUR WAY</span><h2>My schedule</h2><p>{savedSessions.length ? `${savedSessions.length} session${savedSessions.length === 1 ? '' : 's'} saved for later.` : 'Tap the plus on a session to save it here.'}</p>{savedSessions.length > 0 && <ul>{savedSessions.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul>}<div className="schedule-ticket"><Ticket size={17} /><div><strong>Still need your pass?</strong><span>Join us at Global Tech Summit.</span></div></div><a className="button button-primary button-full" href="/checkout/global-tech-summit">Get your pass <ArrowRight size={15} /></a></aside>
        </div>
        <section className="section speaker-section"><div className="section-heading"><div><span className="eyebrow">THE PEOPLE BEHIND THE IDEAS</span><h2>Meet the <span>speakers.</span></h2></div><a className="text-link" href="/events/global-tech-summit">Summit details <ArrowRight size={15} /></a></div><div className="speaker-grid">{speakers.map((speaker) => <article className="speaker-card" key={speaker.name}><img src={imageUrl(speaker.image, 420)} alt={speaker.name} /><h3>{speaker.name}</h3><p>{speaker.role}</p><span><Users size={13} /> Global Tech Summit</span></article>)}</div></section>
      </main>
      <Footer />
    </>
  )
}

function CheckoutPage({ event }) {
  const [quantity, setQuantity] = useState(1)
  const [ticketType, setTicketType] = useState('General Admission')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const selectedEvent = event || events[0]
  const unitPrice = selectedEvent.price + (ticketType === 'VIP Pass' ? 100 : 0)
  const subtotal = unitPrice * quantity
  const serviceFee = Math.round(subtotal * 0.08 * 100) / 100
  const total = subtotal + serviceFee

  const submitOrder = (formEvent) => {
    formEvent.preventDefault()
    setError('')
    setConfirmed(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (confirmed) {
    return (
      <>
        <Header />
        <main className="confirmation-page"><div className="confirmation-card"><span className="confirmation-icon"><Check size={30} /></span><span className="eyebrow">YOU’RE ON THE LIST</span><h1>It’s going to be a good one.</h1><p>Your demo booking for <strong>{selectedEvent.title}</strong> is confirmed. Your tickets are ready to view below.</p><div className="confirmation-ticket"><Ticket size={20} /><div><strong>{quantity} × {ticketType}</strong><span>{selectedEvent.date} · {selectedEvent.location}</span></div><strong>{money(total)}</strong></div><p className="demo-notice">Demo checkout only: no payment was collected and no ticket was issued.</p><a className="button button-primary" href="/events">Keep exploring <ArrowRight size={15} /></a></div></main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="page-main checkout-page">
        <a className="back-link" href={`/events/${selectedEvent.slug}`}><ArrowLeft size={15} /> Back to event</a>
        <div className="page-heading checkout-heading"><span className="eyebrow">YOUR NIGHT IS ALMOST HERE</span><h1>Choose your tickets</h1><p>{selectedEvent.title} <span>·</span> {selectedEvent.date}</p></div>
        <div className="checkout-layout">
          <section className="checkout-main">
            <div className="checkout-panel"><div className="checkout-panel-heading"><span className="checkout-step">01</span><div><h2>Pick your experience</h2><p>Choose your ticket type and quantity.</p></div></div>
              <label className={ticketType === 'General Admission' ? 'ticket-option is-selected' : 'ticket-option'}><input type="radio" name="ticket-type" value="General Admission" checked={ticketType === 'General Admission'} onChange={() => setTicketType('General Admission')} /><span className="radio-indicator" /><span className="ticket-option-copy"><strong>General Admission</strong><small>Full event access · Mobile ticket</small></span><strong>${selectedEvent.price}</strong></label>
              <label className={ticketType === 'VIP Pass' ? 'ticket-option is-selected' : 'ticket-option'}><input type="radio" name="ticket-type" value="VIP Pass" checked={ticketType === 'VIP Pass'} onChange={() => setTicketType('VIP Pass')} /><span className="radio-indicator" /><span className="ticket-option-copy"><strong>VIP Pass <span className="vip-label">MOST POPULAR</span></strong><small>Priority entry · Premium viewing area</small></span><strong>${selectedEvent.price + 100}</strong></label>
              <div className="quantity-row"><div><strong>How many tickets?</strong><span>Up to 6 tickets per order.</span></div><div className="quantity-control"><button type="button" aria-label="Remove one ticket" disabled={quantity <= 1} onClick={() => setQuantity((count) => Math.max(1, count - 1))}><Minus size={14} /></button><strong>{quantity}</strong><button type="button" aria-label="Add one ticket" disabled={quantity >= 6} onClick={() => setQuantity((count) => Math.min(6, count + 1))}><Plus size={14} /></button></div></div>
            </div>
            <form className="checkout-panel guest-form" onSubmit={submitOrder}><div className="checkout-panel-heading"><span className="checkout-step">02</span><div><h2>Who’s coming?</h2><p>Your tickets will be sent to this email address.</p></div></div><div className="form-grid"><label>Full name<input name="name" autoComplete="name" placeholder="Your name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label></div><label className="demo-card-label">Payment method</label><div className="demo-card"><ShieldCheck size={17} /><span>Demo card payment</span><small>Secure checkout preview</small></div><p className="demo-notice">This is a demo. Submitting will not charge a card or create a real ticket.</p><button className="button button-primary button-full" type="submit">Confirm demo booking · {money(total)} <ArrowRight size={16} /></button>{error && <p className="form-error" role="alert">{error}</p>}</form>
          </section>
          <aside className="order-summary"><span className="eyebrow">ORDER SUMMARY</span><div className="summary-event-image" style={{ backgroundImage: `url("${selectedEvent.image}")` }} /><h2>{selectedEvent.title}</h2><p><CalendarDays size={14} />{selectedEvent.date}</p><p><MapPin size={14} />{selectedEvent.location}</p><div className="summary-line"><span>{quantity} × {ticketType}</span><strong>{money(subtotal)}</strong></div><div className="summary-line"><span>Service fee</span><strong>{money(serviceFee)}</strong></div><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><span className="secure-note"><ShieldCheck size={13} />Encrypted, secure demo checkout</span></aside>
        </div>
      </main>
      <Footer />
    </>
  )
}

function AuthPage({ page }) {
  const [message, setMessage] = useState('')
  const isSignup = page === 'signup'
  const isForgot = page === 'forgot-password'
  const title = isForgot ? 'Reset your password' : isSignup ? 'Create your account' : 'Welcome back'
  const submit = (event) => {
    event.preventDefault()
    setMessage(isForgot ? 'If that email is registered, reset instructions are on their way.' : isSignup ? 'Your demo account is ready. Welcome to PulseLive!' : 'You’re signed in for this demo session.')
  }
  return (
    <main className="auth-page">
      <section className="auth-art"><div className="auth-art-image" /><a className="brand" href="/"><img className="brand-mark" src="/favicon.svg" alt="" /><span>Pulse<span>Live</span></span></a><div className="auth-art-copy"><span className="eyebrow">THE SHOW DOESN’T END HERE</span><h1>Access your event passes, saved shows &amp; more.</h1><p>Your next favorite memory is just around the corner.</p><div className="hero-pills"><span><Ticket size={13} /> 2M+ tickets</span><span><Users size={13} /> 40k organizers</span><span><Check size={13} /> Instant entry</span></div></div></section>
      <section className="auth-area"><div className="auth-card"><a className="auth-back" href="/"><ArrowLeft size={15} /> Back to PulseLive</a><span className="eyebrow">{isForgot ? 'A FRESH START' : isSignup ? 'JOIN THE CROWD' : 'GOOD TO SEE YOU'}</span><h2>{title}</h2><p>{isForgot ? 'Enter your email and we’ll help you get back in.' : isSignup ? 'Create an account to keep your tickets and favorite events together.' : 'Sign in to find your tickets and event schedule.'}</p><form onSubmit={submit}>{isSignup && <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required /></label>}<label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>{!isForgot && <label>Password<input name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : undefined} placeholder={isSignup ? 'At least 8 characters' : 'Your password'} required /></label>}{!isSignup && !isForgot && <a className="forgot-link" href="/forgot-password">Forgot password?</a>}<button className="button button-primary button-full" type="submit">{isForgot ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'} <ArrowRight size={15} /></button></form>{message && <p className="form-success" role="status">{message}</p>}<p className="auth-switch">{isForgot ? 'Remembered your password? ' : isSignup ? 'Already have an account? ' : 'New to PulseLive? '}<a href={isForgot ? '/login' : isSignup ? '/login' : '/signup'}>{isForgot ? 'Sign in' : isSignup ? 'Sign in' : 'Create an account'}</a></p><span className="secure-note"><ShieldCheck size={13} />Your information stays private and secure.</span></div></section>
    </main>
  )
}

function HostPage() {
  const [sent, setSent] = useState(false)
  return (
    <>
      <Header />
      <main className="page-main host-page">
        <div className="host-hero"><span className="eyebrow">YOUR EVENT, FRONT AND CENTER</span><h1>Make a little<br /><span>more noise.</span></h1><p>Bring your next big idea to the people who can’t wait to be there. Tell us a little about your event and our team will be in touch.</p><a className="button button-primary" href="#host-form">Start a conversation <ArrowRight size={15} /></a></div>
        <section className="host-benefits"><article><Ticket size={20} /><h2>Easy ticketing</h2><p>Simple checkout that keeps guests moving.</p></article><article><Users size={20} /><h2>Your people, together</h2><p>Reach a community that loves live experiences.</p></article><article><Headphones size={20} /><h2>Here for the details</h2><p>Thoughtful support for every step of your event.</p></article></section>
        <form className="host-form" id="host-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}><div><span className="eyebrow">LET’S MAKE IT HAPPEN</span><h2>Tell us about your event.</h2><p>Our organizer team will follow up with next steps.</p></div><label>Your name<input name="name" autoComplete="name" placeholder="Full name" required /></label><label>Work email<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label><label>Event type<select name="eventType" defaultValue="" required><option value="" disabled>Choose an event type</option>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select><ChevronDown size={15} /></label><label>Tell us a little more<textarea name="details" rows="3" placeholder="Event name, date, and what you have in mind..." required /></label><button className="button button-primary" type="submit">Send an inquiry <ArrowRight size={15} /></button>{sent && <p className="form-success" role="status">Thanks for reaching out. Your demo inquiry has been received.</p>}</form>
      </main>
      <Footer />
    </>
  )
}

function AboutPage() {
  return (
    <>
      <Header />
      <main className="page-main about-page"><div className="about-hero"><span className="eyebrow">LIVE IS BETTER TOGETHER</span><h1>Here for the<br /><span>feeling.</span></h1><p>PulseLive brings people and live experiences together. We believe the best nights aren’t just watched; they’re felt, shared, and remembered.</p><a className="button button-primary" href="/events">Find your next event <ArrowRight size={15} /></a></div><div className="about-values"><article><span>01</span><h2>Make it easy to say yes.</h2><p>Clear details, transparent prices, and a ticket in your pocket. Less planning, more looking forward to it.</p></article><article><span>02</span><h2>Show up for the people.</h2><p>From the artists on stage to the friends beside you, live events are about the people who make the moment.</p></article><article><span>03</span><h2>Take care of every detail.</h2><p>Trusted organizers, considered support, and thoughtful tools make going out feel good from the start.</p></article></div><section className="about-cta"><h2>Good things are happening.</h2><p>Find the night you’ll still be talking about next week.</p><a className="button button-primary" href="/events">Explore events <ArrowRight size={15} /></a></section></main>
      <Footer />
    </>
  )
}

function NotFoundPage() {
  return <><Header /><main className="not-found"><span className="eyebrow">THIS ONE’S A MYSTERY</span><h1>We can’t find that event.</h1><p>It may have moved, sold out, or never made the set list.</p><a className="button button-primary" href="/events">Explore all events <ArrowRight size={15} /></a></main><Footer /></>
}

function App() {
  const { pathname } = window.location
  const eventMatch = pathname.match(/^\/events\/([^/]+)\/?$/)
  const checkoutMatch = pathname.match(/^\/checkout(?:\/([^/]+))?\/?$/)
  const detail = eventMatch ? eventBySlug(decodeURIComponent(eventMatch[1])) : null
  const checkoutEvent = checkoutMatch?.[1] ? eventBySlug(decodeURIComponent(checkoutMatch[1])) : events[0]
  useEffect(() => {
    document.title = detail ? `${detail.title} — PulseLive` : checkoutMatch ? `Tickets — ${checkoutEvent?.title || 'PulseLive'}` : pageTitles[pathname] || 'PulseLive — Live experiences'
  }, [checkoutEvent, checkoutMatch, detail, pathname])

  if (pathname === '/') return <HomePage />
  if (pathname === '/events') return <EventsPage />
  if (pathname === '/schedule') return <SchedulePage />
  if (eventMatch) return <EventDetailPage event={detail} />
  if (checkoutMatch) return <CheckoutPage event={checkoutEvent} />
  if (pathname === '/host') return <HostPage />
  if (pathname === '/about') return <AboutPage />
  if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') return <AuthPage page={pathname.slice(1)} />
  return <NotFoundPage />
}

export default App
