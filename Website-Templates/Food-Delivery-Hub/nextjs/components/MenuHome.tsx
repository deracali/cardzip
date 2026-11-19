"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { dishes, imageUrl } from "../lib/menu";
import { getCart, saveCart } from "../lib/foodApi";
import { FoodFooter, FoodHeader } from "./FoodShell";

function DishCard({ dish }: { dish: typeof dishes[number] }) {
  const [quantity, setQuantity] = useState(0);
  useEffect(() => setQuantity(getCart()[dish.id] || 0), [dish.id]);
  function update(amount: number) {
    const cart = getCart();
    const next = Math.max(0, (cart[dish.id] || 0) + amount);
    if (next) cart[dish.id] = next;
    else delete cart[dish.id];
    saveCart(cart);
    setQuantity(next);
  }
  return <article className="dish-card"><img src={imageUrl(dish.photo)} alt={dish.name} /><div><small>{dish.category} · ★ {dish.rating}</small><h3>{dish.name}</h3><p>{dish.restaurant}</p><div><strong>${dish.price.toFixed(2)}</strong><button type="button" onClick={() => update(1)}>{quantity ? `Add another (${quantity})` : "Add to cart"}</button></div></div></article>;
}

export default function MenuHome() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(dishes.map((dish) => dish.category))];
  const filtered = useMemo(() => dishes.filter((dish) => (category === "All" || dish.category === category)
    && `${dish.name} ${dish.restaurant} ${dish.category}`.toLowerCase().includes(search.toLowerCase())), [category, search]);

  return <><FoodHeader /><main className="food-main"><section className="food-hero"><span className="food-kicker">FREE DELIVERY ON FIRST 3 ORDERS</span><h1>Delicious food.<br />Delivered fast.</h1><p>Find neighborhood favorites, order a meal, and follow your delivery.</p><form className="food-search" onSubmit={(event) => { event.preventDefault(); document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" }); }}><input aria-label="Search food" placeholder="Search dishes or restaurants" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="food-button">Search</button></form></section><section id="featured" className="dish-section"><div className="section-heading"><div><span className="food-kicker">CURATED FOR YOU</span><h2>Featured dishes near you</h2></div><Link href="/restaurant">View restaurant menu →</Link></div><div className="food-filters">{categories.map((item) => <button className={category === item ? "active" : ""} type="button" key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="dish-grid">{filtered.map((dish) => <DishCard dish={dish} key={dish.id} />)}</div>{!filtered.length && <p>No dishes match your search.</p>}</section><section className="reservation-promo" id="deals"><div><span className="food-kicker">DINE-IN · PARTIES · DATE NIGHTS</span><h2>Planning a visit?</h2><p>Choose a time and seating preference for a table at Forno Antico.</p><Link className="food-button" href="/reserve">Reserve a table</Link></div><img src={imageUrl("photo-1414235077428-338989a2e8c0", 900)} alt="A candlelit restaurant dining room" /></section></main><FoodFooter /></>;
}
