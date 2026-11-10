import { useState } from 'react'
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

export const projects = [
  {
    id: 'lumen-finance',
    name: 'Lumen Finance Dashboard',
    client: 'Fintech · +46% activation',
    type: 'UI/UX',
    visual: 'project-dashboard',
    image: '',
    alt: 'A dark finance analytics dashboard concept',
    summary: 'A calmer way to see the whole business.',
    description: 'We partnered with Lumen to make complex financial data feel clear and actionable. The new dashboard turns daily reporting into a confident decision-making tool.',
    result: '+46% activation',
    deliverables: ['Product strategy', 'UX research', 'Dashboard design system', 'Frontend engineering'],
  },
  {
    id: 'kinetiq-store',
    name: 'Kinetiq Streetwear Store',
    client: 'E-commerce · 3.2× revenue',
    type: 'E-commerce',
    visual: 'project-fashion',
    image: '/kinetiq-bag.jpg',
    alt: 'A designer handbag photographed for an e-commerce campaign',
    summary: 'A digital flagship built to move culture.',
    description: 'Kinetiq needed a storefront with the energy of its streetwear drops and the clarity shoppers expect. We rebuilt the brand experience around product storytelling and a faster path to checkout.',
    result: '3.2× revenue',
    deliverables: ['Brand direction', 'Commerce UX', 'Shopify build', 'Campaign art direction'],
  },
  {
    id: 'pulse-brand',
    name: 'Pulse Brand in Motion',
    client: 'Branding · 12M views',
    type: '3D Motion',
    visual: 'project-pulse',
    image: '',
    alt: 'Colorful abstract brand artwork',
    summary: 'A visual system with a pulse of its own.',
    description: 'We gave Pulse a flexible motion identity that could live across product launches, social campaigns, and immersive web experiences without losing its unmistakable color.',
    result: '12M campaign views',
    deliverables: ['Visual identity', 'Motion language', '3D toolkit', 'Launch campaign'],
  },
]

export const featuredProject = {
  id: 'aurora-commerce',
  name: 'Aurora Immersive 3D Commerce',
  client: 'Nexora · +372% conversion',
  type: '3D Motion · WebGL',
  visual: 'project-aurora',
  image: '',
  alt: 'A dark immersive commerce experience with vivid green 3D artwork',
  summary: 'A storefront that feels like stepping into another world.',
  description: 'For Nexora, we built an immersive 3D shopping experience that brings a new collection to life. The high-impact visual system pairs real-time product storytelling with a clear, fast path to purchase.',
  result: '+372% conversion',
  deliverables: ['Digital strategy', '3D art direction', 'WebGL development', 'Commerce experience'],
}

export const dashboardRows = [
  { name: 'E-Commerce Platform', category: 'Web Application', amount: '$32,1K', color: 'cyan' },
  { name: 'AI Analytics Dashboard', category: 'AI & Data', amount: '$24,8K', color: 'purple' },
  { name: 'Mobile Banking App', category: 'Mobile App', amount: '$18,7K', color: 'blue' },
  { name: 'SaaS Management Tool', category: 'Dashboard', amount: '$12,9K', color: 'pink' },
]

export const pageTitles: Record<string, string> = {
  '/work': 'Selected Work | NOVA Studio',
  '/services': 'Creative Services | NOVA Studio',
  '/case-studies': 'Case Studies | NOVA Studio',
  '/about': 'About the Creators | NOVA Studio',
  '/quote': 'Start a Project | NOVA Studio',
}


import { useMenuState } from "../hooks/useMenuState";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Project = { id: string; name: string; client: string; type: string; visual: string; image: string; alt: string; summary: string; description: string; result: string; deliverables: string[] };

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className="brand" href="/" aria-label="NOVA Studio home">
      <img src="/favicon.svg" alt="" />
      <span className="brand-copy"><strong>NOVA Studio</strong>{!compact && <small>CREATIVE AGENCY</small>}</span>
    </a>
  )
}

export function Header({ portal = false, active = '' }: { portal?: boolean; active?: string }) {
  const { menuOpen, setMenuOpen } = useMenuState()
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {portal ? (
            <>
              <a href="/work" onClick={() => setMenuOpen(false)}>Work</a>
              <a href="/services" onClick={() => setMenuOpen(false)}>Services</a>
              <a href="/dashboard" onClick={() => setMenuOpen(false)}>Client portal</a>
            </>
          ) : (
            <>
              <a className={active === 'work' ? 'active' : ''} href="/work" onClick={() => setMenuOpen(false)}>Work</a>
              <a className={active === 'services' ? 'active' : ''} href="/services" onClick={() => setMenuOpen(false)}>Services</a>
              <a className={active === 'case-studies' ? 'active' : ''} href="/case-studies" onClick={() => setMenuOpen(false)}>Case Studies</a>
              <a className={active === 'about' ? 'active' : ''} href="/about" onClick={() => setMenuOpen(false)}>About</a>
            </>
          )}
        </nav>
        <div className="header-actions">
          <span className="availability"><i /> Available for Q4</span>
          <a className="button button-cyan header-cta" href="/quote">Get a Quote</a>
        </div>
      </div>
    </header>
  )
}

export function ProjectArtwork({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <div className={`project-art ${project.visual}${featured ? ' project-art-featured' : ''}`} role="img" aria-label={project.alt}>
      {project.image && <img src={project.image} alt="" />}
      {project.visual === 'project-dashboard' && (
        <div className="mini-dashboard">
          <div className="mini-dash-top"><span>LUMEN <b>FINANCE</b></span><i /><i /><i /></div>
          <div className="mini-dash-body">
            <div className="mini-dash-side"><i /><i /><i /><i /><i /></div>
            <div className="mini-dash-content">
              <strong>Good morning, Maya</strong><small>Here's your business overview</small>
              <div className="mini-dash-metrics"><span>$24,890<small>Total revenue</small></span><span>+18.6%<small>Growth</small></span></div>
              <div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
          </div>
        </div>
      )}
      {project.visual === 'project-aurora' && <div className="aurora-art"><span>NEXORA</span><strong>DRIVE<br />GROWTH</strong><i /><b /></div>}
      {project.visual === 'project-fashion' && <span className="art-label">KINETIQ®</span>}
      {project.visual === 'project-pulse' && <div className="pulse-ribbons"><i /><i /><i /></div>}
      {featured && project.visual === 'project-pulse' && <span className="featured-stamp">NEXORA · DIGITAL EXPERIENCE</span>}
    </div>
  )
}

export function HeroPreview() {
  return (
    <div className="hero-preview" aria-label="Featured NOVA Studio digital commerce project">
      <div className="preview-window">
        <div className="preview-browser"><span /><span /><span /><b>NEXORA</b><i>Shop&nbsp;&nbsp; Studio&nbsp;&nbsp; About</i></div>
        <div className="preview-site">
          <span className="preview-kicker">NEW COLLECTION · 2026</span>
          <h2>WE BUILD DIGITAL<br />EXPERIENCES THAT<br /><em>DRIVE GROWTH</em></h2>
          <p>Designed for the next generation of commerce.</p>
          <a href="/case-studies/aurora-commerce">EXPLORE THE COLLECTION <ArrowRight size={10} /></a>
          <div className="preview-art-shape" />
          <div className="preview-site-footer"><b>Featured</b><span>3D Motion · WebGL</span><strong>Aurora — Immersive 3D Commerce</strong><small>+372% conversion rate · 05:45</small></div>
        </div>
      </div>
      <div className="preview-progress"><i /><span /><span /><span /></div>
      <div className="preview-controls"><a href="/case-studies/lumen-finance" aria-label="Previous featured project"><ArrowLeft size={13} /></a><a href="/case-studies/aurora-commerce" aria-label="View featured project"><ArrowRight size={13} /></a></div>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Brand />
      <span>© {new Date().getFullYear()} NOVA Studio — Made for what’s next.</span>
      <nav aria-label="Studio links">
        <a href="/work">Work</a><a href="/services">Services</a><a href="/about">About</a><a href="/quote">Get a Quote</a><a href="/login">Client portal</a>
      </nav>
    </footer>
  )
}

export function PageLayout({ active, children }: { active?: string; children: ReactNode }) {
  return <div className="agency-app"><Header active={active} /><main>{children}</main><SiteFooter /></div>
}

export function PageIntro({ label, title, description, action }: { label: string; title: ReactNode; description: string; action?: string }) {
  return (
    <section className="route-intro">
      <div><span className="section-kicker">{label}</span><h1>{title}</h1><p>{description}</p></div>
      {action && <a className="button button-cyan" href="/quote">{action} <ArrowRight size={14} /></a>}
    </section>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <a className="project-card" href={`/case-studies/${project.id}`}>
      <ProjectArtwork project={project} />
      <div className="project-card-copy"><span className="project-type">{project.type}</span><strong>{project.name}</strong><span>{project.client}</span><span className="project-arrow"><ArrowUpRight size={15} /></span></div>
    </a>
  )
}

export function MetricCard({ label, value, change, icon: Icon, color }: { label: string; value: string; change: string; icon: LucideIcon; color: string }) {
  return (
    <article className={`metric-card metric-${color}`}>
      <div className="metric-label">{label}<span><Icon size={16} /></span></div>
      <strong>{value}</strong><small><ArrowUpRight size={12} /> {change}</small>
      <svg className="sparkline" viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true"><path d="M0 37 C18 35 24 30 35 32 S57 37 69 23 S90 35 105 27 S125 30 136 18 S155 26 169 10 S186 17 200 4" /></svg>
    </article>
  )
}