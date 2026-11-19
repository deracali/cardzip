"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CarFront, LogOut, MapPin } from "lucide-react";
import { Logo } from "../components/Shared";
import { ApiError, apiRequest } from "../services/api";
import "../admin.css";

type User = { id: string; name: string; email: string; role: string };
type Booking = { id: string; vehicleName: string; vehicleCategory: string; pickup: string; dropoff: string; start: string; end: string; total: number; status: string };

export default function ClientDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      let userData: { user: User | null };
      try {
        userData = await apiRequest<{ user: User | null }>("/auth/me");
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          window.location.href = "/login?next=%2Fdashboard";
          return;
        }
        throw requestError;
      }
      if (!userData.user) {
        window.location.href = "/login?next=%2Fdashboard";
        return;
      }
      if (userData.user.role === "admin") {
        window.location.href = "/admin";
        return;
      }
      const bookingData = await apiRequest<{ bookings: Booking[] }>("/bookings");
      setUser(userData.user);
      setBookings(bookingData.bookings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function signOut() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign out.");
    }
  }

  if (loading) return <div className="portal-loading">Loading your trips…</div>;
  return <div className="portal-shell"><div className="portal-layout">
    <aside className="portal-sidebar"><Logo /><div><p className="portal-sidebar-label">MY ACCOUNT</p><nav className="portal-nav"><button className="is-active" type="button"><CarFront size={16} /> My trips</button><a href="/fleet"><ArrowRight size={16} /> Browse fleet</a></nav></div>
      <div className="portal-sidebar-foot"><a className="portal-signout" href="/">Return to website</a><button type="button" className="portal-signout" onClick={signOut}><LogOut size={15} /> Sign out</button></div>
    </aside>
    <main className="portal-main"><header className="portal-topbar"><div className="portal-topbar-copy"><span>Renter account</span><strong>Your Voltigo dashboard</strong></div><span className="portal-user-chip"><span className="portal-avatar">{user?.name.charAt(0) || "R"}</span>{user?.name}</span></header>
      <div className="portal-content">{error && <p className="portal-alert" role="alert">{error}</p>}
        <div className="portal-heading"><div><span className="portal-eyebrow">YOUR ACCOUNT</span><h1>Welcome back, {user?.name.split(" ")[0]}</h1><p>Keep track of your upcoming rides and past reservations.</p></div><a className="portal-primary" href="/fleet">Find a vehicle <ArrowRight size={15} /></a></div>
        <div className="portal-cards"><div className="portal-stat"><span className="portal-stat-top">Total trips <span className="portal-stat-icon"><CarFront size={17} /></span></span><strong>{bookings.length}</strong><small>Reservations made with Voltigo</small></div><div className="portal-stat"><span className="portal-stat-top">Upcoming <span className="portal-stat-icon"><CalendarDays size={17} /></span></span><strong>{bookings.filter((booking) => ["pending", "confirmed"].includes(booking.status)).length}</strong><small>Pending and confirmed trips</small></div><div className="portal-stat"><span className="portal-stat-top">Trip spend <span className="portal-stat-icon"><MapPin size={17} /></span></span><strong>${bookings.filter((booking) => booking.status !== "cancelled").reduce((sum, booking) => sum + booking.total, 0).toLocaleString()}</strong><small>Across non-cancelled trips</small></div><div className="portal-stat"><span className="portal-stat-top">Account <span className="portal-stat-icon"><LogOut size={17} /></span></span><strong>Active</strong><small>{user?.email}</small></div></div>
        <div className="portal-heading"><div><h2>My reservations</h2><p>Your reservation status is updated by the Voltigo team.</p></div></div>
        {!bookings.length ? <section className="portal-panel portal-empty">Your trip history is empty. Choose a vehicle to book your first ride.</section> : <div className="portal-booking-grid">{bookings.map((booking) => <article className="portal-panel portal-booking-card" key={booking.id}><div className="portal-booking-card-top"><div><h3>{booking.vehicleName}</h3><p>{booking.vehicleCategory} · ${booking.total} total</p></div><span className={`portal-status ${booking.status}`}>{booking.status}</span></div><div className="portal-booking-details"><span><strong>Pickup</strong>{booking.pickup}</span><span><strong>Return</strong>{booking.dropoff}</span><span><strong>Start</strong>{new Date(booking.start).toLocaleString()}</span><span><strong>End</strong>{new Date(booking.end).toLocaleString()}</span></div></article>)}</div>}
      </div>
    </main>
  </div></div>;
}
