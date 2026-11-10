import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Headphones, ArrowRight, Music, Globe, CheckCircle2 } from 'lucide-react';
import { userApi } from '../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REMEMBERED_EMAIL_KEY = 'cardzip-remembered-email';

export default function AuthPage({ initialMode = 'login', onForgotPassword, onAuthenticated }) {
  const googleButton = useRef(null);
  const onAuthenticatedRef = useRef(onAuthenticated);
  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated;
  }, [onAuthenticated]);
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(() => ({
    fullName: '',
    email: localStorage.getItem(REMEMBERED_EMAIL_KEY) || '',
    password: '',
    confirmPassword: '',
    rememberMe: Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY)),
    agreeTerms: false
  }));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButton.current) return undefined;
    let active = true;
    const initialize = () => {
      if (!active || !window.google?.accounts?.id || !googleButton.current) return;
      googleButton.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          if (!active) return;
          setSubmitting(true);
          setGoogleError('');
          try {
            const referralCode = new URLSearchParams(window.location.search).get('ref')
            const result = await userApi.googleSignIn({ idToken: credential, ...(referralCode ? { referralCode } : {}) });
            if (!result.token) throw new Error('Google authentication returned no Cardzip session.');
            onAuthenticatedRef.current?.(result);
          } catch (requestError) {
            setGoogleError(requestError.message);
          } finally {
            setSubmitting(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: isLogin ? 'signin_with' : 'signup_with',
        shape: 'rectangular',
        width: 320,
      });
    };
    const existing = document.querySelector('#cardzip-google-identity');
    if (window.google?.accounts?.id) {
      initialize();
    } else if (existing) {
      existing.addEventListener('load', initialize, { once: true });
    } else {
      const script = document.createElement('script');
      script.id = 'cardzip-google-identity';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initialize;
      script.onerror = () => { if (active) setGoogleError('Could not load Google sign-in. Check your connection and try again.'); };
      document.head.appendChild(script);
    }
    return () => { active = false; };
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = isLogin
        ? await userApi.login({ email: formData.email, password: formData.password })
        : await userApi.signup({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          ...(new URLSearchParams(window.location.search).get('ref')
            ? { referrer: new URLSearchParams(window.location.search).get('ref') }
            : {}),
        });
      if (!result.token) throw new Error('Authentication succeeded without a session token.');
      if (isLogin && formData.rememberMe) localStorage.setItem(REMEMBERED_EMAIL_KEY, formData.email.trim());
      else if (isLogin) localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      onAuthenticated?.(result);
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
          <div className="hero-pill-badge">ONE WALLET. ENDLESS POSSIBILITIES.</div>
          
          {isLogin ? (
            <h1 className="hero-headline">
              Your world. <br />
              Connected by <br />
              <span className="hero-highlight">possibility.</span>
            </h1>
          ) : (
            <h1 className="hero-headline">
              Your world. <br />
              Filled with <br />
              <span className="hero-highlight">possibility.</span>
            </h1>
          )}

          <p className="hero-subtext">
            {isLogin 
              ? "Your next trade, connection and everyday payment. Right where you left them." 
              : "Turn gift cards into cash. Connect across borders. Shop and pay — all with one Cardzip account."}
          </p>

          {/* Floating Feature Cards Section */}
          <div className="hero-graphics-container">
            {/* iTunes $100 Card */}
            <div className="graphic-card card-purple">
              <div className="card-top-row">
                <Music size={18} className="card-icon" />
                <span className="card-brand-label">iTunes</span>
              </div>
              <div className="card-bottom-row">
                <span className="card-sub-label">GIFT CARD</span>
                <span className="card-value-label">$100</span>
              </div>
            </div>

            {/* Virtual number card */}
            <div className="graphic-card card-dark-green">
              <div className="card-top-row">
                <span className="card-brand-label">VIRTUAL NUMBER</span>
              </div>
              <div className="card-center-icon">
                <Globe size={28} />
              </div>
              <div className="card-esim-content">
                <div className="esim-amount">SMS</div>
                <div className="esim-desc">Private number.<br />Verification codes.</div>
              </div>
            </div>

            {/* Payout Received Badge */}
            <div className="graphic-card card-payout">
              <div className="payout-header">
                <CheckCircle2 size={16} className="payout-check-icon" />
                <span>Payout received</span>
              </div>
              <div className="payout-amount">+ ₦125,000</div>
              <div className="payout-subtext">iTunes · Wallet credited in 42 seconds</div>
            </div>
          </div>

          {/* Bottom Hero Stats */}
          <div className="hero-stats-grid">
            <div className="stat-item">
              <div className="stat-val">500k+</div>
              <div className="stat-lbl">Trades completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">&lt;60s</div>
              <div className="stat-lbl">Average payout</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">190+</div>
              <div className="stat-lbl">Countries connected</div>
            </div>
          </div>

          <div className="hero-trust-bar">
            <ShieldCheck size={14} className="green-accent" />
            <span>Secure transactions · Instant payouts · 24/7 support</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-card">
          <div className="form-inner">
            <div className="form-top-tag">
              {isLogin ? 'YOUR CARDZIP ACCOUNT' : 'START YOUR CARDZIP JOURNEY'}
            </div>

            <h2 className="form-heading">
              {isLogin ? 'Welcome back.' : 'Create your account.'}
            </h2>

            <p className="form-subheading">
              {isLogin ? 'Log in to trade, connect, shop and pay.' : 'One account. Your everyday digital economy.'}
            </p>

            <form onSubmit={handleSubmit} className={`auth-form${isLogin ? ' auth-form-login' : ''}`}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  minLength={!isLogin ? 8 : undefined}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!isLogin && (
                  <span className="field-hint">Use at least 8 characters, including a letter and a number.</span>
                )}
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div className="input-password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      className="toggle-pw-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {isLogin ? (
                <div className="form-utility-row">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <span className="custom-checkbox"></span>
                    <span className="label-text">Remember me</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="green-link font-medium"
                    onClick={(event) => {
                      event.preventDefault();
                      onForgotPassword?.();
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
              ) : (
                <div className="form-utility-row">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                    <span className="custom-checkbox"></span>
                    <span className="label-text">
                      I agree to Cardzip's <a href="#terms" className="green-link inline">Terms of service</a> and <a href="#privacy" className="green-link inline">Privacy policy</a>.
                    </span>
                  </label>
                </div>
              )}

              {error && <p className="wallet-notice error" role="alert">{error}</p>}
              <button type="submit" className="submit-btn" disabled={submitting}>
                <span>{submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="google-auth-section">
              <span className="google-auth-divider">or continue with</span>
              {GOOGLE_CLIENT_ID
                ? <div ref={googleButton} className="google-auth-button" aria-label="Continue with Google" />
                : <p className="wallet-notice error" role="status">Google sign-in is unavailable until VITE_GOOGLE_CLIENT_ID is configured for this website and GOOGLE_OAUTH_CLIENT_IDS is configured on the server.</p>}
              {googleError && <p className="wallet-notice error" role="alert">{googleError}</p>}
            </div>

            <div className="toggle-auth-mode">
              <span>{isLogin ? 'New to Cardzip?' : 'Already have an account?'}</span>
              <button 
                type="button" 
                className="switch-mode-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                {isLogin ? 'Create an account' : 'Log in'}
              </button>
            </div>

            <div className="form-footer-security">
              <div className="sec-note">
                <ShieldCheck size={14} className="green-accent" />
                <span>Your data is encrypted and protected.</span>
              </div>
              {isLogin && (
                <div className="help-note">
                  <Headphones size={14} />
                  <span>Need a hand? <a href="mailto:support@cardzip.ng" className="green-link">Get help</a></span>
                </div>
              )}
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