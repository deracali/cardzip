import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Code2, Download, FileText, Globe2, LifeBuoy, Smartphone, X, ZoomIn } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import { formatNaira } from '../utils/currency'
import CardzipLoader from '../components/CardzipLoader'
import ReportListingButton from '../components/ReportListingButton'
import './DigitalAssets.css'

export default function DigitalAssetDetailsPage({ digitalAssetSlug, onNavigate }) {
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadedSlug, setLoadedSlug] = useState('')
  const [error, setError] = useState('')
  const [purchaseError, setPurchaseError] = useState('')
  const [purchaseType, setPurchaseType] = useState('')
  const [websitePreviewOpen, setWebsitePreviewOpen] = useState(false)
  const [downloadingFile, setDownloadingFile] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const paymentReference = new URLSearchParams(window.location.search).get('reference')
  const [paidReceiptState, setPaidReceiptState] = useState(() => ({
    reference: paymentReference || '',
    status: paymentReference ? 'loading' : 'idle',
    receipt: null,
  }))
  const [purchaseHistoryState, setPurchaseHistoryState] = useState({ productId: '', status: 'idle', purchases: [] })
  const [imageSelection, setImageSelection] = useState({ slug: '', index: 0 })
  const [zoomedAssetSlug, setZoomedAssetSlug] = useState('')
  const [promotionPrices, setPromotionPrices] = useState([])
  const [ownerAssetId, setOwnerAssetId] = useState('')
  const [promotionType, setPromotionType] = useState('')
  const [promotionError, setPromotionError] = useState('')
  const isApp = asset?.productType === 'app' || asset?.productType === 'ios_app'
  const isAndroidApp = asset?.productType === 'app'
  const Icon = isApp ? Smartphone : Globe2
  const selectedImageIndex = imageSelection.slug === digitalAssetSlug ? imageSelection.index : 0
  const imageZoomOpen = zoomedAssetSlug === digitalAssetSlug
  const selectImageIndex = (index) => setImageSelection({ slug: digitalAssetSlug, index })
  const setImageZoomOpen = (open) => setZoomedAssetSlug(open ? digitalAssetSlug : '')
  const assetImages = [...new Set([
    asset?.image,
    ...(Array.isArray(asset?.images) ? asset.images : []),
  ].filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim()))]
  const selectedImage = assetImages[selectedImageIndex] || assetImages[0]
  const paymentResult = new URLSearchParams(window.location.search).get('payment')
  const paidPurchases = purchaseHistoryState.productId === asset?._id ? purchaseHistoryState.purchases : []
  const purchaseHistoryLoading = Boolean(asset?._id && getUserToken()
    && (purchaseHistoryState.productId !== asset._id || purchaseHistoryState.status === 'loading'))
  const receiptLoading = purchaseHistoryLoading || Boolean(paymentReference
    && paidReceiptState.reference === paymentReference
    && paidReceiptState.status === 'loading')
  const paidReceipt = paidReceiptState.status === 'verified'
    ? paidReceiptState.receipt
    : null
  const hasPurchased = (option) => paidPurchases.some((purchase) => purchase.purchaseType === option)

  const downloadPurchasedFile = async (fileType, documentIndex, filename) => {
    const archiveType = fileType === 'source-code'
      ? paidReceipt?.purchaseType === 'template' ? 'template-source-code' : 'rental-source-code'
      : fileType
    const key = fileType === 'source-code'
      ? archiveType
      : `${fileType}-${documentIndex}`
    setDownloadingFile(key)
    setDownloadError('')
    try {
      await userApi.downloadDigitalProductFile(
        asset._id,
        archiveType,
        documentIndex,
        filename,
        paidReceiptState.reference,
      )
    } catch (requestError) {
      setDownloadError(requestError.message || 'Could not download this purchased file.')
    } finally {
      setDownloadingFile('')
    }
  }

  useEffect(() => {
    if (!imageZoomOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setZoomedAssetSlug('')
      if (event.key === 'ArrowLeft') {
        setImageSelection({ slug: digitalAssetSlug, index: (selectedImageIndex - 1 + assetImages.length) % assetImages.length })
      }
      if (event.key === 'ArrowRight') {
        setImageSelection({ slug: digitalAssetSlug, index: (selectedImageIndex + 1) % assetImages.length })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [imageZoomOpen, selectedImageIndex, digitalAssetSlug, assetImages.length])

  useEffect(() => {
    if (!websitePreviewOpen) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setWebsitePreviewOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [websitePreviewOpen])

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
    if (!asset?._id || !getUserToken()) return undefined
    let active = true
    userApi.myDigitalProductPayments(asset._id)
      .then(async (result) => {
        const payments = Array.isArray(result.data) ? result.data : []
        const verifiedPurchases = await Promise.all(payments
          .filter((payment) => ['pending', 'completed'].includes(payment.status) && payment.reference)
          .slice(0, 10)
          .map(async (payment) => {
            try {
              const verification = await userApi.verifyFunding({ reference: payment.reference })
              const receipt = verification.data?.digitalProduct || verification.data?.sellerDigitalAsset
              if (verification.data?.status !== 'completed' || receipt?.productId !== asset._id) return null
              return { reference: payment.reference, purchaseType: receipt.purchaseType, receipt }
            } catch {
              return null
            }
          }))
        if (!active) return
        const purchases = verifiedPurchases.filter(Boolean)
        setPurchaseHistoryState({ productId: asset._id, status: 'loaded', purchases })
        const receiptPurchase = purchases.find((purchase) => purchase.reference === paymentReference)
          || purchases[0]
        if (receiptPurchase) {
          setPaidReceiptState({
            reference: receiptPurchase.reference,
            status: 'verified',
            receipt: receiptPurchase.receipt,
          })
          setPurchaseError('')
        } else if (paymentReference) {
          setPaidReceiptState({ reference: paymentReference, status: 'failed', receipt: null })
          setPurchaseError('Payment is not confirmed. No files have been released.')
        }
      })
      .catch((requestError) => {
        if (active) {
          setPurchaseHistoryState({ productId: asset._id, status: 'failed', purchases: [] })
          if (paymentReference) {
            setPaidReceiptState({ reference: paymentReference, status: 'failed', receipt: null })
            setPurchaseError(requestError.message || 'Payment is not confirmed. No files have been released.')
          }
        }
      })
    return () => { active = false }
  }, [asset?._id, paymentReference])

  useEffect(() => {
    const resetCheckoutState = (event) => {
      if (!event.persisted) return
      setPurchaseType('')
      setPurchaseError('')
      sessionStorage.removeItem('cardzip-payment-purpose')
      sessionStorage.removeItem('cardzip-digital-product-return-path')
      sessionStorage.removeItem('cardzip-digital-product-reference')
    }
    window.addEventListener('pageshow', resetCheckoutState)
    return () => window.removeEventListener('pageshow', resetCheckoutState)
  }, [])

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
      if (result.data?.alreadyPurchased && result.data?.digitalProduct?.productId === asset._id) {
        setPurchaseHistoryState((current) => {
          const purchases = current.productId === asset._id ? current.purchases : []
          return {
            productId: asset._id,
            status: 'loaded',
            purchases: [
              { reference: result.data.reference, purchaseType: option, receipt: result.data.digitalProduct },
              ...purchases.filter((purchase) => purchase.reference !== result.data.reference),
            ],
          }
        })
        setPaidReceiptState({
          reference: result.data.reference,
          status: 'verified',
          receipt: result.data.digitalProduct,
        })
        setPurchaseError('')
        setPurchaseType('')
        return
      }
      sessionStorage.setItem('cardzip-payment-purpose', 'digital_product')
      sessionStorage.setItem('cardzip-digital-product-return-path', `/digital-assets/${digitalAssetSlug}`)
      sessionStorage.setItem('cardzip-digital-product-reference', result.data.reference)
      window.location.assign(result.data.authorizationUrl)
    } catch (requestError) {
      setPurchaseError(requestError.message || 'Could not start Paystack checkout.')
      setPurchaseType('')
    }
  }

  const purchaseSellerListing = async (option) => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent(`/digital-assets/${digitalAssetSlug}`)}`)
      return
    }
    setPurchaseType(option)
    setPurchaseError('')
    try {
      const result = await userApi.initializeSellerDigitalAssetPayment(asset._id, option)
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

  if (loading || loadedSlug !== digitalAssetSlug) return <main className="digital-assets-page"><div className="digital-assets-shell"><p className="digital-assets-state"><CardzipLoader compact label="Loading digital product" /></p></div></main>
  if (!asset) return <main className="digital-assets-page"><div className="digital-assets-shell"><p className="digital-assets-error" role="alert">{error || 'This digital product could not be found.'}</p><button className="digital-back-link" type="button" onClick={() => onNavigate?.('/digital-assets')}><ArrowLeft size={15} /> Browse websites and apps</button></div></main>

  return (
    <main className="digital-assets-page">
      <div className="digital-assets-shell">
        <button className="digital-back-link" type="button" onClick={() => onNavigate?.('/digital-assets')}><ArrowLeft size={15} /> All websites and apps</button>
        {paymentResult === 'cancelled' && <p className="digital-payment-status is-cancelled" role="status">Payment was cancelled or not completed. No files have been released.</p>}
        {paymentResult === 'failed' && !paidReceipt && !receiptLoading && <p className="digital-payment-status is-cancelled" role="status">Payment could not be confirmed. No files have been released.</p>}
        <section className="digital-detail-hero">
          <div className="digital-detail-gallery">
            <button className="digital-detail-art" type="button" onClick={() => selectedImage && setImageZoomOpen(true)} disabled={!selectedImage} aria-label={selectedImage ? `Zoom image ${selectedImageIndex + 1} of ${assetImages.length}` : 'No product images available'}>
              {selectedImage ? <><img src={selectedImage} alt={`${asset.name} preview ${selectedImageIndex + 1}`} /><span><ZoomIn size={15} /> Zoom image</span></> : <Icon size={46} />}
            </button>
            {assetImages.length > 1 && <div className="digital-detail-thumbnails" aria-label="Product images">
              {assetImages.map((image, index) => <button key={image} type="button" className={index === selectedImageIndex ? 'active' : ''} onClick={() => selectImageIndex(index)} aria-label={`Show image ${index + 1}`}>
                <img src={image} alt="" />
              </button>)}
            </div>}
          </div>
          <div className="digital-detail-copy">
            <span className="digital-asset-type"><Icon size={14} /> {isAndroidApp ? 'ANDROID APPLICATION' : asset.productType === 'ios_app' ? 'IOS APPLICATION' : asset.productType === 'full_stack' ? 'FULL STACK' : asset.productType === 'admin' ? 'ADMIN DASHBOARD' : 'WEBSITE'}</span>
            <h1>{asset.name}</h1>
            <p>{asset.description || 'A digital product from Cardzip, with clear usage and setup options.'}</p>
            {asset.websiteUrl && <button className="digital-demo-link" type="button" onClick={() => setWebsitePreviewOpen(true)}>Visit website <Globe2 size={15} /></button>}
            {!isOwner && <ReportListingButton targetType="store_product" targetId={asset._id} targetTitle={asset.name} onNavigate={onNavigate} />}
          </div>
        </section>
        <div className="digital-detail-layout">
          <section className="digital-instructions-card">
            <span className="digital-assets-kicker">ABOUT THIS {asset.productType === 'admin' ? 'ADMIN DASHBOARD' : asset.productType === 'full_stack' ? 'FULL-STACK PROJECT' : isApp ? 'APP' : 'WEBSITE'}</span>
            <h2>What you get and how it works</h2>
            <p className="digital-instructions">{asset.usageInstructions || 'Choose a use option or request the complete project template. Cardzip support will help coordinate setup.'}</p>
            <div className="digital-instruction-note"><Check size={17} /><span>Full project template includes the backend plus two weeks of setup and upload support.</span></div>
            {isAndroidApp && <p className="digital-instructions">For Android apps, Cardzip will provide the hosted APK after purchase and help with installation where needed.</p>}
            {asset.productType === 'ios_app' && <p className="digital-instructions">For iOS apps, Cardzip will provide the hosted access link after purchase and help coordinate installation or account access.</p>}
          </section>
          <aside className="digital-options-card">
            <span className="digital-assets-kicker">CHOOSE YOUR OPTION</span>
            {(receiptLoading || paidReceipt) && <section className="digital-paid-downloads" aria-live="polite">
              <strong>{receiptLoading ? 'Checking your purchase history…' : 'Your purchased downloads'}</strong>
              {receiptLoading && <span>Files stay locked until the payment is confirmed.</span>}
              {!receiptLoading && paidReceipt?.accessUrl && (asset.productType === 'app'
                ? <a className="digital-access-link" href={paidReceipt.accessUrl} target="_blank" rel="noreferrer">{'Open Android app access'}</a>
                : asset.productType === 'ios_app'
                  ? <a className="digital-access-link" href={paidReceipt.accessUrl} target="_blank" rel="noreferrer">Open iOS app access</a>
                  : <button className="digital-access-link" type="button" onClick={() => setWebsitePreviewOpen(true)}>Open website access in preview</button>
              )}
              {!receiptLoading && (paidReceipt?.sourceCodeAvailable || paidReceipt?.templateSourceCodeAvailable) && <button className="digital-access-link digital-download-button" type="button" disabled={Boolean(downloadingFile)} onClick={() => void downloadPurchasedFile('source-code', undefined, `${asset.name}-source-code.zip`)}>
                <Download size={17} aria-hidden="true" /><span>{downloadingFile === (paidReceipt?.purchaseType === 'template' ? 'template-source-code' : 'rental-source-code') ? 'Downloading source code…' : `Download ${paidReceipt?.purchaseType === 'template' ? 'full-template' : 'rental'} source ZIP`}</span>
              </button>}
              {!receiptLoading && paidReceipt?.documents?.map((document, index) => {
                const key = `document-${index}`
                return <button className="digital-access-link digital-download-button" type="button" key={`${document.name}-${index}`} disabled={Boolean(downloadingFile)} onClick={() => void downloadPurchasedFile('document', index, document.name)}>
                  <Download size={17} aria-hidden="true" /><span>{downloadingFile === key ? `Downloading ${document.name}…` : `Buyer file · ${document.name}`}</span>
                </button>
              })}
              {!receiptLoading && paidReceipt?.templateDocuments?.map((document, index) => {
                const key = `template-document-${index}`
                return <button className="digital-access-link digital-download-button" type="button" key={`template-${document.name}-${index}`} disabled={Boolean(downloadingFile)} onClick={() => void downloadPurchasedFile('template-document', index, document.name)}>
                  <FileText size={17} aria-hidden="true" /><span>{downloadingFile === key ? `Downloading ${document.name}…` : `Legal document · ${document.name}`}</span>
                </button>
              })}
              {downloadError && <p className="digital-download-unavailable" role="alert">{downloadError}</p>}
            </section>}
            {asset.isSellerListing ? (
              <>
                <div className="digital-seller-terms"><strong>Choose a purchase from the creator</strong><span>Each option unlocks its own source ZIP and buyer files after payment. Full-template buyers also receive the full-template legal documents.</span><small>Seller receives 70% · Cardzip retains 30% · seller wallet withdrawals take 1–2 business days.</small></div>
                {(Number(asset.usePrice) > 0 || (!Number(asset.usePrice) && !Number(asset.templatePrice) && Number(asset.price) > 0)) && <button type="button" className="digital-purchase-option" disabled={Boolean(purchaseType) || hasPurchased('use')} onClick={() => void purchaseSellerListing('use')}>
                  <span><strong>Use / rent</strong><small>Unlock use access, the rental ZIP and buyer files.</small></span>
                  <b>{hasPurchased('use') ? 'Already purchased' : purchaseType === 'use' || purchaseType === 'seller_listing' ? 'Opening Paystack…' : formatNaira(Number(asset.usePrice) || Number(asset.price))}</b>
                </button>}
                {Number(asset.templatePrice) > 0 && <button type="button" className="digital-purchase-option" disabled={Boolean(purchaseType) || hasPurchased('template')} onClick={() => void purchaseSellerListing('template')}>
                  <span><strong>Full project template</strong><small>Unlock the full source ZIP, backend, setup support and legal files.</small></span>
                  <b>{hasPurchased('template') ? 'Already purchased' : purchaseType === 'template' || purchaseType === 'seller_listing' ? 'Opening Paystack…' : formatNaira(asset.templatePrice)}</b>
                </button>}
              </>
            ) : <>
            {Number(asset.usePrice) > 0 && <button type="button" className="digital-purchase-option" disabled={Boolean(purchaseType) || hasPurchased('use')} onClick={() => void purchase('use')}>
              <span><strong>Use / rent</strong><small>Use the ready-made {isApp ? 'app' : 'website'} with setup guidance.</small></span>
              <b>{hasPurchased('use') ? 'Already purchased' : purchaseType === 'use' ? 'Opening Paystack…' : formatNaira(asset.usePrice)}</b>
            </button>}
            {Number(asset.templatePrice) > 0 && <button type="button" className="digital-purchase-option" disabled={Boolean(purchaseType) || hasPurchased('template')} onClick={() => void purchase('template')}>
              <span><strong>Full project template</strong><small>Source project, backend, two weeks of setup and upload.</small></span>
              <b>{hasPurchased('template') ? 'Already purchased' : purchaseType === 'template' ? 'Opening Paystack…' : formatNaira(asset.templatePrice)}</b>
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
      {websitePreviewOpen && asset.websiteUrl && (
        <div className="digital-website-preview-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setWebsitePreviewOpen(false)
        }}>
          <section className="digital-website-preview" role="dialog" aria-modal="true" aria-labelledby="digital-website-preview-title">
            <header>
              <div>
                <span className="digital-assets-kicker">LIVE PREVIEW</span>
                <h2 id="digital-website-preview-title">{asset.name}</h2>
              </div>
              <button type="button" onClick={() => setWebsitePreviewOpen(false)} aria-label="Close website preview"><X size={20} /></button>
            </header>
            <iframe
              title={`${asset.name} website preview`}
              src={paidReceipt?.accessUrl || asset.websiteUrl}
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            />
          </section>
        </div>
      )}
      {imageZoomOpen && selectedImage && <div className="digital-image-lightbox" role="dialog" aria-modal="true" aria-label={`${asset.name} image viewer`} onClick={() => setImageZoomOpen(false)}>
        <button className="digital-image-lightbox-close" type="button" onClick={() => setImageZoomOpen(false)} aria-label="Close image viewer"><X size={22} /></button>
        {assetImages.length > 1 && <button className="digital-image-lightbox-nav previous" type="button" onClick={(event) => { event.stopPropagation(); selectImageIndex((selectedImageIndex - 1 + assetImages.length) % assetImages.length) }} aria-label="Previous image"><ChevronLeft size={26} /></button>}
        <img src={selectedImage} alt={`${asset.name} image ${selectedImageIndex + 1}`} onClick={(event) => event.stopPropagation()} />
        {assetImages.length > 1 && <button className="digital-image-lightbox-nav next" type="button" onClick={(event) => { event.stopPropagation(); selectImageIndex((selectedImageIndex + 1) % assetImages.length) }} aria-label="Next image"><ChevronRight size={26} /></button>}
        <span className="digital-image-lightbox-count">{selectedImageIndex + 1} / {assetImages.length}</span>
      </div>}
    </main>
  )
}
