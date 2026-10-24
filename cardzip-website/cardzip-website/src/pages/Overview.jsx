import HeroSection from '../components/HeroSection'
import EcosystemServices from '../components/EcosystemServices'
import GlobalConnectivity from '../components/GlobalConnectivity'
import TrustAndFaq from '../components/TrustAndFaq'
import AppDownloadFooter from '../components/AppDownloadFooter'
import HomeProductsSection from '../components/HomeProductsSection'


export default function Overview({ onNavigate }) {
  return (
    <div className="overview-container">
    

      {/* Main Content Area */}
      <main className="overview-main-content">
        <HeroSection
          onStartTrading={() => onNavigate?.('/gift-cards')}
          onExploreUtilities={() => onNavigate?.('/bills')}
          onNavigate={onNavigate}
        />
        <HomeProductsSection onNavigate={onNavigate} />
        <EcosystemServices onNavigate={onNavigate} />
        <GlobalConnectivity onExploreClick={() => onNavigate?.('/virtual-numbers')} />
        <TrustAndFaq onNavigate={onNavigate} />
      </main>

      {/* Footer */}
      <AppDownloadFooter onNavigate={onNavigate} />

    
    </div>
  )
}