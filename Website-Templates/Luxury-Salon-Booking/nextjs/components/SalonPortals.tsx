"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appointmentStatuses } from "../lib/salonData";
import { clearSession, errorStatus, getSession, salonApi, type SalonAppointment } from "../lib/salonApi";
import { PortalHeader, SalonFooter } from "./SalonShell";

export function ClientDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const current = getSession();
    if (!current) {
      router.replace(`/login?next=${encodeURIComponent("/dashboard")}`);
      return () => { active = false; };
    }
    if (current.user.role !== "client") {
      router.replace("/admin");
      return () => { active = false; };
    }
    salonApi.clientDashboard()
      .then((result) => { if (active) setAppointments(result.appointments); })
      .catch((requestError) => {
        if (errorStatus(requestError) === 401) {
          clearSession();
          router.replace("/login");
        } else if (active) setError(requestError instanceof Error ? requestError.message : "Could not load your appointments.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  return <><PortalHeader title="Client dashboard" /><main className="salon-portal-content"><span className="salon-kicker">YOUR LUMIÈRE VISITS</span><h1>My appointments</h1><p>Review appointment requests and check their current status.</p>{error && <p className="salon-form-error" role="alert">{error}</p>}{loading ? <p>Loading your appointments…</p> : appointments.length ? <section className="salon-appointment-list">{appointments.map((appointment) => <AppointmentCard appointment={appointment} key={appointment.id} />)}</section> : <section className="salon-account-card"><h2>No visits requested yet</h2><p>Your appointment requests will appear here after you book.</p><a className="salon-button salon-button-primary" href="/book">Request an appointment</a></section>}</main><SalonFooter /></>;
}

export function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Awaited<ReturnType<typeof salonApi.adminDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;
    const current = getSession();
    if (!current) {
      router.replace(`/admin/login?next=${encodeURIComponent("/admin")}`);
      return () => { active = false; };
    }
    if (current.user.role !== "admin") {
      router.replace("/dashboard");
      return () => { active = false; };
    }
    salonApi.adminDashboard()
      .then((result) => { if (active) setData(result); })
      .catch((requestError) => {
        if (errorStatus(requestError) === 401) {
          clearSession();
          router.replace("/admin/login");
        } else if (active) setError(requestError instanceof Error ? requestError.message : "Could not load the admin dashboard.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    setError("");
    try {
      const { appointment } = await salonApi.updateAppointment(id, status);
      setData((current) => current && ({ ...current, appointments: current.appointments.map((item) => item.id === id ? appointment : item) }));
    } catch (requestError) {
      if (errorStatus(requestError) === 401) {
        clearSession();
        router.replace("/admin/login");
      } else setError(requestError instanceof Error ? requestError.message : "Could not update appointment.");
    } finally {
      setBusyId("");
    }
  }

  return <><PortalHeader title="Studio admin" /><main className="salon-portal-content"><span className="salon-kicker">STUDIO OPERATIONS</span><h1>Appointment dashboard</h1><p>Review client requests and update status after confirming availability.</p>{error && <p className="salon-form-error" role="alert">{error}</p>}{loading ? <p>Loading the salon workspace…</p> : data && <><div className="salon-metrics">{Object.entries(data.metrics).map(([label, value]) => <article key={label}><small>{label.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</small><strong>{value}</strong></article>)}</div><section className="salon-account-card"><h2>Appointment requests</h2>{data.appointments.length ? data.appointments.map((appointment) => <div className="salon-admin-appointment" key={appointment.id}><AppointmentCard appointment={appointment} showClient /><label>Status<select value={appointment.status} disabled={busyId === appointment.id} onChange={(event) => updateStatus(appointment.id, event.target.value)}>{appointmentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>) : <p>No appointment requests yet.</p>}</section><section className="salon-account-card"><h2>Clients · {data.clients.length}</h2>{data.clients.map((client) => <p className="salon-client-row" key={client.id}><strong>{client.name}</strong> · {client.email}{client.phone ? ` · ${client.phone}` : ""}</p>)}</section></>}</main><SalonFooter /></>;
}

function AppointmentCard({ appointment, showClient = false }: { appointment: SalonAppointment; showClient?: boolean }) {
  return <article className="salon-appointment-card"><div><h2>{appointment.serviceName}</h2><p>{appointment.date} at {appointment.time} · {appointment.stylist} · {appointment.duration}</p>{showClient && <small>{appointment.clientName} · {appointment.clientEmail}</small>}{appointment.notes && <small>Note: {appointment.notes}</small>}</div><div className="salon-appointment-meta"><strong>${appointment.price}</strong><span>{appointment.status}</span></div></article>;
}
