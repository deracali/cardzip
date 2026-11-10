"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CreditCard, LockKeyhole, MapPin,
  ShieldCheck, Smartphone, Star, UserRound, WalletCards, Zap
} from "lucide-react";
import { BookingSummary, BookingSearch, Header, Logo, ReviewsSection, SiteFooter, VehicleGrid, AuthField } from "../components/Shared";
import { vehicles } from "../data/vehicles";
import { useBookingDetails } from "../hooks/useBookingDetails";
export default function BookingPage() {
  const booking = useBookingDetails()
  const [pickup, setPickup] = useState(booking.pickup)
  const [dropoff, setDropoff] = useState(booking.dropoff)
  const [start, setStart] = useState(booking.start)
  const [end, setEnd] = useState(booking.end)
  const [coverage, setCoverage] = useState(booking.coverage)
  const days = start && end
    ? Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
    : booking.days
  const subtotal = booking.vehicle.price * days
  const protection = coverage ? 18 * days : 0
  const total = subtotal + protection

  useEffect(() => {
    setPickup(booking.pickup)
    setDropoff(booking.dropoff)
    setStart(booking.start)
    setEnd(booking.end)
    setCoverage(booking.coverage)
  }, [booking])

  function continueToCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams({
      vehicle: booking.vehicle.name,
      pickup,
      dropoff,
      start,
      end,
      coverage: String(coverage),
    })
    window.location.href = `/checkout?${params.toString()}`
  }

  return (
    <>
      <Header compact />
      <main className="booking-page">
        <a className="checkout-back" href="/fleet"><ArrowLeft size={14} /> Back to fleet</a>
        <div className="checkout-heading">
          <div><p className="section-kicker">YOUR TRIP · STEP 1 OF 2</p><h1>Book your vehicle</h1><p>Choose your pickup details and review your reservation.</p></div>
          <span className="secure-label"><ShieldCheck size={14} /> Free cancellation up to 6h before pickup</span>
        </div>
        <div className="booking-layout">
          <form className="booking-form panel-card" onSubmit={continueToCheckout}>
            <section className="form-section">
              <div className="form-section-heading"><span className="step-icon"><MapPin size={16} /></span><div><h2>Pickup &amp; return</h2><p>Choose where and when you need your vehicle.</p></div></div>
              <div className="booking-input-grid">
                <label className="checkout-field"><span>Pickup location</span><input value={pickup} onChange={(event) => setPickup(event.target.value)} required /></label>
                <label className="checkout-field"><span>Return location</span><input value={dropoff} onChange={(event) => setDropoff(event.target.value)} required /></label>
                <label className="checkout-field"><span>Pickup date &amp; time</span><input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} required /></label>
                <label className="checkout-field"><span>Return date &amp; time</span><input type="datetime-local" value={end} min={start || undefined} onChange={(event) => setEnd(event.target.value)} required /></label>
              </div>
            </section>
            <section className="form-section">
              <div className="form-section-heading"><span className="step-icon"><ShieldCheck size={16} /></span><div><h2>Protection for your trip</h2><p>Travel with added peace of mind.</p></div></div>
              <label className="protection-option">
                <input type="checkbox" checked={coverage} onChange={(event) => setCoverage(event.target.checked)} />
                <span className="protection-copy"><strong>Voltigo full protection</strong><small>Roadside help and damage protection, $18 per day</small></span>
                <span className="protection-price">{coverage ? `$${18 * days}` : '$18'}<small>/day</small></span>
              </label>
            </section>
            <button className="button continue-button" type="submit">Continue to checkout <ArrowRight size={15} /></button>
            <p className="checkout-disclaimer"><LockKeyhole size={12} /> You won’t be charged until you review your payment.</p>
          </form>
          <BookingSummary booking={booking} days={days} subtotal={subtotal} protection={protection} total={total} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
