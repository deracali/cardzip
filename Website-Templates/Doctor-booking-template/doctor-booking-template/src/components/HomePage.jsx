import { useEffect, useState } from 'react'
import { ArrowRight, CalendarCheck, CalendarDays, Check, Clock3, Heart, ShieldCheck, Smile, Star, Stethoscope, UserRound, Video } from 'lucide-react'
import CarewellHero from './CarewellHero'
import HomeFooter from './HomeFooter'
import HomeHeader from './HomeHeader'
import { doctors } from '../data/doctors'
import './HomePage.css'

const specialties = [
  { name: 'Cardiology', detail: 'Find care for your heart', icon: Heart },
  { name: 'Dermatology', detail: 'Expert skin care nearby', icon: ShieldCheck },
  { name: 'Pediatrics', detail: 'Care for little patients', icon: Smile },
  { name: 'Dental', detail: 'A brighter healthy smile', icon: Stethoscope },
]

function HomePage({ mode = 'local', apiBaseUrl = '' }) {
  const [patientReviews, setPatientReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    let active = true
    async function loadReviews() {
      try {
        if (mode === 'local') {
          const saved = JSON.parse(localStorage.getItem('carewell-doctor-reviews-v1') || '{}') || {}
          const reviews = doctors.flatMap((doctor) => (Array.isArray(saved[doctor.slug]) ? saved[doctor.slug] : [])
            .map((review) => ({ ...review, doctorName: doctor.name })))
          reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          const totalReviews = reviews.length
          const averageRating = totalReviews ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0
          if (active) {
            setPatientReviews(reviews.slice(0, 2))
            setReviewSummary({ averageRating, totalReviews })
          }
          return
        }

        const responses = await Promise.all(doctors.map(async (doctor) => {
          const response = await fetch(`${apiBaseUrl}/doctors/${encodeURIComponent(doctor.slug)}/reviews`)
          const result = await response.json()
          if (!response.ok) throw new Error(result.error || `Unable to load reviews for ${doctor.name}.`)
          return { doctor, result }
        }))
        const reviews = responses.flatMap(({ doctor, result }) => result.reviews.map((review) => ({ ...review, doctorName: doctor.name })))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        const totalReviews = responses.reduce((sum, item) => sum + item.result.totalReviews, 0)
        const averageRating = totalReviews
          ? responses.reduce((sum, item) => sum + item.result.averageRating * item.result.totalReviews, 0) / totalReviews
          : 0
        if (active) {
          setPatientReviews(reviews.slice(0, 2))
          setReviewSummary({ averageRating, totalReviews })
        }
      } catch (error) {
        if (active) setReviewError(error.message)
      }
    }
    void loadReviews()
    return () => { active = false }
  }, [apiBaseUrl, mode])

  return (
    <div className="carewell-home">
      <HomeHeader />
      <main>
        <CarewellHero />
        <section className="home-value-strip" aria-label="Carewell benefits">
          <article><span><ShieldCheck size={18} /></span><div><strong>Care you can trust</strong><small>Clear provider profiles and thoughtful care.</small></div></article>
          <article><span><Clock3 size={18} /></span><div><strong>Appointments on your time</strong><small>Choose a visit that fits your day.</small></div></article>
          <article><span><Video size={18} /></span><div><strong>In-person or online</strong><small>Flexible options for the care you need.</small></div></article>
        </section>
        <section className="home-section" id="specialties">
          <div className="home-section-heading"><div><h2>The right care, for every you.</h2><p>Explore specialties and find the expert you need.</p></div><a href="/specialties">View all specialties →</a></div>
          <div className="specialty-list">
            {specialties.map(({ name, detail, icon: Icon }) => {
              const hasProviders = doctors.some((doctor) => doctor.specialty === name)
              const href = hasProviders ? `/doctors?specialty=${encodeURIComponent(name)}` : '/specialties'
              return <a href={href} className="specialty-tile" key={name}><span><Icon size={18} /></span><strong>{name}</strong><small>{detail}</small></a>
            })}
          </div>
        </section>

        <section className="home-section doctor-section" id="doctors">
          <div className="home-section-heading"><div><h2>Great doctors. Ready when you are.</h2><p>Experienced specialists, hand-picked for you.</p></div><a href="/doctors">Meet all doctors →</a></div>
          <div className="doctor-list">
            {doctors.map((doctor) => (
              <article className="doctor-tile" key={doctor.name}>
                <a className="doctor-tile-photo" href={`/doctors/${doctor.slug}`} aria-label={`View ${doctor.name}'s profile`}><img src={doctor.image} alt={doctor.name} /><span><i /> Available Today</span></a>
                <div className="doctor-tile-info"><h3><a href={`/doctors/${doctor.slug}`}>{doctor.name}</a></h3><p>{doctor.specialty} · {doctor.credentials}</p><div className="doctor-tile-meta"><span>★★★★★ {doctor.rating} · {doctor.reviews} Reviews</span><strong>${doctor.fee} / visit</strong></div><div className="doctor-tile-meta muted"><span>{doctor.location}</span><span>{doctor.experience} experience</span></div><a href={`/doctors/${doctor.slug}`}>Book Appointment <span>→</span></a></div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section steps-section">
          <div className="steps-heading"><div><span>CARE THAT FITS YOUR LIFE</span><h2>Better care in three simple steps.</h2></div><p>With Carewell, finding the right doctor and getting care is as easy as taking a deep breath.</p></div>
          <div className="home-steps">
            <article><span className="step-count">01</span><div className="step-icon"><Stethoscope size={18} /></div><h3>Find your specialist</h3><p>Search by specialty, location, or what matters most to you.</p></article>
            <article><span className="step-count">02</span><div className="step-icon"><CalendarCheck size={18} /></div><h3>Choose your time</h3><p>See real-time availability and book a visit that fits your schedule.</p></article>
            <article><span className="step-count">03</span><div className="step-icon"><Heart size={18} /></div><h3>Feel better, together</h3><p>Meet your care team and take a confident step toward better health.</p></article>
          </div>
        </section>

        <section className="home-section dashboard-preview-section">
          <div className="home-section-heading"><div><span className="preview-eyebrow">YOUR CARE, ORGANIZED</span><h2>Every appointment, one clear dashboard.</h2><p>Keep visit details close, from your first request to your next appointment.</p></div><a href="/login">Sign in to your dashboard →</a></div>
          <div className="home-dashboard-preview">
            <div className="dashboard-preview-copy">
              <span className="preview-icon"><Heart size={20} /></span>
              <h3>A calmer way to manage your visits.</h3>
              <p>Carewell brings appointment dates, provider details, and request status together in one simple workspace.</p>
              <ul>
                <li><Check size={15} /> See upcoming and past appointments</li>
                <li><Check size={15} /> Track when a request is confirmed</li>
                <li><Check size={15} /> Choose online or in-person visits</li>
              </ul>
              <a href="/signup">Create your patient account <ArrowRight size={14} /></a>
            </div>
            <div className="dashboard-preview-ui" aria-label="Illustration of the Carewell patient dashboard">
              <header><span><Heart size={13} /> carewell<span>.</span></span><small>Static preview</small></header>
              <div className="preview-greeting"><small>PATIENT OVERVIEW</small><strong>Good to see you, Avery</strong></div>
              <div className="preview-metrics"><article><small>UPCOMING VISITS</small><strong>1</strong></article><article><small>VISIT HISTORY</small><strong>2</strong></article></div>
              <article className="preview-appointment"><span><CalendarDays size={16} /></span><div><small>NEXT APPOINTMENT</small><strong>Dr. Sarah Mitchell</strong><small>Dermatology · In person</small></div><em>Confirmed</em></article>
              <div className="preview-footer"><span><UserRound size={13} /> Your care, in one place</span><span><ShieldCheck size={13} /> Private account</span></div>
            </div>
          </div>
        </section>

        <section className="home-section reviews-section" id="reviews">
          <div className="reviews-heading">
            <span>REAL PATIENT EXPERIENCES</span>
            <h2>Care grows when we listen.</h2>
            {reviewSummary.totalReviews ? (
              <><strong><Star size={15} fill="currentColor" /> {reviewSummary.averageRating.toFixed(1)} / 5</strong><small>{reviewSummary.totalReviews} patient {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'}</small></>
            ) : <small>No patient reviews yet. Your voice can help shape better care.</small>}
            <a href="/doctors">Meet the care team <ArrowRight size={14} /></a>
          </div>
          <div className="reviews-list">
            {patientReviews.length ? patientReviews.map((review) => (
              <blockquote key={review._id || `${review.doctorName}-${review.createdAt}`}>
                <strong aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</strong>
                <p>“{review.comment}”</p>
                <footer><span>{review.displayName?.slice(0, 1)?.toUpperCase() || 'P'}</span><div><b>{review.displayName || 'Carewell patient'}</b><small>{review.doctorName}</small></div>{mode === 'api' && <ShieldCheck size={15} />}</footer>
              </blockquote>
            )) : (
              <div className="reviews-empty-state">
                <span><Heart size={20} /></span>
                <div><strong>{reviewError ? 'Patient reviews are temporarily unavailable.' : 'Your next visit could start the conversation.'}</strong><small>{reviewError || (mode === 'api' ? 'Reviews from completed visits will appear here.' : 'Sign in to a local demo account and add a review after your visit.')}</small></div>
                <a href="/doctors">Find a doctor <ArrowRight size={14} /></a>
              </div>
            )}
          </div>
        </section>
      </main>
      <section className="carewell-cta">
        <div><h2>Ready to find care that feels right?</h2><p>Explore trusted providers and choose a visit that works for you.</p></div>
        <a href="/doctors">Find a doctor <ArrowRight size={15} /></a>
      </section>
      <HomeFooter />
    </div>
  )
}

export default HomePage
