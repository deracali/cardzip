import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react'
import { enrollmentPlans, learningCourses } from '../data/learningData'
import { LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

function LearningCheckoutPage({ mode = 'local', apiBaseUrl = '' }) {
  const params = new URLSearchParams(window.location.search)
  const courseId = params.get('course')
  const providerFromQuery = params.get('provider')
  const referenceFromQuery = providerFromQuery === 'stripe' ? params.get('session_id') : params.get('reference')
  const [course, setCourse] = useState(learningCourses.find((item) => item.id === courseId))
  const [courseLoading, setCourseLoading] = useState(mode === 'api' && Boolean(courseId))
  const plan = enrollmentPlans.find((item) => item.id === params.get('plan'))
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [completed, setCompleted] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(mode === 'api' && params.get('payment') === 'success' && Boolean(providerFromQuery && referenceFromQuery))
  const [enrollmentError, setEnrollmentError] = useState('')
  const item = course || plan
  const amount = course?.price ?? plan?.price
  const amountLabel = amount === undefined ? '' : plan
    ? `$${amount.toFixed(2)} / ${plan.cadence}`
    : `₦${Number(amount).toLocaleString('en-NG')}`
  const paidApiCheckout = mode === 'api' && Boolean(course && course.price > 0)

  useEffect(() => {
    let active = true
    if (mode !== 'api' || !courseId) return () => { active = false }
    fetch(`${apiBaseUrl}/courses/${encodeURIComponent(courseId)}`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || 'Course not found.')
        if (active) setCourse({ ...learningCourses.find((item) => item.id === courseId), ...result.course })
      })
      .catch(() => { if (active) setCourse(null) })
      .finally(() => { if (active) setCourseLoading(false) })
    return () => { active = false }
  }, [apiBaseUrl, courseId, mode])

  useEffect(() => {
    let active = true
    if (!paidApiCheckout) return () => { active = false }
    fetch(`${apiBaseUrl}/payments/providers`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || 'Unable to load payment options.')
        if (active) {
          setProviders(result.providers || [])
          setSelectedProvider((current) => current || result.providers?.[0] || '')
        }
      })
      .catch(() => { if (active) setProviders([]) })
    return () => { active = false }
  }, [apiBaseUrl, paidApiCheckout])

  useEffect(() => {
    const provider = providerFromQuery
    const reference = referenceFromQuery
    if (mode !== 'api' || params.get('payment') !== 'success' || !provider || !reference) return
    let active = true
    setVerifyingPayment(true)
    fetch(`${apiBaseUrl}/payments/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ provider, reference }),
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (response.status === 401) {
          const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
          window.location.replace(`/login?next=${next}`)
          return
        }
        if (!response.ok) throw new Error(result.error || 'Payment has not been confirmed.')
        if (active) setCompleted(true)
      })
      .catch((error) => { if (active) setEnrollmentError(error.message) })
      .finally(() => { if (active) setVerifyingPayment(false) })
    return () => { active = false }
  }, [apiBaseUrl, mode, providerFromQuery, referenceFromQuery])

  async function handleSubmit(event) {
    event.preventDefault()
    if (course && mode === 'api') {
      try {
        if (course.price > 0) {
          if (!selectedProvider) throw new Error('No payment provider is currently configured to accept NGN.')
          const response = await fetch(`${apiBaseUrl}/payments/checkout`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ courseId: course.id, provider: selectedProvider }),
          })
          const result = await response.json().catch(() => ({}))
          if (response.status === 401) {
            const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
            window.location.replace(`/login?next=${next}`)
            return
          }
          if (!response.ok) throw new Error(result.error || 'Unable to start checkout.')
          window.location.assign(result.checkoutUrl)
          return
        }
        const response = await fetch(`${apiBaseUrl}/student/enrollments`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ courseId: course.id }),
        })
        const result = await response.json().catch(() => ({}))
        if (response.status === 401) {
          const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
          window.location.replace(`/login?next=${next}`)
          return
        }
        if (!response.ok) throw new Error(result.error || 'Unable to enroll in this course.')
        setCompleted(true)
      } catch (error) {
        setEnrollmentError(error.message)
      }
      return
    }
    if (course && mode === 'local') {
      const current = JSON.parse(localStorage.getItem('skillora-progress-demo') || '[]')
      if (!current.some((item) => item.courseId === course.id)) {
        current.push({ courseId: course.id, progress: 0, nextLesson: course.curriculum[0] || 'Start learning' })
        localStorage.setItem('skillora-progress-demo', JSON.stringify(current))
      }
    }
    setCompleted(true)
  }

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page checkout-page">
        <a className="back-to-link" href={course ? '/courses' : '/pricing'}><ArrowLeft size={14} /> Back</a>
        {courseLoading || verifyingPayment ? <section className="checkout-missing"><span className="section-kicker">Checkout</span><h1>{verifyingPayment ? 'Verifying your payment…' : 'Loading course details…'}</h1></section> : completed ? (
          <section className="checkout-success">
            <span className="checkout-success-icon"><Check size={25} /></span>
            <span className="section-kicker">{course && mode === 'api' ? 'Enrollment complete' : 'Demo checkout complete'}</span>
            <h1>You’re ready to learn.</h1>
            <p>{course && mode === 'api' ? 'Your payment was verified by Skillora and your course enrollment is active.' : 'No payment was processed. Membership checkout is still a front-end demo.'}</p>
            <div className="checkout-success-item"><strong>{item?.title || item?.name}</strong><span>{amountLabel}</span></div>
            <a className="button button-primary" href={course ? `/learn/${course.id}` : '/dashboard'}>{course ? 'Open course' : 'Go to dashboard'} <Check size={15} /></a>
          </section>
        ) : !item ? (
          <section className="checkout-missing">
            <span className="section-kicker">Checkout</span>
            <h1>Choose a course or plan first.</h1>
            <p>Browse the catalog to enroll in a course, or compare membership plans.</p>
            <div><a className="button button-primary" href="/courses">Browse courses</a><a className="button button-outline" href="/pricing">View plans</a></div>
          </section>
        ) : (
          <>
            <section className="extra-page-intro checkout-intro">
              <span className="section-kicker">{paidApiCheckout ? 'Secure checkout · NGN' : 'Secure checkout · Demo'}</span>
              <h1>Complete your enrollment.</h1>
              <p>{paidApiCheckout ? 'Choose an available provider to pay securely. Card details are entered only on the provider’s hosted checkout.' : 'Confirm your details and review your order before continuing.'}</p>
            </section>
            <div className="checkout-layout">
              <form className="checkout-form" onSubmit={handleSubmit}>
                {enrollmentError && <p className="auth-notice" role="alert">{enrollmentError}</p>}
                {!paidApiCheckout && <section className="checkout-section">
                  <span className="checkout-step">1</span><div><h2>Your details</h2><p>We’ll use these details for your learning account.</p></div>
                  <label>Full name<input name="name" autoComplete="name" placeholder="Lena Carter" required /></label>
                  <label>Email address<input name="email" type="email" autoComplete="email" placeholder="lena@example.com" required /></label>
                </section>}
                <section className="checkout-section">
                  <span className="checkout-step">{paidApiCheckout ? '1' : '2'}</span><div><h2>{paidApiCheckout ? 'Payment provider' : 'Payment method'}</h2><p>{paidApiCheckout ? 'You’ll complete payment on the selected provider’s hosted page.' : 'Select a demo payment option. No payment details are collected.'}</p></div>
                  {paidApiCheckout ? (
                    providers.length ? <div className="payment-methods">
                      {providers.map((provider) => <button key={provider} className={selectedProvider === provider ? 'payment-method is-selected' : 'payment-method'} type="button" aria-pressed={selectedProvider === provider} onClick={() => setSelectedProvider(provider)}><span>{provider === 'stripe' ? '▣' : '◉'}</span><strong>{provider === 'stripe' ? 'Stripe' : 'Paystack'}</strong><small>NGN supported</small></button>)}
                    </div> : <p role="status">No payment provider is currently configured to accept NGN. Please try again later.</p>
                  ) : <>
                    <div className="payment-methods">
                      <button className="payment-method is-selected" type="button" aria-pressed="true"><span>▣</span><strong>Card</strong><small>Demo only</small></button>
                      <button className="payment-method" type="button" aria-pressed="false"><span>◉</span><strong>Digital wallet</strong><small>Demo only</small></button>
                    </div>
                    <label className="checkout-terms"><input type="checkbox" required /><span>I agree to the <a href="#terms">Terms of Service</a> and understand this is a demo checkout.</span></label>
                  </>}
                </section>
                <button className="button button-primary checkout-submit" type="submit" disabled={paidApiCheckout && !providers.includes(selectedProvider)}><ShieldCheck size={16} /> {paidApiCheckout ? `Continue to secure payment · ${amountLabel}` : `Complete demo enrollment · ${amountLabel}`}</button>
                <p className="checkout-disclaimer">{paidApiCheckout ? 'Payment and enrollment are confirmed server-side. Skillora never collects card details.' : 'No charge will be made for demo membership checkout.'}</p>
              </form>
              <aside className="order-summary">
                <h2>Order summary</h2>
                {course ? <img src={course.image} alt="" /> : <div className="plan-summary-icon"><span>S</span></div>}
                <span className="section-kicker">{course ? course.category : 'Membership plan'}</span>
                <h3>{course ? course.title : plan.name}</h3>
                {course && <p>Instructor: {course.instructor}</p>}
                {plan && <p>{plan.description}</p>}
                <div className="order-line"><span>Subtotal</span><strong>{amountLabel}</strong></div>
                <div className="order-line"><span>Tax</span><strong>{course ? '₦0' : '$0.00'}</strong></div>
                <div className="order-total"><span>Total today</span><strong>{amountLabel}</strong></div>
                <p className="order-secure"><ShieldCheck size={14} /> {paidApiCheckout ? 'Secure provider checkout · NGN' : 'Demo order · no payment processed'}</p>
              </aside>
            </div>
          </>
        )}
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningCheckoutPage
