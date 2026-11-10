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

export default function CaseStudiesPage() {
  return (
    <PageLayout active="case-studies">
      <div className="route-page">
        <PageIntro label="SELECTED WORK" title={<>Case studies<br /><em>with receipts.</em></>} description="Good taste is the starting point. We care about what happens after launch, too." action="Tell us what you need" />
        <div className="route-project-grid">{[...projects, featuredProject].map((project) => <ProjectCard project={project} key={project.id} />)}</div>
        <section className="results-band"><div><strong>240+</strong><span>Projects shipped</span></div><div><strong>18</strong><span>International awards</span></div><div><strong>98%</strong><span>Client retention</span></div><div><strong>212%</strong><span>Pipeline growth</span></div></section>
      </div>
    </PageLayout>
  )
}
