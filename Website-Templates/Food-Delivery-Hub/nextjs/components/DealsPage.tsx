"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Gift, Plus } from "lucide-react";
import { dishes, imageUrl } from "../lib/menu";
import { getCart, saveCart } from "../lib/foodApi";
import { formatMoney } from "../lib/money";
import { FoodFooter, FoodHeader } from "./FoodShell";

const offers = [
  { label: "FIRST THREE ORDERS", title: "Delivery is on us", detail: "Try a neighborhood favorite with free delivery on your first three demo orders." },
  { label: "SELECTED FAVORITES", title: "Save on a best seller", detail: "Browse highlighted dishes and add them straight to your cart." },
  { label: "WEEKEND TREAT", title: "Dessert makes it better", detail: "Finish your meal with a sweet favorite from Sugar Rush." },
];

const dealDishes = dishes.filter((dish) => ["burger", "pizza", "cake", "eggplant"].includes(dish.id));

export default function DealsPage() {
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => setCart(getCart()), []);

  function addToCart(dishId: string) {
    const next = { ...getCart(), [dishId]: (getCart()[dishId] || 0) + 1 };
    saveCart(next);
    setCart(next);
  }

  return (
    <>
      <FoodHeader />
      <main className="food-main info-page">
        <section className="info-page-heading">
          <span className="promo-pill"><Gift size={13} /> FRESH OFFERS</span>
          <h1>Good food. Better deals.</h1>
          <p>Explore featured offers from Sizzle&Smile. Pay securely on Paystack when you check out.</p>
        </section>
        <section className="deal-offer-grid" aria-label="Current offers">
          {offers.map((offer, index) => (
            <article className={`deal-offer${index === 0 ? " deal-offer-red" : ""}`} key={offer.label}>
              <span>{offer.label}</span><h2>{offer.title}</h2><p>{offer.detail}</p>
              <Link href={index === 0 ? "/delivery" : "#deal-dishes"}>
                {index === 0 ? "See delivery details" : "Browse featured deals"} <ArrowRight size={13} />
              </Link>
            </article>
          ))}
        </section>
        <section id="deal-dishes" className="info-deal-dishes">
          <div className="section-heading">
            <div><span className="food-kicker">HANDPICKED FOR YOU</span><h2>Featured dishes</h2><p>Choose an item to add it to your local demo cart.</p></div>
            <Link href="/restaurant">View restaurant menu →</Link>
          </div>
          <div className="deal-dish-grid">
            {dealDishes.map((dish) => (
              <article className="deal-dish-card" key={dish.id}>
                <img src={imageUrl(dish.photo)} alt={dish.name} />
                <div><small>{dish.category} · ★ {dish.rating}</small><h3>{dish.name}</h3><p>{dish.restaurant}</p><strong>{formatMoney(dish.price)}</strong>
                  <button type="button" onClick={() => addToCart(dish.id)}><Plus size={13} /> {cart[dish.id] ? `Add another (${cart[dish.id]})` : "Add to cart"}</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <FoodFooter />
    </>
  );
}
