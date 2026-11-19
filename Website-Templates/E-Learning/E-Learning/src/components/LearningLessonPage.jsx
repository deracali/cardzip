import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react'
import { learningCourses } from '../data/learningData'
import { LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

function LearningLessonPage({ courseId, mode = 'local', apiBaseUrl = '' }) {
  const [course, setCourse] = useState(learningCourses.find((item) => item.id === courseId))
  const [enrollmentId, setEnrollmentId] = useState('')
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([])
  const [previewSelected, setPreviewSelected] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(mode === 'api')

  useEffect(() => {
    let active = true
    if (mode === 'local') {
      try {
        const saved = JSON.parse(localStorage.getItem('skillora-progress-demo') || '[]')
        const progress = saved.find((item) => item.courseId === courseId)
        if (active && progress) setCompletedLessons(progress.completedLessons || [])
      } catch {}
      return () => { active = false }
    }
    async function load() {
      try {
        const [courseResponse, enrollmentResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/courses/${encodeURIComponent(courseId)}`),
          fetch(`${apiBaseUrl}/student/enrollments`, { credentials: 'include' }),
        ])
        const courseResult = await courseResponse.json().catch(() => ({}))
        const enrollmentResult = await enrollmentResponse.json().catch(() => ({}))
        if (enrollmentResponse.status === 401) {
          const next = encodeURIComponent(window.location.pathname)
          window.location.replace(`/login?next=${next}`)
          return
        }
        if (!courseResponse.ok || !enrollmentResponse.ok) throw new Error(courseResult.error || enrollmentResult.error || 'Unable to load this lesson.')
        const matched = (enrollmentResult.enrollments || []).find((item) => item.courseId === courseId)
        if (!matched) {
          window.location.replace(`/checkout?course=${encodeURIComponent(courseId)}`)
          return
        }
        if (active) {
          setCourse({ ...learningCourses.find((item) => item.id === courseId), ...courseResult.course })
          setEnrollmentId(matched._id)
          setCompletedLessons(matched.completedLessons || [])
        }
      } catch {
        if (active) setCourse(null)
      } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, courseId, mode])

  if (loading) return <div className="extra-page">Loading your course…</div>

  if (!course) {
    return (
      <div className="learning-site extra-site">
        <LearningHeader />
        <main className="extra-page"><div className="catalog-empty"><strong>Course not found</strong><a href="/courses">Browse the course catalog</a></div></main>
        <LearningFooter />
      </div>
    )
  }

  const lessons = course.curriculum.flatMap((section, sectionIndex) => [
    { title: section, section: sectionIndex },
    { title: 'Guided practice', section: sectionIndex },
    { title: 'Knowledge check', section: sectionIndex },
  ])
  const activeTitle = lessons[selectedLesson]?.title || lessons[0].title
  const completed = completedLessons.includes(selectedLesson)

  async function markComplete() {
    const updated = completedLessons.includes(selectedLesson) ? completedLessons : [...completedLessons, selectedLesson]
    if (mode === 'api' && enrollmentId) {
      const response = await fetch(`${apiBaseUrl}/student/enrollments/${encodeURIComponent(enrollmentId)}/progress`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ completedLessons: updated }),
      })
      if (!response.ok) return
    } else if (mode === 'local') {
      const progress = JSON.parse(localStorage.getItem('skillora-progress-demo') || '[]')
      const index = progress.findIndex((item) => item.courseId === courseId)
      if (index >= 0) {
        const total = lessons.length
        progress[index] = { ...progress[index], completedLessons: updated, progress: total ? Math.round((updated.length / total) * 100) : 0 }
        localStorage.setItem('skillora-progress-demo', JSON.stringify(progress))
      }
    }
    setCompletedLessons(updated)
  }

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page lesson-page">
        <a className="back-to-link" href="/dashboard"><ArrowLeft size={14} /> Back to my learning</a>
        <div className="lesson-breadcrumb"><a href="/courses">Courses</a><ChevronRight size={13} /><span>{course.category}</span></div>
        <div className="lesson-layout">
          <section className="lesson-main">
            <div className="lesson-player" style={{ backgroundImage: `linear-gradient(180deg, rgba(13, 13, 27, .08), rgba(13, 13, 27, .76)), url("${course.image}")` }}>
              <span className="player-preview-tag">COURSE PREVIEW</span>
              <button className="player-play-button" type="button" aria-label="Select lesson preview" aria-pressed={previewSelected} onClick={() => setPreviewSelected((selected) => !selected)}>
                ▶
              </button>
              <div className="player-bottom">
                <strong>{previewSelected ? 'Demo preview selected' : 'Preview lesson'}</strong>
                <span>Streaming is demo-only; course media is not connected.</span>
                <div className="player-track"><i /></div>
                <small>00:00 <span>/ 02:10</span></small>
              </div>
            </div>
            <div className="lesson-title-row">
              <div><span className="section-kicker">Lesson {selectedLesson + 1} of {lessons.length}</span><h1>{activeTitle}</h1></div>
              <button className={completed ? 'lesson-complete is-complete' : 'lesson-complete'} type="button" onClick={markComplete}>
                <Check size={15} /> {completed ? 'Completed' : 'Mark complete'}
              </button>
            </div>
            <p className="lesson-description">{course.description} This lesson includes a guided walkthrough and a short practice activity.</p>
            <div className="lesson-tabs" role="tablist" aria-label="Lesson information">
              {['Overview', 'Resources', 'Notes'].map((tab) => <button className={activeTab === tab ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === tab} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
            </div>
            <div className="lesson-material">
              {activeTab === 'Overview' && (
                <>
                  <h2>In this lesson</h2>
                  <p>Follow the key ideas, pause to try the suggested activity, and mark this lesson complete when you are ready.</p>
                  <a href={`/quiz/${course.id}`}>Take the lesson quiz <ArrowRight size={14} /></a>
                </>
              )}
              {activeTab === 'Resources' && (
                <>
                  <h2>Lesson resources</h2>
                  <p>Practice materials for this lesson will appear here when course resources are connected.</p>
                </>
              )}
              {activeTab === 'Notes' && (
                <label className="lesson-notes">
                  <span>Your notes</span>
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Write a note for this lesson..." rows={4} />
                </label>
              )}
            </div>
          </section>
          <aside className="lesson-sidebar">
            <div className="lesson-sidebar-heading"><div><span className="section-kicker">Your course</span><h2>{course.title}</h2></div><strong>{Math.round((completedLessons.length / lessons.length) * 100)}%</strong></div>
            <div className="progress-line"><span style={{ width: `${Math.round((completedLessons.length / lessons.length) * 100)}%` }} /></div>
            {course.curriculum.map((section, sectionIndex) => (
              <section className="lesson-module" key={section}>
                <h3>Module {sectionIndex + 1}: {section}</h3>
                {lessons.map((lesson, lessonIndex) => lesson.section === sectionIndex && (
                  <button className={selectedLesson === lessonIndex ? 'lesson-row is-active' : 'lesson-row'} type="button" key={`${section}-${lesson.title}`} onClick={() => { setSelectedLesson(lessonIndex); setPreviewSelected(false) }}>
                    <span className="lesson-row-icon">{completedLessons.includes(lessonIndex) ? <Check size={13} /> : '▶'}</span>
                    <span>{lesson.title}</span>
                    <small>{lessonIndex === 0 ? '08:42' : '05:10'}</small>
                  </button>
                ))}
              </section>
            ))}
            <button className="lesson-next-button" type="button" onClick={() => { setSelectedLesson((current) => Math.min(current + 1, lessons.length - 1)); setPreviewSelected(false) }}>
              Next lesson <ArrowRight size={14} />
            </button>
          </aside>
        </div>
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningLessonPage
