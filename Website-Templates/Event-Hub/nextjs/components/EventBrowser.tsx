"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { eventHubApi, type EventItem } from "../lib/eventHubApi";
import { starterEvents, withEventFallback } from "../lib/eventData";

const categories = ["All Events", "Concert", "Festival", "Conference", "Workshop"];

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="event-card">
      <Link className="event-image" href={`/events/${event.slug}`}>
        <img src={event.image || "/event-placeholder.svg"} alt="" onError={(error) => { error.currentTarget.src = "/event-placeholder.svg"; }} />
        <span>{event.tag}</span><b>{event.date}</b>
      </Link>
      <div className="event-card-body">
        <small>{event.category} · {event.time}</small>
        <h2><Link href={`/events/${event.slug}`}>{event.title}</Link></h2>
        <p>{event.location}</p>
        <div><strong>From ${event.price}</strong><Link href={`/events/${event.slug}`}>View event →</Link></div>
      </div>
    </article>
  );
}

export default function EventBrowser({ compact = false }: { compact?: boolean }) {
  const [events, setEvents] = useState(starterEvents);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All Events");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    eventHubApi.listEvents()
      .then((result) => { if (active && result.events.length) setEvents(result.events.map(withEventFallback)); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load events."); });
    return () => { active = false; };
  }, []);

  const shown = useMemo(() => events.filter((event) => {
    const categoryMatches = category === "All Events" || category === event.category;
    const query = search.trim().toLowerCase();
    return categoryMatches && (!query || `${event.title} ${event.location} ${event.category}`.toLowerCase().includes(query));
  }), [category, events, search]);

  return (
    <section className="event-browser">
      {!compact && <div className="event-filters">
        <input aria-label="Search events" placeholder="Search events or locations" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div>{categories.map((item) => <button className={category === item ? "selected" : ""} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div>
      </div>}
      {error && <p className="api-error" role="status">Showing the included event preview. {error}</p>}
      <div className="event-grid">{shown.slice(0, compact ? 3 : undefined).map((event) => <EventCard event={event} key={event.slug} />)}</div>
      {!shown.length && <p>No events match those filters.</p>}
    </section>
  );
}
