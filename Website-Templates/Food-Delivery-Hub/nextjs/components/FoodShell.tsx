"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, getSession } from "../lib/foodApi";

export function FoodHeader() {
  const [count, setCount] = useState(0);
  const [accountPath, setAccountPath] = useState("/login");

  useEffect(() => {
    const update = () => setCount(Object.values(getCart()).reduce((sum, qty) => sum + qty, 0));
    const session = getSession();
    setAccountPath(session?.user.role === "admin" ? "/admin" : session?.user.role === "client" ? "/dashboard" : "/login");
    update();
    window.addEventListener("food-cart-change", update);
    return () => window.removeEventListener("food-cart-change", update);
  }, []);

  return <header className="food-header"><Link className="food-brand" href="/">Sizzle<span>&</span>Smile</Link><nav><Link href="/">Menu</Link><Link href="/reserve">Reserve table</Link><a href="/#deals">Deals</a><Link href="/track">Track order</Link><Link href="/restaurant">Cart {count ? `(${count})` : ""}</Link><Link className="food-account-link" href={accountPath}>{accountPath === "/login" ? "Sign in" : "My account"}</Link><Link className="food-order-link" href="/restaurant">Order now</Link></nav></header>;
}

export function FoodFooter() {
  return <footer className="food-footer"><Link className="food-brand" href="/">Sizzle<span>&</span>Smile</Link><p>Hot food, fast delivery, a happy belly.</p><nav><Link href="/reserve">Reservations</Link><Link href="/track">Track order</Link><Link href="/admin/login">Admin portal</Link></nav><small>© 2026 Sizzle&Smile Foods Inc. Demo checkout does not process payments.</small></footer>;
}
