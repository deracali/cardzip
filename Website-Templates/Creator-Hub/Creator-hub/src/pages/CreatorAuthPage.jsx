import { useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import '../components/CreatorHub.css'

function CreatorAuthPage({ signUp = false }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [handle, setHandle] = useState(() => new URLSearchParams(window.location.search).get('handle') || '')

  const submitForm = (event) => {
    event.preventDefault()
    setNotice(signUp
      ? 'Your CreatorHub account is ready to connect to registration.'
      : 'Sign-in is ready to connect to your account service.')
  }

  return (
    <main className="creator-auth-page">
      <a className="creator-auth-back" href="/">← Back to CreatorHub</a>
      <section className="creator-auth-card" aria-labelledby="creator-auth-title">
        <a className="creator-brand creator-auth-brand" href="/">
          <img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span>
        </a>
        <div className="creator-auth-avatar">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=85" alt="" />
          <span><Check size={10} /></span>
        </div>
        <h1 id="creator-auth-title">{signUp ? 'Claim your creator link' : 'Welcome back, Creator'}</h1>
        <p>{signUp ? 'Your hub, newsletter & store in one place.' : 'Manage your link hub, newsletter and digital sales.'}</p>

        <form className="creator-auth-form" onSubmit={submitForm}>
          {signUp && (
            <>
              <label className="creator-auth-field">
                <span>Choose your handle</span>
                <div className="creator-auth-input creator-handle-field"><span>creatorhub.com/</span><input aria-label="Creator handle" value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="yourname" pattern="[A-Za-z0-9._-]+" required /></div>
              </label>
              <label className="creator-auth-field">
                <span>Full name</span>
                <div className="creator-auth-input"><UserRound size={15} /><input autoComplete="name" placeholder="Your name" required /></div>
              </label>
            </>
          )}
          <label className="creator-auth-field">
            <span>Email address</span>
            <div className="creator-auth-input"><Mail size={15} /><input type="email" autoComplete="email" placeholder="you@email.com" required /></div>
          </label>
          <label className="creator-auth-field">
            <span>Password</span>
            <div className="creator-auth-input"><LockKeyhole size={15} /><input type={showPassword ? 'text' : 'password'} autoComplete={signUp ? 'new-password' : 'current-password'} placeholder={signUp ? 'At least 8 characters' : 'Your password'} minLength={signUp ? 8 : undefined} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
          </label>
          {!signUp && <div className="creator-auth-options"><label><input type="checkbox" defaultChecked /> Keep me logged in</label><a href="mailto:support@creatorhub.example">Forgot password?</a></div>}
          {signUp && <label className="creator-auth-terms"><input type="checkbox" required /> <span>I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</span></label>}
          <button className="creator-button creator-button-primary creator-auth-submit" type="submit">{signUp ? 'Create my hub' : 'Sign in to dashboard'} <ArrowRight size={15} /></button>
        </form>

        {notice && <p className="creator-auth-notice" role="status">{notice}</p>}
        <div className="creator-auth-divider"><span>or continue with</span></div>
        <div className="creator-auth-social"><button type="button" onClick={() => setNotice('Google sign-in is not configured yet.')}>G&nbsp; Google</button><button type="button" onClick={() => setNotice('Apple sign-in is not configured yet.')}>●&nbsp; Apple</button></div>
        <p className="creator-auth-switch">{signUp ? 'Already registered?' : 'Don’t have an account?'} <a href={signUp ? '/login' : '/signup'}>{signUp ? 'Sign in' : 'Sign up'}</a></p>
      </section>
      <p className="creator-auth-security"><LockKeyhole size={13} /> Secured with 256-bit encryption · SOC 2 compliant</p>
    </main>
  )
}

export default CreatorAuthPage
