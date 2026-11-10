import { useState } from 'react'
import { ArrowRight, Check, Heart, MapPin, ShieldCheck, Star } from 'lucide-react'
import PageShell from '../components/PageShell'
import { imageUrl } from '../data/stays'

export default function StayDetailPage({ stay }) {
  const [saved, setSaved] = useState(false)
  return (
    <PageShell>
      <main className="page-main detail-page">
        <p className="breadcrumbs"><a href="/">Home</a><span>/</span><a href="/stays">Stays</a><span>/</span>{stay.shortName}</p>
        <div className="detail-heading"><div><span className="eyebrow detail-eyebrow"><MapPin size={13} /> {stay.area}</span><h1>{stay.name}</h1><p><Star size={15} fill="currentColor" /> <strong>{stay.rating}</strong> · {stay.reviews} reviews · <a href="#location">Great location</a></p></div><div className="detail-actions"><button className="outline-button" type="button" onClick={() => setSaved(!saved)}><Heart size={15} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}</button><a className="outline-button" href="#photos">▧ &nbsp;See all photos</a></div></div>
        <div className="photo-gallery" id="photos"><img className="gallery-main" src={imageUrl(stay.image, 1200)} alt={`${stay.name}, tropical pool and resort`} /><img src={imageUrl('photo-1611892440504-42a792e24d32', 700)} alt="Comfortable suite interior" /><img src={imageUrl('photo-1570077188670-e3a8d69ac5ff', 700)} alt="Ocean view from the property" /><img src={imageUrl('photo-1575429198097-ecb6b28b16e4', 700)} alt="Resort swimming pool" /><img src={imageUrl('photo-1564013799919-ab600027ffc6', 700)} alt="Villa exterior in the garden" /></div>
        <div className="detail-layout">
          <section className="detail-main-column"><div className="host-row"><div className="host-avatar">M</div><div><strong>Hosted by Made Ayu</strong><p>Superhost · 7 years hosting · 18 reviews</p></div><span className="host-badge"><Check size={13} /> Identity verified</span></div><p className="detail-description">{stay.description}</p><div className="amenities-block"><h2>What this place offers</h2><div className="amenities-grid">{[['▣', 'Infinity pool'], ['♨', 'Spa services'], ['✈', 'Airport shuttle'], ['❄', 'Air conditioning'], ['⌁', 'Fast Wi-Fi'], ['☕', 'Breakfast'], ['♧', 'Fitness center'], ['♢', 'Beach access']].map(([icon, text]) => <div key={text}><span>{icon}</span>{text}</div>)}</div></div><div className="rooms-block"><h2>Available rooms</h2>{[stay.room, 'Standard King'].map((room, index) => <article className="room-card" key={room}><img src={imageUrl(index ? 'photo-1611892440504-42a792e24d32' : stay.image, 350)} alt={room} /><div><strong>{room}</strong><p>1 king bed · Ocean view · 2 guests</p><span>✓ Free cancellation · ✓ Breakfast included</span></div><div className="room-price"><strong>${stay.price - index * 36}</strong><a className="button button-primary button-small" href={`/reserve/${stay.slug}`}>Select room</a></div></article>)}</div></section>
          <aside className="booking-card"><span>From</span><div className="booking-price"><strong>${stay.price}</strong> / night</div><p className="rating"><Star size={14} fill="currentColor" /> {stay.rating} <span>· {stay.reviews} reviews</span></p><a className="button button-primary full-button" href={`/reserve/${stay.slug}`}>Check availability</a><small>You won’t be charged yet.</small><div className="booking-card-foot"><ShieldCheck size={15} /> Free cancellation available</div></aside>
        </div>
        <section className="location-preview" id="location"><div><h2>Great location</h2><p>{stay.area} · Peaceful location near the coast</p><a className="text-link" href="/destinations">Explore the area <ArrowRight size={14} /></a></div><div className="map-placeholder"><span><MapPin size={23} /></span><small>{stay.area}</small></div></section>
      </main>
    </PageShell>
  )
}
