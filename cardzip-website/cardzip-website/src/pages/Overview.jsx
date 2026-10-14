import HeroSection from '../components/HeroSection'
import EcosystemServices from '../components/EcosystemServices'
import GlobalConnectivity from '../components/GlobalConnectivity'
import TrustAndFaq from '../components/TrustAndFaq'
import AppDownloadFooter from '../components/AppDownloadFooter'


export default function Overview({ onNavigate }) {
  return (
    <div className="overview-container">
    

      {/* Main Content Area */}
      <main className="overview-main-content">
        <HeroSection
          onStartTrading={() => onNavigate?.('/gift-cards')}
          onExploreUtilities={() => onNavigate?.('/bills')}
        />
        <EcosystemServices onNavigate={onNavigate} />
        <GlobalConnectivity />
        <TrustAndFaq onNavigate={onNavigate} />
      </main>

      {/* Footer */}
      <AppDownloadFooter onNavigate={onNavigate} />

    
    </div>
  )
}