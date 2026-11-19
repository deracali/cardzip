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
import { agencyApi, getSessionUser } from "../services/agency-api";
import type { User } from "../services/agency-api";

export default function QuotePage() {
  const [budget, setBudget] = useState('$5k–$15k')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = getSessionUser()
    if (!currentUser || currentUser.role !== "client") {
      window.location.replace(`/login?redirect=${encodeURIComponent("/quote")}`)
      return
    }
    setUser(currentUser)
  }, [])

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      await agencyApi.inquiries.submit({
        phone: String(form.get('phone') || ''),
        project: String(form.get('project') || ''),
        budget: String(form.get('budget') || budget),
      })
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Your project brief could not be sent.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <PageLayout>
      <div className="route-page quote-page">
        <PageIntro label="PROJECT QUOTE" title={<>Let’s make something<br /><em>worth remembering.</em></>} description="Share a little about your project. A real person from our studio will get back to you within two business days." />
        <div className="quote-route-layout">
          <section className="quote-card" id="project-form">
            <h2>Tell us about your project.</h2><p>More context helps us find the right creative collaborators for your brief.</p>
            {submitted ? (
              <div className="quote-success" role="status"><Check size={18} /><span><strong>Thanks — your brief is in.</strong><small>We’ll follow up within two business days.</small></span></div>
            ) : !user ? (
              <p className="dashboard-notice" role="status">Checking your client account…</p>
            ) : (
              <form onSubmit={submitInquiry}>
                <p className="quote-note">Submitting as {user.name} · {user.email}</p>
                <label className="quote-form-label">Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
                <label className="quote-form-label">What are you building?<textarea name="project" placeholder="Tell us about your goals, audience, and what you need help with..." rows={5} required /></label>
                <fieldset className="budget-options"><legend>Estimated budget</legend>{['$2k–$5k', '$5k–$15k', '$15k–$40k', '$40k+'].map((option) => <label className={budget === option ? 'selected' : ''} key={option}><input type="radio" name="budget" value={option} checked={budget === option} onChange={() => setBudget(option)} />{option}</label>)}</fieldset>
                {error && <p className="auth-notice" role="alert">{error}</p>}
                <button className="button button-cyan full-width" type="submit" disabled={busy}>{busy ? 'Sending brief…' : 'Send project brief'} <ArrowRight size={14} /></button>
                <small className="quote-note">Your project details stay private · NDA available on request</small>
              </form>
            )}
          </section>
          <aside className="quote-aside"><span className="section-kicker">WHAT HAPPENS NEXT</span><ol><li><b>01</b><span><strong>We read your brief</strong><small>A studio lead reviews every inquiry.</small></span></li><li><b>02</b><span><strong>We set up a quick call</strong><small>Get aligned on goals, timing, and fit.</small></span></li><li><b>03</b><span><strong>You get a clear proposal</strong><small>Scope, team, timeline, and investment.</small></span></li></ol><p><ShieldCheck size={14} /> No pressure. No spam. Just a thoughtful response.</p></aside>
        </div>
      </div>
    </PageLayout>
  )
}
