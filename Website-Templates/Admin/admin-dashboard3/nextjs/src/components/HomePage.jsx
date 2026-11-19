import { CalendarCheck, Heart, ShieldCheck, Smile, Stethoscope } from 'lucide-react'
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

function HomePage() {
  return (
    <div className="carewell-home">
      <HomeHeader />
      <main>
        <CarewellHero />
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

        <section className="home-section reviews-section" id="reviews">
          <div className="reviews-heading"><span>REAL PEOPLE, BETTER CARE</span><h2>A little less worry.<br />A lot more trust.</h2><strong>★★★★★</strong><small>4.9/5 from 2,400+ reviews</small></div>
          <div className="reviews-list">
            <blockquote><strong>★★★★★</strong><p>“I found a dermatologist who listened and explained everything. Booking was easy, and I finally feel taken care of.”</p><footer><span>A</span><div><b>Amanda L.</b><small>Verified patient</small></div><ShieldCheck size={15} /></footer></blockquote>
            <blockquote><strong>★★★★★</strong><p>“The doctor was kind, the appointment started on time, and I could book from my phone. This is how healthcare should feel.”</p><footer><span className="avatar-teal">M</span><div><b>Michael R.</b><small>Verified patient</small></div><ShieldCheck size={15} /></footer></blockquote>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  )
}

export default HomePage
