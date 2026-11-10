'use client';

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
import { Logo, Footer, DashboardPreview, SectionHeading, FeatureCards, FAQSection } from '../components/Shared';

export default function HomePage() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-copy"><span className="announcement"><span className="pulse-dot" /> Built for teams who do more with less</span><h1>Supercharge your workflow<br className="desktop-break" /> with <span>AI-powered intelligence</span></h1><p>Connect your stack in 60 seconds. Zero config, zero code — Nexara learns your processes and automates them on autopilot.</p><div className="hero-actions"><a className="button" href="/signup">Start free trial <ArrowRight size={16} /></a><a className="button button-ghost" href="/demo"><Play size={14} /> Watch demo</a></div><small className="hero-note">Free 14-day Pro trial · No credit card required · Cancel anytime</small></div>
          <DashboardPreview />
          <div className="trusted"><span>POWERING WORKFLOWS AT 12,000+ COMPANIES</span><div>{['Slack', 'GitHub', 'Notion', 'OpenAI', 'Figma', 'Stripe'].map((name) => <span className="trusted-name" key={name}><span className="trusted-symbol">{name === 'OpenAI' ? '✳' : '◉'}</span>{name}</span>)}</div></div>
        </section>
        <section className="section section-features"><SectionHeading eyebrow="CAPABILITIES" title="Everything you need to ship AI workflows" copy="One simple workspace to build, launch, and improve your team's best AI-powered work." /><FeatureCards /><div className="center-action"><a className="text-link" href="/features">Explore all capabilities <ArrowRight size={15} /></a></div></section>
        <section className="section integration-strip"><div><span className="eyebrow">PLAYS WELL WITH YOUR STACK</span><h2>Your tools, working as one.</h2><p>Bring your favorite apps together in a secure, connected workflow.</p><a className="text-link" href="/integrations">Browse integrations <ArrowRight size={15} /></a></div><div className="integration-logos"><span><MessageSquareText /> Slack</span><span><GitBranch /> GitHub</span><span><FileText /> Notion</span><span><Radio /> HubSpot</span><span><Plug /> 50+ more</span></div></section>
        <section className="cta-panel"><span className="eyebrow">READY WHEN YOU ARE</span><h2>Ready to 10x your team with AI?</h2><p>Join 12,000+ teams. Start your 14-day trial today.</p><div className="hero-actions"><a className="button" href="/signup">Get started free <ArrowRight size={15} /></a><a className="button button-ghost" href="/contact">Talk to sales</a></div></section>
        <FAQSection compact />
      </main>
      <Footer />
    </>
  )
}
