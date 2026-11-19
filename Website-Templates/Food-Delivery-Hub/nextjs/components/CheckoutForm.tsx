"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, errorStatus, foodApi, getCart, getSession, saveCart } from "../lib/foodApi";
import { dishes } from "../lib/menu";

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
      await foodApi.createOrder({
        items: Object.entries(cart).map(([dishId, quantity]) => ({ dishId, quantity })),
        address: String(form.get("address") || ""),
        phone: String(form.get("phone") || ""),
        instructions: String(form.get("instructions") || ""),
      });
      saveCart({});
      router.replace("/dashboard");
    } catch (requestError) {
      if (errorStatus(requestError) === 401) {
        clearSession();
        router.replace(`/login?next=${encodeURIComponent("/checkout")}`);
      } else {
        setError(requestError instanceof Error ? requestError.message : "Could not create demo order.");
      }
    } finally {
      setBusy(false);
    }
  }

  return <main className="checkout-page"><Link href="/restaurant">← Back to restaurant menu</Link><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><span className="food-kicker">DEMO CHECKOUT</span><h1>Delivery details</h1><label>Delivery address<input name="address" autoComplete="street-address" maxLength={240} required /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label><label>Delivery instructions<textarea name="instructions" rows={3} maxLength={500} /></label><p className="demo-notice">Demo order only. No payment details are requested or collected.</p>{error && <p className="food-error" role="alert">{error}</p>}<button className="food-button" disabled={busy || !count}>{busy ? "Placing order..." : `Place demo order · $${(subtotal + (count ? 1.99 : 0)).toFixed(2)}`}</button></form><aside className="food-cart"><h2>Your order · {count} items</h2>{Object.entries(cart).map(([id, quantity]) => { const dish = dishes.find((item) => item.id === id); return dish ? <p key={id}>{quantity} × {dish.name}<b>${(dish.price * quantity).toFixed(2)}</b></p> : null; })}<div className="cart-total"><span>Estimated subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><small>The API calculates the final total from its own menu.</small></aside></div></main>;
}
