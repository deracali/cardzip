import { ArrowRight, Heart, ShieldCheck, Users, Wheat } from 'lucide-react'
import PageShell from '../components/PageShell'
import CampaignCard from '../components/CampaignCard'
import DonationWidget from '../components/DonationWidget'
import { campaigns } from '../data/campaigns'

const metrics = [
  { icon: Heart, value: '100k+', label: 'Lives Impacted' },
  { icon: Users, value: '92%', label: 'Program Funding' },
  { icon: Wheat, value: '50+', label: 'Global Projects' },
  { icon: ShieldCheck, value: '$12.4M', label: 'Raised Transparently' },
]

export default function HomePage() {
  return (
    <PageShell>
      <main>
        <section className="hero-wrap">
          <div className="hero-image" />
          <div className="hero-copy"><span className="eyebrow"><Heart size={13} fill="currentColor" /> TOGETHER, WE CAN MAKE A DIFFERENCE</span><h1>Together, We Can<br />Change Lives Today</h1><p>Your kindness brings clean water, education and essential healthcare to communities around the world. Every gift creates real change.</p><a className="hero-link" href="/impact">See the change you make <ArrowRight size={14} /></a></div>
          <aside className="hero-donate"><h2>Make a difference</h2><p>Choose a gift that feels right.</p><DonationWidget /></aside>
        </section>
        <section className="metrics-strip" aria-label="Our impact">{metrics.map(({ icon: Icon, value, label }) => <div className="metric" key={label}><span className="metric-icon"><Icon size={17} /></span><span><strong>{value}</strong><small>{label}</small></span></div>)}</section>
        <section className="section-block causes-section"><div className="section-heading"><div><span className="eyebrow section-eyebrow">Together, anything is possible</span><h2>Where help is needed now</h2><p>Your support changes lives in real, lasting ways.</p></div><a className="text-link" href="/causes">View all causes <ArrowRight size={14} /></a></div><div className="campaign-grid">{campaigns.map((campaign) => <CampaignCard key={campaign.slug} campaign={campaign} />)}</div></section>
        <section className="transparency-banner"><span className="transparency-icon"><ShieldCheck size={20} /></span><div><strong>See exactly where every gift goes</strong><p>Audited financials, field reports &amp; live project tracking.</p></div><a href="/impact" className="button button-dark button-small">2025 Impact Report</a><a href="/impact" className="button button-green button-small">Our transparency</a></section>
      </main>
    </PageShell>
  )
}
