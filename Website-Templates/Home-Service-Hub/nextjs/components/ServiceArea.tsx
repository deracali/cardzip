"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ServiceArea() {
  const [zip, setZip] = useState("");
  const [message, setMessage] = useState("");
  const [covered, setCovered] = useState(false);

  function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = /^\d{5}$/.test(zip);
    const prefix = Number(zip.slice(0, 3));
    const isCovered = valid && prefix >= 800 && prefix <= 803;
    setCovered(isCovered);
    setMessage(valid ? isCovered ? `${zip} is in our Denver metro service area.` : `We do not serve ${zip} yet. Call us and we will help find a solution.` : "Enter a valid five-digit ZIP code.");
  }

  return <main className="info-page"><section className="info-hero"><span className="eyebrow">DENVER METRO COVERAGE</span><h1>Local help, close to home.</h1><p>Our home service team currently covers Denver and nearby communities. Check a ZIP code below to see if your address is in our standard service area.</p><form className="coverage-form" onSubmit={check}><label htmlFor="coverage-zip">Your ZIP code</label><div><input id="coverage-zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="80202" /><button className="button button-orange">Check coverage</button></div>{message && <p className={covered ? "coverage-success" : "coverage-error"} role="status">{message}</p>}</form></section><section className="info-section coverage-details"><h2>Denver metro service area</h2><p>Our local technicians serve Denver and surrounding communities across ZIP code prefixes 800–803. Not sure whether you are in range? Call <a href="tel:+18005550199">(800) 555-0199</a> and our team will be happy to help.</p><Link className="button button-light" href="/book-now">Request service</Link></section><footer className="site-footer"><Link className="brand" href="/">FixFlow Pro</Link><span>Emergency availability depends on current technician capacity.</span></footer></main>;
}
