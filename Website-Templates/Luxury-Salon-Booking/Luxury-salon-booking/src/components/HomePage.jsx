import SalonFooter from './salon/SalonFooter'
import SalonHeader from './salon/SalonHeader'
import SalonHero from './salon/SalonHero'
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
        <section className="salon-home-shortcuts" aria-label="Explore Lumière">
          <a href="/services"><span>01</span><strong>Explore services</strong><small>Our full salon and wellness menu</small></a>
          <a href="/stylists"><span>02</span><strong>Meet the artists</strong><small>Find the right hands for your ritual</small></a>
          <a href="/reviews"><span>03</span><strong>Read client stories</strong><small>See what our regulars are saying</small></a>
        </section>
      </main>
      <SalonFooter />
    </div>
  )
}

export default HomePage
