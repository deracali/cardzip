import { useState } from 'react'
import { ArrowLeft, Heart, ShieldCheck } from 'lucide-react'
import PageShell from '../components/PageShell'
import { campaigns, formatMoney } from '../data/campaigns'
import { createLocalDonation, getNGOSession } from '../services/localStore'

export default function CheckoutPage() {
  const params = new URLSearchParams(window.location.search)
  const amount = Math.min(100000, Math.max(1, Number(params.get('amount')) || 50))
  const monthly = params.get('frequency') === 'monthly'
  const campaign = campaigns.find((item) => item.slug === params.get('campaign'))
  const [session] = useState(getNGOSession)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function submit(event) {
    event.preventDefault()
    setMessage('')
    if (!session) {
      window.location.assign(`/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      return
    }
    if (session.user.role !== 'client') {
      setMessage('Please use a donor account to create a gift pledge.')
      return
    }
    setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try {
      createLocalDonation({
        user: session.user,
        amount,
        frequency: monthly ? 'monthly' : 'once',
        campaignSlug: campaign?.slug || null,
        note: String(values.note || ''),
      })
      setSubmitted(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Your pledge could not be saved locally.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <PageShell>
      <main className="page-main checkout-page">
        <a className="back-link" href={campaign ? `/causes/${campaign.slug}` : '/'}><ArrowLeft size={15} /> Back to {campaign ? 'campaign' : 'home'}</a>
        <span className="eyebrow section-eyebrow">One good thing starts here</span><h1>Complete your gift</h1><p className="page-intro">Thank you for helping communities thrive.</p>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <section className="checkout-section"><h2>Your contribution</h2><div className="checkout-line"><span>Gift amount</span><strong>{formatMoney(amount)} {monthly ? '/ month' : ''}</strong></div><div className="checkout-line"><span>Frequency</span><strong>{monthly ? 'Monthly' : 'One-time'}</strong></div>{campaign && <div className="checkout-line"><span>Supporting</span><strong>{campaign.title}</strong></div>}</section>
            {!session && <p className="portal-notice">Sign in to your donor account to create a gift pledge. <a href={`/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}>Sign in</a></p>}
            {session && session.user.role !== 'client' && <p className="portal-notice">You are signed in as an administrator. Sign in with a donor account to create a gift pledge.</p>}
            {session?.user?.role === 'client' && <section className="checkout-section"><h2>Your details</h2><p className="checkout-account">Pledge as <strong>{session.user.name}</strong> ({session.user.email})</p><label className="checkout-note-field">Note to Kindred (optional)<textarea name="note" maxLength={500} placeholder="Share any details about your pledge" /></label></section>}
            <section className="checkout-section"><h2>Vite local preview</h2><p className="payment-disclaimer"><ShieldCheck size={15} /> This Vite site stores demo pledges in this browser only. It does not collect card details or process payments. Use the Next.js site for Paystack checkout.</p></section>
            {submitted && <p className="checkout-notice" role="status">Your pledge was saved in this browser. No payment was collected. Review it in your <a href="/dashboard">donor dashboard</a>.</p>}
            {message && <p className="checkout-notice" role="alert">{message}</p>}
            <button type="submit" className="button button-green full-button" disabled={busy || submitted || session?.user?.role !== 'client'}><Heart size={16} /> {busy ? 'Saving pledge…' : submitted ? 'Pledge saved' : `Pledge ${formatMoney(amount)}${monthly ? ' monthly' : ''}`}</button>
            <p className="terms-note">This records a local demo pledge only. No payment is processed or collected.</p>
          </form>
          <aside className="checkout-summary"><div className="summary-heart"><Heart size={22} fill="currentColor" /></div><h2>Your kindness creates change.</h2><p>{campaign ? campaign.impact : '$50 can help provide clean water, education, and essential care.'}</p><div className="summary-breakdown"><div><span>Your {monthly ? 'monthly ' : ''}gift</span><strong>{formatMoney(amount)}</strong></div><div><span>Transaction fee</span><strong>$0</strong></div><hr /><div><strong>Going to our programs</strong><strong>{formatMoney(amount)}</strong></div></div><div className="secure-box"><ShieldCheck size={18} /><span><strong>Safe &amp; transparent</strong><br />Every gift is tracked and responsibly managed.</span></div></aside>
        </div>
      </main>
    </PageShell>
  )
}
