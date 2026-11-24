"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck, Ticket } from "lucide-react";
import { errorStatus, eventHubApi, type Booking, type EventItem, type PaymentProvider } from "../lib/eventHubApi";

export default function BookingForm({ event }: { event: EventItem }) {
  const router = useRouter();
  const [ticketType, setTicketType] = useState("General Admission");
  const [quantity, setQuantity] = useState(1);
  const [provider, setProvider] = useState<PaymentProvider | "">("");
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const total = (event.price + (ticketType === "VIP Pass" ? 100 : 0)) * quantity;
  const formattedTotal = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(total);

  useEffect(() => {
    let active = true;
    async function loadProviders() {
      try {
        const result = await eventHubApi.paymentProviders();
        if (active) {
          setProviders(result.providers);
          setCurrency(result.currency);
          setProvider(result.providers[0] || "");
        }
      } catch (requestError) {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load payment options.");
      } finally {
        if (active) setLoadingProviders(false);
      }
    }

    async function verifyReturn() {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment");
      if (paymentStatus === "cancelled") {
        setNotice("Checkout was cancelled. No charge was made.");
        return;
      }
      if (paymentStatus !== "success") return;
      const providerName = params.get("provider");
      const paymentReference = providerName === "stripe"
        ? params.get("session_id")
        : params.get("reference") || params.get("trxref");
      if ((providerName !== "paystack" && providerName !== "stripe") || !paymentReference) {
        setError("The payment provider returned an invalid confirmation reference.");
        return;
      }

      setVerifying(true);
      try {
        const result = await eventHubApi.verifyBookingPayment({
          provider: providerName,
          reference: paymentReference,
        });
        if (!active) return;
        setBooking(result.booking);
        window.history.replaceState({}, "", window.location.pathname);
      } catch (requestError) {
        if (!active) return;
        if (errorStatus(requestError) === 401) {
          const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
          router.replace(`/login?next=${next}`);
        } else {
          setError(requestError instanceof Error ? requestError.message : "The payment could not be verified.");
        }
      } finally {
        if (active) setVerifying(false);
      }
    }

    void loadProviders();
    void verifyReturn();
    return () => { active = false; };
  }, [router]);

  async function submit(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setError("");
    setNotice("");
    if (!provider) {
      setError("No online payment provider is currently configured.");
      return;
    }
    setBusy(true);
    try {
      const checkout = await eventHubApi.startBookingCheckout({
        eventSlug: event.slug,
        ticketType,
        quantity,
        provider,
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (requestError) {
      if (errorStatus(requestError) === 401) {
        const next = encodeURIComponent(`/checkout/${event.slug}`);
        router.replace(`/login?next=${next}`);
      } else {
        setError(requestError instanceof Error ? requestError.message : "Could not start secure checkout.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (verifying) {
    return <section className="booking-form payment-confirming"><span className="eyebrow">VERIFYING PAYMENT</span><h1>Confirming your tickets</h1><p>We are checking the payment directly with the provider. Please keep this page open.</p></section>;
  }

  if (booking) {
    return <section className="booking-form payment-success">
      <span className="payment-success-icon"><Check size={25} /></span>
      <span className="eyebrow">PAYMENT CONFIRMED</span>
      <h1>Your tickets are ready.</h1>
      <p>Your payment was verified securely. Booking <strong>{booking.reference}</strong> is confirmed.</p>
      <div className="booking-total"><span>{booking.quantity} × {booking.ticketType}</span><strong>{new Intl.NumberFormat(undefined, { style: "currency", currency: booking.currency || currency }).format(booking.total)}</strong></div>
      <Link className="button button-primary" href="/dashboard/tickets">View my tickets <ArrowRight size={15} /></Link>
    </section>;
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <span className="eyebrow">SECURE TICKET CHECKOUT</span>
      <h1>{event.title}</h1>
      <p>{event.date} · {event.location}</p>
      <label>Ticket type<select value={ticketType} onChange={(change) => setTicketType(change.target.value)}><option>General Admission</option><option>VIP Pass</option></select></label>
      <label>Quantity<select value={quantity} onChange={(change) => setQuantity(Number(change.target.value))}>{[1, 2, 3, 4, 5, 6].map((number) => <option value={number} key={number}>{number}</option>)}</select></label>
      <fieldset className="payment-provider-options">
        <legend>Choose payment method</legend>
        {loadingProviders ? <p>Loading available payment methods…</p> : providers.length ? providers.map((item) => (
          <label className={provider === item ? "payment-provider selected" : "payment-provider"} key={item}>
            <input type="radio" name="payment-provider" value={item} checked={provider === item} onChange={() => setProvider(item)} />
            <span className="payment-radio" />
            <span><strong>{item === "paystack" ? "Paystack" : "Stripe"}</strong><small>Secure, provider-hosted checkout</small></span>
          </label>
        )) : <p className="demo-notice">Online checkout is not configured. Ask the event organizer to add payment credentials to the backend.</p>}
      </fieldset>
      <div className="booking-total"><span>Ticket total · {quantity} {quantity === 1 ? "ticket" : "tickets"}</span><strong>{formattedTotal}</strong></div>
      {notice && <p className="payment-notice" role="status">{notice}</p>}
      {error && <p className="api-error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={busy || loadingProviders || providers.length === 0}>{busy ? "Opening secure checkout…" : `Pay ${formattedTotal}`} <ArrowRight size={15} /></button>
      <small className="payment-trust"><ShieldCheck size={14} />Payment is verified by PulseLive before tickets are confirmed.</small>
      <Link href={`/events/${event.slug}`}>Back to event</Link>
      <span className="payment-ticket"><Ticket size={14} />Tickets appear in your attendee dashboard after verification.</span>
    </form>
  );
}
