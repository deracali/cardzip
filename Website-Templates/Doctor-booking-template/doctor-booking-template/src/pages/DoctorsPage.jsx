import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import HomeHeader from '../components/HomeHeader'
import HomeFooter from '../components/HomeFooter'
import { doctors, specialties } from '../data/doctors'
import './DoctorsPage.css'

function getLocalDoctorDirectory() {
  try {
    const profiles = JSON.parse(localStorage.getItem('carewell-demo-provider-profiles-v1') || '{}') || {}
    const localProfiles = Object.values(profiles).filter((profile) => profile?.active && profile?.slug)
    return { doctors: [...doctors, ...localProfiles.filter((profile) => !doctors.some((doctor) => doctor.slug === profile.slug))], error: '' }
  } catch (error) {
    return { doctors, error: `Unable to load local provider profiles: ${error.message}` }
  }
}

function DoctorsPage({ bookingMode = false, mode = 'local', apiBaseUrl = '' }) {
  const searchParams = new URLSearchParams(window.location.search)
  const [localDirectory] = useState(() => mode === 'api' ? null : getLocalDoctorDirectory())
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [sortBy, setSortBy] = useState('recommended')
  const [doctorList, setDoctorList] = useState(() => localDirectory?.doctors || [])
  const [doctorsLoading, setDoctorsLoading] = useState(mode === 'api')
  const [loadError, setLoadError] = useState(localDirectory?.error || '')

  useEffect(() => {
    let active = true
    if (mode !== 'api') return () => { active = false }
    fetch(`${apiBaseUrl}/doctors`)
      .then((response) => response.json().then((result) => ({ response, result })))
      .then(({ response, result }) => {
        if (!response.ok) throw new Error(result.error || 'Unable to load doctors.')
        if (active) setDoctorList(result.doctors.map((doctor) => {
          const starterDoctor = doctors.find((item) => item.slug === doctor.slug)
          return { ...starterDoctor, ...doctor, image: doctor.image || starterDoctor?.image || '' }
        }))
      })
      .catch((error) => { if (active) setLoadError(error.message) })
      .finally(() => { if (active) setDoctorsLoading(false) })
    return () => { active = false }
  }, [apiBaseUrl, mode])

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = doctorList.filter((doctor) => {
      const matchesQuery = !normalizedQuery ||
        `${doctor.name} ${doctor.specialty} ${doctor.credentials || ''}`.toLowerCase().includes(normalizedQuery)
      const matchesSpecialty = !specialty || doctor.specialty === specialty
      const matchesLocation = !location || doctor.location.toLowerCase().includes(location.trim().toLowerCase())
      return matchesQuery && matchesSpecialty && matchesLocation
    })

    return sortBy === 'rating'
      ? [...filtered].sort((a, b) => b.rating - a.rating)
      : filtered
  }, [doctorList, location, query, sortBy, specialty])

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
                <CustomSelect
                  className="doctors-filter-select"
                  triggerClassName="doctors-filter-select-trigger"
                  value={specialty}
                  onChange={setSpecialty}
                  ariaLabel="Filter by specialty"
                  options={[{ value: '', label: 'All specialties' }, ...specialties.map((item) => ({ value: item, label: item }))]}
                />
              </label>
              <button type="submit"><Search size={16} /> Search</button>
            </form>
          </div>
        </section>

        <section className="doctors-results doctors-page-container">
          <div className="doctors-results-heading">
            <div><h2>{bookingMode ? 'Choose a doctor' : 'Available specialists'}</h2><p>{filteredDoctors.length} trusted {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} ready to see you</p></div>
            <label>Sort by
              <CustomSelect
                className="doctors-sort-select"
                triggerClassName="doctors-sort-select-trigger"
                value={sortBy}
                onChange={setSortBy}
                ariaLabel="Sort doctors"
                options={[{ value: 'recommended', label: 'Recommended' }, { value: 'rating', label: 'Highest rated' }]}
              />
            </label>
          </div>

          {loadError && <p className="doctors-load-error" role="alert">{loadError}</p>}
          {doctorsLoading ? <div className="doctors-loading">Loading doctor profiles…</div> : filteredDoctors.length ? (
            <div className="doctors-directory-grid">
              {filteredDoctors.map((doctor) => (
                <article className="directory-doctor-card" key={doctor.slug}>
                  <a className="directory-doctor-image" href={`/doctors/${doctor.slug}`} aria-label={`View ${doctor.name}'s profile`}>
                    {doctor.image ? <img src={doctor.image} alt={doctor.name} /> : <div className="directory-doctor-image-placeholder">{doctor.name?.slice(0, 1) || 'D'}</div>}
                    <span><i /> Accepting patients</span>
                  </a>
                  <div className="directory-doctor-body">
                    <div className="directory-rating"><Star size={14} fill="currentColor" /> {Number(doctor.rating || 0).toFixed(1)} <span>({doctor.reviews || 0} reviews)</span></div>
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
