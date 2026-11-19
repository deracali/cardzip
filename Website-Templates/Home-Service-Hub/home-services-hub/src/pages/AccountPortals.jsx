import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, LogOut, Wrench } from 'lucide-react'
import {
  clearHomeServiceSession,
  getHomeServiceSession,
  homeServiceApi,
  saveHomeServiceSession,
} from '../services/homeServiceApi'
import '../components/HomePage.css'
import './AccountPortals.css'

const serviceOptions = [
  { id: 'pipe', label: 'Pipe repair' },
  { id: 'drain', label: 'Drain cleaning' },
  { id: 'cooling', label: 'AC maintenance' },
  { id: 'heating', label: 'Heating' },
]
const urgencyOptions = [
  { id: 'standard', label: 'Standard' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'weekend', label: 'Weekend' },
]
const appointmentStatuses = ['Requested', 'Scheduled', 'In Progress', 'Completed', 'Cancelled']

function PortalShell({ title, subtitle, children, session, onLogout }) {
  return (
    <main className="ff-portal">
      <header className="ff-portal-header">
        <a className="ff-brand" href="/" aria-label="FixFlow Pro home">
          <span className="ff-brand-mark"><Wrench size={17} /></span>
          <span>FixFlow Pro<small>PLUMBING · HVAC · REPAIR</small></span>
        </a>
        <div className="ff-portal-account">
          <span>{session?.user?.name || 'FixFlow account'}</span>
          <button type="button" className="ff-portal-logout" onClick={onLogout}><LogOut size={15} /> Sign out</button>
        </div>
      </header>
      <section className="ff-portal-content">
        <a className="ff-portal-back" href="/"><ArrowLeft size={14} /> Back to FixFlow</a>
        <div className="ff-portal-heading">
          <span className="ff-portal-kicker">FIXFLOW PRO ACCOUNT</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  )
}

function logout() {
  clearHomeServiceSession()
  window.location.assign('/')
}

export function AuthPage({ apiBaseUrl, signup = false, expectedRole = 'client' }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAdminLogin = expectedRole === 'admin'

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (signup && form.password !== form.confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const result = signup
        ? await homeServiceApi.signup(apiBaseUrl, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        })
        : await homeServiceApi.login(apiBaseUrl, {
          email: form.email,
          password: form.password,
          expectedRole,
        })
      if (!result.token || !result.user || result.user.role !== (signup ? 'client' : expectedRole)) {
        throw new Error('The FixFlow API returned an invalid account session.')
      }
      saveHomeServiceSession(result)
      const next = new URLSearchParams(window.location.search).get('next')
      const safeNext = next?.startsWith('/book-now') ? next : null
      window.location.assign(isAdminLogin ? '/admin' : (safeNext || '/dashboard'))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="ff-auth-page">
      <div className="ff-auth-card">
        <a className="ff-brand" href="/" aria-label="FixFlow Pro home">
          <span className="ff-brand-mark"><Wrench size={17} /></span>
          <span>FixFlow Pro<small>PLUMBING · HVAC · REPAIR</small></span>
        </a>
        <span className="ff-portal-kicker">{isAdminLogin ? 'AUTHORIZED TEAM ACCESS' : 'FIXFLOW PRO ACCOUNT'}</span>
        <h1>{signup ? 'Create your client account' : isAdminLogin ? 'Administrator sign in' : 'Welcome back'}</h1>
        <p>{signup ? 'Book service and keep track of every request.' : 'Sign in to manage home service requests.'}</p>
        <form className="ff-portal-form" onSubmit={submit}>
          {signup && (
            <>
              <label>Full name<input autoComplete="name" required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Phone number<input autoComplete="tel" type="tel" maxLength={40} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            </>
          )}
          <label>Email address<input autoComplete="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Password<input autoComplete={signup ? 'new-password' : 'current-password'} type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          {signup && <label>Confirm password<input autoComplete="new-password" type="password" minLength={8} required value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /></label>}
          {error && <p className="ff-portal-error" role="alert">{error}</p>}
          <button className="ff-button ff-button-orange ff-portal-submit" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : signup ? 'Create account' : 'Sign in'} <ArrowRight size={15} />
          </button>
        </form>
        {!isAdminLogin && (
          <p className="ff-auth-switch">
            {signup ? 'Already have a client account?' : 'New to FixFlow?'}{' '}
            <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</a>
          </p>
        )}
        {isAdminLogin && <p className="ff-auth-switch">Administrator accounts are managed by the API environment, not public signup.</p>}
      </div>
    </main>
  )
}

export function BookingPage({ apiBaseUrl }) {
  const [session] = useState(getHomeServiceSession)
  const [form, setForm] = useState(() => {
    const query = new URLSearchParams(window.location.search)
    return {
    serviceId: serviceOptions.some((service) => service.id === query.get('service')) ? query.get('service') : 'pipe',
    urgency: urgencyOptions.some((urgency) => urgency.id === query.get('urgency')) ? query.get('urgency') : 'standard',
    preferredDate: '',
    address: '',
    phone: '',
    description: '',
    }
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session) {
      const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
      window.location.replace(`/login?next=${next}`)
    }
  }, [session])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (session?.user?.role !== 'client') {
      setError('Only client accounts can request a service. Please sign in with a client account.')
      return
    }
    setSubmitting(true)
    try {
      await homeServiceApi.createAppointment(apiBaseUrl, form)
      window.location.assign('/dashboard')
    } catch (requestError) {
      if (requestError.status === 401) {
        clearHomeServiceSession()
        window.location.assign('/login?next=%2Fbook-now')
      } else {
        setError(requestError.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="ff-portal">
      <section className="ff-portal-content ff-booking-content">
        <a className="ff-portal-back" href="/"><ArrowLeft size={14} /> Back to FixFlow</a>
        <div className="ff-portal-heading">
          <span className="ff-portal-kicker">SERVICE REQUEST</span>
          <h1>Tell us what needs fixing</h1>
          <p>A FixFlow client account is required to submit and track a request.</p>
        </div>
        <form className="ff-portal-form ff-booking-form" onSubmit={submit}>
          <label>Service<select value={form.serviceId} onChange={(event) => setForm({ ...form, serviceId: event.target.value })}>{serviceOptions.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}</select></label>
          <label>Visit timing<select value={form.urgency} onChange={(event) => setForm({ ...form, urgency: event.target.value })}>{urgencyOptions.map((urgency) => <option key={urgency.id} value={urgency.id}>{urgency.label}</option>)}</select></label>
          <label>Preferred date<input type="date" min={new Date().toISOString().slice(0, 10)} required value={form.preferredDate} onChange={(event) => setForm({ ...form, preferredDate: event.target.value })} /></label>
          <label>Phone number<input autoComplete="tel" type="tel" required maxLength={40} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label className="ff-form-wide">Service address<input autoComplete="street-address" required maxLength={240} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
          <label className="ff-form-wide">Describe the issue<textarea rows="4" maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          {(error || (session && session.user.role !== 'client' && 'Only client accounts can request a service. Please sign in with a client account.')) && (
            <p className="ff-portal-error ff-form-wide" role="alert">{error || 'Only client accounts can request a service. Please sign in with a client account.'}</p>
          )}
          <button className="ff-button ff-button-orange ff-portal-submit ff-form-wide" type="submit" disabled={submitting}>
            <CalendarDays size={15} /> {submitting ? 'Sending request…' : 'Request service'} <ArrowRight size={15} />
          </button>
        </form>
      </section>
    </main>
  )
}

export function ClientDashboard({ apiBaseUrl }) {
  const [session] = useState(getHomeServiceSession)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(() => session?.user?.role === 'client')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      window.location.replace('/login')
      return
    }
    if (session.user.role !== 'client') return undefined
    let active = true
    homeServiceApi.clientDashboard(apiBaseUrl)
      .then((result) => { if (active) setAppointments(result.appointments) })
      .catch((requestError) => {
        if (!active) return
        if (requestError.status === 401) {
          clearHomeServiceSession()
          window.location.replace('/login')
          return
        }
        setError(requestError.message)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [apiBaseUrl, session])

  const accessError = session && session.user.role !== 'client'
    ? 'This portal is for client accounts. Sign in with a client account to continue.'
    : ''

  return (
    <PortalShell title="Your service requests" subtitle="Review request details and follow each update from our team." session={session} onLogout={logout}>
      {(error || accessError) && <p className="ff-portal-error" role="alert">{error || accessError}</p>}
      {loading ? <p className="ff-portal-message">Loading your requests…</p> : (
        <div className="ff-appointment-list">
          {appointments.length === 0
            ? <div className="ff-portal-empty"><Wrench size={22} /><h2>No requests yet</h2><p>When you request a service, it will appear here.</p><a className="ff-button ff-button-orange" href="/book-now">Request service</a></div>
            : appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}
        </div>
      )}
    </PortalShell>
  )
}

export function AdminDashboard({ apiBaseUrl }) {
  const [session] = useState(getHomeServiceSession)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(() => session?.user?.role === 'admin')
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    if (!session) {
      window.location.replace('/admin/login')
      return
    }
    if (session.user.role !== 'admin') return undefined
    let active = true
    homeServiceApi.adminDashboard(apiBaseUrl)
      .then((result) => { if (active) setData(result) })
      .catch((requestError) => {
        if (!active) return
        if (requestError.status === 401) {
          clearHomeServiceSession()
          window.location.replace('/admin/login')
          return
        }
        setError(requestError.message)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [apiBaseUrl, session])

  const accessError = session && session.user.role !== 'admin'
    ? 'Administrator access is required. Sign in with an administrator account.'
    : ''

  const updateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId)
    setError('')
    try {
      const { appointment } = await homeServiceApi.updateAppointment(apiBaseUrl, appointmentId, status)
      setData((current) => ({
        ...current,
        appointments: current.appointments.map((item) => item.id === appointmentId ? appointment : item),
      }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <PortalShell title="Service operations" subtitle="Review incoming requests and update client-visible status." session={session} onLogout={logout}>
      {(error || accessError) && <p className="ff-portal-error" role="alert">{error || accessError}</p>}
      {loading ? <p className="ff-portal-message">Loading the admin workspace…</p> : data && (
        <>
          <div className="ff-metrics">
            <Metric label="Clients" value={data.metrics.clients} />
            <Metric label="All requests" value={data.metrics.appointments} />
            <Metric label="New requests" value={data.metrics.newRequests} />
            <Metric label="Active appointments" value={data.metrics.activeAppointments} />
          </div>
          <div className="ff-admin-table-wrap">
            <h2>Recent service requests</h2>
            {data.appointments.length === 0 ? <p className="ff-portal-message">No requests have been submitted.</p> : (
              <div className="ff-admin-list">
                {data.appointments.map((appointment) => (
                  <article className="ff-admin-appointment" key={appointment.id}>
                    <AppointmentCard appointment={appointment} />
                    <label className="ff-status-control">
                      Update status
                      <select value={appointment.status} disabled={updatingId === appointment.id} onChange={(event) => updateStatus(appointment.id, event.target.value)}>
                        {appointmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </PortalShell>
  )
}

function AppointmentCard({ appointment }) {
  return (
    <article className="ff-appointment-card">
      <div className="ff-appointment-top">
        <div><h2>{appointment.serviceName}</h2><p>{appointment.urgency} visit · {appointment.preferredDate}</p></div>
        <span className={`ff-status-badge ff-status-${appointment.status.toLowerCase().replaceAll(' ', '-')}`}>{appointment.status}</span>
      </div>
      <dl>
        <div><dt>Quoted estimate</dt><dd>${appointment.quote}</dd></div>
        <div><dt>Service address</dt><dd>{appointment.address}</dd></div>
        <div><dt>Phone</dt><dd>{appointment.phone}</dd></div>
        {appointment.clientName && <div><dt>Client</dt><dd>{appointment.clientName} · {appointment.clientEmail}</dd></div>}
      </dl>
      {appointment.description && <p className="ff-appointment-description">{appointment.description}</p>}
    </article>
  )
}

function Metric({ label, value }) {
  return <article className="ff-metric"><span>{label}</span><strong>{value}</strong></article>
}
