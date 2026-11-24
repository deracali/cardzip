import { useEffect, useState } from 'react'
import { ArrowRight, Building2, CalendarDays, LogOut, MapPin, ShieldCheck } from 'lucide-react'
import { clearSession, escapesApi, getSession } from '../services/escapesApi'
import { stays } from '../data/stays'

const adminSections = {
  overview: { title: 'Reservation dashboard', description: 'A live view of reservation activity and guest accounts.' },
  reservations: { title: 'Reservations', description: 'Review guest stays and update request statuses.' },
  guests: { title: 'Guest accounts', description: 'Browse guest accounts and reservation history.' },
  properties: { title: 'Property listings', description: 'Add properties and manage the stays offered to guests.' },
}

export default function AdminDashboardPage({ section = 'overview' }) {
  const [session] = useState(getSession)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(() => session?.user.role === 'admin')
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState('')
  const [creating, setCreating] = useState(false)
  const activeSection = adminSections[section] ? section : 'overview'
  const accessError = session && session.user.role !== 'admin'

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return
    escapesApi.adminDashboard()
      .then(setDashboard)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Admin dashboard could not be loaded.'))
      .finally(() => setLoading(false))
  }, [session])

  function signOut() {
    clearSession()
    window.location.assign('/admin/login')
  }

  async function updateStatus(reservationId, status) {
    setUpdating(reservationId)
    setError('')
    try {
      await escapesApi.updateBooking(reservationId, status)
      setDashboard(await escapesApi.adminDashboard())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Reservation status could not be updated.')
    } finally {
      setUpdating('')
    }
  }

  async function createStay(event) {
    event.preventDefault()
    setCreating(true)
    setError('')
    const form = event.currentTarget
    const body = Object.fromEntries(new FormData(form).entries())
    try {
      const { stay } = await escapesApi.createStay(body)
      setDashboard((current) => ({ ...current, stays: [...current.stays, stay] }))
      form.reset()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Property could not be saved.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <aside className="dashboard-sidebar">
          <a className="dashboard-sidebar-brand" href="/"><ShieldCheck size={22} /><span>Escapes<small>Operations</small></span></a>
          <span className="dashboard-nav-label">MANAGEMENT</span>
          <nav className="dashboard-sidebar-nav" aria-label="Administrator dashboard">
            <a className={activeSection === 'overview' ? 'is-active' : ''} href="/admin/dashboard"><ShieldCheck size={17} /> Overview</a>
            <a className={activeSection === 'reservations' ? 'is-active' : ''} href="/admin/reservations"><CalendarDays size={17} /> Reservations</a>
            <a className={activeSection === 'properties' ? 'is-active' : ''} href="/admin/stays"><Building2 size={17} /> Properties</a>
            <a className={activeSection === 'guests' ? 'is-active' : ''} href="/admin/guests"><MapPin size={17} /> Guest accounts</a>
          </nav>
          <div className="dashboard-sidebar-footer"><a href="/">Back to Escapes <ArrowRight size={14} /></a><span><i /> Operations workspace</span></div>
        </aside>
        <div className="admin-dashboard-content">
        <header className="admin-dashboard-header">
          <div><span>Operations</span><span>{session?.user.name || 'Administrator'}</span></div>{session && <button className="outline-button" type="button" onClick={signOut}><LogOut size={14} /> Sign out</button>}
        </header>
        <div className="admin-dashboard-intro"><span className="eyebrow dashboard-eyebrow">OPERATIONS</span><h1>{adminSections[activeSection].title}</h1><p>{adminSections[activeSection].description}</p></div>
        {!session && <section className="dashboard-panel dashboard-empty"><h2>Administrator sign-in required</h2><p>Sign in with an administrator account to view reservation data.</p><a className="button button-primary" href="/admin/login">Admin sign in</a></section>}
        {(error || accessError) && <p className="form-error" role="alert">{error || 'Administrator access is required.'} {!session && <a href="/admin/login">Sign in</a>}</p>}
        {loading && <p className="dashboard-loading">Loading reservations…</p>}
        {dashboard && <>
          {activeSection === 'overview' && <>
          <section className="dashboard-metrics admin-metrics">
            <article><span>Guest accounts</span><strong>{dashboard.metrics.customers}</strong></article>
            <article><span>Reservations</span><strong>{dashboard.metrics.reservations}</strong></article>
            <article><span>Awaiting review</span><strong>{dashboard.metrics.requestedReservations}</strong></article>
            <article><span>Confirmed</span><strong>{dashboard.metrics.confirmedReservations}</strong></article>
            <article><span>Requested booking value</span><strong>${dashboard.metrics.grossBookingValue.toLocaleString()} USD</strong></article>
          </section>
          <div className="admin-dashboard-links">
            <a href="/admin/reservations"><CalendarDays size={18} /><span><strong>Reservations</strong><small>Review guest stays and update statuses.</small></span><ArrowRight size={15} /></a>
            <a href="/admin/stays"><Building2 size={18} /><span><strong>Properties</strong><small>Add and manage available stays.</small></span><ArrowRight size={15} /></a>
            <a href="/admin/guests"><MapPin size={18} /><span><strong>Guest accounts</strong><small>Browse guest account details.</small></span><ArrowRight size={15} /></a>
          </div>
          </>}
          {activeSection === 'properties' && <>
            <section className="dashboard-panel admin-stay-form-panel">
              <div className="dashboard-panel-heading"><div><h2>Add a property</h2><p>Create a stay listing with its location, room, rate, and photo.</p></div></div>
              <form className="admin-stay-form" onSubmit={createStay}>
                <label>Property name<input name="name" minLength="2" maxLength="160" placeholder="Azure Coast Resort" required /></label>
                <label>Location<input name="area" minLength="2" maxLength="160" placeholder="Uluwatu, Bali" required /></label>
                <label>Property type<input name="type" maxLength="80" placeholder="Beachfront resort" required /></label>
                <label>Room type<input name="room" maxLength="120" placeholder="Ocean view suite" required /></label>
                <label>Nightly rate (USD)<input name="price" type="number" min="1" max="100000" step="1" required /></label>
                <label>Categories<input name="categories" placeholder="Beachfront, Boutique Hotels" required /></label>
                <label className="admin-stay-wide">Photo URL (HTTPS)<input name="image" type="url" pattern="https://.*" placeholder="https://images.example.com/stay.jpg" required /></label>
                <label className="admin-stay-wide">Description<textarea name="description" rows="4" minLength="30" maxLength="2000" required /></label>
                <button className="button button-primary" type="submit" disabled={creating}>{creating ? 'Saving property…' : 'Add property'} <Building2 size={15} /></button>
              </form>
            </section>
            <section className="dashboard-panel admin-reservations">
              <div className="dashboard-panel-heading"><div><h2>Property inventory</h2><p>{dashboard.stays.length} properties in the admin catalog.</p></div></div>
              {dashboard.stays.length === 0 ? <p className="dashboard-loading">No properties have been added.</p> : <div className="admin-property-list">
                {dashboard.stays.map((stay) => <article key={stay.id || stay.slug}>
                  <img src={stay.image.startsWith('https://') ? stay.image : `https://images.unsplash.com/${stay.image}?auto=format&fit=crop&w=240&q=80`} alt="" />
                  <div><strong>{stay.name}</strong><small>{stay.area} · {stay.type} · {stay.room}</small><small>{(stay.categories || []).join(' · ')}</small></div>
                  <b>${stay.price} <small>/ night</small></b>
                </article>)}
              </div>}
            </section>
          </>}
          {activeSection === 'reservations' && <section className="dashboard-panel admin-reservations">
            <div className="dashboard-panel-heading"><div><h2>All reservations</h2><p>Guest details and status changes are visible to admins only.</p></div></div>
            {dashboard.reservations.length === 0 ? <div className="dashboard-empty"><p>Guest reservations will appear here.</p></div> : <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>Guest</th><th>Stay</th><th>Dates</th><th>Guests</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>{dashboard.reservations.map((reservation) => <tr key={reservation.id}>
                <td><strong>{reservation.guestName}</strong><small>{reservation.guestEmail}</small><small>{reservation.reference}</small></td>
                <td>{stays.find((stay) => stay.slug === reservation.staySlug)?.shortName || reservation.staySlug}</td>
                <td>{reservation.checkIn}<small>to {reservation.checkOut} ({reservation.nights} nights)</small></td>
                <td>{reservation.guests}</td>
                <td>${reservation.total} USD</td>
                <td>{reservation.paymentStatus === 'not_collected' ? 'Not collected' : reservation.paymentStatus}</td>
                <td><select value={reservation.status} aria-label={`Reservation ${reservation.reference} status`} disabled={updating === reservation.id} onChange={(event) => updateStatus(reservation.id, event.target.value)}>
                  <option value="requested">Requested</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option>
                </select></td>
              </tr>)}</tbody>
            </table></div>}
          </section>}
          {activeSection === 'guests' && <section className="dashboard-panel admin-reservations">
            <div className="dashboard-panel-heading"><div><h2>Guest accounts</h2><p>Personal account data is not exposed outside this admin view.</p></div></div>
            {dashboard.customers.length === 0 ? <p className="dashboard-loading">No guest accounts yet.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead><tbody>
              {dashboard.customers.map((customer) => <tr key={customer.id}><td>{customer.name}</td><td>{customer.email}</td><td>{new Date(customer.createdAt).toLocaleDateString()}</td></tr>)}
            </tbody></table></div>}
          </section>}
        </>}
        </div>
      </div>
    </main>
  )
}
