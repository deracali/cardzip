"use client";

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
import { clearNGOSession, getNGOSession, ngoApi } from '../services/ngoApi'

function usePortal(role, path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const session = getNGOSession()
    if (!session?.token) {
      window.location.replace(`/signin?redirect=${encodeURIComponent(path)}`)
      return () => { active = false }
    }
    if (session.user.role !== role) {
      window.location.replace(session.user.role === 'admin' ? '/admin' : '/dashboard')
      return () => { active = false }
    }
    const request = role === 'admin' ? ngoApi.adminDashboard() : ngoApi.clientDashboard()
    request.then((result) => {
      if (active) setData(result)
    }).catch((requestError) => {
      if (!active) return
      setError(requestError.message || 'This dashboard could not be loaded.')
      if (requestError.status === 401) {
        clearNGOSession()
        window.location.replace(`/signin?redirect=${encodeURIComponent(path)}`)
      }
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [path, role])

  return { data, setData, error, setError, loading }
}

function signOut() {
  clearNGOSession()
  window.location.assign('/')
}

function LoadingOrError({ loading, error }) {
  if (loading) return <p className="portal-notice" role="status">Loading your secure dashboard…</p>
  if (error) return <p className="portal-error" role="alert">{error}</p>
  return null
}

function money(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(amount) || 0)
}

function DonationRows({ donations, admin = false, onUpdate, updating }) {
  if (!donations.length) return <div className="portal-empty"><Heart size={22} /><strong>{admin ? 'No matching records' : 'Your payment history is empty'}</strong><p>{admin ? 'Payment records will appear after a verified Paystack checkout.' : 'Complete a gift checkout to see verified payments here.'}</p>{!admin && <a className="button button-green button-small" href="/causes">Browse causes</a>}</div>
  return <div className="portal-donations">{donations.map((donation) => <article className="portal-donation-row" key={donation.id}>
    <div><strong>{admin ? `${donation.donorName} · ` : ''}{donation.campaignTitle}</strong><small>{admin ? `${donation.donorEmail} · ` : ''}{new Date(donation.createdAt).toLocaleDateString()} · {donation.frequency === 'monthly' ? 'Monthly gift (charged once)' : 'One-time gift'}</small>{donation.paymentReference && <small>Reference: {donation.paymentReference}</small>}</div>
    <span className={`portal-status${donation.paymentStatus === 'Paid' ? ' is-paid' : ''}`}>{donation.paymentStatus}</span><strong>{money(donation.amount, donation.currency || 'USD')}</strong>
    {donation.paidAt && <small>Paid {new Date(donation.paidAt).toLocaleDateString()}</small>}
    {admin && donation.paymentStatus === 'Paid' && donation.status === 'Pledge received' && <div className="portal-row-actions"><button type="button" disabled={updating === donation.id} onClick={() => onUpdate(donation.id, 'Acknowledged')}>{updating === donation.id ? 'Saving…' : 'Acknowledge'}</button><button type="button" className="portal-cancel" disabled={updating === donation.id} onClick={() => onUpdate(donation.id, 'Cancelled')}>Cancel</button></div>}
  </article>)}</div>
}

export function ClientDashboard({ paymentsPage = false }) {
  const dashboardPath = paymentsPage ? '/dashboard/payments' : '/dashboard'
  const { data, error, loading } = usePortal('client', dashboardPath)
  const donations = data?.donations || []
  const paidDonations = donations.filter((donation) => donation.paymentStatus === 'Paid')
  const totalPaid = paidDonations.reduce((total, donation) => total + Number(donation.amount || 0), 0)
  return <PageShell><main className="page-main portal-page">
    <header className="portal-heading">
      <div><span className="eyebrow section-eyebrow">DONOR ACCOUNT</span><h1>Your giving</h1><p>Review your verified gifts and payment history.</p></div>
      <div className="portal-user"><strong>{data?.user?.name}</strong><span>{data?.user?.email}</span><button type="button" onClick={signOut}><LogOut size={14} /> Sign out</button></div>
    </header>
    <nav className="donor-dashboard-nav" aria-label="Your dashboard">
      <a className={!paymentsPage ? 'is-active' : ''} href="/dashboard">Overview</a>
      <a className={paymentsPage ? 'is-active' : ''} href="/dashboard/payments">Payment history</a>
    </nav>
    <LoadingOrError loading={loading} error={error} />
    {!loading && !error && (paymentsPage
      ? <section className="portal-card">
        <div className="portal-card-heading"><div><span className="eyebrow section-eyebrow">VERIFIED PAYMENTS</span><h2>Payment history</h2></div><a className="text-link" href="/causes">Explore causes <ArrowRight size={14} /></a></div>
        <DonationRows donations={donations} />
      </section>
      : <>
        <div className="donor-summary">
          <article><span>Verified payments</span><strong>{paidDonations.length}</strong></article>
          <article><span>Total paid</span><strong>{money(totalPaid)}</strong></article>
          <article><span>Awaiting payment</span><strong>{donations.filter((donation) => donation.paymentStatus === 'Pending').length}</strong></article>
        </div>
        <section className="portal-card">
          <div className="portal-card-heading"><div><span className="eyebrow section-eyebrow">RECENT ACTIVITY</span><h2>Recent gifts</h2></div><a className="text-link" href="/dashboard/payments">View payment history <ArrowRight size={14} /></a></div>
          <DonationRows donations={donations.slice(0, 3)} />
        </section>
      </>)}
    <p className="portal-disclaimer"><ShieldCheck size={14} /> Only payments confirmed by Paystack’s server-side verification appear as paid.</p>
  </main></PageShell>
}

const adminSections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'donations', label: 'Gift records', icon: Gift },
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
      <nav aria-label="Admin navigation">{adminSections.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={`admin-nav-item${active === id ? ' is-active' : ''}`} onClick={() => onNavigate(id)}><Icon size={17} />{label}{id === 'payments' && dataCount(user?.paymentCount)}</button>)}</nav>
      <div className="admin-sidebar-bottom"><span className="admin-avatar">{user?.name?.slice(0, 1).toUpperCase() || 'K'}</span><span className="admin-profile-name">{user?.name || 'Administrator'}<small>Administrator</small></span><button type="button" aria-label="Sign out" onClick={signOut}><LogOut size={16} /></button></div>
    </aside>
  </>
}

function dataCount(count) {
  return Number.isFinite(count) && count > 0 ? <span className="admin-nav-count">{count}</span> : null
}

function AdminMetric({ icon: Icon, label, value, detail }) {
  return <article className="admin-metric-card"><span className="admin-metric-icon"><Icon size={18} /></span><span className="admin-metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

export function AdminDashboard() {
  const { data, setData, error, setError, loading } = usePortal('admin', '/admin')
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [updating, setUpdating] = useState('')

  async function updateStatus(id, status) {
    setUpdating(id)
    setError('')
    try {
      const result = await ngoApi.updateDonationStatus(id, status)
      setData((current) => current ? {
        ...current,
        donations: current.donations.map((donation) => donation.id === id ? result.donation : donation),
      } : current)
    } catch (requestError) {
      setError(requestError.message || 'Could not update this payment record.')
    } finally {
      setUpdating('')
    }
  }

  function navigate(section) {
    setActive(section)
    setSidebarOpen(false)
  }

  const sectionTitles = {
    overview: ['Overview', 'Monitor verified donations and campaign activity.'],
    donations: ['Gift records', 'Review donor and gift records; only verified payments can be acknowledged.'],
    payments: ['Payment history', 'Successful Paystack transactions verified by the backend.'],
    campaigns: ['Campaigns', 'Review the causes currently shown on the public site.'],
    settings: ['Settings', 'Administrator account and payment configuration details.'],
  }
  const [title, description] = sectionTitles[active]
  const paidDonations = (data?.donations || []).filter((donation) => donation.paymentStatus === 'Paid')

  if (loading) return <main className="admin-loading"><LoadingOrError loading error="" /></main>

  return <main className="admin-dashboard">
    <AdminSidebar active={active} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={{ ...data?.user, paymentCount: data?.metrics?.payments }} />
    <section className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-toggle" type="button" aria-label="Open admin navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div className="admin-breadcrumb">Kindred <span>/</span> {title}</div><div className="admin-topbar-user"><span className="admin-avatar">{data?.user?.name?.slice(0, 1).toUpperCase() || 'K'}</span><span>{data?.user?.name || 'Administrator'}</span><button type="button" onClick={signOut} aria-label="Sign out"><LogOut size={16} /></button></div></header>
      <div className="admin-content">
        <div className="admin-page-heading"><div><span className="eyebrow section-eyebrow">KINDRED ADMINISTRATION</span><h1>{title}</h1><p>{description}</p></div>{active === 'overview' && <button className="button button-green button-small" type="button" onClick={() => navigate('payments')}><CreditCard size={15} /> View payments</button>}</div>
        {error && <p className="portal-error" role="alert">{error}</p>}
        {active === 'overview' && <><div className="admin-metrics">
          <AdminMetric icon={Users} label="Donor accounts" value={data?.metrics?.clients || 0} detail="Registered donors" />
          <AdminMetric icon={Heart} label="Campaigns" value={data?.metrics?.campaigns || 0} detail="Active causes" />
          <AdminMetric icon={Gift} label="Gift records" value={data?.metrics?.pledges || 0} detail="All recorded gifts" />
          <AdminMetric icon={Check} label="Verified payments" value={data?.metrics?.payments || 0} detail={money(data?.metrics?.totalPaid || 0)} />
        </div><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Recent gift records</h2><p>Payment status is updated only after server-side Paystack verification.</p></div><button className="admin-view-all" type="button" onClick={() => navigate('donations')}>View all <ArrowRight size={14} /></button></div><DonationRows donations={(data?.donations || []).slice(0, 5)} admin onUpdate={updateStatus} updating={updating} /></section></>}
        {active === 'donations' && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>All gift records</h2><p>{data?.donations?.length || 0} recent records</p></div></div><DonationRows donations={data?.donations || []} admin onUpdate={updateStatus} updating={updating} /></section>}
        {active === 'payments' && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Verified payment history</h2><p>{data?.metrics?.payments || 0} successful Paystack transactions · total {money(data?.metrics?.totalPaid || 0)}</p></div></div><DonationRows donations={paidDonations} admin onUpdate={updateStatus} updating={updating} /></section>}
        {active === 'campaigns' && <div className="admin-campaign-grid">{(data?.campaigns || []).map((campaign) => <article className="admin-campaign-card" key={campaign.slug}><span className="admin-campaign-category">{campaign.category}</span><h2>{campaign.title}</h2><p>{campaign.description}</p><a href={`/causes/${campaign.slug}`}>View campaign <ArrowRight size={14} /></a></article>)}</div>}
        {active === 'settings' && <section className="admin-panel admin-settings"><span className="admin-settings-icon"><ShieldCheck size={20} /></span><div><h2>Server-side payment configuration</h2><p>Paystack secret keys are configured only on the backend. Set PAYSTACK_SECRET_KEY, PAYSTACK_CURRENCY=USD and PAYSTACK_CALLBACK_URL in the backend environment.</p><p><strong>Signed in as:</strong> {data?.user?.name} · {data?.user?.email}</p></div></section>}
        <p className="portal-disclaimer"><ShieldCheck size={14} /> Admin payment history includes only transactions verified against Paystack; monthly selections are charged once and do not renew automatically.</p>
      </div>
    </section>
  </main>
}
