import { useEffect, useState } from 'react'
import { LogOut, ShieldCheck } from 'lucide-react'
import { clearSession, escapesApi, getSession } from '../services/escapesApi'
import { stays } from '../data/stays'

export default function AdminDashboardPage() {
  const [session] = useState(getSession)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(() => session?.user.role === 'admin')
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState('')
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

  return (
    <main className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <header className="admin-dashboard-header">
          <a className="admin-brand" href="/"><ShieldCheck size={20} /> Escapes <span>ADMIN</span></a>
          <div><span>{session?.user.name || 'Administrator'}</span>{session && <button className="outline-button" type="button" onClick={signOut}><LogOut size={14} /> Sign out</button>}</div>
        </header>
        <div className="admin-dashboard-intro"><span className="eyebrow dashboard-eyebrow">OPERATIONS</span><h1>Reservation dashboard</h1><p>Review guest reservations and manage each request’s status.</p></div>
        {!session && <section className="dashboard-panel dashboard-empty"><h2>Administrator sign-in required</h2><p>Sign in with an administrator account to view reservation data.</p><a className="button button-primary" href="/admin/login">Admin sign in</a></section>}
        {(error || accessError) && <p className="form-error" role="alert">{error || 'Administrator access is required.'} {!session && <a href="/admin/login">Sign in</a>}</p>}
        {loading && <p className="dashboard-loading">Loading reservations…</p>}
        {dashboard && <>
          <section className="dashboard-metrics admin-metrics">
            <article><span>Guest accounts</span><strong>{dashboard.metrics.customers}</strong></article>
            <article><span>Reservations</span><strong>{dashboard.metrics.reservations}</strong></article>
            <article><span>Awaiting review</span><strong>{dashboard.metrics.requestedReservations}</strong></article>
            <article><span>Confirmed</span><strong>{dashboard.metrics.confirmedReservations}</strong></article>
            <article><span>Requested booking value</span><strong>${dashboard.metrics.grossBookingValue.toLocaleString()} USD</strong></article>
          </section>
          <section className="dashboard-panel admin-reservations">
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
          </section>
          <section className="dashboard-panel admin-reservations">
            <div className="dashboard-panel-heading"><div><h2>Guest accounts</h2><p>Personal account data is not exposed outside this admin view.</p></div></div>
            {dashboard.customers.length === 0 ? <p className="dashboard-loading">No guest accounts yet.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead><tbody>
              {dashboard.customers.map((customer) => <tr key={customer.id}><td>{customer.name}</td><td>{customer.email}</td><td>{new Date(customer.createdAt).toLocaleDateString()}</td></tr>)}
            </tbody></table></div>}
          </section>
        </>}
      </div>
    </main>
  )
}
