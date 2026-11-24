"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Compass, LayoutDashboard, LogOut, MapPin, ShieldCheck, Ticket } from "lucide-react";
import { eventHubApi, errorStatus, type Booking, type EventItem, type EventUser } from "../lib/eventHubApi";
import { starterEvents, withEventFallback } from "../lib/eventData";
import { SiteHeader } from "./SiteShell";
import dashboardStyles from "./AttendeeDashboard.module.css";

export function AttendeeDashboard({ section = "overview" }: { section?: "overview" | "tickets" | "profile" }) {
  const router = useRouter();
  const [user, setUser] = useState<EventUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [signoutError, setSignoutError] = useState("");

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
        if (errorStatus(requestError) === 401) router.replace(`/login?next=${encodeURIComponent(section === "profile" ? "/dashboard/profile" : "/dashboard/tickets")}`);
        else if (active) setError(requestError instanceof Error ? requestError.message : "Could not load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router, section]);

  async function signOut() {
    try {
      await eventHubApi.logout();
      window.location.assign("/");
    } catch (requestError) {
      setSignoutError(requestError instanceof Error ? requestError.message : "Could not sign out.");
    }
  }

  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed");
  const ticketCount = bookings.reduce((total, booking) => total + Number(booking.quantity || 0), 0);
  const nextEvent = starterEvents.find((event) => !bookings.some((booking) => booking.eventSlug === event.slug && booking.status === "confirmed")) || starterEvents[0];
  const visibleBookings = section === "overview" ? bookings.slice(0, 3) : bookings;

  if (loading) return <div className={dashboardStyles.loading}><span />Loading your PulseLive account…</div>;
  return <main className={dashboardStyles.page}>
    <aside className={dashboardStyles.sidebar}>
      <Link className={dashboardStyles.brand} href="/"><span><Ticket size={18} /></span><strong>Pulse<span>Live</span></strong></Link>
      <small className={dashboardStyles.sidebarLabel}>YOUR ACCOUNT</small>
      <nav className={dashboardStyles.nav} aria-label="Attendee dashboard navigation">
        <Link className={section === "overview" ? dashboardStyles.activeNav : undefined} href="/dashboard"><LayoutDashboard size={17} />Overview</Link>
        <Link className={section === "tickets" ? dashboardStyles.activeNav : undefined} href="/dashboard/tickets"><Ticket size={17} />My tickets</Link>
        <Link className={section === "profile" ? dashboardStyles.activeNav : undefined} href="/dashboard/profile"><ShieldCheck size={17} />Profile</Link>
        <Link href="/events"><Compass size={17} />Explore events</Link>
      </nav>
      <div className={dashboardStyles.sidebarBottom}>
        <div className={dashboardStyles.privacy}><ShieldCheck size={17} /><strong>Your account, protected</strong><small>Booking and ticket details are loaded securely.</small></div>
        <button type="button" onClick={signOut}><LogOut size={15} />Sign out</button>
      </div>
    </aside>
    <div className={dashboardStyles.workspace}>
      <header className={dashboardStyles.topbar}>
        <div><small>ATTENDEE ACCOUNT</small><strong>{section === "tickets" ? "My tickets" : section === "profile" ? "Account profile" : "My PulseLive"}</strong></div>
        <div className={dashboardStyles.topbarActions}><span><i />Connected</span><strong><i>{user?.name?.slice(0, 1)?.toUpperCase() || "P"}</i>{user?.name || "PulseLive attendee"}</strong></div>
      </header>
      <section className={dashboardStyles.content}>
        <div className={dashboardStyles.welcome}>
          <div><span>THE GOOD TIMES, ALL IN ONE PLACE</span><h1>{section === "tickets" ? "Your ticket wallet." : section === "profile" ? "Your account details." : `Your next moments${user ? `, ${user.name.split(" ")[0]}` : ""}.`}</h1><p>{section === "tickets" ? "View booking status, ticket quantities, and event details in one place." : section === "profile" ? "Review the account details connected to your PulseLive access." : "Your tickets, booking updates, and next favorite event—all together."}</p></div>
          <Link className={dashboardStyles.primaryAction} href="/events">Discover events<ArrowRight size={15} /></Link>
        </div>
        {(error || signoutError) && <p className={dashboardStyles.error} role="alert">{error || signoutError}</p>}
        {section === "overview" && <section className={dashboardStyles.stats} aria-label="Ticket summary">
          <article><span><Ticket size={18} /></span><div><small>Total tickets</small><strong>{ticketCount}</strong><em>Across all bookings</em></div></article>
          <article><span className={dashboardStyles.green}><CheckCircle2 size={18} /></span><div><small>Confirmed bookings</small><strong>{confirmedBookings.length}</strong><em>Ready for event day</em></div></article>
          <article><span className={dashboardStyles.blue}><CalendarDays size={18} /></span><div><small>Booking requests</small><strong>{bookings.length}</strong><em>Your event plans</em></div></article>
        </section>}
        <div className={dashboardStyles.dashboardGrid}>
          <div>
            {(section === "overview" || section === "tickets") && <section className={dashboardStyles.panel} id="bookings">
              <div className={dashboardStyles.panelHeading}><div><small>BOOKING ACTIVITY · {bookings.length}</small><h2>{section === "tickets" ? "My tickets" : "Your bookings"}</h2><p>Everything you need for your upcoming experiences.</p></div><Ticket size={19} /></div>
              {visibleBookings.length ? <div className={dashboardStyles.bookingList}>{visibleBookings.map((booking) => <AttendeeBooking booking={booking} key={booking._id} />)}</div> : <div className={dashboardStyles.empty}><Ticket size={22} /><strong>Your ticket wallet is ready</strong><small>Once you book an event, your ticket details will appear here.</small><Link href="/events">Explore events<ArrowRight size={14} /></Link></div>}
              {section === "overview" && bookings.length > visibleBookings.length && <Link className={dashboardStyles.viewAll} href="/dashboard/tickets">View all tickets<ArrowRight size={14} /></Link>}
            </section>}
            {section === "profile" && <section className={dashboardStyles.panel}><div className={dashboardStyles.panelHeading}><div><small>PROFILE</small><h2>Account details</h2><p>Your registered PulseLive identity and account type.</p></div><ShieldCheck size={19} /></div><div className={dashboardStyles.profileDetails}><span>Full name</span><strong>{user?.name || "PulseLive attendee"}</strong><span>Email address</span><strong>{user?.email || "Not available"}</strong><span>Account type</span><strong>Attendee</strong></div></section>}
          </div>
          <aside className={dashboardStyles.sideColumn}>
            {section !== "profile" && <section className={dashboardStyles.featured}>
              <img src={nextEvent.image || "/event-placeholder.svg"} alt="" onError={(image) => { image.currentTarget.src = "/event-placeholder.svg"; }} />
              <div><span>YOUR NEXT GREAT NIGHT</span><h2>{nextEvent.title}</h2><p><CalendarDays size={14} />{nextEvent.date}</p><p><MapPin size={14} />{nextEvent.location}</p><Link href={`/events/${nextEvent.slug}`}>Discover event<ArrowRight size={14} /></Link></div>
            </section>}
            <Link className={dashboardStyles.helpCard} href="/about"><span><ShieldCheck size={16} /></span><div><strong>Need a hand?</strong><small>Get help planning your next event.</small></div><ArrowRight size={15} /></Link>
          </aside>
        </div>
        <footer className={dashboardStyles.footer}><span>PulseLive · Live moments, together</span><Link href="/events">Explore more events</Link></footer>
      </section>
    </div>
  </main>;
}

function AttendeeBooking({ booking }: { booking: Booking }) {
  const event = withEventFallback(starterEvents.find((item) => item.slug === booking.eventSlug) || {
    slug: booking.eventSlug || "",
    title: booking.eventTitle,
    category: "Event",
    date: booking.createdAt,
    time: "",
    location: "",
    price: 0,
    image: "",
    description: "",
    lineup: "",
    tag: "",
  });
  return <article className={dashboardStyles.booking}>
    <img src={event.image || "/event-placeholder.svg"} alt="" onError={(image) => { image.currentTarget.src = "/event-placeholder.svg"; }} />
    <div><small>{booking.ticketType} · {booking.quantity} {booking.quantity === 1 ? "ticket" : "tickets"}</small><strong>{booking.eventTitle}</strong><span><CalendarDays size={13} />{event.date}</span></div>
    <div className={dashboardStyles.bookingStatus}><em className={booking.status === "confirmed" ? dashboardStyles.confirmed : dashboardStyles.pending}>{booking.status === "confirmed" ? "Confirmed" : "Awaiting confirmation"}</em><strong>${Number(booking.total).toFixed(2)}</strong><small>{booking.paymentStatus === "paid" ? "Payment complete" : "Booking reference"} · {booking.reference}</small></div>
  </article>;
}

export function OrganizerDashboard({ section = "overview" }: { section?: "overview" | "events" | "bookings" | "profile" }) {
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
        if (errorStatus(requestError) === 401) router.replace(`/login?next=${encodeURIComponent(section === "overview" ? "/organizer/dashboard" : `/organizer/dashboard/${section}`)}`);
        else if (active) setError(requestError instanceof Error ? requestError.message : "Could not load organizer data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router, section]);

  return <PortalFrame title={`Organizer studio${user ? `, ${user.name}` : ""}`} loading={loading} error={error}>
    <nav className="portal-tabs" aria-label="Organizer workspace navigation">
      <Link className={section === "overview" ? "is-active" : ""} href="/organizer/dashboard">Overview</Link>
      <Link className={section === "events" ? "is-active" : ""} href="/organizer/dashboard/events">My events</Link>
      <Link className={section === "bookings" ? "is-active" : ""} href="/organizer/dashboard/bookings">Booking activity</Link>
      <Link className={section === "profile" ? "is-active" : ""} href="/organizer/dashboard/profile">Profile</Link>
    </nav>
    {user?.organizerStatus !== "approved" && <p className="pending-note">Organizer application status: {user?.organizerStatus || "pending"}. Organizer tools open after admin approval.</p>}
    {(section === "overview" || section === "events") && <section className="portal-panel"><h2>Events</h2>{events.length ? events.map((event) => <p key={event.slug}><b>{event.title}</b> · {event.date} · {event.published ? "Published" : "In review"}</p>) : !loading && <Empty text="No event listings are assigned to this account." />}</section>}
    {(section === "overview" || section === "bookings") && <section className="portal-panel"><h2>Booking activity</h2>{bookings.length ? bookings.map((booking) => <BookingRow booking={booking} key={booking._id} />) : !loading && <Empty text="Bookings for your events will appear here." />}</section>}
    {section === "profile" && <section className="portal-panel"><h2>Account profile</h2><p><b>Name:</b> {user?.name || "Organizer"}</p><p><b>Email:</b> {user?.email || "Not available"}</p><p><b>Application status:</b> {user?.organizerStatus || "Pending review"}</p></section>}
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
