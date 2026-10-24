import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, CalendarDays, ShieldCheck, Store } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import './ShopMarketplace.css'

export default function CreateShopPage({ onNavigate }) {
  const [shopType, setShopType] = useState('store')
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [description, setDescription] = useState('')
  const [banner, setBanner] = useState(null)
  const [existingShop, setExistingShop] = useState(null)
  const [addressAcknowledged, setAddressAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingExistingShop, setLoadingExistingShop] = useState(Boolean(getUserToken()))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getUserToken()) return undefined
    let active = true
    userApi.myShop()
      .then((result) => {
        const shop = result.data?.shop
        if (!active || shop?.status !== 'rejected') return
        setExistingShop(shop)
        setShopType(shop.shopType || 'store')
        setBusinessName(shop.businessName || '')
        setAddress(shop.address || '')
        setContactPhone(shop.contactPhone || '')
        setDescription(shop.description || '')
        setAddressAcknowledged(true)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load your existing application.')
      })
      .finally(() => { if (active) setLoadingExistingShop(false) })
    return () => { active = false }
  }, [])

  const submitApplication = async (event) => {
    event.preventDefault()
    if (!getUserToken()) {
      onNavigate?.(`/login?redirect=${encodeURIComponent('/shops/create')}`)
      return
    }
    const body = new FormData()
    body.append('shopType', shopType)
    body.append('businessName', businessName)
    body.append('address', address)
    body.append('contactPhone', contactPhone)
    body.append('description', description)
    if (banner) body.append('banner', banner)
    setLoading(true)
    setError('')
    try {
      await userApi.createShop(body)
      onNavigate?.('/my-shop')
    } catch (requestError) {
      setError(requestError.message || 'Could not submit your shop application.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shop-market-page">
      <div className="shop-market-shell shop-create-shell">
        <button type="button" className="shop-market-back" onClick={() => onNavigate?.('/shops')}><ArrowLeft size={15} /> Back to shops</button>
        <header className="shop-create-heading"><span className="shop-market-eyebrow">{existingShop ? 'UPDATE YOUR CARDZIP APPLICATION' : 'GET STARTED WITH CARDZIP'}</span><h1>{existingShop ? 'Correct your application' : 'Create a store or business'}</h1><p>{existingShop ? 'Your submitted details are prefilled. Correct the items called out by the reviewer, then send the application back for review.' : 'Choose how customers will interact with you. Our team reviews each application before it goes live.'}</p></header>
        {existingShop?.reviewNote && <section className="shop-correction-note" role="note"><AlertCircle size={18} /><div><strong>Changes requested</strong><p>{existingShop.reviewNote}</p><small>Your submitted information is prefilled. Update the requested items and leave the other details unchanged.</small></div></section>}
        <form className="shop-market-form" onSubmit={submitApplication}>
          <div className="shop-form-intro"><span className="shop-form-icon"><Store size={20} /></span><div><strong>Profile application</strong><small>Fields marked required are needed for verification.</small></div></div>
          <fieldset className="shop-type-options">
            <legend>Choose a profile type</legend>
            <label className={`shop-type-option${shopType === 'store' ? ' active' : ''}`}>
              <input type="radio" name="shopType" value="store" checked={shopType === 'store'} onChange={() => setShopType('store')} />
              <Store size={19} />
              <span><strong>Store</strong><small>List products and connect with customers.</small></span>
            </label>
            <label className={`shop-type-option${shopType === 'business' ? ' active' : ''}`}>
              <input type="radio" name="shopType" value="business" checked={shopType === 'business'} onChange={() => setShopType('business')} />
              <CalendarDays size={19} />
              <span><strong>Business</strong><small>Set appointment times and manage customer bookings.</small></span>
            </label>
          </fieldset>
          <label>Business name <span>Required</span><input value={businessName} onChange={(event) => setBusinessName(event.target.value)} required minLength={2} maxLength={100} placeholder="Your registered or trading name" /></label>
          <label>Business contact phone <span>Required</span><input type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required maxLength={24} placeholder="080… or +234…" /></label>
          <label>Full business address <span>Required</span><textarea value={address} onChange={(event) => setAddress(event.target.value)} required minLength={8} maxLength={300} rows={3} placeholder="Street, area, city, state" /></label>
          <label>About your business <span>Optional · up to 500 characters</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} placeholder="What do you sell? What should customers know?" /><small>{description.length}/500 characters</small></label>
          <label className="shop-proof-upload"><span className="shop-proof-label"><Store size={16} /> Profile logo or banner <b>Optional · JPEG, PNG or WebP · up to 8 MB</b></span><input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => setBanner(event.target.files?.[0] || null)} />{existingShop?.bannerImage && !banner && <img className="shop-owner-banner" src={existingShop.bannerImage} alt={`${existingShop.businessName} current logo or banner`} />}<small>{banner ? banner.name : existingShop?.bannerImage ? 'Current image will be kept unless replaced.' : 'Add a wide image to brand your public profile page.'}</small></label>
          <div className="shop-address-disclosure"><ShieldCheck size={18} /><p><strong>Your address will be shown publicly.</strong> By submitting, you acknowledge that your full business address will be visible on your public shop page.</p></div>
          <label className="shop-address-check"><input type="checkbox" checked={addressAcknowledged} onChange={(event) => setAddressAcknowledged(event.target.checked)} required /><span>I understand my full business address will appear publicly on my shop.</span></label>
          {error && <p className="shop-market-error" role="alert">{error}</p>}
          <button type="submit" className="shop-market-primary-button shop-submit-button" disabled={loading || loadingExistingShop || !addressAcknowledged}>{loading ? 'Submitting application…' : existingShop ? 'Resubmit updated application' : `Submit ${shopType} for review`} <ArrowRight size={16} /></button>
          <small className="shop-review-note">{shopType === 'business' ? 'You can add available appointment times after your business is approved. Customers submit booking requests for your review.' : 'You can add products after your store is approved. Store products are listings for direct contact; Cardzip does not process payment for them.'}</small>
        </form>
      </div>
    </main>
  )
}
