import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Check, Code2, Globe2, LifeBuoy, Smartphone } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import { formatNaira } from '../utils/currency'
import './DigitalAssets.css'

export default function DigitalAssetDetailsPage({ digitalAssetSlug, onNavigate }) {
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadedSlug, setLoadedSlug] = useState('')
  const [error, setError] = useState('')
  const [purchaseError, setPurchaseError] = useState('')
  const [purchaseType, setPurchaseType] = useState('')
  const [promotionPrices, setPromotionPrices] = useState([])
  const [ownerAssetId, setOwnerAssetId] = useState('')
  const [promotionType, setPromotionType] = useState('')
  const [promotionError, setPromotionError] = useState('')
  const isApp = asset?.productType === 'app' || asset?.productType === 'ios_app'
  const isAndroidApp = asset?.productType === 'app'
  const Icon = isApp ? Smartphone : Globe2

  useEffect(() => {
    let active = true
    userApi.storeProduct(digitalAssetSlug)
      .then((result) => {
        if (!active) return
        setAsset(result.data)
        setLoadedSlug(digitalAssetSlug)
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError.message || 'Could not load this digital product.')
        setLoadedSlug(digitalAssetSlug)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [digitalAssetSlug])

  useEffect(() => {
    let active = true
    const token = getUserToken()
    if (!asset?.isSellerListing || !token) {
      return () => { active = false }
    }
    Promise.all([userApi.myDigitalAssets(), userApi.communityPromotionPricing()])
      .then(([assetsResult, pricingResult]) => {
        if (!active) return
        const ownedAssets = Array.isArray(assetsResult.data) ? assetsResult.data : []
        const ownedAsset = ownedAssets.find((item) => item._id === asset._id && item.sellerListingStatus === 'approved')
        setOwnerAssetId(ownedAsset?._id || '')
        setPromotionPrices(Array.isArray(pricingResult.data) ? pricingResult.data : [])
      })
      .catch((requestError) => {
        if (active) setPromotionError(requestError.message || 'Could not load promotion options.')
      })
    return () => { active = false }
  }, [asset])
  const isOwner = Boolean(getUserToken() && ownerAssetId === asset?._id)

  const purchase = async (option) => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent(`/digital-assets/${digitalAssetSlug}`)}`)
      return
    }
    setPurchaseType(option)
    setPurchaseError('')
    try {
      const result = await userApi.initializeDigitalProductPayment(asset._id, option)
      sessionStorage.setItem('cardzip-payment-purpose', 'digital_product')
      window.location.assign(result.data.authorizationUrl)
    } catch (requestError) {
      setPurchaseError(requestError.message || 'Could not start Paystack checkout.')
      setPurchaseType('')
    }
  }

  const purchaseSellerListing = async () => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent(`/digital-assets/${digitalAssetSlug}`)}`)
      return
    }
    setPurchaseType('seller_listing')
    setPurchaseError('')
    try {
      const result = await userApi.initializeSellerDigitalAssetPayment(asset._id)
      sessionStorage.setItem('cardzip-payment-purpose', 'seller_digital_asset')
      window.location.assign(result.data.authorizationUrl)
    } catch (requestError) {
      setPurchaseError(requestError.message || 'Could not start Paystack checkout.')
      setPurchaseType('')
    }
  }

  const promoteDigitalAsset = async (duration) => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent(`/digital-assets/${digitalAssetSlug}`)}`)
      return
    }
    setPromotionType(duration)
    setPromotionError('')
    try {
      const result = await userApi.initializeDigitalAssetPromotionPayment(asset._id, duration)
      sessionStorage.setItem('cardzip-payment-purpose', 'community_promotion')
      window.location.assign(result.data.authorizationUrl)
    } catch (requestError) {
      setPromotionError(requestError.message || 'Could not start promotion checkout.')
      setPromotionType('')
    }
  }

  if (loading || loadedSlug !== digitalAssetSlug) return <main className="digital-assets-page"><div className="digital-assets-shell"><p className="digital-assets-state">Loading digital product…</p></div></main>
  if (!asset) return <main className="digital-assets-page"><div className="digital-assets-shell"><p className="digital-assets-error" role="alert">{error || 'This digital product could not be found.'}</p><button className="digital-back-link" type="button" onClick={() => onNavigate?.('/digital-assets')}><ArrowLeft size={15} /> Browse websites and apps</button></div></main>

  return (
    <main className="digital-assets-page">
      <div className="digital-assets-shell">
        <button className="digital-back-link" type="button" onClick={() => onNavigate?.('/digital-assets')}><ArrowLeft size={15} /> All websites and apps</button>
        <section className="digital-detail-hero">
          <div className="digital-detail-art">{asset.image ? <img src={asset.image} alt="" /> : <Icon size={46} />}</div>
          <div className="digital-detail-copy">
            <span className="digital-asset-type"><Icon size={14} /> {isAndroidApp ? 'ANDROID APPLICATION' : asset.productType === 'ios_app' ? 'IOS APPLICATION' : 'WEBSITE'}</span>
            <h1>{asset.name}</h1>
            <p>{asset.description || 'A digital product from Cardzip, with clear usage and setup options.'}</p>
            {asset.websiteUrl && <a className="digital-demo-link" href={asset.websiteUrl} target="_blank" rel="noreferrer">Visit website <ArrowUpRight size={15} /></a>}
          </div>
        </section>
        <div className="digital-detail-layout">
          <section className="digital-instructions-card">
            <span className="digital-assets-kicker">ABOUT THIS {isApp ? 'APP' : 'WEBSITE'}</span>
            <h2>What you get and how it works</h2>
            <p className="digital-instructions">{asset.usageInstructions || 'Choose a use option or request the complete project template. Cardzip support will help coordinate setup.'}</p>
            <div className="digital-instruction-note"><Check size={17} /><span>Full project template includes the backend plus two weeks of setup and upload support.</span></div>
            {isAndroidApp && <p className="digital-instructions">For Android apps, Cardzip will provide the hosted APK after purchase and help with installation where needed.</p>}
            {asset.productType === 'ios_app' && <p className="digital-instructions">For iOS apps, Cardzip will provide the hosted access link after purchase and help coordinate installation or account access.</p>}
          </section>
          <aside className="digital-options-card">
            <span className="digital-assets-kicker">CHOOSE YOUR OPTION</span>
            {asset.isSellerListing ? (
              <>
                <div className="digital-seller-terms"><strong>Buy this {isApp ? 'app' : 'website'} from its creator</strong><span>After Paystack confirms payment, you can view all listing screenshots, open the website or download the APK, and download the source-code archive.</span><small>Seller receives 70% · Cardzip retains 30% · seller wallet withdrawals take 1–2 business days.</small></div>
                <button type="button" className="digital-purchase-option" disabled={Boolean(purchaseType)} onClick={() => void purchaseSellerListing()}>
                  <span><strong>Buy and get full access</strong><small>Pay securely with Paystack. Paid access is shown after verification.</small></span>
                  <b>{purchaseType ? 'Opening Paystack…' : formatNaira(asset.price)}</b>
                </button>
              </>
            ) : <>
            {Number(asset.usePrice) > 0 && <button type="button" className="digital-purchase-option" disabled={Boolean(purchaseType)} onClick={() => void purchase('use')}>
              <span><strong>Use / rent</strong><small>Use the ready-made {isApp ? 'app' : 'website'} with setup guidance.</small></span>
              <b>{purchaseType === 'use' ? 'Opening Paystack…' : formatNaira(asset.usePrice)}</b>
            </button>}
            {Number(asset.templatePrice) > 0 && <button type="button" className="digital-purchase-option" disabled={Boolean(purchaseType)} onClick={() => void purchase('template')}>
              <span><strong>Full project template</strong><small>Source project, backend, two weeks of setup and upload.</small></span>
              <b>{purchaseType === 'template' ? 'Opening Paystack…' : formatNaira(asset.templatePrice)}</b>
            </button>}
            </>}
            {purchaseError && <p className="digital-assets-error" role="alert">{purchaseError}</p>}
            {isOwner && <div className="digital-promotion-options">
              <strong>Promote in Community Marketplace</strong>
              <p>Reach people browsing similar websites and apps. Your promotion starts after administrator approval.</p>
              <div className="digital-promotion-buttons">
                {promotionPrices.map((duration) => <button key={duration.key} type="button" disabled={!duration.price || Boolean(promotionType)} onClick={() => void promoteDigitalAsset(duration.key)}>
                  {promotionType === duration.key ? 'Opening Paystack…' : `${duration.label} · ${formatNaira(duration.price)}`}
                </button>)}
              </div>
              {promotionError && <p className="digital-assets-error" role="alert">{promotionError}</p>}
            </div>}
            <div className="digital-outright-contact"><strong>Want to buy it outright?</strong><span>Contact our team to discuss outright purchase and ownership.</span><button type="button" onClick={() => onNavigate?.('/support')}><LifeBuoy size={15} /> Contact Cardzip</button></div>
          </aside>
        </div>
        <button type="button" className="digital-back-link digital-bottom-back" onClick={() => onNavigate?.('/digital-assets')}><ArrowLeft size={15} /> Browse more digital products</button>
        <span className="digital-detail-code"><Code2 size={14} /> Secure Paystack checkout · Support included</span>
      </div>
    </main>
  )
}
