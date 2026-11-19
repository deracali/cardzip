"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, UserRound } from "lucide-react";
import { BookingSummary, Header, SiteFooter } from "../components/Shared";
import { useBookingDetails } from "../hooks/useBookingDetails";
import { apiRequest } from "../services/api";
export default function CheckoutPage() {
  const booking = useBookingDetails()
  const subtotal = booking.vehicle.price * booking.days
  const protection = booking.coverage ? 18 * booking.days : 0
  const total = subtotal + protection
  const [confirmed, setConfirmed] = useState(false)
  const [notice, setNotice] = useState("")

  async function confirmBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice("")
    try {
      const session = await apiRequest<{ user?: { role: string } }>("/auth/me");
      if (!session.user || session.user.role !== "renter") {
        throw new Error("Sign in with a renter account before confirming your reservation.");
      }
      await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: booking.vehicle.id || booking.vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          pickup: booking.pickup,
          dropoff: booking.dropoff,
          start: booking.start,
          end: booking.end,
          coverage: booking.coverage,
        }),
      });
      setConfirmed(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to submit your reservation.");
    }
  }

  return (
    <>
      <Header compact />
      <main className="booking-page">
        <a className="checkout-back" href={`/book?vehicle=${encodeURIComponent(booking.vehicle.name)}&pickup=${encodeURIComponent(booking.pickup)}&dropoff=${encodeURIComponent(booking.dropoff)}&start=${encodeURIComponent(booking.start)}&end=${encodeURIComponent(booking.end)}&coverage=${booking.coverage}`}><ArrowLeft size={14} /> Back to booking</a>
        <div className="checkout-heading">
          <div><p className="section-kicker">YOUR TRIP · STEP 2 OF 2</p><h1>{confirmed ? 'You’re all set!' : 'Review your reservation'}</h1><p>{confirmed ? 'Your reservation request has been sent to Voltigo.' : 'Confirm your trip details to send a reservation request.'}</p></div>
          <span className="secure-label"><LockKeyhole size={14} /> No payment collected</span>
        </div>
        {confirmed ? (
          <section className="confirmation-card panel-card" role="status">
            <span className="confirmation-icon"><Check size={27} /></span>
            <p className="section-kicker">RESERVATION REQUEST RECEIVED</p>
            <h2>Your {booking.vehicle.name} reservation is requested.</h2>
            <p>Your reservation is visible in the renter dashboard. No payment was collected.</p>
            <div className="confirmation-total"><span>Reservation total</span><strong>${total}</strong></div>
            <a className="button continue-button" href="/dashboard">View my trips <ArrowRight size={15} /></a>
          </section>
        ) : (
          <div className="booking-layout">
            <form className="checkout-form panel-card" onSubmit={confirmBooking}>
              {booking.loadError && <p className="portal-alert" role="alert">{booking.loadError}</p>}
              <section className="form-section">
                <div className="form-section-heading"><span className="step-icon"><UserRound size={16} /></span><div><h2>Contact information</h2><p>We’ll send your trip details and pickup instructions here.</p></div></div>
                <div className="booking-input-grid">
                  <label className="checkout-field"><span>Renter account</span><input value="Sign in to confirm your reservation" readOnly /></label>
                  <p className="checkout-disclaimer">Your saved renter profile will be attached to this reservation.</p>
                </div>
              </section>
              <p className="demo-payment-note"><LockKeyhole size={13} /> Reservation request only. No payment details are collected or processed.</p>
              {notice && <p className="auth-notice" role="alert">{notice} <a href="/login">Sign in</a> or <a href="/signup">create an account</a>.</p>}
              <button className="button continue-button" type="submit" disabled={booking.loading || Boolean(booking.loadError)}>Request reservation · ${total} <ArrowRight size={15} /></button>
            </form>
            <BookingSummary booking={booking} days={booking.days} subtotal={subtotal} protection={protection} total={total} payment />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
