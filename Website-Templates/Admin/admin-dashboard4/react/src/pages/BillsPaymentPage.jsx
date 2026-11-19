import { ArrowUpRight, CheckCircle2, ChevronDown, GraduationCap, Wallet, X } from 'lucide-react'
import { billServices } from '../data/serviceCatalog'
import { useCallback, useEffect, useRef, useState } from 'react'
import { billApi, userApi } from '../services/api'
import BillReceiptDialog from '../components/BillReceiptDialog'

const providersByService = {
  Airtime: [
    { label: 'MTN', serviceID: 'mtn' },
    { label: 'Airtel', serviceID: 'airtel' },
    { label: 'Glo', serviceID: 'glo' },
    { label: '9mobile', serviceID: '9mobile' },
  ],
  Data: [
    { label: 'MTN', serviceID: 'mtn-data' },
    { label: 'Airtel', serviceID: 'airtel-data' },
    { label: 'Glo', serviceID: 'glo-data' },
    { label: '9mobile', serviceID: 'etisalat-data' },
  ],
  Electricity: [
    { label: 'Ikeja Electric (IKEDC)', serviceID: 'ikeja-electric' },
    { label: 'Eko Electric (EKEDC)', serviceID: 'eko-electric' },
    { label: 'Abuja Electric (AEDC)', serviceID: 'abuja-electric' },
    { label: 'Ibadan Electric (IBEDC)', serviceID: 'ibadan-electric' },
    { label: 'Enugu Electric (EEDC)', serviceID: 'enugu-electric' },
    { label: 'Kaduna Electric (KAEDCO)', serviceID: 'kaduna-electric' },
    { label: 'Jos Electric (JED)', serviceID: 'jos-electric' },
    { label: 'Benin Electric (BEDC)', serviceID: 'benin-electric' },
    { label: 'Kano Electric (KEDCO)', serviceID: 'kano-electric' },
    { label: 'Port Harcourt Electric (PHED)', serviceID: 'portharcourt-electric' },
    { label: 'Aba Electric (APLE)', serviceID: 'aba-electric' },
    { label: 'Yola Electric (YEDC)', serviceID: 'yola-electric' },
  ],
  'Pay TV': [
    { label: 'DStv', serviceID: 'dstv' },
    { label: 'GOtv', serviceID: 'gotv' },
    { label: 'StarTimes', serviceID: 'startimes' },
  ],
  'WAEC PINs': [{ label: 'WAEC', serviceID: 'waec' }],
}

const getVariations = (response) => [
  response?.content?.variations,
  response?.data?.content?.variations,
  response?.data?.variations,
  response?.variations,
].find(Array.isArray) || []

const getVariationCode = (variation) => String(variation?.variation_code || variation?.variationCode || variation?.code || '')
const getVariationLabel = (variation) => String(variation?.name || variation?.description || variation?.variation_name || getVariationCode(variation))
const getVariationAmount = (variation) => Number(variation?.variation_amount ?? variation?.amount ?? variation?.price ?? 0)
const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`
const formatBillDate = (date) => date ? new Date(date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const CustomSelect = ({ value, options, onChange, placeholder = 'Select an option', disabled = false, className = '' }) => {
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className={`custom-select ${className}`.trim()} ref={menuRef}>
      <button type="button" className={`custom-select-button ${open ? 'open' : ''}`} onClick={() => !disabled && setOpen((current) => !current)} disabled={disabled}>
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown size={16} className="custom-select-icon" />
      </button>
      {open && (
        <div className="custom-select-menu" role="listbox" aria-label="Choose an option">
          {options.length === 0 ? (
            <span className="custom-select-empty">No options available</span>
          ) : options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BillsPaymentPage({ onNavigate }) {
  const [activeService, setActiveService] = useState('Electricity')
  const [selectedProvider, setSelectedProvider] = useState('ikeja-electric')
  const [planType, setPlanType] = useState('prepaid')
  const [accountNumber, setAccountNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [variations, setVariations] = useState([])
  const [waecVariations, setWaecVariations] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [walletBalance, setWalletBalance] = useState(null)
  const [selectedVariation, setSelectedVariation] = useState('')
  const [verifiedAccount, setVerifiedAccount] = useState(null)
  const [loadingVariations, setLoadingVariations] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [showPaymentChoice, setShowPaymentChoice] = useState(false)
  const [verificationFailure, setVerificationFailure] = useState('')
  const [paymentResult, setPaymentResult] = useState(() => {
    const savedResult = sessionStorage.getItem('cardzip-bill-payment-result')
    if (!savedResult) return null
    try {
      return JSON.parse(savedResult)
    } catch {
      return null
    }
  })
  const verifySequence = useRef(0)

  const currentProviders = providersByService[activeService] || []
  const selectedProviderInfo = currentProviders.find((provider) => provider.serviceID === selectedProvider)
  const selectedVariationInfo = variations.find((variation) => getVariationCode(variation) === selectedVariation)
    const visibleDataDeals = [...variations]
      .sort((first, second) => Number(Boolean(second.featured || second.is_featured || second.popular || second.is_popular)) - Number(Boolean(first.featured || first.is_featured || first.popular || first.is_popular)))
      .slice(0, 8)
  const variationAmount = selectedVariationInfo ? getVariationAmount(selectedVariationInfo) : 0
  const isFixedPrice = ['Data', 'Pay TV', 'WAEC PINs'].includes(activeService)
  const paymentAmount = isFixedPrice ? variationAmount * (activeService === 'WAEC PINs' ? Number(quantity) : 1) : Number(amount)
  const accountLabel = activeService === 'Electricity'
    ? 'Meter number'
    : activeService === 'Pay TV'
      ? 'Smartcard number'
      : activeService === 'WAEC PINs'
        ? 'Phone number for PIN delivery'
        : 'Recipient phone number'
  const accountVerified = ['Electricity', 'Pay TV'].includes(activeService) && Boolean(verifiedAccount)
  const resultBill = paymentResult?.billPayment
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    let mounted = true
    billApi.history('?limit=3')
      .then((response) => { if (mounted) setRecentPayments(Array.isArray(response.data) ? response.data : []) })
      .catch(() => {})
    userApi.wallet()
      .then((response) => { if (mounted) setWalletBalance(response.data) })
      .catch(() => {})
    billApi.educationVariations('waec')
      .then((response) => { if (mounted) setWaecVariations(getVariations(response)) })
      .catch(() => {})
    sessionStorage.removeItem('cardzip-bill-payment-result')
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    if (!['Data', 'Pay TV', 'WAEC PINs'].includes(activeService)) return () => { mounted = false }

    const request = activeService === 'Data'
      ? billApi.dataVariations(selectedProvider)
      : activeService === 'Pay TV'
        ? billApi.tvVariations(selectedProvider)
        : billApi.educationVariations('waec')

    request
      .then((response) => {
        if (!mounted) return
        const nextVariations = getVariations(response)
        setVariations(nextVariations)
        setSelectedVariation(getVariationCode(nextVariations[0]))
      })
      .catch((requestError) => { if (mounted) setError(requestError.message) })
      .finally(() => { if (mounted) setLoadingVariations(false) })

    return () => { mounted = false }
  }, [activeService, selectedProvider])

  const selectService = (name) => {
    verifySequence.current += 1
    setActiveService(name)
    setSelectedProvider(providersByService[name]?.[0]?.serviceID || '')
    setLoadingVariations(['Data', 'Pay TV', 'WAEC PINs'].includes(name))
    setAmount('')
    setAccountNumber('')
    setPhoneNumber('')
    setQuantity('1')
    setVariations([])
    setSelectedVariation('')
    setVerifiedAccount(null)
    setVerifying(false)
    setError('')
    setNotice('')
    setVerificationFailure('')
    setPaymentResult(null)
    setShowPaymentChoice(false)
  }

  const handleVerify = useCallback(async () => {
    const normalizedAccountNumber = accountNumber.trim()
    if (!normalizedAccountNumber) {
      setError(`Enter your ${accountLabel.toLowerCase()} first.`)
      return
    }
    const requestSequence = ++verifySequence.current
    setVerifying(true)
    setError('')
    setNotice('')
    try {
      const verify = activeService === 'Pay TV' ? billApi.verifyTvCard : billApi.verifyCard
      const response = await verify({ billersCode: normalizedAccountNumber, serviceID: selectedProvider })
      const providerResponse = response?.content
        ? response
        : response?.data?.content
          ? response.data
          : response?.data?.data?.content
            ? response.data.data
            : response?.data?.data || response?.data || response
      const responseCode = providerResponse?.code ?? response?.code ?? response?.data?.code
      const details = providerResponse?.content || providerResponse
      if (responseCode && String(responseCode) !== '000') {
        throw new Error(providerResponse?.response_description || response?.response_description || 'Could not verify this account.')
      }
      if (!details || typeof details !== 'object' || Array.isArray(details) || Object.keys(details).length === 0 || details.error) {
        throw new Error(details?.message || details?.error || 'The provider returned no account details. Check the number and try again.')
      }
      if (requestSequence !== verifySequence.current) return
      setVerifiedAccount(details)
      setVerificationFailure('')
      const meterType = String(details.Meter_Type || details.meterType || '').toLowerCase()
      if (activeService === 'Electricity' && ['prepaid', 'postpaid'].includes(meterType)) setPlanType(meterType)
      setNotice('Account verified successfully.')
    } catch (requestError) {
      if (requestSequence !== verifySequence.current) return
      setVerifiedAccount(null)
      if (['Electricity', 'Pay TV'].includes(activeService)) {
        setVerificationFailure(requestError.message)
        setNotice('')
      }
      else setError(requestError.message)
    } finally {
      if (requestSequence === verifySequence.current) setVerifying(false)
    }
  }, [accountNumber, accountLabel, activeService, selectedProvider])

  const validatePaymentForm = () => {
    setError('')
    if (!accountNumber.trim()) {
      setError(`Please complete the ${accountLabel.toLowerCase()} field.`)
      return false
    }
    if (['Electricity', 'Pay TV'].includes(activeService) && !verifiedAccount) {
      setError('Please verify your account before continuing.')
      return false
    }
    if (isFixedPrice && (!selectedVariation || !variationAmount)) {
      setError(`Please select an available ${activeService === 'Pay TV' ? 'subscription package' : 'package'} before continuing.`)
      return false
    }
    if (!isFixedPrice && (!Number.isFinite(paymentAmount) || paymentAmount <= 0)) {
      setError('Please enter a valid amount greater than zero.')
      return false
    }
    const recipientPhone = ['Airtime', 'Data', 'WAEC PINs'].includes(activeService)
      ? phoneNumber.trim() || accountNumber.trim()
      : phoneNumber.trim()
    if (!recipientPhone) {
      setError('Please complete the phone number field.')
      return false
    }
    return true
  }

  const handlePay = async () => {
    setNotice('')
    if (!validatePaymentForm()) return
    const recipientPhone = ['Airtime', 'Data', 'WAEC PINs'].includes(activeService)
      ? phoneNumber.trim() || accountNumber.trim()
      : phoneNumber.trim()

    const paymentBody = {
      category: activeService,
      serviceID: selectedProvider,
      serviceName: selectedProviderInfo?.label || selectedProvider,
      ...(selectedVariation ? { variation_code: selectedVariation } : activeService === 'Electricity' ? { variation_code: planType } : {}),
      billersCode: accountNumber.trim(),
      phone: recipientPhone,
      amount: paymentAmount,
      quantity: Number(quantity),
    }

    setSubmitting(true)
    try {
      if (paymentMethod === 'paystack') {
        const response = await billApi.initializePaystack(paymentBody)
        window.location.assign(response.data.authorizationUrl)
      } else {
        const response = await billApi.payWithWallet(paymentBody)
        const billPayment = response.data?.billPayment
        setPaymentResult({ status: billPayment?.status === 'completed' ? 'success' : 'pending', billPayment, message: response.message })
        setVerifiedAccount(null)
        userApi.wallet().then((wallet) => setWalletBalance(wallet.data)).catch(() => {})
        billApi.history('?limit=3')
          .then((history) => setRecentPayments(Array.isArray(history.data) ? history.data : []))
          .catch(() => {})
      }
    } catch (requestError) {
      setPaymentResult({ status: 'failed', message: requestError.message, billPayment: requestError.data?.billPayment })
      billApi.history('?limit=3').then((history) => setRecentPayments(Array.isArray(history.data) ? history.data : [])).catch(() => {})
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
            <div className="breadcrumb">Home / Bills & WAEC</div>
            <h1 className="page-title">Less life admin. More living.</h1>
            <p className="page-subtitle">Top up, stay connected and keep the lights on. Everyday payments without the friction.</p>
          </div>
          <button className="btn-secondary-pill" onClick={() => onNavigate?.('/bill-history')}>
            <span>Payment history</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="services-grid">
          {billServices.map((s) => {
            const Icon = s.icon
            return (
              <button type="button" key={s.name} className={`service-card ${activeService === s.name ? 'active' : ''}`} aria-pressed={activeService === s.name} onClick={() => selectService(s.name)}>
                <Icon size={20} className="service-icon" />
                <span className="service-name">{s.name}</span>
                <span className="service-sub">{s.sub}</span>
              </button>
            )
          })}
        </div>

        {/* Form Layout */}
        <div className="bills-layout-grid">
          {/* Left Form */}
          <div className="trade-card-main">
            <h2 className="card-section-title">{activeService === 'Electricity' ? 'Pay your electricity bill' : activeService === 'Pay TV' ? 'Renew your TV subscription' : activeService === 'WAEC PINs' ? 'Buy a WAEC PIN' : `Buy ${activeService.toLowerCase()}`}</h2>
            <p className="card-section-desc">{activeService === 'Electricity' || activeService === 'Pay TV' ? 'Verify your account, then complete your payment.' : 'Choose a provider and package, then complete your payment.'}</p>
            {error && <p className="field-hint" role="alert">{error}</p>}
            {notice && <p className="field-hint green-txt" role="status">{notice}</p>}

            <div className="form-two-col">
              <div className="form-field">
                <label className="field-label">{activeService === 'WAEC PINs' ? 'Exam service' : 'Service provider'}</label>
                <CustomSelect
                  className="bills-select-wrap"
                  value={selectedProvider}
                  placeholder="Select a provider"
                  options={currentProviders.map((provider) => ({ value: provider.serviceID, label: provider.label }))}
                  onChange={(value) => {
                    verifySequence.current += 1
                    setSelectedProvider(value)
                    setVariations([])
                    setSelectedVariation('')
                    setLoadingVariations(['Data', 'Pay TV', 'WAEC PINs'].includes(activeService))
                    setVerifiedAccount(null)
                    setVerifying(false)
                    setVerificationFailure('')
                    setError('')
                    setNotice('')
                  }}
                />
              </div>
              {activeService === 'Electricity' && <div className="form-field">
                <label className="field-label">Plan / Meter type</label>
                <CustomSelect
                  className="bills-select-wrap"
                  value={planType}
                  options={[
                    { value: 'prepaid', label: 'Prepaid' },
                    { value: 'postpaid', label: 'Postpaid' },
                  ]}
                  onChange={setPlanType}
                />
              </div>}
              {activeService === 'Data' && <div className="form-field data-deals-field">
                <label className="field-label">Available data deals</label>
                <div className="data-deals-grid">
                  {visibleDataDeals.map((variation, index) => {
                                      {!loadingVariations && variations.length > 8 && <p className="field-hint data-deals-note">Showing 8 featured packages.</p>}
                    const code = getVariationCode(variation)
                    const selected = selectedVariation === code
                    const validity = variation.validity || variation.duration || variation.validity_period || ''
                    return <button type="button" key={`${code}-${index}`} className={`data-deal-card ${selected ? 'selected' : ''}`} aria-pressed={selected} disabled={loadingVariations} onClick={() => setSelectedVariation(code)}>
                      <span className="data-deal-name">{getVariationLabel(variation)}</span>
                      {validity && <small>{validity}</small>}
                      <strong>₦{getVariationAmount(variation).toLocaleString('en-NG')}</strong>
                    </button>
                  })}
                  {loadingVariations && <p className="field-hint">Loading data deals…</p>}
                  {!loadingVariations && variations.length === 0 && <p className="field-hint">No data deals are available for this provider.</p>}
                </div>
              </div>}
              {['Pay TV', 'WAEC PINs'].includes(activeService) && <div className="form-field">
                <label className="field-label">{activeService === 'Pay TV' ? 'Subscription package' : 'PIN type'}</label>
                <CustomSelect
                  className="bills-select-wrap"
                  value={selectedVariation}
                  disabled={loadingVariations || variations.length === 0}
                  placeholder={loadingVariations ? 'Loading packages…' : 'No packages available'}
                  options={variations.map((variation, index) => ({
                    value: getVariationCode(variation),
                    label: `${getVariationLabel(variation)} · ₦${getVariationAmount(variation).toLocaleString('en-NG')}`,
                    key: `${getVariationCode(variation)}-${index}`,
                  }))}
                  onChange={setSelectedVariation}
                />
                {loadingVariations && <span className="field-hint">Loading current packages…</span>}
              </div>}
            </div>

            <div className="form-field">
              <label className="field-label">{accountLabel}</label>
              <div className="input-verify-row">
              <input type={['Airtime', 'Data', 'WAEC PINs'].includes(activeService) ? 'tel' : 'text'} className="text-input" value={accountNumber} onChange={(event) => {
                verifySequence.current += 1
                setAccountNumber(event.target.value)
                setVerifiedAccount(null)
                setVerifying(false)
                setVerificationFailure('')
                setError('')
                setNotice('')
              }} onBlur={(event) => {
                const shouldAutoVerify = ['Electricity', 'Pay TV'].includes(activeService)
                  && accountNumber.trim()
                  && !accountVerified
                  && !verifying
                  && !event.relatedTarget?.closest('.btn-verify')
                if (shouldAutoVerify) handleVerify()
              }} placeholder={activeService === 'Electricity' ? 'Enter your meter number' : activeService === 'Pay TV' ? 'Enter your smartcard number' : 'Enter recipient phone number'} />
              {['Electricity', 'Pay TV'].includes(activeService) && <button type="button" className="btn-verify" onClick={handleVerify} disabled={verifying}>
                <span>{verifying ? 'Verifying…' : accountVerified ? 'Verified' : 'Verify'}</span>
                <CheckCircle2 size={15} aria-hidden="true" />
              </button>}
            </div>
            </div>

            {/* Verified User Banner */}
            {accountVerified && <div className="verified-banner">
              <CheckCircle2 size={16} className="green-txt" />
              <div>
                <strong>{verifiedAccount?.Customer_Name || verifiedAccount?.customerName || verifiedAccount?.name || accountNumber}</strong>
                <p>{verifiedAccount?.Customer_Address || verifiedAccount?.customerAddress || verifiedAccount?.address || 'Account verified by service provider.'}</p>
              </div>
              <span className="verified-tag">VERIFIED</span>
            </div>}

            <div className="form-two-col">
              <div className="form-field">
                <label className="field-label">Amount (NGN)</label>
                <input type="number" min={activeService === 'Electricity' ? 1000 : 50} className="text-input" value={isFixedPrice ? (variationAmount || '') : amount} readOnly={isFixedPrice} onChange={(event) => setAmount(event.target.value)} placeholder={isFixedPrice ? (loadingVariations ? 'Loading package price…' : 'Select a package') : 'Enter amount'} />
                <span className="field-hint">{isFixedPrice ? 'Price set by the selected package.' : activeService === 'Electricity' ? 'Minimum payment: ₦1,000' : 'Enter the amount to top up.'}</span>
              </div>
              <div className="form-field">
                {activeService === 'WAEC PINs' ? <>
                  <label className="field-label">Number of PINs</label>
                  <input type="number" min="1" max="5" className="text-input" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                  <span className="field-hint">PINs will be sent to the phone number above.</span>
                </> : !['Airtime', 'Data'].includes(activeService) && <>
                  <label className="field-label">Phone number</label>
                  <input type="tel" className="text-input" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Enter phone number" />
                  <span className="field-hint">{activeService === 'Electricity' ? 'VTPass may send your prepaid token by SMS to this number.' : 'Used for provider delivery updates.'}</span>
                </>}
              </div>
            </div>

            {activeService === 'Electricity' && <div className="token-note-box">
              <span>💬 Your token, right where you need it</span>
              <p>Your prepaid token appears in the payment result and downloadable receipt. VTPass may also send it by SMS to the phone number above.</p>
            </div>}

            {/* Recent Payments Section */}
            <div className="recent-payments-sec">
              <h4 className="sec-title">Recent payments</h4>
              <div className="payments-list">
                {recentPayments.map((payment) => (
                  <button type="button" key={payment.reference} className="pay-row-item bill-receipt-trigger" onClick={() => setSelectedReceipt(payment)}>
                    <div><span className="p-name">{payment.serviceName}</span><span className="p-date">{formatBillDate(payment.createdAt)}</span></div>
                    <div className="p-right"><span className="p-amount">{formatNaira(payment.amount)}</span><span className={`p-status ${['failed', 'refunded'].includes(String(payment.status).toLowerCase()) ? 'failed' : ['pending', 'processing'].includes(String(payment.status).toLowerCase()) ? 'pending' : ''}`}>{payment.status === 'completed' ? 'SUCCESSFUL' : String(payment.status || 'unknown').toUpperCase()}</span></div>
                  </button>
                ))}
                {recentPayments.length === 0 && <p className="field-hint">No bill payments yet.</p>}
              </div>
            </div>
          </div>

          {/* Right Payment Summary */}
          <div className="sidebar-col">
            <div className="dark-summary-card">
              <h3 className="sidebar-title">Payment summary</h3>
              <p className="sidebar-sub">{activeService} · {selectedProviderInfo?.label || 'Select a provider'}{activeService === 'Electricity' ? ` · ${planType}` : ''}</p>

              <div className="dark-summary-rows">
                <div className="d-row"><span>{accountLabel}</span><strong>{accountNumber || '—'}</strong></div>
                {selectedVariationInfo && <div className="d-row"><span>Package</span><strong>{getVariationLabel(selectedVariationInfo)}</strong></div>}
                <div className="d-row"><span>{activeService === 'WAEC PINs' ? `PINs × ${quantity}` : 'Bill amount'}</span><strong>₦{Number(paymentAmount || 0).toLocaleString('en-NG')}</strong></div>
                <div className="d-row"><span>Service fee</span><strong>Included</strong></div>
                <div className="d-row total-d-row"><span>Total to pay</span><strong className="green-amount">₦{Number(paymentAmount || 0).toLocaleString('en-NG')}</strong></div>
              </div>

              <div className="wallet-select-box">
                <div className="w-left">
                  <div className="wallet-method-heading">
                    <span className="wallet-method-icon"><Wallet size={16} aria-hidden="true" /></span>
                    <strong>{paymentMethod === 'wallet' ? 'Cardzip wallet' : 'Paystack'}</strong>
                  </div>
                  {paymentMethod === 'wallet' ? <div className="wallet-balance-breakdown">
                    <div className="wallet-balance-item">
                      <span>Available balance</span>
                      <strong>{walletBalance ? formatNaira(walletBalance.balance) : 'Loading…'}</strong>
                    </div>
                    <div className="wallet-balance-item after-payment">
                      <span>After this payment</span>
                      <strong>{walletBalance ? formatNaira(Math.max(0, Number(walletBalance.balance) - Number(paymentAmount || 0))) : 'Loading…'}</strong>
                    </div>
                  </div> : <span className="w-sub">Secure card, bank, or transfer checkout</span>}
                </div>
                <CheckCircle2 size={16} className="green-txt wallet-selected-icon" aria-label="Selected payment method" />
              </div>

              <button type="button" className="btn-emerald-submit" onClick={() => {
                if (validatePaymentForm()) setShowPaymentChoice(true)
              }} disabled={submitting || loadingVariations}>
                <span>{submitting ? 'Processing…' : activeService === 'Pay TV' ? 'Pay TV' : `Pay ${activeService}`}</span>
                <ArrowUpRight size={16} />
              </button>

              <span className="disclaimer-text">Payment is processed securely by VTPass.</span>
            </div>

            {/* WAEC PIN Card */}
            <div className="waec-promo-card">
              <div className="waec-header">
                <h3>Results, unlocked.</h3>
                <p>WAEC result checker PINs, delivered instantly.</p>
              </div>
              {waecVariations.slice(0, 3).map((variation) => <div className="waec-box" key={getVariationCode(variation)}>
                <GraduationCap size={20} className="green-txt" />
                <div>
                  <strong>{getVariationLabel(variation)}</strong>
                  <p>{variation.description || variation.variation_code || 'WAEC result checker PIN'}</p>
                  <span className="waec-price">{formatNaira(getVariationAmount(variation))} / PIN</span>
                </div>
              </div>)}
              {waecVariations.length === 0 && <div className="waec-box"><GraduationCap size={20} className="green-txt" /><div><strong>WAEC Result Checker</strong><p>Live prices are temporarily unavailable.</p></div></div>}
              <button type="button" className="btn-buy-waec" onClick={() => selectService('WAEC PINs')}>Buy WAEC PIN ↗</button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentChoice && <div className="payment-choice-backdrop">
        <section className="payment-choice-dialog bill-payment-dialog" role="dialog" aria-modal="true" aria-labelledby="bill-payment-title">
          <button type="button" className="bill-payment-close" aria-label="Close payment options" onClick={() => setShowPaymentChoice(false)}><X size={18} /></button>
          <h2 id="bill-payment-title">Choose how to pay</h2>
          <p>Total for {activeService.toLowerCase()}: <strong>₦{Number(paymentAmount || 0).toLocaleString('en-NG')}</strong></p>
          <div className="payment-options">
            <button type="button" className={`pay-option ${paymentMethod === 'wallet' ? 'selected' : ''}`} aria-pressed={paymentMethod === 'wallet'} onClick={() => setPaymentMethod('wallet')}>
              <span className="pay-top"><span>Cardzip wallet</span><span className={`radio-dot ${paymentMethod === 'wallet' ? 'active' : ''}`} /></span>
              <span className="pay-sub">Available: {walletBalance ? formatNaira(walletBalance.balance) : 'Loading balance…'}</span>
            </button>
            <button type="button" className={`pay-option ${paymentMethod === 'paystack' ? 'selected' : ''}`} aria-pressed={paymentMethod === 'paystack'} onClick={() => setPaymentMethod('paystack')}>
              <span className="pay-top"><span>Paystack</span><span className={`radio-dot ${paymentMethod === 'paystack' ? 'active' : ''}`} /></span>
              <span className="pay-sub">Card · Bank · Transfer</span>
            </button>
          </div>
          <button type="button" className="btn-emerald-submit" disabled={submitting} onClick={() => {
            setShowPaymentChoice(false)
            handlePay()
          }}>
            <span>{submitting ? 'Processing…' : `Continue with ${paymentMethod === 'wallet' ? 'wallet' : 'Paystack'}`}</span>
            <ArrowUpRight size={16} />
          </button>
        </section>
      </div>}

      {verificationFailure && <div className="payment-choice-backdrop">
        <section className="payment-choice-dialog bill-result-dialog" role="dialog" aria-modal="true" aria-labelledby="bill-verify-failed-title">
          <button type="button" className="bill-payment-close" aria-label="Close verification message" onClick={() => setVerificationFailure('')}><X size={18} /></button>
          <div className="bill-result-icon failed"><X size={21} /></div>
          <h2 id="bill-verify-failed-title">Verification failed</h2>
          <p>{verificationFailure}</p>
          <button type="button" className="btn-emerald-submit" disabled={verifying} onClick={() => {
            setVerificationFailure('')
            handleVerify()
          }}>{verifying ? 'Verifying…' : 'Try again'}</button>
        </section>
      </div>}

      {paymentResult && resultBill && <BillReceiptDialog
        bill={resultBill}
        status={paymentResult.status}
        message={paymentResult.message}
        onClose={() => setPaymentResult(null)}
      />}
      {paymentResult && !resultBill && <div className="payment-choice-backdrop bill-result-backdrop">
        <section className="payment-choice-dialog bill-result-dialog" role="dialog" aria-modal="true" aria-labelledby="bill-result-title">
          <button type="button" className="bill-payment-close" aria-label="Close payment result" onClick={() => setPaymentResult(null)}><X size={18} /></button>
          <div className="bill-result-icon failed"><X size={22} /></div>
          <h2 id="bill-result-title">Payment failed</h2>
          <p>{paymentResult.message || 'The bill payment could not be completed.'}</p>
          <button type="button" className="btn-emerald-submit" onClick={() => setPaymentResult(null)}>Close</button>
        </section>
      </div>}
      {selectedReceipt && <BillReceiptDialog
        bill={selectedReceipt}
        status={selectedReceipt.status}
        message={selectedReceipt.failureReason}
        onClose={() => setSelectedReceipt(null)}
      />}

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