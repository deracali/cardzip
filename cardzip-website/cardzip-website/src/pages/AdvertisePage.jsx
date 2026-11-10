import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Megaphone, Upload } from 'lucide-react'
import { userApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'
import './AdvertisePage.css'

const formatNaira = (amount) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(Number(amount || 0))

const formatDate = (value) => new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date(value))

export default function AdvertisePage({ onNavigate, showCampaignsOnly = false }) {
  const [placements, setPlacements] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [placementKey, setPlacementKey] = useState('')
  const [months, setMonths] = useState(1)
  const [title, setTitle] = useState('')
  const [copy, setCopy] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      showCampaignsOnly ? Promise.resolve({ data: [] }) : userApi.adPlacements(),
      userApi.myAdCampaigns('?page=1&limit=20'),
    ]).then(([placementResult, campaignResult]) => {
      if (!active) return
      const nextPlacements = placementResult.data || []
      setPlacements(nextPlacements)
      setPlacementKey(nextPlacements[0]?.key || '')
      setCampaigns(campaignResult.data || [])
    }).catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [showCampaignsOnly])

  const placement = placements.find((item) => item.key === placementKey)
  const price = useMemo(
    () => Number(placement?.durationPrices?.find((item) => Number(item.months) === months)?.price || 0),
    [months, placement],
  )

  const uploadImage = async (file) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const result = await userApi.uploadAdCreative(file)
      setImageUrl(result.data.url)
    } catch (requestError) {
      setError(requestError.message || 'Could not upload your banner.')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!imageUrl || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const reservation = await userApi.createAdCampaign({
        placementKey,
        months,
        title,
        copy,
        imageUrl,
        destinationUrl,
      })
      const payment = await userApi.initializeBannerPayment(reservation.data.campaignId)
      window.location.assign(payment.data.authorizationUrl)
    } catch (requestError) {
      setError(requestError.message || 'Could not start your advertisement checkout.')
      setSubmitting(false)
    }
  }

  return (
    <main className="advertise-page">
      <div className="advertise-shell">
        <button type="button" className="advertise-back" onClick={() => onNavigate?.('/shop')}><ArrowLeft size={15} /> Back to market</button>
        <header className="advertise-heading">
          <span className="advertise-eyebrow"><Megaphone size={14} /> CARDZIP ADVERTISING</span>
          <h1>{showCampaignsOnly ? 'Your campaigns' : 'Put your business in the spotlight.'}</h1>
          <p>{showCampaignsOnly ? 'Track payment, review, and scheduled run dates for your Cardzip campaigns.' : 'Choose a premium website or app placement, upload your creative, and reach customers across Cardzip.'}</p>
        </header>

        {loading ? <p className="advertise-state" role="status"><CardzipLoader compact label="Loading advertising options" /></p> : (
          <div className={`advertise-layout${showCampaignsOnly ? ' campaigns-only' : ''}`}>
            {!showCampaignsOnly && <form className="advertise-form" onSubmit={submit}>
              <div className="advertise-form-title"><span><Megaphone size={18} /></span><div><strong>Build your campaign</strong><small>Your banner goes live after payment and creative approval.</small></div></div>
              <fieldset className="advertise-placement-picker">
                <legend>Choose where your ad appears</legend>
                {placements.length === 0 ? <p>No ad locations are configured yet. Please check back shortly.</p> : placements.map((item) => (
                  <button type="button" key={item.key} className={`advertise-placement-option${placementKey === item.key ? ' selected' : ''}`} onClick={() => { setPlacementKey(item.key); setMonths(1) }}>
                    <span className="advertise-placement-option-top"><strong>{item.name}</strong><small>{item.platform === 'app' ? 'MOBILE APP' : 'WEBSITE'}</small></span>
                    <span>{item.location}</span>
                    <small>{item.active ? 'Placement open' : 'Placement setup in progress'}</small>
                  </button>
                ))}
              </fieldset>
              {placement && <div className="advertise-placement-details"><strong>{placement.location}</strong><span>{placement.description}</span><span><CalendarDays size={14} /> Next start: {formatDate(placement.nextAvailableAt)}</span></div>}
              <div className="advertise-duration-options" role="group" aria-label="Campaign duration">
                {[1, 12].map((duration) => {
                  const configuredPrice = placement?.durationPrices?.find((item) => Number(item.months) === duration)?.price
                  return <button type="button" key={duration} className={months === duration ? 'selected' : ''} onClick={() => setMonths(duration)}><span>{duration} {duration === 1 ? 'month' : 'months'}</span><strong>{configuredPrice > 0 ? formatNaira(configuredPrice) : 'Price being set'}</strong></button>
                })}
              </div>
              <label>Ad headline<input required minLength={3} maxLength={90} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A short, memorable headline" /></label>
              <label>Ad description<textarea required minLength={8} maxLength={220} rows={3} value={copy} onChange={(event) => setCopy(event.target.value)} placeholder="Tell customers what makes your offer worth a look." /></label>
              <label>Destination link <span>Optional</span><input type="url" maxLength={2048} value={destinationUrl} onChange={(event) => setDestinationUrl(event.target.value)} placeholder="https://your-business.com" /></label>
              <label className="advertise-upload"><span><Upload size={16} /> Banner image <b>JPEG, PNG or WebP · up to 8 MB</b></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event.target.files?.[0])} /><small>{uploading ? 'Uploading image securely…' : imageUrl ? 'Image uploaded. You can choose another to replace it.' : 'Use a clear, high-quality image that matches your selected placement.'}</small></label>
              {imageUrl && <img className="advertise-image-preview" src={imageUrl} alt="Advertisement preview" />}
              {price > 0 && <div className="advertise-total"><span>Total due securely via Paystack</span><strong>{formatNaira(price)}</strong></div>}
              {placement && (!placement.active || price < 1) && <p className="advertise-setup-note" role="status">This ad location is shown so you can plan your campaign. Cardzip is setting up availability and pricing before checkout opens.</p>}
              {error && <p className="advertise-error" role="alert">{error}</p>}
              <button className="advertise-submit" type="submit" disabled={submitting || uploading || !imageUrl || !placementKey || !placement?.active || price < 1}>{submitting ? 'Preparing secure checkout…' : <>Continue to Paystack <ArrowRight size={16} /></>}</button>
              <small className="advertise-footnote">Your selected dates are reserved after payment. All creative is reviewed before it can appear. Your campaign is scheduled to the next available start date.</small>
            </form>}
            <section className="advertise-campaigns">
              <div className="advertise-campaigns-heading"><div><span>CAMPAIGN ACTIVITY</span><h2>Your advertisements</h2></div>{!showCampaignsOnly && <button type="button" onClick={() => onNavigate?.('/my-adverts')}>View all <ArrowRight size={14} /></button>}</div>
              {campaigns.length === 0 ? <div className="advertise-empty"><CheckCircle2 size={21} /><strong>No campaigns yet</strong><span>Your paid campaigns and scheduled run dates will appear here.</span></div> : campaigns.map((campaign) => {
                const displayStatus = campaign.displayStatus || campaign.status
                return (
                  <article className="advertise-campaign-card" key={campaign._id}>
                    {campaign.imageUrl && <img src={campaign.imageUrl} alt="" />}
                    <div><span className={`advertise-status ${displayStatus}`}>{displayStatus === 'expired' ? 'Expired' : displayStatus.replaceAll('_', ' ')}</span><h3>{campaign.title}</h3><p>{campaign.placementName} · {campaign.months} {campaign.months === 1 ? 'month' : 'months'}</p><small>Scheduled {formatDate(campaign.startAt)} – {formatDate(campaign.endAt)}</small><small className="advertise-performance">Analytics: {campaign.impressions || 0} unique impressions · {campaign.clicks || 0} unique clicks · {campaign.clickThroughRate || 0}% CTR</small>{campaign.reviewNote && <small className="advertise-review-note">{campaign.reviewNote}</small>}</div>
                  </article>
                )
              })}
              {!showCampaignsOnly && error && <p className="advertise-error" role="alert">{error}</p>}
              {showCampaignsOnly && error && <p className="advertise-error" role="alert">{error}</p>}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

export function MyAdvertsPage(props) {
  return <AdvertisePage {...props} showCampaignsOnly />
}
