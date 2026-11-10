import { useState } from 'react'
import { ArrowLeft, ShieldCheck, Star } from 'lucide-react'
import PageShell from '../components/PageShell'
import { getDefaultDates, imageUrl, stays } from '../data/stays'

export default function CheckoutPage() {
  const params = new URLSearchParams(window.location.search)
  const stay = stays.find((item) => item.slug === params.get('stay')) || stays[0]
  const dates = getDefaultDates()
  const checkIn = params.get('checkIn') || dates.checkIn
  const checkOut = params.get('checkOut') || dates.checkOut
  const nights = Math.max(1, Math.round((new Date(`${checkOut}T12:00:00`) - new Date(`${checkIn}T12:00:00`)) / 86400000))
  const [message, setMessage] = useState('')
  const total = stay.price * nights + 42

  function submit(event) {
    event.preventDefault()
    setMessage('Checkout preview complete. No payment was collected; connect a payment provider to accept bookings.')
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
            <section className="checkout-section"><h2>Guest details</h2><div className="checkout-fields"><label>First name<input name="firstName" autoComplete="given-name" required placeholder="First name" /></label><label>Last name<input name="lastName" autoComplete="family-name" required placeholder="Last name" /></label><label className="field-wide">Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label></div></section>
            <section className="checkout-section"><h2>Payment method</h2><label className="payment-option"><input type="radio" name="payment" value="card" defaultChecked /><span><strong>Credit or debit card</strong><small>Visa · Mastercard · Amex</small></span><span className="card-icons">VISA &nbsp; MC</span></label><div className="checkout-fields card-fields"><label className="field-wide">Card number<input inputMode="numeric" autoComplete="cc-number" placeholder="Payment provider required" disabled /></label><label>Expiration date<input placeholder="MM / YY" disabled /></label><label>Security code<input placeholder="CVC" disabled /></label></div><p className="payment-disclaimer"><ShieldCheck size={15} /> Payment fields are disabled in this demo. No card details are collected.</p></section>
            {message && <p className="checkout-notice" role="status">{message}</p>}
            <button className="button button-primary full-button" type="submit">Confirm reservation · ${total}</button>
            <p className="terms-note">By selecting the button, you agree to the booking terms. This preview does not charge your card.</p>
          </form>
          <aside className="checkout-summary"><img src={imageUrl(stay.image, 600)} alt={stay.name} /><div className="checkout-summary-content"><span className="stay-tag inline-tag">{stay.type}</span><h2>{stay.shortName}</h2><p className="rating"><Star size={14} fill="currentColor" /> {stay.rating} · {stay.reviews} reviews</p><hr /><div className="summary-cost"><p><span>${stay.price} × {nights} nights</span><span>${stay.price * nights}</span></p><p><span>Cleaning fee</span><span>$24</span></p><p><span>Service fee</span><span>$18</span></p><div className="summary-total"><strong>Total (USD)</strong><strong>${total}</strong></div></div><div className="secure-box"><ShieldCheck size={18} /><span><strong>Secure checkout</strong><br />Your information is protected.</span></div></div></aside>
        </div>
      </main>
    </PageShell>
  )
}
