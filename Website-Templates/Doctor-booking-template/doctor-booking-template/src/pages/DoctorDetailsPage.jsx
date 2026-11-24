import { useEffect, useState } from 'react'
import { ArrowLeft, BadgeCheck, CalendarDays, Check, Clock3, CreditCard, MapPin, ShieldCheck, Star, Video, X } from 'lucide-react'
import HomeHeader from '../components/HomeHeader'
import HomeFooter from '../components/HomeFooter'
import { doctors } from '../data/doctors'
import './DoctorDetailsPage.css'

function getLocalDoctor(slug) {
  const starterDoctor = doctors.find((item) => item.slug === slug)
  try {
    const profiles = JSON.parse(localStorage.getItem('carewell-demo-provider-profiles-v1') || '{}') || {}
    const providerDoctor = Object.values(profiles).find((profile) => profile?.slug === slug && profile.active)
    return { doctor: providerDoctor ? { ...starterDoctor, ...providerDoctor, image: providerDoctor.image || starterDoctor?.image || '' } : starterDoctor, error: '' }
  } catch (error) {
    return { doctor: starterDoctor, error: `Unable to load local provider profiles: ${error.message}` }
  }
}

function DoctorDetailsPage({ slug, mode = 'local', apiBaseUrl = '' }) {
  const starterDoctor = doctors.find((item) => item.slug === slug)
  const [localDoctorData] = useState(() => mode === 'local' ? getLocalDoctor(slug) : null)
  const [remoteDoctor, setRemoteDoctor] = useState(starterDoctor)
  const [doctorLoading, setDoctorLoading] = useState(mode === 'api')
  const [visitType, setVisitType] = useState('in-person')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('in-person')
  const [paymentOptions, setPaymentOptions] = useState({ stripe: false, paystack: false })
  const [paymentSetupError, setPaymentSetupError] = useState('')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSaving, setBookingSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [reviewData, setReviewData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 })
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewBusy, setReviewBusy] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    let active = true
    if (mode !== 'api') return () => { active = false }
    fetch(`${apiBaseUrl}/doctors/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || 'Doctor not found.')
        if (active) setRemoteDoctor({ ...starterDoctor, ...result.doctor, image: result.doctor.image || starterDoctor?.image || '' })
      })
      .catch(() => { if (active) setRemoteDoctor(null) })
      .finally(() => { if (active) setDoctorLoading(false) })
    return () => { active = false }
  }, [apiBaseUrl, mode, slug, starterDoctor])

  useEffect(() => {
    let active = true
    async function loadProfileExtras() {
      if (mode === 'local') {
        const session = JSON.parse(localStorage.getItem('carewell-demo-session-v1') || 'null')
        const savedReviews = JSON.parse(localStorage.getItem('carewell-doctor-reviews-v1') || '{}') || {}
        const reviews = Array.isArray(savedReviews[slug]) ? savedReviews[slug] : []
        if (active) {
          setCurrentUser(session)
          if (session?.role === 'patient') {
            setPatientName(session.name || '')
            setPatientEmail(session.email || '')
          }
          setReviewData({
            reviews,
            averageRating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
            totalReviews: reviews.length,
          })
          setHasReviewed(reviews.some((review) => review.patientEmail === session?.email))
        }
        return
      }

      try {
        const [reviewsResponse, sessionResponse, paymentResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/doctors/${encodeURIComponent(slug)}/reviews`),
          fetch(`${apiBaseUrl}/auth/me`, { credentials: 'include' }),
          fetch('/api/payments/config'),
        ])
        const reviewsResult = await reviewsResponse.json()
        if (!reviewsResponse.ok) throw new Error(reviewsResult.error || 'Unable to load patient reviews.')
        const sessionResult = sessionResponse.ok ? await sessionResponse.json() : null
        const paymentResult = paymentResponse.ok ? await paymentResponse.json() : null
        if (!active) return
        setReviewData(reviewsResult)
        setCurrentUser(sessionResult?.user || null)
        if (sessionResult?.user?.role === 'patient') {
          setPatientName(sessionResult.user.name || '')
          setPatientEmail(sessionResult.user.email || '')
        }
        if (sessionResult?.user?.role === 'patient') {
          const mineResponse = await fetch(`${apiBaseUrl}/doctors/${encodeURIComponent(slug)}/reviews/mine`, { credentials: 'include' })
          if (mineResponse.ok) {
            const mineResult = await mineResponse.json()
            if (active) setHasReviewed(Boolean(mineResult.review))
          }
        }
        if (paymentResult) {
          setPaymentOptions(paymentResult)
          if (!paymentResult.stripe && !paymentResult.paystack) {
            setPaymentSetupError('Online checkout is not configured. You can still pay at your visit.')
          }
        } else setPaymentSetupError('Online checkout is unavailable. You can still pay at your visit.')
      } catch (error) {
        if (active) setReviewError(error.message)
      }
    }
    void loadProfileExtras()
    return () => { active = false }
  }, [apiBaseUrl, mode, slug])

  const doctor = mode === 'api' ? remoteDoctor : localDoctorData?.doctor

  if (doctorLoading) return <div className="doctor-not-found"><p>Loading provider details…</p></div>

  if (!doctor) {
    return (
      <div className="doctor-details-page">
        <HomeHeader />
        <main className="doctor-not-found"><h1>Doctor not found</h1><p>{localDoctorData?.error || 'We couldn’t find that provider.'}</p><a href="/doctors">Browse all doctors</a></main>
        <HomeFooter />
      </div>
    )
  }

  const submitBooking = (event) => {
    event.preventDefault()
    setIsCheckoutOpen(true)
  }

  const completeBooking = async (event) => {
    event.preventDefault()
    setBookingSaving(true)
    setBookingError('')
    try {
      const [year, month, day] = selectedDate.split('-').map(Number)
      const timeParts = selectedTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
      const hour = Number(timeParts?.[1] || 0) % 12 + (timeParts?.[3]?.toUpperCase() === 'PM' ? 12 : 0)
      const appointmentDate = new Date(year, month - 1, day, hour, Number(timeParts?.[2] || 0))
      if (mode === 'api' && ['stripe', 'paystack'].includes(paymentMethod)) {
        const response = await fetch('/api/payments/checkout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            provider: paymentMethod,
            doctorSlug: doctor.slug,
            appointmentType: visitType,
            startsAt: appointmentDate.toISOString(),
            timeLabel: selectedTime,
          }),
        })
        const result = await response.json()
        if (response.status === 401) {
          const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
          window.location.assign(`/login?next=${next}`)
          return
        }
        if (!response.ok) throw new Error(result.error || 'Unable to start online checkout.')
        window.location.assign(result.url)
        return
      }
      if (mode === 'api') {
        const response = await fetch(`${apiBaseUrl}/appointments`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ doctorSlug: doctor.slug, appointmentType: visitType, startsAt: appointmentDate.toISOString(), timeLabel: selectedTime }),
        })
        const result = await response.json().catch(() => ({}))
        if (response.status === 401) {
          const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
          window.location.replace(`/login?next=${next}`)
          return
        }
        if (!response.ok) throw new Error(result.error || 'Unable to request this appointment.')
      } else {
        const dataKey = 'carewell-admin-demo-v1'
        const existing = JSON.parse(localStorage.getItem(dataKey) || 'null')
        const data = existing?.appointments && existing?.settings ? existing : {
          appointments: [],
          providers: [],
          patients: [],
          doctors: doctors.map((item, index) => ({ ...item, id: `doctor-demo-${index + 1}`, active: true })),
          settings: { clinicName: 'Carewell', supportEmail: 'hello@carewell.example', appointmentNotice: 'Appointment requests are confirmed by the care team.' },
        }
        data.appointments.unshift({
          id: `apt-${Date.now()}`,
          reference: `CW-${String(Date.now()).slice(-6)}`,
          patientName,
          patientEmail,
          doctorSlug: doctor.slug,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          appointmentType: visitType,
          startsAt: appointmentDate.toISOString(),
          fee: doctor.fee,
          status: 'pending',
        })
        localStorage.setItem(dataKey, JSON.stringify(data))
      }
      setIsCheckoutOpen(false)
      setBookingComplete(true)
    } catch (error) {
      setBookingError(error.message)
    } finally {
      setBookingSaving(false)
    }
  }

  const submitReview = async (event) => {
    event.preventDefault()
    setReviewError('')
    setReviewSuccess('')
    const comment = reviewComment.trim()
    if (!reviewRating || comment.length < 5 || comment.length > 1000) {
      setReviewError('Choose a star rating and write a comment between 5 and 1,000 characters.')
      return
    }
    setReviewBusy(true)
    try {
      let review
      if (mode === 'api') {
        const response = await fetch(`${apiBaseUrl}/doctors/${encodeURIComponent(slug)}/reviews`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ rating: reviewRating, comment }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to submit your review.')
        review = result.review
      } else {
        const key = 'carewell-doctor-reviews-v1'
        const saved = JSON.parse(localStorage.getItem(key) || '{}') || {}
        const reviews = Array.isArray(saved[slug]) ? saved[slug] : []
        if (reviews.some((item) => item.patientEmail === currentUser.email)) {
          throw new Error('You have already reviewed this doctor in this browser.')
        }
        review = {
          displayName: currentUser.name,
          patientEmail: currentUser.email,
          rating: reviewRating,
          comment,
          createdAt: new Date().toISOString(),
        }
        saved[slug] = [review, ...reviews]
        localStorage.setItem(key, JSON.stringify(saved))
      }
      setReviewData((previous) => ({
        reviews: [review, ...previous.reviews],
        averageRating: (previous.averageRating * previous.totalReviews + review.rating) / (previous.totalReviews + 1),
        totalReviews: previous.totalReviews + 1,
      }))
      setHasReviewed(true)
      setReviewComment('')
      setReviewRating(0)
      setReviewSuccess('Thank you for sharing your experience.')
    } catch (error) {
      setReviewError(error.message)
    } finally {
      setReviewBusy(false)
    }
  }

  const displayedRating = reviewData.totalReviews
    ? reviewData.averageRating.toFixed(1)
    : mode === 'local' ? doctor.rating.toFixed(1) : 'New'
  const paymentNotice = new URLSearchParams(window.location.search).get('payment') === 'cancelled'
    ? 'Checkout was canceled. If you see a pending bank authorization, it may take a short time to clear.'
    : ''

  return (
    <div className="doctor-details-page">
      <HomeHeader />
      <main className="doctor-details-main">
        <div className="doctor-details-container">
          <a className="doctor-back-link" href="/doctors"><ArrowLeft size={15} /> All doctors</a>
          {paymentNotice && <p className="booking-payment-note" role="status">{paymentNotice}</p>}

          {bookingComplete ? (
            <section className="booking-confirmation" role="status">
              <span><Check size={26} /></span>
              <p className="booking-kicker">REQUEST RECEIVED</p>
              <h1>Your appointment request is in.</h1>
              <p>Your {visitType === 'online' ? 'online' : 'in-person'} appointment with {doctor.name} is requested for <strong>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { dateStyle: 'long' })}</strong> at <strong>{selectedTime}</strong>. In a live service, a confirmation would be sent to <strong>{patientEmail}</strong>.</p>
              <p className="booking-payment-note" role="status">No payment was taken. Your visit fee is due at your appointment.</p>
              <a href="/doctors">Browse more doctors</a>
            </section>
          ) : (
            <div className="doctor-profile-layout">
              <div className="doctor-profile-content">
                <section className="doctor-profile-card">
                  <div className="doctor-profile-image"><img src={doctor.image} alt={doctor.name} /><span><i /> Accepting patients</span></div>
                  <div className="doctor-profile-summary">
                    <div className="profile-rating"><Star size={15} fill="currentColor" /> {displayedRating} <span>({reviewData.totalReviews || (mode === 'local' ? doctor.reviews : 0)} patient reviews)</span></div>
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
                  <div className="reviews-section-heading">
                    <div><span className="review-eyebrow">PATIENT EXPERIENCES</span><h2>Reviews for {doctor.name}</h2></div>
                    <strong><Star size={15} fill="currentColor" /> {displayedRating} <small>({reviewData.totalReviews} reviews)</small></strong>
                  </div>
                  {reviewError && <p className="review-message review-error" role="alert">{reviewError}</p>}
                  {reviewData.reviews.length ? (
                    <div className="patient-reviews-list">
                      {reviewData.reviews.map((review) => (
                        <article className="patient-review" key={review._id || `${review.displayName}-${review.createdAt}`}>
                          <span className="patient-review-stars" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                          <p>“{review.comment}”</p>
                          <footer><strong>{review.displayName}</strong><span>· {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(review.createdAt))}</span></footer>
                        </article>
                      ))}
                    </div>
                  ) : <p className="reviews-empty">{mode === 'api' ? 'No patient reviews yet. Be the first to share your experience after a completed visit.' : 'No demo reviews yet. Sign in to leave the first one.'}</p>}
                  {currentUser?.role === 'patient' && !hasReviewed ? (
                    <form className="review-form" onSubmit={submitReview}>
                      <h3>Share your experience</h3>
                      <label>Your rating</label>
                      <div className="review-star-picker" role="radiogroup" aria-label="Your rating">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button key={rating} type="button" role="radio" aria-checked={reviewRating === rating} aria-label={`${rating} star${rating === 1 ? '' : 's'}`} onClick={() => setReviewRating(rating)}>
                            <Star size={23} fill={reviewRating >= rating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                        <span>{reviewRating ? `${reviewRating} of 5` : 'Select a rating'}</span>
                      </div>
                      <label htmlFor="doctor-review-comment">Your comment</label>
                      <textarea id="doctor-review-comment" value={reviewComment} maxLength={1000} onChange={(event) => setReviewComment(event.target.value)} placeholder="What stood out about your visit?" rows={4} required />
                      <small className="review-demo-note">Please don’t include private medical information in a review.</small>
                      {mode === 'local' && <small className="review-demo-note">Demo review — stored only in this browser and not verified.</small>}
                      {reviewSuccess && <p className="review-message review-success" role="status">{reviewSuccess}</p>}
                      {reviewError && <p className="review-message review-error" role="alert">{reviewError}</p>}
                      <button className="review-submit" type="submit" disabled={reviewBusy}>{reviewBusy ? 'Submitting…' : 'Post review'}</button>
                    </form>
                  ) : currentUser?.role === 'patient' && hasReviewed ? (
                    <p className="review-message review-success" role="status">Thank you — you have already reviewed this doctor.</p>
                  ) : mode === 'api' ? (
                    <p className="review-signin-prompt"><a href={`/login?next=${encodeURIComponent(`/doctors/${slug}`)}`}>Sign in as a patient</a> to leave a review after a completed appointment.</p>
                  ) : (
                    <p className="review-signin-prompt"><a href={`/login?next=${encodeURIComponent(`/doctors/${slug}`)}`}>Sign in as a patient</a> to add a local demo review.</p>
                  )}
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
                    {(doctor.availability || []).map((time) => (
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
                    {mode === 'api' && paymentOptions.stripe && <button className={paymentMethod === 'stripe' ? 'booking-payment-option is-selected' : 'booking-payment-option'} type="button" aria-pressed={paymentMethod === 'stripe'} onClick={() => setPaymentMethod('stripe')}>
                      <CreditCard size={18} /><span><strong>Pay by card with Stripe</strong><small>Visa · Mastercard · Amex</small></span><i />
                    </button>}
                    {mode === 'api' && paymentOptions.paystack && <button className={paymentMethod === 'paystack' ? 'booking-payment-option is-selected' : 'booking-payment-option'} type="button" aria-pressed={paymentMethod === 'paystack'} onClick={() => setPaymentMethod('paystack')}>
                      <ShieldCheck size={18} /><span><strong>Pay with Paystack</strong><small>Secure online checkout · USD</small></span><i />
                    </button>}
                    <button className={paymentMethod === 'in-person' ? 'booking-payment-option is-selected' : 'booking-payment-option'} type="button" aria-pressed={paymentMethod === 'in-person'} onClick={() => setPaymentMethod('in-person')}>
                      <MapPin size={18} /><span><strong>Pay at your visit</strong><small>No payment taken today</small></span><i />
                    </button>
                  </fieldset>

                  <div className="booking-checkout-total"><span>{paymentMethod === 'in-person' ? 'Due at your visit' : 'Visit fee'}</span><strong>${doctor.fee.toFixed(2)}</strong></div>
                  {paymentSetupError && mode === 'api' && <p className="booking-checkout-disclaimer" role="status">{paymentSetupError}</p>}
                  {mode === 'local' && <p className="booking-checkout-disclaimer" role="status">Local demo checkout — online payments are available only in the configured Next.js app.</p>}
                  {bookingError && <p className="booking-checkout-error" role="alert">{bookingError}</p>}
                  <button className="confirm-appointment booking-checkout-submit" type="submit" disabled={bookingSaving}>{bookingSaving ? 'Saving…' : 'Confirm appointment'} <span>→</span></button>
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
