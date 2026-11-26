import { useState } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo'
import { createLocalSession } from '../services/localStore'

export default function AuthPage({ signup = false, admin = false }) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  function submit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const redirect = new URLSearchParams(window.location.search).get('redirect') || ''
    try {
      createLocalSession({
        name: signup ? String(values.name) : '',
        email: String(values.email),
        role: admin ? 'admin' : 'client',
      })
      const allowedRedirect = redirect.startsWith('/')
        && !redirect.startsWith('//')
        && !redirect.includes('\\')
        && (admin ? redirect.startsWith('/admin') : !redirect.startsWith('/admin'))
      window.location.assign(allowedRedirect ? redirect : admin ? '/admin' : '/dashboard')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open the local demo session.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="auth-page">
      <section className={`auth-photo${signup ? ' auth-photo-community' : ''}`}><Logo light /><div><span className="eyebrow">HOPE GROWS WHEN WE GIVE</span><h1>{admin ? 'Care for every gift, with confidence.' : signup ? 'Join a community changing lives monthly.' : 'Track your impact & manage your giving.'}</h1><p><span className="avatar-dots">● ● ●</span> {admin ? 'Kindred administration' : 'Join 48,000 kind hearts'}</p></div></section>
      <section className="auth-panel"><a className="back-link" href="/"><ArrowLeft size={15} /> Back to home</a><form className="auth-card" onSubmit={submit}><Logo /><h2>{admin ? signup ? 'Create admin demo account' : 'Admin demo sign in' : signup ? 'Join our community' : 'Welcome back'}</h2><p>{admin ? 'This Vite admin portal is a browser-only preview and does not provide secure authentication.' : signup ? 'Create a local demo profile to review your gift pledge history.' : 'Open your local demo profile and view your gift pledge history.'}</p>{signup && <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={120} /> </label>}<label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label>{signup && !admin && <label className="checkbox-line auth-consent"><input type="checkbox" required /> I agree to Kindred’s terms and privacy policy.</label>}<button type="submit" className="button button-green full-button" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create demo account' : 'Continue to demo'}</button>{message && <p className="checkout-notice" role="alert">{message}</p>}{admin ? <p className="auth-switch">{signup ? 'Already registered?' : 'New administrator?'} <a href={signup ? '/admin/login' : '/admin/signup'}>{signup ? 'Sign in' : 'Create demo account'}</a></p> : <p className="auth-switch">{signup ? 'Already registered?' : 'New to Kindred?'} <a href={signup ? '/signin' : '/signup'}>{signup ? 'Sign in' : 'Create account'}</a></p>}<div className="auth-safe"><ShieldCheck size={15} /> Vite stores demo profile and pledge data in this browser.</div></form></section>
    </main>
  )
}
