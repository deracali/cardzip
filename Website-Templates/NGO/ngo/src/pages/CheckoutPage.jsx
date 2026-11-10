import { useState } from 'react'
import { ArrowLeft, Heart, ShieldCheck } from 'lucide-react'
import PageShell from '../components/PageShell'
import { campaigns, formatMoney } from '../data/campaigns'

export default function CheckoutPage() {
  const params = new URLSearchParams(window.location.search)
  const amount = Math.max(1, Number(params.get('amount')) || 50)
  const monthly = params.get('frequency') === 'monthly'
  const campaign = campaigns.find((item) => item.slug === params.get('campaign'))
  const [submitted, setSubmitted] = useState(false)
  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
  }
  return (
    <PageShell>
      <main className="page-main checkout-page">
        <a className="back-link" href={campaign ? `/causes/${campaign.slug}` : '/'}><ArrowLeft size={15} /> Back to {campaign ? 'campaign' : 'home'}</a>
        <span className="eyebrow section-eyebrow">One good thing starts here</span><h1>Complete your gift</h1><p className="page-intro">Thank you for helping communities thrive.</p>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <section className="checkout-section"><h2>Your contribution</h2><div className="checkout-line"><span>Gift amount</span><strong>{formatMoney(amount)} {monthly ? '/ month' : ''}</strong></div><div className="checkout-line"><span>Frequency</span><strong>{monthly ? 'Monthly' : 'One-time'}</strong></div>{campaign && <div className="checkout-line"><span>Supporting</span><strong>{campaign.title}</strong></div>}</section>
            <section className="checkout-section"><h2>Your details</h2><div className="checkout-fields"><label>First name<input name="firstName" autoComplete="given-name" placeholder="First name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" placeholder="Last name" required /></label><label className="field-wide">Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label></div><label className="checkbox-line"><input type="checkbox" /> Make my gift in honor of someone</label><label className="checkbox-line"><input type="checkbox" defaultChecked /> Email me Kindred impact updates</label></section>
            <section className="checkout-section"><h2>Payment method</h2><div className="payment-option"><span className="payment-card-icon">▰</span><span><strong>Credit or debit card</strong><small>Visa · Mastercard · Amex</small></span><span className="card-icons">VISA &nbsp; MC</span></div><div className="checkout-fields card-fields"><label className="field-wide">Card number<input autoComplete="cc-number" placeholder="Payment provider required" disabled /></label><label>Expiration date<input placeholder="MM / YY" disabled /></label><label>Security code<input placeholder="CVC" disabled /></label></div><p className="payment-disclaimer"><ShieldCheck size={15} /> Card fields are disabled. This demo does not collect payment details.</p></section>
            {submitted && <p className="checkout-notice" role="status">Thank you! This donation preview did not charge you. Connect a payment provider to accept real gifts.</p>}
            <button type="submit" className="button button-green full-button"><Heart size={16} /> Give {formatMoney(amount)}{monthly ? ' monthly' : ''}</button>
            <p className="terms-note">By continuing, you agree to our donor terms. No payment is processed in this preview.</p>
          </form>
          <aside className="checkout-summary"><div className="summary-heart"><Heart size={22} fill="currentColor" /></div><h2>Your kindness creates change.</h2><p>{campaign ? campaign.impact : '$50 can help provide clean water, education, and essential care.'}</p><div className="summary-breakdown"><div><span>Your {monthly ? 'monthly ' : ''}gift</span><strong>{formatMoney(amount)}</strong></div><div><span>Transaction fee</span><strong>$0</strong></div><hr /><div><strong>Going to our programs</strong><strong>{formatMoney(amount)}</strong></div></div><div className="secure-box"><ShieldCheck size={18} /><span><strong>Safe &amp; transparent</strong><br />Every gift is tracked and responsibly managed.</span></div></aside>
        </div>
      </main>
    </PageShell>
  )
}
