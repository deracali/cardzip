"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, errorStatus, foodApi, getSession, saveCart, type FoodOrder } from "../lib/foodApi";

type PaymentState = "verifying" | "paid" | "failed";

export default function PaymentReturn() {
  const router = useRouter();
  const [state, setState] = useState<PaymentState>("verifying");
  const [message, setMessage] = useState("Confirming your payment with Paystack.");
  const [order, setOrder] = useState<FoodOrder | null>(null);

  useEffect(() => {
    let active = true;
    const parameters = new URLSearchParams(window.location.search);
    const reference = parameters.get("reference") || parameters.get("trxref");
    if (!getSession()) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return () => { active = false; };
    }
    if (!reference) {
      setState("failed");
      setMessage("No payment reference was returned. Your cart is still available.");
      return () => { active = false; };
    }

    foodApi.verifyPayment(reference)
      .then(({ order: paidOrder }) => {
        if (!active) return;
        saveCart({});
        setOrder(paidOrder);
        setState("paid");
        setMessage("Payment confirmed. Your order is now being prepared.");
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (errorStatus(error) === 401) {
          clearSession();
          router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }
        setState("failed");
        setMessage(error instanceof Error ? error.message : "We could not confirm the payment.");
      });

    return () => { active = false; };
  }, [router]);

  return (
    <main className="checkout-page">
      <section className="payment-result" aria-live="polite">
        <span className="food-kicker">{state === "verifying" ? "PAYMENT VERIFICATION" : state === "paid" ? "PAYMENT COMPLETE" : "PAYMENT NOT CONFIRMED"}</span>
        <h1>{state === "verifying" ? "Verifying your payment…" : state === "paid" ? "Thank you for your order" : "We couldn’t confirm payment"}</h1>
        <p>{message}</p>
        {order && <p className="payment-order-reference">Order {order.id} · {order.status}</p>}
        {state === "paid" ? <Link className="food-button" href="/dashboard">View your orders</Link> : state === "failed" ? <Link className="food-button" href="/checkout">Return to checkout</Link> : null}
      </section>
    </main>
  );
}
