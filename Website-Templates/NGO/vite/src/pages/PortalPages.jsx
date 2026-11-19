import { useEffect, useState } from 'react'
import { ArrowRight, Check, Heart, LogOut, ShieldCheck, Users } from 'lucide-react'
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

function PortalHeader({ title, description, user }) {
  function signOut() {
    clearNGOSession()
    window.location.assign('/')
  }
  return <header className="portal-heading">
    <div><span className="eyebrow section-eyebrow">KINDRED SECURE PORTAL</span><h1>{title}</h1><p>{description}</p></div>
    <div className="portal-user"><strong>{user?.name}</strong><span>{user?.email}</span><button type="button" onClick={signOut}><LogOut size={14} /> Sign out</button></div>
  </header>
}

function LoadingOrError({ loading, error }) {
  if (loading) return <p className="portal-notice" role="status">Loading your secure dashboard…</p>
  if (error) return <p className="portal-error" role="alert">{error}</p>
  return null
}

function money(amount) {
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ClientDashboard() {
  const { data, error, loading } = usePortal('client', '/dashboard')
  return <PageShell><main className="page-main portal-page">
    <PortalHeader title="Your giving" description="Review your gift pledges and the causes you support." user={data?.user} />
    <LoadingOrError loading={loading} error={error} />
    {!loading && !error && <section className="portal-card">
      <div className="portal-card-heading"><div><span className="eyebrow section-eyebrow">DONOR ACCOUNT</span><h2>Gift pledge history</h2></div><a className="text-link" href="/causes">Explore causes <ArrowRight size={14} /></a></div>
      {data?.donations?.length ? <div className="portal-donations">{data.donations.map((donation) => <article className="portal-donation-row" key={donation.id}>
        <div><strong>{donation.campaignTitle}</strong><small>{new Date(donation.createdAt).toLocaleDateString()} · {donation.frequency === 'monthly' ? 'Monthly pledge' : 'One-time pledge'}</small></div>
        <span className="portal-status">{donation.status}</span><strong>{money(donation.amount)}</strong><small>{donation.paymentStatus}</small>
      </article>)}</div> : <div className="portal-empty"><Heart size={22} /><strong>Your gift pledges will appear here</strong><p>Choose a cause to create a pledge. No payment is processed in this preview.</p><a className="button button-green button-small" href="/causes">Browse causes</a></div>}
    </section>}
    <p className="portal-disclaimer"><ShieldCheck size={14} /> Your dashboard is private to your account. Gift pledges are not payment receipts.</p>
  </main></PageShell>
}

export function AdminDashboard() {
  const { data, setData, error, setError, loading } = usePortal('admin', '/admin')
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
      setError(requestError.message || 'Could not update this pledge.')
    } finally {
      setUpdating('')
    }
  }

  return <PageShell><main className="page-main portal-page">
    <PortalHeader title="Kindred administration" description="Review donor activity and gift pledges." user={data?.user} />
    <LoadingOrError loading={loading} error={error} />
    {!loading && !error && data && <>
      <div className="portal-metrics">
        <article><Users size={18} /><span>Donor accounts</span><strong>{data.metrics.clients}</strong></article>
        <article><Heart size={18} /><span>Active campaigns</span><strong>{data.metrics.campaigns}</strong></article>
        <article><Check size={18} /><span>Gift pledges</span><strong>{data.metrics.pledges}</strong></article>
        <article><ShieldCheck size={18} /><span>Total pledged</span><strong>{money(data.metrics.totalPledged)}</strong></article>
      </div>
      <section className="portal-card">
        <div className="portal-card-heading"><div><span className="eyebrow section-eyebrow">DONOR CARE</span><h2>Recent gift pledges</h2></div><span className="portal-review-count">{data.metrics.pendingReview} need review</span></div>
        {data.donations.length ? <div className="portal-donations">{data.donations.map((donation) => <article className="portal-donation-row" key={donation.id}>
          <div><strong>{donation.donorName} · {donation.campaignTitle}</strong><small>{donation.donorEmail} · {new Date(donation.createdAt).toLocaleString()} · {donation.frequency}</small></div>
          <span className="portal-status">{donation.status}</span><strong>{money(donation.amount)}</strong>
          {donation.status === 'Pledge received' && <div className="portal-row-actions"><button type="button" disabled={updating === donation.id} onClick={() => updateStatus(donation.id, 'Acknowledged')}>{updating === donation.id ? 'Saving…' : 'Acknowledge'}</button><button type="button" className="portal-cancel" disabled={updating === donation.id} onClick={() => updateStatus(donation.id, 'Cancelled')}>Cancel</button></div>}
        </article>)}</div> : <div className="portal-empty"><Heart size={22} /><strong>No gift pledges yet</strong><p>New pledges from signed-in donors will appear here.</p></div>}
      </section>
      <p className="portal-disclaimer"><ShieldCheck size={14} /> Pledges are not processed payments. Do not mark them as received until an external payment provider confirms funds.</p>
    </>}
  </main></PageShell>
}
