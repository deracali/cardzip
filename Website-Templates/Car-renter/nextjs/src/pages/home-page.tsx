"use client";

import { useState } from "react";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CreditCard, LockKeyhole, MapPin,
  ShieldCheck, Smartphone, Star, UserRound, WalletCards, Zap
} from "lucide-react";
import { BookingSummary, BookingSearch, Header, Logo, ReviewsSection, SiteFooter, VehicleGrid, AuthField } from "../components/Shared";
import { imageUrl } from "../data/vehicles";
import { useBookingDetails } from "../hooks/useBookingDetails";
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="live-eyebrow"><span className="status-dot" /> Now live in 14 zones · Avg delivery 32 min</span>
            <h1>Rent it. Move it.<br /><span>Delivered.</span></h1>
            <p>Sedans, SUVs and cargo vans with instant doorstep delivery. Real-time pricing, unlimited mileage options, logistics built-in.</p>
            <div className="hero-trust">
              <span className="avatar-stack" aria-hidden="true"><i /><i /><i /></span>
              <span><strong>4.9 <Star size={11} fill="currentColor" /></strong><small>12.4k trips</small></span>
              <span><ShieldCheck size={14} /> Insured · Verified drivers</span>
              <span><Smartphone size={14} /> Instant unlock</span>
            </div>
          </div>
          <div className="hero-visual">
            <img src={imageUrl('photo-1558981806-ec527fa84c39', 1400)} alt="Motorcycle ready for a night ride" />
            <div className="hero-image-shade" />
            <div className="delivery-card">
              <span className="delivery-icon"><Zap size={16} fill="currentColor" /></span>
              <span><strong>Doorstep delivery</strong><small>Active · 6 drivers nearby</small></span>
              <span className="starting-price">Starting at<strong>$48/day</strong></span>
            </div>
          </div>
          <BookingSearch />
        </section>

        <section className="fleet-section" id="fleet">
          <div className="section-heading">
            <div><p className="section-kicker">FLEET · 128 VEHICLES READY</p><h2>Pick your ride or hauler</h2></div>
            <a className="text-link" href="/fleet">Explore all vehicles <ArrowRight size={14} /></a>
          </div>
          <VehicleGrid limit={3} />
        </section>

        <section className="service-strip" id="locations">
          <div><span className="service-icon"><Zap size={18} /></span><strong>Instant doorstep delivery</strong><p>Skip the counter. Your ride comes to you.</p></div>
          <div><span className="service-icon"><ShieldCheck size={18} /></span><strong>Fully covered, always</strong><p>Every trip includes trusted protection.</p></div>
          <div><span className="service-icon"><Smartphone size={18} /></span><strong>Unlock and go</strong><p>Your phone is your key. No waiting.</p></div>
        </section>
        <ReviewsSection />
      </main>
      <SiteFooter />
    </>
  )
}
