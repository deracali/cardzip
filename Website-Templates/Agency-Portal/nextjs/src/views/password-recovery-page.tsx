"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageLayout } from "../components/Shared";
import { agencyApi } from "../services/agency-api";

export default function PasswordRecoveryPage({ reset = false }: { reset?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [complete, setComplete] = useState(false);
  const tokenFromUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || "" : "";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      if (reset) {
        const result = await agencyApi.auth.resetPassword(String(form.get("token") || tokenFromUrl), String(form.get("password") || ""));
        setNotice(result.message);
      } else {
        const result = await agencyApi.auth.forgotPassword(String(form.get("email") || ""));
        setNotice(result.message);
        if (result.resetToken) setResetLink(`${window.location.origin}/reset-password?token=${encodeURIComponent(result.resetToken)}`);
      }
      setComplete(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageLayout>
      <main className="route-page recovery-route">
        <section className="quote-card recovery-card">
          <span className="section-kicker">CLIENT PORTAL</span>
          <h1>{complete ? "Request complete" : reset ? "Choose a new password" : "Reset your password"}</h1>
          {complete ? (
            <div className="quote-success" role="status"><ShieldCheck size={18} /><span><strong>{notice}</strong>{resetLink && <small><a href={resetLink}>Continue to reset password</a></small>}<small><Link href="/login">Return to sign in</Link></small></span></div>
          ) : (
            <form className="agency-recovery-form" onSubmit={submit}>
              {reset ? <>{!tokenFromUrl && <label>Reset token<input name="token" autoComplete="off" required /></label>}<label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label></> : <label>Work email<input name="email" type="email" autoComplete="email" required /></label>}
              {notice && <p className="auth-notice" role="alert">{notice}</p>}
              <button className="button button-cyan full-width" type="submit" disabled={busy}>{busy ? "Please wait…" : reset ? "Update password" : "Send reset link"} <ArrowRight size={14} /></button>
            </form>
          )}
          <p className="recovery-links"><Link href="/login">Client sign in</Link> · <Link href="/admin/login">Admin sign in</Link></p>
        </section>
      </main>
    </PageLayout>
  );
}
