import { ArrowRight, BadgeDollarSign, Link2, Mail, Play, Sparkles } from 'lucide-react'

const features = [
  {
    title: 'Smart link pages',
    description: 'Beautiful 20+ cards, instant-buy badges, scheduling and analytics. Converts 3x better than basic bio links.',
    link: 'Explore links',
    icon: Link2,
    tone: 'violet',
  },
  {
    title: 'Newsletter built-in',
    description: 'Join 50k+ weekly readers, dynamic playbooks. Capture emails inline, send Sundays, get paid. No Mailchimp needed.',
    link: '50,214 readers',
    icon: Mail,
    tone: 'dark',
  },
  {
    title: 'Sell digital products',
    description: 'eBooks, UI kits, presets, coaching, 1:1 checkouts with Apple Pay. Own 95% on your first $1k.',
    link: 'See storefronts',
    icon: BadgeDollarSign,
    tone: 'lime',
  },
]

function CreatorFeatures() {
  return (
    <section className="creator-section creator-features-section" id="features" aria-labelledby="features-title">
      <div className="creator-section-heading">
        <span className="creator-eyebrow">EVERYTHING IN ONE HUB</span>
        <h2 id="features-title">Stop juggling five tools</h2>
      </div>
      <div className="creator-feature-grid">
        {features.map(({ title, description, link, icon: Icon, tone }) => (
          <article className={`creator-feature-card feature-${tone}`} key={title}>
            <span className="creator-feature-icon"><Icon size={18} /></span>
            <h3>{title}</h3>
            <p>{description}</p>
            <a href={tone === 'dark' ? '#latest-drops' : '#pricing'}>{link} <ArrowRight size={13} /></a>
            {tone === 'dark' && <span className="feature-metric">+12% MoM</span>}
          </article>
        ))}
      </div>

      <div className="creator-feature-showcase" id="examples">
        <article className="creator-content-card">
          <div className="creator-content-copy">
            <span className="creator-eyebrow">PODCAST + BLOG + VIDEOS</span>
            <h3>Your content, auto-synced</h3>
            <p>Latest episode, posts and videos pull in automatically. No manual updating.</p>
            <div className="creator-episode"><span><Play size={15} fill="currentColor" /></span><div><strong>#142 · How I hit $20k MRR</strong><small>32 min · 10k downloads</small></div></div>
          </div>
          <div className="creator-content-art" role="img" aria-label="Warmly lit creator studio">
            <span><Sparkles size={28} /></span>
          </div>
        </article>
        <blockquote className="creator-testimonial">
          <div aria-label="5 out of 5 stars">★★★★★</div>
          <p>“I replaced Linktree + ConvertKit + Gumroad with one $0 page. Revenue jumped up 40%.”</p>
          <footer><span className="testimonial-avatar">J</span><span><strong>Jordan Lee · 800k on YouTube</strong><small>50,000+ Readers · Verified creator</small></span></footer>
        </blockquote>
      </div>
    </section>
  )
}

export default CreatorFeatures
