"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SalonFooter, SalonHeader } from "./SalonShell";
import { salonApi, type SalonService, type SalonStylist } from "../lib/salonApi";

type InfoPageName = "services" | "stylists" | "packages" | "reviews";

const packages = [
  { name: "The Sunday Reset", detail: "Signature Silk Blowout + Rose Quartz Manicure", price: 135 },
  { name: "The Lumière Glow", detail: "Lumière Glow Facial + Deep Calm Massage", price: 235 },
  { name: "The Bridal Edit", detail: "A private consultation and tailored hair-and-skin plan", price: 290 },
];

const reviews = [
  { quote: "My color has never looked this luminous. The scalp massage alone is worth booking for.", name: "Amara Chen", detail: "Silk blowout · Soho" },
  { quote: "Skin was glass for weeks. The esthetician mapped my whole routine without upselling.", name: "Sofia Marquez", detail: "Glow facial · Williamsburg" },
  { quote: "They handled our bridal party flawlessly. Calm energy and beautiful results.", name: "Priya Nair", detail: "Bridal party · Soho" },
];

const headings: Record<InfoPageName, { kicker: string; title: string; text: string }> = {
  services: { kicker: "THE LUMIÈRE MENU", title: "Services, thoughtfully priced", text: "Explore signature salon and wellness rituals, tailored to you." },
  stylists: { kicker: "MEET YOUR ARTISTS", title: "Good hands. Beautiful work.", text: "Meet a team that brings thoughtful consultation and craft to every visit." },
  packages: { kicker: "MADE TO FEEL LIKE YOU", title: "A little more Lumière", text: "Pair your favorite rituals with considered packages for a complete reset." },
  reviews: { kicker: "THE LUMIÈRE EXPERIENCE", title: "Loved by our regulars", text: "A few words from guests who make Lumière part of their self-care routine." },
};

export default function SalonInfoPage({ page }: { page: InfoPageName }) {
  const [services, setServices] = useState<SalonService[]>([]);
  const [stylists, setStylists] = useState<SalonStylist[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (page !== "services" && page !== "stylists") return;
    let active = true;
    const request = page === "services" ? salonApi.services() : salonApi.stylists();
    request
      .then((catalog) => {
        if (!active) return;
        if ("services" in catalog) setServices(catalog.services.filter((service) => service.active));
        else setStylists(catalog.stylists.filter((stylist) => stylist.active));
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load salon information.");
      });
    return () => { active = false; };
  }, [page]);

  const heading = headings[page];
  return <div className="salon-home"><SalonHeader /><main className="salon-info-page">
    <header className="salon-info-intro"><span className="salon-kicker">{heading.kicker}</span><h1>{heading.title}</h1><p>{heading.text}</p></header>
    {page === "services" && <section className="salon-info-grid salon-info-service-grid">{error ? <p className="salon-form-error" role="alert">{error}</p> : services.length ? services.map((service) => <article className="salon-info-card salon-info-service-card" key={service.id}><img src={service.image} alt="" /><span className="salon-kicker">{service.category} · {service.duration}</span><h2>{service.name}</h2><p>{service.description}</p><strong className="salon-package-price">From ${service.price}</strong><Link className="salon-button salon-button-primary" href="/book">Book this service →</Link></article>) : <p>Loading the current service menu…</p>}</section>}
    {page === "stylists" && <section className="salon-info-grid">{error ? <p className="salon-form-error" role="alert">{error}</p> : stylists.length ? stylists.map((stylist) => <article className="salon-info-card" key={stylist.id}>{stylist.image ? <img className="salon-info-stylist-image" src={stylist.image} alt={stylist.name} /> : <span className="salon-info-avatar">{stylist.name.charAt(0)}</span>}<span className="salon-kicker">{stylist.role}</span><h2>{stylist.name}</h2><p>{stylist.bio}</p><Link className="salon-text-link" href="/book">Book with {stylist.name} →</Link></article>) : <p>Loading our artist roster…</p>}</section>}
    {page === "packages" && <section className="salon-info-grid">{packages.map((item) => <article className="salon-info-card salon-package-card" key={item.name}><span className="salon-kicker">SIGNATURE PACKAGE</span><h2>{item.name}</h2><p>{item.detail}</p><strong className="salon-package-price">From ${item.price}</strong><Link className="salon-button salon-button-primary" href="/book">Choose this package →</Link></article>)}</section>}
    {page === "reviews" && <section className="salon-info-grid">{reviews.map((review) => <blockquote className="salon-info-card" key={review.name}><span className="salon-review-stars">★★★★★</span><p>“{review.quote}”</p><footer><strong>{review.name}</strong><small>{review.detail}</small></footer></blockquote>)}</section>}
    <div className="salon-info-cta"><p>Ready to make a little time for yourself?</p><Link className="salon-button salon-button-primary" href="/book">Book an appointment →</Link></div>
  </main><SalonFooter /></div>;
}
