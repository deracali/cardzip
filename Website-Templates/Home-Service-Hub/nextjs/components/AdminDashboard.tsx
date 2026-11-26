"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { AppointmentCard } from "./ClientDashboard";
import { clearSession, errorStatus, getSession, homeServiceApi, type Appointment, type HomeSession, type HomeUser } from "../lib/homeServiceApi";

const statuses: Appointment["status"][] = ["Requested", "Scheduled", "In Progress", "Completed", "Cancelled"];

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<HomeSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<HomeUser[]>([]);
  const [metrics, setMetrics] = useState({ clients: 0, appointments: 0, newRequests: 0, activeAppointments: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (!current) {
      router.replace("/admin/login");
      return;
    }
    if (current.user.role !== "admin") {
      setError("Administrator access is required. Sign in with an administrator account.");
      setLoading(false);
      return;
    }
    homeServiceApi.adminDashboard()
      .then((result) => {
        setAppointments(result.appointments);
        setClients(result.clients);
        setMetrics(result.metrics);
      })
      .catch((requestError) => {
        if (errorStatus(requestError) === 401) {
          clearSession();
          router.replace("/admin/login");
        } else {
          setError(requestError instanceof Error ? requestError.message : "Could not load the admin dashboard.");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function updateStatus(id: string, status: Appointment["status"]) {
    setUpdatingId(id);
    setError("");
    try {
      const result = await homeServiceApi.updateAppointment(id, status);
      setAppointments((current) => current.map((item) => item.id === id ? result.appointment : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update the request.");
    } finally {
      setUpdatingId("");
    }
  }

  function signOut() {
    clearSession();
    router.replace("/");
  }

  const page = pathname.endsWith("/requests") ? "requests"
    : pathname.endsWith("/clients") ? "clients"
      : pathname.endsWith("/payments") ? "payments"
        : pathname.endsWith("/reports") ? "reports"
          : pathname.endsWith("/settings") ? "settings" : "overview";
  const title = page === "requests" ? "Service requests"
    : page === "clients" ? "Client directory"
      : page === "payments" ? "Payments"
        : page === "reports" ? "Reports"
          : page === "settings" ? "Workspace settings" : "Operations overview";
  const paidAppointments = appointments.filter((item) => item.paymentStatus === "paid");
  const unpaidAppointments = appointments.filter((item) => item.paymentStatus !== "paid");
  const paidEstimateTotal = paidAppointments.reduce((total, item) => total + item.quote, 0);
  const requestsToShow = page === "overview" ? appointments.slice(0, 3) : appointments;

  let pageContent: ReactNode;
  if (loading) {
    pageContent = <p className="workspace-message">Loading the admin workspace...</p>;
  } else if (page === "clients") {
    pageContent = <section className="workspace-panel"><div className="workspace-panel-heading"><h2>Client directory</h2><span>{clients.length} accounts</span></div><div className="client-directory">{clients.map((client) => <article key={client.id}><span className="workspace-avatar">{client.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{client.name}</strong><small>{client.email}</small></div><span>{client.phone || "Phone not provided"}</span></article>)}</div></section>;
  } else if (page === "settings") {
    pageContent = <section className="workspace-panel"><h2>Workspace settings</h2><p className="workspace-note">These settings describe the FixFlow service workspace.</p><dl className="profile-grid"><div><dt>Business name</dt><dd>FixFlow Pro Home Services</dd></div><div><dt>Service region</dt><dd>Denver metro area, ZIP prefixes 800-803</dd></div><div><dt>Support line</dt><dd>(800) 555-0199, open 24 hours</dd></div><div><dt>Signed in as</dt><dd>{session?.user.email}</dd></div></dl></section>;
  } else if (page === "payments") {
    pageContent = <><div className="metrics-grid"><Metric label="Paid estimates" value={paidAppointments.length} /><Metric label="Paid total" value={`$${paidEstimateTotal.toLocaleString("en-US")}`} /><Metric label="Not yet paid" value={unpaidAppointments.length} /><Metric label="Requests shown" value={appointments.length} /></div><section className="workspace-panel"><div className="workspace-panel-heading"><h2>Recent payment activity</h2><span>Latest {appointments.length} service requests</span></div>{appointments.length === 0 ? <p className="workspace-message">No payment activity yet.</p> : <div className="payment-activity-list">{appointments.map((appointment) => <article key={appointment.id}><div><strong>{appointment.serviceName}</strong><small>{appointment.clientName} / {appointment.preferredDate}</small></div><strong>${appointment.quote.toLocaleString("en-US")}</strong><span className={`payment-status payment-${appointment.paymentStatus || "unpaid"}`}>{appointment.paymentStatus || "unpaid"}</span></article>)}</div>}</section></>;
  } else if (page === "reports") {
    pageContent = <><div className="metrics-grid"><Metric label="Paid estimates" value={`$${paidEstimateTotal.toLocaleString("en-US")}`} /><Metric label="Completed jobs" value={appointments.filter((item) => item.status === "Completed").length} /><Metric label="Open requests" value={appointments.filter((item) => ["Requested", "Scheduled", "In Progress"].includes(item.status)).length} /><Metric label="Total requests" value={metrics.appointments} /></div><section className="workspace-panel"><h2>Request status breakdown</h2><div className="report-status-list">{statuses.map((status) => { const count = appointments.filter((item) => item.status === status).length; const percentage = appointments.length ? Math.round((count / appointments.length) * 100) : 0; return <div className="report-status-row" key={status}><div><span>{status}</span><strong>{count}</strong></div><div className="report-track" role="progressbar" aria-label={`${status} requests`} aria-valuemin={0} aria-valuemax={appointments.length || 1} aria-valuenow={count}><span style={{ width: `${percentage}%` }} /></div></div>; })}</div><p className="workspace-note">Reports use the latest service requests returned by the FixFlow API.</p></section></>;
  } else {
    pageContent = <><div className="metrics-grid"><Metric label="Clients" value={metrics.clients} /><Metric label="All requests" value={metrics.appointments} /><Metric label="New requests" value={metrics.newRequests} /><Metric label="Active appointments" value={metrics.activeAppointments} /></div><section className="workspace-panel"><div className="workspace-panel-heading"><h2>{page === "requests" ? "All service requests" : "Latest service requests"}</h2><span>{appointments.length} total</span></div>{requestsToShow.length === 0 ? <p className="workspace-message">No requests have been submitted.</p> : <div className="admin-request-list">{requestsToShow.map((appointment) => <article className="admin-request" key={appointment.id}><AppointmentCard appointment={appointment} /><label className="status-control">Update status<select value={appointment.status} disabled={updatingId === appointment.id} onChange={(event) => updateStatus(appointment.id, event.target.value as Appointment["status"])}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></article>)}</div>}</section></>;
  }

  return (
    <DashboardShell role="admin" session={session} onSignOut={signOut}>
      <div className="workspace-heading"><div><span className="eyebrow">FIXFLOW OPERATIONS</span><h1>{title}</h1><p>Manage service requests, clients, and day-to-day operations.</p></div><span className="workspace-date">{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</span></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {pageContent}
    </DashboardShell>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>;
}
