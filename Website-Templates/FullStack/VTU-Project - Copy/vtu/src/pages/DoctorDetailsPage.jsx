import { useState } from 'react'
import { ArrowLeft, BadgeCheck, CalendarDays, Check, Clock3, CreditCard, MapPin, ShieldCheck, Star, Video, X } from 'lucide-react'
import HomeHeader from '../components/HomeHeader'
import HomeFooter from '../components/HomeFooter'
import { doctors } from '../data/doctors'
import './DoctorDetailsPage.css'

function DoctorDetailsPage({ slug }) {
  const doctor = doctors.find((item) => item.slug === slug)
  const [visitType, setVisitType] = useState('in-person')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  if (!doctor) {
    return (
      <div className="doctor-details-page">
        <HomeHeader />
        <main className="doctor-not-found"><h1>Doctor not found</h1><p>We couldn’t find that provider.</p><a href="/doctors">Browse all doctors</a></main>
        <HomeFooter />
      </div>
    )
  }

  const submitBooking = (event) => {
    event.preventDefault()
    setIsCheckoutOpen(true)
  }

  const completeBooking = (event) => {
    event.preventDefault()
    setIsCheckoutOpen(false)
    setBookingComplete(true)
  }

  return (
    <div className="doctor-details-page">
      <HomeHeader />
      <main className="doctor-details-main">
        <div className="doctor-details-container">
          <a className="doctor-back-link" href="/doctors"><ArrowLeft size={15} /> All doctors</a>

          {bookingComplete ? (
            <section className="booking-confirmation" role="status">
              <span><Check size={26} /></span>
              <p className="booking-kicker">REQUEST RECEIVED</p>
              <h1>Your appointment request is in.</h1>
              <p>Your {visitType === 'online' ? 'online' : 'in-person'} appointment with {doctor.name} is requested for <strong>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { dateStyle: 'long' })}</strong> at <strong>{selectedTime}</strong>. In a live service, a confirmation would be sent to <strong>{patientEmail}</strong>.</p>
              <p className="booking-payment-note" role="status">{paymentMethod === 'card' ? 'This preview did not process a payment. Your visit fee is still due.' : 'No payment was taken. Your visit fee is due at your appointment.'}</p>
              <a href="/doctors">Browse more doctors</a>
            </section>
          ) : (
            <div className="doctor-profile-layout">
              <div className="doctor-profile-content">
                <section className="doctor-profile-card">
                  <div className="doctor-profile-image"><img src={doctor.image} alt={doctor.name} /><span><i /> Accepting patients</span></div>
                  <div className="doctor-profile-summary">
                    <div className="profile-rating"><Star size={15} fill="currentColor" /> {doctor.rating} <span>({doctor.reviews} patient reviews)</span></div>
                    <h1>{doctor.name} <BadgeCheck size={21} /></h1>
                    <p className="profile-specialty">{doctor.specialty} · {doctor.credentials}</p>
                    <p className="profile-location"><MapPin size={15} /> {doctor.location} <span>·</span> {doctor.experience} experience</p>
                    <div className="profile-tags"><span><ShieldCheck size={14} /> Verified provider</span><span><Video size={14} /> In-person &amp; online</span></div>
                  </div>
                </section>

                <section className="profile-info-card">
                  <h2>About {doctor.name}</h2>
                  <p>{doctor.bio}</p>
                  <div className="profile-education"><strong>Education</strong><span>{doctor.education}</span></div>
                </section>

                <section className="profile-info-card">
                  <h2>What patients are saying</h2>
                  <div className="patient-review">
                    <span className="patient-review-stars">★★★★★</span>
                    <p>“{doctor.name} made me feel heard and explained everything clearly. I felt comfortable from the moment my appointment began.”</p>
                    <strong>Carewell patient <span>· Verified visit</span></strong>
                  </div>
                </section>
              </div>

              <aside className="booking-card">
                <div className="booking-card-heading"><div><span>BOOK A VISIT</span><h2>Choose an appointment</h2></div><div className="booking-price">${doctor.fee}<small>/ visit</small></div></div>
                <form onSubmit={submitBooking}>
                  <fieldset className="visit-type">
                    <legend>Appointment type</legend>
                    <label className={visitType === 'in-person' ? 'is-selected' : ''}>
                      <input type="radio" name="visitType" value="in-person" checked={visitType === 'in-person'} onChange={() => setVisitType('in-person')} />
                      <MapPin size={16} /> In person
                    </label>
                    <label className={visitType === 'online' ? 'is-selected' : ''}>
                      <input type="radio" name="visitType" value="online" checked={visitType === 'online'} onChange={() => setVisitType('online')} />
                      <Video size={16} /> Online
                    </label>
                  </fieldset>

                  <label className="booking-label" htmlFor="appointment-date">Choose a date</label>
                  <div className="booking-date-input"><CalendarDays size={16} /><input id="appointment-date" type="date" min={new Date().toISOString().slice(0, 10)} value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setSelectedTime('') }} required /></div>

                  <div className="available-times-heading"><span>Available times</span><Clock3 size={14} /></div>
                  <div className="available-times">
                    {doctor.availability.map((time) => (
                      <button
                        className={selectedTime === time ? 'time-slot is-selected' : 'time-slot'}
                        type="button"
                        key={time}
                        aria-pressed={selectedTime === time}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {!selectedTime && <p className="time-hint">Select a time to continue.</p>}

                  <label className="booking-label" htmlFor="patient-name">Your name</label>
                  <input className="booking-text-input" id="patient-name" value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="Full name" autoComplete="name" required />
                  <label className="booking-label" htmlFor="patient-email">Email address</label>
                  <input className="booking-text-input" id="patient-email" type="email" value={patientEmail} onChange={(event) => setPatientEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />

                  <button className="confirm-appointment" type="submit" disabled={!selectedDate || !selectedTime}>Continue to checkout <span>→</span></button>
                  <p className="booking-secure"><ShieldCheck size={14} /> Your information is private and secure.</p>
                </form>
              </aside>
            </div>
          )}
          {isCheckoutOpen && (
            <div className="booking-checkout-backdrop">
              <section className="booking-checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-checkout-title">
                <button className="booking-checkout-close" type="button" aria-label="Close checkout" onClick={() => setIsCheckoutOpen(false)}><X size={18} /></button>
                <p className="booking-checkout-kicker"><ShieldCheck size={14} /> SECURE CHECKOUT</p>
                <h2 id="booking-checkout-title">Review your appointment</h2>
                <p className="booking-checkout-subtitle">Confirm the details and choose how you’d like to pay.</p>

                <div className="booking-checkout-summary">
                  <div className="booking-checkout-doctor">
                    <img src={doctor.image} alt="" />
                    <div><strong>{doctor.name}</strong><span>{doctor.specialty} · {visitType === 'online' ? 'Online visit' : 'In-person visit'}</span></div>
                  </div>
                  <div className="booking-checkout-detail"><span>Appointment</span><strong>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { dateStyle: 'medium' })} · {selectedTime}</strong></div>
                  <div className="booking-checkout-detail"><span>Patient</span><strong>{patientName}</strong></div>
                </div>

                <form onSubmit={completeBooking}>
                  <fieldset className="booking-payment-methods">
                    <legend>Payment method</legend>
                    <button className={paymentMethod === 'card' ? 'booking-payment-option is-selected' : 'booking-payment-option'} type="button" aria-pressed={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')}>
                      <CreditCard size={18} /><span><strong>Credit or debit card</strong><small>Visa · Mastercard · Amex</small></span><i />
                    </button>
                    <button className={paymentMethod === 'in-person' ? 'booking-payment-option is-selected' : 'booking-payment-option'} type="button" aria-pressed={paymentMethod === 'in-person'} onClick={() => setPaymentMethod('in-person')}>
                      <MapPin size={18} /><span><strong>Pay at your visit</strong><small>No payment taken today</small></span><i />
                    </button>
                  </fieldset>

                  <div className="booking-checkout-total"><span>{paymentMethod === 'in-person' ? 'Due at your visit' : 'Visit fee'}</span><strong>${doctor.fee.toFixed(2)}</strong></div>
                  <p className="booking-checkout-disclaimer" role="status">Checkout preview only — payments aren’t connected, and no card details are collected.</p>
                  <button className="confirm-appointment booking-checkout-submit" type="submit">Confirm appointment <span>→</span></button>
                  <button className="booking-checkout-edit" type="button" onClick={() => setIsCheckoutOpen(false)}>Back to appointment details</button>
                </form>
              </section>
            </div>
          )}
        </div>
      </main>
      <HomeFooter />
    </div>
  )
}

export default DoctorDetailsPage
