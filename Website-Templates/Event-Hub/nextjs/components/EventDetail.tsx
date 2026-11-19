"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { eventHubApi, type EventItem } from "../lib/eventHubApi";
import { starterEvents } from "../lib/eventData";

export default function EventDetail({ slug }: { slug: string }) {
  const [event, setEvent] = useState<EventItem | null>(() => starterEvents.find((item) => item.slug === slug) || null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    eventHubApi.getEvent(slug)
      .then((result) => { if (active) setEvent(result.event); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load event details."); });
    return () => { active = false; };
  }, [slug]);

  if (!event) return <main className="narrow-page"><h1>Event not found</h1><p>{error || "This event may have been removed."}</p><Link href="/events">Browse events</Link></main>;
  return (
    <main className="detail-page">
      <div className="detail-cover" style={{ backgroundImage: `linear-gradient(90deg,rgba(8,13,28,.86),rgba(8,13,28,.12)),url("${event.image}")` }}>
        <div><span className="eyebrow">{event.category} · {event.date}</span><h1>{event.title}</h1><p>{event.location} · {event.time}</p><Link className="button button-primary" href={`/checkout/${event.slug}`}>Request tickets · from ${event.price}</Link></div>
      </div>
      {error && <p className="api-error detail-error">Showing the included event preview. {error}</p>}
      <section className="detail-content"><div><span className="eyebrow">ABOUT THIS EVENT</span><p>{event.description}</p><h2>Lineup</h2><p>{event.lineup}</p></div><aside><b>{event.date}</b><span>{event.time}</span><span>{event.location}</span><Link href={`/checkout/${event.slug}`}>Request tickets →</Link></aside></section>
    </main>
  );
}
