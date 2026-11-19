"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { marketplaceApi, saveMarketplaceSession } from "../lib/marketplaceApi";

export default function AuthForm({ signup = false, admin = false }: { signup?: boolean; admin?: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "vendor">("client");
  const [redirect, setRedirect] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (signup && params.get("accountType") === "vendor") setRole("vendor");
    setRedirect(params.get("redirect"));
  }, [signup]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const session = signup
        ? await marketplaceApi.signup({ name, email, password, role })
        : await marketplaceApi.login({ email, password, ...(admin ? { expectedRole: "admin" as const } : {}) });
      saveMarketplaceSession(session);
      const safeReturn = redirect && redirect.startsWith("/") && !redirect.startsWith("//") && !redirect.startsWith("/admin") ? redirect : null;
      router.push(session.user.role === "admin" ? "/admin" : session.user.role === "vendor" ? "/vendor/dashboard" : safeReturn || "/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="market-auth-page">
    <section className="market-auth-intro"><span className="market-eyebrow">{admin ? "MARKETHUB OPERATIONS" : "GOOD SHOPS START HERE"}</span><h1>{admin ? "Marketplace administration." : signup ? "A marketplace for the things you make." : "Welcome back."}</h1><p>{admin ? "Administrator access is provisioned securely by the backend environment." : signup ? "Join thoughtful shoppers and independent sellers." : "Sign in to find your orders, favorite shops, and marketplace activity."}</p></section>
    <section className="market-auth-card">
      <span className="market-eyebrow">{admin ? "ADMINISTRATOR" : signup ? "CREATE AN ACCOUNT" : "YOUR ACCOUNT"}</span>
      <h2>{admin ? "Admin sign in" : signup ? "Join MarketHub" : "Sign in"}</h2>
      <p>{admin ? "There is no public admin signup." : signup ? "Your account is protected by the MarketHub API." : "Use your customer or seller account."}</p>
      {signup && <div className="market-role-switch"><button type="button" className={role === "client" ? "selected" : ""} onClick={() => setRole("client")}>I’m here to shop</button><button type="button" className={role === "vendor" ? "selected" : ""} onClick={() => setRole("vendor")}>I’m a seller</button></div>}
      <form className="market-form" onSubmit={submit}>
        {signup && <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={120} autoComplete="name" /></label>}
        <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete={signup ? "new-password" : "current-password"} /></label>
        {error && <p className="market-error" role="alert">{error}</p>}
        <button className="market-button market-button-primary" disabled={submitting}>{submitting ? "Please wait…" : admin ? "Sign in as admin" : signup ? role === "vendor" ? "Apply as a seller" : "Create account" : "Sign in"}</button>
      </form>
      {signup && role === "vendor" && <p className="market-review-note">Seller applications need admin approval before listings can go live.</p>}
      {!admin && <p className="market-auth-switch">{signup ? "Already registered?" : "New to MarketHub?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</Link></p>}
    </section>
  </main>;
}
