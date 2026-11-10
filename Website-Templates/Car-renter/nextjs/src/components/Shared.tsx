"use client";

import { useState } from "react";
import {
  ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Fuel, Heart, KeyRound,
  LockKeyhole, Mail, MapPin, Menu, ShieldCheck, Smartphone, Star, Truck, UserRound,
  Users, WalletCards, X, Zap
} from "lucide-react";
import { imageUrl, vehicles, type Booking, type Vehicle } from "../data/vehicles";
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="Voltigo home">
      <span className="brand-icon"><Zap size={16} fill="currentColor" /></span>
      <span className="brand-name">VOLTIGO<span>RENTAL + LOGISTICS</span></span>
    </a>
  )
}

export function Header({ compact = false }: { compact?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a className={!compact ? 'nav-active' : ''} href="/">Fleet</a>
          <a href="/fleet">Delivery Services <ChevronDown size={12} /></a>
          <a href="/fleet">Long-Term Rental <ChevronDown size={12} /></a>
          <a href="/#locations">Locations</a>
          <div className="nav-actions">
            <button type="button" className="currency-button"><span className="globe-mark">◎</span> USD $ <ChevronDown size={11} /></button>
            <a className="help-link" href="/#support">Help</a>
            <a className="button button-small" href="/fleet">Reserve Vehicle <ArrowRight size={13} /></a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [saved, setSaved] = useState(false)

  return (
    <article className="vehicle-card">
      <div className="vehicle-photo">
        <img src={imageUrl(vehicle.image, 700)} alt={vehicle.name} loading="lazy" />
        <span className="vehicle-category">{vehicle.category}</span>
        {vehicle.label && <span className="vehicle-label">{vehicle.label}</span>}
        <span className="delivery-pill"><Zap size={11} /> Doorstep in 25 min</span>
        <span className="vehicle-rating"><Star size={11} fill="currentColor" /> 4.9</span>
      </div>
      <div className="vehicle-info">
        <div className="vehicle-title-row">
          <div>
            <h3>{vehicle.name}</h3>
            <p>{vehicle.details}</p>
          </div>
          <div className="vehicle-price">${vehicle.price}<span>/day</span></div>
        </div>
        <div className="vehicle-specs">
          <span><Users size={12} /> {vehicle.seats}</span>
          <span><Fuel size={12} /> {vehicle.fuel}</span>
          <span><KeyRound size={12} /> Unlimited</span>
        </div>
        <div className="vehicle-actions">
          <a className="button button-book" href={`/book?vehicle=${encodeURIComponent(vehicle.name)}`}>Book Now</a>
          <button
            type="button"
            className={`favorite-button${saved ? ' is-saved' : ''}`}
            aria-label={saved ? `Remove ${vehicle.name} from saved vehicles` : `Save ${vehicle.name}`}
            aria-pressed={saved}
            onClick={() => setSaved((value) => !value)}
          >
            <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  )
}

export function BookingSearch() {
  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.location.href = '/fleet'
  }

  return (
    <div className="booking-wrap">
      <form className="booking-bar" onSubmit={handleSearch}>
        <label className="booking-field">
          <span><MapPin size={14} /> Pickup Location</span>
          <input aria-label="Pickup location" defaultValue="Downtown Hub — 44 Mercer St" />
        </label>
        <label className="booking-field">
          <span><NavigationIcon /> Drop-off Location</span>
          <input aria-label="Drop-off location" defaultValue="Airport T2 — Doorstep" />
        </label>
        <label className="booking-field">
          <span><CalendarDays size={14} /> Pickup Date / Time</span>
          <input aria-label="Pickup date and time" type="datetime-local" />
        </label>
        <label className="booking-field booking-vehicle">
          <span><Truck size={14} /> Vehicle Type</span>
          <select aria-label="Vehicle type" defaultValue="SUV">
            <option>SUV</option>
            <option>Sedan</option>
            <option>Cargo Van</option>
          </select>
        </label>
        <button className="live-price" type="submit">
          <span>LIVE PRICE<strong>$86<small>/day</small></strong></span>
          <span className="price-arrow"><ArrowRight size={17} /></span>
        </button>
      </form>
      <div className="booking-promises">
        <span><Check size={12} /> Free cancellation up to 6h before pickup</span>
        <span><Zap size={12} /> Doorstep delivery available in this zone</span>
        <span><ShieldCheck size={12} /> Full tank + insurance included</span>
      </div>
    </div>
  )
}

export function VehicleGrid({ vehiclesToShow = vehicles, limit }: { vehiclesToShow?: Vehicle[]; limit?: number }) {
  const visibleVehicles = limit ? vehiclesToShow.slice(0, limit) : vehiclesToShow
  return <div className="vehicle-grid">{visibleVehicles.map((vehicle) => <VehicleCard key={vehicle.name} vehicle={vehicle} />)}</div>
}

export function BookingSummary({ booking, days, subtotal, protection, total, payment = false }: { booking: Booking; days: number; subtotal: number; protection: number; total: number; payment?: boolean }) {
  return (
    <aside className="booking-summary panel-card">
      <h2>{payment ? 'Your reservation' : 'Trip summary'}</h2>
      <div className="summary-vehicle">
        <img src={imageUrl(booking.vehicle.image, 500)} alt={booking.vehicle.name} />
        <span><strong>{booking.vehicle.name}</strong><small>{booking.vehicle.category} · {booking.vehicle.details.split(' · ').slice(0, 2).join(' · ')}</small><span className="summary-rating"><Star size={12} fill="currentColor" /> 4.9 · Unlimited mileage</span></span>
      </div>
      <div className="summary-route">
        <div><span className="route-dot pickup-dot" /><span><small>Pickup</small><strong>{booking.pickup}</strong></span></div>
        <div><span className="route-dot return-dot" /><span><small>Return</small><strong>{booking.dropoff}</strong></span></div>
      </div>
      <div className="summary-dates"><CalendarDays size={15} /><span><strong>{booking.start ? new Date(booking.start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Select pickup date'}</strong><small>{booking.end ? new Date(booking.end).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Select return date'} · {days} {days === 1 ? 'day' : 'days'}</small></span></div>
      <div className="summary-costs"><div><span>${booking.vehicle.price} × {days} {days === 1 ? 'day' : 'days'}</span><strong>${subtotal}</strong></div><div><span>Full protection</span><strong>{protection ? `$${protection}` : 'Declined'}</strong></div><div><span>Delivery</span><strong className="included-label">Included</strong></div></div>
      <div className="summary-total"><span>Total <small>includes taxes &amp; fees</small></span><strong>${total}</strong></div>
      <p className="summary-cancel"><Check size={13} /> Free cancellation up to 6 hours before pickup</p>
    </aside>
  )
}

export function AuthField({ label, icon, type, placeholder, autoComplete }: { label: string; icon: React.ReactNode; type: string; placeholder: string; autoComplete?: string }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-input">{icon}<input type={type} placeholder={placeholder} autoComplete={autoComplete} required /></span>
    </label>
  )
}

export function ReviewsSection() {
  const reviews = [
    { quote: '“Van arrived in 28 minutes, driver helped load everything. Check-in took one option downtown.”', name: 'Maya Chen', role: 'Frequent renter' },
    { quote: '“Booked a sedan for a month for sales calls. Swapped to an SUV mid-plan in one tap.”', name: 'Daniel Okafor', role: 'Small business' },
    { quote: '“We run 5 vans through Voltigo Fleet. Billing, mileage and drivers in one dashboard.”', name: 'Sofia Ramirez', role: 'Operations, Bloom & Co.' },
  ]

  return (
    <section className="reviews-section">
      <div className="reviews-heading"><h2>Loved by locals &amp; businesses</h2><span><Star size={13} fill="currentColor" /> 4.9/5 from 3,200+ reviews</span></div>
      <div className="review-grid">{reviews.map((review) => <article className="review-card" key={review.name}><div className="review-stars" aria-label="5 out of 5 stars">★★★★★ <span>5.0</span></div><p>{review.quote}</p><div className="review-person"><span className="review-avatar">{review.name[0]}</span><span><strong>{review.name}</strong><small>{review.role}</small></span><Check size={13} /></div></article>)}</div>
    </section>
  )
}

export function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer className="site-footer" id="support">
      <div className="footer-about"><Logo /><p>Local rental + logistics. Cars, vans and drivers on demand.</p><small>© 2026 Voltigo Mobility Inc.</small></div>
      <div className="footer-links"><strong>Fleet</strong><a href="/fleet">Sedans</a><a href="/fleet">SUVs</a><a href="/fleet">Cargo Vans</a><a href="/fleet">Long-Term</a></div>
      <div className="footer-links"><strong>Services</strong><a href="/fleet">Doorstep delivery</a><a href="/fleet">Airport pickup</a><a href="/fleet">Business fleet</a><a href="/fleet">Moving help</a></div>
      <div className="footer-links"><strong>Company</strong><a href="/#locations">Locations</a><a href="/#support">Pricing</a><a href="/#support">Careers</a><a href="/#support">Support</a></div>
      <form className="newsletter" onSubmit={handleSubscribe}><label htmlFor="newsletter-email">Get fleet updates</label><div><input id="newsletter-email" type="email" placeholder="Email" required /><button type="submit">{subscribed ? <Check size={14} /> : 'Join'}</button></div>{subscribed && <small role="status">Thanks for subscribing.</small>}</form>
    </footer>
  )
}

export function NavigationIcon() {
  return <MapPin size={14} />
}
