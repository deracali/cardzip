import { useEffect, useState } from 'react'
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
  Inbox,
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
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import './App.css'
import { getAdminToken, getUserToken, nexaraApi, setAdminToken, setUserToken } from './services/nexaraApi'

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

const previewAgents = [
  { name: 'Support triage', team: 'Customer success', description: 'Sort incoming requests and prepare a reply draft for a teammate to review.', icon: MessageSquareText, mode: 'Human review' },
  { name: 'Knowledge assistant', team: 'Internal operations', description: 'Find approved guidance and turn it into a concise, source-aware summary.', icon: Database, mode: 'Read only' },
  { name: 'Lead research', team: 'Sales', description: 'Gather useful account context before a representative follows up with a prospect.', icon: Fingerprint, mode: 'Approval required' },
]

const previewWorkflows = [
  { name: 'Support request triage', trigger: 'New support request', steps: ['Classify urgency', 'Find approved guidance', 'Draft a response', 'Request human review'], icon: Inbox },
  { name: 'Lead qualification', trigger: 'New website inquiry', steps: ['Summarize the request', 'Identify the account', 'Prepare a follow-up brief', 'Assign an owner'], icon: UsersRound },
  { name: 'Knowledge update review', trigger: 'New guide submitted', steps: ['Check required details', 'Route to a reviewer', 'Publish approved content'], icon: FileText },
]

const previewIntegrations = [
  ['Slack', 'Send team alerts and summarize conversations.', MessageSquareText],
  ['GitHub', 'Triage issues and keep release notes in sync.', GitBranch],
  ['Notion', 'Search approved team knowledge.', Layers3],
  ['HubSpot', 'Prepare context for customer follow-up.', UsersRound],
  ['Google Drive', 'Bring selected documents into workflows.', Database],
  ['Stripe', 'Review payment events and account activity.', Zap],
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
          <a className="button button-small" href="/trial" onClick={() => setMenuOpen(false)}>Get started free <ArrowRight size={14} /></a>
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
          <div className="hero-copy"><span className="announcement"><span className="pulse-dot" /> Built for teams who do more with less</span><h1>Supercharge your workflow<br className="desktop-break" /> with <span>AI-powered intelligence</span></h1><p>Connect your stack in 60 seconds. Zero config, zero code — Nexara learns your processes and automates them on autopilot.</p><div className="hero-actions"><a className="button" href="/trial">Start free trial <ArrowRight size={16} /></a><a className="button button-ghost" href="/demo"><Play size={14} /> Watch demo</a></div><small className="hero-note">Free 14-day Pro trial · No credit card required · Cancel anytime</small></div>
          <DashboardPreview />
          <div className="trusted"><span>POWERING WORKFLOWS AT 12,000+ COMPANIES</span><div>{['Slack', 'GitHub', 'Notion', 'OpenAI', 'Figma', 'Stripe'].map((name) => <span className="trusted-name" key={name}><span className="trusted-symbol">{name === 'OpenAI' ? '✳' : '◉'}</span>{name}</span>)}</div></div>
        </section>
        <section className="section section-features"><SectionHeading eyebrow="CAPABILITIES" title="Everything you need to ship AI workflows" copy="One simple workspace to build, launch, and improve your team's best AI-powered work." /><FeatureCards /><div className="center-action"><a className="text-link" href="/features">Explore all capabilities <ArrowRight size={15} /></a></div></section>
        <section className="section integration-strip"><div><span className="eyebrow">PLAYS WELL WITH YOUR STACK</span><h2>Your tools, working as one.</h2><p>Bring your favorite apps together in a secure, connected workflow.</p><a className="text-link" href="/integrations">Browse integrations <ArrowRight size={15} /></a></div><div className="integration-logos"><span><MessageSquareText /> Slack</span><span><GitBranch /> GitHub</span><span><FileText /> Notion</span><span><Radio /> HubSpot</span><span><Plug /> 50+ more</span></div></section>
        <section className="cta-panel"><span className="eyebrow">READY WHEN YOU ARE</span><h2>Ready to 10x your team with AI?</h2><p>Join 12,000+ teams. Start your 14-day trial today.</p><div className="hero-actions"><a className="button" href="/trial">Get started free <ArrowRight size={15} /></a><a className="button button-ghost" href="/contact">Talk to sales</a></div></section>
        <FAQSection compact />
      </main>
      <Footer />
    </>
  )
}

function FeaturesPage() {
  return <><main className="page-main"><SectionHeading eyebrow="CAPABILITIES" title="AI that works the way your team does." copy="From the first workflow to company-wide automation, Nexara gives every team the tools to move faster." /><FeatureCards /><section className="detail-grid"><article><Bot /><h3>Agents that understand context</h3><p>Set a goal, choose the tools an agent can use, and give it knowledge from your workspace. Nexara handles the steps and keeps your team in the loop.</p></article><article><Fingerprint /><h3>Secure by design</h3><p>Role-based permissions, audit-ready activity, and encrypted data give your team confidence at every scale.</p></article><article><Activity /><h3>Measure what matters</h3><p>Track usage, accuracy, time saved, and workflow health. Improve the work with clear, real-time feedback.</p></article></section><div className="page-cta"><h2>Make room for the work that matters.</h2><a className="button" href="/trial">Start your free trial <ArrowRight size={15} /></a></div></main><Footer /></>
}

function IntegrationsPage() {
  const integrations = [['Slack', 'Send alerts and get answers without leaving team chat.', 'Communication'], ['GitHub', 'Summarize issues, triage pull requests, and automate releases.', 'Developer tools'], ['Notion', 'Search your team knowledge and keep project docs in sync.', 'Knowledge'], ['HubSpot', 'Enrich leads, update records, and keep your pipeline moving.', 'CRM'], ['Google Drive', 'Bring documents and shared knowledge into AI workflows.', 'Storage'], ['Stripe', 'Monitor payments and trigger workflows from key events.', 'Payments']]
  return <><main className="page-main"><SectionHeading eyebrow="INTEGRATIONS" title="Your tools, finally talking to each other." copy="Connect the apps you already trust. Build a workflow once, then let Nexara keep the work moving." /><div className="integration-grid">{integrations.map(([name, copy, category], i) => <article className="integration-card" key={name}><span className="integration-app-icon">{[<MessageSquareText />, <GitBranch />, <FileText />, <Radio />, <Database />, <Zap />][i]}</span><span className="integration-category">{category}</span><h3>{name}</h3><p>{copy}</p><span className="connected-label"><Check size={13} /> Ready to connect</span></article>)}</div><div className="integration-more"><Plug size={20} /><div><b>Need another tool?</b><p>Use webhooks and our API to connect your own apps.</p></div><a className="text-link" href="/docs">Read the docs <ArrowRight size={15} /></a></div></main><Footer /></>
}

function PricingPage() {
  const [annual, setAnnual] = useState(true)
  return <><main className="page-main pricing-page"><SectionHeading eyebrow="SIMPLE, TRANSPARENT PRICING" title="The right plan for your next big idea." copy="Start free. Upgrade when you scale. No hidden fees, cancel anytime." /><div className="billing-switch"><span className={!annual ? 'selected' : ''}>Monthly</span><button type="button" aria-label="Toggle annual billing" aria-pressed={annual} onClick={() => setAnnual(!annual)} className={annual ? 'switch is-on' : 'switch'}><i /></button><span className={annual ? 'selected' : ''}>Yearly <b>Save 25%</b></span></div><div className="pricing-grid">{plans.map((plan) => <article className={plan.popular ? 'price-card popular' : 'price-card'} key={plan.name}>{plan.popular && <span className="popular-label"><Sparkles size={11} /> MOST POPULAR</span>}<span className="plan-name">{plan.name}</span><h3>${plan.price[annual ? 'annual' : 'monthly']}<small>{plan.price.monthly === 0 ? ' forever' : ' / month'}</small></h3><p>{plan.description}</p><a className={plan.popular ? 'button price-button' : 'button button-ghost price-button'} href={plan.slug === 'starter' ? '/trial' : plan.slug === 'enterprise' ? '/contact' : `/checkout?plan=${plan.slug}&billing=${annual ? 'annual' : 'monthly'}`}>{plan.cta} <ArrowRight size={14} /></a><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul></article>)}</div><p className="pricing-note">All plans include secure hosting, support, and a 14-day Pro trial. Prices shown in USD.</p><section className="compare-wrap"><h2>Compare features in detail</h2><div className="table-scroll"><table><thead><tr><th>Feature</th><th>Starter</th><th>Pro</th><th>Enterprise</th></tr></thead><tbody>{[['AI tasks / month', '1,000', '25,000', 'Unlimited'], ['Active AI agents', '3', '25', 'Unlimited'], ['Knowledge base docs', '100', '10,000', 'Unlimited'], ['Workflow runs / month', '5,000', '100,000', 'Unlimited'], ['Connected integrations', '5', '50+', 'Unlimited'], ['Workflow history', '7 days', '90 days', 'Custom retention'], ['Team seats', '2', '25', 'Unlimited'], ['Slack, Notion, GitHub integrations', 'Included', 'Included', 'Included'], ['Custom APIs & webhooks', '—', 'Included', 'Included'], ['SSO / SAML & SCIM', '—', '—', 'Included'], ['Role-based approvals', 'Basic', 'Advanced', 'Custom policies'], ['Support', 'Community', 'Priority', 'Dedicated success manager']].map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell + i}>{i > 0 && cell === 'Included' ? <Check className="table-check" size={15} aria-label="Included" /> : cell}</td>)}</tr>)}</tbody></table></div></section><div className="sales-banner"><div><b>Need higher limits or on-prem?</b><p>Get a custom quote with volume discounts and security review.</p></div><a className="button button-small" href="/contact">Talk to sales <ArrowRight size={13} /></a></div></main><Footer /></>
}

function FAQSection({ compact = false }) {
  const [open, setOpen] = useState(0)
  return <section className={compact ? 'faq-section faq-compact' : 'faq-section'}><SectionHeading eyebrow={compact ? 'NEED A HAND?' : 'FAQ'} title={compact ? 'Frequently asked questions' : 'Good questions. Clear answers.'} copy={!compact ? 'A few things teams often ask before getting started.' : null} /><div className="faq-list">{faqs.map(([question, answer], i) => <article className={open === i ? 'faq-item open' : 'faq-item'} key={question}><button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{question}</span><ChevronDown size={17} /></button>{open === i && <p>{answer}</p>}</article>)}</div>{!compact && <div className="faq-contact">Still have questions? <a href="/contact">Talk to our team <ArrowRight size={14} /></a></div>}</section>
}

function FAQPage() {
  return <><main className="page-main"><FAQSection /><div className="page-cta"><h2>Let's find the right workflow for you.</h2><a className="button" href="/contact">Talk to our team <ArrowRight size={15} /></a></div></main><Footer /></>
}

function DocsPage() {
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    nexaraApi.publicDocuments()
      .then(({ data }) => { if (active) setDocuments(data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
    return () => { active = false }
  }, [])
  const guides = [[Sparkles, '01', 'Quick start', 'Create your workspace, connect an app, and launch your first agent.', '/docs/quick-start'], [Workflow, '02', 'Build a workflow', 'Choose a trigger, add steps, and decide when your team should review.', '/docs/build-a-workflow'], [Plug, '03', 'Connect your stack', 'See how integrations and webhooks fit into your workflows.', '/docs/connect-integrations'], [CircleHelp, '04', 'Troubleshooting', 'Find answers to common setup, access, and billing questions.', '/docs/troubleshooting']]
  return <><main className="page-main"><SectionHeading eyebrow="NEXARA DOCS" title="A clear path from idea to automation." copy="Everything you need to connect your tools and launch a reliable AI workflow." /><div className="docs-grid">{guides.map(([Icon, number, title, copy, href]) => <a className="doc-card" href={href} key={number}><span className="doc-number">{number}</span><Icon size={20} /><h3>{title}</h3><p>{copy}</p><span className="text-link">Read guide <ArrowRight size={14} /></span></a>)}</div>{error && <p className="local-form-error" role="alert">{error}</p>}{documents.length > 0 && <section className="docs-library"><h2>Documents from the Nexara team</h2><div className="docs-grid">{documents.map((document) => <a className="doc-card" href={`/docs/${encodeURIComponent(document.slug)}`} key={document.id}><FileText size={20} /><h3>{document.title}</h3><p>{document.description}</p><span className="text-link">View document <ArrowRight size={14} /></span></a>)}</div></section>}<div className="docs-callout"><FileText size={22} /><div><b>Looking for API documentation?</b><p>Get in touch and tell us what you're building. Our team can help you get started.</p></div><a className="button button-small" href="/contact">Contact us</a></div></main><Footer /></>
}

const docsGuides = {
  'quick-start': {
    title: 'Quick start',
    summary: 'Set up a workspace, connect a trusted tool, and validate a first AI workflow before it reaches your team.',
    sections: [
      { heading: '1. Prepare your first use case', paragraphs: ['Start with one repeatable task that has a clear beginning and a result you can verify. Examples include summarizing an incoming request, drafting a response for review, or organizing a short set of notes. Keep the first workflow narrow; a small, measurable outcome is easier to evaluate than an attempt to automate an entire department.', 'Before building, decide who owns the workflow, which information it may use, and what a successful result looks like. Note any cases that must be escalated to a person. This gives you a practical test plan and prevents the agent from being treated as an unchecked source of truth.'], items: ['Choose a task with predictable input and an observable result.', 'Use sample or non-sensitive data for the first run.', 'Identify actions that should always require a person to approve them.'] },
      { heading: '2. Create a workspace and connect one app', paragraphs: ['Open the workspace and select the integration needed for the chosen task. Authenticate with an account that has only the required permissions. If your organization manages access centrally, ask the app owner to create a dedicated connection rather than using a personal administrator account.', 'Review the requested access before authorizing it. A workflow that only reads records should not need permission to delete them. Keep a note of who owns the connection and how it can be renewed or revoked.'], items: ['Confirm the connected account and the data it can access.', 'Enable only the events or resources needed for the workflow.', 'Store credentials in the integration connection, never in prompts or documents.'] },
      { heading: '3. Run a controlled test', paragraphs: ['Send a representative sample through the workflow and inspect every step, not just the final answer. Check whether the input was interpreted correctly, whether the generated output follows your requirements, and whether any action was attempted unexpectedly. Test a normal case and at least one incomplete or unusual case.', 'Make one change at a time when a test fails. Adjust the instructions or input mapping, run the same sample again, and compare the result. Keep a short record of the test cases that passed so future edits can be checked against them.'], items: ['Verify the trigger, input fields, generated result, and next action.', 'Use approval gates for messages, updates, or other external changes.', 'Do not publish until a teammate can explain what the workflow will do.'] },
      { heading: '4. Publish and maintain', paragraphs: ['When tests pass, publish the workflow and tell its intended users what it does, what it does not do, and how to report a problem. Begin with a limited audience or a low-risk task when possible. Review activity regularly, especially after changing an integration, prompt, or source of data.', 'Treat the workflow as maintained software: access can expire, upstream data can change, and team policies can evolve. Assign an owner to review its behavior and disable it if an unexpected result could cause harm.'] },
    ],
  },
  'build-a-workflow': {
    title: 'Build a workflow',
    summary: 'Design a reliable automation by defining its trigger, inputs, actions, review points, and recovery path.',
    sections: [
      { heading: 'Understand the workflow model', paragraphs: ['A workflow starts when a selected event occurs, gathers the data it needs, performs a sequence of steps, and records an outcome. Keeping those pieces explicit makes it easier to reason about failures. A useful design answers four questions: what starts the run, which information is available, what may change, and who should be notified?', 'Separate interpretation from action. An AI step can classify or draft; a later action can save or send the result. This separation gives reviewers a place to inspect the proposed outcome before anything irreversible happens.'], items: ['Trigger: the event that starts a run.', 'Context: the fields and references the steps are allowed to use.', 'Action: the change or draft the workflow produces.', 'Review: the person or rule that decides whether to continue.'] },
      { heading: 'Configure the trigger and inputs', paragraphs: ['Choose a trigger that is specific enough to avoid unnecessary runs. Map only fields that contribute to the task, and provide clear labels so a teammate can understand where each value came from. Missing values should be handled deliberately: stop the run, request clarification, or route it to a person instead of silently guessing.', 'Use realistic examples to check how the trigger behaves with duplicates, delayed events, and incomplete records. If the source system can send the same event more than once, consider how the workflow owner will recognize and resolve duplicate work.'] },
      { heading: 'Add steps and decision points', paragraphs: ['Build the smallest sequence that produces the intended result. Give each step a single responsibility, then make the output of one step explicit before passing it on. Clear instructions should describe the desired format, important constraints, and what to do when the available evidence is insufficient.', 'Place a review step before sending an external message, changing a customer record, or making another consequential update. A reviewer should see the source information, the proposed change, and enough context to approve or reject it.'], items: ['Keep generated drafts separate from actions that publish them.', 'Define a safe fallback for missing or contradictory information.', 'Record useful run details without copying unnecessary sensitive data.'] },
      { heading: 'Test, publish, and revise', paragraphs: ['Test ordinary input, edge cases, and a case that should be rejected or sent for review. Inspect the complete run history and confirm each step has the expected input and output. If a failure occurs, start with the first failed step; later failures may only be consequences of that earlier issue.', 'After publishing, compare a sample of completed runs with the intended outcome. Update the workflow when its source data or team process changes, and rerun your tests after every meaningful revision. Keep an owner responsible for monitoring and pausing the workflow if its behavior is no longer predictable.'] },
    ],
  },
  'connect-integrations': {
    title: 'Connect integrations',
    summary: 'Connect existing tools thoughtfully, limit access to what a workflow needs, and verify data flow before launch.',
    sections: [
      { heading: 'Plan the connection', paragraphs: ['List the application, records, and events the workflow actually needs before authorizing an integration. This helps you select the least-privileged account and avoid granting broad access simply because it is convenient. Decide who will own the connection and who should be able to change or revoke it.', 'Use separate connections for separate purposes when practical. A draft-generation workflow and a record-update workflow may need different access. Keeping them separate makes permissions easier to review and limits the impact of a misconfiguration.'], items: ['Identify the exact data and actions required.', 'Choose an account approved by the owner of the source application.', 'Confirm how access will be reviewed, renewed, and revoked.'] },
      { heading: 'Authorize and verify access', paragraphs: ['Select the integration and complete its authorization flow using the account chosen during planning. Read the permission request before confirming it. If the access is broader than the workflow requires, cancel and consult the application owner rather than accepting permissions you do not understand.', 'After connecting, verify the displayed account and run a harmless test against sample data. Confirm that read operations return the expected fields and that a workflow cannot perform an action outside its intended scope. Do not paste access tokens or secrets into instructions, sample prompts, or support messages.'] },
      { heading: 'Use events and webhooks safely', paragraphs: ['When an integration offers event subscriptions or webhooks, subscribe only to events that can start a useful workflow. Validate the incoming event shape and decide how to handle retries, repeated deliveries, and events that arrive out of order. A robust workflow should not create duplicate external actions when the same notification is delivered twice.', 'For custom webhook setups, keep the endpoint and any verification secret in the appropriate connection settings. Do not publish a secret in a browser page, source repository, or shared document. If an event contains personal or confidential data, map only the fields needed for the task.'] },
      { heading: 'Maintain the connection', paragraphs: ['Connections may stop working when an account is disabled, permissions change, or an authorization expires. Assign an owner who can renew access and review whether the granted permissions are still appropriate. After reconnecting, repeat the integration test and review the first production runs.', 'If an integration is no longer needed, pause workflows that depend on it, then revoke its access in the source application. Removing a connection without checking dependent workflows can leave runs failing repeatedly.'] },
    ],
  },
  troubleshooting: {
    title: 'Troubleshooting',
    summary: 'Use a consistent diagnostic process for sign-in, integration, workflow, and output problems.',
    sections: [
      { heading: 'Start with the exact failure', paragraphs: ['Record what you expected, what happened, and the approximate time of the run. Open the relevant activity or run history and find the earliest step that did not complete as expected. Later steps often fail because they did not receive the output of an earlier one, so fixing the first failure is usually the most useful starting point.', 'Before retrying, check whether the failed run already completed an external action. A retry can send a duplicate message or create another record if an earlier step succeeded before the workflow reported an error.'] },
      { heading: 'Connection or permission errors', paragraphs: ['Confirm that the integration is connected to the expected account and that the required permission has not been removed. If the source account requires reauthorization, renew the connection through its normal authorization flow. Avoid copying tokens into chat, prompts, or logs while diagnosing the issue.', 'If the integration is connected but a field is missing, verify that the source record contains that field and that it is included in the workflow input mapping. Ask the source application owner to confirm access when the required information is restricted.'], items: ['Check connection status and account identity.', 'Review the permission request and input-field mapping.', 'Reauthorize only through the trusted integration flow.'] },
      { heading: 'Paused runs or unexpected outputs', paragraphs: ['For a paused run, inspect the first incomplete step and its required inputs. An approval step may be waiting for a reviewer; an action step may be missing a destination or required field. Correct the specific issue and continue only after confirming that the proposed action is still appropriate.', 'For an incomplete or inaccurate generated result, compare the input with the instructions and provide only the relevant context that is missing. Test the change on a small sample first. If the result remains uncertain, route the case to a person rather than expanding access or allowing an unverified action.'] },
      { heading: 'Account, billing, and escalation', paragraphs: ['For sign-in problems, check the account email and use the normal account recovery process. For billing questions, include the account email and a short description of the plan or charge; never send a password, payment-card number, or authentication secret.', 'When asking the Nexara team for help, include the workflow name, time of the run, the step that failed, and a redacted description of the error. Remove customer names, tokens, and other sensitive values. Pause the workflow first if repeated failures could create duplicate or unintended actions.'] },
    ],
  },
}

function DocDetailPage({ slug }) {
  const [document, setDocument] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (docsGuides[slug]) return
    let active = true
    nexaraApi.publicDocument(slug)
      .then(({ data }) => { if (active) setDocument(data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
    return () => { active = false }
  }, [slug])
  const guide = docsGuides[slug]
  if (guide) return <><main className="page-main docs-detail"><a className="back-link" href="/docs">← All documentation</a><SectionHeading eyebrow="PRODUCT DOCUMENTATION" title={guide.title} copy={guide.summary} />{guide.sections.map((section) => <section className="docs-article-section" key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}<a className="button" href="/trial">Try it with your team <ArrowRight size={15} /></a></main><Footer /></>
  if (error) return <><main className="page-main docs-detail"><a className="back-link" href="/docs">← All documentation</a><p className="local-form-error" role="alert">{error}</p></main><Footer /></>
  if (!document?.contentBase64) return <><main className="page-main docs-detail"><p>Loading document…</p></main><Footer /></>
  const fileUrl = `data:${document.contentType};base64,${document.contentBase64}`
  const textContent = document.contentType === 'application/pdf' ? '' : new TextDecoder().decode(Uint8Array.from(atob(document.contentBase64), (character) => character.charCodeAt(0)))
  return <><main className="page-main docs-detail"><a className="back-link" href="/docs">← All documentation</a><SectionHeading eyebrow="NEXARA DOCS" title={document.title} copy={document.description} /><a className="button button-small" href={fileUrl} download={document.filename}>Download {document.filename} <ArrowRight size={14} /></a>{document.contentType === 'application/pdf' ? <iframe className="docs-pdf-viewer" title={document.title} src={fileUrl} /> : <pre className="docs-text-viewer">{textContent}</pre>}</main><Footer /></>
}

function DemoPage() {
  return <><main className="page-main demo-page"><SectionHeading eyebrow="PRODUCT TOUR" title="See Nexara in action." copy="A quick look at how an AI agent can turn a repetitive task into a workflow that runs itself." /><div className="demo-window"><div className="demo-window-bar"><i /><i /><i /><span>nexara.ai / product-tour</span></div><div className="demo-screen"><span className="demo-play"><Play size={25} fill="currentColor" /></span><span className="eyebrow">THE NEXARA WORKSPACE</span><h2>From busywork to done.</h2><p>See how teams connect their tools, build agents, and get hours back every week.</p><a className="button" href="/trial">Try it for yourself <ArrowRight size={15} /></a></div></div><div className="demo-points"><span><Check /> Connect your favorite apps</span><span><Check /> Build without code</span><span><Check /> Stay in control</span></div><div className="page-cta"><h2>Ready to build your first workflow?</h2><a className="button" href="/trial">Start free trial <ArrowRight size={15} /></a></div></main><Footer /></>
}

function FormPage({ mode }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const isContact = mode === 'contact'
  const isTrial = mode === 'trial'
  const isLogin = mode === 'login'
  const isInquiry = isContact || isTrial
  const title = isContact ? 'Let’s talk about your team.' : isTrial ? 'Plan your Nexara trial.' : isLogin ? 'Welcome back.' : 'Your next workflow starts here.'
  const [loading, setLoading] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    const values = new FormData(event.currentTarget)
    const name = String(values.get('name') || '').trim()
    const email = String(values.get('email') || '').trim().toLowerCase()
    setLoading(true)
    try {
      if (isInquiry) {
        const token = getUserToken()
        if (isContact && !token) throw new Error('Sign in before sending your sales inquiry so it appears in your client dashboard.')
        await nexaraApi.submitLead({
          type: isContact ? 'contact' : 'demo',
          name,
          email,
          company: String(values.get('company') || '').trim(),
          message: String(values.get('message') || '').trim(),
        }, token)
        setSubmitted(true)
      } else {
        const password = String(values.get('password') || '')
        const result = isLogin
          ? await nexaraApi.login({ email, password })
          : await nexaraApi.signUp({ name, email, password })
        setUserToken(result.token)
        window.location.assign('/dashboard')
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your request.')
    } finally {
      setLoading(false)
    }
  }
  return <><main className="form-page"><div className="form-card"><Logo /><span className="eyebrow">{isContact ? 'CONTACT SALES' : isTrial ? 'FREE TRIAL SETUP' : isLogin ? 'YOUR WORKSPACE' : 'CREATE YOUR ACCOUNT'}</span><h1>{title}</h1><p>{isContact ? 'Tell us what you need. Your inquiry and our reply will appear in your client dashboard.' : isTrial ? 'Tell us what you want to automate. The Nexara team will contact you to set up a trial workspace.' : isLogin ? 'Log in to continue to your Nexara workspace.' : 'Create an account to track inquiries and replies from the Nexara team.'}</p>{isContact && !getUserToken() && <p className="form-switch">Already have an account? <a href="/login">Sign in first so this inquiry appears in your dashboard</a>.</p>}{submitted ? <div className="form-success"><Check size={20} /><div><b>{isTrial ? 'Your trial setup request is with our team.' : 'Thanks for reaching out.'}</b><span>{isContact ? 'The sales team can now follow up; replies will appear in your client dashboard.' : 'Your setup request has been sent to the Nexara team.'}</span></div></div> : <form onSubmit={submit}>{!isLogin && <label>{isContact ? 'Your name' : 'Name'}<input name="name" required autoComplete="name" placeholder="Alex Morgan" maxLength="120" /></label>}<label>Work email<input name="email" required type="email" autoComplete="email" placeholder="you@company.com" maxLength="254" /></label>{isInquiry ? <><label>Company<input name="company" required autoComplete="organization" placeholder="Your company" maxLength="160" /></label><label>{isTrial ? 'What would you like to try?' : 'What can we help with?'}<textarea name="message" required rows="4" maxLength="5000" placeholder={isTrial ? 'Tell us about a workflow you would like to automate...' : 'Tell us about your team and goals...'} /></label></> : <label>{isLogin ? 'Password' : 'Create a password'}<input name="password" required type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength="8" maxLength="256" placeholder="At least 8 characters" /></label>}{error && <p className="local-form-error" role="alert">{error}</p>}<button className="button form-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : isContact ? 'Send inquiry' : isTrial ? 'Request trial setup' : isLogin ? 'Log in' : 'Create account'} <ArrowRight size={15} /></button></form>}{!isInquiry && <p className="form-switch">{isLogin ? 'New to Nexara?' : 'Already have an account?'} <a href={isLogin ? '/signup' : '/login'}>{isLogin ? 'Create account' : 'Log in'}</a></p>}{isInquiry && <a className="back-link" href="/">Back to home</a>}</div></main><Footer /></>
}

function PlanInquiryPage() {
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const plan = plans.find((item) => item.slug === params.get('plan')) || plans[1]
  const billing = params.get('billing') === 'monthly' ? 'monthly' : 'annual'
  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const values = new FormData(event.currentTarget)
    try {
      await nexaraApi.submitLead({
        type: 'checkout',
        name: String(values.get('name') || '').trim(),
        email: String(values.get('email') || '').trim().toLowerCase(),
        company: String(values.get('company') || '').trim(),
        plan: plan.slug,
        billing,
        message: `Requested the ${billing} ${plan.name} plan.`,
      }, getUserToken())
      setComplete(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }
  return <><main className="checkout-page"><div className="checkout-wrap"><div className="checkout-head"><a href="/pricing" className="back-link"><ArrowDownRight size={15} /> Back to pricing</a><span className="secure-label">Plan inquiry</span></div><div className="checkout-grid"><section className="checkout-form"><span className="eyebrow">YOUR PLAN</span><h1>Start your {plan.name} plan.</h1><p>Request plan details from the Nexara team. No payment is collected here.</p><div className="checkout-plan"><div><b>{plan.name} · {billing}</b><span>{billing === 'annual' ? 'Billed annually' : 'Billed monthly'} · Cancel anytime</span></div><b>${plan.price[billing]}<small> / month</small></b></div>{complete ? <div className="form-success"><Check size={20} /><div><b>Your plan inquiry was sent.</b><span>{getUserToken() ? 'The reply will appear in your client dashboard.' : 'The Nexara team will follow up by email.'}</span></div></div> : <form onSubmit={submit}><label>Your name<input name="name" required maxLength="120" autoComplete="name" /></label><label>Work email<input name="email" type="email" required maxLength="254" autoComplete="email" /></label><label>Company<input name="company" required maxLength="160" autoComplete="organization" /></label>{error && <p className="local-form-error" role="alert">{error}</p>}<button className="button form-submit" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Request plan details'} <ArrowRight size={15} /></button><p className="checkout-disclaimer">No card details are collected and no payment is processed.</p></form>}</section><aside className="checkout-summary"><span className="eyebrow">WHAT'S INCLUDED</span><h2>{plan.name}</h2><ul>{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul><p>{plan.description}</p></aside></div></div></main><Footer /></>
}

function ClientDashboardPage() {
  const [user, setUser] = useState(null)
  const [leads, setLeads] = useState([])
  const [tab, setTab] = useState('overview')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const token = getUserToken()
    let active = true
    if (!token) {
      window.location.replace('/login')
      return () => { active = false }
    }
    Promise.all([nexaraApi.currentUser(token), nexaraApi.accountLeads(token)])
      .then(([account, inquiries]) => {
        if (!active) return
        setUser(account.user)
        setLeads(inquiries.data)
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError.message)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  function signOut() {
    setUserToken(null)
    window.location.assign('/')
  }
  return <><main className="workspace-page"><header className="workspace-heading"><div><span className="eyebrow">YOUR NEXARA ACCOUNT</span><h1>{user ? `Welcome, ${user.name}.` : 'Client dashboard'}</h1><p>Manage your workspace, pricing, and conversations with our team.</p></div><button className="button button-ghost" onClick={signOut}>Sign out</button></header><nav className="workspace-tabs" aria-label="Client dashboard sections">{[['overview', 'Overview'], ['pricing', 'Pricing'], ['usage', 'Workspace']].map(([id, label]) => <button type="button" className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}>{label}</button>)}</nav>{error && <p className="local-form-error" role="alert">{error}</p>}{tab === 'overview' && <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="eyebrow">SUPPORT & SALES</span><h2>Your inquiries</h2></div><a className="button button-small" href="/contact">Talk to sales</a></div>{loading ? <p>Loading your account…</p> : leads.length ? <div className="workspace-inquiries">{leads.map((lead) => <article key={lead.id}><header><div><span className={`client-inquiry-type ${lead.type}`}>{lead.type}</span><h3>{lead.company || (lead.plan ? `${lead.plan} plan` : 'Nexara inquiry')}</h3></div><time>{new Date(lead.createdAt).toLocaleDateString()}</time></header><p>{lead.message}</p><p className="workspace-status">Status: {lead.status}</p>{lead.response ? <div className="client-inquiry-response"><b>Reply from Nexara</b><p>{lead.response}</p></div> : <p className="workspace-waiting">Our team has received your inquiry and will reply here.</p>}</article>)}</div> : <div className="workspace-empty"><MessageSquareText size={22} /><h3>No inquiries yet</h3><p>Send a message while signed in and read the team's reply here.</p><a className="button" href="/contact">Contact sales</a></div>}</section>}{tab === 'pricing' && <section className="workspace-panel"><span className="eyebrow">PLANS & PRICING</span><h2>Choose the right plan</h2><p>Explore the current static plan details. Plan requests are sent to the Nexara team.</p><div className="workspace-plan-grid">{plans.map((plan) => <article key={plan.slug}><span>{plan.name}</span><h3>${plan.price.monthly}<small> / month</small></h3><p>{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><a className="button button-small" href={plan.slug === 'starter' ? '/trial' : plan.slug === 'enterprise' ? '/contact' : `/checkout?plan=${plan.slug}&billing=monthly`}>{plan.cta}</a></article>)}</div></section>}{tab === 'usage' && <section className="workspace-panel"><span className="eyebrow">WORKSPACE OVERVIEW</span><h2>Your team's workspace</h2><div className="workspace-metrics"><article><span>AI tasks this month</span><b>1,284</b><small>Within your plan allowance</small></article><article><span>Active agents</span><b>3</b><small>Support triage · Doc summary · Lead enrichment</small></article><article><span>Connected apps</span><b>6</b><small>Slack · GitHub · Notion · Drive +2</small></article><article><span>Time saved</span><b>42 hours</b><small>Across your active workflows</small></article></div><a className="text-link" href="/docs">Open product documentation <ArrowRight size={14} /></a></section>}</main><Footer /></>
}

function AdminPage() {
  const [token, setToken] = useState(() => getAdminToken())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [section, setSection] = useState('overview')
  const [leads, setLeads] = useState([])
  const [documents, setDocuments] = useState([])
  const [responses, setResponses] = useState({})
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!token) return undefined
    let active = true
    ;(async () => {
      try {
        await nexaraApi.seedAdminDemoData(token)
        const [inquiries, docs] = await Promise.all([nexaraApi.adminLeads(token), nexaraApi.adminDocuments(token)])
        if (!active) return
        setLeads(inquiries.data)
        setDocuments(docs.data)
      } catch (requestError) {
        if (!active) return
        setError(requestError.message)
        if (requestError.message.includes('(401)')) {
          setAdminToken(null)
          setToken(null)
        }
      }
    })()
    return () => { active = false }
  }, [token])
  async function refresh(nextToken = token) {
    if (!nextToken) return
    setLoading(true)
    setError('')
    try {
      const [inquiries, docs] = await Promise.all([nexaraApi.adminLeads(nextToken), nexaraApi.adminDocuments(nextToken)])
      setLeads(inquiries.data)
      setDocuments(docs.data)
    } catch (requestError) {
      setError(requestError.message)
      if (requestError.message.includes('(401)')) {
        setAdminToken(null)
        setToken(null)
      }
    } finally {
      setLoading(false)
    }
  }
  async function signIn(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await nexaraApi.adminLogin({ email, password })
      setAdminToken(result.token)
      setToken(result.token)
      setPassword('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }
  async function upload(event) {
    event.preventDefault()
    const form = event.currentTarget
    const file = new FormData(form).get('file')
    if (!(file instanceof File) || !token) return
    if (file.size === 0 || file.size > 1024 * 1024) {
      setError('Choose a non-empty PDF, TXT, or Markdown file no larger than 1 MB. Files are saved in this browser.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      const contentType = extension === '.pdf' ? 'application/pdf' : extension === '.txt' ? 'text/plain' : ['.md', '.markdown'].includes(extension) ? 'text/markdown' : ''
      if (!contentType) throw new Error('Choose a PDF, TXT, or Markdown file.')
      const bytes = new Uint8Array(await file.arrayBuffer())
      let binary = ''
      for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
      const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      await nexaraApi.uploadDocument(token, { slug, title: title.trim(), description: description.trim(), filename: file.name, contentType, contentBase64: btoa(binary) })
      setTitle('')
      setDescription('')
      form.reset()
      await refresh(token)
    } catch (requestError) {
      setError(requestError.message)
      setLoading(false)
    }
  }
  async function reply(lead) {
    setLoading(true)
    setError('')
    try {
      const { data } = await nexaraApi.updateLead(token, lead.id, { status: lead.status === 'new' ? 'contacted' : lead.status, response: responses[lead.id] ?? lead.response ?? '' })
      setLeads((current) => current.map((item) => item.id === lead.id ? data : item))
      setResponses((current) => { const next = { ...current }; delete next[lead.id]; return next })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }
  async function removeDocument(document) {
    if (!token || !window.confirm(`Delete "${document.title}"?`)) return
    setLoading(true)
    setError('')
    try {
      await nexaraApi.deleteDocument(token, document.id)
      setDocuments((current) => current.filter((item) => item.id !== document.id))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }
  const pendingCount = leads.filter((lead) => lead.status === 'new').length
  const answeredCount = leads.filter((lead) => Boolean(lead.response)).length
  const navigation = [
    ['overview', 'Overview', Activity],
    ['agents', 'AI agents', Bot],
    ['workflows', 'Workflows', Workflow],
    ['integrations', 'Integrations', Plug],
    ['inquiries', 'Inquiries', MessageSquareText],
    ['docs', 'Documentation', FileText],
    ['analytics', 'Analytics', Activity],
    ['settings', 'Settings', LockKeyhole],
  ]
  const sectionCopy = {
    overview: ['Workspace overview', 'A clear view of the conversations and product knowledge behind your AI workflows.'],
    agents: ['AI agents', 'Explore example assistants designed around clear roles, safe permissions, and human oversight.'],
    workflows: ['Workflow library', 'See how a trigger, a sequence of steps, and a review point can work together.'],
    integrations: ['Integrations', 'Browse the tools teams commonly bring into an AI-powered workflow.'],
    inquiries: ['Conversations', 'Follow up with teams and keep every sales conversation visible in the client dashboard.'],
    docs: ['Product documentation', 'Publish the trusted guides that help teams get more from Nexara.'],
    analytics: ['Workspace analytics', 'Review the activity and content actually saved in this browser preview.'],
    settings: ['Workspace settings', 'Understand the storage and publishing behavior of this local preview.'],
  }
  const localActivity = [
    ...leads.map((lead) => ({ id: lead.id, title: lead.company || lead.name || 'Nexara inquiry', detail: `${lead.type || 'Sales'} inquiry · ${lead.email}`, date: lead.createdAt, kind: 'Conversation' })),
    ...documents.map((document) => ({ id: document.id, title: document.title, detail: `${document.filename} · Published documentation`, date: document.createdAt, kind: 'Document' })),
  ].sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()).slice(0, 6)

  if (!token) return (
    <>
      <main className="admin-login-page">
        <section className="admin-login-story">
          <Logo />
          <span className="admin-hero-kicker"><Sparkles size={14} /> WORKFLOW INTELLIGENCE, IN YOUR HANDS</span>
          <h1>Supercharge your workflow.<br /><span>Stay in control.</span></h1>
          <p>The Nexara control center brings your team conversations and product knowledge into one thoughtful workspace.</p>
          <div className="admin-login-features">
            <span><MessageSquareText size={15} /> Human conversations</span>
            <span><FileText size={15} /> Trusted documentation</span>
            <span><ShieldCheck size={15} /> A clear view of your workspace</span>
          </div>
          <div className="admin-login-orbit" aria-hidden="true"><div /><span><Sparkles size={22} /></span></div>
        </section>
        <form className="admin-login-card" onSubmit={signIn}>
          <span className="admin-login-icon"><Fingerprint size={19} /></span>
          <span className="eyebrow">NEXARA CONTROL CENTER</span>
          <h2>Welcome back.</h2>
          <p>Sign in to manage your local Nexara workspace.</p>
          <label>Email<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" minLength="8" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <p className="admin-local-note">First sign-in creates your local admin credentials. Demo inquiries and documents stay in this browser.</p>
          {error && <p className="local-form-error" role="alert">{error}</p>}
          <button className="button form-submit" type="submit" disabled={loading}>{loading ? 'Opening workspace…' : 'Continue to workspace'} <ArrowRight size={15} /></button>
          <a className="back-link" href="/">Back to Nexara</a>
        </form>
      </main>
      <Footer />
    </>
  )

  return (
    <>
      <main className="admin-console">
        <header className="admin-topbar">
          <div className="admin-topbar-brand"><Logo /></div>
          <div className="admin-topbar-title"><span>WORKSPACE</span><strong>Control center</strong></div>
          <div className="admin-topbar-actions">
            <span className="admin-local-badge"><i /> Local preview</span>
            <button type="button" className="admin-refresh" onClick={() => void refresh()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh data'}</button>
            <button className="admin-signout" type="button" onClick={() => { setAdminToken(null); setToken(null) }}>Sign out <ArrowRight size={14} /></button>
          </div>
        </header>
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-workspace-identity"><span className="admin-workspace-avatar"><Sparkles size={16} /></span><span><b>Nexara workspace</b><small>AI workflow intelligence</small></span></div>
            <span className="admin-nav-label">WORKSPACE</span>
            <nav className="admin-sidebar-nav" aria-label="Admin sections">
              {navigation.map(([id, label, Icon]) => <button type="button" key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}><Icon size={16} /><span>{label}</span>{id === 'inquiries' && <small>{leads.length}</small>}{id === 'docs' && <small>{documents.length}</small>}</button>)}
            </nav>
            <div className="admin-sidebar-note"><span><Zap size={14} /></span><b>Built for humans.</b><p>Keep people in control of every conversation and workflow.</p><a href="/docs">Explore product docs <ArrowRight size={12} /></a></div>
            <div className="admin-sidebar-footer"><span className="admin-avatar">N</span><span><b>Local administrator</b><small>Browser-only demo</small></span></div>
          </aside>
          <div className="admin-main">
            <div className="admin-page-heading"><div><span className="eyebrow">NEXARA / {section.toUpperCase()}</span><h1>{sectionCopy[section][0]}</h1><p>{sectionCopy[section][1]}</p></div><span className="admin-date"><i /> Workspace is ready</span></div>
            {section === 'overview' && <section className="admin-hero">
              <div className="admin-hero-copy">
                <span className="admin-hero-kicker"><Sparkles size={14} /> THE NEXARA WORKSPACE</span>
                <h2>Supercharge your workflow,<br /><span>with AI-powered intelligence.</span></h2>
                <p>Keep your team close to the right answers. Review conversations, publish useful guides, and make space for the work that matters.</p>
                <div className="admin-hero-actions"><button className="button button-small" type="button" onClick={() => setSection('inquiries')}>Review conversations <ArrowRight size={14} /></button><button type="button" className="admin-hero-secondary" onClick={() => setSection('docs')}>Manage documentation</button></div>
              </div>
              <div className="admin-hero-visual" aria-label={`${leads.length} conversations and ${documents.length} published documents`}>
                <div className="admin-visual-heading"><span><i /> YOUR WORKSPACE</span><b>Live overview</b></div>
                <div className="admin-visual-metrics"><div><small>Conversations</small><strong>{leads.length.toLocaleString()}</strong><span>Team requests</span></div><div><small>Published docs</small><strong>{documents.length.toLocaleString()}</strong><span>Knowledge resources</span></div></div>
                <div className="admin-visual-wave"><span /><i /><i /><i /><i /><i /><i /><i /><span /></div>
                <div className="admin-visual-footer"><span>Every workflow starts with clarity.</span><Sparkles size={15} /></div>
              </div>
              <div className="admin-hero-glow" aria-hidden="true" />
            </section>}
            {error && <p className="local-form-error admin-error" role="alert">{error}</p>}
            {loading && <p className="admin-loading"><span /> Saving your workspace…</p>}
            {section === 'overview' && <>
              <section className="admin-metrics" aria-label="Workspace metrics">
                <article><span className="admin-metric-icon violet"><MessageSquareText size={16} /></span><small>Total conversations</small><strong>{leads.length}</strong><em>Across sales and trial requests</em></article>
                <article><span className="admin-metric-icon amber"><Activity size={16} /></span><small>Needs a reply</small><strong>{pendingCount}</strong><em>Open follow-ups</em></article>
                <article><span className="admin-metric-icon mint"><Check size={16} /></span><small>Replies sent</small><strong>{answeredCount}</strong><em>Visible in client dashboards</em></article>
                <article><span className="admin-metric-icon blue"><FileText size={16} /></span><small>Published guides</small><strong>{documents.length}</strong><em>Available on the Docs page</em></article>
              </section>
              <div className="admin-overview-grid">
                <section className="admin-panel">
                  <div className="admin-panel-heading"><div><span className="eyebrow">INBOX</span><h2>Recent conversations</h2></div><button type="button" className="admin-text-action" onClick={() => setSection('inquiries')}>Open inbox <ArrowRight size={13} /></button></div>
                  {leads.length ? <div className="admin-recent-list">{leads.slice(0, 4).map((lead) => <article key={lead.id}><span className="admin-recent-icon"><MessageSquareText size={15} /></span><div className="admin-recent-copy"><b>{lead.company || lead.name || 'Nexara inquiry'}</b><p>{lead.message}</p><small>{lead.email} · {new Date(lead.createdAt).toLocaleDateString()} {lead.isDemo && <span className="admin-demo-data-badge">Sample</span>}</small></div><span className={`admin-status ${lead.response ? 'answered' : 'open'}`}>{lead.response ? 'Replied' : 'Needs reply'}</span></article>)}</div> : <div className="admin-empty"><span className="admin-empty-icon"><MessageSquareText size={20} /></span><h3>Your inbox is ready.</h3><p>Sales and trial requests created in this browser will appear here.</p><button type="button" className="admin-text-action" onClick={() => setSection('inquiries')}>View all conversations <ArrowRight size={13} /></button></div>}
                </section>
                <section className="admin-panel admin-docs-summary">
                  <div className="admin-panel-heading"><div><span className="eyebrow">KNOWLEDGE</span><h2>Product documentation</h2></div><button type="button" className="admin-icon-action" aria-label="Manage documentation" onClick={() => setSection('docs')}><ArrowRight size={15} /></button></div>
                  <div className="admin-docs-summary-visual"><span><FileText size={19} /></span><strong>{documents.length}</strong><small>published resource{documents.length === 1 ? '' : 's'}</small></div>
                  <p>Give every team a useful place to learn how Nexara fits into their work.</p>
                  <button type="button" className="admin-secondary-button" onClick={() => setSection('docs')}>{documents.length ? 'Manage your guides' : 'Publish your first guide'} <ArrowRight size={13} /></button>
                </section>
              </div>
            </>}
            {section === 'inquiries' && <section className="admin-panel admin-section-panel">
              <div className="admin-panel-heading"><div><span className="eyebrow">SALES & TRIALS</span><h2>Team conversations</h2><p>Send a reply to make it visible in the signed-in client's dashboard.</p></div><span className="admin-count-pill">{leads.length} total</span></div>
              {leads.length ? <div className="admin-inquiry-list">{leads.map((lead) => <article className="admin-inquiry" key={lead.id}><header><div className="admin-inquiry-person"><span className="admin-inquiry-avatar">{(lead.name || 'N').slice(0, 1).toUpperCase()}</span><div><h3>{lead.name || 'Nexara visitor'}</h3><a href={`mailto:${lead.email}`}>{lead.email}</a></div></div><span className={`admin-status ${lead.response ? 'answered' : 'open'}`}>{lead.response ? 'Replied' : lead.status === 'new' ? 'Needs reply' : lead.status}</span></header><div className="admin-inquiry-meta"><span>{lead.type || 'Inquiry'}</span><span>{lead.company || lead.plan || 'No company provided'}</span>{lead.isDemo && <span className="admin-demo-data-badge">Sample</span>}<time>{new Date(lead.createdAt).toLocaleString()}</time></div><p className="admin-inquiry-message">{lead.message}</p><label className="admin-reply-label">Reply to {lead.name || 'this visitor'}<textarea rows="3" maxLength="5000" placeholder="Write a thoughtful response…" value={responses[lead.id] ?? lead.response ?? ''} onChange={(event) => setResponses((current) => ({ ...current, [lead.id]: event.target.value }))} /></label>{lead.response && <p className="admin-saved-reply"><b>Current reply</b>{lead.response}</p>}<button className="button button-small" type="button" disabled={loading} onClick={() => void reply(lead)}>{lead.response ? 'Update response' : 'Send response'} <ArrowRight size={13} /></button></article>)}</div> : <div className="admin-empty"><span className="admin-empty-icon"><MessageSquareText size={20} /></span><h3>No conversations yet</h3><p>When someone sends a trial or sales inquiry from this browser, you can respond here.</p><a className="admin-text-action" href="/contact">Preview the sales contact page <ArrowRight size={13} /></a></div>}
            </section>}
            {section === 'docs' && <div className="admin-docs-grid">
              <section className="admin-panel admin-upload-panel"><div className="admin-panel-heading"><div><span className="eyebrow">PUBLISH KNOWLEDGE</span><h2>Add a product guide</h2><p>Publish a PDF or text guide to this browser's Docs page.</p></div><span className="admin-upload-icon"><FileText size={18} /></span></div><form className="workspace-upload" onSubmit={upload}><label>Document title<input required maxLength="160" placeholder="Getting started with Nexara" value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Short description<input required maxLength="1000" placeholder="What readers will learn" value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Choose a file<input name="file" type="file" required accept=".pdf,.txt,.md,.markdown,application/pdf,text/plain,text/markdown" /></label><small className="admin-file-hint">PDF, TXT, or Markdown · up to 1 MB · stored locally in this browser</small><button className="button" type="submit" disabled={loading}>{loading ? 'Publishing…' : 'Publish document'} <ArrowRight size={14} /></button></form></section>
              <section className="admin-panel admin-published-panel"><div className="admin-panel-heading"><div><span className="eyebrow">DOCS LIBRARY</span><h2>Published resources</h2></div><span className="admin-count-pill">{documents.length}</span></div>{documents.length ? documents.map((document) => <article className="admin-document" key={document.id}><span className="admin-document-icon"><FileText size={17} /></span><div><a href={`/docs/${encodeURIComponent(document.slug)}`} target="_blank" rel="noreferrer"><b>{document.title}</b></a><p>{document.description}</p><small>{document.filename} · {new Date(document.createdAt).toLocaleDateString()} {document.isDemo && <span className="admin-demo-data-badge">Sample</span>}</small></div><button type="button" className="admin-icon-action danger" aria-label={`Delete ${document.title}`} onClick={() => void removeDocument(document)}><X size={15} /></button></article>) : <div className="admin-empty admin-empty-compact"><span className="admin-empty-icon"><FileText size={19} /></span><h3>Your library starts here.</h3><p>Publish a guide and it will appear on the public Docs page for this browser.</p></div>}</section>
            </div>}
            {section === 'agents' && <section className="admin-static-page">
              <div className="admin-static-heading"><div><span className="eyebrow">EXAMPLE CATALOG</span><h2>Purpose-built AI agents</h2></div><p>Illustrative examples inspired by the Nexara product story. These are sample cards, not active agents in this preview.</p></div>
              <div className="admin-sample-grid">{previewAgents.map((agent) => { const Icon = agent.icon; return <article className="admin-sample-card" key={agent.name}><div className="admin-sample-card-head"><span className="admin-sample-icon"><Icon size={17} /></span><span className="admin-sample-badge">Example</span></div><h3>{agent.name}</h3><p>{agent.description}</p><div className="admin-sample-meta"><span>{agent.team}</span><span>{agent.mode}</span></div></article> })}</div>
            </section>}
            {section === 'workflows' && <section className="admin-static-page">
              <div className="admin-static-heading"><div><span className="eyebrow">WORKFLOW LIBRARY</span><h2>Patterns for work that repeats</h2></div><p>Sample workflow designs that reflect the landing-page promise: connected tools, clear steps, and people in control.</p></div>
              <div className="admin-workflow-list">{previewWorkflows.map((workflow) => { const Icon = workflow.icon; return <article className="admin-workflow-card" key={workflow.name}><div className="admin-workflow-intro"><span className="admin-sample-icon"><Icon size={17} /></span><div><span className="admin-sample-badge">Preview example</span><h3>{workflow.name}</h3><p>Starts when: <b>{workflow.trigger}</b></p></div></div><div className="admin-workflow-steps" aria-label={`${workflow.name} example steps`}>{workflow.steps.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b></div>)}</div></article> })}</div>
            </section>}
            {section === 'integrations' && <section className="admin-static-page">
              <div className="admin-static-heading"><div><span className="eyebrow">CONNECT YOUR STACK</span><h2>Tools that work better together</h2></div><p>This catalog is illustrative. Connections are not configured or authorized by this local website preview.</p></div>
              <div className="admin-integration-grid">{previewIntegrations.map(([name, description, Icon]) => <article className="admin-integration-card" key={name}><span className="admin-sample-icon"><Icon size={17} /></span><div><h3>{name}</h3><p>{description}</p></div><span className="admin-sample-badge">Catalog preview</span></article>)}</div>
            </section>}
            {section === 'analytics' && <section className="admin-static-page">
              <div className="admin-static-heading"><div><span className="eyebrow">LOCAL WORKSPACE ACTIVITY</span><h2>Signals from this browser</h2></div><p>Counts below come from local inquiries and documents. The activity chart is illustrative; workflow runs are not tracked in this preview.</p></div>
              <div className="admin-analytics-grid"><article><span>Conversations</span><strong>{leads.length}</strong><small>Saved in this browser</small></article><article><span>Awaiting response</span><strong>{pendingCount}</strong><small>New inquiries</small></article><article><span>Replies sent</span><strong>{answeredCount}</strong><small>{leads.length ? `${Math.round(answeredCount / leads.length * 100)}% of conversations` : 'No conversations yet'}</small></article><article><span>Published documents</span><strong>{documents.length}</strong><small>Available on this browser's Docs page</small></article></div>
              <div className="admin-analytics-panels"><section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">SAMPLE VISUALIZATION</span><h2>Illustrative activity trend</h2></div><span className="admin-count-pill">Demo</span></div><div className="admin-demo-chart"><div className="admin-demo-chart-bars">{[38, 58, 46, 74, 54, 88, 65].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div><div className="admin-demo-chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><p>Example trend only — no workflow execution data is collected by this local preview.</p></div></section><section className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow">RECENT CHANGES</span><h2>Local activity</h2></div></div>{localActivity.length ? <div className="admin-local-activity">{localActivity.map((item) => <article key={`${item.kind}-${item.id}`}><span className="admin-activity-dot" /><div><b>{item.title}</b><p>{item.kind} · {item.detail}</p></div><time>{new Date(item.date).toLocaleDateString()}</time></article>)}</div> : <div className="admin-empty admin-empty-compact"><h3>No saved activity yet.</h3><p>Inquiries and published docs created in this browser will appear here.</p></div>}</section></div>
            </section>}
            {section === 'settings' && <section className="admin-static-page">
              <div className="admin-static-heading"><div><span className="eyebrow">WORKSPACE PREFERENCES</span><h2>Preview settings</h2></div><p>This Vite admin is intentionally browser-local. Use the Next.js app for shared, server-backed workspace settings and customer data.</p></div>
              <div className="admin-settings-grid"><article><span className="admin-settings-icon"><Database size={17} /></span><span className="eyebrow">DATA STORAGE</span><h3>Browser localStorage</h3><p>Accounts, inquiries, replies, and documents are scoped to this origin and browser profile. They do not sync across devices.</p></article><article><span className="admin-settings-icon"><ShieldCheck size={17} /></span><span className="eyebrow">LOCAL ADMIN</span><h3>Credentials stay in this browser</h3><p>The local admin password is stored as a derived hash. This preview is not a replacement for server-side production authentication.</p></article><article><span className="admin-settings-icon"><FileText size={17} /></span><span className="eyebrow">DOCUMENT PUBLISHING</span><h3>PDF, TXT, and Markdown</h3><p>Vite uploads are limited to 1 MB to fit browser storage. Published files appear on this browser's Docs page.</p></article></div>
              <div className="admin-settings-actions"><button type="button" className="admin-secondary-button" onClick={() => setSection('docs')}>Manage documentation <ArrowRight size={13} /></button><a className="admin-text-action" href="/privacy">Read preview data notes <ArrowRight size={13} /></a></div>
            </section>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function LegalPage({ type }) {
  const title = type === 'privacy' ? 'Privacy at Nexara' : 'Terms of service'
  return <><main className="page-main legal-page"><SectionHeading eyebrow="NEXARA AI" title={title} copy="This Vite preview stores data in browser local storage and does not send it to a server." /><article><h2>About this preview</h2><p>Contact inquiries, demo accounts, replies, and plan requests are stored in this browser's local storage. The local admin can view them only in this same browser profile; they are not sent to the Nexara backend or shared across devices. The checkout does not process payments.</p><h2>Before launch</h2><p>Replace this sample page with policies reviewed for your business, jurisdiction, data practices, and payment provider. Do not rely on this preview as legal advice.</p><a className="text-link" href="/contact">Questions? Contact our team <ArrowRight size={14} /></a></article></main><Footer /></>
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
    '/trial': <FormPage mode="trial" />,
    '/dashboard': <ClientDashboardPage />,
    '/admin': <AdminPage />,
    '/checkout': <PlanInquiryPage />,
    '/privacy': <LegalPage type="privacy" />,
    '/terms': <LegalPage type="terms" />,
  }
  const page = path.startsWith('/docs/') ? <DocDetailPage slug={decodeURIComponent(path.slice('/docs/'.length))} /> : pages[path] || <NotFoundPage />
  return <div className="app-shell">{path !== '/admin' && <Header />}{page}</div>
}

export default App
