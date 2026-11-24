import { useState } from 'react'
import { ArrowRight, BadgeCheck, CalendarDays, MapPin, Search, ShieldCheck, Stethoscope } from 'lucide-react'
import CustomSelect from './CustomSelect'
import teamPhoto from '../assets/Care team photography.png'
import { doctors, specialties } from '../data/doctors'

function CarewellHero() {
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')

  const searchDoctors = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (specialty) params.set('specialty', specialty)
    if (location.trim()) params.set('location', location.trim())
    const query = params.toString()
    window.location.href = query ? `/doctors?${query}` : '/doctors'
  }

  return (
    <section className="carewell-hero" aria-labelledby="carewell-hero-title">
      <div className="carewell-hero-content">
        <div className="carewell-hero-copy">
          <span className="carewell-eyebrow"><span aria-hidden="true">♥</span> SIMPLE CARE, JUST A CLICK AWAY</span>
          <h1 id="carewell-hero-title">Your Health,<br />Simplified. <span>Book Top<br className="desktop-break" /> Specialists Near You</span></h1>
          <p>Find the right doctor, choose a time that works, and get back to feeling your best. Great care starts here.</p>
          <div className="carewell-hero-promise"><BadgeCheck size={15} /> Verified specialists. Care that fits your life.</div>
          <div className="carewell-hero-actions">
            <a href="/doctors">Explore doctors <ArrowRight size={15} /></a>
            <span><ShieldCheck size={14} /> Private, patient-first care</span>
          </div>
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
          <CustomSelect
            className="hero-specialty-select"
            triggerClassName="carewell-search-select-trigger"
            value={specialty}
            onChange={setSpecialty}
            placeholder="What do you need?"
            ariaLabel="Choose a specialty"
            options={[{ value: '', label: 'All specialties' }, ...specialties.map((name) => ({ value: name, label: name }))]}
          />
        </span></label>
        <label><MapPin size={17} /><span><strong>Location</strong>
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, State, ZIP" />
        </span></label>
        <label className="carewell-date-field"><CalendarDays size={17} /><span><strong>Date</strong><input type="date" aria-label="Appointment date" /></span></label>
        <button type="submit"><Search size={15} /> Find Doctors</button>
      </form>

      <div className="carewell-stats">
        <div className="stats-rating"><span><strong>{doctors.length}</strong> featured doctors</span><small>Meet your care team</small></div>
        <div><strong>{specialties.length}</strong><small>Available specialties</small></div>
        <div><strong>2</strong><small>Visit formats</small></div>
        <div><strong>3</strong><small>Simple booking steps</small></div>
        <a href="#doctors" aria-label="Explore doctors"><ArrowRight size={15} /></a>
      </div>
    </section>
  )
}

export default CarewellHero
