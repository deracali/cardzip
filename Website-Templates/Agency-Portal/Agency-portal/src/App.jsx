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
import './App.css'

const projects = [
  {
    id: 'lumen-finance',
    name: 'Lumen Finance Dashboard',
    client: 'Fintech · +46% activation',
    type: 'UI/UX',
    visual: 'project-dashboard',
    image: '',
    alt: 'A dark finance analytics dashboard concept',
    summary: 'A calmer way to see the whole business.',
    description: 'We partnered with Lumen to make complex financial data feel clear and actionable. The new dashboard turns daily reporting into a confident decision-making tool.',
    result: '+46% activation',
    deliverables: ['Product strategy', 'UX research', 'Dashboard design system', 'Frontend engineering'],
  },
  {
    id: 'kinetiq-store',
    name: 'Kinetiq Streetwear Store',
    client: 'E-commerce · 3.2× revenue',
    type: 'E-commerce',
    visual: 'project-fashion',
    image: '/kinetiq-bag.jpg',
    alt: 'A designer handbag photographed for an e-commerce campaign',
    summary: 'A digital flagship built to move culture.',
    description: 'Kinetiq needed a storefront with the energy of its streetwear drops and the clarity shoppers expect. We rebuilt the brand experience around product storytelling and a faster path to checkout.',
    result: '3.2× revenue',
    deliverables: ['Brand direction', 'Commerce UX', 'Shopify build', 'Campaign art direction'],
  },
  {
    id: 'pulse-brand',
    name: 'Pulse Brand in Motion',
    client: 'Branding · 12M views',
    type: '3D Motion',
    visual: 'project-pulse',
    image: '',
    alt: 'Colorful abstract brand artwork',
    summary: 'A visual system with a pulse of its own.',
    description: 'We gave Pulse a flexible motion identity that could live across product launches, social campaigns, and immersive web experiences without losing its unmistakable color.',
    result: '12M campaign views',
    deliverables: ['Visual identity', 'Motion language', '3D toolkit', 'Launch campaign'],
  },
]

const featuredProject = {
  id: 'aurora-commerce',
  name: 'Aurora Immersive 3D Commerce',
  client: 'Nexora · +372% conversion',
  type: '3D Motion · WebGL',
  visual: 'project-aurora',
  image: '',
  alt: 'A dark immersive commerce experience with vivid green 3D artwork',
  summary: 'A storefront that feels like stepping into another world.',
  description: 'For Nexora, we built an immersive 3D shopping experience that brings a new collection to life. The high-impact visual system pairs real-time product storytelling with a clear, fast path to purchase.',
  result: '+372% conversion',
  deliverables: ['Digital strategy', '3D art direction', 'WebGL development', 'Commerce experience'],
}

const dashboardRows = [
  { name: 'E-Commerce Platform', category: 'Web Application', amount: '$32,1K', color: 'cyan' },
  { name: 'AI Analytics Dashboard', category: 'AI & Data', amount: '$24,8K', color: 'purple' },
  { name: 'Mobile Banking App', category: 'Mobile App', amount: '$18,7K', color: 'blue' },
  { name: 'SaaS Management Tool', category: 'Dashboard', amount: '$12,9K', color: 'pink' },
]

const pageTitles = {
  '/work': 'Selected Work | NOVA Studio',
  '/services': 'Creative Services | NOVA Studio',
  '/case-studies': 'Case Studies | NOVA Studio',
  '/about': 'About the Creators | NOVA Studio',
  '/quote': 'Start a Project | NOVA Studio',
}

function Brand({ compact = false }) {
  return (
    <a className="brand" href="/" aria-label="NOVA Studio home">
      <img src="/favicon.svg" alt="" />
      <span className="brand-copy"><strong>NOVA Studio</strong>{!compact && <small>CREATIVE AGENCY</small>}</span>
    </a>
  )
}

function Header({ portal = false, active = '' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {portal ? (
            <>
              <a href="/work" onClick={() => setMenuOpen(false)}>Work</a>
              <a href="/services" onClick={() => setMenuOpen(false)}>Services</a>
              <a href="/dashboard" onClick={() => setMenuOpen(false)}>Client portal</a>
            </>
          ) : (
            <>
              <a className={active === 'work' ? 'active' : ''} href="/work" onClick={() => setMenuOpen(false)}>Work</a>
              <a className={active === 'services' ? 'active' : ''} href="/services" onClick={() => setMenuOpen(false)}>Services</a>
              <a className={active === 'case-studies' ? 'active' : ''} href="/case-studies" onClick={() => setMenuOpen(false)}>Case Studies</a>
              <a className={active === 'about' ? 'active' : ''} href="/about" onClick={() => setMenuOpen(false)}>About</a>
            </>
          )}
        </nav>
        <div className="header-actions">
          <span className="availability"><i /> Available for Q4</span>
          <a className="button button-cyan header-cta" href="/quote">Get a Quote</a>
        </div>
      </div>
    </header>
  )
}

function ProjectArtwork({ project, featured = false }) {
  return (
    <div className={`project-art ${project.visual}${featured ? ' project-art-featured' : ''}`} role="img" aria-label={project.alt}>
      {project.image && <img src={project.image} alt="" />}
      {project.visual === 'project-dashboard' && (
        <div className="mini-dashboard">
          <div className="mini-dash-top"><span>LUMEN <b>FINANCE</b></span><i /><i /><i /></div>
          <div className="mini-dash-body">
            <div className="mini-dash-side"><i /><i /><i /><i /><i /></div>
            <div className="mini-dash-content">
              <strong>Good morning, Maya</strong><small>Here's your business overview</small>
              <div className="mini-dash-metrics"><span>$24,890<small>Total revenue</small></span><span>+18.6%<small>Growth</small></span></div>
              <div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
          </div>
        </div>
      )}
      {project.visual === 'project-aurora' && <div className="aurora-art"><span>NEXORA</span><strong>DRIVE<br />GROWTH</strong><i /><b /></div>}
      {project.visual === 'project-fashion' && <span className="art-label">KINETIQ®</span>}
      {project.visual === 'project-pulse' && <div className="pulse-ribbons"><i /><i /><i /></div>}
      {featured && project.visual === 'project-pulse' && <span className="featured-stamp">NEXORA · DIGITAL EXPERIENCE</span>}
    </div>
  )
}

function HeroPreview() {
  return (
    <div className="hero-preview" aria-label="Featured NOVA Studio digital commerce project">
      <div className="preview-window">
        <div className="preview-browser"><span /><span /><span /><b>NEXORA</b><i>Shop&nbsp;&nbsp; Studio&nbsp;&nbsp; About</i></div>
        <div className="preview-site">
          <span className="preview-kicker">NEW COLLECTION · 2026</span>
          <h2>WE BUILD DIGITAL<br />EXPERIENCES THAT<br /><em>DRIVE GROWTH</em></h2>
          <p>Designed for the next generation of commerce.</p>
          <a href="/case-studies/aurora-commerce">EXPLORE THE COLLECTION <ArrowRight size={10} /></a>
          <div className="preview-art-shape" />
          <div className="preview-site-footer"><b>Featured</b><span>3D Motion · WebGL</span><strong>Aurora — Immersive 3D Commerce</strong><small>+372% conversion rate · 05:45</small></div>
        </div>
      </div>
      <div className="preview-progress"><i /><span /><span /><span /></div>
      <div className="preview-controls"><a href="/case-studies/lumen-finance" aria-label="Previous featured project"><ArrowLeft size={13} /></a><a href="/case-studies/aurora-commerce" aria-label="View featured project"><ArrowRight size={13} /></a></div>
    </div>
  )
}

function HomePage() {
  const [budget, setBudget] = useState('$5k–$15k')
  const [submitted, setSubmitted] = useState(false)
  const [testimonial, setTestimonial] = useState(0)
  const testimonials = [
    { quote: '“Nova took us from template hell to a site that actually sells. Pipeline up 212% in one quarter.”', person: 'Maya Keller, CMO — Vertex', detail: 'Verified client · SaaS project', initials: 'MK' },
    { quote: '“The team understood our brand on day one and shipped an experience our customers love using.”', person: 'Isaac Newton, Founder — Nexora', detail: 'Verified client · Commerce project', initials: 'IN' },
    { quote: '“A rare creative partner who can make it beautiful and prove it works.”', person: 'Ava Chen, VP Product — Lumen', detail: 'Verified client · Product design', initials: 'AC' },
  ]
  return (
    <div className="agency-app">
      <Header active="work" />
      <main>
        <section className="hero-section" id="work">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="booking-pill"><i /> Booking new projects for 2026 — 2 slots left</span>
              <h1>We Build Digital Experiences <span>That Drive Growth</span></h1>
              <p>Full-stack creative agency for ambitious brands. Branding, websites, 3D motion &amp; product design — shipped fast, measured in revenue.</p>
              <div className="hero-buttons"><a className="button button-cyan" href="/quote">Get a Quote <ArrowRight size={14} /></a><a className="button button-outline" href="/work"><Play size={13} fill="currentColor" /> View Showreel</a></div>
              <div className="hero-stats"><div><strong>240+</strong><span>Projects shipped</span></div><div><strong>18 Awards</strong><span>Recognized worldwide</span></div><div><strong>98% Retention</strong><span>Clients stay</span></div></div>
            </div>
            <HeroPreview />
          </div>
        </section>

        <div className="client-strip" aria-label="Selected clients">
          <span>VERTEX</span><span>Lumina®</span><span>HELIX</span><span>Northbeam</span><span>OPAL &amp; CO</span><span>Kinfolk</span>
        </div>

        <section className="work-section section-shell" id="case-studies">
          <div className="section-heading">
            <div><span className="section-kicker">SELECTED WORK</span><h2>Case studies with receipts.</h2></div>
            <a className="button button-outline" href="/work">View all work <ArrowRight size={13} /></a>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <a className="project-card" href={`/case-studies/${project.id}`} key={project.name}>
                <ProjectArtwork project={project} />
                <div className="project-card-copy"><span className="project-type">{project.type}</span><strong>{project.name}</strong><span>{project.client}</span><span className="project-arrow"><ArrowUpRight size={15} /></span></div>
              </a>
            ))}
          </div>
        </section>

        <section className="services-section section-shell" id="services">
          <div className="section-heading"><div><span className="section-kicker">WHAT WE MAKE</span><h2>Small team. Unfair range.</h2></div><p>One creative partner from the first sketch to the final shipped pixel.</p></div>
          <div className="service-grid">
            <article><span className="service-icon"><Sparkles size={18} /></span><h3>Brand &amp; identity</h3><p>Distinctive identities, strategy, and art direction that make you impossible to confuse.</p><span>Strategy · Identity · Campaigns</span></article>
            <article><span className="service-icon"><Globe2 size={18} /></span><h3>Digital experiences</h3><p>Fast, beautiful websites and commerce experiences designed to turn attention into action.</p><span>Websites · E-commerce · Product</span></article>
            <article><span className="service-icon"><Zap size={18} /></span><h3>Motion &amp; 3D</h3><p>Stop-the-scroll visual stories, product films, and interactive worlds with a pulse.</p><span>3D · Motion · WebGL</span></article>
          </div>
        </section>

        <section className="proof-contact section-shell" id="about">
          <article className="testimonial-card">
            <span className="rating">★★★★★</span>
            <blockquote>{testimonials[testimonial].quote}</blockquote>
            <div className="testimonial-person"><span className="person-avatar">{testimonials[testimonial].initials}</span><span><strong>{testimonials[testimonial].person}</strong><small>{testimonials[testimonial].detail}</small></span></div>
            <div className="testimonial-controls"><span className="testimonial-dots">{testimonials.map((item, index) => <i className={index === testimonial ? 'selected' : ''} key={item.initials} />)}</span><button aria-label="Previous testimonial" type="button" onClick={() => setTestimonial((testimonial + testimonials.length - 1) % testimonials.length)}><ArrowLeft size={13} /></button><button aria-label="Next testimonial" type="button" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ArrowRight size={13} /></button></div>
          </article>
          <section className="quote-card" id="project-form">
            <span className="section-kicker">— PROJECT QUOTE</span><h2>Tell us about your project.</h2><p>Get a scoped proposal + timeline in 48 hours. No fluff.</p>
            {submitted ? (
              <div className="quote-success" role="status"><Check size={18} /><span><strong>Thanks — your brief is in.</strong><small>We’ll follow up within two business days.</small></span></div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
                <div className="quote-fields"><label><span className="visually-hidden">Name</span><input name="name" placeholder="Name" autoComplete="name" required /></label><label><span className="visually-hidden">Work email</span><input name="email" type="email" placeholder="Work email" autoComplete="email" required /></label></div>
                <label className="quote-message"><span className="visually-hidden">Project details</span><textarea name="project" placeholder="What do you need? e.g. Website, brand, 3D motion..." rows="3" required /></label>
                <fieldset className="budget-options"><legend>Budget range</legend>{['$2k–$5k', '$5k–$15k', '$15k–$40k', '$40k+'].map((option) => <label className={budget === option ? 'selected' : ''} key={option}><input type="radio" name="budget" value={option} checked={budget === option} onChange={() => setBudget(option)} />{option}</label>)}</fieldset>
                <button className="button button-cyan full-width" type="submit">Request Quote <ArrowRight size={14} /></button>
                <small className="quote-note">Avg. response time: 6 hours · NDA on request</small>
              </form>
            )}
          </section>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <Brand />
      <span>© {new Date().getFullYear()} NOVA Studio — Made for what’s next.</span>
      <nav aria-label="Studio links">
        <a href="/work">Work</a><a href="/services">Services</a><a href="/about">About</a><a href="/quote">Get a Quote</a><a href="/login">Client portal</a>
      </nav>
    </footer>
  )
}

function PageLayout({ active, children }) {
  return <div className="agency-app"><Header active={active} /><main>{children}</main><SiteFooter /></div>
}

function PageIntro({ label, title, description, action }) {
  return (
    <section className="route-intro">
      <div><span className="section-kicker">{label}</span><h1>{title}</h1><p>{description}</p></div>
      {action && <a className="button button-cyan" href="/quote">{action} <ArrowRight size={14} /></a>}
    </section>
  )
}

function ProjectCard({ project }) {
  return (
    <a className="project-card" href={`/case-studies/${project.id}`}>
      <ProjectArtwork project={project} />
      <div className="project-card-copy"><span className="project-type">{project.type}</span><strong>{project.name}</strong><span>{project.client}</span><span className="project-arrow"><ArrowUpRight size={15} /></span></div>
    </a>
  )
}

function WorkPage() {
  const allProjects = [featuredProject, ...projects]
  return (
    <PageLayout active="work">
      <div className="route-page">
        <PageIntro label="OUR WORK" title={<>Good work should<br /><em>show its work.</em></>} description="A selection of the digital experiences, brands, and products we’ve made with ambitious teams." action="Start a project" />
        <div className="route-project-grid">{allProjects.map((project) => <ProjectCard project={project} key={project.id} />)}</div>
        <div className="route-callout"><span><strong>Have a good one in mind?</strong><small>Tell us what you’re building. We’ll bring the right creators.</small></span><a className="button button-cyan" href="/quote">Let’s talk <ArrowRight size={14} /></a></div>
      </div>
    </PageLayout>
  )
}

function ServicesPage() {
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

function CaseStudiesPage() {
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

function AboutPage() {
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

function QuotePage() {
  const [budget, setBudget] = useState('$5k–$15k')
  const [submitted, setSubmitted] = useState(false)
  return (
    <PageLayout>
      <div className="route-page quote-page">
        <PageIntro label="PROJECT QUOTE" title={<>Let’s make something<br /><em>worth remembering.</em></>} description="Share a little about your project. A real person from our studio will get back to you within two business days." />
        <div className="quote-route-layout">
          <section className="quote-card" id="project-form">
            <h2>Tell us about your project.</h2><p>More context helps us find the right creative collaborators for your brief.</p>
            {submitted ? (
              <div className="quote-success" role="status"><Check size={18} /><span><strong>Thanks — your brief is in.</strong><small>We’ll follow up within two business days.</small></span></div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
                <div className="quote-fields"><label>Name<input name="name" placeholder="Your name" autoComplete="name" required /></label><label>Work email<input name="email" type="email" placeholder="you@company.com" autoComplete="email" required /></label></div>
                <label className="quote-form-label">Company or brand<input name="company" placeholder="Your company" autoComplete="organization" /></label>
                <label className="quote-form-label">What are you building?<textarea name="project" placeholder="Tell us about your goals, audience, and what you need help with..." rows="5" required /></label>
                <fieldset className="budget-options"><legend>Estimated budget</legend>{['$2k–$5k', '$5k–$15k', '$15k–$40k', '$40k+'].map((option) => <label className={budget === option ? 'selected' : ''} key={option}><input type="radio" name="budget" value={option} checked={budget === option} onChange={() => setBudget(option)} />{option}</label>)}</fieldset>
                <button className="button button-cyan full-width" type="submit">Send project brief <ArrowRight size={14} /></button>
                <small className="quote-note">Your project details stay private · NDA available on request</small>
              </form>
            )}
          </section>
          <aside className="quote-aside"><span className="section-kicker">WHAT HAPPENS NEXT</span><ol><li><b>01</b><span><strong>We read your brief</strong><small>A studio lead reviews every inquiry.</small></span></li><li><b>02</b><span><strong>We set up a quick call</strong><small>Get aligned on goals, timing, and fit.</small></span></li><li><b>03</b><span><strong>You get a clear proposal</strong><small>Scope, team, timeline, and investment.</small></span></li></ol><p><ShieldCheck size={14} /> No pressure. No spam. Just a thoughtful response.</p></aside>
        </div>
      </div>
    </PageLayout>
  )
}

function CaseStudyPage({ slug }) {
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

function AuthPage({ signup = false }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [accountType, setAccountType] = useState('client')
  return (
    <div className="portal-shell">
      <Header portal />
      <main className="auth-layout">
        <section className="auth-visual">
          <div className="auth-photo" />
          <span className="auth-pill"><i /> {signup ? 'Onboarding · 2 min' : 'Showreel 26'}</span>
          <div className="auth-visual-copy"><span className="eyebrow">NOVA STUDIO · CLIENT PORTAL</span><h1>{signup ? 'Create your client workspace.' : 'Manage projects, deliverables & client dashboards.'}</h1><p>{signup ? 'Invite your team, share brand assets and kick off with a scoped proposal.' : 'Track milestones, approve designs and pay invoices in one portal.'}</p><div className="auth-highlights"><a href="/work"><span className="play-circle"><Play size={13} fill="currentColor" /></span> Play showreel <small>2:54 · 24 projects</small></a><span><strong>+248%</strong><small>Avg. client growth</small></span></div></div>
        </section>
        <section className="auth-panel">
          <a className="back-home" href="/"><ArrowLeft size={14} /> Back to NOVA Studio</a>
          <div className="auth-panel-brand"><Brand compact /></div>
          {signup ? (
            <>
              <h2>Create Account</h2><p className="auth-subtitle">Join 2,400+ brands managing work with Nova.</p>
              <div className="account-switch"><button className={accountType === 'client' ? 'selected' : ''} type="button" onClick={() => setAccountType('client')}>Client / Business</button><button className={accountType === 'team' ? 'selected' : ''} type="button" onClick={() => setAccountType('team')}>Team / Freelancer</button></div>
              <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setNotice('Your account is ready to connect to the NOVA Studio client portal.') }}>
                <div className="auth-fields two-col"><label>Full Name<input name="name" autoComplete="name" placeholder="Maya Keller" required /></label><label>Company / Brand<input name="company" autoComplete="organization" placeholder="Vertex Inc." required /></label></div>
                <label>Work Email<input name="email" type="email" autoComplete="email" placeholder="maya@vertex.co" required /></label>
                <label>Create Password<span className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span><small className="field-tip">Use at least 8 characters for a stronger password.</small></label>
                <label className="terms-check"><input type="checkbox" required /> <span>I agree to the <a href="/about">Terms</a> and <a href="/about">Privacy Policy</a></span></label>
                <button className="button button-cyan full-width" type="submit">Create Account <ArrowRight size={14} /></button>
              </form>
            </>
          ) : (
            <>
              <h2>Client &amp; Portal Login</h2><p className="auth-subtitle">View active project progress and invoices.</p>
              <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setNotice('Sign-in is a demo. Use Preview dashboard to view the client portal.') }}>
                <label>Work Email<span className="input-icon-field"><Mail size={14} /><input name="email" type="email" autoComplete="email" defaultValue="maya@vertex.co" required /></span></label>
                <label>Password<span className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" defaultValue="NovaStudio26!" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span></label>
                <div className="login-options"><label className="remember-check"><input type="checkbox" defaultChecked /> Remember Me</label><button type="button" onClick={() => setNotice('Password reset is available once your portal account is connected.')}>Forgot Password?</button></div>
                <button className="button button-cyan full-width" type="submit">Sign In <ArrowRight size={14} /></button>
              </form>
            </>
          )}
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <div className="auth-divider"><span>or continue with</span></div>
          <div className="social-login"><button type="button" onClick={() => setNotice('Google sign-in is not connected yet.')}><b>G</b> Google</button><button type="button" onClick={() => setNotice('Dribbble sign-in is not connected yet.')}><b className="dribbble-mark">●</b> Dribbble</button></div>
          <p className="auth-switch">{signup ? 'Already have an account?' : 'New client?'} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Register here'}</a></p>
          {!signup && <a className="preview-dashboard-link" href="/dashboard"><LayoutDashboard size={14} /> Preview the client dashboard</a>}
        </section>
      </main>
      <footer className="portal-footer"><ShieldCheck size={13} /> Secure client workspace · <a href="/">Nova Studio</a></footer>
    </div>
  )
}

function MetricCard({ label, value, change, icon: Icon, color }) {
  return (
    <article className={`metric-card metric-${color}`}>
      <div className="metric-label">{label}<span><Icon size={16} /></span></div>
      <strong>{value}</strong><small><ArrowUpRight size={12} /> {change}</small>
      <svg className="sparkline" viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true"><path d="M0 37 C18 35 24 30 35 32 S57 37 69 23 S90 35 105 27 S125 30 136 18 S155 26 169 10 S186 17 200 4" /></svg>
    </article>
  )
}

function DashboardPage() {
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

function NotFound() {
  return <main className="not-found"><Brand /><h1>That page isn’t here.</h1><p>Explore NOVA Studio’s work and services instead.</p><a className="button button-cyan" href="/">Back to NOVA Studio <ArrowRight size={14} /></a></main>
}

export default function App() {
  const path = window.location.pathname
  const isSignup = path === '/signup'
  const isLogin = path === '/login'
  const isDashboard = path === '/dashboard'
  const isHome = path === '/'
  const projectMatch = path.match(/^\/case-studies\/([^/]+)$/)
  const projectSlug = projectMatch ? decodeURIComponent(projectMatch[1]) : ''
  useEffect(() => {
    document.title = isHome
      ? 'NOVA Studio | Creative Agency for Ambitious Brands'
      : isDashboard
        ? 'Client Dashboard | NOVA Studio'
        : isSignup
          ? 'Create Your Account | NOVA Studio'
          : isLogin
            ? 'Client Portal Login | NOVA Studio'
            : pageTitles[path] || (projectSlug ? 'Case Study | NOVA Studio' : 'NOVA Studio | Creative Agency')
  }, [isDashboard, isHome, isLogin, isSignup, path, projectSlug])

  if (isHome) return <HomePage />
  if (path === '/work') return <WorkPage />
  if (path === '/services') return <ServicesPage />
  if (path === '/case-studies') return <CaseStudiesPage />
  if (projectSlug) return <CaseStudyPage slug={projectSlug} />
  if (path === '/about') return <AboutPage />
  if (path === '/quote') return <QuotePage />
  if (isLogin) return <AuthPage />
  if (isSignup) return <AuthPage signup />
  if (isDashboard) return <DashboardPage />
  return <NotFound />
}
