"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { homeServiceApi, saveSession, type HomeRole } from "../lib/homeServiceApi";

type Props = { mode: "login" | "signup"; expectedRole?: HomeRole };

export default function AuthForm({ mode, expectedRole = "client" }: Props) {
  const router = useRouter();
  const signup = mode === "signup";
  const admin = expectedRole === "admin";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (signup && form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const session = signup
        ? await homeServiceApi.signup({ name: form.name, email: form.email, phone: form.phone, password: form.password })
        : await homeServiceApi.login({ email: form.email, password: form.password, expectedRole });
      if (!session.token || !session.user || session.user.role !== (signup ? "client" : expectedRole)) {
        throw new Error("The FixFlow API returned an invalid account session.");
      }
      saveSession(session);
      if (admin) {
        router.replace("/admin");
      } else {
        const next = new URLSearchParams(window.location.search).get("next");
        router.replace(next?.startsWith("/book-now") ? next : "/dashboard");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/"><span className="brand-mark">F</span><span>FixFlow Pro<small>PLUMBING · HVAC · REPAIR</small></span></Link>
        <span className="eyebrow">{admin ? "AUTHORIZED TEAM ACCESS" : "FIXFLOW PRO ACCOUNT"}</span>
        <h1>{signup ? "Create your client account" : admin ? "Administrator sign in" : "Welcome back"}</h1>
        <p>{signup ? "Book services and keep track of every request." : "Sign in to manage home service requests."}</p>
        <form className="portal-form" onSubmit={submit}>
          {signup && <>
            <label>Full name<input required maxLength={120} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Phone number<input maxLength={40} autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          </>}
          <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Password<input required minLength={8} type="password" autoComplete={signup ? "new-password" : "current-password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          {signup && <label>Confirm password<input required minLength={8} type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-orange" disabled={busy}>{busy ? "Please wait..." : signup ? "Create account" : "Sign in"}</button>
        </form>
        {!admin
          ? <p className="auth-note">{signup ? "Already have a client account?" : "New to FixFlow?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</Link></p>
          : <p className="auth-note">Administrator accounts are managed by the API environment; public signup cannot create admins.</p>}
      </section>
    </main>
  );
}
