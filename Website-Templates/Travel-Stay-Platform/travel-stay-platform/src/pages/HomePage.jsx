import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import PageShell from '../components/PageShell'
import SearchBar from '../components/SearchBar'
import StayCard from '../components/StayCard'
import { stays } from '../data/stays'

const styles = [
  ['Beachfront', '1,240 stays', '☼'],
  ['Luxury Villas', '860 stays', '⌂'],
  ['Cabins', '1,120 stays', '⌁'],
  ['Boutique Hotels', '640 stays', '✳'],
  ['City Apartments', '1,450 stays', '▦'],
]

export default function HomePage() {
  return (
    <PageShell>
      <main className="page-main home-page">
        <section className="hero">
          <div className="hero-image" />
          <div className="hero-copy"><span className="eyebrow"><MapPin size={13} /> Over 2,500 stays worldwide</span><h1>Discover Your Next<br />Escape</h1><p>Handpicked beachfront villas, hidden retreats and design-led stays — book holidays that feel like they were made for you.</p></div>
          <SearchBar />
        </section>
        <section className="section-block style-section">
          <div className="section-heading"><div><h2>Browse by style</h2><p>Find a stay that feels like you.</p></div><a className="text-link" href="/stays">View all <ArrowRight size={14} /></a></div>
          <div className="style-grid">{styles.map(([name, count, icon]) => <a className="style-card" href={`/stays?style=${encodeURIComponent(name)}`} key={name}><span className="style-icon">{icon}</span><strong>{name}</strong><small>{count}</small></a>)}</div>
        </section>
        <section className="section-block">
          <div className="section-heading"><div><h2>Featured stays</h2><p>Lovely places, lovely hosts — handpicked for you.</p></div><div className="carousel-actions"><a className="icon-button" href="/stays" aria-label="Previous stays"><ArrowLeft size={15} /></a><a className="icon-button is-dark" href="/stays" aria-label="More stays"><ArrowRight size={15} /></a></div></div>
          <div className="stay-grid">{stays.slice(0, 3).map((stay) => <StayCard key={stay.slug} stay={stay} />)}</div>
        </section>
        <section className="trust-strip"><div><strong>4.9/5</strong><span>Stay guest satisfaction</span></div><div><strong>Free cancellation</strong><span>Flexible booking options</span></div><div><strong>24/7</strong><span>Guest support</span></div><a className="button button-primary button-small" href="/list-property">List your property</a></section>
      </main>
    </PageShell>
  )
}
