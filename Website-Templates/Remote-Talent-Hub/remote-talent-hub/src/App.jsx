import { useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Bookmark,
  BriefcaseBusiness, Check, CheckCircle2, ChevronDown, Clock3, Code2,
  CreditCard, Eye, EyeOff, FileText, Filter, Globe2, Heart, LockKeyhole,
  MapPin, Menu, MessageCircle, Monitor, Search, ShieldCheck, Sparkles, X, Zap,
} from 'lucide-react'
import './App.css'

const categories = [
  { name: 'Software Engineering', icon: Code2, count: '2,370 jobs' },
  { name: 'UX/UI Design', icon: Sparkles, count: '1,240 jobs' },
  { name: 'Product Management', icon: BriefcaseBusiness, count: '846 jobs' },
  { name: 'AI & Data', icon: Zap, count: '2,104 jobs' },
  { name: 'Marketing', icon: Globe2, count: '1,587 jobs' },
  { name: 'Customer Success', icon: Heart, count: '923 jobs' },
]

const jobs = [
  { id: 'senior-frontend-engineer', title: 'Senior Frontend Engineer (React)', company: 'Vercel', mark: 'V', color: 'violet', location: 'Worldwide Â· Remote', salary: '$160kâ€“$210k', type: 'Full-time', tags: ['React', 'TypeScript', 'Remote', 'Senior'], featured: true, description: 'Help us build fast, reliable experiences for developers around the world. Work closely with design and product to ship thoughtful, accessible features.' },
  { id: 'product-designer', title: 'Product Designer, Design Systems', company: 'Linear', mark: 'L', color: 'blue', location: 'Americas Â· Remote', salary: '$130kâ€“$175k', type: 'Full-time', tags: ['Figma', 'Design Systems', 'Remote'], description: 'Create a coherent design language that makes powerful software feel simple. Partner with engineering and product from first sketch to final polish.' },
  { id: 'ai-engineer', title: 'AI Engineer â€” LLM Platform', company: 'Notion', mark: 'N', color: 'green', location: 'US / Canada Â· Remote', salary: '$180kâ€“$240k', type: 'Full-time', tags: ['Python', 'LLM', 'AI', 'Remote'], description: 'Build the platform that brings reliable AI capabilities to millions of people. Help turn the latest research into useful, production-ready products.' },
  { id: 'growth-marketer', title: 'B2B SaaS Growth Marketing Manager', company: 'Figma', mark: 'F', color: 'orange', location: 'North America Â· Remote', salary: '$110kâ€“$150k', type: 'Full-time', tags: ['Growth', 'Marketing', 'SaaS', 'Remote'], description: 'Own experiments across our growth funnel and help creative teams find the tools they love. Collaborate with an ambitious, kind, distributed team.' },
  { id: 'backend-engineer', title: 'Backend Engineer (Postgres)', company: 'Supabase', mark: 'S', color: 'cyan', location: 'Worldwide Â· Remote', salary: '$145kâ€“$195k', type: 'Full-time', tags: ['Postgres', 'Backend', 'Open source'], description: 'Work on the open-source platform developers use to build production apps. Ship foundational database features in a remote-first team.' },
  { id: 'fullstack-engineer', title: 'Full-Stack AI Engineer', company: 'Mercury', mark: 'M', color: 'green', location: 'US Â· Remote', salary: '$155kâ€“$205k', type: 'Full-time', tags: ['Full-stack', 'AI', 'TypeScript'], description: 'Build delightful financial tools with a small, high-impact engineering team. Bring AI-powered product experiences from idea to release.' },
  {
    id: 'senior-full-stack-engineer',
    title: 'Senior Full-Stack Engineer',
    company: 'Northstar Labs',
    mark: 'N',
    color: 'violet',
    location: 'Worldwide Â· Remote',
    salary: '$150kâ€“$200k',
    type: 'Full-time',
    tags: ['React', 'Node.js', 'TypeScript', 'Senior'],
    featured: true,
    description: 'Northstar Labs is looking for a senior full-stack engineer to build reliable, beautifully considered products for a global community. You will work across our application stack, partner with product and design, and help shape the technical direction of a growing remote team.',
    companyAbout: 'Northstar Labs builds thoughtful software that helps distributed teams do their best work. We are a remote-first team working across multiple time zones.',
    responsibilities: [
      'Design, build, and maintain product features across our React and Node.js applications.',
      'Collaborate with product and design to turn customer needs into clear, accessible experiences.',
      'Improve APIs, database performance, testing, and deployment reliability.',
      'Contribute to technical planning, code reviews, and a supportive engineering culture.',
    ],
    requirements: [
      '5+ years building and shipping full-stack web applications.',
      'Strong experience with React, TypeScript, Node.js, and relational databases.',
      'A track record of making pragmatic architecture and product decisions.',
      'Clear written communication and experience collaborating asynchronously.',
    ],
    benefits: ['Work from anywhere', 'Home office budget', 'Health benefits', 'Flexible PTO', 'Learning budget', 'Equity'],
  },
]

const talents = [
  {
    id: 'adaze-okafor',
    name: 'Adaze Okafor',
    title: 'Full-Stack Engineer Â· Ex-Paystack',
    location: 'Lagos, Nigeria Â· Open to remote',
    salary: '$6kâ€“$8k / month',
    initials: 'AO',
    color: 'violet',
    tags: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS'],
    experience: '7 years',
    about: 'I build dependable, user-friendly products from database to deployment. I enjoy working with thoughtful teams on tools that solve real problems.',
    experienceHistory: [
      { role: 'Senior Software Engineer', company: 'Paystack', period: '2022 – Present', mark: 'P', color: 'violet', description: 'Led full-stack development of payment and merchant tools, improving reliability and simplifying key customer workflows.' },
      { role: 'Full-Stack Engineer', company: 'Flutterwave', period: '2020 – 2022', mark: 'F', color: 'green', description: 'Built and maintained customer-facing payments features with product, design, and platform teams.' },
      { role: 'Software Engineer', company: 'Andela', period: '2018 – 2020', mark: 'A', color: 'orange', description: 'Delivered web applications for distributed teams and developed a strong foundation in collaborative software delivery.' },
    ],
    projects: [
      { name: 'Support dashboard', stack: 'React · Analytics', art: 'project-art-one' },
      { name: 'RemoteFlow platform', stack: 'Node.js · PostgreSQL', art: 'project-art-two' },
    ],
  },
  { id: 'maya-chen', name: 'Maya Chen', title: 'Senior Product Designer Â· B2B SaaS', location: 'Singapore Â· Open worldwide', salary: '$5kâ€“$7k / month', initials: 'MC', color: 'orange', tags: ['Product Design', 'Figma', 'Design Systems'], experience: '8 years', about: 'Product designer turning complex workflows into clear, welcoming experiences. I partner closely with engineering and research teams.' },
  { id: 'james-owusu', name: 'James Owusu', title: 'Machine Learning Engineer', location: 'Accra, Ghana Â· Open to remote', salary: '$6kâ€“$9k / month', initials: 'JO', color: 'green', tags: ['Python', 'Machine Learning', 'LLMs'], experience: '6 years', about: 'Machine learning engineer focused on moving data products from experiment to production, responsibly and at scale.' },
]

const plans = [
  { id: 'standard', name: 'Standard Post', price: 99, period: '/30 days', description: 'Get noticed by qualified candidates and start building your team.', features: ['One active job listing', 'Standard marketplace visibility', 'Candidate application management', 'Email application notifications'] },
  { id: 'featured', name: 'Featured Post', price: 249, period: '/30 days', description: 'Top-of-feed placement, highlighted listing, and faster candidate discovery.', features: ['One featured job listing', 'Top-of-feed placement', 'Featured badge and highlighting', 'Priority candidate notifications'], featured: true },
]

function getPath() {
  return `${window.location.pathname}${window.location.search}`
}

function useNavigation() {
  const [route, setRoute] = useState(getPath)
  useEffect(() => {
    const handlePopState = () => setRoute(getPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  const navigate = (to) => {
    window.history.pushState({}, '', to)
    setRoute(getPath())
    window.scrollTo(0, 0)
  }
  const handleClick = (event) => {
    const link = event.target.closest('a')
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return
    const target = new URL(link.href, window.location.href)
    if (target.origin !== window.location.origin) return
    if (target.pathname === window.location.pathname && target.search === window.location.search && target.hash) {
      event.preventDefault()
      window.history.pushState({}, '', `${target.pathname}${target.search}${target.hash}`)
      document.getElementById(decodeURIComponent(target.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    event.preventDefault()
    navigate(`${target.pathname}${target.search}${target.hash}`)
  }
  return { route, navigate, handleClick }
}

function Brand({ inverse = false }) {
  return <a className={`brand${inverse ? ' brand-inverse' : ''}`} href="/" aria-label="Remote.ly home"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span><strong>Remote<span>.ly</span></strong></a>
}

function Header({ active = '', compact = false }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="top-nav wrap">
        <Brand />
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={`nav-links${open ? ' nav-open' : ''}`} aria-label="Main navigation">
          <a className={active === 'jobs' ? 'active' : ''} href="/jobs" onClick={() => setOpen(false)}>Find Jobs</a>
          <a className={active === 'talent' ? 'active' : ''} href="/talent" onClick={() => setOpen(false)}>Browse Talent</a>
          {!compact && <a className={active === 'post' ? 'active' : ''} href="/post-job" onClick={() => setOpen(false)}>Post a Job</a>}
          <a className={active === 'pricing' ? 'active' : ''} href="/pricing" onClick={() => setOpen(false)}>Pricing</a>
          <span className="nav-spacer" />
          <a className="currency-link" href="/pricing">USD <ChevronDown size={12} /></a>
          <a href="/login">Sign in</a>
          <a className="button button-purple nav-cta" href="/post-job">Post a Job <ArrowRight size={14} /></a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand"><Brand inverse /><p>The global marketplace for remote tech jobs and world-class talent.</p><span><Globe2 size={13} /> Built for work without borders.</span></div>
        <div><strong>Job seekers</strong><a href="/jobs">Find Jobs</a><a href="/talent">Browse Companies</a><a href="/signup?role=candidate">Create a profile</a><a href="/pricing">Career Advice</a></div>
        <div><strong>Employers</strong><a href="/post-job">Post a job</a><a href="/pricing">Pricing plans</a><a href="/talent">Browse talent</a><a href="/post-job">Hiring guide</a></div>
        <div><strong>Company</strong><a href="/about">About</a><a href="/contact">Blog</a><a href="/contact">Careers</a><a href="/contact">Press</a></div>
        <div><strong>Legal</strong><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/security">Security</a><a href="/contact">Contact</a></div>
      </div>
      <div className="wrap footer-bottom"><span>Â© {new Date().getFullYear()} Remote.ly. All rights reserved.</span><span>Find great work. Hire great people.</span></div>
    </footer>
  )
}

function Layout({ children, active, compact = false }) {
  return <><Header active={active} compact={compact} />{children}<Footer /></>
}

function LogoMark({ color = 'violet', children }) {
  return <span className={`logo-mark mark-${color}`}>{children}</span>
}

function JobCard({ job, saved, onSave }) {
  return (
    <article className="job-card">
      <LogoMark color={job.color}>{job.mark}</LogoMark>
      <div className="job-info">
        <a className="job-title" href={`/jobs/${job.id}`}>{job.title}</a>
        <p className="job-company">{job.company} <span>Â·</span> {job.location}</p>
        <div className="job-tags"><span className="salary-tag">{job.salary}</span><span>{job.type}</span>{job.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <p className="job-remote"><Globe2 size={12} /> Any time Â· 3 days ago <span>Â·</span> Remote</p>
      </div>
      <div className="job-card-actions"><button className={`icon-button${saved ? ' is-saved' : ''}`} onClick={() => onSave(job.id)} aria-label={saved ? 'Remove saved job' : 'Save job'}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /></button><a className="button button-purple apply-small" href={`/jobs/${job.id}`}>Apply Now</a></div>
    </article>
  )
}

function EmployerSidebar() {
  return <aside className="employer-sidebar"><div className="newsletter-card"><span className="eyebrow">The Remote.ly brief</span><h3>Get job alerts in your inbox</h3><p>Hand-picked remote opportunities, delivered weekly.</p><form onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset(); window.alert('Thanks for subscribing! Newsletter delivery will be available when connected.') }}><input type="email" placeholder="you@example.com" aria-label="Email for job alerts" required /><button className="button button-purple full" type="submit">Create Alert</button></form></div><div className="companies-card"><h3>Top companies hiring</h3>{['Linear', 'Deel', 'Figma'].map((name, i) => <a href="/jobs" key={name}><LogoMark color={['violet', 'cyan', 'orange'][i]}>{name[0]}</LogoMark><span><strong>{name}</strong><small>{['12', '8', '6'][i]} open roles</small></span><ArrowUpRight size={14} /></a>)}</div><div className="sidebar-post"><h3>Hiring remote talent?</h3><p>Meet your next great teammate.</p><a className="button button-purple full" href="/post-job">Post a Job <ArrowRight size={14} /></a></div></aside>
}

function HomePage() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const featuredJobs = [
    jobs.find((job) => job.id === 'senior-full-stack-engineer'),
    ...jobs.filter((job) => job.id !== 'senior-full-stack-engineer').slice(0, 3),
  ]
  return (
    <Layout active="jobs">
      <main>
        <section className="hero-section">
          <div className="wrap hero-content">
            <span className="hero-eyebrow"><span /> THE WORLD IS YOUR WORKPLACE</span>
            <h1>Find your next remote tech job<br />or hire top global talent</h1>
            <p>Search 10k+ verified remote roles or hire pre-vetted engineers,<br className="desktop-break" /> designers and PMs in 48 hours.</p>
            <form className="hero-search" onSubmit={(event) => { event.preventDefault(); window.history.pushState({}, '', `/jobs?q=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}&type=${encodeURIComponent(type)}`); window.dispatchEvent(new PopStateEvent('popstate')) }}>
              <label><Search size={16} /><span><small>Job title / skill</small><input placeholder="React, Product Design..." value={search} onChange={(event) => setSearch(event.target.value)} /></span></label>
              <label><MapPin size={16} /><span><small>Location</small><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">Worldwide / Remote</option><option>Americas</option><option>Europe</option><option>Africa</option><option>Asia Pacific</option></select></span></label>
              <label><BriefcaseBusiness size={16} /><span><small>Job type</small><select value={type} onChange={(event) => setType(event.target.value)}><option value="">All types</option><option>Full-time</option><option>Contract</option><option>Part-time</option></select></span></label>
              <button className="button button-purple" type="submit"><Search size={15} /> Search jobs</button>
            </form>
            <div className="popular-searches"><span>Popular:</span>{['React', 'Python', 'UX Designer', 'AI Engineer', 'Product Manager'].map((tag) => <a href={`/jobs?q=${encodeURIComponent(tag)}`} key={tag}>{tag}</a>)}</div>
          </div>
        </section>
        <section className="wrap category-section">
          <div className="section-title-row"><div><h2>Browse by category</h2><p>Find the work that fits your next move.</p></div><a className="text-link" href="/jobs">View all categories <ArrowRight size={14} /></a></div>
          <div className="category-grid">{categories.map(({ name, icon: Icon, count }, index) => <a className="category-card" href={`/jobs?q=${encodeURIComponent(name)}`} key={name}><LogoMark color={['violet','orange','green','magenta','gold','blue'][index]}><Icon size={18} /></LogoMark><strong>{name}</strong><small>{count}</small><span>Explore roles <ArrowRight size={12} /></span></a>)}</div>
        </section>
        <section className="jobs-section">
          <div className="wrap jobs-layout">
            <div><div className="section-title-row jobs-title-row"><div><h2>Featured remote jobs</h2><p><span className="online-dot" /> 2,140 roles posted this week</p></div><label className="sort-label">Sort: <select defaultValue="Recommended"><option>Recommended</option><option>Newest</option><option>Highest salary</option></select></label></div>
              <div className="job-list">{featuredJobs.map((job) => <JobCard key={job.id} job={job} saved={false} onSave={() => window.alert('Sign in to save jobs.')} />)}</div>
              <a className="button button-outline load-more" href="/jobs">Explore all remote jobs <ArrowRight size={15} /></a>
            </div>
            <EmployerSidebar />
          </div>
        </section>
        <section className="wrap talent-callout"><div><span className="eyebrow">For global teams</span><h2>Great people are everywhere.</h2><p>Meet a few of the talented people ready to build whatâ€™s next.</p></div><a className="button button-dark" href="/talent">Browse top talent <ArrowRight size={15} /></a></section>
      </main>
    </Layout>
  )
}

function JobsPage({ route }) {
  const query = new URLSearchParams(route.split('?')[1] || '')
  const [search, setSearch] = useState(query.get('q') || '')
  const [filter, setFilter] = useState('')
  const [saved, setSaved] = useState([])
  const filtered = jobs.filter((job) => `${job.title} ${job.company} ${job.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()) && (!filter || job.type === filter))
  const toggleSave = (id) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  return (
    <Layout active="jobs"><main><section className="page-banner"><div className="wrap"><span className="eyebrow">10,000+ verified opportunities</span><h1>Find your next remote role.</h1><p>Work with great teams, from wherever you do your best work.</p><form className="listing-search" onSubmit={(event) => event.preventDefault()}><Search size={17} /><input placeholder="Job title, skill, or company" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="button button-purple">Search jobs</button></form></div></section>
      <section className="wrap listing-layout"><div><div className="listing-toolbar"><strong>{filtered.length} remote roles</strong><label><Filter size={14} /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All job types</option><option>Full-time</option><option>Contract</option><option>Part-time</option></select></label><span><Clock3 size={14} /> Updated today</span></div><div className="job-list">{filtered.length ? filtered.map((job) => <JobCard key={job.id} job={job} saved={saved.includes(job.id)} onSave={toggleSave} />) : <div className="empty-card"><Search size={22} /><h2>No matching jobs yet</h2><p>Try a different title, skill, or job type.</p><button className="button button-outline" onClick={() => { setSearch(''); setFilter('') }}>Clear filters</button></div>}</div><EmployerSidebar /></div></section></main></Layout>
  )
}

function JobDetailPage({ id }) {
  const job = jobs.find((item) => item.id === id)
  if (!job) return <NotFoundPage />
  const responsibilities = job.responsibilities || [
    'Own projects from early ideas through launch and ongoing improvements.',
    'Collaborate with teammates across product, design, and engineering.',
    'Share your ideas, document decisions, and help the whole team grow.',
    'Build accessible, reliable experiences for a global community.',
  ]
  const requirements = job.requirements || [
    'Meaningful experience in your craft and a strong portfolio of work.',
    'Clear written communication and a collaborative approach.',
    'Comfort working asynchronously across time zones.',
    'A thoughtful, curious mindset and a passion for quality.',
  ]
  const benefits = job.benefits || ['Work from anywhere', 'Home office budget', 'Health benefits', 'Flexible PTO', 'Learning budget', 'Equity & bonus']
  return (
    <Layout active="jobs"><main className="wrap detail-page"><div className="breadcrumbs"><a href="/">Home</a><ArrowRight size={13} /><a href="/jobs">Find jobs</a><ArrowRight size={13} /><span>{job.company}</span></div>
      <div className="job-detail-layout"><article><section className="job-detail-header"><div className={`company-cover cover-${job.color}`} /><LogoMark color={job.color}>{job.mark}</LogoMark><div className="detail-job-heading"><h1>{job.title}</h1><p>{job.company} <span>Â·</span> {job.location}</p><div className="job-tags"><span className="salary-tag">{job.salary}</span><span>{job.type}</span>{job.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="detail-actions"><button className="button button-outline" onClick={() => window.alert('Sign in to save jobs.') }><Bookmark size={15} /> Save job</button><button className="button button-purple" onClick={() => { window.location.href = `/apply/${job.id}` }}>Apply now <ArrowRight size={15} /></button></div></section>
        <div className="detail-content"><h2>Role overview</h2><p>{job.description}</p>{!job.responsibilities && <p>We’re a remote-first team that values clear communication, thoughtful collaboration, and great work. You’ll have the autonomy to make meaningful contributions and the support to do your best work.</p>}<h3>What you’ll do</h3><ul>{responsibilities.map((item) => <li key={item}>{item}</li>)}</ul><h3>What we’re looking for</h3><ul>{requirements.map((item) => <li key={item}>{item}</li>)}</ul><h3>Benefits &amp; perks</h3><div className="benefit-chips">{benefits.map((benefit) => <span key={benefit}>{benefit}</span>)}</div></div>
      </article><aside className="apply-card"><span className="eyebrow">Ready for your next move?</span><h2>Apply for this role</h2><p>Introduce yourself to the {job.company} team.</p><a className="button button-purple full" href={`/apply/${job.id}`}>Apply now — it’s free <ArrowRight size={15} /></a><p className="privacy-hint"><ShieldCheck size={14} /> Your profile is shared only with this employer.</p><hr /><h3>About {job.company}</h3><p>{job.companyAbout || 'A remote-friendly company building products for teams everywhere.'}</p><a className="text-link" href="/jobs">See all open roles <ArrowRight size={13} /></a></aside></div>
      <section className="similar-jobs"><h2>Similar remote roles</h2><div className="similar-grid">{jobs.filter((item) => item.id !== id).slice(0, 2).map((item) => <JobCard key={item.id} job={item} saved={false} onSave={() => window.alert('Sign in to save jobs.')} />)}</div></section>
    </main></Layout>
  )
}

function TalentPage() {
  const [search, setSearch] = useState('')
  const list = talents.filter((person) => `${person.name} ${person.title} ${person.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  return <Layout active="talent"><main><section className="page-banner"><div className="wrap"><span className="eyebrow">A world of possibility</span><h1>Meet your next great teammate.</h1><p>Explore a global network of experienced, independent tech professionals.</p><form className="listing-search" onSubmit={(event) => event.preventDefault()}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search talent, skills, or role" /><button className="button button-purple">Search talent</button></form></div></section><section className="wrap talent-listing"><div className="listing-toolbar"><strong>{list.length} independent professionals</strong><span><ShieldCheck size={14} /> Profiles reviewed</span></div><div className="talent-grid">{list.map((person) => <article className="talent-card" key={person.id}><div className={`talent-banner cover-${person.color}`} /><div className="talent-card-content"><LogoMark color={person.color}>{person.initials}</LogoMark><span className="verified"><BadgeCheck size={13} /> Verified profile</span><h2><a href={`/talent/${person.id}`}>{person.name}</a></h2><p>{person.title}</p><span className="talent-location"><MapPin size={13} /> {person.location}</span><div className="job-tags">{person.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="talent-card-bottom"><strong>{person.salary}</strong><a className="button button-purple" href={`/talent/${person.id}`}>View profile <ArrowRight size={13} /></a></div></div></article>)}</div></section></main></Layout>
}

function TalentDetailPage({ id }) {
  const person = talents.find((item) => item.id === id)
  if (!person) return <NotFoundPage />
  const experienceHistory = person.experienceHistory || [
    { role: 'Senior Software Engineer', company: 'Paystack', period: '2022 – 2025', mark: 'P', color: 'violet', description: 'Built and shipped reliable products used by thousands of people, collaborating with design and product teams.' },
    { role: 'Full-Stack Engineer', company: 'Flutterwave', period: '2019 – 2022', mark: 'F', color: 'green', description: 'Partnered with design and product teams to deliver accessible, dependable customer experiences.' },
    { role: 'Software Engineer', company: 'Andela', period: '2016 – 2019', mark: 'A', color: 'orange', description: 'Developed and maintained web applications for distributed teams and global customers.' },
  ]
  const projects = person.projects || [
    { name: 'Support dashboard', stack: 'React · Analytics', art: 'project-art-one' },
    { name: 'RemoteFlow platform', stack: 'Node.js · PostgreSQL', art: 'project-art-two' },
  ]
  return (
    <Layout active="talent">
      <main className="wrap detail-page">
        <div className="breadcrumbs"><a href="/">Home</a><ArrowRight size={13} /><a href="/talent">Browse talent</a><ArrowRight size={13} /><span>{person.name}</span></div>
        <div className="profile-header">
          <div className={`profile-cover cover-${person.color}`} />
          <div className="profile-top">
            <LogoMark color={person.color}>{person.initials}</LogoMark>
            <div className="profile-identity"><h1>{person.name}</h1><p>{person.title}</p><span><MapPin size={13} /> {person.location}</span></div>
            <div className="profile-actions"><a className="button button-outline" href="/contact"><MessageCircle size={15} /> Message</a><a className="button button-purple" href="/post-job">Hire talent <ArrowRight size={15} /></a></div>
          </div>
          <nav className="profile-tabs" aria-label="Profile sections"><a href="#overview">Overview</a><a href="#experience">Experience</a><a href="#projects">Projects</a><a href="#skills">Skills</a><a href="#resume">Resume</a></nav>
        </div>
        <div className="profile-content">
          <div>
            <section className="info-panel" id="overview"><h2>About {person.name.split(' ')[0]}</h2><p>{person.about}</p><p>I’m looking for a remote-first team where I can make an impact, keep learning, and help bring ambitious ideas to life.</p></section>
            <section className="info-panel" id="experience"><h2>Experience &amp; work history</h2>{experienceHistory.map((experience) => <div className="experience-row" key={`${experience.company}-${experience.role}`}><LogoMark color={experience.color}>{experience.mark}</LogoMark><div><strong>{experience.role} · {experience.company}</strong><small>{experience.period} · Full-time · Remote</small><p>{experience.description}</p></div></div>)}</section>
            <section className="info-panel" id="projects"><div className="section-title-row"><h2>Featured projects</h2></div><div className="project-grid">{projects.map((project) => <article className="project-tile" key={project.name}><div className={`project-art ${project.art}`}>{project.art === 'project-art-one' ? <Monitor size={40} /> : <Code2 size={40} />}</div><strong>{project.name}</strong><small>{project.stack}</small></article>)}</div></section>
          </div>
          <aside className="profile-aside">
            <section className="info-panel" id="skills"><h2>Skills &amp; stack</h2><div className="profile-skill-list">{person.tags.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
            <section className="info-panel"><h2>Availability</h2><p><span className="online-dot" /> Open to opportunities</p><p><Clock3 size={13} /> {person.experience} experience</p><strong className="profile-rate">{person.salary}</strong><a href="/post-job" className="button button-purple full">Contact {person.name.split(' ')[0]} <ArrowRight size={14} /></a></section>
            <section className="info-panel" id="resume"><h2>Resume</h2><p>Resume preview available on request.</p><a className="button button-outline full" href="/contact"><FileText size={14} /> Request resume</a></section>
          </aside>
        </div>
      </main>
    </Layout>
  )
}

function PricingPage() {
  return <Layout active="pricing"><main><section className="page-banner"><div className="wrap"><span className="eyebrow">Simple, transparent pricing</span><h1>Find the right people, faster.</h1><p>One clear price per listing. Pick the visibility that fits your hiring goals.</p></div></section><section className="wrap pricing-layout">{plans.map((plan) => <article className={`plan-card${plan.featured ? ' plan-featured' : ''}`} key={plan.id}>{plan.featured && <span className="plan-badge"><Zap size={12} /> MOST POPULAR</span>}<span className="eyebrow">{plan.featured ? 'Maximum visibility' : 'Great for getting started'}</span><h2>{plan.name}</h2><p>{plan.description}</p><div className="plan-price">${plan.price}<small>{plan.period}</small></div><ul>{plan.features.map((feature) => <li key={feature}><CheckCircle2 size={15} /> {feature}</li>)}</ul><a className={`button ${plan.featured ? 'button-purple' : 'button-outline'} full`} href={`/checkout?plan=${plan.id}`}>Choose {plan.name} <ArrowRight size={15} /></a></article>)}</section><div className="wrap pricing-note"><ShieldCheck size={16} /><span>Secure checkout preview. Payment processing will be enabled when a payment provider is connected.</span></div></main></Layout>
}

const emptyJob = { title: '', category: 'Software Engineering', type: 'Full-time', location: 'Remote', workMode: 'Remote', minSalary: '120000', maxSalary: '180000', currency: 'USD', description: '', skills: 'React, TypeScript, Node.js', questions: '' }

function PostJobPage() {
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState('standard')
  const [job, setJob] = useState(() => { try { return { ...emptyJob, ...JSON.parse(localStorage.getItem('remotely-job-draft') || '{}') } } catch { return emptyJob } })
  const update = (key, value) => setJob((current) => ({ ...current, [key]: value }))
  const saveDraft = () => { try { localStorage.setItem('remotely-job-draft', JSON.stringify(job)) } catch { /* Draft remains in form state. */ } }
  const next = (event) => {
    event.preventDefault()
    saveDraft()
    if (step < 4) setStep(step + 1)
    else window.location.href = `/checkout?plan=${selectedPlan}&job=${encodeURIComponent(job.title)}`
  }
  return <Layout active="post" compact><main className="post-page"><div className="wrap post-wrap"><div className="post-heading"><div><a className="breadcrumbs-link" href="/"><ArrowLeft size={14} /> Home</a><h1>Post a new job</h1><p>Reach 500k+ remote professionals. Average fill time: 14 days.</p></div><span className="draft-status"><span /> Draft saved locally</span></div><div className="stepper">{['Job details', 'Compensation & location', 'Screening questions', 'Review & publish'].map((label, index) => <button key={label} className={step === index + 1 ? 'step active' : step > index + 1 ? 'step complete' : 'step'} onClick={() => { if (index + 1 < step) setStep(index + 1) }}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span><strong>{label}</strong></button>)}</div><div className="post-layout"><form className="post-form" onSubmit={next}>
    {step === 1 && <><section className="form-section"><h2><span>1.</span> Job details</h2><label className="field-label">Job title<input value={job.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Senior Full-Stack Engineer" required /></label><div className="field-row"><label className="field-label">Employment type<select value={job.type} onChange={(e) => update('type', e.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option></select></label><label className="field-label">Work type<select value={job.workMode} onChange={(e) => update('workMode', e.target.value)}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label></div><label className="field-label">Category<select value={job.category} onChange={(e) => update('category', e.target.value)}>{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select></label><label className="field-label">Skills &amp; tags<input value={job.skills} onChange={(e) => update('skills', e.target.value)} placeholder="React, TypeScript, Remote" /></label><small className="field-help">Add up to 10 skills so the right people can find your job.</small></section></>}
    {step === 2 && <><section className="form-section"><h2><span>2.</span> Compensation &amp; location</h2><div className="field-row"><label className="field-label">Currency<select value={job.currency} onChange={(e) => update('currency', e.target.value)}><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option></select></label><label className="field-label">Location<input value={job.location} onChange={(e) => update('location', e.target.value)} placeholder="Worldwide / Remote" /></label></div><div className="field-row"><label className="field-label">Minimum annual salary<input type="number" min="0" value={job.minSalary} onChange={(e) => update('minSalary', e.target.value)} /></label><label className="field-label">Maximum annual salary<input type="number" min={job.minSalary || 0} value={job.maxSalary} onChange={(e) => update('maxSalary', e.target.value)} /></label></div><label className="field-label range-label">Salary transparency <input type="range" min="0" max="100" defaultValue="55" /><small>Candidates prefer listings that include a salary range.</small></label><label className="field-label">Job description<textarea rows="7" value={job.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the role, your team, and what success looks like." required /></label></section></>}
    {step === 3 && <section className="form-section"><h2><span>3.</span> Screening questions</h2><p className="form-intro">Ask a few thoughtful questions to help find the right match. Candidates can also attach their resume and portfolio.</p><label className="field-label">What would you like to ask applicants?<textarea rows="7" value={job.questions} onChange={(e) => update('questions', e.target.value)} placeholder={'For example:\nâ€¢ Tell us about a project you are proud of.\nâ€¢ What time zones can you work in?'} /></label><div className="check-option"><input id="portfolio" type="checkbox" defaultChecked /><label htmlFor="portfolio">Request a resume or portfolio link</label><span>RECOMMENDED</span></div></section>}
    {step === 4 && <section className="form-section"><h2><span>4.</span> Review &amp; choose a plan</h2><div className="review-job"><span className="eyebrow">JOB PREVIEW</span><h3>{job.title || 'Your job title'}</h3><p>{job.category} Â· {job.type} Â· {job.workMode} Â· {job.location}</p><p className="salary-tag">${Number(job.minSalary || 0).toLocaleString()}â€“${Number(job.maxSalary || 0).toLocaleString()} {job.currency} / year</p><div className="job-tags">{job.skills.split(',').filter(Boolean).map((tag) => <span key={tag}>{tag.trim()}</span>)}</div><p>{job.description || 'Add a description on the previous step.'}</p></div><div className="inline-plans">{plans.map((plan) => <label className={`inline-plan${selectedPlan === plan.id ? ' selected' : ''}`} key={plan.id}><input type="radio" name="plan" value={plan.id} checked={selectedPlan === plan.id} onChange={() => setSelectedPlan(plan.id)} /><span><strong>{plan.name}</strong><small>{plan.featured ? 'Featured placement' : 'Standard visibility'} Â· 30 days</small></span><b>${plan.price}</b></label>)}</div><p className="form-intro">Continue to a secure checkout preview. No payment is collected on this demo.</p></section>}
    <div className="form-actions"><button type="button" className="button button-outline" onClick={() => step === 1 ? window.history.back() : setStep(step - 1)}>{step === 1 ? <ArrowLeft size={14} /> : <ArrowLeft size={14} />} {step === 1 ? 'Cancel' : 'Back'}</button><button className="button button-purple" type="submit">{step === 4 ? 'Choose a plan' : 'Save & continue'} <ArrowRight size={14} /></button></div>
    </form><aside className="job-preview-sidebar"><span className="eyebrow">LIVE LISTING PREVIEW</span><div className="preview-job"><LogoMark>{(job.title || 'Your job').slice(0, 1)}</LogoMark><div><strong>{job.title || 'Job title'}</strong><small>{job.category} Â· {job.location}</small></div><p>{job.currency} {Number(job.minSalary || 0).toLocaleString()} â€“ {Number(job.maxSalary || 0).toLocaleString()} / year</p><div className="job-tags">{job.skills.split(',').filter(Boolean).slice(0, 3).map((tag) => <span key={tag}>{tag.trim()}</span>)}</div></div><p className="preview-hint"><ShieldCheck size={14} /> Preview updates as you type</p><div className="preview-step-list">{['Preview free listing', 'Review your job details', 'Choose plan & publish'].map((item, index) => <span className={step > index ? 'done' : ''} key={item}>{step > index ? <Check size={13} /> : index + 1} {item}</span>)}</div><p className="preview-renew">Your listing will be live for 30 days.</p></aside></div></div></main></Layout>
}

function CheckoutPage({ route, navigate }) {
  const params = new URLSearchParams(route.split('?')[1] || '')
  const plan = plans.find((item) => item.id === params.get('plan')) || plans[1]
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [notice, setNotice] = useState('')
  const [jobTitle, setJobTitle] = useState(params.get('job') || '')
  const complete = (event) => {
    event.preventDefault()
    setNotice('Checkout preview complete. No payment was taken. Connect a payment provider to publish your job listing.')
  }
  return <Layout active="pricing"><main><section className="page-banner checkout-banner"><div className="wrap"><span className="eyebrow">Secure checkout</span><h1>Review your order.</h1><p>One last step before your job listing is ready.</p></div></section><section className="wrap checkout-layout"><form className="checkout-form" onSubmit={complete}><div className="checkout-step-title"><span>1</span><div><h2>Billing information</h2><p>Tell us where to send your receipt.</p></div></div><div className="field-row"><label className="field-label">Full name<input autoComplete="name" placeholder="Alex Morgan" required /></label><label className="field-label">Work email<input type="email" autoComplete="email" placeholder="alex@company.com" required /></label></div><label className="field-label">Company name<input autoComplete="organization" placeholder="Your company" required /></label><label className="field-label">Job title<input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="Senior Product Designer" required /></label><div className="checkout-step-title payment-title"><span>2</span><div><h2>Payment method</h2><p>Card payment will be securely processed by the connected provider.</p></div></div><label className={`payment-option${paymentMethod === 'card' ? ' selected' : ''}`}><input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><CreditCard size={17} /><span><strong>Credit or debit card</strong><small>Visa Â· Mastercard Â· American Express</small></span><span className="radio-indicator" /></label><div className="payment-option disabled-payment"><LockKeyhole size={17} /><span><strong>Secure card checkout</strong><small>Payment processing is not connected yet.</small></span><span className="setup-label">SETUP NEEDED</span></div><div className="checkout-terms"><ShieldCheck size={15} /> This demo does not collect card details or charge your payment method.</div>{notice && <p className="checkout-notice" role="status">{notice}</p>}<button className="button button-purple full checkout-button" type="submit">Continue to secure checkout <ArrowRight size={15} /></button><button type="button" className="checkout-back" onClick={() => navigate('/pricing')}><ArrowLeft size={14} /> Back to plans</button></form><aside className="order-summary"><span className="eyebrow">ORDER SUMMARY</span><h2>{plan.name}</h2><p>{plan.description}</p><div className="summary-job"><LogoMark><BriefcaseBusiness size={16} /></LogoMark><span><small>Job listing</small><strong>{jobTitle || 'New remote job'}</strong></span></div><div className="summary-line"><span>Listing plan</span><strong>{plan.name}</strong></div><div className="summary-line"><span>Duration</span><strong>30 days</strong></div><div className="summary-line summary-total"><span>Total today</span><strong>${plan.price}.00 <small>USD</small></strong></div><p className="summary-secure"><ShieldCheck size={14} /> Secure checkout preview Â· no charge</p><p className="summary-small">Your listing can be published after payment processing is connected.</p></aside></section></main></Layout>
}

function AuthPage({ signup = false }) {
  const [role, setRole] = useState(new URLSearchParams(window.location.search).get('role') || 'candidate')
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const title = signup ? 'Join our talent network' : 'Welcome back'
  return <main className="auth-page"><section className="auth-promo"><Brand inverse /><div className="auth-photo" role="img" aria-label="A calm home office set up for remote work" /><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>{signup ? 'Join our talent network of 500k+ remote pros' : 'Connect with top tech talent & remote opportunities worldwide'}</h1><p>Join ambitious people and teams building great things, wherever they call home.</p><div className="social-proof"><div className="avatar-stack"><span>A</span><span>M</span><span>J</span><span>+</span></div><span><strong>Trusted by remote teams</strong><small>Find work. Find your people.</small></span></div></section><section className="auth-card"><a className="auth-home" href="/"><ArrowLeft size={14} /> Back to Remote.ly</a><Brand /><h2>{title}</h2><p className="auth-subtitle">{signup ? 'Free forever for candidates Â· 2 minutes to join.' : 'Sign in to manage applications or manage hiring.'}</p><div className="social-auth"><button type="button" onClick={() => setNotice('Google sign-in is not connected yet.')}><strong>G</strong> Google</button><button type="button" onClick={() => setNotice('LinkedIn sign-in is not connected yet.')}><strong>in</strong> LinkedIn</button><button type="button" onClick={() => setNotice('GitHub sign-in is not connected yet.')}><Code2 size={14} /> GitHub</button></div><div className="auth-divider"><span>or continue with email</span></div><form onSubmit={(event) => { event.preventDefault(); setNotice(signup ? 'Your account details are ready. Account registration is not connected yet.' : 'Sign-in is not connected yet. Please try again later.') }}>{signup && <><div className="role-switch"><button type="button" className={role === 'candidate' ? 'selected' : ''} onClick={() => setRole('candidate')}>Job Seeker / Candidate</button><button type="button" className={role === 'employer' ? 'selected' : ''} onClick={() => setRole('employer')}>Employer / Recruiter</button></div><div className="field-row"><label className="field-label">Full name<input autoComplete="name" placeholder="Alexandra Okafor" required /></label><label className="field-label">Primary role<select><option>Full-Stack Engineer</option><option>Product Designer</option><option>Product Manager</option><option>Data Scientist</option><option>Hiring Manager</option></select></label></div></>}<label className="field-label">Work email<input type="email" autoComplete="email" placeholder="alex@example.com" required /></label><label className="field-label">Password<span className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} placeholder={signup ? 'Create a password' : 'Enter your password'} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span></label>{signup && <><label className="upload-field"><FileText size={20} /><span><strong>Drop your resume or portfolio here</strong><small>PDF, DOC, or link Â· Max 10 MB</small></span><label className="button button-outline upload-button">Browse<input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setNotice(event.target.files?.[0] ? `${event.target.files[0].name} selected. Upload storage is not connected yet.` : '')} /></label></label><label className="terms-check"><input type="checkbox" required /> I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></label></>}{!signup && <div className="remember-row"><label><input type="checkbox" defaultChecked /> Remember me</label><a href="/reset-password">Forgot password?</a></div>}<button className="button button-purple full auth-submit" type="submit">{signup ? 'Create free account' : 'Sign in'} <ArrowRight size={15} /></button></form>{notice && <p className="checkout-notice" role="status">{notice}</p>}<p className="auth-switch">{signup ? 'Already registered?' : 'Donâ€™t have an account?'} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Sign up'}</a></p><p className="auth-security"><ShieldCheck size={13} /> SSL 256-bit protection Â· SOC2 compliant</p></section></main>
}

function ApplyPage({ jobId }) {
  const job = jobs.find((item) => item.id === jobId)
  const [notice, setNotice] = useState('')
  if (!job) return <NotFoundPage />
  return <Layout><main className="wrap simple-page"><div className="form-card"><a className="text-link" href={`/jobs/${job.id}`}><ArrowLeft size={14} /> Back to {job.company}</a><span className="eyebrow">APPLICATION</span><h1>Apply for {job.title}</h1><p>Your profile is shared only with this employer.</p><form onSubmit={(event) => { event.preventDefault(); setNotice('Your application is ready. Sign in or create a profile to submit it.') }}><label className="field-label">Email address<input type="email" autoComplete="email" placeholder="you@example.com" required /></label><label className="field-label">Why are you a good fit?<textarea rows="5" placeholder="Share a little about your experience." required /></label><label className="field-label">Portfolio or LinkedIn URL<input type="url" placeholder="https://" /></label><button className="button button-purple full" type="submit">Continue application <ArrowRight size={15} /></button></form>{notice && <p className="checkout-notice" role="status">{notice} <a href="/login">Sign in</a> or <a href="/signup">create an account</a>.</p>}</div></main></Layout>
}

const informationalPages = {
  about: ['About Remote.ly', 'A global marketplace for work without borders.', 'We help people find meaningful remote work and help thoughtful teams find great talentâ€”wherever they are. Our mission is to make the future of work more open, inclusive, and human.'],
  contact: ['Contact us', 'Weâ€™re here to help.', 'Questions about a listing, hiring, or your profile? Our support team is available Monday through Friday, 9 AMâ€“5 PM UTC. Send us a message using the contact form and weâ€™ll get back to you.'],
  privacy: ['Privacy policy', 'Your data belongs to you.', 'We use your information to operate your profile, help employers and candidates connect, and protect our services. We do not sell your personal information. You can request access, updates, or deletion by contacting our support team.'],
  terms: ['Terms of service', 'A marketplace built on trust.', 'Use Remote.ly honestly and respectfully. Job listings must accurately describe genuine opportunities. Candidates control which information they share with employers. Listing payments are processed only after a secure payment provider is connected.'],
  security: ['Security', 'Your trust matters.', 'We follow industry-standard practices to protect accounts and personal information. Use a unique password and contact our support team if you notice unexpected activity. Payment card details are not collected on this demo site.'],
}

function InformationPage({ slug }) {
  const page = informationalPages[slug]
  if (!page) return <NotFoundPage />
  return <Layout><main className="wrap simple-page"><section className="info-panel"><span className="eyebrow">{page[0]}</span><h1>{page[1]}</h1><p>{page[2]}</p>{slug === 'contact' && <form className="contact-form" onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset(); window.alert('Thanks for reaching out. Our contact service will be available when connected.') }}><label className="field-label">Your email<input type="email" placeholder="you@example.com" required /></label><label className="field-label">Message<textarea rows="4" placeholder="How can we help?" required /></label><button className="button button-purple" type="submit">Send message <ArrowRight size={14} /></button></form>}</section><a className="text-link" href="/">Back to homepage <ArrowRight size={14} /></a></main></Layout>
}

function ResetPasswordPage() {
  const [notice, setNotice] = useState('')
  return <main className="auth-page reset-page"><section className="auth-card"><a className="auth-home" href="/login"><ArrowLeft size={14} /> Back to sign in</a><Brand /><span className="service-icon"><LockKeyhole size={18} /></span><h1>Reset your password</h1><p className="auth-subtitle">Enter the email address linked to your account.</p><form onSubmit={(event) => { event.preventDefault(); setNotice('Password reset is not connected yet. Contact us through the support page for help.') }}><label className="field-label">Email address<input type="email" autoComplete="email" placeholder="you@example.com" required /></label><button className="button button-purple full" type="submit">Send reset link <ArrowRight size={14} /></button></form>{notice && <p className="checkout-notice" role="status">{notice} <a href="/contact">Contact support</a>.</p>}</section></main>
}

function NotFoundPage() {
  return <Layout><main className="wrap empty-card not-found"><span className="eyebrow">404 Â· PAGE NOT FOUND</span><h1>Looks like this opportunity moved.</h1><p>Head back to the marketplace to find your next remote role.</p><a className="button button-purple" href="/">Explore remote jobs <ArrowRight size={14} /></a></main></Layout>
}

export default function App() {
  const { route, navigate, handleClick } = useNavigation()
  const pathname = route.split('?')[0]
  const segments = pathname.split('/').filter(Boolean)
  let page
  if (pathname === '/') page = <HomePage />
  else if (pathname === '/jobs') page = <JobsPage key={route} route={route} />
  else if (pathname.startsWith('/jobs/')) page = <JobDetailPage id={decodeURIComponent(segments.at(-1))} />
  else if (pathname === '/talent') page = <TalentPage />
  else if (pathname.startsWith('/talent/')) page = <TalentDetailPage id={decodeURIComponent(segments.at(-1))} />
  else if (pathname === '/pricing') page = <PricingPage />
  else if (pathname === '/post-job') page = <PostJobPage />
  else if (pathname === '/checkout') page = <CheckoutPage route={route} navigate={navigate} />
  else if (pathname === '/login') page = <AuthPage />
  else if (pathname === '/signup') page = <AuthPage signup />
  else if (pathname === '/apply' || pathname.startsWith('/apply/')) page = <ApplyPage jobId={decodeURIComponent(segments.at(-1))} />
  else if (pathname === '/reset-password') page = <ResetPasswordPage />
  else if (informationalPages[segments[0]]) page = <InformationPage slug={segments[0]} />
  else page = <NotFoundPage />
  return <div onClick={handleClick}>{page}</div>
}
