import { useState } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo'
import { ngoApi, saveNGOSession } from '../services/ngoApi'

export default function AuthPage({ signup = false, admin = false }) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const redirect = new URLSearchParams(window.location.search).get('redirect') || ''
    try {
      const session = signup
        ? admin
          ? await ngoApi.signupAdmin({
            name: String(values.name),
            email: String(values.email),
            password: String(values.password),
            inviteCode: String(values.inviteCode),
          })
          : await ngoApi.signup({ name: String(values.name), email: String(values.email), password: String(values.password) })
        : await ngoApi.login({
          email: String(values.email),
          password: String(values.password),
          expectedRole: admin ? 'admin' : 'client',
        })
      if (session.user.role !== (admin ? 'admin' : 'client')) {
        throw new Error(`This account does not have ${admin ? 'administrator' : 'donor'} portal access.`)
      }
      saveNGOSession(session)
      const allowedRedirect = redirect.startsWith('/')
        && !redirect.startsWith('//')
        && !redirect.includes('\\')
        && (admin ? redirect.startsWith('/admin') : !redirect.startsWith('/admin'))
      window.location.assign(allowedRedirect ? redirect : admin ? '/admin' : '/dashboard')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="auth-page">
      <section className={`auth-photo${signup ? ' auth-photo-community' : ''}`}><Logo light /><div><span className="eyebrow">HOPE GROWS WHEN WE GIVE</span><h1>{admin ? 'Care for every gift, with confidence.' : signup ? 'Join a community changing lives monthly.' : 'Track your impact & manage your giving.'}</h1><p><span className="avatar-dots">● ● ●</span> {admin ? 'Kindred administration' : 'Join 48,000 kind hearts'}</p></div></section>
      <section className="auth-panel"><a className="back-link" href="/"><ArrowLeft size={15} /> Back to home</a><form className="auth-card" onSubmit={submit}><Logo /><h2>{admin ? signup ? 'Create admin account' : 'Admin sign in' : signup ? 'Join our community' : 'Welcome back'}</h2><p>{admin ? signup ? 'Use the private invitation code provided by your Kindred administrator.' : 'Sign in to manage campaigns and review gift pledges.' : signup ? 'Create an account to see your impact and support causes.' : 'Sign in to view your gift pledges and impact stories.'}</p>{signup && <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={120} /> </label>}<label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label>{signup && admin && <label>Admin invitation code<input name="inviteCode" type="password" autoComplete="off" required /></label>}{signup && <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} placeholder="At least 8 characters" required /></label>}{!signup && <label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required /></label>}{signup && !admin && <label className="checkbox-line auth-consent"><input type="checkbox" required /> I agree to Kindred’s terms and privacy policy.</label>}{!signup && !admin && <a className="forgot-link" href="/support">Forgot password?</a>}<button type="submit" className="button button-green full-button" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>{message && <p className="checkout-notice" role="alert">{message}</p>}{admin ? <p className="auth-switch">{signup ? 'Already registered?' : 'New administrator?'} <a href={signup ? '/admin/login' : '/admin/signup'}>{signup ? 'Sign in' : 'Register with invitation'}</a></p> : <p className="auth-switch">{signup ? 'Already registered?' : 'New to Kindred?'} <a href={signup ? '/signin' : '/signup'}>{signup ? 'Sign in' : 'Create account'}</a></p>}{!admin && <p className="auth-switch">Kindred administrator? <a href="/admin/login">Admin sign in</a></p>}<div className="auth-safe"><ShieldCheck size={15} /> Your information stays private and secure.</div></form></section>
    </main>
  )
}
