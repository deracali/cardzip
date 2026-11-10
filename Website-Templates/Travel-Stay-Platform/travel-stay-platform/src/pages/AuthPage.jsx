import { useState } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo'
import { imageUrl } from '../data/stays'

export default function AuthPage({ signup = false }) {
  const [message, setMessage] = useState('')

  function submit(event) {
    event.preventDefault()
    setMessage(signup ? 'Your account form is ready to connect to a registration service.' : 'Your sign-in form is ready to connect to an account service.')
  }

  return (
    <main className="auth-page">
      <section className="auth-photo" style={{ backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(10,20,30,.76)), url("${imageUrl(signup ? 'photo-1564013799919-ab600027ffc6' : 'photo-1571896349842-33c89424de2d', 1200)}")` }}>
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
          <button className="button button-primary full-button" type="submit">{signup ? 'Create account' : 'Sign in'}</button>
          {message && <p className="checkout-notice" role="status">{message}</p>}
          <p className="auth-switch">{signup ? 'Already have an account?' : 'New to Escapes?'} <a href={signup ? '/signin' : '/signup'}>{signup ? 'Sign in' : 'Create account'}</a></p>
          <div className="auth-safe"><ShieldCheck size={15} /> Your information stays private and secure.</div>
        </form>
      </section>
    </main>
  )
}
