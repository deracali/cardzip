"use client";

import { useState } from "react";
import {
  ArrowRight, Clock3, LockKeyhole, Mail, ShieldCheck, Smartphone, UserRound, Zap
} from "lucide-react";
import { AuthField, Logo } from "../components/Shared";
import { apiRequest } from "../services/api";
import "../admin.css";
export default function AuthPage({ signup = false, adminLogin = false }: { signup?: boolean; adminLogin?: boolean }) {
  const [accountType, setAccountType] = useState('Personal / Driver')
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    const form = new FormData(event.currentTarget)
    const endpoint = signup ? "/auth/register" : "/auth/login"
    try {
      const result = await apiRequest<{ user?: { role: string }; error?: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          admin: adminLogin,
        }),
      });
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const safeNextPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/dashboard";
      window.location.href = result.user?.role === "admin" ? "/admin" : safeNextPath;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to continue.");
    }
  }

  if (adminLogin) return (
    <main className="portal-auth-page">
      <section className="portal-auth-art"><Logo light /><div className="portal-auth-copy"><span className="portal-eyebrow">VOLTIGO OPERATIONS</span><h1>Run every trip from one place.</h1><p>Manage reservations, fleet availability, and your renter community in a focused workspace.</p><div className="auth-benefits"><span><Clock3 size={14} /> Live reservation updates</span><span><ShieldCheck size={14} /> Protected administrator access</span></div></div><span className="portal-auth-foot">Voltigo Rental · Administrator access</span></section>
      <section className="portal-auth-form-wrap"><a className="portal-auth-back" href="/">← Back to Voltigo</a><h2>Admin sign in</h2><p>Use your administrator account to manage the rental operation.</p>
        <form className="portal-auth-form" onSubmit={handleSubmit}><label>Email address<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required /></label><button className="portal-primary" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide password" : "Show password"}</button><button className="portal-primary" type="submit">Sign in to workspace <ArrowRight size={15} /></button></form>
        {notice && <p className="portal-alert" role="alert">{notice}</p>}
      </section>
    </main>
  );

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-top"><Logo light /><span className="auth-live"><span className="status-dot" /> 2,400+ vehicles online now</span></div>
        <div className="auth-visual-copy">
          <p className="section-kicker">MOVE AT YOUR OWN PACE</p>
          <h1>{signup ? <>Your next journey<br />starts here.</> : <>Seamless Mobility &amp;<br />Delivery at Your<br />Fingertips</>}</h1>
          <p>Manage bookings, deliveries and fleet in one place.</p>
          <div className="auth-benefits"><span><Clock3 size={14} /> 32 min avg delivery</span><span><ShieldCheck size={14} /> Insured fleet</span><span><Smartphone size={14} /> Phone unlock</span></div>
        </div>
        <div className="auth-visual-foot"><span>© 2026 Voltigo Mobility</span><span>SOC2 · Insured · 24/7 support</span></div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <a className="back-home" href="/"><ArrowRight size={13} /> Back to home</a>
          <span className="auth-symbol"><Zap size={19} fill="currentColor" /></span>
          <h2>{signup ? 'Get Started' : 'Access Your Account'}</h2>
          <p className="auth-subtitle">{signup ? 'Create your rental or fleet account in under 2 minutes.' : 'Manage bookings, deliveries and fleet in one place.'}</p>
          <form onSubmit={handleSubmit}>
            {signup && (
              <>
                <div className="account-switch" role="group" aria-label="Account type">
                  {['Personal / Driver', 'Business / Fleet'].map((type) => <button type="button" key={type} className={accountType === type ? 'active' : ''} aria-pressed={accountType === type} onClick={() => setAccountType(type)}>{type}</button>)}
                </div>
                <label className="auth-field"><span>Full Name</span><span className="auth-input"><UserRound size={14} /><input name="name" type="text" placeholder="Jordan Miles" autoComplete="name" required /></span></label>
                <div className="auth-field-row">
                  <AuthField label="Driver’s License Number" icon={<ShieldCheck size={14} />} type="text" placeholder="DL-8841-2093" />
                  <AuthField label="Phone Number" icon={<Smartphone size={14} />} type="tel" placeholder="+1 (555) 014-8820" autoComplete="tel" />
                </div>
              </>
            )}
            <label className="auth-field"><span>Email</span><span className="auth-input"><Mail size={14} /><input name="email" type="email" placeholder="alex@company.com" autoComplete="email" required /></span></label>
            <label className="auth-field">
              <span>{signup ? 'Password' : 'Password'}</span>
              <span className="auth-input"><LockKeyhole size={14} /><input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••••" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required /><button className="show-password" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((show) => !show)}>{showPassword ? 'Hide' : 'Show'}</button></span>
            </label>
            {!signup && <div className="auth-options"><label><input type="checkbox" defaultChecked /> Remember Me</label><a href="/admin/login">Admin sign in</a></div>}
            {signup && <label className="auth-consent"><input type="checkbox" required /> I agree to the <a href="/#support">Terms of Service</a> and Privacy Policy.</label>}
            <button className="button auth-submit" type="submit">{signup ? 'Create Account' : 'Sign In'} <ArrowRight size={14} /></button>
          </form>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <p className="auth-switch">{signup ? 'Already registered?' : "Don't have an account?"} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign In' : 'Sign Up'}</a></p>
        </div>
        {signup && <aside className="signup-benefits"><div><Zap size={17} /><strong>Your ride is unlocked by phone</strong><span>No lines. Clean pickup. Full tank before you arrive.</span></div></aside>}
      </section>
    </main>
  )
}
