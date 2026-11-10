import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Cable,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Gift,
  GraduationCap,
  Headphones,
  Home,
  Lightbulb,
  LockKeyhole,
  Menu,
  Phone,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import AdminApp from './admin/AdminApp'
import './App.css'

const networks = [
  { name: 'MTN', color: '#f5bf00', short: 'M' },
  { name: 'Airtel', color: '#f52d38', short: 'A' },
  { name: 'Glo', color: '#08a968', short: 'G' },
  { name: '9mobile', color: '#17243a', short: '9' },
]

const dataPlans = [
  { size: '1GB', duration: '30 days', price: 240 },
  { size: '2GB', duration: '30 days', price: 480 },
  { size: '3GB', duration: '30 days', price: 720 },
  { size: '5GB', duration: '30 days', price: 1180 },
  { size: '10GB', duration: '30 days', price: 2350 },
]

const serviceInfo = {
  airtime: { title: 'Buy Airtime', subtitle: 'Recharge any Nigerian network in seconds.', icon: Phone },
  data: { title: 'Buy Mobile Data', subtitle: 'Instant delivery. Save on every data plan.', icon: Wifi },
  electricity: { title: 'Pay Electricity', subtitle: 'Pay your electricity bill securely and get your token instantly.', icon: Lightbulb },
  cable: { title: 'Cable TV', subtitle: 'Renew your TV subscription without leaving home.', icon: Cable },
  education: { title: 'Education Payments', subtitle: 'Purchase exam pins and education vouchers.', icon: GraduationCap },
  'airtime-to-cash': { title: 'Airtime to Cash', subtitle: 'Convert eligible airtime into wallet credit.', icon: ArrowDownLeft },
}

const defaultTransactions = [
  { id: 'VT-82418', service: 'MTN 2GB Data', recipient: '0803 452 1890', date: 'Today, 10:42 AM', amount: 480, status: 'Successful' },
  { id: 'VT-82417', service: 'IKEC Prepaid N5,000', recipient: 'Token •• 0421', date: 'Today, 9:15 AM', amount: 5000, status: 'Successful' },
  { id: 'VT-82416', service: 'Airtel Airtime ₦1,000', recipient: '0808 221 9043', date: 'Yesterday, 8:20 PM', amount: 970, status: 'Pending' },
  { id: 'VT-82415', service: 'DSTV Compact', recipient: 'ICUC 10293847', date: 'Nov 01, 11:09 AM', amount: 12500, status: 'Successful' },
  { id: 'VT-82414', service: 'Glo 5GB Data', recipient: '0773 112 209', date: 'Oct 31, 7:02 PM', amount: 1150, status: 'Failed' },
]

const currency = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`
const loadTransactions = () => {
  const saved = window.localStorage.getItem('swift-topup-transactions')
  return saved ? JSON.parse(saved) : defaultTransactions
}

function NetworkMark({ network, small = false }) {
  const selected = networks.find((item) => item.name === network) || networks[0]
  return <span className={`network-mark${small ? ' network-mark-small' : ''}`} style={{ '--network-color': selected.color }}>{selected.short}</span>
}

function Brand({ inverse = false }) {
  return (
    <a className={`brand${inverse ? ' brand-inverse' : ''}`} href="/" aria-label="SwiftTopUp home">
      <span className="brand-icon"><Zap size={17} fill="currentColor" /></span>
      <span>SwiftTopUp<small>bill in seconds</small></span>
    </a>
  )
}

function PublicHeader() {
  return (
    <header className="public-header">
      <Brand />
      <nav className="public-nav" aria-label="Main navigation">
        <a href="/services">Services</a>
        <a href="/pricing">Pricing / Rates</a>
        <a href="/api">API Access</a>
        <a href="/faq">FAQs</a>
      </nav>
      <div className="header-actions">
        <a className="button button-outline button-small" href="/login">Log in</a>
        <a className="button button-primary button-small" href="/signup">Create Free Account</a>
      </div>
    </header>
  )
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-main">
        <div><Brand inverse /><p>Your fast, trusted VTU platform. Airtime, data &amp; bills in seconds.</p></div>
        <div><strong>Company</strong><a href="/services">Services</a><a href="/pricing">Pricing / Rates</a><a href="/referrals">Referral Program</a><a href="/admin">Admin portal</a></div>
        <div><strong>Support</strong><a href="/faq">FAQs</a><a href="/terms">Terms of Service</a><a href="/privacy">Privacy Policy</a><a href="mailto:support@swifttopup.ng">Contact support</a></div>
        <div><strong>Get started</strong><a href="/signup">Create a free account</a><a href="/login">Sign in</a><a href="/dashboard">Customer dashboard</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 SwiftTopUp Technologies. All rights reserved.</span><span>Secure payments · Built for Nigeria</span></div>
    </footer>
  )
}

function NetworkPicker({ selected, onChange }) {
  return (
    <div className="network-picker" role="group" aria-label="Select network">
      {networks.map((network) => (
        <button key={network.name} type="button" className={`network-choice${selected === network.name ? ' selected' : ''}`} onClick={() => onChange(network.name)} aria-pressed={selected === network.name}>
          <NetworkMark network={network.name} /> <span>{network.name}</span>
        </button>
      ))}
    </div>
  )
}

function QuickBuy() {
  const [service, setService] = useState('data')
  const [network, setNetwork] = useState('MTN')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState(480)
  const submit = (event) => {
    event.preventDefault()
    const query = new URLSearchParams({ network, phone, amount: String(amount) })
    window.location.href = `/${service}?${query.toString()}`
  }
  return (
    <form className="quick-buy-card" onSubmit={submit}>
      <div className="quick-tabs" role="tablist" aria-label="Choose a service">
        <button type="button" className={service === 'airtime' ? 'active' : ''} onClick={() => setService('airtime')}>Airtime</button>
        <button type="button" className={service === 'data' ? 'active' : ''} onClick={() => setService('data')}>Data</button>
        <button type="button" className="quick-muted" onClick={() => { window.location.href = '/electricity' }}>Electricity</button>
      </div>
      <div className="quick-field-label">Select network</div>
      <NetworkPicker selected={network} onChange={setNetwork} />
      <label className="quick-field-label" htmlFor="quick-phone">Phone number</label>
      <input id="quick-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 452 1890" pattern="[0-9+ ()-]{10,18}" value={phone} onChange={(event) => setPhone(event.target.value)} required />
      <label className="quick-field-label" htmlFor="quick-amount">Amount</label>
      <div className="quick-amounts">
        {[200, 500, 1000].map((value) => <button key={value} type="button" className={amount === value ? 'chosen' : ''} onClick={() => setAmount(value)}>{currency(value)}</button>)}
      </div>
      <div className="quick-summary"><span>You pay</span><strong>{currency(amount)} <small>₦{Math.round(amount * 1.03).toLocaleString('en-NG')} value</small></strong></div>
      <button className="button button-primary button-full" type="submit">Proceed to checkout <ArrowRight size={15} /></button>
      <div className="secure-note"><LockKeyhole size={12} /> Secured by Paystack · Instant delivery</div>
    </form>
  )
}

function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="landing-hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow"><span className="live-dot" /> 99.9% uptime · 2M+ Nigerians trust us</span>
              <h1>Instant Airtime, Cheap Data<br />&amp; Automated Bill Payments<br />in Seconds.</h1>
              <p>Buy MTN, Airtel, Glo &amp; 9mobile at up to 40% off. Fund with instant virtual accounts. Delivered 24/7 — even at 2AM.</p>
              <div className="hero-buttons"><a className="button button-primary" href="/signup">Create Free Account <ArrowRight size={16} /></a><a className="button button-dark-outline" href="/services"><CircleHelp size={15} /> See how it works</a></div>
              <div className="hero-stats"><div><strong>₦50M+</strong><span>Bills processed monthly</span></div><div><strong>4.9 <span className="star">★</span></strong><span>10,400+ verified reviews</span></div><div><strong>24/7</strong><span>Instant automated delivery</span></div></div>
            </div>
            <QuickBuy />
          </div>
          <div className="powered-strip"><span>POWERED BY <b>Paystack</b> <b>Monnify</b> <b>V bank</b></span><span>● NDPR compliant · API uptime 99.9%</span></div>
        </section>
        <section className="rates-section">
          <div className="section-heading"><div><span className="section-kicker">LIVE NETWORK RATES, UPDATED HOURLY</span><h2>Everyday bills. Better prices.</h2><p>Cheapest VTU rates in Nigeria — no hidden charges.</p></div><a className="button button-outline button-small" href="/pricing">See all rates <ArrowRight size={14} /></a></div>
          <div className="rate-grid">{networks.map((network) => <article className="rate-card" key={network.name}><NetworkMark network={network.name} /><div><strong>{network.name}</strong><small>1GB SME · 30 days</small></div><b>{currency(network.name === '9mobile' ? 220 : 240)} <small>₦300</small></b><span className="available">● Available now</span><a href={`/data?network=${encodeURIComponent(network.name)}`}>Buy now <ArrowRight size={12} /></a></article>)}</div>
          <div className="service-grid">{[
            [Smartphone, 'Airtime & data', 'Instant top-ups at great rates.', '/data'],
            [Lightbulb, 'Electricity', 'Pay prepaid and postpaid bills.', '/electricity'],
            [Cable, 'Cable TV', 'Renew your TV subscription.', '/cable'],
            [GraduationCap, 'Education', 'Exam pins and school payments.', '/education'],
          ].map(([Icon, title, copy, href]) => <a className="service-tile" href={href} key={title}><span><Icon size={18} /></span><strong>{title}</strong><p>{copy}</p><ArrowRight className="tile-arrow" size={15} /></a>)}</div>
        </section>
        <section className="feature-section">
          <div className="feature-heading"><span className="section-kicker">WHY SWIFTTOPUP</span><h2>Built for speed, priced for everyone</h2></div>
          <div className="feature-grid">{[
            [Zap, 'Instant Wallet Top-ups', 'Dedicated Wem & Monnify virtual accounts. Fund in 10 seconds, credits automatically.'],
            [ShieldCheck, 'Automated 24/7 VTU Delivery', 'Direct network integrations. 99.9% success rates with instant retries on failures.'],
            [LockKeyhole, '4-Digit Transaction PIN', 'Every debit is PIN-protected. Biometric-ready with full fraud monitoring.'],
            [Gift, 'Referral & Cashback', 'Earn ₦500 per referral plus 2% cashback on every data purchase. Real cash.'],
            [BookOpen, 'Developer API Access', 'REST API with webhooks, wallet-as-a-service and white-label VTU for startups.'],
            [Headphones, 'Human Support 24/7', 'WhatsApp, live chat and phone. Median response time under 3 minutes.'],
          ].map(([Icon, title, text]) => <article className="feature-card" key={title}><span><Icon size={16} /></span><strong>{title}</strong><p>{text}</p></article>)}</div>
          <div className="feature-link"><a href="/faq">Read frequently asked questions <ArrowRight size={13} /></a><a href="/api">Explore API access <ArrowRight size={13} /></a></div>
        </section>
        <section className="cta-section"><div><h2>Start topping up in 60 seconds</h2><p>Free account · No BVN needed for ₦1,500 instant virtual account.</p></div><a className="button button-light" href="/signup">Create Free Account</a><a className="button button-ghost-light" href="mailto:support@swifttopup.ng">Chat with support</a></section>
      </main>
      <PublicFooter />
    </>
  )
}

function PublicInfoPage({ route }) {
  const page = {
    services: { title: 'One place for your everyday bills', intro: 'Choose a service and complete your payment in a few simple steps.', eyebrow: 'OUR SERVICES' },
    pricing: { title: 'Clear prices. No surprises.', intro: 'Explore sample rates before you check out. Final provider prices may change.', eyebrow: 'PRICING & RATES' },
    api: { title: 'Build with SwiftTopUp', intro: 'A developer-friendly VTU API concept for airtime, data, and bill payments.', eyebrow: 'DEVELOPER API' },
    faq: { title: 'Frequently asked questions', intro: 'Helpful answers about payments, delivery, and using SwiftTopUp.', eyebrow: 'HELP CENTER' },
    terms: { title: 'Terms of service', intro: 'These sample terms describe the intended use of the SwiftTopUp demo.', eyebrow: 'LEGAL' },
    privacy: { title: 'Privacy policy', intro: 'Learn what a production SwiftTopUp service would need to protect.', eyebrow: 'LEGAL' },
  }[route]

  return (
    <>
      <PublicHeader />
      <main className="public-info-page">
        <header className="public-info-heading"><span className="section-kicker">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.intro}</p></header>
        {route === 'services' && <div className="info-service-grid">{[
          [Phone, 'Airtime top-up', 'Recharge MTN, Airtel, Glo, or 9mobile.', '/airtime'],
          [Wifi, 'Mobile data', 'Pick a bundle for any supported network.', '/data'],
          [Lightbulb, 'Electricity', 'Pay prepaid and postpaid meter bills.', '/electricity'],
          [Cable, 'Cable TV', 'Renew eligible TV subscriptions.', '/cable'],
          [GraduationCap, 'Education', 'Purchase exam pins and e-vouchers.', '/education'],
          [ArrowDownLeft, 'Airtime to cash', 'Convert eligible airtime into wallet credit.', '/airtime-to-cash'],
          [CreditCard, 'Wallet', 'Fund and manage your SwiftTopUp wallet.', '/wallet'],
          [ReceiptText, 'Transaction history', 'Review your payment status and receipts.', '/transactions'],
        ].map(([Icon, title, copy, href]) => <a className="info-service-card" href={href} key={href}><span><Icon size={20} /></span><strong>{title}</strong><p>{copy}</p><b>Open service <ArrowRight size={13} /></b></a>)}</div>}
        {route === 'pricing' && <><div className="info-rate-grid">{networks.map((network) => <article className="info-rate-card" key={network.name}><div><NetworkMark network={network.name} /><b>{network.name}</b></div><p>Sample SME data prices · 30 days</p>{dataPlans.slice(0, 4).map((plan) => <div key={plan.size}><span>{plan.size}</span><strong>{currency(Math.round(plan.price * (network.name === '9mobile' ? .92 : 1)))}</strong></div>)}<a className="button button-primary button-full" href={`/data?network=${encodeURIComponent(network.name)}`}>Choose {network.name}</a></article>)}</div><p className="info-disclaimer"><ShieldCheck size={15} /> Sample prices shown for the demo. Provider rates and discounts must be configured before production.</p></>}
        {route === 'api' && <div className="api-info-grid"><section className="info-copy-card"><h2>One integration, essential services</h2><p>Connect an authorized provider integration to offer airtime, data, electricity, and cable payments through one API.</p><ul><li>API key authentication and environment separation</li><li>Idempotent payment requests and reference IDs</li><li>Webhook delivery with retry and transaction lookup</li><li>Provider routing, pricing, and reconciliation</li></ul><a className="button button-primary" href="mailto:support@swifttopup.ng?subject=SwiftTopUp%20API%20access">Request API access</a></section><section className="api-sample"><span>EXAMPLE REQUEST · SANDBOX</span><pre>{['POST /v1/transactions', 'Authorization: Bearer YOUR_TEST_KEY', 'Content-Type: application/json', '', '{', '  "service": "data",', '  "network": "mtn",', '  "recipient": "08030000000",', '  "plan": "1gb",', '  "reference": "your-unique-reference"', '}'].join('\n')}</pre><p>Live API credentials and provider connections are not included in this frontend demo.</p></section></div>}
        {route === 'faq' && <div className="faq-list">{[
          ['How quickly are purchases delivered?', 'The demo simulates instant confirmation. Real delivery times depend on the configured service provider and network.'],
          ['Can I pay with my wallet?', 'The checkout preview includes wallet summaries. A live wallet requires an authenticated backend and a payment provider.'],
          ['Are these real payments?', 'No. This project is a frontend demo. Checkout, wallet funding, sign-in, and admin actions do not move real money or call providers.'],
          ['What should I do if a transaction is pending?', 'Use the transaction history page to review its status. A production service should reconcile pending orders with its provider before retrying.'],
          ['How do I contact support?', 'Email support@swifttopup.ng. This demo does not include live chat or staffed support.'],
        ].map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}<ChevronDown size={16} /></summary><p>{answer}</p></details>)}</div>}
        {['terms', 'privacy'].includes(route) && <article className="legal-copy"><p><strong>Demo notice:</strong> SwiftTopUp is currently a frontend demonstration. It is not a live payment service and does not provide production legal terms or a binding privacy notice.</p>{route === 'terms' ? <><h2>Use of the demo</h2><p>Use this interface only to evaluate its design and simulated flows. Do not enter real payment credentials, sensitive personal information, or actual transaction PINs.</p><h2>Payments and availability</h2><p>No payment is processed, no wallet balance is actually held, and no service delivery is guaranteed by this prototype. Production use requires verified providers, security controls, and final legal terms.</p><h2>Contact</h2><p>Questions about the demo? <a href="mailto:support@swifttopup.ng">Contact the project team</a>.</p></> : <><h2>Information in this demo</h2><p>Sample customer names, phone numbers, balances, and transactions shown here are illustrative interface data. Checkout entries may be stored locally in your browser for the demo experience.</p><h2>Production requirements</h2><p>A live service must publish its actual data practices, retention period, security safeguards, and user rights before collecting personal or payment information.</p><h2>Contact</h2><p>Privacy questions? <a href="mailto:support@swifttopup.ng">Contact the project team</a>.</p></>}</article>}
        <div className="info-back-link"><a href="/">← Back to SwiftTopUp home</a><a href="/signup">Create an account <ArrowRight size={13} /></a></div>
      </main>
      <PublicFooter />
    </>
  )
}

const customerNavigation = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Fund Wallet', href: '/wallet', icon: CreditCard },
  { label: 'Buy Airtime', href: '/airtime', icon: Phone },
  { label: 'Buy Data', href: '/data', icon: Wifi },
  { label: 'Pay Electricity', href: '/electricity', icon: Lightbulb },
  { label: 'Cable TV', href: '/cable', icon: Cable },
  { label: 'Education Pins', href: '/education', icon: GraduationCap },
  { label: 'Airtime to Cash', href: '/airtime-to-cash', icon: ArrowDownLeft },
  { label: 'Transaction History', href: '/transactions', icon: ReceiptText },
  { label: 'Referrals & Earn', href: '/referrals', icon: Gift },
  { label: 'Settings & PIN', href: '/settings', icon: Settings },
]

function CustomerSidebar({ active }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="mobile-menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">{open ? <X size={20} /> : <Menu size={20} />}</button>
      <aside className={`customer-sidebar${open ? ' sidebar-open' : ''}`}>
        <Brand inverse />
        <nav aria-label="Customer navigation">
          {customerNavigation.map(({ label, href, icon: Icon }) => <a key={href} className={active === href ? 'active' : ''} href={href} onClick={() => setOpen(false)}><Icon size={15} /><span>{label}</span>{label === 'Referrals & Earn' && <em>NEW</em>}</a>)}
        </nav>
        <div className="referral-promo"><strong>Refer &amp; earn ₦500</strong><span>Invite friends, earn instant cashback.</span><a href="/referrals">Invite friends</a></div>
        <a className="sidebar-profile" href="/settings"><span className="avatar">AO</span><span><b>Adesua O.</b><small>SwiftTopUp customer</small></span><ChevronDown size={14} /></a>
      </aside>
    </>
  )
}

function CustomerHeader() {
  return <header className="customer-topbar"><div className="breadcrumbs">Dashboard <span>/</span> <b>Overview</b></div><label className="header-search"><Search size={14} /><input placeholder="Search transactions, services, receipts..." aria-label="Search" /><kbd>⌘ K</kbd></label><div className="topbar-actions"><a className="button button-outline button-small" href="/wallet"><CreditCard size={13} /> Fund wallet</a><button type="button" className="icon-button" aria-label="Notifications"><Bell size={17} /><i /></button><a className="user-chip" href="/settings"><span className="avatar">AO</span><span>Adesua O.<small>₦24,850.00</small></span><ChevronDown size={12} /></a></div></header>
}

function CustomerShell({ active, title, subtitle, children }) {
  return <div className="customer-app"><CustomerSidebar active={active} /><div className="customer-main"><CustomerHeader /><main className="customer-content"><div className="page-title-row"><div><h1>{title}</h1><p>{subtitle}</p></div>{title === 'Dashboard' && <a className="button button-primary button-small" href="/data"><PlusIcon /> Buy a service</a>}</div>{children}</main></div></div>
}

function PlusIcon() { return <span className="plus-symbol">+</span> }

function TransactionTable({ rows = defaultTransactions, compact = false }) {
  return <div className="table-scroll"><table className={compact ? 'compact-table' : ''}><thead><tr><th>SERVICE</th><th>RECIPIENT</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th>RECEIPT</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong>{row.service}</strong><small>{row.id}</small></td><td>{row.recipient}</td><td>{row.date}</td><td><strong>{currency(row.amount)}</strong></td><td><span className={`status status-${row.status.toLowerCase()}`}>{row.status}</span></td><td><a className="receipt-link" href={`/receipt/${row.id}`}><ReceiptText size={13} /> PDF</a></td></tr>)}</tbody></table></div>
}

function DashboardPage() {
  const transactions = loadTransactions().slice(0, 5)
  return <CustomerShell active="/dashboard" title="Dashboard" subtitle="Welcome back, Adesua — here's your wallet at a glance.">
    <div className="welcome-strip"><span><Sparkles size={16} /> Welcome back, Adesua <small>Data is 10% off today. Your cashback balance grew by ₦320 this week.</small></span><a href="/data">Claim offer <ArrowRight size={14} /></a></div>
    <div className="dashboard-top-cards">
      <article className="balance-card"><div><span>Main Wallet Balance</span><button aria-label="Hide balance" type="button"><Eye size={14} /></button></div><h2>₦24,850.00</h2><small>Wallet ID · SwiftTopUp Virtual Account</small><div className="wallet-account">9876 543 210 <button type="button" onClick={() => navigator.clipboard?.writeText('9876543210')}>Copy</button></div><a className="button button-primary button-full" href="/wallet">+ Fund Wallet</a></article>
      <article className="cashback-card"><div><span>Cashback / Bonus Balance</span><b>+12.5% this week</b></div><h2>₦3,420.00</h2><p>₦200 referral rewards pending</p><div className="cashback-hint"><Gift size={15} /> Invite 2 more friends to unlock ₦1,000 bonus</div><a className="button button-outline button-full" href="/wallet">Transfer to Main Wallet</a></article>
      <article className="spend-card"><div className="card-title-row"><span>Total Spend — November</span><span className="small-pill">Last 30 days</span></div><h2>₦48,210</h2><div className="spend-bars" aria-label="Weekly spending chart"><i style={{ height: '32%' }} /><i style={{ height: '48%' }} /><i style={{ height: '38%' }} /><i style={{ height: '68%' }} /><i style={{ height: '88%' }} /><i style={{ height: '60%' }} /><i style={{ height: '100%' }} /></div><small>● Data 45% &nbsp; ● Power 30% &nbsp; ● TV 25%</small></article>
    </div>
    <div className="quick-service-row">{[['Airtime', Phone, '/airtime', 'From ₦50'], ['Data', Wifi, '/data', 'From ₦100'], ['Electricity', Lightbulb, '/electricity', 'Instant token'], ['Cable TV', Cable, '/cable', 'DSTV · GOTV']].map(([label, Icon, href, hint]) => <a href={href} className="quick-service" key={label}><span><Icon size={17} /></span><b>{label}<small>{hint}</small></b><ArrowRight size={14} /></a>)}</div>
    <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent Transactions</h2><p>Your latest top-ups and payments</p></div><div><a href="/transactions">View all <ArrowRight size={13} /></a></div></div><TransactionTable rows={transactions} compact /></section>
    <div className="dashboard-bottom"><section className="panel beneficiaries"><div className="panel-heading"><h2>Beneficiaries</h2><button className="circle-add" type="button" title="Add beneficiary">+</button></div><div className="beneficiary-avatars">{networks.map((network) => <span key={network.name}><NetworkMark network={network.name} small /></span>)}<button type="button" className="circle-add">+</button></div><p>Weekly data usage</p><div className="usage-meter"><i /></div><small>8.3GB / 10GB</small><a className="button button-outline button-full" href="/data">Buy data again</a></section><section className="airtime-cash-card"><span><ArrowDownLeft size={16} /> Airtime to Cash</span><p>Convert unused airtime at 92% value. Credited in 5 mins.</p><a className="button button-light button-full" href="/airtime-to-cash">Convert now</a></section></div>
  </CustomerShell>
}

function ServicePage({ type }) {
  const info = serviceInfo[type]
  const query = new URLSearchParams(window.location.search)
  const [network, setNetwork] = useState(query.get('network') || 'MTN')
  const [phone, setPhone] = useState(query.get('phone') || '')
  const [plan, setPlan] = useState(dataPlans.find((item) => item.price === Number(query.get('amount'))) || dataPlans[1])
  const [amount, setAmount] = useState(Number(query.get('amount')) || (type === 'airtime' ? 500 : 5000))
  const [provider, setProvider] = useState('IKEC')
  const [meterType, setMeterType] = useState('Prepaid')
  const [subscriber, setSubscriber] = useState('')
  const [pin, setPin] = useState('')
  const [notice, setNotice] = useState('')
  const price = type === 'data' ? plan.price : amount
  const finalCharge = type === 'airtime' ? Math.round(price * 0.97) : price
  const recipientLabel = type === 'data' ? phone : (type === 'electricity' ? subscriber : phone)
  const submit = (event) => {
    event.preventDefault()
    setNotice('')
    if (pin.length !== 4) {
      setNotice('Enter your 4-digit transaction PIN to continue.')
      return
    }
    if (!recipientLabel || (type === 'electricity' && subscriber.length < 6)) {
      setNotice('Enter a valid recipient or account number to continue.')
      return
    }
    const item = { id: `VT-${Date.now().toString().slice(-6)}`, service: `${network} ${type === 'data' ? `${plan.size} Data` : info.title}`, recipient: recipientLabel, date: new Date().toLocaleString('en-NG'), amount: finalCharge, status: 'Successful' }
    const current = loadTransactions()
    window.localStorage.setItem('swift-topup-transactions', JSON.stringify([item, ...current]))
    window.localStorage.setItem('swift-topup-last-receipt', JSON.stringify({ ...item, network, plan: type === 'data' ? `${plan.size} · ${plan.duration}` : info.title, discount: type === 'airtime' ? Math.round(price * 0.03) : 0 }))
    window.location.href = `/receipt/${item.id}`
  }
  return <CustomerShell active={`/${type}`} title={info.title} subtitle={info.subtitle}>
    <div className="service-layout">
      <form className="panel service-form" onSubmit={submit}>
        {type === 'data' && <>
          <div className="form-step"><b>1.</b> SELECT NETWORK</div><NetworkPicker selected={network} onChange={setNetwork} />
          <div className="form-step"><b>2.</b> DATA TYPE</div><div className="segmented-control"><button type="button" className="active">SME Data</button><button type="button">Corporate</button><button type="button">Gifting</button></div>
          <div className="form-step"><b>3.</b> CHOOSE PLAN</div><div className="plan-list">{dataPlans.map((item) => <button type="button" key={item.size} onClick={() => setPlan(item)} className={plan.size === item.size ? 'selected' : ''}><span><b>{item.size}</b><small>{item.duration}</small></span><strong>{currency(item.price)}</strong></button>)}</div>
          <label className="field-label" htmlFor="recipient-phone">4. PHONE NUMBER</label><div className="input-with-icon"><Phone size={15} /><input id="recipient-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 452 1890" pattern="[0-9+ ()-]{10,18}" value={phone} onChange={(event) => setPhone(event.target.value)} required /></div>
        </>}
        {type === 'airtime' && <>
          <div className="form-step"><b>1.</b> SELECT NETWORK</div><NetworkPicker selected={network} onChange={setNetwork} />
          <label className="field-label" htmlFor="airtime-phone">2. PHONE NUMBER</label><div className="input-with-icon"><Phone size={15} /><input id="airtime-phone" type="tel" autoComplete="tel" placeholder="0803 452 1890" pattern="[0-9+ ()-]{10,18}" value={phone} onChange={(event) => setPhone(event.target.value)} required /></div>
          <label className="field-label" htmlFor="airtime-amount">3. AMOUNT</label><input id="airtime-amount" className="text-input" type="number" min="50" max="50000" step="50" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required /><p className="field-hint">3% airtime cashback is applied automatically.</p>
        </>}
        {type === 'electricity' && <>
          <div className="form-step"><b>1.</b> SELECT DISCO</div><select className="text-input" value={provider} onChange={(event) => setProvider(event.target.value)}><option>IKEC</option><option>EKEDC</option><option>Abuja Electric</option><option>KAEDCO</option><option>BEDC</option></select>
          <div className="form-step">2. METER TYPE</div><div className="segmented-control"><button type="button" className={meterType === 'Prepaid' ? 'active' : ''} onClick={() => setMeterType('Prepaid')}>Prepaid</button><button type="button" className={meterType === 'Postpaid' ? 'active' : ''} onClick={() => setMeterType('Postpaid')}>Postpaid</button></div>
          <label className="field-label" htmlFor="meter">3. METER NUMBER</label><input id="meter" className="text-input" inputMode="numeric" minLength="6" placeholder="Enter meter number" value={subscriber} onChange={(event) => setSubscriber(event.target.value)} required />
          <label className="field-label" htmlFor="power-amount">4. AMOUNT</label><input id="power-amount" className="text-input" type="number" min="500" step="100" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required />
        </>}
        {['cable', 'education', 'airtime-to-cash'].includes(type) && <>
          <div className="form-step"><b>1.</b> {type === 'cable' ? 'SELECT PROVIDER' : type === 'education' ? 'SELECT PRODUCT' : 'SELECT NETWORK'}</div>
          <select className="text-input" value={provider} onChange={(event) => setProvider(event.target.value)}>{(type === 'cable' ? ['DSTV Compact', 'GOtv Max', 'StarTimes Nova'] : type === 'education' ? ['WAEC Result Checker', 'NECO Token', 'JAMB ePIN'] : networks.map((item) => item.name)).map((item) => <option key={item}>{item}</option>)}</select>
          <label className="field-label" htmlFor="service-account">2. {type === 'airtime-to-cash' ? 'AIRTIME PHONE NUMBER' : 'SMARTCARD / CANDIDATE NUMBER'}</label><input id="service-account" className="text-input" value={type === 'airtime-to-cash' ? phone : subscriber} onChange={(event) => type === 'airtime-to-cash' ? setPhone(event.target.value) : setSubscriber(event.target.value)} required />
          <label className="field-label" htmlFor="service-amount">3. AMOUNT</label><input id="service-amount" className="text-input" type="number" min="100" step="50" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required />
        </>}
        <div className="form-step"><b>5.</b> CONFIRM WITH TRANSACTION PIN</div>
        <label className="field-label" htmlFor="transaction-pin">4-DIGIT TRANSACTION PIN</label><input id="transaction-pin" className="text-input pin-input" type="password" inputMode="numeric" autoComplete="off" maxLength="4" pattern="[0-9]{4}" placeholder="••••" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} required />
        <button type="submit" className="button button-primary button-full"><LockKeyhole size={15} /> Pay {currency(finalCharge)} securely</button>
        {notice && <p className="inline-notice" role="alert">{notice}</p>}
        <p className="demo-disclaimer"><ShieldCheck size={14} /> Demo checkout only — no real payment is processed.</p>
      </form>
      <aside className="panel checkout-summary"><h2>Checkout Summary</h2><div className="summary-network"><NetworkMark network={network} small /><span>{type === 'data' ? network + ' SME' : info.title}</span></div><dl><div><dt>Service</dt><dd>{type === 'data' ? `${plan.size} · ${plan.duration}` : info.title}</dd></div><div><dt>Recipient</dt><dd>{recipientLabel || '—'}</dd></div><div><dt>Amount</dt><dd>{currency(price)}</dd></div>{type === 'airtime' && <div><dt>Cashback</dt><dd className="green-text">−{currency(price - finalCharge)}</dd></div>}<div className="summary-total"><dt>Total to pay</dt><dd>{currency(finalCharge)}</dd></div></dl><div className="summary-wallet"><span>Wallet balance</span><strong>₦24,850.00</strong></div><a href="/wallet">Need to add funds? <ArrowRight size={13} /></a><p><LockKeyhole size={13} /> Your payment is protected by a transaction PIN.</p></aside>
    </div>
  </CustomerShell>
}

function WalletPage() {
  const [notice, setNotice] = useState('')
  return <CustomerShell active="/wallet" title="Fund Wallet" subtitle="Add funds to your SwiftTopUp wallet instantly."><div className="wallet-page-grid"><section className="balance-card"><span>Available balance</span><h2>₦24,850.00</h2><p>SwiftTopUp virtual account</p><div className="wallet-account">9876 543 210 <button type="button" onClick={() => navigator.clipboard?.writeText('9876543210')}>Copy account number</button></div></section><form className="panel wallet-fund-form" onSubmit={(event) => { event.preventDefault(); setNotice('Demo wallet funding request saved. Connect a payment provider to receive real deposits.') }}><h2>Fund with a bank transfer</h2><p>Transfer to your dedicated account. Your wallet balance updates automatically after payment provider setup.</p><label className="field-label" htmlFor="fund-amount">Amount to add</label><input id="fund-amount" className="text-input" type="number" min="100" step="100" placeholder="₦5,000" required /><button className="button button-primary button-full" type="submit"><CreditCard size={15} /> Continue to payment</button>{notice && <p className="inline-notice" role="status">{notice}</p>}<p className="demo-disclaimer"><ShieldCheck size={14} /> Payment gateway is not connected in this demo.</p></form></div><section className="panel recent-panel"><div className="panel-heading"><h2>Recent wallet activity</h2><a href="/transactions">View history <ArrowRight size={13} /></a></div><TransactionTable rows={loadTransactions().slice(0, 3)} compact /></section></CustomerShell>
}

function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const rows = useMemo(() => loadTransactions().filter((item) => (filter === 'All' || item.status === filter) && `${item.service} ${item.recipient} ${item.id}`.toLowerCase().includes(search.toLowerCase())), [search, filter])
  return <CustomerShell active="/transactions" title="Transaction History" subtitle="Track every top-up, bill payment and wallet activity."><section className="panel recent-panel"><div className="table-toolbar"><label className="search-field"><Search size={14} /><input placeholder="Search by service, number or receipt..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by status"><option>All</option><option>Successful</option><option>Pending</option><option>Failed</option></select></div><TransactionTable rows={rows} /><p className="table-footnote">Showing {rows.length} transactions · Your activity is saved on this device.</p></section></CustomerShell>
}

function ReceiptPage() {
  const receipt = JSON.parse(window.localStorage.getItem('swift-topup-last-receipt') || 'null')
  const id = window.location.pathname.split('/').pop()
  const transaction = loadTransactions().find((item) => item.id === id)
  const item = transaction || receipt || { id, service: 'SwiftTopUp transaction', recipient: '—', date: new Date().toLocaleString('en-NG'), amount: 0, status: 'Pending' }
  const saveReceipt = () => {
    const content = `SwiftTopUp receipt\nReference: ${item.id}\nService: ${item.service}\nRecipient: ${item.recipient}\nAmount: ${currency(item.amount)}\nStatus: ${item.status}\nDate: ${item.date}`
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${item.id}-receipt.txt`
    link.click()
    URL.revokeObjectURL(url)
  }
  return <CustomerShell active="/transactions" title="Payment Receipt" subtitle="Your transaction details and proof of payment."><section className="receipt-card panel"><div className="receipt-success"><span><Check size={22} /></span><h2>Payment {item.status === 'Successful' ? 'Successful' : item.status}</h2><p>{item.service} sent successfully.</p></div><div className="receipt-amount">{currency(item.amount)}</div><dl className="receipt-details"><div><dt>Reference</dt><dd>{item.id}</dd></div><div><dt>Service</dt><dd>{item.service}</dd></div><div><dt>Recipient</dt><dd>{item.recipient}</dd></div><div><dt>Date</dt><dd>{item.date}</dd></div><div><dt>Payment status</dt><dd><span className={`status status-${item.status.toLowerCase()}`}>{item.status}</span></dd></div></dl><div className="receipt-actions"><button className="button button-outline" onClick={saveReceipt}><Download size={15} /> Download receipt</button><a className="button button-primary" href="/dashboard">Back to dashboard</a></div></section></CustomerShell>
}

function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  return <CustomerShell active="/referrals" title="Refer & Earn" subtitle="Share SwiftTopUp with friends and get rewarded."><section className="referral-hero"><span><Gift size={22} /></span><h2>Give ₦500. Get ₦500.</h2><p>When a friend signs up with your code and completes their first top-up, you both receive ₦500 wallet cashback.</p><div className="referral-code"><code>ADESUA-500</code><button className="button button-light" onClick={() => { navigator.clipboard?.writeText('https://swifttopup.ng/signup?ref=ADESUA-500'); setCopied(true) }}>{copied ? 'Copied!' : 'Copy invite link'}</button></div></section><div className="stats-row"><article><small>Successful referrals</small><strong>8</strong></article><article><small>Rewards earned</small><strong>₦4,000</strong></article><article><small>Pending rewards</small><strong>₦500</strong></article></div></CustomerShell>
}

function SettingsPage() {
  const [notice, setNotice] = useState('')
  return <CustomerShell active="/settings" title="Settings & PIN" subtitle="Manage your account preferences and transaction security."><section className="panel settings-panel"><h2>Account details</h2><div className="settings-fields"><label>Full name<input defaultValue="Adesua Okafor" /></label><label>Email address<input type="email" defaultValue="adesua@example.com" /></label><label>Phone number<input type="tel" defaultValue="0803 452 1890" /></label></div><h2>Transaction PIN</h2><p>Your 4-digit PIN protects all wallet transactions. Never share it with anyone.</p><button className="button button-outline" onClick={() => setNotice('PIN reset link requested. Connect an account service to deliver it securely.')}>Reset transaction PIN</button><button className="button button-primary" onClick={() => setNotice('Demo preferences saved.')}>Save changes</button>{notice && <p className="inline-notice" role="status">{notice}</p>}</section></CustomerShell>
}

function AuthPage({ signup = false }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  return <main className="auth-page"><section className="auth-intro"><Brand inverse /><div><span className="eyebrow">YOUR BILLS. ONE SIMPLE APP.</span><h1>Payments made simple.</h1><p>Top up airtime, buy data, and pay your bills in just a few taps.</p><a href="/">← Back to SwiftTopUp</a></div><small>Secure, fast and available 24/7.</small></section><section className="auth-form-wrap"><form className="auth-form panel" onSubmit={(event) => { event.preventDefault(); setNotice('Demo account form submitted. Connect your authentication service to enable sign in.') }}><Brand /><h2>{signup ? 'Create your account' : 'Welcome back'}</h2><p>{signup ? 'Start paying bills and saving on every top-up.' : 'Sign in to manage your wallet and payments.'}</p>{signup && <label>Full name<input autoComplete="name" required placeholder="Your full name" /></label>}<label>Email address<input type="email" autoComplete="email" required placeholder="you@example.com" /></label>{signup && <label>Phone number<input type="tel" autoComplete="tel" required placeholder="0803 452 1890" /></label>}<label>Password<span className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} required placeholder="At least 8 characters" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>{!signup && <a className="forgot-link" href="mailto:support@swifttopup.ng?subject=Password%20reset">Forgot password?</a>}<button type="submit" className="button button-primary button-full">{signup ? 'Create free account' : 'Sign in'} <ArrowRight size={15} /></button>{notice && <p className="inline-notice" role="status">{notice}</p>}<p className="auth-switch">{signup ? 'Already have an account?' : 'New to SwiftTopUp?'} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</a></p><p className="demo-disclaimer"><ShieldCheck size={14} /> Demo only. Authentication is not connected.</p></form></section></main>
}

function GenericPage({ type }) {
  if (type === 'wallet') return <WalletPage />
  if (type === 'transactions') return <TransactionsPage />
  if (type === 'referrals') return <ReferralsPage />
  if (type === 'settings') return <SettingsPage />
  if (type === 'receipt') return <ReceiptPage />
  return <DashboardPage />
}

function NotFoundPage() {
  return <><PublicHeader /><main className="not-found-page"><span className="section-kicker">404 · PAGE NOT FOUND</span><h1>This page isn’t here.</h1><p>The link may have changed. Choose a destination below to continue.</p><div><a className="button button-primary" href="/">Go to SwiftTopUp home</a><a className="button button-outline" href="/services">Browse services</a></div></main><PublicFooter /></>
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const isService = Object.hasOwn(serviceInfo, path.slice(1))
  const serviceType = path.slice(1)
  const publicInfoRoutes = ['services', 'pricing', 'api', 'faq', 'terms', 'privacy']

  useEffect(() => {
    const pageTitle = path === '/' ? 'SwiftTopUp — Airtime, Data & Bill Payments' : path.startsWith('/admin') ? 'SwiftTopUp Admin' : `${serviceInfo[serviceType]?.title || (path === '/dashboard' ? 'Dashboard' : path.slice(1).replaceAll('-', ' '))} | SwiftTopUp`
    document.title = pageTitle
  }, [path, serviceType])

  if (path === '/') return <LandingPage />
  if (path === '/login') return <AuthPage />
  if (path === '/signup') return <AuthPage signup />
  if (path.startsWith('/admin')) return <AdminApp />
  if (isService) return <ServicePage type={serviceType} />
  if (path.startsWith('/receipt/')) return <ReceiptPage />
  const genericType = path.slice(1)
  if (publicInfoRoutes.includes(genericType)) return <PublicInfoPage route={genericType} />
  if (['dashboard', 'wallet', 'transactions', 'referrals', 'settings'].includes(genericType)) return <GenericPage type={genericType} />
  return <NotFoundPage />
}

export default App
