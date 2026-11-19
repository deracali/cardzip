"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LayoutDashboard, Mail, Play, ShieldCheck } from "lucide-react";
import { Brand, Header } from "../components/Shared";
import { agencyApi, saveSession } from "../services/agency-api";

export default function AuthPage({ signup = false }: { signup?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [returnTo, setReturnTo] = useState("/dashboard");

  useEffect(() => {
    const redirectPath = new URLSearchParams(window.location.search).get("redirect");
    if (redirectPath?.startsWith("/") && !redirectPath.startsWith("//") && !redirectPath.includes("\\")) {
      setReturnTo(redirectPath);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setNotice("");
    setBusy(true);
    try {
      const session = signup
        ? await agencyApi.auth.signupClient({
          name: String(values.name),
          company: String(values.company),
          email: String(values.email),
          password: String(values.password),
        })
        : await agencyApi.auth.login({
          email: String(values.email),
          password: String(values.password),
          expectedRole: "client",
        });
      if (session.user.role !== "client") throw new Error("This account does not have client portal access.");
      saveSession(session);
      window.location.assign(returnTo);
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portal-shell">
      <Header portal />
      <main className="auth-layout">
        <section className="auth-visual">
          <div className="auth-photo" />
          <span className="auth-pill"><i /> {signup ? "Client onboarding" : "Client workspace"}</span>
          <div className="auth-visual-copy">
            <span className="eyebrow">NOVA STUDIO · CLIENT PORTAL</span>
            <h1>{signup ? "Create your client workspace." : "Manage your projects in one place."}</h1>
            <p>{signup ? "Sign up to access project updates, invoices, and messages from your studio." : "Sign in to track milestones, review invoices, and message your studio."}</p>
            <div className="auth-highlights"><Link href="/work"><span className="play-circle"><Play size={13} fill="currentColor" /></span> Explore our work</Link><span><strong>Client portal</strong><small>Projects · Invoices · Messages</small></span></div>
          </div>
        </section>
        <section className="auth-panel">
          <Link className="back-home" href="/"><ArrowLeft size={14} /> Back to NOVA Studio</Link>
          <div className="auth-panel-brand"><Brand compact /></div>
          <h2>{signup ? "Create Account" : "Client Portal Login"}</h2>
          <p className="auth-subtitle">{signup ? "Create an account to access your studio workspace." : "View your active project progress and invoices."}</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {signup && <div className="auth-fields two-col">
              <label>Full name<input name="name" autoComplete="name" required /></label>
              <label>Company / Brand<input name="company" autoComplete="organization" required /></label>
            </div>}
            <label>Work Email<span className="input-icon-field"><Mail size={14} /><input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></span></label>
            <label>{signup ? "Create Password" : "Password"}<span className="password-field">
              <input name="password" type={showPassword ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </span></label>
            {signup && <label className="terms-check"><input type="checkbox" required /> <span>I agree to the <Link href="/about">Terms</Link> and <Link href="/about">Privacy Policy</Link></span></label>}
            {!signup && <div className="login-options"><span><ShieldCheck size={14} /> Secure client sign-in</span><Link href="/forgot-password">Forgot Password?</Link></div>}
            <button className="button button-cyan full-width" type="submit" disabled={busy}>{busy ? "Please wait…" : signup ? "Create Account" : "Sign In"} <ArrowRight size={14} /></button>
          </form>
          {notice && <p className="auth-notice" role="alert">{notice}</p>}
          <p className="auth-switch">{signup ? "Already have an account?" : "New client?"} <Link href={`${signup ? "/login" : "/signup"}?redirect=${encodeURIComponent(returnTo)}`}>{signup ? "Sign in" : "Register here"}</Link></p>
          <p className="auth-switch">Studio admin? <Link href="/admin/login">Admin sign in</Link></p>
          {!signup && <Link className="preview-dashboard-link" href="/dashboard"><LayoutDashboard size={14} /> Open client dashboard</Link>}
        </section>
      </main>
      <footer className="portal-footer"><ShieldCheck size={13} /> Secure client workspace · <Link href="/">Nova Studio</Link></footer>
    </div>
  );
}
