import { ArrowRight, Star } from 'lucide-react'
import { learningCourses, learningInstructors } from '../data/learningData'
import { LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

function InstructorCard({ instructor }) {
  return (
    <article className="instructor-card">
      <img src={instructor.image} alt={instructor.name} />
      <div className="instructor-card-body">
        <span className="instructor-specialty">{instructor.specialty}</span>
        <h2>{instructor.name}</h2>
        <p>{instructor.role}</p>
        <div className="instructor-stats"><span><Star size={13} fill="currentColor" /> {instructor.rating}</span><span>{instructor.learners} learners</span></div>
        <a href={`/instructors/${instructor.id}`}>View profile <ArrowRight size={14} /></a>
      </div>
    </article>
  )
}

export function InstructorDirectoryPage() {
  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page">
        <section className="extra-page-intro">
          <span className="section-kicker">Meet the people behind the lessons</span>
          <h1>Learn from experts who love to teach.</h1>
          <p>Find practical guidance from trusted instructors across technology, design and business.</p>
        </section>
        <div className="instructor-directory">
          {learningInstructors.map((instructor) => <InstructorCard instructor={instructor} key={instructor.id} />)}
        </div>
      </main>
      <LearningFooter />
    </div>
  )
}

export function InstructorProfilePage({ instructorId }) {
  const instructor = learningInstructors.find((item) => item.id === instructorId)

  if (!instructor) {
    return (
      <div className="learning-site extra-site">
        <LearningHeader />
        <main className="extra-page"><div className="catalog-empty"><strong>Instructor not found</strong><a href="/instructors">Browse all instructors</a></div></main>
        <LearningFooter />
      </div>
    )
  }

  const courses = learningCourses.filter((course) => course.instructorId === instructor.id)

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page instructor-profile-page">
        <a className="back-to-link" href="/instructors">← All instructors</a>
        <section className="instructor-profile-card">
          <img src={instructor.image} alt={instructor.name} />
          <div>
            <span className="section-kicker">{instructor.specialty} instructor</span>
            <h1>{instructor.name}</h1>
            <p className="instructor-profile-role">{instructor.role}</p>
            <p>{instructor.bio}</p>
            <div className="instructor-profile-stats"><span><Star size={14} fill="currentColor" /> {instructor.rating} instructor rating</span><span>{instructor.learners} learners</span><span>{instructor.courses} courses</span></div>
          </div>
        </section>
        <div className="section-heading profile-courses-heading"><div><span className="section-kicker">Learn with {instructor.name.split(' ')[0]}</span><h2>Courses by this instructor</h2></div></div>
        <div className="course-grid">
          {courses.map((course) => <article className="profile-course-card" key={course.id}><img src={course.image} alt="" /><span>{course.category}</span><h3>{course.title}</h3><div><span><Star size={13} fill="currentColor" /> {course.rating}</span><strong>${course.price}</strong></div><a href={`/checkout?course=${course.id}`}>Enroll now <ArrowRight size={13} /></a></article>)}
          {!courses.length && <p className="empty-courses">New courses are coming soon.</p>}
        </div>
      </main>
      <LearningFooter />
    </div>
  )
}
