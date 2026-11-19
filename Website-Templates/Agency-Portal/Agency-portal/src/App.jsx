import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Eye,
  EyeOff,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  MessageSquare,
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
import AdminPortal from './pages/AdminPortal'
import { agencyApi, clearAgencySession, getAgencySession, saveAgencySession } from './services/agencyApi'

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
  '/contact': 'Contact NOVA Studio',
  '/messages': 'Client Messages | NOVA Studio',
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
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(getAgencySession()?.user?.role === 'client')
  }, [])
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
              <a href="/messages" onClick={() => setMenuOpen(false)}>Messages</a>
            </>
          ) : (
            <>
              <a className={active === 'work' ? 'active' : ''} href="/work" onClick={() => setMenuOpen(false)}>Work</a>
              <a className={active === 'services' ? 'active' : ''} href="/services" onClick={() => setMenuOpen(false)}>Services</a>
              <a className={active === 'case-studies' ? 'active' : ''} href="/case-studies" onClick={() => setMenuOpen(false)}>Case Studies</a>
              <a className={active === 'about' ? 'active' : ''} href="/about" onClick={() => setMenuOpen(false)}>About</a>
              <a className={active === 'contact' ? 'active' : ''} href="/messages" onClick={() => setMenuOpen(false)}>Messages</a>
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

function HeroPreview({ project = featuredProject }) {
  const caseStudy = project
  const caseStudyPath = `/case-studies/${caseStudy.slug || caseStudy.id}`

  return (
    <div className="hero-preview" aria-label="Featured NOVA Studio digital commerce project">
      <div className="preview-window">
        <div className="preview-browser"><span /><span /><span /><b>NEXORA</b><i>Shop&nbsp;&nbsp; Studio&nbsp;&nbsp; About</i></div>
        <div className="preview-site">
          <span className="preview-kicker">NEW COLLECTION · 2026</span>
          <h2>WE BUILD DIGITAL<br />EXPERIENCES THAT<br /><em>DRIVE GROWTH</em></h2>
          <p>Designed for the next generation of commerce.</p>
          <a href={caseStudyPath}>EXPLORE THE COLLECTION <ArrowRight size={10} /></a>
          <div className="preview-art-shape" />
          <div className="preview-site-footer"><b>Featured</b><span>{caseStudy.type}</span><strong>{caseStudy.name}</strong><small>{caseStudy.result}</small></div>
        </div>
      </div>
      <div className="preview-progress"><i /><span /><span /><span /></div>
      <div className="preview-controls"><a href={caseStudyPath} aria-label="Featured case study"><ArrowLeft size={13} /></a><a href={caseStudyPath} aria-label="View featured case study"><ArrowRight size={13} /></a></div>
    </div>
  )
}

function HomePage() {
  const [budget, setBudget] = useState('$5k–$15k')
  const [submitted, setSubmitted] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [quoteBusy, setQuoteBusy] = useState(false)
  const [testimonial, setTestimonial] = useState(0)
  const [caseStudies, setCaseStudies] = useState([])
  const [caseStudiesLoaded, setCaseStudiesLoaded] = useState(false)
  const [caseStudiesError, setCaseStudiesError] = useState(false)
  const clientSession = getAgencySession()
  useEffect(() => {
    agencyApi.publicCaseStudies()
      .then(({ caseStudies: records }) => setCaseStudies(records))
      .catch(() => setCaseStudiesError(true))
      .finally(() => setCaseStudiesLoaded(true))
  }, [])
  async function submitHomeInquiry(event) {
    event.preventDefault()
    if (!clientSession || clientSession.user?.role !== 'client') {
      window.location.assign(`/login?redirect=${encodeURIComponent('/quote')}`)
      return
    }
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    setQuoteBusy(true)
    setQuoteError('')
    try {
      await agencyApi.submitInquiry({ phone: values.phone, project: values.project, budget: values.budget })
      setSubmitted(true)
    } catch (requestError) {
      setQuoteError(requestError.message || 'Your project brief could not be sent.')
    } finally {
      setQuoteBusy(false)
    }
  }
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
            <HeroPreview project={caseStudies[0] || featuredProject} />
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
            {(caseStudies.length ? caseStudies : projects).map((project) => (
              <a className="project-card" href={`/case-studies/${project.id}`} key={project.name}>
                <ProjectArtwork project={project} />
                <div className="project-card-copy"><span className="project-type">{project.type}</span><strong>{project.name}</strong><span>{project.client}</span><span className="project-arrow"><ArrowUpRight size={15} /></span></div>
              </a>
            ))}
          </div>
          {caseStudiesError && <p className="page-loading" role="status">Published case studies could not be loaded. Showing sample work.</p>}
          {!caseStudiesLoaded && <p className="page-loading" role="status">Loading case studies…</p>}
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
            ) : clientSession?.user?.role !== 'client' ? (
              <div><p>Sign in or create a client account to send and track your project inquiry.</p><a className="button button-cyan full-width" href={`/login?redirect=${encodeURIComponent('/quote')}`}>Sign in to send a brief <ArrowRight size={14} /></a><small className="quote-note">New to NOVA? <a href={`/signup?redirect=${encodeURIComponent('/quote')}`}>Create a client account</a>.</small></div>
            ) : (
              <form onSubmit={submitHomeInquiry}>
                <p className="quote-note">{clientSession?.user?.role === 'client' ? `Submitting as ${clientSession.user.name} · ${clientSession.user.email}` : <> <a href={`/login?redirect=${encodeURIComponent('/quote')}`}>Sign in to send a project brief</a>.</>}</p>
                <label className="quote-form-label">Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
                <label className="quote-message"><span className="visually-hidden">Project details</span><textarea name="project" placeholder="What do you need? e.g. Website, brand, 3D motion..." rows="3" required /></label>
                <fieldset className="budget-options"><legend>Budget range</legend>{['$2k–$5k', '$5k–$15k', '$15k–$40k', '$40k+'].map((option) => <label className={budget === option ? 'selected' : ''} key={option}><input type="radio" name="budget" value={option} checked={budget === option} onChange={() => setBudget(option)} />{option}</label>)}</fieldset>
                {quoteError && <p className="auth-notice" role="alert">{quoteError}</p>}
                <button className="button button-cyan full-width" type="submit" disabled={quoteBusy}>{quoteBusy ? 'Sending…' : 'Request Quote'} <ArrowRight size={14} /></button>
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
  const [caseStudies, setCaseStudies] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  useEffect(() => {
    agencyApi.publicCaseStudies()
      .then(({ caseStudies: records }) => setCaseStudies(records))
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true))
  }, [])
  const allProjects = caseStudies.length ? caseStudies : [featuredProject, ...projects]
  return (
    <PageLayout active="work">
      <div className="route-page">
        <PageIntro label="OUR WORK" title={<>Good work should<br /><em>show its work.</em></>} description="A selection of the digital experiences, brands, and products we’ve made with ambitious teams." action="Start a project" />
        {loaded ? <div className="route-project-grid">{allProjects.map((project) => <ProjectCard project={project} key={project.id} />)}</div> : <p className="page-loading" role="status">Loading case studies…</p>}
        {loadError && <p className="page-loading" role="status">Published case studies could not be loaded. Showing sample work.</p>}
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
  const [caseStudies, setCaseStudies] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    agencyApi.publicCaseStudies()
      .then(({ caseStudies: records }) => setCaseStudies(records))
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true))
  }, [])

  const displayedProjects = caseStudies.length ? caseStudies : [...projects, featuredProject]

  return (
    <PageLayout active="case-studies">
      <div className="route-page">
        <PageIntro label="SELECTED WORK" title={<>Case studies<br /><em>with receipts.</em></>} description="Good taste is the starting point. We care about what happens after launch, too." action="Tell us what you need" />
        {loaded ? <div className="route-project-grid">{displayedProjects.map((project) => <ProjectCard project={project} key={project.id} />)}</div> : <p className="page-loading" role="status">Loading case studies…</p>}
        {loadError && <p className="page-loading" role="status">Published case studies could not be loaded. Showing sample work.</p>}
        {!caseStudies.length && <section className="results-band"><div><strong>240+</strong><span>Projects shipped</span></div><div><strong>18</strong><span>International awards</span></div><div><strong>98%</strong><span>Client retention</span></div><div><strong>212%</strong><span>Pipeline growth</span></div></section>}
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
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [client, setClient] = useState(null)

  useEffect(() => {
    const session = getAgencySession()
    if (session?.user?.role === 'client') setClient(session.user)
  }, [])

  async function submitInquiry(event) {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    setError('')
    setSending(true)
    try {
      await agencyApi.submitInquiry({ phone: values.phone, project: values.project, budget: values.budget })
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.message || 'Your project brief could not be sent.')
    } finally {
      setSending(false)
    }
  }

  return (
    <PageLayout>
      <div className="route-page quote-page">
        <PageIntro label="PROJECT QUOTE" title={<>Let’s make something<br /><em>worth remembering.</em></>} description="Share a little about your project. A real person from our studio will get back to you within two business days." />
        <div className="quote-route-layout">
          <section className="quote-card" id="project-form">
            <h2>Tell us about your project.</h2><p>More context helps us find the right creative collaborators for your brief.</p>
            {submitted ? (
              <div className="quote-success" role="status"><Check size={18} /><span><strong>Thanks — your brief is in.</strong><small>We’ll follow up within two business days.</small></span></div>
            ) : !client ? (
              <div><p>Sign in or create a client account to send and track your project inquiry.</p><a className="button button-cyan" href={`/login?redirect=${encodeURIComponent('/quote')}`}>Client sign in <ArrowRight size={14} /></a><a href={`/signup?redirect=${encodeURIComponent('/quote')}`}> Create an account</a></div>
            ) : (
              <form onSubmit={submitInquiry}>
                <p className="quote-note">Submitting as {client.name} · {client.email}</p>
                <label className="quote-form-label">Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
                <label className="quote-form-label">What are you building?<textarea name="project" placeholder="Tell us about your goals, audience, and what you need help with..." rows="5" required /></label>
                <fieldset className="budget-options"><legend>Estimated budget</legend>{['$2k–$5k', '$5k–$15k', '$15k–$40k', '$40k+'].map((option) => <label className={budget === option ? 'selected' : ''} key={option}><input type="radio" name="budget" value={option} checked={budget === option} onChange={() => setBudget(option)} />{option}</label>)}</fieldset>
                {error && <p className="wallet-notice error" role="alert">{error}</p>}
                <button className="button button-cyan full-width" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send project brief'} <ArrowRight size={14} /></button>
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

function ContactPage() {
  const [client, setClient] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoaded, setMessagesLoaded] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const session = getAgencySession()
    if (!session || session.user?.role !== 'client') {
      window.location.replace(`/login?redirect=${encodeURIComponent('/messages')}`)
      return
    }
    setClient(session.user)
    agencyApi.clientDashboard()
      .then((dashboard) => setMessages(dashboard.messages))
      .catch((requestError) => setError(requestError.message || 'Unable to load your conversation.'))
      .finally(() => setMessagesLoaded(true))
  }, [])

  async function sendMessage(event) {
    event.preventDefault()
    const form = event.currentTarget
    const message = new FormData(form).get('message')
    setSending(true)
    setSent(false)
    setError('')
    try {
      const { message: sentMessage } = await agencyApi.sendClientMessage(message)
      form.reset()
      setMessages((currentMessages) => [...currentMessages, sentMessage])
      setSent(true)
    } catch (requestError) {
      setError(requestError.message || 'Your message could not be sent.')
    } finally {
      setSending(false)
    }
  }

  return (
    <PageLayout active="contact">
      <div className="route-page quote-page client-messages-page">
        <PageIntro label="CLIENT MESSAGES" title={<>A direct line to<br /><em>your creative team.</em></>} description="Send a private message to the studio and follow replies in this conversation or your client dashboard." />
        <div className="quote-route-layout client-messages-layout">
          <section className="quote-card messages-compose-card">
            <div className="messages-card-heading"><span className="messages-heading-icon"><MessageSquare size={18} /></span><span><h2>Message the studio</h2><p>We’ll get back to you as soon as we can.</p></span></div>
            {client ? <p className="messages-account">Sending as <strong>{client.name}</strong> · {client.email}<i>Private</i></p> : <p className="dashboard-notice" role="status">Checking your client account…</p>}
            <form onSubmit={sendMessage}>
              <label className="quote-form-label">Your message<textarea name="message" maxLength="2000" rows="6" placeholder="Write your message here…" required /><small>Up to 2,000 characters</small></label>
              {error && <p className="auth-notice" role="alert">{error}</p>}
              {sent && <p className="quote-success" role="status"><Check size={18} /> Message sent. We’ll reply in your client portal.</p>}
              <button className="button button-cyan full-width messages-send-button" type="submit" disabled={sending || !client}>{sending ? 'Sending…' : 'Send message'} <ArrowRight size={14} /></button>
              <small className="quote-note"><ShieldCheck size={13} /> Only you and the studio can see this conversation.</small>
            </form>
          </section>
          <aside className="quote-aside client-conversation-card"><div className="conversation-heading"><span className="messages-heading-icon"><MessageSquare size={17} /></span><span><strong>Your conversation</strong><small>Messages with NOVA Studio</small></span><i>Private</i></div>
            <div className="conversation-thread" aria-live="polite">
              {messagesLoaded ? messages.length ? messages.slice().reverse().map((message) => <article className={`client-record conversation-message ${message.sender === 'client' ? 'from-client' : 'from-studio'}`} key={message.id}><div><strong>{message.sender === 'client' ? 'You' : 'NOVA Studio'}</strong><small>{new Date(message.createdAt).toLocaleString()}</small></div><span>{message.body}</span></article>) : <p className="conversation-empty">Your conversation starts here. Send your first message and the studio’s replies will appear here.</p> : <p className="conversation-empty">Loading your conversation…</p>}
            </div>
            <a href="/dashboard">Open client dashboard <ArrowRight size={14} /></a>
          </aside>
        </div>
      </div>
    </PageLayout>
  )
}

function CaseStudyPage({ slug }) {
  const [caseStudies, setCaseStudies] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  useEffect(() => {
    agencyApi.publicCaseStudies()
      .then(({ caseStudies: records }) => setCaseStudies(records))
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true))
  }, [])
  const project = caseStudies.length
    ? caseStudies.find((item) => item.id === slug || item.slug === slug)
    : slug === featuredProject.id ? featuredProject : projects.find((item) => item.id === slug)
  if (!loaded) return <main className="page-loading" role="status">Loading case study…</main>
  if (!project) return <NotFound />
  return (
    <PageLayout active="case-studies">
      <div className="route-page case-study-page">
        {loadError && <p className="page-loading" role="status">Published case studies could not be loaded. Showing sample work.</p>}
        <a className="back-to-work" href="/case-studies"><ArrowLeft size={14} /> All case studies</a>
        <div className="case-study-heading"><span className="section-kicker">{project.type} · {project.client.split(' · ')[0]}</span><h1>{project.name}</h1><p>{project.summary}</p></div>
        <ProjectArtwork project={project} featured />
        <div className="case-study-content"><section><span className="section-kicker">THE CHALLENGE</span><h2>Make the next move matter.</h2><p>{project.description}</p></section><aside><span className="section-kicker">THE IMPACT</span><strong>{project.result}</strong><small>Measured after launch</small><span className="section-kicker deliverables-title">WHAT WE DID</span><ul>{project.deliverables.map((item) => <li key={item}><Check size={13} /> {item}</li>)}</ul></aside></div>
        {!!project.images?.length && <section className="case-study-gallery" aria-label="More project images">{project.images.map((image, index) => <img src={image} alt={`${project.alt} ${index + 2}`} key={`${image}-${index}`} />)}</section>}
        <div className="case-study-next"><span><strong>Have a project like this?</strong><small>Let’s find the right creators for it.</small></span><a className="button button-cyan" href="/quote">Start a project <ArrowRight size={14} /></a></div>
      </div>
    </PageLayout>
  )
}

function AuthPage({ signup = false }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const redirectParam = new URLSearchParams(window.location.search).get('redirect')
  const returnTo = redirectParam?.startsWith('/') && !redirectParam.startsWith('//') && !redirectParam.includes('\\') ? redirectParam : '/dashboard'

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    setNotice('')
    setBusy(true)
    try {
      const session = signup
        ? await agencyApi.signupClient({
          name: values.name,
          company: values.company,
          email: values.email,
          password: values.password,
        })
        : await agencyApi.login({ email: values.email, password: values.password, expectedRole: 'client' })
      if (session.user.role !== 'client') throw new Error('This account does not have client portal access.')
      saveAgencySession(session)
      window.location.assign(returnTo)
    } catch (error) {
      setNotice(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

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
              <h2>Create Account</h2><p className="auth-subtitle">Create an account to access your studio workspace.</p>
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-fields two-col"><label>Full Name<input name="name" autoComplete="name" placeholder="Maya Keller" required /></label><label>Company / Brand<input name="company" autoComplete="organization" placeholder="Vertex Inc." required /></label></div>
                <label>Work Email<input name="email" type="email" autoComplete="email" placeholder="maya@vertex.co" required /></label>
                <label>Create Password<span className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span><small className="field-tip">Use at least 8 characters for a stronger password.</small></label>
                <label className="terms-check"><input type="checkbox" required /> <span>I agree to the <a href="/about">Terms</a> and <a href="/about">Privacy Policy</a></span></label>
                <button className="button button-cyan full-width" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'} <ArrowRight size={14} /></button>
              </form>
            </>
          ) : (
            <>
              <h2>Client &amp; Portal Login</h2><p className="auth-subtitle">View active project progress and invoices.</p>
              <form className="auth-form" onSubmit={handleSubmit}>
                <label>Work Email<span className="input-icon-field"><Mail size={14} /><input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></span></label>
                <label>Password<span className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span></label>
                <div className="login-options"><a href="/forgot-password">Forgot Password?</a></div>
                <button className="button button-cyan full-width" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'} <ArrowRight size={14} /></button>
              </form>
            </>
          )}
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <p className="auth-switch">{signup ? 'Already have an account?' : 'New client?'} <a href={`${signup ? '/login' : '/signup'}?redirect=${encodeURIComponent(returnTo)}`}>{signup ? 'Sign in' : 'Register here'}</a></p>
          <p className="auth-switch">Studio admin? <a href="/admin/login">Admin sign in</a></p>
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
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    const current = getAgencySession()
    if (!current || current.user?.role !== 'client') {
      window.location.replace('/login')
      return
    }
    agencyApi.clientDashboard()
      .then(setDashboard)
      .catch((requestError) => setError(requestError.message || 'Unable to load your client dashboard.'))
  }, [])

  async function sendMessage(event) {
    event.preventDefault()
    const form = event.currentTarget
    const message = new FormData(form).get('message')
    setSending(true)
    setError('')
    try {
      await agencyApi.sendClientMessage(message)
      form.reset()
      setDashboard(await agencyApi.clientDashboard())
    } catch (requestError) {
      setError(requestError.message || 'Your message could not be sent.')
    } finally {
      setSending(false)
    }
  }

  const nav = ['Overview', 'Projects', 'Invoices', 'Inquiries', 'Messages']
  const projects = dashboard?.projects || []
  const invoices = dashboard?.invoices || []
  const messages = dashboard?.messages || []
  const inquiries = dashboard?.inquiries || []
  const notifications = [
    ...messages.filter((message) => message.sender === 'admin').slice(0, 4).map((message) => ({
      id: `message-${message.id}`, section: 'Messages', title: 'New studio message', detail: message.body,
    })),
    ...invoices.filter((invoice) => invoice.status !== 'Paid').slice(0, 4).map((invoice) => ({
      id: `invoice-${invoice.id}`, section: 'Invoices', title: 'Invoice needs attention', detail: `${invoice.id} · ${invoice.status}`,
    })),
    ...projects.filter((project) => project.status !== 'Completed').slice(0, 4).map((project) => ({
      id: `project-${project.id}`, section: 'Projects', title: 'Project update', detail: `${project.name} · ${project.status}`,
    })),
  ]

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Brand compact />
        <div className="workspace-picker"><span className="workspace-avatar">{dashboard?.user?.company?.[0] || 'N'}</span><span><strong>{dashboard?.user?.company || 'Client workspace'}</strong><small>Client workspace</small></span><ChevronDown size={14} /></div>
        <nav aria-label="Dashboard navigation">{nav.map((name) => <button className={active === name ? 'active' : ''} type="button" key={name} onClick={() => setActive(name)}><FolderKanban size={16} />{name}{name === 'Projects' && <span className="nav-count">{projects.length}</span>}</button>)}</nav>
        <div className="sidebar-bottom"><a href="/messages"><MessageSquare size={15} /> Message the studio</a><button className="client-signout" type="button" onClick={() => { clearAgencySession(); window.location.assign('/login') }}><LockKeyhole size={15} /> Sign out</button><div className="user-profile"><span className="user-avatar">{dashboard?.user?.name?.slice(0, 2).toUpperCase() || 'CL'}</span><span><strong>{dashboard?.user?.name || 'Client'}</strong><small>{dashboard?.user?.email || 'Client account'}</small></span><MoreHorizontal size={16} /></div></div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar"><div className="mobile-dash-brand"><Brand compact /></div><div className="dashboard-breadcrumb">Workspace <ArrowRight size={12} /> {active}</div><div className="dashboard-top-actions"><div className="dashboard-notification-wrap"><button className="icon-action" type="button" aria-label={`Notifications${notifications.length ? `, ${notifications.length} updates` : ''}`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={16} />{notifications.length > 0 && <i>{notifications.length > 9 ? '9+' : notifications.length}</i>}</button>{notificationsOpen && <section className="dashboard-notification-popover" aria-label="Notifications"><div className="dashboard-notification-heading"><strong>Updates</strong><span>{notifications.length}</span></div>{notifications.length ? notifications.map((notification) => <button type="button" key={notification.id} onClick={() => { setActive(notification.section); setNotificationsOpen(false) }}><strong>{notification.title}</strong><span>{notification.detail}</span></button>) : <p>You’re all caught up. New project, invoice, and chat updates will appear here.</p>}</section>}</div><a className="button button-cyan" href="/quote"><Plus size={14} /> New Project</a></div></header>
        <div className="dashboard-content">
          <div className="dashboard-greeting"><div><span className="section-kicker">CLIENT WORKSPACE</span><h1>Welcome back, {dashboard?.user?.name || '…'}</h1><p>Your live project updates, invoices, and messages.</p></div></div>
          {error && <p className="dashboard-notice" role="alert">{error}</p>}
          {!dashboard && !error && <p className="dashboard-notice" role="status">Loading your workspace…</p>}
          {dashboard && active === 'Overview' && <section className="metrics-grid" aria-label="Workspace metrics">
            <MetricCard label="Projects" value={String(projects.length)} change={`${projects.filter((item) => item.status !== 'Completed').length} active`} icon={FolderKanban} color="cyan" />
            <MetricCard label="Invoices" value={String(invoices.length)} change={`${invoices.filter((item) => item.status !== 'Paid').length} outstanding`} icon={CreditCard} color="purple" />
            <MetricCard label="Messages" value={String(messages.length)} change="Live conversation" icon={MessageSquare} color="blue" />
            <MetricCard label="Inquiries" value={String(inquiries.length)} change={`${inquiries.filter((inquiry) => inquiry.status === 'Accepted').length} accepted`} icon={MessageSquare} color="purple" />
            <MetricCard label="Account" value="Active" change={dashboard.user.company || 'Client'} icon={ShieldCheck} color="green" />
          </section>}
          {dashboard && (active === 'Overview' || active === 'Projects') && <section className="dashboard-panel client-record-panel"><div className="panel-title"><h2>Projects</h2><span>{projects.length} total</span></div>{projects.map((project) => <article className="client-record" key={project.id}><div><strong>{project.name}</strong><small>{project.service} · due {project.due}</small></div><span>{project.status} · {project.progress}%</span></article>)}{projects.length === 0 && <p className="dashboard-notice">Your studio has not added any projects yet.</p>}</section>}
          {dashboard && (active === 'Overview' || active === 'Invoices') && <section className="dashboard-panel client-record-panel"><div className="panel-title"><h2>Invoices</h2><span>{invoices.length} total</span></div>{invoices.map((invoice) => <article className="client-record" key={invoice.id}><div><strong>{invoice.id}</strong><small>{invoice.date}</small></div><span>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(invoice.amount)} · {invoice.status}</span></article>)}{invoices.length === 0 && <p className="dashboard-notice">There are no invoices yet.</p>}</section>}
          {dashboard && (active === 'Overview' || active === 'Inquiries') && <section className="dashboard-panel client-record-panel"><div className="panel-title"><h2>Project inquiries</h2><span>{inquiries.length} total</span></div>{inquiries.map((inquiry) => <article className="client-record client-inquiry-card" key={inquiry.id}><div className="client-inquiry-details"><strong>{inquiry.company || 'Project inquiry'}</strong><small>{new Date(inquiry.createdAt).toLocaleDateString()} · {inquiry.budget}</small><p>{inquiry.project}</p>{inquiry.response && <div className="client-inquiry-response"><strong>Studio response</strong><p>{inquiry.response}</p></div>}</div><span className={`client-status-badge status-${inquiry.status.toLowerCase()}`}>{inquiry.status}</span></article>)}{inquiries.length === 0 && <p className="dashboard-empty-state">Your project inquiries and studio decisions will appear here.</p>}</section>}
          {dashboard && active === 'Messages' && <section className="dashboard-panel client-record-panel"><div className="panel-title"><h2>Messages</h2><a href="/messages">Open full message page <ArrowRight size={14} /></a></div>{messages.map((message) => <article className="client-record" key={message.id}><div><strong>{message.sender === 'client' ? 'You' : 'NOVA Studio'}</strong><small>{new Date(message.createdAt).toLocaleString()}</small></div><span>{message.body}</span></article>)}{messages.length === 0 && <p className="dashboard-notice">Send a message to start a conversation with the studio.</p>}<form className="client-message-form" onSubmit={sendMessage}><textarea name="message" aria-label="Message" placeholder="Write a message…" maxLength={2000} required /><button className="button button-cyan" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button></form></section>}
        </div>
      </main>
    </div>
  )
}

function ClientRecoveryPage() {
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const token = new URLSearchParams(window.location.search).get('token')

  async function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = token
        ? await agencyApi.resetPassword(token, values.password)
        : await agencyApi.forgotPassword(values.email)
      setNotice(result.resetToken
        ? `Password reset token (development only): ${result.resetToken}`
        : result.message)
    } catch (requestError) {
      setError(requestError.message || 'Unable to complete password recovery.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="agency-admin-auth">
    <form className="agency-admin-auth-card" onSubmit={submit}>
      <a className="agency-admin-back" href="/login">← Back to client sign in</a>
      <span className="agency-admin-kicker">CLIENT ACCOUNT</span>
      <h1>{token ? 'Choose a new password' : 'Reset your password'}</h1>
      <p>{token ? 'Enter a new password for your account.' : 'We will provide reset instructions if the account exists.'}</p>
      {!token && <label>Email<input name="email" type="email" autoComplete="email" required /></label>}
      {token && <label>New password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>}
      <button className="agency-admin-primary-button" disabled={busy}>{busy ? 'Please wait…' : token ? 'Update password' : 'Send reset link'}</button>
      {error && <p className="agency-admin-error" role="alert">{error}</p>}
      {notice && <p className="agency-admin-notice" role="status">{notice}</p>}
    </form>
  </main>
}

function NotFound() {
  return <main className="not-found"><Brand /><h1>That page isn’t here.</h1><p>Explore NOVA Studio’s work and services instead.</p><a className="button button-cyan" href="/">Back to NOVA Studio <ArrowRight size={14} /></a></main>
}

export default function App() {
  const path = window.location.pathname
  const isAdminRoute = path === '/admin' || path.startsWith('/admin/')
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
            : isAdminRoute
              ? 'Admin Workspace | NOVA Studio'
              : pageTitles[path] || (projectSlug ? 'Case Study | NOVA Studio' : 'NOVA Studio | Creative Agency')
  }, [isAdminRoute, isDashboard, isHome, isLogin, isSignup, path, projectSlug])

  if (isAdminRoute) return <AdminPortal />
  if (isHome) return <HomePage />
  if (path === '/work') return <WorkPage />
  if (path === '/services') return <ServicesPage />
  if (path === '/case-studies') return <CaseStudiesPage />
  if (projectSlug) return <CaseStudyPage slug={projectSlug} />
  if (path === '/about') return <AboutPage />
  if (path === '/quote') return <QuotePage />
  if (path === '/contact') return <ContactPage />
  if (path === '/messages') return <ContactPage />
  if (path === '/forgot-password') return <ClientRecoveryPage />
  if (isLogin) return <AuthPage />
  if (isSignup) return <AuthPage signup />
  if (isDashboard) return <DashboardPage />
  return <NotFound />
}
