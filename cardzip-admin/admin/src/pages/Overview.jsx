import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import StatsOverview from '../components/StatsOverview'
import UserRegistryTable from '../components/UserRegistryTable'
import WithdrawalRequestsCard from '../components/WithdrawalRequestsCard'
import BillPaymentsControl from '../components/BillPaymentsControl'
import OrderAndGiftCardManager from '../components/OrderAndGiftCardManager'
import TransactionLogsFeed from '../components/TransactionLogsFeed'
import { adminApi } from '../services/api'

const periodOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

const makePeriodQuery = (period, userFilters) => {
  const query = new URLSearchParams()
  if (period === 'month') query.set('month', new Date().toISOString().slice(0, 7))
  if (['7', '30', '90'].includes(period)) {
    const from = new Date()
    from.setDate(from.getDate() - Number(period))
    query.set('from', from.toISOString())
  }
  if (userFilters.kyc !== 'all') query.set('kycStatus', userFilters.kyc)
  if (userFilters.wallet !== 'all') query.set('wallet', userFilters.wallet)
  return query.size ? `?${query.toString()}` : ''
}

export default function Overview({ onNavigate, onViewUser }) {
  const [period, setPeriod] = useState('30')
  const [userFilters, setUserFilters] = useState({ kyc: 'all', wallet: 'all' })
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    adminApi.overview(makePeriodQuery(period, userFilters))
      .then((result) => {
        if (active) {
          setDashboard(result.data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [period, refreshKey, userFilters])

  const changePeriod = (value) => {
    setLoading(true)
    setPeriod(value)
  }
  const refresh = () => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }
  const data = dashboard || { stats: {}, histories: {} }
  const histories = data.histories || {}

  return (
    <div className="overview-wrapper">
      <header className="overview-page-header">
        <div><span className="overview-section-kicker">CARDZIP ADMIN</span><h1>Overview</h1><p>Live customer, wallet, bill payment and commerce activity.</p></div>
        <div className="overview-header-controls">
          <CustomSelect
            ariaLabel="Filter dashboard history by period"
            className="overview-period-select"
            value={period}
            options={periodOptions}
            onChange={changePeriod}
          />
          <button type="button" className="overview-refresh-button" disabled={loading} onClick={refresh}>
            <RefreshCw size={15} className={loading ? 'overview-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      {error && <div className="overview-error" role="alert"><AlertCircle size={17} /><span>{error}</span><button type="button" onClick={refresh}>Try again</button></div>}
      <StatsOverview stats={data.stats} loading={loading && !dashboard} onNavigate={onNavigate} />
      <UserRegistryTable
        users={histories.users || []}
        totalUsers={Number(data.stats?.totalUsers || 0)}
        pendingKyc={Number(data.stats?.pendingKyc || 0)}
        filters={userFilters}
        onFiltersChange={setUserFilters}
        loading={loading && !dashboard}
        onManage={() => onNavigate?.('Users')}
        onViewUser={onViewUser}
      />

      <div className="overview-two-col">
        <WithdrawalRequestsCard
          withdrawals={histories.withdrawals || []}
          count={Number(data.stats?.pendingWithdrawals || 0)}
          loading={loading && !dashboard}
          onViewAll={() => onNavigate?.('Withdrawals')}
        />
        <BillPaymentsControl
          bills={histories.bills || []}
          stats={data.stats?.bills}
          loading={loading && !dashboard}
          onViewAll={() => onNavigate?.('Bill Payments')}
        />
      </div>

      <OrderAndGiftCardManager
        orders={histories.orders || []}
        giftCards={histories.giftCards || []}
        orderStats={data.stats?.storeOrders}
        giftCardStats={data.stats?.giftCards}
        loading={loading && !dashboard}
        onViewOrders={() => onNavigate?.('E-Commerce')}
        onViewGiftCards={() => onNavigate?.('Trade History')}
      />
      <TransactionLogsFeed
        transactions={histories.transactions || []}
        loading={loading && !dashboard}
        onViewAll={() => onNavigate?.('Admin Wallet')}
      />
    </div>
  )
}
