import { useState } from 'react'
import {
  User,
  Shield,
  Mail,
  Phone,
  Building,
  Clock,
  Copy,
  Check,
} from 'lucide-react'

export default function ProfilePage({ admin }) {
  const [copied, setCopied] = useState(false)
  const displayName = admin?.name || 'Administrator'
  const initials = displayName.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const role = admin?.role === 'superadmin' ? 'Super Admin' : admin?.role === 'admin' ? 'Admin' : 'Staff'
  const createdAt = admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'

  const handleCopyId = () => {
    if (!admin?.id || !navigator.clipboard) return
    navigator.clipboard.writeText(admin.id)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((error) => console.error('Could not copy administrator ID:', error))
  }

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Account & Profile Settings</h1>
          <p className="page-subtitle">Your administrator account details from the active login.</p>
        </div>
      </div>

      <div className="profile-hero-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">{initials}</div>
        </div>

        <div className="profile-hero-details">
          <div className="profile-name-row">
            <h2>{displayName}</h2>
            <span className="badge-role">{role}</span>
          </div>

          <p className="profile-email">{admin?.email || '—'}</p>

          <div className="profile-meta-pills">
            <button className="meta-pill font-mono profile-copy-id" type="button" onClick={handleCopyId} disabled={!admin?.id}>
              ID: {admin?.id || '—'} {copied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
            </button>
            <span className="meta-pill"><Shield size={12} className="text-emerald" /> {admin?.isActive ? 'Account active' : 'Account inactive'}</span>
            <span className="meta-pill">
              <Clock size={12} /> Joined: {createdAt}
            </span>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header">
          <h3>Personal &amp; Contact Information</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input type="text" value={admin?.name || ''} readOnly />
            </div>
          </div>
          <div className="form-group">
            <label>Work Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input type="email" value={admin?.email || ''} readOnly />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-icon-wrapper">
              <Phone size={16} className="input-icon" />
              <input type="text" value={admin?.phone || 'Not provided'} readOnly />
            </div>
          </div>
          <div className="form-group">
            <label>Department / Team</label>
            <div className="input-icon-wrapper">
              <Building size={16} className="input-icon" />
              <input type="text" value={admin?.department || 'Not assigned'} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}