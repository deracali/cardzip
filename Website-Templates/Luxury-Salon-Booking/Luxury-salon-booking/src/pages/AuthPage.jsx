import { useState } from 'react'
import { authenticateLocal, saveSalonSession } from '../services/salonLocalStore'
import '../components/salon/salon.css'
import './account.css'

export default function AuthPage({ mode = 'login', portal = 'client' }) {
  const signup = mode === 'signup'
  const admin = portal === 'admin'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const session = await authenticateLocal({
        name: String(form.get('name') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        password: String(form.get('password') || ''),
        signupDetails: signup ? {
          name: String(form.get('name') || ''),
          phone: String(form.get('phone') || ''),
        } : null,
      })
      if (session.user.role !== portal) throw new Error(admin ? 'This account does not have administrator access.' : 'Use the administrator sign-in page for this account.')
      saveSalonSession(session)
      const next = new URLSearchParams(window.location.search).get('next')
      const isAdminPath = next?.startsWith('/admin')
      const safeNext = next?.startsWith('/') && !next.startsWith('//') && (admin ? isAdminPath : !isAdminPath) ? next : null
      window.location.assign(signup ? '/dashboard' : safeNext || (admin ? '/admin' : '/dashboard'))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not authenticate your account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="salon-account-page">
      <a className="salon-brand account-brand" href="/">
        <span className="salon-brand-mark">L</span>
        <span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span>
      </a>
      <section className="salon-account-card">
        <span className="salon-kicker">{admin ? 'STUDIO ADMINISTRATION' : 'YOUR LUMIÈRE ACCOUNT'}</span>
        <h1>{signup ? 'Create your client account' : admin ? 'Administrator sign in' : 'Welcome back'}</h1>
        <p>{signup ? 'Create an account to request appointments and keep track of your visits.' : admin ? 'Sign in to manage this local Vite demo.' : 'Sign in to request appointments and see your upcoming salon visits.'}</p>
        <form className="salon-account-form" onSubmit={submit}>
          {signup && <>
            <label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
            <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
          </>}
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required /></label>
          {error && <p className="salon-form-error" role="alert">{error}</p>}
          <button className="salon-button salon-button-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
        </form>
        {admin
          ? <p className="salon-account-note">Vite preview demo only: <strong>admin@lumiere.local</strong> · <strong>LumiereAdmin2026!</strong>. This browser-only demo is not secure for real salon operations.</p>
          : <p className="salon-account-switch">{signup ? 'Already have an account?' : 'New to Lumière?'} <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create a client account'}</a></p>}
        <a className="salon-back-link" href="/">← Back to Lumière</a>
      </section>
    </main>
  )
}
