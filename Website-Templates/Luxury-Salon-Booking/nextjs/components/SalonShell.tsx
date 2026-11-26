"use client";

import Link from "next/link";
import { clearSession } from "../lib/salonApi";

export function SalonHeader() {
  return <header className="salon-header"><div className="salon-header-inner">
    <Link className="salon-brand" href="/" aria-label="Lumière home"><span className="salon-brand-mark">L</span><span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span></Link>
    <nav className="salon-nav" aria-label="Main navigation"><Link href="/services">Services</Link><Link href="/stylists">Stylists</Link><Link href="/packages">Packages</Link><Link href="/reviews">Reviews <span className="salon-nav-rating">4.9</span></Link><div className="salon-nav-actions"><Link href="/dashboard">Dashboard</Link><Link className="salon-button salon-button-dark" href="/book">Book appointment</Link></div></nav>
  </div></header>;
}

export function SalonFooter() {
  return <footer className="salon-footer"><div className="salon-footer-main">
    <div className="salon-footer-brand"><Link className="salon-brand salon-brand-light" href="/"><span className="salon-brand-mark">L</span><span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span></Link><p>A modern sanctuary for hair, skin &amp; self. Your next beautiful ritual starts around the corner.</p></div>
    <div className="salon-footer-column"><h3>VISIT</h3><span>12 Mercer St, Soho</span><span>42 Berry Ave, Williamsburg</span><span>Open daily 9am — 8pm</span></div>
    <div className="salon-footer-column"><h3>EXPLORE</h3><Link href="/services">Services &amp; pricing</Link><Link href="/stylists">Meet the artists</Link><Link href="/packages">Packages</Link><Link href="/reviews">Reviews</Link><Link href="/book">Book an appointment</Link><Link href="/dashboard">Dashboard</Link></div>
  </div><div className="salon-footer-bottom"><span>© {new Date().getFullYear()} Lumière Salon &amp; Spa. All rights reserved.</span><span>Appointment requests are confirmed by the studio.</span></div></footer>;
}

export function PortalHeader({ title, name }: { title: string; name?: string }) {
  function signOut() {
    clearSession();
    window.location.assign("/");
  }
  return <header className="salon-portal-header"><Link className="salon-brand" href="/"><span className="salon-brand-mark">L</span><span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span></Link><span>{title}{name ? ` · ${name}` : ""}</span><button type="button" onClick={signOut}>Sign out</button></header>;
}
