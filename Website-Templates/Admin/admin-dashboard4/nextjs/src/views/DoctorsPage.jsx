import { useMemo, useState } from 'react'
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react'
import HomeHeader from '../components/HomeHeader'
import HomeFooter from '../components/HomeFooter'
import { doctors, specialties } from '../data/doctors'
import './DoctorsPage.css'

function DoctorsPage({ bookingMode = false }) {
  const searchParams = new URLSearchParams(window.location.search)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [sortBy, setSortBy] = useState('recommended')

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = doctors.filter((doctor) => {
      const matchesQuery = !normalizedQuery ||
        `${doctor.name} ${doctor.specialty} ${doctor.credentials}`.toLowerCase().includes(normalizedQuery)
      const matchesSpecialty = !specialty || doctor.specialty === specialty
      const matchesLocation = !location || doctor.location.toLowerCase().includes(location.trim().toLowerCase())
      return matchesQuery && matchesSpecialty && matchesLocation
    })

    return sortBy === 'rating'
      ? [...filtered].sort((a, b) => b.rating - a.rating)
      : filtered
  }, [location, query, sortBy, specialty])

  return (
    <div className={bookingMode ? 'doctors-page booking-page' : 'doctors-page'}>
      <HomeHeader />
      <main>
        <section className="doctors-hero">
          <div className="doctors-page-container">
            <a className="doctors-breadcrumb" href="/">Home <span>/</span> {bookingMode ? 'Book an appointment' : 'Find doctors'}</a>
            <span className="doctors-eyebrow">{bookingMode ? 'BOOK CARE WITH CONFIDENCE' : 'PERSONALIZED CARE STARTS HERE'}</span>
            <h1>{bookingMode ? 'Book your appointment.' : 'Meet your care team.'}</h1>
            <p>{bookingMode ? 'Choose a doctor to see available appointment times and request a visit.' : 'Find a trusted specialist who listens, understands, and is ready to help.'}</p>
            {bookingMode && (
              <ol className="booking-steps" aria-label="Booking steps">
                <li className="is-current"><span>1</span> Choose a doctor</li>
                <li><span>2</span> Select a time</li>
                <li><span>3</span> Your details</li>
              </ol>
            )}
            <form className="doctors-filter-bar" onSubmit={(event) => event.preventDefault()}>
              <label className="doctors-filter-search">
                <Search size={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Doctor name or specialty" aria-label="Search doctor name or specialty" />
              </label>
              <label className="doctors-filter-location">
                <MapPin size={18} />
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or ZIP code" aria-label="Filter by city or ZIP code" />
              </label>
              <label className="doctors-filter-specialty">
                <SlidersHorizontal size={17} />
                <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} aria-label="Filter by specialty">
                  <option value="">All specialties</option>
                  {specialties.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <button type="submit"><Search size={16} /> Search</button>
            </form>
          </div>
        </section>

        <section className="doctors-results doctors-page-container">
          <div className="doctors-results-heading">
            <div><h2>{bookingMode ? 'Choose a doctor' : 'Available specialists'}</h2><p>{filteredDoctors.length} trusted {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} ready to see you</p></div>
            <label>Sort by
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
              </select>
            </label>
          </div>

          {filteredDoctors.length ? (
            <div className="doctors-directory-grid">
              {filteredDoctors.map((doctor) => (
                <article className="directory-doctor-card" key={doctor.slug}>
                  <a className="directory-doctor-image" href={`/doctors/${doctor.slug}`} aria-label={`View ${doctor.name}'s profile`}>
                    <img src={doctor.image} alt={doctor.name} />
                    <span><i /> Accepting patients</span>
                  </a>
                  <div className="directory-doctor-body">
                    <div className="directory-rating"><Star size={14} fill="currentColor" /> {doctor.rating} <span>({doctor.reviews} reviews)</span></div>
                    <h3><a href={`/doctors/${doctor.slug}`}>{doctor.name}</a></h3>
                    <p className="directory-specialty">{doctor.specialty} <span>·</span> {doctor.credentials}</p>
                    <p className="directory-location"><MapPin size={14} /> {doctor.location} <span>·</span> {doctor.experience} experience</p>
                    <div className="directory-card-footer"><strong>${doctor.fee}<span> / visit</span></strong><a href={`/doctors/${doctor.slug}`}>{bookingMode ? 'Book appointment' : 'View profile'} <ArrowRight size={14} /></a></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="doctors-empty-state">
              <Search size={24} />
              <h3>No doctors found</h3>
              <p>Try a different name, location, or specialty.</p>
              <button type="button" onClick={() => { setQuery(''); setSpecialty(''); setLocation('') }}>Clear filters</button>
            </div>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  )
}

export default DoctorsPage
