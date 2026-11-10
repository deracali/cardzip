import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, MapPin, MessageCircle, Phone } from 'lucide-react'
import { userApi } from '../services/api'
import { formatNaira } from '../utils/currency'
import AppDownloadFooter from '../components/AppDownloadFooter'
import CardzipLoader from '../components/CardzipLoader'
import './ShopMarketplace.css'

const whatsappNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.startsWith('0') && digits.length === 11 ? `234${digits.slice(1)}` : digits
}

export default function ShopProductDetailsPage({ shopSlug, shopProductSlug, onNavigate }) {
  const [product, setProduct] = useState(null)
  const [shop, setShop] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [relatedProductsError, setRelatedProductsError] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    userApi.shopProduct(shopSlug, shopProductSlug)
      .then((result) => {
        if (!active) return
        setProduct(result.data?.product || null)
        setShop(result.data?.shop || null)
        const images = result.data?.product?.images?.length
          ? result.data.product.images
          : result.data?.product?.imageUrl ? [result.data.product.imageUrl] : []
        setSelectedImage(images[0] || '')
        setRelatedProductsError('')
        userApi.shopProducts(shopSlug, '?page=1&limit=12')
          .then((relatedResult) => {
            if (!active) return
            setRelatedProducts((relatedResult.data || [])
              .filter((item) => item._id !== result.data.product._id && item.category === result.data.product.category)
              .slice(0, 4))
          })
          .catch((requestError) => {
            if (active) setRelatedProductsError(requestError.message || 'Could not load related products.')
          })
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load this product.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [shopSlug, shopProductSlug])

  const images = product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : []

  return (
    <>
      <main className="shop-market-page">
        <div className="shop-market-shell shop-product-detail-shell">
        <button type="button" className="shop-market-back" onClick={() => onNavigate?.(`/shops/${encodeURIComponent(shopSlug)}`)}><ArrowLeft size={15} /> Back to store</button>
        {loading ? <p className="shop-market-state" role="status"><CardzipLoader compact label="Loading product" /></p>
          : error || !product || !shop ? <p className="shop-market-error" role="alert">{error || 'This product is unavailable.'}</p>
            : (
              <>
                <section className="shop-product-detail">
                  <div>
                    <div className="shop-product-detail-image">
                      {selectedImage ? <img src={selectedImage} alt={product.name} /> : <Camera size={34} />}
                    </div>
                    {images.length > 1 && <div className="shop-product-detail-thumbnails" role="group" aria-label={`${product.name} photos`}>
                      {images.map((image, index) => <button type="button" key={`${image}-${index}`} className={selectedImage === image ? 'selected' : ''} onClick={() => setSelectedImage(image)} aria-label={`Show photo ${index + 1}`}><img src={image} alt="" /></button>)}
                    </div>}
                  </div>
                  <div className="shop-product-detail-copy">
                    <span className="shop-market-eyebrow">{product.category || 'STORE PRODUCT'} · {product.condition === 'used' ? 'USED' : 'BRAND NEW'}</span>
                    <h1>{product.name}</h1>
                    <strong className="shop-product-detail-price">{formatNaira(product.price)}</strong>
                    <p className="shop-product-detail-stock">{product.stock} available</p>
                    <p className="shop-product-detail-description">{product.description}</p>
                    <div className="shop-product-detail-store"><strong>{shop.businessName}</strong><span><MapPin size={14} />{shop.address}</span></div>
                    <div className="shop-product-detail-actions">
                      <a href={`https://wa.me/${whatsappNumber(shop.contactPhone)}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} from ${shop.businessName}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Ask about this product <ArrowRight size={15} /></a>
                      <a href={`tel:${shop.contactPhone}`}><Phone size={15} /> Call store</a>
                    </div>
                    <p className="shop-direct-contact-note">Contact the store directly to arrange a purchase. Cardzip does not process payment or delivery for this product.</p>
                  </div>
                </section>
                <section className="shop-related-products" aria-labelledby="shop-related-products-heading">
                  <div className="shop-market-section-heading"><div><span>MORE FROM THIS STORE</span><h2 id="shop-related-products-heading">Related products</h2></div></div>
                  {relatedProductsError && <p className="shop-market-error" role="alert">{relatedProductsError}</p>}
                  {relatedProducts.length > 0 ? <div className="shop-related-grid">
                    {relatedProducts.map((item) => (
                      <button type="button" className="shop-related-card" key={item._id} onClick={() => onNavigate?.(`/shops/${encodeURIComponent(shopSlug)}/products/${encodeURIComponent(item.slug)}`)}>
                        <span className="shop-product-image">{(item.images?.[0] || item.imageUrl) ? <img src={item.images?.[0] || item.imageUrl} alt="" loading="lazy" /> : <Camera size={22} />}</span>
                        <span className="shop-related-category">{item.category || 'General'}</span>
                        <strong>{item.name}</strong>
                        <span className="shop-related-price">{formatNaira(item.price)}</span>
                      </button>
                    ))}
                  </div> : !relatedProductsError && <p className="shop-market-state">More products from this store will appear here.</p>}
                </section>
              </>
            )}
        </div>
      </main>
      <AppDownloadFooter onNavigate={onNavigate} />
    </>
  )
}
