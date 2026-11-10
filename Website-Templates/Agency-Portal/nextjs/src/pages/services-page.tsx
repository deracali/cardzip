'use client';

import { useEffect, useState } from 'react'
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
import { Brand, Header, ProjectArtwork, HeroPreview, SiteFooter, PageLayout, PageIntro, ProjectCard, MetricCard } from '../components/Shared';
import { projects, featuredProject, dashboardRows, pageTitles } from '../components/Shared';

export default function ServicesPage() {
  const services = [
    { title: 'Brand & identity', icon: Sparkles, text: 'Find your point of view and give it a visual system built to last.', deliverables: 'Positioning · Naming · Identity · Art direction' },
    { title: 'Digital experiences', icon: Globe2, text: 'Make your next website or product feel as good as it performs.', deliverables: 'Strategy · UX/UI · Websites · E-commerce' },
    { title: 'Motion & 3D', icon: Zap, text: 'Turn product stories into moving, interactive worlds people remember.', deliverables: '3D · Motion systems · WebGL · Product film' },
    { title: 'Creator partnerships', icon: Users, text: 'Work with a small, senior collective assembled around your exact brief.', deliverables: 'Creative direction · Design · Engineering · Production' },
  ]
  return (
    <PageLayout active="services">
      <div className="route-page">
        <PageIntro label="SERVICES" title={<>Creators for the<br /><em>whole journey.</em></>} description="From the first rough idea through final launch, get senior creative talent without the agency layers." action="Get a Quote" />
        <div className="service-page-grid">{services.map(({ title, icon: Icon, text, deliverables }, index) => <article className="service-page-card" key={title}><span className="service-number">0{index + 1}</span><span className="service-icon"><Icon size={19} /></span><h2>{title}</h2><p>{text}</p><small>{deliverables}</small><a href="/quote" aria-label={`Request ${title}`}>Explore this service <ArrowRight size={13} /></a></article>)}</div>
        <section className="process-strip"><span className="section-kicker">HOW WE WORK</span><div><strong>01 · Listen</strong><strong>02 · Make</strong><strong>03 · Ship</strong><strong>04 · Grow</strong></div></section>
      </div>
    </PageLayout>
  )
}
