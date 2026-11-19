import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowUpRight, BadgeCheck, BookOpen, Check, ChevronDown, CircleDollarSign,
  GraduationCap, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck,
  Sparkles, Users, X,
} from 'lucide-react'
import { enrollmentPlans, learningCourses, learningInstructors } from '../data/learningData'
import styles from './SkilloraAdmin.module.css'

const DATA_KEY = 'skillora-admin-demo-v1'
const SESSION_KEY = 'skillora-admin-demo-session'
const PAGES = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Courses', icon: BookOpen },
  { name: 'Lessons', icon: Activity },
  { name: 'Instructors', icon: Sparkles },
  { name: 'Students', icon: Users },
  { name: 'Enrollments', icon: GraduationCap },
  { name: 'Settings', icon: Settings },
]
const initialDemoData = {
  courses: learningCourses.map((course) => ({ ...course, published: true })),
  instructors: learningInstructors.map((instructor, index) => ({ ...instructor, instructorId: instructor.id, id: `instructor-demo-${index + 1}`, instructorStatus: index === 0 ? 'approved' : 'pending', active: true })),
  students: [
    { id: 'student-demo-1', name: 'Lena Carter', email: 'lena@example.com', active: true, createdAt: '2026-10-12T12:00:00.000Z' },
    { id: 'student-demo-2', name: 'Noah Williams', email: 'noah@example.com', active: true, createdAt: '2026-10-22T12:00:00.000Z' },
    { id: 'student-demo-3', name: 'Mia Thompson', email: 'mia@example.com', active: false, createdAt: '2026-11-02T12:00:00.000Z' },
  ],
  enrollments: [
    { id: 'enrollment-demo-1', student: { name: 'Lena Carter', email: 'lena@example.com' }, course: { courseId: 'web-development', title: 'The Complete Web Developer Bootcamp 2026' }, progress: 72, status: 'active', createdAt: '2026-10-14T12:00:00.000Z' },
    { id: 'enrollment-demo-2', student: { name: 'Noah Williams', email: 'noah@example.com' }, course: { courseId: 'ui-ux-design', title: 'UI/UX Design Masterclass: Figma to Portfolio' }, progress: 38, status: 'active', createdAt: '2026-10-29T12:00:00.000Z' },
    { id: 'enrollment-demo-3', student: { name: 'Mia Thompson', email: 'mia@example.com' }, course: { courseId: 'ai-data-science', title: 'AI & Machine Learning: Zero to Hero with Python' }, progress: 100, status: 'completed', createdAt: '2026-10-03T12:00:00.000Z' },
  ],
  settings: { platformName: 'Skillora', supportEmail: 'support@skillora.example', instructorApplications: true, announcement: '' },
}

function readDemoData() {
  try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY) || 'null')
    if (saved?.courses && saved?.settings) return saved
  } catch {}
  localStorage.setItem(DATA_KEY, JSON.stringify(initialDemoData))
  return initialDemoData
}

function saveDemoData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

async function request(apiBaseUrl, path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options,
    })
  } catch (error) {
    throw new Error(`Could not connect to Skillora API at ${apiBaseUrl}: ${error.message}`)
  }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const apiError = new Error(result.error || `Request failed (${response.status}).`)
    apiError.status = response.status
    throw apiError
  }
  return result
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—'
}

function Status({ value }) {
  return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}><i />{value}</span>
}

function Login({ mode, apiBaseUrl, onSignedIn, authError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(authError || '')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'local') {
        const demo = { name: 'Skillora Admin', email: 'admin@skillora.local', role: 'admin' }
        localStorage.setItem(SESSION_KEY, JSON.stringify(demo))
        onSignedIn(demo)
      } else {
        const result = await request(apiBaseUrl, '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        if (result.user.role !== 'admin') {
          await request(apiBaseUrl, '/auth/logout', { method: 'POST' })
          throw new Error('This account does not have administrator access.')
        }
        onSignedIn(result.user)
      }
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className={styles.loginPage}>
    <a className={styles.loginBrand} href="/"><span><GraduationCap size={19} /></span><strong>Skillora</strong></a>
    <form className={styles.loginPanel} onSubmit={submit}>
      <small>LEARNING OPERATIONS</small><h1>Administrator sign in</h1>
      <p>{mode === 'local' ? 'Open the browser-only Skillora admin demonstration.' : 'Use the administrator account configured on the backend.'}</p>
      {mode === 'api' && <><label htmlFor="admin-email">Administrator email</label><input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></>}
      {error && <div className={styles.error} role="alert">{error}</div>}
      <button className={styles.primaryButton} disabled={busy}>{mode === 'local' ? 'Open demo workspace' : busy ? 'Signing in…' : 'Sign in securely'}</button>
      <small>{mode === 'local' ? 'Demo only · Browser storage' : 'Protected server session'}</small>
    </form>
    <a className={styles.backLink} href="/">← Back to Skillora</a>
  </main>
}

function Metric({ label, value, note, icon: Icon, tone }) {
  return <article className={styles.metric}><span className={`${styles.metricIcon} ${styles[tone]}`}><Icon size={16} /></span><small>{label}</small><strong>{value}</strong><i>{note}</i></article>
}

export default function SkilloraAdmin({ mode = 'local', apiBaseUrl = '' }) {
  const [admin, setAdmin] = useState(null)
  const [data, setData] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [page, setPage] = useState('Overview')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [editor, setEditor] = useState(null)

  async function loadData() {
    if (mode === 'local') {
      setData(readDemoData())
      setLoading(false)
      return
    }
    try {
      const [summary, courses, instructors, students, enrollments, settings] = await Promise.all([
        request(apiBaseUrl, '/admin/summary'),
        request(apiBaseUrl, '/admin/courses'),
        request(apiBaseUrl, '/admin/instructors'),
        request(apiBaseUrl, '/admin/students'),
        request(apiBaseUrl, '/admin/enrollments'),
        request(apiBaseUrl, '/admin/settings'),
      ])
      setMetrics(summary.metrics)
      setData({ courses: courses.courses, instructors: instructors.instructors, students: students.students, enrollments: enrollments.enrollments, settings: settings.settings })
      setError('')
    } catch (loadError) {
      if (loadError.status === 401) setAdmin(null)
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function initialize() {
      if (mode === 'local') {
        try {
          const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
          if (active && session) {
            setAdmin(session)
            setData(readDemoData())
          }
        } catch {}
        if (active) setLoading(false)
        return
      }
      try {
        const result = await request(apiBaseUrl, '/auth/me')
        if (active && result.user.role === 'admin') setAdmin(result.user)
        else if (active) setError('This account does not have administrator access.')
      } catch {
        if (active) setAdmin(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    void initialize()
    return () => { active = false }
  }, [apiBaseUrl, mode])

  useEffect(() => { if (admin) void loadData() }, [admin, mode])

  const source = page === 'Courses' || page === 'Lessons' ? data?.courses : page === 'Instructors' ? data?.instructors : page === 'Students' ? data?.students : page === 'Enrollments' ? data?.enrollments : []
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return source || []
    return (source || []).filter((item) => JSON.stringify(item).toLowerCase().includes(search))
  }, [query, source])
  function applyLocal(collection, item, changes) {
    const updated = { ...data, [collection]: data[collection].map((record) => (record.id || record._id || record.courseId) === (item.id || item._id || item.courseId) ? { ...record, ...changes } : record) }
    saveDemoData(updated)
    setData(updated)
  }

  async function updateItem(collection, item, changes, route) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'local') applyLocal(collection, item, changes)
      else {
        await request(apiBaseUrl, route, { method: 'PATCH', body: JSON.stringify(changes) })
        await loadData()
      }
      setNotice('Changes saved.')
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveCourse(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const course = {
      title: String(form.get('title') || '').trim(),
      category: String(form.get('category') || '').trim(),
      instructor: String(form.get('instructor') || '').trim(),
      instructorId: String(form.get('instructorId') || '').trim(),
      price: Number(form.get('price')),
      oldPrice: Number(form.get('oldPrice')) || 0,
      duration: String(form.get('duration') || '').trim(),
      level: String(form.get('level') || 'Beginner'),
      image: String(form.get('image') || '').trim(),
      description: String(form.get('description') || '').trim(),
      curriculum: String(form.get('curriculum') || '').split('\n').map((item) => item.trim()).filter(Boolean),
      published: form.get('published') === 'on',
      lessons: String(form.get('curriculum') || '').split('\n').filter((item) => item.trim()).length * 3,
    }
    try {
      if (mode === 'local') {
        const courseId = editor?.courseId || course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const nextCourse = { ...editor, ...course, id: courseId, courseId }
        const nextCourses = editor ? data.courses.map((item) => item.courseId === editor.courseId ? nextCourse : item) : [...data.courses, nextCourse]
        const updated = { ...data, courses: nextCourses }
        saveDemoData(updated)
        setData(updated)
      } else if (editor) {
        await request(apiBaseUrl, `/admin/courses/${encodeURIComponent(editor.courseId)}`, { method: 'PATCH', body: JSON.stringify(course) })
        await loadData()
      } else {
        await request(apiBaseUrl, '/admin/courses', { method: 'POST', body: JSON.stringify(course) })
        await loadData()
      }
      setEditor(null)
      setNotice('Course content saved.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveSettings(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const settings = {
      platformName: String(form.get('platformName') || '').trim(),
      supportEmail: String(form.get('supportEmail') || '').trim(),
      instructorApplications: form.get('instructorApplications') === 'on',
      announcement: String(form.get('announcement') || '').trim(),
    }
    try {
      if (mode === 'local') {
        const updated = { ...data, settings }
        saveDemoData(updated)
        setData(updated)
      } else {
        const result = await request(apiBaseUrl, '/admin/settings', { method: 'PUT', body: JSON.stringify(settings) })
        setData({ ...data, settings: result.settings })
      }
      setNotice('Platform settings saved.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    if (mode === 'local') localStorage.removeItem(SESSION_KEY)
    else {
      try { await request(apiBaseUrl, '/auth/logout', { method: 'POST' }) } catch {}
    }
    setAdmin(null)
    setData(null)
  }

  if (loading || (admin && !data && !error)) return <div className={styles.loading}><span /> Loading Skillora workspace</div>
  if (!admin) return <Login mode={mode} apiBaseUrl={apiBaseUrl} onSignedIn={(value) => { setError(''); setAdmin(value) }} authError={error} />
  if (!data) return <div className={styles.loading}><span />{error || 'Workspace data is unavailable.'}<button className={styles.secondaryButton} onClick={() => { setError(''); setLoading(true); void loadData() }}>Retry</button></div>
  const summary = metrics || {
    students: data?.students?.length || 0,
    instructors: data?.instructors?.length || 0,
    pendingInstructors: data?.instructors?.filter((item) => item.instructorStatus === 'pending').length || 0,
    courses: data?.courses?.length || 0,
    publishedCourses: data?.courses?.filter((item) => item.published).length || 0,
    enrollments: data?.enrollments?.length || 0,
    activeEnrollments: data?.enrollments?.filter((item) => item.status === 'active').length || 0,
  }
  const pendingInstructorCount = data?.instructors?.filter((item) => item.instructorStatus === 'pending').length || 0

  return <div className={styles.shell}>
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
      <a className={styles.brand} href="/"><span><GraduationCap size={19} /></span><strong>Skillora</strong></a>
      <div className={styles.workspace}><span className={styles.workspaceIcon}><ShieldCheck size={16} /></span><span><b>Learning ops</b><small>Platform administration</small></span></div>
      <nav aria-label="Skillora admin pages"><small>WORKSPACE</small>{PAGES.map(({ name, icon: Icon }) => <button key={name} className={page === name ? styles.activeNav : ''} onClick={() => { setPage(name); setMobileOpen(false); setQuery(''); setNotice('') }}><Icon size={16} /><span>{name}</span>{name === 'Instructors' && pendingInstructorCount > 0 && <i>{pendingInstructorCount}</i>}</button>)}</nav>
      <div className={styles.sidebarFoot}><span><i />{mode === 'local' ? 'LocalStorage demo' : 'Authenticated API'}</span><a href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={14} /> Public site</a><button onClick={signOut}><LogOut size={14} /> Sign out</button></div>
    </aside>
    {mobileOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <main className={styles.main}>
      <header className={styles.topbar}><button className={styles.mobileMenu} aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={18} /></button><div><span>Skillora</span><b>/</b><strong>{page}</strong></div><div className={styles.topUser}><span>{mode === 'local' ? 'LOCAL DEMO' : 'ADMIN SESSION'}</span><i>SK</i><small>{admin.name || admin.email}</small><button aria-label="Sign out" onClick={signOut}><LogOut size={15} /></button></div></header>
      <div className={styles.content}>
        <div className={styles.heading}><div><small>SKILLORA · LEARNING OPERATIONS</small><h1>{page}</h1><p>Manage the learning catalog, instructors, enrollments, and platform access.</p></div></div>
        {mode === 'local' && <div className={styles.demoNotice}><BadgeCheck size={15} /><span><b>Local demonstration</b> Changes stay in this browser and do not represent real learners or paid enrollments.</span></div>}
        {error && <div className={styles.error} role="alert"><X size={15} />{error}</div>}{notice && <div className={styles.notice} role="status"><Check size={15} />{notice}</div>}
        {page === 'Overview' && <>
          <div className={styles.metrics}><Metric label="Courses" value={summary.courses} note={`${summary.publishedCourses} published`} icon={BookOpen} tone="violet" /><Metric label="Students" value={summary.students} note="Registered learners" icon={Users} tone="blue" /><Metric label="Instructors" value={summary.instructors} note={`${summary.pendingInstructors} for review`} icon={Sparkles} tone="rose" /><Metric label="Enrollments" value={summary.enrollments} note={`${summary.activeEnrollments} in progress`} icon={GraduationCap} tone="green" /></div>
          <div className={styles.overviewGrid}><section className={styles.panel}><div className={styles.panelHeading}><div><small>CONTENT HEALTH</small><h2>Course catalog</h2></div><button onClick={() => setPage('Courses')}>Manage courses <ArrowUpRight size={14} /></button></div><div className={styles.simpleRows}>{(data.courses || []).slice(0, 5).map((course) => <div key={course.id || course.courseId}><span><b>{course.title}</b><small>{course.category} · {course.instructor}</small></span><Status value={course.published ? 'published' : 'draft'} /></div>)}</div></section><aside className={styles.healthCard}><span><ShieldCheck size={16} /> PLATFORM BOUNDARY</span><h2>Keep student data private.</h2><p>Use the backend edition for real accounts. The React admin and its seed data are browser-only and should not manage paid enrollments.</p></aside></div>
        </>}
        {page === 'Courses' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>COURSE CATALOG · {data.courses.length}</small><h2>Courses</h2></div><div className={styles.actions}><SearchBox value={query} onChange={setQuery} /><button className={styles.primaryButton} onClick={() => setEditor({ curriculum: [], published: false, price: 0, oldPrice: 0 })}>New course</button></div></div><CourseTable courses={filtered} busy={busy} onEdit={setEditor} onToggle={(course) => updateItem('courses', course, { published: !course.published }, `/admin/courses/${encodeURIComponent(course.courseId || course.id)}`)} /></section>}
        {page === 'Lessons' && <LessonsPage courses={data.courses} selectedId={query} onSelect={setQuery} onEdit={(course) => setEditor(course)} />}
        {page === 'Instructors' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>INSTRUCTOR ACCESS · {data.instructors.length}</small><h2>Instructor applications</h2></div><SearchBox value={query} onChange={setQuery} /></div><InstructorTable instructors={filtered} busy={busy} onUpdate={(item, changes) => updateItem('instructors', item, changes, `/admin/instructors/${item._id || item.id}`)} /></section>}
        {page === 'Students' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>LEARNER ACCOUNTS · {data.students.length}</small><h2>Students</h2></div><SearchBox value={query} onChange={setQuery} /></div><StudentTable students={filtered} busy={busy} onUpdate={(item, changes) => updateItem('students', item, changes, `/admin/students/${item._id || item.id}`)} /></section>}
        {page === 'Enrollments' && <section className={styles.panel}><div className={styles.panelHeading}><div><small>LEARNING ACCESS · {data.enrollments.length}</small><h2>Enrollments</h2></div><SearchBox value={query} onChange={setQuery} /></div><EnrollmentTable enrollments={filtered} busy={busy} onUpdate={(item, changes) => updateItem('enrollments', item, changes, `/admin/enrollments/${item._id || item.id}`)} /></section>}
        {page === 'Settings' && <form className={styles.panel + ' ' + styles.settingsPanel} onSubmit={saveSettings}><div className={styles.panelHeading}><div><small>PLATFORM CONFIGURATION</small><h2>Skillora settings</h2></div><button className={styles.primaryButton} disabled={busy}>Save settings</button></div><label>Platform name<input name="platformName" defaultValue={data.settings.platformName} required /></label><label>Support email<input name="supportEmail" type="email" defaultValue={data.settings.supportEmail} required /></label><label>Announcement<textarea name="announcement" rows="3" maxLength="500" defaultValue={data.settings.announcement} /></label><label className={styles.toggleRow}><span><b>Instructor applications</b><small>Allow new instructor accounts to apply for approval.</small></span><input name="instructorApplications" type="checkbox" defaultChecked={data.settings.instructorApplications} /></label><div className={styles.privacyNote}><ShieldCheck size={16} /><span><b>Payment boundary</b><small>Paid courses use verified provider checkout when configured for NGN; memberships remain demo-only.</small></span></div></form>}
        <footer className={styles.footer}><span>Skillora · Learning platform</span><span>{mode === 'local' ? 'Browser demo data' : 'Authenticated backend session'}</span></footer>
      </div>
    </main>
    {editor && <CourseEditor course={editor} instructors={data.instructors} mode={mode} busy={busy} onClose={() => setEditor(null)} onSave={saveCourse} />}
  </div>
}

function SearchBox({ value, onChange }) { return <label className={styles.searchBox}><Search size={14} /><input placeholder="Search" value={value} onChange={(event) => onChange(event.target.value)} /></label> }

function LessonsPage({ courses, selectedId, onSelect, onEdit }) {
  const selectedCourse = courses.find((course) => (course.id || course.courseId) === selectedId) || courses[0]
  return <section className={styles.panel}><div className={styles.panelHeading}><div><small>COURSE CONTENT</small><h2>Lesson curriculum</h2></div><select className={styles.courseSelect} value={selectedCourse?.id || selectedCourse?.courseId || ''} onChange={(event) => onSelect(event.target.value)}>{courses.map((course) => <option key={course.id || course.courseId} value={course.id || course.courseId}>{course.title}</option>)}</select></div>{selectedCourse ? <><div className={styles.lessonSummary}><div><small>{selectedCourse.category} · {selectedCourse.level}</small><h3>{selectedCourse.title}</h3><span>{selectedCourse.curriculum?.length || 0} modules · {(selectedCourse.curriculum?.length || 0) * 3} lesson activities</span></div><button className={styles.primaryButton} onClick={() => onEdit(selectedCourse)}>Edit lessons</button></div><ol className={styles.lessonList}>{(selectedCourse.curriculum || []).map((lesson, index) => <li key={`${lesson}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><b>{lesson}</b><small>3 activities</small></li>)}</ol></> : <EmptyState label="No courses yet" />}</section>
}

function CourseTable({ courses, busy, onEdit, onToggle }) {
  if (!courses?.length) return <EmptyState label="No courses found" />
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>COURSE</th><th>INSTRUCTOR</th><th>PRICE (NGN)</th><th>CURRICULUM</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id || course.courseId}><td><strong>{course.title}</strong><small>{course.category} · {course.level}</small></td><td>{course.instructor}</td><td>₦{Number(course.price).toLocaleString('en-NG')}</td><td>{(course.curriculum?.length || 0) * 3} activities</td><td><Status value={course.published ? 'published' : 'draft'} /></td><td><div className={styles.rowActions}><button onClick={() => onEdit(course)}>Edit</button><button className={styles.secondaryButton} disabled={busy} onClick={() => onToggle(course)}>{course.published ? 'Unpublish' : 'Publish'}</button></div></td></tr>)}</tbody></table></div>
}

function InstructorTable({ instructors, busy, onUpdate }) {
  if (!instructors?.length) return <EmptyState label="No instructors found" />
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>INSTRUCTOR</th><th>EMAIL</th><th>APPLICATION</th><th>ACCESS</th><th>REVIEW</th></tr></thead><tbody>{instructors.map((item) => <tr key={item._id || item.id}><td><strong>{item.name}</strong><small>Joined {formatDate(item.createdAt)}</small></td><td>{item.email}</td><td><Status value={item.instructorStatus} /></td><td><Status value={item.active ? 'active' : 'suspended'} /></td><td><div className={styles.rowActions}>{item.instructorStatus !== 'approved' && <button disabled={busy} onClick={() => onUpdate(item, { instructorStatus: 'approved', active: true })}>Approve</button>}{item.instructorStatus !== 'rejected' && <button className={styles.dangerButton} disabled={busy} onClick={() => onUpdate(item, { instructorStatus: 'rejected' })}>Reject</button>}</div></td></tr>)}</tbody></table></div>
}

function StudentTable({ students, busy, onUpdate }) {
  if (!students?.length) return <EmptyState label="No students found" />
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>STUDENT</th><th>EMAIL</th><th>JOINED</th><th>ACCESS</th></tr></thead><tbody>{students.map((item) => <tr key={item._id || item.id}><td><strong>{item.name}</strong></td><td>{item.email}</td><td>{formatDate(item.createdAt)}</td><td><button className={item.active ? styles.textAction : styles.approveButton} disabled={busy} onClick={() => onUpdate(item, { active: !item.active })}>{item.active ? 'Suspend' : 'Reactivate'}</button></td></tr>)}</tbody></table></div>
}

function EnrollmentTable({ enrollments, busy, onUpdate }) {
  if (!enrollments?.length) return <EmptyState label="No enrollments found" />
  return <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>LEARNER</th><th>COURSE</th><th>PROGRESS</th><th>ENROLLED</th><th>STATUS</th><th>ACCESS</th></tr></thead><tbody>{enrollments.map((item) => <tr key={item._id || item.id}><td><strong>{item.student?.name}</strong><small>{item.student?.email}</small></td><td>{item.course?.title || item.courseTitle}</td><td>{item.progress}%</td><td>{formatDate(item.createdAt)}</td><td><Status value={item.status} /></td><td><select className={styles.inlineSelect} value={item.status} disabled={busy} onChange={(event) => onUpdate(item, { status: event.target.value })}>{['active', 'completed', 'refunded', 'suspended'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>
}

function CourseEditor({ course, instructors, mode, busy, onClose, onSave }) {
  const hasCurrentInstructor = instructors.some((item) => (item._id || item.instructorId || item.id) === course.instructorId)
  return <div className={styles.modalBackdrop} role="presentation"><form className={styles.courseEditor} onSubmit={onSave}><div className={styles.editorHeading}><div><small>COURSE CONTENT</small><h2>{course.courseId ? 'Edit course' : 'Create course'}</h2></div><button type="button" aria-label="Close editor" onClick={onClose}><X size={17} /></button></div><div className={styles.editorGrid}><label>Course title<input name="title" defaultValue={course.title || ''} required /></label><label>Category<input name="category" defaultValue={course.category || ''} required /></label><label>Instructor name<input name="instructor" defaultValue={course.instructor || ''} required /></label><label>Instructor account<select name="instructorId" defaultValue={course.instructorId || ''} required><option value="">Choose instructor</option>{course.instructorId && !hasCurrentInstructor && <option value={course.instructorId}>Current assignment: {course.instructor}</option>}{instructors.filter((item) => item.instructorStatus === 'approved' || mode === 'local').map((item) => <option key={item._id || item.id} value={item._id || item.instructorId || item.id}>{item.name}</option>)}</select></label><label>Price (NGN)<input name="price" type="number" min="0" max="10000" step="1" defaultValue={course.price ?? 0} required /></label><label>Previous price (NGN)<input name="oldPrice" type="number" min="0" max="10000" step="1" defaultValue={course.oldPrice ?? 0} /></label><label>Duration<input name="duration" defaultValue={course.duration || ''} /></label><label>Level<select name="level" defaultValue={course.level || 'Beginner'}><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All levels</option></select></label><label className={styles.fullField}>Cover image URL<input name="image" type="url" defaultValue={course.image || ''} /></label><label className={styles.fullField}>Course description<textarea name="description" rows="3" defaultValue={course.description || ''} /></label><label className={styles.fullField}>Curriculum (one module per line)<textarea name="curriculum" rows="6" defaultValue={(course.curriculum || []).join('\n')} /></label><label className={styles.publishToggle}><input name="published" type="checkbox" defaultChecked={Boolean(course.published)} /> Publish this course</label></div><div className={styles.editorFooter}><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button><button className={styles.primaryButton} disabled={busy}>{busy ? 'Saving…' : 'Save course'}</button></div></form></div>
}

function EmptyState({ label }) { return <div className={styles.emptyState}><BookOpen size={22} /><strong>{label}</strong><small>Learning activity will appear here when available.</small></div> }