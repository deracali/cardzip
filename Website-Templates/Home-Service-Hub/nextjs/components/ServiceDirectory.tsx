import Link from "next/link";

const services = [
  { id: "pipe", name: "Pipe repair", price: "$129", description: "Leak detection, pipe repair and burst fixes.", response: "Emergency response available" },
  { id: "drain", name: "Drain cleaning", price: "$99", description: "Drain clearing, camera inspections and flow restoration.", response: "Same-week appointments" },
  { id: "cooling", name: "AC maintenance", price: "$149", description: "Seasonal tune-ups, cooling repairs and installation.", response: "Same-day slots available" },
  { id: "heating", name: "Heating", price: "$159", description: "Furnace repair, heat-pump service and safety checks.", response: "Emergency response available" },
];

export default function ServiceDirectory() {
  return <main className="info-page"><header className="info-hero"><span className="eyebrow">LOCAL HOME SERVICE EXPERTS</span><h1>One trusted team for the work your home needs.</h1><p>Licensed, background-checked professionals for plumbing, HVAC and repair — with a clear estimate before the job begins.</p><Link className="button button-orange" href="/book-now">Request a service</Link></header><section className="info-section"><div className="section-heading"><div><span className="eyebrow">OUR SERVICES</span><h2>Explore home services</h2></div><p>Starting estimates are confirmed by your technician.</p></div><div className="info-service-grid">{services.map((service) => <article className="info-service-card" key={service.id}><span className="eyebrow">{service.response}</span><h2>{service.name}</h2><p>{service.description}</p><div><strong>From {service.price}</strong><Link href={`/pricing?service=${service.id}`}>See estimate →</Link></div></article>)}</div></section><footer className="site-footer"><Link className="brand" href="/">FixFlow Pro</Link><span>Service estimates do not confirm a technician appointment.</span></footer></main>;
}
