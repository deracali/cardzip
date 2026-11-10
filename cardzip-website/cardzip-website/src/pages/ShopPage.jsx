import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Megaphone, Search, ShoppingBag, ShieldCheck, Store, Truck, Wallet } from 'lucide-react'
import { userApi } from '../services/api'
import { addToCart, getCart } from '../services/cart'
import { getStorefrontPreferences, recordProductInteraction, recordStoreCategoryInterest, recordStoreSearch } from '../services/storePreferences'
import { formatNaira } from '../utils/currency'
import AdvertisementBanner from '../components/AdvertisementBanner'
import './ShopMarketplace.css'

const getProductImages = (product) => [...new Set([
  product.image,
  ...(Array.isArray(product.images) ? product.images : []),
].filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim()))]
const sortOptions = [
  { value: 'featured', label: 'Featured mix' },
  { value: 'newest', label: 'Newest first' },
  { value: 'low', label: 'Price: Low to High' },
  { value: 'high', label: 'Price: High to Low' },
]

export default function ShopPage({ onNavigate, cartBackground = false, user }) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [catalogCategories, setCatalogCategories] = useState([])
  const [interestCategories, setInterestCategories] = useState([])
  const [highestPrice, setHighestPrice] = useState(0)
  const [cart, setCart] = useState(getCart)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')
  const [sortOpen, setSortOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState(null)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [productPage, setProductPage] = useState(1)
  const [selectedProductImages, setSelectedProductImages] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const sortMenuRef = useRef(null)
  const lastTrackedSearch = useRef('')
  const userId = String(user?._id || user?.id || user?.email || 'guest')

  useEffect(() => {
    let active = true
    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(productPage), limit: '12', sort })
      if (category !== 'all') query.set('category', category)
      if (search.trim()) query.set('search', search.trim())
      if (maxPrice !== null) query.set('maxPrice', String(maxPrice))
      if (inStockOnly) query.set('inStockOnly', 'true')
      const normalizedSearch = search.trim().toLowerCase()
      const trackedSearchKey = `${userId}:${normalizedSearch}`
      if (normalizedSearch && trackedSearchKey !== lastTrackedSearch.current) {
        recordStoreSearch(search, user)
        lastTrackedSearch.current = trackedSearchKey
      } else if (!normalizedSearch) {
        lastTrackedSearch.current = ''
      }
      const preferences = getStorefrontPreferences(user)
      setInterestCategories(preferences.categories.map((item) => item.name))
      if (sort === 'featured') query.set('preferences', JSON.stringify(preferences))
      setLoading(true)
      setError('')
      userApi.storeProducts(`?${query.toString()}`)
        .then((result) => {
          if (!active) return
          setProducts(Array.isArray(result.data) ? result.data : [])
          setPagination(result.pagination || { page: productPage, totalPages: 1, totalItems: 0 })
          setCatalogCategories(Array.isArray(result.facets?.categories) ? result.facets.categories : [])
          setHighestPrice(Number(result.facets?.maxPrice || 0))
          const matchedCategory = normalizedSearch
            ? result.data?.find((item) => typeof item.category === 'string' && item.category.trim())?.category
            : ''
          if (matchedCategory) {
            recordStoreCategoryInterest(matchedCategory, user)
            setInterestCategories(getStorefrontPreferences(user).categories.map((item) => item.name))
          }
        })
        .catch((requestError) => { if (active) setError(requestError.message) })
        .finally(() => { if (active) setLoading(false) })
    }, search ? 250 : 0)
    const syncCart = () => setCart(getCart())
    window.addEventListener('cardzip-cart-change', syncCart)
    return () => {
      active = false
      window.clearTimeout(timeout)
      window.removeEventListener('cardzip-cart-change', syncCart)
    }
  }, [category, inStockOnly, maxPrice, productPage, search, sort, user, userId])

  useEffect(() => {
    const closeMenu = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) setSortOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSortOpen(false)
    }
    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const categories = useMemo(() => [...new Set(catalogCategories.map((item) => item?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [catalogCategories])
  const selectedMaxPrice = Math.min(maxPrice ?? highestPrice, highestPrice)
  const selectedSort = sortOptions.find((option) => option.value === sort) || sortOptions[0]
  const visibleProducts = products

  const addProduct = (product) => {
    recordProductInteraction(product, 'cart', user)
    setInterestCategories(getStorefrontPreferences(user).categories.map((item) => item.name))
    setCart(addToCart(product))
  }
  const openProduct = (product) => onNavigate?.(`/product/${encodeURIComponent(product.slug)}`)

  return (
    <div className={`shop-wrapper${cartBackground ? ' cart-background' : ''}`}><div className="shop-container">
      <div className="shop-header"><div className="breadcrumb">Home / Shop</div><h1 className="page-title">Everyday essentials. Extraordinary value.</h1><p className="page-subtitle">Discover genuine tech and accessories from the live Cardzip catalog.</p></div>
      <div className="shop-hero-banner"><div className="banner-left"><span className="pill-tag">CARDZIP STORE</span><h2>Upgrade the little things.</h2><p>Great sound. A smarter desk. More power for your day.</p></div><div className="banner-features"><div className="feat-item"><ShieldCheck size={20} /><span>Genuine products</span></div><div className="feat-item"><Truck size={20} /><span>Nationwide delivery</span></div><div className="feat-item"><Wallet size={20} /><span>Wallet or Paystack</span></div></div></div>
      <AdvertisementBanner placementKey="web-shop-banner" onNavigate={onNavigate} />
      <nav className="shop-explore-links" aria-label="Explore more on Cardzip">
        <span className="shop-explore-links-label">Explore more</span>
        <button type="button" onClick={() => onNavigate?.('/community-market')}><ShoppingBag size={14} /> Community</button>
        <button type="button" onClick={() => onNavigate?.('/shops')}><Store size={14} /> Browse shops</button>
        <button type="button" className="shop-explore-create" onClick={() => onNavigate?.('/shops/create')}><Store size={14} /> Create a shop</button>
        <button type="button" onClick={() => onNavigate?.('/advertise')}><Megaphone size={14} /> Promote</button>
        <button type="button" onClick={() => onNavigate?.('/digital-assets')}><span className="shop-explore-web-mark">WEB</span> Websites &amp; apps</button>
      </nav>
      <div className="catalog-actions-bar">
        <div className="search-box"><Search size={16} className="search-icon" /><input value={search} onChange={(event) => { setSearch(event.target.value); setCategory('all'); setProductPage(1) }} placeholder="Search products, brands and essentials" /></div>
        <div className="actions-right">
          <div className="shop-sort-control" ref={sortMenuRef}>
            <button type="button" className="sort-select" aria-label="Sort products" aria-haspopup="listbox" aria-expanded={sortOpen} onClick={() => setSortOpen((current) => !current)}>
              <span>{selectedSort.label}</span><ChevronDown size={15} aria-hidden="true" />
            </button>
            {sortOpen && <div className="shop-sort-menu" role="listbox" aria-label="Sort products">
              {sortOptions.map((option) => <button
                type="button"
                key={option.value}
                role="option"
                aria-selected={sort === option.value}
                className={`shop-sort-option ${sort === option.value ? 'selected' : ''}`}
                onClick={() => { setSort(option.value); setProductPage(1); setSortOpen(false) }}
              >{option.label}</button>)}
            </div>}
          </div>
          <button className="cart-badge-btn" type="button" onClick={() => onNavigate?.('/cart')}><ShoppingBag size={16} /><span>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></button>
        </div>
      </div>
      {interestCategories.length > 0 && <section className="shop-interest-categories" aria-label="Your product interests">
        <div><strong>Categories you are interested in</strong><small>Saved from your searches, views, and cart activity.</small></div>
        <div className="shop-interest-category-list">
          {interestCategories.map((item) => <button key={item} type="button" className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => { setCategory(category === item ? 'all' : item); setProductPage(1) }}>{item}</button>)}
        </div>
      </section>}
      <div className="shop-layout">
        <aside className="filters-sidebar">
          <div className="sidebar-header-row"><h3>Filters</h3><button className="reset-btn" type="button" onClick={() => { setCategory('all'); setSearch(''); setSort('featured'); setMaxPrice(null); setInStockOnly(false); setProductPage(1) }}>Reset all</button></div>
          <div className="filter-group">
            <span className="filter-title">CATEGORY</span>
            {categories.map((item) => <label className={`radio-label ${category === item ? 'active' : ''}`} key={item}>
              <input type="radio" name="category" checked={category === item} onChange={() => { setCategory(item); setProductPage(1) }} />
              <span>{item}</span>
            </label>)}
            {!loading && !error && categories.length === 0 && <span className="filter-empty">Categories appear when products are available.</span>}
            {loading && <span className="filter-empty">Loading categories…</span>}
          </div>
          <div className="filter-group">
            <span className="filter-title">PRICE</span>
            <label className="price-range-label" htmlFor="shop-price-limit">Up to <strong>{formatNaira(selectedMaxPrice)}</strong></label>
            <input
              id="shop-price-limit"
              className="price-range-input"
              type="range"
              min="0"
              max={highestPrice || 1}
              step={highestPrice > 100000 ? 1000 : 100}
              value={selectedMaxPrice}
              disabled={loading || highestPrice === 0}
              onChange={(event) => { setMaxPrice(Number(event.target.value)); setProductPage(1) }}
              aria-label="Maximum product price"
            />
            <div className="range-values"><span>₦0</span><span>{formatNaira(highestPrice)}</span></div>
          </div>
          <div className="filter-group">
            <span className="filter-title">AVAILABILITY</span>
            <label className="checkbox-label">
              <input type="checkbox" checked={inStockOnly} onChange={(event) => { setInStockOnly(event.target.checked); setProductPage(1) }} />
              <span>In stock only</span>
            </label>
          </div>
          <AdvertisementBanner placementKey="web-shop-sidebar" onNavigate={onNavigate} />
        </aside>
        <main className="product-grid-section"><div className="showing-info"><span>{loading ? 'Loading products…' : `Showing ${visibleProducts.length} products`}</span><span className="green-txt">{category === 'all' ? 'All products' : category}</span></div>
          {error && <p className="wallet-notice error" role="alert">{error}</p>}
          {!loading && !error && visibleProducts.length === 0 && <div className="shop-no-products">
            <p>{search.trim() || category !== 'all' || maxPrice !== null || inStockOnly
              ? 'No products match your search and filters.'
              : 'There are no active products in the catalog right now.'}</p>
            {(search.trim() || category !== 'all' || maxPrice !== null || inStockOnly) && <button type="button" onClick={() => { setSearch(''); setCategory('all'); setMaxPrice(null); setInStockOnly(false); setProductPage(1) }}>Clear search and filters</button>}
          </div>}
          <div className="products-grid">{visibleProducts.map((product) => {
            const images = getProductImages(product)
            const selectedImageIndex = Math.min(selectedProductImages[product._id] || 0, Math.max(images.length - 1, 0))
            const selectedImage = images[selectedImageIndex] || ''
            return <article
              key={product._id}
              className="product-card product-card-clickable"
              role="link"
              tabIndex={0}
              aria-label={`View ${product.name} details`}
              onClick={() => openProduct(product)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openProduct(product)
                }
              }}
            >
            <div className={`img-placeholder ${selectedImage ? '' : 'image-unavailable'}`}>
              {selectedImage
                ? <img src={selectedImage} alt={product.name} loading="lazy" onError={(event) => {
                  event.currentTarget.hidden = true
                  event.currentTarget.parentElement?.classList.add('image-unavailable')
                }} />
                : null}
              {images.length > 1 && <div className="shop-product-gallery-thumbnails" role="group" aria-label={`${product.name} images`}>
                {images.slice(0, 4).map((image, index) => <button
                  type="button"
                  key={`${image}-${index}`}
                  aria-label={`Show ${product.name} image ${index + 1}`}
                  aria-pressed={selectedImageIndex === index}
                  className={selectedImageIndex === index ? 'active' : ''}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelectedProductImages((current) => ({ ...current, [product._id]: index }))
                  }}
                ><img src={image} alt="" loading="lazy" /></button>)}
                {images.length > 4 && <span>+{images.length - 4}</span>}
              </div>}
            </div>
            <div className="card-info">
              <span className="prod-cat">{product.category || 'General'}</span>
              <h4 className="prod-title">{product.name}</h4>
              <p className="prod-desc">{product.description || 'A quality pick for everyday use.'}</p>
              <div className="shop-product-card-bottom">
                <div className="shop-product-prices">
                  <div className="prod-price">{formatNaira(product.price)}</div>
                  {Number(product.compareAtPrice) > Number(product.price) && (
                    <div className="shop-product-original-price">{formatNaira(product.compareAtPrice)}</div>
                  )}
                </div>
                <span className={`shop-stock-label ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <button
                className="add-cart-btn"
                type="button"
                disabled={product.stock < 1}
                onClick={(event) => {
                  event.stopPropagation()
                  addProduct(product)
                }}
              >
                Add to Cart <span aria-hidden="true">+</span>
              </button>
            </div>
          </article>
          })}</div>
          <div className="shop-pagination" aria-label="Product pages">
            <span>Page {pagination.page} of {Math.max(1, pagination.totalPages)} · {pagination.totalItems} products</span>
            <div>
              <button type="button" disabled={loading || productPage <= 1} onClick={() => setProductPage((page) => Math.max(1, page - 1))}>Previous</button>
              <button type="button" disabled={loading || productPage >= pagination.totalPages} onClick={() => setProductPage((page) => page + 1)}>Next</button>
            </div>
          </div>
        </main>
      </div>
    </div><footer className="dark-footer"><span>© 2026 Cardzip. All rights reserved.</span><div className="footer-links"><a href="#privacy">Privacy policy</a><a href="#terms">Terms of service</a></div></footer></div>
  )
}
