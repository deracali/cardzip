import { useState } from 'react'
import SalonFooter from '../components/salon/SalonFooter'
import SalonHeader from '../components/salon/SalonHeader'
import { appointmentTimes, stylists } from '../components/salon/salonData'
import { createLocalAppointment, getSalonServices, getSalonSession } from '../services/salonLocalStore'
import './account.css'
import '../components/salon/salon.css'

export default function BookingPage() {
  const [catalog] = useState(() => getSalonServices().filter((item) => item.active !== false))
  const [serviceId, setServiceId] = useState(catalog[0]?.id || '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState(appointmentTimes[2])
  const [stylist, setStylist] = useState(stylists[0])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)
  const service = catalog.find((item) => item.id === serviceId)

  async function submit(event) {
    event.preventDefault()
    setError('')
    const currentSession = getSalonSession()
    if (!currentSession) {
      window.location.assign(`/login?next=${encodeURIComponent('/book')}`)
      return
    }
    if (currentSession.user.role !== 'client') {
      setError('Only client accounts can request a salon appointment.')
      return
    }
    setBusy(true)
    const form = new FormData(event.currentTarget)
    try {
      createLocalAppointment(currentSession.user, {
        serviceId,
        date,
        time,
        stylist,
        notes: String(form.get('notes') || ''),
      })
      setSuccess(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not submit the appointment request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="salon-home">
      <SalonHeader />
      <main className="salon-account-page salon-booking-page">
        {success ? <section className="salon-account-card">
          <span className="salon-kicker">REQUEST RECEIVED</span>
          <h1>Your salon visit is in our hands.</h1>
          <p>Your appointment request has been saved in this browser and will appear in your client dashboard.</p>
          <a className="salon-button salon-button-primary" href="/dashboard">View my appointments</a>
        </section> : !catalog.length ? <section className="salon-account-card">
          <span className="salon-kicker">LUMIÈRE · APPOINTMENTS</span>
          <h1>Bookings are paused for a moment.</h1>
          <p>There are no services available to book right now. Please check back soon.</p>
          <a className="salon-button salon-button-primary" href="/services">View services</a>
        </section> : <section className="salon-account-card salon-booking-form-card">
          <span className="salon-kicker">LUMIÈRE · APPOINTMENTS</span>
          <h1>Choose your next ritual</h1>
          <p>Choose your service and preferred time. Your request is saved locally in this Vite preview.</p>
          <form className="salon-account-form" onSubmit={submit}>
            <label>Service<select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{catalog.map((item) => <option value={item.id} key={item.id}>{item.name} · ${item.price}</option>)}</select></label>
            <div className="salon-form-row">
              <label>Date<input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
              <label>Time<select value={time} onChange={(event) => setTime(event.target.value)}>{appointmentTimes.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <label>Preferred stylist<select value={stylist} onChange={(event) => setStylist(event.target.value)}>{stylists.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Notes for the studio<textarea name="notes" rows="3" maxLength="500" placeholder="Anything you would like your stylist to know?" /></label>
            <div className="salon-booking-total"><span>{service.name}<small>{service.duration} · Requested price</small></span><strong>${service.price}.00</strong></div>
            <p className="salon-account-note">Demo only: requests and pricing are stored in this browser. No payment is collected online.</p>
            {error && <p className="salon-form-error" role="alert">{error}</p>}
            <button className="salon-button salon-button-primary" type="submit" disabled={busy}>{busy ? 'Sending request…' : 'Request appointment'}</button>
          </form>
        </section>}
      </main>
      <SalonFooter />
    </div>
  )
}
