import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  CreditCard,
  Fuel,
  Heart,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  ShieldCheck,
  Smartphone,
  Star,
  Truck,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import './RentalApp.css'

const vehicles = [
  {
    name: 'Apex Cruiser X5',
    category: 'SUV',
    label: 'Most rented',
    price: 89,
    details: '2024 · Hybrid · 4-person ready',
    seats: 5,
    fuel: 'Auto',
    image: 'photo-1492144534655-ae79c964c9d7',
  },
  {
    name: 'City Swift Sedan',
    category: 'Sedan',
    label: '',
    price: 64,
    details: '2024 · Hybrid · Airport ready',
    seats: 5,
    fuel: 'Auto',
    image: 'photo-1552519507-da3b142c6e3d',
  },
  {
    name: 'Metro Cargo Van',
    category: 'Cargo Van',
    label: 'Logistics pick',
    price: 98,
    details: '2024 · Hybrid · Airport ready',
    seats: 2,
    fuel: 'Auto',
    image: 'photo-1566933293069-b55c7f326dd4',
  },
  {
    name: 'Volt Urban EV',
    category: 'Sedan',
    label: 'Electric',
    price: 62,
    details: '2024 · Hybrid · Airport ready',
    seats: 5,
    fuel: 'Electric',
    image: 'photo-1503376780353-7e6692767b70',
  },
  {
    name: 'Trailblazer 4x4',
    category: 'SUV',
    label: '',
    price: 112,
    details: '2024 · Hybrid · 4-person ready',
    seats: 5,
    fuel: 'Auto',
    image: 'photo-1519641471654-76ce0107ad1b',
  },
  {
    name: 'Hauler Max XL',
    category: 'Cargo Van',
    label: 'High volume',
    price: 124,
    details: '2024 · Hybrid · Airport ready',
    seats: 3,
    fuel: 'Auto',
    image: 'photo-1601584115197-04ecc0da31d7',
  },
]

const imageUrl = (id, width = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

function Logo({ light = false }) {
  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="Voltigo home">
      <span className="brand-icon"><Zap size={16} fill="currentColor" /></span>
      <span className="brand-name">VOLTIGO<span>RENTAL + LOGISTICS</span></span>
    </a>
  )
}

function Header({ compact = false }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a className={!compact ? 'nav-active' : ''} href="/">Fleet</a>
          <a href="/fleet">Delivery Services <ChevronDown size={12} /></a>
          <a href="/fleet">Long-Term Rental <ChevronDown size={12} /></a>
          <a href="/#locations">Locations</a>
          <div className="nav-actions">
            <button type="button" className="currency-button"><span className="globe-mark">◎</span> USD $ <ChevronDown size={11} /></button>
            <a className="help-link" href="/#support">Help</a>
            <a className="button button-small" href="/fleet">Reserve Vehicle <ArrowRight size={13} /></a>
          </div>
        </nav>
      </div>
    </header>
  )
}

function VehicleCard({ vehicle }) {
  const [saved, setSaved] = useState(false)

  return (
    <article className="vehicle-card">
      <div className="vehicle-photo">
        <img src={imageUrl(vehicle.image, 700)} alt={vehicle.name} loading="lazy" />
        <span className="vehicle-category">{vehicle.category}</span>
        {vehicle.label && <span className="vehicle-label">{vehicle.label}</span>}
        <span className="delivery-pill"><Zap size={11} /> Doorstep in 25 min</span>
        <span className="vehicle-rating"><Star size={11} fill="currentColor" /> 4.9</span>
      </div>
      <div className="vehicle-info">
        <div className="vehicle-title-row">
          <div>
            <h3>{vehicle.name}</h3>
            <p>{vehicle.details}</p>
          </div>
          <div className="vehicle-price">${vehicle.price}<span>/day</span></div>
        </div>
        <div className="vehicle-specs">
          <span><Users size={12} /> {vehicle.seats}</span>
          <span><Fuel size={12} /> {vehicle.fuel}</span>
          <span><KeyRound size={12} /> Unlimited</span>
        </div>
        <div className="vehicle-actions">
          <a className="button button-book" href={`/book?vehicle=${encodeURIComponent(vehicle.name)}`}>Book Now</a>
          <button
            type="button"
            className={`favorite-button${saved ? ' is-saved' : ''}`}
            aria-label={saved ? `Remove ${vehicle.name} from saved vehicles` : `Save ${vehicle.name}`}
            aria-pressed={saved}
            onClick={() => setSaved((value) => !value)}
          >
            <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  )
}

function BookingSearch() {
  function handleSearch(event) {
    event.preventDefault()
    window.location.href = '/fleet'
  }

  return (
    <div className="booking-wrap">
      <form className="booking-bar" onSubmit={handleSearch}>
        <label className="booking-field">
          <span><MapPin size={14} /> Pickup Location</span>
          <input aria-label="Pickup location" defaultValue="Downtown Hub — 44 Mercer St" />
        </label>
        <label className="booking-field">
          <span><NavigationIcon /> Drop-off Location</span>
          <input aria-label="Drop-off location" defaultValue="Airport T2 — Doorstep" />
        </label>
        <label className="booking-field">
          <span><CalendarDays size={14} /> Pickup Date / Time</span>
          <input aria-label="Pickup date and time" type="datetime-local" />
        </label>
        <label className="booking-field booking-vehicle">
          <span><Truck size={14} /> Vehicle Type</span>
          <select aria-label="Vehicle type" defaultValue="SUV">
            <option>SUV</option>
            <option>Sedan</option>
            <option>Cargo Van</option>
          </select>
        </label>
        <button className="live-price" type="submit">
          <span>LIVE PRICE<strong>$86<small>/day</small></strong></span>
          <span className="price-arrow"><ArrowRight size={17} /></span>
        </button>
      </form>
      <div className="booking-promises">
        <span><Check size={12} /> Free cancellation up to 6h before pickup</span>
        <span><Zap size={12} /> Doorstep delivery available in this zone</span>
        <span><ShieldCheck size={12} /> Full tank + insurance included</span>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="live-eyebrow"><span className="status-dot" /> Now live in 14 zones · Avg delivery 32 min</span>
            <h1>Rent it. Move it.<br /><span>Delivered.</span></h1>
            <p>Sedans, SUVs and cargo vans with instant doorstep delivery. Real-time pricing, unlimited mileage options, logistics built-in.</p>
            <div className="hero-trust">
              <span className="avatar-stack" aria-hidden="true"><i /><i /><i /></span>
              <span><strong>4.9 <Star size={11} fill="currentColor" /></strong><small>12.4k trips</small></span>
              <span><ShieldCheck size={14} /> Insured · Verified drivers</span>
              <span><Smartphone size={14} /> Instant unlock</span>
            </div>
          </div>
          <div className="hero-visual">
            <img src={imageUrl('photo-1558981806-ec527fa84c39', 1400)} alt="Motorcycle ready for a night ride" />
            <div className="hero-image-shade" />
            <div className="delivery-card">
              <span className="delivery-icon"><Zap size={16} fill="currentColor" /></span>
              <span><strong>Doorstep delivery</strong><small>Active · 6 drivers nearby</small></span>
              <span className="starting-price">Starting at<strong>$48/day</strong></span>
            </div>
          </div>
          <BookingSearch />
        </section>

        <section className="fleet-section" id="fleet">
          <div className="section-heading">
            <div><p className="section-kicker">FLEET · 128 VEHICLES READY</p><h2>Pick your ride or hauler</h2></div>
            <a className="text-link" href="/fleet">Explore all vehicles <ArrowRight size={14} /></a>
          </div>
          <VehicleGrid limit={3} />
        </section>

        <section className="service-strip" id="locations">
          <div><span className="service-icon"><Zap size={18} /></span><strong>Instant doorstep delivery</strong><p>Skip the counter. Your ride comes to you.</p></div>
          <div><span className="service-icon"><ShieldCheck size={18} /></span><strong>Fully covered, always</strong><p>Every trip includes trusted protection.</p></div>
          <div><span className="service-icon"><Smartphone size={18} /></span><strong>Unlock and go</strong><p>Your phone is your key. No waiting.</p></div>
        </section>
        <ReviewsSection />
      </main>
      <SiteFooter />
    </>
  )
}

function VehicleGrid({ vehiclesToShow = vehicles, limit }) {
  const visibleVehicles = limit ? vehiclesToShow.slice(0, limit) : vehiclesToShow
  return <div className="vehicle-grid">{visibleVehicles.map((vehicle) => <VehicleCard key={vehicle.name} vehicle={vehicle} />)}</div>
}

function FleetPage() {
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Sedan', 'SUV', 'Cargo Van']
  const filteredVehicles = filter === 'All' ? vehicles : vehicles.filter((vehicle) => vehicle.category === filter)

  return (
    <>
      <Header compact />
      <main className="fleet-page">
        <div className="fleet-heading">
          <div><p className="section-kicker">FLEET · 128 VEHICLES READY</p><h1>Pick your ride or hauler</h1><p>Find a vehicle for every trip, delivered right to you.</p></div>
          <div className="filter-tabs" role="group" aria-label="Filter vehicles">
            {filters.map((item) => <button key={item} type="button" className={filter === item ? 'is-selected' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        <VehicleGrid vehiclesToShow={filteredVehicles} />
      </main>
      <ReviewsSection />
      <SiteFooter />
    </>
  )
}

function getBookingDetails() {
  const params = new URLSearchParams(window.location.search)
  const vehicle = vehicles.find((item) => item.name === params.get('vehicle')) ?? vehicles[0]
  const start = params.get('start') || ''
  const end = params.get('end') || ''
  const days = start && end
    ? Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86400000))
    : 1

  return {
    vehicle,
    pickup: params.get('pickup') || 'Downtown Hub — 44 Mercer St',
    dropoff: params.get('dropoff') || 'Airport T2 — Doorstep',
    start,
    end,
    days,
    coverage: params.get('coverage') !== 'false',
  }
}

function BookingPage() {
  const booking = getBookingDetails()
  const [pickup, setPickup] = useState(booking.pickup)
  const [dropoff, setDropoff] = useState(booking.dropoff)
  const [start, setStart] = useState(booking.start)
  const [end, setEnd] = useState(booking.end)
  const [coverage, setCoverage] = useState(booking.coverage)
  const days = start && end
    ? Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86400000))
    : booking.days
  const subtotal = booking.vehicle.price * days
  const protection = coverage ? 18 * days : 0
  const total = subtotal + protection

  function continueToCheckout(event) {
    event.preventDefault()
    const params = new URLSearchParams({
      vehicle: booking.vehicle.name,
      pickup,
      dropoff,
      start,
      end,
      coverage: String(coverage),
    })
    window.location.href = `/checkout?${params.toString()}`
  }

  return (
    <>
      <Header compact />
      <main className="booking-page">
        <a className="checkout-back" href="/fleet"><ArrowLeft size={14} /> Back to fleet</a>
        <div className="checkout-heading">
          <div><p className="section-kicker">YOUR TRIP · STEP 1 OF 2</p><h1>Book your vehicle</h1><p>Choose your pickup details and review your reservation.</p></div>
          <span className="secure-label"><ShieldCheck size={14} /> Free cancellation up to 6h before pickup</span>
        </div>
        <div className="booking-layout">
          <form className="booking-form panel-card" onSubmit={continueToCheckout}>
            <section className="form-section">
              <div className="form-section-heading"><span className="step-icon"><MapPin size={16} /></span><div><h2>Pickup &amp; return</h2><p>Choose where and when you need your vehicle.</p></div></div>
              <div className="booking-input-grid">
                <label className="checkout-field"><span>Pickup location</span><input value={pickup} onChange={(event) => setPickup(event.target.value)} required /></label>
                <label className="checkout-field"><span>Return location</span><input value={dropoff} onChange={(event) => setDropoff(event.target.value)} required /></label>
                <label className="checkout-field"><span>Pickup date &amp; time</span><input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} required /></label>
                <label className="checkout-field"><span>Return date &amp; time</span><input type="datetime-local" value={end} min={start || undefined} onChange={(event) => setEnd(event.target.value)} required /></label>
              </div>
            </section>
            <section className="form-section">
              <div className="form-section-heading"><span className="step-icon"><ShieldCheck size={16} /></span><div><h2>Protection for your trip</h2><p>Travel with added peace of mind.</p></div></div>
              <label className="protection-option">
                <input type="checkbox" checked={coverage} onChange={(event) => setCoverage(event.target.checked)} />
                <span className="protection-copy"><strong>Voltigo full protection</strong><small>Roadside help and damage protection, $18 per day</small></span>
                <span className="protection-price">{coverage ? `$${18 * days}` : '$18'}<small>/day</small></span>
              </label>
            </section>
            <button className="button continue-button" type="submit">Continue to checkout <ArrowRight size={15} /></button>
            <p className="checkout-disclaimer"><LockKeyhole size={12} /> You won’t be charged until you review your payment.</p>
          </form>
          <BookingSummary booking={booking} days={days} subtotal={subtotal} protection={protection} total={total} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function BookingSummary({ booking, days, subtotal, protection, total, payment = false }) {
  return (
    <aside className="booking-summary panel-card">
      <h2>{payment ? 'Your reservation' : 'Trip summary'}</h2>
      <div className="summary-vehicle">
        <img src={imageUrl(booking.vehicle.image, 500)} alt={booking.vehicle.name} />
        <span><strong>{booking.vehicle.name}</strong><small>{booking.vehicle.category} · {booking.vehicle.details.split(' · ').slice(0, 2).join(' · ')}</small><span className="summary-rating"><Star size={12} fill="currentColor" /> 4.9 · Unlimited mileage</span></span>
      </div>
      <div className="summary-route">
        <div><span className="route-dot pickup-dot" /><span><small>Pickup</small><strong>{booking.pickup}</strong></span></div>
        <div><span className="route-dot return-dot" /><span><small>Return</small><strong>{booking.dropoff}</strong></span></div>
      </div>
      <div className="summary-dates"><CalendarDays size={15} /><span><strong>{booking.start ? new Date(booking.start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Select pickup date'}</strong><small>{booking.end ? new Date(booking.end).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Select return date'} · {days} {days === 1 ? 'day' : 'days'}</small></span></div>
      <div className="summary-costs"><div><span>${booking.vehicle.price} × {days} {days === 1 ? 'day' : 'days'}</span><strong>${subtotal}</strong></div><div><span>Full protection</span><strong>{protection ? `$${protection}` : 'Declined'}</strong></div><div><span>Delivery</span><strong className="included-label">Included</strong></div></div>
      <div className="summary-total"><span>Total <small>includes taxes &amp; fees</small></span><strong>${total}</strong></div>
      <p className="summary-cancel"><Check size={13} /> Free cancellation up to 6 hours before pickup</p>
    </aside>
  )
}

function CheckoutPage() {
  const booking = getBookingDetails()
  const subtotal = booking.vehicle.price * booking.days
  const protection = booking.coverage ? 18 * booking.days : 0
  const total = subtotal + protection
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [confirmed, setConfirmed] = useState(false)

  function confirmBooking(event) {
    event.preventDefault()
    setConfirmed(true)
  }

  return (
    <>
      <Header compact />
      <main className="booking-page">
        <a className="checkout-back" href={`/book?vehicle=${encodeURIComponent(booking.vehicle.name)}&pickup=${encodeURIComponent(booking.pickup)}&dropoff=${encodeURIComponent(booking.dropoff)}&start=${encodeURIComponent(booking.start)}&end=${encodeURIComponent(booking.end)}&coverage=${booking.coverage}`}><ArrowLeft size={14} /> Back to booking</a>
        <div className="checkout-heading">
          <div><p className="section-kicker">YOUR TRIP · STEP 2 OF 2</p><h1>{confirmed ? 'You’re all set!' : 'Payment checkout'}</h1><p>{confirmed ? 'Your demo reservation is confirmed.' : 'Add your details to complete your reservation.'}</p></div>
          <span className="secure-label"><LockKeyhole size={14} /> Secure checkout</span>
        </div>
        {confirmed ? (
          <section className="confirmation-card panel-card" role="status">
            <span className="confirmation-icon"><Check size={27} /></span>
            <p className="section-kicker">RESERVATION REQUEST RECEIVED</p>
            <h2>Your {booking.vehicle.name} is reserved.</h2>
            <p>This is a checkout demo. No payment was collected. Your trip summary is ready below.</p>
            <div className="confirmation-total"><span>Reservation total</span><strong>${total}</strong></div>
            <a className="button continue-button" href="/">Back to Voltigo <ArrowRight size={15} /></a>
          </section>
        ) : (
          <div className="booking-layout">
            <form className="checkout-form panel-card" onSubmit={confirmBooking}>
              <section className="form-section">
                <div className="form-section-heading"><span className="step-icon"><UserRound size={16} /></span><div><h2>Contact information</h2><p>We’ll send your trip details and pickup instructions here.</p></div></div>
                <div className="booking-input-grid">
                  <label className="checkout-field"><span>Full name</span><input name="name" autoComplete="name" placeholder="Jordan Miles" required /></label>
                  <label className="checkout-field"><span>Email address</span><input type="email" name="email" autoComplete="email" placeholder="jordan@example.com" required /></label>
                  <label className="checkout-field"><span>Phone number</span><input type="tel" name="phone" autoComplete="tel" placeholder="+1 (555) 000-0000" required /></label>
                </div>
              </section>
              <section className="form-section">
                <div className="form-section-heading"><span className="step-icon"><CreditCard size={16} /></span><div><h2>Payment method</h2><p>Choose how you’d like to pay.</p></div></div>
                <div className="payment-methods" role="group" aria-label="Payment method">
                  <button type="button" className={paymentMethod === 'card' ? 'payment-method is-active' : 'payment-method'} aria-pressed={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')}><CreditCard size={16} /> Credit or debit card</button>
                  <button type="button" className={paymentMethod === 'wallet' ? 'payment-method is-active' : 'payment-method'} aria-pressed={paymentMethod === 'wallet'} onClick={() => setPaymentMethod('wallet')}><WalletCards size={16} /> Digital wallet</button>
                </div>
                {paymentMethod === 'card' ? (
                  <div className="payment-fields">
                    <label className="checkout-field"><span>Name on card</span><input name="cardholder" autoComplete="cc-name" placeholder="Jordan Miles" required /></label>
                    <label className="checkout-field"><span>Card number</span><span className="card-input"><CreditCard size={15} /><input name="cardnumber" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" minLength={12} maxLength={23} required /></span></label>
                    <div className="booking-input-grid">
                      <label className="checkout-field"><span>Expiry date</span><input name="expiry" autoComplete="cc-exp" placeholder="MM / YY" required /></label>
                      <label className="checkout-field"><span>Security code</span><input name="cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" minLength={3} maxLength={4} required /></label>
                    </div>
                  </div>
                ) : (
                  <div className="wallet-note"><WalletCards size={18} /><span><strong>Digital wallet selected</strong><small>Wallet processing is available when a payment provider is connected.</small></span></div>
                )}
              </section>
              <p className="demo-payment-note"><LockKeyhole size={13} /> Demo checkout only. Do not enter real payment details; no payment is processed.</p>
              <button className="button continue-button" type="submit">Confirm reservation · ${total} <ArrowRight size={15} /></button>
            </form>
            <BookingSummary booking={booking} days={booking.days} subtotal={subtotal} protection={protection} total={total} payment />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}

function AuthPage({ signup = false }) {
  const [accountType, setAccountType] = useState('Personal / Driver')
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setNotice(signup ? 'Your account details are ready. Connect a registration service to continue.' : 'Your sign-in form is ready to connect to your account.')
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-top"><Logo light /><span className="auth-live"><span className="status-dot" /> 2,400+ vehicles online now</span></div>
        <div className="auth-visual-copy">
          <p className="section-kicker">MOVE AT YOUR OWN PACE</p>
          <h1>{signup ? <>Your next journey<br />starts here.</> : <>Seamless Mobility &amp;<br />Delivery at Your<br />Fingertips</>}</h1>
          <p>Manage bookings, deliveries and fleet in one place.</p>
          <div className="auth-benefits"><span><Clock3 size={14} /> 32 min avg delivery</span><span><ShieldCheck size={14} /> Insured fleet</span><span><Smartphone size={14} /> Phone unlock</span></div>
        </div>
        <div className="auth-visual-foot"><span>© 2026 Voltigo Mobility</span><span>SOC2 · Insured · 24/7 support</span></div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <a className="back-home" href="/"><ArrowRight size={13} /> Back to home</a>
          <span className="auth-symbol"><Zap size={19} fill="currentColor" /></span>
          <h2>{signup ? 'Get Started' : 'Access Your Account'}</h2>
          <p className="auth-subtitle">{signup ? 'Create your rental or fleet account in under 2 minutes.' : 'Manage bookings, deliveries and fleet in one place.'}</p>
          <form onSubmit={handleSubmit}>
            {signup && (
              <>
                <div className="account-switch" role="group" aria-label="Account type">
                  {['Personal / Driver', 'Business / Fleet'].map((type) => <button type="button" key={type} className={accountType === type ? 'active' : ''} aria-pressed={accountType === type} onClick={() => setAccountType(type)}>{type}</button>)}
                </div>
                <AuthField label="Full Name" icon={<UserRound size={14} />} type="text" placeholder="Jordan Miles" autoComplete="name" />
                <div className="auth-field-row">
                  <AuthField label="Driver’s License Number" icon={<ShieldCheck size={14} />} type="text" placeholder="DL-8841-2093" />
                  <AuthField label="Phone Number" icon={<Smartphone size={14} />} type="tel" placeholder="+1 (555) 014-8820" autoComplete="tel" />
                </div>
              </>
            )}
            <AuthField label="Email" icon={<Mail size={14} />} type="email" placeholder="alex@company.com" autoComplete="email" />
            <label className="auth-field">
              <span>{signup ? 'Password' : 'Password'}</span>
              <span className="auth-input"><LockKeyhole size={14} /><input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required /><button className="show-password" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((show) => !show)}>{showPassword ? 'Hide' : 'Show'}</button></span>
            </label>
            {!signup && <div className="auth-options"><label><input type="checkbox" defaultChecked /> Remember Me</label><a href="/login">Forgot Password?</a></div>}
            {signup && <label className="auth-consent"><input type="checkbox" required /> I agree to the <a href="/#support">Terms of Service</a> and Privacy Policy.</label>}
            <button className="button auth-submit" type="submit">{signup ? 'Create Account' : 'Sign In'} <ArrowRight size={14} /></button>
          </form>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <div className="auth-divider"><span>OR SIGN IN WITH</span></div>
          <div className="social-buttons"><button type="button" onClick={() => setNotice('Google sign-in can be connected to your identity provider.')}>◎ <span>Google</span></button><button type="button" onClick={() => setNotice('Apple sign-in can be connected to your identity provider.')}>◉ <span>Apple</span></button></div>
          <p className="auth-switch">{signup ? 'Already registered?' : "Don't have an account?"} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign In' : 'Sign Up'}</a></p>
        </div>
        {signup && <aside className="signup-benefits"><div><Zap size={17} /><strong>Your ride is unlocked by phone</strong><span>No lines. Clean pickup. Full tank before you arrive.</span></div></aside>}
      </section>
    </main>
  )
}

function AuthField({ label, icon, type, placeholder, autoComplete }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-input">{icon}<input type={type} placeholder={placeholder} autoComplete={autoComplete} required /></span>
    </label>
  )
}

function ReviewsSection() {
  const reviews = [
    { quote: '“Van arrived in 28 minutes, driver helped load everything. Check-in took one option downtown.”', name: 'Maya Chen', role: 'Frequent renter' },
    { quote: '“Booked a sedan for a month for sales calls. Swapped to an SUV mid-plan in one tap.”', name: 'Daniel Okafor', role: 'Small business' },
    { quote: '“We run 5 vans through Voltigo Fleet. Billing, mileage and drivers in one dashboard.”', name: 'Sofia Ramirez', role: 'Operations, Bloom & Co.' },
  ]

  return (
    <section className="reviews-section">
      <div className="reviews-heading"><h2>Loved by locals &amp; businesses</h2><span><Star size={13} fill="currentColor" /> 4.9/5 from 3,200+ reviews</span></div>
      <div className="review-grid">{reviews.map((review) => <article className="review-card" key={review.name}><div className="review-stars" aria-label="5 out of 5 stars">★★★★★ <span>5.0</span></div><p>{review.quote}</p><div className="review-person"><span className="review-avatar">{review.name[0]}</span><span><strong>{review.name}</strong><small>{review.role}</small></span><Check size={13} /></div></article>)}</div>
    </section>
  )
}

function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(event) {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer className="site-footer" id="support">
      <div className="footer-about"><Logo /><p>Local rental + logistics. Cars, vans and drivers on demand.</p><small>© 2026 Voltigo Mobility Inc.</small></div>
      <div className="footer-links"><strong>Fleet</strong><a href="/fleet">Sedans</a><a href="/fleet">SUVs</a><a href="/fleet">Cargo Vans</a><a href="/fleet">Long-Term</a></div>
      <div className="footer-links"><strong>Services</strong><a href="/fleet">Doorstep delivery</a><a href="/fleet">Airport pickup</a><a href="/fleet">Business fleet</a><a href="/fleet">Moving help</a></div>
      <div className="footer-links"><strong>Company</strong><a href="/#locations">Locations</a><a href="/#support">Pricing</a><a href="/#support">Careers</a><a href="/#support">Support</a></div>
      <form className="newsletter" onSubmit={handleSubscribe}><label htmlFor="newsletter-email">Get fleet updates</label><div><input id="newsletter-email" type="email" placeholder="Email" required /><button type="submit">{subscribed ? <Check size={14} /> : 'Join'}</button></div>{subscribed && <small role="status">Thanks for subscribing.</small>}</form>
    </footer>
  )
}

function NavigationIcon() {
  return <MapPin size={14} />
}

export default function RentalApp() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/login' || path === '/signin') return <AuthPage />
  if (path === '/signup' || path === '/register') return <AuthPage signup />
  if (path === '/fleet') return <FleetPage />
  if (path === '/book') return <BookingPage />
  if (path === '/checkout') return <CheckoutPage />
  return <HomePage />
}
