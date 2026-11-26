"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SalonFooter, SalonHeader } from "./SalonShell";
import { salonApi, type SalonService } from "../lib/salonApi";

export default function SalonHome() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    salonApi.services()
      .then(({ services: catalog }) => { if (active) setServices(catalog.filter((service) => service.active)); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load the salon menu.");
      });
    return () => { active = false; };
  }, []);

  return <div className="salon-home"><SalonHeader /><main>
    <section className="salon-hero" id="home"><div className="salon-hero-copy"><div className="salon-rating"><span>★★★★★</span> <strong>4.9</strong><i /> 12k+ verified visits <i /> Soho · Williamsburg</div><h1>Elevate Your<br /><em>Beauty</em> Experience</h1><p>Precision cuts, restorative rituals and skin science — thoughtfully tailored to you.</p><div className="salon-hero-actions"><Link className="salon-button salon-button-primary" href="/book">Book appointment <span aria-hidden="true">→</span></Link><Link className="salon-text-link" href="/services">Explore services</Link></div><div className="salon-hero-trust"><strong>Certified clean studio · Soho · Williamsburg</strong></div></div><div className="salon-hero-visual"><img src="/images/salon/salon-interior.jpg" alt="Warm, sunlit Lumière salon with styling stations" /><div className="salon-glow-badge"><span>✦</span><div><strong>Glow Guarantee</strong><small>Love it or we refine</small></div></div><div className="salon-availability"><span>REQUEST A TIME ONLINE</span><p>Choose your service and preferred slot. The studio confirms every request.</p><Link className="salon-button salon-button-primary" href="/book">Find an appointment</Link></div></div></section>
    <div className="salon-promise-bar"><span>✦ Balayage experts</span><span>✦ Organic skincare</span><span>✦ Same-day requests</span><span>✦ Bridal concierge</span><span>✦ 4.9 rated studio</span></div>
    <section className="salon-section salon-services"><div className="salon-section-heading"><div><span className="salon-kicker">A LITTLE TIME, A LOT OF YOU</span><h2>Rituals, priced transparently</h2></div><Link className="salon-menu-link" href="/services">Full menu →</Link></div>
      {error && <p className="salon-form-error" role="alert">{error}</p>}
      {services.length ? <div className="salon-service-grid">{services.slice(0, 3).map((service) => <article className="salon-service-card" key={service.id}><Link className="salon-service-image" href="/book" aria-label={`Book ${service.name}`}><img src={service.image} alt="" loading="lazy" />{service.badge && <span className="salon-image-badge">{service.badge}</span>}</Link><div className="salon-service-copy"><span className="salon-category-badge">{service.category}</span><h3>{service.name}</h3><p>{service.description}</p><div className="salon-service-meta"><span>{service.duration}</span><strong>from ${service.price}</strong></div><div className="salon-service-actions"><Link href="/book">Book this ritual →</Link></div></div></article>)}</div> : !error && <p>Loading the current service menu…</p>}
    </section>
  </main><SalonFooter /></div>;
}
