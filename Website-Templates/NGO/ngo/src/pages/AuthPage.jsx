import { useState } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo'

export default function AuthPage({ signup = false }) {
  const [message, setMessage] = useState('')
  function submit(event) {
    event.preventDefault()
    setMessage(signup ? 'Your account form is ready to connect to Kindred registration.' : 'Your sign-in form is ready to connect to your account.')
  }
  return (
    <main className="auth-page">
      <section className={`auth-photo${signup ? ' auth-photo-community' : ''}`}><Logo light /><div><span className="eyebrow">HOPE GROWS WHEN WE GIVE</span><h1>{signup ? 'Join a community changing lives monthly.' : 'Track your impact & manage your giving.'}</h1><p><span className="avatar-dots">● ● ●</span> Join 48,000 kind hearts</p></div></section>
      <section className="auth-panel"><a className="back-link" href="/"><ArrowLeft size={15} /> Back to home</a><form className="auth-card" onSubmit={submit}><Logo /><h2>{signup ? 'Join our community' : 'Welcome back'}</h2><p>{signup ? 'Create an account to see your impact and support causes.' : 'Sign in to view your donations and impact stories.'}</p>{signup && <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required /></label>}<label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>{signup && <label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="Phone number" /></label>}<label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} placeholder="Enter your password" required /></label>{!signup && <a className="forgot-link" href="/support">Forgot password?</a>}{signup && <label className="checkbox-line auth-consent"><input type="checkbox" required /> I agree to Kindred’s terms and privacy policy.</label>}<button type="submit" className="button button-green full-button">{signup ? 'Create account' : 'Sign in'}</button>{message && <p className="checkout-notice" role="status">{message}</p>}<p className="auth-switch">{signup ? 'Already registered?' : 'New to Kindred?'} <a href={signup ? '/signin' : '/signup'}>{signup ? 'Sign in' : 'Create account'}</a></p><div className="auth-safe"><ShieldCheck size={15} /> Your information stays private and secure.</div></form></section>
    </main>
  )
}
