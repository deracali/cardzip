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

export default function NotFoundPage() {
  return <><main className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>Looks like this page took a detour.</h1><p>The link may be outdated, or the page may have moved.</p><a className="button" href="/">Back to home <ArrowRight size={15} /></a></main><Footer /></>
}
