"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "../lib/salonApi";
import { SalonFooter, SalonHeader } from "./SalonShell";

export default function PaystackCallback() {
  const [message, setMessage] = useState("Confirming your payment with Paystack…");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const reference = new URLSearchParams(window.location.search).get("reference");
    const session = getSession();
    if (!reference) {
      setError("The payment reference is missing. Check your Paystack receipt before trying again.");
      return () => { active = false; };
    }
    if (!session || session.user.role !== "client") {
      setError(`Payment reference ${reference} was returned, but your client session is unavailable. Sign in again and contact the salon if you were charged.`);
      return () => { active = false; };
    }

    fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        const result = await response.json() as { appointment?: { id: string }; error?: string };
        if (!response.ok) throw new Error(result.error || "Paystack could not confirm this appointment.");
        return result;
      })
      .then((result) => {
        if (active && result.appointment) setMessage("Payment confirmed. Your appointment is now in your dashboard.");
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not confirm your payment.");
      });

    return () => { active = false; };
  }, []);

  return <div className="salon-home"><SalonHeader /><main className="salon-account-page"><section className="salon-account-card"><span className="salon-kicker">{error ? "PAYMENT NEEDS ATTENTION" : "LUMIÈRE · CHECKOUT"}</span><h1>{error ? "We couldn't finish confirming." : "Thank you for choosing Lumière."}</h1>{error ? <p className="salon-form-error" role="alert">{error}</p> : <p role="status">{message}</p>}<Link className="salon-button salon-button-primary" href="/dashboard/appointments">Go to my appointments</Link>{error && <p className="salon-account-note">Keep your Paystack transaction reference for support. Do not retry payment until you have checked your receipt.</p>}</section></main><SalonFooter /></div>;
}
