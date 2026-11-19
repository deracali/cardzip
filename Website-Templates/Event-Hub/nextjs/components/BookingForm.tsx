"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { eventHubApi, type EventItem } from "../lib/eventHubApi";

export default function BookingForm({ event }: { event: EventItem }) {
  const router = useRouter();
  const [ticketType, setTicketType] = useState("General Admission");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const total = (event.price + (ticketType === "VIP Pass" ? 100 : 0)) * quantity;

  async function submit(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setError("");
    setBusy(true);
    try {
      await eventHubApi.createBooking({ eventSlug: event.slug, ticketType, quantity });
      router.replace("/dashboard");
    } catch (requestError) {
      const next = encodeURIComponent(`/checkout/${event.slug}`);
      if (requestError && typeof requestError === "object" && "status" in requestError && requestError.status === 401) {
        router.replace(`/login?next=${next}`);
      } else {
        setError(requestError instanceof Error ? requestError.message : "Could not submit booking request.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <span className="eyebrow">BOOKING REQUEST · NO PAYMENT TAKEN</span>
      <h1>{event.title}</h1>
      <p>{event.date} · {event.location}</p>
      <label>Ticket type<select value={ticketType} onChange={(event) => setTicketType(event.target.value)}><option>General Admission</option><option>VIP Pass</option></select></label>
      <label>Quantity<select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((number) => <option value={number} key={number}>{number}</option>)}</select></label>
      <div className="booking-total"><span>Estimated total</span><strong>${total.toFixed(2)}</strong></div>
      <p className="demo-notice">This creates a booking request only. No payment is collected and no ticket is issued.</p>
      {error && <p className="api-error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={busy}>{busy ? "Submitting..." : "Submit booking request"}</button>
      <Link href={`/events/${event.slug}`}>Back to event</Link>
    </form>
  );
}
