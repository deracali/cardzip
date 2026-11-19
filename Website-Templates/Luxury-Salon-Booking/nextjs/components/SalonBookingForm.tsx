"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appointmentTimes, services, stylists } from "../lib/salonData";
import { getSession, salonApi } from "../lib/salonApi";
import { SalonFooter, SalonHeader } from "./SalonShell";

export default function SalonBookingForm() {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0].id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(appointmentTimes[2]);
  const [stylist, setStylist] = useState(stylists[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const service = services.find((item) => item.id === serviceId) || services[0];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const session = getSession();
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent("/book")}`);
      return;
    }
    if (session.user.role !== "client") {
      setError("Only client accounts can request a salon appointment.");
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await salonApi.createAppointment({ serviceId, date, time, stylist, notes: String(form.get("notes") || "") });
      setSuccess(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit the appointment request.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="salon-home"><SalonHeader /><main className="salon-account-page salon-booking-page">{success ? <section className="salon-account-card"><span className="salon-kicker">REQUEST RECEIVED</span><h1>Your salon visit is in our hands.</h1><p>Your appointment request has been sent to Lumière. It will appear in your client dashboard while the studio reviews it.</p><Link className="salon-button salon-button-primary" href="/dashboard">View my appointments</Link></section> : <section className="salon-account-card salon-booking-form-card"><span className="salon-kicker">LUMIÈRE · APPOINTMENTS</span><h1>Choose your next ritual</h1><p>Submit an appointment request. The studio will confirm availability before your visit is final.</p><form className="salon-account-form" onSubmit={submit}><label>Service<select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{services.map((item) => <option value={item.id} key={item.id}>{item.name} · ${item.price}</option>)}</select></label><div className="salon-form-row"><label>Date<input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} required /></label><label>Time<select value={time} onChange={(event) => setTime(event.target.value)}>{appointmentTimes.map((item) => <option key={item}>{item}</option>)}</select></label></div><label>Preferred stylist<select value={stylist} onChange={(event) => setStylist(event.target.value)}>{stylists.map((item) => <option key={item}>{item}</option>)}</select></label><label>Notes for the studio<textarea name="notes" rows={3} maxLength={500} placeholder="Anything you would like your stylist to know?" /></label><div className="salon-booking-total"><span>{service.name}<small>{service.duration} · Requested price</small></span><strong>${service.price}.00</strong></div><p className="salon-account-note">Submitting a request does not guarantee a time slot. No payment is collected online.</p>{error && <p className="salon-form-error" role="alert">{error}</p>}<button className="salon-button salon-button-primary" disabled={busy}>{busy ? "Sending request..." : "Request appointment"}</button></form></section>}</main><SalonFooter /></div>;
}
