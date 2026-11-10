import { useState } from 'react'
import BookingCalculator from './home/BookingCalculator'
import CustomerReviews from './home/CustomerReviews'
import ServiceFooter from './home/ServiceFooter'
import ServiceHeader from './home/ServiceHeader'
import ServiceHero from './home/ServiceHero'
import ServicePackages from './home/ServicePackages'
import { isZipCodeCovered } from './home/serviceData'
import './HomePage.css'

function HomePage() {
  const [zipCode, setZipCode] = useState('')
  const [coverage, setCoverage] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState('signature')

  const updateZipCode = (value) => {
    setZipCode(value)
    setCoverage(null)
  }

  const checkAvailability = (value) => {
    const normalizedZip = value.trim()
    setZipCode(normalizedZip)
    setCoverage(normalizedZip.length === 5 ? isZipCodeCovered(normalizedZip) : null)
  }

  return (
    <div className="service-home">
      <ServiceHeader />
      <main>
        <ServiceHero
          zipCode={zipCode}
          coverage={coverage}
          onZipCodeChange={updateZipCode}
          onAvailabilityCheck={checkAvailability}
        />
        <ServicePackages
          selectedPackage={selectedPackage}
          onSelectPackage={setSelectedPackage}
        />
        <BookingCalculator
          zipCode={zipCode}
          selectedPackage={selectedPackage}
          onZipCodeChange={updateZipCode}
          onAvailabilityCheck={checkAvailability}
          onSelectPackage={setSelectedPackage}
        />
        <CustomerReviews />
      </main>
      <ServiceFooter />
    </div>
  )
}

export default HomePage
