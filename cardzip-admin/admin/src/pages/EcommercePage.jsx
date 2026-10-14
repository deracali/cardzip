import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, ChevronDown, ImagePlus, Package, Pencil, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react'
import { adminApi } from '../services/api'

const emptyProduct = {
  name: '',
  category: '',
  description: '',
  price: '',
  compareAtPrice: '',
  image: '',
  images: [''],
  stock: '0',
  tags: '',
  isActive: true,
}

const formatNaira = (amount) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(Number(amount || 0))

const formatStatus = (status) => String(status || 'processing')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase())

const productImages = (item) => [...new Set([
  item.image,
  ...(Array.isArray(item.images) ? item.images : []),
].filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim()))]

export default function EcommercePage({ onViewOrder }) {
  const [activeSection, setActiveSection] = useState('orders')
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ totalStoreVolume: 0, pendingDispatch: 0, activeProducts: 0, lowStockProducts: 0 })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [product, setProduct] = useState(emptyProduct)
  const [savingProduct, setSavingProduct] = useState(false)
  const [productError, setProductError] = useState('')
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [products, setProducts] = useState([])
  const [productPagination, setProductPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [productPage, setProductPage] = useState(1)
  const [productSearch, setProductSearch] = useState('')
  const [productStatus, setProductStatus] = useState('all')
  const [productStatusOpen, setProductStatusOpen] = useState(false)
  const productStatusRef = useRef(null)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [deletingProductId, setDeletingProductId] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)

  useEffect(() => {
    if (activeSection !== 'orders') return undefined
    let active = true
    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(pagination.page), limit: '10' })
      if (search.trim()) query.set('search', search.trim())
      setLoading(true)
      setError('')
      adminApi.storeDashboard(`?${query.toString()}`)
        .then((result) => {
          if (!active) return
          setOrders(result.data.orders || [])
          setStats(result.data.stats)
          setPagination(result.data.pagination)
        })
        .catch((requestError) => { if (active) setError(requestError.message) })
        .finally(() => { if (active) setLoading(false) })
    }, search ? 300 : 0)
    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [activeSection, pagination.page, search, refreshKey])

  useEffect(() => {
    if (activeSection !== 'products') return undefined
    let active = true
    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(productPage), limit: '10' })
      if (productSearch.trim()) query.set('search', productSearch.trim())
      if (productStatus !== 'all') query.set('status', productStatus)
      setProductsLoading(true)
      setProductsError('')
      adminApi.storeProducts(`?${query.toString()}`)
        .then((result) => {
          if (!active) return
          const nextPagination = result.pagination || { page: productPage, totalPages: 1, totalItems: 0 }
          setProducts(result.data || [])
          setProductPagination(nextPagination)
          if (productPage > nextPagination.totalPages) setProductPage(nextPagination.totalPages)
        })
        .catch((requestError) => { if (active) setProductsError(requestError.message) })
        .finally(() => { if (active) setProductsLoading(false) })
    }, productSearch ? 300 : 0)
    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [activeSection, productPage, productSearch, productStatus, refreshKey])

  useEffect(() => {
    if (!productStatusOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!productStatusRef.current?.contains(event.target)) setProductStatusOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setProductStatusOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [productStatusOpen])

  const updateProduct = (event) => {
    const { name, value } = event.target
    setProduct((current) => ({ ...current, [name]: value }))
    setProductError('')
  }

  const updateProductImage = (index, value) => {
    setProduct((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => imageIndex === index ? value : image),
    }))
    setProductError('')
  }

  const productRequestBody = () => ({
    ...product,
    image: product.images[0]?.trim() || '',
    images: product.images.map((image) => image.trim()).filter(Boolean),
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : 0,
    stock: Number(product.stock),
    tags: product.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
  })

  const submitProduct = async (event) => {
    event.preventDefault()
    setSavingProduct(true)
    setProductError('')
    setNotice('')
    try {
      if (editingProductId) {
        await adminApi.updateStoreProduct(editingProductId, productRequestBody())
      } else {
        await adminApi.createStoreProduct(productRequestBody())
      }
      setModalOpen(false)
      setProduct(emptyProduct)
      setEditingProductId(null)
      setPagination((current) => ({ ...current, page: 1 }))
      setProductPage(1)
      setNotice(editingProductId ? 'Product updated.' : 'Product added to the store catalog.')
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setProductError(requestError.message)
    } finally {
      setSavingProduct(false)
    }
  }

  const openProductModal = (selectedProduct = null) => {
    setProductError('')
    setEditingProductId(selectedProduct?._id || null)
    setProduct(selectedProduct ? {
      name: selectedProduct.name || '',
      category: selectedProduct.category || '',
      description: selectedProduct.description || '',
      price: String(selectedProduct.price ?? ''),
      compareAtPrice: String(selectedProduct.compareAtPrice || ''),
      image: productImages(selectedProduct)[0] || '',
      images: productImages(selectedProduct).length ? productImages(selectedProduct) : [''],
      stock: String(selectedProduct.stock ?? 0),
      tags: Array.isArray(selectedProduct.tags) ? selectedProduct.tags.join(', ') : '',
      isActive: selectedProduct.isActive !== false,
    } : emptyProduct)
    setModalOpen(true)
  }

  const deleteProduct = async () => {
    if (!productToDelete) return
    const selectedProduct = productToDelete
    setDeletingProductId(selectedProduct._id)
    setProductsError('')
    setNotice('')
    try {
      await adminApi.deleteStoreProduct(selectedProduct._id)
      setNotice(`${selectedProduct.name} was deleted.`)
      setProductToDelete(null)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setProductsError(requestError.message)
    } finally {
      setDeletingProductId(null)
    }
  }

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">E-Commerce & Orders</h1>
          <p className="page-subtitle">Manage the live product catalog and review customer orders.</p>
        </div>
        {activeSection === 'orders' && (
          <div className="header-actions">
            <button type="button" className="btn-primary" onClick={() => openProductModal()}><Plus size={15} /> Add Product</button>
          </div>
        )}
      </div>

      {notice && <p className="wallet-notice success" role="status">{notice}</p>}
      <div className="ecom-metrics-grid">
        <div className="stat-card">
          <span className="stat-label">Total Store Volume</span>
          <span className="stat-value">{formatNaira(stats.totalStoreVolume)}</span>
          <span className="stat-sub">All paid orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Orders Pending Dispatch</span>
          <span className="stat-value text-amber">{stats.pendingDispatch.toLocaleString()}</span>
          <span className="stat-sub">Paid orders in processing</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Listed SKUs</span>
          <span className="stat-value">{stats.activeProducts.toLocaleString()}</span>
          <span className="stat-sub">{stats.lowStockProducts.toLocaleString()} with 5 or fewer in stock</span>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header ecom-orders-header">
          <div className="ecom-section-heading">
            <div className="ecom-section-tabs" role="tablist" aria-label="E-commerce management">
              <button type="button" role="tab" aria-selected={activeSection === 'orders'} className={`tab-btn ${activeSection === 'orders' ? 'active' : ''}`} onClick={() => setActiveSection('orders')}>Recent Orders</button>
              <button type="button" role="tab" aria-selected={activeSection === 'products'} className={`tab-btn ${activeSection === 'products' ? 'active' : ''}`} onClick={() => setActiveSection('products')}>Products</button>
            </div>
            <span className="text-muted">
              {activeSection === 'orders'
                ? `${pagination.totalItems.toLocaleString()} orders`
                : `${productPagination.totalItems.toLocaleString()} products`}
            </span>
          </div>
          {activeSection === 'orders' ? (
            <label className="search-box-sm ecom-order-search">
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search order, customer or product..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPagination((current) => ({ ...current, page: 1 }))
                }}
              />
            </label>
          ) : (
            <div className="ecom-product-toolbar">
              <label className="search-box-sm ecom-order-search">
                <Search size={14} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search product name, category or tag..."
                  value={productSearch}
                  onChange={(event) => {
                    setProductSearch(event.target.value)
                    setProductPage(1)
                  }}
                />
              </label>
              <div className="ecom-product-filter" ref={productStatusRef}>
                <button
                  type="button"
                  className="ecom-product-filter-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={productStatusOpen}
                  onClick={() => setProductStatusOpen((current) => !current)}
                >
                  {productStatus === 'all' ? 'All products' : productStatus === 'active' ? 'Active' : 'Inactive'}
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                {productStatusOpen && (
                  <div className="ecom-product-filter-menu" role="listbox" aria-label="Filter products by visibility">
                    {[
                      { value: 'all', label: 'All products' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={productStatus === option.value}
                        className={`ecom-product-filter-option ${productStatus === option.value ? 'selected' : ''}`}
                        onClick={() => {
                          setProductStatus(option.value)
                          setProductPage(1)
                          setProductStatusOpen(false)
                        }}
                      >
                        {option.label}
                        {productStatus === option.value && <Check size={14} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className="btn-primary" onClick={() => openProductModal()}><Plus size={15} /> Add Product</button>
            </div>
          )}
        </div>

        {activeSection === 'orders' ? (
          <>
            {error && <p className="wallet-notice error" role="alert">{error}</p>}
            {loading && <p className="ecom-orders-loading" role="status">Loading orders…</p>}
            <div className="table-responsive">
              <table className="ecom-table">
                <thead>
                  <tr><th>Order Ref</th><th>Customer</th><th>Item(s)</th><th>Total Value</th><th>Courier Partner</th><th>Fulfillment Status</th><th className="text-right">Action</th></tr>
                </thead>
                <tbody>
                  {!loading && orders.map((order) => (
                    <tr key={order._id}>
                      <td className="font-mono">{order.orderNumber}</td>
                      <td className="font-bold">{order.user?.name || order.shippingAddress?.name || order.user?.email || 'Unknown customer'}</td>
                      <td>{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ') || '—'}</td>
                      <td className="font-bold">{formatNaira(order.total)}</td>
                      <td className="text-muted">{order.courierService || 'Not assigned'}{order.trackingNumber ? <small className="order-tracking-cell">{order.trackingNumber}</small> : null}</td>
                      <td><span className={`status-badge ${String(order.status || 'processing').replaceAll('_', '-')}`}>{formatStatus(order.status)}</span></td>
                      <td className="text-right"><button type="button" className="btn-table-action" onClick={() => onViewOrder?.(order)}>View Details</button></td>
                    </tr>
                  ))}
                  {!loading && orders.length === 0 && (
                    <tr><td colSpan="7" className="ecom-orders-empty"><ShoppingBag size={18} />{search ? 'No orders match your search.' : 'No store orders have been placed yet.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="trade-history-footer">
              <span>Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} orders</span>
              <div className="pagination-controls">
                <button className="btn-page" type="button" disabled={loading || pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
                <button className="btn-page" type="button" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
              </div>
            </div>
          </>
        ) : (
          <>
            {productsError && <p className="wallet-notice error" role="alert">{productsError}</p>}
            {productsLoading && <p className="ecom-orders-loading" role="status">Loading products…</p>}
            <div className="table-responsive">
              <table className="ecom-table ecom-products-table">
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visibility</th><th className="text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {!productsLoading && products.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="ecom-product-cell">
                          {productImages(item)[0] ? <img src={productImages(item)[0]} alt="" loading="lazy" /> : <span className="ecom-product-placeholder"><Package size={17} /></span>}
                          <span><strong>{item.name}</strong><small>{item.slug}</small></span>
                        </div>
                      </td>
                      <td>{item.category || 'General'}</td>
                      <td className="font-bold">{formatNaira(item.price)}</td>
                      <td>{Number(item.stock || 0).toLocaleString()}</td>
                      <td><span className={`ecom-product-visibility ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="text-right">
                        <div className="ecom-product-actions">
                          <button type="button" className="btn-table-action" onClick={() => openProductModal(item)}><Pencil size={14} /> Edit</button>
                          <button type="button" className="ecom-delete-product" disabled={deletingProductId === item._id} onClick={() => setProductToDelete(item)}><Trash2 size={14} />Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!productsLoading && products.length === 0 && (
                    <tr><td colSpan="6" className="ecom-orders-empty"><Package size={18} />{productSearch ? 'No products match your search.' : 'No products found in the catalog.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="trade-history-footer">
              <span>Page {productPagination.page} of {productPagination.totalPages} · {productPagination.totalItems} products</span>
              <div className="pagination-controls">
                <button className="btn-page" type="button" disabled={productsLoading || productPage <= 1} onClick={() => setProductPage((current) => Math.max(1, current - 1))}>Previous</button>
                <button className="btn-page" type="button" disabled={productsLoading || productPage >= productPagination.totalPages} onClick={() => setProductPage((current) => current + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}>
          <section className="modal-content ecom-product-modal" role="dialog" aria-modal="true" aria-labelledby="add-product-title">
            <header className="modal-header">
            <div className="ecom-product-modal-title"><Package size={18} /><h3 id="add-product-title">{editingProductId ? 'Edit store product' : 'Add store product'}</h3></div>
            <button className="btn-close" type="button" aria-label="Close" onClick={() => { setModalOpen(false); setEditingProductId(null) }}><X size={18} /></button>
            </header>
            <form className="modal-body ecom-product-form" onSubmit={submitProduct}>
              <label className="form-group">Product name<input name="name" value={product.name} onChange={updateProduct} required maxLength={160} /></label>
              <div className="ecom-product-form-row">
                <label className="form-group">Category<input name="category" value={product.category} onChange={updateProduct} placeholder="e.g. Electronics" maxLength={80} /></label>
                <label className="form-group">Stock<input name="stock" type="number" min="0" step="1" value={product.stock} onChange={updateProduct} required /></label>
              </div>
              <div className="ecom-product-form-row">
                <label className="form-group">Price (NGN)<input name="price" type="number" min="1" step="0.01" value={product.price} onChange={updateProduct} required /></label>
                <label className="form-group">Compare-at price (NGN)<input name="compareAtPrice" type="number" min="0" step="0.01" value={product.compareAtPrice} onChange={updateProduct} /></label>
              </div>
              <div className="ecom-product-images">
                <div className="ecom-product-images-heading">
                  <span>Product images <small>The first image is the main product photo.</small></span>
                  <button
                    type="button"
                    className="ecom-add-image-button"
                    disabled={product.images.length >= 8}
                    onClick={() => setProduct((current) => ({ ...current, images: [...current.images, ''] }))}
                  >
                    <ImagePlus size={14} /> Add image
                  </button>
                </div>
                {product.images.map((image, index) => (
                  <div className="ecom-product-image-field" key={`product-image-${index}`}>
                    <label className="form-group">
                      {index === 0 ? 'Main image URL' : `Additional image ${index}`}
                      <input type="url" value={image} onChange={(event) => updateProductImage(index, event.target.value)} placeholder="https://..." />
                    </label>
                    {index > 0 && (
                      <button
                        type="button"
                        className="ecom-remove-image-button"
                        aria-label={`Remove additional image ${index}`}
                        onClick={() => setProduct((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))}
                      ><X size={15} /></button>
                    )}
                  </div>
                ))}
                <small className="ecom-product-images-hint">Add up to 8 product views. Shoppers can switch between them on the product page.</small>
              </div>
              <label className="form-group">Description<textarea name="description" rows="3" value={product.description} onChange={updateProduct} maxLength={2000} /></label>
              <label className="form-group">Search tags<input name="tags" value={product.tags} onChange={updateProduct} placeholder="Separate tags with commas" /></label>
              <label className="ecom-product-active-toggle">
                <input type="checkbox" checked={product.isActive} onChange={(event) => setProduct((current) => ({ ...current, isActive: event.target.checked }))} />
                <span>Visible to customers</span>
              </label>
              {productError && <p className="wallet-notice error" role="alert"><AlertCircle size={15} />{productError}</p>}
              <div className="modal-actions">
                <button className="btn-secondary" type="button" disabled={savingProduct} onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={savingProduct}>{savingProduct ? (editingProductId ? 'Saving changes…' : 'Adding product…') : (editingProductId ? 'Save changes' : 'Add product')}</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {productToDelete && (
        <div className="modal-backdrop ecom-delete-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingProductId) setProductToDelete(null) }}>
          <section className="modal-content ecom-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" aria-describedby="delete-product-description">
            <div className="ecom-delete-icon"><Trash2 size={21} /></div>
            <h2 id="delete-product-title">Delete product?</h2>
            <p id="delete-product-description">“{productToDelete.name}” will be removed from the store catalog. Existing order records will remain unchanged.</p>
            {productsError && <p className="wallet-notice error" role="alert">{productsError}</p>}
            <div className="ecom-delete-actions">
              <button className="btn-secondary" type="button" disabled={Boolean(deletingProductId)} onClick={() => setProductToDelete(null)}>Cancel</button>
              <button className="ecom-delete-confirm" type="button" disabled={Boolean(deletingProductId)} onClick={deleteProduct}>
                <Trash2 size={14} />{deletingProductId ? 'Deleting…' : 'Delete product'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
