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

export default function IntegrationsPage() {
  const integrations: [string, string, string][] = [['Slack', 'Send alerts and get answers without leaving team chat.', 'Communication'], ['GitHub', 'Summarize issues, triage pull requests, and automate releases.', 'Developer tools'], ['Notion', 'Search your team knowledge and keep project docs in sync.', 'Knowledge'], ['HubSpot', 'Enrich leads, update records, and keep your pipeline moving.', 'CRM'], ['Google Drive', 'Bring documents and shared knowledge into AI workflows.', 'Storage'], ['Stripe', 'Monitor payments and trigger workflows from key events.', 'Payments']]
  return <><main className="page-main"><SectionHeading eyebrow="INTEGRATIONS" title="Your tools, finally talking to each other." copy="Connect the apps you already trust. Build a workflow once, then let Nexara keep the work moving." /><div className="integration-grid">{integrations.map(([name, copy, category], i) => <article className="integration-card" key={name}><span className="integration-app-icon">{[<MessageSquareText />, <GitBranch />, <FileText />, <Radio />, <Database />, <Zap />][i]}</span><span className="integration-category">{category}</span><h3>{name}</h3><p>{copy}</p><span className="connected-label"><Check size={13} /> Ready to connect</span></article>)}</div><div className="integration-more"><Plug size={20} /><div><b>Need another tool?</b><p>Use webhooks and our API to connect your own apps.</p></div><a className="text-link" href="/docs">Read the docs <ArrowRight size={15} /></a></div></main><Footer /></>
}
