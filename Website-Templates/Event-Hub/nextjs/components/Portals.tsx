"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { eventHubApi, errorStatus, type Booking, type EventItem, type EventUser } from "../lib/eventHubApi";
import { SiteHeader } from "./SiteShell";

export function AttendeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<EventUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const session = await eventHubApi.currentUser();
        if (session.user.role !== "attendee") {
          router.replace(session.user.role === "admin" ? "/admin" : "/organizer/dashboard");
          return;
        }
        setUser(session.user);
        const result = await eventHubApi.myBookings();
        if (active) setBookings(result.bookings);
      } catch (requestError) {
        if (errorStatus(requestError) === 401) router.replace(`/login?next=${encodeURIComponent("/dashboard")}`);
        else if (active) setError(requestError instanceof Error ? requestError.message : "Could not load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  return <PortalFrame title={`Your bookings${user ? `, ${user.name.split(" ")[0]}` : ""}`} loading={loading} error={error}>
    {bookings.length ? bookings.map((booking) => <BookingRow booking={booking} key={booking._id} />) : !loading && <Empty text="Your booking requests will appear here." />}
  </PortalFrame>;
}

export function OrganizerDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<EventUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const session = await eventHubApi.currentUser();
        if (session.user.role !== "organizer") {
          router.replace(session.user.role === "admin" ? "/admin" : "/dashboard");
          return;
        }
        setUser(session.user);
        const [eventResult, bookingResult] = await Promise.all([eventHubApi.organizerEvents(), eventHubApi.organizerBookings()]);
        if (active) { setEvents(eventResult.events); setBookings(bookingResult.bookings); }
      } catch (requestError) {
        if (errorStatus(requestError) === 401) router.replace(`/login?next=${encodeURIComponent("/organizer/dashboard")}`);
        else if (active) setError(requestError instanceof Error ? requestError.message : "Could not load organizer data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  return <PortalFrame title={`Organizer studio${user ? `, ${user.name}` : ""}`} loading={loading} error={error}>
    {user?.organizerStatus !== "approved" && <p className="pending-note">Organizer application status: {user?.organizerStatus || "pending"}. Organizer tools open after admin approval.</p>}
    <section className="portal-panel"><h2>Events</h2>{events.length ? events.map((event) => <p key={event.slug}><b>{event.title}</b> · {event.date} · {event.published ? "Published" : "In review"}</p>) : !loading && <Empty text="No event listings are assigned to this account." />}</section>
    <section className="portal-panel"><h2>Booking activity</h2>{bookings.length ? bookings.map((booking) => <BookingRow booking={booking} key={booking._id} />) : !loading && <Empty text="Bookings for your events will appear here." />}</section>
  </PortalFrame>;
}

export function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<EventUser | null>(null);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<EventItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [organizers, setOrganizers] = useState<EventUser[]>([]);
  const [attendees, setAttendees] = useState<EventUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const session = await eventHubApi.currentUser();
        if (session.user.role !== "admin") {
          setError("Administrator access is required.");
          return;
        }
        setUser(session.user);
        const [summaryResult, eventResult, bookingResult, organizerResult, attendeeResult] = await Promise.all([
          eventHubApi.adminSummary(), eventHubApi.adminEvents(), eventHubApi.adminBookings(),
          eventHubApi.adminOrganizers(), eventHubApi.adminAttendees(),
        ]);
        if (active) {
          setSummary(summaryResult.metrics);
          setEvents(eventResult.events);
          setBookings(bookingResult.bookings);
          setOrganizers(organizerResult.organizers);
          setAttendees(attendeeResult.attendees);
        }
      } catch (requestError) {
        if (errorStatus(requestError) === 401) router.replace("/admin/login");
        else if (active) setError(requestError instanceof Error ? requestError.message : "Could not load the admin workspace.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  return <PortalFrame title={`Event operations${user ? ` · ${user.name}` : ""}`} loading={loading} error={error}>
    {!loading && !error && <>
      <div className="metrics">{Object.entries(summary).map(([label, value]) => <article key={label}><small>{label.replaceAll(/([A-Z])/g, " $1")}</small><strong>{value}</strong></article>)}</div>
      <section className="portal-panel"><h2>Events · {events.length}</h2>{events.map((event) => <p key={event.slug}><b>{event.title}</b> · {event.category} · {event.published ? "Published" : "Draft"}</p>)}</section>
      <section className="portal-panel"><h2>Booking requests · {bookings.length}</h2>{bookings.map((booking) => <BookingRow booking={booking} key={booking._id} />)}</section>
      <section className="portal-panel"><h2>Organizers · {organizers.length}</h2>{organizers.map((organizer) => <p key={organizer._id || organizer.id}>{organizer.name} · {organizer.email} · {organizer.organizerStatus}</p>)}</section>
      <section className="portal-panel"><h2>Attendees · {attendees.length}</h2>{attendees.map((attendee) => <p key={attendee._id || attendee.id}>{attendee.name} · {attendee.email}</p>)}</section>
    </>}
  </PortalFrame>;
}

function PortalFrame({ title, loading, error, children }: { title: string; loading: boolean; error: string; children: React.ReactNode }) {
  const [signoutError, setSignoutError] = useState("");
  async function signOut() {
    try {
      await eventHubApi.logout();
      window.location.assign("/");
    } catch (requestError) {
      setSignoutError(requestError instanceof Error ? requestError.message : "Could not sign out.");
    }
  }
  return <main className="portal-page"><SiteHeader /><section className="portal-content"><span className="eyebrow">SECURE PULSELIVE ACCOUNT</span><h1>{title}</h1><div className="portal-actions"><Link href="/events">Explore events</Link><button type="button" onClick={signOut}>Sign out</button></div>{(error || signoutError) && <p className="api-error" role="alert">{error || signoutError}</p>}{loading ? <p>Loading secure account data...</p> : children}</section></main>;
}

function BookingRow({ booking }: { booking: Booking }) {
  return <article className="booking-row"><div><b>{booking.eventTitle}</b><small>{booking.reference} · {booking.ticketType} × {booking.quantity} · {new Date(booking.createdAt).toLocaleDateString()}</small>{booking.attendeeEmail && <small>{booking.attendeeName} · {booking.attendeeEmail}</small>}</div><span>{booking.status} · ${Number(booking.total).toFixed(2)}</span></article>;
}

function Empty({ text }: { text: string }) {
  return <p>{text}</p>;
}
