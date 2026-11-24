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
  const [provider, setProvider] = useState('')
  const [loadingProviders, setLoadingProviders] = useState(() => session?.user.role === 'client')
  const total = stay.price * nights + 42

  useEffect(() => {
    if (!session || session.user.role !== 'client') return
    escapesApi.paymentProviders()
      .then((result) => {
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
        <h1>Submit your reservation request</h1><p className="muted-copy">You’re one step away from sharing your travel plans.</p>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <section className="checkout-section"><h2>Your trip</h2><div className="checkout-trip-line"><span>Dates</span><strong>{checkIn} — {checkOut} · {nights} nights</strong></div><div className="checkout-trip-line"><span>Guests</span><strong>{params.get('guests') || '2'} guests</strong></div></section>
            <section className="checkout-section"><h2>Guest details</h2><div className="checkout-fields"><label>First name<input name="firstName" autoComplete="given-name" required placeholder="First name" /></label><label>Last name<input name="lastName" autoComplete="family-name" required placeholder="Last name" /></label><label className="field-wide">Email address<input name="email" type="email" autoComplete="email" defaultValue={session?.user.email || ''} required placeholder="you@example.com" /></label></div></section>
            <section className="checkout-section"><h2>Reservation request</h2>
              <p className="payment-disclaimer"><ShieldCheck size={15} /> Vite demo mode stores this request in your browser. No payment is collected and the reservation is not confirmed.</p>
            </section>
            {!session && <p className="checkout-notice">Sign in or create a guest account before submitting. <a href={`/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`}>Sign in</a> · <a href={`/signup?next=${encodeURIComponent(window.location.pathname + window.location.search)}`}>Create account</a></p>}
            {session && session.user.role !== 'client' && <p className="form-error" role="alert">Admin accounts cannot create guest reservations. Sign in with a guest account.</p>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary full-button" type="submit" disabled={submitting || loadingProviders || !session || session.user.role !== 'client'}>{submitting ? 'Saving reservation request…' : `Submit reservation request · $${total} USD`}</button>
            <p className="terms-note">This local demo does not charge a payment method or confirm a reservation.</p>
          </form>
          <aside className="checkout-summary"><img src={imageUrl(stay.image, 600)} alt={stay.name} /><div className="checkout-summary-content"><span className="stay-tag inline-tag">{stay.type}</span><h2>{stay.shortName}</h2><p className="rating"><Star size={14} fill="currentColor" /> {stay.rating} · {stay.reviews} reviews</p><hr /><div className="summary-cost"><p><span>${stay.price} × {nights} nights</span><span>${stay.price * nights}</span></p><p><span>Cleaning fee</span><span>$24</span></p><p><span>Service fee</span><span>$18</span></p><div className="summary-total"><strong>Estimated total (USD)</strong><strong>${total}</strong></div></div><div className="secure-box"><ShieldCheck size={18} /><span><strong>Local demo</strong><br />No payment is collected.</span></div></div></aside>
        </div>
      </main>
    </PageShell>
  )
}
