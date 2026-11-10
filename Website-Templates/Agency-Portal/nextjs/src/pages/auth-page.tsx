'use client';

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Eye,
  EyeOff,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Brand, Header, ProjectArtwork, HeroPreview, SiteFooter, PageLayout, PageIntro, ProjectCard, MetricCard } from '../components/Shared';
import { projects, featuredProject, dashboardRows, pageTitles } from '../components/Shared';

export default function AuthPage({ signup = false }: { signup?: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [accountType, setAccountType] = useState('client')
  return (
    <div className="portal-shell">
      <Header portal />
      <main className="auth-layout">
        <section className="auth-visual">
          <div className="auth-photo" />
          <span className="auth-pill"><i /> {signup ? 'Onboarding · 2 min' : 'Showreel 26'}</span>
          <div className="auth-visual-copy"><span className="eyebrow">NOVA STUDIO · CLIENT PORTAL</span><h1>{signup ? 'Create your client workspace.' : 'Manage projects, deliverables & client dashboards.'}</h1><p>{signup ? 'Invite your team, share brand assets and kick off with a scoped proposal.' : 'Track milestones, approve designs and pay invoices in one portal.'}</p><div className="auth-highlights"><a href="/work"><span className="play-circle"><Play size={13} fill="currentColor" /></span> Play showreel <small>2:54 · 24 projects</small></a><span><strong>+248%</strong><small>Avg. client growth</small></span></div></div>
        </section>
        <section className="auth-panel">
          <a className="back-home" href="/"><ArrowLeft size={14} /> Back to NOVA Studio</a>
          <div className="auth-panel-brand"><Brand compact /></div>
          {signup ? (
            <>
              <h2>Create Account</h2><p className="auth-subtitle">Join 2,400+ brands managing work with Nova.</p>
              <div className="account-switch"><button className={accountType === 'client' ? 'selected' : ''} type="button" onClick={() => setAccountType('client')}>Client / Business</button><button className={accountType === 'team' ? 'selected' : ''} type="button" onClick={() => setAccountType('team')}>Team / Freelancer</button></div>
              <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setNotice('Your account is ready to connect to the NOVA Studio client portal.') }}>
                <div className="auth-fields two-col"><label>Full Name<input name="name" autoComplete="name" placeholder="Maya Keller" required /></label><label>Company / Brand<input name="company" autoComplete="organization" placeholder="Vertex Inc." required /></label></div>
                <label>Work Email<input name="email" type="email" autoComplete="email" placeholder="maya@vertex.co" required /></label>
                <label>Create Password<span className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span><small className="field-tip">Use at least 8 characters for a stronger password.</small></label>
                <label className="terms-check"><input type="checkbox" required /> <span>I agree to the <a href="/about">Terms</a> and <a href="/about">Privacy Policy</a></span></label>
                <button className="button button-cyan full-width" type="submit">Create Account <ArrowRight size={14} /></button>
              </form>
            </>
          ) : (
            <>
              <h2>Client &amp; Portal Login</h2><p className="auth-subtitle">View active project progress and invoices.</p>
              <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setNotice('Sign-in is a demo. Use Preview dashboard to view the client portal.') }}>
                <label>Work Email<span className="input-icon-field"><Mail size={14} /><input name="email" type="email" autoComplete="email" defaultValue="maya@vertex.co" required /></span></label>
                <label>Password<span className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" defaultValue="NovaStudio26!" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span></label>
                <div className="login-options"><label className="remember-check"><input type="checkbox" defaultChecked /> Remember Me</label><button type="button" onClick={() => setNotice('Password reset is available once your portal account is connected.')}>Forgot Password?</button></div>
                <button className="button button-cyan full-width" type="submit">Sign In <ArrowRight size={14} /></button>
              </form>
            </>
          )}
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <div className="auth-divider"><span>or continue with</span></div>
          <div className="social-login"><button type="button" onClick={() => setNotice('Google sign-in is not connected yet.')}><b>G</b> Google</button><button type="button" onClick={() => setNotice('Dribbble sign-in is not connected yet.')}><b className="dribbble-mark">●</b> Dribbble</button></div>
          <p className="auth-switch">{signup ? 'Already have an account?' : 'New client?'} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Register here'}</a></p>
          {!signup && <a className="preview-dashboard-link" href="/dashboard"><LayoutDashboard size={14} /> Preview the client dashboard</a>}
        </section>
      </main>
      <footer className="portal-footer"><ShieldCheck size={13} /> Secure client workspace · <a href="/">Nova Studio</a></footer>
    </div>
  )
}
