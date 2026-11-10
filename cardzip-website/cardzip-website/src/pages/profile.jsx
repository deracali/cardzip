import { useEffect, useState } from 'react'
import { 
  User,
  Mail,
  Key,
  Copy, 
  Check, 
  History,
  Users,
  Award,
  LogOut,
} from 'lucide-react'
import { userApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'


export default function ProfilePage({ onNavigate, onLogout, user }) {
  const [copied, setCopied] = useState(false)
  const [account, setAccount] = useState(null)
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountError, setAccountError] = useState('')
  const nameParts = (user?.name || '').trim().split(/\s+/).filter(Boolean)
  const referralCode = user?.referralCode || ''

  useEffect(() => {
    let active = true
    userApi.account()
      .then((result) => { if (active) setAccount(result.data) })
      .catch((error) => { if (active) setAccountError(error.message) })
      .finally(() => { if (active) setAccountLoading(false) })
    return () => { active = false }
  }, [])

  const handleCopyReferralCode = () => {
    if (!referralCode) return
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        
        {/* Header Section */}
        <div className="profile-header-row">
          <div>
            <div className="profile-breadcrumb">Home / Account / Profile</div>
            <h1 className="profile-title">Account Settings</h1>
            <p className="profile-subtitle">Review your account details, membership rewards, and order history.</p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="profile-grid">
          
          {/* Left Navigation Sidebar */}
          <aside className="profile-nav-card">
            <div className="user-mini-card">
              <div className="avatar-circle">
                <span>{nameParts.map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'CZ'}</span>
              </div>
              <div className="user-mini-info">
                <h3>{user?.name || 'Cardzip user'}</h3>
                <span className="user-email">{user?.email || ''}</span>
              </div>
            </div>

            <div className="user-id-box">
              <span className="id-label">REFERRAL CODE</span>
              <div className="id-value-row">
                <code>{referralCode || <CardzipLoader compact label="Loading referral code" />}</code>
                <button className="copy-btn" type="button" onClick={handleCopyReferralCode} disabled={!referralCode} aria-label="Copy referral code">
                  {copied ? <Check size={14} className="green-txt" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <nav className="nav-menu">
              <div className="nav-item active" aria-current="page">
                <User size={16} />
                <span>Personal Profile</span>
              </div>
              <button className="nav-item" onClick={() => onNavigate?.('/orders')}>
                <History size={16} />
                <span>Order History</span>
              </button>
              <button className="nav-item" type="button" onClick={() => onNavigate?.('/referrals')}>
                <Users size={16} />
                <span>Refer & earn</span>
              </button>
              <button className="nav-item" type="button" onClick={() => onNavigate?.('/rewards')}>
                <Award size={16} />
                <span>Rewards & activity</span>
              </button>
              <button className="dashboard-logout-button" type="button" onClick={onLogout}>
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </nav>
          </aside>

          {/* Right Main Content Panel */}
          <main className="profile-content-col">

            <section className="profile-rewards-card">
              <div className="profile-rewards-heading">
                <div className="profile-rewards-icon"><Award size={18} /></div>
                <div>
                  <span className="profile-rewards-eyebrow">MEMBERSHIP REWARDS</span>
                  {accountLoading ? <h3><CardzipLoader compact label="Loading membership level" /></h3> : accountError ? <p role="alert">Membership details are unavailable.</p> : <>
                    <h3>{account?.memberLevel || 'Bronze'} member</h3>
                    <p>{account?.points ?? 0} points · {account?.successfulTrades ?? 0} successful trades · {account?.referralCount ?? 0} referrals</p>
                  </>}
                </div>
                <button type="button" onClick={() => onNavigate?.('/rewards')}>View rewards</button>
              </div>
              {!accountLoading && !accountError && <>
                <div className="profile-rewards-progress" role="progressbar" aria-label="Membership tier progress" aria-valuenow={account?.progressPercent ?? 0} aria-valuemin="0" aria-valuemax="100">
                  <span style={{ width: `${account?.progressPercent ?? 0}%` }} />
                </div>
                <small>{account?.nextLevel ? `${account.pointsToNextLevel} points to ${account.nextLevel}` : 'Top tier reached'}</small>
              </>}
              {accountError && <p className="profile-subtitle" role="alert">{accountError}</p>}
            </section>
            
            {/* Personal Information Form Card */}
            <div className="content-card">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Account Information</h3>
                  <p className="card-sub">These details are linked to your Cardzip account.</p>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label className="field-label">First Name</label>
                  <input type="text" className="text-input" value={nameParts[0] || ''} readOnly />
                </div>
                <div className="form-field">
                  <label className="field-label">Last Name</label>
                  <input type="text" className="text-input" value={nameParts.slice(1).join(' ')} readOnly />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input type="email" className="text-input padded-left" value={user?.email || ''} readOnly />
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Password</h3>
                  <p className="card-sub">Use the secure password reset flow to update your password.</p>
                </div>
                <button className="btn-sec-action" type="button" onClick={() => onNavigate?.('/forgot-password')}>
                  <Key size={15} /> Reset password
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>

      <footer className="simple-footer">
        <span>© 2026 Cardzip. All rights reserved.</span>
        <div className="footer-right">
          <span>Account dashboard</span>
        </div>
      </footer>
    </div>
  )
}