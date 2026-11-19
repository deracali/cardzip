"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMarketplaceSession, marketplaceApi } from "../lib/marketplaceApi";

type PaymentState = "checking" | "paid" | "cancelled" | "failed";

export default function PaymentReturn({
  provider,
  reference,
  sessionId,
  orderNumber,
  cancelled,
}: {
  provider: string;
  reference: string;
  sessionId: string;
  orderNumber: string;
  cancelled: boolean;
}) {
  const [state, setState] = useState<PaymentState>("checking");
  const [message, setMessage] = useState("Confirming payment with the provider…");
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    let active = true;
    async function confirmPayment() {
      if (cancelled) {
        try {
          let paymentCompleted = false;
          if (provider === "stripe" && orderNumber && getMarketplaceSession()?.user.role === "client") {
            const result = await marketplaceApi.cancelStripePayment(orderNumber);
            paymentCompleted = Boolean(result.paid);
          }
          if (active) {
            setState(paymentCompleted ? "paid" : "cancelled");
            setMessage(paymentCompleted
              ? `Payment confirmed${orderNumber ? ` for order ${orderNumber}` : ""}.`
              : "Checkout was cancelled. No payment confirmation was received.");
          }
        } catch (error) {
          if (active) {
            setState("failed");
            setMessage(error instanceof Error ? error.message : "Could not confirm the checkout cancellation.");
          }
        }
        return;
      }

      const session = getMarketplaceSession();
      if (!session?.token || session.user.role !== "client") {
        if (active) {
          setState("failed");
          setNeedsLogin(true);
          setMessage("Sign in to the customer account used for this order to confirm its payment.");
        }
        return;
      }

      try {
        if (provider === "paystack" && reference) {
          await marketplaceApi.verifyPaystackPayment(reference);
        } else if (provider === "stripe" && sessionId) {
          await marketplaceApi.verifyStripePayment(sessionId);
        } else {
          throw new Error("The payment return link is incomplete.");
        }
        if (active) {
          setState("paid");
          setMessage(`Payment confirmed${orderNumber ? ` for order ${orderNumber}` : ""}.`);
        }
      } catch (error) {
        if (active) {
          setState("failed");
          setMessage(error instanceof Error ? error.message : "The provider could not confirm this payment.");
        }
      }
    }

    void confirmPayment();
    return () => { active = false; };
  }, [cancelled, orderNumber, provider, reference, sessionId]);

  const returnPath = typeof window === "undefined" ? "/payment/return" : `${window.location.pathname}${window.location.search}`;

  return <main className="market-main market-payment-return">
    <span className="market-eyebrow">MARKETHUB CHECKOUT</span>
    <h1>{state === "paid" ? "Payment confirmed" : state === "cancelled" ? "Checkout cancelled" : state === "failed" ? "Payment not confirmed" : "Confirming your payment"}</h1>
    <p role={state === "failed" ? "alert" : "status"}>{message}</p>
    {state === "failed" && needsLogin && <Link className="market-button market-button-primary" href={`/login?redirect=${encodeURIComponent(returnPath)}`}>Sign in to confirm</Link>}
    {state === "failed" && !needsLogin && <p>If your provider shows a completed charge, contact the store administrator with your order reference.</p>}
    {(state === "paid" || state === "cancelled") && <Link className="market-button market-button-primary" href="/dashboard">View your orders</Link>}
    <Link className="market-back-link" href="/products">Return to the marketplace</Link>
  </main>;
}
