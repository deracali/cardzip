import { useState } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo'
import { escapesApi, saveSession } from '../services/escapesApi'

export default function AuthPage({ signup = false }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const session = signup
        ? await escapesApi.signup(form)
        : await escapesApi.login({ email: form.email, password: form.password, expectedRole: 'client' })
      saveSession(session)
      const next = new URLSearchParams(window.location.search).get('next')
      window.location.assign(next?.startsWith('/') && !next.startsWith('//') ? next : '/client/dashboard')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Your account request could not be completed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-photo" style={{ backgroundImage: 'linear-gradient(180deg, transparent 30%, rgba(10,20,30,.76)), url("/hero-resort.jpg")' }}>
        <Logo light />
        <div><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>{signup ? 'Earn from your extraordinary space.' : 'Your getaway is just around the corner.'}</h1><p>Discover stays that make the journey as memorable as the destination.</p></div>
      </section>
      <section className="auth-panel">
        <a className="back-link" href="/"><ArrowLeft size={15} /> Back to home</a>
        <form className="auth-card" onSubmit={submit}>
          <Logo />
          <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
          <p>{signup ? 'Join Escapes and find your next favorite place.' : 'Sign in to manage your stays and travel plans.'}</p>
          {signup && <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
          <label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} placeholder="Enter your password" required /></label>
          {!signup && <a className="forgot-link" href="/support">Forgot password?</a>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary full-button" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
          <p className="auth-switch">{signup ? 'Already have an account?' : 'New to Escapes?'} <a href={signup ? '/signin' : '/signup'}>{signup ? 'Sign in' : 'Create account'}</a></p>
          <div className="auth-safe"><ShieldCheck size={15} /> Your information stays private and secure.</div>
        </form>
      </section>
    </main>
  )
}
