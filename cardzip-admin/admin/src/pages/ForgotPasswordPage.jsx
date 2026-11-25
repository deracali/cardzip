import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function ForgotPasswordPage({ onBack }) {
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
          <p className="admin-recovery-message">
            Ask a superadmin to reset your administrator password from Admin Management. They will confirm their password before assigning a new one.
          </p>
          <button type="button" className="admin-recovery-back" onClick={onBack}>
            <ArrowLeft size={15} /> Back to login
          </button>
        </section>
      </main>
    </div>
  )
}
