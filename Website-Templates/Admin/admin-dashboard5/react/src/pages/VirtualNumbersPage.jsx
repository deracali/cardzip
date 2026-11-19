import { useEffect, useState } from 'react'
import { ArrowUpRight, Copy, ChevronDown, Check, RefreshCw, Search, X } from 'lucide-react'
import { sms4Api } from '../services/api'

const listFrom = (response, keys) => {
  if (Array.isArray(response)) return response
  if (!response || typeof response !== 'object') return []
  for (const key of keys) if (Array.isArray(response[key])) return response[key]
  return response.data && response.data !== response ? listFrom(response.data, keys) : []
}

const valueOf = (item, keys) => {
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  if (!item || typeof item !== 'object') return ''
  for (const key of keys) if (item[key] !== undefined && item[key] !== null) return String(item[key])
  return ''
}

const isUnitedStatesArea = (area) => {
  const identifiers = ['name', 'location', 'country', 'area', 'label', 'countryCode', 'code', 'iso2', 'isoCode']
    .map((key) => valueOf(area, [key]).trim().toLowerCase())
  return identifiers.some((identifier) =>
    ['us', 'usa', 'united states', 'united states of america'].includes(identifier)
      || identifier.includes('united states')
      || /(^|[^a-z])usa([^a-z]|$)/.test(identifier))
}

const formatPrice = (pricing) => {
  if (pricing === null || pricing === undefined) return '—'
  if (typeof pricing === 'string' || typeof pricing === 'number') return String(pricing)
  const candidates = [pricing, pricing.data, pricing.pricing, pricing.result].filter((candidate) => candidate && typeof candidate === 'object')
  const nairaAmount = candidates.map((candidate) => valueOf(candidate, ['price_ngn', 'priceNGN', 'amountNaira']))
    .find(Boolean) || ''
  const amount = nairaAmount || candidates.map((candidate) => valueOf(candidate, ['price', 'amount', 'cost', 'total', 'rate', 'priceUSD', 'amountNaira', 'sellingPrice']))
    .find(Boolean) || ''
  const currency = candidates.map((candidate) => valueOf(candidate, ['currency', 'currencyCode', 'currencySymbol'])).find(Boolean) || ''
  if (!amount) return '—'
  if (nairaAmount) {
    const numericAmount = Number(nairaAmount)
    return `₦${Number.isFinite(numericAmount) ? new Intl.NumberFormat('en-NG', { maximumFractionDigits: 2 }).format(numericAmount) : nairaAmount}`
  }
  return `${currency ? `${currency} ` : ''}${amount}`
}

export default function VirtualNumbersPage() {
  const [copied, setCopied] = useState(false)
  const [areas, setAreas] = useState([])
  const [apps, setApps] = useState([])
  const [durations, setDurations] = useState([])
  const [rentals, setRentals] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedApp, setSelectedApp] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('')
  const [selectedRentalId, setSelectedRentalId] = useState('')
  const [durationPrices, setDurationPrices] = useState({})
  const [pricingLoading, setPricingLoading] = useState(false)
  const [appPickerOpen, setAppPickerOpen] = useState(false)
  const [appSearch, setAppSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [showPaymentChoice, setShowPaymentChoice] = useState(false)
  const [purchaseOutcome, setPurchaseOutcome] = useState('')
  const [purchaseMessage, setPurchaseMessage] = useState('')
  const [purchaseNumber, setPurchaseNumber] = useState('')
  const [autoRenew, setAutoRenew] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const appName = (app) => valueOf(app, ['appName', 'name', 'app', 'service', 'code'])
  const areaName = (area) => valueOf(area, ['name', 'location', 'country', 'area', 'label', 'code', 'id'])
  const areaValue = (area) => valueOf(area, ['area', 'id', 'code', 'value', 'name', 'location', 'country'])
  const durationValue = (duration) => valueOf(duration, ['duration', 'value', 'id'])
  const rentalIdOf = (rental) => valueOf(rental, ['rentalId', 'id'])
  const selectedRental = rentals.find((rental) => rentalIdOf(rental) === selectedRentalId)
  const phoneNumber = valueOf(selectedRental, ['phoneNumber', 'number', 'phone'])
  const selectedPrice = formatPrice(durationPrices[selectedDuration])
  const orderedApps = [...apps].sort((first, second) => {
    const priority = (name) => {
      const normalized = name.toLowerCase()
      if (normalized.includes('whatsapp')) return 0
      if (normalized.includes('telegram')) return 1
      if (normalized.includes('google')) return 2
      return 3
    }
    return priority(appName(first)) - priority(appName(second))
  }).filter((app) => appName(app).toLowerCase().includes(appSearch.trim().toLowerCase()))

  const loadRentals = async () => {
    const response = await sms4Api.numbers(true)
    const nextRentals = listFrom(response, ['rentals', 'numbers', 'items', 'results'])
    setRentals(nextRentals)
    setSelectedRentalId((currentId) => nextRentals.some((rental) => rentalIdOf(rental) === currentId)
      ? currentId
      : rentalIdOf(nextRentals[0]))
  }

  useEffect(() => {
    let mounted = true
    Promise.all([sms4Api.areas(), sms4Api.apps(), sms4Api.numbers(true)])
      .then(([areaResponse, appResponse, rentalResponse]) => {
        if (!mounted) return
        const nextAreas = listFrom(areaResponse, ['areas', 'locations', 'items', 'results'])
        const nextApps = listFrom(appResponse, ['apps', 'applications', 'items', 'results'])
        const nextRentals = listFrom(rentalResponse, ['rentals', 'numbers', 'items', 'results'])
        setAreas(nextAreas)
        setApps(nextApps)
        setRentals(nextRentals)
        setSelectedArea(areaValue(nextAreas.find(isUnitedStatesArea) || nextAreas[0]))
        setSelectedApp(appName(nextApps[0]))
        setSelectedRentalId(rentalIdOf(nextRentals[0]))
        setAutoRenew(Boolean(nextRentals[0]?.auto_renew ?? nextRentals[0]?.autoRenew))
      })
      .catch((requestError) => { if (mounted) setError(requestError.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedApp) {
      setDurations([])
      setSelectedDuration('')
      setDurationPrices({})
      return undefined
    }
    let mounted = true
    setDurations([])
    setDurationPrices({})
    sms4Api.durations(selectedApp)
      .then((response) => {
        if (!mounted) return
        const nextDurations = listFrom(response, ['durations', 'items', 'results'])
        setDurations(nextDurations)
        setSelectedDuration(durationValue(nextDurations[0]))
      })
      .catch((requestError) => { if (mounted) setError(requestError.message) })
    return () => { mounted = false }
  }, [selectedApp])

  useEffect(() => {
    if (!selectedApp) return undefined
    let mounted = true
    setPricingLoading(true)
    const priceOptions = durations.length ? durations : [{ duration: '' }]
    Promise.all(priceOptions.map(async (duration) => {
      const durationKey = durationValue(duration)
      try {
        return [durationKey, await sms4Api.pricing(selectedApp, durationKey)]
      } catch {
        return [durationKey, null]
      }
    }))
      .then((entries) => { if (mounted) setDurationPrices(Object.fromEntries(entries)) })
      .finally(() => { if (mounted) setPricingLoading(false) })
    return () => { mounted = false }
  }, [selectedApp, durations])

  useEffect(() => {
    if (!selectedRentalId) {
      setMessages([])
      return undefined
    }
    let mounted = true
    const fetchMessages = () => sms4Api.sms(selectedRentalId)
      .then((response) => { if (mounted) setMessages(listFrom(response, ['messages', 'sms', 'items', 'results'])) })
      .catch((requestError) => { if (mounted) setError(requestError.message) })
    fetchMessages()
    const interval = window.setInterval(fetchMessages, 15000)
    return () => { mounted = false; window.clearInterval(interval) }
  }, [selectedRentalId])

  useEffect(() => {
    setAutoRenew(Boolean(selectedRental?.auto_renew ?? selectedRental?.autoRenew))
  }, [selectedRental])

  const handleBuy = async () => {
    if (!selectedApp) return
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      const result = await sms4Api.buy({
        appName: selectedApp,
        time: 1,
        ...(selectedDuration ? { duration: selectedDuration } : {}),
        ...(selectedArea ? { area: selectedArea } : {}),
        auto_renew: autoRenew,
        paymentMethod,
      })
      if (paymentMethod === 'paystack') {
        const checkoutUrl = result.data?.authorizationUrl
        if (!checkoutUrl) throw new Error('Paystack checkout did not return a payment link.')
        window.location.assign(checkoutUrl)
        return
      }
      const transaction = result.data || {}
      if (transaction.status !== 'completed') {
        throw new Error(transaction.failureReason || 'Your rental could not be completed.')
      }
      setPurchaseOutcome('success')
      setPurchaseMessage('Your rental is active and ready to receive SMS.')
      setPurchaseNumber(transaction.phoneNumber || '')
      setNotice('')
      try {
        await loadRentals()
      } catch (refreshError) {
        setError(refreshError.message)
      }
    } catch (requestError) {
      const insufficientFunds = paymentMethod === 'wallet' && /insufficient|not enough.*(?:fund|balance)|(?:fund|balance).*(?:low|insufficient|not enough)/i.test(requestError.message)
      setPurchaseOutcome(insufficientFunds ? 'insufficient' : 'failed')
      setPurchaseMessage(requestError.message || 'Your virtual-number purchase could not be completed.')
      setPurchaseNumber('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = () => {
    if (!phoneNumber) return
    navigator.clipboard.writeText(phoneNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRentalAction = async (action, successMessage) => {
    if (!selectedRentalId) return
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(successMessage)
      await loadRentals()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* Header Navigation */}
        <div className="page-header-row">
          <div>
            <div className="breadcrumb">Home / Virtual Numbers</div>
            <h1 className="page-title">A new number. More possibilities.</h1>
            <p className="page-subtitle">Rent a number, receive verification codes and keep your personal number personal.</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="virtual-grid">
          {/* Left Column: Rental Form */}
          <div className="trade-card-main">
            <h2 className="card-section-title">Rent a virtual number</h2>
            <p className="card-section-desc">Choose your country, app and rental duration.</p>
            {error && <p className="field-hint" role="alert">{error}</p>}
            {notice && <p className="field-hint green-txt" role="status">{notice}</p>}

            <label className="field-label">Select a country</label>
            <div className="sms4-choice-grid area-choice-grid">
              {areas.map((area, index) => {
                const optionValue = areaValue(area)
                const selected = selectedArea === optionValue
                const isUnitedStates = isUnitedStatesArea(area)
                return <button type="button" key={`${optionValue}-${index}`} className={`country-rent-card ${selected ? 'selected' : ''}`} aria-pressed={selected} disabled={loading} onClick={() => setSelectedArea(optionValue)}>
                  <span className="country-rent-name">{isUnitedStates && <svg className="country-flag" viewBox="0 0 19 13" role="img" aria-label="United States flag">
                    <rect width="19" height="13" fill="#fff" />
                    <path fill="#b22234" d="M0 0h19v1H0zm0 2h19v1H0zm0 2h19v1H0zm0 2h19v1H0zm0 2h19v1H0zm0 2h19v1H0zm0 2h19v1H0z" />
                    <rect width="8" height="7" fill="#3c3b6e" />
                    <path fill="#fff" d="M1 1h.7v.7H1zm2 0h.7v.7H3zm2 0h.7v.7H5zm2 0h.7v.7H7zM2 2.5h.7v.7H2zm2 0h.7v.7H4zm2 0h.7v.7H6zM1 4h.7v.7H1zm2 0h.7v.7H3zm2 0h.7v.7H5zm2 0h.7v.7H7zM2 5.5h.7v.7H2zm2 0h.7v.7H4zm2 0h.7v.7H6z" />
                    <path fill="none" stroke="#cbd5e1" strokeWidth=".35" d="M.2.2h18.6v12.6H.2z" />
                  </svg>}{areaName(area)}</span>
                  <span className="rent-sub">{valueOf(area, ['countryCode', 'dialCode', 'code'])}</span>
                  {selected && <Check size={16} className="sms4-choice-check" />}
                </button>
              })}
              {areas.length === 0 && <p className="field-hint">{loading ? 'Loading areas…' : 'No areas available.'}</p>}
            </div>

            <div className="form-field">
              <label className="field-label">Choose an app</label>
              <div className="sms4-app-picker">
                <button type="button" className="sms4-app-select" aria-haspopup="listbox" aria-expanded={appPickerOpen} disabled={loading || apps.length === 0} onClick={() => setAppPickerOpen((open) => !open)}>
                  <span>{selectedApp || (loading ? 'Loading apps…' : 'Select an app')}</span>
                  <ChevronDown size={16} />
                </button>
                {appPickerOpen && <div className="sms4-app-menu">
                  <label className="sms4-app-search">
                    <Search size={15} aria-hidden="true" />
                    <input type="search" value={appSearch} onChange={(event) => setAppSearch(event.target.value)} placeholder="Search apps" autoFocus />
                  </label>
                  <div className="sms4-app-options" role="listbox" aria-label="Available apps">
                    {orderedApps.map((app, index) => {
                      const name = appName(app)
                      const selected = selectedApp === name
                      const stock = valueOf(app, ['stock', 'available', 'availableStock', 'count'])
                      return <button type="button" role="option" aria-selected={selected} key={`${name}-${index}`} className={`sms4-app-option ${selected ? 'selected' : ''}`} onClick={() => {
                        setSelectedApp(name)
                        setSelectedDuration('')
                        setAppPickerOpen(false)
                        setAppSearch('')
                      }}>
                        <span><strong>{name}</strong>{stock && <small>{stock} available</small>}</span>
                        {selected && <Check size={15} />}
                      </button>
                    })}
                    {orderedApps.length === 0 && <p className="sms4-app-empty">No matching apps.</p>}
                  </div>
                </div>}
              </div>
              <span className="field-hint">Dedicated verification number for your selected app.</span>
            </div>

            <div className="form-field">
              <label className="field-label">Choose a duration</label>
              <div className="sms4-choice-grid sms4-duration-grid" role="group" aria-label="Available rental durations">
                {durations.map((duration, index) => {
                  const optionValue = durationValue(duration)
                  const label = valueOf(duration, ['label', 'name', 'duration', 'value'])
                  const selected = selectedDuration === optionValue
                  return <button
                    type="button"
                    key={`${optionValue}-${index}`}
                    className={`sms4-duration-card ${selected ? 'selected' : ''}`}
                    aria-pressed={selected}
                    disabled={!optionValue}
                    onClick={() => setSelectedDuration(optionValue)}
                  >
                    <span>{label || `Duration ${index + 1}`}</span>
                    <strong>{pricingLoading ? 'Loading price…' : formatPrice(durationPrices[optionValue])}</strong>
                    {selected && <Check size={15} className="sms4-choice-check" />}
                  </button>
                })}
                {durations.length === 0 && <p className="field-hint">{selectedApp ? 'Loading provider durations…' : 'Choose an app to view durations.'}</p>}
              </div>
            </div>

            <button type="button" role="checkbox" aria-checked={autoRenew} className={`sms4-toggle-card ${autoRenew ? 'selected' : ''}`} onClick={() => setAutoRenew((enabled) => !enabled)}>
              <span className="sms4-checkbox-box">{autoRenew && <Check size={13} />}</span>
              <span><strong>Automatically renew</strong><small>Renew this number when its term ends.</small></span>
            </button>

            <div className="price-breakdown">
              <div className="price-row"><span>Selected duration</span><span>{selectedDuration || 'Choose a duration'}</span></div>
              <div className="price-row total"><span>Price preview</span><span className="total-val">{pricingLoading ? 'Loading…' : selectedPrice}</span></div>
            </div>

            <button className="btn-emerald-submit" onClick={() => setShowPaymentChoice(true)} disabled={submitting || loading || pricingLoading || !selectedApp}>
              <span>{submitting ? 'Processing…' : `Rent Number · ${pricingLoading ? 'Checking price…' : selectedPrice}`}</span>
              <ArrowUpRight size={16} />
            </button>

            <span className="disclaimer-text">Rental availability and pricing are provided live by Fleexa.</span>
          </div>

          {/* Right Column: Live Number & SMS Inbox */}
          <div className="sidebar-col">
            {/* Active Number Box */}
            <div className="sidebar-card">
              <div className="active-header-row">
                <span className="sidebar-title">Your active number</span>
                <span className="status-badge-green">{selectedRental ? '● ACTIVE RENTAL' : 'NO ACTIVE RENTAL'}</span>
              </div>

              {rentals.length > 1 && <div className="form-field">
                <label className="field-label">Active rentals</label>
                <div className="select-wrapper">
                  <select value={selectedRentalId} onChange={(event) => setSelectedRentalId(event.target.value)}>
                    {rentals.map((rental, index) => <option key={`${rentalIdOf(rental)}-${index}`} value={rentalIdOf(rental)}>{valueOf(rental, ['phoneNumber', 'number', 'phone']) || rentalIdOf(rental)}</option>)}
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
              </div>}

              <div className="number-display-row">
                <h2 className="number-val">{phoneNumber || (loading ? 'Loading…' : 'No number yet')}</h2>
                <button className="btn-copy-num" onClick={handleCopy} disabled={!phoneNumber}>
                  <span>{copied ? 'Copied!' : 'Copy Number'}</span>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>

              {selectedRental && <>
                <span className="number-sub-details">{valueOf(selectedRental, ['area', 'location', 'country'])} · {valueOf(selectedRental, ['appName', 'app', 'service'])} · {valueOf(selectedRental, ['expiresAt', 'expiry', 'expiration'])}</span>
                <div className="time-remaining-bar">
                  <button type="button" role="checkbox" aria-checked={autoRenew} className={`sms4-toggle-card compact ${autoRenew ? 'selected' : ''}`} disabled={submitting} onClick={() => {
                    const enabled = !autoRenew
                    setAutoRenew(enabled)
                    handleRentalAction(() => sms4Api.setAutoRenew({ rentalId: selectedRentalId, auto_renew: enabled }), 'Auto-renew updated.')
                  }}>
                    <span className="sms4-checkbox-box">{autoRenew && <Check size={13} />}</span>
                    <span><strong>Auto-renew</strong><small>{autoRenew ? 'On' : 'Off'}</small></span>
                  </button>
                </div>
                <div className="active-header-row">
                  <button className="btn-copy-num" disabled={submitting} onClick={() => handleRentalAction(() => sms4Api.renew({ rentalId: selectedRentalId, time: 1, ...(selectedDuration ? { duration: selectedDuration } : {}) }), 'Rental renewed.')}>Renew rental</button>
                  <button className="btn-copy-num" disabled={submitting} onClick={() => handleRentalAction(() => sms4Api.cancel({ rentalId: selectedRentalId }), 'Rental cancelled.')}>Cancel rental</button>
                </div>
              </>}
            </div>

            {/* Dark Live SMS Inbox */}
            <div className="dark-inbox-card">
              <div className="inbox-header">
                <div className="inbox-title-row">
                  <span>Live SMS inbox</span>
                  <span className="listening-badge">{selectedRental ? '● LIVE' : '● WAITING'}</span>
                </div>
                <p className="inbox-sub">{selectedRental ? 'Messages refresh automatically.' : 'Purchase a rental to receive messages.'}</p>
              </div>

              {messages.length === 0 && <p className="msg-body">{selectedRental ? 'No messages received yet.' : 'Your received messages will appear here.'}</p>}
              {messages.map((message, index) => {
                const body = valueOf(message, ['message', 'text', 'body', 'content'])
                const otp = valueOf(message, ['code', 'otp', 'verificationCode'])
                return <div className="sms-message-box" key={`${valueOf(message, ['id', 'timestamp', 'time'])}-${index}`}>
                  <div className="msg-top">
                    <span className="sender-name">{valueOf(message, ['sender', 'from', 'appName', 'service']) || 'SMS'}</span>
                    <span className="msg-time">{valueOf(message, ['timestamp', 'time', 'createdAt', 'date'])}</span>
                  </div>
                  <p className="msg-body">{body || otp || JSON.stringify(message)}</p>
                  {otp && <div className="otp-row"><span className="otp-val">{otp}</span><button className="btn-copy-otp" onClick={() => navigator.clipboard.writeText(otp)}><Copy size={14} /><span>Copy OTP</span></button></div>}
                </div>
              })}
              <button type="button" className="btn-copy-num" disabled={!selectedRentalId} onClick={() => sms4Api.sms(selectedRentalId).then((response) => setMessages(listFrom(response, ['messages', 'sms', 'items', 'results']))).catch((requestError) => setError(requestError.message))}><RefreshCw size={12} /> Refresh messages</button>

              <span className="lock-note">🔒 Only you can view messages sent to this number.</span>
            </div>

            {/* Information Warning Banner */}
            <div className="quality-hint-card">
              <span>ℹ️</span>
              <div>
                <h4 className="hint-title">Made for verification, not conversation</h4>
                <p className="hint-text">Virtual rentals receive SMS only. Availability may vary by app. Never use a rental number for banking or sensitive accounts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentChoice && <div className="payment-choice-backdrop">
        <section className="payment-choice-dialog sms4-payment-dialog" role="dialog" aria-modal="true" aria-labelledby="sms4-payment-title">
          <button type="button" className="sms4-payment-close" aria-label="Close payment options" onClick={() => setShowPaymentChoice(false)}><X size={18} /></button>
          <h2 id="sms4-payment-title">Choose how to pay</h2>
          <p>Your rental total is <strong>{selectedPrice}</strong>. Select a payment method to continue.</p>
          <div className="payment-options">
            <button type="button" className={`pay-option ${paymentMethod === 'wallet' ? 'selected' : ''}`} aria-pressed={paymentMethod === 'wallet'} onClick={() => setPaymentMethod('wallet')}>
              <span className="pay-top"><span>Cardzip wallet</span><span className={`radio-dot ${paymentMethod === 'wallet' ? 'active' : ''}`} /></span>
              <span className="pay-sub">Pay from your wallet balance</span>
            </button>
            <button type="button" className={`pay-option ${paymentMethod === 'paystack' ? 'selected' : ''}`} aria-pressed={paymentMethod === 'paystack'} onClick={() => setPaymentMethod('paystack')}>
              <span className="pay-top"><span>Paystack</span><span className={`radio-dot ${paymentMethod === 'paystack' ? 'active' : ''}`} /></span>
              <span className="pay-sub">Card · Bank · Transfer</span>
            </button>
          </div>
          <button type="button" className="btn-emerald-submit" disabled={submitting || pricingLoading} onClick={() => {
            setShowPaymentChoice(false)
            handleBuy()
          }}>
            <span>{submitting ? 'Processing…' : `Continue with ${paymentMethod === 'wallet' ? 'wallet' : 'Paystack'}`}</span>
            <ArrowUpRight size={16} />
          </button>
        </section>
      </div>}

      {purchaseOutcome && <div className="payment-choice-backdrop">
        <section className="payment-choice-dialog sms4-payment-dialog sms4-outcome-dialog" role="dialog" aria-modal="true" aria-labelledby="sms4-outcome-title">
          <div className={`sms4-outcome-icon ${purchaseOutcome}`} aria-hidden="true">{purchaseOutcome === 'success' ? <Check size={22} /> : <X size={22} />}</div>
          <h2 id="sms4-outcome-title">{purchaseOutcome === 'success' ? 'Rental successful' : purchaseOutcome === 'insufficient' ? 'Insufficient wallet funds' : 'Rental could not be completed'}</h2>
          <p>{purchaseMessage || `The selected wallet payment could not cover the rental price of ${selectedPrice}. Add funds or choose another payment method.`}</p>
          {purchaseOutcome === 'success' && purchaseNumber && <div className="order-result-reference"><span>Your new number</span><strong>{purchaseNumber}</strong></div>}
          {purchaseOutcome === 'insufficient' ? <div className="sms4-outcome-actions">
            <button type="button" className="btn-copy-num" onClick={() => setPurchaseOutcome('')}>Close</button>
            <button type="button" className="btn-emerald-submit" onClick={() => { setPurchaseOutcome(''); setShowPaymentChoice(true) }}>Choose another method</button>
          </div> : <button type="button" className="btn-emerald-submit" onClick={() => setPurchaseOutcome('')}>Done</button>}
        </section>
      </div>}

      {/* Footer */}
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