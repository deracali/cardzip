import Link from "next/link";
import SiteHeader from "./SiteHeader";
import PriceEstimator from "./PriceEstimator";

const services = [
  { name: "Pipe Repair", price: "From $89", description: "Leak detection, repiping and burst fixes." },
  { name: "AC Maintenance", price: "From $79", description: "Tune-ups, cooling repairs and installations." },
  { name: "Drain Cleaning", price: "From $99", description: "Drain clearing and camera inspections." },
  { name: "Heating", price: "From $109", description: "Furnace repair and heat-pump service." },
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">LOCAL EXPERTS · UPFRONT PRICING</span>
          <h1>Home repairs, handled with care.</h1>
          <p>Trusted local plumbing and HVAC pros, clear estimates, and one place to track every service request.</p>
          <div className="hero-actions">
            <Link className="button button-orange" href="/book-now">Request a service</Link>
            <a className="button button-light" href="#services">Explore services</a>
          </div>
          <div className="trust-line">Licensed professionals · Upfront estimates · Emergency requests</div>
        </div>
        <div className="hero-art" role="img" aria-label="Home service technician at work"><span>FIXFLOW PRO</span><strong>Here when home needs help.</strong></div>
      </section>
      <PriceEstimator />
      <section className="services-section" id="services">
        <div className="section-heading"><div><span className="eyebrow">OUR SERVICES</span><h2>Repairs with clear estimates</h2></div><Link href="/book-now">Request service →</Link></div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.name}>
              <span className="service-icon" aria-hidden="true">⌁</span>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <strong>{service.price}</strong>
            </article>
          ))}
        </div>
      </section>
      <footer className="site-footer">
        <Link className="brand" href="/"><span className="brand-mark">F</span><span>FixFlow Pro</span></Link>
        <span>Estimate requests do not confirm a technician appointment.</span>
      </footer>
    </main>
  );
}
