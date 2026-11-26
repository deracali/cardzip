import { ArrowRight, Check, MapPin, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import HomeFooter from '../components/home/HomeFooter'
import HomeHeader from '../components/home/HomeHeader'
import PriceEstimator from '../components/home/PriceEstimator'
import { repairOptions } from '../data/homeServices'
import '../components/HomePage.css'
import './InformationPage.css'

export default function InformationPage({ page }) {
  const [selectedRepair, setSelectedRepair] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('service')
    return repairOptions.some((item) => item.id === requested) ? requested : 'pipe'
  })

  return (
    <div className="fixflow-home">
      <HomeHeader />
      <main className="ff-information-page">
        {page === 'services' ? (
          <>
            <section className="ff-information-hero"><span className="ff-kicker">LOCAL HOME SERVICE EXPERTS</span><h1>One trusted team for the work your home needs.</h1><p>Licensed, background-checked professionals for plumbing, HVAC and repair — with a clear estimate before the job begins.</p><a className="ff-button ff-button-orange" href="/book-now">Request a service <ArrowRight size={14} /></a></section>
            <section className="ff-container ff-services-section"><div className="ff-section-heading"><div><h2>Explore our services</h2><p>Clear options, practical advice, and reliable local pros.</p></div></div><div className="ff-service-grid">{repairOptions.map(({ id, label, shortLabel, price, icon: Icon }) => <article className="ff-service-card" key={id}><div className="ff-service-card-top"><span className="ff-service-icon"><Icon size={17} /></span><span className="ff-response"><ShieldCheck size={11} /> Licensed team</span></div><h3>{shortLabel}</h3><p>{label} service, maintenance, and repairs with upfront recommendations.</p><div className="ff-service-card-bottom"><span><small>Estimates from</small><strong>${price}+</strong></span><a href={`/pricing?service=${id}`}>View pricing <ArrowRight size={13} /></a></div></article>)}</div></section>
          </>
        ) : page === 'pricing' ? (
          <>
            <section className="ff-information-hero"><span className="ff-kicker">UPFRONT, STRAIGHTFORWARD PRICING</span><h1>Know what to expect before you book.</h1><p>Choose your repair and visit timing to see a transparent starting estimate. Your technician confirms the flat rate before work begins.</p></section>
            <PriceEstimator selectedRepair={selectedRepair} onRepairChange={setSelectedRepair} />
          </>
        ) : (
          <ServiceAreaPage />
        )}
      </main>
      <HomeFooter />
    </div>
  )
}

function ServiceAreaPage() {
  const [zipCode, setZipCode] = useState('')
  const [message, setMessage] = useState('')
  const [covered, setCovered] = useState(false)

  function checkArea(event) {
    event.preventDefault()
    const prefix = Number(zipCode.slice(0, 3))
    const isCovered = /^\d{5}$/.test(zipCode) && prefix >= 800 && prefix <= 803
    setCovered(isCovered)
    setMessage(/^\d{5}$/.test(zipCode) ? isCovered ? `${zipCode} is in our Denver metro service area.` : `We do not serve ${zipCode} yet. Call us and we will help find a solution.` : 'Enter a valid five-digit ZIP code.')
  }

  return <section className="ff-information-hero ff-area-page"><span className="ff-kicker"><MapPin size={13} /> DENVER METRO COVERAGE</span><h1>Local help, close to home.</h1><p>Our home service team currently covers Denver and nearby communities. Check a ZIP code below to see if your address is in our standard service area.</p><form className="ff-area-check" onSubmit={checkArea}><label htmlFor="ff-area-zip">Your ZIP code</label><div><input id="ff-area-zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={zipCode} onChange={(event) => setZipCode(event.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="80202" /><button className="ff-button ff-button-dark">Check coverage</button></div>{message && <p className={covered ? 'is-available' : 'is-unavailable'} role="status">{covered && <Check size={14} />}{message}</p>}</form></section>
}
