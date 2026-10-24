import { useState } from 'react'
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react'

export default function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <div className="login-wrapper">
      <header className="login-nav">
        <div className="nav-brand">
          <span className="brand-logo"><img src="/cardzip-logo.jpg" alt="" /></span>
          <span className="brand-name">Cardzip</span>
          <span className="brand-badge">Super Admin Platform</span>
        </div>
      </header>
      <main className="admin-recovery-main">
        <section className="admin-recovery-card">
          <div className="admin-recovery-icon"><ShieldCheck size={24} /></div>
          <h1>Reset your password</h1>
          {isSubmitted ? (
            <p className="admin-recovery-message">
              If an admin account exists for {email}, password reset instructions will be sent.
            </p>
          ) : (
            <>
              <p className="admin-recovery-message">
                Enter your work email to receive secure password reset instructions.
              </p>
              <form onSubmit={handleSubmit} className="admin-recovery-form">
                <label htmlFor="recovery-email">Work email</label>
                <div className="admin-recovery-input">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Send reset instructions</button>
              </form>
            </>
          )}
          <button type="button" className="admin-recovery-back" onClick={onBack}>
            <ArrowLeft size={15} /> Back to login
          </button>
        </section>
      </main>
    </div>
  )
}
