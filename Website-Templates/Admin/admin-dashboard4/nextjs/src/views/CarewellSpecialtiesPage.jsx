import { ArrowRight, Baby, HeartPulse, ShieldCheck, Smile, Stethoscope } from 'lucide-react'
import HomeHeader from '../components/HomeHeader'
import HomeFooter from '../components/HomeFooter'
import { doctors } from '../data/doctors'
import './CarewellSpecialtiesPage.css'

const specialtyDetails = [
  {
    name: 'Cardiology',
    icon: HeartPulse,
    description: 'Support for your heart health, from preventive checkups to ongoing care.',
    careFor: 'Heart health, blood pressure, and circulation',
  },
  {
    name: 'Dermatology',
    icon: ShieldCheck,
    description: 'Thoughtful care for your skin, hair, and nails at every stage of life.',
    careFor: 'Skin health, screenings, and common skin concerns',
  },
  {
    name: 'Pediatrics',
    icon: Baby,
    description: 'Family-centered care to help children grow and feel their best.',
    careFor: 'Well-child visits, development, and everyday health',
  },
  {
    name: 'Dental',
    icon: Smile,
    description: 'Find the right dental professional for preventive and restorative care.',
    careFor: 'Oral health, cleanings, and dental concerns',
  },
]

function CarewellSpecialtiesPage() {
  return (
    <div className="carewell-info-page specialties-page">
      <HomeHeader />
      <main>
        <section className="specialties-hero">
          <div className="specialties-hero-content">
            <a className="info-breadcrumb" href="/">Home <span>/</span> Specialties</a>
            <span className="info-eyebrow">CARE FOR EVERY PART OF YOU</span>
            <h1>Find care that fits your needs.</h1>
            <p>Explore care areas, learn what each specialist can help with, and connect with a doctor who feels right for you.</p>
            <a className="info-primary-link" href="/book-now">Find a doctor <ArrowRight size={16} /></a>
          </div>
          <div className="specialties-hero-icon" aria-hidden="true"><Stethoscope size={64} strokeWidth={1.35} /><span><HeartPulse size={25} /></span></div>
        </section>

        <section className="specialties-content">
          <div className="specialties-heading">
            <div><span className="info-eyebrow">EXPLORE OUR SPECIALTIES</span><h2>Start with what you need.</h2></div>
            <p>Each provider profile includes credentials, location, and appointment details to help you choose with confidence.</p>
          </div>
          <div className="specialties-grid">
            {specialtyDetails.map(({ name, icon: Icon, description, careFor }) => {
              const providerCount = doctors.filter((doctor) => doctor.specialty === name).length
              const destination = providerCount
                ? `/doctors?specialty=${encodeURIComponent(name)}`
                : '/doctors'

              return (
                <article className="specialty-detail-card" key={name}>
                  <div className="specialty-card-top">
                    <span className="specialty-card-icon"><Icon size={22} /></span>
                    <span className={providerCount ? 'specialty-provider-count' : 'specialty-provider-count is-coming'}>
                      {providerCount ? `${providerCount} ${providerCount === 1 ? 'provider' : 'providers'}` : 'Coming soon'}
                    </span>
                  </div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <div className="specialty-care-focus"><strong>Care can include</strong><span>{careFor}</span></div>
                  <a href={destination}>{providerCount ? 'View doctors' : 'Explore all doctors'} <ArrowRight size={15} /></a>
                </article>
              )
            })}
          </div>
        </section>

        <section className="specialties-help">
          <div className="specialties-help-icon"><Stethoscope size={22} /></div>
          <div><h2>Not sure where to start?</h2><p>Browse all doctors and compare specialties, locations, and provider details.</p></div>
          <a href="/doctors">Meet all doctors <ArrowRight size={15} /></a>
        </section>
      </main>
      <HomeFooter />
    </div>
  )
}

export default CarewellSpecialtiesPage
