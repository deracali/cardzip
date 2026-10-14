const formatNaira = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
const formatCount = (value) => Number(value || 0).toLocaleString('en-NG')

export default function StatsOverview({ stats = {}, loading = false, onNavigate }) {
  const statsData = [
    { title: 'Total users', value: formatCount(stats.totalUsers), subtext: 'Registered customer accounts', badgeType: 'green' },
    { title: 'Pending KYC', value: formatCount(stats.pendingKyc), subtext: 'Awaiting verification', badgeType: 'amber' },
    { title: 'Period volume', value: formatNaira(stats.periodVolume), subtext: 'Bills, gift-card payouts and paid orders', badgeType: 'green' },
    { title: 'Pending withdrawals', value: formatCount(stats.pendingWithdrawals), subtext: `${formatNaira(stats.pendingWithdrawalAmount)} awaiting review`, badgeType: 'red' },
  ]
  const floatCards = [
    { title: 'USER WALLET BALANCES', badge: 'Live', value: formatNaira(stats.totalWalletBalances), subtext: 'Total customer wallet balances' },
    { title: 'COMPANY BALANCE', badge: 'Live', value: formatNaira(stats.companyBalance), subtext: 'Recorded company account balance' },
    { title: 'COMPANY PROFIT', badge: 'Live', value: formatNaira(stats.companyProfit), subtext: 'Accrued company profit' },
  ]
  const totalTrackedBalance = Number(stats.totalWalletBalances || 0) + Number(stats.companyBalance || 0)

  return (
    <div className="stats-overview-container">
      <div className="top-stats-grid">
        {statsData.map((stat) => (
          <div key={stat.title} className="stat-card">
            <span className="stat-card-title">{stat.title}</span>
            <div className="stat-card-value">{loading ? 'Loading…' : stat.value}</div>
            <span className={`stat-card-subtext ${stat.badgeType}`}>
              {stat.subtext}
            </span>
          </div>
        ))}
      </div>

      <div className="system-float-banner">
        <div className="float-main-summary">
          <div className="float-main-header">
            <span className="float-label">Tracked wallet and company balances</span>
            <div className="float-main-value">{loading ? 'Loading…' : formatNaira(totalTrackedBalance)}</div>
          </div>

          <div className="float-action-btns">
            <button type="button" className="btn-fund" onClick={() => onNavigate?.('Add Money')}>Add money</button>
            <button type="button" className="btn-reconcile" onClick={() => onNavigate?.('Admin Wallet')}>Review wallet</button>
          </div>

          <div className="float-status-footer">
            <span className="status-dot-green"></span>
            <span>Live totals from customer wallets and company account</span>
          </div>
        </div>

        <div className="float-cards-grid">
          {floatCards.map((card) => (
            <div key={card.title} className="float-card">
              <div className="float-card-top">
                <span className="float-card-title">{card.title}</span>
                <span className="float-badge">{card.badge}</span>
              </div>
              <div className="float-card-value">{loading ? 'Loading…' : card.value}</div>
              <div className="float-card-subtext">{card.subtext}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}