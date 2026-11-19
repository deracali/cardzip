import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, LogOut, ShieldCheck, Ticket, Users } from 'lucide-react'
import styles from './EventHubPortals.module.css'

async function request(apiBaseUrl, path) {
  let response
  try { response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include', headers: { Accept: 'application/json' } }) }
  catch (error) { throw new Error(`Could not connect to PulseLive API: ${error.message}`) }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const apiError = new Error(result.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  return result
}

export default function EventHubPortals({ mode = 'attendee', apiBaseUrl }) {
  const organizer = mode === 'organizer'
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const session = await request(apiBaseUrl, '/auth/me')
        if (session.user.role !== mode) {
          const route = session.user.role === 'admin' ? '/admin' : session.user.role === 'organizer' ? '/organizer/dashboard' : '/dashboard'
          window.location.replace(route)
          return
        }
        if (active) setUser(session.user)
        const result = await request(apiBaseUrl, organizer ? '/organizer/bookings' : '/bookings/mine')
        if (active) setBookings(result.bookings || [])
        if (organizer) {
          const eventResult = await request(apiBaseUrl, '/organizer/events')
          if (active) setEvents(eventResult.events || [])
        }
      } catch (loadError) {
        if (!active) return
        if (loadError.status === 401) window.location.replace('/login?next=' + encodeURIComponent(window.location.pathname))
        else setError(loadError.message)
      } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, mode, organizer])

  async function signOut() {
    try { await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' }) } finally { window.location.replace('/') }
  }

  if (loading) return <div className={styles.loading}>Loading your PulseLive account…</div>
  return <main className={styles.page}><header className={styles.header}><a className={styles.brand} href="/"><img src="/favicon.svg" alt="" /><strong>PulseLive</strong></a><span><ShieldCheck size={14} /> Secure account session</span><button onClick={signOut}><LogOut size={14} /> Sign out</button></header><section className={styles.content}><small className={styles.kicker}>{organizer ? 'ORGANIZER STUDIO' : 'YOUR PULSELIVE ACCOUNT'}</small><h1>{organizer ? `Welcome, ${user?.name || 'organizer'}.` : `Your next moments, ${user?.name?.split(' ')[0] || 'here'}.`}</h1><p>{organizer ? 'Review events and booking requests connected to your organizer account.' : 'Review your event booking requests in one place.'}</p>{organizer && user?.organizerStatus !== 'approved' && <div className={styles.pending}><span><ShieldCheck size={16} /></span><div><b>Organizer application pending</b><small>Your organizer account is {user?.organizerStatus || 'pending'}. The event studio opens after admin approval.</small></div></div>}{error && <div className={styles.error} role="alert">{error}</div>}{organizer && <section className={styles.panel}><div className={styles.panelHeading}><div><small>YOUR EVENT LISTINGS · {events.length}</small><h2>Events</h2></div><a href="/host">Organizer info <ArrowRight size={13} /></a></div>{events.length ? events.map((event) => <div className={styles.eventRow} key={event._id}><span><b>{event.title}</b><small>{event.category} · {event.date} · {event.location}</small></span><i className={event.published ? styles.published : styles.draft}>{event.published ? 'Published' : 'In review'}</i></div>) : <div className={styles.empty}>No events have been assigned to your organizer account yet.</div>}</section>}<section className={styles.panel}><div className={styles.panelHeading}><div><small>{organizer ? 'EVENT ATTENDEES' : 'BOOKING REQUESTS'} · {bookings.length}</small><h2>{organizer ? 'Booking activity' : 'Your bookings'}</h2></div><Ticket size={17} /></div>{bookings.length ? bookings.map((booking) => <article className={styles.booking} key={booking._id}><span><CalendarDays size={16} /></span><div><b>{organizer ? booking.attendeeName : booking.eventTitle}</b><small>{booking.reference} · {booking.ticketType} × {booking.quantity}</small><small>{organizer ? booking.attendeeEmail : booking.eventTitle} · {new Date(booking.createdAt).toLocaleDateString()}</small></div><i className={styles[booking.status] || ''}>{booking.status}</i></article>) : <div className={styles.empty}><Users size={20} /><b>No booking requests yet</b><small>{organizer ? 'Requests for your events will appear here.' : 'Your booking requests will appear here.'}</small>{!organizer && <a href="/events">Explore events <ArrowRight size={13} /></a>}</div>}</section><footer className={styles.footer}><span>PulseLive · Live moments, together</span><a href="/events">Explore events</a></footer></section></main>
}