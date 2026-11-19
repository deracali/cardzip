import { useEffect, useState } from 'react'
import { 
  User,
  Mail,
  Key, 
  Bell, 
  CreditCard, 
  Copy, 
  Check, 
  Smartphone,
  History,
  Users,
  Award,
  LogOut,
} from 'lucide-react'
import { userApi } from '../services/api'


export default function ProfilePage({ onNavigate, onLogout, user }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [account, setAccount] = useState(null)
  const nameParts = (user?.name || '').trim().split(/\s+/).filter(Boolean)
  const referralCode = user?.referralCode || ''

  useEffect(() => {
    let active = true
    userApi.account()
      .then((result) => { if (active) setAccount(result.data) })
      .catch(() => {})
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
            <p className="profile-subtitle">Manage your personal details, wallet security, and payment preferences.</p>
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
                <code>{referralCode || 'Loading…'}</code>
                <button className="copy-btn" type="button" onClick={handleCopyReferralCode} disabled={!referralCode} aria-label="Copy referral code">
                  {copied ? <Check size={14} className="green-txt" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <nav className="nav-menu">
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={16} />
                <span>Personal Profile</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Key size={16} />
                <span>Security & PIN</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={16} />
                <span>Notifications</span>
              </button>

              <button 
                className={`nav-item ${activeTab === 'limits' ? 'active' : ''}`}
                onClick={() => setActiveTab('limits')}
              >
                <CreditCard size={16} />
                <span>Limits & Tier</span>
              </button>
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
                  <h3>{account?.memberLevel || 'Bronze'} member</h3>
                  <p>{account?.points ?? 0} points · {account?.successfulTrades ?? 0} successful trades · {account?.referralCount ?? 0} referrals</p>
                </div>
                <button type="button" onClick={() => onNavigate?.('/rewards')}>View rewards</button>
              </div>
              <div className="profile-rewards-progress" role="progressbar" aria-label="Membership tier progress" aria-valuenow={account?.progressPercent ?? 0} aria-valuemin="0" aria-valuemax="100">
                <span style={{ width: `${account?.progressPercent ?? 0}%` }} />
              </div>
              <small>{account?.nextLevel ? `${account.pointsToNextLevel} points to ${account.nextLevel}` : 'Top tier reached'}</small>
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

            {/* Account Security & Authentication */}
            <div className="content-card">
              <h3 className="card-title">Security Settings</h3>
              <p className="card-sub">Manage your password, transaction PIN, and 2FA settings.</p>

              <div className="security-settings-list">
                <div className="security-item">
                  <div className="sec-left">
                    <Key size={18} className="green-txt" />
                    <div>
                      <strong>Transaction PIN</strong>
                      <p>Used to authorize withdrawals and utility bill payments.</p>
                    </div>
                  </div>
                  <button className="btn-sec-action">Change PIN</button>
                </div>

                <div className="security-item">
                  <div className="sec-left">
                    <Smartphone size={18} className="green-txt" />
                    <div>
                      <strong>Two-Factor Authentication (2FA)</strong>
                      <p>Protect your account with Google Authenticator or SMS.</p>
                    </div>
                  </div>
                  <span className="status-pill active">ENABLED</span>
                </div>

                <div className="security-item">
                  <div className="sec-left">
                    <History size={18} className="green-txt" />
                    <div>
                      <strong>Active Sessions</strong>
                      <p>Logged in on Chrome (macOS) · Lagos, Nigeria</p>
                    </div>
                  </div>
                  <button className="btn-sec-action text-danger">Revoke Other</button>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      <footer className="simple-footer">
        <span>© 2026 Cardzip. All rights reserved.</span>
        <div className="footer-right">
          <a href="#privacy">Privacy policy</a>
          <a href="#terms">Terms of service</a>
          <span className="green-dot-status">● All systems operational</span>
        </div>
      </footer>
    </div>
  )
}