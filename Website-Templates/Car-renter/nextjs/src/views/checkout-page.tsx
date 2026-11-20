"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, UserRound } from "lucide-react";
import { BookingSummary, Header, SiteFooter } from "../components/Shared";
import { useBookingDetails } from "../hooks/useBookingDetails";
import { apiRequest } from "../services/api";

type VerifiedBooking = { vehicleName: string; total: number; paymentCurrency: string };

export default function CheckoutPage() {
  const booking = useBookingDetails()
  const subtotal = booking.vehicle.price * booking.days
  const protection = booking.coverage ? 18 * booking.days : 0
  const total = subtotal + protection
  const [confirmed, setConfirmed] = useState(false)
  const [verifiedBooking, setVerifiedBooking] = useState<VerifiedBooking | null>(null)
  const [notice, setNotice] = useState("")
  const [providers, setProviders] = useState<("stripe" | "paystack")[]>([])
  const [provider, setProvider] = useState<"stripe" | "paystack">("stripe")
  const [currency, setCurrency] = useState("USD")
  const [providersLoaded, setProvidersLoaded] = useState(false)
  const [startingPayment, setStartingPayment] = useState(false)

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get("payment")
    const paymentProvider = params.get("provider")
    const bookingId = params.get("bookingId")

    apiRequest<{ providers: ("stripe" | "paystack")[]; currency: string }>("/payments/providers")
      .then((result) => {
        if (!active) return
        setProviders(result.providers)
        setCurrency(result.currency)
        setProvidersLoaded(true)
        if (result.providers.length) setProvider(result.providers.includes("stripe") ? "stripe" : "paystack")
      })
      .catch((error: unknown) => {
        if (active) {
          setNotice(error instanceof Error ? error.message : "Unable to load payment options.")
          setProvidersLoaded(true)
        }
      })

    if (paymentStatus === "cancelled") {
      setNotice("Payment was cancelled. Your reservation has not been confirmed.")
    } else if (paymentStatus === "success" && bookingId && (paymentProvider === "stripe" || paymentProvider === "paystack")) {
      const verification = new URLSearchParams({ provider: paymentProvider, bookingId })
      const reference = paymentProvider === "stripe" ? params.get("session_id") : params.get("reference")
      if (reference) verification.set(paymentProvider === "stripe" ? "sessionId" : "reference", reference)
      apiRequest<{ paid: boolean; booking: VerifiedBooking }>(`/payments/verify?${verification.toString()}`)
        .then((result) => {
          if (!active) return
          if (result.paid) {
            setVerifiedBooking(result.booking)
            setConfirmed(true)
          }
          else setNotice("Payment could not be confirmed. Your reservation is not active yet.")
        })
        .catch((error: unknown) => {
          if (active) setNotice(error instanceof Error ? error.message : "Unable to verify your payment.")
        })
    }

    return () => { active = false }
  }, [])

  async function confirmBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice("")
    if (!providers.length) {
      setNotice("Online payment is not available. Ask the administrator to configure Stripe or Paystack on the backend.")
      return
    }
    setStartingPayment(true)
    try {
      const result = await apiRequest<{ checkoutUrl: string }>("/payments/checkout", {
        method: "POST",
        body: JSON.stringify({
          provider,
          vehicleId: booking.vehicle.id || booking.vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          pickup: booking.pickup,
          dropoff: booking.dropoff,
          start: booking.start,
          end: booking.end,
          coverage: booking.coverage,
          returnUrl: `${window.location.origin}${window.location.pathname}${window.location.search}`,
        }),
      });
      window.location.assign(result.checkoutUrl)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to submit your reservation.");
    } finally {
      setStartingPayment(false)
    }
  }

  return (
    <>
      <Header compact />
      <main className="booking-page">
        <a className="checkout-back" href={`/book?vehicle=${encodeURIComponent(booking.vehicle.name)}&pickup=${encodeURIComponent(booking.pickup)}&dropoff=${encodeURIComponent(booking.dropoff)}&start=${encodeURIComponent(booking.start)}&end=${encodeURIComponent(booking.end)}&coverage=${booking.coverage}`}><ArrowLeft size={14} /> Back to booking</a>
        <div className="checkout-heading">
          <div><p className="section-kicker">YOUR TRIP · STEP 2 OF 2</p><h1>{confirmed ? 'You’re all set!' : 'Review your reservation'}</h1><p>{confirmed ? 'Payment confirmed. Your reservation is confirmed.' : 'Complete secure payment to confirm your reservation.'}</p></div>
          <span className="secure-label"><LockKeyhole size={14} /> Secure checkout</span>
        </div>
        {confirmed ? (
          <section className="confirmation-card panel-card" role="status">
            <span className="confirmation-icon"><Check size={27} /></span>
            <p className="section-kicker">RESERVATION CONFIRMED</p>
            <h2>Your {verifiedBooking?.vehicleName || booking.vehicle.name} reservation is confirmed.</h2>
            <p>Your paid reservation is saved to your renter account and appears in My Trips.</p>
            <div className="confirmation-total"><span>Reservation total</span><strong>{new Intl.NumberFormat(undefined, { style: "currency", currency: verifiedBooking?.paymentCurrency || currency }).format(verifiedBooking?.total ?? total)}</strong></div>
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
              <section className="form-section payment-method-section">
                <div className="form-section-heading"><span className="step-icon"><LockKeyhole size={16} /></span><div><h2>Payment method</h2><p>Select a secure provider. You’ll complete payment on its checkout page.</p></div></div>
                {providers.length ? <div className="payment-provider-options">{providers.map((option) => <label key={option}><input type="radio" name="payment-provider" value={option} checked={provider === option} onChange={() => setProvider(option)} /><span><strong>{option === "stripe" ? "Stripe" : "Paystack"}</strong><small>Secure hosted checkout</small></span></label>)}</div> : <p className="checkout-disclaimer">{providersLoaded ? "No online payment provider is configured. Add STRIPE_SECRET_KEY or PAYSTACK_SECRET_KEY to the backend environment to enable payment." : "Loading available payment providers…"}</p>}
              </section>
              {notice && <p className="auth-notice" role="alert">{notice} <a href={`/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`}>Sign in</a> or <a href={`/signup?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`}>create an account</a>.</p>}
              <button className="button continue-button" type="submit" disabled={booking.loading || Boolean(booking.loadError) || !providers.length || startingPayment}>{startingPayment ? 'Opening secure checkout…' : `Pay ${new Intl.NumberFormat(undefined, { style: "currency", currency }).format(total)}`} <ArrowRight size={15} /></button>
            </form>
            <BookingSummary booking={booking} days={booking.days} subtotal={subtotal} protection={protection} total={total} payment />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
