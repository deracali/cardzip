import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  Fish,
  Gift,
  IceCreamBowl,
  Leaf,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Pizza,
  Plus,
  Salad,
  Search,
  ShoppingBag,
  ShoppingCart,
  Soup,
  Star,
  UserRound,
  Utensils,
  X,
} from 'lucide-react'
import { AdminDashboard, ClientDashboard } from './pages/AccountPortals'
import { createDemoOrder, createFoodSession, getFoodSession } from './services/demoStore'
import './FoodApp.css'

const image = (id, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

const dishes = [
  { id: 'burger', name: 'Smoky Truffle Burger', restaurant: 'Burger Barn · American', price: 14.99, rating: '4.8', category: 'Burgers', time: '20–30 min', badge: '20% OFF', photo: 'photo-1568901346375-23c9450c58cd', description: 'Smoked cheddar, truffle aioli, crisp lettuce and our house brioche.' },
  { id: 'sushi', name: 'Salmon Sushi Set (16 pc)', restaurant: 'Tokyo House · Japanese', price: 22.50, rating: '4.9', category: 'Sushi', time: '25–35 min', badge: '', photo: 'photo-1579871494447-9811cf80d66c', description: 'Fresh salmon nigiri and signature rolls with ginger and wasabi.' },
  { id: 'pizza', name: 'Margherita Artigianale', restaurant: 'Forno Antico · Italian', price: 13.99, rating: '4.7', category: 'Pizza', time: '15–25 min', badge: 'Popular', photo: 'photo-1574071318508-1cdbab80d002', description: 'San Marzano tomato, fior di latte, basil and extra virgin olive oil.' },
  { id: 'bowl', name: 'Rainbow Buddha Bowl', restaurant: 'Verdant · Healthy', price: 11.49, rating: '4.8', category: 'Healthy', time: '10–20 min', badge: '', photo: 'photo-1512621776951-a57141f2eefd', description: 'Quinoa, avocado, roasted vegetables, chickpeas and lemon tahini.' },
  { id: 'curry', name: 'Butter Chicken + Naan', restaurant: 'Spice Route · Indian', price: 15.99, rating: '4.9', category: 'Asian', time: '25–35 min', badge: '', photo: 'photo-1603894584373-5ac82b2ae398', description: 'Slow-simmered tomato curry with warm garlic naan.' },
  { id: 'cake', name: 'Molten Lava Cake', restaurant: 'Sugar Rush · Desserts', price: 7.99, rating: '4.8', category: 'Desserts', time: '15–20 min', badge: 'Bestseller', photo: 'photo-1606313564200-e75d5e30476c', description: 'Warm dark chocolate cake with a gooey center and vanilla cream.' },
  { id: 'shrimp', name: 'Shrimp Pad Thai', restaurant: 'Bangkok Nights · Thai', price: 13.49, rating: '4.6', category: 'Asian', time: '20–30 min', badge: '', photo: 'photo-1559314809-0d155014e29e', description: 'Rice noodles, wok-fried shrimp, peanuts, lime and fresh bean sprouts.' },
  { id: 'tacos', name: 'Baja Chicken Tacos (3)', restaurant: 'Casa Lola · Mexican', price: 10.99, rating: '4.7', category: 'Asian', time: '15–25 min', badge: '', photo: 'photo-1551504734-5ee1c4a1479b', description: 'Grilled chicken, avocado crema, cabbage and pico de gallo.' },
]

const categories = [
  { name: 'Pizza', count: '120+ spots', Icon: Pizza },
  { name: 'Burgers', count: '98 spots', Icon: Utensils },
  { name: 'Sushi', count: '64 spots', Icon: Fish },
  { name: 'Asian', count: '142 spots', Icon: Soup },
  { name: 'Desserts', count: '86 spots', Icon: IceCreamBowl },
  { name: 'Healthy', count: '74 spots', Icon: Salad },
]

const menuDishes = [
  { ...dishes[2], category: 'Main Courses' },
  { ...dishes[2], id: 'truffle-pasta', name: 'Truffle Tagliatelle', price: 19.50, badge: 'Spicy', photo: 'photo-1473093295043-cdd812d0e601', description: 'Hand-cut pasta, black truffle cream, 24-month parmesan shavings.' },
  { ...dishes[4], id: 'lasagna', name: "Nonna’s Lasagna", price: 16.99, description: 'Slow-braised ragù, béchamel, grand padano crust.' },
  { ...dishes[4], id: 'salmon', name: 'Grilled Salmon Limone', price: 21.99, badge: 'Gluten-Free', description: 'Fresh salmon, charred lemon, herbs and grilled asparagus.' },
  { ...dishes[2], id: 'eggplant', name: 'Eggplant Parmigiana', price: 14.50, badge: 'Vegan', description: 'Slow-roasted eggplant, house marinara and basil.' },
  { ...dishes[2], id: 'diavola', name: 'Diavola + Hot Honey', price: 15.99, description: 'Spicy salami, calabrian chili, hot honey drizzle, mozzarella.' },
]

function findDish(id) {
  return menuDishes.find((dish) => dish.id === id) || dishes.find((dish) => dish.id === id)
}

function Logo() {
  return <a className="food-logo" href="/" aria-label="Sizzle and Smile home"><span><Utensils size={16} /></span><strong>Sizzle<span>&</span>Smile</strong></a>
}

function getActiveSection() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/delivery') return 'delivery'
  if (path === '/deals') return 'deals'
  if (path === '/reserve') return 'reserve'
  if (path === '/track' || path === '/checkout') return 'delivery'
  if (window.location.hash === '#deals') return 'deals'
  if (window.location.hash === '#featured') return 'delivery'
  return path === '/' || path === '/restaurant' ? 'menu' : ''
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [count, setCount] = useState(() => Object.values(getCart()).reduce((sum, qty) => sum + qty, 0))
  const [activeSection, setActiveSection] = useState(getActiveSection)
  const [session] = useState(getFoodSession)

  useEffect(() => {
    const refreshCartCount = () => setCount(Object.values(getCart()).reduce((sum, qty) => sum + qty, 0))
    const updateActiveSection = () => setActiveSection(getActiveSection())
    window.addEventListener('food-cart-change', refreshCartCount)
    window.addEventListener('hashchange', updateActiveSection)
    return () => {
      window.removeEventListener('food-cart-change', refreshCartCount)
      window.removeEventListener('hashchange', updateActiveSection)
    }
  }, [])

  return (
    <header className="food-header">
      <div className="food-header-inner">
        <Logo />
        <button className="mobile-menu" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        <nav className={menuOpen ? 'food-nav is-open' : 'food-nav'} aria-label="Main navigation">
          <a className={activeSection === 'menu' ? 'active' : ''} aria-current={activeSection === 'menu' ? 'page' : undefined} href="/">Menu</a>
          <a className={activeSection === 'reserve' ? 'active' : ''} aria-current={activeSection === 'reserve' ? 'page' : undefined} href="/reserve">Reserve Table</a>
          <a className={activeSection === 'delivery' ? 'active' : ''} aria-current={activeSection === 'delivery' ? 'page' : undefined} href="/delivery">Delivery</a>
          <a className={activeSection === 'deals' ? 'active' : ''} aria-current={activeSection === 'deals' ? 'page' : undefined} href="/deals">Deals</a>
          <div className="food-nav-actions">
            <a className="location-select" href="/#location"><MapPin size={12} /> Greenwich Ave, NYC <ChevronDown size={11} /></a>
            <a className="cart-link" href="/restaurant" aria-label={`Cart, ${count} items`}><ShoppingCart size={15} />{count > 0 && <span>{count}</span>}</a>
            <a className="sign-in-button" href={session?.user?.role === 'client' ? '/dashboard' : '/login'}>
              {session?.user?.role === 'client' ? 'My account' : session?.user?.role === 'admin' ? 'Customer account' : 'Sign In'}
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('sizzle-cart') || '{}')
  } catch {
    return {}
  }
}

function updateCart(id, amount) {
  const cart = getCart()
  const next = { ...cart, [id]: Math.max(0, (cart[id] || 0) + amount) }
  if (!next[id]) delete next[id]
  localStorage.setItem('sizzle-cart', JSON.stringify(next))
  window.dispatchEvent(new Event('food-cart-change'))
  return next
}

function DishCard({ dish, cart, setCart }) {
  const qty = cart[dish.id] || 0
  const addOne = () => setCart(updateCart(dish.id, 1))

  return (
    <article className="dish-card">
      <a className="dish-image" href="/restaurant">
        <img src={image(dish.photo, 700)} alt={dish.name} loading="lazy" />
        <span className="dish-time"><Clock3 size={11} /> {dish.time}</span>
        {dish.badge && <span className="dish-badge">{dish.badge}</span>}
      </a>
      <div className="dish-info">
        <div className="dish-title-row"><h3>{dish.name}</h3><span className="dish-rating"><Star size={11} fill="currentColor" /> {dish.rating}</span></div>
        <p>{dish.restaurant}</p>
        <div className="dish-buy-row"><strong>${dish.price.toFixed(2)}</strong>
          {qty ? <div className="qty-control"><button aria-label={`Remove one ${dish.name}`} type="button" onClick={() => setCart(updateCart(dish.id, -1))}><Minus size={13} /></button><span>{qty}</span><button aria-label={`Add one ${dish.name}`} type="button" onClick={addOne}><Plus size={13} /></button></div> : <button className="add-button" type="button" onClick={addOne}><Plus size={13} /> Add to Cart</button>}
        </div>
      </div>
    </article>
  )
}

function HomePage() {
  const [category, setCategory] = useState('All')
  const [dishFilter, setDishFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState(getCart)
  const featured = dishes.filter((dish) => {
    const matchesCategory = category === 'All' || dish.category === category
    const matchesSearch = `${dish.name} ${dish.restaurant} ${dish.category}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = dishFilter === 'All'
      || (dishFilter === 'Offers' && dish.badge)
      || (dishFilter === 'Top rated' && Number(dish.rating) >= 4.8)
      || (dishFilter === 'Under $15' && dish.price < 15)
    return matchesCategory && matchesSearch && matchesFilter
  })

  return (
    <>
      <Header />
      <main className="food-main">
        <section className="food-hero">
          <div className="food-hero-copy">
            <span className="promo-pill"><Bike size={13} /> FREE DELIVERY ON FIRST 3 ORDERS</span>
            <h1>Delicious Food<br />Delivered Fast to<br />Your Doorstep</h1>
            <p>Craving pizza, sushi or a healthy bowl? Order from 2,400+ top-rated restaurants and get it hot in under 30 minutes.</p>
            <form className="food-search" onSubmit={(event) => { event.preventDefault(); document.querySelector('#featured')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <div className="order-mode"><button type="button" className="selected"><Bike size={12} /> Delivery</button><button type="button"><ShoppingBag size={12} /> Pickup</button></div>
              <div className="search-row"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes or cuisines..." aria-label="Search dishes or cuisines" /><button type="submit">Search</button></div>
            </form>
            <div className="food-proof"><span>★★★★★</span><strong>48k+ happy foodies</strong><i /> 4.9 rating</div>
          </div>
          <div className="food-hero-photo">
            <img src={image('photo-1579751626657-72bc17010498', 1400)} alt="A table filled with pizza, burgers and sides" />
            <div className="hero-restaurant-badge"><span><Star size={12} fill="currentColor" /> 4.8 · $12.99</span><strong>Pepperoni Blast</strong></div>
            <div className="hero-delivery-badge"><span><Clock3 size={15} /></span><strong>25 min avg<small>Superfast delivery</small></strong></div>
          </div>
        </section>
        <section className="category-section">
          <div className="section-title-row"><div><h2>What are you craving?</h2><p>Explore the neighborhood’s favorites</p></div><a href="#featured">View all <ArrowRight size={13} /></a></div>
          <div className="category-list">
            {categories.map(({ name, count, Icon }) => <button key={name} type="button" className={category === name ? 'category-item selected' : 'category-item'} onClick={() => setCategory(category === name ? 'All' : name)}><span className="category-icon"><Icon size={20} /></span><strong>{name}</strong><small>{count}</small></button>)}
          </div>
        </section>
        <section className="featured-section" id="featured">
          <div className="section-title-row featured-title"><div><h2>Featured dishes near you</h2><p>Handpicked by 12k local reviews this week</p></div><div className="filter-pills">{['All', 'Offers', 'Top rated', 'Under $15'].map((filter) => <button key={filter} type="button" className={dishFilter === filter ? 'active' : ''} aria-pressed={dishFilter === filter} onClick={() => setDishFilter(filter)}>{filter}</button>)}</div></div>
          <div className="dish-grid">{featured.length ? featured.map((dish) => <DishCard key={dish.id} dish={dish} cart={cart} setCart={setCart} />) : <p className="empty-search">No dishes match your search. Try another dish or cuisine.</p>}</div>
        </section>
        <section className="reservation-promo" id="deals">
          <div className="reservation-copy"><span className="reservation-kicker">DINE-IN · PARTIES · DATE NIGHTS</span><h2>Planning a Visit? Book Your Table Online in Seconds</h2><p>Skip the waitlist. Real-time availability from 400+ partner restaurants, instant confirmation guaranteed.</p><div><a className="button red-button" href="/reserve">Reserve Now <ArrowRight size={14} /></a><a className="button outline-button" href="/restaurant">Explore restaurants</a></div><small>✓ No prepayment ✓ Free cancellation ✓ Instant SMS confirmation</small></div>
          <div className="reservation-photo"><img src={image('photo-1414235077428-338989a2e8c0', 900)} alt="Warm candlelit restaurant ready for dinner" /><div className="table-availability"><span><strong>Forno Antico</strong> — Tonight, 7:30 PM<small>★ 4 tables left</small></span><b>Available</b></div></div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function DeliveryPage() {
  return (
    <>
      <Header />
      <main className="food-main info-page">
        <section className="info-hero">
          <div className="info-hero-copy">
            <span className="promo-pill"><Bike size={13} /> DELIVERY THAT FITS YOUR DAY</span>
            <h1>Good food, right to your door.</h1>
            <p>Browse neighborhood favorites, place a demo order, and follow each step from kitchen to doorstep.</p>
            <div className="info-actions">
              <a className="button red-button" href="/">Browse the menu <ArrowRight size={14} /></a>
              <a className="button outline-button" href="/track">Track a delivery</a>
            </div>
          </div>
          <img src={image('photo-1526367790999-0150786686a2', 1000)} alt="A courier delivering a restaurant meal" />
        </section>
        <section className="info-section">
          <div className="section-title-row"><div><span className="reservation-kicker">SIMPLE FROM START TO FINISH</span><h2>How delivery works</h2></div></div>
          <div className="info-card-grid">
            <article className="info-card"><span>01</span><h3>Choose your meal</h3><p>Explore local menus and add your favorites to the cart.</p></article>
            <article className="info-card"><span>02</span><h3>Set delivery details</h3><p>Add an address and instructions at checkout. No payment details are requested in this demo.</p></article>
            <article className="info-card"><span>03</span><h3>Follow your order</h3><p>See a sample delivery status on the tracking page.</p></article>
          </div>
        </section>
        <section className="info-callout"><div><span className="reservation-kicker">NEARBY AND READY</span><h2>Fresh meals around Greenwich Village</h2><p>Most sample orders arrive in about 25–35 minutes. Availability and delivery times shown here are for preview purposes.</p></div><a className="button red-button" href="/restaurant">Start an order <ArrowRight size={14} /></a></section>
      </main>
      <Footer />
    </>
  )
}

function DealsPage() {
  const [cart, setCart] = useState(getCart)
  const dealDishes = [dishes[0], dishes[2], dishes[5], dishes[7]]

  return (
    <>
      <Header />
      <main className="food-main info-page">
        <section className="info-page-heading">
          <span className="promo-pill"><Gift size={13} /> FRESH OFFERS</span>
          <h1>Good food. Better deals.</h1>
          <p>Explore sample offers from Sizzle&Smile. This Vite preview keeps carts and orders in your browser only.</p>
        </section>
        <section className="deal-offer-grid" aria-label="Current offers">
          <article className="deal-offer deal-offer-red"><span>FIRST THREE ORDERS</span><h2>Delivery is on us</h2><p>Try a neighborhood favorite with free delivery on your first three demo orders.</p><a href="/delivery">See delivery details <ArrowRight size={13} /></a></article>
          <article className="deal-offer"><span>SELECTED FAVORITES</span><h2>Save on a best seller</h2><p>Find highlighted dishes and add them straight to your cart.</p><a href="#deal-dishes">Browse featured deals <ArrowRight size={13} /></a></article>
          <article className="deal-offer"><span>WEEKEND TREAT</span><h2>Dessert makes it better</h2><p>Finish your meal with a sweet favorite from Sugar Rush.</p><a href="/restaurant">Explore the restaurant menu <ArrowRight size={13} /></a></article>
        </section>
        <section id="deal-dishes" className="featured-section info-deal-dishes">
          <div className="section-title-row"><div><span className="reservation-kicker">HANDPICKED FOR YOU</span><h2>Featured dishes</h2><p>Choose an item to add it to your local demo cart.</p></div></div>
          <div className="dish-grid">{dealDishes.map((dish) => <DishCard key={dish.id} dish={dish} cart={cart} setCart={setCart} />)}</div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function RestaurantPage() {
  const [activeCategory, setActiveCategory] = useState('Starters')
  const [vegOnly, setVegOnly] = useState(false)
  const [cart, setCart] = useState(getCart)
  const [promo, setPromo] = useState('')
  const [applied, setApplied] = useState(false)
  const items = Object.entries(cart).reduce((sum, [id, qty]) => {
    const dish = findDish(id)
    return sum + (dish ? dish.price * qty : 0)
  }, 0)
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const discount = applied ? items * 0.1 : 0
  const total = items + (count ? 1.99 : 0) - discount

  return (
    <>
      <Header />
      <main className="restaurant-page food-main">
        <section className="restaurant-cover"><img src={image('photo-1414235077428-338989a2e8c0', 1400)} alt="Inside Forno Antico Trattoria" /><div><h1>Forno Antico Trattoria</h1><p>Italian · Pizza · Pasta · $$$ · Greenwich Village</p></div><div className="restaurant-stats"><span><Star size={13} fill="currentColor" /> 4.8 <small>2.1k reviews</small></span><span>25–35 min <small>Delivery time</small></span><span>Open till 11 PM <small>Today</small></span></div></section>
        <nav className="menu-categories" aria-label="Menu categories">{['Starters', 'Main Courses', 'Chef Specials', 'Drinks', 'Desserts'].map((item) => <button type="button" key={item} className={activeCategory === item ? 'active' : ''} onClick={() => setActiveCategory(item)}>{item}</button>)}<label><Leaf size={13} /><span>Veg only</span><input type="checkbox" checked={vegOnly} onChange={(event) => setVegOnly(event.target.checked)} /></label></nav>
        <div className="restaurant-layout">
          <div className="menu-area"><h2>{activeCategory} <span>🔥</span></h2><div className="menu-grid">{menuDishes.map((dish) => <MenuDish key={dish.id} dish={dish} cart={cart} setCart={setCart} vegOnly={vegOnly} />)}</div></div>
          <aside className="cart-panel">
            <div className="cart-heading"><h2>Your Cart ({count})</h2><button type="button" onClick={() => { localStorage.removeItem('sizzle-cart'); setCart({}); window.dispatchEvent(new Event('food-cart-change')) }}>Clear all</button></div>
            {count === 0 ? <div className="cart-empty"><ShoppingBag size={24} /><strong>Your cart is empty</strong><span>Add something delicious to get started.</span></div> : <div className="cart-items">{Object.entries(cart).map(([id, qty]) => { const dish = findDish(id); if (!dish) return null; return <div className="cart-item" key={id}><img src={image(dish.photo, 120)} alt="" /><span><strong>{dish.name}</strong><small>${(dish.price * qty).toFixed(2)}</small></span><div className="qty-control"><button type="button" aria-label={`Remove one ${dish.name}`} onClick={() => setCart(updateCart(id, -1))}><Minus size={11} /></button><span>{qty}</span><button type="button" aria-label={`Add one ${dish.name}`} onClick={() => setCart(updateCart(id, 1))}><Plus size={11} /></button></div></div> })}</div>}
            <form className="promo-code" onSubmit={(event) => { event.preventDefault(); if (promo.trim()) setApplied(true) }}><Gift size={13} /><input placeholder="Promo code" value={promo} onChange={(event) => setPromo(event.target.value)} aria-label="Promo code" /><button type="submit">{applied ? 'Applied' : 'Apply'}</button></form>
            {applied && <p className="discount-message"><Check size={12} /> SAVED 10% — you save ${discount.toFixed(2)}</p>}
            <div className="cart-totals"><span>Subtotal<strong>${items.toFixed(2)}</strong></span><span>Delivery fee<strong>{count ? '$1.99' : '$0.00'}</strong></span>{applied && <span>Discount<strong>-${discount.toFixed(2)}</strong></span>}<span className="cart-total">Total<strong>${total.toFixed(2)}</strong></span></div>
            <a className={count ? 'button checkout-button' : 'button checkout-button disabled'} href={count ? '/checkout' : undefined} aria-disabled={!count}><LockKeyhole size={13} /> Proceed to Checkout</a>
            <p className="delivery-note">Free delivery over $25 · Arrives in ~30 min</p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}

function MenuDish({ dish, cart, setCart, vegOnly }) {
  const qty = cart[dish.id] || 0
  if (vegOnly && !['Margherita Artigianale', 'Truffle Tagliatelle', 'Eggplant Parmigiana'].includes(dish.name)) return null
  return <article className="menu-dish"><img src={image(dish.photo, 280)} alt={dish.name} loading="lazy" /><div><h3>{dish.name}</h3>{dish.badge && <span className={dish.badge === 'Vegan' ? 'menu-tag vegan-tag' : 'menu-tag'}>{dish.badge}</span>}<p>{dish.description}</p><strong>${dish.price.toFixed(2)}</strong></div>{qty ? <div className="qty-control"><button type="button" aria-label={`Remove one ${dish.name}`} onClick={() => setCart(updateCart(dish.id, -1))}><Minus size={12} /></button><span>{qty}</span><button type="button" aria-label={`Add one ${dish.name}`} onClick={() => setCart(updateCart(dish.id, 1))}><Plus size={12} /></button></div> : <button className="add-button compact-add" type="button" onClick={() => setCart(updateCart(dish.id, 1))}><Plus size={12} /> Add</button>}</article>
}

function ReservePage() {
  const [guests, setGuests] = useState('4 Guests')
  const [time, setTime] = useState('7:00 PM')
  const [date, setDate] = useState('2026-11-01')
  const [seating, setSeating] = useState('Patio')
  const [confirmed, setConfirmed] = useState(false)
  const reservationDate = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  return (
    <>
      <Header />
      <main className="reserve-page food-main">
        <div className="reserve-intro"><span className="eyebrow-red">• FORNO ANTICO · GREENWICH VILLAGE</span><h1>{confirmed ? 'Reservation confirmed!' : 'Book a Table'}</h1><p>Reserve your spot for dining, parties, or special events — instant confirmation.</p></div>
        {confirmed ? <section className="reservation-success"><span><Check size={26} /></span><h2>Your table is waiting!</h2><p>{guests} · {time} · {seating}</p><a className="button red-button" href="/">Back to Sizzle&Smile</a></section> :                 <div className="reserve-layout"><form id="reserve-form" className="reserve-form" onSubmit={(event) => { event.preventDefault(); setConfirmed(true) }}><section className="reserve-box"><h2><UserRound size={15} /> Choose date &amp; party</h2><div className="reserve-pair"><label>Number of Guests<select value={guests} onChange={(event) => setGuests(event.target.value)}>{['1 Guest', '2 Guests', '3 Guests', '4 Guests', '5 Guests', '6 Guests', '7+ Guests'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label></div><strong className="input-caption">Available Time Slots</strong><div className="time-slots">{['5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'].map((value) => <button key={value} type="button" className={time === value ? 'selected' : ''} onClick={() => setTime(value)}>{value}</button>)}</div><strong className="input-caption">Seating Preference</strong><div className="seating-options">{[['Indoor', 'Cozy main hall'], ['Patio', 'Heated + fairy lights'], ['Bar', 'Quick bites & cocktails']].map(([value, detail]) => <button type="button" key={value} className={seating === value ? 'selected' : ''} onClick={() => setSeating(value)}><strong>{value}</strong><small>{detail}</small></button>)}</div></section><section className="reserve-box"><h2><UserRound size={15} /> Your details</h2><div className="reserve-pair"><label>Full Name<input placeholder="Sofia Martinez" autoComplete="name" required /></label><label>Phone Number<input placeholder="+1 (212) 555-0148" autoComplete="tel" required /></label></div><label>Email<input type="email" placeholder="sofia@email.com" autoComplete="email" required /></label><label>Special Requests <small>(optional)</small><textarea placeholder="Anniversary table by the window, one high chair needed..." rows="3" /></label><button className="button red-button confirm-table" type="submit">Confirm Reservation <ArrowRight size={14} /></button></section></form><aside className="reservation-summary"><img src={image('photo-1414235077428-338989a2e8c0', 600)} alt="Forno Antico candlelit dining room" /><div className="reservation-summary-body"><h2>Forno Antico Trattoria</h2><p><UserRound size={13} /> {guests} · {seating}</p><p><CalendarDays size={13} /> {reservationDate}</p><p><Clock3 size={13} /> {time} · ~90 min</p><span className="instant-confirm"><Check size={12} /> Instant confirmation guaranteed by SMS + email</span><button className="button red-button" type="submit" form="reserve-form">Confirm Reservation</button><small>Free cancellation up to 2h before · No card required</small></div></aside></div>}
      </main><Footer />
    </>
  )
}

function TrackingPage() {
  const [recenter, setRecenter] = useState(false)
  return <><Header /><main className="tracking-page food-main"><section className="tracking-heading"><div><span className="order-id">ORDER ID #FD-9842 · FORNO ANTICO</span><h1>Arriving in 18 mins</h1><p>Estimated arrival 7:42 PM · Hot &amp; fresh guaranteed</p></div><div className="countdown"><strong>18:24</strong><small>MIN:SEC</small></div></section><div className="tracking-layout"><section className="map-panel" aria-label="Live delivery map"><div className="map-grid" /><div className="map-label restaurant-map-label"><span>🍕</span> Forno Antico<small>Picked up 7:12 PM</small></div><span className="gps-label"><span /> Live GPS · Updated 5s ago</span><svg className="map-route" viewBox="0 0 600 320" preserveAspectRatio="none" aria-hidden="true"><path d="M75 220 C160 220 170 110 275 130 S380 240 465 220" /><circle cx="75" cy="220" r="8" /><circle cx="465" cy="220" r="8" /></svg><button className="courier-map-pin" type="button" onClick={() => setRecenter((value) => !value)}><Bike size={14} /> {recenter ? 'Centered on courier' : 'Marcus is here'}</button><div className="map-legend"><span><i /> Restaurant</span><span><i /> Driver route (1.2 mi left)</span><button type="button" onClick={() => setRecenter(true)}><MapPin size={12} /> Recenter</button></div></section><aside className="tracking-sidebar"><section className="courier-card"><span className="sidebar-kicker">YOUR COURIER</span><div className="courier-info"><span className="courier-avatar">M</span><span><strong>Marcus Rivera</strong><small>Honda CR 150R · NY-4821 · ⭐ 4.9 (2.3k)</small></span><i /></div><div className="courier-actions"><a href="tel:+12125550148"><Phone size={12} /> Call Driver</a><a href="sms:+12125550148"><Mail size={12} /> Message</a></div></section><section className="order-details"><h2>Order details</h2><p>2x Margherita Artigianale<strong>$27.98</strong></p><p>1x Nonna’s Lasagna<strong>$16.99</strong></p><p>1x Tiramisu Classico<strong>$6.50</strong><span>Subtotal<strong>$51.47</strong></span><span>Delivery<strong>Free</strong></span></p><div className="order-total"><span>Total<strong>$51.47</strong></span><small><MapPin size={12} /> Delivering to 128 Greenwich Ave, Apt 4B — Ring twice, please leave at door if no answer.</small></div></section><a className="need-help" href="/#support">Need help with this order?</a></aside></div></main><Footer /></>
}

function AuthPage({ signup = false, expectedRole = 'client' }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const adminLogin = expectedRole === 'admin'

  function submit(event) {
    event.preventDefault()
    setNotice('')
    const form = Object.fromEntries(new FormData(event.currentTarget))
    try {
      createFoodSession({
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: expectedRole,
      })
      const requestedPath = new URLSearchParams(window.location.search).get('next')
      const adminPath = requestedPath?.startsWith('/admin')
      const allowedPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
        && (expectedRole === 'admin' ? adminPath : !adminPath)
      window.location.replace(signup ? '/dashboard' : allowedPath ? requestedPath : adminLogin ? '/admin' : '/dashboard')
    } catch (error) {
      setNotice(error.message)
    }
  }

  return <main className={`auth-page${signup ? ' signup-auth' : ''}`}><section className="auth-image" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.7),transparent 65%),url("${image(signup ? 'photo-1568901346375-23c9450c58cd' : 'photo-1574071318508-1cdbab80d002', 1200)}")` }}><Logo /><div><h1>{signup ? 'Hot Meals. Cool Rewards.' : adminLogin ? 'Run the Restaurant.' : 'Satisfy Your Cravings.'}<br />{signup ? 'Zero Hassle Sign-Up.' : adminLogin ? 'Everything in One Place.' : 'Quick Orders & Exclusive Rewards.'}</h1><p>20-min express checkout  Members save 20% weekly  Free dessert Fridays</p></div></section><section className="auth-form-side"><form className="food-auth-form" onSubmit={submit}><a className="checkout-back" href="/"><ArrowLeft size={14} /> Back to menu</a><h2>{signup ? 'Create Your Account' : adminLogin ? 'Administrator Sign In' : 'Welcome Back'}</h2><p>{signup ? 'Join 48k+ foodies getting hot meals in minutes.' : adminLogin ? 'Enter any email and password to open the local demo workspace.' : 'Enter any email and password to open your local demo account.'}</p><p className="demo-notice">Vite preview only: demo sessions stay in this browser and are not secure authentication.</p>{signup && <label>Full Name<input name="name" placeholder="Sofia Martinez" autoComplete="name" required /></label>}<label>Email Address<input name="email" type="email" placeholder="Sofia@example.com" autoComplete="email" required /></label>{signup && <label>Phone Number<input name="phone" type="tel" placeholder="+1 (212) 555-0148" autoComplete="tel" /></label>}<label>Password<span className="auth-password"><input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••••" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span></label>{signup ? <label className="marketing-opt"><input type="checkbox" /> Send me discount codes &amp; promotions (up to 30% off weekly)</label> : !adminLogin && <div className="remember-row"><label><input type="checkbox" defaultChecked /> Remember Me</label><a href="/login">Forgot Password?</a></div>}<button className="button red-button auth-submit" type="submit">{signup ? 'Create Account' : 'Sign In'} <ArrowRight size={14} /></button>{notice && <p className="auth-notice" role="alert">{notice}</p>}{!adminLogin && <><div className="auth-divider"><span>OR CONTINUE WITH</span></div><div className="social-signin"><button type="button">◎ Google</button><button type="button">◉ Apple</button></div><p className="auth-switch">{signup ? 'Already registered?' : "Don't have an account?"} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign In' : 'Sign Up'}</a></p></>}{adminLogin && <p className="auth-switch">Customer? <a href="/login">Sign in to your account</a></p>}</form></section></main>
}

function Footer() {
  return <footer className="food-footer" id="support"><div className="food-footer-main"><div className="footer-brand"><Logo /><p>Hot food, fast delivery, a happy belly.<br />2,400+ restaurants in your neighborhood.</p><div className="social-links"><a href="#instagram">◎</a><a href="#twitter">𝕏</a><a href="#facebook">f</a></div></div><div><strong>Company</strong><a href="#about">About Us</a><a href="#careers">Careers</a><a href="#partners">Partner with us</a><a href="#press">Press</a></div><div><strong>Support</strong><a href="/delivery">Delivery</a><a href="/deals">Deals</a><a href="#help">Help center</a><a href="/track">Track order</a></div><div><strong>Legal</strong><a href="#terms">Terms</a><a href="#privacy">Privacy</a><a href="#cookies">Cookies</a><a href="/admin/login">Admin portal</a></div></div><div className="footer-bottom">© 2026 Sizzle&Smile Foods Inc. Made fresh daily.</div></footer>
}

function CheckoutPage() {
  const cart = getCart()
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const total = Object.entries(cart).reduce((sum, [id, qty]) => sum + (findDish(id)?.price || 0) * qty, 1.99)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  function placeOrder(event) {
    event.preventDefault()
    const session = getFoodSession()
    if (!session?.token || session.user?.role !== 'client') {
      window.location.assign('/login?next=%2Fcheckout')
      return
    }
    if (!count) {
      setError('Add at least one menu item before placing an order.')
      return
    }
    setError('')
    const form = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const order = createDemoOrder({
        user: session.user,
        items: Object.entries(cart).map(([dishId, quantity]) => {
          const dish = findDish(dishId)
          return dish ? { dishId, name: dish.name, quantity, unitPrice: dish.price } : null
        }).filter(Boolean),
        address: form.address,
        phone: form.phone,
        instructions: form.instructions,
      })
      setOrderId(order.id)
      setDone(true)
      localStorage.removeItem('sizzle-cart')
      window.dispatchEvent(new Event('food-cart-change'))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return <><Header /><main className="checkout-page food-main"><a className="checkout-back" href="/restaurant"><ArrowLeft size={14} /> Back to your cart</a>{done ? <section className="reservation-success"><span><Check size={26} /></span><h1>Demo order received!</h1><p>Order {orderId} is saved to your client dashboard. No payment was collected.</p><a className="button red-button" href="/dashboard">View your orders <ArrowRight size={14} /></a></section> : <div className="checkout-layout"><form className="reserve-form" onSubmit={placeOrder}><section className="reserve-box"><h2><MapPin size={15} /> Delivery details</h2><label>Delivery address<input name="address" placeholder="128 Greenwich Ave, Apt 4B, New York" required /></label><label>Phone number<input name="phone" type="tel" placeholder="+1 (212) 555-0148" required /></label><label>Delivery instructions<textarea name="instructions" rows="2" placeholder="Ring twice, leave at door..." /></label><p className="demo-notice"><LockKeyhole size={13} /> Demo order only. Payment details are not requested or collected.</p><button className="button red-button confirm-table" type="submit" disabled={!count}>{`Place demo order · $${total.toFixed(2)}`}</button>{error && <p className="account-alert" role="alert">{error}</p>}</section></form><aside className="checkout-order-summary"><h2>Your order ({count} items)</h2>{Object.entries(cart).map(([id, qty]) => { const dish = findDish(id); return dish ? <p key={id}>{qty}× {dish.name}<strong>${(dish.price * qty).toFixed(2)}</strong></p> : null })}<p>Delivery fee<strong>{count ? '$1.99' : '$0.00'}</strong></p><div><strong>Total</strong><strong>${(count ? total : 0).toFixed(2)}</strong></div><small>Estimated arrival 25–35 minutes · Demo only</small></aside></div>}</main><Footer /></>
}

export default function FoodApp() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/admin/login') return <AuthPage expectedRole="admin" />
  if (path === '/admin' || path === '/admin/dashboard') return <AdminDashboard />
  if (path === '/dashboard' || path === '/client/dashboard') return <ClientDashboard />
  if (path === '/delivery') return <DeliveryPage />
  if (path === '/deals') return <DealsPage />
  if (path === '/restaurant') return <RestaurantPage />
  if (path === '/reserve') return <ReservePage />
  if (path === '/track') return <TrackingPage />
  if (path === '/login' || path === '/signin') return <AuthPage />
  if (path === '/signup' || path === '/register') return <AuthPage signup />
  if (path === '/checkout') return <CheckoutPage />
  return <HomePage />
}
