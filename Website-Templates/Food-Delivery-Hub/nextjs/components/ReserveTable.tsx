"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { FoodFooter, FoodHeader } from "./FoodShell";

export default function ReserveTable() {
  const [confirmed, setConfirmed] = useState(false);
  const [time, setTime] = useState("7:00 PM");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmed(true);
  }
  return <><FoodHeader /><main className="reserve-page"><span className="food-kicker">FORNO ANTICO · GREENWICH VILLAGE</span><h1>{confirmed ? "Reservation request saved" : "Book a table"}</h1><p>This is a front-end reservation demo. It does not contact a restaurant.</p>{confirmed ? <section className="empty-orders"><h2>Your table request is ready</h2><p>{time} · No reservation was sent to a restaurant.</p><Link className="food-button" href="/">Back to Sizzle&Smile</Link></section> : <form className="checkout-form" onSubmit={submit}><label>Number of guests<select name="guests">{["1", "2", "3", "4", "5", "6", "7+"].map((n) => <option key={n}>{n}</option>)}</select></label><label>Date<input type="date" required min={new Date().toISOString().slice(0, 10)} /></label><fieldset><legend>Available time</legend>{["5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"].map((item) => <button className={time === item ? "selected" : ""} type="button" key={item} onClick={() => setTime(item)}>{item}</button>)}</fieldset><label>Name<input name="name" autoComplete="name" required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><button className="food-button">Save demo request</button></form>}</main><FoodFooter /></>;
}
