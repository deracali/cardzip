"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, salonApi, saveSession, type SalonRole } from "../lib/salonApi";
import { SalonFooter } from "./SalonShell";

export default function SalonAuthForm({ mode, expectedRole = "client" }: { mode: "login" | "signup"; expectedRole?: SalonRole }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const signup = mode === "signup";
  const admin = expectedRole === "admin";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const session = signup
        ? await salonApi.signup({ name: String(form.get("name") || ""), email: String(form.get("email") || ""), phone: String(form.get("phone") || ""), password: String(form.get("password") || "") })
        : await salonApi.login({ email: String(form.get("email") || ""), password: String(form.get("password") || "") });
      if (session.user.role !== (signup ? "client" : expectedRole)) {
        clearSession();
        throw new Error(admin ? "This account does not have administrator access." : "Use the administrator sign-in page for this account.");
      }
      saveSession(session);
      const next = new URLSearchParams(window.location.search).get("next");
      const adminPath = next?.startsWith("/admin");
      const safeNext = next?.startsWith("/") && !next.startsWith("//") && (admin ? adminPath : !adminPath) ? next : null;
      router.replace(signup ? "/dashboard" : safeNext || (admin ? "/admin" : "/dashboard"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not authenticate your account.");
    } finally {
      setBusy(false);
    }
  }

  return <><main className="salon-account-page"><Link className="salon-brand account-brand" href="/"><span className="salon-brand-mark">L</span><span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span></Link><section className="salon-account-card"><span className="salon-kicker">{admin ? "STUDIO ADMINISTRATION" : "YOUR LUMIÈRE ACCOUNT"}</span><h1>{signup ? "Create your client account" : admin ? "Administrator sign in" : "Welcome back"}</h1><p>{signup ? "Create an account to request appointments and keep track of your visits." : admin ? "Sign in using the administrator credentials configured on the salon API." : "Sign in to request appointments and see your upcoming salon visits."}</p><form className="salon-account-form" onSubmit={submit}>{signup && <><label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label></>}<label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} required /></label>{error && <p className="salon-form-error" role="alert">{error}</p>}<button className="salon-button salon-button-primary" disabled={busy}>{busy ? "Please wait..." : signup ? "Create account" : "Sign in"}</button></form>{admin ? <p className="salon-account-note">Admin accounts are created from private backend configuration. Public registration only creates clients.</p> : <p className="salon-account-switch">{signup ? "Already registered?" : "New to Lumière?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create a client account"}</Link></p>}<Link className="salon-back-link" href="/">← Back to Lumière</Link></section></main><SalonFooter /></>;
}
