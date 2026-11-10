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

export default function DemoPage() {
  return <><main className="page-main demo-page"><SectionHeading eyebrow="PRODUCT TOUR" title="See Nexara in action." copy="A quick look at how an AI agent can turn a repetitive task into a workflow that runs itself." /><div className="demo-window"><div className="demo-window-bar"><i /><i /><i /><span>nexara.ai / product-tour</span></div><div className="demo-screen"><span className="demo-play"><Play size={25} fill="currentColor" /></span><span className="eyebrow">THE NEXARA WORKSPACE</span><h2>From busywork to done.</h2><p>See how teams connect their tools, build agents, and get hours back every week.</p><a className="button" href="/signup">Try it for yourself <ArrowRight size={15} /></a></div></div><div className="demo-points"><span><Check /> Connect your favorite apps</span><span><Check /> Build without code</span><span><Check /> Stay in control</span></div><div className="page-cta"><h2>Ready to build your first workflow?</h2><a className="button" href="/signup">Start free trial <ArrowRight size={15} /></a></div></main><Footer /></>
}
