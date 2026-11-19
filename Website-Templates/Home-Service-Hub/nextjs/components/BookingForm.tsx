"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, errorStatus, getSession, homeServiceApi, type Appointment } from "../lib/homeServiceApi";

const services = [
  { id: "pipe", label: "Pipe repair" },
  { id: "drain", label: "Drain cleaning" },
  { id: "cooling", label: "AC maintenance" },
  { id: "heating", label: "Heating" },
];
const urgencies: Appointment["urgency"][] = ["standard", "emergency", "weekend"];

export default function BookingForm() {
  const router = useRouter();
  const [form, setForm] = useState<{
    serviceId: string;
    urgency: Appointment["urgency"];
    preferredDate: string;
    address: string;
    phone: string;
    description: string;
  }>({ serviceId: "pipe", urgency: "standard", preferredDate: "", address: "", phone: "", description: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const serviceId = query.get("service");
    const urgency = query.get("urgency");
    setForm((current) => ({
      ...current,
      serviceId: services.find((item) => item.id === serviceId)?.id || current.serviceId,
      urgency: urgencies.find((item) => item === urgency) || current.urgency,
    }));
    if (!getSession()) {
      const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      router.replace(`/login?next=${next}`);
    }
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (getSession()?.user.role !== "client") {
      setMessage("A client account is required to request service.");
      return;
    }
    setBusy(true);
    try {
      await homeServiceApi.createAppointment(form);
      router.replace("/dashboard");
    } catch (error) {
      if (errorStatus(error) === 401) {
        clearSession();
        router.replace("/login?next=%2Fbook-now");
      } else {
        setMessage(error instanceof Error ? error.message : "Could not submit the request.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="portal-form booking-form" onSubmit={submit}>
      <label>Service<select value={form.serviceId} onChange={(event) => setForm({ ...form, serviceId: event.target.value })}>{services.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}</select></label>
      <label>Visit timing<select value={form.urgency} onChange={(event) => setForm({ ...form, urgency: urgencies.find((urgency) => urgency === event.target.value) || form.urgency })}>{urgencies.map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}</select></label>
      <label>Preferred date<input type="date" min={new Date().toISOString().slice(0, 10)} required value={form.preferredDate} onChange={(event) => setForm({ ...form, preferredDate: event.target.value })} /></label>
      <label>Phone number<input type="tel" autoComplete="tel" maxLength={40} required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <label className="form-wide">Service address<input autoComplete="street-address" maxLength={240} required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
      <label className="form-wide">Describe the issue<textarea rows={4} maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      {message && <p className="form-error form-wide" role="alert">{message}</p>}
      <button className="button button-orange form-wide" disabled={busy}>{busy ? "Sending request..." : "Request service"}</button>
    </form>
  );
}
