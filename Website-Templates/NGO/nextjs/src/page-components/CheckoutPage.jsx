"use client";

import { useEffect, useState } from 'react'
import { ArrowLeft, Heart, ShieldCheck } from 'lucide-react'
import PageShell from '../components/PageShell'
import { campaigns, formatMoney } from '../data/campaigns'
import { getNGOSession, ngoApi } from '../services/ngoApi'

export default function CheckoutPage({ searchParams = '' }) {
  const params = new URLSearchParams(searchParams)
  const amount = Math.min(100000, Math.max(1, Number(params.get('amount')) || 50))
  const monthly = params.get('frequency') === 'monthly'
  const campaign = campaigns.find((item) => item.slug === params.get('campaign'))
  const checkoutPath = `/checkout${searchParams ? `?${searchParams}` : ''}`
  const signinHref = `/signin?redirect=${encodeURIComponent(checkoutPath)}`
  const [session, setSession] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setSession(getNGOSession()), 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    if (!session) {
      window.location.assign(signinHref)
      return
    }
    if (session.user.role !== 'client') {
      setMessage('Please use a donor account to create a gift pledge.')
      return
    }
    setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const checkout = await ngoApi.initializePayment({
        amount,
        frequency: monthly ? 'monthly' : 'once',
        campaignSlug: campaign?.slug || null,
        note: String(values.note || ''),
      })
      window.location.assign(checkout.authorizationUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not start Paystack checkout.')
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
            {!session && <p className="portal-notice">Sign in to your donor account to create a gift pledge. <a href={signinHref}>Sign in</a></p>}
            {session && session.user.role !== 'client' && <p className="portal-notice">You are signed in as an administrator. Sign in with a donor account to create a gift pledge.</p>}
            {session?.user?.role === 'client' && <section className="checkout-section"><h2>Your details</h2><p className="checkout-account">Pledge as <strong>{session.user.name}</strong> ({session.user.email})</p><label className="checkout-note-field">Note to Kindred (optional)<textarea name="note" maxLength={500} placeholder="Share any details about your pledge" /></label></section>}
            <section className="checkout-section"><h2>Secure payment</h2><div className="payment-option"><span className="payment-card-icon">▰</span><span><strong>Paystack hosted checkout</strong><small>Secure card payment · USD</small></span><span className="card-icons">PAYSTACK</span></div><p className="payment-disclaimer"><ShieldCheck size={15} /> You will be redirected to Paystack. Card details are entered only on Paystack’s secure checkout.</p>{monthly && <p className="payment-disclaimer">Monthly gift selection is charged once; it does not automatically renew.</p>}</section>
            {message && <p className="checkout-notice" role="alert">{message}</p>}
            <button type="submit" className="button button-green full-button" disabled={busy || session?.user?.role !== 'client'}><Heart size={16} /> {busy ? 'Connecting to Paystack…' : `Pay ${formatMoney(amount)}${monthly ? ' monthly gift' : ''}`}</button>
            <p className="terms-note">Payment is verified by the Kindred server before it appears as paid in your account.</p>
          </form>
          <aside className="checkout-summary"><div className="summary-heart"><Heart size={22} fill="currentColor" /></div><h2>Your kindness creates change.</h2><p>{campaign ? campaign.impact : '$50 can help provide clean water, education, and essential care.'}</p><div className="summary-breakdown"><div><span>{monthly ? 'Monthly gift preference' : 'Gift amount'}</span><strong>{formatMoney(amount)}</strong></div><div><span>Paystack fees</span><strong>Shown at checkout</strong></div><hr /><div><strong>Charged once</strong><strong>{formatMoney(amount)}</strong></div></div><div className="secure-box"><ShieldCheck size={18} /><span><strong>Safe &amp; transparent</strong><br />Every gift is tracked and responsibly managed.</span></div></aside>
        </div>
      </main>
    </PageShell>
  )
}
