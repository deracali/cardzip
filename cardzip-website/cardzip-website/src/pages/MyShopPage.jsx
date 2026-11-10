import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Camera, Copy, PackagePlus, Store, Trash2, X } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import { formatNaira } from '../utils/currency'
import './ShopMarketplace.css'

const emptyProduct = { name: '', category: '', description: '', price: '', images: [], condition: 'brand_new', stock: '1' }
const emptyAppointment = { serviceName: '', startsAt: '', durationMinutes: '' }

const formatAppointmentDate = (date) => new Date(date).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const getLocalDateTimeMinimum = () => {
  const localDate = new Date()
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 16)
}

export default function MyShopPage({ onNavigate }) {
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState('')
  const [appointmentSaving, setAppointmentSaving] = useState(false)
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState('')
  const [appointmentAction, setAppointmentAction] = useState(null)
  const [appointmentReason, setAppointmentReason] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(emptyProduct)
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment)

  useEffect(() => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent('/my-shop')}`)
      return
    }
    let active = true
    userApi.myShop()
      .then(async (result) => {
        if (!active) return
        const ownerShop = result.data?.shop || null
        setShop(ownerShop)
        setProducts(Array.isArray(result.data?.products) ? result.data.products : [])
        if (ownerShop?.shopType === 'business') {
          const appointmentResult = await userApi.myShopAppointments()
          if (active) setAppointments(Array.isArray(appointmentResult.data) ? appointmentResult.data : [])
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [onNavigate])

  const submitProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const result = await userApi.createShopProduct({ ...form, price: Number(form.price), stock: Number(form.stock) })
      setProducts((current) => [result.data, ...current])
      setForm(emptyProduct)
      setNotice('Your product is listed in your shop.')
    } catch (requestError) {
      setError(requestError.message || 'Could not list this product.')
    } finally {
      setSaving(false)
    }
  }

  const uploadProductImages = async (files) => {
    const remainingSlots = 8 - form.images.length
    if (files.length > remainingSlots) {
      setError(`You can add up to 8 photos. Select ${remainingSlots} or fewer.`)
      return
    }
    if (files.length === 0) return
    setUploadingImage(true)
    setError('')
    try {
      for (const file of files) {
        const result = await userApi.uploadShopProductImage(file)
        setForm((current) => ({ ...current, images: [...current.images, result.data.url] }))
      }
      setNotice(`${files.length === 1 ? 'Product photo' : 'Product photos'} uploaded.`)
    } catch (requestError) {
      setError(requestError.message || 'Could not upload the selected product photos.')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeProductImage = (imageUrl) => {
    setForm((current) => ({ ...current, images: current.images.filter((image) => image !== imageUrl) }))
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}" from your store?`)) return
    setDeletingProductId(product._id)
    setError('')
    setNotice('')
    try {
      await userApi.deleteShopProduct(product._id)
      setProducts((current) => current.filter((item) => item._id !== product._id))
      setNotice('Product deleted.')
    } catch (requestError) {
      setError(requestError.message || 'Could not delete this product.')
    } finally {
      setDeletingProductId('')
    }
  }

  const copyShopLink = async () => {
    const shopUrl = new URL(`/shops/${encodeURIComponent(shop.slug)}`, window.location.origin).toString()
    try {
      await navigator.clipboard.writeText(shopUrl)
      setError('')
      setNotice('Public shop link copied. Share it with your customers.')
    } catch {
      setError('Could not copy the shop link. Please copy it from your browser address bar.')
    }
  }

  const submitAppointment = async (event) => {
    event.preventDefault()
    setAppointmentSaving(true)
    setError('')
    setNotice('')
    try {
      const result = await userApi.createShopAppointment({
        ...appointmentForm,
        startsAt: new Date(appointmentForm.startsAt).toISOString(),
        durationMinutes: Number(appointmentForm.durationMinutes),
      })
      setAppointments((current) => [...current, result.data].sort((left, right) => new Date(left.startsAt) - new Date(right.startsAt)))
      setAppointmentForm(emptyAppointment)
      setNotice('Appointment time added to your public business page.')
    } catch (requestError) {
      setError(requestError.message || 'Could not add this appointment time.')
    } finally {
      setAppointmentSaving(false)
    }
  }

  const updateAppointment = async (appointmentId, status, cancellationReason = '') => {
    setUpdatingAppointmentId(appointmentId)
    setError('')
    setNotice('')
    try {
      const result = await userApi.updateShopAppointment(appointmentId, status, cancellationReason)
      setAppointments((current) => current.map((appointment) => appointment._id === appointmentId ? result.data : appointment))
      setAppointmentAction(null)
      setAppointmentReason('')
      setNotice(status === 'confirmed' ? 'Appointment confirmed.' : `Appointment ${status} with your reason.`)
    } catch (requestError) {
      setError(requestError.message || 'Could not update this appointment.')
    } finally {
      setUpdatingAppointmentId('')
    }
  }

  const requestAppointmentReason = (appointment, status) => {
    setAppointmentAction({ appointment, status })
    setAppointmentReason('')
    setError('')
  }

  const submitAppointmentReason = async (event) => {
    event.preventDefault()
    if (!appointmentAction || appointmentReason.trim().length < 5) {
      setError('Enter a reason of at least 5 characters.')
      return
    }
    await updateAppointment(appointmentAction.appointment._id, appointmentAction.status, appointmentReason.trim())
  }

  const deleteAppointment = async (appointment) => {
    if (!window.confirm(`Delete the unbooked appointment time “${appointment.serviceName}”?`)) return
    setUpdatingAppointmentId(appointment._id)
    setError('')
    setNotice('')
    try {
      await userApi.deleteShopAppointment(appointment._id)
      setAppointments((current) => current.filter((item) => item._id !== appointment._id))
      setNotice('Appointment time deleted.')
    } catch (requestError) {
      setError(requestError.message || 'Could not delete this appointment.')
    } finally {
      setUpdatingAppointmentId('')
    }
  }

  if (loading) return <main className="shop-market-page"><div className="shop-market-shell"><p className="shop-market-state" role="status">Loading your shop…</p></div></main>

  return (
    <main className="shop-market-page">
      <div className="shop-market-shell">
        <button type="button" className="shop-market-back" onClick={() => onNavigate?.('/shops')}><ArrowLeft size={15} /> Shop directory</button>
        {error && !shop && <p className="shop-market-error" role="alert">{error}</p>}
        {!shop ? (
          <section className="shop-owner-empty"><span className="shop-owner-mark"><Store size={25} /></span><span className="shop-market-eyebrow">YOUR BUSINESS ON CARDZIP</span><h1>Start a store or business</h1><p>Choose a product store or an appointment-based business, then share your public page with customers.</p><button type="button" className="shop-market-primary-button" onClick={() => onNavigate?.('/shops/create')}>Create a store or business <ArrowRight size={16} /></button></section>
        ) : (
          <>
            <header className="shop-owner-heading">{shop.bannerImage ? <img className="shop-owner-banner" src={shop.bannerImage} alt={`${shop.businessName} logo or banner`} /> : <span className="shop-owner-mark"><Store size={22} /></span>}<div><span className="shop-market-eyebrow">{shop.shopType === 'business' ? 'BUSINESS OWNER DASHBOARD' : 'STORE OWNER DASHBOARD'}</span><h1>{shop.businessName}</h1><p>{shop.address}</p></div><span className={`shop-review-status ${shop.status}`}>{shop.status === 'approved' ? `Approved ${shop.shopType === 'business' ? 'business' : 'store'}` : shop.status === 'pending' ? 'Under review' : 'Changes requested'}</span></header>
            <button type="button" className="shop-market-secondary-button" onClick={() => onNavigate?.('/shops/create')}>Create another store or business</button>
            {shop.status !== 'approved' ? (
              <section className={`shop-application-status ${shop.status}`}><Store size={22} /><div><strong>{shop.status === 'pending' ? 'Your application is being reviewed' : 'Your application needs an update'}</strong><p>{shop.status === 'pending' ? 'We’ll publish your shop after the Cardzip team has reviewed your business details.' : shop.reviewNote || 'Please update your information and resubmit your application.'}</p></div>{shop.status === 'rejected' && <button type="button" className="shop-market-secondary-button" onClick={() => onNavigate?.('/shops/create')}>Update application</button>}</section>
            ) : (
              <>
                {notice && <p className="shop-market-success" role="status">{notice}</p>}
                {error && <p className="shop-market-error" role="alert">{error}</p>}
                <section className="shop-share-card" aria-label={`Share your public ${shop.shopType === 'business' ? 'business' : 'store'} page`}>
                  <div><strong>Share your {shop.shopType === 'business' ? 'business' : 'store'}</strong><p>Copy this link so customers can open your public {shop.shopType === 'business' ? 'business' : 'store'} page.</p><code>{new URL(`/shops/${encodeURIComponent(shop.slug)}`, window.location.origin).toString()}</code></div>
                  <button type="button" className="shop-market-secondary-button" onClick={() => void copyShopLink()}><Copy size={15} /> Copy page link</button>
                </section>
                {shop.shopType === 'business' ? (
                  <>
                    <section className="shop-owner-product-section">
                      <div className="shop-market-section-heading"><div><span>SET YOUR AVAILABILITY</span><h2>Add appointment time</h2><small>You can publish one or more appointment times for customers to choose from.</small></div><button type="button" className="shop-market-secondary-button" onClick={() => onNavigate?.(`/shops/${encodeURIComponent(shop.slug)}`)}>View public business <ArrowRight size={15} /></button></div>
                      <form className="shop-market-form shop-appointment-form" onSubmit={submitAppointment}>
                        <div className="shop-appointment-controls">
                          <label>Service or appointment type<input value={appointmentForm.serviceName} onChange={(event) => setAppointmentForm((current) => ({ ...current, serviceName: event.target.value }))} required minLength={2} maxLength={120} placeholder="e.g. Consultation" /></label>
                          <label>Date and time<input type="datetime-local" value={appointmentForm.startsAt} onChange={(event) => setAppointmentForm((current) => ({ ...current, startsAt: event.target.value }))} required min={getLocalDateTimeMinimum()} /></label>
                          <label>Duration (minutes)<input type="number" min="15" max="480" step="15" value={appointmentForm.durationMinutes} onChange={(event) => setAppointmentForm((current) => ({ ...current, durationMinutes: event.target.value }))} required placeholder="e.g. 30" /></label>
                        </div>
                        <button type="submit" className="shop-market-primary-button" disabled={appointmentSaving}>{appointmentSaving ? 'Adding appointment…' : 'Publish available time'} <CalendarDays size={16} /></button>
                      </form>
                    </section>
                    <section className="shop-owner-products" aria-labelledby="business-appointments-title">
                      <div className="shop-market-section-heading"><div><span>BOOKINGS AND AVAILABILITY</span><h2 id="business-appointments-title">Manage appointments</h2></div><small>{appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}</small></div>
                      {appointments.length === 0 ? <div className="shop-market-empty"><CalendarDays size={25} /><strong>No appointment times yet</strong><span>Add one or more available times above to start receiving booking requests.</span></div> : (
                        <div className="shop-appointment-list">{appointments.map((appointment) => (
                          <article className="shop-appointment-card" key={appointment._id}>
                            <div>
                              <strong>{appointment.serviceName}</strong>
                              <span>{formatAppointmentDate(appointment.startsAt)} · {appointment.durationMinutes} minutes</span>
                              {appointment.customer && <span>Requested by {appointment.customer.name} · <a href={`mailto:${encodeURIComponent(appointment.customer.email)}`}>{appointment.customer.email}</a></span>}
                              <span className={`shop-appointment-status ${appointment.status}`}>{appointment.status}</span>
                              {appointment.cancellationReason && <span className="shop-appointment-reason">Reason: {appointment.cancellationReason}</span>}
                            </div>
                            <div className="shop-appointment-actions">
                              {appointment.status === 'pending' && <>
                                <button type="button" disabled={Boolean(updatingAppointmentId)} onClick={() => void updateAppointment(appointment._id, 'confirmed')}>{updatingAppointmentId === appointment._id ? 'Saving…' : 'Confirm'}</button>
                                <button type="button" className="danger" disabled={Boolean(updatingAppointmentId)} onClick={() => requestAppointmentReason(appointment, 'rejected')}>Reject</button>
                              </>}
                              {appointment.status === 'confirmed' && <button type="button" className="danger" disabled={Boolean(updatingAppointmentId)} onClick={() => requestAppointmentReason(appointment, 'cancelled')}>Cancel</button>}
                              {appointment.status === 'available' && <button type="button" className="danger" disabled={Boolean(updatingAppointmentId)} onClick={() => void deleteAppointment(appointment)}><Trash2 size={13} /> Delete</button>}
                            </div>
                          </article>
                        ))}</div>
                      )}
                    </section>
                  </>
                ) : (
                  <>
                  <section className="shop-owner-product-section">
                  <div className="shop-market-section-heading"><div><span>GROW YOUR CATALOG</span><h2>Product details</h2></div><button type="button" className="shop-market-secondary-button" onClick={() => onNavigate?.(`/shops/${encodeURIComponent(shop.slug)}`)}>View public shop <ArrowRight size={15} /></button></div>
                  <form className="shop-market-form shop-product-form" onSubmit={submitProduct}>
                    <div className="shop-product-form-grid">
                      <label>Product name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={120} placeholder="e.g. Handmade leather tote" /></label>
                      <label>Category<input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} maxLength={60} placeholder="Fashion, home, electronics…" /></label>
                      <label>Price (NGN)<input type="number" min="1" step="1" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required placeholder="25000" /></label>
                      <label>Available quantity<input type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} required /></label>
                      <label>Condition<select value={form.condition} onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value }))}><option value="brand_new">Brand new</option><option value="used">Used</option></select></label>
                      <label>Product photos <span>Optional · up to 8 JPEG, PNG, or WebP images · 8 MB each</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => { void uploadProductImages(Array.from(event.target.files || [])); event.target.value = '' }} /><small>{uploadingImage ? 'Uploading photos…' : `${form.images.length}/8 photos selected. Add multiple angles to show your product.`}</small></label>
                    </div>
                    {form.images.length > 0 && <div className="shop-product-image-list">{form.images.map((imageUrl) => <div className="shop-product-image-preview" key={imageUrl}><img src={imageUrl} alt="Product preview" /><button type="button" className="shop-product-image-remove" onClick={() => removeProductImage(imageUrl)} aria-label="Remove product photo"><X size={14} /></button></div>)}</div>}
                    <label>Description<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required maxLength={2000} rows={4} placeholder="Describe the product, its features, and anything a buyer should know." /></label>
                    <p className="shop-direct-contact-note">Customers contact your business directly. Cardzip does not handle product payments, delivery, or disputes.</p>
                    <button type="submit" className="shop-market-primary-button" disabled={saving || uploadingImage}>{saving ? 'Adding product…' : 'Add product to shop'} <PackagePlus size={16} /></button>
                  </form>
                </section>
                <section className="shop-owner-products">
                  <div className="shop-market-section-heading"><div><span>YOUR CATALOG</span><h2>Listed products</h2></div><small>{products.length} {products.length === 1 ? 'product' : 'products'}</small></div>
                  {products.length === 0 ? <div className="shop-market-empty"><Camera size={25} /><strong>Your shop is ready for its first product</strong><span>Use the form above to start building your catalog.</span></div> : (
                    <div className="shop-product-grid">{products.map((product) => (
                      <article
                        className="shop-product-card shop-product-card-clickable"
                        key={product._id}
                        role="link"
                        tabIndex={0}
                        aria-label={`View ${product.name} details`}
                        onClick={() => onNavigate?.(`/shops/${encodeURIComponent(shop.slug)}/products/${encodeURIComponent(product.slug)}`)}
                        onKeyDown={(event) => {
                          if (event.target !== event.currentTarget) return
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onNavigate?.(`/shops/${encodeURIComponent(shop.slug)}/products/${encodeURIComponent(product.slug)}`)
                          }
                        }}
                      >
                        <div className="shop-product-image">{(product.images?.[0] || product.imageUrl) ? <img src={product.images?.[0] || product.imageUrl} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} /> : <Camera size={25} />}</div>
                        <div className="shop-product-info"><span>{product.category || 'General'} · {product.condition === 'used' ? 'Used' : 'Brand new'}</span><h3>{product.name}</h3><p>{product.description}</p><div><strong>{formatNaira(product.price)}</strong><small>{product.stock} available</small></div><button type="button" className="shop-market-secondary-button" disabled={Boolean(deletingProductId)} onClick={(event) => { event.stopPropagation(); void deleteProduct(product) }}>{deletingProductId === product._id ? 'Deleting…' : 'Delete product'} <Trash2 size={14} /></button></div>
                      </article>
                    ))}</div>
                  )}
                </section>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      {appointmentAction && (
        <div className="shop-appointment-reason-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !updatingAppointmentId) setAppointmentAction(null) }}>
          <section className="shop-appointment-reason-dialog" role="dialog" aria-modal="true" aria-labelledby="shop-appointment-reason-title">
            <header><div><span className="shop-market-eyebrow">CUSTOMER UPDATE</span><h2 id="shop-appointment-reason-title">{appointmentAction.status === 'rejected' ? 'Decline booking' : 'Cancel appointment'}</h2></div><button type="button" aria-label="Close" disabled={Boolean(updatingAppointmentId)} onClick={() => setAppointmentAction(null)}><X size={18} /></button></header>
            <p>Your reason will be shown to the customer.</p>
            <form onSubmit={submitAppointmentReason}>
              <label htmlFor="shop-appointment-reason">Reason</label>
              <textarea id="shop-appointment-reason" value={appointmentReason} onChange={(event) => setAppointmentReason(event.target.value)} minLength={5} maxLength={500} required rows={5} autoFocus placeholder="Explain why this appointment is being changed." />
              <small>{appointmentReason.length}/500 characters (minimum 5)</small>
              {error && <p className="shop-market-error" role="alert">{error}</p>}
              <div><button type="button" className="shop-market-secondary-button" disabled={Boolean(updatingAppointmentId)} onClick={() => setAppointmentAction(null)}>Keep appointment</button><button type="submit" className="shop-market-primary-button" disabled={Boolean(updatingAppointmentId) || appointmentReason.trim().length < 5}>{updatingAppointmentId ? 'Saving…' : appointmentAction.status === 'rejected' ? 'Decline booking' : 'Cancel appointment'}</button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
