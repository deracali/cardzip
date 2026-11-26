"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appointmentTimes } from "../lib/salonData";
import { getSession, salonApi, type SalonService, type SalonStylist } from "../lib/salonApi";
import { SalonFooter, SalonHeader } from "./SalonShell";

type PaymentQuote = { amountNgn: number; amountMinor: number; currency: "NGN" };

export default function SalonBookingForm() {
  const router = useRouter();
  const [services, setServices] = useState<SalonService[]>([]);
  const [stylists, setStylists] = useState<SalonStylist[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(appointmentTimes[2]);
  const [stylist, setStylist] = useState("");
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const service = services.find((item) => item.id === serviceId);

  useEffect(() => {
    let active = true;
    Promise.all([salonApi.services(), salonApi.stylists()])
      .then(([serviceResult, stylistResult]) => {
        if (!active) return;
        const activeServices = serviceResult.services.filter((item) => item.active);
        const activeStylists = stylistResult.stylists.filter((item) => item.active);
        setServices(activeServices);
        setStylists(activeStylists);
        const requestedService = new URLSearchParams(window.location.search).get("service");
        setServiceId(activeServices.find((item) => item.id === requestedService)?.id || activeServices[0]?.id || "");
        setStylist(activeStylists[0]?.name || "");
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load the current booking menu.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    let active = true;
    setQuote(null);
    fetch(`/api/paystack/quote?serviceId=${encodeURIComponent(serviceId)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as PaymentQuote & { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not calculate the Paystack amount.");
        return result;
      })
      .then((result) => { if (active) { setQuote(result); setError(""); } })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not calculate the Paystack amount.");
      });
    return () => { active = false; };
  }, [serviceId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const session = getSession();
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent("/book")}`);
      return;
    }
    if (session.user.role !== "client") {
      setError("Only client accounts can book a salon appointment.");
      return;
    }
    if (!service || !stylist || !quote) {
      setError("Wait for the service and payment quote to finish loading.");
      return;
    }

    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          serviceId,
          date,
          time,
          stylist,
          notes: String(form.get("notes") || ""),
        }),
      });
      const result = await response.json() as { authorizationUrl?: string; error?: string };
      if (!response.ok || !result.authorizationUrl) throw new Error(result.error || "Paystack checkout could not be started.");
      window.location.assign(result.authorizationUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not start Paystack checkout.");
      setBusy(false);
    }
  }

  return <div className="salon-home"><SalonHeader /><main className="salon-account-page salon-booking-page">{loading ? <section className="salon-account-card"><p>Loading services and stylists…</p></section> : <section className="salon-account-card salon-booking-form-card"><span className="salon-kicker">LUMIÈRE · APPOINTMENTS</span><h1>Choose your next ritual</h1><p>Choose your appointment, then pay the full service price securely through Paystack.</p>{service && <form className="salon-account-form" onSubmit={submit}><label>Service<select value={serviceId} onChange={(event) => setServiceId(event.target.value)} required>{services.map((item) => <option value={item.id} key={item.id}>{item.name} · ${item.price}</option>)}</select></label><div className="salon-form-row"><label>Date<input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} required /></label><label>Time<select value={time} onChange={(event) => setTime(event.target.value)}>{appointmentTimes.map((item) => <option key={item}>{item}</option>)}</select></label></div><label>Preferred stylist<select value={stylist} onChange={(event) => setStylist(event.target.value)} required>{stylists.map((item) => <option key={item.id} value={item.name}>{item.name} · {item.role}</option>)}</select></label><label>Notes for the studio<textarea name="notes" rows={3} maxLength={500} placeholder="Anything you would like your stylist to know?" /></label><div className="salon-booking-total"><span>{service.name}<small>{service.duration} · Full payment in NGN</small></span><strong>{quote ? `₦${quote.amountNgn.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Calculating…"}</strong></div><p className="salon-account-note">Service menu prices are shown in USD. The amount charged is converted to NGN using the configured Paystack exchange rate.</p>{error && <p className="salon-form-error" role="alert">{error}</p>}<button className="salon-button salon-button-primary" disabled={busy || !quote}>{busy ? "Opening Paystack…" : "Pay securely with Paystack"}</button></form>}{!service && !error && <p>No services are currently available.</p>}{error && !service && <p className="salon-form-error" role="alert">{error}</p>}<p className="salon-account-switch">Need an account? <Link href="/signup">Create one here</Link></p></section>}</main><SalonFooter /></div>;
}
