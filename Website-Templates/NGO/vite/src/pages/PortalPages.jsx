import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  CreditCard,
  Gift,
  Heart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import PageShell from '../components/PageShell'
import { campaigns } from '../data/campaigns'
import {
  clearNGOSession,
  getAdminDashboard,
  getClientDashboard,
  getNGOSession,
  updateLocalDonationStatus,
} from '../services/localStore'

function usePortal(role, path) {
  const [session] = useState(getNGOSession)
  const [data, setData] = useState(() => {
    if (session?.user?.role !== role) return null
    return role === 'admin' ? getAdminDashboard() : getClientDashboard(session.user)
  })

  useEffect(() => {
    if (!session) {
      window.location.replace(`/signin?redirect=${encodeURIComponent(path)}`)
    } else if (session.user.role !== role) {
      window.location.replace(session.user.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [path, role, session])

  return { data, setData, loading: !data }
}

function signOut() {
  clearNGOSession()
  window.location.assign('/')
}

function money(amount) {
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DonationRows({ donations, admin = false, onUpdate, updating }) {
  if (!donations.length) {
    return <div className="portal-empty"><Heart size={22} /><strong>No gift pledges yet</strong><p>New pledges from signed-in donors will appear here.</p></div>
  }
  return <div className="portal-donations">{donations.map((donation) => <article className="portal-donation-row" key={donation.id}>
    <div><strong>{admin ? `${donation.donorName} · ` : ''}{donation.campaignTitle}</strong><small>{admin ? `${donation.donorEmail} · ` : ''}{new Date(donation.createdAt).toLocaleString()} · {donation.frequency === 'monthly' ? 'Monthly' : 'One-time'}</small>{donation.isDemo && <small className="demo-data-badge">STATIC SAMPLE · NOT A REAL GIFT</small>}</div>
    <span className="portal-status">{donation.status}</span><strong>{money(donation.amount)}</strong>
    <small>Payment: {donation.paymentStatus}</small>
    {admin && donation.status === 'Pledge received' && <div className="portal-row-actions"><button type="button" disabled={updating === donation.id} onClick={() => onUpdate(donation.id, 'Acknowledged')}>{updating === donation.id ? 'Saving…' : 'Acknowledge'}</button><button type="button" className="portal-cancel" disabled={updating === donation.id} onClick={() => onUpdate(donation.id, 'Cancelled')}>Cancel</button></div>}
  </article>)}</div>
}

export function ClientDashboard() {
  const { data, loading } = usePortal('client', '/dashboard')
  return <PageShell><main className="page-main portal-page">
    <header className="portal-heading">
      <div><span className="eyebrow section-eyebrow">YOUR ACCOUNT</span><h1>Your giving</h1><p>Review your local gift pledge history and the causes you support.</p></div>
      <div className="portal-user"><strong>{data?.user?.name}</strong><span>{data?.user?.email}</span><button type="button" onClick={signOut}><LogOut size={14} /> Sign out</button></div>
    </header>
    <nav className="donor-dashboard-nav" aria-label="Your dashboard"><a className="is-active" href="#donor-overview">Overview</a><a href="#gift-history">Pledge history</a></nav>
    {loading ? <p className="portal-notice" role="status">Opening your local dashboard…</p> : <section className="portal-card">
      <div id="donor-overview" className="donor-summary"><article><span>Visible gift records</span><strong>{data.donations.length}</strong></article><article><span>Your local pledges</span><strong>{data.donations.filter((donation) => !donation.isDemo).length}</strong></article><article><span>Payments processed</span><strong>0</strong></article></div>
      <section id="gift-history" className="portal-card donor-history-card">
        <div className="portal-card-heading"><div><span className="eyebrow section-eyebrow">LOCAL DEMO</span><h2>Gift pledge history</h2></div><a className="text-link" href="/causes">Explore causes <ArrowRight size={14} /></a></div>
        {data.donations.length
          ? <DonationRows donations={data.donations} />
          : <div className="portal-empty"><Heart size={22} /><strong>Your gift pledges will appear here</strong><p>Choose a cause to save a pledge in this browser. No payment is processed by the Vite version.</p><a className="button button-green button-small" href="/causes">Browse causes</a></div>}
      </section>
    </section>}
    <p className="portal-disclaimer"><ShieldCheck size={14} /> Vite stores demo profile and pledge data in this browser only. Pledges are not payment receipts.</p>
  </main></PageShell>
}

const adminSections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'donations', label: 'Gift pledges', icon: Gift },
  { id: 'payments', label: 'Payment history', icon: CreditCard },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function AdminSidebar({ active, onNavigate, open, onClose, user }) {
  return <>
    {open && <button className="admin-sidebar-scrim" type="button" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
      <a className="admin-brand" href="/"><span className="admin-brand-mark">K</span><span>kindred<small>ADMIN PORTAL</small></span></a>
      <div className="admin-nav-label">WORKSPACE</div>
      <nav aria-label="Admin navigation">{adminSections.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={`admin-nav-item${active === id ? ' is-active' : ''}`} onClick={() => onNavigate(id)}><Icon size={17} />{label}{id === 'donations' && <span className="admin-nav-count">{user?.pledgeCount || ''}</span>}</button>)}</nav>
      <div className="admin-sidebar-bottom"><span className="admin-avatar">{user?.name?.slice(0, 1).toUpperCase() || 'K'}</span><span className="admin-profile-name">{user?.name || 'Administrator'}<small>Local demo account</small></span><button type="button" aria-label="Sign out" onClick={signOut}><LogOut size={16} /></button></div>
    </aside>
  </>
}

function AdminMetric({ icon: Icon, label, value, detail }) {
  return <article className="admin-metric-card"><span className="admin-metric-icon"><Icon size={18} /></span><span className="admin-metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

export function AdminDashboard() {
  const { data, setData, loading } = usePortal('admin', '/admin')
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [updating, setUpdating] = useState('')
  const [error, setError] = useState('')

  function updateStatus(id, status) {
    setUpdating(id)
    setError('')
    try {
      updateLocalDonationStatus(id, status)
      setData(getAdminDashboard())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update this pledge.')
    } finally {
      setUpdating('')
    }
  }

  function navigate(section) {
    setActive(section)
    setSidebarOpen(false)
  }

  const sectionTitles = {
    overview: ['Overview', 'Here is what is happening across your local demo portal.'],
    donations: ['Gift pledges', 'Review and update donor pledges saved in this browser.'],
    payments: ['Payment history', 'Payment records are created by the Next.js Paystack flow, not this Vite preview.'],
    campaigns: ['Campaigns', 'Review the campaigns currently shown on the public site.'],
    settings: ['Settings', 'Local preview account details.'],
  }
  const [title, description] = sectionTitles[active]

  if (loading) return <main className="admin-loading"><p className="portal-notice">Opening your local admin preview…</p></main>

  return <main className="admin-dashboard">
    <AdminSidebar active={active} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={{ ...data.user, pledgeCount: data.metrics.pledges }} />
    <section className="admin-main">
      <header className="admin-topbar">
        <button className="admin-menu-toggle" type="button" aria-label="Open admin navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
        <div className="admin-breadcrumb">Kindred <span>/</span> {title}</div>
        <div className="admin-topbar-user"><span className="admin-avatar">{data.user?.name?.slice(0, 1).toUpperCase() || 'K'}</span><span>{data.user?.name || 'Administrator'}</span><button type="button" onClick={signOut} aria-label="Sign out"><LogOut size={16} /></button></div>
      </header>
      <div className="admin-content">
        <div className="admin-page-heading"><div><span className="eyebrow section-eyebrow">KINDRED ADMINISTRATION</span><h1>{title}</h1><p>{description}</p></div>{active === 'overview' && <button className="button button-green button-small" type="button" onClick={() => navigate('donations')}><Gift size={15} /> Review pledges</button>}</div>
        {error && <p className="portal-error" role="alert">{error}</p>}
        {active === 'overview' && <>
          <div className="admin-metrics">
            <AdminMetric icon={Users} label="Donor accounts" value={data.metrics.clients} detail="Includes static sample profiles" />
            <AdminMetric icon={Heart} label="Campaigns" value={data.metrics.campaigns} detail="Published causes" />
            <AdminMetric icon={Gift} label="Gift records" value={data.metrics.pledges} detail="Static samples + local records" />
            <AdminMetric icon={Check} label="Needs review" value={data.metrics.pendingReview} detail="Pledges not yet acknowledged" />
          </div>
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>Recent gift pledges</h2><p>These are pledge records, not confirmed payments.</p></div><button className="admin-view-all" type="button" onClick={() => navigate('donations')}>View all <ArrowRight size={14} /></button></div>
            <DonationRows donations={data.donations.slice(0, 5)} admin onUpdate={updateStatus} updating={updating} />
          </section>
          <p className="portal-disclaimer"><ShieldCheck size={14} /> This Vite admin preview uses browser-local storage and is not suitable for real accounts or financial records.</p>
        </>}
        {active === 'donations' && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>All gift pledges</h2><p>{data.donations.length} local pledge records</p></div></div><DonationRows donations={data.donations} admin onUpdate={updateStatus} updating={updating} /></section>}
        {active === 'payments' && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Payment records</h2><p>Only completed Paystack transactions should be considered payments.</p></div></div>{data.donations.length ? <><div className="admin-payment-note"><CreditCard size={18} /><p><strong>Vite does not process payments.</strong><br />Static sample rows and browser-local pledges are not payments. For verified Paystack history, use the Next.js application.</p></div><DonationRows donations={data.donations} admin /></> : <div className="portal-empty"><CreditCard size={22} /><strong>No local pledge records</strong><p>Verified payment history is available in the Next.js portal after a successful Paystack checkout.</p></div>}</section>}
        {active === 'campaigns' && <div className="admin-campaign-grid">{campaigns.map((campaign) => <article className="admin-campaign-card" key={campaign.slug}><span className="admin-campaign-category">{campaign.category}</span><h2>{campaign.title}</h2><p>{campaign.description}</p><a href={`/causes/${campaign.slug}`}>View campaign <ArrowRight size={14} /></a></article>)}</div>}
        {active === 'settings' && <section className="admin-panel admin-settings"><span className="admin-settings-icon"><ShieldCheck size={20} /></span><div><h2>Browser-only demo account</h2><p>This Vite dashboard stores demo profile and pledge data in localStorage. It is not connected to the NGO API and does not provide production authentication or payment processing.</p><p><strong>Signed in as:</strong> {data.user?.name} · {data.user?.email}</p></div></section>}
      </div>
    </section>
  </main>
}
