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

export default function DocsPage() {
  const docs: [typeof Sparkles, string, string, string, string][] = [
    [Sparkles, '01', 'Quick start', 'Create your workspace, connect an app, and launch your first agent.', '/signup'],
    [Workflow, '02', 'Build a workflow', 'Choose a trigger, add steps, and decide when your team should review.', '/features'],
    [Plug, '03', 'Connect your stack', 'See how integrations and webhooks fit into your workflows.', '/integrations'],
    [CircleHelp, '04', 'Troubleshooting', 'Find answers to common setup, access, and billing questions.', '/faq'],
  ]

  return <><main className="page-main"><SectionHeading eyebrow="NEXARA DOCS" title="A clear path from idea to automation." copy="Everything you need to connect your tools and launch a reliable AI workflow." /><div className="docs-grid">{docs.map(([Icon, number, title, copy, href]) => <a className="doc-card" href={href} key={number}><span className="doc-number">{number}</span><Icon size={20} /><h3>{title}</h3><p>{copy}</p><span className="text-link">Explore <ArrowRight size={14} /></span></a>)}</div><div className="docs-callout"><FileText size={22} /><div><b>Looking for API documentation?</b><p>Get in touch and tell us what you're building. Our team can help you get started.</p></div><a className="button button-small" href="/contact">Contact us</a></div></main><Footer /></>
}
