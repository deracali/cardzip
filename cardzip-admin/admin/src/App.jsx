import { lazy, Suspense, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

// Page Imports from your pages directory
import Overview from './pages/Overview'
import UsersPage from './pages/UsersPage.jsx' // Note: matches filename in image
import UserDetailsPage from './pages/UserDetailsPage'
import TreasuryPage from './pages/TreasuryPage'
import AdminWalletPage from './pages/AdminWalletPage'
import AddMoneyPage from './pages/AddMoneyPage'
import WithdrawalsPage from './pages/WithdrawalsApiPage'
import BillPaymentsPage from './pages/BillPaymentsPage'
import EsimPage from './pages/EsimPage'
import EcommerceOrderDetailsPage from './pages/EcommerceOrderDetailsPage'
import GiftCardsPage from './pages/GiftCardsPage'
import PendingGiftCardsPage from './pages/PendingGiftCardsPage'
import StaffPage from './pages/StaffManagementPage'
import ProfilePage from './pages/ProfilePage'
import TradeHistoryPage from './pages/TradeHistoryPage'
import Login from './pages/Login'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import MyTasksPage from './pages/MyTasksPage'
import MyAttendancePage from './pages/MyAttendancePage'
import ExpensesPage from './pages/ExpensesPage'
import LetterheadPage from './pages/LetterheadPage'
import KycReviewsPage from './pages/KycReviewsPage'
import WhatsAppInboxPage from './pages/WhatsAppInboxPage'
import CardzipLoader from './components/CardzipLoader'
import { adminApi, getAdminToken, setAdminToken } from './services/api'

import './App.css'
import './responsive.css'

const EcommercePage = lazy(() => import('./pages/EcommercePage'))

function App() {
  const [admin, setAdmin] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(Boolean(getAdminToken()))
  const [activeTab, setActiveTab] = useState('Overview')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedStoreOrder, setSelectedStoreOrder] = useState(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    if (!getAdminToken()) return
    adminApi.profile()
      .then((result) => {
        setAdmin({ ...result.data.admin, totalUsers: result.data.totalUsers })
        setActiveTab(result.data.admin.visiblePages?.[0] || (result.data.admin.role === 'staff' ? 'My Tasks' : 'Overview'))
      })
      .catch(() => setAdminToken(null))
      .finally(() => setSessionLoading(false))
  }, [])

  const handleLogin = (session) => {
    setAdminToken(session.token)
    setAdmin({ ...session.admin, totalUsers: null })
    setActiveTab(session.admin.visiblePages?.[0] || (session.admin.role === 'staff' ? 'My Tasks' : 'Overview'))
    adminApi.profile()
      .then((result) => {
        setAdmin((current) => current?.id === result.data.admin.id
          ? { ...result.data.admin, totalUsers: result.data.totalUsers }
          : current)
      })
      .catch((error) => console.error('Could not load admin sidebar details:', error))
  }

  const handleLogout = () => {
    setAdminToken(null)
    setAdmin(null)
    setActiveTab('Overview')
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview
          onNavigate={setActiveTab}
          onViewUser={(id) => { setSelectedUserId(id); setActiveTab('User Details') }}
        />
      case 'Users':
        return <UsersPage onViewUser={(id) => { setSelectedUserId(id); setActiveTab('User Details') }} />
      case 'KYC Reviews':
        return <KycReviewsPage onViewUser={(id) => { setSelectedUserId(id); setActiveTab('User Details') }} />
      case 'WhatsApp Inbox':
        return <WhatsAppInboxPage />
      case 'User Details':
        return <UserDetailsPage userId={selectedUserId} onBack={() => setActiveTab('Users')} />
      case 'Treasury':
        return <TreasuryPage />
      case 'Admin Wallet':
        return <AdminWalletPage />
      case 'Add Money':
        return <AddMoneyPage />
      case 'Withdrawals':
        return <WithdrawalsPage />
      case 'Trade History':
        return <TradeHistoryPage />
      case 'Bill Payments':
        return <BillPaymentsPage />
      case 'Virtual Numbers':
        return <EsimPage />
      case 'E-Commerce':
        return <Suspense fallback={<CardzipLoader label="Loading orders…" />}>
          <EcommercePage key="orders" section="orders" onViewOrder={(order) => { setSelectedStoreOrder(order); setActiveTab('Order Details') }} />
        </Suspense>
      case 'Store Products':
        return <Suspense fallback={<CardzipLoader label="Loading store products…" />}>
          <EcommercePage key="products" section="products" />
        </Suspense>
      case 'Digital Submissions':
        return <Suspense fallback={<CardzipLoader label="Loading digital submissions…" />}>
          <EcommercePage key="digital-assets" section="digital-assets" />
        </Suspense>
      case 'Shop Verification':
        return <Suspense fallback={<CardzipLoader label="Loading shop applications…" />}>
          <EcommercePage key="shops" section="shops" />
        </Suspense>
      case 'Marketplace Promotions':
        return <Suspense fallback={<CardzipLoader label="Loading marketplace promotions…" />}>
          <EcommercePage key="promotions" section="promotions" />
        </Suspense>
      case 'Banner Ads':
        return <Suspense fallback={<CardzipLoader label="Loading E-Commerce…" />}>
          <EcommercePage key="ads" section="ads" />
        </Suspense>
      case 'Order Details':
        return <EcommerceOrderDetailsPage order={selectedStoreOrder} onBack={() => setActiveTab(admin.role === 'staff' ? 'My Tasks' : 'E-Commerce')} />
      case 'Gift Cards':
        return <GiftCardsPage />
      case 'Pending Gift Card Reviews':
        return <PendingGiftCardsPage />
      case 'Staff':
        return <StaffPage />
      case 'My Tasks':
        return <MyTasksPage onViewOrder={(order) => { setSelectedStoreOrder(order); setActiveTab('Order Details') }} />
      case 'My Attendance':
        return <MyAttendancePage />
      case 'Expenses':
        return <ExpensesPage />
      case 'Company Letterhead':
        return <LetterheadPage />
      case 'Profile':
        return <ProfilePage admin={admin} />
      default:
        return <Overview
          onNavigate={setActiveTab}
          onViewUser={(id) => { setSelectedUserId(id); setActiveTab('User Details') }}
        />
    }
  }

  // 1. Show full-screen Login page when not authenticated
  if (sessionLoading) return <div className="login-wrapper"><CardzipLoader label="Checking your admin session…" /></div>
  if (!admin) {
    if (showForgotPassword) {
      return <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />
    }
    return <Login onLogin={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} />
  }

  // 2. Show main dashboard when authenticated
  return (
    <div className="app-container">
      <Sidebar
        activeTab={
          activeTab === 'User Details'
            ? 'Users'
            : activeTab === 'Order Details'
              ? 'E-Commerce'
              : activeTab
        }
        setActiveTab={setActiveTab}
        admin={admin}
        onLogout={handleLogout}
      />
      <div className="main-wrapper">
        <Header
          onExport={() => window.print()}
          onQuickAction={() => setActiveTab(admin.role === 'staff' ? 'My Tasks' : 'Withdrawals')}
        />
        <main className="dashboard-content">
          {admin.role !== 'staff' || admin.visiblePages?.includes(activeTab) || (activeTab === 'KYC Reviews' && admin.visiblePages?.includes('Users')) || (activeTab === 'User Details' && admin.visiblePages?.includes('Users')) || activeTab === 'My Tasks' || (activeTab === 'Order Details' && Boolean(selectedStoreOrder))
            ? renderPage()
            : <div className="section-card"><h2>Access restricted</h2><p>Your administrator has not assigned this page to your staff account.</p></div>}
        </main>
      </div>
    </div>
  )
}

export default App