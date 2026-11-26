"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, type HomeSession } from "../lib/homeServiceApi";

export default function SiteHeader() {
  const [session, setSession] = useState<HomeSession | null>(null);
  useEffect(() => {
    const syncSession = () => setSession(getSession());
    syncSession();
    window.addEventListener("fixflow-session-change", syncSession);
    return () => window.removeEventListener("fixflow-session-change", syncSession);
  }, []);
  const dashboardHref = session?.user.role === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">F</span>
        <span>FixFlow Pro<small>PLUMBING · HVAC · REPAIR</small></span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/services">Services</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/service-area">Service area</Link>
        <Link className="button button-orange" href={session ? dashboardHref : "/login"}>{session ? "Dashboard" : "Sign in"}</Link>
        <Link className="button button-orange" href="/book-now">Request service</Link>
      </nav>
    </header>
  );
}
