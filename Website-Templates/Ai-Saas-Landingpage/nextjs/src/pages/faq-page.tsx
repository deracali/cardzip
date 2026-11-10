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

export default function FAQPage() {
  return <><main className="page-main"><FAQSection /><div className="page-cta"><h2>Let's find the right workflow for you.</h2><a className="button" href="/contact">Talk to our team <ArrowRight size={15} /></a></div></main><Footer /></>
}
