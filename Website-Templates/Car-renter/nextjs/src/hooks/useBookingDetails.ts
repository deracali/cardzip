"use client";

import { useEffect, useState } from "react";
import { vehicles, type Booking } from "../data/vehicles";

const defaultBooking: Booking = {
  vehicle: vehicles[0],
  pickup: "Downtown Hub â€” 44 Mercer St",
  dropoff: "Airport T2 â€” Doorstep",
  start: "",
  end: "",
  days: 1,
  coverage: true,
};

export function useBookingDetails(): Booking {
  const [booking, setBooking] = useState(defaultBooking);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vehicle = vehicles.find((item) => item.name === params.get("vehicle")) ?? vehicles[0];
    const start = params.get("start") || "";
    const end = params.get("end") || "";
    const days =
      start && end
        ? Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
        : 1;

    setBooking({
      vehicle,
      pickup: params.get("pickup") || defaultBooking.pickup,
      dropoff: params.get("dropoff") || defaultBooking.dropoff,
      start,
      end,
      days,
      coverage: params.get("coverage") !== "false",
    });
  }, []);

  return booking;
}