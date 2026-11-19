import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, MapPin, ShieldCheck } from 'lucide-react'
import PageShell from '../components/PageShell'
import DonationWidget from '../components/DonationWidget'
import { formatMoney } from '../data/campaigns'

export default function CampaignPage({ campaign }) {
  const [volunteerOpen, setVolunteerOpen] = useState(false)
  const progress = Math.min(100, Math.round(campaign.raised / campaign.goal * 100))
  return (
    <PageShell>
      <main className="page-main campaign-detail-page">
        <a className="back-link" href="/causes"><ArrowLeft size={15} /> All causes</a>
        <div className="campaign-detail-hero"><img src={campaign.image} alt={campaign.title} /><div className="campaign-hero-caption"><span className="cause-tag">{campaign.category}</span><h1>{campaign.title}</h1><p><MapPin size={14} /> {campaign.location} <span>·</span> A community-led Kindred project</p></div></div>
        <div className="campaign-detail-layout">
          <div className="story-column">
            <section className="story-card"><span className="eyebrow section-eyebrow">Our story</span><h2>Every child deserves the chance to thrive.</h2><p>{campaign.description} In partnership with local leaders, we make sure every gift reaches the people who need it most.</p><div className="story-photos"><img src="/clean-water.jpg" alt="Children and families in the community" /><img src="/classroom.jpg" alt="Local education and community programs" /><img src="/mobile-clinic.jpg" alt="Community healthcare outreach" /></div><div className="impact-callout"><span>✦</span><p><strong>Your gift makes a real difference</strong><br />{campaign.impact}</p></div></section>
            <section className="updates-card"><h2>Field updates</h2>{campaign.updates.map((update, index) => <div className="update-item" key={update}><span className={index === 0 ? 'update-dot is-current' : 'update-dot'} /><div><strong>{update}</strong><small>{index === 0 ? '2 days ago · Community update' : `${index + 2} weeks ago · Project update`}</small></div></div>)}<a className="text-link" href="/impact">Read more project updates <ArrowRight size={14} /></a></section>
            <section className="volunteer-card"><button className="accordion-heading" type="button" aria-expanded={volunteerOpen} onClick={() => setVolunteerOpen(!volunteerOpen)}><span><strong>Volunteer with us</strong><small>There’s more than one way to make a difference.</small></span><ChevronDown size={18} /></button>{volunteerOpen && <form className="volunteer-form" onSubmit={(event) => { event.preventDefault(); window.location.href = '/volunteer?campaign=' + campaign.slug }}><label><span className="sr-only">Full name</span><input placeholder="Full name" required /></label><label><span className="sr-only">Email address</span><input type="email" placeholder="Email address" required /></label><button type="submit" className="button button-dark full-button">Apply to volunteer</button></form>}</section>
          </div>
          <aside className="campaign-donate-card"><div className="goal-top"><strong>{formatMoney(campaign.raised)}</strong><span>of {formatMoney(campaign.goal)}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p className="campaign-count"><strong>{progress}% funded</strong><span>{Math.max(0, campaign.goal - campaign.raised).toLocaleString()} to go</span></p><div className="recent-gifts"><div><Check size={13} /><span><strong>Anonymous donated $50</strong><small>2 minutes ago</small></span></div><div><Check size={13} /><span><strong>Sarah C. donated $100</strong><small>1 hour ago</small></span></div><div><Check size={13} /><span><strong>James D. donated $25</strong><small>Today</small></span></div></div><DonationWidget campaign={campaign} /><p className="campaign-tax-note"><ShieldCheck size={13} /> Donations may be tax-deductible.</p></aside>
        </div>
      </main>
    </PageShell>
  )
}
