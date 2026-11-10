import { ArrowRight, MapPin } from 'lucide-react'
import { formatMoney } from '../data/campaigns'

export default function CampaignCard({ campaign }) {
  const progress = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))
  return (
    <article className="campaign-card">
      <a className="campaign-image" href={`/causes/${campaign.slug}`} aria-label={`Read about ${campaign.title}`}><img src={campaign.image} alt={campaign.title} loading="lazy" /><span className="cause-tag">{campaign.category}</span></a>
      <div className="campaign-content">
        <h3><a href={`/causes/${campaign.slug}`}>{campaign.title}</a></h3>
        <p className="campaign-location"><MapPin size={13} /> {campaign.location}</p>
        <div className="progress-track" role="progressbar" aria-label="Fundraising progress" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${progress}%` }} /></div>
        <div className="campaign-raised"><strong>{formatMoney(campaign.raised)}</strong><span>of {formatMoney(campaign.goal)} raised</span></div>
        <p className="impact-copy">{campaign.impact}</p>
        <a className="button button-outline" href={`/causes/${campaign.slug}`}>Support this cause <ArrowRight size={14} /></a>
      </div>
    </article>
  )
}
