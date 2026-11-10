import { useEffect, useState } from 'react'
import { Award, Check, Gift, Repeat2, Users } from 'lucide-react'
import { userApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const tiers = [
  { name: 'Bronze', points: 0 },
  { name: 'Silver', points: 100 },
  { name: 'Gold', points: 300 },
  { name: 'Platinum', points: 600 },
]

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`

export default function RewardsPage({ onNavigate }) {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    userApi.account()
      .then((result) => { if (active) setAccount(result.data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const points = account?.points || 0

  return (
    <div className="page-wrapper">
      <div className="page-container rewards-page">
        <div className="page-header-row">
          <div>
            <div className="breadcrumb">Home / Account / Rewards</div>
            <h1 className="page-title">Your rewards</h1>
            <p className="page-subtitle">See how your successful trades and referrals build your membership tier.</p>
          </div>
          <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/profile')}>Back to profile</button>
        </div>

        {error && <p className="wallet-notice error" role="alert">{error}</p>}
        {loading ? <p role="status"><CardzipLoader compact label="Loading your rewards" /></p> : account && <>
          <section className="rewards-membership-panel">
            <div className="rewards-membership-top">
              <div>
                <span className="rewards-eyebrow">CURRENT MEMBERSHIP</span>
                <h2><Award size={20} />{account.memberLevel || 'Bronze'}</h2>
              </div>
              <div className="rewards-points"><strong>{points.toLocaleString()}</strong><span>POINTS</span></div>
            </div>
            <div className="rewards-progress" role="progressbar" aria-label="Membership tier progress" aria-valuenow={account.progressPercent || 0} aria-valuemin="0" aria-valuemax="100">
              <span style={{ width: `${account.progressPercent || 0}%` }} />
            </div>
            <p>{account.nextLevel ? `${account.pointsToNextLevel} points to ${account.nextLevel}` : 'You have reached the highest tier.'}</p>
          </section>

          <section className="rewards-stats-grid" aria-label="Account activity">
            <article className="rewards-stat-card"><Repeat2 size={19} /><span>Successful trades</span><strong>{account.successfulTrades || 0}</strong></article>
            <article className="rewards-stat-card"><Users size={19} /><span>People referred</span><strong>{account.referralCount || 0}</strong></article>
            <article className="rewards-stat-card"><Gift size={19} /><span>Referral earnings</span><strong>{formatNaira(account.referralRewardNgn)}</strong></article>
          </section>

          <div className="rewards-content-grid">
            <section className="rewards-detail-panel">
              <h2>Points from your activity</h2>
              <div className="rewards-activity-row">
                <span className="rewards-activity-icon"><Repeat2 size={17} /></span>
                <span><strong>{account.successfulTrades || 0} successful trades</strong><small>10 points per completed trade</small></span>
                <b>+{(account.pointsFromTrades || 0).toLocaleString()} pts</b>
              </div>
              <div className="rewards-activity-row">
                <span className="rewards-activity-icon"><Users size={17} /></span>
                <span><strong>{account.referralCount || 0} people referred</strong><small>20 points per person who joins with your code</small></span>
                <b>+{(account.pointsFromReferrals || 0).toLocaleString()} pts</b>
              </div>
              <button className="rewards-referral-link" type="button" onClick={() => onNavigate?.('/referrals')}>View referral earnings</button>
            </section>

            <section className="rewards-detail-panel rewards-tier-panel">
              <h2>Membership tiers</h2>
              {tiers.map((tier) => {
                const achieved = points >= tier.points
                const current = account.memberLevel?.toLowerCase() === tier.name.toLowerCase()
                return (
                  <div className={`rewards-tier-row${current ? ' current' : ''}`} key={tier.name}>
                    <span className={`rewards-tier-marker${achieved ? ' achieved' : ''}`}><Check size={14} /></span>
                    <strong>{tier.name}{current ? ' · Current' : ''}</strong>
                    <span>{tier.points.toLocaleString()} pts</span>
                  </div>
                )
              })}
            </section>
          </div>
        </>}
      </div>
    </div>
  )
}