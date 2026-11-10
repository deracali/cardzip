import { ArrowRight, Check, ChevronRight, Star } from 'lucide-react'
import { learningCourses } from '../data/learningData'
import { LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

const enrolledCourses = [
  { courseId: 'web-development', progress: 72, nextLesson: 'Responsive layouts with CSS Grid' },
  { courseId: 'ui-ux-design', progress: 38, nextLesson: 'Build your first Figma prototype' },
]

function LearningDashboardPage() {
  const courseProgress = enrolledCourses.map((enrollment) => ({
    ...enrollment,
    course: learningCourses.find((course) => course.id === enrollment.courseId),
  })).filter((enrollment) => enrollment.course)

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page dashboard-page">
        <section className="dashboard-welcome">
          <div><span className="section-kicker">Your learning space</span><h1>Welcome back, Lena.</h1><p>Small steps add up. Pick up where you left off.</p></div>
          <a className="button button-primary" href="/courses">Explore courses <ArrowRight size={15} /></a>
        </section>
        <section className="dashboard-stats" aria-label="Learning summary">
          <article><span>Courses in progress</span><strong>2</strong><small>Keep your momentum</small></article>
          <article><span>Learning hours</span><strong>18.5</strong><small>You're building a habit</small></article>
          <article><span>Certificates earned</span><strong>3</strong><small><Check size={12} /> Ready to share</small></article>
        </section>
        <div className="dashboard-columns">
          <section className="dashboard-course-list">
            <div className="section-heading"><div><span className="section-kicker">Your classroom</span><h2>Continue learning</h2></div><a className="subtle-link" href="/courses">Browse courses <ArrowRight size={14} /></a></div>
            {courseProgress.map(({ course, progress, nextLesson }) => (
              <article className="dashboard-course" key={course.id}>
                <img src={course.image} alt="" />
                <div className="dashboard-course-info">
                  <span>{course.category}</span>
                  <h3>{course.title}</h3>
                  <p>Next: {nextLesson}</p>
                  <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
                  <small>{progress}% complete</small>
                </div>
                <a className="dashboard-continue" href={`/learn/${course.id}`} aria-label={`Continue ${course.title}`}><ChevronRight size={18} /></a>
              </article>
            ))}
          </section>
          <aside className="dashboard-side">
            <section className="streak-card"><span className="streak-icon">✦</span><span>Learning streak</span><strong>4 days</strong><p>One more day to reach your weekly goal.</p><div className="streak-days"><span>M</span><span>T</span><span>W</span><span className="is-today">T</span><span>F</span><span>S</span><span>S</span></div></section>
            <section className="dashboard-recommendation"><span className="section-kicker">Picked for you</span><h3>Keep your skills moving forward.</h3><p>Explore a new subject recommended for your learning goals.</p><a href="/courses">Find a course <ArrowRight size={13} /></a></section>
            <a className="dashboard-quiz-link" href="/quiz/web-development"><span><Star size={15} /></span><div><strong>Ready for a quick check-in?</strong><small>Try a 3-question web quiz</small></div><ArrowRight size={14} /></a>
          </aside>
        </div>
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningDashboardPage
