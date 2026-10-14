import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { userApi } from '../services/api'
import { addToCart } from '../services/cart'

export default function ProductDetailsPage({ productSlug, onNavigate }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [purchaseError, setPurchaseError] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [failedImages, setFailedImages] = useState(() => new Set())

  useEffect(() => {
    let active = true
    userApi.storeProduct(productSlug)
      .then((result) => {
        if (active) {
          setProduct(result.data)
          setSelectedImageIndex(0)
          setFailedImages(new Set())
        }
      })
      .catch((error) => {
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
      return () => { active = false }
  }, [productSlug])

  const productImages = [...new Set([
    product?.image,
    ...(Array.isArray(product?.images) ? product.images : []),
  ].filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim()))]
  const selectedImage = productImages[selectedImageIndex] || ''

  const addSelectedProductToCart = () => {
    if (!product._id) {
      setPurchaseError('This product is not available in the live catalog and cannot be purchased.')
      return false
    }
    addToCart(product, quantity)
    return true
  }

  if (loading) {
    return (
      <main className="page-wrapper">
        <div className="page-container product-details-loading" role="status" aria-live="polite">
          <span className="session-spinner" aria-hidden="true" />
          <span>Loading product…</span>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <div className="page-wrapper">
        <div className="page-container product-not-found">
          <div className="breadcrumb">Home / Shop / Product</div>
          <h1 className="page-title">We couldn’t find that product.</h1>
          <p className="page-subtitle">{loadError || 'It may have been removed or the link may be incorrect.'}</p>
          <button type="button" className="btn-emerald-submit" onClick={() => onNavigate?.('/shop')}>
            <ArrowLeft size={16} /> Back to the shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper product-details-page">
      <div className="page-container">
        <div className="product-detail-breadcrumb reveal">
          <div className="breadcrumb">Home / Shop / {(product.category || 'General').toLowerCase()} / {product.name}</div>
          <button type="button" className="product-back-link" onClick={() => onNavigate?.('/shop')}>
            <ArrowLeft size={14} /> Back to shop
          </button>
        </div>

        <div className="product-detail-grid">
          <section className="product-gallery reveal" aria-label={`${product.name} product images`}>
            <div className={`product-detail-art product-detail-image-frame ${selectedImage && !failedImages.has(selectedImage) ? '' : 'image-unavailable'}`}>
              {selectedImage && !failedImages.has(selectedImage)
                ? <img src={selectedImage} alt={`${product.name} view ${selectedImageIndex + 1}`} onError={() => {
                  setFailedImages((current) => new Set(current).add(selectedImage))
                  const nextIndex = productImages.findIndex((image, index) => index > selectedImageIndex && !failedImages.has(image))
                  if (nextIndex >= 0) setSelectedImageIndex(nextIndex)
                }} />
                : null}
            </div>
            {productImages.length > 1 && (
              <div className="product-gallery-thumbnails" role="group" aria-label="Select a product image">
                {productImages.map((image, index) => (
                  <button
                    className={`product-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    type="button"
                    key={`${image}-${index}`}
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      onError={() => setFailedImages((current) => new Set(current).add(image))}
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="product-assurance-row">
              <span><ShieldCheck size={16} /> Genuine product</span>
              <span><Truck size={16} /> Nationwide delivery</span>
            </div>
          </section>

          <section className="product-detail-info reveal">
            <span className="prod-cat">{product.category || 'General'}</span>
            <h1>{product.name}</h1>
            <div className="product-detail-price">{`₦${Number(product.price || 0).toLocaleString('en-NG')}`}</div>
            <p className="product-detail-description">{product.description || 'A quality pick for everyday use, selected for your home, work, and daily routine.'}</p>

            <div className={`product-stock-line ${product.stock > 0 ? 'available' : 'unavailable'}`}>
              <span className="product-stock-dot" />
              {product.stock > 0 ? `${product.stock} available · Ready to ship` : 'Currently out of stock'}
            </div>

            <div className="product-buy-row">
              <div className="product-quantity">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button>
                <span>{quantity}</span>
                <button type="button" aria-label="Increase quantity" disabled={quantity >= Math.min(10, Number(product.stock || 0))} onClick={() => setQuantity((value) => Math.min(10, Number(product.stock || 0), value + 1))}><Plus size={14} /></button>
              </div>
              <button type="button" className="product-add-cart" disabled={product.stock < 1} onClick={() => { if (addSelectedProductToCart()) onNavigate?.('/cart') }}>
                <ShoppingBag size={17} /> Add to cart
              </button>
            </div>
            {purchaseError && <p className="wallet-notice error" role="alert">{purchaseError}</p>}
            <button type="button" className="product-buy-now" disabled={product.stock < 1} onClick={() => { if (addSelectedProductToCart()) onNavigate?.('/checkout') }}>
              Buy now <ArrowRight size={16} />
            </button>

            <div className="product-details-divider" />
            <h2 className="product-features-title">Product information</h2>
            <ul className="product-features-list">
              {(product.tags?.length ? product.tags : [product.category || 'Everyday essential']).map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}
            </ul>
            <div className="product-delivery-note">
              <Truck size={17} />
              <span><strong>Delivery to your door</strong><small>Delivery options and timing are confirmed at checkout.</small></span>
            </div>
          </section>
        </div>

        <section className="product-more-card reveal">
          <div>
            <span className="pill-tag">CARDZIP STORE</span>
            <h2>{product.name}</h2>
            <p>{product.description || 'Shop confidently with secure checkout and nationwide delivery options.'}</p>
          </div>
          <button type="button" className="product-back-link" onClick={() => onNavigate?.('/shop')}>Explore more products <ArrowRight size={14} /></button>
        </section>
      </div>
    </div>
  )
}
