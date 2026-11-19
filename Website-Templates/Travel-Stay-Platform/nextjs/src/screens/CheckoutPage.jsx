import { useState } from 'react'
import { useEffect } from 'react'
import { ArrowLeft, ShieldCheck, Star } from 'lucide-react'
import PageShell from '../components/PageShell'
import { getDefaultDates, imageUrl, stays } from '../data/stays'
import { escapesApi, getSession } from '../services/escapesApi'

export default function CheckoutPage() {
  const params = new URLSearchParams(window.location.search)
  const stay = stays.find((item) => item.slug === params.get('stay')) || stays[0]
  const dates = getDefaultDates()
  const checkIn = params.get('checkIn') || dates.checkIn
  const checkOut = params.get('checkOut') || dates.checkOut
  const nights = Math.max(1, Math.round((new Date(`${checkOut}T12:00:00`) - new Date(`${checkIn}T12:00:00`)) / 86400000))
  const [session] = useState(getSession)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [providers, setProviders] = useState([])
  const [provider, setProvider] = useState('')
  const [loadingProviders, setLoadingProviders] = useState(() => session?.user.role === 'client')
  const total = stay.price * nights + 42

  useEffect(() => {
    if (!session || session.user.role !== 'client') return
    escapesApi.paymentProviders()
      .then((result) => {
        setProviders(result.providers)
        setProvider(result.providers[0] || '')
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Payment options could not be loaded.'))
      .finally(() => setLoadingProviders(false))
  }, [session])

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!session || session.user.role !== 'client') {
      setError('Sign in with a guest account to submit and track a reservation.')
      return
    }
    setSubmitting(true)
    const form = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const result = await escapesApi.createBooking({
        staySlug: stay.slug,
        checkIn,
        checkOut,
        guests: Number(params.get('guests') || 2),
        guestName: `${form.firstName} ${form.lastName}`.trim(),
        guestEmail: form.email,
        provider,
      })
      window.location.assign(result.redirectUrl)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Your reservation request could not be submitted.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <main className="page-main checkout-page">
        <p className="breadcrumbs"><a href="/">Home</a><span>/</span><a href={`/stays/${stay.slug}`}>Your stay</a><span>/</span>Checkout</p>
        <a className="back-link" href={`/reserve/${stay.slug}?checkIn=${checkIn}&checkOut=${checkOut}`}><ArrowLeft size={15} /> Back to reservation</a>
        <h1>Confirm and pay</h1><p className="muted-copy">You’re one step away from a lovely stay.</p>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <section className="checkout-section"><h2>Your trip</h2><div className="checkout-trip-line"><span>Dates</span><strong>{checkIn} — {checkOut} · {nights} nights</strong></div><div className="checkout-trip-line"><span>Guests</span><strong>{params.get('guests') || '2'} guests</strong></div></section>
            <section className="checkout-section"><h2>Guest details</h2><div className="checkout-fields"><label>First name<input name="firstName" autoComplete="given-name" required placeholder="First name" /></label><label>Last name<input name="lastName" autoComplete="family-name" required placeholder="Last name" /></label><label className="field-wide">Email address<input name="email" type="email" autoComplete="email" defaultValue={session?.user.email || ''} required placeholder="you@example.com" /></label></div></section>
            <section className="checkout-section"><h2>Payment method</h2>
              {loadingProviders && <p className="payment-disclaimer">Checking available hosted payment methods…</p>}
              {!loadingProviders && providers.length === 0 && <p className="payment-disclaimer"><ShieldCheck size={15} /> No payment provider is configured. Add server-side Paystack or Stripe credentials before guests can complete checkout.</p>}
              {!loadingProviders && providers.length > 0 && <div className="provider-options">{providers.map((item) => <label className="provider-option" key={item}><input type="radio" name="provider" value={item} checked={provider === item} onChange={() => setProvider(item)} /><span><strong>{item === 'paystack' ? 'Paystack' : 'Stripe'}</strong><small>Secure hosted checkout · USD</small></span></label>)}</div>}
            </section>
            {!session && <p className="checkout-notice">Sign in or create a guest account before submitting. <a href={`/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`}>Sign in</a> · <a href={`/signup?next=${encodeURIComponent(window.location.pathname + window.location.search)}`}>Create account</a></p>}
            {session && session.user.role !== 'client' && <p className="form-error" role="alert">Admin accounts cannot create guest reservations. Sign in with a guest account.</p>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary full-button" type="submit" disabled={submitting || loadingProviders || !provider || !session || session.user.role !== 'client'}>{submitting ? 'Opening secure checkout…' : `Continue to payment · $${total} USD`}</button>
            <p className="terms-note">The API recalculates the total and verifies payment with the selected provider before confirming your stay. Card details are entered only on the provider’s hosted page.</p>
          </form>
          <aside className="checkout-summary"><img src={imageUrl(stay.image, 600)} alt={stay.name} /><div className="checkout-summary-content"><span className="stay-tag inline-tag">{stay.type}</span><h2>{stay.shortName}</h2><p className="rating"><Star size={14} fill="currentColor" /> {stay.rating} · {stay.reviews} reviews</p><hr /><div className="summary-cost"><p><span>${stay.price} × {nights} nights</span><span>${stay.price * nights}</span></p><p><span>Cleaning fee</span><span>$24</span></p><p><span>Service fee</span><span>$18</span></p><div className="summary-total"><strong>Total (USD)</strong><strong>${total}</strong></div></div><div className="secure-box"><ShieldCheck size={18} /><span><strong>Secure checkout</strong><br />Your information is protected.</span></div></div></aside>
        </div>
      </main>
    </PageShell>
  )
}
