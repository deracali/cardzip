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

export default function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const title = type === 'privacy' ? 'Privacy at Nexara' : 'Terms of service'
  return <><main className="page-main legal-page"><SectionHeading eyebrow="NEXARA AI" title={title} copy="This product preview does not collect or store personal information submitted through its forms." /><article><h2>About this preview</h2><p>This website is a front-end demonstration. Forms do not submit information to a server, accounts are not created, and the checkout does not process payments.</p><h2>Before launch</h2><p>Replace this sample page with policies reviewed for your business, jurisdiction, data practices, and payment provider. Do not rely on this preview as legal advice.</p><a className="text-link" href="/contact">Questions? Contact our team <ArrowRight size={14} /></a></article></main><Footer /></>
}
