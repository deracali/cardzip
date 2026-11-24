import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, CircleUserRound, Clock3, CreditCard, FileClock, Headphones, LogOut, Search, ShieldCheck, Wallet, X, Zap } from 'lucide-react'
import styles from './ClientConsole.module.css'

async function request(apiBaseUrl, path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options,
    })
  } catch (error) {
    throw new Error(`Could not connect to your account service: ${error.message}`)
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const apiError = new Error(data.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  return data
}

function money(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(amount) || 0)
}

function date(value) {
  return value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—'
}

export function AccountAccess({ apiBaseUrl, signup = false }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    request(apiBaseUrl, '/auth/me').then(() => {
      if (active) window.location.replace('/dashboard')
    }).catch(() => {})
    return () => { active = false }
  }, [apiBaseUrl, mode])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await request(apiBaseUrl, signup ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify({ ...(signup ? { name } : {}), email, password }),
      })
      const requestedPath = new URLSearchParams(window.location.search).get('next')
      const nextPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/dashboard'
      window.location.replace(nextPath)
    } catch (authError) {
      setError(authError.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className={styles.authPage}>
    <a className={styles.authBrand} href="/"><img src="/digital-asset-hub-logo.svg" alt="Digital Asset Hub" /></a>
    <form className={styles.authPanel} onSubmit={submit}>
      <span className={styles.authIcon}><CircleUserRound size={20} /></span>
      <span className={styles.eyebrow}>CLIENT ACCOUNT</span>
      <h1>{signup ? 'Create your account' : 'Sign in to your account'}</h1>
      <p>{signup ? 'Your account keeps your activity and support requests in one place.' : 'Review your Digital Asset Hub activity and account details.'}</p>
      {signup && <><label htmlFor="client-name">Full name</label><input id="client-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required /></>}
      <label htmlFor="client-email">Email address</label><input id="client-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
      <label htmlFor="client-password">Password</label><input id="client-password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={signup ? 8 : undefined} maxLength={128} required />
      {error && <div className={styles.error} role="alert">{error}</div>}
      <button className={styles.primaryButton} disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
      <small className={styles.authFoot}>Protected client account · Passwords are stored as salted hashes</small>
      <span className={styles.authSwitch}>{signup ? 'Already registered?' : 'New to Digital Asset Hub?'} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</a></span>
    </form>
    <a className={styles.backLink} href="/">← Back to the public website</a>
  </main>
}

const STATIC_CLIENT = {
  name: 'Maya Okafor',
  email: 'maya@example.com',
  createdAt: '2026-10-02T10:00:00.000Z',
}

const STATIC_RECORDS = [
  { _id: 'trade-208512', kind: 'trade', reference: 'TRD-208512', item: 'Amazon US · $100 gift card', amount: 84, currency: 'USD', status: 'completed', createdAt: '2026-11-16T10:42:00.000Z' },
  { _id: 'bill-30418', kind: 'bill', reference: 'BIL-30418', item: 'Ikeja Electric · prepaid', amount: 20, currency: 'USD', status: 'completed', createdAt: '2026-11-16T09:44:00.000Z' },
  { _id: 'card-11804', kind: 'card', reference: 'VCC-11804', item: 'Virtual USD card · •••• 4821', amount: 5, currency: 'USD', status: 'active', createdAt: '2026-11-14T11:22:00.000Z' },
  { _id: 'support-8821', kind: 'support', reference: 'SUP-8821', item: 'Trade verification question', amount: 0, currency: 'USD', status: 'open', createdAt: '2026-11-16T10:16:00.000Z' },
]

export default function ClientConsole({ apiBaseUrl = '', mode = 'api' }) {
  const [client, setClient] = useState(null)
  const [records, setRecords] = useState([])
  const [totals, setTotals] = useState({ trades: 0, bills: 0, cards: 0, openSupport: 0 })
  const [section, setSection] = useState('Overview')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (mode === 'local') {
          if (!active) return
          setClient(STATIC_CLIENT)
          setRecords(STATIC_RECORDS)
          setTotals({ trades: 1, bills: 1, cards: 1, openSupport: 1 })
          setLoading(false)
          return
        }
        const [session, dashboard] = await Promise.all([
          request(apiBaseUrl, '/auth/me'),
          request(apiBaseUrl, '/client/overview'),
        ])
        if (!active) return
        setClient(session.user)
        setRecords(dashboard.records || [])
        setTotals(dashboard.totals || { trades: 0, bills: 0, cards: 0, openSupport: 0 })
      } catch (loadError) {
        if (!active) return
        if (loadError.status === 401 || loadError.status === 403) window.location.replace('/login?next=%2Fdashboard')
        else setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, mode])

  const visibleRecords = useMemo(() => records.filter((record) => {
    const matchesFilter = filter === 'all' || record.kind === filter
    const text = `${record.reference} ${record.item} ${record.status}`.toLowerCase()
    return matchesFilter && text.includes(query.trim().toLowerCase())
  }), [filter, query, records])

  async function signOut() {
    if (mode === 'local') {
      localStorage.removeItem('dah-client-demo-session')
      window.location.replace('/')
      return
    }
    try { await request(apiBaseUrl, '/auth/logout', { method: 'POST' }) } finally { window.location.replace('/') }
  }

  if (loading) return <div className={styles.loading}><span /> Loading your account</div>

  return <div className={styles.clientShell}>
    <aside className={styles.sidebar}>
      <a className={styles.clientBrand} href="/"><img src="/digital-asset-hub-logo.svg" alt="Digital Asset Hub" /></a>
      <div className={styles.profile}><span>{client?.name?.slice(0, 1).toUpperCase() || 'C'}</span><div><strong>{client?.name || 'Client'}</strong><small>Personal account</small></div></div>
      <nav aria-label="Client dashboard pages"><small>MY ACCOUNT</small>{[
        ['Overview', Activity],
        ['Wallet', Wallet],
        ['Trades', BitcoinMark],
        ['Bills', Zap],
        ['Virtual cards', CreditCard],
        ['Activity', FileClock],
        ['Support', Headphones],
        ['Account', CircleUserRound],
      ].map(([item, Icon]) => <button key={item} className={section === item ? styles.activeNav : ''} onClick={() => setSection(item)}>{Icon === BitcoinMark ? <BitcoinMark /> : <Icon size={16} />}{item}</button>)}</nav>
      <div className={styles.sidebarBottom}><a href="/rates"><ArrowUpRight size={14} /> Explore services</a><button onClick={signOut}><LogOut size={14} /> Sign out</button></div>
    </aside>
    <main className={styles.main}>
      <header className={styles.topbar}>
        <span>Client portal <b>/</b> {section}</span>
        <div className={styles.topActions}>
          <button type="button" className={styles.notificationButton} aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={16} /><i /></button>
          <span className={styles.secure}><ShieldCheck size={14} /> Secure session</span>
        </div>
        {notificationsOpen && <aside className={styles.notificationPanel} aria-label="Notifications">
          <div className={styles.notificationHeading}><strong>Notifications</strong><button type="button" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)}><X size={14} /></button></div>
          {(records.length ? records.slice(0, 4) : STATIC_RECORDS).map((record) => <a href="/activity" key={record._id} onClick={() => setNotificationsOpen(false)}><span>{record.kind === 'support' ? <Headphones size={14} /> : record.kind === 'trade' ? <Wallet size={14} /> : <CreditCard size={14} />}</span><div><strong>{record.item}</strong><small>{record.status} · {date(record.createdAt)}</small></div></a>)}
        </aside>}
      </header>
      <div className={styles.content}>
        <div className={styles.heading}><div><small>DIGITAL ASSET HUB</small><h1>{section === 'Overview' ? `Welcome, ${client?.name?.split(' ')[0] || 'back'}` : section}</h1><p>{section === 'Overview' ? 'Your account activity and support, together in one place.' : section === 'Wallet' ? 'Balance, deposits, withdrawals, and wallet activity.' : section === 'Trades' ? 'Gift card and crypto exchange transactions.' : section === 'Bills' ? 'Airtime, data, electricity, TV, and internet payments.' : section === 'Virtual cards' ? 'Your virtual USD card portfolio.' : section === 'Support' ? 'Open and resolved support conversations.' : section === 'Activity' ? 'Review the transactions and requests associated with your account.' : 'Review your account details and access preferences.'}</p></div><a href="/rates">Explore services <ArrowRight size={14} /></a></div>
        {error && <div className={styles.error} role="alert">{error}</div>}
        {section === 'Overview' && <>
          <div className={styles.metrics}><Metric icon={Wallet} label="Trades" value={totals.trades} /><Metric icon={Zap} label="Bill payments" value={totals.bills} /><Metric icon={CreditCard} label="Virtual cards" value={totals.cards} /><Metric icon={Headphones} label="Open support" value={totals.openSupport} /></div>
          <section className={styles.panel}><div className={styles.panelHeading}><div><small>RECENT ACTIVITY</small><h2>Latest records</h2></div><button onClick={() => setSection('Activity')}>View activity <ArrowRight size={13} /></button></div><RecordList records={records.slice(0, 5)} /></section>
          <div className={styles.notice}><ShieldCheck size={16} /><span><strong>Account privacy</strong><small>This dashboard shows records linked to your signed-in email only. Contact support if an item looks unfamiliar.</small></span></div>
        </>}
        {section === 'Wallet' && <><div className={styles.metrics}><Metric icon={Wallet} label="Available balance" value="$1,240.00" /><Metric icon={ArrowUpRight} label="Deposits" value="$1,420.00" /><Metric icon={ArrowDownLeft} label="Withdrawals" value="$180.00" /><Metric icon={CreditCard} label="Cards funded" value="$250.00" /></div><section className={styles.panel}><div className={styles.panelHeading}><div><small>WALLET ACTIONS</small><h2>Manage your money</h2></div></div><div className={styles.filters}><a className={styles.primaryButton} href="/add-money">Add money</a><a className={styles.signOutButton} href="/withdraw">Withdraw money</a><a className={styles.signOutButton} href="/activity">View activity</a></div></section></>}
        {section === 'Trades' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>GIFT CARDS & CRYPTO</small><h2>Trade history</h2></div><a href="/rates">New trade <ArrowRight size={13} /></a></div><RecordList records={records.filter((record) => record.kind === 'trade')} /></section>}
        {section === 'Bills' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>UTILITY PAYMENTS</small><h2>Bill history</h2></div><a href="/bills">Pay a bill <ArrowRight size={13} /></a></div><RecordList records={records.filter((record) => record.kind === 'bill')} /></section>}
        {section === 'Virtual cards' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>USD CARD PORTFOLIO</small><h2>Virtual cards</h2></div><a href="/virtual-cards">Manage cards <ArrowRight size={13} /></a></div><RecordList records={records.filter((record) => record.kind === 'card')} /></section>}
        {section === 'Support' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>YOUR SUPPORT REQUESTS</small><h2>Support center</h2></div><a href="/support">Create request <ArrowRight size={13} /></a></div><RecordList records={records.filter((record) => record.kind === 'support')} /></section>}
        {section === 'Activity' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>YOUR RECORDS · {records.length}</small><h2>Activity history</h2></div><div className={styles.filters}><label><Search size={14} /><input placeholder="Search activity" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All activity</option><option value="trade">Trades</option><option value="bill">Bills</option><option value="card">Virtual cards</option><option value="support">Support</option></select></div></div><RecordList records={visibleRecords} /></section>}
        {section === 'Account' && <section className={styles.panel + ' ' + styles.accountPanel}><div className={styles.panelHeading}><div><small>PROFILE</small><h2>Account details</h2></div></div><dl><div><dt>Full name</dt><dd>{client?.name}</dd></div><div><dt>Email address</dt><dd>{client?.email}</dd></div><div><dt>Account type</dt><dd>Client</dd></div><div><dt>Member since</dt><dd>{date(client?.createdAt)}</dd></div></dl><button className={styles.signOutButton} onClick={signOut}>Sign out securely <LogOut size={14} /></button></section>}
        <footer className={styles.footer}><span>Digital Asset Hub client portal</span><a href="/api">Help and support</a></footer>
      </div>
    </main>
  </div>
}

function Metric({ icon: Icon, label, value }) {
  return <article className={styles.metric}><span><Icon size={16} /></span><small>{label}</small><strong>{value}</strong></article>
}

function RecordList({ records }) {
  if (!records?.length) return <div className={styles.empty}><Clock3 size={22} /><strong>No activity yet</strong><small>Completed account activity will appear here.</small></div>
  return <div className={styles.records}>{records.map((record) => <article key={record._id} className={styles.record}><span className={styles.recordIcon}>{record.kind === 'trade' ? <BitcoinMark /> : record.kind === 'bill' ? <Zap size={16} /> : record.kind === 'card' ? <CreditCard size={16} /> : <Headphones size={16} />}</span><div className={styles.recordMain}><strong>{record.item}</strong><small>{record.reference} · {date(record.createdAt)}</small></div><span className={`${styles.status} ${styles[`status_${record.status}`] || ''}`}>{record.status}</span><strong className={styles.amount}>{record.kind === 'support' || record.kind === 'customer' ? '—' : money(record.amount, record.currency)}</strong></article>)}</div>
}

function BitcoinMark() {
  return <span className={styles.btcMark}>BTC</span>
}