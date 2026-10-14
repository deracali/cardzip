import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck, XCircle } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const kycLabels = {
  not_submitted: 'Not submitted',
  pending: 'Pending review',
  approved: 'Verified',
  rejected: 'Rejected',
}

export default function UserDetailsPage({ userId, onBack }) {
  const [userState, setUserState] = useState({ userId: null, user: null, error: '' })
  const [saving, setSaving] = useState(false)
  const loading = userState.userId !== userId
  const user = loading ? null : userState.user
  const error = loading ? '' : userState.error

  useEffect(() => {
    let active = true
    adminApi.user(userId)
      .then((result) => { if (active) setUserState({ userId, user: result, error: '' }) })
      .catch((requestError) => { if (active) setUserState({ userId, user: null, error: requestError.message }) })
    return () => { active = false }
  }, [userId])

  const updateKyc = async (status) => {
    setSaving(true)
    try {
      const result = await adminApi.updateUser(userId, { kycStatus: status })
      setUserState((current) => ({
        ...current,
        user: { ...current.user, kyc: result.data.kyc },
        error: '',
      }))
    } catch (requestError) {
      setUserState((current) => ({ ...current, error: requestError.message }))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CardzipLoader label="Loading user details…" />
  if (!user) return <section className="section-card"><p role="alert">{error || 'User not found.'}</p><button type="button" className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Back to users</button></section>

  const kycStatus = user.kyc?.status || 'not_submitted'
  return (
    <div className="user-details-page">
      <div className="page-header">
        <div className="header-left">
          <button type="button" className="btn-back" onClick={onBack}><ArrowLeft size={16} /> Back</button>
          <div><h1 className="page-title">User Account Details</h1><p className="page-subtitle">Review account information and submitted KYC details.</p></div>
        </div>
        {kycStatus === 'pending' && (
          <div className="header-actions">
            <button type="button" className="btn-emerald" disabled={saving} onClick={() => updateKyc('approved')}><CheckCircle2 size={15} /> Approve KYC</button>
            <button type="button" className="btn-danger" disabled={saving} onClick={() => updateKyc('rejected')}><XCircle size={15} /> Reject KYC</button>
          </div>
        )}
      </div>

      {error && <p className="wallet-notice error" role="alert">{error}</p>}
      <div className="user-profile-card">
        <div className="profile-avatar-lg">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
        <div className="profile-main-info">
          <div className="profile-name-heading">
            <h2>{user.name}</h2>
            <span className={`kyc-badge ${kycStatus}`}><ShieldCheck size={12} /> {kycLabels[kycStatus] || kycStatus}</span>
          </div>
          <p className="user-id-code">User ID: <span className="font-mono">{user._id}</span></p>
          <div className="info-pills-row">
            <span><Mail size={13} /> {user.email}</span>
            <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            <span>Referral code: {user.referralCode || 'Not set'}</span>
          </div>
        </div>
      </div>

      <div className="user-stats-grid">
        <div className="stat-card"><span className="stat-label">Wallet Balance</span><span className="stat-value">₦{Number(user.walletBalance || 0).toLocaleString('en-NG')}</span><span className="stat-sub">{user.walletCurrency || 'NGN'}</span></div>
        <div className="stat-card"><span className="stat-label">KYC Document</span><span className="stat-value">{user.kyc?.documentType || 'Not submitted'}</span><span className="stat-sub">{user.kyc?.documentLastFour ? `Ending ${user.kyc.documentLastFour}` : 'No document details available'}</span></div>
        <div className="stat-card"><span className="stat-label">KYC Submitted</span><span className="stat-value">{user.kyc?.submittedAt ? new Date(user.kyc.submittedAt).toLocaleDateString() : '—'}</span><span className="stat-sub">{user.kyc?.legalName || 'No legal name submitted'}</span></div>
      </div>
    </div>
  )
}
