import { useState } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Link2,
  Mail,
  Play,
  ShoppingBag,
  Video,
} from 'lucide-react'

const creatorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=85'

function CreatorHero() {
  const [handle, setHandle] = useState('')

  const claimHandle = (event) => {
    event.preventDefault()
    const cleanHandle = handle.trim().replace(/^@/, '')
    window.location.href = cleanHandle
      ? `/signup?handle=${encodeURIComponent(cleanHandle)}`
      : '/signup'
  }

  return (
    <section className="creator-hero" aria-labelledby="creator-hero-title">
      <div className="creator-hero-inner">
        <div className="creator-hero-copy">
          <span className="creator-live-pill"><span /> Digital storefronts are live — sell in 2 clicks</span>
          <h1 id="creator-hero-title">One link for your entire creator business</h1>
          <p>Link-in-bio, newsletter to 50k+ readers, and digital products — all on one creatorhub.com. Free to start.</p>
          <form className="creator-claim-form" onSubmit={claimHandle}>
            <label className="creator-handle-input">
              <span>creatorhub.com/</span>
              <input
                aria-label="Your CreatorHub handle"
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                placeholder="yourhandle"
                pattern="[A-Za-z0-9._-]*"
              />
            </label>
            <button className="creator-button creator-button-primary" type="submit">Claim mine</button>
          </form>
          <div className="creator-social-proof">
            <div className="creator-avatar-stack" aria-hidden="true">
              <img src={creatorAvatar} alt="" />
              <span>J</span><span>A</span><span>M</span>
            </div>
            <div className="creator-rating"><strong>★★★★★ 4.9</strong><small>Loved by 120,000+ creators</small></div>
          </div>
        </div>

        <div className="creator-preview-wrap">
          <div className="creator-preview-card">
            <div className="creator-preview-top">
              <img className="creator-profile-photo" src={creatorAvatar} alt="Maya Chen" />
              <span className="creator-online-badge">● +214 visits today</span>
              <h2>Maya Chen <BadgeCheck size={15} fill="currentColor" /></h2>
              <p>@mayacreates</p>
              <div className="creator-social-links" aria-label="Maya's social links">
                <a href="https://instagram.com" aria-label="Instagram"><Camera size={14} /></a>
                <a href="https://youtube.com" aria-label="YouTube"><Video size={14} /></a>
                <a href="/maya-chen" aria-label="Maya's profile"><Link2 size={14} /></a>
                <a href="mailto:hello@creatorhub.example" aria-label="Email Maya"><Mail size={14} /></a>
              </div>
            </div>
            <form className="creator-newsletter-preview" onSubmit={(event) => event.preventDefault()}>
              <strong>Join 50k+ Weekly Readers</strong>
              <small>One critical email every Sunday. Growth, no noise.</small>
              <div><input aria-label="Your email address" placeholder="you@email.com" type="email" /><button type="submit">Subscribe</button></div>
            </form>
            <a className="creator-preview-link" href="/maya-chen"><span className="preview-link-icon lavender"><Mail size={14} /></span><span>Free eBook</span><strong>FREE</strong></a>
            <a className="creator-preview-link" href="/maya-chen"><span className="preview-link-icon purple"><ShoppingBag size={14} /></span><span>Figma UI Kit — $29</span><ArrowUpRight size={14} /></a>
          </div>
          <div className="creator-earnings-badge"><strong>$2,340 this week</strong><span>Digital sales</span></div>
          <a className="creator-play-badge" href="#examples" aria-label="See creator examples"><Play size={13} fill="currentColor" /></a>
        </div>
      </div>
      <div className="creator-trust-strip">
        <span>POWERING TOP CREATORS</span>
        <strong><b>▰</b> 2M+ subs</strong>
        <strong><b>◎</b> Top 50 podcasts</strong>
        <strong><b>▤</b> 500k creators</strong>
        <strong><b>↗</b> Creator economy</strong>
      </div>
    </section>
  )
}

export default CreatorHero
