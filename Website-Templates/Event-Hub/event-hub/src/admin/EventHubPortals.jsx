import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, CalendarDays, CheckCircle2, Compass, LayoutDashboard, LogOut,
  MapPin, ShieldCheck, Ticket, Users,
} from 'lucide-react'
import { demoAccountsStorageKey, demoAttendee, demoClientBookings, demoOrganizer, demoSessionStorageKey, events as starterEvents, withEventFallback } from '../data/eventData'
import styles from './EventHubPortals.module.css'

const DEMO_DATA_KEY = 'pulselive-admin-demo-v1'

async function request(apiBaseUrl, path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options,
    })
  } catch (error) {
    throw new Error(`Could not connect to PulseLive API: ${error.message}`, { cause: error })
  }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const apiError = new Error(result.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  return result
}

function EventCover({ event, className = '' }) {
  return <img className={`${styles.eventImage} ${className}`} src={event.image} alt="" onError={(error) => { error.currentTarget.src = '/event-placeholder.svg' }} />
}

function BookingCard({ booking, local }) {
  const event = starterEvents.find((item) => item.slug === booking.eventSlug)
  return (
    <article className={styles.booking}>
      <div className={styles.bookingImage}>{event && <EventCover event={event} />}</div>
      <div className={styles.bookingInfo}>
        <span className={styles.bookingMeta}>{booking.ticketType} <i>·</i> {booking.quantity} {booking.quantity === 1 ? 'ticket' : 'tickets'}</span>
        <strong>{booking.eventTitle}</strong>
        <small><CalendarDays size={13} />{event?.date || new Date(booking.createdAt).toLocaleDateString()}</small>
      </div>
      <div className={styles.bookingStatus}>
        <span className={booking.status === 'confirmed' ? styles.confirmed : styles.requested}>{booking.status === 'confirmed' ? 'Confirmed' : 'Request pending'}</span>
        <strong>${Number(booking.total || 0).toFixed(2)}</strong>
        <small>{local ? 'Demo booking' : booking.reference}</small>
      </div>
      <a className={styles.bookingLink} href={event ? `/events/${event.slug}` : '/events'} aria-label={`View ${booking.eventTitle}`}><ArrowRight size={17} /></a>
    </article>
  )
}

export default function EventHubPortals({ mode = 'attendee', storageMode = 'api', apiBaseUrl = '', section = 'overview' }) {
  const organizer = mode === 'organizer'
  const local = storageMode === 'local'
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (local) {
      async function loadDemo() {
        try {
          const stored = JSON.parse(localStorage.getItem(DEMO_DATA_KEY) || 'null')
          const session = JSON.parse(localStorage.getItem(demoSessionStorageKey) || 'null')
          const accounts = JSON.parse(localStorage.getItem(demoAccountsStorageKey) || '[]')
          await Promise.resolve()
          if (!active) return
          const account = accounts.find((item) => item.email?.toLowerCase() === session?.email?.toLowerCase())
          const currentUser = session || account || (organizer ? demoOrganizer : demoAttendee)
          if (currentUser.role && currentUser.role !== mode) {
            window.location.replace(currentUser.role === 'organizer' ? '/organizer/dashboard' : '/dashboard/tickets')
            return
          }
          setUser(currentUser)
          setEvents(starterEvents.map(withEventFallback))
          const storedBookings = Array.isArray(stored?.bookings) ? stored.bookings : []
          setBookings(organizer ? demoClientBookings : [...demoClientBookings, ...storedBookings])
        } catch (loadError) {
          if (active) setError(`Unable to load the local event demo: ${loadError.message}`)
        } finally {
          if (active) setLoading(false)
        }
      }
      void loadDemo()
      return () => { active = false }
    }

    async function load() {
      try {
        const session = await request(apiBaseUrl, '/auth/me')
        if (session.user.role !== mode) {
          const route = session.user.role === 'admin' ? '/admin' : session.user.role === 'organizer' ? '/organizer/dashboard' : '/dashboard/tickets'
          window.location.replace(route)
          return
        }
        if (active) setUser(session.user)
        const bookingResult = await request(apiBaseUrl, organizer ? '/organizer/bookings' : '/bookings/mine')
        if (active) setBookings(bookingResult.bookings || [])
        if (organizer) {
          const eventResult = await request(apiBaseUrl, '/organizer/events')
          if (active) setEvents((eventResult.events || []).map(withEventFallback))
        }
      } catch (loadError) {
        if (!active) return
        if (loadError.status === 401) window.location.replace('/login?next=' + encodeURIComponent(window.location.pathname))
        else setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, local, mode, organizer])

  const ticketCount = useMemo(() => bookings.reduce((total, booking) => total + Number(booking.quantity || 0), 0), [bookings])
  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length
  const nextEvent = starterEvents.find((event) => !bookings.some((booking) => booking.eventSlug === event.slug && booking.status === 'confirmed')) || starterEvents[0]
  const sectionTitle = organizer
    ? ({ overview: 'Event operations', events: 'My events', bookings: 'Booking activity', profile: 'Account profile' }[section] || 'Event operations')
    : ({ overview: 'My PulseLive', tickets: 'My tickets', profile: 'Account profile' }[section] || 'My PulseLive')

  async function signOut() {
    if (local) {
      localStorage.removeItem(demoSessionStorageKey)
      window.location.assign('/')
      return
    }
    try {
      await request(apiBaseUrl, '/auth/logout', { method: 'POST' })
      window.location.assign('/')
    } catch (signOutError) {
      setError(signOutError.message)
    }
  }

  if (loading) return <div className={styles.loading}><span />Loading your PulseLive workspace</div>
  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/"><span className={styles.brandIcon}><Ticket size={19} /></span><strong>Pulse<span>Live</span></strong></a>
        <small className={styles.sidebarLabel}>{organizer ? 'ORGANIZER WORKSPACE' : 'YOUR ACCOUNT'}</small>
        <nav className={styles.nav} aria-label="Dashboard navigation">
          <a className={section === 'overview' ? styles.navActive : ''} href={organizer ? '/organizer/dashboard' : '/dashboard'}><LayoutDashboard size={17} />Overview</a>
          {organizer
            ? <><a className={section === 'events' ? styles.navActive : ''} href="/organizer/dashboard/events"><CalendarDays size={17} />My events</a><a className={section === 'bookings' ? styles.navActive : ''} href="/organizer/dashboard/bookings"><Ticket size={17} />Booking activity</a><a className={section === 'profile' ? styles.navActive : ''} href="/organizer/dashboard/profile"><Users size={17} />Profile</a></>
            : <><a className={section === 'tickets' ? styles.navActive : ''} href="/dashboard/tickets"><Ticket size={17} />My tickets</a><a className={section === 'profile' ? styles.navActive : ''} href="/dashboard/profile"><Users size={17} />Profile</a></>}
          <a href="/events"><Compass size={17} />Explore events</a>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.privacy}><ShieldCheck size={17} /><strong>Your account, protected</strong><small>{local ? 'Static browser demo · no payment collected' : 'Secure, API-connected account session'}</small></div>
          <button className={styles.sidebarSignOut} type="button" onClick={signOut}><LogOut size={15} />Sign out</button>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div><small>{organizer ? 'ORGANIZER STUDIO' : 'ATTENDEE ACCOUNT'}</small><strong>{sectionTitle}</strong></div>
          <div className={styles.topbarActions}><span className={styles.connection}><i />{local ? 'Demo data' : 'Connected'}</span><span className={styles.userChip}><i>{user?.name?.slice(0, 1)?.toUpperCase() || 'P'}</i><strong>{user?.name || 'PulseLive guest'}</strong></span></div>
        </header>
        <section className={styles.content}>
          <div className={styles.welcome}>
            <div><span className={styles.kicker}>{organizer ? 'YOUR EVENT BUSINESS' : 'THE GOOD TIMES, ALL IN ONE PLACE'}</span><h1>{section === 'tickets' ? 'Your ticket wallet.' : section === 'profile' ? 'Your account details.' : organizer && section === 'events' ? 'Your event listings.' : organizer && section === 'bookings' ? 'Your attendees.' : organizer ? `Welcome, ${user?.name || 'organizer'}.` : `Your next moments, ${user?.name?.split(' ')[0] || 'here'}.`}</h1><p>{section === 'tickets' ? 'View booking status, ticket quantities, and event details in one place.' : section === 'profile' ? 'Review the account details connected to your PulseLive access.' : organizer && section === 'events' ? 'Keep track of event submissions and publishing status.' : organizer && section === 'bookings' ? 'Review the attendees and bookings for your events.' : organizer ? 'Keep track of your live events and the people coming to them.' : 'Your tickets, booking updates, and next favorite event—all together.'}</p></div>
            <a className={styles.primaryAction} href={organizer ? '/host' : '/events'}>{organizer ? 'Event help' : 'Discover events'}<ArrowRight size={15} /></a>
          </div>
          {error && <div className={styles.error} role="alert">{error}</div>}
          {organizer && user?.organizerStatus !== 'approved' && <div className={styles.pending}><ShieldCheck size={19} /><div><strong>Organizer application pending</strong><small>Your organizer tools open after an administrator approves your account.</small></div></div>}
          {!organizer && section === 'overview' && <section className={styles.stats} aria-label="Ticket summary">
            <article><span className={styles.statIcon}><Ticket size={18} /></span><div><small>Total tickets</small><strong>{ticketCount}</strong><em>Across all bookings</em></div></article>
            <article><span className={`${styles.statIcon} ${styles.statGreen}`}><CheckCircle2 size={18} /></span><div><small>Confirmed bookings</small><strong>{confirmedCount}</strong><em>Ready for event day</em></div></article>
            <article><span className={`${styles.statIcon} ${styles.statBlue}`}><CalendarDays size={18} /></span><div><small>Saved bookings</small><strong>{bookings.length}</strong><em>Your event plans</em></div></article>
          </section>}
          <div className={styles.dashboardGrid}>
            <div>
              {(organizer ? section === 'overview' || section === 'events' : section === 'overview' || section === 'tickets') && <section className={styles.panel} id={organizer ? 'events' : 'bookings'}>
                <div className={styles.panelHeading}><div><small>{organizer ? `YOUR EVENT LISTINGS · ${events.length}` : `BOOKING ACTIVITY · ${bookings.length}`}</small><h2>{organizer ? 'Your events' : 'Your tickets'}</h2><p>{organizer ? 'Stay on top of your published events and applications.' : 'Everything you need for your upcoming experiences.'}</p></div><Ticket size={19} /></div>
                {organizer ? events.length ? <div className={styles.eventList}>{events.map((event) => <article className={styles.eventRow} key={event.slug}><EventCover event={event} /><div><strong>{event.title}</strong><small><CalendarDays size={13} />{event.date}<i>·</i><MapPin size={13} />{event.location}</small></div><span className={event.published ? styles.confirmed : styles.requested}>{event.published ? 'Published' : 'In review'}</span></article>)}</div> : <div className={styles.empty}><Users size={22} /><strong>No event listings yet</strong><small>New event applications will show up here.</small></div>
                  : bookings.length ? <div className={styles.bookingList}>{bookings.map((booking) => <BookingCard booking={booking} local={local} key={booking._id || booking.id || booking.reference} />)}</div> : <div className={styles.empty}><Ticket size={22} /><strong>Your ticket wallet is ready</strong><small>Once you book an event, your ticket details will appear here.</small><a href="/events">Explore events<ArrowRight size={14} /></a></div>}
              </section>}
              {organizer && (section === 'overview' || section === 'bookings') && <section className={styles.panel}><div className={styles.panelHeading}><div><small>ATTENDEE ACTIVITY · {bookings.length}</small><h2>Booking activity</h2><p>Bookings connected to your event listings.</p></div><Users size={19} /></div>{bookings.length ? <div className={styles.bookingList}>{bookings.map((booking) => <BookingCard booking={booking} local={local} key={booking._id || booking.id || booking.reference} />)}</div> : <div className={styles.empty}><Ticket size={22} /><strong>No bookings yet</strong><small>Attendee bookings will appear here.</small></div>}</section>}
              {section === 'profile' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>PROFILE</small><h2>Account details</h2><p>Your registered PulseLive identity and account type.</p></div><Users size={19} /></div><div className={styles.profileDetails}><span>Full name</span><strong>{user?.name || 'PulseLive guest'}</strong><span>Email address</span><strong>{user?.email || 'Not available'}</strong><span>Account type</span><strong>{organizer ? 'Organizer' : 'Attendee'}</strong>{organizer && <><span>Organizer application</span><strong>{user?.organizerStatus || 'Pending review'}</strong></>}</div></section>}
            </div>
            <aside className={styles.sideColumn}>
              {!organizer && section !== 'profile' && <section className={styles.featured}>
                <EventCover event={nextEvent} className={styles.featuredImage} />
                <div><span className={styles.kicker}>YOUR NEXT GREAT NIGHT</span><h2>{nextEvent.title}</h2><p><CalendarDays size={14} />{nextEvent.date}</p><p><MapPin size={14} />{nextEvent.location}</p><a href={`/events/${nextEvent.slug}`}>Discover event<ArrowRight size={14} /></a></div>
              </section>}
              <a className={styles.helpCard} href={organizer ? '/host' : '/about'}><span><ShieldCheck size={16} /></span><div><strong>{organizer ? 'Need help hosting?' : 'Planning something special?'}</strong><small>{organizer ? 'Get in touch with the PulseLive team.' : 'Find your next show, festival, or idea.'}</small></div><ArrowRight size={15} /></a>
            </aside>
          </div>
          <footer className={styles.footer}><span>PulseLive · Live moments, together</span><a href="/events">Explore more events</a></footer>
        </section>
      </div>
    </main>
  )
}
