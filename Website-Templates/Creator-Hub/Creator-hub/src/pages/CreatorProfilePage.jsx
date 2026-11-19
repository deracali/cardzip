import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CircleHelp,
  ExternalLink,
  Link2,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { resourceArticles } from './creatorPageContent'
import '../components/CreatorHub.css'

const dropImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=85',
]

function CreatorProfilePage({ creator }) {
  const [notice, setNotice] = useState('')
  const [email, setEmail] = useState('')

  const subscribe = (event) => {
    event.preventDefault()
    setNotice('This Vite profile is a preview. Subscriber sign-up is connected in the Next.js edition.')
  }

  return (
    <main className="creator-public-page">
      <header className="creator-public-header">
        <a className="creator-brand" href="/"><img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span></a>
        <a className="creator-button creator-button-dark" href="/signup">Create your own page <ArrowRight size={14} /></a>
      </header>
      <div className="creator-public-layout">
        <section className="creator-public-intro">
          <div className="creator-public-identity">
            <img src={creator.avatarUrl} alt={creator.displayName} />
            <span className="creator-verified"><BadgeCheck size={15} fill="currentColor" /></span>
          </div>
          <p className="creator-public-kicker">{creator.category}</p>
          <h1>{creator.displayName} <BadgeCheck size={18} fill="currentColor" /></h1>
          <p className="creator-public-handle">@{creator.handle}</p>
          <p className="creator-public-bio">{creator.bio}</p>
          <div className="creator-public-socials">
            <a href="/creators" aria-label="Explore creator profiles"><Users size={16} /></a>
            <a href="/resources" aria-label="Read creator resources"><BookOpen size={16} /></a>
            <a href="/features" aria-label="CreatorHub features"><ExternalLink size={16} /></a>
            <a href="/help" aria-label="Get help"><CircleHelp size={16} /></a>
          </div>
        </section>

        <section className="creator-profile-newsletter">
          <div><span className="creator-eyebrow">STAY IN THE LOOP</span><h2>Follow {creator.displayName}’s latest work</h2><p>Use this preview to see how a creator newsletter could fit on the page.</p></div>
          <form onSubmit={subscribe}><input aria-label="Your email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" required /><button className="creator-button creator-button-primary" type="submit">Preview sign-up</button></form>
          <small>{notice || 'The connected Next.js edition saves subscriber sign-ups to the backend.'}</small>
        </section>

        <section className="creator-profile-links" aria-label={`${creator.displayName}'s links and products`}>
          <a href="/resources/creator-bio-that-connects"><span className="profile-link-symbol"><ArrowDownToLine size={17} /></span><span><strong>Read the profile guide</strong><small>A clear introduction and useful next step</small></span><ArrowRight size={17} /></a>
          <a href="/features"><span className="profile-link-symbol product"><ShoppingBag size={17} /></span><span><strong>Explore the creator toolkit</strong><small>Profiles, content, audience and products</small></span><ArrowRight size={17} /></a>
          <a href="/creators"><span className="profile-link-symbol podcast"><Link2 size={16} /></span><span><strong>Discover other creators</strong><small>Browse example creator pages</small></span><ArrowRight size={17} /></a>
        </section>

        <section className="creator-profile-feature" id="latest-drops">
          <div className="creator-section-heading creator-stories-heading"><div><span className="creator-eyebrow">LATEST DROPS</span><h2>Notes, ideas & new work</h2></div><a href="/resources">View all <ArrowRight size={14} /></a></div>
          <div className="creator-profile-drops">
            {resourceArticles.slice(0, 2).map((drop, index) => <a className="creator-profile-drop" href={`/resources/${drop.slug}`} key={drop.slug}><img src={dropImages[index]} alt="" /><span className="creator-eyebrow">{drop.category} · {drop.readTime}</span><strong>{drop.title}</strong><small>Read this creator guide <ArrowRight size={12} /></small></a>)}
          </div>
          <div className="creator-profile-community"><strong>Built with CreatorHub</strong><span>Explore the tools for your own creator page</span><ArrowRight size={15} /></div>
        </section>
      </div>
      <footer className="creator-public-footer">Made with <a href="/">CreatorHub</a></footer>
    </main>
  )
}

export default CreatorProfilePage
