"use client";

import { useEffect, useState } from "react";
import { eventHubApi, type EventItem } from "../lib/eventHubApi";
import { starterEvents } from "../lib/eventData";
import BookingForm from "./BookingForm";

export default function EventCheckout({ slug }: { slug: string }) {
  const [event, setEvent] = useState<EventItem | null>(() => starterEvents.find((item) => item.slug === slug) || null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    eventHubApi.getEvent(slug)
      .then((result) => { if (active) setEvent(result.event); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this event."); });
    return () => { active = false; };
  }, [slug]);

  if (!event) return <main className="narrow-page"><p>{error || "Loading event..."}</p></main>;
  return <main className="booking-page"><BookingForm event={event} />{error && <p className="api-error">{error}</p>}</main>;
}
