"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, errorStatus, foodApi, getCart, getSession } from "../lib/foodApi";
import { dishes } from "../lib/menu";
import { formatMoney, paymentCurrency } from "../lib/money";

export default function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCart(getCart());
    if (!getSession()) router.replace(`/login?next=${encodeURIComponent("/checkout")}`);
  }, [router]);

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = Object.entries(cart).reduce((sum, [id, quantity]) => sum + (dishes.find((dish) => dish.id === id)?.price || 0) * quantity, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!count) {
      setError("Your cart is empty.");
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const checkout = await foodApi.initializePayment({
        items: Object.entries(cart).map(([dishId, quantity]) => ({ dishId, quantity })),
        address: String(form.get("address") || ""),
        phone: String(form.get("phone") || ""),
        instructions: String(form.get("instructions") || ""),
        currency: paymentCurrency,
      });
      window.location.assign(checkout.authorizationUrl);
    } catch (requestError) {
      if (errorStatus(requestError) === 401) {
        clearSession();
        router.replace(`/login?next=${encodeURIComponent("/checkout")}`);
      } else {
        setError(requestError instanceof Error ? requestError.message : "Could not start Paystack checkout.");
      }
    } finally {
      setBusy(false);
    }
  }

  return <main className="checkout-page"><Link className="checkout-back" href="/restaurant">← Back to restaurant menu</Link><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><span className="food-kicker">SECURE PAYSTACK CHECKOUT</span><h1>Delivery details</h1><label>Delivery address<input name="address" autoComplete="street-address" maxLength={240} required /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label><label>Delivery instructions<textarea name="instructions" rows={3} maxLength={500} /></label><p className="demo-notice">You’ll complete payment on Paystack’s hosted checkout. Card details are not handled by this app.</p>{error && <p className="food-error" role="alert">{error}</p>}<button className="food-button" disabled={busy || !count}>{busy ? "Connecting to Paystack..." : `Continue to payment · ${formatMoney(subtotal + (count ? 1.99 : 0))}`}</button></form><aside className="food-cart"><h2>Your order · {count} items</h2>{Object.entries(cart).map(([id, quantity]) => { const dish = dishes.find((item) => item.id === id); return dish ? <p key={id}>{quantity} × {dish.name}<b>{formatMoney(dish.price * quantity)}</b></p> : null; })}<div className="cart-total"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div><div className="cart-total"><span>Delivery</span><strong>{formatMoney(count ? 1.99 : 0)}</strong></div><small>The API recalculates the total from its own menu before creating a Paystack transaction.</small></aside></div></main>;
}
