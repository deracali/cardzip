"use client";

import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CircleHelp,
  Link2,
  Play,
  ShoppingBag,
  Users,
} from 'lucide-react'

const creatorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=85'

function CreatorHero() {
  const [handle, setHandle] = useState('')

  const claimHandle = (event: FormEvent<HTMLFormElement>) => {
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
          <span className="creator-live-pill"><span /> A clear home for your creative work</span>
          <h1 id="creator-hero-title">One link for your entire creator business</h1>
          <p>Bring your profile, latest work, audience sign-up and digital products together in one place. Start with the essentials and grow at your own pace.</p>
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
            <div className="creator-avatar-stack" aria-hidden="true"><Link2 size={16} /></div>
            <div className="creator-rating"><strong>One creator page</strong><small>Links · content · storefront</small></div>
          </div>
        </div>

        <div className="creator-preview-wrap">
          <div className="creator-preview-card">
            <div className="creator-preview-top">
              <img className="creator-profile-photo" src={creatorAvatar} alt="Maya Chen" />
              <span className="creator-online-badge">CREATOR PAGE PREVIEW</span>
              <h2>Maya Chen <BadgeCheck size={15} fill="currentColor" /></h2>
              <p>@mayacreates</p>
              <div className="creator-social-links" aria-label="Maya's social links">
                <a href="/creators" aria-label="Browse creators"><Users size={14} /></a>
                <a href="/resources" aria-label="Read creator resources"><BookOpen size={14} /></a>
                <a href="/features" aria-label="Explore CreatorHub features"><Link2 size={14} /></a>
                <a href="/help" aria-label="Open help center"><CircleHelp size={14} /></a>
              </div>
            </div>
            <div className="creator-newsletter-preview">
              <strong>Keep your audience in the loop</strong>
              <small>Add a newsletter sign-up to your public creator page.</small>
              <div><span className="creator-preview-input">you@email.com</span><a href="/creators">Explore</a></div>
            </div>
            <a className="creator-preview-link" href="/creators"><span className="preview-link-icon lavender"><BookOpen size={14} /></span><span>Share your latest work</span><ArrowUpRight size={14} /></a>
            <a className="creator-preview-link" href="/creators"><span className="preview-link-icon purple"><ShoppingBag size={14} /></span><span>Offer a digital product</span><ArrowUpRight size={14} /></a>
          </div>
          <div className="creator-earnings-badge"><strong>Creator storefront</strong><span>Links, content and products</span></div>
          <a className="creator-play-badge" href="#examples" aria-label="See creator examples"><Play size={13} fill="currentColor" /></a>
        </div>
      </div>
      <div className="creator-trust-strip">
        <span>ONE PLACE FOR</span>
        <strong><b>▰</b> Your profile</strong>
        <strong><b>◎</b> Your latest work</strong>
        <strong><b>▤</b> Your audience</strong>
        <strong><b>↗</b> Your products</strong>
      </div>
    </section>
  )
}

export default CreatorHero
