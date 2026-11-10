import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownWideNarrow, ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronDown, ChevronRight,
  Clock3, CreditCard, Headphones, Heart, HelpCircle, MapPin, Menu, Minus, PackageCheck,
  Search, ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, Star, Store, Truck,
  UserRound, X, Zap,
} from 'lucide-react'
import './App.css'

const products = [
  { id: 'headphones', slug: 'soundmaster-pro-headphones', name: 'SoundMaster Pro Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 49.99, oldPrice: 89.99, rating: 4.8, reviews: 2341, seller: 'TechTrend Co.', sellerSlug: 'techtrend', badge: 'FLASH DEAL', color: '#e5e9ef', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', description: 'Tune out the noise and settle into rich, balanced sound. SoundMaster Pro pairs all-day comfort with dependable wireless listening and a fold-flat travel design.', specs: [['Battery life', '40 hours'], ['Connectivity', 'Bluetooth 5.3'], ['Weight', '265 g'], ['Warranty', '1 year'] ] },
  { id: 'speaker', slug: 'portable-bluetooth-speaker', name: 'Everyday Portable Bluetooth Speaker', category: 'Electronics', price: 34.5, oldPrice: 48, rating: 4.7, reviews: 864, seller: 'TechTrend Co.', sellerSlug: 'techtrend', badge: 'BEST SELLER', color: '#e4e6df', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85', description: 'Bring room-filling sound to the patio, kitchen, or weekend away. A simple, water-resistant speaker made for everyday listening.', specs: [['Play time', '18 hours'], ['Connectivity', 'Bluetooth 5.2'], ['Water rating', 'IPX5'], ['Warranty', '1 year'] ] },
  { id: 'watch', slug: 'minimalist-everyday-watch', name: 'Minimalist Everyday Watch - Midnight', category: 'Accessories', price: 62, oldPrice: 79, rating: 4.9, reviews: 518, seller: 'North & Pine', sellerSlug: 'north-pine', badge: '', color: '#eeece7', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85', description: 'An easy-to-wear, minimal dial and a soft interchangeable strap make this a thoughtful companion for workdays and weekends.', specs: [['Case', '38 mm stainless steel'], ['Movement', 'Japanese quartz'], ['Strap', 'Soft-touch silicone'], ['Water rating', '3 ATM'] ] },
  { id: 'bag', slug: 'weekend-crossbody-bag', name: 'The Weekend Crossbody Bag', category: 'Fashion', price: 38, oldPrice: 52, rating: 4.8, reviews: 362, seller: 'North & Pine', sellerSlug: 'north-pine', badge: 'MADE TO LAST', color: '#f0e9df', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85', description: 'A practical, hands-free everyday bag with room for the essentials and an adjustable strap for a comfortable fit.', specs: [['Material', 'Recycled canvas'], ['Dimensions', '22 × 16 × 7 cm'], ['Pockets', '3 interior, 1 exterior'], ['Care', 'Spot clean'] ] },
  { id: 'sofa', slug: 'softline-accent-chair', name: 'Softline Accent Chair in Natural Linen', category: 'Home & Living', price: 219, oldPrice: 279, rating: 4.6, reviews: 197, seller: 'Haven House', sellerSlug: 'haven-house', badge: '', color: '#e9e3da', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85', description: 'Make a quiet corner feel like yours. Soft upholstery, warm wood details, and an inviting silhouette make this chair easy to live with.', specs: [['Fabric', 'Linen blend'], ['Frame', 'Solid beech wood'], ['Assembly', 'About 20 minutes'], ['Shipping', 'Ships in 2–3 days'] ] },
  { id: 'skin', slug: 'botanical-skin-care-set', name: 'Botanical Glow Skin Care Set', category: 'Beauty', price: 42, oldPrice: 56, rating: 4.9, reviews: 741, seller: 'Sage & Bloom', sellerSlug: 'sage-bloom', badge: 'CLEAN BEAUTY', color: '#ede9df', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85', description: 'A gentle three-step ritual with plant-derived ingredients, made for a fresh, comfortable glow without a complicated routine.', specs: [['Includes', 'Cleanser, serum, moisturizer'], ['Skin type', 'All skin types'], ['Formula', 'Vegan, cruelty-free'], ['Origin', 'Made in small batches'] ] },
  { id: 'hoodie', slug: 'everyday-cotton-hoodie', name: 'Everyday Cotton Hoodie - Warm Sand', category: 'Fashion', price: 54, oldPrice: 68, rating: 4.7, reviews: 429, seller: 'North & Pine', sellerSlug: 'north-pine', badge: '', color: '#e9e3da', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85', description: 'A soft, midweight layer with a relaxed fit, sturdy stitching, and a generously sized hood. Your new everyday favorite.', specs: [['Fabric', '80% cotton, 20% recycled poly'], ['Fit', 'Relaxed'], ['Care', 'Machine wash cold'], ['Sizes', 'XS–XXL'] ] },
  { id: 'lamp', slug: 'studio-table-lamp', name: 'Studio Table Lamp - Warm Brass', category: 'Home & Living', price: 76, oldPrice: 92, rating: 4.8, reviews: 156, seller: 'Haven House', sellerSlug: 'haven-house', badge: '', color: '#eee8dd', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85', description: 'Soft, warm light and a timeless silhouette bring a little calm to your bedside or favorite reading nook.', specs: [['Finish', 'Brushed brass'], ['Bulb', 'E26, included'], ['Height', '42 cm'], ['Switch', 'Inline dimmer'] ] },
]

const categories = [
  { name: 'Electronics', icon: '⌁', detail: 'Find your next favorite tech' },
  { name: 'Fashion', icon: '◈', detail: 'Thoughtful everyday style' },
  { name: 'Home & Living', icon: '⌂', detail: 'Make yourself at home' },
  { name: 'Beauty', icon: '✳', detail: 'Good things for your ritual' },
  { name: 'Accessories', icon: '◇', detail: 'The finishing touches' },
]
const sellers = [
  { name: 'TechTrend Co.', slug: 'techtrend', niche: 'Everyday technology, made simple', location: 'Austin, TX', rating: '4.9', orders: '2.4k', initials: 'TT', color: 'peach', products: ['headphones', 'speaker'] },
  { name: 'North & Pine', slug: 'north-pine', niche: 'Considered essentials for living', location: 'Portland, OR', rating: '4.8', orders: '1.8k', initials: 'NP', color: 'sage', products: ['watch', 'bag', 'hoodie'] },
  { name: 'Haven House', slug: 'haven-house', niche: 'Comfort and character for your home', location: 'Charleston, SC', rating: '4.9', orders: '986', initials: 'HH', color: 'sand', products: ['sofa', 'lamp'] },
  { name: 'Sage & Bloom', slug: 'sage-bloom', niche: 'Small-batch botanical skincare', location: 'Santa Fe, NM', rating: '5.0', orders: '1.1k', initials: 'SB', color: 'lilac', products: ['skin'] },
]

const money = (value) => `$${Number(value).toFixed(2)}`
const productFor = (id) => products.find((product) => product.id === id)
const routeFor = (product) => `/product/${product.slug}`

function AppLink({ to, navigate, className = '', children, ...props }) {
  return <a className={className} href={to} onClick={(event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }} {...props}>{children}</a>
}

function Stars({ value = 4.8 }) {
  return <span className="rating"><Star size={14} fill="currentColor" /> <b>{value}</b></span>
}

function Brand({ navigate, light = false }) {
  return <AppLink to="/" navigate={navigate} className={`brand ${light ? 'brand-light' : ''}`}>
    <span className="brand-icon"><ShoppingBag size={19} strokeWidth={2.7} /></span>
    <span>Market<span>Hub</span></span>
  </AppLink>
}

function SiteHeader({ navigate, cartCount, favorites, query, setQuery }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const submitSearch = (event) => {
    event.preventDefault()
    const text = query.trim()
    navigate(text ? `/search?q=${encodeURIComponent(text)}` : '/search')
    setMenuOpen(false)
  }
  return <>
    <div className="utility-bar"><div className="shell utility-inner"><span>Thoughtful finds from independent shops</span><div><AppLink to="/help/shipping" navigate={navigate}>Track an order</AppLink><AppLink to="/seller/join" navigate={navigate}>Sell on MarketHub</AppLink><AppLink to="/help" navigate={navigate}>Help center</AppLink></div></div></div>
    <header className="site-header">
      <div className="shell header-main">
        <button className="icon-button mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}><Menu /></button>
        <Brand navigate={navigate} />
        <form className="search-box" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="site-search">Search products and shops</label>
          <Search size={18} />
          <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands, shops..." />
          <select aria-label="Search category" defaultValue="All categories" onChange={(event) => {
            if (event.target.value !== 'All categories') navigate(`/search?category=${encodeURIComponent(event.target.value)}`)
          }}><option>All categories</option>{categories.map((category) => <option key={category.name}>{category.name}</option>)}</select>
          <button type="submit">Search</button>
        </form>
        <div className="header-actions">
          <AppLink className="header-action location-action" to="/help/shipping" navigate={navigate}><MapPin size={17} /><span>Deliver to<br /><b>Your address</b></span></AppLink>
          <AppLink className="header-action account-action" to="/login" navigate={navigate}><UserRound size={18} /><span>Welcome<br /><b>Sign in</b></span></AppLink>
          <AppLink className="header-action header-heart" to="/wishlist" navigate={navigate} aria-label={`Wishlist, ${favorites.length} saved`}><Heart size={20} /><span className="count-badge">{favorites.length}</span></AppLink>
          <AppLink className="header-action cart-action" to="/cart" navigate={navigate} aria-label={`Cart, ${cartCount} items`}><ShoppingCart size={21} /><span className="count-badge">{cartCount}</span><b>Cart</b></AppLink>
        </div>
      </div>
      <nav className={`category-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
        <div className="shell nav-inner"><AppLink to="/search" navigate={navigate} className="all-categories"><Menu size={15} /> All Categories <ChevronDown size={13} /></AppLink>
          {categories.map((category) => <AppLink key={category.name} to={`/search?category=${encodeURIComponent(category.name)}`} navigate={navigate}>{category.name}</AppLink>)}
          <AppLink to="/deals" navigate={navigate} className="nav-deals"><Zap size={14} fill="currentColor" /> Today's deals</AppLink>
        </div>
      </nav>
    </header>
  </>
}

function SiteFooter({ navigate }) {
  return <footer className="site-footer"><div className="shell footer-main">
    <div className="footer-about"><Brand navigate={navigate} light /><p>A better way to shop small. Discover useful, well-made things from independent sellers who care about what they do.</p><div className="footer-socials"><span>ig</span><span>f</span><span>p</span><span>in</span></div></div>
    <div><h3>Shop</h3><AppLink to="/search" navigate={navigate}>All products</AppLink><AppLink to="/deals" navigate={navigate}>Today's deals</AppLink><AppLink to="/search?category=Home%20%26%20Living" navigate={navigate}>Home &amp; Living</AppLink><AppLink to="/search?category=Fashion" navigate={navigate}>Fashion</AppLink><AppLink to="/search?category=Electronics" navigate={navigate}>Electronics</AppLink></div>
    <div><h3>For sellers</h3><AppLink to="/seller/join" navigate={navigate}>Open a shop</AppLink><AppLink to="/seller/techtrend" navigate={navigate}>Meet our sellers</AppLink><AppLink to="/help" navigate={navigate}>Seller resources</AppLink><AppLink to="/login" navigate={navigate}>Seller sign in</AppLink></div>
    <div><h3>Help &amp; info</h3><AppLink to="/help" navigate={navigate}>Help center</AppLink><AppLink to="/help/shipping" navigate={navigate}>Shipping &amp; returns</AppLink><AppLink to="/contact" navigate={navigate}>Contact us</AppLink><AppLink to="/help" navigate={navigate}>Privacy &amp; terms</AppLink></div>
  </div><div className="shell footer-bottom"><span>© 2026 MarketHub. A little more local, a lot more lovely.</span><span>Secure checkout <ShieldCheck size={14} /></span></div></footer>
}

function ProductCard({ product, navigate, favorites, toggleFavorite, onAdd }) {
  const saved = favorites.includes(product.id)
  return <article className="product-card">
    <div className="product-card-image" style={{ backgroundColor: product.color }}>
      <AppLink to={routeFor(product)} navigate={navigate} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} /></AppLink>
      {product.badge && <span className={`product-badge ${product.badge === 'FLASH DEAL' ? 'badge-orange' : ''}`}>{product.badge}</span>}
      <button className={`favorite-button ${saved ? 'is-saved' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
    </div>
    <div className="product-card-info">
      <AppLink to={routeFor(product)} navigate={navigate} className="product-card-title">{product.name}</AppLink>
      <AppLink to={`/seller/${product.sellerSlug}`} navigate={navigate} className="seller-byline">{product.seller}</AppLink>
      <div className="product-rating"><Stars value={product.rating} /><span>({product.reviews.toLocaleString()})</span></div>
      <div className="product-card-bottom"><div><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div><button className="add-mini" onClick={() => onAdd(product.id)} aria-label={`Add ${product.name} to cart`}><ShoppingCart size={16} /></button></div>
    </div>
  </article>
}

function ProductGrid({ items, ...props }) {
  if (!items.length) return <div className="empty-search"><Search size={28} /><h3>No products found just yet</h3><p>Try a different search, or explore all of our independent shops.</p><AppLink to="/search" navigate={props.navigate} className="button button-outline">Browse all products</AppLink></div>
  return <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} {...props} />)}</div>
}

function HomePage({ navigate, favorites, toggleFavorite, onAdd }) {
  const best = products.filter((product) => ['headphones', 'watch', 'bag', 'skin'].includes(product.id))
  return <main>
    <section className="hero shell">
      <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> GOOD THINGS, MADE BY GOOD PEOPLE</span><h1>Find your next<br />favorite <em>thing.</em></h1><p>Thoughtful finds, small-batch favorites, and everyday essentials from independent shops worth knowing.</p><div className="hero-actions"><AppLink to="/search" navigate={navigate} className="button button-orange">Explore the marketplace <ArrowRight size={17} /></AppLink><AppLink to="/seller/techtrend" navigate={navigate} className="hero-text-link">Meet our sellers <ArrowRight size={15} /></AppLink></div><div className="hero-proof"><span><BadgeCheck size={16} /> Independent sellers</span><span><ShieldCheck size={16} /> Secure checkout</span><span><Truck size={16} /> Tracked delivery</span></div></div>
      <div className="hero-art" aria-label="Featured SoundMaster headphones"><div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-product-image"><img src={products[0].image} alt="Premium wireless headphones" onError={(event) => { event.currentTarget.style.display = 'none' }} /></div><div className="hero-product-tag"><span>THIS WEEK'S PICK</span><b>SoundMaster Pro</b><Stars value={4.8} /></div><div className="hero-sale-pill"><Zap size={14} fill="currentColor" /> Up to 40% off</div></div>
    </section>
    <section className="trust-strip"><div className="shell trust-strip-inner"><span><Store size={20} /><b>1,200+</b> independent shops</span><span><PackageCheck size={20} /><b>Thoughtful</b> finds, always</span><span><ShieldCheck size={20} /><b>Protected</b> secure checkout</span><span><Headphones size={20} /><b>Real people</b> here to help</span></div></section>
    <section className="section shell category-section"><div className="section-heading"><div><span className="section-kicker">A LITTLE BIT OF EVERYTHING</span><h2>Find your kind of good</h2></div><AppLink to="/search" navigate={navigate} className="text-link">Explore all <ArrowRight size={16} /></AppLink></div><div className="category-grid">{categories.map((category, index) => <AppLink key={category.name} to={`/search?category=${encodeURIComponent(category.name)}`} navigate={navigate} className={`category-tile category-tone-${index}`}><span className="category-symbol">{category.icon}</span><span><b>{category.name}</b><small>{category.detail}</small></span><ChevronRight size={17} /></AppLink>)}</div></section>
    <section className="section shell deals-section"><div className="section-heading"><div><span className="section-kicker orange-kicker"><Zap size={13} fill="currentColor" /> THE GOOD STUFF, FOR LESS</span><h2>Today's little deals</h2><p className="section-description">A few current favorites, with a little something off the top.</p></div><AppLink to="/deals" navigate={navigate} className="text-link">See all deals <ArrowRight size={16} /></AppLink></div><ProductGrid items={products.slice(0, 4)} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} onAdd={onAdd} /></section>
    <section className="seller-feature shell"><div className="seller-feature-copy"><span className="section-kicker">SMALL SHOPS. BIG HEART.</span><h2>Good shopping feels<br />even better <em>together.</em></h2><p>Every order supports a real, independent business and the people behind it. Take a peek at the shops making this marketplace special.</p><AppLink to="/seller/techtrend" navigate={navigate} className="button button-dark">Get to know our sellers <ArrowRight size={16} /></AppLink></div><div className="seller-mini-grid">{sellers.slice(0, 4).map((seller) => <AppLink to={`/seller/${seller.slug}`} navigate={navigate} key={seller.slug} className="seller-mini-card"><span className={`seller-avatar avatar-${seller.color}`}>{seller.initials}</span><span><b>{seller.name}</b><small>{seller.niche}</small><span className="seller-mini-rating"><Star size={12} fill="currentColor" /> {seller.rating} · {seller.orders} orders</span></span><ChevronRight size={16} /></AppLink>)}</div></section>
    <section className="section shell recommendations-section"><div className="section-heading"><div><span className="section-kicker">PICKED WITH YOU IN MIND</span><h2>Little things, loved a lot</h2></div><AppLink to="/search" navigate={navigate} className="text-link">Shop everything <ArrowRight size={16} /></AppLink></div><ProductGrid items={best} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} onAdd={onAdd} /></section>
    <section className="newsletter-band"><div className="shell newsletter-inner"><div><span className="section-kicker">THE MARKET NOTE</span><h2>A good thing in your inbox.</h2><p>New finds, kind shops, and the occasional little treat. No noise.</p></div><Newsletter /></div></section>
  </main>
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  return subscribed ? <p className="newsletter-success"><Check size={17} /> You're on the list. Keep an eye on your inbox!</p> : <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setSubscribed(true) }}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} required /><button className="button button-orange" type="submit">Count me in <ArrowRight size={15} /></button></form>
}

function SearchPage({ route, navigate, favorites, toggleFavorite, onAdd }) {
  const params = new URLSearchParams(route.split('?')[1] || '')
  const query = params.get('q') || ''
  const category = params.get('category') || ''
  const [sort, setSort] = useState('featured')
  const [categoryFilter, setCategoryFilter] = useState(category)
  const [minimumPrice, setMinimumPrice] = useState('')
  const [maximumPrice, setMaximumPrice] = useState('')
  const [priceRange, setPriceRange] = useState([0, Infinity])
  const [topRatedOnly, setTopRatedOnly] = useState(false)
  const filtered = useMemo(() => {
    const text = query.toLowerCase()
    let result = products.filter((product) => (!categoryFilter || product.category === categoryFilter) &&
      product.price >= priceRange[0] && product.price <= priceRange[1] &&
      (!topRatedOnly || product.rating >= 4) &&
      (!text || `${product.name} ${product.category} ${product.seller} ${product.description}`.toLowerCase().includes(text)))
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price)
    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)
    return result
  }, [categoryFilter, priceRange, query, sort, topRatedOnly])
  const clearFilters = () => {
    setCategoryFilter('')
    setMinimumPrice('')
    setMaximumPrice('')
    setPriceRange([0, Infinity])
    setTopRatedOnly(false)
  }
  const applyPriceFilter = () => {
    const min = Number(minimumPrice)
    const max = Number(maximumPrice)
    setPriceRange([minimumPrice === '' ? 0 : min, maximumPrice === '' ? Infinity : max])
  }
  return <main className="shell content-page"><div className="breadcrumbs"><AppLink to="/" navigate={navigate}>Home</AppLink><ChevronRight size={13} /><span>{category || 'Shop all'}</span></div><div className="page-title-row"><div><span className="section-kicker">THE MARKETPLACE</span><h1>{query ? `Results for “${query}”` : category || 'Shop all the good things'}</h1><p>{filtered.length} thoughtful finds from independent shops</p></div><label className="sort-select"><ArrowDownWideNarrow size={16} /><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label></div><div className="results-layout"><aside className="filter-panel"><div className="filter-heading"><SlidersHorizontal size={17} /><b>Filters</b><button onClick={clearFilters}>Clear</button></div><div className="filter-group"><b>Category</b>{categories.map((item) => <label key={item.name} className="filter-option"><input type="radio" name="category" checked={categoryFilter === item.name} onChange={() => setCategoryFilter(item.name)} />{item.name}</label>)}</div><div className="filter-group"><b>Customer rating</b><label className="filter-option"><input type="checkbox" checked={topRatedOnly} onChange={(event) => setTopRatedOnly(event.target.checked)} /> 4 stars &amp; up <span>★</span></label></div><div className="filter-group"><b>Price</b><div className="price-inputs"><input aria-label="Minimum price" placeholder="$ Min" type="number" min="0" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} /><span>to</span><input aria-label="Maximum price" placeholder="$ Max" type="number" min="0" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} /></div><button className="filter-apply" onClick={applyPriceFilter}>Apply price</button></div><AppLink to="/seller/join" navigate={navigate} className="seller-promo"><Store size={18} /><b>Have something special?</b><span>Open your own shop with us.</span><span>Learn how <ArrowRight size={13} /></span></AppLink></aside><div className="results-main"><div className="results-note"><span>{categoryFilter || 'All categories'} <b>·</b> {filtered.length} results</span><span><ShieldCheck size={15} /> Shop small, shop confidently</span></div><ProductGrid items={filtered} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} onAdd={onAdd} /></div></div></main>
}

function DealsPage({ navigate, favorites, toggleFavorite, onAdd }) {
  const discounted = products.filter((product) => product.oldPrice)
  return <main className="shell content-page"><div className="deal-hero"><span><Zap size={15} fill="currentColor" /> A LITTLE SOMETHING EXTRA</span><h1>Today's good deals</h1><p>Nice things from independent shops, at an especially nice price.</p><div><Clock3 size={15} /> Deals change often. If you love it, don't wait too long.</div></div><div className="section-heading deal-list-heading"><div><span className="section-kicker">CURRENTLY ON OFFER</span><h2>Worth a second look</h2></div><span className="muted-copy">{discounted.length} finds on offer</span></div><ProductGrid items={discounted} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} onAdd={onAdd} /></main>
}

function ProductPage({ product, navigate, favorites, toggleFavorite, onAdd }) {
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState('Reviews')
  const [notice, setNotice] = useState('')
  if (!product) return <NotFound navigate={navigate} />
  const seller = sellers.find((item) => item.slug === product.sellerSlug) || sellers[0]
  const add = (checkout = false) => {
    onAdd(product.id, quantity, checkout)
    setNotice(checkout ? 'Added to your bag. Your secure checkout is ready.' : `${quantity} added to your bag.`)
  }
  return <main className="shell content-page product-page"><div className="breadcrumbs"><AppLink to="/" navigate={navigate}>Home</AppLink><ChevronRight size={13} /><AppLink to={`/search?category=${encodeURIComponent(product.category)}`} navigate={navigate}>{product.category}</AppLink><ChevronRight size={13} /><span>{product.name}</span></div><div className="product-detail-layout"><div className="product-gallery"><div className="gallery-thumbs"><button className="thumb-active" aria-label="Product image 1"><img src={product.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /></button><button aria-label="Product image 2"><img src={product.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /></button><button aria-label="Product image 3"><img src={product.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /></button></div><div className="product-main-image" style={{ backgroundColor: product.color }}><img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.style.display = 'none' }} />{product.badge && <span className="product-badge badge-orange">{product.badge}</span>}</div></div><section className="product-purchase"><div className="product-title-top"><span className="seller-inline">Sold by <AppLink to={`/seller/${seller.slug}`} navigate={navigate}>{seller.name} <BadgeCheck size={14} /></AppLink></span><button className={`favorite-button detail-favorite ${favorites.includes(product.id) ? 'is-saved' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label="Toggle wishlist"><Heart size={19} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button></div><h1>{product.name}</h1><div className="detail-rating"><Stars value={product.rating} /><span>{product.rating} rating</span><a href="#reviews" onClick={() => setTab('Reviews')}>{product.reviews.toLocaleString()} reviews</a><span>·</span><span>348 bought</span></div><div className="price-block"><strong>{money(product.price)}</strong>{product.oldPrice && <><del>{money(product.oldPrice)}</del><span className="save-label">Save {Math.round((1 - product.price / product.oldPrice) * 100)}%</span></>}</div><div className="tax-note">Inclusive of taxes · Secure checkout</div><div className="product-option"><b>Finish</b><div className="option-chips"><button className="option-chip selected">Midnight</button><button className="option-chip">Cloud</button><button className="option-chip">Amber</button></div></div><div className="product-option"><b>Availability</b><span className="stock-status"><span /> In stock — ships today</span></div><div className="quantity-row"><span>Quantity</span><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity((number) => Math.max(1, number - 1))}><Minus size={14} /></button><b>{quantity}</b><button aria-label="Increase quantity" onClick={() => setQuantity((number) => number + 1)}><span>+</span></button></div><span className="stock-subtle">Only 8 left</span></div><div className="purchase-buttons"><button className="button button-outline add-to-cart" onClick={() => add()}><ShoppingCart size={17} /> Add to cart</button><button className="button button-orange buy-now" onClick={() => add(true)}>Buy now <ArrowRight size={16} /></button></div>{notice && <p className="inline-notice" role="status">{notice}</p>}<div className="delivery-points"><span><Truck size={17} /> Free delivery over $75</span><span><ShieldCheck size={17} /> Secure checkout</span><span><PackageCheck size={17} /> Easy 30-day returns</span></div></section><aside className="seller-card"><div className={`seller-avatar avatar-${seller.color}`}>{seller.initials}</div><div className="seller-card-heading"><AppLink to={`/seller/${seller.slug}`} navigate={navigate}>{seller.name}</AppLink><span><BadgeCheck size={13} /> Verified seller</span></div><div className="seller-metrics"><span><small>Shop rating</small><b><Star size={13} fill="currentColor" /> {seller.rating}</b></span><span><small>Orders</small><b>{seller.orders}+</b></span></div><p>{seller.niche}. Based in {seller.location}.</p><AppLink to={`/seller/${seller.slug}`} navigate={navigate} className="button button-outline seller-card-button">Visit seller's shop</AppLink><AppLink to="/help" navigate={navigate} className="seller-message"><HelpCircle size={14} /> Questions? Get in touch</AppLink></aside></div><section id="reviews" className="product-tabs"><div className="tab-buttons">{['Description', 'Specs', 'Shipping & Returns', 'Reviews'].map((name) => <button key={name} className={tab === name ? 'active-tab' : ''} onClick={() => setTab(name)}>{name}{name === 'Reviews' && <span> ({product.reviews})</span>}</button>)}</div>{tab === 'Description' && <div className="tab-content"><h3>A little more about it</h3><p>{product.description}</p></div>}{tab === 'Specs' && <div className="specs-grid">{product.specs.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>}{tab === 'Shipping & Returns' && <div className="tab-content shipping-tab"><p><Truck size={18} /><span><b>Careful, tracked delivery</b><br />Ships from {seller.location}. Most orders arrive in 3–6 business days.</span></p><p><PackageCheck size={18} /><span><b>Easy 30-day returns</b><br />Changed your mind? Start a return within 30 days of delivery.</span></p></div>}{tab === 'Reviews' && <div className="review-content"><div className="review-summary"><b>{product.rating}</b><Stars value={product.rating} /><span>Based on {product.reviews.toLocaleString()} happy shoppers</span><div className="rating-bars"><span>5 <i><b style={{ width: '83%' }} /></i> 83%</span><span>4 <i><b style={{ width: '12%' }} /></i> 12%</span><span>3 <i><b style={{ width: '4%' }} /></i> 4%</span></div></div><div className="sample-reviews"><article><div><Stars value={5} /><b>Lovely quality, just as pictured</b></div><p>Really thoughtful packaging and it arrived earlier than expected. Would happily order again.</p><small>Jamie R. · Verified purchase</small></article><article><div><Stars value={5} /><b>So glad I found this shop</b></div><p>Great product and such a nice seller. Exactly what I was looking for.</p><small>Casey L. · Verified purchase</small></article></div></div>}</section><section className="section related-products"><div className="section-heading"><div><span className="section-kicker">MORE GOOD FINDS</span><h2>You might like these, too</h2></div><AppLink to="/search" navigate={navigate} className="text-link">Shop all <ArrowRight size={16} /></AppLink></div><ProductGrid items={products.filter((item) => item.id !== product.id).slice(0, 4)} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} onAdd={onAdd} /></section></main>
}

function SellerPage({ slug, navigate, favorites, toggleFavorite, onAdd }) {
  const seller = sellers.find((item) => item.slug === slug)
  if (!seller) return <NotFound navigate={navigate} />
  const shopProducts = seller.products.map(productFor).filter(Boolean)
  return <main className="shell content-page seller-page"><div className="breadcrumbs"><AppLink to="/" navigate={navigate}>Home</AppLink><ChevronRight size={13} /><AppLink to="/search" navigate={navigate}>Shops</AppLink><ChevronRight size={13} /><span>{seller.name}</span></div><section className={`seller-banner seller-banner-${seller.color}`}><div className={`seller-avatar seller-avatar-large avatar-${seller.color}`}>{seller.initials}</div><div className="seller-banner-copy"><span className="section-kicker">A MARKETPLACE FAVORITE</span><h1>{seller.name} <BadgeCheck size={22} /></h1><p>{seller.niche}. Thoughtful finds, carefully packed, from {seller.location}.</p><div className="seller-banner-stats"><span><Star size={15} fill="currentColor" /> {seller.rating} shop rating</span><span><PackageCheck size={16} /> {seller.orders}+ orders</span><span><MapPin size={15} /> {seller.location}</span></div></div><button className="button button-dark" onClick={() => navigate('/help')}>Message the seller <ArrowRight size={15} /></button></section><div className="seller-story"><div><span className="section-kicker">A NOTE FROM THE SHOP</span><h2>Good things, chosen with care.</h2><p>We're an independent shop that believes everyday things should be a little more thoughtful. We work with trusted makers, take the time to get the details right, and pack every order like it's going to someone we know.</p><p>Thanks for shopping small. It means the world to us.</p></div><div className="seller-values"><span><PackageCheck size={19} /><b>Packed with care</b><small>Every order, every time</small></span><span><BadgeCheck size={19} /><b>Verified shop</b><small>A trusted MarketHub seller</small></span><span><Truck size={19} /><b>Quick dispatch</b><small>Usually ships within 1–2 days</small></span></div></div><section className="section"><div className="section-heading"><div><span className="section-kicker">FROM {seller.name.toUpperCase()}</span><h2>Shop the collection</h2></div><span className="muted-copy">{shopProducts.length} finds</span></div><ProductGrid items={shopProducts} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} onAdd={onAdd} /></section><section className="seller-review-quote"><Stars value={Number(seller.rating)} /><p>“Wonderful shop, thoughtful packaging, and such a lovely product. I'll definitely be back.”</p><span>— A happy MarketHub shopper</span></section></main>
}

function CartPage({ cart, navigate, changeQuantity, removeItem, favorites, toggleFavorite, onAdd }) {
  const subtotal = cart.reduce((sum, item) => sum + productFor(item.id).price * item.quantity, 0)
  const shipping = subtotal >= 75 || !cart.length ? 0 : 4.99
  return <main className="shell content-page"><div className="breadcrumbs"><AppLink to="/" navigate={navigate}>Home</AppLink><ChevronRight size={13} /><span>Your bag</span></div><div className="page-title-row"><div><span className="section-kicker">YOUR LITTLE FINDS</span><h1>Your shopping bag <span className="title-count">({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h1><p>Good things are just a few steps away.</p></div></div>{!cart.length ? <div className="empty-cart"><div className="empty-cart-icon"><ShoppingBag size={34} /></div><h2>Your bag is taking a little breather.</h2><p>Have a look around. There are lots of good things waiting to be found.</p><AppLink to="/search" navigate={navigate} className="button button-orange">Explore the marketplace <ArrowRight size={16} /></AppLink><div className="cart-trust"><span><ShieldCheck size={16} /> Safe, secure checkout</span><span><Truck size={16} /> Free delivery over $75</span></div></div> : <div className="cart-layout"><section className="cart-items"><div className="cart-items-heading"><b>Items in your bag</b><span>Ships from independent sellers</span></div>{cart.map((item) => { const product = productFor(item.id); return <article className="cart-item" key={product.id}><AppLink to={routeFor(product)} navigate={navigate} className="cart-item-image" style={{ backgroundColor: product.color }}><img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.style.display = 'none' }} /></AppLink><div className="cart-item-description"><AppLink to={routeFor(product)} navigate={navigate} className="cart-product-name">{product.name}</AppLink><AppLink to={`/seller/${product.sellerSlug}`} navigate={navigate} className="seller-byline">{product.seller}</AppLink><span className="stock-status"><span /> In stock</span><div className="cart-item-actions"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => changeQuantity(product.id, item.quantity - 1)}><Minus size={13} /></button><b>{item.quantity}</b><button aria-label="Increase quantity" onClick={() => changeQuantity(product.id, item.quantity + 1)}><span>+</span></button></div><button className="remove-button" onClick={() => removeItem(product.id)}>Remove</button></div></div><strong className="cart-item-price">{money(product.price * item.quantity)}</strong></article>})}<AppLink to="/search" navigate={navigate} className="continue-shopping"><ArrowLeft size={15} /> Keep looking around</AppLink></section><aside className="order-summary"><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Shipping</span><b>{shipping === 0 ? 'FREE' : money(shipping)}</b></div>{shipping > 0 && <p className="free-shipping-hint">Add {money(75 - subtotal)} more for free shipping.</p>}<div className="summary-line"><span>Estimated tax</span><b>{money(subtotal * 0.08)}</b></div><div className="summary-total"><span>Estimated total</span><b>{money(subtotal + shipping + subtotal * 0.08)}</b></div><button className="button button-orange checkout-button" onClick={() => navigate('/checkout')}>Continue to checkout <ArrowRight size={16} /></button><div className="safe-checkout"><ShieldCheck size={17} /><span><b>Safe and secure checkout</b><small>Your payment details are never stored here.</small></span></div><div className="accepted-payments"><span>VISA</span><span>mastercard</span><span>PayPal</span><span>Apple Pay</span></div></aside></div>}<section className="section cart-recommendations"><div className="section-heading"><div><span className="section-kicker">A FEW MORE GOOD THINGS</span><h2>Popular right now</h2></div></div><ProductGrid items={products.slice(0, 4)} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} onAdd={onAdd} /></section></main>
}

function CheckoutPage({ cart, navigate, clearCart }) {
  const [step, setStep] = useState('details')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const subtotal = cart.reduce((sum, item) => sum + productFor(item.id).price * item.quantity, 0)
  const shippingRates = { standard: subtotal >= 75 ? 0 : 4.99, express: 12.99, 'same-day': 19.99 }
  const tax = subtotal * 0.08
  const total = subtotal + shippingRates[shippingMethod] + tax - discount
  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'WELCOME10') { setDiscount(subtotal * 0.1); setCouponMessage('Welcome! 10% has been taken off your order.') }
    else { setDiscount(0); setCouponMessage('That code didn’t work. Try WELCOME10 for 10% off.') }
  }
  const completeOrder = (event) => {
    event.preventDefault()
    setFormMessage('')
    if (!event.currentTarget.reportValidity()) return
    setStep('complete')
    clearCart()
  }
  if (step === 'complete') return <main className="shell content-page order-complete"><div className="complete-icon"><Check size={34} /></div><span className="section-kicker">THANK YOU FOR SHOPPING SMALL</span><h1>Your order is all set.</h1><p>This is a checkout preview—no payment was taken. A live store can connect a secure payment provider to complete real orders.</p><div className="order-number">Preview order <b>#MH-2026-0418</b></div><div className="complete-actions"><AppLink to="/" navigate={navigate} className="button button-orange">Back to MarketHub <ArrowRight size={16} /></AppLink><AppLink to="/help/shipping" navigate={navigate} className="button button-outline">Order help</AppLink></div></main>
  if (!cart.length) return <main className="shell content-page checkout-empty"><div className="empty-cart-icon"><ShoppingBag size={30} /></div><h1>Your bag is empty</h1><p>Add something you love, then come back to checkout.</p><AppLink to="/search" navigate={navigate} className="button button-orange">Explore the marketplace <ArrowRight size={16} /></AppLink></main>
  return <main className="shell content-page checkout-page"><div className="checkout-top"><AppLink to="/cart" navigate={navigate}><ArrowLeft size={15} /> Back to your bag</AppLink><Brand navigate={navigate} /><span><ShieldCheck size={15} /> Secure checkout preview</span></div><div className="checkout-heading"><span className="section-kicker">JUST A FEW MORE DETAILS</span><h1>Checkout</h1><p>Your shop is supporting {new Set(cart.map((item) => productFor(item.id).seller)).size} independent {new Set(cart.map((item) => productFor(item.id).seller)).size === 1 ? 'seller' : 'sellers'}.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={completeOrder}><section className="checkout-section"><div className="checkout-section-title"><span>1</span><div><h2>Contact information</h2><p>Where should your order updates go?</p></div></div><label className="form-label">Email address<input type="email" placeholder="you@example.com" autoComplete="email" required /></label><label className="checkbox-row"><input type="checkbox" /> Send me occasional notes about new shops and special finds</label></section><section className="checkout-section"><div className="checkout-section-title"><span>2</span><div><h2>Shipping address</h2><p>Each seller ships your order with care.</p></div></div><div className="form-grid"><label className="form-label">First name<input name="firstName" autoComplete="given-name" required /></label><label className="form-label">Last name<input name="lastName" autoComplete="family-name" required /></label><label className="form-label form-span">Street address<input name="address" autoComplete="street-address" placeholder="Street and number" required /></label><label className="form-label">City<input name="city" autoComplete="address-level2" required /></label><label className="form-label">State / region<input name="state" autoComplete="address-level1" required /></label><label className="form-label">ZIP code<input name="zip" autoComplete="postal-code" required /></label><label className="form-label">Country<select name="country" defaultValue="United States"><option>United States</option><option>Canada</option><option>United Kingdom</option></select></label></div></section><section className="checkout-section"><div className="checkout-section-title"><span>3</span><div><h2>Delivery speed</h2><p>Choose the option that works for you.</p></div></div><div className="choice-list">{[['standard', 'Standard', '3–6 business days', shippingRates.standard === 0 ? 'FREE' : money(shippingRates.standard)], ['express', 'Express', '1–2 business days', money(12.99)], ['same-day', 'Same day', 'Available in select areas', money(19.99)]].map(([value, name, description, price]) => <label className={`choice-card ${shippingMethod === value ? 'choice-selected' : ''}`} key={value}><input type="radio" name="delivery" value={value} checked={shippingMethod === value} onChange={() => setShippingMethod(value)} /><Truck size={18} /><span><b>{name}</b><small>{description}</small></span><strong>{price}</strong></label>)}</div></section><section className="checkout-section"><div className="checkout-section-title"><span>4</span><div><h2>Payment method</h2><p>Demo only: payment details are not requested or collected.</p></div></div><div className="choice-list"><label className={`choice-card ${paymentMethod === 'card' ? 'choice-selected' : ''}`}><input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><CreditCard size={18} /><span><b>Credit or debit card</b><small>Visa, Mastercard, American Express</small></span><span className="payment-logos">VISA · MC</span></label><label className={`choice-card ${paymentMethod === 'paypal' ? 'choice-selected' : ''}`}><input type="radio" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} /><span className="paypal-mark">P</span><span><b>PayPal</b><small>Continue securely with PayPal</small></span></label></div><div className="demo-payment-note"><ShieldCheck size={17} /><p><b>Safe preview checkout</b><br />This demo doesn't collect or process payment information. Connect a payment provider such as Stripe or PayPal before accepting real orders.</p></div></section><button className="button button-orange place-order-button" type="submit">Place demo order · {money(total)} <ArrowRight size={16} /></button>{formMessage && <p className="inline-notice" role="alert">{formMessage}</p>}</form><aside className="order-summary checkout-summary"><h2>Your order</h2>{cart.map((item) => { const product = productFor(item.id); return <div className="checkout-product" key={item.id}><div className="checkout-product-image" style={{ backgroundColor: product.color }}><img src={product.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /><span>{item.quantity}</span></div><div><b>{product.name}</b><small>{product.seller}</small></div><strong>{money(product.price * item.quantity)}</strong></div>})}<div className="coupon-entry"><label htmlFor="coupon-code">Gift card or discount code</label><div><input id="coupon-code" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Enter code" /><button type="button" onClick={applyCoupon}>Apply</button></div>{couponMessage && <small className={discount ? 'coupon-success' : 'coupon-error'}>{couponMessage}</small>}</div><div className="summary-line"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Shipping</span><b>{shippingRates[shippingMethod] === 0 ? 'FREE' : money(shippingRates[shippingMethod])}</b></div><div className="summary-line"><span>Estimated tax</span><b>{money(tax)}</b></div>{discount > 0 && <div className="summary-line discount-line"><span>Welcome discount</span><b>−{money(discount)}</b></div>}<div className="summary-total"><span>Total</span><b>{money(total)}</b></div><div className="safe-checkout"><ShieldCheck size={17} /><span><b>No real payment is processed</b><small>This is a working UI preview only.</small></span></div></aside></div></main>
}

function AuthPage({ signup, navigate }) {
  const [accountType, setAccountType] = useState('customer')
  const [notice, setNotice] = useState('')
  const [password, setPassword] = useState('')
  return <main className="shell auth-page"><section className="auth-aside"><span className="section-kicker">GOOD SHOPS START HERE</span><h1>{signup ? 'A marketplace for the things you make.' : 'Good to see you again.'}</h1><p>{signup ? 'Join a community of thoughtful shoppers and independent sellers.' : 'Your favorite shops and finds are right where you left them.'}</p><div className="auth-perks"><span><BadgeCheck size={18} /> Shop from people who care</span><span><ShieldCheck size={18} /> Secure account and checkout</span><span><Heart size={18} /> Keep your favorites close</span></div><div className="auth-decoration"><ShoppingBag size={74} /></div></section><section className="auth-card"><AppLink to="/" navigate={navigate} className="auth-back"><ArrowLeft size={15} /> Back to marketplace</AppLink><Brand navigate={navigate} /><h2>{signup ? 'Create your account' : 'Welcome back'}</h2><p>{signup ? 'A few details and you’re all set.' : 'Sign in to pick up where you left off.'}</p>{signup && <div className="account-type-pick"><button className={accountType === 'customer' ? 'selected' : ''} onClick={() => setAccountType('customer')} type="button"><UserRound size={16} /> I’m here to shop</button><button className={accountType === 'seller' ? 'selected' : ''} onClick={() => setAccountType('seller')} type="button"><Store size={16} /> I’m a seller</button></div>}<form onSubmit={(event) => { event.preventDefault(); setNotice(signup ? 'Your account form is ready to connect to a registration service.' : 'Your sign-in form is ready to connect to your account service.') }}><label className="form-label">{signup ? 'Your name' : 'Email address'}<input type={signup ? 'text' : 'email'} autoComplete={signup ? 'name' : 'email'} required placeholder={signup ? 'Full name' : 'you@example.com'} /></label>{signup && <label className="form-label">Email address<input type="email" autoComplete="email" required placeholder="you@example.com" /></label>}<label className="form-label">Password<input type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="At least 8 characters" /></label>{!signup && <AppLink className="forgot-link" to="/forgot-password" navigate={navigate}>Forgot password?</AppLink>}<button type="submit" className="button button-orange auth-submit">{signup ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form>{notice && <p className="inline-notice" role="status">{notice}</p>}<div className="auth-switch">{signup ? 'Already have an account?' : 'New to MarketHub?'} <AppLink to={signup ? '/login' : '/signup'} navigate={navigate}>{signup ? 'Sign in' : 'Create an account'}</AppLink></div><p className="auth-demo-note"><ShieldCheck size={14} /> Demo form only. Account services are not connected.</p></section></main>
}

function SellerJoinPage({ navigate }) {
  return <main className="shell content-page seller-join-page"><div className="seller-join-hero"><span className="section-kicker">YOUR SHOP HAS A PLACE HERE</span><h1>Make a little room<br />for <em>your kind</em> of good.</h1><p>Meet thoughtful shoppers, grow your independent business, and get back to doing what you love: making good things.</p><AppLink to="/signup" navigate={navigate} className="button button-orange">Start your seller account <ArrowRight size={16} /></AppLink></div><div className="seller-benefit-grid"><article><span>01</span><Store size={24} /><h3>Your own little corner</h3><p>Set up a shop that feels like you, tell your story, and share what makes your products special.</p></article><article><span>02</span><Heart size={24} /><h3>Find your people</h3><p>Reach shoppers who care about where their things come from and who made them.</p></article><article><span>03</span><ShieldCheck size={24} /><h3>Tools that make it easier</h3><p>Manage your listings and orders in one place. Spend less time on admin, more time making.</p></article></div><div className="seller-join-note"><b>Getting started is free.</b> Seller fees and payment processing depend on your live account setup. We'll make those details clear before you open your shop.</div></main>
}

function HelpPage({ shipping = false, navigate }) {
  const [open, setOpen] = useState('orders')
  const [search, setSearch] = useState('')
  const entries = shipping ? [['orders', 'How do I track an order?', 'Once an order is dispatched, the seller shares tracking details by email. For this preview, no real shipment is created.'], ['delivery', 'When will my order arrive?', 'Standard delivery usually takes 3–6 business days. Each independent shop may have a different dispatch time.'], ['returns', 'Can I return something?', 'Most items can be returned within 30 days of delivery. Contact the shop first so they can help you with the next steps.']] : [['orders', 'Where is my order?', 'After a shop dispatches your order, tracking details are sent to your email. This demo storefront does not create real shipments.'], ['payments', 'Is checkout secure?', 'The checkout here is a preview and does not collect card details or process payment. A live payment provider must be connected before launch.'], ['returns', 'What is your return policy?', 'Most shops accept returns within 30 days. Return policies can vary by seller, so check the listing or contact the shop before ordering.'], ['sellers', 'How do I open a shop?', 'We would love to have you. Visit our seller page to learn how to get started.'] ]
  const visibleEntries = entries.filter(([, title, answer]) => `${title} ${answer}`.toLowerCase().includes(search.trim().toLowerCase()))
  return <main className="shell content-page help-page"><div className="help-intro"><span className="section-kicker">HERE WHEN YOU NEED US</span><h1>{shipping ? 'Shipping, delivery & returns' : 'How can we help?'}</h1><p>{shipping ? 'The useful details for getting your good things home.' : 'A few helpful answers, with real people behind them.'}</p><form className="help-search" onSubmit={(event) => { event.preventDefault(); setOpen('') }}><Search size={17} /><input placeholder="Search help articles" aria-label="Search help articles" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit">Search</button></form></div><div className="faq-layout"><aside><h3>Popular topics</h3><AppLink to="/help/shipping" navigate={navigate}><Truck size={15} /> Shipping &amp; returns</AppLink><AppLink to="/cart" navigate={navigate}><ShoppingBag size={15} /> Payments &amp; checkout</AppLink><AppLink to="/seller/join" navigate={navigate}><Store size={15} /> Selling on MarketHub</AppLink><AppLink to="/contact" navigate={navigate}><Headphones size={15} /> Contact our team</AppLink></aside><section className="faq-list">{visibleEntries.map(([id, title, answer]) => <article key={id} className="faq-item"><button onClick={() => setOpen(open === id ? '' : id)} aria-expanded={open === id}><span>{title}</span><ChevronDown size={17} /></button>{open === id && <p>{answer}</p>}</article>)}{!visibleEntries.length && <p className="no-help-results">No matching articles. Try another phrase or <AppLink to="/contact" navigate={navigate}>contact our team</AppLink>.</p>}<AppLink className="help-contact" to="/contact" navigate={navigate}><Headphones size={18} /><span><b>Still need a hand?</b><small>Send a note to our friendly team.</small></span><ArrowRight size={16} /></AppLink></section></div></main>
}

function ContactPage({ navigate }) {
  const [sent, setSent] = useState(false)
  return <main className="shell content-page contact-page"><div className="breadcrumbs"><AppLink to="/" navigate={navigate}>Home</AppLink><ChevronRight size={13} /><AppLink to="/help" navigate={navigate}>Help center</AppLink><ChevronRight size={13} /><span>Contact us</span></div><div className="contact-layout"><div><span className="section-kicker">A REAL PERSON, NOT A ROBOT</span><h1>We're here to help.</h1><p>Questions about a shop, your order, or getting started as a seller? Send us a note and we'll point you in the right direction.</p><div className="contact-info"><span><Headphones size={18} /><b>Friendly support</b><small>Monday–Friday, 9am–5pm</small></span><span><ShieldCheck size={18} /><b>Order questions</b><small>Include your order number if you have one</small></span></div></div>{sent ? <div className="contact-confirmation"><div className="complete-icon"><Check size={28} /></div><h2>Thanks for reaching out.</h2><p>Your message is ready for our support team. This demo doesn't send messages to a live inbox.</p><AppLink to="/help" navigate={navigate} className="button button-outline">Visit the help center</AppLink></div> : <form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}><label className="form-label">Your name<input autoComplete="name" required /></label><label className="form-label">Email address<input type="email" autoComplete="email" required /></label><label className="form-label">What can we help with?<select defaultValue="Order question"><option>Order question</option><option>Shopping help</option><option>Seller support</option><option>Something else</option></select></label><label className="form-label">Your message<textarea rows="5" required placeholder="Tell us a little more..." /></label><button className="button button-orange" type="submit">Send a message <ArrowRight size={16} /></button><small>Demo contact form only; messages are not delivered to a live support team.</small></form>}</div></main>
}

function ForgotPasswordPage({ navigate }) {
  const [sent, setSent] = useState(false)
  return <main className="shell auth-page recovery-page"><section className="auth-aside"><span className="section-kicker">A LITTLE HELP GETTING BACK IN</span><h1>Your account is still right where you left it.</h1><p>Enter the email address you use for MarketHub and we'll help you find your way back.</p><div className="auth-perks"><span><ShieldCheck size={18} /> Your account stays protected</span><span><Headphones size={18} /> Need a hand? Our team can help</span></div><div className="auth-decoration"><ShoppingBag size={74} /></div></section><section className="auth-card"><AppLink to="/login" navigate={navigate} className="auth-back"><ArrowLeft size={15} /> Back to sign in</AppLink><Brand navigate={navigate} /><h2>Reset your password</h2><p>We'll send a reset link if an account matches that email.</p>{sent ? <div className="recovery-success"><Check size={20} /><span><b>Check your inbox.</b><small>This preview doesn't send real emails. Connect an account service to enable password reset.</small></span></div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true) }}><label className="form-label">Email address<input type="email" autoComplete="email" placeholder="you@example.com" required /></label><button type="submit" className="button button-orange auth-submit">Send reset link <ArrowRight size={16} /></button></form>}<div className="auth-switch">Remembered it? <AppLink to="/login" navigate={navigate}>Sign in</AppLink></div></section></main>
}

function WishlistPage({ navigate, favorites, toggleFavorite, onAdd }) {
  const saved = products.filter((product) => favorites.includes(product.id))
  return <main className="shell content-page"><div className="breadcrumbs"><AppLink to="/" navigate={navigate}>Home</AppLink><ChevronRight size={13} /><span>Your wishlist</span></div><div className="page-title-row"><div><span className="section-kicker">THINGS YOU LOVE</span><h1>Your wishlist <span className="title-count">({saved.length})</span></h1><p>Keep the good things close while you decide.</p></div></div>{saved.length ? <ProductGrid items={saved} navigate={navigate} favorites={favorites} toggleFavorite={toggleFavorite} onAdd={onAdd} /> : <div className="empty-cart wishlist-empty"><div className="empty-cart-icon"><Heart size={32} /></div><h2>A little space for your favorites.</h2><p>Tap the heart on anything you love and it’ll be waiting here.</p><AppLink to="/search" navigate={navigate} className="button button-orange">Find something lovely <ArrowRight size={16} /></AppLink></div>}</main>
}

function NotFound({ navigate }) {
  return <main className="shell not-found"><span className="section-kicker">OH, THAT'S A LITTLE AWKWARD</span><h1>We couldn't find that page.</h1><p>It may have moved, or maybe it was just passing through.</p><AppLink to="/" navigate={navigate} className="button button-orange">Back to MarketHub <ArrowRight size={16} /></AppLink></main>
}

function App() {
  const [route, setRoute] = useState(`${window.location.pathname}${window.location.search}`)
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const navigate = (to) => {
    window.history.pushState({}, '', to)
    setRoute(`${window.location.pathname}${window.location.search}`)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  useEffect(() => {
    const handlePopState = () => setRoute(`${window.location.pathname}${window.location.search}`)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  useEffect(() => {
    const pathname = route.split('?')[0]
    const titles = { '/': 'MarketHub | Good things, made by good people', '/search': 'Shop all | MarketHub', '/deals': "Today's deals | MarketHub", '/cart': 'Your bag | MarketHub', '/checkout': 'Checkout | MarketHub', '/login': 'Sign in | MarketHub', '/signup': 'Create an account | MarketHub', '/forgot-password': 'Reset your password | MarketHub', '/wishlist': 'Your wishlist | MarketHub', '/help': 'Help center | MarketHub', '/help/shipping': 'Shipping & returns | MarketHub', '/contact': 'Contact us | MarketHub', '/seller/join': 'Open a shop | MarketHub' }
    document.title = titles[pathname] || 'Shop independent | MarketHub'
  }, [route])
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const addToCart = (id, quantity = 1, checkout = false) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === id)
      return existing ? current.map((item) => item.id === id ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { id, quantity }]
    })
    setToast(`${productFor(id).name} added to your bag`)
    if (checkout) navigate('/checkout')
  }
  const changeQuantity = (id, quantity) => {
    if (quantity < 1) { setCart((current) => current.filter((item) => item.id !== id)); return }
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity } : item))
  }
  const routePath = route.split('?')[0]
  const productMatch = routePath.match(/^\/product\/([^/]+)$/)
  const sellerMatch = routePath.match(/^\/seller\/([^/]+)$/)
  const product = productMatch ? products.find((item) => item.slug === productMatch[1]) : undefined
  const common = { navigate, favorites, toggleFavorite, onAdd: addToCart }
  let page
  if (routePath === '/') page = <HomePage {...common} />
  else if (routePath === '/search') page = <SearchPage route={route} {...common} />
  else if (routePath === '/deals') page = <DealsPage {...common} />
  else if (productMatch) page = <ProductPage product={product} {...common} />
  else if (routePath === '/seller/join') page = <SellerJoinPage navigate={navigate} />
  else if (sellerMatch) page = <SellerPage slug={sellerMatch[1]} {...common} />
  else if (routePath === '/cart') page = <CartPage cart={cart} navigate={navigate} changeQuantity={changeQuantity} removeItem={(id) => setCart((current) => current.filter((item) => item.id !== id))} {...common} />
  else if (routePath === '/checkout') page = <CheckoutPage cart={cart} navigate={navigate} clearCart={() => setCart([])} />
  else if (routePath === '/login' || routePath === '/signup') page = <AuthPage signup={routePath === '/signup'} navigate={navigate} />
  else if (routePath === '/forgot-password') page = <ForgotPasswordPage navigate={navigate} />
  else if (routePath === '/help' || routePath === '/help/shipping') page = <HelpPage shipping={routePath === '/help/shipping'} navigate={navigate} />
  else if (routePath === '/contact') page = <ContactPage navigate={navigate} />
  else if (routePath === '/wishlist') page = <WishlistPage {...common} />
  else page = <NotFound navigate={navigate} />
  const hideHeader = routePath === '/checkout'
  return <div className="app-shell">{!hideHeader && <SiteHeader navigate={navigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} favorites={favorites} query={query} setQuery={setQuery} />}{page}{!hideHeader && <SiteFooter navigate={navigate} />}{toast && <div className="toast-message" role="status"><Check size={17} /> {toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button></div>}</div>
}

export default App
