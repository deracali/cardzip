import { useState } from 'react'
import { KeyRound, UserPlus } from 'lucide-react'
import { adminApi } from '../services/api'

const emptyCreateForm = { name: '', email: '', password: '', confirmPassword: '', passkey: '' }
const emptyResetForm = { email: '', currentPassword: '', newPassword: '', confirmPassword: '' }

export default function AdminManagementPage() {
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [resetForm, setResetForm] = useState(emptyResetForm)
  const [createError, setCreateError] = useState('')
  const [createMessage, setCreateMessage] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [resetting, setResetting] = useState(false)

  const updateCreateForm = (event) => {
    const { name, value } = event.target
    setCreateForm((current) => ({ ...current, [name]: value }))
  }

  const updateResetForm = (event) => {
    const { name, value } = event.target
    setResetForm((current) => ({ ...current, [name]: value }))
  }

  const createAdministrator = async (event) => {
    event.preventDefault()
    if (creating) return
    setCreateError('')
    setCreateMessage('')
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError('The administrator passwords do not match.')
      return
    }

    setCreating(true)
    try {
      const verification = await adminApi.verifyWithdrawalPasskey({ passkey: createForm.passkey })
      const passkeyAccessToken = verification.data?.accessToken
      if (!passkeyAccessToken) throw new Error('Could not verify the withdrawal approval passkey.')

      await adminApi.createAdministrator({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
      }, passkeyAccessToken)
      setCreateForm(emptyCreateForm)
      setCreateMessage('Administrator account created.')
    } catch (requestError) {
      setCreateError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  const resetAdministratorPassword = async (event) => {
    event.preventDefault()
    if (resetting) return
    setResetError('')
    setResetMessage('')
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('The new passwords do not match.')
      return
    }

    setResetting(true)
    try {
      await adminApi.resetAdministratorPassword({
        email: resetForm.email,
        currentPassword: resetForm.currentPassword,
        newPassword: resetForm.newPassword,
      })
      setResetForm(emptyResetForm)
      setResetMessage('Administrator password reset. They must sign in with the new password.')
    } catch (requestError) {
      setResetError(requestError.message)
    } finally {
      setResetting(false)
    }
  }

  return (
    <section className="admin-management-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Admin Management</h1>
          <p className="page-subtitle">Create administrator accounts and securely reset an existing admin password.</p>
        </div>
      </header>

      <section className="section-card">
        <div className="card-header">
          <h2><UserPlus size={18} /> Add administrator</h2>
        </div>
        <p>Creating an admin requires your withdrawal approval passkey. The new account receives administrator access.</p>
        <form onSubmit={createAdministrator}>
          <div className="form-grid">
            <label className="form-group">Full name
              <input name="name" autoComplete="name" value={createForm.name} onChange={updateCreateForm} maxLength={100} required />
            </label>
            <label className="form-group">Work email
              <input name="email" type="email" autoComplete="email" value={createForm.email} onChange={updateCreateForm} required />
            </label>
            <label className="form-group">Initial password
              <input name="password" type="password" autoComplete="new-password" value={createForm.password} onChange={updateCreateForm} minLength={12} maxLength={128} required />
            </label>
            <label className="form-group">Confirm initial password
              <input name="confirmPassword" type="password" autoComplete="new-password" value={createForm.confirmPassword} onChange={updateCreateForm} minLength={12} maxLength={128} required />
            </label>
            <label className="form-group">Withdrawal approval passkey
              <input name="passkey" type="password" autoComplete="current-password" value={createForm.passkey} onChange={updateCreateForm} required />
            </label>
          </div>
          {createError && <p className="form-error" role="alert">{createError}</p>}
          {createMessage && <p role="status">{createMessage}</p>}
          <button className="btn-primary" type="submit" disabled={creating}>
            <UserPlus size={16} /> {creating ? 'Verifying and creating…' : 'Create administrator'}
          </button>
        </form>
      </section>

      <section className="section-card">
        <div className="card-header">
          <h2><KeyRound size={18} /> Reset an admin password</h2>
        </div>
        <p>Enter the admin’s email and a new password. Confirm your superadmin password to authorize the reset.</p>
        <form onSubmit={resetAdministratorPassword}>
          <div className="form-grid">
            <label className="form-group">Admin email
              <input name="email" type="email" autoComplete="email" value={resetForm.email} onChange={updateResetForm} required />
            </label>
            <label className="form-group">Your superadmin password
              <input name="currentPassword" type="password" autoComplete="current-password" value={resetForm.currentPassword} onChange={updateResetForm} required />
            </label>
            <label className="form-group">New admin password
              <input name="newPassword" type="password" autoComplete="new-password" value={resetForm.newPassword} onChange={updateResetForm} minLength={12} maxLength={128} required />
            </label>
            <label className="form-group">Confirm new password
              <input name="confirmPassword" type="password" autoComplete="new-password" value={resetForm.confirmPassword} onChange={updateResetForm} minLength={12} maxLength={128} required />
            </label>
          </div>
          {resetError && <p className="form-error" role="alert">{resetError}</p>}
          {resetMessage && <p role="status">{resetMessage}</p>}
          <button className="btn-primary" type="submit" disabled={resetting}>
            <KeyRound size={16} /> {resetting ? 'Resetting password…' : 'Reset admin password'}
          </button>
        </form>
      </section>
    </section>
  )
}
