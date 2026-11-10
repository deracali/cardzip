"use client";

import { useState } from "react";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CreditCard, LockKeyhole, MapPin,
  ShieldCheck, Smartphone, Star, UserRound, WalletCards, Zap
} from "lucide-react";
import { BookingSummary, BookingSearch, Header, Logo, ReviewsSection, SiteFooter, VehicleGrid, AuthField } from "../components/Shared";
import { vehicles } from "../data/vehicles";
import { useBookingDetails } from "../hooks/useBookingDetails";
export default function CheckoutPage() {
  const booking = useBookingDetails()
  const subtotal = booking.vehicle.price * booking.days
  const protection = booking.coverage ? 18 * booking.days : 0
  const total = subtotal + protection
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [confirmed, setConfirmed] = useState(false)

  function confirmBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setConfirmed(true)
  }

  return (
    <>
      <Header compact />
      <main className="booking-page">
        <a className="checkout-back" href={`/book?vehicle=${encodeURIComponent(booking.vehicle.name)}&pickup=${encodeURIComponent(booking.pickup)}&dropoff=${encodeURIComponent(booking.dropoff)}&start=${encodeURIComponent(booking.start)}&end=${encodeURIComponent(booking.end)}&coverage=${booking.coverage}`}><ArrowLeft size={14} /> Back to booking</a>
        <div className="checkout-heading">
          <div><p className="section-kicker">YOUR TRIP · STEP 2 OF 2</p><h1>{confirmed ? 'You’re all set!' : 'Payment checkout'}</h1><p>{confirmed ? 'Your demo reservation is confirmed.' : 'Add your details to complete your reservation.'}</p></div>
          <span className="secure-label"><LockKeyhole size={14} /> Secure checkout</span>
        </div>
        {confirmed ? (
          <section className="confirmation-card panel-card" role="status">
            <span className="confirmation-icon"><Check size={27} /></span>
            <p className="section-kicker">RESERVATION REQUEST RECEIVED</p>
            <h2>Your {booking.vehicle.name} is reserved.</h2>
            <p>This is a checkout demo. No payment was collected. Your trip summary is ready below.</p>
            <div className="confirmation-total"><span>Reservation total</span><strong>${total}</strong></div>
            <a className="button continue-button" href="/">Back to Voltigo <ArrowRight size={15} /></a>
          </section>
        ) : (
          <div className="booking-layout">
            <form className="checkout-form panel-card" onSubmit={confirmBooking}>
              <section className="form-section">
                <div className="form-section-heading"><span className="step-icon"><UserRound size={16} /></span><div><h2>Contact information</h2><p>We’ll send your trip details and pickup instructions here.</p></div></div>
                <div className="booking-input-grid">
                  <label className="checkout-field"><span>Full name</span><input name="name" autoComplete="name" placeholder="Jordan Miles" required /></label>
                  <label className="checkout-field"><span>Email address</span><input type="email" name="email" autoComplete="email" placeholder="jordan@example.com" required /></label>
                  <label className="checkout-field"><span>Phone number</span><input type="tel" name="phone" autoComplete="tel" placeholder="+1 (555) 000-0000" required /></label>
                </div>
              </section>
              <section className="form-section">
                <div className="form-section-heading"><span className="step-icon"><CreditCard size={16} /></span><div><h2>Payment method</h2><p>Choose how you’d like to pay.</p></div></div>
                <div className="payment-methods" role="group" aria-label="Payment method">
                  <button type="button" className={paymentMethod === 'card' ? 'payment-method is-active' : 'payment-method'} aria-pressed={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')}><CreditCard size={16} /> Credit or debit card</button>
                  <button type="button" className={paymentMethod === 'wallet' ? 'payment-method is-active' : 'payment-method'} aria-pressed={paymentMethod === 'wallet'} onClick={() => setPaymentMethod('wallet')}><WalletCards size={16} /> Digital wallet</button>
                </div>
                {paymentMethod === 'card' ? (
                  <div className="payment-fields">
                    <label className="checkout-field"><span>Name on card</span><input name="cardholder" autoComplete="cc-name" placeholder="Jordan Miles" required /></label>
                    <label className="checkout-field"><span>Card number</span><span className="card-input"><CreditCard size={15} /><input name="cardnumber" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" minLength={12} maxLength={23} required /></span></label>
                    <div className="booking-input-grid">
                      <label className="checkout-field"><span>Expiry date</span><input name="expiry" autoComplete="cc-exp" placeholder="MM / YY" required /></label>
                      <label className="checkout-field"><span>Security code</span><input name="cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" minLength={3} maxLength={4} required /></label>
                    </div>
                  </div>
                ) : (
                  <div className="wallet-note"><WalletCards size={18} /><span><strong>Digital wallet selected</strong><small>Wallet processing is available when a payment provider is connected.</small></span></div>
                )}
              </section>
              <p className="demo-payment-note"><LockKeyhole size={13} /> Demo checkout only. Do not enter real payment details; no payment is processed.</p>
              <button className="button continue-button" type="submit">Confirm reservation · ${total} <ArrowRight size={15} /></button>
            </form>
            <BookingSummary booking={booking} days={booking.days} subtotal={subtotal} protection={protection} total={total} payment />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
