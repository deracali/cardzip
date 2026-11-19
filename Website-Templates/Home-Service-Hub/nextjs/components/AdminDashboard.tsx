"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppointmentCard, DashboardHeader } from "./ClientDashboard";
import { clearSession, errorStatus, getSession, homeServiceApi, type Appointment, type HomeSession } from "../lib/homeServiceApi";

const statuses: Appointment["status"][] = ["Requested", "Scheduled", "In Progress", "Completed", "Cancelled"];

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<HomeSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  return (
    <main className="dashboard-page">
      <DashboardHeader session={session} onSignOut={signOut} />
      <section className="dashboard-content">
        <div className="dashboard-heading"><span className="eyebrow">ADMIN WORKSPACE</span><h1>Service operations</h1><p>Review incoming requests and update client-visible status.</p></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? <p>Loading the admin workspace...</p> : (
          <>
            <div className="metrics-grid">
              <Metric label="Clients" value={metrics.clients} />
              <Metric label="All requests" value={metrics.appointments} />
              <Metric label="New requests" value={metrics.newRequests} />
              <Metric label="Active appointments" value={metrics.activeAppointments} />
            </div>
            <section className="admin-appointments"><h2>Recent service requests</h2>
              {appointments.length === 0 ? <p>No requests have been submitted.</p> : appointments.map((appointment) => (
                <div className="admin-appointment" key={appointment.id}>
                  <AppointmentCard appointment={appointment} />
                  <label className="status-control">Update status
                    <select value={appointment.status} disabled={updatingId === appointment.id} onChange={(event) => updateStatus(appointment.id, event.target.value as Appointment["status"])}>
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              ))}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>;
}
