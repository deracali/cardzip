import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, CheckCircle2, ChevronDown, FileText, ShieldCheck, UploadCloud, X, XCircle } from 'lucide-react'
import { userApi } from '../services/api'
import { mergeGiftCardTrades, subscribeToGiftCardTradeChanges } from '../services/giftCardRealtime'
import CardzipLoader from '../components/CardzipLoader'

const giftCardLogoDomains = {
  amazon: 'amazon.com',
  apple: 'apple.com',
  itunes: 'apple.com',
  googleplay: 'play.google.com',
  google: 'google.com',
  steam: 'steampowered.com',
  xbox: 'xbox.com',
  playstation: 'playstation.com',
  sonyplaystation: 'playstation.com',
  psn: 'playstation.com',
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  sephora: 'sephora.com',
  walmart: 'walmart.com',
  target: 'target.com',
  nike: 'nike.com',
  adidas: 'adidas.com',
  razer: 'razer.com',
  goldrazer: 'razer.com',
  goldrazor: 'razer.com',
  nintendo: 'nintendo.com',
  roblox: 'roblox.com',
  riotgames: 'riotgames.com',
  epicgames: 'epicgames.com',
  twitch: 'twitch.tv',
  disneyplus: 'disneyplus.com',
  disney: 'disney.com',
  footlocker: 'footlocker.com',
}

const getGiftCardLogo = (card) => {
  const brand = card.name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const matchedBrand = Object.keys(giftCardLogoDomains).find((key) => brand.includes(key))
  const domain = matchedBrand ? giftCardLogoDomains[matchedBrand] : null
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : card.logo
}

function GiftCardSelect({ label, value, options, onChange, disabled = false }) {
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="gift-card-select" ref={menuRef}>
      <button
        type="button"
        className={`gift-card-select-button ${open ? 'open' : ''}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedOption?.label || 'No options available'}</span>
        <ChevronDown size={16} className="gift-card-select-icon" aria-hidden="true" />
      </button>
      {open && (
        <div className="gift-card-select-menu" role="listbox" aria-label={label}>
          {options.length ? options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`gift-card-select-option ${option.value === value ? 'selected' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          )) : <span className="gift-card-select-empty">No options available</span>}
        </div>
      )}
    </div>
  )
}

export default function GiftCardTradePage({ onNavigate }) {
  const [giftCards, setGiftCards] = useState([])
  const [unavailableLogos, setUnavailableLogos] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [region, setRegion] = useState('')
  const [cardType, setCardType] = useState('Physical card')
  const [amount, setAmount] = useState('100.00')
  const [image, setImage] = useState(null)
  const [trades, setTrades] = useState([])
  const [trackerError, setTrackerError] = useState('')
  const [catalogError, setCatalogError] = useState('')
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    userApi.giftCardCatalog('?page=1&limit=100')
      .then((catalog) => {
        if (!active) return
        const cards = catalog.data || []
        setGiftCards(cards)
        setSelectedBrand(cards[0]?._id || '')
        setRegion(cards[0]?.types?.[0]?.country || '')
      })
      .catch((requestError) => { if (active) setCatalogError(requestError.message) })
      .finally(() => { if (active) setCatalogLoading(false) })
    userApi.giftCardTrades('?page=1&limit=2')
      .then((result) => { if (active) setTrades((current) => mergeGiftCardTrades(current, result.data || [], 2)) })
      .catch((requestError) => { if (active) setTrackerError(requestError.message) })
    return () => { active = false }
  }, [])

  useEffect(() => subscribeToGiftCardTradeChanges(
    (trade) => setTrades((current) => mergeGiftCardTrades(current, [trade], 2)),
    () => userApi.giftCardTrades('?page=1&limit=2')
      .then((result) => setTrades((current) => mergeGiftCardTrades(current, result.data || [], 2)))
      .catch((requestError) => setTrackerError(requestError.message)),
  ), [])

  const selectedCard = giftCards.find((card) => card._id === selectedBrand)
  const selectedType = selectedCard?.types?.find((type) => type.country === region)
  const latestTrade = trades[0] || null
  const parsedAmount = Number(amount)
  const estimatedPayout = selectedType && Number.isFinite(parsedAmount) && parsedAmount > 0
    ? Math.round(parsedAmount * Number(selectedType.rate) * 100) / 100
    : 0

  const selectBrand = (brandId) => {
    const card = giftCards.find((item) => item._id === brandId)
    setSelectedBrand(brandId)
    setRegion(card?.types?.[0]?.country || '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid card amount.')
      return
    }
    if (!image) {
      setError('Upload a clear image of your gift card before submitting.')
      return
    }
    if (!selectedCard || !selectedType) {
      setError('Select a gift card and region from the available catalog.')
      return
    }
    setSubmitting(true)
    setError('')
    const currency = selectedType.currency
    const body = new FormData()
    body.append('type', `${selectedCard.name} · ${region} · ${cardType}`)
    body.append('amount', String(parsedAmount))
    body.append('currency', currency)
    body.append('catalogCardId', selectedCard._id)
    body.append('region', region)
    body.append('cardType', cardType)
    body.append('ngnAmount', String(estimatedPayout))
    body.append('exchangeRate', String(selectedType.rate))
    body.append('images', image)
    try {
      const result = await userApi.submitGiftCardTrade(body)
      setTrades((current) => mergeGiftCardTrades(current, [result.giftCard], 2))
      setSubmissionResult({ success: true, message: 'Your gift card trade was submitted for review.' })
      setImage(null)
    } catch (requestError) {
      setSubmissionResult({ success: false, message: requestError.message || 'Your trade could not be submitted. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* Breadcrumb & Header */}
        <div className="page-header-row">
          <div>
            <div className="breadcrumb">Home / Gift Cards</div>
            <h1 className="page-title">Good cards. Great returns.</h1>
            <p className="page-subtitle">Trade your gift cards for naira with transparent rates and lightning-fast payouts.</p>
          </div>
          <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/trade-history')}>
            <span>Trade history</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="trade-grid">
          {/* Left Column: Form Card */}
          <form className="trade-card-main" onSubmit={handleSubmit}>
            <h2 className="card-section-title">Set up your trade</h2>
            <p className="card-section-desc">Get an exact payout estimate before you submit.</p>

            {/* Brand Selector */}
            <label className="field-label">Choose a gift card</label>
            {catalogLoading && <p role="status"><CardzipLoader compact label="Loading available gift cards" /></p>}
            {catalogError && <p className="wallet-notice error" role="alert">{catalogError}</p>}
            {!catalogLoading && !catalogError && giftCards.length === 0 && <p className="wallet-notice error" role="status">No gift cards are currently available. Please try again later.</p>}
            <div className="brand-selector-grid">
              {giftCards.map((b) => {
                const logo = getGiftCardLogo(b)
                return (
                  <button
                    type="button"
                    key={b._id}
                    className={`brand-btn ${selectedBrand === b._id ? 'selected' : ''}`}
                    onClick={() => selectBrand(b._id)}
                  >
                    {logo && !unavailableLogos.includes(b._id)
                      ? <img src={logo} alt={`${b.name} logo`} className="brand-emoji" onError={() => setUnavailableLogos((current) => [...current, b._id])} />
                      : <span className="brand-emoji brand-initials" aria-hidden="true">{b.name.slice(0, 2).toUpperCase()}</span>}
                    <span className="brand-name">{b.name}</span>
                    {selectedBrand === b._id && <Check size={14} className="check-icon" />}
                  </button>
                )
              })}
            </div>

            {/* Selects Row */}
            <div className="form-two-col">
              <div className="form-field">
                <label className="field-label">Card region</label>
                <GiftCardSelect
                  label="Card region"
                  value={region}
                  options={(selectedCard?.types || []).map((type) => ({
                    value: type.country,
                    label: `${type.country} (${type.currency})`,
                  }))}
                  onChange={setRegion}
                  disabled={!selectedCard?.types?.length}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Card type</label>
                <GiftCardSelect
                  label="Card type"
                  value={cardType}
                  options={[
                    { value: 'Physical card', label: 'Physical card' },
                    { value: 'E-code / Digital', label: 'E-code / Digital' },
                  ]}
                  onChange={setCardType}
                />
              </div>
            </div>

            {/* Amount Field */}
            <div className="form-field">
              <label className="field-label">Card amount ({selectedType?.currency || '—'})</label>
              <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="text-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="field-hint">{selectedType ? `Estimated payout: ₦${estimatedPayout.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · ₦${Number(selectedType.rate).toLocaleString('en-NG')} per ${selectedType.currency}` : 'Select a region with an active rate to calculate your payout.'} Final payout is confirmed after review.</span>
              </div>

              <label className="field-label">Upload card & receipt</label>
              <label className="dropzone-box">
                <UploadCloud size={24} className="upload-icon" />
                <p className="dropzone-text">{image ? 'Choose a different card image' : 'Click to choose a card image'}</p>
                <span className="dropzone-sub">JPG, PNG, or WEBP · Up to 10 MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => {
                  const selected = event.target.files?.[0]
                  if (selected && selected.size > 10 * 1024 * 1024) {
                    setImage(null)
                    setError('Choose an image no larger than 10 MB.')
                  } else {
                    setImage(selected || null)
                    setError('')
                  }
                }} />
              </label>
              <span className="field-hint">Upload a clear photo so Cardzip staff can review your trade.</span>

              {image && <div className="uploaded-file-row"><div className="file-info"><FileText size={16} className="file-icon" /><span>{image.name} · {(image.size / (1024 * 1024)).toFixed(1)} MB</span></div><Check size={16} className="file-check" /></div>}
              {error && <p className="wallet-notice error" role="alert">{error}</p>}
              <button type="submit" className="btn-emerald-submit" disabled={submitting}>
                <span>{submitting ? 'Submitting…' : 'Submit Trade'}</span>
                <ArrowUpRight size={16} />
              </button>

              <span className="disclaimer-text">By submitting, you confirm card ownership and agree to our trading terms.</span>
          </form>

          {/* Right Column: Rates & Tracker */}
          <div className="sidebar-col">
            {/* Today's Rates */}
            <div className="sidebar-card">
              <div className="sidebar-header">
                <h3 className="sidebar-title">Payout information</h3>
                <span className="sidebar-sub">{selectedType ? `₦${Number(selectedType.rate).toLocaleString('en-NG')} per ${selectedType.currency}` : 'Rate unavailable'}</span>
              </div>

              {selectedCard && getGiftCardLogo(selectedCard) && !unavailableLogos.includes(selectedCard._id) && <img className="selected-gift-card-logo" src={getGiftCardLogo(selectedCard)} alt={`${selectedCard.name} logo`} onError={() => setUnavailableLogos((current) => [...current, selectedCard._id])} />}
              <div className="gift-card-payout-estimate">
                <span>Estimated payout</span>
                <strong>₦{estimatedPayout.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                <small>Final payout may be adjusted after card review.</small>
              </div>
            </div>

            {/* Trade Tracker */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Your trade tracker</h3>
              <p className="sidebar-sub">Real-time updates, every step of the way.</p>

              {trackerError ? <p className="wallet-notice error" role="alert">{trackerError}</p> : latestTrade ? <div className="tracker-item active-tracker">
                <div className="tracker-top">
                  <span className="tracker-name">{latestTrade.type} · {latestTrade.amount} {latestTrade.currency}</span>
                  <span className={`status-badge-orange ${latestTrade.status}`}>{latestTrade.status.toUpperCase()}</span>
                </div>
                <div className="tracker-meta">
                  <span>#{latestTrade._id} · {new Date(latestTrade.createdAt).toLocaleString()}</span>
                  <span className="tracker-val">{latestTrade.ngnAmount ? `₦${Number(latestTrade.ngnAmount).toLocaleString('en-NG')}` : 'Awaiting review'}</span>
                </div>
                <div className="tracker-progress-bar">
                  <div className="progress-fill" style={{ width: latestTrade.status === 'successful' ? '100%' : latestTrade.status === 'failed' ? '100%' : '55%' }}></div>
                </div>
                <div className="progress-labels">
                  <span>Submitted</span>
                  <span className={latestTrade.status === 'pending' ? 'active-step' : ''}>Reviewing</span>
                  <span>{latestTrade.status === 'failed' ? 'Rejected' : latestTrade.status === 'successful' ? 'Successful' : 'Complete'}</span>
                </div>
              </div> : <p className="sidebar-sub">Your latest trade will appear here after submission.</p>}

              {trades.slice(1, 2).map((trade) => <div className="tracker-item" key={trade._id}>
                <div className="tracker-top">
                  <span className="tracker-name">{trade.type} · {trade.amount} {trade.currency}</span>
                  <span className={`status-badge-orange ${trade.status}`}>{trade.status.toUpperCase()}</span>
                </div>
                <div className="tracker-meta">
                  <span>#{trade._id} · {new Date(trade.createdAt).toLocaleString()}</span>
                  <span className="tracker-val">{trade.ngnAmount ? `₦${Number(trade.ngnAmount).toLocaleString('en-NG')}` : 'Awaiting review'}</span>
                </div>
              </div>)}
            </div>

            {/* Quality Hint Banner */}
            <div className="quality-hint-card">
              <ShieldCheck size={20} className="shield-icon" />
              <div>
                <h4 className="hint-title">A cleaner photo. A faster payout.</h4>
                <p className="hint-text">Keep the card code and receipt legible. Your files are encrypted and only used to verify this trade.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {submissionResult && <div className="payment-choice-backdrop order-result-backdrop">
        <section className="payment-choice-dialog order-result-dialog" role="dialog" aria-modal="true" aria-labelledby="trade-submission-result-title">
          <button type="button" className="bill-payment-close" aria-label="Close trade submission result" onClick={() => setSubmissionResult(null)}><X size={18} /></button>
          <div className={`bill-result-icon ${submissionResult.success ? 'success' : 'failed'}`}>
            {submissionResult.success ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          <h2 id="trade-submission-result-title">{submissionResult.success ? 'Trade submitted' : 'Trade submission failed'}</h2>
          <p>{submissionResult.message}</p>
          <div className="order-result-actions">
            {submissionResult.success ? <>
              <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.('/trade-history')}>View trade history</button>
              <button type="button" className="btn-secondary-pill" onClick={() => setSubmissionResult(null)}>Close</button>
            </> : <button type="button" className="btn-emerald-submit" onClick={() => setSubmissionResult(null)}>Try again</button>}
          </div>
        </section>
      </div>}

      {/* Dark Footer Strip */}
      <footer className="simple-footer">
        <span>© 2026 Cardzip. All rights reserved.</span>
        <div className="footer-right">
          <a href="#privacy">Privacy policy</a>
          <a href="#terms">Terms of service</a>
          <span className="green-dot-status">● All systems operational</span>
        </div>
      </footer>
    </div>
  )
}