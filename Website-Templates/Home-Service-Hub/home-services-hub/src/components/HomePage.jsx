import HomeFooter from './home/HomeFooter'
import HomeHeader from './home/HomeHeader'
import HomeHero from './home/HomeHero'
import PriceEstimator from './home/PriceEstimator'
import EmergencyBanner from './home/EmergencyBanner'
import ServiceGrid from './home/ServiceGrid'
import CustomerReviews from './home/CustomerReviews'
import './HomePage.css'

function HomePage({ selectedRepair = 'pipe', onRepairChange = () => {} }) {
  return (
    <div className="fixflow-home">
      <HomeHeader />
      <main>
        <HomeHero />
        <PriceEstimator selectedRepair={selectedRepair} onRepairChange={onRepairChange} />
        <ServiceGrid onSelectRepair={onRepairChange} />
        <CustomerReviews />
        <EmergencyBanner />
      </main>
      <HomeFooter />
    </div>
  )
}

export default HomePage
