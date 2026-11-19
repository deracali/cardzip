import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, MapPin, Store } from 'lucide-react'
import { userApi } from '../services/api'
import './ShopMarketplace.css'

export default function ShopDirectoryPage({ onNavigate }) {
  const [shops, setShops] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    userApi.shops(`?page=${pagination.page}&limit=12`)
      .then((result) => {
        if (!active) return
        setShops(Array.isArray(result.data) ? result.data : [])
        setPagination(result.pagination || { page: 1, totalPages: 1, totalItems: 0 })
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [pagination.page])

  return (
    <main className="shop-market-page">
      <div className="shop-market-shell">
        <button type="button" className="shop-market-back" onClick={() => onNavigate?.('/shop')}><ArrowLeft size={15} /> Back to Cardzip Store</button>
        <header className="shop-market-hero shop-directory-hero">
          <div><span className="shop-market-eyebrow">THE CARDZIP SHOP DIRECTORY</span><h1>Shop local businesses</h1><p>Discover independent businesses, explore their products, and contact each shop directly.</p></div>
          <div className="shop-directory-hero-actions">
            <button type="button" className="shop-market-primary-button" onClick={() => onNavigate?.('/shops/create')}><Store size={16} /> Create your shop</button>
            <button type="button" className="shop-market-secondary-button" onClick={() => onNavigate?.('/my-shop')}>Manage my shop</button>
          </div>
        </header>
        <section className="shop-directory-section" aria-labelledby="shop-directory-title">
          <div className="shop-market-section-heading"><div><span>BUSINESSES ON CARDZIP</span><h2 id="shop-directory-title">Find a shop</h2></div><small>{pagination.totalItems} {pagination.totalItems === 1 ? 'shop' : 'shops'}</small></div>
          {loading ? <p className="shop-market-state" role="status">Finding local shops…</p>
            : error ? <p className="shop-market-error" role="alert">{error}</p>
              : shops.length === 0 ? (
                <div className="shop-market-empty"><Store size={28} /><strong>Be the first to open a shop</strong><span>Apply to set up a business profile and list your first products.</span><button type="button" className="shop-market-primary-button" onClick={() => onNavigate?.('/shops/create')}>Create your shop <ArrowRight size={15} /></button></div>
              ) : (
                <div className="shop-directory-grid">
                  {shops.map((shop) => (
                    <article className="shop-directory-card" key={shop._id}>
                      {shop.bannerImage
                        ? <img className="shop-directory-banner" src={shop.bannerImage} alt="" loading="lazy" />
                        : <div className="shop-directory-card-mark"><Store size={25} /></div>}
                      <div className="shop-directory-card-content">
                        <span className="shop-market-verified">{shop.shopType === 'business' ? 'VERIFIED BUSINESS' : 'VERIFIED SHOP'}</span>
                        <h3>{shop.businessName}</h3>
                        <p><MapPin size={14} />{shop.address}</p>
                        <span className="shop-directory-description">{shop.description || (shop.shopType === 'business' ? 'View available appointment times from this business.' : 'Explore products from this local business.')}</span>
                        <button type="button" className="shop-market-link-button" onClick={() => onNavigate?.(`/shops/${encodeURIComponent(shop.slug)}`)}>{shop.shopType === 'business' ? 'View business' : 'Visit shop'} <ArrowRight size={15} /></button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          {!loading && !error && pagination.totalPages > 1 && (
            <nav className="shop-market-pagination" aria-label="Shop directory pages">
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <div><button type="button" disabled={pagination.page <= 1} onClick={() => { setLoading(true); setError(''); setPagination((current) => ({ ...current, page: current.page - 1 })) }}>Previous</button>
                <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => { setLoading(true); setError(''); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Next</button></div>
            </nav>
          )}
        </section>
      </div>
    </main>
  )
}
