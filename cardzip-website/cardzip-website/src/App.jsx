import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { LifeBuoy } from 'lucide-react'
import Header from './components/Header'
const Overview = lazy(() => import('./pages/Overview'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPasswordPage = lazy(() => import('./pages/forgotpassword'))
const ProfilePage = lazy(() => import('./pages/profile'))
const ReferralPage = lazy(() => import('./pages/ReferralPage'))
const RewardsPage = lazy(() => import('./pages/RewardsPage'))
const GiftCardTradePage = lazy(() => import('./pages/GiftCardTradePage'))
const TradeHistoryPage = lazy(() => import('./pages/TradeHistoryPage'))
const VirtualNumbersPage = lazy(() => import('./pages/VirtualNumbersPage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const DigitalAssetsPage = lazy(() => import('./pages/DigitalAssetsPage'))
const DigitalAssetDetailsPage = lazy(() => import('./pages/DigitalAssetDetailsPage'))
const SubmitDigitalAssetPage = lazy(() => import('./pages/SubmitDigitalAssetPage'))
const ShopDirectoryPage = lazy(() => import('./pages/ShopDirectoryPage'))
const CreateShopPage = lazy(() => import('./pages/CreateShopPage'))
const MyShopPage = lazy(() => import('./pages/MyShopPage'))
const ShopProfilePage = lazy(() => import('./pages/ShopProfilePage'))
const ShopProductDetailsPage = lazy(() => import('./pages/ShopProductDetailsPage'))
const CommunityMarketPage = lazy(() => import('./pages/CommunityMarketPage'))
const CommunityListingDetailsPage = lazy(() => import('./pages/CommunityListingDetailsPage'))
const ShopPageWithCart = lazy(() => import('./pages/ShopPageWithCart'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'))
const BillsPaymentPage = lazy(() => import('./pages/BillsPaymentPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'))
const TrackReceiptPage = lazy(() => import('./pages/TrackReceiptPage'))
const BillHistoryPage = lazy(() => import('./pages/BillHistoryPage'))
const StorePaymentHistoryPage = lazy(() => import('./pages/StorePaymentHistoryPage'))
const SupportRequestsPage = lazy(() => import('./pages/SupportRequestsPage'))
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'))
const AdvertisePage = lazy(() => import('./pages/AdvertisePage'))
const MyAdvertsPage = lazy(() => import('./pages/AdvertisePage').then((module) => ({ default: module.MyAdvertsPage })))
const WalletPage = lazy(() => import('./pages/WalletPages'))
const AddMoneyPage = lazy(() => import('./pages/WalletPages').then((module) => ({ default: module.AddMoneyPage })))
const AddMoneyHistoryPage = lazy(() => import('./pages/WalletPages').then((module) => ({ default: module.AddMoneyHistoryPage })))
const WithdrawalPage = lazy(() => import('./pages/WalletPages').then((module) => ({ default: module.WithdrawalPage })))
const WithdrawalHistoryPage = lazy(() => import('./pages/WalletPages').then((module) => ({ default: module.WithdrawalHistoryPage })))
const BalanceHistoryPage = lazy(() => import('./pages/WalletPages').then((module) => ({ default: module.BalanceHistoryPage })))
const BankAccountsPage = lazy(() => import('./pages/WalletPages').then((module) => ({ default: module.BankAccountsPage })))
import { getUserToken, setUserToken, userApi } from './services/api'
import './App.css'

const pages = {
  '/': { tab: 'home', component: Overview },
  '/about': { tab: 'about', component: AboutPage },
  '/esim': { tab: 'esim', component: VirtualNumbersPage },
  '/gift-cards': { tab: 'gift-cards', component: GiftCardTradePage },
  '/trade-history': { tab: 'gift-cards', component: TradeHistoryPage },
  '/virtual-numbers': { tab: 'esim', component: VirtualNumbersPage },
  '/shop': { tab: 'shop', component: ShopPage },
  '/digital-assets': { tab: 'shop', component: DigitalAssetsPage },
  '/digital-assets/sell': { tab: 'shop', component: SubmitDigitalAssetPage },
  '/shops': { tab: 'shop', component: ShopDirectoryPage },
  '/shops/create': { tab: 'shop', component: CreateShopPage },
  '/my-shop': { tab: 'shop', component: MyShopPage },
  '/advertise': { tab: 'shop', component: AdvertisePage },
  '/my-adverts': { tab: 'shop', component: MyAdvertsPage },
  '/community-market': { tab: 'shop', component: CommunityMarketPage },
  '/cart': { tab: 'shop', component: ShopPageWithCart },
  '/bills': { tab: 'bills', component: BillsPaymentPage },
  '/checkout': { tab: 'shop', component: CheckoutPage },
  '/orders': { tab: 'shop', component: OrderHistoryPage },
  '/bill-history': { tab: 'bills', component: BillHistoryPage },
  '/store-payment-history': { tab: 'shop', component: StorePaymentHistoryPage },
  '/payment/callback': { tab: 'wallet', component: PaymentCallbackPage },
  '/wallet': { tab: 'wallet', component: WalletPage },
  '/add-money': { tab: 'wallet', component: AddMoneyPage },
  '/add-money-history': { tab: 'wallet', component: AddMoneyHistoryPage },
  '/withdraw': { tab: 'wallet', component: WithdrawalPage },
  '/withdrawal-history': { tab: 'wallet', component: WithdrawalHistoryPage },
  '/balance-history': { tab: 'wallet', component: BalanceHistoryPage },
  '/bank-accounts': { tab: 'wallet', component: BankAccountsPage },
  '/profile': { tab: 'profile', component: ProfilePage },
  '/referrals': { tab: 'profile', component: ReferralPage },
  '/rewards': { tab: 'profile', component: RewardsPage },
  '/support': { tab: 'profile', component: SupportRequestsPage },
}

function FloatingSupportButton({ onClick }) {
  return (
    <button type="button" className="floating-support-button" onClick={onClick} aria-label="Contact Cardzip support" title="Contact support">
      <LifeBuoy size={20} /><span>Support</span>
    </button>
  )
}

function FeatureUnavailablePage({ onNavigate, title }) {
  return (
    <section className="page-container" role="status">
      <h1>{title} are temporarily unavailable</h1>
      <p>This service is currently turned off. Please check back later.</p>
      <button type="button" className="btn-primary" onClick={() => onNavigate('/')}>Go to home</button>
    </section>
  )
}

function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(!getUserToken())
  const [featureSettings, setFeatureSettings] = useState({ esimEnabled: true, vtpassBillsEnabled: true })

  useEffect(() => {
    let active = true
    userApi.featureSettings()
      .then((result) => { if (active) setFeatureSettings(result.data) })
      .catch((error) => console.error('Could not load service availability:', error))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!getUserToken()) return
    userApi.account()
      .then((result) => setUser({ ...result.data.user, referralCode: result.data.referralCode }))
      .catch(() => setUserToken(null))
      .finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((nextPath, replace = false) => {
    const destination = new URL(nextPath, window.location.origin)
    const current = `${window.location.pathname}${window.location.search}`
    const target = `${destination.pathname}${destination.search}${destination.hash}`
    if (current !== target) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', target)
    }
    setPath(destination.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const requiresAuthentication = path.startsWith('/wallet') || path === '/add-money' ||
    path === '/bills' || path === '/add-money-history' || path === '/withdraw' || path === '/withdrawal-history' ||
    path === '/balance-history' || path === '/bank-accounts' || path === '/checkout' ||
    path === '/orders' || path.startsWith('/orders/') || path === '/trade-history' ||
    path === '/profile' || path === '/bill-history' ||
    path === '/store-payment-history' || path === '/referrals' || path === '/support'
    || path === '/rewards' || path === '/payment/callback' || path === '/advertise' || path === '/my-adverts'
    || path === '/digital-assets/sell'

  useEffect(() => {
    if (requiresAuthentication && authChecked && !user) {
      window.location.replace(`/login?redirect=${encodeURIComponent(path)}`)
    }
  }, [requiresAuthentication, authChecked, user, path])

  if (path === '/login' || path === '/signup') {
    return (
      <Suspense fallback={<main className="session-loading" role="status">Loading…</main>}><Login
        initialMode={path === '/signup' ? 'signup' : 'login'}
        onForgotPassword={() => navigate('/forgot-password')}
        onAuthenticated={(session) => {
          setUserToken(session.token)
          setUser(session.user)
          const requestedPath = new URLSearchParams(window.location.search).get('redirect')
          navigate(requestedPath?.startsWith('/') && requestedPath !== '/login' ? requestedPath : '/', true)
        }}
      /></Suspense>
    )
  }

  if (path === '/forgot-password') {
    return <Suspense fallback={<main className="session-loading" role="status">Loading…</main>}><ForgotPasswordPage onBackToLogin={() => navigate('/login')} /></Suspense>
  }

  const productSlug = path.startsWith('/product/') ? path.slice('/product/'.length) : null
  const shopProductMatch = path.match(/^\/shops\/([^/]+)\/products\/([^/]+)$/)
  const shopProductSlug = shopProductMatch?.[2] || null
  const shopProductShopSlug = shopProductMatch?.[1] || null
  const digitalAssetSlug = path.startsWith('/digital-assets/') && path !== '/digital-assets/sell' ? path.slice('/digital-assets/'.length) : null
  const communityListingId = path.startsWith('/community-market/') ? path.slice('/community-market/'.length) : null
  const shopSlug = path.startsWith('/shops/') && path !== '/shops/create' && !shopProductMatch
    ? path.slice('/shops/'.length)
    : null
  const orderId = path.startsWith('/orders/') ? path.slice('/orders/'.length) : null
  const page = pages[path]
  if (requiresAuthentication && !user) {
    if (!authChecked) return <main className="session-loading" role="status"><span className="session-brand">C</span><span className="session-spinner" />LOADING CARDZIP</main>
    return null
  }
  const logout = () => {
    setUserToken(null)
    setUser(null)
    navigate('/login', true)
  }
  const selectTab = (tab) => {
    if (typeof tab === 'string' && tab.startsWith('/')) {
      navigate(tab)
      return
    }
    const pathsByTab = {
      home: '/',
      about: '/about',
      'gift-cards': '/gift-cards',
      esim: '/virtual-numbers',
      shop: '/shop',
      bills: '/bills',
      wallet: '/wallet',
    }
    navigate(pathsByTab[tab] || '/')
  }
  if (!page && !productSlug && !digitalAssetSlug && !communityListingId && !orderId && !shopSlug && !shopProductSlug) {
    return (
      <div className="app-container">
        <Header currentTab="home" onSelectTab={(tab) => selectTab(tab)} onOpenDashboard={() => navigate('/profile')} onOpenWallet={() => navigate('/wallet')} user={user} featureSettings={featureSettings} />
        <main className="app-main-content">
          <section className="page-container" role="status">
            <h1>Page not found</h1>
            <p>The page you requested does not exist.</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/')}>Go to home</button>
          </section>
        </main>
        <FloatingSupportButton onClick={() => navigate('/support')} />
      </div>
    )
  }
  const serviceDisabled = (
    (['/esim', '/virtual-numbers'].includes(path) && !featureSettings.esimEnabled)
    || (path === '/bills' && !featureSettings.vtpassBillsEnabled)
  )
  const Page = serviceDisabled
    ? FeatureUnavailablePage
    : communityListingId
    ? CommunityListingDetailsPage
    : shopProductSlug
    ? ShopProductDetailsPage
    : shopSlug
    ? ShopProfilePage
    : digitalAssetSlug
      ? DigitalAssetDetailsPage
    : productSlug
      ? ProductDetailsPage
      : orderId
        ? TrackReceiptPage
        : page.component

  return (
    <div className="app-container">
      <Header
        currentTab={page?.tab || (productSlug || digitalAssetSlug || communityListingId || shopSlug || shopProductSlug ? 'shop' : 'home')}
        onSelectTab={selectTab}
        onOpenDashboard={() => navigate('/profile')}
        onOpenWallet={() => navigate('/wallet')}
        user={user}
        featureSettings={featureSettings}
      />
      <main className="app-main-content">
        <Suspense fallback={<main className="session-loading" role="status"><span className="session-brand">C</span><span className="session-spinner" />LOADING CARDZIP</main>}>
          <Page key={productSlug || digitalAssetSlug || communityListingId || shopProductSlug || shopSlug || orderId || path} onNavigate={navigate} onLogout={logout} productSlug={productSlug} digitalAssetSlug={digitalAssetSlug} listingId={communityListingId} shopSlug={shopProductShopSlug || shopSlug} shopProductSlug={shopProductSlug} orderId={orderId} user={user} featureSettings={featureSettings} title={path === '/bills' ? 'Bill payments' : 'eSIM / virtual numbers'} />
        </Suspense>
      </main>
      {path !== '/support' && <FloatingSupportButton onClick={() => navigate('/support')} />}
    </div>
  )
}

export default App