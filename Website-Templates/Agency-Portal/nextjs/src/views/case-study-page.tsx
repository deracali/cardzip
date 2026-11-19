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
import { NotFound } from './not-found-page';
import { agencyApi } from "../services/agency-api";
import type { CaseStudy } from "../services/agency-api";

export default function CaseStudyPage({ slug }: { slug: string }) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    agencyApi.publicCaseStudies()
      .then(({ caseStudies: records }) => setCaseStudies(records))
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, []);
  const project = caseStudies.length
    ? caseStudies.find((item) => item.id === slug || item.slug === slug)
    : slug === featuredProject.id ? featuredProject : projects.find((item) => item.id === slug);
  if (!loaded) return <main className="page-loading" role="status">Loading case study…</main>;
  if (!project) return <NotFound />;
  return (
    <PageLayout active="case-studies">
      <div className="route-page case-study-page">
        {loadError && <p className="page-loading" role="status">Published case studies could not be loaded. Showing sample work.</p>}
        <Link className="back-to-work" href="/case-studies"><ArrowLeft size={14} /> All case studies</Link>
        <div className="case-study-heading"><span className="section-kicker">{project.type} · {project.client.split(' · ')[0]}</span><h1>{project.name}</h1><p>{project.summary}</p></div>
        <ProjectArtwork project={project} featured />
        <div className="case-study-content"><section><span className="section-kicker">THE CHALLENGE</span><h2>Make the next move matter.</h2><p>{project.description}</p></section><aside><span className="section-kicker">THE IMPACT</span><strong>{project.result}</strong><small>Measured after launch</small><span className="section-kicker deliverables-title">WHAT WE DID</span><ul>{project.deliverables.map((item) => <li key={item}><Check size={13} /> {item}</li>)}</ul></aside></div>
        {!!project.images?.length && <section className="case-study-gallery" aria-label="More project images">{project.images.map((image, index) => <img src={image} alt={`${project.alt} ${index + 2}`} key={`${image}-${index}`} />)}</section>}
        <div className="case-study-next"><span><strong>Have a project like this?</strong><small>Let’s find the right creators for it.</small></span><Link className="button button-cyan" href="/quote">Start a project <ArrowRight size={14} /></Link></div>
      </div>
    </PageLayout>
  )
}
