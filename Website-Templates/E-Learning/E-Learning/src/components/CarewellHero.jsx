import { useState } from 'react'
import { ArrowRight, BadgeCheck, CalendarDays, MapPin, Search, Stethoscope } from 'lucide-react'
import teamPhoto from '../assets/Care team photography.png'

function CarewellHero() {
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')

  const searchDoctors = (event) => {
    event.preventDefault()
    setMessage('Explore available specialists below.')
    document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="carewell-hero" aria-labelledby="carewell-hero-title">
      <div className="carewell-hero-content">
        <div className="carewell-hero-copy">
          <span className="carewell-eyebrow"><span aria-hidden="true">♥</span> SIMPLE CARE, JUST A CLICK AWAY</span>
          <h1 id="carewell-hero-title">Your Health,<br />Simplified. <span>Book Top<br className="desktop-break" /> Specialists Near You</span></h1>
          <p>Find the right doctor, choose a time that works, and get back to feeling your best. Great care starts here.</p>
          <div className="carewell-hero-promise"><BadgeCheck size={15} /> Verified specialists. Care that fits your life.</div>
        </div>
        <div className="carewell-hero-image">
          <img src={teamPhoto} alt="A team of welcoming Carewell doctors" />
          <span className="verified-tag"><BadgeCheck size={14} /> 100% verified doctors</span>
          <div className="appointment-tag">
            <span><CalendarDays size={20} /></span>
            <div><strong>Your next step to better health</strong><small>Appointments that fit your life</small></div>
          </div>
        </div>
      </div>

      <form className="carewell-search" onSubmit={searchDoctors}>
        <label><Stethoscope size={17} /><span><strong>Specialty</strong>
          <select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
            <option value="">What do you need?</option><option>Cardiology</option><option>Dermatology</option><option>Pediatrics</option><option>Dental</option>
          </select>
        </span></label>
        <label><MapPin size={17} /><span><strong>Location</strong>
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, State, ZIP" />
        </span></label>
        <label className="carewell-date-field"><CalendarDays size={17} /><span><strong>Date</strong><input type="date" aria-label="Appointment date" /></span></label>
        <button type="submit"><Search size={15} /> Find Doctors</button>
        {message && <span className="search-feedback" role="status">{message}</span>}
      </form>

      <div className="carewell-stats">
        <div className="stats-rating"><span>★★★★★ <strong>4.9/5</strong></span><small>Trusted by 10,000+ patients</small></div>
        <div><strong>500+</strong><small>Verified specialists</small></div>
        <div><strong>30+</strong><small>Medical specialties</small></div>
        <div><strong>98%</strong><small>Patient satisfaction</small></div>
        <a href="#doctors" aria-label="Explore doctors"><ArrowRight size={15} /></a>
      </div>
    </section>
  )
}

export default CarewellHero
