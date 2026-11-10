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
import { NotFound } from './not-found-page';

export default function CaseStudyPage({ slug }: { slug: string }) {
  const project = slug === featuredProject.id ? featuredProject : projects.find((item) => item.id === slug)
  if (!project) return <NotFound />
  return (
    <PageLayout active="case-studies">
      <div className="route-page case-study-page">
        <a className="back-to-work" href="/case-studies"><ArrowLeft size={14} /> All case studies</a>
        <div className="case-study-heading"><span className="section-kicker">{project.type} · {project.client.split(' · ')[0]}</span><h1>{project.name}</h1><p>{project.summary}</p></div>
        <ProjectArtwork project={project} featured />
        <div className="case-study-content"><section><span className="section-kicker">THE CHALLENGE</span><h2>Make the next move matter.</h2><p>{project.description}</p></section><aside><span className="section-kicker">THE IMPACT</span><strong>{project.result}</strong><small>Measured after launch</small><span className="section-kicker deliverables-title">WHAT WE DID</span><ul>{project.deliverables.map((item) => <li key={item}><Check size={13} /> {item}</li>)}</ul></aside></div>
        <div className="case-study-next"><span><strong>Have a project like this?</strong><small>Let’s find the right creators for it.</small></span><a className="button button-cyan" href="/quote">Start a project <ArrowRight size={14} /></a></div>
      </div>
    </PageLayout>
  )
}
