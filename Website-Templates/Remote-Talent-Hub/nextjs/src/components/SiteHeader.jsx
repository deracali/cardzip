"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export default function SiteHeader({ active = "" }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="top-nav wrap">
        <Link className="brand" href="/" aria-label="Remote.ly home">
          <span className="brand-icon"><img src="/favicon.svg" alt="" /></span>
          <strong>Remote<span>.ly</span></strong>
        </Link>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`nav-links${open ? " nav-open" : ""}`} aria-label="Main navigation">
          <Link className={active === "jobs" ? "active" : ""} href="/jobs" onClick={() => setOpen(false)}>Find Jobs</Link>
          <Link className={active === "talent" ? "active" : ""} href="/talent" onClick={() => setOpen(false)}>Browse Talent</Link>
          <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link className={active === "post" ? "active" : ""} href="/post-job" onClick={() => setOpen(false)}>Post a Job</Link>
          <Link className={active === "pricing" ? "active" : ""} href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <span className="nav-spacer" />
          <Link href="/login">Sign in</Link>
          <Link className="button button-purple nav-cta" href="/post-job">Post a Job <ArrowRight size={14} /></Link>
        </nav>
      </div>
    </header>
  );
}
