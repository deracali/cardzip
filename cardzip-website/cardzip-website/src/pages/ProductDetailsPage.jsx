import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Megaphone,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { userApi } from '../services/api'
import { addToCart } from '../services/cart'
import { getStorefrontPreferences, recordProductInteraction } from '../services/storePreferences'
import { formatNaira } from '../utils/currency'
import CardzipLoader from '../components/CardzipLoader'
import ReportListingButton from '../components/ReportListingButton'
import './ProductDetailsPage.css'

const colorSwatches = {
  black: '#111827',
  blue: '#2563eb',
  'midnight blue': '#172554',
  midnight: '#111827',
  white: '#ffffff',
  silver: '#cbd5e1',
  green: '#16a34a',
  graphite: '#475569',
  sand: '#d6c4a1',
  red: '#dc2626',
  gold: '#d4af37',
  pink: '#ec4899',
  purple: '#7c3aed',
  gray: '#94a3b8',
  grey: '#94a3b8',
  navy: '#1e3a8a',
}

const getColorSwatch = (color) => {
  const value = String(color || '').trim()
  if (/^#(?:[\da-f]{3}){1,2}$/i.test(value)) return value
  return colorSwatches[value.toLowerCase()] || '#94a3b8'
}

export default function ProductDetailsPage({ productSlug, onNavigate, user }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')
  const [purchaseError, setPurchaseError] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [failedImages, setFailedImages] = useState(() => new Set())
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [relatedProductsError, setRelatedProductsError] = useState('')
  const viewedProductSlug = useRef('')
  const userId = String(user?._id || user?.id || user?.email || 'guest')

  useEffect(() => {
    let active = true
    userApi.storeProduct(productSlug)
      .then((result) => {
        if (active) {
          setProduct(result.data)
          const viewedProductKey = `${userId}:${productSlug}`
          if (viewedProductSlug.current !== viewedProductKey) {
            recordProductInteraction(result.data, 'view', user)
            viewedProductSlug.current = viewedProductKey
          }
          setSelectedColor(result.data.colors?.[0] || '')
          setSelectedImageIndex(0)
          setFailedImages(new Set())
          setDescriptionExpanded(false)
          setRelatedProductsError('')
          const categoryQuery = new URLSearchParams({
            category: result.data.category || '',
            page: '1',
            limit: '6',
            sort: 'featured',
            preferences: JSON.stringify(getStorefrontPreferences(user)),
          })
          userApi.storeProducts(`?${categoryQuery.toString()}`)
            .then((relatedResult) => {
              if (!active) return
              setRelatedProducts((relatedResult.data || []).filter((item) => String(item._id) !== String(result.data._id)).slice(0, 4))
            })
            .catch((error) => {
              if (active) setRelatedProductsError(error.message || 'Could not load similar products.')
            })
        }
      })
      .catch((error) => {
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
      return () => { active = false }
  }, [productSlug, user, userId])

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
    if (product.colors?.length && !selectedColor) {
      setPurchaseError('Choose a color before adding this product to your cart.')
      return false
    }
    recordProductInteraction(product, 'cart', user)
    addToCart(product, quantity, selectedColor)
    return true
  }

  if (loading) {
    return (
      <main className="page-wrapper">
        <div className="page-container product-details-loading">
          <CardzipLoader compact label="Loading product" />
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

  const productDescription = product.description || 'A quality pick for everyday use, selected for your home, work, and daily routine.'

  return (
    <div className="page-wrapper product-details-page">
      <div className="page-container">
        <div className="product-detail-breadcrumb reveal">
          <div className="breadcrumb">Home / Shop / {(product.category || 'General').toLowerCase()} / {product.name}</div>
          <button type="button" className="product-back-link" onClick={() => onNavigate?.('/shop')}>
            <ArrowLeft size={14} /> Shop
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
            <div className="product-detail-price-row">
              <div className="product-detail-price">{formatNaira(product.price)}</div>
              {Number(product.compareAtPrice) > Number(product.price) && (
                <div className="product-detail-original-price">{formatNaira(product.compareAtPrice)}</div>
              )}
            </div>
            <div className="product-condition-line">{product.condition === 'used' ? 'Used' : 'Brand new'}{product.isSold && <strong className="product-sold-label">Sold</strong>}</div>
            <div className={`product-stock-line ${product.stock > 0 ? 'available' : 'unavailable'}`}>
              <span className="product-stock-dot" />
              {product.stock > 0 ? `${product.stock} available · Ready to ship` : 'Currently out of stock'}
            </div>
            {product.colors?.length > 0 && (
              <section className="product-content-section product-color-picker">
                <h2 className="product-content-title">Choose a color <span className="product-selected-color">{selectedColor}</span></h2>
                <div className="product-detail-color-options" role="radiogroup" aria-label="Choose a product color">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`product-detail-color-option${selectedColor === color ? ' active' : ''}`}
                      role="radio"
                      aria-checked={selectedColor === color}
                      aria-label={`Select ${color}`}
                      onClick={() => { setSelectedColor(color); setPurchaseError('') }}
                    >
                      <span className="product-detail-color-swatch" style={{ backgroundColor: getColorSwatch(color) }} aria-hidden="true" />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="product-content-section">
              <h2 className="product-content-title">Description</h2>
              <p className={`product-detail-description${descriptionExpanded ? ' expanded' : ''}`}>{productDescription}</p>
              {productDescription.length > 180 && (
                <button
                  type="button"
                  className="product-description-toggle"
                  onClick={() => setDescriptionExpanded((expanded) => !expanded)}
                >
                  {descriptionExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </section>

            {product.keyHighlights?.length > 0 && (
              <section className="product-content-section">
                <h2 className="product-content-title">Key highlights</h2>
                <ul className="product-features-list">
                  {product.keyHighlights.map((highlight, index) => <li key={`${highlight}-${index}`}><Check size={15} /> {highlight}</li>)}
                </ul>
              </section>
            )}

            {product.specifications?.length > 0 && (
              <section className="product-content-section">
                <h2 className="product-content-title">Specifications</h2>
                <div className="product-specifications-table">
                  <table>
                    <tbody>
                      {product.specifications.map((specification, index) => (
                        <tr key={`${specification.label}-${index}`}>
                          <th scope="row">{specification.label}</th>
                          <td>{specification.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {product.packagingDetails?.trim() && (
              <section className="product-content-section">
                <h2 className="product-content-title">Packaging details</h2>
                <p className="product-packaging-details">{product.packagingDetails}</p>
              </section>
            )}

            <div className="product-buy-row">
              <div className="product-quantity">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button>
                <span>{quantity}</span>
                <button type="button" aria-label="Increase quantity" disabled={quantity >= Math.min(10, Number(product.stock || 0))} onClick={() => setQuantity((value) => Math.min(10, Number(product.stock || 0), value + 1))}><Plus size={14} /></button>
              </div>
              <button type="button" className="product-add-cart" disabled={product.isSold || product.stock < 1 || Boolean(product.colors?.length && !selectedColor)} onClick={() => { if (addSelectedProductToCart()) onNavigate?.('/cart') }}>
                <ShoppingBag size={17} /> {product.isSold ? 'Sold' : 'Add to cart'}
              </button>
            </div>
            {purchaseError && <p className="wallet-notice error" role="alert">{purchaseError}</p>}
            <button type="button" className="product-buy-now" disabled={product.isSold || product.stock < 1 || Boolean(product.colors?.length && !selectedColor)} onClick={() => { if (addSelectedProductToCart()) onNavigate?.('/checkout') }}>
              {product.isSold ? 'This product has been sold' : <>Buy now <ArrowRight size={16} /></>}
            </button>

            <div className="product-details-divider" />
            <h2 className="product-features-title">Store information</h2>
            <ul className="product-features-list">
              {(product.tags?.length ? product.tags : [product.category || 'Everyday essential']).map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}
            </ul>
            <div className="product-delivery-note">
              <Truck size={17} />
              <span>
                <strong>{product.expectedDelivery?.trim() ? 'Expected delivery' : 'Delivery to your door'}</strong>
                <small>{product.expectedDelivery?.trim() || 'Delivery options and timing are confirmed at checkout.'}</small>
              </span>
            </div>
            <button type="button" className="product-promotion-banner" onClick={() => onNavigate?.('/community-market')}>
              <Megaphone size={19} />
              <span><strong>Promote your product to local buyers</strong><small>Post a community listing and connect directly. No Cardzip payment.</small></span>
              <ArrowRight size={16} />
            </button>
            <ReportListingButton targetType="store_product" targetId={product._id} targetTitle={product.name} onNavigate={onNavigate} />
          </section>
        </div>

        <section className="product-more-card reveal">
          <div>
            <span className="pill-tag">CARDZIP STORE</span>
            <h2>{product.name}</h2>
          </div>
          <button type="button" className="product-back-link" onClick={() => onNavigate?.('/shop')}>Explore more products <ArrowRight size={14} /></button>
        </section>
        <section className="product-related-section reveal">
          <div className="product-related-heading"><span className="pill-tag">{product.category || 'CARDZIP STORE'}</span><h2>Related products</h2></div>
          {relatedProductsError && <p className="wallet-notice error" role="alert">{relatedProductsError}</p>}
          {relatedProducts.length > 0 ? <div className="product-related-grid">
            {relatedProducts.map((item) => <button type="button" className="product-related-card" key={item._id} onClick={() => onNavigate?.(`/product/${encodeURIComponent(item.slug)}`)}>
              <span className="product-related-image">{(item.image || item.images?.[0]) && <img src={item.image || item.images[0]} alt="" loading="lazy" />}</span>
              <span className="product-related-category">{item.category || 'General'}</span>
              <strong>{item.name}</strong>
              <span className="product-related-price">{formatNaira(item.price)}</span>
            </button>)}
          </div> : !relatedProductsError && <p className="product-related-empty">More products in this category will appear here.</p>}
        </section>
        </div>
    </div>
  )
}
