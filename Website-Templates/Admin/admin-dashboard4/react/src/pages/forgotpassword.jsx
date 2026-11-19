import { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Headphones, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { userApi } from '../services/api';

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('email');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const result = await userApi.requestPasswordReset({ email: email.trim() });
      setNotice(result.message || 'A reset code has been sent to your email.');
      setStep('reset');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Your password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await userApi.resetPassword({ email: email.trim(), code: code.trim(), newPassword });
      setStep('complete');
      setNotice('Your password has been set. You can now sign in with this email and password.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* Left Hero Brand Panel */}
        <div className="auth-hero-card">
          <div className="hero-pill-badge">ACCOUNT RECOVERY</div>
          
          <h1 className="hero-headline">
            Reset your <br />
            password with <br />
            <span className="hero-highlight">complete ease.</span>
          </h1>

          <p className="hero-subtext">
            Don't worry—it happens. We'll send you secure instructions to regain access to your account in seconds.
          </p>

          {/* Graphic Shield Icon Container */}
          <div className="hero-graphics-container forgot-hero-graphic">
            <div className="recovery-shield-card">
              <div className="shield-icon-circle">
                <ShieldCheck size={40} className="green-accent" />
              </div>
              <div className="shield-card-title">Encrypted Access</div>
              <div className="shield-card-sub">Your credentials remain 100% private and protected.</div>
            </div>
          </div>

          {/* Bottom Hero Stats */}
          <div className="hero-stats-grid">
            <div className="stat-item">
              <div className="stat-val">256-bit</div>
              <div className="stat-lbl">SSL Security</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">&lt;30s</div>
              <div className="stat-lbl">Link delivery</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">24/7</div>
              <div className="stat-lbl">Automated help</div>
            </div>
          </div>

          <div className="hero-trust-bar">
            <ShieldCheck size={14} className="green-accent" />
            <span>Secure recovery · End-to-end verification · Instant access</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-card">
          <div className="form-inner">
            
            {step === 'email' ? (
              <>
                <div className="form-top-tag">PASSWORD RECOVERY</div>

                <h2 className="form-heading">Forgot password?</h2>

                <p className="form-subheading">
                  Enter the email address associated with your Cardzip account and we'll send you a six-digit password reset code.
                </p>

                <form onSubmit={handleRequestCode} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <div className="input-icon-wrapper">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={submitting}>
                    <span>{submitting ? 'Sending…' : 'Send reset code'}</span>
                    <ArrowRight size={18} />
                  </button>
                  {error && <p className="wallet-notice error" role="alert">{error}</p>}
                </form>

                <div className="toggle-auth-mode">
                  <button 
                    type="button" 
                    className="switch-mode-btn back-btn"
                    onClick={onBackToLogin}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to log in</span>
                  </button>
                </div>
              </>
            ) : step === 'reset' ? (
              <div className="success-state-box">
                <div className="success-icon-badge">
                  <Mail size={32} className="green-accent" />
                </div>

                <h2 className="form-heading">Enter your reset code</h2>

                <p className="form-subheading">
                  {notice} Check the inbox for <strong className="user-email-highlight">{email}</strong>. The code expires in 15 minutes.
                </p>

                <form onSubmit={handleResetPassword} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="reset-code">Six-digit code</label>
                    <input id="reset-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-password">New password</label>
                    <input id="new-password" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm new password</label>
                    <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                  </div>
                  {error && <p className="wallet-notice error" role="alert">{error}</p>}
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    <span>{submitting ? 'Saving…' : 'Set new password'}</span>
                    <ArrowRight size={18} />
                  </button>
                  <button type="button" className="resend-btn" disabled={submitting} onClick={handleRequestCode}>
                    <RefreshCw size={14} />
                    <span>Send a new code</span>
                  </button>
                </form>
                <button type="button" className="switch-mode-btn back-btn" onClick={() => setStep('email')}>
                  <ArrowLeft size={16} /><span>Use a different email</span>
                </button>

                <div className="toggle-auth-mode">
                  <button 
                    type="button" 
                    className="switch-mode-btn back-btn"
                    onClick={onBackToLogin}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to log in</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="success-state-box" role="status">
                <div className="success-icon-badge"><CheckCircle size={32} className="green-accent" /></div>
                <h2 className="form-heading">Password updated</h2>
                <p className="form-subheading">{notice}</p>
                <button type="button" className="submit-btn" onClick={onBackToLogin}>
                  <span>Back to log in</span><ArrowRight size={18} />
                </button>
              </div>
            )}

            <div className="form-footer-security">
              <div className="sec-note">
                <ShieldCheck size={14} className="green-accent" />
                <span>Your data is encrypted and protected.</span>
              </div>
              <div className="help-note">
                <Headphones size={14} />
                <span>Need a hand? <a href="#help" className="green-link">Get help</a></span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Global Page Footer */}
      <footer className="global-auth-footer">
        <span className="copyright-txt">© 2026 Cardzip. All rights reserved.</span>
        <div className="footer-links">
          <a href="#privacy">Privacy policy</a>
          <a href="#terms">Terms of service</a>
          <span className="system-status-indicator">
            <span className="dot-green"></span>
            All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}