"use client";

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Compass, ExternalLink, ShoppingBag } from 'lucide-react'
import CreatorHubFooter from '../components/CreatorHubFooter'
import CreatorHubHeader from '../components/CreatorHubHeader'
import { apiRequest } from '../services/api'
import '../CreatorPages.css'

type BlogPost = {
  _id: string
  title: string
  slug: string
  category: string
  excerpt: string
  body?: string
  coverImage: string
  createdAt: string
}
type ExploreLink = { _id: string; title: string; description: string; url: string; category: string; imageUrl: string }
type StoreProduct = {
  _id: string
  title: string
  description: string
  imageUrl: string
  price: number
  currency: string
  creator: { handle: string; displayName: string }
}
type SitePage = 'blog' | 'article' | 'explore' | 'store'

export default function SiteContentPage({ page, slug }: { page: SitePage; slug?: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [post, setPost] = useState<BlogPost | null>(null)
  const [links, setLinks] = useState<ExploreLink[]>([])
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    const request = page === 'blog'
      ? apiRequest<{ posts: BlogPost[] }>('/site/blog').then(({ posts: items }) => setPosts(items))
      : page === 'article'
        ? apiRequest<{ post: BlogPost }>(`/site/blog/${encodeURIComponent(slug || '')}`).then(({ post: item }) => setPost(item))
        : page === 'explore'
          ? apiRequest<{ links: ExploreLink[] }>('/site/explore').then(({ links: items }) => setLinks(items))
          : apiRequest<{ products: StoreProduct[] }>('/site/store').then(({ products: items }) => setProducts(items))
    request.catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load this page.'))
      .finally(() => setLoading(false))
  }, [page, slug])

  async function purchase(product: StoreProduct) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter your email address to receive the digital product after payment.')
      return
    }
    setBusy(product._id)
    setError('')
    try {
      const { checkoutUrl } = await apiRequest<{ checkoutUrl: string }>(`/payments/products/${product._id}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      window.location.href = checkoutUrl
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start checkout.')
      setBusy('')
    }
  }

  const title = page === 'blog' || page === 'article' ? 'Creator stories & field notes' : page === 'explore' ? 'Explore CreatorHub' : 'The CreatorHub storefront'
  const description = page === 'blog' || page === 'article'
    ? 'Ideas, practical advice and stories from the CreatorHub community.'
    : page === 'explore'
      ? 'A hand-picked collection of creators, useful tools and places to discover.'
      : 'Digital products selected by the CreatorHub team and made by our creators.'

  return <div className="creator-hub">
    <CreatorHubHeader />
    <main className="creator-site-page">
      <header className="creator-site-hero">
        <span className="creator-eyebrow">{page === 'explore' ? 'DISCOVER SOMETHING NEW' : page === 'store' ? 'CREATOR-MADE DIGITAL GOODS' : 'THE CREATOR PLAYBOOK'}</span>
        <h1>{page === 'article' && post ? post.title : title}</h1>
        <p>{page === 'article' && post ? post.excerpt : description}</p>
        <a className="creator-site-back" href={page === 'article' ? '/blog' : '/'}><ArrowLeft size={14} /> {page === 'article' ? 'All stories' : 'Back to CreatorHub'}</a>
      </header>
      <section className="creator-site-content">
        {loading && <p className="creator-info-note" role="status">Loading…</p>}
        {error && <p className="creator-info-error" role="alert">{error}</p>}
        {!loading && !error && page === 'blog' && <div className="creator-resource-grid">
          {posts.map((item) => <a className="creator-resource-card" href={`/blog/${item.slug}`} key={item._id}>
            {item.coverImage && <img className="creator-site-card-image" src={item.coverImage} alt="" />}
            <span className="creator-resource-meta"><BookOpen size={14} /> {item.category} <span>{new Date(item.createdAt).toLocaleDateString()}</span></span>
            <h2>{item.title}</h2><p>{item.excerpt}</p><b>Read story <ArrowRight size={14} /></b>
          </a>)}
          {!posts.length && <EmptyContent icon={<BookOpen size={22} />} title="New stories are on the way" text="The platform team will publish articles here." />}
        </div>}
        {!loading && !error && page === 'article' && post && <article className="creator-site-article">
          {post.coverImage && <img className="creator-site-cover" src={post.coverImage} alt="" />}
          <span className="creator-eyebrow">{post.category} · {new Date(post.createdAt).toLocaleDateString()}</span>
          {post.body?.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}
          <a className="creator-button creator-button-outline" href="/blog">More stories <ArrowRight size={14} /></a>
        </article>}
        {!loading && !error && page === 'article' && !post && <EmptyContent icon={<BookOpen size={22} />} title="This story is not available" text="It may have been unpublished or removed." />}
        {!loading && !error && page === 'explore' && <div className="creator-directory-grid">
          {links.map((item) => <a className="creator-directory-card" href={item.url} key={item._id} target="_blank" rel="noreferrer">
            {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span className="creator-site-icon"><Compass size={19} /></span>}
            <span><small>{item.category}</small><strong>{item.title}</strong><p>{item.description}</p><b>Explore <ExternalLink size={13} /></b></span>
          </a>)}
          {!links.length && <EmptyContent icon={<Compass size={22} />} title="More to explore soon" text="The platform team is preparing featured destinations." />}
        </div>}
        {!loading && !error && page === 'store' && <>
          {products.length > 0 && <label className="creator-store-email">Delivery email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}
          <div className="creator-resource-grid">
            {products.map((item) => <article className="creator-resource-card creator-store-card" key={item._id}>
              {item.imageUrl && <img className="creator-site-card-image" src={item.imageUrl} alt="" />}
              <span className="creator-resource-meta"><ShoppingBag size={14} /> BY <a href={`/${item.creator.handle}`}>@{item.creator.handle}</a></span>
              <h2>{item.title}</h2><p>{item.description}</p>
              <b className="creator-store-purchase"><span>{item.currency} {item.price.toFixed(2)}</span><button type="button" disabled={busy === item._id} onClick={() => void purchase(item)}>{busy === item._id ? 'Opening checkout…' : 'Buy now'} <ArrowRight size={14} /></button></b>
            </article>)}
            {!products.length && <EmptyContent icon={<ShoppingBag size={22} />} title="The storefront is getting ready" text="Creator-made products will appear here when the team publishes them." />}
          </div>
        </>}
      </section>
    </main>
    <CreatorHubFooter />
  </div>
}

function EmptyContent({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="creator-info-empty">{icon}<h2>{title}</h2><p>{text}</p></div>
}
