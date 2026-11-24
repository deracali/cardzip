"use client";

import { useEffect, useState } from "react";
import "../../../src/Portal.css";

const apiBaseUrl = process.env.NEXT_PUBLIC_DAH_API_URL || "http://localhost:5000/api";

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Verifying your Paystack payment…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) {
      setStatus("failed");
      setMessage("The Paystack payment reference is missing.");
      return;
    }
    fetch(`${apiBaseUrl}/payments/paystack/verify`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to verify your Paystack payment.");
        if (!result.verified) throw new Error("Paystack has not confirmed this payment.");
        setStatus("success");
        setMessage("Paystack confirmed your payment successfully.");
      })
      .catch((error: unknown) => {
        setStatus("failed");
        setMessage(error instanceof Error ? error.message : "Unable to verify your Paystack payment.");
      });
  }, []);

  return (
    <main className="shell">
      <section className="panel success">
        <span className="eyebrow">PAYSTACK PAYMENT</span>
        <h1>{status === "loading" ? "Verifying payment…" : status === "success" ? "Payment confirmed" : "Payment not confirmed"}</h1>
        <p>{message}</p>
        <a className="button button-green" href="/dashboard">Open dashboard</a>
      </section>
    </main>
  );
}
