import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleHelp,
  CreditCard,
  Download,
  Gift,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react'
import './App.css'

const products = [
  { slug: 'figma-system', category: 'Template', name: 'Ultimate Figma System — 340 components', price: 29, rating: '4.9', reviews: '1.2k', tag: 'Bestseller', art: 'figma', description: 'A practical, beautifully organized Figma library to help you design and ship consistent products faster.', includes: ['340 reusable, production-ready components', 'Design tokens, variables, and type styles', 'Setup guide and lifetime file updates'] },
  { slug: 'newsletter-engine', category: 'Video Course', name: 'Newsletter Growth Engine (8 hrs)', price: 79, rating: '5.0', reviews: '2.1k', tag: 'New', art: 'course', description: 'A step-by-step video course for building a newsletter your readers look forward to opening.', includes: ['8 hours of practical, on-demand lessons', 'Welcome sequence and content planning worksheets', 'Launch checklist and replay access'] },
  { slug: 'solo-creator-playbook', category: 'E-book', name: 'The Solo Creator Playbook', price: 19, rating: '4.8', reviews: '1.2k', tag: 'Popular', art: 'book', description: 'The field guide for creating a sustainable one-person business around your best work.', includes: ['The complete 120-page digital guide', 'Simple offer and pricing worksheets', 'A practical 30-day action plan'] },
  { slug: 'creator-os', category: 'Template', name: 'My Notion Creator OS', price: 24, rating: '4.9', reviews: '860', tag: 'Creator pick', art: 'notion', description: 'Plan launches, organize content, and keep your creator business moving in one calm workspace.', includes: ['Content calendar and idea library', 'Launch, client, and product trackers', 'Quick-start setup guide'] },
]

const issues = [
  { id: 42, title: 'The $10k Solo Creator Stack', date: '5 min read', summary: 'How I run a newsletter, products & a content studio with 3 tiny tools.', topic: 'WEEKLY DISPATCH', sections: [['The small stack that keeps me moving', 'My studio runs on three simple systems: a place to publish, a place to sell, and a place to organize the work. Keeping the stack intentionally small gives me more time to make things worth sharing.'], ['Make every tool earn its place', 'A tool stays only when it saves time or improves the reader experience. Start with the workflow you need, then add software only when the old process becomes a real bottleneck.']] },
  { id: 41, title: '7 landing pages that print money', date: '7 min read', summary: 'Teardown of high-converting creator pages + the exact moves to steal.', topic: 'WEEKLY DISPATCH', sections: [['Lead with the result', 'The strongest pages make the outcome obvious before introducing a long list of features. A specific headline helps the right person recognize themselves and decide whether to keep reading.'], ['Make the next step easy', 'Use a single clear call to action, show what is included, and answer the common questions near the decision point. Small clarity improvements often matter more than extra visual effects.']] },
  { id: 40, title: 'Price your templates at $29, not $9', date: '6 min read', summary: 'Pricing psychology for digital products — with real revenue numbers inside.', topic: 'WEEKLY DISPATCH', sections: [['Price the transformation', 'A template is worth more than the minutes it takes to download. Price around the time, confidence, and useful result it gives a buyer—not around the number of pages in the file.'], ['Test with a clear offer', 'Explain who the product helps, what is included, and how it saves effort. Then review actual sales and customer feedback before changing the price.']] },
  { id: 39, title: 'A portfolio homepage that gets to the point', date: '6 min read', summary: 'A simple structure for showing your best work without making people hunt for it.', topic: 'DESIGN NOTES', sections: [['Give your work a clear front door', 'A portfolio homepage has one job: help the right person quickly understand what you do and where to look next. Start with a useful one-line introduction and a small set of your strongest projects.'], ['Show the thinking, not only the polish', 'A concise case study can explain the problem, your contribution, and what changed. A little context makes the work more memorable and gives visitors a reason to get in touch.']] },
  { id: 38, title: 'The weekly reset for creative work', date: '4 min read', summary: 'A gentler planning ritual for deciding what matters before the week gets loud.', topic: 'CREATOR NOTES', sections: [['Choose one meaningful outcome', 'Before opening every inbox, decide which piece of work would make this week feel worthwhile. Break it into small next steps and give it a place on your calendar.'], ['Leave room for real life', 'A plan should create clarity, not guilt. Make space for client work, rest, and the unexpected so your creative practice can keep going next week too.']] },
]

const freeResources = [
  { slug: 'ui-starter-kit', title: 'The UI Starter Kit', category: 'Design', format: 'Figma file', time: '10 min setup', icon: '✳', color: 'resource-lilac', description: 'A tidy set of starter components, type styles, and spacing tokens for your next interface.', includes: ['12 flexible buttons and form controls', 'A simple type scale and spacing guide', 'A blank project file with naming conventions'], content: [['Start with the page frame', 'Create a desktop and mobile frame, then set a spacing rhythm you can reuse. Keeping the basics consistent makes every later decision easier.'], ['Build with reusable pieces', 'Start from the button, input, and card examples. Duplicate and adapt them for your project rather than redrawing common patterns.']] },
  { slug: 'portfolio-checklist', title: 'Portfolio Clarity Checklist', category: 'Career', format: '12-point checklist', time: '15 min review', icon: '✓', color: 'resource-mint', description: 'A quick, honest review to make your portfolio easier to understand and navigate.', includes: ['A clear first-screen introduction', 'Case study story and role prompts', 'Contact and mobile usability checks'], content: [['The first screen', 'Can a new visitor tell what you do, who you help, and where to see your work in a few seconds? Keep your introduction direct and put your strongest project close by.'], ['The case study', 'For each project, explain the challenge, your role, the key decisions, and the result. Add enough context to make the work understandable without turning it into a novel.']] },
  { slug: 'welcome-email-map', title: 'Welcome Email Map', category: 'Newsletter', format: 'Email outline', time: '20 min draft', icon: '✉', color: 'resource-peach', description: 'Plan a friendly three-email welcome sequence that introduces your work and gives new readers value.', includes: ['A clear welcome and expectation setting', 'A useful story or resource in email two', 'A simple reply prompt for email three'], content: [['Email one: make a promise', 'Say hello, explain what you send and how often, and give the reader one helpful place to start. Make the next email feel expected, not surprising.'], ['Email two: share something useful', 'Teach one small thing you have learned. A practical example helps readers understand your point of view and what they can expect from you.'], ['Email three: invite a conversation', 'Ask one specific, low-pressure question. Replies help you learn what your readers care about and make the newsletter feel human.']] },
  { slug: 'creator-weekly-planner', title: 'The Creator Weekly Planner', category: 'Planning', format: 'Printable planner', time: '5 min reset', icon: '▦', color: 'resource-blue', description: 'A lightweight weekly planning ritual for balancing client work, creative projects, and rest.', includes: ['One priority and three next actions', 'A space for audience and business tasks', 'A weekly review and reset prompt'], content: [['Pick the one priority', 'Choose the single outcome that would make this week feel meaningful. Write down the next action, not the entire project plan.'], ['Plan a week that fits', 'Add fixed commitments first, then protect one or two focused work blocks. Leave breathing room for admin, rest, and unexpected work.'], ['Close with a quick review', 'At the end of the week, note what moved forward and what can wait. Carry only the useful lessons into your next plan.']] },
]

const money = (amount) => `$${amount.toFixed(2)}`
const go = (path) => {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function Brand({ compact = false }) {
  return <a className={`brand${compact ? ' brand--compact' : ''}`} href="/" aria-label="CreatorHub home"><span className="brand-icon">C</span><span>CreatorHub</span></a>
}

function Header({ active = 'All Products' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button className="menu-toggle icon-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a className={active === 'All Products' ? 'active' : ''} href="/">All Products</a>
          <a className={active === 'Free Resources' ? 'active' : ''} href="/free-resources">Free Resources</a>
          <a className={active === 'Newsletter Archive' ? 'active' : ''} href="/newsletters">Newsletter Archive</a>
          <a className={active === 'About' ? 'active' : ''} href="/creator/maya-chen">About</a>
        </nav>
        <div className="header-actions">
          {searchOpen ? <form className="header-search" onSubmit={(event) => { event.preventDefault(); const query = new FormData(event.currentTarget).get('query'); go(`/search?q=${encodeURIComponent(query)}`); setSearchOpen(false) }}><Search size={14} /><input autoFocus name="query" aria-label="Search products and issues" placeholder="Search issues, templates..." /><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={13} /></button></form> : <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={14} /><span>Search issues, templates...</span></button>}
          <a className="cart-button" href="/checkout/figma-system" aria-label="Open checkout"><ShoppingBag size={16} /><span>0</span></a>
        </div>
      </div>
    </header>
  )
}

function ProductArt({ type, large = false }) {
  const shapes = {
    figma: <div className="art-figma"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-window"><div className="art-sidebar"><b /><i /><i /><i /></div><div className="art-canvas"><span /><span /><span /><b /><i /></div></div></div>,
    course: <div className="art-course"><div className="plant plant-left">✳</div><div className="laptop"><div className="laptop-screen"><div className="screen-top">creator<span>hub</span></div><div className="screen-chart"><i /><i /><i /><i /><i /></div><b>Build your audience</b><small>One great email at a time</small></div><div className="laptop-base" /></div><div className="plant plant-right">✳</div></div>,
    book: <div className="art-book"><div className="book-cover"><Sparkles size={16} /><strong>THE SOLO<br />CREATOR<br />PLAYBOOK</strong><small>MAKE YOUR BEST WORK PAY</small></div><div className="book-shadow" /></div>,
    notion: <div className="art-notion"><div className="notion-card"><span>✦</span><b>Creator OS</b><i>Plan your next big thing.</i><div className="notion-row" /><div className="notion-row short" /><div className="notion-row" /></div></div>,
  }
  return <div className={`product-art art-${type}${large ? ' product-art--large' : ''}`}>{shapes[type] || shapes.figma}</div>
}

function ProductCard({ product, onCheckout }) {
  return <article className="product-card">
    <a className="product-art-link" href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><ProductArt type={product.art} /><span className="art-label">{product.category}</span><span className="art-tag">{product.tag}</span></a>
    <div className="product-meta"><span><Star size={12} fill="currentColor" /> {product.rating} ({product.reviews})</span><strong>{money(product.price)}</strong></div>
    <a className="product-title" href={`/products/${product.slug}`}>{product.name}</a>
    <div className="saved-note"><span className="mini-avatar">M</span> “Saved me 20+ hours. Worth every dollar!”</div>
    <button className="button button-dark product-buy" onClick={() => onCheckout(product.slug)}><LockKeyhole size={13} /> Instant Checkout</button>
  </article>
}

function ResourceCard({ resource }) {
  return <article className="resource-card">
    <div className={`resource-art ${resource.color}`}><span className="resource-art-mark">{resource.icon}</span><span className="resource-format">{resource.format}</span><span className="resource-art-label">A LITTLE SOMETHING, FREE</span></div>
    <div className="resource-card-copy"><div className="resource-card-meta"><span className="pill pill-purple">{resource.category}</span><span><BookOpen size={12} /> {resource.time}</span></div><h3>{resource.title}</h3><p>{resource.description}</p><a className="resource-open-link" href={`/free-resources/${resource.slug}`}>Open free resource <ArrowRight size={13} /></a></div>
  </article>
}

function CreatorStory() {
  return <section className="creator-story">
    <div className="story-art">
      <div className="story-sticky sticky-one">MAKE GOOD<br />THINGS ✦</div>
      <div className="story-sticky sticky-two">One email<br />at a time.</div>
      <div className="story-note"><span className="story-avatar">M</span><span><strong>Maya Chen</strong><small>Designer · educator · creator</small></span><ArrowUpRight size={17} /></div>
    </div>
    <div className="story-copy">
      <span className="eyebrow-small">A NOTE FROM MAYA</span>
      <h2>Make a living from the work you believe in.</h2>
      <p>I’m Maya: designer, teacher, and recovering overthinker. CreatorHub is where I share the systems, lessons, and tools that helped me build a calmer, more independent creative business.</p>
      <div className="story-proof"><span><strong>8 years</strong><small>designing online</small></span><span><strong>50k+</strong><small>curious readers</small></span><span><strong>42 issues</strong><small>and counting</small></span></div>
      <a className="story-link" href="/creator/maya-chen">Get to know Maya <ArrowRight size={14} /></a>
    </div>
  </section>
}

function TestimonialSection() {
  const testimonials = [
    { quote: 'The Figma system gave our tiny team a real design foundation. We shipped the redesign in half the time.', name: 'Jordan Lee', role: 'Product designer', initials: 'JL', color: 'lavender' },
    { quote: 'Maya’s newsletter is the rare one I read with my coffee and actually use during the work week.', name: 'Amara Okafor', role: 'Independent creator', initials: 'AO', color: 'peach' },
    { quote: 'The playbook helped me turn a messy list of ideas into my first small, very real digital product.', name: 'Sam Rivera', role: 'Writer & maker', initials: 'SR', color: 'mint' },
  ]
  return <section className="testimonial-section">
    <div className="section-heading"><div><span className="eyebrow-small">KIND WORDS FROM THE COMMUNITY</span><h2>Made useful. Shared gladly.</h2></div><a href="/search?q=creator">Find your next resource <ArrowRight size={12} /></a></div>
    <div className="testimonial-grid">{testimonials.map((item) => <article className="testimonial-card" key={item.name}><div className="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div><p>“{item.quote}”</p><div className="testimonial-person"><span className={`testimonial-avatar ${item.color}`}>{item.initials}</span><span><strong>{item.name}</strong><small>{item.role}</small></span><Check size={15} /></div></article>)}</div>
  </section>
}

function HowItWorks() {
  const steps = [
    { number: '01', title: 'Find what you need', description: 'Browse practical tools, focused courses, and honest notes from the creator journey.', icon: <Search size={19} /> },
    { number: '02', title: 'Get instant access', description: 'Digital products are ready right after checkout, with setup guides to help you get started.', icon: <Download size={19} /> },
    { number: '03', title: 'Make your next thing', description: 'Use what you learn, keep what works, and build a creative business that feels like yours.', icon: <Sparkles size={19} /> },
  ]
  return <section className="how-section">
    <div className="section-heading"><div><span className="eyebrow-small">SIMPLE BY DESIGN</span><h2>A little inspiration. A lot of forward motion.</h2></div><span className="muted">From curious to creating</span></div>
    <div className="how-grid">{steps.map((step) => <article className="how-card" key={step.number}><div className="how-card-top"><span className="how-icon">{step.icon}</span><span className="how-number">{step.number}</span></div><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
  </section>
}

function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState(0)
  const questions = [
    ['What happens after I buy a digital product?', 'This storefront is a preview, so no order or delivery is actually created. In a live shop, a payment provider would confirm your order and the download link would be emailed to you.'],
    ['Are the newsletter issues really free?', 'Yes. The published issues in the archive are free to read. The signup form is a preview until an email service is connected.'],
    ['Can I use the templates for client work?', 'The templates are designed to support personal and professional projects. Review the license included with a real product before redistributing any source files.'],
    ['Do I need to be an experienced creator?', 'Not at all. The resources are made for independent designers, writers, and makers at different stages, with practical steps instead of assumed expertise.'],
  ]
  return <section className="faq-section">
    <div className="faq-intro"><span className="eyebrow-small">GOOD QUESTIONS</span><h2>Before you dive in.</h2><p>Need something else? <a href="mailto:hello@mayachen.studio">Send Maya a note <ArrowUpRight size={12} /></a></p></div>
    <div className="faq-list">{questions.map(([question, answer], index) => <article className={`faq-item${openQuestion === index ? ' is-open' : ''}`} key={question}><button type="button" aria-expanded={openQuestion === index} onClick={() => setOpenQuestion(openQuestion === index ? -1 : index)}><span>{question}</span><span className="faq-toggle">{openQuestion === index ? '−' : '+'}</span></button>{openQuestion === index && <p>{answer}</p>}</article>)}</div>
  </section>
}

function IssueCard({ issue }) {
  return <a href={`/newsletters/issue-${issue.id}`} className="issue-card">
    <div className="issue-cover"><span>ISSUE #{issue.id}</span><Mail size={14} /><strong>{issue.topic}</strong></div>
    <div className="issue-copy"><div className="issue-meta"><span>Issue #{issue.id}</span><span>◷ {issue.date}</span></div><h3>{issue.title}</h3><p>{issue.summary}</p><span className="read-link">Read Issue <ArrowRight size={12} /></span></div>
  </a>
}

function HomePage() {
  const [category, setCategory] = useState('All')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const filters = ['All', 'E-book', 'Video Course', 'Template']
  const shownProducts = useMemo(() => products.filter((product) => category === 'All' || product.category === category), [category])

  function checkout(slug) { go(`/checkout/${slug}`) }
  function subscribe(event) {
    event.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
  }

  return <><Header /><main className="page-shell">
    <div className="eyebrow-line"><span className="pill pill-purple">New drop</span><span>Trusted by 50k+ readers</span></div>
    <section className="hero-heading"><div><h1>Newsletter archive &amp; digital shop</h1><p>Every issue, template, and course in one place. Free resources up top,<br className="desktop-break" /> premium systems below.</p></div><div className="hero-actions"><a className="button button-light" href="/free-resources"><Gift size={14} /> Free resources</a><a className="button button-dark" href="#subscribe"><Mail size={14} /> Subscribe free</a></div></section>
    <section className="top-grid" id="free-resources">
      <div className="issues-section"><div className="section-heading"><h2>Latest issues</h2><a href="/newsletters">Browse archive <ArrowRight size={12} /></a></div><div className="issue-list">{issues.map((issue) => <IssueCard issue={issue} key={issue.id} />)}</div></div>
      <aside className="stats-card"><span className="stats-eyebrow"><Sparkles size={12} /> CREATOR STATS</span><h2>50,000+ readers</h2><p>100k+ downloads · 4.9 avg rating</p><div className="stats-numbers"><div><strong>52k</strong><span>Readers</span></div><div><strong>100k</strong><span>Sales</span></div><div><strong>42</strong><span>Issues</span></div></div><a className="button button-purple" href="/newsletters">Get all issues free <ArrowRight size={13} /></a></aside>
    </section>
    <section className="products-section" id="products">
      <div className="section-heading product-section-heading"><h2>Digital products</h2><div className="filters" aria-label="Filter products">{filters.map((filter) => <button key={filter} className={category === filter ? 'filter-chip active' : 'filter-chip'} onClick={() => setCategory(filter)}>{filter}</button>)}</div></div>
      {shownProducts.length ? <div className="product-grid">{shownProducts.map((product) => <ProductCard key={product.slug} product={product} onCheckout={checkout} />)}</div> : <p className="empty-state">There are no products in this category yet.</p>}
    </section>
    <CreatorStory />
    <HowItWorks />
    <TestimonialSection />
    <section className="subscribe-banner" id="subscribe"><div className="subscribe-icon"><Mail size={20} /></div><div><span className="eyebrow-small">THE WEEKLY CREATOR NOTE</span><h2>Join 50k+ curious creators</h2><p>One useful idea every Sunday. No spam, ever.</p></div>{subscribed ? <p className="subscribed-message"><Check size={16} /> Preview only — connect an email service to save signups.</p> : <form className="subscribe-form" onSubmit={subscribe}><label className="sr-only" htmlFor="subscriber-email">Email address</label><input id="subscriber-email" type="email" placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required /><button className="button button-purple" type="submit">Subscribe free <ArrowRight size={14} /></button></form>}</section>
    <FAQSection />
    <Footer />
  </main></>
}

function Footer() {
  return <footer className="site-footer"><Brand compact /><span>Made with ♡ in CreatorHub</span><div><a href="/creator/maya-chen">About Maya</a><a href="/free-resources">Free resources</a><a href="/newsletters">Newsletter archive</a><a href="/dashboard">Dashboard preview</a><a href="/login">Creator sign in</a></div><span>© 2026 Maya Chen</span></footer>
}

function ProfilePage() {
  return <><Header active="About" /><main className="profile-shell profile-shell--wide">
    <div className="profile-cover profile-cover--large"><span>✦ CREATOR SPOTLIGHT · INDEPENDENT BY DESIGN</span><div className="cover-orbit" /><div className="cover-orbit cover-orbit-two" /></div>
    <section className="profile-card profile-card--wide"><div className="profile-avatar">MC<span className="profile-verified" aria-label="Verified creator"><Check size={11} /></span></div><div className="profile-heading-copy"><span className="eyebrow-small">DESIGNER · EDUCATOR · CREATOR</span><h1>Maya Chen</h1><p className="muted">@mayacreates · Making the creative business journey feel a little less lonely.</p></div><div className="profile-socials"><a href="mailto:hello@mayachen.studio" aria-label="Email Maya"><Mail size={16} /></a><a href="#featured-products" aria-label="Maya's products"><ShoppingBag size={16} /></a><a href="/newsletters" aria-label="Newsletter archive"><BookOpen size={16} /></a></div></section>
    <section className="profile-intro-grid"><article className="profile-about-card"><span className="eyebrow-small">A LITTLE ABOUT ME</span><h2>Good work should make room for a good life.</h2><p>I’m a product designer who spent years collecting notes, sketches, and small lessons from building things on the internet. Now I turn the useful parts into design systems, honest essays, and friendly tools for other independent creators.</p><p>Here you’ll find what I actually use: practical resources, thoughtful products, and a weekly note about the work behind the work.</p><a className="story-link" href="/newsletters">Read my latest note <ArrowRight size={13} /></a></article><aside className="profile-side-stack"><div className="profile-reader-card"><span className="profile-reader-icon"><Users size={18} /></span><strong>52k+</strong><span>curious readers</span><small>Thanks for being here.</small></div><div className="profile-freebie-card"><span className="pill pill-purple">START HERE · FREE</span><h3>A few helpful things, on me.</h3><p>Grab a UI starter, a portfolio checklist, or a planner from the free resource shelf.</p><a className="button button-purple" href="/free-resources">Explore free resources <ArrowRight size={13} /></a></div></aside></section>
    <section className="profile-products" id="featured-products"><div className="section-heading"><div><span className="eyebrow-small">MADE FOR YOUR NEXT STEP</span><h2>Creator favorites</h2></div><a href="/#products">See the full shop <ArrowRight size={12} /></a></div><div className="product-grid">{products.map((product) => <ProductCard key={product.slug} product={product} onCheckout={(slug) => go(`/checkout/${slug}`)} />)}</div></section>
    <section className="profile-latest"><div className="section-heading"><div><span className="eyebrow-small">THE WEEKLY DISPATCH</span><h2>Recent notes from Maya</h2></div><a href="/newsletters">All issues <ArrowRight size={12} /></a></div><div className="issue-list profile-issue-list">{issues.slice(0, 2).map((issue) => <IssueCard issue={issue} key={issue.id} />)}</div></section>
    <section className="profile-contact"><div><span className="eyebrow-small">HAVE A PROJECT IN MIND?</span><h2>Let’s make your portfolio clearer.</h2><p>Get kind, specific feedback in a one-on-one review.</p></div><a className="button button-dark" href="/services/portfolio-review">Explore portfolio reviews <ArrowUpRight size={14} /></a></section>
    <Footer />
  </main></>
}

function DetailPage({ product, issue }) {
  if (issue) return <><Header active="Newsletter Archive" /><main className="detail-shell"><a className="back-link" href="/newsletters"><ArrowLeft size={14} /> All issues</a><article className="issue-detail"><div className="issue-detail-cover"><span>ISSUE #{issue.id}</span><Mail size={38} /><strong>{issue.topic}</strong></div><span className="pill pill-purple">ISSUE #{issue.id} · {issue.date}</span><h1>{issue.title}</h1><p className="detail-lede">{issue.summary}</p>{issue.sections.map(([heading, paragraph]) => <section className="issue-section" key={heading}><h2>{heading}</h2><p>{paragraph}</p></section>)}<div className="detail-cta"><strong>Enjoyed this issue?</strong><a className="button button-purple" href="/#subscribe">Get the next one free <ArrowRight size={14} /></a></div><div className="issue-pagination">{issues.filter((item) => item.id !== issue.id).map((item) => <a key={item.id} href={`/newsletters/issue-${item.id}`}><span>ISSUE #{item.id}</span><strong>{item.title}</strong><ArrowRight size={14} /></a>)}</div></article><Footer /></main></>
  const relatedProducts = products.filter((item) => item.slug !== product.slug).slice(0, 3)
  return <><Header /><main className="detail-shell"><a className="back-link" href="/#products"><ArrowLeft size={14} /> All products</a><section className="product-detail"><ProductArt type={product.art} large /><div className="product-detail-copy"><span className="pill pill-purple">{product.category}</span><h1>{product.name}</h1><div className="product-meta detail-rating"><span><Star size={14} fill="currentColor" /> {product.rating} ({product.reviews} reviews)</span></div><p>{product.description}</p><h2 className="included-heading">What’s included</h2><ul className="benefit-list">{product.includes.map((item) => <li key={item}><Check size={15} /> {item}</li>)}</ul><div className="purchase-row"><strong>{money(product.price)}</strong><a className="button button-dark" href={`/checkout/${product.slug}`}><LockKeyhole size={14} /> Instant checkout</a></div><p className="secure-note"><ShieldCheck size={14} /> Secure demo checkout · no charge is made</p></div></section><section className="related-section"><div className="section-heading"><h2>More for your creator toolkit</h2><a href="/#products">Browse all products <ArrowRight size={12} /></a></div><div className="product-grid">{relatedProducts.map((item) => <ProductCard key={item.slug} product={item} onCheckout={(slug) => go(`/checkout/${slug}`)} />)}</div></section><Footer /></main></>
}

function CheckoutPage({ product }) {
  const [complete, setComplete] = useState(false)
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  if (complete) return <main className="checkout-shell"><Brand /><section className="checkout-success"><div className="success-icon"><Check size={28} /></div><span className="pill pill-purple">DEMO COMPLETE</span><h1>Your checkout demo is complete</h1><p>No payment was taken and no card details were collected. In a live store, connect a trusted payment provider to deliver your purchase.</p><a className="button button-purple" href={`/products/${product.slug}`}>Back to product <ArrowRight size={14} /></a></section></main>
  return <main className="checkout-shell"><div className="checkout-top"><a className="back-link" href={`/products/${product.slug}`}><ArrowLeft size={14} /> Back to product</a><Brand /></div><div className="checkout-layout"><section className="checkout-form"><span className="eyebrow-small">SECURE CHECKOUT DEMO</span><h1>Complete your order</h1><p className="muted">Preview the checkout flow. This demo does not charge you.</p><form onSubmit={(event) => { event.preventDefault(); setComplete(true) }}><label htmlFor="checkout-email">Email address</label><input id="checkout-email" type="email" placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required /><fieldset className="payment-options"><legend>Payment method preview</legend><label className={paymentMethod === 'card' ? 'payment-option selected' : 'payment-option'}><input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><CreditCard size={17} /> Card <span>•••• 4242 (demo)</span></label><label className={paymentMethod === 'wallet' ? 'payment-option selected' : 'payment-option'}><input type="radio" name="payment" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} /><LockKeyhole size={16} /> Secure wallet <span>Preview</span></label></fieldset><div className="demo-notice"><ShieldCheck size={16} /><span><strong>Demo only</strong><br />No card fields, payment processing, or charge. Connect Stripe or another provider before accepting real payments.</span></div><button className="button button-dark checkout-submit" type="submit">Continue demo — {money(product.price)} <ArrowRight size={15} /></button></form><p className="checkout-privacy"><LockKeyhole size={12} /> Your checkout preview is private.</p></section><aside className="order-summary"><h2>Order summary</h2><div className="summary-product"><div className="summary-art"><ProductArt type={product.art} /></div><div><strong>{product.name}</strong><span>Digital product · instant access</span></div></div><div className="summary-line"><span>Subtotal</span><span>{money(product.price)}</span></div><div className="summary-line"><span>Tax</span><span>Calculated at checkout</span></div><div className="summary-line total"><strong>Total</strong><strong>{money(product.price)}</strong></div><p><ShieldCheck size={14} /> Demo order · no payment collected</p></aside></div><Footer /></main>
}

function AuthPage({ signup }) {
  const [notice, setNotice] = useState('')
  return <main className="auth-page"><section className="auth-art"><Brand /><div className="mock-dashboard"><div className="mock-top"><span className="brand-icon">✦</span><b>mayacreates</b><span className="pill pill-green">+24%</span></div><div className="chart-card"><div><strong>Audience growth</strong><span className="pill pill-purple">Live</span></div><div className="chart-bars">{[20, 26, 29, 42, 32, 54, 46, 61, 58, 76, 52, 94].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="chart-stats"><span><b>52k</b>Readers</span><span><b>$8.2k</b>Sales</span><span><b>100k</b>Downloads</span></div></div><h1>{signup ? 'Claim your link. Own your audience.' : 'Manage Your Links, Newsletter & Digital Sales'}</h1><p>Your hub for everything you make — all in one place.</p><span className="reader-note">👩🏽‍🤝‍👩🏼 Loved by 50,000+ creators worldwide</span></div></section><section className="auth-form-wrap"><a className="back-link" href="/"><ArrowLeft size={14} /> Back to store</a><div className="auth-card"><span className="auth-logo">C</span><h2>{signup ? 'Claim Your Creator Link' : 'Welcome Back, Creator'}</h2><p>{signup ? 'Your home for links, newsletter & digital products.' : 'Sign in to access your hub analytics and subscribers.'}</p><form onSubmit={(event) => { event.preventDefault(); setNotice('This preview form is ready to connect to your account service.') }}>{signup && <><label htmlFor="handle">Choose your handle</label><div className="handle-input"><span>creatorhub.com/</span><input id="handle" defaultValue="mayacreates" required /><Check size={15} /></div><label htmlFor="name">Full name</label><input id="name" placeholder="Maya Chen" autoComplete="name" required /></>}<label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" placeholder="you@email.com" autoComplete="email" required />{signup && <><label htmlFor="auth-password">Create password</label><input id="auth-password" type="password" placeholder="At least 8 characters" minLength="8" required /><div className="password-meter"><i /><i /><i /><i /></div><span className="hint">Strong password — nice!</span></>}<button className="button button-purple auth-submit" type="submit">{signup ? 'Create My Hub' : 'Sign In to Dashboard'} <ArrowRight size={14} /></button></form>{notice && <p className="inline-notice" role="status">{notice}</p>}<div className="auth-divider">or continue with</div><div className="auth-social"><button onClick={() => setNotice('Google sign-in is not configured in this preview.')}>◎ &nbsp; Google</button><button onClick={() => setNotice('Apple sign-in is not configured in this preview.')}>● &nbsp; Apple</button></div><p className="auth-switch">{signup ? 'Already registered? ' : 'Don’t have an account? '}<a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Sign up'}</a></p></div><span className="auth-footnote"><ShieldCheck size={13} /> Your information stays private and secure.</span></section></main>
}

function DashboardPage() {
  const activity = [
    { icon: <Mail size={15} />, title: 'Weekly dispatch sent', detail: 'The $10k Solo Creator Stack', time: 'Today · 9:15 AM', tone: 'activity-purple' },
    { icon: <ShoppingBag size={15} />, title: 'New product download', detail: 'Ultimate Figma System', time: 'Yesterday · 4:32 PM', tone: 'activity-mint' },
    { icon: <Users size={15} />, title: 'New reader joined', detail: 'alex.rivera@email.com', time: 'Yesterday · 11:08 AM', tone: 'activity-peach' },
  ]
  return <><Header /><main className="dashboard-shell">
    <div className="dashboard-welcome"><div><span className="pill pill-purple">CREATOR DASHBOARD PREVIEW</span><h1>Good morning, Maya ✨</h1><p>A quick look at your creator hub. Sample data shown for this preview.</p></div><a className="button button-purple" href="/creator/maya-chen">View my public page <ArrowUpRight size={14} /></a></div>
    <div className="dashboard-stats">{[['52,418', 'Total readers', '+12.4% this month'], ['$8,240', 'Product revenue', '+8.2% this month'], ['100,284', 'Downloads', '+18.1% this month'], ['42', 'Issues sent', 'Your archive']].map(([value, label, trend]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{trend}</small></article>)}</div>
    <section className="dashboard-overview-grid">
      <article className="dashboard-panel audience-panel"><div className="section-heading"><div><span className="eyebrow-small">LAST 7 DAYS</span><h2>Audience growth</h2></div><span className="dashboard-change"><ArrowUpRight size={13} /> 12.4%</span></div><div className="audience-total"><strong>52,418</strong><span>readers</span></div><div className="audience-chart" role="img" aria-label="Sample audience chart showing steady weekly growth">{[['Mon', 35], ['Tue', 47], ['Wed', 42], ['Thu', 58], ['Fri', 52], ['Sat', 75], ['Sun', 91]].map(([day, height]) => <div className="audience-bar-column" key={day}><span style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div><p className="dashboard-sample-note">Illustrative sample activity · connect your newsletter service for live data.</p></article>
      <article className="dashboard-panel activity-panel"><div className="section-heading"><h2>Recent activity</h2><span className="muted">Preview</span></div><div className="activity-list">{activity.map((item) => <div className="activity-row" key={item.title}><span className={`activity-icon ${item.tone}`}>{item.icon}</span><span className="activity-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><time>{item.time}</time></div>)}</div><a className="dashboard-text-link" href="/newsletters">Explore newsletter archive <ArrowRight size={12} /></a></article>
    </section>
    <section className="dashboard-panel"><div className="section-heading"><div><span className="eyebrow-small">YOUR CREATOR HUB</span><h2>Quick links</h2></div></div><div className="quick-links"><a href="/#products"><ShoppingBag size={18} /> Manage products <ArrowRight size={14} /></a><a href="/newsletters"><Mail size={18} /> Newsletter archive <ArrowRight size={14} /></a><a href="/creator/maya-chen"><LayoutDashboard size={18} /> Public profile <ArrowRight size={14} /></a><a href="/free-resources"><Gift size={18} /> Free resources <ArrowRight size={14} /></a></div></section>
    <Footer />
  </main></>
}

function FreeResourcesPage() {
  const categories = ['All', ...new Set(freeResources.map((resource) => resource.category))]
  const [category, setCategory] = useState('All')
  const visibleResources = freeResources.filter((resource) => category === 'All' || resource.category === category)
  return <><Header active="Free Resources" /><main className="detail-shell resource-page">
    <section className="resource-hero">
      <div className="resource-hero-copy"><span className="pill pill-purple"><Gift size={12} /> OPEN SHELF · ALWAYS FREE</span><h1>Useful things for your next creative step.</h1><p>Small, practical resources to help you design, plan, and share your work. Pick one and put it to use today.</p><div className="resource-hero-actions"><a className="button button-purple" href="#resource-library">Explore the library <ArrowDown size={14} /></a><a className="button button-light" href="/newsletters">Read the weekly notes <ArrowRight size={14} /></a></div></div>
      <div className="resource-hero-art" aria-hidden="true"><div className="resource-paper paper-back"><span>MAKE SPACE<br />FOR GOOD WORK</span></div><div className="resource-paper paper-front"><span className="paper-star">✳</span><strong>FREE<br />TOOLS FOR<br />CREATORS</strong><small>BY MAYA CHEN</small></div><div className="resource-stamp"><Gift size={18} /><span>TAKE<br />WHAT HELPS</span></div></div>
    </section>
    <div className="resource-proof"><span><Check size={15} /> Made to be useful, not complicated</span><span><Download size={15} /> No purchase or account required</span><span><Sparkles size={15} /> New notes added regularly</span></div>
    <section className="resource-library" id="resource-library"><div className="section-heading resource-heading"><div><span className="eyebrow-small">THE FREE RESOURCE LIBRARY</span><h2>Start with what you need.</h2><p>Short guides, checklists, and starting points for real creative work.</p></div><span className="resource-count">{visibleResources.length} free resources</span></div>
      <div className="resource-filters" aria-label="Filter free resources">{categories.map((item) => <button key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="resource-grid">{visibleResources.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}</div>
    </section>
    <section className="resource-guide"><div className="guide-icon"><BookOpen size={22} /></div><div><span className="eyebrow-small">NOT SURE WHERE TO BEGIN?</span><h2>Give yourself ten focused minutes.</h2><p>Pick the checklist closest to the problem in front of you. Save one useful idea, try it on a real project, and come back when you’re ready for the next step.</p><a className="story-link" href="/services/portfolio-review">Want personal feedback? Meet with Maya <ArrowRight size={13} /></a></div></section>
    <section className="resource-bottom-cta"><div><span className="pill pill-purple">A GOOD NOTE, ONCE A WEEK</span><h2>Make room for ideas that move you forward.</h2><p>Read the free archive or join the weekly email preview.</p></div><div><a className="button button-light" href="/newsletters">Browse the archive</a><a className="button button-purple" href="/#subscribe">Join the newsletter <ArrowRight size={14} /></a></div></section>
    <Footer />
  </main></>
}

function ResourceDetailPage({ resource }) {
  const [checked, setChecked] = useState([])
  const completed = checked.length
  function toggleItem(item) {
    setChecked((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item])
  }
  return <><Header active="Free Resources" /><main className="detail-shell resource-detail-page">
    <a className="back-link" href="/free-resources"><ArrowLeft size={14} /> All free resources</a>
    <section className="resource-detail-hero"><div className={`resource-detail-art ${resource.color}`}><span>{resource.icon}</span><small>{resource.format}</small><strong>{resource.title}</strong><i>CREATORHUB · FREE</i></div><div className="resource-detail-intro"><span className="pill pill-purple">{resource.category} · FREE RESOURCE</span><h1>{resource.title}</h1><p>{resource.description}</p><div className="resource-detail-meta"><span><BookOpen size={14} /> {resource.time}</span><span><Check size={14} /> Free · No account needed</span></div><a className="button button-purple" href="#resource-content">Open this resource <ArrowDown size={14} /></a></div></section>
    <section className="resource-content-grid" id="resource-content"><article className="resource-instructions"><span className="eyebrow-small">A SMALL GUIDE FROM MAYA</span><h2>Use what helps. Leave the rest.</h2><p>There’s no perfect system. This resource is a starting point: make a copy for your own work, adapt it to your needs, and keep it simple enough to use again.</p>{resource.content.map(([heading, paragraph], index) => <section className="resource-lesson" key={heading}><span className="lesson-number">0{index + 1}</span><div><h3>{heading}</h3><p>{paragraph}</p></div></section>)}</article><aside className="resource-checklist"><div className="checklist-heading"><span className={`resource-check-icon ${resource.color}`}>{resource.icon}</span><div><strong>Inside this resource</strong><small>{completed} of {resource.includes.length} reviewed</small></div></div><div className="checklist-progress"><span style={{ width: `${completed / resource.includes.length * 100}%` }} /></div>{resource.includes.map((item) => <label className="checklist-item" key={item}><input type="checkbox" checked={checked.includes(item)} onChange={() => toggleItem(item)} /><span className="checkmark"><Check size={12} /></span><span>{item}</span></label>)}<a className="button button-dark checklist-next" href="/free-resources">Choose another free resource <ArrowRight size={13} /></a></aside></section>
    <section className="resource-next"><div><span className="eyebrow-small">KEEP THE MOMENTUM</span><h2>One more useful thing?</h2><p>Explore the full shelf or read an issue from Maya’s weekly dispatch.</p></div><div><a className="button button-light" href="/free-resources">More free resources</a><a className="button button-purple" href="/newsletters">Newsletter archive <ArrowRight size={13} /></a></div></section>
    <Footer />
  </main></>
}

function NewslettersPage() {
  return <><Header active="Newsletter Archive" /><main className="detail-shell archive-page">
    <section className="archive-hero"><div><span className="pill pill-purple"><Mail size={12} /> MAYA’S WEEKLY DISPATCH</span><h1>Good ideas for the work you want to make.</h1><p>Notes on design, creative business, and building a more independent working life. Read a few favorites from the archive.</p><div className="archive-hero-actions"><a className="button button-purple" href="/#subscribe">Get the next issue <ArrowRight size={14} /></a><a className="button button-light" href="/free-resources">Explore free resources <Gift size={13} /></a></div></div><div className="archive-hero-stat"><span className="archive-mail-icon"><Mail size={20} /></span><strong>One useful note.</strong><span>Every Sunday morning.</span><div className="archive-stat-rule" /><small>Always free · always skimmable</small></div></section>
    <div className="archive-layout"><section className="archive-main"><div className="section-heading"><div><span className="eyebrow-small">FROM THE ARCHIVE</span><h2>Start with these issues</h2></div><span className="resource-count">{issues.length} featured issues</span></div><div className="issue-list issue-list-all">{issues.map((issue) => <IssueCard issue={issue} key={issue.id} />)}</div><section className="archive-note"><span className="archive-note-icon"><Sparkles size={17} /></span><div><strong>Notes for the long game</strong><p>Honest experiments, helpful details, and reminders that your work can grow at a human pace.</p></div></section></section><aside className="archive-sidebar"><div className="archive-sidebar-card"><span className="eyebrow-small">IN THIS NEWSLETTER</span><h3>Ideas you can use before lunch.</h3><ul><li><Check size={13} /> Clear creative systems</li><li><Check size={13} /> Thoughtful product and business notes</li><li><Check size={13} /> No spam. Unsubscribe any time.</li></ul><a href="/#subscribe" className="button button-dark">Join 50k+ readers <ArrowRight size={13} /></a></div><a className="archive-resource-link" href="/free-resources"><Gift size={17} /><span><strong>Need a practical starting point?</strong><small>Browse Maya’s free resource shelf.</small></span><ArrowUpRight size={14} /></a><a className="archive-resource-link" href="/creator/maya-chen"><span className="archive-mini-avatar">MC</span><span><strong>Meet Maya Chen</strong><small>Designer, educator, and creator.</small></span><ArrowUpRight size={14} /></a></aside></div>
    <Footer />
  </main></>
}

function SearchPage({ query }) {
  const normalizedQuery = query.trim().toLowerCase()
  const matchingProducts = products.filter((product) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(normalizedQuery))
  const matchingIssues = issues.filter((issue) => `${issue.title} ${issue.summary} ${issue.topic}`.toLowerCase().includes(normalizedQuery))
  return <><Header /><main className="detail-shell"><div className="newsletter-hero search-hero"><span className="pill pill-purple">CREATORHUB SEARCH</span><h1>{normalizedQuery ? `Results for “${query}”` : 'Search the shop and archive'}</h1><p>Find a creator resource, digital product, or newsletter issue.</p><form className="search-page-form" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get('q'); go(`/search?q=${encodeURIComponent(String(value || ''))}`) }}><label className="sr-only" htmlFor="site-search">Search products and issues</label><Search size={16} /><input id="site-search" name="q" defaultValue={query} placeholder="Try “Figma”, “newsletter”, or “pricing”" /><button className="button button-purple" type="submit">Search</button></form></div>{normalizedQuery ? <><section className="search-results-section"><div className="section-heading"><h2>Products ({matchingProducts.length})</h2></div>{matchingProducts.length ? <div className="product-grid">{matchingProducts.map((product) => <ProductCard key={product.slug} product={product} onCheckout={(slug) => go(`/checkout/${slug}`)} />)}</div> : <p className="empty-state">No products matched your search.</p>}</section><section className="search-results-section"><div className="section-heading"><h2>Newsletter issues ({matchingIssues.length})</h2></div>{matchingIssues.length ? <div className="issue-list">{matchingIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}</div> : <p className="empty-state">No newsletter issues matched your search.</p>}</section></> : <div className="search-suggestions"><a href="/#products"><ShoppingBag size={18} /><span><strong>Browse digital products</strong><small>Templates, courses, and ebooks</small></span><ArrowRight size={15} /></a><a href="/newsletters"><BookOpen size={18} /><span><strong>Browse newsletter issues</strong><small>Practical ideas for independent creators</small></span><ArrowRight size={15} /></a></div>}<Footer /></main></>
}

function PortfolioReviewPage() {
  const [submitted, setSubmitted] = useState(false)
  return <><Header active="About" /><main className="detail-shell"><a className="back-link" href="/creator/maya-chen"><ArrowLeft size={14} /> Maya’s profile</a><section className="service-hero"><span className="pill pill-purple">1:1 CREATOR SESSION</span><h1>Make your portfolio work harder.</h1><p>Get thoughtful, specific feedback on your portfolio from an independent designer and educator.</p><div className="service-price"><strong>$120</strong><span> · 45-minute video review</span></div></section><section className="service-content"><div className="service-benefits"><h2>What we’ll work on</h2><ul className="benefit-list"><li><Check size={15} /> A clear story and stronger first impression</li><li><Check size={15} /> Case studies that explain your process</li><li><Check size={15} /> Practical next steps tailored to your goals</li></ul><div className="service-note"><ShieldCheck size={16} /><p><strong>Personal feedback, not a template.</strong><br />Bring a live portfolio or a work-in-progress. You’ll leave with prioritized notes you can use right away.</p></div></div><form className="service-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}><h2>Request a session</h2><p>This is a booking preview; no appointment is sent or charged.</p><label htmlFor="review-name">Your name</label><input id="review-name" name="name" autoComplete="name" required placeholder="Maya Chen" /><label htmlFor="review-email">Email address</label><input id="review-email" type="email" name="email" autoComplete="email" required placeholder="you@email.com" /><label htmlFor="review-goal">What would you like feedback on?</label><textarea id="review-goal" name="goal" rows="3" placeholder="Share a little about your portfolio and goals." required /><button className="button button-purple" type="submit">{submitted ? 'Preview request saved' : 'Preview booking request'} <ArrowRight size={14} /></button>{submitted && <p className="inline-notice" role="status">Your request preview is ready. Connect a booking service to confirm a real session.</p>}</form></section><Footer /></main></>
}

function NotFoundPage() {
  return <main className="not-found"><Brand /><div><CircleHelp size={32} /><h1>We couldn't find that page</h1><p>The link may have moved. Browse the shop to find what you need.</p><a className="button button-purple" href="/">Back to CreatorHub <ArrowRight size={14} /></a></div></main>
}

function App() {
  const [path, setPath] = useState(`${window.location.pathname}${window.location.search}`)
  useEffect(() => {
    const handleClick = (event) => {
      if (!(event.target instanceof Element) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target.closest('a[href^="/"]')
      if (!link || link.target === '_blank') return
      const destination = new URL(link.href, window.location.href)
      if (destination.origin !== window.location.origin) return
      event.preventDefault()
      const currentPath = window.location.pathname
      window.history.pushState({}, '', `${destination.pathname}${destination.search}${destination.hash}`)
      setPath(`${destination.pathname}${destination.search}`)
      if (currentPath === destination.pathname) {
        if (destination.hash) {
          requestAnimationFrame(() => document.querySelector(destination.hash)?.scrollIntoView({ behavior: 'smooth' }))
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    }
    const handlePopState = () => setPath(`${window.location.pathname}${window.location.search}`)
    document.addEventListener('click', handleClick)
    window.addEventListener('popstate', handlePopState)
    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])
  useEffect(() => {
    if (!window.location.hash) return
    requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' }))
  }, [path])
  const routePath = path.split('?')[0]
  const query = new URLSearchParams(path.split('?')[1] || '').get('q') || ''
  const resource = routePath.startsWith('/free-resources/') ? freeResources.find((item) => item.slug === routePath.split('/').pop()) : null
  const product = products.find((item) => routePath === `/products/${item.slug}` || routePath === `/checkout/${item.slug}`)
  const issueMatch = routePath.match(/^\/newsletters\/issue-(\d+)$/)
  const issue = issueMatch ? issues.find((item) => item.id === Number(issueMatch[1])) : null
  let page
  if (routePath === '/') page = <HomePage />
  else if (routePath === '/creator/maya-chen') page = <ProfilePage />
  else if (routePath === '/login') page = <AuthPage signup={false} />
  else if (routePath === '/signup') page = <AuthPage signup />
  else if (routePath === '/dashboard') page = <DashboardPage />
  else if (routePath === '/free-resources') page = <FreeResourcesPage />
  else if (routePath === '/newsletters') page = <NewslettersPage />
  else if (routePath.startsWith('/free-resources/')) page = resource ? <ResourceDetailPage resource={resource} /> : <NotFoundPage />
  else if (routePath === '/search') page = <SearchPage query={query} />
  else if (routePath === '/services/portfolio-review') page = <PortfolioReviewPage />
  else if (product && routePath.startsWith('/checkout/')) page = <CheckoutPage product={product} />
  else if (product) page = <DetailPage product={product} />
  else if (issue) page = <DetailPage issue={issue} />
  else page = <NotFoundPage />

  const pageTitles = {
    '/': 'CreatorHub — Maya Chen’s digital shop',
    '/creator/maya-chen': 'Maya Chen — CreatorHub',
    '/login': 'Sign in — CreatorHub',
    '/signup': 'Create your hub — CreatorHub',
    '/dashboard': 'Creator dashboard — CreatorHub',
    '/free-resources': 'Free resources — CreatorHub',
    '/newsletters': 'Newsletter archive — CreatorHub',
    '/search': 'Search — CreatorHub',
    '/services/portfolio-review': 'Portfolio review — CreatorHub',
  }
  const title = pageTitles[routePath] || (resource ? `${resource.title} — Free resources | CreatorHub` : product ? `${product.name} — CreatorHub` : issue ? `${issue.title} — CreatorHub` : 'CreatorHub')
  useEffect(() => {
    document.title = title
  }, [title])
  return page
}

export default App
