import { ArrowRight, Clock3, Sparkles } from 'lucide-react'
import { services } from './salonData'

function ServicesSection() {
  return (
    <section className="salon-section salon-services" id="services" aria-labelledby="services-title">
      <div className="salon-section-heading">
        <div><span className="salon-kicker">A LITTLE TIME, A LOT OF YOU</span><h2 id="services-title">Rituals, priced transparently</h2></div>
        <a className="salon-menu-link" href="#booking">View full menu <ArrowRight size={14} /></a>
      </div>

      <div className="salon-service-grid">
        {services.map((service) => (
          <article className="salon-service-card" key={service.name}>
            <a className="salon-service-image" href="#booking" aria-label={`Book ${service.name}`}>
              <img src={service.image} alt="" loading="lazy" />
              {service.badge && <span className="salon-image-badge">{service.badge}</span>}
              <span className="salon-category-badge"><Sparkles size={12} /> {service.category}</span>
            </a>
            <div className="salon-service-copy">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="salon-service-meta"><span><Clock3 size={13} /> {service.duration}</span><strong>from ${service.price}</strong></div>
              <div className="salon-service-actions"><a href="#booking">View details</a><a className="salon-button salon-button-small" href="#booking">Select package <ArrowRight size={12} /></a></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
