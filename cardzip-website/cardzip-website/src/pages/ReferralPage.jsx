import { useEffect, useState } from 'react'
import { Check, Copy, Gift, Users, Wallet } from 'lucide-react'
import { userApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ReferralPage({ onNavigate }) {
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    userApi.account()
      .then((result) => {
        if (active) setReferral(result.data)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const referralLink = (() => {
    if (!referral?.referralCode) return ''
    const invite = new URL('/signup', window.location.origin)
    invite.searchParams.set('ref', referral.referralCode)
    return invite.toString()
  })()

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy the referral link. Select and copy it manually.')
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-container referral-page">
        <div className="page-header-row">
          <div>
            <div className="breadcrumb">Home / Account / Referrals</div>
            <h1 className="page-title">Invite friends. Earn together.</h1>
            <p className="page-subtitle">Earn 2% of a referred customer’s confirmed naira gift-card payout when their trade is marked successful.</p>
          </div>
          <button type="button" className="btn-secondary-pill" onClick={() => onNavigate?.('/profile')}>Back to profile</button>
        </div>

        {error && <p className="wallet-notice error" role="alert">{error}</p>}
        {loading ? <p role="status"><CardzipLoader compact label="Loading your referral summary" /></p> : referral && <>
          <section className="referral-link-card">
            <div><span className="referral-eyebrow">YOUR REFERRAL CODE</span><strong className="referral-code">{referral.referralCode || 'Not available'}</strong></div>
            <div className="referral-link-row">
              <input aria-label="Referral link" readOnly value={referralLink} />
              <button type="button" className="btn-emerald-submit" onClick={copyLink} disabled={!referralLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy invite link'}
              </button>
            </div>
            <p>New customers who sign up from this link are connected to your referral account. Existing accounts are not reassigned.</p>
          </section>

          <div className="referral-stats-grid">
            <article className="referral-stat-card"><Users size={20} /><span>People invited</span><strong>{referral.referralCount || 0}</strong></article>
            <article className="referral-stat-card"><Gift size={20} /><span>Successful referred trades</span><strong>{referral.referralSuccessfulTrades || 0}</strong></article>
            <article className="referral-stat-card"><Wallet size={20} /><span>Total referral earnings</span><strong>{formatNaira(referral.referralRewardNgn)}</strong></article>
          </div>

          <section className="referral-list-card">
            <div className="referral-section-heading"><div><h2>Your referrals</h2><p>Successful trade rewards are credited to your wallet and listed in your wallet history.</p></div></div>
            {referral.referrals?.length
              ? <div className="referral-list">{referral.referrals.map((person) => (
                <div className="referral-person" key={person.id}>
                  <span className="referral-person-avatar">{person.name?.trim()?.[0]?.toUpperCase() || '?'}</span>
                  <span><strong>{person.name || 'Cardzip member'}</strong><small>Joined {new Date(person.createdAt).toLocaleDateString()}</small></span>
                </div>
              ))}</div>
              : <p className="referral-empty">No one has joined with your link yet. Share it to get started.</p>}
          </section>

          {!!referral.referralRewardHistory?.length && <section className="referral-list-card referral-reward-history">
            <div className="referral-section-heading"><div><h2>Recent rewards</h2><p>Your 2% commission entries from verified completed trades.</p></div></div>
            {referral.referralRewardHistory.map((reward) => (
              <div className="referral-reward-row" key={reward.id}>
                <span><strong>{reward.description}</strong><small>{new Date(reward.date).toLocaleString()}</small></span>
                <strong>{formatNaira(reward.amount)}</strong>
              </div>
            ))}
          </section>}
        </>}
      </div>
    </div>
  )
}
