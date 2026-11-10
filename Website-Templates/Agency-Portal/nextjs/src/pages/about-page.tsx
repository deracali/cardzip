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

export default function AboutPage() {
  return (
    <PageLayout active="about">
      <div className="route-page about-page">
        <PageIntro label="ABOUT NOVA" title={<>An independent studio<br /><em>built around creators.</em></>} description="We bring a tight-knit collective of designers, strategists, motion artists, and engineers together to make the internet more useful, more expressive, and more human." action="Meet us on a project" />
        <section className="about-studio">
          <div className="about-photo" role="img" aria-label="A creative studio space where the NOVA team works" />
          <div><span className="section-kicker">SMALL BY DESIGN</span><h2>Fewer handoffs.<br />More good ideas.</h2><p>NOVA is an independent creative studio for people making something that matters. We stay intentionally small, work directly with the people doing the work, and bring in trusted specialist creators when a project needs a fresh perspective.</p><p>No mystery teams. No layers between the brief and the people shaping it. Just thoughtful collaboration and work that earns its place in the world.</p><a className="text-link" href="/work">See what we make <ArrowRight size={14} /></a></div>
        </section>
        <section className="values-grid"><article><span>01</span><h3>Creator-led</h3><p>Senior makers work directly with you from first conversation to handoff.</p></article><article><span>02</span><h3>Outcome-minded</h3><p>We pair expressive craft with clear goals and measurable results.</p></article><article><span>03</span><h3>Open collaboration</h3><p>Good work gets better when the people building it can talk to each other.</p></article></section>
        <div className="route-callout"><span><strong>Good people make good work.</strong><small>Bring us a challenge and we’ll bring the right creative team.</small></span><a className="button button-cyan" href="/quote">Start a conversation <ArrowRight size={14} /></a></div>
      </div>
    </PageLayout>
  )
}
