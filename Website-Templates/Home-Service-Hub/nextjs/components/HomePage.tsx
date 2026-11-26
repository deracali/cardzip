import Link from "next/link";
import SiteHeader from "./SiteHeader";

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
            <Link className="button button-light" href="/services">Explore services</Link>
          </div>
          <div className="trust-line">Licensed professionals · Upfront estimates · Emergency requests</div>
        </div>
        <div className="hero-art" role="img" aria-label="Home service technician at work"><span>FIXFLOW PRO</span><strong>Here when home needs help.</strong></div>
      </section>
      <section className="home-destinations">
        <Link href="/services"><span className="eyebrow">OUR SERVICES</span><h2>Repairs with clear estimates</h2><p>Explore plumbing, HVAC and home repair services from a trusted local team.</p><strong>Explore services →</strong></Link>
        <Link href="/pricing"><span className="eyebrow">UPFRONT PRICING</span><h2>Plan with a clear estimate</h2><p>Choose your repair and visit timing to see a transparent starting estimate.</p><strong>Estimate your cost →</strong></Link>
      </section>
      <footer className="site-footer">
        <Link className="brand" href="/"><span className="brand-mark">F</span><span>FixFlow Pro</span></Link>
        <span>Estimate requests do not confirm a technician appointment.</span>
      </footer>
    </main>
  );
}
