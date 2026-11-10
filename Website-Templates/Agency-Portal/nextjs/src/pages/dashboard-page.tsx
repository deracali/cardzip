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

export default function DashboardPage() {
  const [active, setActive] = useState('Overview')
  const [notice, setNotice] = useState('')
  const nav = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Analytics', icon: Zap },
    { name: 'Projects', icon: FolderKanban },
    { name: 'Team Center', icon: Users },
    { name: 'Reports', icon: Search },
    { name: 'Integrations', icon: Globe2 },
    { name: 'Settings', icon: Settings },
  ]
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Brand compact />
        <div className="workspace-picker"><span className="workspace-avatar">N</span><span><strong>NEXORA</strong><small>Client workspace</small></span><ChevronDown size={14} /></div>
        <nav aria-label="Dashboard navigation">{nav.map(({ name, icon: Icon }) => <button className={active === name ? 'active' : ''} type="button" key={name} onClick={() => { setActive(name); setNotice(name === 'Overview' ? '' : `${name} view selected in this dashboard preview.`) }}><Icon size={16} />{name}{name === 'Projects' && <span className="nav-count">8</span>}</button>)}</nav>
        <div className="sidebar-bottom"><a href="/quote"><CircleHelp size={15} /> Help center</a><a href="/login"><LockKeyhole size={15} /> Sign out</a><div className="user-profile"><span className="user-avatar">IN</span><span><strong>Isaac Newton</strong><small>Administrator</small></span><MoreHorizontal size={16} /></div></div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar"><div className="mobile-dash-brand"><Brand compact /></div><div className="dashboard-breadcrumb">Workspace <ArrowRight size={12} /> {active}</div><div className="dashboard-top-actions"><label className="dashboard-search"><Search size={14} /><input aria-label="Search dashboard" placeholder="Search anything..." /></label><button className="icon-action" type="button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up on notifications.')}><Bell size={16} /><i /></button><a className="button button-cyan" href="/quote"><Plus size={14} /> New Project</a></div></header>
        <div className="dashboard-content">
          <div className="dashboard-greeting"><div><span className="section-kicker">MONDAY, MAY 26, 2026</span><h1>Welcome back, Isaac</h1><p>Here’s what’s happening with your projects today.</p></div><button className="date-picker" type="button" onClick={() => setNotice('Showing the last 30 days.')}>Last 30 days <ChevronDown size={13} /></button></div>
          {notice && <p className="dashboard-notice" role="status">{notice}</p>}
          <section className="metrics-grid" aria-label="Workspace metrics"><MetricCard label="Total Revenue" value="$ 98,642" change="12.4%" icon={Globe2} color="cyan" /><MetricCard label="Active Users" value="24,875" change="8.2%" icon={Users} color="purple" /><MetricCard label="New Projects" value="1,432" change="15.3%" icon={FolderKanban} color="blue" /><MetricCard label="Server Status" value="99.9%" change="Healthy" icon={ShieldCheck} color="green" /></section>
          <section className="analytics-grid">
            <article className="dashboard-panel revenue-panel"><div className="panel-title"><h2>Revenue Overview</h2><button className="date-picker" type="button" onClick={() => setNotice('Revenue chart range: This Month.')}>This Month <ChevronDown size={12} /></button></div><div className="revenue-chart"><div className="chart-y-labels"><span>$30K</span><span>$20K</span><span>$10K</span><span>$0</span></div><svg viewBox="0 0 600 200" preserveAspectRatio="none" role="img" aria-label="Revenue trending upward through May"><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0cafff" stopOpacity=".35" /><stop offset="1" stopColor="#0cafff" stopOpacity="0" /></linearGradient></defs><path className="chart-area" d="M0 173 C30 162 44 156 64 159 S90 142 112 127 S139 143 164 119 S191 135 214 102 S238 107 263 116 S286 84 310 94 S333 120 358 98 S380 59 401 75 S424 95 447 62 S474 52 492 72 S520 30 541 42 S568 70 600 27 V200 H0Z" /><path className="chart-line" d="M0 173 C30 162 44 156 64 159 S90 142 112 127 S139 143 164 119 S191 135 214 102 S238 107 263 116 S286 84 310 94 S333 120 358 98 S380 59 401 75 S424 95 447 62 S474 52 492 72 S520 30 541 42 S568 70 600 27" /></svg><div className="chart-x-labels"><span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 29</span></div></div></article>
            <article className="dashboard-panel distribution-panel"><div className="panel-title"><h2>Project Distribution</h2><button className="icon-action" type="button" aria-label="Project distribution options"><MoreHorizontal size={16} /></button></div><div className="distribution-content"><div className="donut-chart"><div><strong>1,432</strong><small>Total</small></div></div><ul><li><i className="cyan" />Web Application <span>532 (37%)</span></li><li><i className="blue" />Mobile App <span>428 (30%)</span></li><li><i className="purple" />AI &amp; ML <span>289 (20%)</span></li><li><i className="pink" />Dashboard <span>183 (13%)</span></li></ul></div></article>
          </section>
          <section className="dashboard-lower-grid">
            <article className="dashboard-panel activity-panel"><div className="panel-title"><h2>Recent Activity</h2><a href="/case-studies">View all <ArrowRight size={12} /></a></div>{[['AI Model Training', 'Started training “Product Recommendation AI”', '2m ago'], ['New User Registered', 'User “alex@email.com” joined the platform', '5m ago'], ['Project Updated', '“E-Commerce Dashboard” was updated', '1h ago'], ['Server Backup', 'Daily backup completed successfully', '3h ago']].map(([title, detail, time], i) => <div className="activity-row" key={title}><span className={`activity-icon activity-${i}`}><FolderKanban size={14} /></span><span><strong>{title}</strong><small>{detail}</small></span><time>{time}</time></div>)}</article>
            <article className="dashboard-panel performers-panel"><div className="panel-title"><h2>Top Performing Projects</h2><a href="/case-studies">View all <ArrowRight size={12} /></a></div>{dashboardRows.map((row, i) => <div className="performer-row" key={row.name}><span><strong>{row.name}</strong><small>{row.category}</small><i className={`performer-bar bar-${i}`} /></span><b>{row.amount}</b></div>)}</article>
            <article className="dashboard-panel performance-panel"><div className="panel-title"><h2>System Performance</h2><button className="icon-action" type="button" aria-label="System performance options"><MoreHorizontal size={16} /></button></div><div className="system-gauges"><div><span className="gauge gauge-cyan">45%</span><small>CPU Usage</small></div><div><span className="gauge gauge-purple">72%</span><small>Memory Usage</small></div><div><span className="gauge gauge-blue">68%</span><small>Disk Usage</small></div></div><svg className="system-chart" viewBox="0 0 330 55" preserveAspectRatio="none" aria-label="System performance history"><path d="M0 38 C24 22 38 55 60 32 S90 12 112 35 S139 48 164 22 S192 10 215 36 S247 49 270 24 S301 19 330 8" /></svg></article>
          </section>
          <a className="dashboard-feature" href="/case-studies/lumen-finance"><span><strong>Lumen Finance Dashboard</strong><small>Fintech · 2026</small></span><ArrowRight size={15} /></a>
        </div>
      </main>
    </div>
  )
}
