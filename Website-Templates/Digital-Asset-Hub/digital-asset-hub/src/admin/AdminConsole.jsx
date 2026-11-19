import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowUpRight, BadgeCheck, Bell, Bitcoin, BriefcaseBusiness,
  Check, ChevronDown, CircleDollarSign, CreditCard, FileClock, Headphones, LayoutDashboard,
  LogOut, Menu, Search, Settings, ShieldCheck, Smartphone, Users, Wallet, X, Zap,
} from 'lucide-react'
import styles from './AdminConsole.module.css'

const LOCAL_KEY = 'dah-admin-workspace-v1'
const SESSION_KEY = 'dah-admin-demo-session'
const SECTIONS = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Trades', kind: 'trade', icon: Bitcoin },
  { name: 'Bills', kind: 'bill', icon: Zap },
  { name: 'Virtual cards', kind: 'card', icon: CreditCard },
  { name: 'Customers', kind: 'customer', icon: Users },
  { name: 'Support', kind: 'support', icon: Headphones },
  { name: 'Rates', icon: Activity },
  { name: 'Settings', icon: Settings },
]
const STATUS_OPTIONS = {
  trade: ['pending', 'processing', 'completed', 'flagged', 'rejected'],
  bill: ['pending', 'processing', 'completed', 'rejected'],
  card: ['active', 'suspended', 'pending'],
  customer: ['active', 'suspended'],
  support: ['open', 'processing', 'resolved'],
}
const INITIAL_DATA = {
  records: {
    trade: [
      { id: 'tr-208512', reference: 'TRD-208512', customerName: 'Maya Okafor', email: 'maya@example.com', item: 'Amazon US · $100 gift card', amount: 84, currency: 'USD', status: 'completed', detail: 'Card verified', createdAt: '2026-11-16T10:42:00.000Z' },
      { id: 'tr-208491', reference: 'TRD-208491', customerName: 'Daniel Mensah', email: 'daniel@example.com', item: 'USDT · 50 units', amount: 50, currency: 'USD', status: 'processing', detail: 'Awaiting payout review', createdAt: '2026-11-16T09:18:00.000Z' },
      { id: 'tr-208332', reference: 'TRD-208332', customerName: 'Amara Bello', email: 'amara@example.com', item: 'Bitcoin · 0.012 BTC', amount: 735, currency: 'USD', status: 'pending', detail: 'Identity check required', createdAt: '2026-11-16T08:35:00.000Z' },
      { id: 'tr-208298', reference: 'TRD-208298', customerName: 'Tobi Akin', email: 'tobi@example.com', item: 'Steam · $50 gift card', amount: 41.5, currency: 'USD', status: 'flagged', detail: 'Manual review requested', createdAt: '2026-11-15T17:12:00.000Z' },
    ],
    bill: [
      { id: 'bl-30418', reference: 'BIL-30418', customerName: 'Chika Eze', email: 'chika@example.com', item: 'Ikeja Electric · prepaid', amount: 20, currency: 'USD', status: 'completed', detail: 'Token issued', createdAt: '2026-11-16T09:44:00.000Z' },
      { id: 'bl-30402', reference: 'BIL-30402', customerName: 'Kojo Boateng', email: 'kojo@example.com', item: 'MTN · data bundle', amount: 10, currency: 'USD', status: 'processing', detail: 'Provider confirmation pending', createdAt: '2026-11-16T08:20:00.000Z' },
      { id: 'bl-30395', reference: 'BIL-30395', customerName: 'Zainab Yusuf', email: 'zainab@example.com', item: 'DStv · monthly plan', amount: 32, currency: 'USD', status: 'pending', detail: 'Awaiting provider response', createdAt: '2026-11-15T16:08:00.000Z' },
    ],
    card: [
      { id: 'vc-11804', reference: 'VCC-11804', customerName: 'Maya Okafor', email: 'maya@example.com', item: 'Virtual USD card · •••• 4821', amount: 5, currency: 'USD', status: 'active', detail: 'Created 14 Nov 2026', createdAt: '2026-11-14T11:22:00.000Z' },
      { id: 'vc-11792', reference: 'VCC-11792', customerName: 'Daniel Mensah', email: 'daniel@example.com', item: 'Virtual USD card · •••• 2904', amount: 5, currency: 'USD', status: 'suspended', detail: 'Customer requested pause', createdAt: '2026-11-13T15:40:00.000Z' },
    ],
    customer: [
      { id: 'cu-4108', reference: 'CUS-4108', customerName: 'Maya Okafor', email: 'maya@example.com', item: 'Individual · 8 transactions', amount: 84, currency: 'USD', status: 'active', detail: 'Joined 02 Oct 2026', createdAt: '2026-10-02T10:00:00.000Z' },
      { id: 'cu-4102', reference: 'CUS-4102', customerName: 'Daniel Mensah', email: 'daniel@example.com', item: 'Individual · 4 transactions', amount: 50, currency: 'USD', status: 'active', detail: 'Joined 07 Oct 2026', createdAt: '2026-10-07T10:00:00.000Z' },
      { id: 'cu-4091', reference: 'CUS-4091', customerName: 'Tobi Akin', email: 'tobi@example.com', item: 'Individual · 2 transactions', amount: 41.5, currency: 'USD', status: 'suspended', detail: 'Review account activity', createdAt: '2026-10-11T10:00:00.000Z' },
    ],
    support: [
      { id: 'sp-8821', reference: 'SUP-8821', customerName: 'Amara Bello', email: 'amara@example.com', item: 'Trade verification question', amount: 0, currency: 'USD', status: 'open', detail: 'Customer asked about verification timing', createdAt: '2026-11-16T10:16:00.000Z' },
      { id: 'sp-8810', reference: 'SUP-8810', customerName: 'Zainab Yusuf', email: 'zainab@example.com', item: 'Utility payment status', amount: 0, currency: 'USD', status: 'processing', detail: 'Provider receipt requested', createdAt: '2026-11-15T14:37:00.000Z' },
      { id: 'sp-8793', reference: 'SUP-8793', customerName: 'Kojo Boateng', email: 'kojo@example.com', item: 'Profile access', amount: 0, currency: 'USD', status: 'resolved', detail: 'Password reset instructions sent', createdAt: '2026-11-14T12:05:00.000Z' },
    ],
  },
  settings: {
    supportEmail: 'support@digitalassethub.example',
    maintenanceMode: false,
    rates: [
      { asset: 'Amazon US gift card', payoutRate: 0.84, currency: 'USD' },
      { asset: 'Apple gift card', payoutRate: 0.79, currency: 'USD' },
      { asset: 'Bitcoin', payoutRate: 61250, currency: 'USD' },
      { asset: 'USDT', payoutRate: 1, currency: 'USD' },
    ],
  },
}

function readLocalData() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null')
    if (saved?.records && saved?.settings) return saved
  } catch {}
  localStorage.setItem(LOCAL_KEY, JSON.stringify(INITIAL_DATA))
  return INITIAL_DATA
}

function saveLocalData(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
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
    throw new Error(`Could not connect to the Digital Asset Hub API at ${apiBaseUrl}: ${error.message}`)
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const apiError = new Error(data.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  return data
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(amount) || 0)
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function Status({ value }) {
  return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}><i />{value}</span>
}

function Login({ mode, apiBaseUrl, onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'local') {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ email: 'demo@digitalassethub.local' }))
        onSignedIn({ email: 'demo@digitalassethub.local' })
      } else {
        const result = await request(apiBaseUrl, '/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        onSignedIn(result.admin)
      }
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className={styles.loginPage}>
    <div className={styles.loginBrand}><img src="/digital-asset-hub-logo.svg" alt="Digital Asset Hub" /><span>OPERATIONS CONSOLE</span></div>
    <form className={styles.loginPanel} onSubmit={submit}>
      <span className={styles.loginIcon}><ShieldCheck size={20} /></span>
      <span className={styles.eyebrow}>SECURE ADMINISTRATION</span>
      <h1>Welcome back</h1>
      <p>{mode === 'local' ? 'Open the local demo console. Its records are stored in this browser only.' : 'Sign in with the administrator account configured on the backend.'}</p>
      {mode === 'api' && <>
        <label htmlFor="admin-email">Administrator email</label>
        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </>}
      {error && <div className={styles.errorNotice} role="alert">{error}</div>}
      <button className={styles.primaryButton} type="submit" disabled={busy}>{mode === 'local' ? 'Open demo workspace' : busy ? 'Signing in…' : 'Sign in securely'}</button>
      <small>{mode === 'local' ? 'Demo only · No live customer or payment data' : 'Session is protected by an HTTP-only cookie'}</small>
    </form>
    <a className={styles.backToSite} href="/">← Back to Digital Asset Hub</a>
  </main>
}

function MetricCard({ label, value, note, icon: Icon, tone }) {
  return <article className={styles.metricCard}><span className={`${styles.metricIcon} ${styles[tone]}`}><Icon size={17} /></span><span className={styles.metricLabel}>{label}</span><strong>{value}</strong><small>{note}</small></article>
}

export default function AdminConsole({ mode = 'local', apiBaseUrl = '' }) {
  const [admin, setAdmin] = useState(null)
  const [activeSection, setActiveSection] = useState('Overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  async function loadData() {
    if (mode === 'local') {
      const localData = readLocalData()
      setData(localData)
      setLoading(false)
      return
    }
    try {
      const [overview, trade, bill, card, customer, support, settings] = await Promise.all([
        request(apiBaseUrl, '/admin/overview'),
        ...['trade', 'bill', 'card', 'customer', 'support'].map((kind) => request(apiBaseUrl, `/admin/records/${kind}`)),
        request(apiBaseUrl, '/admin/settings'),
      ])
      const records = { trade: trade.records, bill: bill.records, card: card.records, customer: customer.records, support: support.records }
      setData({ records, settings: settings.settings, metrics: overview.metrics, recent: overview.recent })
      setError('')
    } catch (loadError) {
      if (loadError.status === 401) {
        setAdmin(null)
        setError('Your admin session ended. Sign in again to continue.')
      } else setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function initialize() {
      if (mode === 'local') {
        const session = localStorage.getItem(SESSION_KEY)
        if (session && active) {
          setAdmin(JSON.parse(session))
          setData(readLocalData())
        }
        if (active) setLoading(false)
        return
      }
      try {
        const result = await request(apiBaseUrl, '/admin/session')
        if (active) setAdmin(result.admin)
      } catch {
        if (active) setAdmin(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    void initialize()
    return () => { active = false }
  }, [apiBaseUrl, mode])

  useEffect(() => {
    if (admin) void loadData()
  }, [admin, mode])

  const currentSection = SECTIONS.find((section) => section.name === activeSection) || SECTIONS[0]
  const currentRecords = currentSection.kind ? data?.records?.[currentSection.kind] || [] : []
  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return currentRecords
    return currentRecords.filter((record) => [record.reference, record.customerName, record.email, record.item, record.status].some((value) => String(value || '').toLowerCase().includes(normalized)))
  }, [currentRecords, query])

  function signIn(nextAdmin) {
    setAdmin(nextAdmin)
    setError('')
  }

  async function signOut() {
    if (mode === 'local') localStorage.removeItem(SESSION_KEY)
    else {
      try { await request(apiBaseUrl, '/admin/logout', { method: 'POST' }) } catch {}
    }
    setAdmin(null)
    setData(null)
    setActiveSection('Overview')
  }

  async function updateRecord(record, changes) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'local') {
        const nextData = { ...data, records: { ...data.records } }
        nextData.records[currentSection.kind] = nextData.records[currentSection.kind].map((item) => item.id === record.id ? { ...item, ...changes } : item)
        saveLocalData(nextData)
        setData(nextData)
      } else {
        await request(apiBaseUrl, `/admin/records/${encodeURIComponent(record._id || record.id)}`, { method: 'PATCH', body: JSON.stringify(changes) })
        await loadData()
      }
      setNotice(`Updated ${record.reference}.`)
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
    setNotice('')
    try {
      if (mode === 'local') {
        saveLocalData(data)
      } else {
        const result = await request(apiBaseUrl, '/admin/settings', { method: 'PUT', body: JSON.stringify(data.settings) })
        setData({ ...data, settings: result.settings })
      }
      setNotice('Settings saved.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  function updateRate(index, field, value) {
    const rates = data.settings.rates.map((rate, rateIndex) => rateIndex === index
      ? { ...rate, [field]: field === 'payoutRate' ? Number(value) : value }
      : rate)
    setData({ ...data, settings: { ...data.settings, rates } })
  }

  if (loading) return <div className={styles.loading}><span /> Loading operations workspace</div>
  if (!admin) return <Login mode={mode} apiBaseUrl={apiBaseUrl} onSignedIn={signIn} />

  const metrics = data?.metrics || {
    trades: data?.records?.trade?.length || 0,
    bills: data?.records?.bill?.length || 0,
    cards: data?.records?.card?.length || 0,
    customers: data?.records?.customer?.length || 0,
    pending: Object.values(data?.records || {}).flat().filter((record) => ['pending', 'processing', 'open', 'flagged'].includes(record.status)).length,
  }
  const recent = data?.recent || Object.values(data?.records || {}).flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)

  return <div className={styles.adminShell}>
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
      <a className={styles.brand} href="/"><img src="/digital-asset-hub-logo.svg" alt="Digital Asset Hub" /><span>OPS</span></a>
      <div className={styles.workspace}><span className={styles.avatar}><ShieldCheck size={17} /></span><span><strong>Operations</strong><small>Admin console</small></span><ChevronDown size={14} /></div>
      <nav className={styles.nav} aria-label="Admin pages">
        <small>WORKSPACE</small>
        {SECTIONS.map(({ name, icon: Icon }) => <button key={name} type="button" className={activeSection === name ? styles.activeNav : ''} onClick={() => { setActiveSection(name); setMobileOpen(false); setQuery(''); setNotice('') }}><Icon size={16} /><span>{name}</span>{name === 'Trades' && metrics.pending > 0 && <i>{metrics.pending}</i>}</button>)}
      </nav>
      <div className={styles.sidebarFoot}><span className={styles.online}><i />{mode === 'local' ? 'Local demo' : 'API connected'}</span><a href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={14} /> Open public site</a></div>
    </aside>
    {mobileOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <main className={styles.main}>
      <header className={styles.topbar}>
        <button className={styles.mobileMenu} aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
        <div className={styles.breadcrumb}><span>Admin</span><b>/</b><strong>{activeSection}</strong></div>
        <div className={styles.topActions}><span className={styles.modePill}>{mode === 'local' ? 'LOCAL STORAGE' : 'LIVE API'}</span><button aria-label="Notifications"><Bell size={17} /></button><span className={styles.userChip}><i>DA</i><span><strong>{mode === 'local' ? 'Demo admin' : admin.email}</strong><small>Administrator</small></span></span><button aria-label="Sign out" onClick={signOut}><LogOut size={16} /></button></div>
      </header>
      <div className={styles.content}>
        <div className={styles.pageHeading}><div><span className={styles.eyebrow}>DIGITAL ASSET HUB · OPERATIONS</span><h1>{activeSection}</h1><p>{currentSection.kind ? `Review and manage ${activeSection.toLowerCase()} activity.` : activeSection === 'Overview' ? 'A clear view of activity across your digital money operations.' : activeSection === 'Rates' ? 'Maintain reference rates shown across the demo experience.' : 'Manage operational preferences for the platform.'}</p></div><span className={styles.dateLabel}><FileClock size={14} /> {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span></div>
        {error && <div className={styles.errorNotice} role="alert"><X size={15} />{error}</div>}
        {notice && <div className={styles.successNotice} role="status"><Check size={15} />{notice}</div>}
        {mode === 'local' && <div className={styles.demoNotice}><BadgeCheck size={15} /><span><strong>Demo workspace</strong> Changes are saved in this browser and are not connected to real customer accounts or payments.</span></div>}
        {activeSection === 'Overview' && <>
          <div className={styles.metricGrid}>
            <MetricCard label="Open reviews" value={metrics.pending} note="Items needing attention" icon={FileClock} tone="amber" />
            <MetricCard label="Trades" value={metrics.trades} note="All recorded exchanges" icon={Bitcoin} tone="green" />
            <MetricCard label="Bill payments" value={metrics.bills} note="Utility activity" icon={Zap} tone="blue" />
            <MetricCard label="Customers" value={metrics.customers} note="Registered profiles" icon={Users} tone="red" />
          </div>
          <div className={styles.overviewGrid}>
            <section className={styles.panel}><div className={styles.panelHeading}><div><span>ACTIVITY</span><h2>Recent operations</h2></div><button onClick={() => setActiveSection('Trades')}>Review queue <ArrowUpRight size={14} /></button></div><RecordTable records={recent} kind="recent" readOnly /></section>
            <aside className={styles.panel + ' ' + styles.healthPanel}><div className={styles.panelHeading}><div><span>SYSTEM STATUS</span><h2>Service health</h2></div><span className={styles.healthy}><i /> Healthy</span></div><div className={styles.healthRow}><span><Activity size={15} /> Admin workspace</span><strong>Operational</strong></div><div className={styles.healthRow}><span><Wallet size={15} /> Payment providers</span><strong className={styles.notConnected}>Not connected</strong></div><div className={styles.healthRow}><span><BriefcaseBusiness size={15} /> Data storage</span><strong>{mode === 'local' ? 'This browser' : 'MongoDB'}</strong></div><div className={styles.healthFoot}><ShieldCheck size={15} /><span>Money movement is not enabled by this admin template.</span></div></aside>
          </div>
        </>}
        {currentSection.kind && <section className={styles.panel}><div className={styles.panelHeading}><div><span>RECORDS · {currentRecords.length}</span><h2>{activeSection} queue</h2></div><label className={styles.search}><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" /></label></div><RecordTable records={filteredRecords} kind={currentSection.kind} busy={busy} onUpdate={updateRecord} /></section>}
        {activeSection === 'Rates' && <form className={styles.panel} onSubmit={saveSettings}><div className={styles.panelHeading}><div><span>MARKET CONFIGURATION</span><h2>Reference rates</h2></div><button className={styles.saveButton} disabled={busy}><Check size={14} /> Save rates</button></div><p className={styles.panelIntro}>Demo values for display only. Do not use these figures to quote or settle real transactions.</p><div className={styles.rateTable}><div className={styles.rateHead}><span>ASSET</span><span>RATE</span><span>CURRENCY</span></div>{data.settings.rates.map((rate, index) => <div className={styles.rateRow} key={rate.asset}><strong>{rate.asset}</strong><label><span>$</span><input type="number" min="0" step="0.0001" value={rate.payoutRate} onChange={(event) => updateRate(index, 'payoutRate', event.target.value)} /></label><select value={rate.currency} onChange={(event) => updateRate(index, 'currency', event.target.value)}><option>USD</option><option>NGN</option><option>GHS</option></select></div>)}</div></form>}
        {activeSection === 'Settings' && <form className={styles.panel + ' ' + styles.settingsPanel} onSubmit={saveSettings}><div className={styles.panelHeading}><div><span>WORKSPACE CONFIGURATION</span><h2>Platform settings</h2></div><button className={styles.saveButton} disabled={busy}><Check size={14} /> Save settings</button></div><label className={styles.formLabel}>Support contact email<input type="email" value={data.settings.supportEmail} onChange={(event) => setData({ ...data, settings: { ...data.settings, supportEmail: event.target.value } })} required /></label><div className={styles.settingRow}><span><strong>Maintenance mode</strong><small>Show a maintenance notice in the management workspace. This does not block public routes.</small></span><button type="button" className={`${styles.toggle} ${data.settings.maintenanceMode ? styles.toggleOn : ''}`} aria-pressed={data.settings.maintenanceMode} onClick={() => setData({ ...data, settings: { ...data.settings, maintenanceMode: !data.settings.maintenanceMode } })}><i /></button></div><div className={styles.securityNote}><ShieldCheck size={17} /><span><strong>Security boundary</strong><small>Use the backend edition for real authentication. The React localStorage admin is a browser-only prototype and must not manage live financial data.</small></span></div></form>}
        <footer className={styles.footer}><span>Digital Asset Hub · Operations</span><span>{mode === 'local' ? 'Local demo data' : 'Authenticated backend session'}</span></footer>
      </div>
    </main>
  </div>
}

function RecordTable({ records, kind, busy, onUpdate, readOnly = false }) {
  if (!records?.length) return <div className={styles.emptyState}><span><Search size={18} /></span><strong>No records found</strong><small>New {kind === 'recent' ? 'activity' : `${kind} records`} will appear here when available.</small></div>
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>REFERENCE</th><th>CUSTOMER</th><th>ITEM</th><th>AMOUNT</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{records.map((record) => <tr key={record._id || record.id}><td><strong className={styles.reference}>{record.reference}</strong></td><td><span className={styles.customerName}>{record.customerName}</span><small className={styles.customerEmail}>{record.email}</small></td><td><span className={styles.itemName}>{record.item}</span><small className={styles.customerEmail}>{record.detail}</small></td><td>{kind === 'customer' ? '—' : formatCurrency(record.amount, record.currency)}</td><td>{formatDate(record.createdAt)}</td><td>{readOnly ? <Status value={record.status} /> : <label className={styles.statusControl} aria-label={`Update status for ${record.reference}`}><Status value={record.status} /><select value={record.status} disabled={busy} onChange={(event) => onUpdate(record, kind === 'customer' ? { status: event.target.value, active: event.target.value === 'active' } : { status: event.target.value })}>{(STATUS_OPTIONS[kind] || STATUS_OPTIONS.trade).map((status) => <option key={status} value={status}>{status}</option>)}</select><ChevronDown size={12} /></label>}</td></tr>)}</tbody></table></div>
}