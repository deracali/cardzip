"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { homeServiceApi } from "../lib/homeServiceApi";

export default function PaymentReturn() {
  const [message, setMessage] = useState("Confirming your payment with Paystack...");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) {
      setMessage("No payment reference was returned. You can review your service requests and try again.");
      return;
    }
    homeServiceApi.verifyPayment(reference)
      .then(({ payment }) => {
        if (payment.status !== "paid") throw new Error("Paystack has not confirmed this payment yet.");
        setConfirmed(true);
        setMessage("Payment confirmed. Your service request is up to date.");
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "We could not confirm this payment."));
  }, []);

  return <main className="payment-return"><section><span className={`payment-return-icon ${confirmed ? "confirmed" : ""}`}>{confirmed ? "✓" : "↻"}</span><span className="eyebrow">PAYSTACK CHECKOUT</span><h1>{confirmed ? "Payment confirmed" : "Checking your payment"}</h1><p role="status">{message}</p><Link className="button button-orange" href="/dashboard/requests">Back to service requests</Link><small>Never share your card details with FixFlow support.</small></section></main>;
}
