import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, Clock3, HeartPulse, LogOut, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import styles from './CarewellPortal.module.css'

async function request(apiBaseUrl, path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options,
    })
  } catch (error) {
    throw new Error(`Could not connect to Carewell API: ${error.message}`)
  }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const requestError = new Error(result.error || `Request failed (${response.status}).`)
    requestError.status = response.status
    throw requestError
  }
  return result
}

function dateLabel(value) {
  return value ? new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : '—'
}

export default function CarewellPortal({ apiBaseUrl, role = 'patient' }) {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const session = await request(apiBaseUrl, '/auth/me')
        if (session.user.role !== role) {
          const route = session.user.role === 'admin' ? '/admin' : session.user.role === 'provider' ? '/provider/dashboard' : '/dashboard'
          window.location.replace(route)
          return
        }
        if (active) setUser(session.user)
        const result = await request(apiBaseUrl, role === 'provider' ? '/appointments/provider' : '/appointments/mine')
        if (active) {
          setAppointments(result.appointments || [])
        }
      } catch (loadError) {
        if (!active) return
        if (loadError.status === 401) window.location.replace('/login?next=%2Fdashboard')
        else setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, role])

  async function signOut() {
    try { await request(apiBaseUrl, '/auth/logout', { method: 'POST' }) } finally { window.location.replace('/') }
  }

  if (loading) return <div className={styles.loading}><span /> Loading your Carewell portal</div>
  const isProvider = role === 'provider'

  return <main className={styles.page}>
    <header className={styles.header}><a className={styles.brand} href="/"><span><HeartPulse size={18} /></span><strong>carewell<span>.</span></strong></a><div><span className={styles.secure}><ShieldCheck size={14} /> Private account</span><button onClick={signOut}><LogOut size={14} /> Sign out</button></div></header>
    <section className={styles.content}>
      <div className={styles.welcome}><span className={styles.avatar}>{isProvider ? <Stethoscope size={19} /> : <UserRound size={19} />}</span><div><small>{isProvider ? 'PROVIDER PORTAL' : 'PATIENT PORTAL'}</small><h1>{isProvider ? `Welcome, ${user?.name || 'provider'}` : `Hello, ${user?.name?.split(' ')[0] || 'there'}`}</h1><p>{isProvider ? 'Review your upcoming appointment requests.' : 'Your upcoming visits and appointment history.'}</p></div><a href={isProvider ? '/doctors' : '/book-now'}>{isProvider ? 'Public directory' : 'Book a visit'} <ArrowRight size={14} /></a></div>
      {error && <div className={styles.error} role="alert">{error}</div>}
      {isProvider && user?.providerStatus !== 'approved' && <div className={styles.pending}><Clock3 size={17} /><span><b>Profile review in progress</b><small>Your provider account is {user?.providerStatus || 'pending'}. The appointment workspace will be available after administrator approval.</small></span></div>}
      <section className={styles.panel}><div className={styles.panelHeading}><div><small>{isProvider ? 'YOUR SCHEDULE' : 'YOUR VISITS'} · {appointments.length}</small><h2>{isProvider ? 'Appointment schedule' : 'Appointments'}</h2></div><CalendarDays size={18} /></div>
        {appointments.length ? <div className={styles.appointments}>{appointments.map((appointment) => <article className={styles.appointment} key={appointment._id}><span className={styles.calendar}><CalendarDays size={16} /><b>{new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(new Date(appointment.startsAt))}</b></span><div className={styles.appointmentInfo}><strong>{isProvider ? appointment.patientName : appointment.doctorName}</strong><small>{appointment.specialty} · {appointment.appointmentType === 'online' ? 'Online visit' : 'In-person visit'}</small><small>{dateLabel(appointment.startsAt)} · {appointment.reference}</small></div><span className={`${styles.status} ${styles[`status_${appointment.status}`] || ''}`}>{appointment.status}</span></article>)}</div> : <div className={styles.empty}><CalendarDays size={22} /><b>No appointments yet</b><small>{isProvider ? 'New requests will appear when your provider profile is approved.' : 'Your confirmed appointment requests will appear here.'}</small>{!isProvider && <a href="/book-now">Find a doctor <ArrowRight size={13} /></a>}</div>}
      </section>
      <footer className={styles.footer}><span>Carewell · Better care starts here</span><a href="/about">Help and information</a></footer>
    </section>
  </main>
}