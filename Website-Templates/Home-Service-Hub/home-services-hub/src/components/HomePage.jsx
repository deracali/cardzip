import { useState } from 'react'
import HomeFooter from './home/HomeFooter'
import HomeHeader from './home/HomeHeader'
import HomeHero from './home/HomeHero'
import PriceEstimator from './home/PriceEstimator'
import EmergencyBanner from './home/EmergencyBanner'
import ServiceGrid from './home/ServiceGrid'
import CustomerReviews from './home/CustomerReviews'
import './HomePage.css'

function HomePage() {
  const [selectedRepair, setSelectedRepair] = useState('pipe')

  return (
    <div className="fixflow-home">
      <HomeHeader />
      <main>
        <HomeHero />
        <PriceEstimator selectedRepair={selectedRepair} onRepairChange={setSelectedRepair} />
        <ServiceGrid onSelectRepair={setSelectedRepair} />
        <CustomerReviews />
        <EmergencyBanner />
      </main>
      <HomeFooter />
    </div>
  )
}

export default HomePage
