import { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import { imageUrl } from '../data/stays'
import { getSavedStaySlugs, toggleSavedStay } from '../services/savedStays'
import { getSession } from '../services/escapesApi'

export default function StayCard({ stay }) {
  const session = getSession()
  const [saved, setSaved] = useState(() => getSavedStaySlugs(session?.user.id).includes(stay.slug))
  function toggle() {
    if (!session) {
      window.location.assign('/signin?next=%2Fstays')
      return
    }
    setSaved(toggleSavedStay(session.user.id, stay.slug).includes(stay.slug))
  }
  return (
    <article className="stay-card">
      <a className="stay-image" href={`/stays/${stay.slug}`} aria-label={`View ${stay.name}`}>
        <img src={imageUrl(stay.image, 700)} alt={stay.name} loading="lazy" />
        <span className="stay-tag">{stay.type}</span>
      </a>
      <button className={`save-button${saved ? ' is-saved' : ''}`} type="button" aria-label={saved ? 'Remove from saved stays' : 'Save this stay'} aria-pressed={saved} onClick={toggle}><Heart size={16} fill={saved ? 'currentColor' : 'none'} /></button>
      <div className="stay-card-content">
        <div className="stay-title-row"><div><a className="stay-name" href={`/stays/${stay.slug}`}>{stay.shortName}</a><p>{stay.area}</p></div><span className="rating"><Star size={13} fill="currentColor" /> {stay.rating}</span></div>
        <div className="stay-card-bottom"><p><strong>${stay.price}</strong> <span>/ night</span></p><a className="button button-dark button-small" href={`/stays/${stay.slug}`}>View stay</a></div>
      </div>
    </article>
  )
}
