import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, LogOut, MapPin, ShieldCheck } from 'lucide-react'
import PageShell from '../components/PageShell'
import { stays, imageUrl } from '../data/stays'
import { clearSession, escapesApi, getSession } from '../services/escapesApi'

export default function ClientDashboardPage() {
  const [session] = useState(getSession)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(() => Boolean(session?.user.role === 'client'))
  const [error, setError] = useState('')
  const [accessError, setAccessError] = useState(() => session && session.user.role !== 'client')

  useEffect(() => {
    if (!session || session.user.role !== 'client') return
    escapesApi.clientDashboard()
      .then((result) => setReservations(result.reservations))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Your trips could not be loaded.'))
      .finally(() => setLoading(false))
  }, [session])

  function signOut() {
    clearSession()
    window.location.assign('/signin')
  }

  const staysBySlug = Object.fromEntries(stays.map((stay) => [stay.slug, stay]))

  return (
    <PageShell>
      <main className="page-main account-dashboard">
        <div className="dashboard-heading">
          <div><span className="eyebrow dashboard-eyebrow">GUEST ACCOUNT</span><h1>Your Escapes</h1><p>{session?.user.name ? `Welcome back, ${session.user.name}.` : 'Sign in to manage your travel plans and reservations.'}</p></div>
          {session && <button className="outline-button" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button>}
        </div>
        {!session && <section className="dashboard-panel dashboard-empty"><ShieldCheck size={24} /><h2>Your trips, all in one place</h2><p>Sign in or create a guest account to view your reservation history.</p><div className="dashboard-action-row"><a className="button button-primary" href="/signin?next=%2Fclient%2Fdashboard">Sign in</a><a className="outline-button" href="/signup?next=%2Fclient%2Fdashboard">Create account</a></div></section>}
        {(error || accessError) && <p className="form-error" role="alert">{error || 'This account does not have guest dashboard access.'} <a href="/signin">Sign in with a guest account</a></p>}
        {loading && <p className="dashboard-loading">Loading your reservations…</p>}
        {session?.user.role === 'client' && !loading && !error && <>
          <div className="dashboard-metrics"><article><span>Reservations</span><strong>{reservations.length}</strong></article><article><span>Upcoming stays</span><strong>{reservations.filter((reservation) => reservation.checkIn >= new Date().toISOString().slice(0, 10) && reservation.status !== 'cancelled').length}</strong></article></div>
          <section className="dashboard-panel">
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
      </main>
    </PageShell>
  )
}
