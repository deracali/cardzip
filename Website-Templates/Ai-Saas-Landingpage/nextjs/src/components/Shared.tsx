import { useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Database,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Play,
  Plug,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const faqs = [
  ['How long does setup take?', 'Most teams connect their first integration in under 5 minutes. Import your data, pick a template, and your first agent is on the way.'],
  ['Do I need engineers to use Nexara?', 'No. Build and launch workflows with our visual editor. Developers can still customize agents and connect APIs when they need more control.'],
  ['How is my data secure?', 'Your data is encrypted in transit and at rest. We never train public AI models on your private data, and team access is managed from one place.'],
  ['Can I switch plans or cancel anytime?', 'Yes. Change your plan whenever your needs change. You can cancel a paid plan from your workspace settings at any time.'],
]

const routeNames = [
  ['/features', 'Features'],
  ['/integrations', 'Integrations'],
  ['/pricing', 'Pricing'],
  ['/faq', 'FAQ'],
  ['/docs', 'Docs'],
]


import { useMenuState } from "../hooks/useMenuState";


export function Logo() {
  return <a className="brand" href="/" aria-label="Nexara AI home"><img className="brand-mark" src="/favicon.svg" alt="" /><span>Nexara <b>AI</b></span></a>
}

export function Header() {
  const { menuOpen, setMenuOpen } = useMenuState()
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {routeNames.map(([href, label]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="nav-login" href="/login" onClick={() => setMenuOpen(false)}>Log in</a>
          <a className="button button-small" href="/signup" onClick={() => setMenuOpen(false)}>Get started free <ArrowRight size={14} /></a>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div><Logo /><p className="footer-blurb">Put your team's busywork on autopilot.</p></div>
        <div className="footer-links"><a href="/features">Features</a><a href="/integrations">Integrations</a><a href="/pricing">Pricing</a><a href="/docs">Docs</a></div>
        <div className="footer-links"><a href="/contact">Talk to sales</a><a href="/faq">FAQ</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Nexara AI, Inc.</span><span>Built for humans. Powered by AI.</span></div>
    </footer>
  )
}

export function DashboardPreview() {
  return (
    <div className="dashboard" aria-label="Preview of the Nexara workflow dashboard">
      <div className="dashboard-top"><div className="window-dots"><i /><i /><i /></div><div className="dashboard-address">app.nexara.ai / overview</div><div className="live-status"><span /> Live</div><div className="avatar">A</div></div>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <div className="side-active"><Layers3 size={14} /> Overview</div><div><Bot size={14} /> AI Agents</div><div><Workflow size={14} /> Workflows</div><div><Database size={14} /> Knowledge</div><div><Activity size={14} /> Analytics</div><div><LockKeyhole size={14} /> Settings</div>
          <div className="usage-card"><Zap size={14} /><b>AI Credits</b><span>82% remaining</span><i><em /></i></div>
        </aside>
        <section className="dashboard-content">
          <div className="dashboard-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h3>Workflow intelligence</h3><span>Here's what's happening with your agents.</span></div><button type="button" className="mini-button"><Sparkles size={12} /> New agent</button></div>
          <div className="metric-grid">
            <div className="metric"><span>Tasks automated</span><b>48,281</b><small>↗ 18.3%</small></div>
            <div className="metric"><span>Time saved</span><b>1,240h</b><small>↗ 12.4%</small></div>
            <div className="metric"><span>Accuracy</span><b>99.2%</b><small>↗ 0.8%</small></div>
          </div>
          <div className="dashboard-lower">
            <div className="chart-card"><div className="chart-title"><b>Automation throughput</b><span><i /> All AI agents</span></div><div className="chart-bars">{[34, 48, 41, 58, 45, 70, 52, 83, 69, 92, 75, 100, 79, 91].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><div className="chart-axis"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span></div></div>
            <div className="agents-card"><b>Active agents</b>{[['Support Triage', 'Running'], ['Doc Summarizer', 'Queued'], ['Lead Enrichment', 'Running']].map(([name, status]) => <div className="agent-row" key={name}><span className="agent-dot" />{name}<small>{status}</small></div>)}<a href="/features">View all agents <ArrowRight size={11} /></a></div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string | null }) {
  return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
}

export function FeatureCards() {
  const features: [LucideIcon, string, string][] = [
    [Bot, 'Autonomous AI agents', 'Delegate repetitive work to smart, reliable agents that get better with every task.'],
    [Workflow, 'Zero-config workflows', 'Connect the tools you already use and launch your first automation in minutes.'],
    [ShieldCheck, 'Enterprise security', 'Keep your data protected with strong access controls and encryption by default.'],
    [Activity, 'Real-time analytics', 'See time saved, workflow health, and agent performance in one clear view.'],
    [Database, 'Private knowledge base', 'Give your agents the context they need with your own trusted company knowledge.'],
    [GitBranch, 'Human-in-the-loop', 'Review important decisions and keep your team in control of every workflow.'],
  ]
  return <div className="feature-grid">{features.map(([Icon, title, copy], i) => <article className={`feature-card feature-card-${i + 1}`} key={title}><span className="feature-icon"><Icon size={18} /></span><h3>{title}</h3><p>{copy}</p>{i === 0 && <a className="card-link" href="/features">Explore AI agents <ArrowRight size={13} /></a>}</article>)}</div>
}

export function FAQSection({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(0)
  return <section className={compact ? 'faq-section faq-compact' : 'faq-section'}><SectionHeading eyebrow={compact ? 'NEED A HAND?' : 'FAQ'} title={compact ? 'Frequently asked questions' : 'Good questions. Clear answers.'} copy={!compact ? 'A few things teams often ask before getting started.' : null} /><div className="faq-list">{faqs.map(([question, answer], i) => <article className={open === i ? 'faq-item open' : 'faq-item'} key={question}><button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{question}</span><ChevronDown size={17} /></button>{open === i && <p>{answer}</p>}</article>)}</div>{!compact && <div className="faq-contact">Still have questions? <a href="/contact">Talk to our team <ArrowRight size={14} /></a></div>}</section>
}

export function NotFoundPage() {
  return <><main className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>Looks like this page took a detour.</h1><p>The link may be outdated, or the page may have moved.</p><a className="button" href="/">Back to home <ArrowRight size={15} /></a></main><Footer /></>
}