import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeAlert, Camera, MessageCircle, Megaphone, Phone, Plus, ShieldCheck } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import { getStorefrontPreferences, recordProductInteraction } from '../services/storePreferences'
import { formatNaira } from '../utils/currency'
import CardzipLoader from '../components/CardzipLoader'
import CommunityChatDialog from '../components/CommunityChatDialog'
import CommunitySellerInbox from '../components/CommunitySellerInbox'
import './CommunityMarketPage.css'

const emptyListing = { title: '', category: '', description: '', price: '', phone: '', condition: 'brand_new', isSold: false }
const MAX_LISTING_IMAGES = 6
const MAX_IMAGE_SIZE = 8 * 1024 * 1024

const whatsappNumber = (phone) => {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('0') && digits.length === 11 ? `234${digits.slice(1)}` : digits
}

const getListingImages = (listing) => (
  Array.isArray(listing.images) && listing.images.length
    ? listing.images
    : listing.imageUrl ? [listing.imageUrl] : []
)
const loadCommunityListingRows = async (preferences) => {
  const [publicResult, ownedResult] = await Promise.all([
    userApi.communityListings(`?page=1&limit=50&preferences=${preferences}`),
    getUserToken() ? userApi.myCommunityListings() : Promise.resolve({ data: [] }),
  ])
  const rowsById = new Map((publicResult.data || []).map((listing) => [listing._id, listing]))
  for (const listing of ownedResult.data || []) rowsById.set(listing._id, listing)
  return [...rowsById.values()]
}
const getId = (value) => String(value?._id || value?.id || value || '')
const isOwnListing = (listing, user) => (
  getId(user?._id || user?.id || user?.userId) !== ''
  && getId(user?._id || user?.id || user?.userId) === getId(listing?.sellerId || listing?.seller)
)

const recordPromotionEvent = (listing, eventType) => {
  if (!listing.isPromoted) return Promise.resolve()
  return userApi.trackCommunityPromotionEvent(
    listing._id,
    listing.isDigitalAsset ? 'digital_asset' : 'community_listing',
    eventType,
  ).catch((error) => console.error(`Could not record community promotion ${eventType}:`, error))
}

export default function CommunityMarketPage({ onNavigate, user }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingListingId, setEditingListingId] = useState('')
  const [form, setForm] = useState(emptyListing)
  const [photos, setPhotos] = useState([])
  const [activePhotos, setActivePhotos] = useState({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [managementError, setManagementError] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingListingId, setUpdatingListingId] = useState('')
  const [promotionPerformance, setPromotionPerformance] = useState([])
  const [activeChat, setActiveChat] = useState(null)

  const refreshPromotionPerformance = useCallback(async () => {
    if (!getUserToken()) return
    try {
      const result = await userApi.myCommunityPromotions()
      setPromotionPerformance(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      console.error('Could not load community promotion performance:', error)
    }
  }, [])

  const loadListings = useCallback(async () => {
    try {
      const preferences = encodeURIComponent(JSON.stringify(getStorefrontPreferences(user)))
      setLoadError('')
      const rows = await loadCommunityListingRows(preferences)
      setListings(rows)
      void Promise.all(rows.filter((listing) => listing.moderationStatus !== 'suspended').map((listing) => recordPromotionEvent(listing, 'impression')))
        .then(refreshPromotionPerformance)
    } catch (error) {
      setLoadError(error.message || 'Could not load community listings.')
    } finally {
      setLoading(false)
    }
  }, [refreshPromotionPerformance, user])

  useEffect(() => {
    let active = true
    const preferences = encodeURIComponent(JSON.stringify(getStorefrontPreferences(user)))
    loadCommunityListingRows(preferences)
      .then((rows) => {
        if (!active) return
        setLoadError('')
        setListings(rows)
        void Promise.all(rows.filter((listing) => listing.moderationStatus !== 'suspended').map((listing) => recordPromotionEvent(listing, 'impression')))
          .then(() => { if (active) return refreshPromotionPerformance() })
      })
      .catch((error) => {
        if (active) setLoadError(error.message || 'Could not load community listings.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshPromotionPerformance, user])

  const openListingForm = () => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent('/community-market')}`)
      return
    }
    setFormError('')
    setNotice('')
    setEditingListingId('')
    setForm(emptyListing)
    setPhotos([])
    setFormOpen((open) => !open)
  }

  const openChat = async (listing) => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent(`/community-market/${listing._id}`)}`)
      return
    }
    setManagementError('')
    try {
      const result = await userApi.startCommunityConversation(listing._id)
      setActiveChat({ conversationId: result.data._id, listingTitle: listing.title })
    } catch (error) {
      setManagementError(error.message || 'Could not start a chat with this seller.')
    }
  }

  const editListing = (listing) => {
    setForm({
      title: listing.title,
      category: listing.category || '',
      description: listing.description,
      price: String(listing.price),
      phone: listing.phone,
      condition: listing.condition,
      isSold: listing.isSold,
    })
    setPhotos([])
    setFormError('')
    setNotice('')
    setEditingListingId(listing._id)
    setFormOpen(true)
    window.setTimeout(() => document.querySelector('.community-listing-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  const closeListingForm = () => {
    setFormOpen(false)
    setEditingListingId('')
    setForm(emptyListing)
    setPhotos([])
  }

  const selectPhotos = (event) => {
    const selected = Array.from(event.target.files || [])
    event.target.value = ''
    if (photos.length + selected.length > MAX_LISTING_IMAGES) {
      setFormError(`You can add up to ${MAX_LISTING_IMAGES} photos to one listing.`)
      return
    }
    const invalidFile = selected.find((file) => (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE_SIZE
    ))
    if (invalidFile) {
      setFormError('Each photo must be a JPEG, PNG, or WebP image up to 8 MB.')
      return
    }
    setFormError('')
    setPhotos((current) => [...current, ...selected])
  }

  const submitListing = async (event) => {
    event.preventDefault()
    if (!editingListingId && photos.length < 1) {
      setFormError('Add at least one product photo before publishing.')
      return
    }
    setSaving(true)
    setFormError('')
    setNotice('')
    try {
      const body = new FormData()
      body.append('title', form.title)
      body.append('category', form.category)
      body.append('description', form.description)
      body.append('price', String(Number(form.price)))
      body.append('phone', form.phone)
      body.append('condition', form.condition)
      body.append('isSold', String(form.isSold))
      photos.forEach((photo) => body.append('images', photo))
      if (editingListingId) {
        const result = await userApi.updateCommunityListing(editingListingId, body)
        setListings((current) => current.map((listing) => listing._id === editingListingId ? result.data : listing))
        setNotice('Your listing has been updated.')
      } else {
        await userApi.createCommunityListing(body)
        setNotice('Your listing is live. Buyers can contact you directly.')
      }
      setForm(emptyListing)
      setPhotos([])
      setFormOpen(false)
      setEditingListingId('')
      if (!editingListingId) await loadListings()
    } catch (error) {
      setFormError(error.message || 'Could not publish your listing.')
    } finally {
      setSaving(false)
    }
  }

  const deleteListing = async (listing) => {
    if (!window.confirm(`Delete "${listing.title}"? This will remove it from the marketplace. Unused paid promotion fees will be credited to your Cardzip wallet.`)) return
    setUpdatingListingId(listing._id)
    setFormError('')
    setManagementError('')
    setNotice('')
    try {
      const result = await userApi.deleteCommunityListing(listing._id)
      setListings((current) => current.filter((item) => item._id !== listing._id))
      setNotice(result?.message || 'Your listing has been deleted.')
    } catch (error) {
      setManagementError(error.message || 'Could not delete your listing.')
    } finally {
      setUpdatingListingId('')
    }
  }

  const updateSoldStatus = async (listing) => {
    setUpdatingListingId(listing._id)
    setFormError('')
    setManagementError('')
    try {
      const result = await userApi.updateCommunityListingSold(listing._id, !listing.isSold)
      setListings((current) => current.map((item) => item._id === listing._id ? result.data : item))
    } catch (error) {
      setManagementError(error.message || 'Could not update listing status.')
    } finally {
      setUpdatingListingId('')
    }
  }

  const openListing = (listing) => {
    recordPromotionEvent(listing, 'click')
    recordProductInteraction(listing, 'view', user)
    onNavigate?.(listing.isDigitalAsset ? `/digital-assets/${listing.slug}` : `/community-market/${listing._id}`)
  }

  return (
    <main className="community-market-page">
      <div className="community-market-shell">
        <button type="button" className="community-back-link" onClick={() => onNavigate?.('/shop')}><ArrowLeft size={15} /> Back to Shop</button>
        <header className="community-market-heading">
          <span className="community-market-eyebrow">CARDZIP COMMUNITY</span>
          <div className="community-heading-row">
            <div><h1>Buy and sell nearby</h1><p>Find community listings and contact sellers directly.</p></div>
            <button className="community-create-button" type="button" onClick={openListingForm}><Plus size={17} /> Post an item</button>
          </div>
        </header>

        <section className="community-safety-notice" aria-label="Community listing buyer safety notice">
          <BadgeAlert size={22} aria-hidden="true" />
          <div><strong>Safety for local community listings</strong><p>For local items, never send a deposit or pay in advance. Meet in a safe public place, examine and test the item, and only then pay the seller. Promoted websites and apps are Cardzip digital listings with secure checkout on their detail pages.</p></div>
        </section>

        <CommunitySellerInbox user={user} />

        {notice && <p className="community-success" role="status"><ShieldCheck size={16} />{notice}</p>}
        {managementError && <p className="community-form-error" role="alert">{managementError}</p>}
        {getUserToken() && promotionPerformance.length > 0 && <section className="community-performance">
          <h2>Your community promotion performance</h2>
          {promotionPerformance.map((promotion) => <div className="community-performance-row" key={promotion._id}>
            <strong>{promotion.targetName} · {promotion.displayStatus === 'expired' ? 'Expired' : promotion.displayStatus || promotion.status.replaceAll('_', ' ')}</strong>
            <span>Analytics: {promotion.impressions} unique impressions · {promotion.clicks} unique clicks · {promotion.clickThroughRate}% CTR</span>
          </div>)}
        </section>}

        {formOpen && (
          <form className="community-listing-form" onSubmit={submitListing}>
            <div className="community-form-heading"><div><span>{editingListingId ? 'EDIT LISTING' : 'NEW LISTING'}</span><h2>{editingListingId ? 'Update your listing' : 'What are you selling?'}</h2></div><button type="button" className="community-form-close" aria-label="Close listing form" onClick={closeListingForm}>×</button></div>
            <label>Product name<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Pre-owned iPhone 14" /></label>
            <div className="community-form-row">
              <label>Category<input maxLength={60} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Phones, furniture, etc." /></label>
              <label>Price (NGN)<input required type="number" min="0" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0" /></label>
            </div>
            <fieldset className="community-condition-fieldset">
              <legend>Condition</legend>
              <label><input type="radio" name="listing-condition" checked={form.condition === 'brand_new'} onChange={() => setForm({ ...form, condition: 'brand_new' })} /> Brand new</label>
              <label><input type="radio" name="listing-condition" checked={form.condition === 'used'} onChange={() => setForm({ ...form, condition: 'used' })} /> Used</label>
              <label className="community-sold-checkbox"><input type="checkbox" checked={form.isSold} onChange={(event) => setForm({ ...form, isSold: event.target.checked })} /> Already sold</label>
            </fieldset>
            <label>Your contact phone<input required type="tel" maxLength={24} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="080… or +234…" /></label>
            <label>Description<textarea required maxLength={2000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the condition, included items, and anything a buyer should know." /></label>
            <label className="community-photo-label"><Camera size={15} /> Product photos <span>{editingListingId ? 'Optional · ' : 'Required · '}1–{MAX_LISTING_IMAGES} photos · up to 8 MB each</span><input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" multiple aria-required={!editingListingId} onChange={selectPhotos} /><small>Upload clear photos of your item. JPEG, PNG, or WebP only.</small></label>
            {editingListingId && <p className="community-photo-note">Leave photos empty to keep the current images. Selecting new photos replaces the existing gallery.</p>}
            {editingListingId && photos.length === 0 && getListingImages(listings.find((listing) => listing._id === editingListingId) || {}).length > 0 && <div className="community-edit-image-preview">{getListingImages(listings.find((listing) => listing._id === editingListingId) || {}).map((image, index) => <img key={`${image}-${index}`} src={image} alt={`Current listing photo ${index + 1}`} />)}</div>}
            {photos.length > 0 && <div className="community-selected-photos" aria-label={`${photos.length} photos selected`}>
              {photos.map((photo, index) => <div className="community-selected-photo" key={`${photo.name}-${photo.lastModified}-${index}`}><Camera size={14} /><span title={photo.name}>{photo.name}</span><button type="button" aria-label={`Remove ${photo.name}`} onClick={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))}>×</button></div>)}
            </div>}
            {formError && <p className="community-form-error" role="alert">{formError}</p>}
            <p className="community-form-safety">Your phone number is visible to buyers. Never accept advance-payment requests; inspect the item together in a safe public place.</p>
            <button className="community-submit-button" type="submit" disabled={saving || (!editingListingId && photos.length < 1)}>{saving ? 'Saving…' : editingListingId ? 'Save changes' : 'Publish listing'} <ArrowRight size={16} /></button>
          </form>
        )}

        <section className="community-listings-section">
          <div className="community-listings-title"><div><span>DIRECT FROM SELLERS</span><h2>Community listings</h2></div><span>{listings.length} items</span></div>
          {loading ? <p className="community-state"><CardzipLoader compact label="Loading listings" /></p> : loadError ? <p className="community-form-error" role="alert">{loadError}</p> : listings.length === 0 ? <div className="community-empty"><Camera size={22} /><strong>No listings yet</strong><span>Be the first to post an item for your community.</span></div> : (
            <div className="community-listing-grid">
              {listings.map((listing) => {
                const listingImages = getListingImages(listing)
                const selectedPhotoIndex = Math.min(activePhotos[listing._id] || 0, Math.max(0, listingImages.length - 1))
                const selectedPhoto = listingImages[selectedPhotoIndex]
                return (
                  <article
                    className="community-listing-card"
                    key={listing._id}
                    role="link"
                    tabIndex={0}
                    onClick={(event) => {
                      if (event.target.closest('button, a')) return
                      openListing(listing)
                    }}
                    onKeyDown={(event) => {
                      if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
                        event.preventDefault()
                        openListing(listing)
                      }
                    }}
                    aria-label={`View ${listing.title}`}
                  >
                    <div className="community-listing-gallery">
                      <div className={`community-listing-image${selectedPhoto ? '' : ' is-empty'}`}>
                        {selectedPhoto ? <img src={selectedPhoto} alt={`${listing.title}, photo ${selectedPhotoIndex + 1}`} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement?.classList.add('is-empty') }} /> : <Camera size={25} aria-label="No photo provided" />}
                      </div>
                      {listing.isSold && <span className="community-sold-badge">SOLD</span>}
                      {listing.isPromoted && <span className="community-listing-promoted"><Megaphone size={12} /> PROMOTED</span>}
                      {listingImages.length > 1 && <div className="community-listing-thumbnails" aria-label={`${listingImages.length} listing photos`}>
                        {listingImages.map((image, index) => <button type="button" key={`${image}-${index}`} className={index === selectedPhotoIndex ? 'selected' : ''} aria-label={`Show photo ${index + 1} of ${listingImages.length}`} aria-pressed={index === selectedPhotoIndex} onClick={() => setActivePhotos((current) => ({ ...current, [listing._id]: index }))}><img src={image} alt="" loading="lazy" /></button>)}
                      </div>}
                    </div>
                    <div className="community-listing-content">
                      <span className="community-listing-category">{listing.category || 'General'}</span>
                      <h3 className="community-listing-title-link">{listing.title}</h3>
                      <span className="community-listing-condition">{listing.condition === 'used' ? 'Used' : 'Brand new'}</span>
                      <strong className="community-listing-price">{Number(listing.price) === 0 ? 'Free' : formatNaira(listing.price)}</strong>
                      <p className="community-listing-description">{listing.description}</p>
                      <span className="community-seller-name">Listed by {listing.sellerName}</span>
                      {isOwnListing(listing, user) && listing.moderationStatus === 'suspended' && <p className="community-moderation-reason"><strong>Hidden by Cardzip:</strong> {listing.moderationReason || 'This listing is temporarily unavailable.'}</p>}
                      {!listing.isDigitalAsset && isOwnListing(listing, user) && <div className="community-owner-actions">
                        <button className="community-owner-status" type="button" disabled={updatingListingId === listing._id} onClick={() => void updateSoldStatus(listing)}>{updatingListingId === listing._id ? 'Updating…' : listing.isSold ? 'Mark available' : 'Mark sold'}</button>
                        <button className="community-owner-edit" type="button" disabled={updatingListingId === listing._id} onClick={() => editListing(listing)}>Edit listing</button>
                        <button className="community-owner-delete" type="button" disabled={updatingListingId === listing._id} onClick={() => void deleteListing(listing)}>{updatingListingId === listing._id ? 'Working…' : 'Delete'}</button>
                      </div>}
                      {!listing.isDigitalAsset && <div className="community-contact-actions">
                        {listing.isSold ? <span className="community-sold-message">This item has been sold</span> : <>
                          {!isOwnListing(listing, user) && <button type="button" onClick={() => void openChat(listing)}><MessageCircle size={15} /> Chat seller</button>}
                          <a href={`tel:${listing.phone}`}><Phone size={15} /> Call</a>
                          <a href={`https://wa.me/${whatsappNumber(listing.phone)}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
                        </>}
                      </div>}
                      {!listing.isDigitalAsset && <small className="community-inspection-note">Meet safely and inspect before paying.</small>}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
      {activeChat && <CommunityChatDialog
        conversationId={activeChat.conversationId}
        listingTitle={activeChat.listingTitle}
        user={user}
        onClose={() => setActiveChat(null)}
      />}
    </main>
  )
}