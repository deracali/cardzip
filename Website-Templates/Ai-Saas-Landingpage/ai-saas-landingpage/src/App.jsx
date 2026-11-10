import { useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Database,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Play,
  Plug,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'For curious teams getting started with AI.',
    features: ['1,000 AI tasks / month', '3 active agents', 'Community support', 'Core integrations'],
    cta: 'Get started free',
    slug: 'starter',
  },
  {
    name: 'Pro',
    price: { monthly: 39, annual: 29 },
    description: 'For teams ready to automate the busywork.',
    features: ['25,000 AI tasks / month', '25 active agents', 'All 50+ integrations', 'Priority support', 'Private knowledge base'],
    cta: 'Start Pro trial',
    slug: 'pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 129, annual: 99 },
    description: 'For organizations with advanced needs.',
    features: ['Unlimited AI tasks', 'Unlimited agents', 'SSO / SAML & SCIM', 'Dedicated success manager', 'Custom limits & deployment'],
    cta: 'Talk to sales',
    slug: 'enterprise',
  },
]

const faqs = [
  ['How long does setup take?', 'Most teams connect their first integration in under 5 minutes. Import your data, pick a template, and your first agent is on the way.'],
  ['Do I need engineers to use Nexara?', 'No. Build and launch workflows with our visual editor. Developers can still customize agents and connect APIs when they need more control.'],
  ['How is my data secure?', 'Your data is encrypted in transit and at rest. We never train public AI models on your private data, and team access is managed from one place.'],
  ['Can I switch plans or cancel anytime?', 'Yes. Change your plan whenever your needs change. You can cancel a paid plan from your workspace settings at any time.'],
]

const routeNames = [
  ['/features', 'Features'],
  ['/integrations', 'Integrations'],
  ['/pricing', 'Pricing'],
  ['/faq', 'FAQ'],
  ['/docs', 'Docs'],
]

function Logo() {
  return <a className="brand" href="/" aria-label="Nexara AI home"><img className="brand-mark" src="/favicon.svg" alt="" /><span>Nexara <b>AI</b></span></a>
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {routeNames.map(([href, label]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="nav-login" href="/login" onClick={() => setMenuOpen(false)}>Log in</a>
          <a className="button button-small" href="/signup" onClick={() => setMenuOpen(false)}>Get started free <ArrowRight size={14} /></a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div><Logo /><p className="footer-blurb">Put your team's busywork on autopilot.</p></div>
        <div className="footer-links"><a href="/features">Features</a><a href="/integrations">Integrations</a><a href="/pricing">Pricing</a><a href="/docs">Docs</a></div>
        <div className="footer-links"><a href="/contact">Talk to sales</a><a href="/faq">FAQ</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Nexara AI, Inc.</span><span>Built for humans. Powered by AI.</span></div>
    </footer>
  )
}

function DashboardPreview() {
  return (
    <div className="dashboard" aria-label="Preview of the Nexara workflow dashboard">
      <div className="dashboard-top"><div className="window-dots"><i /><i /><i /></div><div className="dashboard-address">app.nexara.ai / overview</div><div className="live-status"><span /> Live</div><div className="avatar">A</div></div>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <div className="side-active"><Layers3 size={14} /> Overview</div><div><Bot size={14} /> AI Agents</div><div><Workflow size={14} /> Workflows</div><div><Database size={14} /> Knowledge</div><div><Activity size={14} /> Analytics</div><div><LockKeyhole size={14} /> Settings</div>
          <div className="usage-card"><Zap size={14} /><b>AI Credits</b><span>82% remaining</span><i><em /></i></div>
        </aside>
        <section className="dashboard-content">
          <div className="dashboard-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h3>Workflow intelligence</h3><span>Here's what's happening with your agents.</span></div><button type="button" className="mini-button"><Sparkles size={12} /> New agent</button></div>
          <div className="metric-grid">
            <div className="metric"><span>Tasks automated</span><b>48,281</b><small>↗ 18.3%</small></div>
            <div className="metric"><span>Time saved</span><b>1,240h</b><small>↗ 12.4%</small></div>
            <div className="metric"><span>Accuracy</span><b>99.2%</b><small>↗ 0.8%</small></div>
          </div>
          <div className="dashboard-lower">
            <div className="chart-card"><div className="chart-title"><b>Automation throughput</b><span><i /> All AI agents</span></div><div className="chart-bars">{[34, 48, 41, 58, 45, 70, 52, 83, 69, 92, 75, 100, 79, 91].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><div className="chart-axis"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span></div></div>
            <div className="agents-card"><b>Active agents</b>{[['Support Triage', 'Running'], ['Doc Summarizer', 'Queued'], ['Lead Enrichment', 'Running']].map(([name, status]) => <div className="agent-row" key={name}><span className="agent-dot" />{name}<small>{status}</small></div>)}<a href="/features">View all agents <ArrowRight size={11} /></a></div>
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, copy }) {
  return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
}

function FeatureCards() {
  const features = [
    [Bot, 'Autonomous AI agents', 'Delegate repetitive work to smart, reliable agents that get better with every task.'],
    [Workflow, 'Zero-config workflows', 'Connect the tools you already use and launch your first automation in minutes.'],
    [ShieldCheck, 'Enterprise security', 'Keep your data protected with strong access controls and encryption by default.'],
    [Activity, 'Real-time analytics', 'See time saved, workflow health, and agent performance in one clear view.'],
    [Database, 'Private knowledge base', 'Give your agents the context they need with your own trusted company knowledge.'],
    [GitBranch, 'Human-in-the-loop', 'Review important decisions and keep your team in control of every workflow.'],
  ]
  return <div className="feature-grid">{features.map(([Icon, title, copy], i) => <article className={`feature-card feature-card-${i + 1}`} key={title}><span className="feature-icon"><Icon size={18} /></span><h3>{title}</h3><p>{copy}</p>{i === 0 && <a className="card-link" href="/features">Explore AI agents <ArrowRight size={13} /></a>}</article>)}</div>
}

function HomePage() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-copy"><span className="announcement"><span className="pulse-dot" /> Built for teams who do more with less</span><h1>Supercharge your workflow<br className="desktop-break" /> with <span>AI-powered intelligence</span></h1><p>Connect your stack in 60 seconds. Zero config, zero code — Nexara learns your processes and automates them on autopilot.</p><div className="hero-actions"><a className="button" href="/signup">Start free trial <ArrowRight size={16} /></a><a className="button button-ghost" href="/demo"><Play size={14} /> Watch demo</a></div><small className="hero-note">Free 14-day Pro trial · No credit card required · Cancel anytime</small></div>
          <DashboardPreview />
          <div className="trusted"><span>POWERING WORKFLOWS AT 12,000+ COMPANIES</span><div>{['Slack', 'GitHub', 'Notion', 'OpenAI', 'Figma', 'Stripe'].map((name) => <span className="trusted-name" key={name}><span className="trusted-symbol">{name === 'OpenAI' ? '✳' : '◉'}</span>{name}</span>)}</div></div>
        </section>
        <section className="section section-features"><SectionHeading eyebrow="CAPABILITIES" title="Everything you need to ship AI workflows" copy="One simple workspace to build, launch, and improve your team's best AI-powered work." /><FeatureCards /><div className="center-action"><a className="text-link" href="/features">Explore all capabilities <ArrowRight size={15} /></a></div></section>
        <section className="section integration-strip"><div><span className="eyebrow">PLAYS WELL WITH YOUR STACK</span><h2>Your tools, working as one.</h2><p>Bring your favorite apps together in a secure, connected workflow.</p><a className="text-link" href="/integrations">Browse integrations <ArrowRight size={15} /></a></div><div className="integration-logos"><span><MessageSquareText /> Slack</span><span><GitBranch /> GitHub</span><span><FileText /> Notion</span><span><Radio /> HubSpot</span><span><Plug /> 50+ more</span></div></section>
        <section className="cta-panel"><span className="eyebrow">READY WHEN YOU ARE</span><h2>Ready to 10x your team with AI?</h2><p>Join 12,000+ teams. Start your 14-day trial today.</p><div className="hero-actions"><a className="button" href="/signup">Get started free <ArrowRight size={15} /></a><a className="button button-ghost" href="/contact">Talk to sales</a></div></section>
        <FAQSection compact />
      </main>
      <Footer />
    </>
  )
}

function FeaturesPage() {
  return <><main className="page-main"><SectionHeading eyebrow="CAPABILITIES" title="AI that works the way your team does." copy="From the first workflow to company-wide automation, Nexara gives every team the tools to move faster." /><FeatureCards /><section className="detail-grid"><article><Bot /><h3>Agents that understand context</h3><p>Set a goal, choose the tools an agent can use, and give it knowledge from your workspace. Nexara handles the steps and keeps your team in the loop.</p></article><article><Fingerprint /><h3>Secure by design</h3><p>Role-based permissions, audit-ready activity, and encrypted data give your team confidence at every scale.</p></article><article><Activity /><h3>Measure what matters</h3><p>Track usage, accuracy, time saved, and workflow health. Improve the work with clear, real-time feedback.</p></article></section><div className="page-cta"><h2>Make room for the work that matters.</h2><a className="button" href="/signup">Start your free trial <ArrowRight size={15} /></a></div></main><Footer /></>
}

function IntegrationsPage() {
  const integrations = [['Slack', 'Send alerts and get answers without leaving team chat.', 'Communication'], ['GitHub', 'Summarize issues, triage pull requests, and automate releases.', 'Developer tools'], ['Notion', 'Search your team knowledge and keep project docs in sync.', 'Knowledge'], ['HubSpot', 'Enrich leads, update records, and keep your pipeline moving.', 'CRM'], ['Google Drive', 'Bring documents and shared knowledge into AI workflows.', 'Storage'], ['Stripe', 'Monitor payments and trigger workflows from key events.', 'Payments']]
  return <><main className="page-main"><SectionHeading eyebrow="INTEGRATIONS" title="Your tools, finally talking to each other." copy="Connect the apps you already trust. Build a workflow once, then let Nexara keep the work moving." /><div className="integration-grid">{integrations.map(([name, copy, category], i) => <article className="integration-card" key={name}><span className="integration-app-icon">{[<MessageSquareText />, <GitBranch />, <FileText />, <Radio />, <Database />, <Zap />][i]}</span><span className="integration-category">{category}</span><h3>{name}</h3><p>{copy}</p><span className="connected-label"><Check size={13} /> Ready to connect</span></article>)}</div><div className="integration-more"><Plug size={20} /><div><b>Need another tool?</b><p>Use webhooks and our API to connect your own apps.</p></div><a className="text-link" href="/docs">Read the docs <ArrowRight size={15} /></a></div></main><Footer /></>
}

function PricingPage() {
  const [annual, setAnnual] = useState(true)
  return <><main className="page-main pricing-page"><SectionHeading eyebrow="SIMPLE, TRANSPARENT PRICING" title="The right plan for your next big idea." copy="Start free. Upgrade when you scale. No hidden fees, cancel anytime." /><div className="billing-switch"><span className={!annual ? 'selected' : ''}>Monthly</span><button type="button" aria-label="Toggle annual billing" aria-pressed={annual} onClick={() => setAnnual(!annual)} className={annual ? 'switch is-on' : 'switch'}><i /></button><span className={annual ? 'selected' : ''}>Yearly <b>Save 25%</b></span></div><div className="pricing-grid">{plans.map((plan) => <article className={plan.popular ? 'price-card popular' : 'price-card'} key={plan.name}>{plan.popular && <span className="popular-label"><Sparkles size={11} /> MOST POPULAR</span>}<span className="plan-name">{plan.name}</span><h3>${plan.price[annual ? 'annual' : 'monthly']}<small>{plan.price.monthly === 0 ? ' forever' : ' / month'}</small></h3><p>{plan.description}</p><a className={plan.popular ? 'button price-button' : 'button button-ghost price-button'} href={plan.slug === 'starter' ? '/signup' : `/checkout?plan=${plan.slug}&billing=${annual ? 'annual' : 'monthly'}`}>{plan.cta} <ArrowRight size={14} /></a><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul></article>)}</div><p className="pricing-note">All plans include secure hosting, support, and a 14-day Pro trial. Prices shown in USD.</p><section className="compare-wrap"><h2>Compare features in detail</h2><div className="table-scroll"><table><thead><tr><th>Feature</th><th>Starter</th><th>Pro</th><th>Enterprise</th></tr></thead><tbody>{[['AI tasks / month', '1,000', '25,000', 'Unlimited'], ['Active AI agents', '3', '25', 'Unlimited'], ['Knowledge base docs', '100', '10,000', 'Unlimited'], ['Slack, Notion, GitHub integrations', 'Included', 'Included', 'Included'], ['Custom APIs & webhooks', '—', 'Included', 'Included'], ['SSO / SAML & SCIM', '—', '—', 'Included'], ['Dedicated success manager', '—', '—', 'Included']].map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell + i}>{i > 0 && cell === 'Included' ? <Check className="table-check" size={15} aria-label="Included" /> : cell}</td>)}</tr>)}</tbody></table></div></section><div className="sales-banner"><div><b>Need higher limits or on-prem?</b><p>Get a custom quote with volume discounts and security review.</p></div><a className="button button-small" href="/contact">Talk to sales <ArrowRight size={13} /></a></div></main><Footer /></>
}

function FAQSection({ compact = false }) {
  const [open, setOpen] = useState(0)
  return <section className={compact ? 'faq-section faq-compact' : 'faq-section'}><SectionHeading eyebrow={compact ? 'NEED A HAND?' : 'FAQ'} title={compact ? 'Frequently asked questions' : 'Good questions. Clear answers.'} copy={!compact ? 'A few things teams often ask before getting started.' : null} /><div className="faq-list">{faqs.map(([question, answer], i) => <article className={open === i ? 'faq-item open' : 'faq-item'} key={question}><button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{question}</span><ChevronDown size={17} /></button>{open === i && <p>{answer}</p>}</article>)}</div>{!compact && <div className="faq-contact">Still have questions? <a href="/contact">Talk to our team <ArrowRight size={14} /></a></div>}</section>
}

function FAQPage() {
  return <><main className="page-main"><FAQSection /><div className="page-cta"><h2>Let's find the right workflow for you.</h2><a className="button" href="/contact">Talk to our team <ArrowRight size={15} /></a></div></main><Footer /></>
}

function DocsPage() {
  return <><main className="page-main"><SectionHeading eyebrow="NEXARA DOCS" title="A clear path from idea to automation." copy="Everything you need to connect your tools and launch a reliable AI workflow." /><div className="docs-grid">{[[Sparkles, '01', 'Quick start', 'Create your workspace, connect an app, and launch your first agent.', '/signup'], [Workflow, '02', 'Build a workflow', 'Choose a trigger, add steps, and decide when your team should review.', '/features'], [Plug, '03', 'Connect your stack', 'See how integrations and webhooks fit into your workflows.', '/integrations'], [CircleHelp, '04', 'Troubleshooting', 'Find answers to common setup, access, and billing questions.', '/faq']].map(([Icon, number, title, copy, href]) => <a className="doc-card" href={href} key={number}><span className="doc-number">{number}</span><Icon size={20} /><h3>{title}</h3><p>{copy}</p><span className="text-link">Explore <ArrowRight size={14} /></span></a>)}</div><div className="docs-callout"><FileText size={22} /><div><b>Looking for API documentation?</b><p>Get in touch and tell us what you're building. Our team can help you get started.</p></div><a className="button button-small" href="/contact">Contact us</a></div></main><Footer /></>
}

function DemoPage() {
  return <><main className="page-main demo-page"><SectionHeading eyebrow="PRODUCT TOUR" title="See Nexara in action." copy="A quick look at how an AI agent can turn a repetitive task into a workflow that runs itself." /><div className="demo-window"><div className="demo-window-bar"><i /><i /><i /><span>nexara.ai / product-tour</span></div><div className="demo-screen"><span className="demo-play"><Play size={25} fill="currentColor" /></span><span className="eyebrow">THE NEXARA WORKSPACE</span><h2>From busywork to done.</h2><p>See how teams connect their tools, build agents, and get hours back every week.</p><a className="button" href="/signup">Try it for yourself <ArrowRight size={15} /></a></div></div><div className="demo-points"><span><Check /> Connect your favorite apps</span><span><Check /> Build without code</span><span><Check /> Stay in control</span></div><div className="page-cta"><h2>Ready to build your first workflow?</h2><a className="button" href="/signup">Start free trial <ArrowRight size={15} /></a></div></main><Footer /></>
}

function FormPage({ mode }) {
  const [submitted, setSubmitted] = useState(false)
  const isContact = mode === 'contact'
  const isLogin = mode === 'login'
  const title = isContact ? 'Let’s talk about your team.' : isLogin ? 'Welcome back.' : 'Your next workflow starts here.'
  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
  }
  return <><main className="form-page"><div className="form-card"><Logo /><span className="eyebrow">{isContact ? 'CONTACT SALES' : isLogin ? 'YOUR WORKSPACE' : 'FREE 14-DAY PRO TRIAL'}</span><h1>{title}</h1><p>{isContact ? 'Tell us a little about what you need and our team will be in touch.' : isLogin ? 'Log in to continue to your Nexara workspace.' : 'No credit card required. Get started in less than a minute.'}</p>{submitted ? <div className="form-success"><Check size={20} /><div><b>{isContact ? 'Thanks for reaching out.' : isLogin ? 'Login preview complete.' : 'You’re on your way.'}</b><span>{isContact ? 'This demo form does not send messages. Connect a form service to receive inquiries.' : 'This is a front-end preview. Connect your authentication service to enable accounts.'}</span></div></div> : <form onSubmit={submit}>{!isLogin && <label>{isContact ? 'Your name' : 'Name'}<input required autoComplete="name" placeholder="Alex Morgan" /></label>}<label>Work email<input required type="email" autoComplete="email" placeholder="you@company.com" /></label>{isContact ? <><label>Company<input required autoComplete="organization" placeholder="Your company" /></label><label>What can we help with?<textarea required rows="4" placeholder="Tell us about your team and goals..." /></label></> : isLogin ? <label>Password<input required type="password" autoComplete="current-password" minLength="8" placeholder="At least 8 characters" /></label> : <label>Create a password<input required type="password" autoComplete="new-password" minLength="8" placeholder="At least 8 characters" /></label>}<button className="button form-submit" type="submit">{isContact ? 'Send inquiry' : isLogin ? 'Log in' : 'Create free account'} <ArrowRight size={15} /></button></form>}{!isContact && <p className="form-switch">{isLogin ? 'New to Nexara?' : 'Already have an account?'} <a href={isLogin ? '/signup' : '/login'}>{isLogin ? 'Start free' : 'Log in'}</a></p>}{isContact && <a className="back-link" href="/">Back to home</a>}</div></main><Footer /></>
}

function CheckoutPage() {
  const [completed, setCompleted] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const selectedPlan = plans.find((plan) => plan.slug === params.get('plan')) || plans[1]
  const billing = params.get('billing') === 'monthly' ? 'monthly' : 'annual'
  const amount = selectedPlan.price[billing]
  return <><main className="checkout-page"><div className="checkout-wrap"><div className="checkout-head"><a href="/pricing" className="back-link"><ArrowDownRight size={15} /> Back to pricing</a><span className="secure-label"><LockKeyhole size={13} /> Secure checkout</span></div><div className="checkout-grid"><section className="checkout-form"><span className="eyebrow">YOUR PLAN</span><h1>Start your {selectedPlan.name} plan.</h1><p>One last step before your team can get to work.</p><div className="checkout-plan"><div><b>{selectedPlan.name} {billing === 'annual' ? 'annual' : 'monthly'}</b><span>{billing === 'annual' ? 'Billed annually' : 'Billed monthly'} · Cancel anytime</span></div><b>${amount}<small> / month</small></b></div>{completed ? <div className="form-success"><Check size={20} /><div><b>Checkout preview complete.</b><span>No payment was taken. Connect a server-side Stripe Checkout session to accept real payments.</span></div></div> : <form onSubmit={(event) => { event.preventDefault(); setCompleted(true) }}><label>Work email<input required type="email" autoComplete="email" placeholder="you@company.com" /></label><label>Company name<input required autoComplete="organization" placeholder="Your company" /></label><button className="button form-submit" type="submit">Continue to payment <ArrowRight size={15} /></button><p className="checkout-disclaimer"><LockKeyhole size={13} /> Demo checkout only. No card details are collected and no payment is processed.</p></form>}</section><aside className="checkout-summary"><span className="eyebrow">WHAT'S INCLUDED</span><h2>More time for great work.</h2><ul>{selectedPlan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul><div className="summary-total"><span>Due today</span><b>$0.00</b></div><p>Your 14-day trial begins today. You won't be charged in this demo.</p></aside></div></div></main><Footer /></>
}

function LegalPage({ type }) {
  const title = type === 'privacy' ? 'Privacy at Nexara' : 'Terms of service'
  return <><main className="page-main legal-page"><SectionHeading eyebrow="NEXARA AI" title={title} copy="This product preview does not collect or store personal information submitted through its forms." /><article><h2>About this preview</h2><p>This website is a front-end demonstration. Forms do not submit information to a server, accounts are not created, and the checkout does not process payments.</p><h2>Before launch</h2><p>Replace this sample page with policies reviewed for your business, jurisdiction, data practices, and payment provider. Do not rely on this preview as legal advice.</p><a className="text-link" href="/contact">Questions? Contact our team <ArrowRight size={14} /></a></article></main><Footer /></>
}

function NotFoundPage() {
  return <><main className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>Looks like this page took a detour.</h1><p>The link may be outdated, or the page may have moved.</p><a className="button" href="/">Back to home <ArrowRight size={15} /></a></main><Footer /></>
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const pages = {
    '/': <HomePage />,
    '/features': <FeaturesPage />,
    '/integrations': <IntegrationsPage />,
    '/pricing': <PricingPage />,
    '/faq': <FAQPage />,
    '/docs': <DocsPage />,
    '/demo': <DemoPage />,
    '/signup': <FormPage mode="signup" />,
    '/login': <FormPage mode="login" />,
    '/contact': <FormPage mode="contact" />,
    '/checkout': <CheckoutPage />,
    '/privacy': <LegalPage type="privacy" />,
    '/terms': <LegalPage type="terms" />,
  }
  return <div className="app-shell"><Header />{pages[path] || <NotFoundPage />}</div>
}

export default App
