import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, LogOut, MapPin, ShieldCheck } from 'lucide-react'
import PageShell from '../components/PageShell'
import { stays, imageUrl } from '../data/stays'
import { clearSession, escapesLocalStore, getSavedStays, getSession, toggleSavedStay } from '../services/escapesLocalStore'
import StayCard from '../components/StayCard'

export default function ClientDashboardPage({ section = 'overview' }) {
  const [session] = useState(getSession)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(() => Boolean(session?.user.role === 'client'))
  const [error, setError] = useState('')
  const [savedSlugs, setSavedSlugs] = useState(() => getSavedStays(session?.user.id))
  const accessError = session && session.user.role !== 'client'

  useEffect(() => {
    if (!session || session.user.role !== 'client') return
    escapesLocalStore.clientDashboard()
      .then((result) => setReservations(result.reservations))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Your trips could not be loaded.'))
      .finally(() => setLoading(false))
  }, [session])

  function signOut() {
    clearSession()
    window.location.assign('/signin')
  }

  const staysBySlug = Object.fromEntries(stays.map((stay) => [stay.slug, stay]))
  const sectionTitles = {
    overview: ['Your Escapes', 'A snapshot of your travel plans and favorite places.'],
    reservations: ['Your reservations', 'Review upcoming and past stays in one place.'],
    saved: ['Saved stays', 'Your shortlist of places to visit next.'],
    profile: ['Your profile', 'Your local demo account details.'],
  }
  const [title, description] = sectionTitles[section] || sectionTitles.overview

  function toggleSaved(slug) {
    try {
      setSavedSlugs(toggleSavedStay(slug))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <PageShell>
      <main className="page-main account-dashboard dashboard-layout">
        <aside className="dashboard-sidebar">
          <a className="dashboard-sidebar-brand" href="/"><ShieldCheck size={22} /><span>Escapes<small>Guest workspace</small></span></a>
          <span className="dashboard-nav-label">YOUR STAY</span>
          <nav className="dashboard-sidebar-nav" aria-label="Guest dashboard">
            <a className={section === 'overview' ? 'is-active' : ''} href="/client/dashboard"><CalendarDays size={17} /> Overview</a>
            <a className={section === 'reservations' ? 'is-active' : ''} href="/client/reservations"><CalendarDays size={17} /> Reservations</a>
            <a className={section === 'saved' ? 'is-active' : ''} href="/client/saved"><MapPin size={17} /> Saved stays</a>
            <a href="/stays"><MapPin size={17} /> Discover stays</a>
            <a className={section === 'profile' ? 'is-active' : ''} href="/client/profile"><ShieldCheck size={17} /> Profile</a>
          </nav>
          <div className="dashboard-sidebar-footer"><a href="/">Back to Escapes <ArrowRight size={14} /></a><span><i /> Guest workspace</span></div>
        </aside>
        <div className="dashboard-main">
          <div className="dashboard-heading">
            <div><span className="eyebrow dashboard-eyebrow">GUEST ACCOUNT</span><h1>{title}</h1><p>{session?.user.name ? `${description} Welcome back, ${session.user.name}.` : 'Sign in to manage your travel plans and reservations.'}</p></div>
            {session && <button className="outline-button" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button>}
          </div>
          {!session && <section className="dashboard-panel dashboard-empty"><ShieldCheck size={24} /><h2>Your trips, all in one place</h2><p>Sign in or create a guest account to view your reservation history.</p><div className="dashboard-action-row"><a className="button button-primary" href="/signin?next=%2Fclient%2Fdashboard">Sign in</a><a className="outline-button" href="/signup?next=%2Fclient%2Fdashboard">Create account</a></div></section>}
          {(error || accessError) && <p className="form-error" role="alert">{error || 'This account does not have guest dashboard access.'} <a href="/signin">Sign in with a guest account</a></p>}
          {loading && <p className="dashboard-loading">Loading your reservations…</p>}
          {session?.user.role === 'client' && !loading && !error && section === 'overview' && <>
            <div className="dashboard-metrics"><article><span>Reservations</span><strong>{reservations.length}</strong></article><article><span>Upcoming stays</span><strong>{reservations.filter((reservation) => reservation.checkIn >= new Date().toISOString().slice(0, 10) && reservation.status !== 'cancelled').length}</strong></article></div>
            {reservations.some((reservation) => reservation.demoData) && <p className="payment-disclaimer">Sample reservations are preview data saved only in this browser.</p>}
            <section className="dashboard-panel" id="reservations">
              <div className="dashboard-panel-heading"><div><h2>Your reservations</h2><p>Reservation details are visible only to your account.</p></div><a className="text-link" href="/stays">Find a stay <ArrowRight size={14} /></a></div>
              {reservations.length === 0 ? <div className="dashboard-empty"><CalendarDays size={23} /><h2>Your next escape is waiting</h2><p>Reservations you complete at checkout will appear here.</p><a className="button button-primary" href="/stays">Explore stays</a></div> : <div className="reservation-list">{reservations.map((reservation) => {
                const stay = staysBySlug[reservation.staySlug]
                return <article className="reservation-card" key={reservation.id}>
                  {stay && <img src={imageUrl(stay.image, 340)} alt={stay.name} />}
                  <div className="reservation-card-main">
                    <div className="reservation-title-row"><div><span className="stay-tag">{stay?.type || 'Stay'}</span><h3>{reservation.stayName}</h3></div><span className={`reservation-status status-${reservation.status}`}>{reservation.status}</span></div>
                    <p><CalendarDays size={14} /> {reservation.checkIn} — {reservation.checkOut} · {reservation.nights} nights</p>
                    <p><MapPin size={14} /> {stay?.area || reservation.staySlug} · {reservation.guests} guests</p>
                    <div className="reservation-total"><span>{reservation.reference} · {reservation.paymentStatus === 'not_collected' ? 'Payment not collected' : reservation.paymentStatus}</span><strong>${reservation.total} USD</strong></div>
                  </div>
                </article>
              })}</div>}
            </section>
          </>}
          {session?.user.role === 'client' && !loading && !error && section === 'reservations' && <section className="dashboard-panel">
            <div className="dashboard-panel-heading"><div><h2>Reservation history</h2><p>Demo requests are local previews; no payment is collected.</p></div><a className="text-link" href="/stays">Find a stay <ArrowRight size={14} /></a></div>
            {reservations.length === 0 ? <div className="dashboard-empty"><CalendarDays size={23} /><h2>No reservations yet</h2><p>Reservations will appear after you submit a request.</p><a className="button button-primary" href="/stays">Explore stays</a></div> : <div className="reservation-list">{reservations.map((reservation) => {
              const stay = staysBySlug[reservation.staySlug]
              return <article className="reservation-card" key={reservation.id}>
                {stay && <img src={imageUrl(stay.image, 340)} alt={stay.name} />}
                <div className="reservation-card-main"><div className="reservation-title-row"><div><span className="stay-tag">{stay?.type || 'Stay'}</span><h3>{reservation.stayName}</h3></div><span className={`reservation-status status-${reservation.status}`}>{reservation.status}</span></div>
                  {reservation.demoData && <span className="stay-tag">SAMPLE</span>}
                  <p><CalendarDays size={14} /> {reservation.checkIn} — {reservation.checkOut} · {reservation.nights} nights</p><p><MapPin size={14} /> {stay?.area || reservation.staySlug} · {reservation.guests} guests</p>
                  <div className="reservation-total"><span>{reservation.reference} · {reservation.paymentStatus === 'not_collected' ? 'Payment not collected' : reservation.paymentStatus}</span><strong>${reservation.total} USD</strong></div>
                </div>
              </article>
            })}</div>}
          </section>}
          {session?.user.role === 'client' && !loading && !error && section === 'saved' && <section className="dashboard-panel">
            <div className="dashboard-panel-heading"><div><h2>Places you saved</h2><p>Saved stays are stored in this browser.</p></div></div>
            {savedSlugs.length ? <div className="stay-grid">{stays.filter((stay) => savedSlugs.includes(stay.slug)).map((stay) => <div key={stay.slug}><StayCard stay={stay} /><button className="outline-button" type="button" onClick={() => toggleSaved(stay.slug)}>Remove saved stay</button></div>)}</div> : <div className="dashboard-empty"><MapPin size={23} /><h2>No saved stays yet</h2><p>Save a stay from its listing to keep it here.</p><a className="button button-primary" href="/stays">Browse stays</a></div>}
          </section>}
          {session?.user.role === 'client' && section === 'profile' && <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>Account details</h2><p>Demo profile information is kept in local storage.</p></div></div><dl className="profile-details"><div><dt>Name</dt><dd>{session.user.name}</dd></div><div><dt>Email</dt><dd>{session.user.email}</dd></div><div><dt>Account type</dt><dd>Guest</dd></div></dl><p className="payment-disclaimer">This local demo does not send profile data to a server.</p></section>}
        </div>
      </main>
    </PageShell>
  )
}
