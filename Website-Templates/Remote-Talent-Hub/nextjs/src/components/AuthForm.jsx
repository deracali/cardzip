"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { apiRequest, saveToken } from "../services/api";

export default function AuthForm({ signup = false, admin = false, defaultRole = "candidate", redirectTo = "" }) {
  const router = useRouter();
  const [role, setRole] = useState(admin ? "admin" : defaultRole);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      role,
    };
    if (signup) {
      body.name = String(form.get("name") || "");
      body.primaryRole = String(form.get("primaryRole") || "");
    }

    setBusy(true);
    try {
      const { token } = await apiRequest(signup ? "/auth/signup" : "/auth/login", {
        method: "POST",
        body,
        token: "",
      });
      saveToken(token);
      router.push(admin ? "/admin" : redirectTo || "/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-promo">
        <Link className="brand brand-inverse" href="/"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span><strong>Remote<span>.ly</span></strong></Link>
        <div className="auth-photo" role="img" aria-label="A calm home office set up for remote work" />
        <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h1>{admin ? "Remote.ly operations" : signup ? "Join our global talent network" : "Welcome back to Remote.ly"}</h1>
        <p>{admin ? "Review accounts, applications and job listings from one protected workspace." : "Find meaningful remote work or connect your team with exceptional talent."}</p>
      </section>
      <section className="auth-card">
        <Link className="auth-home" href="/"><ArrowLeft size={14} /> Back to Remote.ly</Link>
        <Link className="brand" href="/"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span><strong>Remote<span>.ly</span></strong></Link>
        <h2>{admin ? "Administrator sign in" : signup ? "Create your account" : "Sign in"}</h2>
        <p className="auth-subtitle">{admin ? "Admin accounts are provisioned by the API owner." : signup ? "Choose how you will use the talent marketplace." : "Access your candidate or employer workspace."}</p>
        {!admin && <div className="role-switch" role="group" aria-label="Account type">
          <button type="button" className={role === "candidate" ? "selected" : ""} onClick={() => setRole("candidate")}>Candidate</button>
          <button type="button" className={role === "employer" ? "selected" : ""} onClick={() => setRole("employer")}>Employer</button>
        </div>}
        <form onSubmit={submit}>
          {signup && <>
            <label className="field-label">Full name<input name="name" autoComplete="name" minLength={2} placeholder="Alexandra Okafor" required /></label>
            <label className="field-label">{role === "candidate" ? "Primary role" : "Hiring role"}<input name="primaryRole" placeholder={role === "candidate" ? "Full-Stack Engineer" : "Hiring Manager"} /></label>
          </>}
          <label className="field-label">Work email<input name="email" type="email" autoComplete="email" placeholder="alex@example.com" required /></label>
          <label className="field-label">Password<input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} required /></label>
          {error && <p className="api-notice api-notice-error" role="alert">{error}</p>}
          <button className="button button-purple full auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait..." : admin ? "Sign in as administrator" : signup ? "Create account" : "Sign in"}
            <ArrowRight size={15} />
          </button>
        </form>
        {admin
          ? <p className="auth-switch">Admin registration is disabled. <Link href="/login">Client sign in</Link></p>
          : <p className="auth-switch">{signup ? "Already registered?" : "Don't have an account?"} <Link href={signup ? `/login?role=${role}` : `/signup?role=${role}`}>{signup ? "Sign in" : "Sign up"}</Link></p>}
        <p className="auth-security"><ShieldCheck size={13} /> Access is checked by the Remote.ly API.</p>
      </section>
    </main>
  );
}
