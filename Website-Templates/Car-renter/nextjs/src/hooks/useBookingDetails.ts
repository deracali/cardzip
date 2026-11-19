"use client";

import { useEffect, useState } from "react";
import { type Booking, type Vehicle } from "../data/vehicles";
import { apiRequest } from "../services/api";

type BookingDetails = Booking & { loading: boolean; loadError?: string };

const unavailableVehicle: Vehicle = {
  name: "No vehicle selected",
  category: "",
  label: "",
  price: 0,
  details: "",
  seats: 0,
  fuel: "",
  image: "",
};

const defaultBooking: BookingDetails = {
  vehicle: unavailableVehicle,
  pickup: "Downtown Hub â€” 44 Mercer St",
  dropoff: "Airport T2 â€” Doorstep",
  start: "",
  end: "",
  days: 1,
  coverage: true,
  loading: true,
};

export function useBookingDetails(): BookingDetails {
  const [booking, setBooking] = useState(defaultBooking);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const start = params.get("start") || "";
    const end = params.get("end") || "";
    const days =
      start && end
        ? Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
        : 1;

    apiRequest<{ vehicles: Vehicle[] }>("/vehicles")
      .then((result) => {
        const inventory = result.vehicles;
        if (!inventory.length) {
          setBooking({
            ...defaultBooking,
            pickup: params.get("pickup") || defaultBooking.pickup,
            dropoff: params.get("dropoff") || defaultBooking.dropoff,
            start,
            end,
            days,
            coverage: params.get("coverage") !== "false",
            loading: false,
            loadError: "No vehicles are currently available to book.",
          });
          return;
        }
        const vehicle = inventory.find((item) => item.name === params.get("vehicle")) ?? inventory[0];
        setBooking({
          vehicle,
          pickup: params.get("pickup") || defaultBooking.pickup,
          dropoff: params.get("dropoff") || defaultBooking.dropoff,
          start,
          end,
          days,
          coverage: params.get("coverage") !== "false",
          loading: false,
        });
      })
      .catch((error: unknown) => {
        console.error("Unable to load Voltigo booking vehicle:", error);
        setBooking({
          ...defaultBooking,
          pickup: params.get("pickup") || defaultBooking.pickup,
          dropoff: params.get("dropoff") || defaultBooking.dropoff,
          start,
          end,
          days,
          coverage: params.get("coverage") !== "false",
          loading: false,
          loadError: error instanceof Error ? error.message : "Unable to load the selected vehicle.",
        });
      });
  }, []);

  return booking;
}