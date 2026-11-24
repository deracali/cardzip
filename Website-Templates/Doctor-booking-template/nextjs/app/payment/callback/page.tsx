"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, HeartPulse, ShieldAlert } from "lucide-react";

type Appointment = {
  doctorName: string;
  specialty: string;
  startsAt: string;
  timeLabel: string;
  reference: string;
};

export default function PaymentCallbackPage() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const parameters = new URLSearchParams(window.location.search);
    const provider = parameters.get("provider");
    const reference = provider === "stripe" ? parameters.get("session_id") : parameters.get("reference");

    if (!["stripe", "paystack"].includes(provider || "") || !reference) {
      setError("We couldn't find a payment reference to verify.");
      setLoading(false);
      return () => { active = false; };
    }

    fetch(`/api/payments/verify?${parameters.toString()}`, { credentials: "same-origin" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "We couldn't verify this payment.");
        if (active) setAppointment(result.appointment);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "We couldn't verify this payment.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <main className="doctor-details-main">
      <section className="booking-confirmation" role={error ? "alert" : "status"}>
        <span>{error ? <ShieldAlert size={25} /> : loading ? <HeartPulse size={25} /> : <Check size={25} />}</span>
        <p className="booking-kicker">{error ? "PAYMENT NOT VERIFIED" : loading ? "SECURE CHECKOUT" : "PAYMENT CONFIRMED"}</p>
        <h1>{error ? "We couldn't confirm your payment." : loading ? "Confirming your appointment…" : "Your appointment is booked."}</h1>
        {loading && <p>We’re verifying your transaction securely and saving the appointment to your Carewell account.</p>}
        {error && <p>{error} If your account was charged, contact the Carewell team before trying again.</p>}
        {appointment && (
          <p>
            {appointment.doctorName} · {appointment.specialty}<br />
            {new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(new Date(appointment.startsAt))}<br />
            Reference: <strong>{appointment.reference}</strong>
          </p>
        )}
        {!loading && (
          <a href="/dashboard">{error ? "Return to your dashboard" : "View your dashboard"} <ArrowRight size={14} /></a>
        )}
      </section>
    </main>
  );
}
