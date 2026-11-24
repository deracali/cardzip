import { useState } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo'
import { escapesApi, saveSession } from '../services/escapesApi'

export default function AdminAuthPage({ signup = false }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const session = signup
        ? await escapesApi.signupAdmin(values)
        : await escapesApi.login({ email: values.email, password: values.password, expectedRole: 'admin' })
      saveSession(session)
      window.location.assign('/admin/dashboard')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Administrator access could not be verified.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-photo admin-auth-photo" style={{ backgroundImage: 'linear-gradient(180deg, transparent 30%, rgba(10,20,30,.76)), url("/hero-resort.jpg")' }}>
        <Logo light />
        <div><span className="eyebrow">ESCAPES OPERATIONS</span><h1>Thoughtful stays begin with thoughtful hosting.</h1><p>Manage guest reservations and keep every escape running smoothly.</p></div>
      </section>
      <section className="auth-panel">
        <a className="back-link" href="/"><ArrowLeft size={15} /> Back to home</a>
        <form className="auth-card" onSubmit={submit}>
          <Logo />
          <span className="admin-auth-label"><ShieldCheck size={15} /> Administrator access</span>
          <h2>{signup ? 'Create an admin account' : 'Admin sign in'}</h2>
          <p>Local demo accounts are stored in this browser. The invitation field does not provide production access control.</p>
          {signup && <label>Full name<input name="name" autoComplete="name" required /></label>}
          {signup && <label>Invitation code<input name="inviteCode" type="password" autoComplete="off" required /></label>}
          <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
          <label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={10} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary full-button" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : signup ? 'Create admin account' : 'Sign in'}</button>
          <p className="auth-switch">{signup ? 'Already have an admin account?' : 'Have an invitation code?'} <a href={signup ? '/admin/login' : '/admin/signup'}>{signup ? 'Sign in' : 'Register'}</a></p>
        </form>
      </section>
    </main>
  )
}
