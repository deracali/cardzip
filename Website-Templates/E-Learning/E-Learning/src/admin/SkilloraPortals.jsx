import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, GraduationCap, LogOut, ShieldCheck, Sparkles } from 'lucide-react'
import { learningCourses } from '../data/learningData'
import styles from './SkilloraPortals.module.css'

async function request(apiBaseUrl, path) {
  let response
  try { response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include', headers: { Accept: 'application/json' } }) }
  catch (error) { throw new Error(`Could not connect to Skillora API: ${error.message}`) }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const apiError = new Error(result.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  return result
}

export function InstructorDashboard({ apiBaseUrl }) {
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const session = await request(apiBaseUrl, '/auth/me')
        if (session.user.role !== 'instructor') {
          window.location.replace(session.user.role === 'admin' ? '/admin' : '/dashboard')
          return
        }
        if (active) setUser(session.user)
        const [courseResult, enrollmentResult] = await Promise.all([
          request(apiBaseUrl, '/instructor/courses'),
          request(apiBaseUrl, '/instructor/enrollments'),
        ])
        if (active) {
          setCourses(courseResult.courses || [])
          setEnrollments(enrollmentResult.enrollments || [])
        }
      } catch (loadError) {
        if (!active) return
        if (loadError.status === 401) window.location.replace('/login?next=%2Finstructor%2Fdashboard')
        else setError(loadError.message)
      } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl])
  if (loading) return <div className={styles.loading}>Loading instructor workspace…</div>
  return <main className={styles.portalPage}><Header onSignOut={async () => { try { await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' }) } finally { window.location.replace('/') } }} /><section className={styles.portalContent}><span className={styles.kicker}>INSTRUCTOR STUDIO</span><h1>Welcome, {user?.name || 'instructor'}.</h1><p>Manage your assigned courses and follow learner progress.</p>{user?.instructorStatus !== 'approved' && <div className={styles.pending}><Sparkles size={17} /><span><b>Application under review</b><small>Your instructor application is {user?.instructorStatus || 'pending'}. Course tools become available after approval.</small></span></div>}{error && <div className={styles.error} role="alert">{error}</div>}<div className={styles.stats}><article><small>Assigned courses</small><strong>{courses.length}</strong></article><article><small>Learners enrolled</small><strong>{enrollments.length}</strong></article></div><section className={styles.panel}><div className={styles.panelHeading}><div><small>COURSE MANAGEMENT</small><h2>Your courses</h2></div></div>{courses.length ? courses.map((course) => <a className={styles.courseRow} key={course.courseId || course._id} href={`/learn/${course.courseId}`}><span><BookOpen size={16} /></span><div><b>{course.title}</b><small>{course.category} · {course.published ? 'Published' : 'Draft'}</small></div><ArrowRight size={15} /></a>) : <div className={styles.empty}>No courses are assigned to your instructor account yet.</div>}</section><section className={styles.panel}><div className={styles.panelHeading}><div><small>STUDENT ACTIVITY · {enrollments.length}</small><h2>Course enrollments</h2></div></div>{enrollments.map((item) => <div className={styles.enrollmentRow} key={item._id}><span><GraduationCap size={16} /></span><div><b>{item.student?.name}</b><small>{item.student?.email} · {item.course?.title}</small></div><strong>{item.progress}%</strong></div>)}{!enrollments.length && <div className={styles.empty}>Learner enrollments will appear here.</div>}</section></section></main>
}

export function LearningDashboard({ mode = 'local', apiBaseUrl = '' }) {
  const [user, setUser] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(mode === 'api')

  useEffect(() => {
    let active = true
    if (mode === 'local') {
      try {
        const saved = JSON.parse(localStorage.getItem('skillora-progress-demo') || 'null') || [
          { courseId: 'web-development', progress: 72, nextLesson: 'Responsive layouts with CSS Grid' },
          { courseId: 'ui-ux-design', progress: 38, nextLesson: 'Build your first Figma prototype' },
        ]
        if (active) setEnrollments(saved)
      } catch {}
      return () => { active = false }
    }
    async function load() {
      try {
        const session = await request(apiBaseUrl, '/auth/me')
        if (session.user.role !== 'student') {
          window.location.replace(session.user.role === 'admin' ? '/admin' : '/instructor/dashboard')
          return
        }
        if (active) setUser(session.user)
        const result = await request(apiBaseUrl, '/student/enrollments')
        if (active) setEnrollments(result.enrollments || [])
      } catch (loadError) {
        if (!active) return
        if (loadError.status === 401) window.location.replace('/login?next=%2Fdashboard')
        else setError(loadError.message)
      } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, mode])

  if (loading) return <div className={styles.loading}>Loading your learning space…</div>
  const coursesInProgress = enrollments.map((item) => {
    const courseId = item.course?.courseId || item.courseId
    const course = learningCourses.find((entry) => entry.id === courseId) || item.course
    return { ...item, course, courseId, progress: item.progress || 0 }
  }).filter((item) => item.course)

  return <main className={styles.portalPage}><Header onSignOut={mode === 'api' ? async () => { try { await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' }) } finally { window.location.replace('/') } } : () => window.location.replace('/')} /><section className={styles.portalContent}><span className={styles.kicker}>YOUR LEARNING SPACE</span><h1>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1><p>Pick up where you left off and keep building your skills.</p>{error && <div className={styles.error} role="alert">{error}</div>}<div className={styles.stats}><article><small>Courses enrolled</small><strong>{enrollments.length}</strong></article><article><small>Completed courses</small><strong>{enrollments.filter((item) => item.status === 'completed' || item.progress === 100).length}</strong></article><article><small>Learning streak</small><strong>4 days</strong></article></div><section className={styles.panel}><div className={styles.panelHeading}><div><small>YOUR CLASSROOM</small><h2>Continue learning</h2></div><a href="/courses">Explore courses <ArrowRight size={13} /></a></div>{coursesInProgress.length ? coursesInProgress.map((item) => <article className={styles.studentCourse} key={item._id || item.courseId}><img src={item.course.image || ''} alt="" /><div><small>{item.course.category}</small><b>{item.course.title}</b><span>{item.progress}% complete</span><div className={styles.progress}><i style={{ width: `${item.progress}%` }} /></div></div><a href={`/learn/${item.courseId}`} aria-label={`Continue ${item.course.title}`}><ArrowRight size={16} /></a></article>) : <div className={styles.empty}>You are not enrolled in a course yet. <a href="/courses">Explore the catalog</a></div>}</section></section></main>
}

function Header({ onSignOut }) {
  return <header className={styles.header}><a className={styles.brand} href="/"><span><GraduationCap size={18} /></span><strong>Skillora</strong></a><nav><a href="/courses">Courses</a><a href="/instructors">Instructors</a></nav><button onClick={onSignOut}><LogOut size={14} /> Sign out</button></header>
}