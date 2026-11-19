"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CarFront, CircleDollarSign, ClipboardList, LayoutDashboard, LogOut, Plus, Users } from "lucide-react";
import { Logo } from "../components/Shared";
import { ApiError, apiRequest } from "../services/api";
import "../admin.css";

type User = { id: string; name: string; email: string; role: "admin" | "renter" };
type Vehicle = { id: string; name: string; category: string; price: number; seats: number; fuel: string; details: string; image: string; label: string };
type Booking = { id: string; customerName: string; customerEmail: string; vehicleName: string; vehicleCategory: string; pickup: string; dropoff: string; start: string; end: string; total: number; status: string };
type Summary = { metrics: { revenue: number; reservations: number; activeVehicles: number; customers: number; pending: number }; customers: { id: string; name: string; email: string; createdAt: string }[] };
type Section = "Overview" | "Bookings" | "Fleet" | "Customers";

export default function AdminPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section>("Overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingVehicle, setAddingVehicle] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const userData = await apiRequest<{ user: User | null }>("/auth/me");
      if (!userData.user || userData.user.role !== "admin") {
        window.location.href = "/admin/login";
        return;
      }
      const [bookingData, vehicleData, summaryData] = await Promise.all([
        apiRequest<{ bookings: Booking[] }>("/bookings"),
        apiRequest<{ vehicles: Vehicle[] }>("/vehicles"),
        apiRequest<Summary>("/admin/summary"),
      ]);
      setUser(userData.user);
      setBookings(bookingData.bookings);
      setFleet(vehicleData.vehicles);
      setSummary(summaryData);
      setError("");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      setError(requestError instanceof Error ? requestError.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  async function updateStatus(id: string, status: string) {
    try {
      await apiRequest(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update reservation.");
    }
  }

  async function addVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const imageFile = form.get("imageFile");
      if (!(imageFile instanceof File)) throw new Error("Choose a vehicle photo to upload.");
      const imageForm = new FormData();
      imageForm.append("file", imageFile);
      const uploadedImage = await apiRequest<{ url: string }>("/vehicles/upload", {
        method: "POST",
        body: imageForm,
      });
      await apiRequest("/vehicles", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          category: form.get("category"),
          price: form.get("price"),
          seats: form.get("seats"),
          fuel: form.get("fuel"),
          details: form.get("details"),
          image: uploadedImage.url,
        }),
      });
      setAddingVehicle(false);
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to add vehicle.");
    }
  }

  async function removeVehicle(id: string) {
    if (!window.confirm("Remove this vehicle from the public fleet? Existing reservations will remain in the records.")) return;
    try {
      await apiRequest(`/vehicles/${id}`, { method: "DELETE" });
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to remove vehicle.");
    }
  }

  async function signOut() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign out.");
    }
  }

  if (loading) return <div className="portal-loading">Loading your workspace…</div>;
  const metrics = summary?.metrics;

  return (
    <div className="portal-shell">
      <div className="portal-layout">
        <aside className="portal-sidebar">
          <Logo />
          <div>
            <p className="portal-sidebar-label">WORKSPACE</p>
            <nav className="portal-nav" aria-label="Admin pages">
              {([
                ["Overview", LayoutDashboard],
                ["Bookings", ClipboardList],
                ["Fleet", CarFront],
                ["Customers", Users],
              ] as const).map(([name, Icon]) => (
                <button key={name} type="button" className={section === name ? "is-active" : ""} onClick={() => setSection(name)}>
                  <Icon size={16} />{name}
                  {name === "Bookings" && metrics?.pending ? <span className="portal-nav-count">{metrics.pending}</span> : null}
                </button>
              ))}
            </nav>
          </div>
          <div className="portal-sidebar-foot">
            <a className="portal-signout" href="/" aria-label="Return to the public website"><ArrowRight size={15} /> View website</a>
            <button type="button" className="portal-signout" onClick={signOut}><LogOut size={15} /> Sign out</button>
          </div>
        </aside>
        <main className="portal-main">
          <header className="portal-topbar">
            <div className="portal-topbar-copy"><span>Voltigo operations</span><strong>Fleet administration</strong></div>
            <div className="portal-topbar-actions"><span className="portal-user-chip"><span className="portal-avatar">{user?.name.charAt(0) || "A"}</span>{user?.name}</span></div>
          </header>
          <div className="portal-content">
            {error && <p className="portal-alert" role="alert">{error}</p>}
            <div className="portal-heading">
              <div><span className="portal-eyebrow">ADMIN WORKSPACE</span><h1>{section}</h1><p>Manage your rental operation and keep every trip moving.</p></div>
              {section === "Fleet" && <button className="portal-primary" type="button" onClick={() => setAddingVehicle((open) => !open)}><Plus size={15} /> Add vehicle</button>}
            </div>
            {section === "Overview" && (
              <>
                <div className="portal-cards">
                  <Stat icon={<CircleDollarSign size={17} />} label="Booked revenue" value={`$${(metrics?.revenue || 0).toLocaleString()}`} detail="From all non-cancelled reservations" />
                  <Stat icon={<ClipboardList size={17} />} label="Reservations" value={metrics?.reservations || 0} detail={`${metrics?.pending || 0} waiting for review`} />
                  <Stat icon={<CarFront size={17} />} label="Active vehicles" value={metrics?.activeVehicles || 0} detail="Listed and bookable" />
                  <Stat icon={<Users size={17} />} label="Renter accounts" value={metrics?.customers || 0} detail="Registered customers" />
                </div>
                <BookingTable bookings={bookings.slice(0, 6)} onStatusChange={updateStatus} />
              </>
            )}
            {section === "Bookings" && <BookingTable bookings={bookings} onStatusChange={updateStatus} />}
            {section === "Fleet" && (
              <>
                {addingVehicle && <div className="portal-panel">
                  <div className="portal-panel-head"><h2>Add a vehicle</h2></div>
                  <form onSubmit={addVehicle}>
                    <div className="portal-form-grid">
                      <Field label="Vehicle name" name="name" placeholder="Summit Touring SUV" />
                      <Field label="Category" name="category" placeholder="SUV" />
                      <Field label="Daily rate ($)" name="price" type="number" placeholder="89" />
                      <Field label="Seats" name="seats" type="number" placeholder="5" />
                      <Field label="Fuel / transmission" name="fuel" placeholder="Hybrid · Auto" />
                      <Field label="Details" name="details" placeholder="2025 · Hybrid · Airport ready" />
                      <Field label="Vehicle photo (JPEG, PNG, WebP, AVIF; max 10 MB)" name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
                    </div>
                    <div className="portal-form-actions"><button className="portal-secondary" type="button" onClick={() => setAddingVehicle(false)}>Cancel</button><button className="portal-primary" type="submit">Save vehicle</button></div>
                  </form>
                </div>}
                <div className="portal-panel"><div className="portal-panel-head"><h2>Vehicle inventory</h2><span>{fleet.length} active listings</span></div>
                  <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Vehicle</th><th>Category</th><th>Rate</th><th>Seats</th><th>Action</th></tr></thead><tbody>
                    {fleet.map((vehicle) => <tr key={vehicle.id}><td><strong>{vehicle.name}</strong><small>{vehicle.details}</small></td><td>{vehicle.category}</td><td>${vehicle.price}/day</td><td>{vehicle.seats}</td><td><button className="portal-secondary" type="button" onClick={() => void removeVehicle(vehicle.id)}>Remove</button></td></tr>)}
                    {!fleet.length && <tr><td colSpan={5} className="portal-empty">No active vehicles to show.</td></tr>}
                  </tbody></table></div>
                </div>
              </>
            )}
            {section === "Customers" && <div className="portal-panel"><div className="portal-panel-head"><h2>Renter accounts</h2><span>{summary?.customers.length || 0} registered</span></div>
              <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Customer</th><th>Email</th><th>Joined</th><th>Trips</th></tr></thead><tbody>
                {summary?.customers.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.email}</td><td>{new Date(customer.createdAt).toLocaleDateString()}</td><td>{bookings.filter((booking) => booking.customerEmail === customer.email).length}</td></tr>)}
                {!summary?.customers.length && <tr><td colSpan={4} className="portal-empty">Customer accounts appear here after they register.</td></tr>}
              </tbody></table></div>
            </div>}
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string | number; detail: string }) {
  return <article className="portal-stat"><div className="portal-stat-top"><span>{label}</span><span className="portal-stat-icon">{icon}</span></div><strong>{value}</strong><small>{detail}</small></article>;
}

function BookingTable({ bookings, onStatusChange }: { bookings: Booking[]; onStatusChange: (id: string, status: string) => void }) {
  return <div className="portal-panel"><div className="portal-panel-head"><div><h2>Reservations</h2><p>Review renter trips and update their booking status.</p></div></div>
    <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Renter</th><th>Vehicle</th><th>Pickup</th><th>Dates</th><th>Total</th><th>Status</th></tr></thead><tbody>
      {bookings.map((booking) => <tr key={booking.id}><td><strong>{booking.customerName}</strong><small>{booking.customerEmail}</small></td><td><strong>{booking.vehicleName}</strong><small>{booking.vehicleCategory}</small></td><td>{booking.pickup}</td><td>{new Date(booking.start).toLocaleDateString()} – {new Date(booking.end).toLocaleDateString()}</td><td>${booking.total}</td><td><select className="portal-select" value={booking.status} aria-label={`Update ${booking.customerName}'s reservation`} onChange={(event) => onStatusChange(booking.id, event.target.value)}>{["pending", "confirmed", "completed", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}
      {!bookings.length && <tr><td colSpan={6} className="portal-empty">No reservations yet. New customer bookings will appear here.</td></tr>}
    </tbody></table></div>
  </div>;
}

function Field({ label, name, placeholder, type = "text", accept }: { label: string; name: string; placeholder?: string; type?: string; accept?: string }) {
  return <label className="portal-field">{label}<input name={name} type={type} placeholder={placeholder} accept={accept} min={type === "number" ? "1" : undefined} required /></label>;
}
