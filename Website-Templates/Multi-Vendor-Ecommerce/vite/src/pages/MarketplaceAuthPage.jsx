import { useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Heart, ShieldCheck, ShoppingBag, Store, UserRound } from 'lucide-react'
import { marketplaceApi, saveMarketplaceSession } from '../services/marketplaceApi'

export default function MarketplaceAuthPage({ signup, admin = false, navigate, onAuthenticated }) {
  const [accountType, setAccountType] = useState(() => new URLSearchParams(window.location.search).get('accountType') === 'vendor' ? 'vendor' : 'client')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const session = signup
        ? await marketplaceApi.signup({ name, email, password, role: accountType })
        : await marketplaceApi.login({ email, password, ...(admin ? { expectedRole: 'admin' } : {}) })
      saveMarketplaceSession(session)
      onAuthenticated(session)
    } catch (requestError) {
      setError(requestError.message || 'Could not sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="shell auth-page">
    <section className="auth-aside">
      <span className="section-kicker">{admin ? 'MARKETHUB OPERATIONS' : 'GOOD SHOPS START HERE'}</span>
      <h1>{admin ? 'A thoughtful marketplace starts with trusted people.' : signup ? 'A marketplace for the things you make.' : 'Good to see you again.'}</h1>
      <p>{admin ? 'Sign in with the administrator account configured on the MarketHub API.' : signup ? 'Join a community of thoughtful shoppers and independent sellers.' : 'Your favorite shops and finds are right where you left them.'}</p>
      <div className="auth-perks">
        <span><BadgeCheck size={18} /> Shop from people who care</span>
        <span><ShieldCheck size={18} /> Your account stays protected</span>
        <span><Heart size={18} /> Keep your favorites close</span>
      </div>
      <div className="auth-decoration"><ShoppingBag size={74} /></div>
    </section>
    <section className="auth-card">
      <button type="button" className="auth-back" onClick={() => navigate('/')}><ArrowLeft size={15} /> Back to marketplace</button>
      <div className="brand"><span className="brand-icon"><ShoppingBag size={19} strokeWidth={2.7} /></span><span>Market<span>Hub</span></span></div>
      <h2>{admin ? 'Administrator sign in' : signup ? 'Create your account' : 'Welcome back'}</h2>
      <p>{admin ? 'Admin access is provisioned by the API environment, not public signup.' : signup ? 'A few details and you’re all set.' : 'Sign in to pick up where you left off.'}</p>
      {signup && <div className="account-type-pick">
        <button className={accountType === 'client' ? 'selected' : ''} onClick={() => setAccountType('client')} type="button"><UserRound size={16} /> I’m here to shop</button>
        <button className={accountType === 'vendor' ? 'selected' : ''} onClick={() => setAccountType('vendor')} type="button"><Store size={16} /> I’m a seller</button>
      </div>}
      <form onSubmit={handleSubmit}>
        {signup && <label className="form-label">Your name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} maxLength={120} placeholder={accountType === 'vendor' ? 'Your name or shop name' : 'Full name'} /></label>}
        <label className="form-label">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
        <label className="form-label">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required placeholder="At least 8 characters" /></label>
        {error && <p className="market-form-error" role="alert">{error}</p>}
        <button type="submit" className="button button-orange auth-submit" disabled={submitting}>{submitting ? 'Please wait…' : admin ? 'Sign in as admin' : signup ? accountType === 'vendor' ? 'Apply as a seller' : 'Create account' : 'Sign in'} <ArrowRight size={16} /></button>
      </form>
      {signup && accountType === 'vendor' && <p className="market-auth-note" role="status">Seller accounts are reviewed by an administrator before products can be listed.</p>}
      {!admin && <div className="auth-switch">{signup ? 'Already have an account?' : 'New to MarketHub?'} <button type="button" onClick={() => navigate(signup ? '/login' : '/signup')}>{signup ? 'Sign in' : 'Create an account'}</button></div>}
      {!admin && <p className="auth-demo-note"><ShieldCheck size={14} /> Passwords are protected by the MarketHub API.</p>}
    </section>
  </main>
}
