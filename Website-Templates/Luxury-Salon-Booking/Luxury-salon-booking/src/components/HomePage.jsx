import BookingSection from './salon/BookingSection'
import ReviewsSection from './salon/ReviewsSection'
import SalonFooter from './salon/SalonFooter'
import SalonHeader from './salon/SalonHeader'
import SalonHero from './salon/SalonHero'
import ServicesSection from './salon/ServicesSection'
import './salon/salon.css'

function HomePage() {
  return (
    <div className="salon-home">
      <SalonHeader />
      <main>
        <SalonHero />
        <div className="salon-promise-bar" aria-label="Our promises">
          <span>✦ Balayage experts</span>
          <span>✦ Organic skincare</span>
          <span>✦ Same-day booking</span>
          <span>✦ Bridal concierge</span>
          <span>✦ 4.9 rated studio</span>
        </div>
        <ServicesSection />
        <BookingSection />
        <ReviewsSection />
      </main>
      <SalonFooter />
    </div>
  )
}

export default HomePage
