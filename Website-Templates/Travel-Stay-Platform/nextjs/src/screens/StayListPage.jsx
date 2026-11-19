import { useMemo, useState } from 'react'
import { ArrowRight, Search, ShieldCheck } from 'lucide-react'
import PageShell from '../components/PageShell'
import StayCard from '../components/StayCard'
import { stays } from '../data/stays'

export default function StayListPage() {
  const params = new URLSearchParams(window.location.search)
  const [destination, setDestination] = useState(params.get('destination') || '')
  const [maxPrice, setMaxPrice] = useState(500)
  const [style, setStyle] = useState(params.get('style') || 'All stays')
  const filteredStays = useMemo(() => stays.filter((stay) => stay.price <= maxPrice
    && (!destination || `${stay.area} ${stay.name}`.toLowerCase().includes(destination.toLowerCase().split(',')[0].trim()))
    && (style === 'All stays' || (['Beachfront', 'Private pool', 'Eco stay'].includes(style) ? stay.type === style : stay.categories.includes(style)))), [destination, maxPrice, style])

  return (
    <PageShell>
      <main className="page-main listing-page">
        <div className="listing-top"><div><p className="breadcrumbs"><a href="/">Home</a><span>/</span> Stays</p><h1>Stays in Bali, Indonesia</h1><p className="muted-copy">120 beautiful places · Nov 18 – Nov 20 · 2 guests</p></div><div className="view-switch"><button type="button" className="active">▦ &nbsp;List</button><button type="button" onClick={() => document.getElementById('stay-results')?.scrollIntoView({ behavior: 'smooth' })}>⌖ &nbsp;Map</button></div></div>
        <div className="listing-layout">
          <aside className="filters-panel">
            <label className="filter-label" htmlFor="destination-filter">Destination</label><input className="filter-input" id="destination-filter" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Bali, Indonesia" />
            <label className="filter-label" htmlFor="price-filter">Price range <span>Up to ${maxPrice}</span></label><input id="price-filter" className="range-input" type="range" min="50" max="500" step="10" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div className="range-values"><span>$50</span><span>$500+</span></div>
            <label className="filter-label" htmlFor="style-filter">Property type</label><select className="filter-input" id="style-filter" value={style} onChange={(event) => setStyle(event.target.value)}><option>All stays</option><option>Beachfront</option><option>Private pool</option><option>Eco stay</option><option>Luxury Villas</option><option>Cabins</option><option>Boutique Hotels</option><option>City Apartments</option></select>
            <fieldset className="filter-group"><legend>Amenities</legend>{['Pool', 'Free Wi-Fi', 'Kitchen', 'Ocean view'].map((amenity) => <label key={amenity}><input type="checkbox" /> {amenity}</label>)}</fieldset>
            <div className="filter-note"><ShieldCheck size={15} /><span><strong>Guest favorite</strong><br />Top-rated stays loved by guests.</span></div>
          </aside>
          <section className="results-area" id="stay-results">
            <div className="results-heading"><div><strong>{filteredStays.length} stays found</strong><p>Find your next favorite place to stay.</p></div><select aria-label="Sort stays"><option>Recommended</option><option>Price: low to high</option><option>Guest rating</option></select></div>
            {filteredStays.length ? <div className="results-grid">{filteredStays.map((stay) => <StayCard key={stay.slug} stay={stay} />)}</div> : <div className="empty-state"><Search size={26} /><h2>No stays match those filters</h2><p>Try a different destination, property type, or price range.</p><button className="button button-primary" type="button" onClick={() => { setDestination(''); setMaxPrice(500); setStyle('All stays') }}>Clear filters</button></div>}
            <nav className="pagination" aria-label="Stay results pages"><a href="/stays" aria-label="Previous page">‹</a><a className="active" href="/stays">1</a><a href="/stays?page=2">2</a><a href="/stays?page=3">3</a><a href="/stays?page=2" aria-label="Next page">Next <ArrowRight size={13} /></a></nav>
          </section>
        </div>
      </main>
    </PageShell>
  )
}
