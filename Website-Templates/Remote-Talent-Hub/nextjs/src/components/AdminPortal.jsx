"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PageShell from "./PageShell";
import { apiRequest, clearToken, getToken } from "../services/api";

export default function AdminPortal() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyJob, setBusyJob] = useState("");

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return () => { active = false; };
    }
    apiRequest("/admin/dashboard", { token }).then((result) => {
      if (active) setData(result);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [router]);

  async function reviewJob(id, status) {
    setError("");
    setBusyJob(id);
    try {
      const result = await apiRequest(`/admin/jobs/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: { status },
      });
      setData((current) => ({
        ...current,
        jobs: current.jobs.map((job) => job.id === id ? result.job : job),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyJob("");
    }
  }

  function signOut() {
    clearToken();
    router.replace("/admin/login");
  }

  if (loading) return <PageShell><main className="wrap simple-page">Loading the protected admin workspace...</main></PageShell>;
  if (error && !data) return <PageShell><main className="wrap simple-page"><p className="api-notice api-notice-error" role="alert">{error}</p><Link className="button button-purple" href="/admin/login">Admin sign in <ArrowRight size={14} /></Link></main></PageShell>;
  if (!data) return null;

  return (
    <PageShell>
      <main className="wrap account-page">
        <div className="account-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>Operations dashboard</h1><p>Review accounts, candidate applications and employer job listings.</p></div><button className="button button-outline" onClick={signOut}>Sign out</button></div>
        {error && <p className="api-notice api-notice-error" role="alert">{error}</p>}
        <section className="account-summary"><article><strong>{data.users.length}</strong><span>Accounts</span></article><article><strong>{data.jobs.length}</strong><span>Job listings</span></article><article><strong>{data.applications.length}</strong><span>Applications</span></article></section>
        <section className="info-panel account-panel"><h2>Job listing review</h2>{data.jobs.length === 0 ? <p className="empty-account">No listings have been submitted.</p> : <div className="account-record-list">{data.jobs.map((job) => <article key={job.id} className="account-record account-record-admin"><div><strong>{job.title}</strong><small>{job.employerName} · {job.category} · {job.location}</small><span className={`status-pill status-${job.status}`}>{job.status.replaceAll("_", " ")}</span>{job.paymentStatus !== "paid" && <small>Unpaid preview; approval will not publish this listing.</small>}</div><div className="admin-actions"><button className="button button-outline" disabled={busyJob === job.id} onClick={() => reviewJob(job.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyJob === job.id} onClick={() => reviewJob(job.id, "approved")}>{busyJob === job.id ? "Saving..." : "Approve"}</button></div></article>)}</div>}</section>
        <section className="info-panel account-panel"><h2>Candidate applications</h2>{data.applications.length === 0 ? <p className="empty-account">No applications have been submitted.</p> : <div className="account-record-list">{data.applications.map((application) => <article key={application.id} className="account-record"><div><strong>{application.jobTitle}</strong><small>{application.candidateName} · {application.candidateEmail} · {new Date(application.createdAt).toLocaleDateString()}</small></div><span className={`status-pill status-${application.status}`}>{application.status}</span></article>)}</div>}</section>
        <section className="info-panel account-panel"><h2>Registered accounts</h2><div className="account-record-list">{data.users.map((user) => <article key={user.id} className="account-record"><div><strong>{user.name}</strong><small>{user.email}</small></div><span className="status-pill">{user.role}</span></article>)}</div></section>
      </main>
    </PageShell>
  );
}
