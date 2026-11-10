import HeroSection from '../components/HeroSection'
import EcosystemServices from '../components/EcosystemServices'
import GlobalConnectivity from '../components/GlobalConnectivity'
import TrustAndFaq from '../components/TrustAndFaq'
import AppDownloadFooter from '../components/AppDownloadFooter'
import HomeProductsSection from '../components/HomeProductsSection'
import AdvertisementBanner from '../components/AdvertisementBanner'


export default function Overview({ onNavigate, featureSettings }) {
  return (
    <div className="overview-container">
    

      {/* Main Content Area */}
      <main className="overview-main-content">
        <HeroSection
          onStartTrading={() => onNavigate?.('/gift-cards')}
          onExploreUtilities={() => onNavigate?.(featureSettings?.vtpassBillsEnabled === false ? '/about' : '/bills')}
          onNavigate={onNavigate}
          featureSettings={featureSettings}
        />
        <AdvertisementBanner placementKey="home-promo" fallbackOnly onNavigate={onNavigate} />
        <HomeProductsSection onNavigate={onNavigate} />
        <EcosystemServices onNavigate={onNavigate} featureSettings={featureSettings} />
        {featureSettings?.esimEnabled !== false && <GlobalConnectivity onExploreClick={() => onNavigate?.('/virtual-numbers')} />}
        <TrustAndFaq onNavigate={onNavigate} />
      </main>

      {/* Footer */}
      <AppDownloadFooter onNavigate={onNavigate} />

    
    </div>
  )
}