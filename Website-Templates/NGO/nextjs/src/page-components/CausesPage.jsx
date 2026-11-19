import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import PageShell from '../components/PageShell'
import CampaignCard from '../components/CampaignCard'
import { campaigns } from '../data/campaigns'

export default function CausesPage() {
  const [category, setCategory] = useState('All causes')
  const [query, setQuery] = useState('')
  const categories = ['All causes', ...new Set(campaigns.map((campaign) => campaign.category))]
  const filtered = useMemo(() => campaigns.filter((campaign) => (category === 'All causes' || campaign.category === category)
    && `${campaign.title} ${campaign.location}`.toLowerCase().includes(query.toLowerCase())), [category, query])
  return (
    <PageShell>
      <main className="page-main content-page">
        <span className="eyebrow section-eyebrow">Find your cause</span><h1>Small acts. Lasting change.</h1><p className="page-intro">Explore community-led projects and choose the change you want to make.</p>
        <div className="cause-toolbar"><label className="cause-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" aria-label="Search projects" /></label><div className="cause-filters" aria-label="Filter causes">{categories.map((item) => <button key={item} type="button" className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        {filtered.length ? <div className="campaign-grid">{filtered.map((campaign) => <CampaignCard key={campaign.slug} campaign={campaign} />)}</div> : <div className="empty-state"><h2>No projects found</h2><p>Try another search or choose a different cause.</p><button className="button button-green" type="button" onClick={() => { setCategory('All causes'); setQuery('') }}>Clear filters</button></div>}
      </main>
    </PageShell>
  )
}
