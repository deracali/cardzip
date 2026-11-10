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

export default function FeaturesPage() {
  return <><main className="page-main"><SectionHeading eyebrow="CAPABILITIES" title="AI that works the way your team does." copy="From the first workflow to company-wide automation, Nexara gives every team the tools to move faster." /><FeatureCards /><section className="detail-grid"><article><Bot /><h3>Agents that understand context</h3><p>Set a goal, choose the tools an agent can use, and give it knowledge from your workspace. Nexara handles the steps and keeps your team in the loop.</p></article><article><Fingerprint /><h3>Secure by design</h3><p>Role-based permissions, audit-ready activity, and encrypted data give your team confidence at every scale.</p></article><article><Activity /><h3>Measure what matters</h3><p>Track usage, accuracy, time saved, and workflow health. Improve the work with clear, real-time feedback.</p></article></section><div className="page-cta"><h2>Make room for the work that matters.</h2><a className="button" href="/signup">Start your free trial <ArrowRight size={15} /></a></div></main><Footer /></>
}
