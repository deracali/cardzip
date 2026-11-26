"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { dishes, imageUrl } from "../lib/menu";
import { getCart, saveCart } from "../lib/foodApi";
import { formatMoney } from "../lib/money";
import { FoodFooter, FoodHeader } from "./FoodShell";

export default function RestaurantMenu() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [category, setCategory] = useState("All items");
  const categories = ["All items", ...new Set(dishes.filter((dish) => dish.restaurant.startsWith("Forno Antico")).map((dish) => dish.category))];

  useEffect(() => setCart(getCart()), []);
  const menu = useMemo(() => dishes.filter((dish) => dish.restaurant.startsWith("Forno Antico") && (category === "All items" || dish.category === category)), [category]);
  function change(id: string, amount: number) {
    const next = { ...cart };
    const quantity = Math.max(0, (next[id] || 0) + amount);
    if (quantity) next[id] = quantity;
    else delete next[id];
    setCart(next);
    saveCart(next);
  }
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => sum + (dishes.find((dish) => dish.id === id)?.price || 0) * qty, 0);

  return <><FoodHeader /><main className="food-main"><section className="restaurant-hero"><span className="food-kicker">GREENWICH VILLAGE · ITALIAN</span><h1>Forno Antico Trattoria</h1><p>Pizza · Pasta · 25-35 min · Open until 11 PM</p></section><section className="restaurant-content"><div className="restaurant-menu"><div className="food-filters">{categories.map((item) => <button type="button" className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>{menu.map((dish) => <article className="menu-row" key={dish.id}><img src={imageUrl(dish.photo, 280)} alt={dish.name} /><div><h2>{dish.name}</h2><p>{dish.description}</p><strong>{formatMoney(dish.price)}</strong></div><button type="button" onClick={() => change(dish.id, 1)}>Add{cart[dish.id] ? ` (${cart[dish.id]})` : ""}</button></article>)}</div><aside className="food-cart"><h2>Your cart · {count}</h2>{count ? <>{Object.entries(cart).map(([id, quantity]) => { const dish = dishes.find((item) => item.id === id); return dish ? <p key={id}>{quantity} × {dish.name}<b>{formatMoney(dish.price * quantity)}</b></p> : null; })}<div className="cart-total"><span>Estimated total</span><strong>{formatMoney(subtotal + 1.99)}</strong></div><Link className="food-button" href="/checkout">Proceed to checkout</Link></> : <p>Your cart is empty. Add a dish to get started.</p>}</aside></section></main><FoodFooter /></>;
}
