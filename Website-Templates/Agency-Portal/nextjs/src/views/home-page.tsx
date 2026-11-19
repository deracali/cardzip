'use client';

import { useEffect, useState } from 'react'
import Link from "next/link";
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
import type { CaseStudy, User } from "../services/agency-api";

export default function HomePage() {
  const [budget, setBudget] = useState('$5k–$15k')
  const [submitted, setSubmitted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [testimonial, setTestimonial] = useState(0)
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [caseStudiesLoaded, setCaseStudiesLoaded] = useState(false)
  const [caseStudiesError, setCaseStudiesError] = useState(false)
  useEffect(() => {
    const currentUser = getSessionUser()
    if (currentUser?.role === "client") setUser(currentUser)
  }, [])
  useEffect(() => {
    agencyApi.publicCaseStudies()
      .then(({ caseStudies: records }) => setCaseStudies(records))
      .catch(() => setCaseStudiesError(true))
      .finally(() => setCaseStudiesLoaded(true))
  }, [])

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) {
      window.location.assign(`/login?redirect=${encodeURIComponent("/quote")}`)
      return
    }
    const values = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      await agencyApi.inquiries.submit({
        phone: String(values.get("phone") || ""),
        project: String(values.get("project") || ""),
        budget: String(values.get("budget") || budget),
      })
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Your project brief could not be sent.")
    } finally {
      setBusy(false)
    }
  }
  const testimonials = [
    { quote: '“Nova took us from template hell to a site that actually sells. Pipeline up 212% in one quarter.”', person: 'Maya Keller, CMO — Vertex', detail: 'Verified client · SaaS project', initials: 'MK' },
    { quote: '“The team understood our brand on day one and shipped an experience our customers love using.”', person: 'Isaac Newton, Founder — Nexora', detail: 'Verified client · Commerce project', initials: 'IN' },
    { quote: '“A rare creative partner who can make it beautiful and prove it works.”', person: 'Ava Chen, VP Product — Lumen', detail: 'Verified client · Product design', initials: 'AC' },
  ]
  return (
    <div className="agency-app">
      <Header active="work" />
      <main>
        <section className="hero-section" id="work">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="booking-pill"><i /> Booking new projects for 2026 — 2 slots left</span>
              <h1>We Build Digital Experiences <span>That Drive Growth</span></h1>
              <p>Full-stack creative agency for ambitious brands. Branding, websites, 3D motion &amp; product design — shipped fast, measured in revenue.</p>
              <div className="hero-buttons"><Link className="button button-cyan" href="/quote">Get a Quote <ArrowRight size={14} /></Link><Link className="button button-outline" href="/work"><Play size={13} fill="currentColor" /> View Showreel</Link></div>
              <div className="hero-stats"><div><strong>240+</strong><span>Projects shipped</span></div><div><strong>18 Awards</strong><span>Recognized worldwide</span></div><div><strong>98% Retention</strong><span>Clients stay</span></div></div>
            </div>
            <HeroPreview project={caseStudies[0] || featuredProject} />
          </div>
        </section>

        <div className="client-strip" aria-label="Selected clients">
          <span>VERTEX</span><span>Lumina®</span><span>HELIX</span><span>Northbeam</span><span>OPAL &amp; CO</span><span>Kinfolk</span>
        </div>

        <section className="work-section section-shell" id="case-studies">
          <div className="section-heading">
            <div><span className="section-kicker">SELECTED WORK</span><h2>Case studies with receipts.</h2></div>
            <Link className="button button-outline" href="/work">View all work <ArrowRight size={13} /></Link>
          </div>
          <div className="project-grid">
            {(caseStudies.length ? caseStudies : projects).map((project) => (
              <Link className="project-card" href={`/case-studies/${project.id}`} key={project.name}>
                <ProjectArtwork project={project} />
                <div className="project-card-copy"><span className="project-type">{project.type}</span><strong>{project.name}</strong><span>{project.client}</span><span className="project-arrow"><ArrowUpRight size={15} /></span></div>
              </Link>
            ))}
          </div>
          {caseStudiesError && <p className="page-loading" role="status">Published case studies could not be loaded. Showing sample work.</p>}
          {!caseStudiesLoaded && <p className="page-loading" role="status">Loading case studies…</p>}
        </section>

        <section className="services-section section-shell" id="services">
          <div className="section-heading"><div><span className="section-kicker">WHAT WE MAKE</span><h2>Small team. Unfair range.</h2></div><p>One creative partner from the first sketch to the final shipped pixel.</p></div>
          <div className="service-grid">
            <article><span className="service-icon"><Sparkles size={18} /></span><h3>Brand &amp; identity</h3><p>Distinctive identities, strategy, and art direction that make you impossible to confuse.</p><span>Strategy · Identity · Campaigns</span></article>
            <article><span className="service-icon"><Globe2 size={18} /></span><h3>Digital experiences</h3><p>Fast, beautiful websites and commerce experiences designed to turn attention into action.</p><span>Websites · E-commerce · Product</span></article>
            <article><span className="service-icon"><Zap size={18} /></span><h3>Motion &amp; 3D</h3><p>Stop-the-scroll visual stories, product films, and interactive worlds with a pulse.</p><span>3D · Motion · WebGL</span></article>
          </div>
        </section>

        <section className="proof-contact section-shell" id="about">
          <article className="testimonial-card">
            <span className="rating">★★★★★</span>
            <blockquote>{testimonials[testimonial].quote}</blockquote>
            <div className="testimonial-person"><span className="person-avatar">{testimonials[testimonial].initials}</span><span><strong>{testimonials[testimonial].person}</strong><small>{testimonials[testimonial].detail}</small></span></div>
            <div className="testimonial-controls"><span className="testimonial-dots">{testimonials.map((item, index) => <i className={index === testimonial ? 'selected' : ''} key={item.initials} />)}</span><button aria-label="Previous testimonial" type="button" onClick={() => setTestimonial((testimonial + testimonials.length - 1) % testimonials.length)}><ArrowLeft size={13} /></button><button aria-label="Next testimonial" type="button" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ArrowRight size={13} /></button></div>
          </article>
          <section className="quote-card" id="project-form">
            <span className="section-kicker">— PROJECT QUOTE</span><h2>Tell us about your project.</h2><p>Get a scoped proposal + timeline in 48 hours. No fluff.</p>
            {submitted ? (
              <div className="quote-success" role="status"><Check size={18} /><span><strong>Thanks — your brief is in.</strong><small>We’ll follow up within two business days.</small></span></div>
            ) : !user ? (
              <div><p>Sign in or create a client account to send and track your project inquiry.</p><Link className="button button-cyan full-width" href={`/login?redirect=${encodeURIComponent("/quote")}`}>Sign in to send a brief <ArrowRight size={14} /></Link><small className="quote-note">New to NOVA? <Link href={`/signup?redirect=${encodeURIComponent("/quote")}`}>Create a client account</Link>.</small></div>
            ) : (
              <form onSubmit={submitInquiry}>
                <p className="quote-note">Submitting as {user.name} · {user.email}</p>
                <label className="quote-form-label">Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
                <label className="quote-message"><span className="visually-hidden">Project details</span><textarea name="project" placeholder="What do you need? e.g. Website, brand, 3D motion..." rows={3} required /></label>
                <fieldset className="budget-options"><legend>Budget range</legend>{['$2k–$5k', '$5k–$15k', '$15k–$40k', '$40k+'].map((option) => <label className={budget === option ? 'selected' : ''} key={option}><input type="radio" name="budget" value={option} checked={budget === option} onChange={() => setBudget(option)} />{option}</label>)}</fieldset>
                {error && <p className="auth-notice" role="alert">{error}</p>}
                <button className="button button-cyan full-width" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Request Quote'} <ArrowRight size={14} /></button>
                <small className="quote-note">Avg. response time: 6 hours · NDA on request</small>
              </form>
            )}
          </section>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
