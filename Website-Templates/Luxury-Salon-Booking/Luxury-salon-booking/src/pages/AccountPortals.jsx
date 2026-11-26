import { useEffect, useRef, useState } from 'react'
import { appointmentStatuses } from '../components/salon/salonData'
import {
  addSalonService,
  clearSalonSession,
  getClientAppointments,
  getLocalClients,
  getSalonAppointments,
  getSalonServices,
  getSalonSession,
  saveSalonService,
  saveSalonSession,
  updateLocalAppointment,
  updateLocalClient,
} from '../services/salonLocalStore'
import './account.css'
import './dashboard.css'

const clientNavigation = [
  { label: 'Overview', href: '/dashboard', view: 'overview' },
  { label: 'My appointments', href: '/dashboard/appointments', view: 'appointments' },
  { label: 'My profile', href: '/dashboard/profile', view: 'profile' },
]
const adminNavigation = [
  { label: 'Overview', href: '/admin', view: 'overview' },
  { label: 'Appointments', href: '/admin/appointments', view: 'appointments' },
  { label: 'Clients', href: '/admin/clients', view: 'clients' },
  { label: 'Services & pricing', href: '/admin/services', view: 'services' },
]

function DashboardShell({ user, title, navigation, activeView, children, admin = false }) {
  function signOut() {
    clearSalonSession()
    window.location.assign('/')
  }

  return <div className={`salon-dashboard${admin ? ' salon-dashboard-admin' : ''}`}>
    <aside className="salon-dashboard-sidebar">
      <a className="salon-brand" href="/"><span className="salon-brand-mark">L</span><span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span></a>
      <span className="salon-dashboard-label">{admin ? 'STUDIO WORKSPACE' : 'YOUR ACCOUNT'}</span>
      <nav className="salon-dashboard-nav" aria-label="Dashboard navigation">{navigation.map((item) => <a className={activeView === item.view ? 'is-active' : ''} href={item.href} key={item.view}>{item.label}</a>)}</nav>
      {!admin && <a className="salon-dashboard-book" href="/book">＋ Book an appointment</a>}
      <div className="salon-dashboard-sidebar-bottom"><a href="/">← Back to salon</a><button type="button" onClick={signOut}>Sign out</button></div>
    </aside>
    <div className="salon-dashboard-main-wrap">
      <header className="salon-dashboard-topbar"><div><span className="salon-kicker">{admin ? 'LUMIÈRE · ADMIN' : 'LUMIÈRE · CLIENT'}</span><h1>{title}</h1></div><div className="salon-dashboard-user"><span>{user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><small>{admin ? 'Administrator' : 'Client account'}</small></div></div></header>
      <main className="salon-dashboard-content">{children}</main>
    </div>
  </div>
}

export function ClientDashboard({ view = 'overview' }) {
  const [session, setSession] = useState(() => getSalonSession())
  const [appointments] = useState(() => {
    const current = getSalonSession()
    return current?.user?.role === 'client' ? getClientAppointments(current.user.id) : []
  })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!session) {
      window.location.replace(`/login?next=${encodeURIComponent(`/dashboard${view === 'overview' ? '' : `/${view}`}`)}`)
      return
    }
    if (session.user.role !== 'client') {
      window.location.replace('/admin')
      return
    }
  }, [session, view])

  if (!session || session.user.role !== 'client') return null
  const upcoming = appointments.filter((item) => item.date >= new Date().toISOString().slice(0, 10) && item.status !== 'Cancelled')
  const completed = appointments.filter((item) => item.status === 'Completed')
  const title = view === 'appointments' ? 'My appointments' : view === 'profile' ? 'My profile' : 'Your dashboard'

  function saveProfile(event) {
    event.preventDefault()
    setError('')
    setSaved(false)
    const form = new FormData(event.currentTarget)
    try {
      const user = updateLocalClient(session.user.id, {
        name: String(form.get('name') || ''),
        phone: String(form.get('phone') || ''),
      })
      const next = { ...session, user }
      saveSalonSession(next)
      setSession(next)
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.')
    }
  }

  return <DashboardShell user={session.user} title={title} navigation={clientNavigation} activeView={view}>
    {view === 'overview' && <>
      <div className="salon-dashboard-welcome"><div><span className="salon-kicker">A MOMENT FOR YOU</span><h2>Welcome back, {session.user.name.split(' ')[0]}.</h2><p>Your next favorite ritual is just around the corner.</p></div><a className="salon-button salon-button-primary" href="/book">Request a visit →</a></div>
      <div className="salon-dashboard-metrics"><Metric label="Upcoming visits" value={upcoming.length} /><Metric label="Total visits" value={appointments.length} /><Metric label="Completed rituals" value={completed.length} /></div>
      <section className="salon-dashboard-panel"><div className="salon-dashboard-panel-heading"><div><span className="salon-kicker">YOUR SCHEDULE</span><h2>Next appointment</h2></div><a href="/dashboard/appointments">See all →</a></div>{upcoming[0] ? <AppointmentCard appointment={upcoming[0]} /> : <EmptyState title="A little time for yourself?" text="Your upcoming salon visits will show here." href="/book" action="Book an appointment" />}</section>
    </>}
    {view === 'appointments' && <section className="salon-dashboard-panel"><div className="salon-dashboard-panel-heading"><div><span className="salon-kicker">YOUR VISITS</span><h2>Appointment history</h2></div><a className="salon-button salon-button-primary" href="/book">＋ Book a visit</a></div>{appointments.length ? <div className="salon-dashboard-list">{appointments.map((item) => <AppointmentCard appointment={item} key={item.id} />)}</div> : <EmptyState title="No appointments yet" text="Find a ritual that feels like you and make a little time for yourself." href="/book" action="Explore services" />}</section>}
    {view === 'profile' && <section className="salon-dashboard-panel salon-profile-panel"><span className="salon-kicker">ACCOUNT DETAILS</span><h2>Personal information</h2><p>Keep your contact details up to date for appointment requests.</p><form className="salon-dashboard-form" onSubmit={saveProfile}><label>Full name<input name="name" defaultValue={session.user.name} minLength={2} maxLength={100} required /></label><label>Email address<input value={session.user.email} readOnly /></label><label>Phone number<input name="phone" type="tel" defaultValue={session.user.phone || ''} maxLength={40} /></label>{error && <p className="salon-form-error" role="alert">{error}</p>}{saved && <p className="salon-form-success" role="status">Your profile is saved in this browser.</p>}<button className="salon-button salon-button-primary" type="submit">Save changes</button></form></section>}
  </DashboardShell>
}

export function AdminDashboard({ view = 'overview' }) {
  const [session] = useState(() => getSalonSession())
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [serviceList, setServiceList] = useState([])
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!session) {
      window.location.replace(`/admin/login?next=${encodeURIComponent(`/admin${view === 'overview' ? '' : `/${view}`}`)}`)
      return
    }
    if (session.user.role !== 'admin') {
      window.location.replace('/dashboard')
      return
    }
    refreshData()
  }, [session, view])

  function refreshData() {
    setAppointments(getSalonAppointments())
    setClients(getLocalClients())
    setServiceList(getSalonServices())
  }

  if (!session || session.user.role !== 'admin') return null
  const title = view === 'appointments' ? 'Appointments' : view === 'clients' ? 'Clients' : view === 'services' ? 'Services & pricing' : 'Studio overview'
  const metrics = [
    { label: 'Total clients', value: clients.length },
    { label: 'Appointment requests', value: appointments.length },
    { label: 'Awaiting confirmation', value: appointments.filter((item) => item.status === 'Requested').length },
    { label: 'Confirmed visits', value: appointments.filter((item) => item.status === 'Confirmed').length },
  ]

  function changeStatus(id, status) {
    setError('')
    setBusyId(id)
    try {
      updateLocalAppointment(id, status)
      refreshData()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update appointment status.')
    } finally {
      setBusyId('')
    }
  }

  function saveService(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    const form = new FormData(event.currentTarget)
    const price = Number(form.get('price'))
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a service price greater than zero.')
      return
    }
    const service = {
      ...(editing || {}),
      name: String(form.get('name') || '').trim(),
      category: String(form.get('category') || '').trim(),
      description: String(form.get('description') || '').trim(),
      duration: String(form.get('duration') || '').trim(),
      price,
      image: String(form.get('image') || '').trim(),
      badge: String(form.get('badge') || '').trim(),
      active: form.get('active') === 'on',
    }
    try {
      if (editing?.id) saveSalonService({ ...service, id: editing.id })
      else addSalonService(service)
      setEditing(null)
      setNotice('Service details saved to this browser.')
      refreshData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this service.')
    }
  }

  return <DashboardShell user={session.user} title={title} navigation={adminNavigation} activeView={view} admin>
    {error && <p className="salon-form-error salon-dashboard-alert" role="alert">{error}</p>}
    {notice && <p className="salon-form-success salon-dashboard-alert" role="status">{notice}</p>}
    {view === 'overview' && <>
      <div className="salon-dashboard-welcome"><div><span className="salon-kicker">STUDIO OPERATIONS</span><h2>A clear view of today.</h2><p>Manage appointment requests, clients, and your live service menu.</p></div><a className="salon-button salon-button-primary" href="/admin/appointments">Review appointments →</a></div>
      <div className="salon-dashboard-metrics">{metrics.map((metric) => <Metric key={metric.label} {...metric} />)}</div>
      <section className="salon-dashboard-panel"><div className="salon-dashboard-panel-heading"><div><span className="salon-kicker">LATEST ACTIVITY</span><h2>Recent appointments</h2></div><a href="/admin/appointments">Manage requests →</a></div>{appointments.slice(0, 4).map((item) => <AppointmentCard appointment={item} key={item.id} showClient />)}</section>
    </>}
    {view === 'appointments' && <section className="salon-dashboard-panel"><span className="salon-kicker">STUDIO SCHEDULE</span><h2>Appointment requests</h2><p>Confirm, complete, or cancel each request as the team coordinates availability.</p>{appointments.length ? <div className="salon-dashboard-list">{appointments.map((item) => <div className="salon-admin-row" key={item.id}><AppointmentCard appointment={item} showClient /><div className="salon-admin-status-field"><span>Status</span><StatusDropdown value={item.status} disabled={busyId === item.id} onChange={(status) => changeStatus(item.id, status)} /></div></div>)}</div> : <EmptyState title="No appointments yet" text="New client requests will appear here." />}</section>}
    {view === 'clients' && <section className="salon-dashboard-panel"><span className="salon-kicker">YOUR COMMUNITY</span><h2>Client directory <small>{clients.length} clients</small></h2>{clients.length ? <div className="salon-client-table"><div className="salon-client-table-head"><span>Client</span><span>Email</span><span>Visits</span></div>{clients.map((client) => <div className="salon-client-table-row" key={client.id}><strong>{client.name}</strong><span>{client.email}</span><span>{appointments.filter((item) => item.clientId === client.id).length}</span></div>)}</div> : <EmptyState title="No clients yet" text="Client accounts and bookings will appear here." />}</section>}
    {view === 'services' && <div className="salon-service-admin-layout"><section className="salon-dashboard-panel"><span className="salon-kicker">LIVE MENU · {serviceList.length} SERVICES</span><h2>Service catalogue</h2><p>Changes here update booking prices and the public menu in this Vite browser.</p><div className="salon-service-admin-list">{serviceList.map((service) => <article className={`salon-service-admin-item${service.active === false ? ' is-inactive' : ''}`} key={service.id}><div><span className="salon-kicker">{service.category}{service.active === false ? ' · HIDDEN' : ''}</span><h3>{service.name}</h3><p>{service.duration} · ${service.price}</p></div><button className="salon-button salon-button-small" type="button" onClick={() => setEditing(service)}>Edit</button></article>)}</div></section>    <section className="salon-dashboard-panel"><span className="salon-kicker">{editing ? 'EDIT SERVICE' : 'NEW SERVICE'}</span><h2>{editing ? editing.name : 'Add to the menu'}</h2><form key={editing?.id || 'new-service'} className="salon-dashboard-form" onSubmit={saveService}><label>Service name<input name="name" defaultValue={editing?.name || ''} minLength={2} required /></label><label>Category<input name="category" defaultValue={editing?.category || ''} required /></label><label>Description<textarea name="description" rows={3} defaultValue={editing?.description || ''} required /></label><div className="salon-form-row"><label>Duration<input name="duration" defaultValue={editing?.duration || '60 min'} required /></label><label>Price (USD)<input name="price" type="number" min="1" step="0.01" defaultValue={editing?.price || ''} required /></label></div><label>Image path<input name="image" defaultValue={editing?.image || '/images/salon/silk-blowout.jpg'} /></label><label>Badge<input name="badge" defaultValue={editing?.badge || ''} placeholder="Optional" /></label><label className="salon-checkbox-label"><input name="active" type="checkbox" defaultChecked={editing?.active !== false} /> Visible for bookings</label><div className="salon-dashboard-form-actions"><button className="salon-button salon-button-primary" type="submit">{editing ? 'Save changes' : 'Add service'}</button>{editing && <button className="salon-dashboard-quiet-button" type="button" onClick={() => setEditing(null)}>Cancel edit</button>}</div></form></section></div>}
  </DashboardShell>
}

function Metric({ label, value }) {
  return <article className="salon-dashboard-metric"><span>{label}</span><strong>{value}</strong></article>
}

function EmptyState({ title, text, href, action }) {
  return <div className="salon-dashboard-empty"><span aria-hidden="true">✦</span><h3>{title}</h3><p>{text}</p>{href && <a className="salon-button salon-button-primary" href={href}>{action}</a>}</div>
}

function AppointmentCard({ appointment, showClient = false }) {
  return <article className="salon-appointment-card salon-dashboard-appointment"><div><h3>{appointment.serviceName}</h3><p>{appointment.date} at {appointment.time} · {appointment.stylist}</p>{showClient && <small>{appointment.clientName} · {appointment.clientEmail}</small>}{appointment.notes && <small>Note: {appointment.notes}</small>}</div><div className="salon-appointment-meta"><strong>${appointment.price}</strong><span className={`salon-status salon-status-${appointment.status.toLowerCase()}`}>{appointment.status}</span></div></article>
}

function StatusDropdown({ value, disabled, onChange }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const selectedIndex = Math.max(0, appointmentStatuses.indexOf(value))

  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (open) optionRefs.current[selectedIndex]?.focus()
  }, [open, selectedIndex])

  function moveFocus(index) {
    const nextIndex = (index + appointmentStatuses.length) % appointmentStatuses.length
    optionRefs.current[nextIndex]?.focus()
  }

  function handleOptionKeyDown(event, index) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveFocus(index + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      moveFocus(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      moveFocus(appointmentStatuses.length - 1)
    }
  }

  return <div className="salon-status-dropdown" ref={containerRef}>
    <button
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={`Appointment status: ${value}`}
      className="salon-status-dropdown-trigger"
      disabled={disabled}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={(event) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
          event.preventDefault()
          setOpen(true)
        }
      }}
      ref={triggerRef}
      type="button"
    >
      <span className={`salon-status-dropdown-dot is-${value.toLowerCase()}`} />
      <span>{value}</span>
      <svg aria-hidden="true" className={open ? 'is-open' : ''} viewBox="0 0 12 8"><path d="m1 1 5 5 5-5" /></svg>
    </button>
    {open && <div aria-label="Appointment status" className="salon-status-dropdown-menu" role="listbox">
      {appointmentStatuses.map((status, index) => <button
        aria-selected={value === status}
        className={`salon-status-dropdown-option${value === status ? ' is-selected' : ''}`}
        key={status}
        onClick={() => {
          onChange(status)
          setOpen(false)
          triggerRef.current?.focus()
        }}
        onKeyDown={(event) => handleOptionKeyDown(event, index)}
        ref={(element) => { optionRefs.current[index] = element }}
        role="option"
        tabIndex={-1}
        type="button"
      >
        <span className={`salon-status-dropdown-dot is-${status.toLowerCase()}`} />
        <span>{status}</span>
        {value === status && <span aria-hidden="true" className="salon-status-dropdown-check">✓</span>}
      </button>)}
    </div>}
  </div>
}
