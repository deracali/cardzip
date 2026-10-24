import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Camera, Copy, MapPin, MessageCircle, Package, Phone, Store } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import { formatNaira } from '../utils/currency'
import './ShopMarketplace.css'

const whatsappNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.startsWith('0') && digits.length === 11 ? `234${digits.slice(1)}` : digits
}

const formatAppointmentDate = (date) => new Date(date).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function ShopProfilePage({ shopSlug, onNavigate }) {
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [appointments, setAppointments] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const loadProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const shopResult = await userApi.shop(shopSlug)
        if (!active) return
        setShop(shopResult.data)
        if (shopResult.data.shopType === 'business') {
          const appointmentResult = await userApi.shopAppointments(shopSlug)
          if (!active) return
          setAppointments(Array.isArray(appointmentResult.data) ? appointmentResult.data : [])
          if (getUserToken()) {
            const bookingsResult = await userApi.myBookedShopAppointments()
            if (!active) return
            setMyBookings((Array.isArray(bookingsResult.data) ? bookingsResult.data : []).filter((appointment) => appointment.shop?.slug === shopResult.data.slug))
          } else {
            setMyBookings([])
          }
          setProducts([])
        } else {
          const productResult = await userApi.shopProducts(shopSlug, `?page=${pagination.page}&limit=12`)
          if (!active) return
          setProducts(Array.isArray(productResult.data) ? productResult.data : [])
          setPagination(productResult.pagination || { page: 1, totalPages: 1, totalItems: 0 })
          setAppointments([])
        }
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadProfile()
    return () => { active = false }
  }, [shopSlug, pagination.page])

  const bookAppointment = async (appointmentId) => {
    if (!getUserToken()) {
      const redirect = `${window.location.pathname}${window.location.search}`
      onNavigate?.(`/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }
    setBookingId(appointmentId)
    setError('')
    setNotice('')
    try {
      const bookedAppointment = await userApi.bookShopAppointment(shopSlug, appointmentId)
      setAppointments((current) => current.filter((appointment) => appointment._id !== appointmentId))
      setMyBookings((current) => [bookedAppointment.data || bookedAppointment, ...current])
      setNotice('Appointment request sent. The business will review and confirm it.')
    } catch (requestError) {
      setError(requestError.message || 'Could not book this appointment time.')
    } finally {
      setBookingId('')
    }
  }

  const copyShopPage = async () => {
    try {
      await navigator.clipboard.writeText(new URL(`/shops/${encodeURIComponent(shop.slug)}`, window.location.origin).toString())
      setError('')
      setNotice(`Public ${shop.shopType === 'business' ? 'business' : 'shop'} page link copied.`)
    } catch {
      setError('Could not copy the public page link. Please copy it from your browser address bar.')
    }
  }

  return (
    <main className="shop-market-page">
      <div className="shop-market-shell">
        <button type="button" className="shop-market-back" onClick={() => onNavigate?.('/shops')}><ArrowLeft size={15} /> All shops and businesses</button>
        {loading ? <p className="shop-market-state" role="status">Loading business page…</p>
          : error && !shop ? <p className="shop-market-error" role="alert">{error}</p>
            : shop && (
              <>
                <header className="shop-profile-hero">
                  {shop.bannerImage ? <img className="shop-profile-banner" src={shop.bannerImage} alt={`${shop.businessName} banner`} /> : <div className="shop-profile-mark"><Store size={30} /></div>}
                  <div className="shop-profile-copy"><span className="shop-market-verified">{shop.shopType === 'business' ? 'VERIFIED CARDZIP BUSINESS' : 'VERIFIED CARDZIP SHOP'}</span><h1>{shop.businessName}</h1><p>{shop.description || (shop.shopType === 'business' ? 'Book an appointment with this local business.' : 'Discover products from this local business.')}</p><span className="shop-profile-address"><MapPin size={15} />{shop.address}</span></div>
                  <div className="shop-profile-contact"><a href={`tel:${shop.contactPhone}`}><Phone size={15} /> Call</a><a href={`https://wa.me/${whatsappNumber(shop.contactPhone)}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a><button type="button" onClick={() => void copyShopPage()}><Copy size={15} /> Copy page link</button></div>
                </header>
                {shop.shopType === 'business' ? (
                  <section className="shop-profile-products" aria-labelledby="business-appointments-heading">
                    <div className="shop-market-section-heading"><div><span>BOOK WITH THIS BUSINESS</span><h2 id="business-appointments-heading">Available appointments</h2></div><CalendarDays size={20} color="#087a4c" /></div>
                    {myBookings.length > 0 && <section className="shop-my-bookings" aria-label="Your bookings">
                      <h3>Your bookings with this business</h3>
                      <div>{myBookings.map((appointment) => <article key={appointment._id}>
                        <strong>{appointment.serviceName}</strong>
                        <span>{formatAppointmentDate(appointment.startsAt)} · {appointment.durationMinutes} minutes</span>
                        <span className={`shop-appointment-status ${appointment.status}`}>{appointment.status}</span>
                        {appointment.cancellationReason && <p className="shop-appointment-reason">Reason: {appointment.cancellationReason}</p>}
                      </article>)}</div>
                    </section>}
                    {notice && <p className="shop-market-success" role="status">{notice}</p>}
                    {error && <p className="shop-market-error" role="alert">{error}</p>}
                    {appointments.length === 0 ? (
                      <div className="shop-market-empty"><CalendarDays size={25} /><strong>No appointment times available</strong><span>Check back later or contact the business directly.</span></div>
                    ) : (
                      <div className="shop-public-appointment-grid">{appointments.map((appointment) => (
                        <article className="shop-public-appointment-card" key={appointment._id}>
                          <div><strong>{appointment.serviceName}</strong><span>{formatAppointmentDate(appointment.startsAt)}</span><small>{appointment.durationMinutes} minutes</small></div>
                          <button type="button" className="shop-market-primary-button" disabled={Boolean(bookingId)} onClick={() => void bookAppointment(appointment._id)}>{bookingId === appointment._id ? 'Sending request…' : 'Book appointment'}</button>
                        </article>
                      ))}</div>
                    )}
                    <aside className="shop-contact-disclosure"><Package size={17} /><span>Booking requests are sent to the business for confirmation. Contact the business directly if you need help with your appointment.</span></aside>
                  </section>
                ) : (
                  <>
                    {notice && <p className="shop-market-success" role="status">{notice}</p>}
                    {error && <p className="shop-market-error" role="alert">{error}</p>}
                    <aside className="shop-contact-disclosure"><Package size={17} /><span>Contact this shop directly to ask questions and arrange a purchase. Cardzip does not process payments or manage delivery for shop products.</span></aside>
                    <section className="shop-profile-products">
                      <div className="shop-market-section-heading"><div><span>AVAILABLE FROM THIS BUSINESS</span><h2>Shop products</h2></div><small>{pagination.totalItems} {pagination.totalItems === 1 ? 'product' : 'products'}</small></div>
                      {products.length === 0 ? <div className="shop-market-empty"><Camera size={25} /><strong>No available products yet</strong><span>Check back later to see what this shop has listed.</span></div> : (
                        <div className="shop-product-grid">{products.map((product) => (
                          <article className="shop-product-card" key={product._id}>
                            <div className="shop-product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement?.classList.add('is-empty') }} /> : <Camera size={25} />}</div>
                            <div className="shop-product-info"><span>{product.category || 'General'} · {product.condition === 'used' ? 'Used' : 'Brand new'}</span><h3>{product.name}</h3><p>{product.description}</p><div><strong>{formatNaira(product.price)}</strong><small>{product.stock} available</small></div><a className="shop-product-contact" href={`https://wa.me/${whatsappNumber(shop.contactPhone)}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} from ${shop.businessName}.`)}`} target="_blank" rel="noreferrer">Ask about this product <ArrowRight size={15} /></a></div>
                          </article>
                        ))}</div>
                      )}
                      {pagination.totalPages > 1 && <nav className="shop-market-pagination" aria-label="Shop product pages"><span>Page {pagination.page} of {pagination.totalPages}</span><div><button type="button" disabled={pagination.page <= 1} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })) }}>Previous</button><button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Next</button></div></nav>}
                    </section>
                  </>
                )}
              </>
            )}
        {shop && <button type="button" className="shop-market-link-button shop-market-back-directory" onClick={() => onNavigate?.('/shops')}>Browse other shops and businesses <ArrowRight size={15} /></button>}
      </div>
    </main>
  )
}
