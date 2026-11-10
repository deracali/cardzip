import { ArrowRight, Clock3 } from 'lucide-react'
import { serviceCards } from '../../data/homeServices'

function ServiceGrid({ onSelectRepair }) {
  return (
    <section className="ff-container ff-services-section" id="services" aria-labelledby="ff-services-title">
      <div className="ff-section-heading">
        <div><h2 id="ff-services-title">Services with upfront flat rates</h2><p>Know what it costs before the work begins.</p></div>
        <a href="#estimate">View all services <ArrowRight size={14} /></a>
      </div>
      <div className="ff-service-grid">
        {serviceCards.map(({ name, description, price, response, issue, icon: Icon }) => (
          <article className="ff-service-card" key={name}>
            <div className="ff-service-card-top">
              <span className="ff-service-icon"><Icon size={17} /></span>
              <span className={response.includes('min') ? 'ff-response ff-response-fast' : 'ff-response'}>
                <Clock3 size={11} /> {response}
              </span>
            </div>
            <h3>{name}</h3>
            <p>{description}</p>
            <div className="ff-service-card-bottom">
              <span><small>Flat rate from</small><strong>${price}+</strong></span>
              <button
                type="button"
                onClick={() => {
                  onSelectRepair(issue)
                  document.getElementById('estimate')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
              >
                Book now <ArrowRight size={13} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServiceGrid
