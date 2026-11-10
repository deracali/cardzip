import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Camera,
  ExternalLink,
  Mail,
  Play,
  ShoppingBag,
  Video,
} from 'lucide-react'
import '../components/CreatorHub.css'

const creatorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=85'

const drops = [
  {
    type: 'BLOG · 6 MIN',
    title: 'My $0 to $10k newsletter playbook',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=85',
  },
  {
    type: 'VIDEO · 12 MIN',
    title: 'I redesigned my link page live',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=85',
  },
]

function CreatorProfilePage() {
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const subscribe = (event) => {
    event.preventDefault()
    setSubscribed(true)
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
            <img src={creatorAvatar} alt="Maya Chen" />
            <span className="creator-verified"><BadgeCheck size={15} fill="currentColor" /></span>
          </div>
          <p className="creator-public-kicker">CREATOR · WRITER · DESIGNER</p>
          <h1>Maya Chen <BadgeCheck size={18} fill="currentColor" /></h1>
          <p className="creator-public-handle">@mayacreates</p>
          <p className="creator-public-bio">Designing digital products, helping 50k+ creators build profitable digital businesses.</p>
          <div className="creator-public-socials">
            <a href="https://instagram.com" aria-label="Instagram"><Camera size={16} /></a>
            <a href="https://youtube.com" aria-label="YouTube"><Video size={16} /></a>
            <a href="/maya-chen" aria-label="Maya's website"><ExternalLink size={16} /></a>
            <a href="mailto:maya@example.com" aria-label="Email Maya"><Mail size={16} /></a>
          </div>
        </section>

        <section className="creator-profile-newsletter">
          <div><span className="creator-eyebrow">FREE WEEKLY NEWSLETTER</span><h2>Join 50k+ Weekly Readers</h2><p>One critical email every Sunday. Growth, no noise.</p></div>
          <form onSubmit={subscribe}><input aria-label="Your email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" required /><button className="creator-button creator-button-primary" type="submit">{subscribed ? 'You’re in!' : 'Subscribe'}</button></form>
          <small>{subscribed ? 'Thanks for joining Maya’s weekly letter.' : 'No spam. Unsubscribe anytime.'}</small>
        </section>

        <section className="creator-profile-links" aria-label="Maya's links and products">
          <a href="#latest-drops"><span className="profile-link-symbol"><ArrowDownToLine size={17} /></span><span><strong>Download my free eBook</strong><small>5 habits that changed my creative career</small></span><b>FREE</b></a>
          <a href="#latest-drops"><span className="profile-link-symbol product"><ShoppingBag size={17} /></span><span><strong>Buy Figma UI Kit — $29</strong><small>320+ components · 4.9 ★ (890)</small></span><b className="profile-link-cta">View</b></a>
          <a href="#latest-drops"><span className="profile-link-symbol podcast"><Play size={16} fill="currentColor" /></span><span><strong>Latest podcast episode</strong><small>#142 · How I hit $20k MRR</small></span><ArrowRight size={17} /></a>
        </section>

        <section className="creator-profile-feature" id="latest-drops">
          <div className="creator-section-heading creator-stories-heading"><div><span className="creator-eyebrow">LATEST DROPS</span><h2>Notes, ideas & new work</h2></div><a href="#latest-drops">View all <ArrowRight size={14} /></a></div>
          <div className="creator-profile-drops">
            {drops.map((drop) => <a className="creator-profile-drop" href="#latest-drops" key={drop.title}><img src={drop.image} alt="" /><span className="creator-eyebrow">{drop.type}</span><strong>{drop.title}</strong><small>Read Maya’s latest thoughts <ArrowRight size={12} /></small></a>)}
          </div>
          <div className="creator-profile-community"><strong>✨ 11 Coaching — 2 spots left</strong><span>Book a portfolio review call</span><ArrowRight size={15} /></div>
        </section>
      </div>
      <footer className="creator-public-footer">Made with <a href="/">CreatorHub</a></footer>
    </main>
  )
}

export default CreatorProfilePage
