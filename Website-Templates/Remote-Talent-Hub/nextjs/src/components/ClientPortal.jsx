"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import PageShell from "./PageShell";
import { apiRequest, clearToken, getToken } from "../services/api";

export default function ClientPortal() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return () => { active = false; };
    }
    apiRequest("/client/dashboard", { token }).then((result) => {
      if (active) setData(result);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [router]);

  async function updateApplication(id, status) {
    setError("");
    setBusyId(id);
    try {
      const result = await apiRequest(`/client/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: { status },
      });
      setData((current) => ({
        ...current,
        applications: current.applications.map((application) => application.id === id ? result.application : application),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId("");
    }
  }

  function signOut() {
    clearToken();
    router.replace("/login");
  }

  if (loading) return <PageShell><main className="wrap simple-page">Loading your protected dashboard...</main></PageShell>;
  if (error && !data) return <PageShell><main className="wrap simple-page"><p className="api-notice api-notice-error" role="alert">{error}</p><Link className="button button-purple" href="/login">Sign in again <ArrowRight size={14} /></Link></main></PageShell>;
  if (!data) return null;

  const employer = data.user.role === "employer";
  const records = employer ? data.jobs : data.applications;
  return (
    <PageShell>
      <main className="wrap account-page">
        <div className="account-heading"><div><span className="eyebrow">{employer ? "EMPLOYER WORKSPACE" : "CANDIDATE WORKSPACE"}</span><h1>Welcome, {data.user.name}</h1><p>{employer ? "Manage your listings and review applicants for your approved jobs." : "Track the applications you have submitted."}</p></div><button className="button button-outline" onClick={signOut}>Sign out</button></div>
        {error && <p className="api-notice api-notice-error" role="alert">{error}</p>}
        <section className="account-summary"><article><BriefcaseBusiness /><strong>{records.length}</strong><span>{employer ? "Job listings" : "Applications"}</span></article><article><CheckCircle2 /><strong>{records.filter((item) => item.status === "approved" || item.status === "submitted").length}</strong><span>{employer ? "Approved or in review" : "Submitted"}</span></article></section>
        <section className="info-panel account-panel"><div className="section-title-row"><div><h2>{employer ? "Your job listings" : "Your applications"}</h2><p>Only records linked to your account are returned by the API.</p></div>{employer && <Link className="button button-purple" href="/post-job">Post a job <ArrowRight size={14} /></Link>}</div>
          {records.length === 0 ? <p className="empty-account">{employer ? "You have not posted a job yet." : "You have not submitted an application yet."}</p> :
            <div className="account-record-list">{records.map((item) => <article key={item.id} className="account-record"><div><strong>{employer ? item.title : item.jobTitle}</strong><small>{employer ? `${item.category} · ${item.location}` : new Date(item.createdAt).toLocaleDateString()}</small>{employer && item.paymentStatus !== "paid" && <small>Payment integration is required before this listing can appear publicly.</small>}</div><span className={`status-pill status-${item.status}`}>{item.status.replaceAll("_", " ")}</span></article>)}</div>}
        </section>
        {employer && <section className="info-panel account-panel"><h2>Applications for your listings</h2>{data.applications.length === 0 ? <p className="empty-account">Applications for your approved listings will appear here.</p> : <div className="account-record-list">{data.applications.map((application) => <article key={application.id} className="account-record account-record-admin"><div><strong>{application.candidateName} · {application.jobTitle}</strong><small>{application.candidateEmail} · {new Date(application.createdAt).toLocaleDateString()}</small><span className={`status-pill status-${application.status}`}>{application.status}</span></div><div className="admin-actions"><button className="button button-outline" disabled={busyId === application.id} onClick={() => updateApplication(application.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyId === application.id} onClick={() => updateApplication(application.id, "shortlisted")}>{busyId === application.id ? "Saving..." : "Shortlist"}</button></div></article>)}</div>}</section>}
      </main>
    </PageShell>
  );
}
