import { useEffect, useState } from 'react'
import SalonFooter from '../components/salon/SalonFooter'
import { appointmentStatuses } from '../components/salon/salonData'
import { clearSalonSession, errorStatus, getSalonSession, salonApi } from '../services/salonApi'
import './account.css'
import '../components/salon/salon.css'

function PortalHeader({ user, title }) {
  function signOut() {
    clearSalonSession()
    window.location.assign('/')
  }
  return <header className="salon-portal-header">
    <a className="salon-brand" href="/"><span className="salon-brand-mark">L</span><span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span></a>
    <span>{title}{user?.name ? ` · ${user.name}` : ''}</span>
    <button type="button" onClick={signOut}>Sign out</button>
  </header>
}

export function ClientDashboard() {
  const [session] = useState(() => getSalonSession())
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const current = session
    if (!current) {
      window.location.replace(`/login?next=${encodeURIComponent('/dashboard')}`)
      return
    }
    if (current.user.role !== 'client') {
      window.location.replace('/admin')
      return
    }
    salonApi.clientDashboard()
      .then((result) => setAppointments(result.appointments))
      .catch((requestError) => {
        if (errorStatus(requestError) === 401) {
          clearSalonSession()
          window.location.replace('/login')
        } else setError(requestError instanceof Error ? requestError.message : 'Could not load your appointments.')
      })
      .finally(() => setLoading(false))
  }, [session])

  return <><PortalHeader user={session?.user} title="Client dashboard" /><main className="salon-portal-content">
    <span className="salon-kicker">YOUR LUMIÈRE VISITS</span><h1>My appointments</h1>
    <p>Review appointment requests and check their current status.</p>
    {error && <p className="salon-form-error" role="alert">{error}</p>}
    {loading ? <p>Loading your appointments…</p> : appointments.length
      ? <section className="salon-appointment-list">{appointments.map((item) => <AppointmentCard appointment={item} key={item.id} />)}</section>
      : <section className="salon-account-card"><h2>No visits requested yet</h2><p>Your appointment requests will appear here after you book.</p><a className="salon-button salon-button-primary" href="/book">Request an appointment</a></section>}
  </main><SalonFooter /></>
}

export function AdminDashboard() {
  const [session] = useState(() => getSalonSession())
  const [data, setData] = useState(null)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const current = session
    if (!current) {
      window.location.replace(`/admin/login?next=${encodeURIComponent('/admin')}`)
      return
    }
    if (current.user.role !== 'admin') {
      window.location.replace('/dashboard')
      return
    }
    salonApi.adminDashboard()
      .then(setData)
      .catch((requestError) => {
        if (errorStatus(requestError) === 401) {
          clearSalonSession()
          window.location.replace('/admin/login')
        } else setError(requestError instanceof Error ? requestError.message : 'Could not load the admin dashboard.')
      })
      .finally(() => setLoading(false))
  }, [session])

  async function updateStatus(id, status) {
    setError('')
    setBusyId(id)
    try {
      const result = await salonApi.updateAppointment(id, status)
      setData((current) => current && ({ ...current, appointments: current.appointments.map((item) => item.id === id ? result.appointment : item) }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update appointment status.')
    } finally {
      setBusyId('')
    }
  }

  return <><PortalHeader user={session?.user} title="Studio admin" /><main className="salon-portal-content">
    <span className="salon-kicker">STUDIO OPERATIONS</span><h1>Appointment dashboard</h1>
    <p>Review client requests and update the status after confirming availability.</p>
    {error && <p className="salon-form-error" role="alert">{error}</p>}
    {loading ? <p>Loading the salon workspace…</p> : data && <>
      <div className="salon-metrics">{Object.entries(data.metrics).map(([label, value]) => <article key={label}><small>{label.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</small><strong>{value}</strong></article>)}</div>
      <section className="salon-account-card"><h2>Appointment requests</h2>{data.appointments.length
        ? data.appointments.map((item) => <div className="salon-admin-appointment" key={item.id}><AppointmentCard appointment={item} /><label>Status<select value={item.status} disabled={busyId === item.id} onChange={(event) => updateStatus(item.id, event.target.value)}>{appointmentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>)
        : <p>No appointment requests yet.</p>}</section>
      <section className="salon-account-card"><h2>Clients · {data.clients.length}</h2>{data.clients.map((client) => <p className="salon-client-row" key={client.id}><strong>{client.name}</strong> · {client.email}{client.phone ? ` · ${client.phone}` : ''}</p>)}</section>
    </>}
  </main><SalonFooter /></>
}

function AppointmentCard({ appointment }) {
  return <article className="salon-appointment-card">
    <div><h2>{appointment.serviceName}</h2><p>{appointment.date} at {appointment.time} · {appointment.stylist}</p><small>{appointment.clientName} · {appointment.clientEmail}</small>{appointment.notes && <small>Note: {appointment.notes}</small>}</div>
    <div className="salon-appointment-meta"><strong>${appointment.price}</strong><span>{appointment.status}</span></div>
  </article>
}
