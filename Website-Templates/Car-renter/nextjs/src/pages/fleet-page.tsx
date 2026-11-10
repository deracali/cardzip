"use client";

import { useState } from "react";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CreditCard, LockKeyhole, MapPin,
  ShieldCheck, Smartphone, Star, UserRound, WalletCards, Zap
} from "lucide-react";
import { BookingSummary, BookingSearch, Header, Logo, ReviewsSection, SiteFooter, VehicleGrid, AuthField } from "../components/Shared";
import { vehicles } from "../data/vehicles";
import { useBookingDetails } from "../hooks/useBookingDetails";
export default function FleetPage() {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Sedan', 'SUV', 'Cargo Van']
  const filteredVehicles = filter === 'All' ? vehicles : vehicles.filter((vehicle) => vehicle.category === filter)

  return (
    <>
      <Header compact />
      <main className="fleet-page">
        <div className="fleet-heading">
          <div><p className="section-kicker">FLEET · 128 VEHICLES READY</p><h1>Pick your ride or hauler</h1><p>Find a vehicle for every trip, delivered right to you.</p></div>
          <div className="filter-tabs" role="group" aria-label="Filter vehicles">
            {filters.map((item) => <button key={item} type="button" className={filter === item ? 'is-selected' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        <VehicleGrid vehiclesToShow={filteredVehicles} />
      </main>
      <ReviewsSection />
      <SiteFooter />
    </>
  )
}
