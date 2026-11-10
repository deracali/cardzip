import { useEffect, useState } from 'react'
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import doctorPortrait from './assets/Welcoming doctor.png'
import HomePage from './components/HomePage'
import DoctorsPage from './pages/DoctorsPage'
import BookNowPage from './pages/BookNowPage'
import DoctorDetailsPage from './pages/DoctorDetailsPage'
import CarewellAboutPage from './pages/CarewellAboutPage'
import CarewellSpecialtiesPage from './pages/CarewellSpecialtiesPage'
import { doctors } from './data/doctors'
import './App.css'

function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState('patient')
  const [notice, setNotice] = useState('')
  const isSignUp = window.location.pathname === '/signup'
  const passwordStrength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSignUp && password !== confirmPassword) {
      setNotice('Your passwords do not match. Please check and try again.')
      return
    }
    setNotice(isSignUp
      ? 'Account creation is ready to connect to your registration service.'
      : 'This sign-in form is ready to connect to your account service.')
  }

  return (
    <main className="signin-page">
      <section className="welcome-panel" aria-label="Welcome to Carewell">
        <div className="welcome-copy">
          <div className="eyebrow"><Heart size={12} /> YOUR HEALTH. YOUR PEOPLE.</div>
          <h1>{isSignUp ? <>A healthier tomorrow<br />starts here.</> : <>Welcome Back<br />to Better Health</>}</h1>
          <p>Expert care, real connection. A simpler way to look after yourself and the people you love.</p>
        </div>

        <div className="portrait-wrap">
          <img className="doctor-portrait" src={doctorPortrait} alt="A welcoming doctor in her clinic" />
          <div className="trust-badge"><Check size={12} /> Care you can trust</div>
          <blockquote className="doctor-quote">
            <p>“Good care starts with feeling heard. We’re here for every step.”</p>
            <footer>
              <span><strong>Dr. Maya Johnson</strong><br />Primary Care · Carewell provider</span>
              <Heart className="quote-heart" size={17} />
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="signin-area" aria-label={isSignUp ? 'Create an account' : 'Sign in'}>
        <a className="back-link" href="/">
          <ArrowLeft size={14} /> Back to home
        </a>

        <div className={isSignUp ? 'signin-card signup-card' : 'signin-card'}>
          <a className="brand" href="/" aria-label="Carewell home">
            <span className="brand-mark"><Plus size={19} strokeWidth={4} /></span>
            <span>carewell<span className="brand-period">.</span></span>
          </a>

          <h2>{isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}</h2>
          <p className="card-subtitle">
            {isSignUp ? 'Your care journey starts with one simple step.' : 'Manage appointments and medical records'}
          </p>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <input type="hidden" name="accountType" value={accountType} />
                <div className="account-type" role="group" aria-label="Choose account type">
                  <button
                    className={accountType === 'patient' ? 'account-type-option is-active' : 'account-type-option'}
                    type="button"
                    aria-pressed={accountType === 'patient'}
                    onClick={() => setAccountType('patient')}
                  >
                    <UserRound size={15} /> Patient
                  </button>
                  <button
                    className={accountType === 'provider' ? 'account-type-option is-active' : 'account-type-option'}
                    type="button"
                    aria-pressed={accountType === 'provider'}
                    onClick={() => setAccountType('provider')}
                  >
                    <Stethoscope size={15} /> Doctor/Provider
                  </button>
                </div>

                <div className="form-field">
                  <label htmlFor="full-name">Full Name</label>
                  <div className="input-wrap">
                    <UserRound size={15} aria-hidden="true" />
                    <input id="full-name" name="name" type="text" placeholder="Enter your full name" autoComplete="name" required />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-wrap">
                    <Phone size={15} aria-hidden="true" />
                    <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" required />
                  </div>
                </div>
              </>
            )}

            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <Mail size={15} aria-hidden="true" />
                <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">{isSignUp ? 'Create Password' : 'Password'}</label>
              <div className="input-wrap">
                <LockKeyhole size={15} aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={isSignUp ? 8 : undefined}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignUp ? (
              <>
                <div className={`password-strength strength-${passwordStrength}`} aria-live="polite">
                  <div className="strength-meter" aria-hidden="true">
                    {[0, 1, 2, 3].map((segment) => (
                      <span className={passwordStrength > segment ? 'is-filled' : ''} key={segment} />
                    ))}
                  </div>
                  <span>{password ? ['Weak password', 'Fair password', 'Good password', 'Strong password'][Math.max(0, passwordStrength - 1)] : 'Use at least 8 characters'}</span>
                </div>

                <div className="form-field">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="input-wrap">
                    <LockKeyhole size={15} aria-hidden="true" />
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      minLength={8}
                      required
                    />
                    <button
                      className="password-toggle"
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label className="remember-option terms-option">
                  <input type="checkbox" name="terms" required />
                  <span className="custom-checkbox"><Check size={10} /></span>
                  <span>I agree to the <a href="#terms">Terms of Service</a> &amp; <a href="#privacy">Privacy Policy</a></span>
                </label>
              </>
            ) : (
              <div className="form-options">
                <label className="remember-option">
                  <input type="checkbox" name="remember" defaultChecked />
                  <span className="custom-checkbox"><Check size={10} /></span>
                  Remember Me
                </label>
                <button
                  className="text-button forgot-link"
                  type="button"
                  onClick={() => setNotice('Password reset is ready to connect to your account service.')}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button className="signin-button" type="submit">
              {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="divider"><span>or continue with</span></div>

          <div className="social-options">
            <button className="social-button" type="button" onClick={() => setNotice('Google sign-in is not configured yet.')}>
              <span className="google-mark" aria-hidden="true">G</span> Google
            </button>
            <button className="social-button" type="button" onClick={() => setNotice('Apple sign-in is not configured yet.')}>
              <Apple size={17} fill="currentColor" /> Apple
            </button>
          </div>

          {notice && <p className="form-notice" role="status">{notice}</p>}

          <p className="signup-prompt">
            {isSignUp ? 'Already registered? ' : 'Don’t have an account? '}
            <a className="text-button signup-link" href={isSignUp ? '/login' : '/signup'}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </a>
          </p>
        </div>

        <p className="privacy-note"><ShieldCheck size={14} /> Your health information stays private and secure.</p>
      </section>
    </main>
  )
}

function App() {
  const { pathname } = window.location
  const doctorProfile = pathname.match(/^\/doctors\/([^/]+)$/)
  const selectedDoctor = doctors.find((doctor) => doctor.slug === doctorProfile?.[1])

  useEffect(() => {
    if (pathname === '/') {
      document.title = 'Lumière Salon & Spa | Beauty, thoughtfully done'
    } else if (pathname === '/doctors') {
      document.title = 'Find Doctors | Carewell'
    } else if (pathname === '/book-now') {
      document.title = 'Book an Appointment | Carewell'
    } else if (pathname === '/about') {
      document.title = 'About Carewell | Better Care Starts Here'
    } else if (pathname === '/specialties') {
      document.title = 'Medical Specialties | Carewell'
    } else if (pathname === '/signup') {
      document.title = 'Create Your Account | Carewell'
    } else if (pathname === '/login') {
      document.title = 'Sign In | Carewell'
    } else if (doctorProfile) {
      document.title = selectedDoctor ? `${selectedDoctor.name} | Carewell` : 'Doctor Profile | Carewell'
    }
  }, [doctorProfile, pathname, selectedDoctor])

  if (pathname === '/') return <HomePage />
  if (pathname === '/book-now') return <BookNowPage />
  if (pathname === '/about') return <CarewellAboutPage />
  if (pathname === '/specialties') return <CarewellSpecialtiesPage />
  if (pathname === '/doctors') return <DoctorsPage />
  if (doctorProfile) return <DoctorDetailsPage slug={doctorProfile[1]} />
  if (pathname === '/login' || pathname === '/signup') return <AuthPage />

  return <HomePage />
}

export default App
