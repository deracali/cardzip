"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { eventHubApi } from "../lib/eventHubApi";

export default function AuthForm({ mode, expectedRole }: { mode: "login" | "signup"; expectedRole?: "admin" }) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"attendee" | "organizer">("attendee");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode === "signup" && new URLSearchParams(window.location.search).get("accountType") === "organizer") {
      setAccountType("organizer");
    }
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    try {
      const result = mode === "signup"
        ? await eventHubApi.register({ name: String(form.get("name") || ""), email, password, accountType })
        : await eventHubApi.login({ email, password });
      if (expectedRole && result.user.role !== expectedRole) {
        await eventHubApi.logout();
        throw new Error("This account does not have administrator access.");
      }
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const isAttendeePath = requestedPath === "/dashboard" || requestedPath?.startsWith("/dashboard/") || requestedPath?.startsWith("/checkout/");
      const isOrganizerPath = requestedPath === "/organizer/dashboard" || requestedPath?.startsWith("/organizer/dashboard/");
      const isAdminPath = requestedPath === "/admin" || requestedPath?.startsWith("/admin/");
      const safeRequestedPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        && (result.user.role === "attendee" ? isAttendeePath : result.user.role === "organizer" ? isOrganizerPath : isAdminPath)
        ? requestedPath
        : null;
      const destination = result.user.role === "admin"
        ? "/admin"
        : result.user.role === "organizer"
          ? "/organizer/dashboard"
          : "/dashboard/tickets";
      router.replace(safeRequestedPath || destination);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <Link className="brand" href="/">Pulse<span>Live</span></Link>
        <span className="eyebrow">{mode === "signup" ? "JOIN PULSELIVE" : "YOUR PULSELIVE ACCOUNT"}</span>
        <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p>{mode === "signup" ? "Save events and keep your booking requests together." : "Sign in to review bookings or manage your event workspace."}</p>
        {mode === "signup" && <>
          <label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
          <fieldset className="account-type-field">
            <legend>Choose your account</legend>
            <div className="account-type-options" role="radiogroup" aria-label="Account type">
              <button className={accountType === "attendee" ? "account-type-option selected" : "account-type-option"} type="button" role="radio" aria-checked={accountType === "attendee"} onClick={() => setAccountType("attendee")}><strong>Attendee</strong><small>Discover events and manage tickets</small></button>
              <button className={accountType === "organizer" ? "account-type-option selected" : "account-type-option"} type="button" role="radio" aria-checked={accountType === "organizer"} onClick={() => setAccountType("organizer")}><strong>Organizer</strong><small>Host events · approval required</small></button>
            </div>
          </fieldset>
        </>}
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>Password<input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} required /></label>
        {error && <p className="api-error" role="alert">{error}</p>}
        <button className="button button-primary" disabled={busy}>{busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}</button>
        <p className="auth-switch">{mode === "signup" ? "Already registered?" : "New to PulseLive?"} <Link href={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? "Sign in" : "Create account"}</Link></p>
        {mode === "signup" && <small>Administrator accounts are created from backend configuration, never through public signup.</small>}
      </form>
    </main>
  );
}
