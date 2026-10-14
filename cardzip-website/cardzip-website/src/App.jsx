import { useCallback, useEffect, useState } from 'react'
import { LifeBuoy } from 'lucide-react'
import Header from './components/Header'
import Overview from './pages/Overview'
import Login from './pages/Login'
import ForgotPasswordPage from './pages/forgotpassword'
import ProfilePage from './pages/profile'
import ReferralPage from './pages/ReferralPage'
import GiftCardTradePage from './pages/GiftCardTradePage'
import TradeHistoryPage from './pages/TradeHistoryPage'
import VirtualNumbersPage from './pages/VirtualNumbersPage'
import ShopPage from './pages/ShopPage'
import ShopPageWithCart from './pages/ShopPageWithCart'
import ProductDetailsPage from './pages/ProductDetailsPage'
import BillsPaymentPage from './pages/BillsPaymentPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import TrackReceiptPage from './pages/TrackReceiptPage'
import BillHistoryPage from './pages/BillHistoryPage'
import StorePaymentHistoryPage from './pages/StorePaymentHistoryPage'
import SupportRequestsPage from './pages/SupportRequestsPage'
import PaymentCallbackPage from './pages/PaymentCallbackPage'
import WalletPage, {
  AddMoneyPage,
  AddMoneyHistoryPage,
  WithdrawalPage,
  WithdrawalHistoryPage,
  BalanceHistoryPage,
  BankAccountsPage,
} from './pages/WalletPages'
import { getUserToken, setUserToken, userApi } from './services/api'
import './App.css'

const pages = {
  '/': { tab: 'home', component: Overview },
  '/esim': { tab: 'esim', component: VirtualNumbersPage },
  '/gift-cards': { tab: 'gift-cards', component: GiftCardTradePage },
  '/trade-history': { tab: 'gift-cards', component: TradeHistoryPage },
  '/virtual-numbers': { tab: 'esim', component: VirtualNumbersPage },
  '/shop': { tab: 'shop', component: ShopPage },
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
  '/support': { tab: 'profile', component: SupportRequestsPage },
}

function FloatingSupportButton({ onClick }) {
  return (
    <button type="button" className="floating-support-button" onClick={onClick} aria-label="Contact Cardzip support" title="Contact support">
      <LifeBuoy size={20} /><span>Support</span>
    </button>
  )
}

function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(!getUserToken())

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
    || path === '/payment/callback'

  useEffect(() => {
    if (requiresAuthentication && authChecked && !user) {
      window.location.replace(`/login?redirect=${encodeURIComponent(path)}`)
    }
  }, [requiresAuthentication, authChecked, user, path])

  if (path === '/login' || path === '/signup') {
    return (
      <Login
        initialMode={path === '/signup' ? 'signup' : 'login'}
        onForgotPassword={() => navigate('/forgot-password')}
        onAuthenticated={(session) => {
          setUserToken(session.token)
          setUser(session.user)
          const requestedPath = new URLSearchParams(window.location.search).get('redirect')
          navigate(requestedPath?.startsWith('/') && requestedPath !== '/login' ? requestedPath : '/', true)
        }}
      />
    )
  }

  if (path === '/forgot-password') {
    return <ForgotPasswordPage onBackToLogin={() => navigate('/login')} />
  }

  const productSlug = path.startsWith('/product/') ? path.slice('/product/'.length) : null
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
      'gift-cards': '/gift-cards',
      esim: '/virtual-numbers',
      shop: '/shop',
      bills: '/bills',
      wallet: '/wallet',
    }
    navigate(pathsByTab[tab] || '/')
  }
  if (!page && !productSlug && !orderId) {
    return (
      <div className="app-container">
        <Header currentTab="home" onSelectTab={(tab) => selectTab(tab)} onOpenDashboard={() => navigate('/profile')} onOpenWallet={() => navigate('/wallet')} onLogout={logout} />
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
  const Page = productSlug ? ProductDetailsPage : orderId ? TrackReceiptPage : page.component

  return (
    <div className="app-container">
      <Header
        currentTab={page?.tab || (productSlug ? 'shop' : 'home')}
        onSelectTab={selectTab}
        onOpenDashboard={() => navigate('/profile')}
        onOpenWallet={() => navigate('/wallet')}
        onLogout={logout}
      />
      <main className="app-main-content">
        <Page key={productSlug || orderId || path} onNavigate={navigate} productSlug={productSlug} orderId={orderId} user={user} />
      </main>
      {path !== '/support' && <FloatingSupportButton onClick={() => navigate('/support')} />}
    </div>
  )
}

export default App