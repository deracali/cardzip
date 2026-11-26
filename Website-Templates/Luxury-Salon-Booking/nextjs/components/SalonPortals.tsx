"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appointmentStatuses } from "../lib/salonData";
import {
  clearSession,
  errorStatus,
  getSession,
  salonApi,
  type SalonAppointment,
  type SalonService,
  type SalonServiceInput,
  type SalonStylist,
  type SalonStylistInput,
  type SalonUser,
} from "../lib/salonApi";
import SalonDashboardShell from "./SalonDashboardShell";

const clientNavigation = [
  { label: "Overview", href: "/dashboard", view: "overview" },
  { label: "My appointments", href: "/dashboard/appointments", view: "appointments" },
  { label: "My profile", href: "/dashboard/profile", view: "profile" },
];
const adminNavigation = [
  { label: "Overview", href: "/admin", view: "overview" },
  { label: "Appointments", href: "/admin/appointments", view: "appointments" },
  { label: "Clients", href: "/admin/clients", view: "clients" },
  { label: "Services & pricing", href: "/admin/services", view: "services" },
  { label: "Stylists", href: "/admin/stylists", view: "stylists" },
];

type AdminData = Awaited<ReturnType<typeof salonApi.adminDashboard>>;

export function ClientDashboard({ view = "overview" }: { view?: string }) {
  const router = useRouter();
  const [session] = useState(() => getSession());
  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [loading, setLoading] = useState(view !== "profile");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(`/dashboard${view === "overview" ? "" : `/${view}`}`)}`);
      return () => { active = false; };
    }
    if (session.user.role !== "client") {
      router.replace("/admin");
      return () => { active = false; };
    }
    if (view === "profile") return () => { active = false; };

    setLoading(true);
    salonApi.clientDashboard()
      .then(({ appointments: result }) => { if (active) setAppointments(result); })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (errorStatus(requestError) === 401) {
          clearSession();
          router.replace("/login");
        } else setError(requestError instanceof Error ? requestError.message : "Could not load your appointments.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router, session, view]);

  if (!session || session.user.role !== "client") return null;
  const title = view === "appointments" ? "My appointments" : view === "profile" ? "My profile" : "Your dashboard";
  const upcoming = appointments.filter((item) => item.date >= new Date().toISOString().slice(0, 10) && item.status !== "Cancelled");
  const completed = appointments.filter((item) => item.status === "Completed");

  return <SalonDashboardShell user={session.user} title={title} navigation={clientNavigation} activeView={view}>
    {error && <p className="salon-form-error salon-dashboard-alert" role="alert">{error}</p>}
    {view === "profile" ? <section className="salon-dashboard-panel salon-profile-panel"><span className="salon-kicker">ACCOUNT DETAILS</span><h2>Personal information</h2><p>Your account details are securely managed by the salon.</p><div className="salon-profile-details"><span>Full name</span><strong>{session.user.name}</strong><span>Email address</span><strong>{session.user.email}</strong><span>Phone number</span><strong>{session.user.phone || "Not provided"}</strong></div><Link className="salon-button salon-button-primary" href="/book">Request an appointment</Link></section>
      : loading ? <p>Loading your Lumière visits…</p>
        : view === "appointments" ? <section className="salon-dashboard-panel"><div className="salon-dashboard-panel-heading"><div><span className="salon-kicker">YOUR VISITS</span><h2>Appointment history</h2></div><Link className="salon-button salon-button-primary" href="/book">＋ Book a visit</Link></div>{appointments.length ? <div className="salon-dashboard-list">{appointments.map((item) => <AppointmentCard appointment={item} key={item.id} />)}</div> : <EmptyState title="No appointments yet" text="Find a ritual that feels like you and make a little time for yourself." href="/book" action="Explore services" />}</section>
          : <><div className="salon-dashboard-welcome"><div><span className="salon-kicker">A MOMENT FOR YOU</span><h2>Welcome back, {session.user.name.split(" ")[0]}.</h2><p>Your next favorite ritual is just around the corner.</p></div><Link className="salon-button salon-button-primary" href="/book">Request a visit →</Link></div><div className="salon-dashboard-metrics"><Metric label="Upcoming visits" value={upcoming.length} /><Metric label="Total visits" value={appointments.length} /><Metric label="Completed rituals" value={completed.length} /></div><section className="salon-dashboard-panel"><div className="salon-dashboard-panel-heading"><div><span className="salon-kicker">YOUR SCHEDULE</span><h2>Next appointment</h2></div><Link href="/dashboard/appointments">See all →</Link></div>{upcoming[0] ? <AppointmentCard appointment={upcoming[0]} /> : <EmptyState title="A little time for yourself?" text="Your upcoming salon visits will show here." href="/book" action="Book an appointment" />}</section></>}
  </SalonDashboardShell>;
}

export function AdminDashboard({ view = "overview" }: { view?: string }) {
  const router = useRouter();
  const [session] = useState(() => getSession());
  const [data, setData] = useState<AdminData | null>(null);
  const [services, setServices] = useState<SalonService[]>([]);
  const [stylists, setStylists] = useState<SalonStylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [editingService, setEditingService] = useState<SalonService | null>(null);
  const [editingStylist, setEditingStylist] = useState<SalonStylist | null>(null);

  useEffect(() => {
    let active = true;
    if (!session) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/admin${view === "overview" ? "" : `/${view}`}`)}`);
      return () => { active = false; };
    }
    if (session.user.role !== "admin") {
      router.replace("/dashboard");
      return () => { active = false; };
    }

    setLoading(true);
    const request = view === "services"
      ? salonApi.adminServices().then((result) => { if (active) setServices(result.services); })
      : view === "stylists"
        ? salonApi.adminStylists().then((result) => { if (active) setStylists(result.stylists); })
        : salonApi.adminDashboard().then((result) => { if (active) setData(result); });
    request
      .catch((requestError: unknown) => {
        if (!active) return;
        if (errorStatus(requestError) === 401) {
          clearSession();
          router.replace("/admin/login");
        } else setError(requestError instanceof Error ? requestError.message : "Could not load the studio workspace.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router, session, view]);

  if (!session || session.user.role !== "admin") return null;
  const title = view === "appointments" ? "Appointments" : view === "clients" ? "Clients" : view === "services" ? "Services & pricing" : view === "stylists" ? "Stylists" : "Studio overview";

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    setError("");
    try {
      const { appointment } = await salonApi.updateAppointment(id, status);
      setData((current) => current && ({ ...current, appointments: current.appointments.map((item) => item.id === id ? appointment : item) }));
    } catch (requestError) {
      handleAdminError(requestError);
    } finally {
      setBusyId("");
    }
  }

  function handleAdminError(requestError: unknown) {
    if (errorStatus(requestError) === 401) {
      clearSession();
      router.replace("/admin/login");
    } else setError(requestError instanceof Error ? requestError.message : "Could not save your changes.");
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const payload: SalonServiceInput = {
      name: String(form.get("name") || "").trim(),
      category: String(form.get("category") || "").trim(),
      description: String(form.get("description") || "").trim(),
      duration: String(form.get("duration") || "").trim(),
      price: Number(form.get("price")),
      image: String(form.get("image") || "").trim(),
      badge: String(form.get("badge") || "").trim(),
      active: form.get("active") === "on",
    };
    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      setError("Enter a service price greater than zero.");
      return;
    }
    setBusyId(editingService?.id || "new-service");
    try {
      if (editingService) await salonApi.updateService(editingService.id, payload);
      else await salonApi.createService(payload);
      setEditingService(null);
      setNotice("Service details saved to the salon catalogue.");
      setServices((await salonApi.adminServices()).services);
    } catch (requestError) {
      handleAdminError(requestError);
    } finally {
      setBusyId("");
    }
  }

  async function saveStylist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const payload: SalonStylistInput = {
      name: String(form.get("name") || "").trim(),
      role: String(form.get("role") || "").trim(),
      bio: String(form.get("bio") || "").trim(),
      image: String(form.get("image") || "").trim(),
      active: form.get("active") === "on",
    };
    setBusyId(editingStylist?.id || "new-stylist");
    try {
      if (editingStylist) await salonApi.updateStylist(editingStylist.id, payload);
      else await salonApi.createStylist(payload);
      setEditingStylist(null);
      setNotice("Stylist details saved to the salon roster.");
      setStylists((await salonApi.adminStylists()).stylists);
    } catch (requestError) {
      handleAdminError(requestError);
    } finally {
      setBusyId("");
    }
  }

  return <SalonDashboardShell user={session.user} title={title} navigation={adminNavigation} activeView={view} admin>
    {error && <p className="salon-form-error salon-dashboard-alert" role="alert">{error}</p>}
    {notice && <p className="salon-form-success salon-dashboard-alert" role="status">{notice}</p>}
    {loading ? <p>Loading the studio workspace…</p> : view === "services" ? <div className="salon-service-admin-layout"><section className="salon-dashboard-panel"><span className="salon-kicker">LIVE MENU · {services.length} SERVICES</span><h2>Service catalogue</h2><p>Updates appear on the booking page and public service menu.</p><div className="salon-service-admin-list">{services.map((service) => <article className={`salon-service-admin-item${service.active ? "" : " is-inactive"}`} key={service.id}><div><span className="salon-kicker">{service.category}{service.active ? "" : " · HIDDEN"}</span><h3>{service.name}</h3><p>{service.duration} · ${service.price}</p></div><button className="salon-button salon-button-small" type="button" onClick={() => setEditingService(service)}>Edit</button></article>)}</div></section><section className="salon-dashboard-panel"><span className="salon-kicker">{editingService ? "EDIT SERVICE" : "NEW SERVICE"}</span><h2>{editingService?.name || "Add to the menu"}</h2><ServiceForm key={editingService?.id || "new"} initial={editingService} busy={busyId !== ""} onSubmit={saveService} onCancel={() => setEditingService(null)} /></section></div>
      : view === "stylists" ? <div className="salon-service-admin-layout"><section className="salon-dashboard-panel"><span className="salon-kicker">ARTIST ROSTER · {stylists.length} STYLISTS</span><h2>Salon stylists</h2><p>Add and maintain the team members available for booking.</p><div className="salon-service-admin-list">{stylists.map((stylist) => <article className={`salon-service-admin-item${stylist.active ? "" : " is-inactive"}`} key={stylist.id}><div><span className="salon-kicker">{stylist.role}{stylist.active ? "" : " · HIDDEN"}</span><h3>{stylist.name}</h3><p>{stylist.bio}</p></div><button className="salon-button salon-button-small" type="button" onClick={() => setEditingStylist(stylist)}>Edit</button></article>)}</div></section><section className="salon-dashboard-panel"><span className="salon-kicker">{editingStylist ? "EDIT STYLIST" : "NEW STYLIST"}</span><h2>{editingStylist?.name || "Add a stylist"}</h2><StylistForm key={editingStylist?.id || "new"} initial={editingStylist} busy={busyId !== ""} onSubmit={saveStylist} onCancel={() => setEditingStylist(null)} /></section></div>
        : view === "clients" ? <section className="salon-dashboard-panel"><span className="salon-kicker">YOUR COMMUNITY</span><h2>Client directory <small>{data?.clients.length || 0} clients</small></h2>{data?.clients.length ? <div className="salon-client-table"><div className="salon-client-table-head"><span>Client</span><span>Email</span><span>Visits</span></div>{data.clients.map((client) => <div className="salon-client-table-row" key={client.id}><strong>{client.name}</strong><span>{client.email}</span><span>{data.appointments.filter((item) => item.clientId === client.id).length}</span></div>)}</div> : <EmptyState title="No clients yet" text="Client accounts and bookings will appear here." />}</section>
          : data ? view === "appointments" ? <section className="salon-dashboard-panel"><span className="salon-kicker">STUDIO SCHEDULE</span><h2>Appointment requests</h2><p>Confirm, complete, or cancel each request as the team coordinates availability.</p>{data.appointments.length ? <div className="salon-dashboard-list">{data.appointments.map((appointment) => <div className="salon-admin-row" key={appointment.id}><AppointmentCard appointment={appointment} showClient /><div className="salon-admin-status-field"><span>Status</span><StatusDropdown value={appointment.status} disabled={busyId === appointment.id} onChange={(status) => updateStatus(appointment.id, status)} /></div></div>)}</div> : <EmptyState title="No appointments yet" text="New client requests will appear here." />}</section>
            : <><div className="salon-dashboard-welcome"><div><span className="salon-kicker">STUDIO OPERATIONS</span><h2>A clear view of today.</h2><p>Manage appointment requests, clients, service pricing, and your team.</p></div><Link className="salon-button salon-button-primary" href="/admin/appointments">Review appointments →</Link></div><div className="salon-dashboard-metrics">{Object.entries(data.metrics).map(([label, value]) => <Metric key={label} label={label.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)} value={value} />)}</div><section className="salon-dashboard-panel"><div className="salon-dashboard-panel-heading"><div><span className="salon-kicker">LATEST ACTIVITY</span><h2>Recent appointments</h2></div><Link href="/admin/appointments">Manage requests →</Link></div>{data.appointments.slice(0, 5).map((appointment) => <AppointmentCard appointment={appointment} key={appointment.id} showClient />)}</section></>
            : null}
  </SalonDashboardShell>;
}

function ServiceForm({ initial, busy, onSubmit, onCancel }: { initial: SalonService | null; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form className="salon-dashboard-form" onSubmit={onSubmit}><label>Service name<input name="name" defaultValue={initial?.name || ""} minLength={2} maxLength={100} required /></label><label>Category<input name="category" defaultValue={initial?.category || ""} maxLength={50} required /></label><label>Description<textarea name="description" rows={3} defaultValue={initial?.description || ""} maxLength={500} required /></label><div className="salon-form-row"><label>Duration<input name="duration" defaultValue={initial?.duration || "60 min"} maxLength={50} required /></label><label>Price (USD)<input name="price" type="number" min="1" max="10000" step="0.01" defaultValue={initial?.price || ""} required /></label></div><label>Image path<input name="image" defaultValue={initial?.image || ""} maxLength={300} /></label><label>Badge<input name="badge" defaultValue={initial?.badge || ""} maxLength={40} placeholder="Optional" /></label><label className="salon-checkbox-label"><input name="active" type="checkbox" defaultChecked={initial?.active !== false} /> Visible for bookings</label><div className="salon-dashboard-form-actions"><button className="salon-button salon-button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Add service"}</button>{initial && <button className="salon-dashboard-quiet-button" type="button" onClick={onCancel}>Cancel edit</button>}</div></form>;
}

function StylistForm({ initial, busy, onSubmit, onCancel }: { initial: SalonStylist | null; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form className="salon-dashboard-form" onSubmit={onSubmit}><label>Full name<input name="name" defaultValue={initial?.name || ""} minLength={2} maxLength={80} required /></label><label>Role or specialty<input name="role" defaultValue={initial?.role || ""} minLength={2} maxLength={80} required /></label><label>Biography<textarea name="bio" rows={4} defaultValue={initial?.bio || ""} minLength={2} maxLength={400} required /></label><label>Image path<input name="image" defaultValue={initial?.image || ""} maxLength={300} placeholder="Optional image URL or public path" /></label><label className="salon-checkbox-label"><input name="active" type="checkbox" defaultChecked={initial?.active !== false} /> Available for bookings</label><div className="salon-dashboard-form-actions"><button className="salon-button salon-button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Add stylist"}</button>{initial && <button className="salon-dashboard-quiet-button" type="button" onClick={onCancel}>Cancel edit</button>}</div></form>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className="salon-dashboard-metric"><span>{label}</span><strong>{value}</strong></article>;
}

function EmptyState({ title, text, href, action }: { title: string; text: string; href?: string; action?: string }) {
  return <div className="salon-dashboard-empty"><span aria-hidden="true">✦</span><h3>{title}</h3><p>{text}</p>{href && action && <Link className="salon-button salon-button-primary" href={href}>{action}</Link>}</div>;
}

function AppointmentCard({ appointment, showClient = false }: { appointment: SalonAppointment; showClient?: boolean }) {
  return <article className="salon-appointment-card salon-dashboard-appointment"><div><h3>{appointment.serviceName}</h3><p>{appointment.date} at {appointment.time} · {appointment.stylist}</p>{showClient && <small>{appointment.clientName} · {appointment.clientEmail}</small>}{appointment.notes && <small>Note: {appointment.notes}</small>}</div><div className="salon-appointment-meta"><strong>{appointment.paymentCurrency === "NGN" ? `₦${((appointment.paymentAmountMinor || 0) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}` : `$${appointment.price}`}</strong><span className={`salon-status salon-status-${appointment.status.toLowerCase()}`}>{appointment.status}</span></div></article>;
}

function StatusDropdown({ value, disabled, onChange }: { value: string; disabled: boolean; onChange: (status: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(0, appointmentStatuses.indexOf(value));

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[selectedIndex]?.focus();
  }, [open, selectedIndex]);

  function moveFocus(index: number) {
    const nextIndex = (index + appointmentStatuses.length) % appointmentStatuses.length;
    optionRefs.current[nextIndex]?.focus();
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveFocus(0);
    } else if (event.key === "End") {
      event.preventDefault();
      moveFocus(appointmentStatuses.length - 1);
    }
  }

  return <div className="salon-status-dropdown" ref={containerRef}>
    <button
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={`Appointment status: ${value}`}
      className="salon-status-dropdown-trigger"
      disabled={disabled}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={(event) => {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
          event.preventDefault();
          setOpen(true);
        }
      }}
      ref={triggerRef}
      type="button"
    >
      <span className={`salon-status-dropdown-dot is-${value.toLowerCase()}`} />
      <span>{value}</span>
      <svg aria-hidden="true" className={open ? "is-open" : ""} viewBox="0 0 12 8"><path d="m1 1 5 5 5-5" /></svg>
    </button>
    {open && <div aria-label="Appointment status" className="salon-status-dropdown-menu" role="listbox">
      {appointmentStatuses.map((status, index) => <button
        aria-selected={value === status}
        className={`salon-status-dropdown-option${value === status ? " is-selected" : ""}`}
        key={status}
        onClick={() => {
          onChange(status);
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onKeyDown={(event) => handleOptionKeyDown(event, index)}
        ref={(element) => { optionRefs.current[index] = element; }}
        role="option"
        tabIndex={-1}
        type="button"
      >
        <span className={`salon-status-dropdown-dot is-${status.toLowerCase()}`} />
        <span>{status}</span>
        {value === status && <span aria-hidden="true" className="salon-status-dropdown-check">✓</span>}
      </button>)}
    </div>}
  </div>;
}
