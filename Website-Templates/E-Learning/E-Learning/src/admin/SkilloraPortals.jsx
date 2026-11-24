import { useEffect, useState } from 'react'
import {
  ArrowRight, BadgeCheck, BookOpen, CalendarCheck, Check, Clock3, Flame,
  GraduationCap, LayoutDashboard, LogOut, PlayCircle, ShieldCheck, Sparkles, Users,
} from 'lucide-react'
import { learningCourses } from '../data/learningData'
import styles from './SkilloraPortals.module.css'

const DEMO_SESSION_KEY = 'skillora-demo-session'
const DEMO_PROGRESS_KEY = 'skillora-progress-demo'
const demoStudentCourses = [
  { courseId: 'web-development', progress: 72, nextLesson: 'Responsive layouts with CSS Grid' },
  { courseId: 'ui-ux-design', progress: 38, nextLesson: 'Build your first Figma prototype' },
]
const demoTutorCourses = learningCourses.filter((course) => ['web-development', 'ui-ux-design', 'ai-data-science'].includes(course.id))
const demoTutorEnrollments = [
  { _id: 'demo-learner-1', student: { name: 'Maya Chen', email: 'maya.chen@example.test' }, course: { title: 'The Complete Web Developer Bootcamp 2026' }, progress: 72 },
  { _id: 'demo-learner-2', student: { name: 'Noah Patel', email: 'noah.patel@example.test' }, course: { title: 'UI/UX Design Masterclass: Figma to Portfolio' }, progress: 38 },
  { _id: 'demo-learner-3', student: { name: 'Amara Okafor', email: 'amara.okafor@example.test' }, course: { title: 'AI & Machine Learning: Zero to Hero with Python' }, progress: 16 },
]

async function request(apiBaseUrl, path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options,
    })
  } catch (error) {
    throw new Error(`Could not connect to Skillora API: ${error.message}`, { cause: error })
  }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const apiError = new Error(result.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  return result
}

function LearningWorkspace({ role, activePage, user, mode, onSignOut, children }) {
  const isTutor = role === 'instructor'
  const navigation = isTutor
    ? [
        { label: 'Overview', href: '/instructor/dashboard', icon: LayoutDashboard, key: 'overview' },
        { label: 'My courses', href: '/instructor/dashboard/courses', icon: BookOpen, key: 'courses' },
        { label: 'Learners', href: '/instructor/dashboard/learners', icon: Users, key: 'learners' },
        { label: 'My profile', href: '/instructor/dashboard/profile', icon: ShieldCheck, key: 'profile' },
        { label: 'Course catalog', href: '/courses', icon: GraduationCap, key: 'catalog' },
      ]
    : [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, key: 'overview' },
        { label: 'My courses', href: '/dashboard/courses', icon: BookOpen, key: 'courses' },
        { label: 'Progress', href: '/dashboard/progress', icon: CalendarCheck, key: 'progress' },
        { label: 'My profile', href: '/dashboard/profile', icon: ShieldCheck, key: 'profile' },
        { label: 'Browse courses', href: '/courses', icon: GraduationCap, key: 'catalog' },
        { label: 'Find a tutor', href: '/instructors', icon: Users, key: 'tutors' },
        { label: 'Course pricing', href: '/pricing', icon: BadgeCheck, key: 'pricing' },
      ]
  const firstName = user?.name?.trim().split(/\s+/)[0] || (isTutor ? 'Tutor' : 'Learner')

  return (
    <main className={styles.portalPage}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/" aria-label="Skillora home">
          <span className={styles.brandMark}><GraduationCap size={19} /></span>
          <strong>Skillora<span>.</span></strong>
        </a>
        <span className={styles.sidebarLabel}>LEARNING SPACE</span>
        <nav className={styles.nav} aria-label={`${isTutor ? 'Tutor' : 'Student'} dashboard navigation`}>
          {navigation.map(({ label, href, icon: Icon, key }) => (
            <a className={activePage === key ? styles.navActive : ''} aria-current={activePage === key ? 'page' : undefined} href={href} key={key}>
              <Icon size={17} /> {label}
            </a>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.privacyCard}>
            <ShieldCheck size={17} />
            <strong>{mode === 'api' ? 'Your account is connected' : 'Local demo workspace'}</strong>
            <span>{mode === 'api' ? 'Course and learning data are loaded from Skillora.' : 'Sample data stays in this browser and is not connected to the API.'}</span>
          </div>
          <a className={styles.sidebarHome} href="/"><ArrowRight size={14} /> Back to Skillora</a>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div><span className={styles.topbarEyebrow}>{isTutor ? 'TUTOR WORKSPACE' : 'STUDENT WORKSPACE'}</span><strong>{isTutor ? 'Tutor studio' : 'My learning'}</strong></div>
          <div className={styles.topbarActions}>
            <span className={styles.connectionBadge}><span />{mode === 'api' ? 'Connected account' : 'Static demo data'}</span>
            <span className={styles.userChip}><span>{firstName.slice(0, 1).toUpperCase()}</span><strong>{firstName}</strong></span>
            <button className={styles.signOut} onClick={onSignOut}><LogOut size={15} /> Sign out</button>
          </div>
        </header>
        <div className={styles.portalContent}>{children}</div>
      </section>
    </main>
  )
}

function DashboardIntro({ kicker, title, description, action, href }) {
  return (
    <section className={styles.welcome}>
      <div><span className={styles.kicker}>{kicker}</span><h1>{title}</h1><p>{description}</p></div>
      <a className={styles.primaryAction} href={href}>{action} <ArrowRight size={15} /></a>
    </section>
  )
}

function StatCard({ icon: Icon, label, value, caption, variant = '' }) {
  return (
    <article className={styles.statCard}>
      <span className={`${styles.statIcon} ${variant ? styles[variant] : ''}`}><Icon size={18} /></span>
      <div><small>{label}</small><strong>{value}</strong><span>{caption}</span></div>
    </article>
  )
}

function AccountPanel({ user, mode, role }) {
  const isTutor = role === 'instructor'
  const rows = [
    { label: 'Name', value: user?.name || (isTutor ? 'Skillora Tutor' : 'Skillora Learner') },
    { label: 'Email', value: user?.email || 'Local demo account' },
    { label: 'Account type', value: isTutor ? 'Tutor / instructor' : 'Student' },
    { label: 'Account status', value: isTutor ? user?.instructorStatus || 'approved demo' : 'Active' },
    { label: 'Data source', value: mode === 'api' ? 'Connected Skillora account' : 'Browser-local demo profile' },
  ]
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><span>ACCOUNT SETTINGS</span><h2>Profile information</h2><p>Your Skillora account details and workspace access.</p></div><ShieldCheck size={19} /></div>
      <div className={styles.profileHero}>
        <span>{(user?.name || (isTutor ? 'Tutor' : 'Learner')).slice(0, 1).toUpperCase()}</span>
        <div><strong>{user?.name || (isTutor ? 'Skillora Tutor' : 'Skillora Learner')}</strong><small>{isTutor ? 'Tutor workspace' : 'Student workspace'}</small></div>
        <em>{mode === 'api' ? 'Connected' : 'Demo'}</em>
      </div>
      <div className={styles.profileDetails}>
        {rows.map(({ label, value }) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}
      </div>
      <p className={styles.profilePrivacy}><ShieldCheck size={15} /> {mode === 'api' ? 'This page displays the account returned by the Skillora API.' : 'Vite demo accounts are stored in this browser only. Passwords are not stored or checked.'}</p>
    </section>
  )
}

function ProgressBar({ value }) {
  const progress = Math.min(100, Math.max(0, Number(value) || 0))
  return <div className={styles.progress} role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
}

function StudentCourseCard({ item }) {
  const courseId = item.course?.courseId || item.courseId || item.course?.id
  const course = learningCourses.find((entry) => entry.id === courseId) || item.course
  if (!course) return null
  return (
    <article className={styles.studentCourse}>
      <div className={styles.courseImage}><img src={course.image || ''} alt="" /><span>{course.category}</span></div>
      <div className={styles.studentCourseBody}>
        <div className={styles.courseMeta}><span>{course.level || 'Self-paced'}</span><span><Clock3 size={12} /> {course.duration || 'On demand'}</span></div>
        <h3>{course.title}</h3>
        <p>Next up: {item.nextLesson || course.curriculum?.[0] || 'Continue your course'}</p>
        <div className={styles.courseProgressLabel}><span>Course progress</span><strong>{item.progress || 0}%</strong></div>
        <ProgressBar value={item.progress} />
        <a className={styles.continueLink} href={`/learn/${courseId}`}><PlayCircle size={15} /> Continue learning <ArrowRight size={14} /></a>
      </div>
    </article>
  )
}

export function InstructorDashboard({ mode = 'api', apiBaseUrl = '', section = 'overview' }) {
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(mode === 'api')

  useEffect(() => {
    let active = true
    if (mode === 'local') {
      async function loadLocal() {
        try {
          const session = JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null')
          if (session?.role === 'student') {
            window.location.replace('/dashboard')
            return
          }
          if (session?.role === 'admin') {
            window.location.replace('/admin')
            return
          }
          await Promise.resolve()
          if (active) {
            setUser(session || { name: 'Skillora Tutor', role: 'instructor', instructorStatus: 'approved' })
            setCourses(demoTutorCourses)
            setEnrollments(demoTutorEnrollments)
          }
        } catch (loadError) {
          if (active) setError(`Unable to load the local tutor demo: ${loadError.message}`)
        } finally {
          if (active) setLoading(false)
        }
      }
      void loadLocal()
      return () => { active = false }
    }

    async function load() {
      try {
        const session = await request(apiBaseUrl, '/auth/me')
        if (session.user.role !== 'instructor') {
          window.location.replace(session.user.role === 'admin' ? '/admin' : '/dashboard')
          return
        }
        if (active) setUser(session.user)
        if (session.user.instructorStatus !== 'approved') return
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
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, mode])

  async function signOut() {
    if (mode === 'local') {
      localStorage.removeItem(DEMO_SESSION_KEY)
      window.location.replace('/')
      return
    }
    try {
      await request(apiBaseUrl, '/auth/logout', { method: 'POST' })
      window.location.replace('/')
    } catch (signOutError) {
      setError(signOutError.message)
    }
  }

  if (loading) return <div className={styles.loading}><span /> Loading tutor workspace</div>
  const learnerCount = new Set(enrollments.map((item) => item.student?.email).filter(Boolean)).size
  const pageContent = {
    overview: { kicker: 'TUTOR STUDIO', title: `Welcome, ${user?.name?.split(' ')[0] || 'tutor'}.`, description: 'Review your courses, follow learner progress, and keep your teaching organized.', action: 'Browse courses', href: '/courses' },
    courses: { kicker: 'COURSE MANAGEMENT', title: 'Your courses', description: 'Review the courses assigned to your Skillora tutor account.', action: 'Browse catalog', href: '/courses' },
    learners: { kicker: 'LEARNER ACTIVITY', title: 'Learner progress', description: 'See how students are progressing through your courses.', action: 'View courses', href: '/instructor/dashboard/courses' },
    profile: { kicker: 'ACCOUNT SETTINGS', title: 'Tutor profile', description: 'Review the account details connected to your tutor workspace.', action: 'Back to overview', href: '/instructor/dashboard' },
  }
  const page = pageContent[section] || pageContent.overview
  return (
    <LearningWorkspace role="instructor" activePage={section} user={user} mode={mode} onSignOut={signOut}>
      <DashboardIntro kicker={page.kicker} title={page.title} description={page.description} action={page.action} href={page.href} />
      {error && <div className={styles.error} role="alert">{error}</div>}
      {section === 'overview' && user?.instructorStatus !== 'approved' && (
        <section className={styles.pending}>
          <span><Sparkles size={18} /></span>
          <div><strong>Application under review</strong><p>Your tutor application is {user?.instructorStatus || 'pending'}. Course and learner data will appear after approval.</p></div>
          <span className={styles.pendingBadge}>IN REVIEW</span>
        </section>
      )}
      {section === 'profile' ? <AccountPanel user={user} mode={mode} role="instructor" /> : <>
        {section === 'overview' && <section className={styles.stats} aria-label="Tutor activity summary">
          <StatCard icon={BookOpen} label="Assigned courses" value={courses.length} caption="In your teaching library" />
          <StatCard icon={Users} label="Active learners" value={learnerCount} caption="Across your courses" variant="statIconMint" />
          <StatCard icon={CalendarCheck} label="Total enrollments" value={enrollments.length} caption="Learner course registrations" variant="statIconBlue" />
        </section>}
        {(section === 'overview' || section === 'courses') && <section className={styles.panel} id="courses">
          <div className={styles.panelHeading}>
            <div><span>COURSE MANAGEMENT</span><h2>Your courses</h2><p>Courses assigned to your Skillora tutor account.</p></div>
            <a href="/courses">Explore catalog <ArrowRight size={14} /></a>
          </div>
          {courses.length ? (
            <div className={styles.tutorCourseGrid}>
              {courses.map((course) => (
                <article className={styles.tutorCourse} key={course.courseId || course._id || course.id}>
                  <img src={course.image || ''} alt="" />
                  <div><span>{course.category}</span><h3>{course.title}</h3><small>{course.lessons || 0} lessons · {course.duration || 'Self-paced'}</small></div>
                  <span className={course.published ? styles.publishedBadge : styles.draftBadge}>{course.published ? 'Published' : 'Draft'}</span>
                </article>
              ))}
            </div>
          ) : <div className={styles.empty}><span><BookOpen size={20} /></span><strong>No courses assigned yet</strong><p>Your assigned courses will be listed here after instructor approval.</p></div>}
        </section>}
        {(section === 'overview' || section === 'learners') && <section className={styles.panel} id="learners">
          <div className={styles.panelHeading}>
            <div><span>LEARNER ACTIVITY · {enrollments.length}</span><h2>Recent course progress</h2><p>See how learners are moving through your courses.</p></div>
            <GraduationCap size={20} />
          </div>
          {enrollments.length ? (
            <div className={styles.learnerList}>
              {enrollments.map((item, index) => (
                <article className={styles.learnerRow} key={item._id || `${item.student?.email}-${index}`}>
                  <span className={styles.learnerAvatar}>{item.student?.name?.slice(0, 1)?.toUpperCase() || 'L'}</span>
                  <div className={styles.learnerIdentity}><strong>{item.student?.name || 'Skillora learner'}</strong><small>{item.student?.email || 'Student account'}</small></div>
                  <div className={styles.learnerCourse}><small>COURSE</small><strong>{item.course?.title || 'Course enrollment'}</strong></div>
                  <div className={styles.learnerProgress}><div><small>PROGRESS</small><strong>{item.progress || 0}%</strong></div><ProgressBar value={item.progress} /></div>
                </article>
              ))}
            </div>
          ) : <div className={styles.empty}><span><Users size={20} /></span><strong>No learner activity yet</strong><p>Enrollments will appear here as students join your courses.</p></div>}
        </section>}
      </>}
    </LearningWorkspace>
  )
}

export function LearningDashboard({ mode = 'local', apiBaseUrl = '', section = 'overview' }) {
  const [user, setUser] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(mode === 'api')

  useEffect(() => {
    let active = true
    if (mode === 'local') {
      async function loadLocal() {
        try {
          const session = JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null')
          if (session?.role === 'instructor') {
            window.location.replace('/instructor/dashboard')
            return
          }
          if (session?.role === 'admin') {
            window.location.replace('/admin')
            return
          }
          const saved = JSON.parse(localStorage.getItem(DEMO_PROGRESS_KEY) || 'null') || demoStudentCourses
          await Promise.resolve()
          if (active) {
            setEnrollments(saved)
            setUser(session)
          }
        } catch (loadError) {
          if (active) setError(`Unable to load local learning data: ${loadError.message}`)
        } finally {
          if (active) setLoading(false)
        }
      }
      void loadLocal()
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
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, mode])

  async function signOut() {
    if (mode === 'local') {
      localStorage.removeItem(DEMO_SESSION_KEY)
      window.location.replace('/')
      return
    }
    try {
      await request(apiBaseUrl, '/auth/logout', { method: 'POST' })
      window.location.replace('/')
    } catch (signOutError) {
      setError(signOutError.message)
    }
  }

  if (loading) return <div className={styles.loading}><span /> Loading your learning space</div>
  const coursesInProgress = enrollments.map((item) => {
    const courseId = item.course?.courseId || item.courseId
    const course = learningCourses.find((entry) => entry.id === courseId) || item.course
    return { ...item, course, courseId, progress: item.progress || 0 }
  }).filter((item) => item.course)
  const completedCount = enrollments.filter((item) => item.status === 'completed' || item.progress === 100).length
  const recommendedCourse = learningCourses.find((course) => !coursesInProgress.some((item) => item.courseId === course.id))
  const averageProgress = coursesInProgress.length
    ? Math.round(coursesInProgress.reduce((sum, item) => sum + item.progress, 0) / coursesInProgress.length)
    : 0
  const pageContent = {
    overview: { kicker: 'YOUR LEARNING SPACE', title: `Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}.`, description: 'Pick up where you left off and keep building skills that move you forward.', action: 'Explore courses', href: '/courses' },
    courses: { kicker: 'YOUR CLASSROOM', title: 'My courses', description: 'Open your enrolled courses and continue from where you left off.', action: 'Browse catalog', href: '/courses' },
    progress: { kicker: 'LEARNING PROGRESS', title: 'Your progress', description: 'Track your course completion and celebrate each learning milestone.', action: 'Continue learning', href: '/dashboard/courses' },
    profile: { kicker: 'ACCOUNT SETTINGS', title: 'Your profile', description: 'Review the account details connected to your learning space.', action: 'Back to overview', href: '/dashboard' },
  }
  const page = pageContent[section] || pageContent.overview

  return (
    <LearningWorkspace role="student" activePage={section} user={user} mode={mode} onSignOut={signOut}>
      <DashboardIntro kicker={page.kicker} title={page.title} description={page.description} action={page.action} href={page.href} />
      {error && <div className={styles.error} role="alert">{error}</div>}
      {section === 'profile' ? <AccountPanel user={user} mode={mode} role="student" /> : <>
        {section === 'overview' && <>
          <section className={styles.stats} aria-label="Learning summary">
            <StatCard icon={BookOpen} label="Courses enrolled" value={enrollments.length} caption="Your learning library" />
            <StatCard icon={BadgeCheck} label="Courses completed" value={completedCount} caption="Milestones you have reached" variant="statIconMint" />
            <StatCard icon={Flame} label="Average progress" value={`${averageProgress}%`} caption="Across your active courses" variant="statIconBlue" />
          </section>
          <div className={styles.dashboardGrid}>
            <section className={styles.panel} id="courses">
              <div className={styles.panelHeading}>
                <div><span>YOUR CLASSROOM</span><h2>Continue learning</h2><p>Resume a course right where you left off.</p></div>
                <a href="/dashboard/courses">View all courses <ArrowRight size={14} /></a>
              </div>
              {coursesInProgress.length ? (
                <div className={styles.studentCourseList}>{coursesInProgress.slice(0, 3).map((item) => <StudentCourseCard item={item} key={item._id || item.courseId} />)}</div>
              ) : <div className={styles.empty}><span><BookOpen size={20} /></span><strong>Your learning starts here</strong><p>Enroll in a course to see its lessons and progress on this dashboard.</p><a href="/courses">Find your first course <ArrowRight size={13} /></a></div>}
            </section>
            <aside className={styles.dashboardAside}>
              <section className={styles.goalCard}>
                <span className={styles.goalIcon}><Flame size={18} /></span>
                <small>YOUR LEARNING RHYTHM</small>
                <h2>Keep your momentum.</h2>
                <p>You are averaging <strong>{averageProgress}%</strong> progress across your current courses.</p>
                <div className={styles.goalDays} aria-label="Weekly learning goal progress">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span className={index < 4 ? styles.goalDayDone : ''} key={`${day}-${index}`}>{index < 4 ? <Check size={12} /> : day}</span>)}
                </div>
                <small>Four learning days this week</small>
              </section>
              {recommendedCourse && (
                <section className={styles.recommendationCard}>
                  <span className={styles.kicker}>NEXT UP</span>
                  <h3>{recommendedCourse.title}</h3>
                  <p>{recommendedCourse.category} · {recommendedCourse.level}</p>
                  <a href="/courses">Explore this course <ArrowRight size={13} /></a>
                </section>
              )}
              <a className={styles.helpCard} href="/pricing"><span><ShieldCheck size={16} /></span><div><strong>Know what you pay for</strong><small>See clear, one-time course prices.</small></div><ArrowRight size={14} /></a>
            </aside>
          </div>
        </>}
        {section === 'courses' && <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <div><span>YOUR CLASSROOM · {coursesInProgress.length} COURSES</span><h2>Enrolled courses</h2><p>Choose a course to continue learning.</p></div>
            <a href="/courses">Browse catalog <ArrowRight size={14} /></a>
          </div>
          {coursesInProgress.length ? <div className={styles.studentCourseList}>{coursesInProgress.map((item) => <StudentCourseCard item={item} key={item._id || item.courseId} />)}</div> : <div className={styles.empty}><span><BookOpen size={20} /></span><strong>No courses yet</strong><p>Browse the catalog and enroll in a course to begin learning.</p><a href="/courses">Explore courses <ArrowRight size={13} /></a></div>}
        </section>}
        {section === 'progress' && <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <div><span>LEARNING ACTIVITY · {completedCount} COMPLETED</span><h2>Course progress</h2><p>Your completion status for every enrolled course.</p></div>
            <BadgeCheck size={20} />
          </div>
          {coursesInProgress.length ? <div className={styles.progressCourseList}>{coursesInProgress.map((item) => (
            <article className={styles.progressCourseRow} key={item._id || item.courseId}>
              <img src={item.course.image || ''} alt="" />
              <div className={styles.progressCourseInfo}><span>{item.course.category}</span><strong>{item.course.title}</strong><small>{item.progress >= 100 ? 'Course completed' : 'In progress'}</small></div>
              <div className={styles.progressCourseValue}><strong>{item.progress}%</strong><ProgressBar value={item.progress} /></div>
            </article>
          ))}</div> : <div className={styles.empty}><span><BadgeCheck size={20} /></span><strong>Progress will show here</strong><p>Enroll in a course to start tracking your learning milestones.</p><a href="/courses">Explore courses <ArrowRight size={13} /></a></div>}
        </section>}
      </>}
    </LearningWorkspace>
  )
}
