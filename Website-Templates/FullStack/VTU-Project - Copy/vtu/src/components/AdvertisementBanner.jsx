import { useEffect, useState } from 'react'
import { userApi } from '../services/api'
import './AdvertisementBanner.css'

export default function AdvertisementBanner({ placementKey, onNavigate }) {
  const [ad, setAd] = useState(null)
  const isSidebar = placementKey.includes('sidebar')

  useEffect(() => {
    let active = true
    userApi.currentAd(placementKey)
      .then((result) => { if (active) setAd(result.data || null) })
      .catch((error) => console.error(`Could not load ${placementKey} advertisement:`, error))
    return () => { active = false }
  }, [placementKey])

  useEffect(() => {
    if (!ad?._id) return
    userApi.trackAdCampaignEvent(ad._id, 'impression')
      .catch((error) => console.error('Could not record advertisement impression:', error))
  }, [ad?._id])

  const handleAdvertiseClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('/advertise')
  }
  if (!ad?.imageUrl) {
    return (
      <aside className={`advertisement-banner advertisement-placeholder${isSidebar ? ' advertisement-banner-side' : ''}`} aria-label="Advertising opportunity">
        <div>
          <span className="advertisement-placeholder-mark" aria-hidden="true">C</span>
          <span className="advertisement-copy">
            <small>FEATURED ADVERTISEMENT</small>
            <strong>Your business could be here</strong>
            <span>Reach customers across Cardzip with a sponsored banner placement.</span>
            <a href="/advertise" onClick={handleAdvertiseClick}>Explore ad placements <span aria-hidden="true">→</span></a>
          </span>
        </div>
      </aside>
    )
  }
  const content = (
    <>
      <img src={ad.imageUrl} alt="" loading="lazy" />
      <span className="advertisement-copy"><small>SPONSORED</small><strong>{ad.title}</strong><span>{ad.copy}</span><b>Learn more <span aria-hidden="true">→</span></b></span>
    </>
  )
  return (
    <aside className={`advertisement-banner${isSidebar ? ' advertisement-banner-side' : ''}`} aria-label={`Sponsored: ${ad.title}`}>
      {ad.destinationUrl
        ? <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer" onClick={() => userApi.trackAdCampaignEvent(ad._id, 'click').catch((error) => console.error('Could not record advertisement click:', error))}>{content}</a>
        : <div>{content}</div>}
    </aside>
  )
}
