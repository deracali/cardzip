"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { clearSession, errorStatus, getSession, homeServiceApi, type Appointment, type HomeSession } from "../lib/homeServiceApi";

export default function ClientDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<HomeSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState("");

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (!current) {
      router.replace("/login");
      return;
    }
    if (current.user.role === "admin") {
      router.replace("/admin");
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

  async function payForAppointment(appointmentId: string) {
    setPayingId(appointmentId);
    setError("");
    try {
      const checkout = await homeServiceApi.initializePayment(appointmentId);
      window.location.assign(checkout.authorizationUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not start secure checkout.");
      setPayingId("");
    }
  }

  function signOut() {
    clearSession();
    router.replace("/");
  }

  const page = pathname.endsWith("/profile") ? "profile" : pathname.endsWith("/payments") ? "payments" : pathname.endsWith("/requests") ? "requests" : "overview";
  const title = page === "profile" ? "Your profile" : page === "payments" ? "Payment history" : page === "requests" ? "Your service requests" : `Welcome back, ${session?.user.name.split(" ")[0] || "there"}`;
  const activeAppointments = appointments.filter((item) => ["Requested", "Scheduled", "In Progress"].includes(item.status)).length;
  const paidTotal = appointments.filter((item) => item.paymentStatus === "paid").reduce((total, item) => total + item.quote, 0);
  return (
    <DashboardShell role="client" session={session} onSignOut={signOut}>
      <div className="workspace-heading"><div><span className="eyebrow">CLIENT PORTAL</span><h1>{title}</h1><p>Keep your home service requests and account details in one place.</p></div><Link className="button button-orange" href="/book-now">Request service</Link></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p className="workspace-message">Loading your requests...</p> : page === "profile"
        ? <section className="workspace-panel"><h2>Account details</h2><dl className="profile-grid"><div><dt>Name</dt><dd>{session?.user.name}</dd></div><div><dt>Email</dt><dd>{session?.user.email}</dd></div><div><dt>Phone</dt><dd>{session?.user.phone || "Add a phone number when you request service"}</dd></div><div><dt>Account type</dt><dd>Homeowner</dd></div></dl><p className="workspace-note">Contact our team if you need to change your account details.</p></section>
        : page === "payments"
          ? <section className="workspace-panel"><div className="workspace-panel-heading"><h2>Service estimate payments</h2><span>${paidTotal.toLocaleString("en-US")} paid</span></div>{appointments.length === 0 ? <EmptyState /> : <div className="payment-history-list">{appointments.map((appointment) => <article key={appointment.id}><div><strong>{appointment.serviceName}</strong><small>{appointment.preferredDate} · ${appointment.quote.toLocaleString("en-US")}</small></div><span className={`payment-status payment-${appointment.paymentStatus || "unpaid"}`}>{appointment.paymentStatus || "unpaid"}</span>{appointment.paymentStatus !== "paid" && <button className="button button-orange" type="button" disabled={payingId === appointment.id} onClick={() => payForAppointment(appointment.id)}>{payingId === appointment.id ? "Connecting..." : "Pay securely"}</button>}</article>)}</div>}</section>
          : page === "requests"
          ? <section className="workspace-panel"><div className="workspace-panel-heading"><h2>All requests</h2><span>{appointments.length} total</span></div>{appointments.length === 0 ? <EmptyState /> : <div className="appointment-list">{appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} onPay={payForAppointment} paying={payingId === appointment.id} />)}</div>}</section>
          : <><div className="metrics-grid"><Metric label="Total requests" value={appointments.length} /><Metric label="In progress" value={activeAppointments} /><Metric label="Completed jobs" value={appointments.filter((item) => item.status === "Completed").length} /><Metric label="Next visit" value={appointments.find((item) => ["Scheduled", "In Progress"].includes(item.status))?.preferredDate || "—"} /></div><section className="workspace-panel"><div className="workspace-panel-heading"><h2>Recent requests</h2><Link href="/dashboard/requests">View all →</Link></div>{appointments.length === 0 ? <EmptyState /> : <div className="appointment-list">{appointments.slice(0, 2).map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} onPay={payForAppointment} paying={payingId === appointment.id} />)}</div>}</section></>}
    </DashboardShell>
  );
}

export function AppointmentCard({ appointment, onPay, paying }: { appointment: Appointment; onPay?: (id: string) => void; paying?: boolean }) {
  return (
    <article className="appointment-card">
      <div className="appointment-title"><div><h2>{appointment.serviceName}</h2><p>{appointment.urgency} visit · {appointment.preferredDate}</p></div><span className={`status status-${appointment.status.toLowerCase().replaceAll(" ", "-")}`}>{appointment.status}</span></div>
      <dl><div><dt>Estimate</dt><dd>${appointment.quote}</dd></div><div><dt>Service address</dt><dd>{appointment.address}</dd></div><div><dt>Phone</dt><dd>{appointment.phone}</dd></div>{appointment.clientName && <div><dt>Client</dt><dd>{appointment.clientName} · {appointment.clientEmail}</dd></div>}</dl>
      {appointment.description && <p className="appointment-description">{appointment.description}</p>}
      {onPay && <div className="appointment-payment"><span>Payment: <strong>{appointment.paymentStatus || "unpaid"}</strong></span>{appointment.paymentStatus !== "paid" && appointment.status !== "Cancelled" && <button className="button button-orange" type="button" disabled={paying} onClick={() => onPay(appointment.id)}>{paying ? "Connecting to Paystack..." : "Pay estimate securely"}</button>}</div>}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>;
}

function EmptyState() {
  return <div className="empty-state"><h2>No requests yet</h2><p>Your submitted service requests will appear here.</p><Link className="button button-orange" href="/book-now">Request a service</Link></div>;
}
