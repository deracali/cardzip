"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CreditCard, LockKeyhole, MapPin,
  ShieldCheck, Smartphone, Star, UserRound, WalletCards, Zap
} from "lucide-react";
import { Header, ReviewsSection, SiteFooter, VehicleGrid } from "../components/Shared";
import { type Vehicle } from "../data/vehicles";
import { apiRequest } from "../services/api";
type FleetService = "all" | "delivery" | "long-term";

export default function FleetPage({ service = "all" }: { service?: FleetService }) {
  const [filter, setFilter] = useState('All')
  const [inventory, setInventory] = useState<Vehicle[]>([])
  const [loadError, setLoadError] = useState("")
  const [loading, setLoading] = useState(true)
  const serviceVehicles = service === "delivery"
    ? inventory.filter((vehicle) => vehicle.category.toLowerCase().includes("van"))
    : service === "long-term"
      ? inventory.filter((vehicle) => !vehicle.category.toLowerCase().includes("van"))
      : inventory
  const filters = service === "delivery"
    ? ['All', ...new Set(serviceVehicles.map((vehicle) => vehicle.category))]
    : service === "long-term"
      ? ['All', ...new Set(serviceVehicles.map((vehicle) => vehicle.category))]
      : ['All', 'Sedan', 'SUV', 'Cargo Van']
  useEffect(() => {
    apiRequest<{ vehicles: Vehicle[] }>("/vehicles")
      .then((result) => {
        setInventory(result.vehicles)
      })
      .catch((error: unknown) => {
        console.error("Unable to load Voltigo fleet:", error);
        setLoadError(error instanceof Error ? error.message : "Unable to load the fleet.");
      })
      .finally(() => {
        setLoading(false)
      });
  }, []);
  const filteredVehicles = filter === 'All' ? serviceVehicles : serviceVehicles.filter((vehicle) => vehicle.category === filter)
  const pageCopy = {
    all: { eyebrow: "FLEET · VEHICLES READY", title: "Pick your ride or hauler", description: "Find a vehicle for every trip, delivered right to you." },
    delivery: { eyebrow: "DELIVERY FLEET", title: "Vehicles for your deliveries", description: "Browse cargo vans equipped for local deliveries and moving." },
    "long-term": { eyebrow: "LONG-TERM RENTAL", title: "A vehicle for the longer drive", description: "Explore sedans and SUVs suited to extended rentals." },
  }[service]

  return (
    <>
      <Header compact />
      <main className="fleet-page">
        <div className="fleet-heading">
          <div><p className="section-kicker">{pageCopy.eyebrow}</p><h1>{pageCopy.title}</h1><p>{pageCopy.description}</p></div>
          <div className="filter-tabs" role="group" aria-label="Filter vehicles">
            {filters.map((item) => <button key={item} type="button" className={filter === item ? 'is-selected' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        {loading ? <p className="portal-empty">Loading available vehicles…</p> : loadError ? <p className="portal-alert" role="alert">{loadError}</p> : <VehicleGrid vehiclesToShow={filteredVehicles} />}
      </main>
      <ReviewsSection />
      <SiteFooter />
    </>
  )
}
