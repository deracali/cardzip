import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowUpRight, BadgeCheck, CalendarDays, Check, ChevronDown, LogOut,
  Menu, Music2, Search, Settings, ShieldCheck, Ticket, Users, X,
} from 'lucide-react'
import { events as starterEvents } from '../data/eventData'
import styles from './EventHubAdmin.module.css'

const DATA_KEY = 'pulselive-admin-demo-v1'
const SESSION_KEY = 'pulselive-admin-demo-session'
const NAV = [
  { name: 'Overview', icon: Activity },
  { name: 'Events', icon: CalendarDays },
  { name: 'Schedule', icon: Music2 },
  { name: 'Bookings', icon: Ticket },
  { name: 'Organizers', icon: BadgeCheck },
  { name: 'Attendees', icon: Users },
  { name: 'Settings', icon: Settings },
]
const initialData = {
  events: starterEvents.map((event) => ({ ...event, published: true })),
  bookings: [
    { id: 'booking-demo-1', reference: 'PL-24018', attendeeName: 'Alex Morgan', attendeeEmail: 'alex@example.com', eventSlug: 'neon-pulse', eventTitle: 'Neon Pulse Festival 2027', ticketType: 'General Admission', quantity: 2, total: 192.24, status: 'requested', paymentStatus: 'not-integrated', createdAt: '2026-11-15T12:00:00.000Z' },
    { id: 'booking-demo-2', reference: 'PL-24006', attendeeName: 'Jamie Rivera', attendeeEmail: 'jamie@example.com', eventSlug: 'global-tech-summit', eventTitle: 'Global Tech Summit 2027', ticketType: 'VIP Pass', quantity: 1, total: 376.92, status: 'confirmed', paymentStatus: 'not-integrated', createdAt: '2026-11-14T12:00:00.000Z' },
    { id: 'booking-demo-3', reference: 'PL-23992', attendeeName: 'Sam Taylor', attendeeEmail: 'sam@example.com', eventSlug: 'city-lights-live', eventTitle: 'City Lights Live', ticketType: 'General Admission', quantity: 1, total: 70.2, status: 'cancelled', paymentStatus: 'not-integrated', createdAt: '2026-11-12T12:00:00.000Z' },
  ],
  organizers: [
    { id: 'organizer-demo-1', name: 'Northstar Events', email: 'team@northstar.example', organizerStatus: 'pending', active: true, createdAt: '2026-11-15T12:00:00.000Z' },
    { id: 'organizer-demo-2', name: 'FutureForm Collective', email: 'hello@futureform.example', organizerStatus: 'approved', active: true, createdAt: '2026-11-08T12:00:00.000Z' },
  ],
  attendees: [
    { id: 'attendee-demo-1', name: 'Alex Morgan', email: 'alex@example.com', active: true, createdAt: '2026-10-12T12:00:00.000Z' },
    { id: 'attendee-demo-2', name: 'Jamie Rivera', email: 'jamie@example.com', active: true, createdAt: '2026-10-20T12:00:00.000Z' },
    { id: 'attendee-demo-3', name: 'Sam Taylor', email: 'sam@example.com', active: false, createdAt: '2026-10-27T12:00:00.000Z' },
  ],
  settings: { platformName: 'PulseLive', supportEmail: 'help@pulselive.example', announcement: '', organizerApplications: true },
}

function readLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY) || 'null')
    if (saved?.events && saved?.settings) return saved
  } catch {}
  localStorage.setItem(DATA_KEY, JSON.stringify(initialData))
  return initialData
}

function saveLocal(data) { localStorage.setItem(DATA_KEY, JSON.stringify(data)) }

async function request(apiBaseUrl, path, options = {}) {
  let response
  try { response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) }, ...options }) }
  catch (error) { throw new Error(`Could not connect to PulseLive API at ${apiBaseUrl}: ${error.message}`) }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const apiError = new Error(result.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  return result
}

function dateLabel(value) { return value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—' }
function dollars(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value) || 0) }
function Status({ value }) { return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}><i />{value}</span> }

function Login({ mode, apiBaseUrl, authError, onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(authError || '')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      if (mode === 'local') {
        const demo = { name: 'PulseLive Admin', email: 'admin@pulselive.local', role: 'admin' }
        localStorage.setItem(SESSION_KEY, JSON.stringify(demo)); onSignedIn(demo)
      } else {
        const result = await request(apiBaseUrl, '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        if (result.user.role !== 'admin') { await request(apiBaseUrl, '/auth/logout', { method: 'POST' }); throw new Error('This account does not have administrator access.') }
        onSignedIn(result.user)
      }
    } catch (loginError) { setError(loginError.message) }
    finally { setBusy(false) }
  }
  return <main className={styles.loginPage}><a className={styles.loginBrand} href="/"><img src="/favicon.svg" alt="" /><strong>PulseLive</strong></a><form className={styles.loginPanel} onSubmit={submit}><small>EVENT OPERATIONS</small><h1>Administrator sign in</h1><p>{mode === 'local' ? 'Open the browser-only event operations demo.' : 'Use the administrator account configured on the backend.'}</p>{mode === 'api' && <><label htmlFor="admin-email">Administrator email</label><input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></>}{error && <div className={styles.error} role="alert">{error}</div>}<button className={styles.primaryButton} disabled={busy}>{mode === 'local' ? 'Open demo workspace' : busy ? 'Signing in…' : 'Sign in securely'}</button><small>{mode === 'local' ? 'Demo only · Browser storage' : 'Server-verified administrator session'}</small></form><a className={styles.backLink} href="/">← Back to PulseLive</a></main>
}

function Metric({ label, value, note, icon: Icon, tone }) { return <article className={styles.metric}><span className={`${styles.metricIcon} ${styles[tone]}`}><Icon size={16} /></span><small>{label}</small><strong>{value}</strong><i>{note}</i></article> }

export default function EventHubAdmin({ mode = 'local', apiBaseUrl = '' }) {
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
  const [editor, setEditor] = useState(null)

  async function loadData() {
    if (mode === 'local') { setData(readLocal()); setLoading(false); return }
    try {
      const [summary, eventsResult, bookings, organizers, attendees, settings] = await Promise.all([
        request(apiBaseUrl, '/admin/summary'), request(apiBaseUrl, '/admin/events'), request(apiBaseUrl, '/admin/bookings'),
        request(apiBaseUrl, '/admin/organizers'), request(apiBaseUrl, '/admin/attendees'), request(apiBaseUrl, '/admin/settings'),
      ])
      setMetrics(summary.metrics)
      setData({ events: eventsResult.events, bookings: bookings.bookings, organizers: organizers.organizers, attendees: attendees.attendees, settings: settings.settings })
      setError('')
    } catch (loadError) { if (loadError.status === 401) setAdmin(null); setError(loadError.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    async function initialize() {
      if (mode === 'local') {
        try { const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); if (active && session) { setAdmin(session); setData(readLocal()) } } catch {}
        if (active) setLoading(false)
        return
      }
      try {
        const result = await request(apiBaseUrl, '/auth/me')
        if (active && result.user.role === 'admin') setAdmin(result.user)
        else if (active) setError('This account does not have administrator access.')
      } catch { if (active) setAdmin(null) }
      finally { if (active) setLoading(false) }
    }
    void initialize()
    return () => { active = false }
  }, [apiBaseUrl, mode])
  useEffect(() => { if (admin) void loadData() }, [admin, mode])

  const selectedData = page === 'Events' || page === 'Schedule' ? data?.events : page === 'Bookings' ? data?.bookings : page === 'Organizers' ? data?.organizers : page === 'Attendees' ? data?.attendees : []
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return !search ? selectedData || [] : (selectedData || []).filter((item) => JSON.stringify(item).toLowerCase().includes(search))
  }, [query, selectedData])

  async function updateItem(collection, item, changes, route) {
    setBusy(true); setError(''); setNotice('')
    try {
      if (mode === 'local') {
        const updated = { ...data, [collection]: data[collection].map((record) => (record.id || record._id || record.slug) === (item.id || item._id || item.slug) ? { ...record, ...changes } : record) }
        saveLocal(updated); setData(updated)
      } else { await request(apiBaseUrl, route, { method: 'PATCH', body: JSON.stringify(changes) }); await loadData() }
      setNotice('Changes saved.')
    } catch (updateError) { setError(updateError.message) }
    finally { setBusy(false) }
  }

  async function saveEvent(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const sessions = String(form.get('sessions') || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [time = '', end = '', track = 'MAIN STAGE', title = '', speaker = '', kind = 'Talk'] = line.split('|').map((item) => item.trim())
      return { time, end, track, title, speaker, kind }
    })
    const changes = {
      title: String(form.get('title') || '').trim(), category: String(form.get('category') || '').trim(), date: String(form.get('date') || '').trim(),
      time: String(form.get('time') || '').trim(), location: String(form.get('location') || '').trim(), price: Number(form.get('price')),
      image: String(form.get('image') || '').trim(), description: String(form.get('description') || '').trim(), lineup: String(form.get('lineup') || '').trim(),
      tag: String(form.get('tag') || '').trim(), sessions, published: form.get('published') === 'on',
    }
    try {
      if (mode === 'local') {
        const slug = editor?.slug || changes.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const next = { ...editor, ...changes, slug }
        const updated = { ...data, events: editor ? data.events.map((item) => item.slug === editor.slug ? next : item) : [...data.events, next] }
        saveLocal(updated); setData(updated)
      } else if (editor) { await request(apiBaseUrl, `/admin/events/${encodeURIComponent(editor.slug)}`, { method: 'PATCH', body: JSON.stringify(changes) }); await loadData() }
      else { await request(apiBaseUrl, '/admin/events', { method: 'POST', body: JSON.stringify(changes) }); await loadData() }
      setEditor(null); setNotice('Event details saved.')
    } catch (saveError) { setError(saveError.message) }
    finally { setBusy(false) }
  }

  async function saveSettings(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const settings = { platformName: String(form.get('platformName') || '').trim(), supportEmail: String(form.get('supportEmail') || '').trim(), announcement: String(form.get('announcement') || '').trim(), organizerApplications: form.get('organizerApplications') === 'on' }
    try {
      if (mode === 'local') { const updated = { ...data, settings }; saveLocal(updated); setData(updated) }
      else { const result = await request(apiBaseUrl, '/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }); setData({ ...data, settings: result.settings }) }
      setNotice('Platform settings saved.')
    } catch (saveError) { setError(saveError.message) }
    finally { setBusy(false) }
  }

  async function signOut() {
    if (mode === 'local') localStorage.removeItem(SESSION_KEY)
    else { try { await request(apiBaseUrl, '/auth/logout', { method: 'POST' }) } catch {} }
    setAdmin(null); setData(null)
  }

  if (loading || (admin && !data && !error)) return <div className={styles.loading}><span /> Loading PulseLive operations</div>
  if (!admin) return <Login mode={mode} apiBaseUrl={apiBaseUrl} authError={error} onSignedIn={(value) => { setError(''); if (mode === 'local') setData(readLocal()); setAdmin(value) }} />
  if (!data) return <div className={styles.loading}><span />{error || 'Workspace data unavailable.'}<button onClick={() => { setError(''); setLoading(true); void loadData() }}>Retry</button></div>

  const summary = metrics || { events: data.events.length, publishedEvents: data.events.filter((item) => item.published).length, bookings: data.bookings.length, pendingBookings: data.bookings.filter((item) => item.status === 'requested').length, attendees: data.attendees.length, organizers: data.organizers.length, pendingOrganizers: data.organizers.filter((item) => item.organizerStatus === 'pending').length }

  return <div className={styles.shell}>
    <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}><a className={styles.brand} href="/"><img src="/favicon.svg" alt="" /><strong>PulseLive</strong></a><div className={styles.workspace}><span><ShieldCheck size={16} /></span><div><b>Event operations</b><small>Platform administration</small></div></div><nav aria-label="PulseLive admin pages"><small>WORKSPACE</small>{NAV.map(({ name, icon: Icon }) => <button key={name} className={page === name ? styles.activeNav : ''} onClick={() => { setPage(name); setMenuOpen(false); setQuery(''); setNotice('') }}><Icon size={16} /><span>{name}</span>{name === 'Bookings' && summary.pendingBookings > 0 && <i>{summary.pendingBookings}</i>}</button>)}</nav><div className={styles.sidebarFoot}><span><i />{mode === 'local' ? 'LocalStorage demo' : 'Authenticated API'}</span><a href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={14} /> Public website</a><button onClick={signOut}><LogOut size={14} /> Sign out</button></div></aside>
    {menuOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className={styles.main}><header className={styles.topbar}><button className={styles.mobileMenu} aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={18} /></button><div><span>PulseLive</span><b>/</b><strong>{page}</strong></div><div className={styles.topUser}><span>{mode === 'local' ? 'LOCAL DEMO' : 'ADMIN SESSION'}</span><i>PL</i><small>{admin.name || admin.email}</small><button aria-label="Sign out" onClick={signOut}><LogOut size={15} /></button></div></header>
      <div className={styles.content}><div className={styles.heading}><div><small>PULSELIVE · EVENT OPERATIONS</small><h1>{page}</h1><p>Manage events, booking requests, organizer access, and attendee accounts.</p></div></div>
        {mode === 'local' && <div className={styles.demoNotice}><BadgeCheck size={15} /><span><b>Local demonstration</b> Changes stay in this browser; no real bookings or tickets are created.</span></div>}{error && <div className={styles.error} role="alert">{error}</div>}{notice && <div className={styles.notice} role="status">{notice}</div>}
        {page === 'Overview' && <><div className={styles.metrics}><Metric label="Events" value={summary.events} note={`${summary.publishedEvents} published`} icon={CalendarDays} tone="violet" /><Metric label="Booking requests" value={summary.bookings} note={`${summary.pendingBookings} awaiting review`} icon={Ticket} tone="cyan" /><Metric label="Attendees" value={summary.attendees} note="Registered accounts" icon={Users} tone="blue" /><Metric label="Organizers" value={summary.organizers} note={`${summary.pendingOrganizers} for review`} icon={ShieldCheck} tone="rose" /></div><div className={styles.overviewGrid}><section className={styles.panel}><div className={styles.panelHeading}><div><small>EVENT CATALOG</small><h2>Published events</h2></div><button onClick={() => setPage('Events')}>Manage events <ArrowUpRight size={14} /></button></div>{data.events.filter((item) => item.published).slice(0, 5).map((item) => <div className={styles.eventRow} key={item.slug}><span><b>{item.title}</b><small>{item.category} · {item.date} · {item.location}</small></span><Status value="published" /></div>)}</section><aside className={styles.healthCard}><span><ShieldCheck size={16} /> PAYMENT BOUNDARY</span><h2>Booking requests are not tickets.</h2><p>No payment processor or ticket issuance is connected. Keep paid booking requests pending until a real payment integration is verified.</p></aside></div></>}
        {page === 'Events' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>EVENT CATALOG · {data.events.length}</small><h2>Events</h2></div><div className={styles.actions}><SearchBox value={query} onChange={setQuery} /><button className={styles.primaryButton} onClick={() => setEditor({ sessions: [], price: 0, published: false })}>New event</button></div></div><EventTable events={filtered} onEdit={setEditor} onToggle={(item) => updateItem('events', item, { published: !item.published }, `/admin/events/${item.slug}`)} busy={busy} /></section>}
        {page === 'Schedule' && <ScheduleAdmin events={data.events} onEdit={setEditor} />}
        {page === 'Bookings' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>BOOKING REQUESTS · {data.bookings.length}</small><h2>Bookings</h2></div><SearchBox value={query} onChange={setQuery} /></div><BookingTable bookings={filtered} busy={busy} onUpdate={(item, changes) => updateItem('bookings', item, changes, `/admin/bookings/${item._id || item.id}`)} /></section>}
        {page === 'Organizers' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>ORGANIZER ACCESS · {data.organizers.length}</small><h2>Organizers</h2></div><SearchBox value={query} onChange={setQuery} /></div><OrganizerTable organizers={filtered} busy={busy} onUpdate={(item, changes) => updateItem('organizers', item, changes, `/admin/organizers/${item._id || item.id}`)} /></section>}
        {page === 'Attendees' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>ATTENDEE ACCOUNTS · {data.attendees.length}</small><h2>Attendees</h2></div><SearchBox value={query} onChange={setQuery} /></div><AttendeeTable attendees={filtered} busy={busy} onUpdate={(item, changes) => updateItem('attendees', item, changes, `/admin/attendees/${item._id || item.id}`)} /></section>}
        {page === 'Settings' && <form className={styles.panel + ' ' + styles.settingsPanel} onSubmit={saveSettings}><div className={styles.panelHeading}><div><small>PLATFORM CONFIGURATION</small><h2>PulseLive settings</h2></div><button className={styles.primaryButton} disabled={busy}>Save settings</button></div><label>Platform name<input name="platformName" defaultValue={data.settings.platformName} required /></label><label>Support email<input name="supportEmail" type="email" defaultValue={data.settings.supportEmail} required /></label><label>Announcement<textarea name="announcement" rows="3" maxLength="500" defaultValue={data.settings.announcement} /></label><label className={styles.toggleRow}><span><b>Organizer applications</b><small>Allow new organizer accounts to apply for approval.</small></span><input name="organizerApplications" type="checkbox" defaultChecked={data.settings.organizerApplications} /></label><div className={styles.privacyNote}><ShieldCheck size={16} /><span><b>Ticketing boundary</b><small>Payments and ticket issuance are not integrated. Do not mark unpaid requests as paid.</small></span></div></form>}
        <footer className={styles.footer}><span>PulseLive · Event operations</span><span>{mode === 'local' ? 'Browser demo data' : 'Authenticated backend session'}</span></footer>
      </div>
    </main>
    {editor && <EventEditor event={editor} busy={busy} onClose={() => setEditor(null)} onSave={saveEvent} />}
  </div>
}

function SearchBox({ value, onChange }) { return <label className={styles.searchBox}><Search size={14} /><input placeholder="Search" value={value} onChange={(event) => onChange(event.target.value)} /></label> }
function ScheduleAdmin({ events, onEdit }) { const [selected, setSelected] = useState(events[0]?.slug || ''); const event = events.find((item) => item.slug === selected); return <section className={styles.panel}><div className={styles.panelHeading}><div><small>PROGRAM CONTENT</small><h2>Event schedule</h2></div><select className={styles.select} value={selected} onChange={(e) => setSelected(e.target.value)}>{events.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></div>{event ? <><div className={styles.eventRow}><span><b>{event.title}</b><small>{event.date} · {event.location}</small></span><button className={styles.textAction} onClick={() => onEdit(event)}>Edit event</button></div>{(event.sessions || []).map((session, index) => <div className={styles.scheduleRow} key={`${session.title}-${index}`}><b>{session.time}</b><span><strong>{session.title}</strong><small>{session.track} · {session.kind} · {session.speaker}</small></span></div>)}{!event.sessions?.length && <Empty label="No schedule sessions added" />}</> : <Empty label="No events available" />}</section> }
function EventTable({ events, onEdit, onToggle, busy }) { if (!events?.length) return <Empty label="No events found" />; return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>EVENT</th><th>DATE</th><th>VENUE</th><th>PRICE</th><th>STATUS</th><th>EDIT</th></tr></thead><tbody>{events.map((item) => <tr key={item.slug}><td><strong>{item.title}</strong><small>{item.category}</small></td><td>{item.date}<small>{item.time}</small></td><td>{item.location}</td><td>{dollars(item.price)}</td><td><Status value={item.published ? 'published' : 'draft'} /></td><td><div className={styles.rowActions}><button onClick={() => onEdit(item)}>Edit</button><button className={styles.secondaryButton} disabled={busy} onClick={() => onToggle(item)}>{item.published ? 'Unpublish' : 'Publish'}</button></div></td></tr>)}</tbody></table></div> }
function BookingTable({ bookings, busy, onUpdate }) { if (!bookings?.length) return <Empty label="No booking requests found" />; return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>REFERENCE</th><th>ATTENDEE</th><th>EVENT</th><th>TICKETS</th><th>TOTAL</th><th>REQUEST</th><th>PAYMENT</th></tr></thead><tbody>{bookings.map((item) => <tr key={item._id || item.id}><td><b>{item.reference}</b></td><td><strong>{item.attendeeName}</strong><small>{item.attendeeEmail}</small></td><td>{item.eventTitle}</td><td>{item.quantity} × {item.ticketType}</td><td>{dollars(item.total)}</td><td><select className={styles.inlineSelect} value={item.status} disabled={busy} onChange={(e) => onUpdate(item, { status: e.target.value })}>{['requested', 'confirmed', 'cancelled'].map((status) => <option key={status}>{status}</option>)}</select></td><td><Status value={item.paymentStatus || 'not-integrated'} /></td></tr>)}</tbody></table></div> }
function OrganizerTable({ organizers, busy, onUpdate }) { if (!organizers?.length) return <Empty label="No organizers found" />; return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>ORGANIZER</th><th>EMAIL</th><th>APPLICATION</th><th>ACCESS</th><th>REVIEW</th></tr></thead><tbody>{organizers.map((item) => <tr key={item._id || item.id}><td><strong>{item.name}</strong><small>Joined {dateLabel(item.createdAt)}</small></td><td>{item.email}</td><td><Status value={item.organizerStatus} /></td><td><Status value={item.active ? 'active' : 'suspended'} /></td><td><div className={styles.rowActions}>{item.organizerStatus !== 'approved' && <button disabled={busy} onClick={() => onUpdate(item, { organizerStatus: 'approved', active: true })}>Approve</button>}{item.organizerStatus !== 'rejected' && <button className={styles.dangerButton} disabled={busy} onClick={() => onUpdate(item, { organizerStatus: 'rejected' })}>Reject</button>}</div></td></tr>)}</tbody></table></div> }
function AttendeeTable({ attendees, busy, onUpdate }) { if (!attendees?.length) return <Empty label="No attendees found" />; return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>ATTENDEE</th><th>EMAIL</th><th>JOINED</th><th>ACCESS</th></tr></thead><tbody>{attendees.map((item) => <tr key={item._id || item.id}><td><strong>{item.name}</strong></td><td>{item.email}</td><td>{dateLabel(item.createdAt)}</td><td><button className={item.active ? styles.textAction : styles.approveButton} disabled={busy} onClick={() => onUpdate(item, { active: !item.active })}>{item.active ? 'Suspend' : 'Reactivate'}</button></td></tr>)}</tbody></table></div> }
function EventEditor({ event, busy, onClose, onSave }) { return <div className={styles.modalBackdrop}><form className={styles.editor} onSubmit={onSave}><div className={styles.editorHeading}><div><small>EVENT CONTENT</small><h2>{event.slug ? 'Edit event' : 'Create event'}</h2></div><button type="button" aria-label="Close editor" onClick={onClose}><X size={17} /></button></div><div className={styles.editorGrid}><label>Title<input name="title" defaultValue={event.title || ''} required /></label><label>Category<select name="category" defaultValue={event.category || 'Concert'}>{['Concert', 'Festival', 'Conference', 'Workshop'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Date<input name="date" defaultValue={event.date || ''} required /></label><label>Time<input name="time" defaultValue={event.time || ''} required /></label><label>Venue<input name="location" defaultValue={event.location || ''} required /></label><label>Ticket price<input name="price" type="number" min="0" max="100000" defaultValue={event.price ?? 0} required /></label><label>Tag<input name="tag" defaultValue={event.tag || ''} /></label><label>Lineup<input name="lineup" defaultValue={event.lineup || ''} /></label><label className={styles.fullField}>Image URL<input name="image" type="url" defaultValue={event.image || ''} /></label><label className={styles.fullField}>Description<textarea name="description" rows="3" defaultValue={event.description || ''} /></label><label className={styles.fullField}>Schedule sessions, one per line: start | end | track | title | speaker | kind<textarea name="sessions" rows="5" defaultValue={(event.sessions || []).map((session) => [session.time, session.end, session.track, session.title, session.speaker, session.kind].join(' | ')).join('\n')} /></label><label className={styles.publishToggle}><input name="published" type="checkbox" defaultChecked={Boolean(event.published)} /> Publish this event</label></div><div className={styles.editorFooter}><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button><button className={styles.primaryButton} disabled={busy}>{busy ? 'Saving…' : 'Save event'}</button></div></form></div> }
function Empty({ label }) { return <div className={styles.empty}><CalendarDays size={21} /><b>{label}</b></div> }