import { useEffect, useState } from 'react'
import { userApi } from '../services/api'
import './AdvertisementBanner.css'

const fallbackCampaigns = [
  {
    image: '/advertising/business.jpg',
    eyebrow: 'GROW YOUR BUSINESS',
    title: 'Your next customer is already browsing.',
    copy: 'Open a Cardzip business shop and put your products in front of more customers.',
    action: 'Explore business shops',
    destination: '/shops',
    imageAlt: 'A modern workspace for a small business',
  },
  {
    image: '/advertising/community.jpg',
    eyebrow: 'CARDZIP COMMUNITY',
    title: 'Find your people. Build your community.',
    copy: 'Discover community listings, local services, and new ways to connect.',
    action: 'Explore the community',
    destination: '/community-market',
    imageAlt: 'People coming together at a community event',
  },
  {
    image: '/advertising/digital.jpg',
    eyebrow: 'WEBSITES & APPS',
    title: 'Discover your next digital project.',
    copy: 'Browse websites, apps, and source-code templates with secure downloads.',
    action: 'Browse websites & apps',
    destination: '/digital-assets',
    imageAlt: 'A laptop displaying a web development workspace',
  },
]

const getInitialCampaignIndex = (placementKey) => {
  if (placementKey.includes('sidebar') || placementKey === 'app-home-hero') return 1
  if (placementKey === 'app-market-banner') return 2
  return 0
}

export default function AdvertisementBanner({ placementKey, onNavigate, fallbackOnly = false }) {
  const [ad, setAd] = useState(null)
  const [fallbackIndex, setFallbackIndex] = useState(() => getInitialCampaignIndex(placementKey))
  const isSidebar = placementKey.includes('sidebar')

  useEffect(() => {
    if (fallbackOnly) return undefined
    let active = true
    userApi.currentAd(placementKey)
      .then((result) => { if (active) setAd(result.data || null) })
      .catch((error) => console.error(`Could not load ${placementKey} advertisement:`, error))
    return () => { active = false }
  }, [fallbackOnly, placementKey])

  useEffect(() => {
    if (ad?.imageUrl) return undefined
    const timer = window.setInterval(() => {
      setFallbackIndex((current) => (current + 1) % fallbackCampaigns.length)
    }, 8000)
    return () => window.clearInterval(timer)
  }, [ad?.imageUrl])

  useEffect(() => {
    if (fallbackOnly || !ad?._id) return
    userApi.trackAdCampaignEvent(ad._id, 'impression')
      .catch((error) => console.error('Could not record advertisement impression:', error))
  }, [ad?._id, fallbackOnly])

  const handleAdvertiseClick = (event) => {
    if (fallbackOnly || onNavigate) {
      event.preventDefault()
      onNavigate?.(fallbackCampaigns[fallbackIndex].destination)
    }
  }
  if (!ad?.imageUrl) {
    const campaign = fallbackCampaigns[fallbackIndex]
    return (
      <aside className={`advertisement-banner advertisement-placeholder${isSidebar ? ' advertisement-banner-side' : ''}`} aria-label={campaign.eyebrow}>
        <a href={campaign.destination} onClick={handleAdvertiseClick}>
          <img src={campaign.image} alt={campaign.imageAlt} loading="lazy" />
          <span className="advertisement-copy">
            <small>{campaign.eyebrow}</small>
            <strong>{campaign.title}</strong>
            <span>{campaign.copy}</span>
            <b>{campaign.action} <span aria-hidden="true">→</span></b>
          </span>
        </a>
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
