import { useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, ArrowUpRight,
  Bell, Building2, Check, ChevronDown, ChevronLeft, ChevronRight,
  Clock3, CreditCard, Download, Eye, FileCheck2, FileText, Fingerprint,
  History, LayoutDashboard, LockKeyhole, LogOut, Menu, MoreHorizontal,
  Plus, Search, Settings, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal,
  Sparkles, Wallet, WalletCards, X, Zap,
} from 'lucide-react'
import './App.css'

const navGroups = [
  { title: 'OPERATIONS', items: [
    { path: '/overview', label: 'Overview', Icon: LayoutDashboard },
    { path: '/ledger', label: 'Ledger & Settlements', Icon: Activity },
    { path: '/virtual-cards', label: 'Virtual Cards', Icon: CreditCard, count: '6' },
    { path: '/payouts', label: 'Payouts', Icon: Wallet, count: '4' },
    { path: '/kyc', label: 'KYC & Compliance', Icon: ShieldCheck, count: '3', alert: true },
  ] },
  { title: 'SYSTEM', items: [
    { path: '/wallets', label: 'Wallets', Icon: WalletCards },
    { path: '/audit', label: 'Audit Logs', Icon: History },
    { path: '/settings', label: 'Settings', Icon: Settings },
  ] },
]

const ledgerSeed = [
  { id: 'TXN-09080', customer: 'Chidi Eze', initials: 'CE', type: 'Gift Card Trade', amount: '$500.00', provider: 'Apple Gift Card', status: 'Successful', date: 'Nov 01, 09:21', tone: 'green' },
  { id: 'TXN-09079', customer: 'Sofia Marin', initials: 'SM', type: 'Wallet Funding', amount: '$4,280.00', provider: 'Stripe', status: 'Successful', date: 'Nov 01, 09:18', tone: 'pink' },
  { id: 'TXN-09078', customer: 'Daniel Osei', initials: 'DO', type: 'Payout', amount: '$2,950.00', provider: 'Paystack', status: 'Pending Review', date: 'Nov 01, 09:12', tone: 'blue' },
  { id: 'TXN-09077', customer: 'Lina Hoffman', initials: 'LH', type: 'Card Spend', amount: '$129.50', provider: 'Virtual Card', status: 'Successful', date: 'Nov 01, 09:02', tone: 'amber' },
  { id: 'TXN-09076', customer: 'Ola Adebayo', initials: 'OA', type: 'Wallet Funding', amount: '$6,450.00', provider: 'Crypto Wallet', status: 'Pending Review', date: 'Nov 01, 08:54', tone: 'lavender' },
  { id: 'TXN-09075', customer: 'Amara Diallo', initials: 'AD', type: 'Gift Card Trade', amount: '$1,000.00', provider: 'Steam Code', status: 'Failed', date: 'Nov 01, 08:41', tone: 'coral' },
  { id: 'TXN-09074', customer: 'Yusuf Bello', initials: 'YB', type: 'Payout', amount: '$850.00', provider: 'Paystack', status: 'Successful', date: 'Nov 01, 08:32', tone: 'green' },
  { id: 'TXN-09073', customer: 'Priya Nair', initials: 'PN', type: 'Wallet Funding', amount: '$2,100.00', provider: 'Stripe', status: 'Successful', date: 'Nov 01, 08:14', tone: 'blue' },
]

const cardsSeed = [
  { holder: 'Chidi Eze · Travel', initials: 'CE', number: '•••• 4242', balance: '$4,250.00', spent: '$750.00', percent: 84, status: 'Active', tone: 'purple', scheme: 'VISA' },
  { holder: 'Chidi Eze · Travel', initials: 'CE', number: '•••• 8810', balance: '$1,278.00', spent: '$1,722.00', percent: 43, status: 'Active', tone: 'teal', scheme: 'Mastercard' },
  { holder: 'Vendor Escrow #7', initials: 'VE', number: '•••• 3091', balance: '$0.00', spent: '$5,000.00', percent: 0, status: 'Frozen', tone: 'red', scheme: 'VISA' },
]

const reviewSeed = [
  { name: 'Amara Diallo', initials: 'AD', detail: 'Customer since 2023 · Nigeria · Tier 2', status: 'Urgent', tone: 'coral' },
  { name: 'Daniel Osei', initials: 'DO', detail: 'Customer since 2024 · Ghana · Tier 2', status: 'Urgent', tone: 'blue' },
  { name: 'Yusuf Bello', initials: 'YB', detail: 'Customer since 2022 · Nigeria · Tier 1', status: 'Pending', tone: 'green' },
  { name: 'Priya Nair', initials: 'PN', detail: 'Customer since 2024 · India · Tier 2', status: 'Pending', tone: 'pink' },
]

function Avatar({ initials, tone = 'purple', compact = false }) {
  return <span className={`avatar avatar-${tone}${compact ? ' avatar-compact' : ''}`}>{initials}</span>
}

function Brand() {
  return <a className="brand" href="/overview"><span className="brand-mark"><Sparkles size={13} /></span><span>Northbeam Pay<small>Fintech Operations</small></span></a>
}

function Sidebar({ path, open, onClose }) {
  return <>
    {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      <div className="sidebar-head"><Brand /><button className="icon-btn sidebar-close" aria-label="Close navigation" onClick={onClose}><X size={15} /></button></div>
      <button className="org-switch"><span className="org-icon">O</span><span><b>Org: Green Global Ltd</b><small>Operations workspace</small></span><ChevronDown size={12} /></button>
      {navGroups.map((group) => <div className="nav-group" key={group.title}><span className="nav-label">{group.title}</span><nav aria-label={group.title}>{group.items.map(({ path: href, label, Icon, count, alert }) => <a href={href} key={href} onClick={onClose} className={path === href ? 'active' : ''}><Icon size={14} /><span>{label}</span>{count && <small className={alert ? 'nav-count alert' : 'nav-count'}>{count}</small>}</a>)}</nav></div>)}
      <div className="sidebar-bottom">
        <div className="system-health"><span><i />System health</span><b>99.9%</b><small>All services operational</small></div>
        <a className="operator-profile" href="/settings"><Avatar initials="AD" tone="blue" compact /><span><b>Amara Diallo</b><small>Super Admin · Northbeam</small></span><LogOut size={13} /></a>
      </div>
    </aside>
  </>
}

function Ticker() {
  const rates = [['LIVE RATES', 'USD/NGN', '1,642.50', '+0.4%', 'up'], ['EUR/USD', '1.0842', '-0.1%', 'down'], ['BTC/USD', '$67,420', '+2.1%', 'up'], ['USDT/NGN', '1,650.00', '+0.2%', 'up'], ['GOLD/OZ', '$2,745', '+0.6%', 'up']]
  return <div className="ticker"><span className="ticker-live"><i /> LIVE RATES</span>{rates.slice(1).map((rate, index) => <span className="ticker-rate" key={index}><b>{rate[0]}</b> {rate[1]} <i className={rate[2] === '-0.1%' ? 'down' : ''}>{rate[2]}</i></span>)}</div>
}

function Topbar({ pageTitle, onMenu }) {
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  return <><Ticker /><header className="topbar"><button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu size={17} /></button><div className="topbar-title"><span>Org: Green Global Ltd</span><ChevronRight size={12} /><b>{pageTitle}</b></div><label className="global-search"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tx, wallet, user, hash..." aria-label="Search dashboard" /></label><div className="topbar-actions"><span className="environment-tag"><i /> LIVE</span><button className="icon-btn" aria-label="Notifications" onClick={() => setNotice(notice ? '' : 'You’re all caught up on notifications.')}><Bell size={14} /><i /></button><a className="user-chip" href="/settings"><Avatar initials="AD" tone="blue" compact /><span>Amara</span><ChevronDown size={11} /></a></div></header>{notice && <div className="top-notice">{notice}<button onClick={() => setNotice('')}><X size={12} /></button></div>}</>
}

function PageTitle({ eyebrow, title, description, actions }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div><div className="page-actions">{actions}</div></div>
}

function Button({ children, href, onClick, variant = 'outline', type = 'button' }) {
  const className = `${variant}-button`
  return href ? <a className={className} href={href}>{children}</a> : <button className={className} type={type} onClick={onClick}>{children}</button>
}

function MetricCard({ label, value, change, tone = 'green', Icon = Activity, subline }) {
  return <article className="metric-card"><div className="metric-label"><span>{label}</span><Icon size={14} /></div><b>{value}</b><div className="metric-change"><span className={`change-pill ${tone}`}>{change}</span><small>{subline}</small></div></article>
}

function exportCsv(name, rows) {
  const csv = rows.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  link.download = name
  link.click()
  URL.revokeObjectURL(link.href)
}

function Status({ children }) {
  const statusClass = children.toLowerCase().replaceAll(' ', '-')
  return <span className={`status status-${statusClass}`}><i />{children}</span>
}

function LedgerPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All types')
  const [status, setStatus] = useState('All statuses')
  const [activeTab, setActiveTab] = useState('All (2,840)')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState('')
  const transactions = useMemo(() => ledgerSeed.filter((row) => `${row.id} ${row.customer} ${row.type} ${row.provider}`.toLowerCase().includes(query.toLowerCase()) && (type === 'All types' || row.type === type) && (status === 'All statuses' || row.status === status) && (activeTab === 'All (2,840)' || row.status === activeTab)), [query, type, status, activeTab])
  const tabs = ['All (2,840)', 'Successful', 'Pending Review', 'Failed']
  function csv() { exportCsv('northbeam-transactions.csv', [['Transaction ID', 'Customer', 'Type', 'Amount', 'Provider', 'Status', 'Date'], ...transactions.map((row) => [row.id, row.customer, row.type, row.amount, row.provider, row.status, row.date])]) }
  return <><PageTitle eyebrow="MONEY MOVEMENT" title="Money Movement Control" description="Ledger, cards, payouts and compliance in one secure console." actions={<><Button onClick={() => setToast('Reconciliation started in the demo workspace.')}>◎ Reconcile</Button><Button href="/checkout" variant="primary">＋ New payout</Button></>} />
    <div className="ledger-toolbar"><label className="search-control"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tx id, wallet, user, hash..." /><kbd>⌘ K</kbd></label><div className="toolbar-spacer" /><button className="outline-button" onClick={() => setToast('Date range: Oct 25 – Nov 01')}><Clock3 size={12} /> Last 24h <ChevronDown size={11} /></button><button className="icon-btn" aria-label="Alerts" onClick={() => setToast('No urgent ledger alerts.')}><Bell size={13} /><i /></button><Button href="/checkout" variant="primary">＋ New payout</Button></div>
    <div className="quick-filters"><span className="quick-filter active">◉ Transaction ledger <b>2.4k</b></span><a className="quick-filter" href="/virtual-cards">▣ Cards & payouts</a><a className="quick-filter" href="/kyc">◉ KYC & compliance <b className="warning-count">3</b></a></div>
    <div className="metrics-grid"><MetricCard label="Total Volume (24h)" value="$1.24M" change="+12.4%" subline="vs previous 24h" Icon={ArrowUpRight} /><MetricCard label="Successful trades" value="4,820" change="+8.2%" subline="vs previous 24h" tone="purple" Icon={Check} /><MetricCard label="Pending escrow" value="$184,200" change="23 items" subline="awaiting review" tone="amber" Icon={Clock3} /><MetricCard label="Failed / flagged" value="$12,450" change="0.8% rate" subline="of total volume" tone="red" Icon={ShieldAlert} /></div>
    <section className="table-panel"><div className="panel-heading"><div><span className="blue-label">NEXUS LEDGER</span><h2>Transaction History & Settlements</h2></div><div className="ledger-controls"><Button onClick={() => setToast('Showing transactions from Oct 25 through Nov 01.')}>▣ Oct 25 – Nov 01</Button><label className="select-control"><span className="sr-only">Currency</span><select defaultValue="USD, EUR, NGN, BTC, USDT"><option>USD, EUR, NGN, BTC, USDT</option><option>USD</option><option>NGN</option><option>EUR</option></select><ChevronDown size={11} /></label><label className="select-control"><span className="sr-only">Transaction type filter</span><select value={type} onChange={(event) => setType(event.target.value)}><option>All types</option><option>Gift Card Trade</option><option>Wallet Funding</option><option>Payout</option><option>Card Spend</option></select><ChevronDown size={11} /></label><label className="select-control"><span className="sr-only">Transaction status filter</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Successful</option><option>Pending Review</option><option>Failed</option></select><ChevronDown size={11} /></label><Button onClick={csv}>♧ Export <ChevronDown size={11} /></Button></div></div>
      <div className="metric-strip"><span>Settled volume (24h) <b>$1,240,000</b></span><span>Net settlement <b className="positive">+$42,818</b></span><span>FX spread <b>0.42%</b></span><span className="strip-actions"><Button onClick={csv}>↓ CSV</Button><Button onClick={() => setToast('Column preferences are saved in this preview.')}>Columns</Button></span></div>
      <div className="table-tabs">{tabs.map((tab) => <button key={tab} className={activeTab === tab ? 'selected' : ''} onClick={() => { setActiveTab(tab); setPage(1) }}>{tab}</button>)}</div>
      <div className="table-scroll"><table className="ledger-table"><thead><tr><th>TRANSACTION ID</th><th>CUSTOMER</th><th>TYPE</th><th>AMOUNT</th><th>PROVIDER / ASSET</th><th>STATUS</th><th>DATE & TIME</th><th /></tr></thead><tbody>{transactions.slice((page - 1) * 5, page * 5).map((row) => <tr key={row.id}><td><a className="transaction-id" href={`/transaction?id=${row.id}`}>{row.id}</a></td><td><span className="customer-name"><Avatar initials={row.initials} tone={row.tone} compact />{row.customer}</span></td><td>{row.type}</td><td className="amount">{row.amount}</td><td>{row.provider}</td><td><Status>{row.status}</Status></td><td>{row.date}</td><td><button className="icon-btn row-more" aria-label={`More details for ${row.id}`} onClick={() => setToast(`${row.id} · ${row.customer} · ${row.status}`)}><MoreHorizontal size={14} /></button></td></tr>)}</tbody></table>{transactions.length === 0 && <div className="empty-state">No transactions match these filters.</div>}</div><div className="table-footer"><span>Showing {transactions.length ? (page - 1) * 5 + 1 : 0}–{Math.min(page * 5, transactions.length)} of {transactions.length} transactions</span><div><button disabled={page === 1} onClick={() => setPage(1)}><ChevronLeft size={12} /> Prev</button><button className="current">1</button><button disabled={transactions.length <= 5} onClick={() => setPage(2)}>2</button><button disabled={transactions.length <= 5} onClick={() => setPage(2)}>Next <ChevronRight size={12} /></button></div></div>
    </section>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function Toast({ message, onClose }) {
  return <div role="status" className="toast"><Check size={14} />{message}<button aria-label="Dismiss" onClick={onClose}><X size={13} /></button></div>
}

function VirtualCardsPage() {
  const [cards, setCards] = useState(cardsSeed)
  const [toast, setToast] = useState('')
  const [autoRules, setAutoRules] = useState(true)
  function addCard() { setCards((items) => [...items, { holder: 'New virtual card', initials: 'NC', number: `•••• ${Math.floor(1000 + Math.random() * 9000)}`, balance: '$0.00', spent: '$0.00', percent: 0, status: 'Active', tone: 'purple', scheme: 'VISA' }]); setToast('Virtual card created in the preview.') }
  function toggleCard(index) { setCards((items) => items.map((card, i) => i === index ? { ...card, status: card.status === 'Frozen' ? 'Active' : 'Frozen' } : card)) }
  return <><PageTitle eyebrow="CARD PROGRAM" title="Virtual Cards & Automated Payouts" description="Issue, control, and monitor secure virtual cards and automated payouts." actions={<><Button onClick={() => setAutoRules(!autoRules)}>⚙ Auto-payout rules: {autoRules ? 'On' : 'Off'}</Button><Button variant="primary" onClick={addCard}><Plus size={13} /> Issue card</Button></>} /><div className="card-metrics"><MetricCard label="Active cards" value={cards.filter((card) => card.status === 'Active').length} change="2 issued today" subline="across all workspaces" Icon={CreditCard} /><MetricCard label="Card spend (30d)" value="$24,850" change="+8.1%" subline="vs last month" tone="purple" Icon={Activity} /><MetricCard label="Automated payouts" value="98.6%" change="312 processed" subline="success rate" Icon={Zap} /></div><div className="virtual-card-grid">{cards.map((card, index) => <article className={`virtual-card card-${card.tone}`} key={card.number}><div className="virtual-card-top"><span>NORTHBEAM · VIRTUAL</span><Status>{card.status}</Status></div><div className="card-chip">▰</div><div className="card-number">{card.number}</div><div className="card-holder"><span><small>CARD HOLDER</small><b>{card.holder}</b></span><span><small>EXPIRES</small><b>08/27</b></span><b className="card-scheme">{card.scheme}</b></div><div className="card-balance"><b>{card.balance}</b><span>of $5,000.00 limit</span></div><div className="usage-progress"><i style={{ width: `${card.percent}%` }} /></div><div className="card-controls"><button onClick={() => toggleCard(index)}><LockKeyhole size={12} /> {card.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}</button><button onClick={() => setToast(`${card.holder} · Card limit: $5,000`)}><SlidersHorizontal size={12} /> Limit</button><button className="delete-card" aria-label={`Remove ${card.holder}`} onClick={() => setCards((items) => items.filter((_, i) => i !== index))}><X size={12} /></button></div></article>)}</div><section className="table-panel payout-panel"><div className="panel-heading"><div><span className="blue-label">AUTOMATED PAYOUTS</span><h2>Payout tracker</h2></div><div className="ledger-controls"><Button onClick={() => setToast('Gateway: All providers')}>Gateway: All <ChevronDown size={11} /></Button><Button variant="primary" onClick={() => setToast('Retry queue is empty.')}>Retry all failed <ArrowRight size={12} /></Button></div></div><div className="table-scroll"><table className="ledger-table"><thead><tr><th>PAYOUT ID</th><th>RECIPIENT</th><th>AMOUNT</th><th>GATEWAY</th><th>SPEED</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{[['PO-7712','GTM Labs — #421','$12,500.00','Wise','Instant','Successful'],['PO-7710','Ayo Fashions','$2,400.00','Paystack','$1.50','Processing'],['PO-7708','Clean Water Org','$5,800.00','Stripe','T+1','Completed'],['PO-7702','Kaila — #18','$890.00','Paystack','Instant','Failed']].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index === 0 ? <a className="transaction-id" href="/checkout">{cell}</a> : index === 5 ? <Status>{cell}</Status> : cell}</td>)}<td><Button onClick={() => setToast(`${row[0]} payout details opened.`)}>{row[5] === 'Failed' ? '↻ Retry' : '▤ Receipt'}</Button></td></tr>)}</tbody></table></div></section>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function KycPage() {
  const [reviews, setReviews] = useState(reviewSeed)
  const [selected, setSelected] = useState(reviewSeed[0])
  const [tier, setTier] = useState('Tier 2 · Verified')
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')
  const filtered = reviews.filter((review) => `${review.name} ${review.detail}`.toLowerCase().includes(query.toLowerCase()))
  function decide(decision) {
    setReviews((items) => items.filter((item) => item.name !== selected.name))
    setToast(`${selected.name}: ${decision.toLowerCase()} and recorded in the review preview.`)
    const remaining = reviews.filter((item) => item.name !== selected.name)
    setSelected(remaining[0] || reviewSeed[0])
  }
  return <><PageTitle eyebrow="RISK & COMPLIANCE" title="KYC & Compliance Verification Queue" description="Review customer identity, approve accounts, and resolve compliance flags." actions={<span className="sla-chip">SLA: 92% reviewed · 24h</span>} /><div className="kyc-metrics"><MetricCard label="Tier 1 · Approved" value="5,412" change="+124 this week" subline="basic verification" Icon={Check} /><MetricCard label="Tier 2 · Pending review" value={reviews.length} change="Review queue" subline="identity verification" tone="amber" Icon={Clock3} /><MetricCard label="Tier 3 · Flagged high-risk" value="11" change="3 urgent" subline="requires attention" tone="red" Icon={AlertTriangle} /></div><div className="kyc-workspace"><aside className="review-inbox"><div className="inbox-title"><h2>Review inbox</h2><span className="warning-count">{reviews.length} pending</span></div><label className="search-control"><Search size={12} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by name..." /></label><div className="review-list">{filtered.map((review) => <button key={review.name} className={selected?.name === review.name ? 'selected' : ''} onClick={() => setSelected(review)}><Avatar initials={review.initials} tone={review.tone} compact /><span><b>{review.name}</b><small>{review.detail}</small></span><Status>{review.status}</Status></button>)}</div><small className="inbox-queue">Queue updates in real time</small></aside><section className="review-detail">{selected ? <><div className="review-person"><Avatar initials={selected.initials} tone={selected.tone} /><div><h2>{selected.name}</h2><p>{selected.detail}</p></div><div className="risk-score"><b>28%</b><small>Risk score</small></div></div><div className="review-document-grid"><article className="document-preview"><div className="card-heading"><h3><FileText size={13} /> National ID · Front</h3><Status>Verified</Status></div><div className="document-placeholder"><FileCheck2 size={26} /><span>Identity document preview</span><small>Document image supplied for review</small></div><Button onClick={() => setToast('Document preview opened in this demo.')}>View full document <Eye size={12} /></Button></article><article className="identity-checks"><div className="card-heading"><h3><Fingerprint size={13} /> Data match · AI</h3><span className="positive">98.4% match</span></div><div className="identity-person"><Avatar initials={selected.initials} tone={selected.tone} /><span><b>{selected.name}</b><small>Document name matches profile</small></span></div><div className="match-row"><span>Face match</span><b>Passed <Check size={11} /></b><i /></div><div className="match-row"><span>Address check</span><b>Passed <Check size={11} /></b><i /></div></article></div><div className="account-controls"><h3>Account tier controls</h3><div>{['Tier 1 · Basic', 'Tier 2 · Verified', 'Tier 3 · Business'].map((option) => <button className={tier === option ? 'chosen' : ''} key={option} onClick={() => setTier(option)}><i />{option}</button>)}</div></div><div className="review-actions"><button className="approve-button" onClick={() => decide('Approved')}><Check size={13} /> Approve KYC</button><button className="reject-button" onClick={() => decide('Rejected')}><X size={13} /> Reject & re-upload</button><button className="audit-button" onClick={() => setToast(`${selected.name} · Full audit trail opened.`)}>▤ Full audit</button></div><p className="review-foot">Decisions are logged to the immutable audit trail.</p></> : <div className="empty-state">No customers in the review queue.</div>}</section></div>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function PayoutsPage() {
  const [toast, setToast] = useState('')
  return <><PageTitle eyebrow="TREASURY OPERATIONS" title="Payouts" description="Review outgoing payments, track delivery status, and create new payouts." actions={<Button href="/checkout" variant="primary"><Plus size={13} /> New payout</Button>} /><div className="metrics-grid"><MetricCard label="Payout volume today" value="$42,890" change="+6.8%" subline="vs yesterday" /><MetricCard label="Awaiting approval" value="4" change="$8,430 total" tone="amber" subline="needs review" Icon={Clock3} /><MetricCard label="Completed this month" value="1,204" change="99.2% success" subline="average 14 min" tone="purple" Icon={Check} /></div><section className="table-panel"><div className="panel-heading"><div><span className="blue-label">PAYOUT MANAGEMENT</span><h2>Recent payouts</h2></div><Button onClick={() => setToast('Exported payout list.')}>↓ Export</Button></div><div className="table-scroll"><table className="ledger-table"><thead><tr><th>PAYOUT ID</th><th>RECIPIENT</th><th>DESTINATION</th><th>AMOUNT</th><th>GATEWAY</th><th>STATUS</th><th>DATE</th><th>ACTION</th></tr></thead><tbody>{[['PO-7712','GTM Labs','GTBank ···· 4210','$12,500.00','Wise','Successful','Nov 01'],['PO-7710','Ayo Fashions','Access ···· 2231','$2,400.00','Paystack','Processing','Nov 01'],['PO-7708','Clean Water Org','UBA ···· 7418','$5,800.00','Stripe','Pending Review','Oct 31'],['PO-7702','Kaila Stores','Opay ···· 8820','$890.00','Paystack','Failed','Oct 31']].map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i === 0 ? <a className="transaction-id" href="/checkout">{cell}</a> : i === 5 ? <Status>{cell}</Status> : cell}</td>)}<td><Button onClick={() => setToast(`${row[0]} · ${row[5]}`)}>Details</Button></td></tr>)}</tbody></table></div></section>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

function WalletsPage() {
  const [toast, setToast] = useState('')
  return <><PageTitle eyebrow="TREASURY" title="Wallets" description="Monitor balances, reserves, and settlement accounts across currencies." actions={<Button onClick={() => setToast('Wallet creation is available after connecting your ledger provider.')}><Plus size={13} /> Add wallet</Button>} /><div className="metrics-grid"><MetricCard label="Total wallet balances" value="$2.84M" change="+4.2%" subline="across 5 currencies" Icon={Wallet} /><MetricCard label="Available to settle" value="$1.92M" change="67.6%" subline="of total balance" tone="purple" /><MetricCard label="Held in escrow" value="$184,200" change="23 transactions" subline="release pending" tone="amber" /></div><div className="wallet-grid">{[['USD Wallet','$1,204,820.50','USD','Primary settlement','blue'],['NGN Wallet','₦842,000,450.00','NGN','Local payouts','green'],['EUR Wallet','€284,120.00','EUR','SEPA settlement','purple'],['USDT Wallet','₮510,400.00','USDT','TRC-20 · ERC-20','teal']].map((wallet) => <article className="wallet-card" key={wallet[2]}><div><span className={`currency-icon ${wallet[4]}`}>{wallet[2].slice(0, 1)}</span><span><b>{wallet[0]}</b><small>{wallet[3]}</small></span><button className="icon-btn" aria-label={`Wallet actions ${wallet[0]}`} onClick={() => setToast(`${wallet[0]} options opened.`)}><MoreHorizontal size={14} /></button></div><small>AVAILABLE BALANCE</small><h2>{wallet[1]}</h2><div className="wallet-actions"><Button onClick={() => setToast(`Transfer from ${wallet[0]} selected.`)}>Transfer</Button><Button href="/ledger">View ledger <ArrowRight size={11} /></Button></div></article>)}</div>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}

const auditEvents = [
  ['Nov 01 · 09:42','Amara Diallo','kyc.review_approved','Customer · AD-9021','Lagos, NG'],
  ['Nov 01 · 09:18','Daniel Osei','payout.created','PO-7712 · $12,500','Accra, GH'],
  ['Oct 31 · 16:04','Priya Nair','card.frozen','Virtual card ···· 3091','Mumbai, IN'],
  ['Oct 31 · 14:29','System','ledger.reconciled','Settlement batch · 4,820','Automated'],
  ['Oct 30 · 11:52','Amara Diallo','admin.login','Super Admin session','Lagos, NG'],
]

function AuditPage() {
  const [query, setQuery] = useState('')
  const rows = auditEvents.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase()))
  return <><PageTitle eyebrow="GOVERNANCE" title="Audit Logs" description="Searchable, immutable event history for financial and admin activity." actions={<Button onClick={() => exportCsv('northbeam-audit-log.csv', [['Timestamp','Actor','Event','Resource','Location'], ...rows])}><Download size={13} /> Export CSV</Button>} /><div className="metrics-grid"><MetricCard label="Events today" value="1,842" change="All systems" subline="logged successfully" /><MetricCard label="Admin actions" value="28" change="Last 24 hours" subline="across 4 operators" tone="purple" /><MetricCard label="Security alerts" value="2" change="1 needs review" subline="risk monitoring" tone="amber" Icon={ShieldAlert} /></div><section className="table-panel"><div className="panel-heading"><div><span className="blue-label">IMMUTABLE EVENT TRAIL</span><h2>Recent activity</h2></div><label className="search-control audit-search"><Search size={12} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events..." /></label></div><div className="table-scroll"><table className="ledger-table"><thead><tr><th>TIMESTAMP</th><th>ACTOR</th><th>EVENT</th><th>RESOURCE</th><th>LOCATION</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i === 2 ? <code className="event-code">{cell}</code> : cell}</td>)}<td><button className="icon-btn" aria-label={`View ${row[2]} details`}><Eye size={13} /></button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state">No events match your search.</div>}</div></section></>
}

function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [twoFactor, setTwoFactor] = useState(true)
  return <><PageTitle eyebrow="ADMINISTRATION" title="Organization Settings" description="Configure organization details, access security, and operational preferences." /><section className="settings-grid"><article className="settings-card"><div className="settings-section-head"><Building2 /><div><h2>Organization</h2><p>Workspace and business details.</p></div></div><label>Organization name<input defaultValue="Green Global Ltd" /></label><label>Operations email<input type="email" defaultValue="ops@greenglobal.example" /></label><label>Settlement currency<select defaultValue="USD"><option>USD</option><option>NGN</option><option>EUR</option></select></label></article><article className="settings-card"><div className="settings-section-head"><Shield /><div><h2>Security & access</h2><p>Protect sensitive financial operations.</p></div></div><div className="settings-switch"><span><b>Two-factor authentication</b><small>Require 2FA for admin accounts</small></span><button className={`toggle${twoFactor ? ' on' : ''}`} role="switch" aria-checked={twoFactor} aria-label="Toggle two-factor authentication" onClick={() => setTwoFactor(!twoFactor)}><i /></button></div><div className="settings-switch"><span><b>Require payout approval</b><small>Second operator review for large payouts</small></span><button className="toggle on" role="switch" aria-checked="true" aria-label="Require payout approval"><i /></button></div><a href="/audit" className="text-button">Review audit log <ArrowRight size={12} /></a></article><article className="settings-card"><div className="settings-section-head"><Bell /><div><h2>Notifications</h2><p>Choose when operations teams are alerted.</p></div></div><div className="settings-switch"><span><b>Failed transactions</b><small>Notify operators when payments fail</small></span><button className="toggle on" role="switch" aria-checked="true" aria-label="Failed transaction notifications"><i /></button></div><div className="settings-switch"><span><b>KYC review queue</b><small>Alert when a new review is needed</small></span><button className="toggle on" role="switch" aria-checked="true" aria-label="KYC review notifications"><i /></button></div></article><div className="settings-save"><span>{saved ? 'Changes saved in this preview.' : 'Changes are saved to this local preview only.'}</span><Button variant="primary" onClick={() => setSaved(true)}>{saved ? <><Check size={13} /> Saved</> : 'Save settings'}</Button></div></section></>
}

function CheckoutPage() {
  const [complete, setComplete] = useState(false)
  const [method, setMethod] = useState('Bank transfer')
  return <div className="checkout-wrap"><a className="back-link" href="/payouts"><ArrowLeft size={13} /> Back to payouts</a><PageTitle eyebrow="NORTHBEAM PAY · SECURE CHECKOUT" title="Create a payout" description="Review the payout details before continuing." /><div className="checkout-grid"><form className="checkout-form" onSubmit={(event) => { event.preventDefault(); setComplete(true) }}><label>Recipient name<input placeholder="Business or customer name" required /></label><label>Recipient email<input type="email" placeholder="name@example.com" required /></label><label>Destination account<input placeholder="Bank account or wallet address" required /></label><label>Amount (USD)<input type="number" min="1" step="0.01" placeholder="0.00" required /></label><label>Payment method<select value={method} onChange={(event) => setMethod(event.target.value)}><option>Bank transfer</option><option>Virtual card</option><option>Crypto wallet</option></select></label>{complete ? <div className="checkout-success"><Check size={15} /> Payout preview prepared. No transfer was made.</div> : <button className="primary-button full-width" type="submit"><LockKeyhole size={13} /> Review secure payout <ArrowRight size={13} /></button>}<small className="demo-disclaimer">Demo only. Connect your payment processor and server-side authorization to transfer funds.</small></form><aside className="checkout-summary"><span className="currency-icon blue"><Wallet size={16} /></span><h2>Payout summary</h2><p>Funds are reviewed before settlement.</p><div><span>Processing fee</span><b>Calculated on confirmation</b></div><div><span>Settlement speed</span><b>Standard · 1–2 business days</b></div><div><span>Payment method</span><b>{method}</b></div><small><ShieldCheck size={12} /> Protected by Northbeam risk monitoring</small></aside></div></div>
}

function TransactionPage() {
  const params = new URLSearchParams(window.location.search)
  const transaction = ledgerSeed.find((row) => row.id === params.get('id')) || ledgerSeed[0]
  return <><a href="/ledger" className="back-link"><ArrowLeft size={13} /> Back to ledger</a><PageTitle eyebrow="TRANSACTION DETAIL" title={transaction.id} description="Review transaction metadata, settlement status, and audit history." actions={<Status>{transaction.status}</Status>} /><div className="transaction-detail-grid"><article className="settings-card"><h2>Transaction overview</h2>{[['Customer', transaction.customer],['Type', transaction.type],['Amount', transaction.amount],['Provider', transaction.provider],['Status', transaction.status],['Date & time', transaction.date]].map(([label, value]) => <div className="detail-row" key={label}><span>{label}</span><b>{value}</b></div>)}</article><article className="settings-card"><h2>Settlement timeline</h2>{[['Transaction initiated','Request received and validated','09:18'],['Risk screening','Automated checks passed','09:19'],['Provider processing','Waiting for provider confirmation','09:21'],['Settlement','Settlement details available after completion','—']].map(([title, detail, time], i) => <div className="timeline-row" key={title}><i className={i < 2 ? 'complete' : ''} /><span><b>{title}</b><small>{detail}</small></span><time>{time}</time></div>)}</article></div></>
}

function OverviewPage() {
  return <><PageTitle eyebrow="NORTHBEAM PAY · OPERATIONS" title="Operations Overview" description="Real-time health and money movement across your organization." actions={<Button href="/ledger">Open ledger <ArrowRight size={12} /></Button>} /><div className="metrics-grid"><MetricCard label="Total volume (24h)" value="$1.24M" change="+12.4%" subline="vs previous 24h" Icon={ArrowUpRight} /><MetricCard label="Successful transactions" value="4,820" change="98.7% success" subline="across all providers" tone="purple" Icon={Check} /><MetricCard label="Pending escrow" value="$184,200" change="23 items" subline="awaiting review" tone="amber" Icon={Clock3} /><MetricCard label="Compliance queue" value="14" change="3 urgent" subline="review required" tone="red" Icon={ShieldAlert} /></div><div className="overview-grid"><section className="table-panel"><div className="panel-heading"><div><span className="blue-label">LATEST ACTIVITY</span><h2>Recent transactions</h2></div><a className="text-link" href="/ledger">View all <ArrowRight size={12} /></a></div><div className="table-scroll"><table className="ledger-table"><thead><tr><th>ID</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th><th>TIME</th></tr></thead><tbody>{ledgerSeed.slice(0, 5).map((row) => <tr key={row.id}><td><a className="transaction-id" href={`/transaction?id=${row.id}`}>{row.id}</a></td><td>{row.customer}</td><td className="amount">{row.amount}</td><td><Status>{row.status}</Status></td><td>{row.date}</td></tr>)}</tbody></table></div></section><section className="overview-shortcuts"><h2>Quick actions</h2><a href="/checkout"><Wallet /> Create a payout <ArrowRight /></a><a href="/virtual-cards"><CreditCard /> Issue a virtual card <ArrowRight /></a><a href="/kyc"><ShieldCheck /> Review KYC queue <ArrowRight /></a><a href="/audit"><History /> Open audit logs <ArrowRight /></a><a href="/wallets"><WalletCards /> Check wallet balances <ArrowRight /></a></section></div><div className="provider-strip"><span><i /> Stripe operational</span><span><i /> Paystack operational</span><span><i /> Wise operational</span><a href="/settings">System settings <ArrowRight size={12} /></a></div></>
}

function NotFound() {
  return <div className="not-found"><span className="eyebrow">404 · NOT FOUND</span><h1>This page isn’t in your workspace.</h1><p>Choose a Northbeam operations page from the navigation.</p><Button href="/overview" variant="primary">Back to overview <ArrowRight size={13} /></Button></div>
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/overview'
  const [mobileOpen, setMobileOpen] = useState(false)
  const pageTitles = {
    '/overview': 'Overview',
    '/ledger': 'Ledger & Settlements',
    '/virtual-cards': 'Virtual Cards',
    '/payouts': 'Payouts',
    '/kyc': 'KYC & Compliance',
    '/wallets': 'Wallets',
    '/audit': 'Audit Logs',
    '/settings': 'Settings',
    '/checkout': 'Secure Checkout',
    '/transaction': 'Transaction Details',
  }
  const pages = {
    '/': <OverviewPage />,
    '/overview': <OverviewPage />,
    '/ledger': <LedgerPage />,
    '/virtual-cards': <VirtualCardsPage />,
    '/payouts': <PayoutsPage />,
    '/kyc': <KycPage />,
    '/wallets': <WalletsPage />,
    '/audit': <AuditPage />,
    '/settings': <SettingsPage />,
    '/checkout': <CheckoutPage />,
    '/transaction': <TransactionPage />,
  }
  return <div className="admin-app"><Sidebar path={path} open={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="main-shell"><Topbar pageTitle={pageTitles[path] || 'Operations'} onMenu={() => setMobileOpen(true)} /><main className="content"><div className="breadcrumbs"><a href="/overview">Operations</a><ChevronRight size={12} /><span>Green Global Ltd</span><ChevronRight size={12} /><b>{pageTitles[path] || 'Not found'}</b></div>{pages[path] || <NotFound />}</main><footer className="app-footer"><span>© 2025 Northbeam Pay · Operations console</span><div><a href="/settings">Privacy & security</a><a href="/audit">Audit trail</a></div></footer></div></div>
}

export default App
