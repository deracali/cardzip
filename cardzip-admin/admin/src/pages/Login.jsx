import { useEffect, useState } from 'react'
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { adminApi } from '../services/api'


export default function Login({ onLogin, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [bootstrapSecret, setBootstrapSecret] = useState('')
  const [isBootstrap, setIsBootstrap] = useState(false)
  const [bootstrapAvailable, setBootstrapAvailable] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    adminApi.bootstrapStatus()
      .then((result) => setBootstrapAvailable(result.available))
      .catch(() => setBootstrapAvailable(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = isBootstrap
        ? await adminApi.bootstrap({ name, email, password, bootstrapSecret })
        : await adminApi.signIn({ email, password })
      onLogin?.({ token: result.token, admin: result.admin })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-wrapper">
      {/* Top Header Navigation */}
      <header className="login-nav">
        <div className="nav-brand">
          <span className="brand-logo"><img src="/cardzip-logo.jpg" alt="" /></span>
          <span className="brand-name">Cardzip</span>
          <span className="brand-badge">Super Admin Platform</span>
        </div>
        <div className="nav-status">
          <span className="status-indicator">
            <span className="dot"></span> Status: All live
          </span>
          <a href="mailto:support@cardzip.ng" className="nav-link">Support</a>
          <span className="version-tag">v3.2.1</span>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="login-main">
        {/* Left Informational Showcase */}
        <section className="info-section">
          <div className="badge-trusted">
            <span className="green-dot"></span> TRUSTED BY 48,000+ USERS NATIONWIDE
          </div>

          <h1 className="hero-heading">
            One login. Total control of Cardzip money movement.
          </h1>

          <p className="hero-subtext">
            Treasury, bills, virtual numbers, gift cards, commerce and users — guarded behind hardware-grade 2FA.
          </p>

          {/* Feature Highlight Cards */}
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon"><CheckCircle2 size={18} /></div>
              <div className="feature-content">
                <strong>₦602.8M system float monitored live</strong>
                <span>NGN + USD + USDT across all rails</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><CheckCircle2 size={18} /></div>
              <div className="feature-content">
                <strong>312 KYC reviews cleared daily</strong>
                <span>Auto-flag + manual approval pipeline</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><CheckCircle2 size={18} /></div>
              <div className="feature-content">
                <strong>Every action audit-logged</strong>
                <span>Zero-trust, 2FA-gated, SSO-ready</span>
              </div>
            </div>
          </div>

          {/* Statistics Strip */}
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-val">99.98%</span>
              <span className="stat-lbl">Uptime</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">15 min</span>
              <span className="stat-lbl">Settlement</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">24/7</span>
              <span className="stat-lbl">Fraud watch</span>
            </div>
          </div>

          {/* Active Admins Online Footer */}
          <div className="admins-online">
            <div className="avatar-group">
              <div className="avatar av-1">TC</div>
              <div className="avatar av-2">GC</div>
              <div className="avatar av-3">CE</div>
              <div className="avatar av-more">+8</div>
            </div>
            <span className="online-text">
              12 root admins online now • Lagos • Abuja • London
            </span>
          </div>
        </section>

        {/* Right Dark Authentication Card */}
        <section className="auth-section">
          <div className="auth-card">
            {/* Card Header */}
            <div className="card-top font-sans">
              <span className="brand-logo-small"><img src="/cardzip-logo.jpg" alt="" /></span>
              <div>
                <h2 className="card-brand-title">Cardzip</h2>
                <p className="card-brand-sub">SUPER-ADMIN CONSOLE</p>
              </div>
              <div className="secure-badge font-mono">
                <ShieldCheck size={13} /> Secure 256-bit
              </div>
            </div>

            <div className="card-welcome">
              <h3>{isBootstrap ? 'Set up the superadmin account' : 'Welcome back, Admin'}</h3>
              <p>{isBootstrap ? 'Create the first superadmin using the one-time server bootstrap secret.' : 'Sign in with your Cardzip admin credentials.'}</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {isBootstrap && (
                <>
                  <div className="form-field">
                    <label>Full name</label>
                    <div className="input-box">
                      <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>One-time bootstrap secret</label>
                    <div className="input-box">
                      <input type="password" value={bootstrapSecret} onChange={(e) => setBootstrapSecret(e.target.value)} autoComplete="off" required />
                    </div>
                  </div>
                </>
              )}
              {/* Email Input */}
              <div className="form-field">
                <label>Work email</label>
                <div className="input-box">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-field">
                <div className="label-row">
                  <label>Password</label>
                  <a
                    href="#forgot"
                    className="forgot-link"
                    onClick={(event) => {
                      event.preventDefault()
                      onForgotPassword?.()
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="input-box">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isBootstrap ? 'new-password' : 'current-password'}
                    minLength={isBootstrap ? 12 : undefined}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p role="alert" className="auth-error">{error}</p>}

              {/* Submit Button */}
              <button type="submit" className="btn-signin">
                {submitting ? 'Please wait…' : isBootstrap ? 'Create Superadmin' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>

            {bootstrapAvailable && (
              <button type="button" className="forgot-link" onClick={() => { setIsBootstrap((current) => !current); setError('') }}>
                {isBootstrap ? 'Return to sign in' : 'Set up the first superadmin'}
              </button>
            )}

           <footer className="card-footer">
    <span className="card-footer-text">
      <Lock size={12} className="card-footer-icon" />
      All logins are audit-logged & geo-fenced to Nigeria.
    </span>
    <a href="#audit" className="audit-link">
      Audit policy
    </a>
  </footer>
          </div>
        </section>
      </main>

      {/* Footer Legal Strip */}
<footer className="page-footer">
  <div className="footer-left">
    <span>© 2026 Cardzip Ltd • RC 1842001</span>
    <a href="#privacy">Privacy</a>
    <a href="#compliance">Compliance</a>
  </div>
  <div className="footer-right">
    <span className="green-dot"></span> All systems operational • api.cardzip.ng
  </div>
</footer>
    </div>
  )
}