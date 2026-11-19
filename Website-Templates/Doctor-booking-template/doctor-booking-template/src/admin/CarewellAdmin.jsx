import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowUpRight, BadgeCheck, CalendarDays, Check, ChevronDown, Clock3,
  FileClock, HeartPulse, LogOut, Menu, Search, Settings, ShieldCheck, Stethoscope,
  UserRound, Users, X,
} from 'lucide-react'
import { doctors as starterDoctors } from '../data/doctors'
import styles from './CarewellAdmin.module.css'

const DATA_KEY = 'carewell-admin-demo-v1'
const SESSION_KEY = 'carewell-admin-demo-session'
const PAGES = [
  { name: 'Overview', icon: Activity },
  { name: 'Appointments', icon: CalendarDays },
  { name: 'Providers', icon: Stethoscope },
  { name: 'Patients', icon: Users },
  { name: 'Doctors', icon: UserRound },
  { name: 'Settings', icon: Settings },
]
const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']
const initialDemoData = {
  appointments: [
    { id: 'apt-demo-1024', reference: 'CW-1024', patientName: 'Avery Johnson', patientEmail: 'avery@example.com', doctorSlug: 'sarah-mitchell', doctorName: 'Dr. Sarah Mitchell', specialty: 'Dermatology', appointmentType: 'in-person', startsAt: '2026-11-18T14:00:00.000Z', fee: 120, status: 'pending' },
    { id: 'apt-demo-1019', reference: 'CW-1019', patientName: 'Morgan Lee', patientEmail: 'morgan@example.com', doctorSlug: 'james-chen', doctorName: 'Dr. James Chen', specialty: 'Cardiology', appointmentType: 'online', startsAt: '2026-11-18T16:30:00.000Z', fee: 150, status: 'confirmed' },
    { id: 'apt-demo-1012', reference: 'CW-1012', patientName: 'Jordan Patel', patientEmail: 'jordan@example.com', doctorSlug: 'emily-rodriguez', doctorName: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', appointmentType: 'in-person', startsAt: '2026-11-19T15:00:00.000Z', fee: 100, status: 'pending' },
  ],
  providers: [
    { id: 'provider-demo-1', name: 'Dr. Elena Brooks', email: 'elena@example.com', providerStatus: 'pending', active: true, createdAt: '2026-11-15T12:00:00.000Z' },
    { id: 'provider-demo-2', name: 'Dr. Marcus Reed', email: 'marcus@example.com', providerStatus: 'approved', active: true, createdAt: '2026-11-08T12:00:00.000Z' },
  ],
  patients: [
    { id: 'patient-demo-1', name: 'Avery Johnson', email: 'avery@example.com', phone: '(212) 555-0164', active: true, createdAt: '2026-10-12T12:00:00.000Z' },
    { id: 'patient-demo-2', name: 'Morgan Lee', email: 'morgan@example.com', phone: '(718) 555-0193', active: true, createdAt: '2026-10-20T12:00:00.000Z' },
    { id: 'patient-demo-3', name: 'Jordan Patel', email: 'jordan@example.com', phone: '(917) 555-0148', active: false, createdAt: '2026-10-27T12:00:00.000Z' },
  ],
  doctors: starterDoctors.map((doctor, index) => ({ ...doctor, id: `doctor-demo-${index + 1}`, active: true })),
  settings: { clinicName: 'Carewell', supportEmail: 'hello@carewell.example', appointmentNotice: 'Appointment requests are confirmed by the care team.' },
}

function readDemoData() {
  try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY) || 'null')
    if (saved?.appointments && saved?.settings) return saved
  } catch {}
  localStorage.setItem(DATA_KEY, JSON.stringify(initialDemoData))
  return initialDemoData
}

function saveDemoData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

async function request(apiBaseUrl, path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options,
    })
  } catch (error) {
    throw new Error(`Could not connect to Carewell API at ${apiBaseUrl}: ${error.message}`)
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
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0)
}

function Status({ value }) {
  return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}><i />{value}</span>
}

function Login({ mode, apiBaseUrl, onSignedIn, authError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(authError || '')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'local') {
        const demoAdmin = { name: 'Carewell Admin', email: 'admin@carewell.local', role: 'admin' }
        localStorage.setItem(SESSION_KEY, JSON.stringify(demoAdmin))
        onSignedIn(demoAdmin)
      } else {
        const result = await request(apiBaseUrl, '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        if (result.user.role !== 'admin') {
          await request(apiBaseUrl, '/auth/logout', { method: 'POST' })
          throw new Error('This account does not have administrator access.')
        }
        onSignedIn(result.user)
      }
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className={styles.loginPage}>
    <a className={styles.loginBrand} href="/"><span><HeartPulse size={19} /></span><strong>carewell<span>.</span></strong></a>
    <form className={styles.loginPanel} onSubmit={submit}>
      <span className={styles.kicker}>CARE TEAM OPERATIONS</span>
      <h1>Administrator sign in</h1>
      <p>{mode === 'local' ? 'Open the browser-only demonstration workspace.' : 'Use the administrator account configured on the Carewell API.'}</p>
      {mode === 'api' && <>
        <label htmlFor="admin-email">Administrator email</label>
        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </>}
      {error && <div className={styles.error} role="alert">{error}</div>}
      <button className={styles.primaryButton} disabled={busy}>{mode === 'local' ? 'Open demo workspace' : busy ? 'Signing in…' : 'Sign in securely'}</button>
      <small>{mode === 'local' ? 'Demo only · Data stays in this browser' : 'Protected by a server-verified session'}</small>
    </form>
    <a className={styles.returnLink} href="/">← Return to Carewell</a>
  </main>
}

function Metric({ label, value, note, icon: Icon, tone }) {
  return <article className={styles.metric}><span className={`${styles.metricIcon} ${styles[tone]}`}><Icon size={16} /></span><small>{label}</small><strong>{value}</strong><i>{note}</i></article>
}

export default function CarewellAdmin({ mode = 'local', apiBaseUrl = '' }) {
  const [admin, setAdmin] = useState(null)
  const [data, setData] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [page, setPage] = useState('Overview')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  async function loadData() {
    if (mode === 'local') {
      setData(readDemoData())
      setLoading(false)
      return
    }
    try {
      const [summary, appointments, providers, patients, doctorList, settings] = await Promise.all([
        request(apiBaseUrl, '/admin/summary'),
        request(apiBaseUrl, '/admin/appointments'),
        request(apiBaseUrl, '/admin/providers'),
        request(apiBaseUrl, '/admin/patients'),
        request(apiBaseUrl, '/admin/doctors'),
        request(apiBaseUrl, '/admin/settings'),
      ])
      setMetrics(summary.metrics)
      setData({ appointments: appointments.appointments, providers: providers.providers, patients: patients.patients, doctors: doctorList.doctors, settings: settings.settings })
      setError('')
    } catch (loadError) {
      if (loadError.status === 401) setAdmin(null)
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function initialize() {
      if (mode === 'local') {
        try {
          const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
          if (active && session) {
            setAdmin(session)
            setData(readDemoData())
          }
        } catch {}
        if (active) setLoading(false)
        return
      }
      try {
        const result = await request(apiBaseUrl, '/auth/me')
        if (active && result.user.role === 'admin') setAdmin(result.user)
        else if (active) setError('This account does not have administrator access.')
      } catch {
        if (active) setAdmin(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    void initialize()
    return () => { active = false }
  }, [apiBaseUrl, mode])

  useEffect(() => { if (admin) void loadData() }, [admin, mode])

  const pageInfo = PAGES.find((item) => item.name === page) || PAGES[0]
  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase()
    const source = page === 'Appointments' ? data?.appointments : page === 'Providers' ? data?.providers : page === 'Patients' ? data?.patients : page === 'Doctors' ? data?.doctors : []
    if (!value) return source || []
    return (source || []).filter((item) => Object.values(item).some((field) => String(field ?? '').toLowerCase().includes(value)))
  }, [data, page, query])

  async function updateCollection(collection, item, changes, route) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'local') {
        const updated = { ...data, [collection]: data[collection].map((record) => {
          if ((record.id || record._id) !== (item.id || item._id)) return record
          const next = { ...record, ...changes }
          if (collection === 'providers' && changes.doctorSlug !== undefined) {
            next.providerDoctor = data.doctors.find((doctor) => doctor.slug === changes.doctorSlug) || null
          }
          return next
        }) }
        saveDemoData(updated)
        setData(updated)
      } else {
        await request(apiBaseUrl, route, { method: 'PATCH', body: JSON.stringify(changes) })
        await loadData()
      }
      setNotice('Changes saved.')
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveSettings(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'local') saveDemoData(data)
      else {
        const result = await request(apiBaseUrl, '/admin/settings', { method: 'PUT', body: JSON.stringify(data.settings) })
        setData({ ...data, settings: result.settings })
      }
      setNotice('Clinic settings saved.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    if (mode === 'local') localStorage.removeItem(SESSION_KEY)
    else {
      try { await request(apiBaseUrl, '/auth/logout', { method: 'POST' }) } catch {}
    }
    setAdmin(null)
    setData(null)
  }

  if (loading) return <div className={styles.loading}><span /> Loading Carewell workspace</div>
  if (!admin) return <Login mode={mode} apiBaseUrl={apiBaseUrl} onSignedIn={(value) => { setError(''); setAdmin(value) }} authError={error} />

  const summary = metrics || {
    patients: data?.patients?.length || 0,
    providers: data?.providers?.length || 0,
    pendingProviders: data?.providers?.filter((item) => item.providerStatus === 'pending').length || 0,
    doctors: data?.doctors?.filter((item) => item.active).length || 0,
    pendingAppointments: data?.appointments?.filter((item) => item.status === 'pending').length || 0,
    upcomingAppointments: data?.appointments?.filter((item) => ['pending', 'confirmed'].includes(item.status)).length || 0,
  }

  return <div className={styles.shell}>
    <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
      <a href="/" className={styles.brand}><span><HeartPulse size={18} /></span><strong>carewell<span>.</span></strong></a>
      <div className={styles.workspace}><span className={styles.workspaceAvatar}><ShieldCheck size={16} /></span><span><b>Care team</b><small>Operations workspace</small></span></div>
      <nav aria-label="Carewell admin pages"><small>WORKSPACE</small>{PAGES.map(({ name, icon: Icon }) => <button key={name} className={page === name ? styles.activeNav : ''} onClick={() => { setPage(name); setMenuOpen(false); setQuery(''); setNotice('') }}><Icon size={16} /><span>{name}</span>{name === 'Appointments' && summary.pendingAppointments > 0 && <i>{summary.pendingAppointments}</i>}</button>)}</nav>
      <div className={styles.sidebarFoot}><span><i />{mode === 'local' ? 'Local demo data' : 'Secure API session'}</span><a href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={14} /> Public website</a><button onClick={signOut}><LogOut size={14} /> Sign out</button></div>
    </aside>
    {menuOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className={styles.main}>
      <header className={styles.topbar}><button className={styles.mobileMenu} aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={18} /></button><div><span>Carewell</span><b>/</b><strong>{page}</strong></div><div className={styles.topUser}><span>{mode === 'local' ? 'LOCAL DEMO' : 'ADMIN SESSION'}</span><i>CA</i><small>{admin.name || admin.email}</small><button aria-label="Sign out" onClick={signOut}><LogOut size={15} /></button></div></header>
      <div className={styles.content}>
        <div className={styles.pageHeading}><div><small>CAREWELL · ADMINISTRATION</small><h1>{page}</h1><p>{pageInfo.subtitle || 'Manage care operations with clear, reviewable workflows.'}</p></div><span className={styles.today}><Clock3 size={14} />{new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span></div>
        {mode === 'local' && <div className={styles.demoNotice}><BadgeCheck size={15} /><span><b>Local demonstration</b> Changes are stored in this browser and do not represent real patient records or appointments.</span></div>}
        {error && <div className={styles.error} role="alert"><X size={15} />{error}</div>}
        {notice && <div className={styles.notice} role="status"><Check size={15} />{notice}</div>}
        {page === 'Overview' && <>
          <div className={styles.metricGrid}>
            <Metric label="Upcoming visits" value={summary.upcomingAppointments} note="Pending or confirmed" icon={CalendarDays} tone="teal" />
            <Metric label="Needs review" value={summary.pendingAppointments} note="Appointment requests" icon={FileClock} tone="gold" />
            <Metric label="Care providers" value={summary.providers} note={`${summary.pendingProviders} awaiting approval`} icon={Stethoscope} tone="blue" />
            <Metric label="Patients" value={summary.patients} note="Registered accounts" icon={Users} tone="rose" />
          </div>
          <section className={styles.panel}><div className={styles.panelHeading}><div><small>RECENT SCHEDULE</small><h2>Appointment requests</h2></div><button onClick={() => setPage('Appointments')}>Open schedule <ArrowUpRight size={14} /></button></div><AppointmentTable appointments={(data?.appointments || []).slice(0, 5)} mode={mode} busy={busy} onUpdate={(item, changes) => updateCollection('appointments', item, changes, `/admin/appointments/${item._id || item.id}`)} readOnly /></section>
          <div className={styles.overviewBottom}><section className={styles.panel}><div className={styles.panelHeading}><div><small>PROVIDER ONBOARDING</small><h2>Approval queue</h2></div><button onClick={() => setPage('Providers')}>View providers <ArrowUpRight size={14} /></button></div>{(data?.providers || []).filter((provider) => provider.providerStatus === 'pending').slice(0, 4).map((provider) => <div className={styles.queueRow} key={provider._id || provider.id}><span className={styles.queueIcon}><Stethoscope size={15} /></span><span><b>{provider.name}</b><small>{provider.email}</small></span><Status value={provider.providerStatus} /></div>)}</section><aside className={styles.healthCard}><span><ShieldCheck size={17} /> CARE DATA</span><h2>Keep clinical notes out of the demo.</h2><p>This template manages appointment requests only. Avoid storing diagnoses, treatment details, or other sensitive health information here.</p></aside></div>
        </>}
        {page === 'Appointments' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>VISIT QUEUE · {data?.appointments?.length || 0}</small><h2>Appointments</h2></div><SearchBox value={query} onChange={setQuery} /></div><AppointmentTable appointments={searchResults} mode={mode} busy={busy} onUpdate={(item, changes) => updateCollection('appointments', item, changes, `/admin/appointments/${item._id || item.id}`)} /></section>}
        {page === 'Providers' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>CLINIC TEAM · {data?.providers?.length || 0}</small><h2>Provider access</h2></div><SearchBox value={query} onChange={setQuery} /></div><ProviderTable providers={searchResults} doctors={data?.doctors || []} busy={busy} onUpdate={(provider, changes) => updateCollection('providers', provider, changes, `/admin/providers/${provider._id || provider.id}`)} /></section>}
        {page === 'Patients' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>PATIENT ACCOUNTS · {data?.patients?.length || 0}</small><h2>Patient directory</h2></div><SearchBox value={query} onChange={setQuery} /></div><PatientTable patients={searchResults} busy={busy} onUpdate={(patient, changes) => updateCollection('patients', patient, changes, `/admin/patients/${patient._id || patient.id}`)} /></section>}
        {page === 'Doctors' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>PUBLIC DIRECTORY · {data?.doctors?.length || 0}</small><h2>Doctor listings</h2></div><SearchBox value={query} onChange={setQuery} /></div><DoctorTable doctors={searchResults} busy={busy} onUpdate={(doctor, changes) => updateCollection('doctors', doctor, changes, `/admin/doctors/${doctor._id || doctor.id}`)} /></section>}
        {page === 'Settings' && <form className={styles.panel + ' ' + styles.settingsPanel} onSubmit={saveSettings}><div className={styles.panelHeading}><div><small>CLINIC CONFIGURATION</small><h2>Carewell settings</h2></div><button className={styles.saveButton} disabled={busy}><Check size={14} /> Save changes</button></div><label>Clinic name<input value={data.settings.clinicName} onChange={(event) => setData({ ...data, settings: { ...data.settings, clinicName: event.target.value } })} required /></label><label>Support email<input type="email" value={data.settings.supportEmail} onChange={(event) => setData({ ...data, settings: { ...data.settings, supportEmail: event.target.value } })} required /></label><label>Appointment notice<textarea rows="3" maxLength="300" value={data.settings.appointmentNotice} onChange={(event) => setData({ ...data, settings: { ...data.settings, appointmentNotice: event.target.value } })} /></label><div className={styles.privacyNote}><ShieldCheck size={16} /><span><b>Privacy boundary</b><small>Store only the minimum details required to schedule visits. Do not use this starter template as a clinical record system.</small></span></div></form>}
        <footer className={styles.footer}><span>Carewell · Care operations</span><span>{mode === 'local' ? 'LocalStorage demo' : 'Authenticated backend'}</span></footer>
      </div>
    </main>
  </div>
}

function SearchBox({ value, onChange }) {
  return <label className={styles.searchBox}><Search size={14} /><input placeholder="Search records" value={value} onChange={(event) => onChange(event.target.value)} /></label>
}

function AppointmentTable({ appointments, mode, busy, onUpdate, readOnly = false }) {
  if (!appointments?.length) return <EmptyState label="No appointments found" />
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>REFERENCE</th><th>PATIENT</th><th>PROVIDER</th><th>VISIT</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{appointments.map((item) => <tr key={item._id || item.id}><td><b className={styles.reference}>{item.reference}</b></td><td><strong>{item.patientName}</strong><small>{item.patientEmail}</small></td><td><strong>{item.doctorName}</strong><small>{item.specialty}</small></td><td>{item.appointmentType}</td><td>{dateLabel(item.startsAt)}</td><td>{readOnly ? <Status value={item.status} /> : <span className={styles.statusControl}><Status value={item.status} /><select value={item.status} disabled={busy} onChange={(event) => onUpdate(item, { status: event.target.value })}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={12} /></span>}</td></tr>)}</tbody></table></div>
}

function ProviderTable({ providers, doctors, busy, onUpdate }) {
  if (!providers?.length) return <EmptyState label="No providers found" />
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>PROVIDER</th><th>EMAIL</th><th>DOCTOR PROFILE</th><th>STATUS</th><th>REVIEW</th></tr></thead><tbody>{providers.map((provider) => <tr key={provider._id || provider.id}><td><strong>{provider.name}</strong><small>Joined {dateLabel(provider.createdAt)}</small></td><td>{provider.email}</td><td><select className={styles.inlineSelect} value={provider.providerDoctor?.slug || ''} disabled={busy} onChange={(event) => onUpdate(provider, { doctorSlug: event.target.value })}><option value="">Choose profile</option>{doctors.map((doctor) => <option key={doctor._id || doctor.id} value={doctor.slug} disabled={Boolean(doctor.providerUser && String(doctor.providerUser) !== String(provider._id))}>{doctor.name}</option>)}</select></td><td><Status value={provider.providerStatus} /></td><td><div className={styles.rowActions}>{provider.providerStatus !== 'approved' && <button disabled={busy || !(provider.providerDoctor?.slug || provider.doctorSlug)} onClick={() => onUpdate(provider, { providerStatus: 'approved', active: true })}>Approve</button>}{provider.providerStatus !== 'rejected' && <button className={styles.dangerButton} disabled={busy} onClick={() => onUpdate(provider, { providerStatus: 'rejected' })}>Reject</button>}</div></td></tr>)}</tbody></table></div>
}

function PatientTable({ patients, busy, onUpdate }) {
  if (!patients?.length) return <EmptyState label="No patients found" />
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>PATIENT</th><th>EMAIL</th><th>PHONE</th><th>JOINED</th><th>ACCESS</th></tr></thead><tbody>{patients.map((patient) => <tr key={patient._id || patient.id}><td><strong>{patient.name}</strong></td><td>{patient.email}</td><td>{patient.phone || '—'}</td><td>{dateLabel(patient.createdAt)}</td><td><button className={patient.active ? styles.textAction : styles.approveButton} disabled={busy} onClick={() => onUpdate(patient, { active: !patient.active })}>{patient.active ? 'Suspend' : 'Reactivate'}</button></td></tr>)}</tbody></table></div>
}

function DoctorTable({ doctors, busy, onUpdate }) {
  if (!doctors?.length) return <EmptyState label="No doctor listings found" />
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>DOCTOR</th><th>SPECIALTY</th><th>LOCATION</th><th>VISIT FEE</th><th>DIRECTORY</th></tr></thead><tbody>{doctors.map((doctor) => <tr key={doctor._id || doctor.id}><td><strong>{doctor.name}</strong><small>{doctor.credentials}</small></td><td>{doctor.specialty}</td><td>{doctor.location}</td><td><label className={styles.feeField}><span>$</span><input type="number" min="0" max="10000" step="1" defaultValue={doctor.fee} aria-label={`Visit fee for ${doctor.name}`} onBlur={(event) => { const fee = Number(event.target.value); if (Number.isFinite(fee) && fee >= 0 && fee !== doctor.fee) onUpdate(doctor, { fee }) }} /></label></td><td><button className={doctor.active ? styles.textAction : styles.approveButton} disabled={busy} onClick={() => onUpdate(doctor, { active: !doctor.active })}>{doctor.active ? 'Hide listing' : 'Publish listing'}</button></td></tr>)}</tbody></table></div>
}

function EmptyState({ label }) {
  return <div className={styles.emptyState}><CalendarDays size={21} /><strong>{label}</strong><small>New care activity will appear here.</small></div>
}