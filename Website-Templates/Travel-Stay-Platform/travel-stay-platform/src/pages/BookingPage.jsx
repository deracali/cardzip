import { useState } from 'react'
import { CalendarDays, Check, ShieldCheck, Star, Users } from 'lucide-react'
import PageShell from '../components/PageShell'
import { getDefaultDates, imageUrl } from '../data/stays'

export default function BookingPage({ stay }) {
  const params = new URLSearchParams(window.location.search)
  const defaults = getDefaultDates()
  const [checkIn, setCheckIn] = useState(params.get('checkIn') || defaults.checkIn)
  const [checkOut, setCheckOut] = useState(params.get('checkOut') || defaults.checkOut)
  const [guests, setGuests] = useState(2)
  const [error, setError] = useState('')
  const nights = Math.max(0, Math.round((new Date(`${checkOut}T12:00:00`) - new Date(`${checkIn}T12:00:00`)) / 86400000))
  const roomTotal = stay.price * nights
  const total = roomTotal + (nights ? 42 : 0)

  function continueToCheckout(event) {
    event.preventDefault()
    if (!checkIn || !checkOut || nights < 1) {
      setError('Choose a check-out date that is after your check-in date.')
      return
    }
    window.location.href = `/checkout?stay=${stay.slug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
  }

  return (
    <PageShell>
      <main className="page-main booking-page">
        <p className="breadcrumbs"><a href="/">Home</a><span>/</span><a href={`/stays/${stay.slug}`}>{stay.shortName}</a><span>/</span>Reserve</p>
        <h1>Select dates &amp; reserve</h1><p className="muted-copy">A few details, and your getaway is on its way.</p>
        <div className="booking-layout">
          <form className="calendar-panel" id="booking-form" onSubmit={continueToCheckout}>
            <div className="calendar-panel-head"><div><h2>{stay.name}</h2><p>{stay.area} · Check availability</p></div><CalendarDays size={20} /></div>
            <div className="date-fields"><label>Check in<input type="date" value={checkIn} onChange={(event) => { setCheckIn(event.target.value); setError('') }} required /></label><label>Check out<input type="date" value={checkOut} min={checkIn} onChange={(event) => { setCheckOut(event.target.value); setError('') }} required /></label></div>
            <label className="guest-select">Guests<select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((count) => <option value={count} key={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>)}</select></label>
            <div className="calendar-note"><Check size={16} /> No fee for 24-hour cancellation. Your dates are held only after checkout.</div>
          </form>
          <aside className="booking-summary">
            <div className="summary-stay"><img src={imageUrl(stay.image, 300)} alt="" /><div><strong>{stay.shortName}</strong><p><Star size={13} fill="currentColor" /> {stay.rating} · {stay.area}</p></div></div>
            <div className="summary-date-row"><span>CHECK IN<br /><strong>{checkIn || 'Select date'}</strong></span><span>CHECK OUT<br /><strong>{checkOut || 'Select date'}</strong></span></div>
            <p className="summary-guests"><Users size={15} /> {guests} guests</p>
            <div className="summary-cost"><p><span>${stay.price} × {nights} nights</span><span>${roomTotal}</span></p><p><span>Cleaning fee</span><span>$24</span></p><p><span>Service fee</span><span>$18</span></p><div className="summary-total"><strong>Total</strong><strong>${total}</strong></div></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary full-button" type="submit" form="booking-form">Reserve now (no charge yet)</button>
            <small className="safe-note"><ShieldCheck size={13} /> You won’t be charged yet</small>
          </aside>
        </div>
      </main>
    </PageShell>
  )
}
