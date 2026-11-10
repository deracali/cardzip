"use client";

import { useState } from "react";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, CreditCard, LockKeyhole, Mail, MapPin,
  ShieldCheck, Smartphone, Star, UserRound, WalletCards, Zap
} from "lucide-react";
import { BookingSummary, BookingSearch, Header, Logo, ReviewsSection, SiteFooter, VehicleGrid, AuthField } from "../components/Shared";
import { vehicles } from "../data/vehicles";
import { useBookingDetails } from "../hooks/useBookingDetails";
export default function AuthPage({ signup = false }: { signup?: boolean }) {
  const [accountType, setAccountType] = useState('Personal / Driver')
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(signup ? 'Your account details are ready. Connect a registration service to continue.' : 'Your sign-in form is ready to connect to your account.')
  }

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
                <AuthField label="Full Name" icon={<UserRound size={14} />} type="text" placeholder="Jordan Miles" autoComplete="name" />
                <div className="auth-field-row">
                  <AuthField label="Driver’s License Number" icon={<ShieldCheck size={14} />} type="text" placeholder="DL-8841-2093" />
                  <AuthField label="Phone Number" icon={<Smartphone size={14} />} type="tel" placeholder="+1 (555) 014-8820" autoComplete="tel" />
                </div>
              </>
            )}
            <AuthField label="Email" icon={<Mail size={14} />} type="email" placeholder="alex@company.com" autoComplete="email" />
            <label className="auth-field">
              <span>{signup ? 'Password' : 'Password'}</span>
              <span className="auth-input"><LockKeyhole size={14} /><input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required /><button className="show-password" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((show) => !show)}>{showPassword ? 'Hide' : 'Show'}</button></span>
            </label>
            {!signup && <div className="auth-options"><label><input type="checkbox" defaultChecked /> Remember Me</label><a href="/login">Forgot Password?</a></div>}
            {signup && <label className="auth-consent"><input type="checkbox" required /> I agree to the <a href="/#support">Terms of Service</a> and Privacy Policy.</label>}
            <button className="button auth-submit" type="submit">{signup ? 'Create Account' : 'Sign In'} <ArrowRight size={14} /></button>
          </form>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <div className="auth-divider"><span>OR SIGN IN WITH</span></div>
          <div className="social-buttons"><button type="button" onClick={() => setNotice('Google sign-in can be connected to your identity provider.')}>◎ <span>Google</span></button><button type="button" onClick={() => setNotice('Apple sign-in can be connected to your identity provider.')}>◉ <span>Apple</span></button></div>
          <p className="auth-switch">{signup ? 'Already registered?' : "Don't have an account?"} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign In' : 'Sign Up'}</a></p>
        </div>
        {signup && <aside className="signup-benefits"><div><Zap size={17} /><strong>Your ride is unlocked by phone</strong><span>No lines. Clean pickup. Full tank before you arrive.</span></div></aside>}
      </section>
    </main>
  )
}
