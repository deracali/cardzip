import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Cable,
  Check,
  CircleHelp,
  CreditCard,
  Download,
  FileText,
  Gauge,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Menu,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import './Admin.css'

const initialTransactions = [
  { id: 'VT-82418', customer: 'Tunde Akinola', service: 'MTN Data 2GB', recipient: '0803 452 1890', amount: 480, gateway: 'VTPass', status: 'Successful' },
  { id: 'VT-82417', customer: 'Chioma Eze', service: 'IKEDC Prepaid', recipient: '0421 8872 991', amount: 5125, gateway: 'VTPass', status: 'Successful' },
  { id: 'VT-82416', customer: 'Musa Ibrahim', service: 'Airtel Airtime', recipient: '0808 221 9043', amount: 1000, gateway: 'Quickteller', status: 'Pending' },
  { id: 'VT-82415', customer: 'Fatima Sule', service: 'DSTV Compact', recipient: 'ICUC 10293847', amount: 12500, gateway: 'Quickteller', status: 'Failed' },
  { id: 'VT-82414', customer: 'Emeka Obi', service: 'Glo 5GB Data', recipient: '0773 112 209', amount: 1150, gateway: 'VTPass', status: 'Successful' },
  { id: 'VT-82413', customer: 'Sarah Ade', service: 'EKEDC Prepaid', recipient: '0312 0098 411', amount: 2500, gateway: 'VTPass', status: 'Reversed' },
]

const navigation = [
  { title: 'Overview', href: '/admin', icon: LayoutDashboard },
  { title: 'User Management', href: '/admin/users', icon: Users },
  { title: 'API Gateway Routes', href: '/admin/routing', icon: Radio },
  { title: 'Transactions & Logs', href: '/admin/transactions', icon: FileText },
  { title: 'Commissions & Markup', href: '/admin/commissions', icon: CreditCard },
  { title: 'Webhook Logs', href: '/admin/monitoring', icon: Activity },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
]
const money = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`

function AdminBrand() {
  return <a className="admin-brand" href="/admin"><span><Zap size={17} fill="currentColor" /></span> SwiftTopUp Admin</a>
}

function AdminSidebar({ path, onClose }) {
  return <aside className="admin-sidebar"><AdminBrand /><div className="admin-live"><span /> API Operations <small>All systems operational · Live</small></div><p className="admin-nav-label">MAIN MENU</p><nav aria-label="Admin navigation">{navigation.map(({ title, href, icon: Icon }) => <a href={href} key={href} onClick={onClose} className={path === href ? 'active' : ''}><Icon size={15} />{title}{title === 'API Gateway Routes' && <b>LIVE</b>}{title === 'Webhook Logs' && <em>18</em>}</a>)}</nav><section className="follow-mode"><b>Follow Mode</b><p>Auto-refresh is enabled. Alerts are sent to admin.</p><span>Auto-follow <i /></span></section><a href="/dashboard" className="admin-user"><span>AO</span><b>Adesua Okafor<small>Super Admin</small></b><LogOut size={14} /></a></aside>
}

function Status({ children }) {
  return <span className={`admin-status admin-status-${children.toLowerCase()}`}>{children}</span>
}

function AdminHeader({ title, onMenu }) {
  const [notice, setNotice] = useState(false)
  return <header className="admin-topbar"><button className="admin-menu-toggle" onClick={onMenu} aria-label="Open admin navigation"><Menu size={19} /></button><div className="admin-breadcrumb">Admin <span>/</span> <b>{title}</b></div><label className="admin-search"><Search size={14} /><input placeholder="Search Tx ref, user, meter..." aria-label="Search admin records" /></label><div className="admin-top-actions"><a className="admin-filter-button" href="/admin/transactions"><ListFilter size={13} /> Filters</a><a className="admin-dark-button" href="/admin/users"><Users size={13} /> Find User</a><a className="admin-export-button" href="/admin/transactions"><Download size={13} /> Export Report</a><button className="admin-notifications" aria-label="Notifications" onClick={() => setNotice(!notice)}><Bell size={15} />{notice && <span className="notification-popover">All caught up — no new alerts.</span>}</button></div></header>
}

function AdminStat({ label, value, note, icon: Icon, tone }) {
  return <article className="admin-stat"><div><span>{label}</span><Icon className={`stat-icon ${tone}`} size={17} /></div><strong>{value}</strong><p>{note}</p></article>
}

function AdminTransactions({ full = false }) {
  const [filter, setFilter] = useState('All events')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState(initialTransactions)
  const filtered = useMemo(() => rows.filter((item) => (filter === 'All events' || item.status === filter) && `${item.id} ${item.customer} ${item.service} ${item.recipient}`.toLowerCase().includes(search.toLowerCase())), [rows, filter, search])
  const updateStatus = (id, status) => setRows((current) => current.map((item) => item.id === id ? { ...item, status } : item))
  const exportRows = () => {
    const csv = ['Reference,Customer,Service,Recipient,Amount,Gateway,Status', ...filtered.map((item) => [item.id, item.customer, item.service, item.recipient, item.amount, item.gateway, item.status].join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'swifttopup-transactions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  return <section className="admin-panel transaction-panel"><div className="admin-panel-heading"><div><h2>Transaction Monitoring</h2><p>131,351 today · 147 flagged for review</p></div>{full && <button className="admin-export-button" onClick={exportRows}><Download size={13} /> Export CSV</button>}</div><div className="admin-table-controls">{full && <label className="admin-table-search"><Search size={14} /><input placeholder="Search transactions or customers" value={search} onChange={(event) => setSearch(event.target.value)} /></label>}<div className="admin-filters">{['All events', 'Successful', 'Pending', 'Failed'].map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>TX REF</th><th>USER / SERVICE</th><th>RECIPIENT</th><th>AMOUNT</th><th>GATEWAY</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filtered.slice(0, full ? 25 : 6).map((item) => <tr key={item.id}><td><a href="/admin/transactions">{item.id}</a></td><td><strong>{item.customer}</strong><small>{item.service}</small></td><td>{item.recipient}</td><td><strong>{money(item.amount)}</strong></td><td>{item.gateway}</td><td><Status>{item.status}</Status></td><td className="admin-row-actions"><button title="Mark successful" aria-label={`Mark ${item.id} successful`} onClick={() => updateStatus(item.id, 'Successful')}><Check size={13} /></button><button title="Mark pending" aria-label={`Mark ${item.id} pending`} onClick={() => updateStatus(item.id, 'Pending')}>Re-query</button><button title="View transaction" onClick={() => updateStatus(item.id, item.status === 'Failed' ? 'Reversed' : item.status)}>View</button></td></tr>)}</tbody></table></div><div className="admin-table-footer"><span>Showing {filtered.length ? 1 : 0}–{Math.min(filtered.length, full ? 25 : 6)} of 131,351 transactions · auto-refresh 5s</span>{full && <div><button disabled>‹ Prev</button><b>1</b><button>2</button><button>Next ›</button></div>}</div></section>
}

function Overview() {
  const [period, setPeriod] = useState('Today')
  return <>
    <div className="admin-announcement"><span><Activity size={14} /> 4 API services operational <small>All systems healthy</small></span><a href="/admin/monitoring">View health checks <ArrowRight size={12} /></a></div>
    <div className="admin-stats-grid"><AdminStat label="TOTAL WALLET BALANCE" value="₦48,290,500" note="↑ 12.8% from yesterday" icon={Wallet} tone="green" /><AdminStat label="TODAY'S BILL SALES" value="₦3,842,900" note="2,417 transactions · Today" icon={ArrowUpRight} tone="blue" /><AdminStat label="SUCCESS RATE" value="99.2%" note="↓ 0.3% · 5,842 total" icon={Gauge} tone="green" /><AdminStat label="ACTIVE USERS" value="24,680" note="+182 new users this week" icon={Users} tone="purple" /></div>
    <div className="admin-overview-grid"><section className="admin-panel revenue-panel"><div className="admin-panel-heading"><div><h2>Revenue overview</h2><p>Bill sales and wallet activity</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Revenue time period"><option>Today</option><option>Last 7 days</option><option>This month</option></select></div><div className="revenue-chart"><div className="chart-y-labels"><span>₦5M</span><span>₦3M</span><span>₦1M</span><span>₦0</span></div><div className="chart-lines"><div className="chart-columns">{[32, 54, 41, 66, 47, 76, 62, 88, 59, 72, 94, 70].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><small>{['8am', '10am', '12pm', '2pm', '4pm', '6pm'][index % 6]}</small></div>)}</div></div></div><div className="chart-legend"><span>● Bill sales</span><span>● Wallet deposits</span><b>{period}</b></div></section><section className="admin-panel health-panel"><div className="admin-panel-heading"><div><h2>Live Gateway Health</h2><p><i className="health-dot" /> All systems operational</p></div><a href="/admin/monitoring">View all</a></div>{[['VTPass', '98.7%', 'Stable · 42ms'], ['Quickteller', '99.8%', 'Stable · 61ms'], ['Baxi', '98.2%', 'Stable · 57ms'], ['Flutterwave', '99.1%', 'Healthy · 38ms']].map(([name, value, label]) => <div className="health-item" key={name}><span className="health-icon"><Radio size={14} /></span><span><b>{name}</b><small>{label}</small></span><strong>{value}</strong></div>)}<a className="health-alert" href="/admin/monitoring"><ShieldCheck size={14} /> All provider checks passed</a></section></div>
    <div className="admin-overview-grid admin-lower-grid"><section className="admin-panel routing-panel"><div className="admin-panel-heading"><div><h2>API Routing &amp; Pricing</h2><p>Manage routes and service markups</p></div><a href="/admin/routing">Manage routes <ArrowRight size={12} /></a></div><div className="route-grid">{[['MTN Data', 'AUTO', 'VTPass'], ['Airtel Data', 'AUTO', 'Baxi'], ['Glo / 9mobile', 'AUTO', 'VTPass'], ['Electricity', 'AUTO', 'Quickteller']].map(([name, mode, gateway]) => <a href="/admin/routing" className="route-chip" key={name}><span>{name}<small>{gateway}</small></span><b>{mode}</b></a>)}</div><div className="markup-list"><span>MTN 1GB · 30d</span><span>₦225</span><strong>₦240</strong><a href="/admin/commissions">Edit</a><span>Airtel 2GB · 30d</span><span>₦460</span><strong>₦480</strong><a href="/admin/commissions">Edit</a><span>IKEC Prepaid</span><span>1.5%</span><strong>2.5%</strong><a href="/admin/commissions">Edit</a></div></section><AdminTransactions /></div>
  </>
}

function UsersPage() {
  return <section className="admin-panel users-panel"><div className="admin-panel-heading"><div><h2>User Management</h2><p>24,680 registered customers · 182 new this week</p></div><button className="admin-export-button"><Users size={13} /> Add user</button></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>USER</th><th>PHONE</th><th>WALLET BALANCE</th><th>JOINED</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{[['Adesua Okafor', 'adesua@example.com', '0803 452 1890', '₦24,850', 'Nov 02, 2026', 'Active'], ['Tunde Akinola', 'tunde@example.com', '0704 872 1140', '₦8,200', 'Nov 01, 2026', 'Active'], ['Chioma Eze', 'chioma@example.com', '0902 334 1200', '₦3,420', 'Oct 29, 2026', 'Active'], ['Musa Ibrahim', 'musa@example.com', '0813 554 0021', '₦0', 'Oct 28, 2026', 'Review']].map(([name, email, phone, balance, joined, status]) => <tr key={email}><td><strong>{name}</strong><small>{email}</small></td><td>{phone}</td><td>{balance}</td><td>{joined}</td><td><Status>{status}</Status></td><td><button className="admin-text-action">View profile</button></td></tr>)}</tbody></table></div></section>
}

function RoutingPage() {
  const [enabled, setEnabled] = useState({ MTN: true, Airtel: true, Glo: true, Electricity: true })
  return <section className="admin-panel routing-management"><div className="admin-panel-heading"><div><h2>API Gateway Routes</h2><p>Configure provider routing and automatic failover priority.</p></div><Status>Live</Status></div>{[['MTN', Smartphone, 'VTPass', '98.7% uptime · 42ms avg'], ['Airtel', Smartphone, 'Baxi', '99.8% uptime · 61ms avg'], ['Glo', Smartphone, 'VTPass', '98.2% uptime · 57ms avg'], ['Electricity', Zap, 'Quickteller', '99.1% uptime · 38ms avg'], ['Cable TV', Cable, 'VTPass', '99.3% uptime · 48ms avg']].map(([name, Icon, gateway, health]) => <div className="managed-route" key={name}><span className="route-provider-icon"><Icon size={17} /></span><span><b>{name}</b><small>{health}</small></span><select defaultValue={gateway} aria-label={`${name} gateway`}><option>VTPass</option><option>Baxi</option><option>Quickteller</option><option>Monnify</option></select><button className={`route-toggle${enabled[name] ? ' enabled' : ''}`} onClick={() => setEnabled((current) => ({ ...current, [name]: !current[name] }))} aria-label={`${enabled[name] ? 'Disable' : 'Enable'} ${name} route`}><i /></button></div>)}<p className="admin-demo-note"><ShieldCheck size={14} /> Route settings are preview-only until connected to your VTU provider API.</p></section>
}

function MonitoringPage() {
  return <div className="monitoring-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Provider Health</h2><p>Live monitoring · refreshed just now</p></div><Activity size={18} /></div>{[['VTPass API', 'Operational', '42ms'], ['Quickteller', 'Operational', '61ms'], ['Baxi API', 'Operational', '57ms'], ['Wallet Service', 'Operational', '18ms']].map(([service, status, latency]) => <div className="monitor-row" key={service}><i /><span>{service}<small>Last checked just now</small></span><Status>{status}</Status><b>{latency}</b></div>)}</section><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Recent Webhook Events</h2><p>Latest provider callbacks</p></div><a href="/admin/transactions">View transactions</a></div>{[['transaction.success', 'VT-82418', '10:42:18'], ['wallet.funded', 'WL-19284', '10:40:51'], ['transaction.pending', 'VT-82416', '10:39:03'], ['transaction.failed', 'VT-82415', '10:31:45']].map(([event, ref, time]) => <div className="webhook-row" key={ref}><span className={event.endsWith('success') ? 'webhook-ok' : ''}>{event}</span><code>{ref}</code><small>{time}</small></div>)}</section></div>
}

function SimpleAdminPage({ name, icon: Icon }) {
  return <section className="admin-panel simple-admin-page"><span className="simple-admin-icon"><Icon size={20} /></span><h2>{name}</h2><p>This admin workspace is ready for provider-backed configuration. The demo has no live account or payment data.</p><a className="admin-dark-button" href="/admin">Back to overview <ArrowRight size={13} /></a></section>
}

export default function AdminApp() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/admin'
  const [menuOpen, setMenuOpen] = useState(false)
  const page = navigation.find((item) => item.href === path)?.title || 'Overview'
  return <div className="admin-app"><div className={menuOpen ? 'admin-sidebar-wrap open' : 'admin-sidebar-wrap'}><AdminSidebar path={path} onClose={() => setMenuOpen(false)} /></div><main className="admin-main"><AdminHeader title={page} onMenu={() => setMenuOpen(!menuOpen)} /><div className="admin-content">{path === '/admin' && <Overview />}{path === '/admin/transactions' && <AdminTransactions full />}{path === '/admin/users' && <UsersPage />}{path === '/admin/routing' && <RoutingPage />}{path === '/admin/monitoring' && <MonitoringPage />}{path === '/admin/commissions' && <SimpleAdminPage name="Commissions & Markup" icon={CreditCard} />}{path === '/admin/settings' && <SimpleAdminPage name="Admin Settings" icon={Settings} />}{!navigation.some((item) => item.href === path) && path !== '/admin' && <SimpleAdminPage name="Admin workspace" icon={CircleHelp} />}</div></main></div>
}
