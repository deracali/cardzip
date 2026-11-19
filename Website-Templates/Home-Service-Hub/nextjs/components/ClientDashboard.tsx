"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, errorStatus, getSession, homeServiceApi, type Appointment, type HomeSession } from "../lib/homeServiceApi";

export default function ClientDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<HomeSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (!current) {
      router.replace("/login");
      return;
    }
    if (current.user.role !== "client") {
      setError("This portal is for client accounts. Sign in with a client account to continue.");
      setLoading(false);
      return;
    }
    homeServiceApi.clientDashboard()
      .then((result) => setAppointments(result.appointments))
      .catch((requestError) => {
        if (errorStatus(requestError) === 401) {
          clearSession();
          router.replace("/login");
        } else {
          setError(requestError instanceof Error ? requestError.message : "Could not load your requests.");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  function signOut() {
    clearSession();
    router.replace("/");
  }

  return (
    <main className="dashboard-page">
      <DashboardHeader session={session} onSignOut={signOut} />
      <section className="dashboard-content">
        <div className="dashboard-heading"><span className="eyebrow">CLIENT PORTAL</span><h1>Your service requests</h1><p>Review request details and follow each update from our team.</p></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? <p>Loading your requests...</p> : appointments.length === 0
          ? <div className="empty-state"><h2>No requests yet</h2><p>Your submitted service requests will appear here.</p><Link className="button button-orange" href="/book-now">Request a service</Link></div>
          : <div className="appointment-list">{appointments.map((appointment) => <AppointmentCard appointment={appointment} key={appointment.id} />)}</div>}
      </section>
    </main>
  );
}

export function DashboardHeader({ session, onSignOut }: { session: HomeSession | null; onSignOut: () => void }) {
  return (
    <header className="dashboard-header">
      <Link className="brand" href="/"><span className="brand-mark">F</span><span>FixFlow Pro</span></Link>
      <div><span>{session?.user.name || "FixFlow account"}</span><button type="button" onClick={onSignOut}>Sign out</button></div>
    </header>
  );
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <article className="appointment-card">
      <div className="appointment-title"><div><h2>{appointment.serviceName}</h2><p>{appointment.urgency} visit · {appointment.preferredDate}</p></div><span className={`status status-${appointment.status.toLowerCase().replaceAll(" ", "-")}`}>{appointment.status}</span></div>
      <dl>
        <div><dt>Estimate</dt><dd>${appointment.quote}</dd></div>
        <div><dt>Service address</dt><dd>{appointment.address}</dd></div>
        <div><dt>Phone</dt><dd>{appointment.phone}</dd></div>
        {appointment.clientName && <div><dt>Client</dt><dd>{appointment.clientName} · {appointment.clientEmail}</dd></div>}
      </dl>
      {appointment.description && <p className="appointment-description">{appointment.description}</p>}
    </article>
  );
}
