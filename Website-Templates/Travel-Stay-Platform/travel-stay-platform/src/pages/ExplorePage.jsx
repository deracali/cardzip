import { ArrowRight } from 'lucide-react'
import PageShell from '../components/PageShell'
import StayCard from '../components/StayCard'
import { stays } from '../data/stays'

export default function ExplorePage({ title, description }) {
  return (
    <PageShell>
      <main className="page-main explore-page">
        <span className="eyebrow">MADE FOR YOUR NEXT ESCAPE</span>
        <h1>{title}</h1>
        <p className="explore-intro">{description}</p>
        <div className="explore-grid">{stays.map((stay) => <StayCard stay={stay} key={stay.slug} />)}</div>
        <a className="button button-primary" href="/stays">Explore all stays <ArrowRight size={15} /></a>
      </main>
    </PageShell>
  )
}
