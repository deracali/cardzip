import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, ShoppingBag } from 'lucide-react'
import CreatorHubFooter from '../components/CreatorHubFooter'
import CreatorHubHeader from '../components/CreatorHubHeader'
import { featuredCreators, resourceArticles } from './creatorPageContent'
import '../components/CreatorPages.css'

const demoProducts = [
  { title: 'The Creative Brief Kit', description: 'A practical set of templates for organizing a new project.', creator: 'maya-chen', price: 'USD 18.00' },
  { title: 'Field Notes Preset Pack', description: 'A curated set of photo presets and a short editing guide.', creator: 'alex-rivera', price: 'USD 24.00' },
  { title: 'A Month of Writing Prompts', description: 'Thirty thoughtful prompts to build a steady writing habit.', creator: 'nina-patel', price: 'USD 12.00' },
  { title: 'Studio Starter Samples', description: 'A small sample collection and production notes for your next track.', creator: 'sam-okafor', price: 'USD 16.00' },
]

export default function SiteContentPage({ page, slug }) {
  const article = resourceArticles.find((item) => item.slug === slug)
  const title = page === 'blog' || page === 'article' ? article?.title || 'Creator stories & field notes' : page === 'explore' ? 'Explore CreatorHub' : 'The CreatorHub storefront'
  const description = page === 'article' && article ? article.summary : page === 'explore'
    ? 'A hand-picked collection of creators and useful places to discover.'
    : page === 'store' ? 'A preview of creator-made digital goods and storefronts.' : 'Ideas, practical advice and stories from the CreatorHub community.'

  return <div className="creator-hub">
    <CreatorHubHeader />
    <main className="creator-site-page">
      <header className="creator-site-hero">
        <span className="creator-eyebrow">{page === 'explore' ? 'DISCOVER SOMETHING NEW' : page === 'store' ? 'CREATOR-MADE DIGITAL GOODS' : 'THE CREATOR PLAYBOOK'}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <a className="creator-site-back" href={page === 'article' ? '/blog' : '/'}><ArrowLeft size={14} /> {page === 'article' ? 'All stories' : 'Back to CreatorHub'}</a>
        <p className="creator-info-note">Vite preview: sample content only. Platform publishing and checkout are available in the connected Next.js edition.</p>
      </header>
      <section className="creator-site-content">
        {page === 'blog' && <div className="creator-resource-grid">
          {resourceArticles.map((item) => <a className="creator-resource-card" href={`/blog/${item.slug}`} key={item.slug}>
            <span className="creator-resource-meta"><BookOpen size={14} /> {item.category} <span>{item.readTime}</span></span>
            <h2>{item.title}</h2><p>{item.summary}</p><b>Read story <ArrowRight size={14} /></b>
          </a>)}
        </div>}
        {page === 'article' && (article ? <article className="creator-site-article">
          <div className="creator-article-callout"><BookOpen size={17} /><p>{article.takeaway}</p></div>
          {article.sections.map(([heading, paragraphs]) => <section key={heading}><h2>{heading}</h2>{paragraphs.map((text) => <p key={text}>{text}</p>)}</section>)}
          <a className="creator-button creator-button-outline" href="/blog">More stories <ArrowRight size={14} /></a>
        </article> : <div className="creator-info-empty"><BookOpen size={22} /><h2>This story is not available</h2><a href="/blog">Browse the blog</a></div>)}
        {page === 'explore' && <div className="creator-directory-grid">
          {featuredCreators.map((creator) => <a className="creator-directory-card" href={`/${creator.handle}`} key={creator.handle}>
            <img src={creator.avatarUrl} alt="" /><span><small>{creator.category}</small><strong>{creator.displayName}</strong><p>{creator.bio}</p><b>Explore creator <ArrowRight size={13} /></b></span>
          </a>)}
        </div>}
        {page === 'store' && <div className="creator-resource-grid">
          {demoProducts.map((product) => {
            const creator = featuredCreators.find((item) => item.handle === product.creator)
            return <article className="creator-resource-card creator-store-card" key={product.title}>
              <span className="creator-resource-meta"><ShoppingBag size={14} /> BY <a href={`/${product.creator}`}>@{product.creator}</a></span>
              <h2>{product.title}</h2><p>{product.description}</p>
              <b className="creator-store-purchase"><span>{product.price}</span><a href={`/${product.creator}`}>Visit {creator?.displayName} <ExternalLink size={14} /></a></b>
            </article>
          })}
        </div>}
      </section>
    </main>
    <CreatorHubFooter />
  </div>
}
