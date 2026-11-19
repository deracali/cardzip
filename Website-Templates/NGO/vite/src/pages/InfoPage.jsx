import { ArrowRight, Heart, ShieldCheck, Users } from 'lucide-react'
import PageShell from '../components/PageShell'
import CampaignCard from '../components/CampaignCard'
import { campaigns } from '../data/campaigns'

const pageContent = {
  about: { eyebrow: 'A little kindness can go a long way', title: 'We believe every community deserves the chance to thrive.', body: 'Kindred works alongside local leaders to make lasting progress in clean water, education, and community health. We listen first, invest thoughtfully, and share the results openly.', action: 'Explore our causes', href: '/causes' },
  impact: { eyebrow: 'Proof that kindness works', title: 'Change you can see. Progress you can measure.', body: 'Together, Kindred supporters have helped more than 100,000 people access essential services. We publish project updates and transparent reports so you can follow every step.', action: 'See active projects', href: '/causes' },
  'ways-to-give': { eyebrow: 'Give in a way that feels right', title: 'There are many ways to make a difference.', body: 'Make a one-time gift, become a monthly supporter, or give your time as a volunteer. Every contribution helps community-led work move forward.', action: 'Make a gift', href: '/donate' },
  volunteer: { eyebrow: 'Show up with kindness', title: 'Your time and talents can change lives.', body: 'Join our community of volunteers supporting education, health outreach, and local fundraising. Leave your details and our community team will help you find a meaningful way to participate.', action: 'Browse open projects', href: '/causes' },
  support: { eyebrow: 'We’re here to help', title: 'Questions about giving? We can help.', body: 'For questions about donations, receipts, volunteering, or our programs, write to hello@kindred.org. Our donor care team replies within two business days.', action: 'See ways to give', href: '/ways-to-give' },
  privacy: { eyebrow: 'Your trust matters', title: 'Privacy, handled with care.', body: 'Kindred uses donor information only to process giving, provide receipts, and share updates you choose to receive. We do not sell personal information. Contact privacy@kindred.org to request access or removal.', action: 'Contact donor support', href: '/support' },
}

export default function InfoPage({ page = 'about' }) {
  const content = pageContent[page] || pageContent.about
  return (
    <PageShell>
      <main className="info-page">
        <section className="info-hero"><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.body}</p><a className="button button-green" href={content.href}>{content.action} <ArrowRight size={15} /></a></section>
        <section className="info-metrics"><div><Heart /><strong>100,000+</strong><span>lives impacted</span></div><div><Users /><strong>48,000</strong><span>kind hearts</span></div><div><ShieldCheck /><strong>92%</strong><span>funds to programs</span></div></section>
        <section className="info-causes"><div className="section-heading"><div><span className="eyebrow section-eyebrow">Make a difference today</span><h2>Community-led. Lasting impact.</h2></div><a className="text-link" href="/causes">All causes <ArrowRight size={14} /></a></div><div className="campaign-grid">{campaigns.map((campaign) => <CampaignCard key={campaign.slug} campaign={campaign} />)}</div></section>
      </main>
    </PageShell>
  )
}
