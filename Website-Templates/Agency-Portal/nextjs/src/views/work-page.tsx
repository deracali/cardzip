'use client';

import Link from "next/link";
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
import { agencyApi } from "../services/agency-api";
import type { CaseStudy } from "../services/agency-api";

export default function WorkPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    agencyApi.publicCaseStudies()
      .then(({ caseStudies: records }) => setCaseStudies(records))
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, []);
  const allProjects = caseStudies.length ? caseStudies : [featuredProject, ...projects];
  return (
    <PageLayout active="work">
      <div className="route-page">
        <PageIntro label="OUR WORK" title={<>Good work should<br /><em>show its work.</em></>} description="A selection of the digital experiences, brands, and products we’ve made with ambitious teams." action="Start a project" />
        {loaded ? <div className="route-project-grid">{allProjects.map((project) => <ProjectCard project={project} key={project.id} />)}</div> : <p className="page-loading" role="status">Loading case studies…</p>}
        {loadError && <p className="page-loading" role="status">Published case studies could not be loaded. Showing sample work.</p>}
        <div className="route-callout"><span><strong>Have a good one in mind?</strong><small>Tell us what you’re building. We’ll bring the right creators.</small></span><Link className="button button-cyan" href="/quote">Let’s talk <ArrowRight size={14} /></Link></div>
      </div>
    </PageLayout>
  )
}
