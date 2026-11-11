import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Megaphone, MessageCircle, Phone, ShieldCheck, Star } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import { recordProductInteraction } from '../services/storePreferences'
import { formatNaira } from '../utils/currency'
import CardzipLoader from '../components/CardzipLoader'
import CommunityChatDialog from '../components/CommunityChatDialog'
import CommunitySellerInbox from '../components/CommunitySellerInbox'
import ReportListingButton from '../components/ReportListingButton'
import './CommunityListingDetailsPage.css'

const getListingImages = (listing) => (
  Array.isArray(listing?.images) && listing.images.length
    ? listing.images
    : listing?.imageUrl ? [listing.imageUrl] : []
)

const getWhatsAppNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.startsWith('0') && digits.length === 11 ? `234${digits.slice(1)}` : digits
}
const getId = (value) => String(value?._id || value?.id || value || '')
const RatingStars = ({ rating, size = 15 }) => (
  <span className="community-review-stars" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={size} fill={index < Math.round(rating) ? 'currentColor' : 'none'} />)}
  </span>
)

export default function CommunityListingDetailsPage({ listingId, onNavigate, user }) {
  const [listing, setListing] = useState(null)
  const [relatedListings, setRelatedListings] = useState([])
  const [pricing, setPricing] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState('')
  const [promotionOpen, setPromotionOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState('')
  const [relatedError, setRelatedError] = useState('')
  const [promotionError, setPromotionError] = useState('')
  const [activeChat, setActiveChat] = useState(null)
  const [chatError, setChatError] = useState('')
  const [reviewSummary, setReviewSummary] = useState({ reviews: [], averageRating: 0, totalReviews: 0 })
  const [myReview, setMyReview] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const interactionUserId = String(user?._id || user?.id || user?.email || 'guest')

  useEffect(() => {
    let active = true
    setReviewSummary({ reviews: [], averageRating: 0, totalReviews: 0 })
    setMyReview(null)
    setReviewRating(5)
    setReviewComment('')
    setReviewError('')
    Promise.all([
      userApi.communityListing(listingId),
      userApi.communityPromotionPricing(),
    ])
      .then(([listingResult, pricingResult]) => {
        if (!active) return
        setListing(listingResult.data)
        setPricing(pricingResult.data || [])
        recordProductInteraction(listingResult.data, 'view', user)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load this listing.')
      })
      .finally(() => { if (active) setLoading(false) })
    userApi.relatedCommunityListings(listingId)
      .then((result) => { if (active) setRelatedListings(result.data || []) })
      .catch((requestError) => { if (active) setRelatedError(requestError.message || 'Could not load similar listings.') })
    userApi.communityListingReviews(listingId)
      .then((result) => { if (active) setReviewSummary(result.data || { reviews: [], averageRating: 0, totalReviews: 0 }) })
      .catch((requestError) => { if (active) setReviewError(requestError.message || 'Could not load reviews.') })
    if (getUserToken()) {
      userApi.myCommunityListingReview(listingId)
        .then((result) => {
          if (!active) return
          setMyReview(result.data || null)
          setReviewRating(result.data?.rating || 5)
          setReviewComment(result.data?.comment || '')
        })
        .catch((requestError) => { if (active) setReviewError(requestError.message || 'Could not load your review.') })
    } else {
      setMyReview(null)
      setReviewRating(5)
      setReviewComment('')
    }
    return () => { active = false }
  }, [listingId, user, interactionUserId])

  const images = useMemo(() => getListingImages(listing), [listing])
  const selectedPrice = pricing.find((item) => item.key === selectedDuration)?.price || 0
  const ownerUserId = getId(user?._id || user?.id || user?.userId)
  const isOwner = Boolean(listing && ownerUserId && getId(listing.sellerId || listing.seller) === ownerUserId)

  const startPromotion = () => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent(`/community-market/${listingId}`)}`)
      return
    }
    setPromotionError('')
    setSelectedDuration('')
    setPromotionOpen(true)
  }

  const openChat = async () => {
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent(`/community-market/${listingId}`)}`)
      return
    }
    setChatError('')
    try {
      const result = await userApi.startCommunityConversation(listing._id)
      setActiveChat({ conversationId: result.data._id, listingTitle: listing.title })
    } catch (requestError) {
      setChatError(requestError.message || 'Could not start a chat with this seller.')
    }
  }

  const submitPromotion = async () => {
    if (!selectedDuration || !selectedPrice || paymentLoading) return
    setPaymentLoading(true)
    setPromotionError('')
    try {
      const result = await userApi.initializeCommunityPromotionPayment(listingId, selectedDuration)
      sessionStorage.setItem('cardzip-payment-purpose', 'community_promotion')
      window.location.assign(result.data.authorizationUrl)
    } catch (requestError) {
      setPromotionError(requestError.message || 'Could not start promotion checkout.')
      setPaymentLoading(false)
    }
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent(`/community-market/${listingId}`)}`)
      return
    }
    setReviewSubmitting(true)
    setReviewError('')
    try {
      const saved = await userApi.saveCommunityListingReview(listing._id, { rating: reviewRating, comment: reviewComment })
      setMyReview(saved.data)
      const refreshed = await userApi.communityListingReviews(listing._id)
      setReviewSummary(refreshed.data || { reviews: [], averageRating: 0, totalReviews: 0 })
    } catch (requestError) {
      setReviewError(requestError.message || 'Could not save your review.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return <main className="community-detail-page"><div className="community-detail-shell" role="status"><CardzipLoader compact label="Loading listing" /></div></main>
  }
  if (!listing) {
    return <main className="community-detail-page"><div className="community-detail-shell">
      <h1>Listing unavailable</h1><p role="alert">{error || 'This community listing could not be found.'}</p>
      <button className="community-detail-back" type="button" onClick={() => onNavigate?.('/community-market')}><ArrowLeft size={15} /> Back to community market</button>
    </div></main>
  }

  return (
    <main className="community-detail-page">
      <div className="community-detail-shell">
        <button className="community-detail-back" type="button" onClick={() => onNavigate?.('/community-market')}><ArrowLeft size={15} /> Community market</button>
        <div className="community-detail-layout">
          <section className="community-detail-gallery" aria-label={`${listing.title} photos`}>
            <div className="community-detail-hero">
              {images[selectedImage]
                ? <img src={images[selectedImage]} alt={`${listing.title}, photo ${selectedImage + 1}`} />
                : <span>No product photo</span>}
              {listing.isPromoted && <span className="community-promoted-badge"><Megaphone size={13} /> PROMOTED</span>}
              {listing.isSold && <span className="community-detail-sold">SOLD</span>}
            </div>
            {images.length > 1 && <div className="community-detail-thumbnails" aria-label="Choose a product photo">
              {images.map((image, index) => <button type="button" key={`${image}-${index}`} className={selectedImage === index ? 'selected' : ''} aria-label={`Show photo ${index + 1}`} onClick={() => setSelectedImage(index)}><img src={image} alt="" /></button>)}
            </div>}
          </section>
          <section className="community-detail-info">
            <span className="community-detail-category">{listing.category || 'General'}</span>
            <h1>{listing.title}</h1>
            <div className="community-seller-profile">
              {listing.sellerImage
                ? <img src={listing.sellerImage} alt="" />
                : <span aria-hidden="true">{String(listing.sellerName || '?').trim().charAt(0).toUpperCase()}</span>}
              <p className="community-detail-condition">{listing.condition === 'used' ? 'Used' : 'Brand new'} · Listed by {listing.sellerName}</p>
            </div>
            <strong className="community-detail-price">{Number(listing.price) === 0 ? 'Free' : formatNaira(listing.price)}</strong>
            <p className="community-detail-description">{listing.description}</p>
            <div className="community-detail-safety"><ShieldCheck size={18} /><span>Inspect the item in a safe public place. Never pay a deposit or transfer before meeting the seller.</span></div>
            {!listing.isSold && !isOwner ? <div className="community-detail-actions">
              <button type="button" className="community-chat-action" onClick={() => void openChat()}><MessageCircle size={16} /> Chat seller</button>
              <a href={`tel:${listing.phone}`}><Phone size={16} /> Call seller</a>
              <a href={`https://wa.me/${getWhatsAppNumber(listing.phone)}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
            </div> : listing.isSold ? <p className="community-detail-sold-note">This item has been sold.</p> : null}
            {!isOwner && <ReportListingButton targetType="community_listing" targetId={listing._id} targetTitle={listing.title} onNavigate={onNavigate} />}
            {chatError && <p className="community-chat-action-error" role="alert">{chatError}</p>}
            {isOwner && <>
              <CommunitySellerInbox user={user} listingId={listing._id} />
              {!listing.isSold && <button type="button" className="community-promote-button" onClick={startPromotion}>
                <Megaphone size={17} /><span><strong>Promote this product</strong><small>Choose a package. Your promotion starts after admin approval.</small></span><ArrowRight size={16} />
              </button>}
            </>}
          </section>
        </div>

        <section className="community-reviews-section" aria-labelledby="community-reviews-title">
          <div className="community-reviews-heading">
            <div><span>COMMUNITY REVIEWS</span><h2 id="community-reviews-title">Product reviews</h2></div>
            <div className="community-review-summary"><RatingStars rating={reviewSummary.averageRating} /><strong>{reviewSummary.averageRating ? reviewSummary.averageRating.toFixed(1) : 'New'}</strong><span>{reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'}</span></div>
          </div>
          {reviewError && <p className="community-review-error" role="alert">{reviewError}</p>}
          {reviewSummary.reviews.length > 0 ? <div className="community-review-list">
            {reviewSummary.reviews.map((review) => <article className="community-review-item" key={review._id}>
              <div className="community-review-item-heading"><strong>{review.reviewer?.name || 'Cardzip member'}</strong><RatingStars rating={review.rating} size={13} /><time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time></div>
              <p>{review.comment}</p>
            </article>)}
          </div> : <p className="community-review-empty">No reviews yet. Share your experience with this product.</p>}
          {!isOwner && (getUserToken() ? <form className="community-review-form" onSubmit={submitReview}>
            <h3>{myReview ? 'Update your review' : 'Leave a review'}</h3>
            <div className="community-review-picker" role="group" aria-label="Your rating">
              {Array.from({ length: 5 }, (_, index) => <button key={index} type="button" className={index < reviewRating ? 'selected' : ''} aria-label={`Rate ${index + 1} out of 5`} aria-pressed={reviewRating === index + 1} onClick={() => setReviewRating(index + 1)}><Star size={21} fill={index < reviewRating ? 'currentColor' : 'none'} /></button>)}
            </div>
            <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="What should other customers know?" maxLength={1000} minLength={3} required aria-label="Review comment" />
            <div className="community-review-form-footer"><span>{reviewComment.length}/1000</span><button type="submit" disabled={reviewSubmitting || reviewComment.trim().length < 3}>{reviewSubmitting ? 'Saving…' : myReview ? 'Update review' : 'Post review'}</button></div>
          </form> : <p className="community-review-signin">Sign in to share your experience. <button type="button" onClick={() => onNavigate?.(`/login?redirect=${encodeURIComponent(`/community-market/${listingId}`)}`)}>Sign in</button></p>)}
        </section>

        <section className="community-related-section">
          <div><span>SIMILAR FINDS</span><h2>Related community listings</h2></div>
          {relatedError && <p role="alert">{relatedError}</p>}
          {relatedListings.length > 0 ? <div className="community-related-grid">
            {relatedListings.map((item) => (
              <button type="button" className="community-related-card" key={item._id} onClick={() => onNavigate?.(`/community-market/${item._id}`)}>
                <span className="community-related-image">{getListingImages(item)[0] && <img src={getListingImages(item)[0]} alt="" loading="lazy" />}{item.isPromoted && <em><Megaphone size={11} /> Promoted</em>}</span>
                <span className="community-related-category">{item.category || 'General'}</span>
                <strong>{item.title}</strong>
                <span className="community-related-price">{Number(item.price) === 0 ? 'Free' : formatNaira(item.price)}</span>
              </button>
            ))}
          </div> : !relatedError && <p className="community-related-empty">More listings in this category will appear here.</p>}
        </section>
      </div>

      {activeChat && <CommunityChatDialog
        conversationId={activeChat.conversationId}
        listingTitle={activeChat.listingTitle}
        user={user}
        onClose={() => setActiveChat(null)}
      />}
      {promotionOpen && <div className="community-promotion-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPromotionOpen(false) }}>
        <section className="community-promotion-dialog" role="dialog" aria-modal="true" aria-labelledby="community-promotion-title">
          <button type="button" className="community-promotion-close" onClick={() => setPromotionOpen(false)} aria-label="Close promotion packages">×</button>
          <span className="community-detail-category">COMMUNITY PROMOTION</span>
          <h2 id="community-promotion-title">Choose a package</h2>
          <p>Pay securely with Paystack. Your promotion appears after an administrator approves it, and its duration begins on approval.</p>
          <div className="community-promotion-options">
            {pricing.map((item) => <button type="button" key={item.key} disabled={!item.price} className={selectedDuration === item.key ? 'selected' : ''} onClick={() => setSelectedDuration(item.key)}>
              <strong>{item.label}</strong><span>{item.price ? formatNaira(item.price) : 'Not available yet'}</span>
            </button>)}
          </div>
          {promotionError && <p className="community-promotion-error" role="alert">{promotionError}</p>}
          <button type="button" className="community-promotion-checkout" disabled={!selectedDuration || !selectedPrice || paymentLoading} onClick={() => void submitPromotion()}>
            {paymentLoading ? 'Opening Paystack…' : <>Continue to Paystack <ArrowRight size={15} /></>}
          </button>
          <small className="community-promotion-note"><BadgeCheck size={14} /> Only verified Paystack payments are sent for review.</small>
        </section>
      </div>}
    </main>
  )
}
