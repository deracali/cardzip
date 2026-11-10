import { useState } from 'react'
import { ArrowRight, Check, Code2, Eye, EyeOff, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react'
import './LearningPages.css'

const learnerImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=84'
const classImage = 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=84'

function Brand() {
  return (
    <a className="learning-brand auth-brand" href="/" aria-label="Skillora home">
      <span className="brand-icon">S</span>
      <span>Skillora</span>
    </a>
  )
}

function LearningAuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accountType, setAccountType] = useState('student')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState('')
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length
  const passwordHint = password
    ? ['Weak', 'Fair', 'Good', 'Strong'][Math.max(0, strength - 1)]
    : 'Use 8+ characters with numbers & symbols'

  function handleSubmit(event) {
    event.preventDefault()
    if (isSignup && password !== confirmPassword) {
      setNotice('Your passwords do not match. Please check and try again.')
      return
    }
    setNotice('This demo form is ready to connect to your account service.')
  }

  return (
    <main className={`auth-page${isSignup ? ' signup-mode' : ''}`}>
      <section className="auth-story" aria-label="Learn with Skillora">
        {isSignup && (
          <div className="story-badges">
            <span><Sparkles size={13} /> 4.8/5 — 2.3M Reviews</span>
            <span><GraduationCap size={13} /> 900+ Expert Instructors</span>
          </div>
        )}
        {!isSignup && <Brand />}
        <img className="auth-story-image" src={isSignup ? classImage : learnerImage} alt={isSignup ? 'Learners joining an online class' : 'A student studying at a computer'} />
        {!isSignup ? (
          <div className="login-story-copy">
            <span className="story-dash" />
            <h1>Unlock Your Potential.<br />Continue Your Learning Journey.</h1>
            <p>Pick up where you left off — 68% of learners finish faster when they stay in the flow.</p>
            <div className="learning-progress">
              <strong>72%</strong>
              <div><b>Web Development Bootcamp — Module 8 of 11</b><span><i /></span></div>
            </div>
          </div>
        ) : (
          <div className="signup-story-copy">
            <h1>Learn anything. Teach anything. Earn more.</h1>
            <div className="signup-benefits">
              <div><strong>35k+</strong><span>Courses<br />Lifetime access</span></div>
              <div><strong>✦</strong><span>Certificates<br />Shareable &amp; verified</span></div>
              <div><strong>●</strong><span>Creator payout<br />Up to 85% revenue</span></div>
            </div>
            <blockquote>“I went from barista to frontend dev in 6 months with Skillora.” <span>— Priya, Instructor alum</span></blockquote>
          </div>
        )}
      </section>

      <section className="auth-form-side" aria-label={isSignup ? 'Create your account' : 'Sign in'}>
        <div className="auth-form-card">
          {isSignup && <Brand />}
          <h2>{isSignup ? 'Create Your Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">{isSignup ? 'Join 2.4M learners. Free to start, upgrade anytime.' : 'Access your enrolled courses and progress.'}</p>

          {isSignup && (
            <div className="account-type" role="group" aria-label="Choose account type">
              <button className={accountType === 'student' ? 'account-type-option is-active' : 'account-type-option'} type="button" aria-pressed={accountType === 'student'} onClick={() => setAccountType('student')}>
                <GraduationCap size={14} /> Student
              </button>
              <button className={accountType === 'instructor' ? 'account-type-option is-active' : 'account-type-option'} type="button" aria-pressed={accountType === 'instructor'} onClick={() => setAccountType('instructor')}>
                <Sparkles size={13} /> Instructor / Creator
              </button>
            </div>
          )}

          <div className="auth-socials">
            <button type="button" onClick={() => setNotice('Google sign-in is not connected yet.')}><span className="google-symbol">G</span> Google</button>
            <button type="button" onClick={() => setNotice('GitHub sign-in is not connected yet.')}><Code2 size={15} /> GitHub</button>
          </div>
          <div className="auth-divider"><span>{isSignup ? 'OR SIGN UP WITH EMAIL' : 'OR CONTINUE WITH EMAIL'}</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label className="auth-field">
                <span>Full Name</span>
                <input type="text" name="name" placeholder="e.g. Lena Carter" autoComplete="name" required />
              </label>
            )}
            <label className="auth-field">
              <span>Email Address</span>
              <input type="email" name="email" placeholder="lena.carter@example.com" autoComplete="email" required />
            </label>
            <label className="auth-field">
              <span>{isSignup ? 'Create Password' : 'Password'}</span>
              <span className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  minLength={isSignup ? 8 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            {isSignup ? (
              <>
                <label className="auth-field">
                  <span>Confirm Password</span>
                  <span className="auth-password-wrap">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                    <button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword((visible) => !visible)}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                </label>
                <div className={`password-strength strength-${strength}`} aria-live="polite">
                  <div className="strength-meter" aria-hidden="true">
                    {[0, 1, 2, 3].map((segment) => <span className={strength > segment ? 'is-filled' : ''} key={segment} />)}
                  </div>
                  <span>{passwordHint}</span>
                </div>
                <label className="terms-check">
                  <input type="checkbox" required />
                  <span className="terms-box"><Check size={11} /></span>
                  <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></span>
                </label>
              </>
            ) : (
              <div className="auth-options">
                <label className="remember-check"><input type="checkbox" defaultChecked /> <span>Remember Me</span></label>
                <button type="button" className="auth-text-button" onClick={() => setNotice('Password reset is ready to connect to your account service.')}>Forgot Password?</button>
              </div>
            )}

            <button className="button button-primary auth-submit" type="submit">{isSignup ? 'Create Account' : 'Sign In'} <ArrowRight size={15} /></button>
          </form>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <p className="auth-switch">
            {isSignup ? 'Already have an account? ' : 'Don’t have an account? '}
            <a href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign In' : 'Sign Up'}</a>
          </p>
          {!isSignup && <p className="auth-privacy"><ShieldCheck size={13} /> Protected by reCAPTCHA · Privacy &amp; Terms apply</p>}
        </div>
      </section>
    </main>
  )
}

export default LearningAuthPage
