import { ArrowRight, BadgeDollarSign, Link2, Mail, Play, Sparkles } from 'lucide-react'

const features = [
  {
    title: 'Smart link pages',
    description: 'Give visitors one clear page for your introduction, important destinations and latest work.',
    link: 'Explore links',
    icon: Link2,
    tone: 'violet',
  },
  {
    title: 'Newsletter built-in',
    description: 'Invite interested visitors to subscribe and keep your audience list together with your creator profile.',
    link: 'Audience tools',
    icon: Mail,
    tone: 'dark',
  },
  {
    title: 'Sell digital products',
    description: 'Describe a digital product, set a price and connect checkout through Paystack in the Next.js edition.',
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
            <a href={tone === 'dark' ? '/help' : '/features'}>{link} <ArrowRight size={13} /></a>
          </article>
        ))}
      </div>

      <div className="creator-feature-showcase" id="examples">
        <article className="creator-content-card">
          <div className="creator-content-copy">
            <span className="creator-eyebrow">POSTS · VIDEOS · PODCASTS</span>
            <h3>Your latest work, in context</h3>
            <p>Keep published links and updates together so visitors can find the work behind your profile.</p>
            <div className="creator-episode"><span><Play size={15} fill="currentColor" /></span><div><strong>Share a new release</strong><small>Link to the work and add a short note</small></div></div>
          </div>
          <div className="creator-content-art" role="img" aria-label="Warmly lit creator studio">
            <span><Sparkles size={28} /></span>
          </div>
        </article>
        <article className="creator-testimonial">
          <div className="creator-eyebrow">DESIGNED AROUND A SIMPLE PATH</div>
          <p>Introduce your work. Help visitors choose where to go. Keep your latest projects and products within reach.</p>
          <a className="creator-info-text-link" href="/features">Explore the features <ArrowRight size={14} /></a>
        </article>
      </div>
    </section>
  )
}

export default CreatorFeatures
