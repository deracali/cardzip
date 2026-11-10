import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  CreditCard,
  Download,
  FileText,
  Globe,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Users', path: '/users', icon: Users, badge: '12' },
  { label: 'Billing', path: '/billing', icon: CreditCard },
  { label: 'System Logs', path: '/system-logs', icon: Server, live: true },
  { label: 'Settings', path: '/settings', icon: Settings },
]

const initialUsers = [
  { id: 1, name: 'Sarah Chen', email: 'sarah@loomly.io', role: 'Admin', plan: 'Enterprise', joined: 'Jan 12, 2026', active: '2 min ago', status: 'Active' },
  { id: 2, name: 'Marcus Webb', email: 'marcus@acme.co', role: 'User', plan: 'Pro', joined: 'Feb 03, 2026', active: '18 min ago', status: 'Active' },
  { id: 3, name: 'Elena Rodriguez', email: 'elena@startup.io', role: 'User', plan: 'Starter', joined: 'Feb 21, 2026', active: '1 hr ago', status: 'Active' },
  { id: 4, name: 'David Kim', email: 'david@techflow.dev', role: 'Admin', plan: 'Pro', joined: 'Mar 05, 2026', active: '3 hrs ago', status: 'Suspended' },
  { id: 5, name: 'Priya Nair', email: 'priya@scaleup.com', role: 'User', plan: 'Enterprise', joined: 'Mar 18, 2026', active: 'Yesterday', status: 'Active' },
  { id: 6, name: 'Tom Becker', email: 'tom@beckerlabs.de', role: 'User', plan: 'Starter', joined: 'Apr 02, 2026', active: '2 days ago', status: 'Invited' },
  { id: 7, name: 'Aisha Bello', email: 'aisha@fintech.ng', role: 'User', plan: 'Pro', joined: 'Apr 20, 2026', active: '5 min ago', status: 'Active' },
  { id: 8, name: 'Jonas Lind', email: 'jonas@nordic.se', role: 'User', plan: 'Starter', joined: 'May 01, 2026', active: '4 days ago', status: 'Suspended' },
  { id: 9, name: 'Maya Patel', email: 'maya@brightwork.io', role: 'User', plan: 'Pro', joined: 'May 06, 2026', active: '35 min ago', status: 'Active' },
  { id: 10, name: 'Noah Williams', email: 'noah@northstar.app', role: 'User', plan: 'Enterprise', joined: 'May 12, 2026', active: '1 hr ago', status: 'Active' },
]

const activityItems = [
  { icon: UserPlus, tone: 'green', title: 'New signup — sarah@loomly.io', detail: 'Just now · Free trial', time: 'now' },
  { icon: TrendingUp, tone: 'purple', title: 'Upgrade — Acme Inc → Enterprise', detail: '12 min ago · $1,200 MRR', time: '12m' },
  { icon: FileText, tone: 'blue', title: 'Invoice #1092 paid — $99.00', detail: '14 min ago · Stripe', time: '14m' },
  { icon: Shield, tone: 'amber', title: 'Failed login — 3 attempts blocked', detail: '31 min ago · Berlin, DE', time: '31m' },
  { icon: Users, tone: 'red', title: 'Churn alert — trial expired', detail: '1 hr ago · Starter plan', time: '1h' },
]

const logItems = [
  { time: '10:42:18', event: 'User signed in', actor: 'sarah@loomly.io', source: 'Berlin, DE', level: 'Info' },
  { time: '10:39:05', event: 'Plan upgraded to Enterprise', actor: 'marcus@acme.co', source: 'New York, US', level: 'Info' },
  { time: '10:31:42', event: 'Failed login attempt (3)', actor: 'unknown', source: 'Berlin, DE', level: 'Warning' },
  { time: '10:20:11', event: 'API key created', actor: 'alex@acme.co', source: 'San Francisco, US', level: 'Info' },
  { time: '09:58:37', event: 'Invoice payment failed', actor: 'tom@beckerlabs.de', source: 'Hamburg, DE', level: 'Error' },
  { time: '09:42:06', event: 'User invited to workspace', actor: 'alex@acme.co', source: 'San Francisco, US', level: 'Info' },
  { time: '09:31:52', event: 'Two-factor authentication enabled', actor: 'priya@scaleup.com', source: 'Mumbai, IN', level: 'Info' },
  { time: '09:14:29', event: 'Password reset requested', actor: 'elena@startup.io', source: 'Austin, US', level: 'Warning' },
]

function AppLink({ to, onNavigate, children, className = '', ...props }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        onNavigate(to)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

function Brand({ onNavigate }) {
  return (
    <AppLink to="/dashboard" onNavigate={onNavigate} className="brand-lockup" aria-label="Saasapp dashboard">
      <span className="brand-icon">S</span>
      <span className="brand-copy"><strong>Saasapp</strong><small>Admin Console</small></span>
    </AppLink>
  )
}

function PageHeading({ title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </div>
  )
}

function MetricCard({ title, value, change, icon: Icon, tone = 'purple', down = false }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <button className="icon-button metric-menu" aria-label={`More ${title} options`} type="button"><MoreHorizontal size={17} /></button>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-bottom">
        <span className={`metric-change ${down ? 'negative' : ''}`}>{down ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{change}</span>
        <span>vs last month</span>
        <span className={`metric-icon ${tone}`}><Icon size={16} /></span>
      </div>
      <div className={`sparkline ${tone}`} aria-hidden="true"><span /></div>
    </article>
  )
}

function RevenueChart({ large = false }) {
  const [period, setPeriod] = useState('30D')
  const periods = ['7D', '30D', '1Y']
  return (
    <section className={`panel chart-panel ${large ? 'chart-panel-large' : ''}`}>
      <div className="panel-heading">
        <div><h2>Revenue vs Expansions</h2><p>Monthly recurring revenue performance</p></div>
        <div className="segmented-control" aria-label="Chart period">
          {periods.map((item) => <button key={item} type="button" className={period === item ? 'selected' : ''} onClick={() => setPeriod(item)}>{item}</button>)}
        </div>
      </div>
      <div className="chart-legend"><span><i className="legend-dot purple-dot" />Revenue</span><span><i className="legend-dot green-dot" />Expansions</span></div>
      <div className="chart-plot">
        <svg viewBox="0 0 760 250" preserveAspectRatio="none" role="img" aria-label={`Revenue and expansions over ${period}`}>
          <defs>
            <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".22" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity=".02" /></linearGradient>
          </defs>
          {[40, 90, 140, 190, 235].map((y) => <line key={y} x1="0" x2="760" y1={y} y2={y} className="chart-gridline" />)}
          <path d="M0 197 C42 187 57 170 94 160 S149 168 190 151 S250 116 296 125 S355 101 393 99 S458 118 504 91 S564 78 601 70 S657 81 694 60 S737 46 760 40 L760 250 L0 250Z" fill="url(#revenue-fill)" />
          <path d="M0 197 C42 187 57 170 94 160 S149 168 190 151 S250 116 296 125 S355 101 393 99 S458 118 504 91 S564 78 601 70 S657 81 694 60 S737 46 760 40" className="revenue-line" />
          <path d="M0 210 C60 201 78 190 126 186 S192 180 234 169 S305 167 352 156 S432 151 469 139 S542 130 584 116 S659 107 704 93 S744 88 760 82" className="expansion-line" />
          <circle cx="601" cy="70" r="6" className="chart-point" />
        </svg>
        <div className="chart-axis"><span>Mar 1</span><span>Mar 8</span><span>Mar 15</span><span>Mar 22</span><span>Mar 30</span></div>
      </div>
    </section>
  )
}

function ActivityFeed({ onViewAll }) {
  return (
    <section className="panel activity-panel">
      <div className="panel-heading"><div><h2>Activity feed</h2><p>Latest workspace events</p></div><span className="live-indicator"><i /> Live</span></div>
      <div className="activity-list">
        {activityItems.map(({ icon: Icon, tone, title, detail, time }) => (
          <div className="activity-item" key={title}>
            <span className={`activity-icon ${tone}`}><Icon size={15} /></span>
            <div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div>
            <span className="activity-time">{time}</span>
          </div>
        ))}
      </div>
      <button className="button button-outline button-wide" type="button" onClick={onViewAll}>View all activity <ArrowRight size={14} /></button>
    </section>
  )
}

function AcquisitionPanel() {
  const channels = [
    { name: 'Organic search', count: '4,820', width: '83%', color: 'purple' },
    { name: 'Referral', count: '2,940', width: '61%', color: 'green' },
    { name: 'Paid ads', count: '1,870', width: '39%', color: 'blue' },
    { name: 'Social', count: '1,205', width: '25%', color: 'muted' },
  ]
  return (
    <section className="panel acquisition-panel">
      <div className="panel-heading"><div><h2>Acquisition channels</h2><p>Last 30 days</p></div><span className="subtle-label">10,835 visitors</span></div>
      <div className="channel-list">{channels.map((channel) => (
        <div className="channel-row" key={channel.name}>
          <div><strong>{channel.name}</strong><span>{channel.count}</span></div>
          <div className="progress-track"><span className={channel.color} style={{ width: channel.width }} /></div>
        </div>
      ))}</div>
    </section>
  )
}

function PlanBreakdown() {
  return (
    <section className="panel plan-panel">
      <div className="panel-heading"><div><h2>Plan tier breakdown</h2><p>1,250 total workspaces</p></div></div>
      <div className="plan-content">
        <div className="donut-chart"><div><strong>62%</strong><span>Pro</span></div></div>
        <div className="plan-legend">
          <span><i className="legend-dot purple-dot" />Pro <b>650</b></span>
          <span><i className="legend-dot green-dot" />Starter <b>325</b></span>
          <span><i className="legend-dot blue-dot" />Enterprise <b>275</b></span>
        </div>
      </div>
    </section>
  )
}

function DashboardPage({ navigate }) {
  return (
    <>
      <PageHeading title="Dashboard" description="Welcome back, track workspace performance at a glance." />
      <div className="metric-grid">
        <MetricCard title="Total Revenue" value="$128.4k" change="+16%" icon={CreditCard} />
        <MetricCard title="Active Users" value="12,450" change="+8%" icon={Users} tone="green" />
        <MetricCard title="Churn Rate" value="1.2%" change="-0.4%" icon={Activity} tone="blue" down />
        <MetricCard title="MRR Growth" value="$14.2k" change="+6.2%" icon={TrendingUp} />
      </div>
      <div className="dashboard-main-grid"><RevenueChart /><ActivityFeed onViewAll={() => navigate('/activity')} /></div>
      <div className="dashboard-bottom-grid">
        <AcquisitionPanel />
        <PlanBreakdown />
        <section className="forecast-card">
          <Sparkles size={20} />
          <span className="forecast-kicker">GROWTH FORECAST</span>
          <h2>Forecast: +18% revenue next quarter</h2>
          <p>Based on expansion velocity and retention.</p>
          <button type="button" className="button button-dark button-wide" onClick={() => navigate('/analytics')}>View forecast report <ArrowRight size={14} /></button>
        </section>
      </div>
    </>
  )
}

function AnalyticsPage({ navigate }) {
  return (
    <>
      <PageHeading title="Analytics" description="Explore growth, retention, and workspace usage." />
      <div className="metric-grid">
        <MetricCard title="Monthly recurring revenue" value="$128.4k" change="+16%" icon={CreditCard} />
        <MetricCard title="Customer lifetime value" value="$2,840" change="+11%" icon={TrendingUp} tone="green" />
        <MetricCard title="Average churn" value="1.2%" change="-0.4%" icon={Activity} tone="blue" down />
        <MetricCard title="Conversion rate" value="8.6%" change="+1.8%" icon={ArrowUpRight} />
      </div>
      <div className="analytics-layout"><RevenueChart large /><div className="panel insight-panel"><div className="panel-heading"><div><h2>Growth insights</h2><p>Highlights from this month</p></div><Sparkles size={17} className="purple-text" /></div>
        <div className="insight-item"><span className="insight-icon green"><TrendingUp size={16} /></span><div><strong>Expansion revenue is up 18%</strong><p>Pro plan upgrades led the increase this month.</p></div></div>
        <div className="insight-item"><span className="insight-icon purple"><Users size={16} /></span><div><strong>Organic signups lead acquisition</strong><p>Search brought in 42% of new workspaces.</p></div></div>
        <div className="insight-item"><span className="insight-icon amber"><Clock3 size={16} /></span><div><strong>Trial conversion peaks on day 8</strong><p>Consider a product nudge for new trials.</p></div></div>
        <button type="button" className="button button-outline button-wide" onClick={() => navigate('/users')}>Explore user activity <ArrowRight size={14} /></button>
      </div></div>
      <div className="panel analytics-summary"><div className="panel-heading"><div><h2>Workspace performance</h2><p>Key operating metrics for the last 30 days</p></div><span className="positive-note"><ArrowUpRight size={14} /> 12.8% overall growth</span></div>
        <div className="summary-stats"><div><span>New workspaces</span><strong>1,284</strong><small>+14.2% vs previous period</small></div><div><span>Paid conversions</span><strong>386</strong><small>+8.6% vs previous period</small></div><div><span>Avg. session time</span><strong>8m 42s</strong><small>+3.1% vs previous period</small></div><div><span>Retention rate</span><strong>94.8%</strong><small>+1.4% vs previous period</small></div></div>
      </div>
    </>
  )
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
        <div className="modal-heading"><h2 id="modal-heading">{title}</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
        {children}
      </section>
    </div>
  )
}

function UsersPage({ notify }) {
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('All roles')
  const [status, setStatus] = useState('All statuses')
  const [selected, setSelected] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesText = `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())
    return matchesText && (role === 'All roles' || user.role === role) && (status === 'All statuses' || user.status === status)
  }), [users, query, role, status])
  const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const toggleAll = () => setSelected(selected.length === filteredUsers.length ? [] : filteredUsers.map((user) => user.id))
  const changeSelectedStatus = () => {
    if (!selected.length) return
    setUsers((current) => current.map((user) => selected.includes(user.id) ? { ...user, status: user.status === 'Suspended' ? 'Active' : 'Suspended' } : user))
    setSelected([])
    notify('Selected user access has been updated.')
  }
  const deleteSelected = () => {
    setUsers((current) => current.filter((user) => !selected.includes(user.id)))
    setSelected([])
    notify('Selected users have been removed from this demo workspace.')
  }
  const exportUsers = () => {
    const rows = [['Name', 'Email', 'Role', 'Plan', 'Status'], ...filteredUsers.map((user) => [user.name, user.email, user.role, user.plan, user.status])]
    const csv = rows.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'saasapp-users.csv'
    link.click()
    URL.revokeObjectURL(url)
    notify('User list exported as CSV.')
  }
  const addUser = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name')).trim()
    const email = String(formData.get('email')).trim()
    setUsers((current) => [{ id: Date.now(), name, email, role: String(formData.get('role')), plan: 'Starter', joined: 'Today', active: 'Never', status: 'Invited' }, ...current])
    setShowAdd(false)
    notify(`${name} has been invited to your workspace.`)
  }
  return (
    <>
      <PageHeading title="User Management" description="Manage workspace access, plans, and roles for your users.">
        <button type="button" className="button button-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add New User</button>
      </PageHeading>
      <section className="panel users-panel">
        <div className="user-toolbar">
          <label className="search-field user-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users, emails..." aria-label="Search users" /></label>
          <select className="select-control" value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter by role"><option>All roles</option><option>Admin</option><option>User</option></select>
          <select className="select-control" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All statuses</option><option>Active</option><option>Suspended</option><option>Invited</option></select>
          <span className="column-control"><span className="column-symbol">▥</span> Columns</span>
          <div className="toolbar-spacer" />
          <button className="button button-outline" type="button" onClick={exportUsers}><Download size={14} /> Export CSV</button>
        </div>
        {selected.length > 0 && <div className="selection-bar"><span>{selected.length} selected</span><button type="button" onClick={changeSelectedStatus}>Suspend / restore</button><button type="button" className="danger-text" onClick={deleteSelected}>Remove</button></div>}
        <div className="table-scroll">
          <table className="data-table users-table">
            <thead><tr><th><input type="checkbox" checked={filteredUsers.length > 0 && selected.length === filteredUsers.length} onChange={toggleAll} aria-label="Select all users" /></th><th>User</th><th>Email</th><th>Role</th><th>Plan</th><th>Joined</th><th>Last active</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>{filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td><input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleSelected(user.id)} aria-label={`Select ${user.name}`} /></td>
                <td><div className="user-name"><span className={`avatar avatar-${index % 5}`}>{user.name.split(' ').map((part) => part[0]).join('')}</span><strong>{user.name}</strong></div></td>
                <td className="muted-cell">{user.email}</td><td><span className={`role-pill ${user.role === 'Admin' ? 'admin' : ''}`}>{user.role}</span></td>
                <td>{user.plan}</td><td className="muted-cell">{user.joined}</td><td className="muted-cell">{user.active}</td>
                <td><span className={`status-pill ${user.status.toLowerCase()}`}><i />{user.status}</span></td>
                <td><button className="icon-button row-action" aria-label={`More actions for ${user.name}`} type="button" onClick={() => notify(`${user.name} · ${user.role} · ${user.plan}`)}><MoreHorizontal size={17} /></button></td>
              </tr>
            ))}</tbody>
          </table>
          {filteredUsers.length === 0 && <div className="empty-state"><Users size={24} /><strong>No users found</strong><span>Try adjusting your search or filters.</span></div>}
        </div>
        <div className="table-footer"><span>Showing {filteredUsers.length ? 1 : 0}–{filteredUsers.length} of {users.length} users</span><div className="pagination"><span>10 / page</span><button type="button" disabled aria-label="Previous page"><ChevronLeft size={15} /> Previous</button><button className="current-page" type="button" aria-current="page">1</button><button type="button" disabled aria-label="Next page">Next <ChevronRight size={15} /></button></div></div>
      </section>
      {showAdd && <Modal title="Invite a team member" onClose={() => setShowAdd(false)}><form className="form-stack" onSubmit={addUser}><label>Full name<input name="name" placeholder="e.g. Alex Morgan" required /></label><label>Work email<input name="email" type="email" placeholder="alex@company.com" required /></label><label>Workspace role<select name="role"><option>User</option><option>Admin</option></select></label><p className="form-hint">They will be added with invited access and a Starter plan.</p><button className="button button-primary button-wide" type="submit"><Mail size={15} /> Send invitation</button></form></Modal>}
    </>
  )
}

function InvoiceRow({ number, date, amount, status }) {
  return <div className="invoice-row"><span className="invoice-file"><FileText size={17} /></span><strong>Invoice #{number}</strong><span className="muted-cell">{date}</span><span className={`invoice-status ${status.toLowerCase()}`}>{status}</span><b>{amount}</b><button type="button" className="text-button download-link" onClick={() => window.print()} aria-label={`Download invoice ${number}`}><Download size={14} /> PDF</button></div>
}

function BillingPage({ navigate, notify }) {
  const [twoFactor, setTwoFactor] = useState(true)
  const [apiKey, setApiKey] = useState('sk-live-••••-9f2a')
  const [showCard, setShowCard] = useState(false)
  const createKey = () => {
    const generated = `sk-live-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`
    setApiKey(generated)
    notify('A new demo API key has been generated.')
  }
  return (
    <>
      <PageHeading title="Billing & Invoices" description="Manage your subscription, payment method, and billing history." />
      <div className="billing-layout">
        <div className="billing-primary">
          <section className="panel current-plan">
            <div className="plan-heading-row"><div><span className="eyebrow-pill">CURRENT PLAN</span><h2>Pro Plan — $99<span>/mo</span></h2><p>Renews on June 1, 2026 · Billed monthly via Visa •••• 4242</p></div><div className="plan-actions"><button className="button button-outline" type="button" onClick={() => notify('Your Pro plan will remain active until the end of the billing period.')}>Cancel</button><button className="button button-primary" type="button" onClick={() => navigate('/checkout')}>Upgrade Plan <ArrowRight size={14} /></button></div></div>
            <div className="usage-label"><span>Seat usage — 8 of 10 seats used</span><span>80%</span></div><div className="progress-track usage-track"><span className="purple" style={{ width: '80%' }} /></div>
            <p className="usage-note"><Users size={14} /> Invite 2 more teammates before hitting your limit. <button type="button" onClick={() => navigate('/users')}>Invite members</button></p>
          </section>
          <section className="panel invoices-panel"><div className="panel-heading"><div><h2>Invoice history</h2><p>Your recent payments</p></div><button type="button" className="text-button download-link" onClick={() => window.print()}>Download all <Download size={14} /></button></div>
            <div className="invoice-list"><InvoiceRow number="1092" date="May 1, 2026" amount="$99.00" status="Paid" /><InvoiceRow number="1084" date="Apr 1, 2026" amount="$99.00" status="Paid" /><InvoiceRow number="1071" date="Mar 1, 2026" amount="$79.00" status="Paid" /><InvoiceRow number="1059" date="Feb 1, 2026" amount="$79.00" status="Failed" /></div>
          </section>
          <section className="panel payment-method-panel"><div className="panel-heading"><div><h2>Payment method</h2><p>Your default payment method</p></div></div>
            {showCard ? <form className="card-update-form" onSubmit={(event) => { event.preventDefault(); setShowCard(false); notify('Your demo payment method has been updated.') }}><label>Card number<input inputMode="numeric" placeholder="4242 4242 4242 4242" required minLength={12} /></label><label>Expiry<input placeholder="MM / YY" required /></label><label>CVC<input inputMode="numeric" placeholder="123" required minLength={3} /></label><button className="button button-primary" type="submit">Save payment method</button><button className="button button-outline" type="button" onClick={() => setShowCard(false)}>Cancel</button></form> : <div className="saved-card"><span className="visa-mark">VISA</span><span><strong>•••• •••• •••• 4242</strong><small>Expires 08/28 · Alex Morgan</small></span><button className="button button-outline" type="button" onClick={() => setShowCard(true)}>Update Card</button></div>}
          </section>
        </div>
        <aside className="billing-aside">
          <section className="panel security-panel"><div className="panel-heading"><div><h2>Two-factor auth</h2><p>Authenticator app · Enabled 2 days ago</p></div><label className="switch"><input type="checkbox" checked={twoFactor} onChange={(event) => setTwoFactor(event.target.checked)} aria-label="Toggle two-factor authentication" /><span /></label></div>
            <strong className="aside-label">Active sessions</strong><div className="session-row"><span>▣ &nbsp; MacBook Pro — Berlin</span><small>Current session</small></div><div className="session-row"><span>▣ &nbsp; iPhone 15 — Berlin</span><small>2 hrs ago</small></div><div className="session-row"><span>▣ &nbsp; Chrome — Remote</span><button type="button" onClick={() => notify('Remote session revoked.')}>Revoke</button></div>
          </section>
          <section className="panel api-panel"><div className="panel-heading"><div><h2><KeyRound size={15} /> API keys</h2><p>Generate scoped keys for your integrations.</p></div></div><div className="key-field"><code>{apiKey}</code><button type="button" aria-label="Copy API key" onClick={async () => { try { await navigator.clipboard.writeText(apiKey); notify('API key copied.') } catch { notify('Clipboard access is unavailable in this browser.') } }}><Copy size={13} /> Copy</button></div><button className="button button-primary button-wide" type="button" onClick={createKey}>Generate New Key</button></section>
          <section className="plan-help"><CircleHelp size={16} /><span>Questions about billing?</span><button type="button" onClick={() => notify('Contact support at support@saasapp.example.')}>Contact support</button></section>
        </aside>
      </div>
    </>
  )
}

function LogsPage() {
  const [level, setLevel] = useState('All events')
  const [query, setQuery] = useState('')
  const visibleLogs = logItems.filter((item) => (level === 'All events' || item.level === level) && `${item.event} ${item.actor} ${item.source}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <PageHeading title="System Logs" description="Monitor access, billing, and security events across your workspace." />
      <div className="log-metrics"><div className="panel log-stat"><span>Events today</span><strong>2,481</strong><small className="positive-note"><ArrowUpRight size={13} /> 12% from yesterday</small></div><div className="panel log-stat"><span>Security alerts</span><strong>3</strong><small className="warning-note">2 resolved · 1 monitoring</small></div><div className="panel log-stat"><span>System uptime</span><strong>99.98%</strong><small className="positive-note"><CheckCircle2 size={13} /> All systems operational</small></div></div>
      <section className="panel logs-panel"><div className="panel-heading"><div><h2>Event log</h2><p>Most recent workspace activity</p></div><button className="button button-outline" type="button" onClick={() => window.print()}><Download size={14} /> Export logs</button></div>
        <div className="log-filters"><label className="search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events..." aria-label="Search log events" /></label><select className="select-control" value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Filter log severity"><option>All events</option><option>Info</option><option>Warning</option><option>Error</option></select><button className="button button-outline" type="button" onClick={() => { setLevel('All events'); setQuery('') }}>Clear filters</button></div>
        <div className="table-scroll"><table className="data-table logs-table"><thead><tr><th>Time</th><th>Event</th><th>Actor</th><th>Location</th><th>Severity</th></tr></thead><tbody>{visibleLogs.map((item) => <tr key={`${item.time}-${item.event}`}><td className="muted-cell">{item.time}</td><td><strong>{item.event}</strong></td><td>{item.actor}</td><td className="muted-cell"><Globe size={13} /> {item.source}</td><td><span className={`log-level ${item.level.toLowerCase()}`}>{item.level}</span></td></tr>)}</tbody></table>{visibleLogs.length === 0 && <div className="empty-state">No events match these filters.</div>}</div>
        <div className="table-footer"><span>Showing {visibleLogs.length} recent events</span><div className="pagination"><button type="button" disabled><ChevronLeft size={15} /> Previous</button><button className="current-page" type="button">1</button><button type="button" disabled>Next <ChevronRight size={15} /></button></div></div>
      </section>
    </>
  )
}

function SettingsPage({ notify, navigate }) {
  const [tab, setTab] = useState('General')
  const [twoFactor, setTwoFactor] = useState(true)
  const tabs = ['General', 'Team Members', 'Security & 2FA', 'Billing & Invoices', 'API Keys', 'Webhooks']
  return (
    <>
      <PageHeading title="Settings" description="Manage your workspace profile, security, billing, and integrations." />
      <div className="settings-tabs" role="tablist" aria-label="Settings sections">{tabs.map((item) => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
      {tab === 'Billing & Invoices' ? <div className="settings-placeholder panel"><CreditCard size={24} /><h2>Billing settings</h2><p>Manage your plan and payment methods from the billing page.</p><button className="button button-primary" type="button" onClick={() => navigate('/billing')}>Go to billing details</button></div> : (
        <div className="settings-layout">
          <section className="panel settings-form-panel">
            <div className="panel-heading"><div><h2>{tab === 'General' ? 'Workspace profile' : tab}</h2><p>{tab === 'General' ? 'This information is visible to members of your workspace.' : `Manage ${tab.toLowerCase()} for your workspace.`}</p></div></div>
            {tab === 'General' && <form className="form-stack" onSubmit={(event) => { event.preventDefault(); notify('Workspace settings saved.') }}><label>Workspace name<input defaultValue="Acme Inc." /></label><label>Workspace URL<div className="domain-input"><input defaultValue="acme" /><span>.saasapp.com</span></div></label><label>Contact email<input type="email" defaultValue="alex@acme.co" /></label><label>Workspace description<textarea defaultValue="A little about your team and what you do." rows="3" /></label><div className="form-actions"><button className="button button-primary" type="submit">Save changes</button></div></form>}
            {tab === 'Team Members' && <div className="settings-list"><div><span className="avatar avatar-0">AM</span><span><strong>Alex Morgan</strong><small>Owner · alex@acme.co</small></span><span className="status-pill active"><i /> Active</span></div><div><span className="avatar avatar-1">SC</span><span><strong>Sarah Chen</strong><small>Admin · sarah@loomly.io</small></span><span className="status-pill active"><i /> Active</span></div><button className="button button-outline" type="button" onClick={() => notify('Invite a teammate from User Management.')}>Invite team member <Plus size={14} /></button></div>}
            {tab === 'Security & 2FA' && <div className="settings-list"><div><span className="setting-icon"><ShieldCheck size={17} /></span><span><strong>Two-factor authentication</strong><small>Add an extra layer of security to your account.</small></span><label className="switch"><input type="checkbox" checked={twoFactor} onChange={(event) => setTwoFactor(event.target.checked)} aria-label="Toggle two-factor authentication" /><span /></label></div><div><span className="setting-icon"><LockKeyhole size={17} /></span><span><strong>Password</strong><small>Last updated 42 days ago</small></span><button type="button" className="button button-outline" onClick={() => notify('Password reset instructions are ready to be sent.')}>Update</button></div><div><span className="setting-icon"><Globe size={17} /></span><span><strong>Active sessions</strong><small>2 active sessions on your account</small></span><button type="button" className="button button-outline" onClick={() => notify('Other sessions have been signed out.')}>Sign out others</button></div></div>}
            {tab === 'API Keys' && <div className="settings-list"><div><span className="setting-icon"><KeyRound size={17} /></span><span><strong>Production API key</strong><small>Created May 3, 2026 · Last used 2 minutes ago</small></span><code>sk-live-••••-9f2a</code></div><button className="button button-primary" type="button" onClick={() => notify('New demo API key generated. Visit Billing for key controls.')}>Generate new key <Plus size={14} /></button></div>}
            {tab === 'Webhooks' && <div className="settings-list"><div><span className="setting-icon"><Globe size={17} /></span><span><strong>Invoice paid</strong><small>https://api.acme.co/webhooks/billing</small></span><span className="status-pill active"><i /> Enabled</span></div><div><span className="setting-icon"><Activity size={17} /></span><span><strong>User created</strong><small>No destination configured yet</small></span><span className="status-pill invited"><i /> Paused</span></div><button className="button button-outline" type="button" onClick={() => notify('Webhook setup is available in this demo workspace.')}>Add webhook <Plus size={14} /></button></div>}
          </section>
          <aside className="panel settings-security-card"><div className="security-art"><ShieldCheck size={24} /></div><h2>Keep your account secure</h2><p>Protect your workspace with strong authentication and regular access reviews.</p><div className="security-check"><CheckCircle2 size={15} /> Two-factor authentication {twoFactor ? 'enabled' : 'disabled'}</div><div className="security-check"><CheckCircle2 size={15} /> Recovery email verified</div><button type="button" className="button button-outline button-wide" onClick={() => setTab('Security & 2FA')}>Review security settings <ArrowRight size={14} /></button></aside>
        </div>
      )}
    </>
  )
}

function ActivityPage() {
  return (
    <>
      <PageHeading title="Workspace Activity" description="A complete timeline of recent workspace events." />
      <section className="panel all-activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest events across your workspace</p></div><span className="live-indicator"><i /> Live</span></div>{[...activityItems, ...activityItems].map(({ icon: Icon, tone, title, detail }, index) => <div className="activity-item activity-item-expanded" key={`${title}-${index}`}><span className={`activity-icon ${tone}`}><Icon size={15} /></span><div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div><span className="activity-time">{index < 5 ? 'Today' : 'Yesterday'}</span></div>)}</section>
    </>
  )
}

function CheckoutPage({ navigate, notify }) {
  const [annual, setAnnual] = useState(false)
  const [complete, setComplete] = useState(false)
  const price = annual ? 950 : 99
  const submitPayment = (event) => {
    event.preventDefault()
    setComplete(true)
  }
  if (complete) return <div className="checkout-success panel"><span className="success-check"><Check size={28} /></span><span className="eyebrow-pill">DEMO CHECKOUT</span><h1>You're on Pro!</h1><p>Your demo subscription is ready. No payment was processed and no card details were stored.</p><button className="button button-primary" type="button" onClick={() => navigate('/billing')}>Return to billing <ArrowRight size={15} /></button></div>
  return (
    <div className="checkout-wrap">
      <button type="button" className="back-button" onClick={() => navigate('/billing')}><ArrowLeft size={15} /> Back to billing</button>
      <PageHeading title="Upgrade your workspace" description="A simple, secure checkout for your SaaSapp subscription." />
      <div className="checkout-layout">
        <form className="panel checkout-form" onSubmit={submitPayment}>
          <div className="checkout-section-heading"><span className="step-number">1</span><div><h2>Billing cycle</h2><p>Choose how often you'd like to be billed.</p></div></div>
          <div className="billing-cycle-options"><button type="button" className={!annual ? 'cycle-option selected' : 'cycle-option'} onClick={() => setAnnual(false)}><span><strong>Monthly</strong><small>Flexible, billed monthly</small></span><b>$99 <small>/ month</small></b></button><button type="button" className={annual ? 'cycle-option selected' : 'cycle-option'} onClick={() => setAnnual(true)}><span><strong>Yearly <em>Save 20%</em></strong><small>One payment each year</small></span><b>$950 <small>/ year</small></b></button></div>
          <div className="checkout-section-heading"><span className="step-number">2</span><div><h2>Payment details</h2><p>Test checkout only — no charge will be made.</p></div></div>
          <div className="form-stack"><label>Name on card<input autoComplete="cc-name" placeholder="Alex Morgan" required /></label><label>Card number<input inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" minLength={12} required /></label><div className="checkout-card-row"><label>Expiry date<input autoComplete="cc-exp" placeholder="MM / YY" required /></label><label>Security code<input inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" minLength={3} required /></label></div><label className="remember-check"><input type="checkbox" required /> I understand this demo will not process a payment.</label></div>
          <button className="button button-primary checkout-submit" type="submit"><LockKeyhole size={15} /> Confirm demo upgrade · ${price}{annual ? '/yr' : '/mo'}</button>
          <p className="demo-payment-note"><ShieldCheck size={14} /> Demo checkout only. This prototype does not connect to a payment processor.</p>
        </form>
        <aside className="panel order-summary"><span className="eyebrow-pill">ORDER SUMMARY</span><h2>Pro plan</h2><p>For growing teams that need more room.</p><div className="summary-plan-price"><strong>${price}</strong><span>/{annual ? 'year' : 'month'}</span></div><div className="summary-divider" /><ul><li><Check size={14} /> Up to 10 team members</li><li><Check size={14} /> Advanced analytics</li><li><Check size={14} /> Priority email support</li><li><Check size={14} /> Unlimited dashboards</li></ul><div className="summary-divider" /><div className="summary-total"><span>{annual ? 'Annual' : 'Monthly'} total</span><strong>${price}.00</strong></div><small className="summary-renewal">Your plan renews {annual ? 'yearly' : 'monthly'}. You can change or cancel at any time.</small></aside>
      </div>
      <button type="button" className="checkout-help" onClick={() => notify('Contact billing support at support@saasapp.example.')}><CircleHelp size={14} /> Need help with checkout?</button>
    </div>
  )
}

function AuthPage({ signup, navigate, notify }) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(1)
  const [signupValues, setSignupValues] = useState({ name: '', email: '', password: '', company: '', subdomain: '' })
  const updateSignupField = (event) => setSignupValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  const handleSubmit = (event) => {
    event.preventDefault()
    if (signup && step === 1) {
      setStep(2)
      return
    }
    navigate('/dashboard')
  }
  return (
    <main className="auth-page">
      <section className="auth-promo">
        <Brand onNavigate={navigate} />
        <div className="auth-promo-content"><span className="live-tag"><i /> Live · 12,450 active users right now</span><h1>{signup ? <>Launch your workspace in minutes, scale to millions.</> : <>Streamline Your SaaS Operations &amp; Real-Time Analytics</>}</h1><p>Monitor revenue, users, and infrastructure from one command center.</p>
          <div className="mini-chart-card"><div><strong>Revenue vs Expansions</strong><span>+14% this month</span></div><div className="mini-bars">{[36, 54, 43, 69, 48, 82, 61, 93, 73, 84, 58, 76].map((height, index) => <i key={index} className={index === 5 || index === 7 ? 'highlight' : ''} style={{ height: `${height}%` }} />)}</div><div className="mini-chart-legend"><span><i className="legend-dot purple-dot" />Revenue</span><span><i className="legend-dot green-dot" />Expansions</span><small>Last 12 months</small></div></div>
        </div>
        <div className="auth-promo-footer"><span className="avatar-stack"><i>AM</i><i>SC</i><i>MW</i></span><span>Trusted by 4,200+ SaaS teams worldwide</span></div>
      </section>
      <section className="auth-form-side"><div className="auth-form-card"><span className="auth-brand-mark">S</span><h2>{signup ? 'Create Your Workspace' : 'Admin Portal Login'}</h2><p>{signup ? 'Set up your team and get started.' : 'Enter your credentials to access the workspace dashboard.'}</p>{signup && <div className="signup-steps"><span className={step === 1 ? 'current' : 'done'}>1 <small>Account Details</small></span><i /><span className={step === 2 ? 'current' : ''}>2 <small>Company Info</small></span></div>}
        <form className="auth-fields" onSubmit={handleSubmit}>
          {signup && step === 1 && <label>Full name<input name="name" autoComplete="name" placeholder="Alex Morgan" value={signupValues.name} onChange={updateSignupField} required /></label>}
          <label>Work email<input type="email" name="email" autoComplete="email" placeholder="alex@acme.co" {...(signup ? { value: signupValues.email, onChange: updateSignupField } : { defaultValue: 'alex@acme.co' })} required /></label>
          {signup && step === 2 && <><label>Company / Workspace<input name="company" placeholder="Acme Inc." value={signupValues.company} onChange={updateSignupField} required /></label><label>Workspace subdomain<div className="domain-input"><input name="subdomain" placeholder="acme" value={signupValues.subdomain} onChange={updateSignupField} required /><span>.saasapp.com</span></div></label></>}
          <label>{signup ? 'Create password' : 'Password'}<div className="password-input"><input name="password" type={visible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'At least 8 characters' : 'Enter your password'} {...(signup ? { value: signupValues.password, onChange: updateSignupField } : { defaultValue: 'SecurePass!24' })} minLength={8} required /><button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button></div></label>
          {!signup && <div className="auth-form-options"><label className="remember-check"><input type="checkbox" defaultChecked /> Remember Me</label><span className="two-factor-label"><i /> 2FA prompt</span><button type="button" className="text-button" onClick={() => notify('Password reset instructions can be sent by your workspace administrator.')}>Forgot Password?</button></div>}
          {signup && step === 2 && <label className="remember-check terms-check"><input type="checkbox" required /> I agree to the Terms of Service and Privacy Policy.</label>}
          <button className="button button-primary auth-submit" type="submit">{signup && step === 1 ? 'Continue to company info' : signup ? 'Create Admin Account' : 'Sign In to Dashboard'} <ArrowRight size={15} /></button>
        </form>
        {!signup && <><div className="auth-divider"><span>OR CONTINUE WITH</span></div><div className="social-login"><button type="button" onClick={() => notify('Google sign-in is not connected in this demo. Use email to continue.')}>◉ &nbsp; Google</button><button type="button" onClick={() => notify('GitHub sign-in is not connected in this demo. Use email to continue.')}>⌘ &nbsp; GitHub</button></div></>}
        <p className="auth-switch">{signup ? 'Already have an account?' : 'Need an admin workspace?'} <AppLink to={signup ? '/login' : '/signup'} onNavigate={navigate}>{signup ? 'Sign In' : 'Sign Up'}</AppLink></p>
        <div className="auth-privacy"><ShieldCheck size={14} /> SOC 2 Type II · SSO enforced · Encrypted at rest</div>
      </div></section>
    </main>
  )
}

function Sidebar({ pathname, navigate, open, onClose }) {
  return (
    <>
      {open && <button className="sidebar-backdrop" type="button" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top"><Brand onNavigate={(path) => { navigate(path); onClose() }} /><button className="sidebar-collapse icon-button" type="button" aria-label="Close navigation" onClick={onClose}><X size={17} /></button></div>
        <nav className="sidebar-nav" aria-label="Main navigation">{navigation.map(({ label, path, icon: Icon, badge, live }) => (
          <AppLink key={path} to={path} onNavigate={(nextPath) => { navigate(nextPath); onClose() }} className={`nav-link ${pathname === path || (label === 'Dashboard' && pathname === '/') ? 'active' : ''}`} aria-current={pathname === path ? 'page' : undefined}>
            <Icon size={16} /><span>{label}</span>{badge && <small className="nav-badge">{badge}</small>}{live && <i className="nav-live-dot" />}
          </AppLink>
        ))}</nav>
        <section className="usage-card"><div><Zap size={15} /><strong>Usage limit</strong></div><p>82% of events used</p><div className="progress-track"><span className="purple" style={{ width: '82%' }} /></div><AppLink to="/checkout" onNavigate={(path) => { navigate(path); onClose() }} className="button button-upgrade">Upgrade now <ArrowUpRight size={13} /></AppLink></section>
        <button className="sidebar-user" type="button" onClick={() => { navigate('/settings'); onClose() }}><span className="avatar avatar-0">AM</span><span><strong>Alex Morgan</strong><small>Super Admin</small></span><LogOut size={15} /></button>
      </aside>
    </>
  )
}

function Topbar({ navigate, notify, toggleMenu }) {
  const [query, setQuery] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const pageMatches = navigation.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
  const userMatches = initialUsers.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.email.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
  const goToSearchResult = (path) => { navigate(path); setQuery(''); setSuggestionsOpen(false) }
  return (
    <header className="topbar"><button className="mobile-menu icon-button" type="button" aria-label="Open navigation" onClick={toggleMenu}><Menu size={19} /></button><div className="topbar-spacer" />
      <div className="global-search-wrap"><label className="global-search"><Search size={16} /><input value={query} onFocus={() => setSuggestionsOpen(true)} onChange={(event) => { setQuery(event.target.value); setSuggestionsOpen(true) }} onKeyDown={(event) => { if (event.key === 'Enter' && query) goToSearchResult(userMatches.length ? '/users' : pageMatches[0]?.path || '/dashboard'); if (event.key === 'Escape') setSuggestionsOpen(false) }} placeholder="Search anything..." aria-label="Search anything" /><kbd>⌘ K</kbd></label>
        {suggestionsOpen && query && <div className="search-suggestions"><span className="suggestion-label">PAGES</span>{pageMatches.length ? pageMatches.map(({ label, path, icon: Icon }) => <button type="button" key={path} onClick={() => goToSearchResult(path)}><Icon size={15} />{label}<ArrowRight size={13} /></button>) : null}{userMatches.length > 0 && <><span className="suggestion-label">USERS</span>{userMatches.map((user) => <button type="button" key={user.id} onClick={() => goToSearchResult('/users')}><Users size={15} />{user.name}<small>{user.email}</small></button>)}</>}{pageMatches.length === 0 && userMatches.length === 0 && <span className="no-suggestions">No matching pages or users.</span>}</div>}
      </div>
      <div className="topbar-menu-wrap"><button className="workspace-switcher" type="button" onClick={() => setCompanyOpen((current) => !current)}><span className="workspace-icon">A</span><strong>Acme Inc.</strong><ChevronDown size={14} /></button>{companyOpen && <div className="topbar-popover workspace-popover"><strong>Switch workspace</strong><button type="button" onClick={() => { setCompanyOpen(false); notify('Acme Inc. is your current workspace.') }}><span className="workspace-icon">A</span> Acme Inc. <Check size={14} /></button><button type="button" onClick={() => { setCompanyOpen(false); notify('No other demo workspaces are available.') }}><span className="workspace-icon alt">S</span> SaaS Studio</button><button type="button" onClick={() => { setCompanyOpen(false); notify('Create a workspace from Settings.') }}><Plus size={14} /> Add workspace</button></div>}</div>
      <div className="topbar-menu-wrap"><button className={`icon-button notification-button ${notificationsOpen ? 'active' : ''}`} type="button" aria-label="Notifications" onClick={() => setNotificationsOpen((current) => !current)}><Bell size={17} /><i /></button>{notificationsOpen && <div className="topbar-popover notification-popover"><div className="popover-heading"><strong>Notifications</strong><button type="button" onClick={() => { setNotificationsOpen(false); notify('All notifications marked as read.') }}>Mark all read</button></div><p><span className="activity-icon green"><UserPlus size={14} /></span><span><strong>New workspace signup</strong><small>sarah@loomly.io joined just now</small></span></p><p><span className="activity-icon amber"><CreditCard size={14} /></span><span><strong>Payment received</strong><small>Invoice #1092 · $99.00</small></span></p><AppLink to="/activity" onNavigate={(path) => { navigate(path); setNotificationsOpen(false) }}>View activity <ArrowRight size={13} /></AppLink></div>}</div>
      <button type="button" className="topbar-avatar" aria-label="Open account settings" onClick={() => navigate('/settings')}>AM</button>
    </header>
  )
}

function App() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const route = pathname === '/' ? '/dashboard' : pathname
  const isAuth = route === '/login' || route === '/signup'
  const navigate = (to) => {
    if (window.location.pathname !== to) window.history.pushState({}, '', to)
    setPathname(to)
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }
  const notify = (message) => {
    setToast(message)
    window.clearTimeout(notify.timeout)
    notify.timeout = window.setTimeout(() => setToast(''), 3500)
  }
  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  useEffect(() => {
    const titles = { '/dashboard': 'Dashboard', '/analytics': 'Analytics', '/users': 'User Management', '/billing': 'Billing & Invoices', '/system-logs': 'System Logs', '/settings': 'Settings', '/checkout': 'Checkout', '/activity': 'Workspace Activity', '/login': 'Admin Portal Login', '/signup': 'Create Your Workspace' }
    document.title = `${titles[route] || 'Dashboard'} | Saasapp`
  }, [route])
  const knownRoutes = navigation.some((item) => item.path === route) || ['/login', '/signup', '/checkout', '/activity'].includes(route)
  if (!knownRoutes) {
    return <main className="not-found"><span className="brand-icon">S</span><h1>Page not found</h1><p>This page doesn't exist in your workspace.</p><button className="button button-primary" type="button" onClick={() => navigate('/dashboard')}>Back to dashboard</button></main>
  }
  if (isAuth) return <><AuthPage signup={route === '/signup'} navigate={navigate} notify={notify} />{toast && <div className="toast" role="status">{toast}</div>}</>
  return (
    <div className="app-shell">
      <Sidebar pathname={route} navigate={navigate} open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="app-main"><Topbar navigate={navigate} notify={notify} toggleMenu={() => setMobileMenuOpen((current) => !current)} /><main className="page-content">
        {route === '/dashboard' && <DashboardPage navigate={navigate} />}
        {route === '/analytics' && <AnalyticsPage navigate={navigate} />}
        {route === '/users' && <UsersPage notify={notify} />}
        {route === '/billing' && <BillingPage navigate={navigate} notify={notify} />}
        {route === '/system-logs' && <LogsPage />}
        {route === '/settings' && <SettingsPage notify={notify} navigate={navigate} />}
        {route === '/activity' && <ActivityPage />}
        {route === '/checkout' && <CheckoutPage navigate={navigate} notify={notify} />}
      </main><footer className="app-footer"><span>© 2026 Saasapp Admin</span><AppLink to="/settings" onNavigate={navigate}>Help &amp; support</AppLink><span className="footer-status"><i /> All systems operational</span></footer></div>
      {toast && <div className="toast" role="status"><CheckCircle2 size={16} />{toast}<button type="button" onClick={() => setToast('')} aria-label="Dismiss notification"><X size={14} /></button></div>}
    </div>
  )
}

export default App
