"use client";

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, BadgeCheck, Camera, ExternalLink, Mail, ShoppingBag, Video } from 'lucide-react'
import { apiRequest } from '../services/api'

type PublicProfile = {
  handle: string
  displayName: string
  tagline: string
  bio: string
  avatarUrl: string
  links: { label: string; url: string }[]
}
type PublicContent = { _id: string; title: string; type: string; description: string; url: string; imageUrl: string }
type PublicProduct = { _id: string; title: string; description: string; price: number; currency: string }

export default function CreatorPublicPage({ handle }: { handle: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [content, setContent] = useState<PublicContent[]>([])
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<{ profile: PublicProfile; content: PublicContent[]; products: PublicProduct[] }>(`/creators/${encodeURIComponent(handle)}`)
      .then((result) => {
        setProfile(result.profile)
        setContent(result.content)
        setProducts(result.products)
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Creator page could not be loaded.'))
  }, [handle])

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile) return
    setError('')
    try {
      await apiRequest(`/creators/${encodeURIComponent(profile.handle)}/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSubscribed(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to subscribe.')
    }
  }

  async function buyProduct(product: PublicProduct) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter your email above to receive the digital product after payment.')
      return
    }
    setBusy(product._id)
    setError('')
    try {
      const result = await apiRequest<{ checkoutUrl: string }>(`/payments/products/${product._id}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      window.location.href = result.checkoutUrl
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start checkout.')
      setBusy('')
    }
  }

  if (!profile && error) return <main className="creator-public-page"><p className="creator-auth-notice" role="alert">{error}</p><a className="creator-button creator-button-dark" href="/">Back to CreatorHub</a></main>
  if (!profile) return <main className="creator-public-page"><p>Loading creator page…</p></main>

  return (
    <main className="creator-public-page">
      <header className="creator-public-header">
        <a className="creator-brand" href="/"><img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span></a>
        <a className="creator-button creator-button-dark" href="/signup">Create your own page <ArrowRight size={14} /></a>
      </header>
      <div className="creator-public-layout">
        <section className="creator-public-intro">
          <div className="creator-public-identity">
            <img src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=85'} alt={profile.displayName} />
            <span className="creator-verified"><BadgeCheck size={15} fill="currentColor" /></span>
          </div>
          <p className="creator-public-kicker">{profile.tagline}</p>
          <h1>{profile.displayName} <BadgeCheck size={18} fill="currentColor" /></h1>
          <p className="creator-public-handle">@{profile.handle}</p>
          <p className="creator-public-bio">{profile.bio}</p>
          <div className="creator-public-socials">
            {profile.links.map((link, index) => <a key={`${link.url}-${index}`} href={link.url} aria-label={link.label} target="_blank" rel="noreferrer">{index === 0 ? <Camera size={16} /> : index === 1 ? <Video size={16} /> : <ExternalLink size={16} />}</a>)}
            <a href={`mailto:?subject=${encodeURIComponent(`Contact ${profile.displayName}`)}`} aria-label={`Email ${profile.displayName}`}><Mail size={16} /></a>
          </div>
        </section>

        <section className="creator-profile-newsletter">
          <div><span className="creator-eyebrow">FREE WEEKLY NEWSLETTER</span><h2>Join {profile.displayName}’s readers</h2><p>Get new ideas and work straight to your inbox.</p></div>
          <form onSubmit={subscribe}><input aria-label="Your email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" required /><button className="creator-button creator-button-primary" type="submit" disabled={subscribed}>{subscribed ? 'You’re in!' : 'Subscribe'}</button></form>
          <small>{subscribed ? `Thanks for joining ${profile.displayName}’s newsletter.` : 'No spam. Unsubscribe anytime.'}</small>
          {error && <small role="alert">{error}</small>}
        </section>

        <section className="creator-profile-links" aria-label={`${profile.displayName}'s links and products`}>
          {products.map((product) => <div className="creator-live-product" key={product._id}><span className="profile-link-symbol product"><ShoppingBag size={17} /></span><span><strong>{product.title}</strong><small>{product.description}</small></span><button type="button" className="profile-link-cta" disabled={busy === product._id} onClick={() => void buyProduct(product)}>{busy === product._id ? '…' : `${product.currency} ${product.price}`}</button></div>)}
          {profile.links.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.url}><span className="profile-link-symbol"><ExternalLink size={17} /></span><span><strong>{link.label}</strong><small>{link.url}</small></span><ArrowRight size={17} /></a>)}
          {!products.length && !profile.links.length && <p className="creator-auth-notice">This creator hasn’t added links or products yet.</p>}
        </section>

        <section className="creator-profile-feature" id="latest-drops">
          <div className="creator-section-heading creator-stories-heading"><div><span className="creator-eyebrow">LATEST DROPS</span><h2>Notes, ideas &amp; new work</h2></div></div>
          <div className="creator-profile-drops">
            {content.map((item) => <a className="creator-profile-drop" href={item.url || '#latest-drops'} target={item.url ? '_blank' : undefined} rel={item.url ? 'noreferrer' : undefined} key={item._id}>{item.imageUrl && <img src={item.imageUrl} alt="" />}<span className="creator-eyebrow">{item.type}</span><strong>{item.title}</strong><small>{item.description || `Read ${profile.displayName}’s latest thoughts`} <ArrowRight size={12} /></small></a>)}
            {!content.length && <p className="creator-auth-notice">New posts from {profile.displayName} will appear here.</p>}
          </div>
        </section>
      </div>
      <footer className="creator-public-footer">Made with <a href="/">CreatorHub</a></footer>
    </main>
  )
}
