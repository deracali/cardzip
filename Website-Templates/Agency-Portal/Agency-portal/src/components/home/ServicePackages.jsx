import { ArrowUpRight, Check, Sparkles } from 'lucide-react'
import { servicePackages } from './serviceData'

function ServicePackages({ selectedPackage, onSelectPackage }) {
  return (
    <section className="home-section packages-section" id="services" aria-labelledby="services-title">
      <div className="section-heading">
        <div><span className="section-kicker">GOODBYE, TO-DO LIST</span><h2 id="services-title">A clean for every kind of day.</h2><p>Choose your reset. We’ll take care of the details.</p></div>
        <a href="#estimate">Compare prices <ArrowUpRight size={15} /></a>
      </div>

      <div className="package-grid">
        {servicePackages.map((service) => (
          <article className={`package-card${service.featured ? ' is-featured' : ''}`} key={service.id}>
            {service.featured && <span className="package-popular"><Sparkles size={12} /> MOST LOVED</span>}
            <div className="package-topline"><span>{service.name}</span><span className="package-duration">{service.duration}</span></div>
            <p>{service.description}</p>
            <div className="package-price"><strong>${service.price}</strong><span>starting at</span></div>
            <ul>{service.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul>
            <button
              className={selectedPackage === service.id ? 'package-select is-selected' : 'package-select'}
              type="button"
              onClick={() => onSelectPackage(service.id)}
              aria-pressed={selectedPackage === service.id}
            >
              {selectedPackage === service.id ? 'Selected for estimate' : 'Choose this clean'}
              <ArrowUpRight size={15} />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServicePackages
