"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { foodApi, saveSession, type FoodRole } from "../lib/foodApi";
import { FoodHeader, FoodFooter } from "./FoodShell";

export default function AuthForm({ mode, expectedRole = "client" }: { mode: "login" | "signup"; expectedRole?: FoodRole }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";
  const admin = expectedRole === "admin";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const session = signup
        ? await foodApi.signup({ name: String(form.get("name") || ""), email: String(form.get("email") || ""), phone: String(form.get("phone") || ""), password: String(form.get("password") || "") })
        : await foodApi.login({ email: String(form.get("email") || ""), password: String(form.get("password") || ""), expectedRole });
      if (session.user.role !== (signup ? "client" : expectedRole)) throw new Error("This account cannot access that portal.");
      saveSession(session);
      const next = new URLSearchParams(window.location.search).get("next");
      const adminPath = next?.startsWith("/admin");
      const safeNext = next?.startsWith("/") && !next.startsWith("//") && (admin ? adminPath : !adminPath) ? next : null;
      router.replace(signup ? "/dashboard" : safeNext || (admin ? "/admin" : "/dashboard"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return <><FoodHeader /><main className="auth-page"><form className="food-auth-card" onSubmit={submit}><span className="food-kicker">{admin ? "AUTHORIZED ADMIN ACCESS" : "SIZZLE&SMILE ACCOUNT"}</span><h1>{signup ? "Create your account" : admin ? "Administrator sign in" : "Welcome back"}</h1><p>{signup ? "Join the neighborhood and keep your orders together." : "Sign in to track orders and manage your account."}</p>{signup && <><label>Full name<input name="name" autoComplete="name" maxLength={120} required /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label></>}<label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} required /></label>{error && <p className="food-error" role="alert">{error}</p>}<button className="food-button" disabled={busy}>{busy ? "Please wait..." : signup ? "Create account" : "Sign in"}</button>{!admin ? <p className="food-auth-switch">{signup ? "Already registered?" : "New to Sizzle&Smile?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create account"}</Link></p> : <p className="food-auth-switch">Admin accounts are seeded from backend environment variables; public signup cannot create admins.</p>}</form></main><FoodFooter /></>;
}
