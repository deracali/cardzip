import { useEffect, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, Globe, ShieldCheck, ShoppingBag, Sparkles, Store, Zap } from 'lucide-react'
import { userApi } from '../services/api'
import './HomeExperience.css'

const heroSlides = [
  {
    id: 'gift-cards',
    eyebrow: 'TRADE GIFT CARDS',
    title: <>Turn gift cards<br />into <span>more value.</span></>,
    description: 'Choose a supported brand, review your quote, and follow the steps to submit your gift card securely.',
    primary: 'Explore gift cards',
    destination: '/gift-cards',
    icon: CreditCard,
    visualLabel: 'GIFT CARD EXCHANGE',
    visualTitle: 'Trade with clarity.',
    visualDetail: 'Review the quote before you submit',
    theme: 'mint',
  },
  {
    id: 'store',
    eyebrow: 'SHOP THE CARDZIP STORE',
    title: <>Discover tech<br />for <span>every day.</span></>,
    description: 'Browse products from the live catalog, compare details, and check out with wallet balance or Paystack.',
    primary: 'Browse products',
    destination: '/shop',
    secondary: 'Visit business shops',
    secondaryDestination: '/shops',
    icon: ShoppingBag,
    visualLabel: 'THE CARDZIP STORE',
    visualTitle: 'Find your next essential.',
    visualDetail: 'Products, business shops and more',
    theme: 'blue',
  },
  {
    id: 'everyday',
    eyebrow: 'EVERYDAY SERVICES',
    title: <>One platform.<br /><span>More possibilities.</span></>,
    description: 'Pay bills, explore virtual numbers, use your wallet, and discover local and digital marketplaces.',
    primary: 'Explore all services',
    destination: '/about',
    secondary: 'Pay bills',
    secondaryDestination: '/bills',
    icon: Sparkles,
    visualLabel: 'BUILT AROUND YOU',
    visualTitle: 'Trade. Shop. Pay.',
    visualDetail: 'Your everyday digital economy',
    theme: 'violet',
  },
]

export default function HeroSection({ onStartTrading, onExploreUtilities, onNavigate }) {
  const [sponsoredAd, setSponsoredAd] = useState(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    let active = true
    userApi.currentAd('web-home-hero')
      .then((result) => { if (active) setSponsoredAd(result.data || null) })
      .catch((error) => console.error('Could not load home hero advertisement:', error))
    return () => { active = false }
  }, [])

  const slides = sponsoredAd?.imageUrl ? [...heroSlides, {
    id: 'sponsored',
    eyebrow: 'SPONSORED',
    title: <>{sponsoredAd.title}</>,
    description: sponsoredAd.copy,
    primary: 'Learn more',
    destination: sponsoredAd.destinationUrl || '/advertise',
    icon: Sparkles,
    visualLabel: sponsoredAd.placementName || 'FEATURED PARTNER',
    visualTitle: sponsoredAd.title,
    visualDetail: sponsoredAd.copy,
    theme: 'sponsored',
    imageUrl: sponsoredAd.imageUrl,
  }] : heroSlides

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return undefined
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [paused, reducedMotion, slides.length])

  const slide = slides[activeSlide] || slides[0]
  const SlideIcon = slide.icon
  const navigateTo = (destination) => {
    if (destination && new URL(destination, window.location.origin).origin !== window.location.origin) {
      window.open(destination, '_blank', 'noopener,noreferrer')
    } else if (destination) onNavigate?.(destination)
    else if (slide.id === 'gift-cards') onStartTrading?.()
    else onExploreUtilities?.()
  }

  const moveSlide = (direction) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length)
  }

  return (
    <div className="home-hero-wrap">
      <section
        className={`home-hero-slide home-hero-${slide.theme}`}
        aria-label="Featured Cardzip services"
        aria-roledescription="carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
        }}
      >
        {slide.imageUrl && <img className="home-hero-sponsored-image" src={slide.imageUrl} alt="" />}
        <div className="home-hero-copy" key={slide.id}>
          <span className="home-hero-eyebrow"><span />{slide.eyebrow}</span>
          <h1>{slide.title}</h1>
          <p>{slide.description}</p>
          <div className="home-hero-actions">
            <button type="button" className="home-hero-primary" onClick={() => navigateTo(slide.destination)}>
              {slide.primary}<ArrowRight size={16} />
            </button>
            {slide.secondary && <button type="button" className="home-hero-secondary" onClick={() => navigateTo(slide.secondaryDestination)}>{slide.secondary}</button>}
          </div>
          <div className="home-hero-trust"><ShieldCheck size={15} /> Clear steps, secure account access, and support when you need it.</div>
        </div>
        <div className={`home-hero-visual${slide.imageUrl ? ' has-sponsored-image' : ''}`} aria-hidden="true">
          {!slide.imageUrl && <div className="home-hero-orbit home-hero-orbit-one" />}
          {!slide.imageUrl && <div className="home-hero-orbit home-hero-orbit-two" />}
          <div className="home-hero-visual-card">
            <span className="home-hero-visual-top"><SlideIcon size={18} />{slide.visualLabel}</span>
            {slide.imageUrl && <img src={slide.imageUrl} alt="" />}
            {!slide.imageUrl && <div className="home-hero-visual-art">
              <span><CreditCard size={30} /></span>
              <span><Store size={27} /></span>
              <span><Zap size={25} /></span>
              <span><Globe size={23} /></span>
            </div>}
            <strong>{slide.visualTitle}</strong>
            <small>{slide.visualDetail}</small>
          </div>
          {!slide.imageUrl && <div className="home-hero-floating-note"><CircleDollarSign size={18} /><span><strong>One Cardzip wallet</strong><small>For everyday activity</small></span></div>}
        </div>
        <div className="home-hero-controls">
          <div className="home-hero-dots" aria-label="Choose a featured slide">
            {slides.map((item, index) => <button key={item.id} type="button" aria-label={`Show slide ${index + 1}: ${item.eyebrow}`} aria-current={activeSlide === index ? 'true' : undefined} className={activeSlide === index ? 'active' : ''} onClick={() => setActiveSlide(index)} />)}
          </div>
          <span className="home-hero-slide-count">{String(activeSlide + 1).padStart(2, '0')} <span>/</span> {String(slides.length).padStart(2, '0')}</span>
          <div className="home-hero-arrows">
            <button type="button" aria-label="Previous slide" onClick={() => moveSlide(-1)}><ChevronLeft size={17} /></button>
            <button type="button" aria-label="Next slide" onClick={() => moveSlide(1)}><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>
      <div className="home-hero-service-strip" aria-label="Explore Cardzip services">
        <span>YOUR EVERYDAY DIGITAL ECONOMY</span>
        <div><CreditCard size={15} /> Gift cards</div>
        <div><ShoppingBag size={15} /> Shopping</div>
        <div><Zap size={15} /> Bills</div>
        <div><Globe size={15} /> Virtual numbers</div>
      </div>
    </div>
  )
}
