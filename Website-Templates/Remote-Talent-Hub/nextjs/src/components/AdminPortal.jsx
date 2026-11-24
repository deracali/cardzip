"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { apiRequest, clearToken, getToken } from "../services/api";

const sections = {
  overview: { title: "Operations overview", description: "A live view of marketplace activity and moderation." },
  jobs: { title: "Job listings", description: "Post platform listings and review employer submissions." },
  applications: { title: "Applications", description: "Review candidate applications across the marketplace." },
  accounts: { title: "Accounts", description: "View registered candidates, employers, and administrators." },
};

export default function AdminPortal({ section = "overview" }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyJob, setBusyJob] = useState("");
  const [busyApplication, setBusyApplication] = useState("");
  const [creating, setCreating] = useState(false);
  const activeSection = sections[section] ? section : "overview";

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

  async function createJob(event) {
    event.preventDefault();
    setError("");
    setCreating(true);
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await apiRequest("/admin/jobs", { method: "POST", body });
      setData((current) => ({ ...current, jobs: [result.job, ...current.jobs] }));
      form.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  async function updateApplication(id, status) {
    setError("");
    setBusyApplication(id);
    try {
      const result = await apiRequest(`/admin/applications/${encodeURIComponent(id)}`, {
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
      setBusyApplication("");
    }
  }

  function signOut() {
    clearToken();
    router.replace("/admin/login");
  }

  const navigation = [
    { key: "overview", label: "Overview", href: "/admin", icon: ShieldCheck },
    { key: "jobs", label: "Job listings", href: "/admin/jobs", icon: BriefcaseBusiness },
    { key: "applications", label: "Applications", href: "/admin/applications", icon: CheckCircle2 },
    { key: "accounts", label: "Accounts", href: "/admin/accounts", icon: Users },
  ];

  return (
    <div className="remote-admin-layout">
      <aside className="remote-admin-sidebar">
        <Link className="remote-admin-brand" href="/admin"><span className="brand-icon"><ShieldCheck size={19} /></span><span>Remote.ly<small>ADMIN CONSOLE</small></span></Link>
        <span className="workspace-nav-label">WORKSPACE</span>
        <nav aria-label="Administrator pages">
          {navigation.map(({ key, label, href, icon: Icon }) => <Link className={activeSection === key ? "is-active" : ""} href={href} key={key}><Icon size={17} /> {label}</Link>)}
        </nav>
        <div className="remote-admin-sidebar-footer"><span><i /> Protected workspace</span></div>
      </aside>
      <main className="remote-admin-content">
        <header className="remote-admin-topbar"><span>Administration <b>/</b> {sections[activeSection].title}</span><button className="button button-outline" onClick={signOut}>Sign out</button></header>
        <div className="account-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>{sections[activeSection].title}</h1><p>{sections[activeSection].description}</p></div></div>
        {error && <p className="api-notice api-notice-error" role="alert">{error}</p>}
        {loading && <section className="info-panel"><p>Loading live admin data from the Remote Talent API...</p></section>}
        {error && !data && <section className="info-panel"><Link className="button button-purple" href="/admin/login">Admin sign in <ArrowRight size={14} /></Link></section>}
        {data && activeSection === "overview" && <>
          <section className="account-summary admin-summary">
            <article><Users /><strong>{data.users.length}</strong><span>Registered accounts</span></article>
            <article><BriefcaseBusiness /><strong>{data.jobs.length}</strong><span>Job listings</span></article>
            <article><CheckCircle2 /><strong>{data.applications.length}</strong><span>Applications</span></article>
          </section>
          <section className="remote-admin-shortcuts">
            <Link href="/admin/jobs"><BriefcaseBusiness /><span><strong>Manage job listings</strong><small>Post a platform job or review employer submissions.</small></span><ArrowRight /></Link>
            <Link href="/admin/applications"><CheckCircle2 /><span><strong>Review applications</strong><small>Inspect and update candidate application statuses.</small></span><ArrowRight /></Link>
            <Link href="/admin/accounts"><Users /><span><strong>Browse accounts</strong><small>View all registered user roles and contact details.</small></span><ArrowRight /></Link>
          </section>
        </>}
        {data && activeSection === "jobs" && <>
          <form className="info-panel remote-admin-job-form" onSubmit={createJob}>
            <div className="section-title-row"><div><h2>Post a platform job</h2><p>New admin listings enter review as platform-funded and still require approval before appearing publicly.</p></div></div>
            <div className="remote-admin-job-fields">
              <label className="field-label">Company<input name="employerName" minLength={2} required /></label>
              <label className="field-label">Job title<input name="title" minLength={2} required /></label>
              <label className="field-label">Category<input name="category" minLength={2} required /></label>
              <label className="field-label">Employment type<input name="type" placeholder="Full-time" required /></label>
              <label className="field-label">Work mode<input name="workMode" placeholder="Remote" required /></label>
              <label className="field-label">Location<input name="location" placeholder="Worldwide" required /></label>
              <label className="field-label">Currency<input name="currency" defaultValue="USD" minLength={3} maxLength={3} required /></label>
              <label className="field-label">Minimum salary<input name="minSalary" type="number" min="0" required /></label>
              <label className="field-label">Maximum salary<input name="maxSalary" type="number" min="0" required /></label>
              <label className="field-label">Plan<select name="plan" defaultValue="standard"><option value="standard">Standard</option><option value="featured">Featured</option></select></label>
              <label className="field-label remote-admin-job-wide">Skills<input name="skills" placeholder="React, TypeScript, Accessibility" /></label>
              <label className="field-label remote-admin-job-wide">Description<textarea name="description" rows={4} minLength={30} required /></label>
            </div>
            <button className="button button-purple" type="submit" disabled={creating}>{creating ? "Posting..." : "Post job for review"} <ArrowRight size={14} /></button>
          </form>
          <section className="info-panel account-panel"><h2>Job listings</h2>{data.jobs.length === 0 ? <p className="empty-account">No job listings have been submitted.</p> : <div className="account-record-list">{data.jobs.map((job) => <article key={job.id} className="account-record account-record-admin"><div><strong>{job.title}</strong><small>{job.employerName} · {job.category} · {job.location}</small><span className={`status-pill status-${job.status}`}>{job.status.replaceAll("_", " ")}</span>{job.paymentStatus === "not_required" && <small>Platform listing; no employer payment required.</small>}</div><div className="admin-actions"><button className="button button-outline" disabled={busyJob === job.id} onClick={() => reviewJob(job.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyJob === job.id} onClick={() => reviewJob(job.id, "approved")}>{busyJob === job.id ? "Saving..." : "Approve"}</button></div></article>)}</div>}</section>
        </>}
        {data && activeSection === "applications" && <section className="info-panel account-panel"><h2>Candidate applications</h2>{data.applications.length === 0 ? <p className="empty-account">No applications have been submitted.</p> : <div className="account-record-list">{data.applications.map((application) => <article key={application.id} className="account-record account-record-admin"><div><strong>{application.jobTitle}</strong><small>{application.candidateName} · {application.candidateEmail} · {new Date(application.createdAt).toLocaleDateString()}</small><span className={`status-pill status-${application.status}`}>{application.status}</span></div><div className="admin-actions"><button className="button button-outline" disabled={busyApplication === application.id} onClick={() => updateApplication(application.id, "rejected")}>Reject</button><button className="button button-purple" disabled={busyApplication === application.id} onClick={() => updateApplication(application.id, "reviewed")}>{busyApplication === application.id ? "Saving..." : "Mark reviewed"}</button></div></article>)}</div>}</section>}
        {data && activeSection === "accounts" && <section className="info-panel account-panel"><h2>Registered accounts</h2>{data.users.length === 0 ? <p className="empty-account">No accounts have been registered.</p> : <div className="account-record-list">{data.users.map((user) => <article key={user.id} className="account-record"><div><strong>{user.name}</strong><small>{user.email}</small></div><span className="status-pill">{user.role}</span></article>)}</div>}</section>}
      </main>
    </div>
  );
}
