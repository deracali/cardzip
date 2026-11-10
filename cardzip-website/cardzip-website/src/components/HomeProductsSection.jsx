import { useEffect, useState } from 'react'
import { ArrowRight, Camera } from 'lucide-react'
import { userApi } from '../services/api'
import { getStorefrontPreferences } from '../services/storePreferences'
import { formatNaira } from '../utils/currency'
import CardzipLoader from './CardzipLoader'

export default function HomeProductsSection({ onNavigate }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true
    const query = new URLSearchParams({
      page: '1',
      limit: '4',
      sort: 'featured',
      preferences: JSON.stringify(getStorefrontPreferences()),
    })
    userApi.storeProducts(`?${query.toString()}`)
      .then((result) => {
        if (!active) return
        setProducts(Array.isArray(result.data) ? result.data : [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Could not load homepage featured products:', error)
        if (!active) return
        setLoadError(true)
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
    <section className="home-products-section" aria-labelledby="home-products-title">
      <div className="home-products-heading">
        <div><span>THE CARDZIP STORE</span><h2 id="home-products-title">Find your next essential</h2></div>
        <button type="button" onClick={() => onNavigate?.('/shop')}>Explore store <ArrowRight size={15} /></button>
      </div>
      {products.length > 0 && <div className="home-products-grid">
        {products.map((product) => <button type="button" className="home-product-card" key={product._id} onClick={() => onNavigate?.(`/product/${encodeURIComponent(product.slug)}`)}>
          <span className="home-product-image">{product.image ? <img src={product.image} alt="" loading="lazy" /> : <Camera size={22} />}</span>
          <span className="home-product-info"><strong>{product.name}</strong><small>{product.category || 'General'} · {product.isSold ? 'Sold' : product.condition === 'used' ? 'Used' : 'Brand new'}</small><b>{formatNaira(product.price)}</b></span>
        </button>)}
      </div>}
      {loading && <p className="home-products-message" role="status"><CardzipLoader compact label="Loading featured products" /></p>}
      {!loading && products.length === 0 && <p className="home-products-message" role="status">
        {loadError ? 'Featured products could not be loaded right now.' : 'No products are featured right now.'}
        {' '}<button type="button" onClick={() => onNavigate?.('/shop')}>Browse the full store</button>
      </p>}
      <button type="button" className="home-promotion-banner" onClick={() => onNavigate?.('/community-market')}>
        <span className="home-promotion-mark">AD</span>
        <span><strong>Put your product in front of local buyers</strong><small>Post a community listing and connect directly. No payment through Cardzip.</small></span>
        <ArrowRight size={18} />
      </button>
    </section>
  )
}