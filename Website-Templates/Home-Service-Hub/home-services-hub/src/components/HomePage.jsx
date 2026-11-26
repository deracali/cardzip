import HomeFooter from './home/HomeFooter'
import HomeHeader from './home/HomeHeader'
import HomeHero from './home/HomeHero'
import EmergencyBanner from './home/EmergencyBanner'
import CustomerReviews from './home/CustomerReviews'
import './HomePage.css'

function HomePage() {
  return (
    <div className="fixflow-home">
      <HomeHeader />
      <main>
        <HomeHero />
        <CustomerReviews />
        <EmergencyBanner />
      </main>
      <HomeFooter />
    </div>
  )
}

export default HomePage
