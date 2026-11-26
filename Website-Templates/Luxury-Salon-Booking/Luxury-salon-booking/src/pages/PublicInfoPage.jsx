import { useState } from 'react'
import SalonFooter from '../components/salon/SalonFooter'
import SalonHeader from '../components/salon/SalonHeader'
import ReviewsSection from '../components/salon/ReviewsSection'
import { getSalonServices } from '../services/salonLocalStore'
import '../components/salon/salon.css'
import './account.css'

const pageCopy = {
  services: {
    kicker: 'THE LUMIÈRE MENU',
    title: 'Services, thoughtfully priced',
    description: 'Explore our signature salon and wellness rituals. Every appointment is tailored to you.',
  },
  stylists: {
    kicker: 'MEET YOUR ARTISTS',
    title: 'Good hands. Beautiful work.',
    description: 'Our team pairs thoughtful consultation with the craft and care your ritual deserves.',
  },
  packages: {
    kicker: 'MADE TO FEEL LIKE YOU',
    title: 'A little more Lumière',
    description: 'Pair your favorite rituals with considered packages for a complete reset.',
  },
}

const stylists = [
  { name: 'Maya R.', role: 'Colorist & blowout specialist', bio: 'Known for dimensional color and soft, polished finishes.' },
  { name: 'Jonas K.', role: 'Senior stylist', bio: 'Precision cuts and effortless styling, tailored to your routine.' },
  { name: 'Sofia M.', role: 'Skin & wellness artist', bio: 'Restorative facials and calm, results-led skin rituals.' },
]

const packages = [
  { name: 'The Sunday Reset', detail: 'Signature Silk Blowout + Rose Quartz Manicure', price: 135 },
  { name: 'The Lumière Glow', detail: 'Lumière Glow Facial + Deep Calm Massage', price: 235 },
  { name: 'The Bridal Edit', detail: 'A private consultation and tailored hair-and-skin plan', price: 290 },
]

export default function PublicInfoPage({ page }) {
  const [services] = useState(() => getSalonServices().filter((service) => service.active !== false))
  const copy = pageCopy[page]

  return <div className="salon-home"><SalonHeader /><main className="salon-info-page">
    {page === 'reviews'
      ? <ReviewsSection />
      : <section className="salon-info-intro"><span className="salon-kicker">{copy.kicker}</span><h1>{copy.title}</h1><p>{copy.description}</p></section>}
    {page === 'services' && <section className="salon-section salon-services">{services.length ? <div className="salon-service-grid">{services.map((service) => <article className="salon-service-card" key={service.id}><a className="salon-service-image" href="/book" aria-label={`Book ${service.name}`}><img src={service.image} alt="" loading="lazy" />{service.badge && <span className="salon-image-badge">{service.badge}</span>}</a><div className="salon-service-copy"><span className="salon-category-badge">{service.category}</span><h3>{service.name}</h3><p>{service.description}</p><div className="salon-service-meta"><span>{service.duration}</span><strong>${service.price}</strong></div><div className="salon-service-actions"><a className="salon-button salon-button-small" href="/book">Book this service →</a></div></div></article>)}</div> : <p>No services are currently available.</p>}</section>}
    {page === 'stylists' && <section className="salon-info-grid">{stylists.map((stylist) => <article className="salon-info-card" key={stylist.name}><span className="salon-info-avatar">{stylist.name.charAt(0)}</span><span className="salon-kicker">{stylist.role}</span><h2>{stylist.name}</h2><p>{stylist.bio}</p><a className="salon-text-link" href="/book">Book with {stylist.name} →</a></article>)}</section>}
    {page === 'packages' && <section className="salon-info-grid">{packages.map((item) => <article className="salon-info-card salon-package-card" key={item.name}><span className="salon-kicker">SIGNATURE PACKAGE</span><h2>{item.name}</h2><p>{item.detail}</p><strong className="salon-package-price">From ${item.price}</strong><a className="salon-button salon-button-primary" href="/book">Choose this package →</a></article>)}</section>}
    <div className="salon-info-cta"><p>Ready to make a little time for yourself?</p><a className="salon-button salon-button-primary" href="/book">Book an appointment →</a></div>
  </main><SalonFooter /></div>
}
