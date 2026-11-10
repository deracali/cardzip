import { useMemo, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowRight, Bell, Bot, BriefcaseBusiness,
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  CreditCard, FileBarChart, FileText, Filter, Headphones, LayoutDashboard, List,
  Menu, MessageCircle, MoreHorizontal, Plus, Search, Send, Settings, Sparkles,
  Target, Users, X, Zap,
} from 'lucide-react'
import './App.css'

const navigation = [
  { section: 'WORKSPACE', items: [
    { path: '/overview', label: 'Overview', Icon: LayoutDashboard },
    { path: '/pipeline', label: 'Pipeline', Icon: BriefcaseBusiness, count: '12' },
    { path: '/bookings', label: 'Bookings', Icon: CalendarDays },
    { path: '/support', label: 'Support Desk', Icon: Headphones, count: '8' },
  ] },
  { section: 'OPERATIONS', items: [
    { path: '/clients', label: 'Clients', Icon: Users },
    { path: '/proposals', label: 'Proposals', Icon: FileText },
    { path: '/reports', label: 'Reports', Icon: FileBarChart },
    { path: '/automations', label: 'Automations', Icon: Bot },
  ] },
]

const initialDeals = [
  { name: 'Website Redesign', client: 'Northwind Labs', value: '$12,500', owner: 'MC', ownerName: 'Maya Chen', days: '2h ago', stage: 'Prospecting', tags: ['Website', 'High'], color: 'blue' },
  { name: 'Brand Audit + SEO', client: 'Northwind Labs', value: '$8,400', owner: 'JO', ownerName: 'Jordan Okafor', days: '1d ago', stage: 'Prospecting', tags: ['SEO', 'Medium'], color: 'purple' },
  { name: 'Mobile App Refresh', client: 'Finch & Co.', value: '$27,000', owner: 'MC', ownerName: 'Maya Chen', days: '5h ago', stage: 'Prospecting', tags: ['Mobile App', 'High'], color: 'green' },
  { name: 'Ops Automation', client: 'Helio Systems', value: '$21,000', owner: 'AK', ownerName: 'Avery Kim', days: '3h ago', stage: 'Contacted', tags: ['AI', 'Medium'], color: 'teal' },
  { name: 'CX Training Program', client: 'Brightline Care', value: '$12,000', owner: 'MC', ownerName: 'Maya Chen', days: '1d ago', stage: 'Contacted', tags: ['Training', 'Medium'], color: 'amber' },
  { name: 'Enterprise Onboarding', client: 'Zenith Group', value: '$48,500', owner: 'JO', ownerName: 'Jordan Okafor', days: '3h ago', stage: 'Proposal Sent', tags: ['SaaS', 'High'], color: 'pink' },
  { name: 'Retainer — Q4 Support', client: 'Copperline', value: '$9,600', owner: 'AK', ownerName: 'Avery Kim', days: '2d ago', stage: 'Proposal Sent', tags: ['Support', 'Medium'], color: 'blue' },
  { name: 'Strategy Sprint', client: 'Asteria Labs', value: '$25,000', owner: 'MC', ownerName: 'Maya Chen', days: '5h ago', stage: 'Closed Won', tags: ['Strategy', 'Low', 'Won'], color: 'green' },
  { name: 'Annual Care Plan', client: 'Juniper & Co.', value: '$14,400', owner: 'JO', ownerName: 'Jordan Okafor', days: '1d ago', stage: 'Closed Won', tags: ['Annual Care', 'Medium', 'Won'], color: 'amber' },
]

const stages = ['Prospecting', 'Contacted', 'Proposal Sent', 'Closed Won']

const appointments = [
  { day: 1, time: '10:00', title: 'Discovery Call', client: 'Northwind Labs', owner: 'MC', color: 'blue' },
  { day: 2, time: '13:00', title: 'Strategy Audit', client: 'Vantage Labs', owner: 'DR', color: 'purple', selected: true },
  { day: 2, time: '15:00', title: 'Support Session', client: 'Helio Systems', owner: 'MC', color: 'green' },
  { day: 3, time: '09:30', title: 'Client Discovery', client: 'Copperline', owner: 'AK', color: 'blue' },
  { day: 3, time: '11:00', title: 'Agency Kickoff', client: 'Asteria Labs', owner: 'DR', color: 'purple' },
  { day: 3, time: '14:00', title: 'CX Training', client: 'Brightline Care', owner: 'MC', color: 'green' },
  { day: 4, time: '10:30', title: 'Discovery Call', client: 'Finch & Co.', owner: 'AK', color: 'blue' },
  { day: 4, time: '13:30', title: 'Support Session', client: 'Juniper & Co.', owner: 'MC', color: 'green' },
  { day: 5, time: '09:00', title: 'Onboarding', client: 'Zenith Group', owner: 'DR', color: 'purple' },
  { day: 6, time: '11:00', title: 'Project Review', client: 'Northwind Labs', owner: 'AK', color: 'blue' },
]

const ticketsSeed = [
  { id: 'TKT-21', customer: 'Amara Okafor', initials: 'AO', subject: 'SSO login fails for 2 users after update', assignee: 'Maya Chen', priority: 'Urgent', status: 'Open', age: '12m ago', color: 'coral' },
  { id: 'TKT-19', customer: 'Jonas Weber', initials: 'JW', subject: 'Invoice INV-2081 needs correction', assignee: 'Jordan Okafor', priority: 'High', status: 'In Progress', age: '38m ago', color: 'green' },
  { id: 'TKT-17', customer: 'Priya Nair', initials: 'PN', subject: 'Calendar sync missing appointments', assignee: 'Maya Chen', priority: 'High', status: 'In Progress', age: '1h ago', color: 'purple' },
  { id: 'TKT-15', customer: 'Leo Martinez', initials: 'LM', subject: 'Request: export CSAT report', assignee: 'Avery Kim', priority: 'Normal', status: 'Resolved', age: '2h ago', color: 'amber' },
  { id: 'TKT-12', customer: 'Sofia Almeida', initials: 'SA', subject: 'Mobile app crashes on sign in', assignee: 'Jordan Okafor', priority: 'Urgent', status: 'Open', age: '3h ago', color: 'pink' },
  { id: 'TKT-08', customer: 'Daniel Osei', initials: 'DO', subject: 'Need help updating team permissions', assignee: 'Avery Kim', priority: 'Normal', status: 'Open', age: '4h ago', color: 'blue' },
]

const clients = [
  ['Northwind Labs', 'northwind.example', 'Technology', '$20,900', 'Active', 'MC', 'blue'],
  ['Helio Systems', 'helio.example', 'Technology', '$21,000', 'Active', 'AK', 'teal'],
  ['Vantage Labs', 'vantage.example', 'Consulting', '$48,500', 'Proposal', 'DR', 'purple'],
  ['Brightline Care', 'brightline.example', 'Healthcare', '$12,000', 'Active', 'MC', 'green'],
  ['Copperline', 'copperline.example', 'Finance', '$9,600', 'Active', 'AK', 'amber'],
  ['Juniper & Co.', 'juniper.example', 'Retail', '$14,400', 'Active', 'DR', 'pink'],
]

function Avatar({ initials, tone = 'purple', small = false }) {
  return <span className={`avatar avatar-${tone}${small ? ' avatar-small' : ''}`}>{initials}</span>
}

function Brand() {
  return <a className="brand" href="/overview"><span className="brand-icon"><Sparkles size={14} /></span><span>NexusOps<small>Service Cloud</small></span></a>
}

function Sidebar({ path, open, onClose }) {
  return <>
    {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      <div className="sidebar-head"><Brand /><button className="icon-btn sidebar-close" aria-label="Close navigation" onClick={onClose}><X size={15} /></button></div>
      <label className="sidebar-search"><Search size={12} /><input placeholder="Search clients..." aria-label="Search clients" /></label>
      {navigation.map((group) => <div className="nav-group" key={group.section}><span className="nav-label">{group.section}</span><nav aria-label={group.section}>{group.items.map(({ path: href, label, Icon, count }) => <a href={href} key={href} onClick={onClose} className={path === href ? 'active' : ''}><Icon size={14} /><span>{label}</span>{count && <small>{count}</small>}</a>)}</nav></div>)}
      <div className="nav-group"><span className="nav-label">SETTINGS</span><nav aria-label="Settings"><a href="/settings" className={path === '/settings' ? 'active' : ''} onClick={onClose}><Settings size={14} /><span>Settings</span></a></nav></div>
      <div className="sidebar-bottom"><div className="team-online"><span>On this week</span><b>6 online</b><div>{['MC', 'DR', 'AK', 'JO'].map((item, index) => <Avatar key={item} initials={item} tone={['blue', 'green', 'purple', 'amber'][index]} small />)}<span>+2</span></div></div><a className="profile-link" href="/settings"><Avatar initials="MC" tone="blue" /><span><b>Maya Chen</b><small>Ops Manager</small></span></a></div>
    </aside>
  </>
}

function Header({ onMenu }) {
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  return <><header className="topbar"><button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu size={17} /></button><div className="topbar-crumb"><span>NexusOps</span><ChevronRight size={12} /><span>Operations</span><ChevronRight size={12} /><b>Command Center</b></div><label className="global-search"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search client, deal, ticket..." aria-label="Search client, deal, ticket" /><kbd>⌘ K</kbd></label><div className="topbar-actions"><a className="quick-book" href="/bookings"><CalendarDays size={12} /> Quick book</a><a href="/pipeline/new" className="primary-button"><Plus size={13} /> New deal</a><button className="icon-btn" aria-label="Notifications" onClick={() => setNotice(notice ? '' : 'You’re all caught up on notifications.')}><Bell size={14} /><i /></button></div></header>{notice && <div className="notice-bar">{notice}<button onClick={() => setNotice('')}><X size={12} /></button></div>}</>
}

function PageTitle({ eyebrow, title, description, actions }) {
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div><div className="page-actions">{actions}</div></div>
}

function Button({ children, href, onClick, variant = 'outline', type = 'button' }) {
  const className = `${variant}-button`
  return href ? <a className={className} href={href}>{children}</a> : <button className={className} type={type} onClick={onClick}>{children}</button>
}

function Toast({ message, onClose }) {
  return <div className="toast" role="status"><Check size={14} />{message}<button aria-label="Dismiss" onClick={onClose}><X size={13} /></button></div>
}

function Metric({ label, value, note, Icon, tone = 'purple' }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}><Icon size={15} /></span><div><small>{label}</small><b>{value}</b><span>{note}</span></div></article>
}

function DealCard({ deal, onSelect }) {
  return <article className="deal-card" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', deal.name)} onClick={() => onSelect(deal)}>
    <div className="deal-card-head"><b>{deal.name}</b><button className="icon-btn" aria-label={`Actions for ${deal.name}`} onClick={(event) => { event.stopPropagation(); onSelect(deal) }}><MoreHorizontal size={13} /></button></div>
    <span className="deal-client">{deal.client}</span><div className="deal-value">{deal.value}<span>USD</span></div>
    <div className="tag-row">{deal.tags.map((tag) => <span className={`deal-tag tag-${tag.toLowerCase().replaceAll(' ', '-')}`} key={tag}>{tag}</span>)}</div>
    <div className="deal-card-foot"><span><Avatar initials={deal.owner} tone={deal.color} small /> {deal.days}</span><a href={`/clients?name=${encodeURIComponent(deal.client)}`} aria-label={`Open ${deal.client}`} onClick={(event) => event.stopPropagation()}><MessageCircle size={12} /></a></div>
  </article>
}

function PipelinePage() {
  const [deals, setDeals] = useState(initialDeals)
  const [view, setView] = useState('Kanban')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All stages')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const [showNew, setShowNew] = useState(window.location.pathname === '/pipeline/new')
  const filtered = deals.filter((deal) => `${deal.name} ${deal.client} ${deal.ownerName}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All stages' || deal.stage === filter))
  const totals = stages.map((stage) => filtered.filter((deal) => deal.stage === stage).reduce((sum, deal) => sum + Number(deal.value.replace(/[$,]/g, '')), 0))
  function moveDeal(name, stage) { setDeals((items) => items.map((deal) => deal.name === name ? { ...deal, stage } : deal)); setToast(`${name} moved to ${stage}.`) }
  function addDeal(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    if (!name) return
    const deal = { name, client: String(form.get('client')) || 'New client', value: `$${Number(form.get('value') || 0).toLocaleString()}`, owner: 'MC', ownerName: 'Maya Chen', days: 'just now', stage: 'Prospecting', tags: ['New', 'Medium'], color: 'blue' }
    setDeals((items) => [deal, ...items])
    setShowNew(false)
    setToast(`${name} added to your pipeline.`)
  }
  return <><PageTitle eyebrow="LIVE · LAST SYNCED 2 MIN AGO" title="Good morning, Maya" description="3 deals need follow-up, 4 consults today, 2 urgent tickets. Here’s your pipeline." actions={<><Button onClick={() => setToast('Pipeline data exported as a CSV preview.')}>↓ Export</Button><Button href="/reports"><FileBarChart size={12} /> Reports</Button></>} />
    <div className="pipeline-toolbar"><label className="search-control"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search deals..." /></label><div className="view-toggle"><button className={view === 'Kanban' ? 'selected' : ''} onClick={() => setView('Kanban')}><LayoutDashboard size={12} /> Kanban</button><button className={view === 'Table' ? 'selected' : ''} onClick={() => setView('Table')}><List size={12} /> Table</button></div><label className="compact-select"><Filter size={12} /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All stages</option>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select><ChevronDown size={11} /></label><span className="pipeline-total"><Target size={12} /> Total Pipeline Value: <b>${totals.reduce((sum, total) => sum + total, 0).toLocaleString()}</b></span><Button variant="primary" onClick={() => setShowNew(!showNew)}><Plus size={13} /> Add New Deal</Button></div>
    {showNew && <form className="new-deal-form" onSubmit={addDeal}><label>Deal name<input name="name" placeholder="e.g. Website redesign" required /></label><label>Client<input name="client" placeholder="Client or company" /></label><label>Value (USD)<input name="value" type="number" min="0" placeholder="5000" /></label><button className="primary-button">Create deal</button><button type="button" className="outline-button" onClick={() => setShowNew(false)}>Cancel</button></form>}
    {view === 'Kanban' ? <div className="pipeline-board">{stages.map((stage, index) => { const items = filtered.filter((deal) => deal.stage === stage); return <section className={`pipeline-column column-${index}`} key={stage} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const name = event.dataTransfer.getData('text/plain'); if (name) moveDeal(name, stage) }}><div className="column-heading"><span><i />{stage}<b>{items.length}</b></span><small>${totals[index].toLocaleString()}</small></div><div className="deal-list">{items.map((deal) => <DealCard key={deal.name} deal={deal} onSelect={setSelected} />)}<button className="drop-hint" onClick={() => { setShowNew(true); setFilter(stage) }}>＋ Drop here or add a deal</button></div></section> })}</div> : <section className="table-panel"><div className="table-scroll"><table><thead><tr><th>DEAL</th><th>CLIENT</th><th>STAGE</th><th>VALUE</th><th>OWNER</th><th>UPDATED</th></tr></thead><tbody>{filtered.map((deal) => <tr key={deal.name} onClick={() => setSelected(deal)}><td>{deal.name}</td><td>{deal.client}</td><td><span className="stage-pill">{deal.stage}</span></td><td>{deal.value}</td><td>{deal.ownerName}</td><td>{deal.days}</td></tr>)}</tbody></table></div></section>}
    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="deal-dialog-title" onClick={(event) => event.stopPropagation()}><button className="modal-close icon-btn" aria-label="Close deal details" onClick={() => setSelected(null)}><X size={14} /></button><span className="eyebrow">PIPELINE DEAL</span><h2 id="deal-dialog-title">{selected.name}</h2><p>{selected.client} · {selected.value}</p><label>Move to stage<select value={selected.stage} onChange={(event) => { moveDeal(selected.name, event.target.value); setSelected({ ...selected, stage: event.target.value }) }}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><a className="primary-button" href={`/clients?name=${encodeURIComponent(selected.client)}`}>Open client <ArrowRight size={12} /></a></section></div>}
    {toast && <Toast message={toast} onClose={() => setToast('')} />}
  </>
}

function OverviewPage() {
  const [toast, setToast] = useState('')
  const pipelineTotal = initialDeals.reduce((sum, deal) => sum + Number(deal.value.replace(/[$,]/g, '')), 0)
  return <><PageTitle eyebrow="NEXUSOPS · OPERATIONS" title="Good morning, Maya" description="Here’s what’s happening across your team today." actions={<Button href="/pipeline" variant="primary"><BriefcaseBusiness size={12} /> Open pipeline</Button>} /><div className="metrics-grid"><Metric label="Open pipeline" value={`$${pipelineTotal.toLocaleString()}`} note="12 active deals · +18% this month" Icon={Target} /><Metric label="Bookings today" value="4" note="Next consultation at 10:30 AM" Icon={CalendarDays} tone="green" /><Metric label="Open support tickets" value="8" note="2 urgent · Avg. response 1h 24m" Icon={Headphones} tone="amber" /><Metric label="Client satisfaction" value="94%" note="Based on 126 recent responses" Icon={Sparkles} tone="pink" /></div><div className="overview-grid"><section className="table-panel"><div className="panel-heading"><div><span className="eyebrow">LATEST ACTIVITY</span><h2>Recent deals</h2></div><a className="text-link" href="/pipeline">View pipeline <ArrowRight size={12} /></a></div><div className="table-scroll"><table><thead><tr><th>DEAL</th><th>CLIENT</th><th>STAGE</th><th>VALUE</th><th>OWNER</th></tr></thead><tbody>{initialDeals.slice(0, 5).map((deal) => <tr key={deal.name}><td><a href={`/pipeline?deal=${encodeURIComponent(deal.name)}`}>{deal.name}</a></td><td>{deal.client}</td><td><span className="stage-pill">{deal.stage}</span></td><td>{deal.value}</td><td>{deal.ownerName}</td></tr>)}</tbody></table></div></section><section className="quick-actions"><h2>Quick actions</h2><a href="/pipeline/new"><Plus /> Create a deal <ArrowRight /></a><a href="/bookings"><CalendarDays /> Book a consultation <ArrowRight /></a><a href="/support"><Headphones /> Reply to a ticket <ArrowRight /></a><a href="/clients"><Users /> Add a client <ArrowRight /></a><button onClick={() => setToast('Quick help opened. Our team is online today.')}> <CircleHelp /> Get help <ArrowRight /></button></section></div>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function BookingsPage() {
  const [selectedDay, setSelectedDay] = useState(2)
  const [view, setView] = useState('Week')
  const [selected, setSelected] = useState(appointments[1])
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')
  const visible = view === 'Day' ? appointments.filter((item) => item.day === selectedDay) : appointments
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1)
  return <><PageTitle eyebrow="SCHEDULE · OCTOBER 2025" title="Appointment scheduling" description="October 2025 · 24 bookings this week." actions={<><div className="view-toggle">{['Month', 'Week', 'Day'].map((option) => <button className={view === option ? 'selected' : ''} key={option} onClick={() => setView(option)}>{option}</button>)}</div><Button variant="primary" onClick={() => setShowForm(!showForm)}><Plus size={12} /> Book slot</Button></>} />
    {showForm && <form className="new-deal-form booking-form" onSubmit={(event) => { event.preventDefault(); setShowForm(false); setToast('Booking added to the schedule preview.') }}><label>Client<input required placeholder="Client name" /></label><label>Appointment<input required placeholder="Discovery call" /></label><label>Date<input type="date" required /></label><label>Time<input type="time" required /></label><button className="primary-button">Add booking</button></form>}
    <div className="calendar-layout"><aside className="calendar-sidebar"><div className="month-switch"><b>October 2025</b><span><button aria-label="Previous month" onClick={() => setToast('Previous month shown in calendar preview.')}><ChevronLeft size={13} /></button><button aria-label="Next month" onClick={() => setToast('Next month shown in calendar preview.')}><ChevronRight size={13} /></button></span></div><div className="mini-calendar"><div className="weekdays">{['M','T','W','T','F','S','S'].map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}</div><div className="month-days">{monthDays.map((day) => <button key={day} className={`${day === selectedDay ? 'selected' : ''} ${appointments.some((item) => item.day === day) ? 'has-event' : ''}`} onClick={() => { setSelectedDay(day); setSelected(appointments.find((item) => item.day === day) || null) }}>{day}</button>)}</div></div><div className="event-legend"><span><i className="blue-dot" /> Discovery Call</span><span><i className="purple-dot" /> Strategy Audit</span><span><i className="green-dot" /> Support Session</span></div><button className="today-button" onClick={() => { setSelectedDay(2); setSelected(appointments[1]) }}>Today · 4 bookings <ArrowRight size={12} /></button></aside><section className="calendar-main"><div className="calendar-week-head"><span>TIME</span>{['Mon 06','Tue 07','Wed 08','Thu 09','Fri 10','Sat 11','Sun 12'].map((day, index) => <button className={index + 1 === selectedDay ? 'today' : ''} key={day} onClick={() => setSelectedDay(index + 1)}>{day.split(' ')[0]}<b>{day.split(' ')[1]}</b></button>)}</div><div className="calendar-grid">{Array.from({ length: view === 'Day' ? 8 : 32 }, (_, i) => { const day = view === 'Day' ? selectedDay : Math.floor(i / 4) + 1; const item = visible.find((appointment) => appointment.day === day && Number(appointment.time.split(':')[0]) % 4 === i % 4); return <div className="calendar-cell" key={i}>{i % 4 === 0 && <small>{`${9 + Math.floor(i / 4)}:00`}</small>}{item && <button className={`calendar-event event-${item.color}`} onClick={() => setSelected(item)}><b>{item.title}</b><span>{item.client}</span><small>{item.time}</small></button>}</div> })}</div></section><aside className="appointment-detail"><div className="detail-head"><span className="eyebrow">STRATEGY AUDIT</span><button className="icon-btn" aria-label="Close appointment" onClick={() => setSelected(null)}><X size={12} /></button></div>{selected ? <><h2>{selected.title} — {selected.client}</h2><p className="confirm-line">Tue, Oct {String(selected.day + 5).padStart(2, '0')} · {selected.time} · 45 min · Confirmed</p><div className="appointment-client"><Avatar initials={selected.owner} tone="blue" /><span><b>Daniel Reyes</b><small>{selected.client}<br />daniel@nexusops.example</small></span><a href="mailto:daniel@nexusops.example" aria-label="Email appointment owner">✉</a></div><h3>Meeting notes</h3><p className="meeting-notes">Review the current project scope, align on goals, and share the next steps before the next sprint.</p><div className="meeting-link"><span><VideoIcon /> meet.google.com/abc-defg-hij</span><button onClick={() => setToast('Meeting link copied.')}>Copy</button></div><p className="attendee-line"><Avatar initials="MC" tone="purple" small /> Maya Chen · Room A</p><div className="appointment-actions"><Button onClick={() => setToast('Reschedule request opened.')}>Reschedule</Button><Button onClick={() => { setSelected(null); setToast('Booking cancelled in this preview.') }}>Cancel</Button></div></> : <p className="empty-detail">Choose a booking on the calendar to see its details.</p>}</aside></div>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function VideoIcon() { return <MessageCircle size={12} /> }

function SupportPage() {
  const [tickets, setTickets] = useState(ticketsSeed)
  const [selected, setSelected] = useState(ticketsSeed[0])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [reply, setReply] = useState('')
  const [sent, setSent] = useState(false)
  const filtered = useMemo(() => tickets.filter((ticket) => (filter === 'All' || ticket.status === filter) && `${ticket.id} ${ticket.customer} ${ticket.subject}`.toLowerCase().includes(query.toLowerCase())), [tickets, filter, query])
  function sendReply(event) { event.preventDefault(); if (!reply.trim()) return; setSent(true); setReply('') }
  function changeStatus(status) { setTickets((items) => items.map((ticket) => ticket.id === selected.id ? { ...ticket, status } : ticket)); setSelected({ ...selected, status }) }
  return <><PageTitle eyebrow="CUSTOMER CARE" title="Support ticketing" description="Queue health and live response drawer." actions={<Button onClick={() => setFilter('Open')}><Filter size={12} /> My queue</Button>} /><div className="support-metrics"><Metric label="Open Tickets" value="48" note="+3 today" Icon={Headphones} /><Metric label="Avg. Response Time" value="1h 24m" note="Within 2h SLA target" Icon={Clock3} tone="purple" /><Metric label="CSAT Score" value="94%" note="126 responses" Icon={Sparkles} tone="green" /><Metric label="Urgent Priority" value="7" note="2 breaching SLA" Icon={Zap} tone="red" /></div><div className="support-layout"><section className="support-table-panel"><div className="support-toolbar"><div className="filter-tabs">{['All', 'Open', 'In Progress', 'Resolved'].map((item) => <button className={filter === item ? 'selected' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="search-control"><Search size={12} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tickets..." /></label></div><div className="table-scroll"><table className="ticket-table"><thead><tr><th>TICKET</th><th>CUSTOMER</th><th>SUBJECT</th><th>ASSIGNEE</th><th>PRIORITY</th><th>STATUS</th><th>AGE</th></tr></thead><tbody>{filtered.map((ticket) => <tr key={ticket.id} onClick={() => { setSelected(ticket); setSent(false) }} className={selected?.id === ticket.id ? 'selected' : ''}><td><a href={`/support?ticket=${ticket.id}`} onClick={(event) => event.preventDefault()}>{ticket.id}</a></td><td><span className="customer-name"><Avatar initials={ticket.initials} tone={ticket.color} small />{ticket.customer}</span></td><td>{ticket.subject}</td><td>{ticket.assignee.split(' ')[0]}</td><td><span className={`priority priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td><td><span className={`ticket-status status-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span></td><td>{ticket.age}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">No tickets match your filters.</div>}</div><div className="table-footer"><span>Showing {filtered.length} of 48 tickets</span><span>Page 1 of 5</span></div></section><aside className="ticket-drawer">{selected ? <><div className="drawer-heading"><span><small> TICKET · </small><b>{selected.id}</b></span><button className="icon-btn" aria-label="Close ticket" onClick={() => setSelected(null)}><X size={12} /></button></div><div className="drawer-summary"><h2>{selected.subject}</h2><p>{selected.customer} · {selected.age} · Email</p><div><span className={`priority priority-${selected.priority.toLowerCase()}`}>{selected.priority}</span><span className={`ticket-status status-${selected.status.toLowerCase().replace(' ', '-')}`}>{selected.status}</span></div></div><div className="conversation"><div className="message customer-message"><div className="message-author"><Avatar initials={selected.initials} tone={selected.color} small /><b>{selected.customer}</b><time>{selected.age}</time></div><p>Hi team — I’m having an issue with our account after the latest update. Could you help us get back up and running? This is blocking our team's work.</p></div><div className="message agent-message"><div className="message-author"><Avatar initials="MC" tone="blue" small /><b>Maya Chen · Agent</b><time>Just now</time></div><p>Thanks for flagging this. I’m looking into the issue now and will follow up with a clear next step shortly.</p></div>{sent && <div className="message agent-message"><div className="message-author"><Avatar initials="MC" tone="blue" small /><b>Maya Chen · Agent</b><time>Just now</time></div><p>Your reply has been added to this local preview.</p></div>}</div><div className="drawer-controls"><label>Assigned to<select defaultValue={selected.assignee}><option>Maya Chen</option><option>Jordan Okafor</option><option>Avery Kim</option></select></label><button onClick={() => changeStatus(selected.status === 'Resolved' ? 'Open' : 'Resolved')}>{selected.status === 'Resolved' ? 'Reopen ticket' : 'Mark resolved'} <Check size={12} /></button></div><form className="reply-form" onSubmit={sendReply}><div className="reply-tools"><span>Reply</span><button type="button" onClick={() => setReply((text) => `${text}Hi ${selected.customer.split(' ')[0]}, `)}>Insert greeting</button></div><textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply..." rows="3" /><div><small>Replies are saved in this preview.</small><button className="primary-button" type="submit"><Send size={12} /> Send</button></div></form></> : <div className="empty-state">Select a ticket to read the conversation.</div>}</aside></div></>
}

function ClientsPage() {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get('name') || '')
  const [toast, setToast] = useState('')
  const filtered = clients.filter((client) => client.join(' ').toLowerCase().includes(query.toLowerCase()))
  return <><PageTitle eyebrow="RELATIONSHIPS" title="Clients" description="Manage customer accounts, contacts, and active engagement value." actions={<Button variant="primary" onClick={() => setToast('New client form is ready in this preview.')}><Plus size={12} /> Add client</Button>} /><div className="list-toolbar"><label className="search-control"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients..." /></label><Button onClick={() => setToast('Client list filtered by active status.')}>Status: All <ChevronDown size={11} /></Button><Button onClick={() => setToast('Client CSV exported.')}>↓ Export</Button></div><section className="table-panel"><div className="table-scroll"><table><thead><tr><th>CLIENT</th><th>WEBSITE</th><th>INDUSTRY</th><th>OPEN VALUE</th><th>OWNER</th><th>STATUS</th><th /></tr></thead><tbody>{filtered.map((client) => <tr key={client[0]}><td><span className="customer-name"><Avatar initials={client[5]} tone={client[6]} small /><b>{client[0]}</b></span></td><td>{client[1]}</td><td>{client[2]}</td><td>{client[3]}</td><td>{client[5] === 'MC' ? 'Maya Chen' : client[5] === 'AK' ? 'Avery Kim' : 'Daniel Reyes'}</td><td><span className="ticket-status status-open">{client[4]}</span></td><td><a className="text-link" href={`/pipeline?client=${encodeURIComponent(client[0])}`}>Deals <ArrowRight size={11} /></a></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">No clients found.</div>}</div></section>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function ProposalsPage() {
  const proposals = [['PROP-108','Enterprise Onboarding','Zenith Group','$48,500','Sent','Oct 30'],['PROP-106','Brand Audit + SEO','Northwind Labs','$8,400','Draft','Oct 29'],['PROP-104','Ops Automation','Helio Systems','$21,000','Viewed','Oct 28'],['PROP-101','CX Training Program','Brightline Care','$12,000','Accepted','Oct 25']]
  const [toast, setToast] = useState('')
  return <><PageTitle eyebrow="SALES ENABLEMENT" title="Proposals" description="Create, share, and track client proposals from draft to acceptance." actions={<Button variant="primary" onClick={() => setToast('A new proposal draft has been created.')}><Plus size={12} /> Create proposal</Button>} /><div className="metrics-grid"><Metric label="Proposal value" value="$89,900" note="4 proposals this month" Icon={FileText} /><Metric label="Awaiting response" value="2" note="Average decision: 4 days" Icon={Clock3} tone="amber" /><Metric label="Win rate" value="68%" note="+8% this quarter" Icon={Target} tone="green" /></div><section className="table-panel"><div className="panel-heading"><h2>Recent proposals</h2><a className="text-link" href="/pipeline">View deals <ArrowRight size={11} /></a></div><div className="table-scroll"><table><thead><tr><th>PROPOSAL</th><th>PROJECT</th><th>CLIENT</th><th>VALUE</th><th>STATUS</th><th>UPDATED</th><th /></tr></thead><tbody>{proposals.map((proposal) => <tr key={proposal[0]}><td><a className="text-link" href={`/checkout?proposal=${proposal[0]}`}>{proposal[0]}</a></td><td>{proposal[1]}</td><td>{proposal[2]}</td><td>{proposal[3]}</td><td><span className={`ticket-status status-${proposal[4].toLowerCase()}`}>{proposal[4]}</span></td><td>{proposal[5]}</td><td><Button onClick={() => setToast(`${proposal[0]} details opened.`)}>Open</Button></td></tr>)}</tbody></table></div></section>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function ReportsPage() {
  return <><PageTitle eyebrow="BUSINESS INTELLIGENCE" title="Reports" description="A clear view of pipeline health, bookings, and customer experience." actions={<Button onClick={() => window.print()}><ArrowDownToLine size={12} /> Export report</Button>} /><div className="metrics-grid"><Metric label="Revenue won" value="$128,400" note="+16.8% vs last month" Icon={Target} tone="green" /><Metric label="Pipeline coverage" value="3.8×" note="Healthy target: 3×" Icon={Activity} /><Metric label="Consultations" value="86" note="72% attendance rate" Icon={CalendarDays} tone="amber" /><Metric label="Customer satisfaction" value="94%" note="126 survey responses" Icon={Sparkles} tone="pink" /></div><div className="report-grid"><section className="report-card"><div className="panel-heading"><div><span className="eyebrow">LAST 6 MONTHS</span><h2>Revenue performance</h2></div><span className="positive">↗ 16.8%</span></div><div className="bar-chart">{[48,62,54,76,68,88,79,100,83,91,73,97].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><small>{['Jun','Jul','Aug','Sep','Oct','Nov'][Math.floor(index / 2)]}</small></div>)}</div></section><section className="report-card"><div className="panel-heading"><div><span className="eyebrow">DEAL STAGES</span><h2>Pipeline breakdown</h2></div><a className="text-link" href="/pipeline">Open pipeline</a></div>{stages.map((stage, index) => <div className="report-stage" key={stage}><span><i className={`stage-dot stage-dot-${index}`} />{stage}</span><b>{[12,7,4,9][index]} deals</b><strong>{['$42,800','$38,200','$56,500','$128,400'][index]}</strong></div>)}</section></div></>
}

function AutomationsPage() {
  const [automations, setAutomations] = useState([['New lead follow-up','Send a welcome email when a new lead enters Prospecting.','Active','blue'],['Booking reminders','Remind clients 24 hours before a confirmed booking.','Active','green'],['Urgent ticket alerts','Notify the on-call agent when priority is Urgent.','Paused','amber'],['Proposal follow-up','Create a task if a proposal is unopened for 3 days.','Active','purple']])
  const [toast, setToast] = useState('')
  function toggleAutomation(name) { setAutomations((items) => items.map((item) => item[0] === name ? [item[0],item[1],item[2] === 'Active' ? 'Paused' : 'Active',item[3]] : item)) }
  return <><PageTitle eyebrow="WORKFLOW STUDIO" title="Automations" description="Keep repeatable work moving with lightweight team workflows." actions={<Button variant="primary" onClick={() => { setAutomations((items) => [['New automation','Configure a trigger and an action for your workflow.','Paused','blue'],...items]); setToast('Automation draft created.') }}><Plus size={12} /> New automation</Button>} /><div className="metrics-grid"><Metric label="Active automations" value={automations.filter((item) => item[2] === 'Active').length} note="Across all teams" Icon={Zap} tone="green" /><Metric label="Tasks automated" value="1,284" note="This month" Icon={Activity} /><Metric label="Time saved" value="36h" note="Estimated this month" Icon={Clock3} tone="purple" /></div><div className="automation-list">{automations.map(([name, description, status, color]) => <article className="automation-card" key={name}><span className={`automation-icon ${color}`}><Zap size={15} /></span><div><h2>{name}</h2><p>{description}</p><small>Updated recently · Created by Maya Chen</small></div><span className={`ticket-status status-${status.toLowerCase()}`}>{status}</span><button className={`switch ${status === 'Active' ? 'on' : ''}`} role="switch" aria-checked={status === 'Active'} aria-label={`${status === 'Active' ? 'Pause' : 'Activate'} ${name}`} onClick={() => toggleAutomation(name)}><i /></button><button className="icon-btn" aria-label={`Edit ${name}`} onClick={() => setToast(`Editing ${name} in the workflow preview.`)}><MoreHorizontal size={14} /></button></article>)}</div>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [notify, setNotify] = useState(true)
  return <><PageTitle eyebrow="WORKSPACE ADMIN" title="Settings" description="Manage workspace details, notifications, and team access." /><div className="settings-grid"><section className="settings-card"><h2>Workspace profile</h2><p>These details are shown across your NexusOps workspace.</p><label>Workspace name<input defaultValue="NexusOps Service Cloud" /></label><label>Support email<input type="email" defaultValue="support@nexusops.example" /></label><label>Timezone<select defaultValue="Africa/Lagos"><option>Africa/Lagos</option><option>Europe/London</option><option>America/New_York</option></select></label></section><section className="settings-card"><h2>Notifications</h2><p>Choose which updates reach your operations team.</p><div className="settings-toggle"><span><b>Urgent support tickets</b><small>Alert the on-call team immediately</small></span><button className={`switch ${notify ? 'on' : ''}`} role="switch" aria-checked={notify} aria-label="Urgent support notifications" onClick={() => setNotify(!notify)}><i /></button></div><div className="settings-toggle"><span><b>Booking reminders</b><small>Send reminders before appointments</small></span><button className="switch on" role="switch" aria-checked="true" aria-label="Booking reminders"><i /></button></div><a className="text-link" href="/support">Manage support queue <ArrowRight size={11} /></a></section><div className="settings-save"><span>{saved ? 'Settings saved in this preview.' : 'Changes are saved to this local preview only.'}</span><Button variant="primary" onClick={() => setSaved(true)}>{saved ? <><Check size={12} /> Saved</> : 'Save settings'}</Button></div></div></>
}

function CheckoutPage() {
  const [submitted, setSubmitted] = useState(false)
  const [method, setMethod] = useState('Card')
  return <><a href="/proposals" className="back-link"><ArrowLeft size={12} /> Back to proposals</a><PageTitle eyebrow="NEXUSOPS PAYMENTS" title="Secure checkout" description="Review the proposal payment details and choose a payment method." /><div className="checkout-layout"><form className="checkout-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}><div className="checkout-order"><span><small>PROPOSAL · PROP-108</small><b>Enterprise Onboarding</b><small>Zenith Group · Due today</small></span><strong>$48,500.00</strong></div><label>Billing contact<input type="email" placeholder="billing@company.com" required /></label><fieldset><legend>Payment method</legend>{['Card','Bank transfer'].map((item) => <button type="button" className={method === item ? 'selected' : ''} key={item} onClick={() => setMethod(item)}><CreditCard size={13} />{item}{method === item && <Check size={13} />}</button>)}</fieldset>{submitted ? <div className="checkout-success"><Check size={14} /> Checkout preview complete. No payment was processed.</div> : <button className="primary-button full-width" type="submit"><CreditCard size={13} /> Continue to payment</button>}<small className="demo-note">Demo checkout only. No card details are collected. Connect a payment provider to process real transactions.</small></form><aside className="checkout-summary"><span className="eyebrow">ORDER SUMMARY</span><h2>Enterprise Onboarding</h2><p>Implementation package · Zenith Group</p><div><span>Subtotal</span><b>$48,500.00</b></div><div><span>Tax</span><b>Calculated at payment</b></div><div className="summary-total"><span>Total due</span><b>$48,500.00</b></div><small><Check size={12} /> Secure checkout preview</small></aside></div></>
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/overview'
  const [mobileOpen, setMobileOpen] = useState(false)
  const pages = {
    '/': <OverviewPage />,
    '/overview': <OverviewPage />,
    '/pipeline': <PipelinePage />,
    '/pipeline/new': <PipelinePage />,
    '/bookings': <BookingsPage />,
    '/support': <SupportPage />,
    '/clients': <ClientsPage />,
    '/proposals': <ProposalsPage />,
    '/reports': <ReportsPage />,
    '/automations': <AutomationsPage />,
    '/settings': <SettingsPage />,
    '/checkout': <CheckoutPage />,
  }
  const pageTitles = {
    '/overview': 'Overview', '/pipeline': 'Pipeline', '/pipeline/new': 'Pipeline',
    '/bookings': 'Bookings', '/support': 'Support Desk', '/clients': 'Clients',
    '/proposals': 'Proposals', '/reports': 'Reports', '/automations': 'Automations',
    '/settings': 'Settings', '/checkout': 'Checkout',
  }
  return <div className="dashboard-app"><Sidebar path={path} open={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="main-shell"><Header onMenu={() => setMobileOpen(true)} /><main className="content"><div className="breadcrumbs"><a href="/overview">NexusOps</a><ChevronRight size={11} /><span>Operations</span><ChevronRight size={11} /><b>{pageTitles[path] || 'Not found'}</b></div>{pages[path] || <div className="not-found"><span className="eyebrow">404 · NOT FOUND</span><h1>This page isn't in your workspace.</h1><a className="primary-button" href="/overview">Back to overview <ArrowRight size={12} /></a></div>}</main><footer className="app-footer"><span>NexusOps Service Cloud · Pipeline, bookings & tickets sync automatically</span><div><a href="/settings">Privacy & settings</a><a href="/support">Help center</a></div></footer></div></div>
}

export default App
