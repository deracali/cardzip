import { useState } from 'react'
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react'
import { enrollmentPlans, learningCourses } from '../data/learningData'
import { LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

function LearningCheckoutPage() {
  const params = new URLSearchParams(window.location.search)
  const course = learningCourses.find((item) => item.id === params.get('course'))
  const plan = enrollmentPlans.find((item) => item.id === params.get('plan'))
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [completed, setCompleted] = useState(false)
  const item = course || plan
  const amount = course?.price ?? plan?.price
  const amountLabel = amount === undefined ? '' : `$${amount.toFixed(2)}${plan ? ` / ${plan.cadence}` : ''}`

  function handleSubmit(event) {
    event.preventDefault()
    setCompleted(true)
  }

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page checkout-page">
        <a className="back-to-link" href={course ? '/courses' : '/pricing'}><ArrowLeft size={14} /> Back</a>
        {completed ? (
          <section className="checkout-success">
            <span className="checkout-success-icon"><Check size={25} /></span>
            <span className="section-kicker">Demo checkout complete</span>
            <h1>You’re ready to learn.</h1>
            <p>No payment was processed. This checkout is a front-end demo; connect a payment provider to activate enrollment.</p>
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
              <span className="section-kicker">Secure checkout · Demo</span>
              <h1>Complete your enrollment.</h1>
              <p>Confirm your details and review your order before continuing.</p>
            </section>
            <div className="checkout-layout">
              <form className="checkout-form" onSubmit={handleSubmit}>
                <section className="checkout-section">
                  <span className="checkout-step">1</span><div><h2>Your details</h2><p>We’ll use these details for your learning account.</p></div>
                  <label>Full name<input name="name" autoComplete="name" placeholder="Lena Carter" required /></label>
                  <label>Email address<input name="email" type="email" autoComplete="email" placeholder="lena@example.com" required /></label>
                </section>
                <section className="checkout-section">
                  <span className="checkout-step">2</span><div><h2>Payment method</h2><p>Select a demo payment option. No payment details are collected.</p></div>
                  <div className="payment-methods">
                    <button className={paymentMethod === 'card' ? 'payment-method is-selected' : 'payment-method'} type="button" aria-pressed={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')}><span>▣</span><strong>Card</strong><small>Demo only</small></button>
                    <button className={paymentMethod === 'wallet' ? 'payment-method is-selected' : 'payment-method'} type="button" aria-pressed={paymentMethod === 'wallet'} onClick={() => setPaymentMethod('wallet')}><span>◉</span><strong>Digital wallet</strong><small>Demo only</small></button>
                  </div>
                  <label className="checkout-terms"><input type="checkbox" required /><span>I agree to the <a href="#terms">Terms of Service</a> and understand this is a demo checkout.</span></label>
                </section>
                <button className="button button-primary checkout-submit" type="submit"><ShieldCheck size={16} /> Complete demo enrollment · {amountLabel}</button>
                <p className="checkout-disclaimer">No charge will be made. Payment processing is not connected.</p>
              </form>
              <aside className="order-summary">
                <h2>Order summary</h2>
                {course ? <img src={course.image} alt="" /> : <div className="plan-summary-icon"><span>S</span></div>}
                <span className="section-kicker">{course ? course.category : 'Membership plan'}</span>
                <h3>{course ? course.title : plan.name}</h3>
                {course && <p>Instructor: {course.instructor}</p>}
                {plan && <p>{plan.description}</p>}
                <div className="order-line"><span>Subtotal</span><strong>{amountLabel}</strong></div>
                <div className="order-line"><span>Tax</span><strong>$0.00</strong></div>
                <div className="order-total"><span>Total today</span><strong>{amountLabel}</strong></div>
                <p className="order-secure"><ShieldCheck size={14} /> Demo order · no payment processed</p>
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
