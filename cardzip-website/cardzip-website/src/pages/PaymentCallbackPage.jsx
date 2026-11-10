import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Clock3, X, XCircle } from 'lucide-react'
import { billApi, sms4Api, userApi } from '../services/api'
import { clearCart } from '../services/cart'

export default function PaymentCallbackPage({ onNavigate }) {
  const reference = new URLSearchParams(window.location.search).get('reference')
  const purpose = new URLSearchParams(window.location.search).get('purpose') || sessionStorage.getItem('cardzip-payment-purpose')
  const [status, setStatus] = useState(() => reference ? 'verifying' : 'failed')
  const [message, setMessage] = useState(() => reference
    ? 'Confirming your payment securely with Paystack. Please do not close this page.'
    : 'The payment reference is missing. Your wallet has not been credited.')
  const [orderPayment, setOrderPayment] = useState(purpose === 'store_order')
  const [orderNumber, setOrderNumber] = useState('')
  const virtualNumberPayment = purpose === 'virtual_number'
  const [advertisementPayment, setAdvertisementPayment] = useState(purpose === 'banner_ad')
  const [communityPromotionPayment, setCommunityPromotionPayment] = useState(purpose === 'community_promotion')
  const [digitalProductPayment, setDigitalProductPayment] = useState(purpose === 'digital_product')
  const [digitalProductAccess, setDigitalProductAccess] = useState(null)
  const [digitalProductSourceCode, setDigitalProductSourceCode] = useState(null)
  const [digitalProductId, setDigitalProductId] = useState('')
  const [digitalProductDocuments, setDigitalProductDocuments] = useState([])
  const [digitalProductTemplateDocuments, setDigitalProductTemplateDocuments] = useState([])
  const [digitalProductAccessType, setDigitalProductAccessType] = useState('')
  const [digitalProductPurchaseType, setDigitalProductPurchaseType] = useState('')
  const [sellerDigitalAsset, setSellerDigitalAsset] = useState(null)
  const [downloadingFile, setDownloadingFile] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const [websitePreviewOpen, setWebsitePreviewOpen] = useState(false)
  const [communityPromotionListingId, setCommunityPromotionListingId] = useState('')
  const [virtualNumber, setVirtualNumber] = useState('')
  const verificationStarted = useRef(false)

  const downloadPurchasedFile = async (productId, fileType, documentIndex, filename) => {
    const archiveType = fileType === 'source-code'
      ? digitalProductPurchaseType === 'template' || sellerDigitalAsset?.purchaseType === 'template'
        ? 'template-source-code'
        : 'rental-source-code'
      : fileType
    const key = fileType === 'source-code'
      ? archiveType
      : `${fileType}-${documentIndex}`
    setDownloadingFile(key)
    setDownloadError('')
    try {
      await userApi.downloadDigitalProductFile(productId, archiveType, documentIndex, filename, reference)
    } catch (error) {
      setDownloadError(error.message || 'Could not download this purchased file.')
    } finally {
      setDownloadingFile('')
    }
  }

  const verifyVirtualNumber = useCallback(async () => {
    if (!reference) return
    setStatus('verifying')
    try {
      const result = await sms4Api.verifyPaystack({ reference })
      const transaction = result.data
      if (transaction?.status === 'completed') {
        setStatus('success')
        setVirtualNumber(transaction.phoneNumber || '')
        setMessage('Paystack confirmed your payment and your virtual number is ready.')
      } else {
        setStatus('pending')
        setMessage('Your payment is confirmed and number fulfillment is still processing. Verify again shortly.')
      }
    } catch (error) {
      if (error.data?.status === 'failed') {
        setStatus('failed')
        setMessage(error.message || 'The virtual-number payment could not be completed.')
      } else {
        setStatus('pending')
        setMessage(`${error.message || 'Could not confirm the virtual-number payment right now.'} You can verify again shortly.`)
      }
    }
  }, [reference])

  useEffect(() => {
    if (reference || purpose !== 'digital_product') return
    if (verificationStarted.current) return
    verificationStarted.current = true
    let active = true
    const returnPath = sessionStorage.getItem('cardzip-digital-product-return-path') || '/digital-assets'
    const savedReference = sessionStorage.getItem('cardzip-digital-product-reference') || ''
    sessionStorage.removeItem('cardzip-payment-purpose')
    const returnFromCheckout = async () => {
      if (savedReference) {
        try {
          const result = await userApi.verifyFunding({ reference: savedReference })
          const receipt = result.data?.digitalProduct
          if (active && result.data?.status === 'completed' && receipt?.productSlug) {
            sessionStorage.removeItem('cardzip-digital-product-return-path')
            sessionStorage.removeItem('cardzip-digital-product-reference')
            onNavigate?.(`/digital-assets/${encodeURIComponent(receipt.productSlug)}?payment=success&reference=${encodeURIComponent(savedReference)}`, true)
            return
          }
        } catch (error) {
          if (!active) return
          if (error.status !== 409) {
            sessionStorage.removeItem('cardzip-digital-product-return-path')
            sessionStorage.removeItem('cardzip-digital-product-reference')
            onNavigate?.(`${returnPath}?payment=failed&reference=${encodeURIComponent(savedReference)}`, true)
            return
          }
        }
      }
      if (!active) return
      sessionStorage.removeItem('cardzip-digital-product-return-path')
      sessionStorage.removeItem('cardzip-digital-product-reference')
      onNavigate?.(`${returnPath}?payment=cancelled`, true)
    }
    void returnFromCheckout()
    return () => {
      active = false
      verificationStarted.current = false
    }
  }, [reference, purpose, onNavigate])

  useEffect(() => {
    if (!reference || verificationStarted.current) return
    verificationStarted.current = true
    const digitalProductReturnPath = sessionStorage.getItem('cardzip-digital-product-return-path') || ''
    sessionStorage.removeItem('cardzip-payment-purpose')
    sessionStorage.removeItem('cardzip-digital-product-reference')
    if (purpose === 'bill_payment') {
      billApi.verifyPaystack({ reference })
        .then((result) => {
          const billPayment = result.data?.billPayment
          const paymentStatus = billPayment?.status === 'completed' ? 'success' : 'pending'
          sessionStorage.setItem('cardzip-bill-payment-result', JSON.stringify({ status: paymentStatus, billPayment, message: result.message }))
          setStatus(paymentStatus === 'success' ? 'success' : 'verifying')
          setMessage(paymentStatus === 'success' ? 'Bill payment confirmed. Your receipt is ready.' : 'Payment received. The provider is still processing your bill.')
        })
        .catch((error) => {
          sessionStorage.setItem('cardzip-bill-payment-result', JSON.stringify({
            status: 'failed',
            message: error.message,
            billPayment: error.data?.billPayment,
          }))
          setStatus('failed')
          setMessage(error.message)
        })
      return
    }
    if (purpose === 'virtual_number') {
      window.setTimeout(() => { void verifyVirtualNumber() }, 0)
      return
    }
    userApi.verifyFunding({ reference })
      .then((result) => {
        const isStoreOrder = Boolean(result.data?.order)
        const isAdvertisement = Boolean(result.data?.campaign)
        const promotion = result.data?.promotion
        const isCommunityPromotion = Boolean(promotion)
        const digitalProduct = result.data?.digitalProduct
        const purchasedSellerAsset = result.data?.sellerDigitalAsset
        const isDigitalProduct = purpose === 'digital_product' || Boolean(digitalProduct)
        const isSellerDigitalAsset = purpose === 'seller_digital_asset' || Boolean(purchasedSellerAsset)
        setSellerDigitalAsset(purchasedSellerAsset || null)
        const downloadableProduct = digitalProduct || purchasedSellerAsset
        setDigitalProductAccess(downloadableProduct?.accessUrl || null)
        setDigitalProductSourceCode(
          downloadableProduct?.sourceCodeAvailable || downloadableProduct?.templateSourceCodeAvailable ? 'available' : null,
        )
        setDigitalProductId(downloadableProduct?.productId || '')
        setDigitalProductDocuments(downloadableProduct?.documents || [])
        setDigitalProductTemplateDocuments(downloadableProduct?.templateDocuments || [])
        setDigitalProductAccessType(downloadableProduct?.productType || '')
        setDigitalProductPurchaseType(downloadableProduct?.purchaseType || '')
        setOrderPayment(isStoreOrder)
        setAdvertisementPayment(isAdvertisement)
        setCommunityPromotionPayment(isCommunityPromotion)
        setDigitalProductPayment(isDigitalProduct)
        const promotionListing = promotion?.listing
        setCommunityPromotionListingId(typeof promotionListing === 'object' ? promotionListing?._id || '' : String(promotionListing || ''))
        if (isStoreOrder) {
          clearCart()
          setOrderNumber(result.data.order.orderNumber)
        }
        setStatus('success')
        if (isDigitalProduct && digitalProduct?.productSlug) {
          sessionStorage.removeItem('cardzip-digital-product-return-path')
          onNavigate?.(`/digital-assets/${encodeURIComponent(digitalProduct.productSlug)}?payment=success&reference=${encodeURIComponent(reference)}`, true)
          return
        }
        setMessage(isCommunityPromotion
          ? 'Payment confirmed. Your community product promotion is waiting for administrator approval.'
          : isAdvertisement
          ? 'Payment confirmed. Your campaign is reserved and waiting for Cardzip creative review.'
          : isStoreOrder
          ? `Payment confirmed. Order ${result.data.order.orderNumber} is now paid.`
          : isSellerDigitalAsset
            ? `Payment confirmed for ${purchasedSellerAsset?.productName || 'your digital listing'}. The seller’s 70% share has been credited to their Cardzip wallet. Your paid access and downloads are ready below.`
            : isDigitalProduct
            ? digitalProduct?.purchaseType === 'template' && !digitalProduct?.sourceCodeUrl
              ? `Payment confirmed for ${digitalProduct.productName}. Contact support to arrange your project template handover and two weeks of setup/upload.`
              : digitalProduct?.purchaseType === 'template'
                ? `Payment confirmed for ${digitalProduct.productName}. Your template source-code download is ready below.`
              : digitalProduct?.accessUrl
                ? `Payment confirmed for ${digitalProduct.productName}. Your access is ready below.`
                : `Payment is complete. Contact Cardzip support to arrange your digital-product access.`
          : 'Payment confirmed. Your wallet balance has been updated.')
      })
      .catch((error) => {
        if (purpose === 'digital_product' && digitalProductReturnPath) {
          sessionStorage.removeItem('cardzip-digital-product-return-path')
          onNavigate?.(`${digitalProductReturnPath}?payment=failed&reference=${encodeURIComponent(reference)}`, true)
          return
        }
        setOrderPayment(purpose === 'store_order')
        setAdvertisementPayment(purpose === 'banner_ad')
        setCommunityPromotionPayment(purpose === 'community_promotion')
        setDigitalProductPayment(purpose === 'digital_product')
        setSellerDigitalAsset(null)
        setDigitalProductAccess(null)
        setDigitalProductSourceCode(null)
        setDigitalProductId('')
        setDigitalProductDocuments([])
        setDigitalProductTemplateDocuments([])
        setDigitalProductAccessType('')
        setDigitalProductPurchaseType('')
        setStatus('failed')
        setMessage(error.message)
      })
  }, [reference, purpose, onNavigate, verifyVirtualNumber])

  return (
    <div className="page-wrapper"><div className="page-container">
      <section className="wallet-form-card" role="status">
        <h1 className="page-title">{status === 'success' ? 'Payment complete' : status === 'failed' ? 'Payment not confirmed' : status === 'pending' ? 'Payment processing' : 'Verifying payment'}</h1>
        <p className="page-subtitle">{message}</p>
        {status === 'success' && digitalProductAccess && (digitalProductAccessType === 'app'
          ? <a className="btn-emerald-submit" href={digitalProductAccess} target="_blank" rel="noreferrer">Download Android app</a>
          : digitalProductAccessType === 'ios_app'
            ? <a className="btn-emerald-submit" href={digitalProductAccess} target="_blank" rel="noreferrer">Open iOS app access</a>
            : <button className="btn-emerald-submit" type="button" onClick={() => setWebsitePreviewOpen(true)}>Open website access in preview</button>
        )}
        {status === 'success' && digitalProductSourceCode && digitalProductId && <button className="digital-access-link" type="button" disabled={Boolean(downloadingFile)} onClick={() => void downloadPurchasedFile(digitalProductId, 'source-code', undefined, 'source-code.zip')}>
          {downloadingFile === 'rental-source-code' || downloadingFile === 'template-source-code' ? 'Downloading source code…' : `Download ${digitalProductPurchaseType === 'template' ? 'full-template' : 'rental'} source ZIP`}
        </button>}
        {status === 'success' && digitalProductDocuments.map((document, index) => {
          const key = `document-${index}`
          return <button className="digital-access-link" type="button" key={`${document.name}-${index}`} disabled={Boolean(downloadingFile)} onClick={() => void downloadPurchasedFile(digitalProductId, 'document', index, document.name)}>
            {downloadingFile === key ? `Downloading ${document.name}…` : `Download ${document.name}`}
          </button>
        })}
        {status === 'success' && digitalProductTemplateDocuments.map((document, index) => {
          const key = `template-document-${index}`
          return <button className="digital-access-link" type="button" key={`template-${document.name}-${index}`} disabled={Boolean(downloadingFile)} onClick={() => void downloadPurchasedFile(digitalProductId, 'template-document', index, document.name)}>
            {downloadingFile === key ? `Downloading ${document.name}…` : `Download legal document: ${document.name}`}
          </button>
        })}
        {downloadError && <p className="digital-download-unavailable" role="alert">{downloadError}</p>}
        {status === 'success' && sellerDigitalAsset && <section className="seller-digital-receipt">
          <h2>Your paid listing access</h2>
          {sellerDigitalAsset.websiteUrl && <div className="seller-digital-preview"><iframe title={`Preview ${sellerDigitalAsset.productName}`} src={sellerDigitalAsset.websiteUrl} sandbox="allow-scripts allow-forms allow-popups" referrerPolicy="no-referrer" /></div>}
          {sellerDigitalAsset.apkUrl && <a className="digital-access-link" href={sellerDigitalAsset.apkUrl} target="_blank" rel="noreferrer" download>Download Android APK</a>}
          {sellerDigitalAsset.iosAppUrl && <a className="digital-access-link" href={sellerDigitalAsset.iosAppUrl} target="_blank" rel="noreferrer">Open iOS app</a>}
          {sellerDigitalAsset.sourceCodeAvailable && <button className="digital-access-link" type="button" disabled={Boolean(downloadingFile)} onClick={() => void downloadPurchasedFile(sellerDigitalAsset.productId, 'source-code', undefined, `${sellerDigitalAsset.productName}-source-code.zip`)}>
            {downloadingFile === 'template-source-code' || downloadingFile === 'rental-source-code' ? 'Downloading source code…' : `Download ${sellerDigitalAsset.purchaseType === 'template' ? 'full-template' : 'rental'} source ZIP`}
          </button>}
          <div className="seller-digital-gallery">{sellerDigitalAsset.screenshots?.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${sellerDigitalAsset.productName} screenshot ${index + 1}`} loading="lazy" />)}</div>
        </section>}
        <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.(purpose === 'bill_payment' ? '/bills' : virtualNumberPayment ? '/virtual-numbers' : communityPromotionPayment ? (communityPromotionListingId ? `/community-market/${communityPromotionListingId}` : '/community-market') : advertisementPayment ? '/my-adverts' : digitalProductPayment || purpose === 'seller_digital_asset' ? '/digital-assets' : status === 'success' && orderPayment ? '/orders' : status === 'success' ? '/wallet' : '/add-money')}>
          {purpose === 'bill_payment' ? 'Return to bills' : virtualNumberPayment ? 'View virtual numbers' : communityPromotionPayment ? 'Return to community market' : advertisementPayment ? 'View your campaigns' : digitalProductPayment || purpose === 'seller_digital_asset' ? 'Return to websites and apps' : status === 'success' && orderPayment ? 'View orders' : status === 'success' ? 'View wallet' : 'Return to wallet funding'}
        </button>
      </section>
      {websitePreviewOpen && status === 'success' && digitalProductAccess && !['app', 'ios_app'].includes(digitalProductAccessType) && (
        <div className="digital-website-preview-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setWebsitePreviewOpen(false)
        }}>
          <section className="digital-website-preview" role="dialog" aria-modal="true" aria-labelledby="payment-website-preview-title">
            <header>
              <div><span className="digital-assets-kicker">LIVE WEBSITE ACCESS</span><h2 id="payment-website-preview-title">Purchased website</h2></div>
              <button type="button" onClick={() => setWebsitePreviewOpen(false)} aria-label="Close website preview"><X size={20} /></button>
            </header>
            <iframe title="Purchased website access" src={digitalProductAccess} referrerPolicy="no-referrer" sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads" />
          </section>
        </div>
      )}
      {virtualNumberPayment && status !== 'verifying' && <div className="payment-choice-backdrop order-result-backdrop">
        <section className="payment-choice-dialog order-result-dialog" role="dialog" aria-modal="true" aria-labelledby="virtual-number-payment-title">
          <div className={`bill-result-icon ${status === 'success' ? 'success' : status === 'pending' ? 'pending' : 'failed'}`}>
            {status === 'success' ? <CheckCircle2 size={22} /> : status === 'pending' ? <Clock3 size={22} /> : <XCircle size={22} />}
          </div>
          <h2 id="virtual-number-payment-title">{status === 'success' ? 'Virtual number ready' : status === 'pending' ? 'Rental is processing' : 'Virtual-number payment not completed'}</h2>
          <p>{message}</p>
          {virtualNumber && <div className="order-result-reference"><span>Your new number</span><strong>{virtualNumber}</strong></div>}
          <div className="order-result-actions">
            {status === 'pending' && <button type="button" className="btn-emerald-submit" onClick={() => void verifyVirtualNumber()}>Verify again</button>}
            <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.('/virtual-numbers')}>View virtual numbers</button>
            <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/virtual-numbers')}>Close</button>
          </div>
          <button type="button" className="bill-payment-close" aria-label="Close payment result" onClick={() => onNavigate?.('/virtual-numbers')}><X size={18} /></button>
        </section>
      </div>}
      {orderPayment && status !== 'verifying' && <div className="payment-choice-backdrop order-result-backdrop">
        <section className="payment-choice-dialog order-result-dialog" role="dialog" aria-modal="true" aria-labelledby="paystack-order-result-title">
          <div className={`bill-result-icon ${status === 'success' ? 'success' : 'failed'}`}>
            {status === 'success' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          <h2 id="paystack-order-result-title">{status === 'success' ? 'Order placed successfully' : 'Order payment could not be confirmed'}</h2>
          <p>{message}</p>
          {orderNumber && <div className="order-result-reference"><span>Order number</span><strong>{orderNumber}</strong></div>}
          <div className="order-result-actions">
            {status === 'success' && orderNumber
              ? <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.(`/orders/${encodeURIComponent(orderNumber)}`)}>View order and receipt</button>
              : <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.('/orders')}>Go to order history</button>}
            <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/shop')}>Return to shop</button>
          </div>
          <button type="button" className="bill-payment-close" aria-label="Close order result" onClick={() => onNavigate?.(status === 'success' ? '/orders' : '/shop')}><X size={18} /></button>
        </section>
      </div>}
    </div></div>
  )
}
