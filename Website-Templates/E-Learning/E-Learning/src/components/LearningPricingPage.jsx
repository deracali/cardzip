import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Check, Clock3, GraduationCap, ShieldCheck } from 'lucide-react'
import { learningCourses } from '../data/learningData'
import { LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

function formatPrice(course) {
  if (!course.price) return 'Free'
  return course.currency === 'NGN'
    ? `₦${Number(course.price).toLocaleString('en-NG')}`
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: course.currency || 'USD' }).format(course.price)
}

function LearningPricingPage({ mode = 'local', apiBaseUrl = '' }) {
  const [courses, setCourses] = useState(mode === 'local' ? learningCourses : [])
  const [loading, setLoading] = useState(mode === 'api')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (mode !== 'api') return () => { active = false }
    fetch(`${apiBaseUrl}/courses`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || 'Unable to load current course prices.')
        if (active) setCourses(result.courses || [])
      })
      .catch((loadError) => { if (active) setError(loadError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [apiBaseUrl, mode])

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page pricing-page">
        <section className="extra-page-intro pricing-intro">
          <span className="section-kicker">Clear, course-by-course pricing</span>
          <h1>Pay once for the course you choose.</h1>
          <p>Students pay the listed price for one course at a time. There is no monthly or yearly Skillora subscription; tutors do not pay to create an account.</p>
        </section>

        <section className="pricing-purchase-summary" aria-label="What course pricing includes">
          <div><span><BookOpen size={17} /></span><strong>One course</strong><small>Each checkout enrolls you in the course shown.</small></div>
          <div><span><GraduationCap size={17} /></span><strong>Course access</strong><small>Follow its curriculum and track lesson progress.</small></div>
          <div><span><ShieldCheck size={17} /></span><strong>One-time payment</strong><small>No recurring charge or automatic renewal.</small></div>
        </section>

        {error && <p className="pricing-load-error" role="alert">{error}</p>}
        {loading ? <div className="pricing-loading">Loading current course prices…</div> : courses.length ? (
          <section className="pricing-course-grid" aria-label="Course prices">
            {courses.map((course) => (
              <article className="pricing-course-card" key={course.courseId || course.id}>
                <img src={course.image || ''} alt="" />
                <div className="pricing-course-body">
                  <span className="section-kicker">{course.category}</span>
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                  <div className="pricing-course-meta"><span><Clock3 size={13} /> {course.duration || 'Self-paced'}</span><span>{course.lessons || course.curriculum?.length || 0} lessons</span><span>{course.level || 'All levels'}</span></div>
                  <div className="pricing-course-footer">
                    <div><small>{course.price ? 'One-time course price' : 'Course price'}</small><strong>{formatPrice(course)}</strong></div>
                    <a className="button button-primary" href={`/checkout?course=${encodeURIComponent(course.courseId || course.id)}`}>
                      {course.price ? 'View checkout' : 'Enroll free'} <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : !error ? <div className="pricing-loading">No courses are currently available.</div> : null}

        <aside className="pricing-content-note">
          <Check size={16} />
          <p><strong>Before accepting live payments:</strong> this template’s course lesson text and video player are sample content. Add the real course materials before charging learners for access.</p>
        </aside>
        <p className="pricing-footnote">In the connected Next.js edition, checkout uses the current course price from the API. Paystack or Stripe is offered only when configured for NGN. Vite checkout is a local demo and does not process payments.</p>
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningPricingPage
