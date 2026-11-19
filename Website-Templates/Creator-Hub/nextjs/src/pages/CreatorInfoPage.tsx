"use client";

import { useEffect, useState } from 'react'
import { ArrowRight, BadgeCheck, BookOpen, Check, ChevronRight, CircleHelp, Compass, Sparkles } from 'lucide-react'
import CreatorHubFooter from '../components/CreatorHubFooter'
import CreatorHubHeader from '../components/CreatorHubHeader'
import { apiRequest } from '../services/api'
import { resourceArticles } from '../content/creatorPageContent'
import type { ResourceArticle } from '../content/creatorPageContent'

type CreatorInfoPageKey = 'features' | 'creators' | 'resources' | 'article' | 'about' | 'help' | 'terms' | 'privacy'
type Creator = { handle: string; displayName: string; tagline?: string; bio?: string; avatarUrl?: string }
type PageCopy = { eyebrow: string; title: string; description: string }

const pageCopy: Record<Exclude<CreatorInfoPageKey, 'article'>, PageCopy> = {
  features: { eyebrow: 'A SMALLER, SIMPLER CREATOR STACK', title: 'Everything your audience needs, in one thoughtful place.', description: 'Bring your links, published work, email sign-up and digital products together. Start with the essentials and shape your page as your work grows.' },
  creators: { eyebrow: 'CREATOR DIRECTORY', title: 'Discover the people behind the work.', description: 'Browse published creator pages, see how a focused hub can look, and follow the links that matter to you.' },
  resources: { eyebrow: 'THE CREATOR PLAYBOOK', title: 'Practical ideas for building your creator business.', description: 'Field notes on publishing, audience building, product launches and making your online home easier to navigate.' },
  about: { eyebrow: 'ABOUT CREATORHUB', title: 'A calmer home for creative work.', description: 'CreatorHub brings the pieces of a creator’s online presence together without asking them to build a complicated stack first.' },
  help: { eyebrow: 'HELP CENTER', title: 'Find an answer and get moving.', description: 'Quick guidance for setting up a profile, publishing content, managing products and understanding checkout.' },
  terms: { eyebrow: 'TERMS OF SERVICE · DRAFT', title: 'Clear expectations for using CreatorHub.', description: 'This starter document describes the intended service relationship. It is not legal advice and must be reviewed and completed before launch.' },
  privacy: { eyebrow: 'PRIVACY · DRAFT', title: 'Understand what information the service uses.', description: 'This draft summarizes the data handled by the Creator Hub application. Replace it with a reviewed policy that reflects your actual deployment.' },
}

const featureCards = [
  ['One clear profile', 'Introduce your work, tell visitors what you do and keep your most useful destinations together.'],
  ['Content that stays organized', 'Publish links to articles, videos, podcasts and other work from one creator workspace.'],
  ['An audience you can reach', 'Collect newsletter sign-ups on your public page and review them in your audience dashboard.'],
  ['A simple digital storefront', 'List a digital product, explain what it includes and connect checkout through Paystack.'],
  ['Useful creator controls', 'Choose what is public, update your profile and manage drafts without editing code.'],
  ['A workspace with room to grow', 'Review content, products, subscribers and payment records in dedicated dashboard sections.'],
]

const helpQuestions = [
  ['How do I create my public page?', 'Create a creator account, choose an available handle, then update your name, bio, links and visibility from the creator dashboard. A page is public only when you enable its visibility setting.'],
  ['How do I publish content?', 'Open Content in your dashboard, add a title and type, include an optional description and external URL, then use Publish when the item is ready to appear on your page.'],
  ['How do digital product payments work?', 'The connected Next.js edition sends checkout requests to the Express API. The server initializes and verifies Paystack transactions before showing the configured delivery link. A real Paystack account and server-side credentials are required.'],
  ['Why is checkout unavailable?', 'The platform administrator must configure a Paystack secret key and currency. Creator Pro also needs a monthly Paystack plan code whose amount and currency match the backend settings.'],
  ['Can I change my creator handle?', 'Handles are chosen when an account is created. This version does not provide a handle-change workflow; contact the platform operator before making public links part of a campaign.'],
  ['What is the Vite version for?', 'The Vite edition is a visual preview of the public CreatorHub experience. Registration, dashboards, public creator data and Paystack checkout are connected in the Next.js edition.'],
]

const legalText: Record<'terms' | 'privacy', [string, string][]> = {
  terms: [
    ['1. The service', 'CreatorHub provides profile pages and tools for creators to publish links and content, collect newsletter subscriptions, and offer digital products. The service may change as features are added, removed or improved.'],
    ['2. Accounts and access', 'Keep account credentials private and provide accurate registration details. Account owners are responsible for activity under their accounts and must notify the service operator if they suspect unauthorized access.'],
    ['3. Creator content', 'Creators remain responsible for their content, permissions, claims, pricing, product files and customer communications. Do not publish unlawful, infringing, deceptive or harmful material.'],
    ['4. Payments and products', 'Checkout is processed by Paystack when configured. Payment processing, settlement timing, taxes, refunds and chargebacks are subject to the applicable provider and seller terms. Creators must state product details and delivery terms clearly.'],
    ['5. Availability and termination', 'The operator may suspend access to address abuse, legal obligations or security risks. No uptime, revenue or uninterrupted availability guarantee is made by this draft.'],
    ['6. Contact and governing terms', 'Before launch, insert the operator’s legal name, contact address, governing law, dispute process, cancellation rules and any consumer disclosures required in each market.'],
  ],
  privacy: [
    ['Information collected', 'The application may process account name, email address, password hash, creator profile details, published links, newsletter subscriber email addresses and payment status/transaction references. Card details are handled by Paystack and should not be stored by CreatorHub.'],
    ['How information is used', 'Information is used to authenticate accounts, publish creator pages, operate dashboard features, manage newsletter lists, support checkout verification and maintain platform security.'],
    ['Cookies and sessions', 'The connected website uses an HTTP-only session cookie to keep signed-in users authenticated. Configure secure cookies and HTTPS in production; the Vite preview does not use this Express session.'],
    ['Service providers and sharing', 'MongoDB hosts application records and Paystack processes payment transactions when enabled. Configure the production vendors, regions, retention terms and subprocessors accurately before publishing this policy.'],
    ['Retention and choices', 'Set and publish specific retention periods, data access/deletion request procedures, marketing consent and unsubscribe controls, and a privacy contact before accepting real users.'],
    ['Security and updates', 'Use least-privilege access, secret management, backups and HTTPS. No website can promise perfect security. This draft must be adapted to the deployed service and applicable privacy law.'],
  ],
}

export default function CreatorInfoPage({ page, slug }: { page: CreatorInfoPageKey; slug?: string }) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [directoryError, setDirectoryError] = useState('')
  const [directoryLoading, setDirectoryLoading] = useState(false)
  const article = resourceArticles.find((item) => item.slug === slug)

  useEffect(() => {
    if (page !== 'creators') return
    setDirectoryLoading(true)
    apiRequest<{ creators: Creator[] }>('/creators/directory')
      .then(({ creators: publishedCreators }) => setCreators(publishedCreators))
      .catch((error: unknown) => setDirectoryError(error instanceof Error ? error.message : 'Unable to load public creator pages.'))
      .finally(() => setDirectoryLoading(false))
  }, [page])

  const copy: PageCopy = page === 'article' && article
    ? { eyebrow: article.category, title: article.title, description: article.summary }
    : pageCopy[page === 'article' ? 'resources' : page]

  return (
    <div className="creator-hub">
      <CreatorHubHeader />
      <main className="creator-info-page">
        <PageHeader copy={copy} />
        {page === 'features' && <FeaturesContent />}
        {page === 'creators' && <CreatorsContent creators={creators} loading={directoryLoading} error={directoryError} />}
        {page === 'resources' && <ResourcesContent />}
        {page === 'article' && (article ? <ArticleContent article={article} /> : <NotFoundArticle />)}
        {page === 'about' && <AboutContent />}
        {page === 'help' && <HelpContent />}
        {(page === 'terms' || page === 'privacy') && <LegalContent page={page} sections={legalText[page]} />}
      </main>
      <CreatorHubFooter />
    </div>
  )
}

function PageHeader({ copy }: { copy: PageCopy }) {
  return <header className="creator-info-hero">
    <span className="creator-eyebrow">{copy.eyebrow}</span>
    <h1>{copy.title}</h1>
    <p>{copy.description}</p>
    <div className="creator-info-hero-actions"><a className="creator-button creator-button-primary" href="/signup">Create your free hub <ArrowRight size={15} /></a><a className="creator-info-text-link" href="/help">Questions? Visit the help center <ChevronRight size={14} /></a></div>
  </header>
}

function FeaturesContent() {
  return <>
    <section className="creator-info-section"><div className="creator-info-grid">{featureCards.map(([title, description], index) => <article className="creator-info-card" key={title}><span className="creator-info-card-number">0{index + 1}</span><h2>{title}</h2><p>{description}</p></article>)}</div></section>
    <section className="creator-info-band"><span className="creator-eyebrow">A SIMPLE WORKFLOW</span><h2>Start with your page. Add the rest when you need it.</h2><div className="creator-info-steps">{[['01', 'Set up your profile', 'Choose your creator handle and tell visitors what you make.'], ['02', 'Bring your work together', 'Add links and publish your latest content in one place.'], ['03', 'Grow your audience', 'Invite visitors to subscribe and explore the products you offer.']].map(([number, title, copy]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  </>
}

function CreatorsContent({ creators, loading, error }: { creators: Creator[]; loading: boolean; error: string }) {
  return <section className="creator-info-section">
    <div className="creator-info-section-heading"><div><span className="creator-eyebrow">PUBLISHED CREATOR PAGES</span><h2>Creator pages</h2></div><p>These profiles are currently public.</p></div>
    {loading && <p className="creator-info-note" role="status">Loading public creator pages…</p>}
    {error && <p className="creator-info-error" role="alert">{error}</p>}
    {!loading && !error && !creators.length && <div className="creator-info-empty"><Compass size={22} /><h3>No public creator pages yet</h3><p>Be the first to publish a creator profile.</p><a className="creator-button creator-button-primary" href="/signup">Create a profile <ArrowRight size={14} /></a></div>}
    {!error && creators.length > 0 && <div className="creator-directory-grid">{creators.map((creator) => <a className="creator-directory-card" href={`/${creator.handle}`} key={creator.handle}><img src={creator.avatarUrl || '/creatorhub-logo.svg'} alt="" /><span><small>{creator.tagline || 'CREATOR'}</small><strong>{creator.displayName}</strong><em>@{creator.handle}</em><p>{creator.bio}</p><b>View creator page <ArrowRight size={13} /></b></span></a>)}</div>}
  </section>
}

function ResourcesContent() {
  return <section className="creator-info-section">
    <div className="creator-info-section-heading"><div><span className="creator-eyebrow">GUIDES & FIELD NOTES</span><h2>Learn by doing</h2></div><p>Short, practical reads for the work behind a sustainable creator business.</p></div>
    <div className="creator-resource-grid">{resourceArticles.map((article) => <a className="creator-resource-card" href={`/resources/${article.slug}`} key={article.slug}><span className="creator-resource-meta"><BookOpen size={14} /> {article.category} <span>{article.readTime}</span></span><h2>{article.title}</h2><p>{article.summary}</p><b>Read the guide <ArrowRight size={14} /></b></a>)}</div>
  </section>
}

function ArticleContent({ article }: { article: ResourceArticle }) {
  return <article className="creator-article-body">
    <div className="creator-article-callout"><Sparkles size={17} /><p>{article.takeaway}</p></div>
    {article.sections.map(([title, paragraphs]) => <section key={title}><h2>{title}</h2>{paragraphs.map((text) => <p key={text}>{text}</p>)}</section>)}
    <a className="creator-button creator-button-outline" href="/resources">Back to all resources <ArrowRight size={14} /></a>
  </article>
}

function NotFoundArticle() {
  return <section className="creator-info-section creator-info-empty"><BookOpen size={22} /><h2>That guide is not available</h2><p>Choose an article from the resource library.</p><a className="creator-button creator-button-primary" href="/resources">Browse resources <ArrowRight size={14} /></a></section>
}

function AboutContent() {
  return <section className="creator-info-section creator-about-content">
    <article className="creator-about-story"><span className="creator-eyebrow">WHY WE’RE BUILDING THIS</span><h2>Your best work deserves a home that feels like yours.</h2><p>Creators often spread their identity, latest work, audience sign-up and products across separate tools. CreatorHub is designed to bring those essentials into one clear, personal page and one manageable workspace.</p><p>The goal is not to add another complicated system. It is to give visitors a useful path through what you make, while giving creators a straightforward place to keep it current.</p></article>
    <div className="creator-about-values">{[['Clarity first', 'Pages should be easy to scan, understand and update.'], ['Creator ownership', 'Keep your voice, your content and your relationship with your audience at the center.'], ['Practical tools', 'Start with links and publishing; add storefront and payments when they fit your work.']].map(([title, description]) => <article key={title}><BadgeCheck size={18} /><h3>{title}</h3><p>{description}</p></article>)}</div>
  </section>
}

function HelpContent() {
  return <section className="creator-info-section">
    <div className="creator-info-section-heading"><div><span className="creator-eyebrow">COMMON QUESTIONS</span><h2>Getting started and using your hub</h2></div><p>Answers for creators and visitors. More operational details are in the buyer guide.</p></div>
    <div className="creator-faq-list">{helpQuestions.map(([question, answer]) => <details key={question}><summary><span><CircleHelp size={16} />{question}</span><ChevronRight size={16} /></summary><p>{answer}</p></details>)}</div>
    <p className="creator-info-note">Need help with a deployment? Ask the person who operates your CreatorHub instance for its support contact and service status.</p>
  </section>
}

function LegalContent({ page, sections }: { page: 'terms' | 'privacy'; sections: [string, string][] }) {
  return <section className="creator-article-body creator-legal-body">
    <div className="creator-article-callout"><Check size={17} /><p>Draft content for product setup only. Replace business details and obtain qualified legal review before publishing or accepting real users.</p></div>
    {sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
    <p className="creator-info-note">Last updated: add the date this policy is approved. Policy owner: add the legal name and contact details for the service operator.</p>
    <a className="creator-info-text-link" href={page === 'terms' ? '/privacy' : '/terms'}>Read the {page === 'terms' ? 'privacy draft' : 'terms draft'} <ArrowRight size={14} /></a>
  </section>
}
