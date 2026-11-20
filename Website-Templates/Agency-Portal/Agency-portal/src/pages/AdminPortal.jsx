import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, CreditCard, FolderKanban, LayoutDashboard, LogOut, MessageSquare, Settings, Users } from 'lucide-react'
import { agencyApi, clearAgencySession, getAgencySession, saveAgencySession } from '../services/agencyApi'
import './AdminPortal.css'

const sections = [
  ['overview', 'Overview', LayoutDashboard],
  ['projects', 'Projects', FolderKanban],
  ['case-studies', 'Case Studies', BriefcaseBusiness],
  ['clients', 'Clients', BriefcaseBusiness],
  ['team', 'Team', Users],
  ['invoices', 'Invoices', CreditCard],
  ['inquiries', 'Inquiries', MessageSquare],
  ['messages', 'Messages', MessageSquare],
  ['settings', 'Settings', Settings],
]

const sectionTitles = Object.fromEntries(sections.map(([id, title]) => [id, title]))
const loadSection = {
  projects: agencyApi.admin.projects,
  'case-studies': agencyApi.admin.caseStudies,
  clients: agencyApi.admin.clients,
  team: agencyApi.admin.team,
  invoices: agencyApi.admin.invoices,
  inquiries: agencyApi.admin.inquiries,
  messages: agencyApi.admin.messages,
  settings: agencyApi.admin.settings,
}
const rowKey = {
  projects: 'projects',
  'case-studies': 'caseStudies',
  clients: 'clients',
  team: 'team',
  invoices: 'invoices',
  inquiries: 'inquiries',
  messages: 'messages',
}
const statusChoices = {
  projects: ['Planning', 'In progress', 'Review', 'Completed'],
  clients: ['Onboarding', 'Active', 'Paused'],
  team: ['Available', 'On a project', 'Away'],
  invoices: ['Due soon', 'Paid', 'Overdue'],
  inquiries: ['New', 'Contacted', 'Accepted', 'Closed'],
}

function AdminAuth({ mode }) {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try {
      if (mode === 'forgot') {
        const result = await agencyApi.forgotPassword(values.email)
        setNotice(result.resetToken
          ? `Password reset token (development only): ${result.resetToken}`
          : result.message)
      } else if (mode === 'reset') {
        const token = new URLSearchParams(window.location.search).get('token') || values.token
        const result = await agencyApi.resetPassword(token, values.password)
        setNotice(result.message)
      } else {
        const session = mode === 'signup'
          ? await agencyApi.signupAdmin({
            name: values.name,
            company: values.company,
            email: values.email,
            password: values.password,
            inviteCode: values.inviteCode,
          })
          : await agencyApi.login({ email: values.email, password: values.password, expectedRole: 'admin' })
        if (session.user.role !== 'admin') throw new Error('This account does not have admin access.')
        saveAgencySession(session)
        window.location.assign('/admin')
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to complete the request.')
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'signup' ? 'Create admin account' : mode === 'forgot' ? 'Reset password' : mode === 'reset' ? 'Choose a new password' : 'Admin sign in'
  return (
    <main className="agency-admin-auth">
      <form className="agency-admin-auth-card" onSubmit={submit}>
        <a href="/" className="agency-admin-back">← Back to NOVA Studio</a>
        <span className="agency-admin-kicker">STUDIO ADMINISTRATION</span>
        <h1>{title}</h1>
        <p>{mode === 'signup' ? 'Create the first admin account without an invitation code. Additional admins need one.' : 'Sign in to manage live projects, clients, and messages.'}</p>
        {mode === 'signup' && <>
          <label>Full name<input name="name" autoComplete="name" required /></label>
          <label>Studio name<input name="company" autoComplete="organization" required /></label>
          <label>Admin invitation code (optional)<input name="inviteCode" autoComplete="off" /></label>
        </>}
        {(mode === 'login' || mode === 'signup' || mode === 'forgot') && <label>Email<input name="email" type="email" autoComplete="email" required /></label>}
        {(mode === 'login' || mode === 'signup' || mode === 'reset') && <label>{mode === 'reset' ? 'New password' : 'Password'}<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required /></label>}
        {mode === 'reset' && !new URLSearchParams(window.location.search).has('token') && <label>Reset token<input name="token" autoComplete="off" required /></label>}
        <button className="agency-admin-primary-button" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : mode === 'reset' ? 'Update password' : 'Sign in'} <ArrowRight size={15} /></button>
        {error && <p className="agency-admin-error" role="alert">{error}</p>}
        {notice && <p className="agency-admin-notice" role="status">{notice}</p>}
        {mode === 'login' && <a href="/admin/forgot-password">Forgot password?</a>}
        {mode === 'signup' && <a href="/admin/login">Already have access? Sign in</a>}
        {mode === 'login' && <a href="/admin/signup">Create admin account</a>}
      </form>
    </main>
  )
}

export default function AdminPortal() {
  const path = window.location.pathname
  const authRoute = path.match(/^\/admin\/(login|signup|forgot-password|reset-password)$/)
  const authMode = authRoute ? ({ 'forgot-password': 'forgot', 'reset-password': 'reset' }[authRoute[1]] || authRoute[1]) : null
  const requestedSection = path.split('/')[2] || 'overview'
  const section = sectionTitles[requestedSection] ? requestedSection : 'overview'
  const inquiryId = section === 'inquiries' ? path.split('/')[3] : null
  const [session, setSession] = useState(null)
  const [payload, setPayload] = useState({})
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [caseStudyCover, setCaseStudyCover] = useState('')
  const [caseStudyGallery, setCaseStudyGallery] = useState([])

  useEffect(() => {
    if (authMode) return
    const active = getAgencySession()
    if (!active || active.user?.role !== 'admin') {
      window.location.replace('/admin/login')
      return
    }
    setSession(active)
  }, [authMode])

  async function refresh() {
    if (!session) return
    setError('')
    try {
      if (section === 'overview') setPayload(await agencyApi.admin.dashboard())
      else setPayload(await loadSection[section]())
    } catch (requestError) {
      setError(requestError.message || 'Unable to load this workspace.')
      if (/sign in|session|account/i.test(requestError.message || '')) {
        clearAgencySession()
        window.location.replace('/admin/login')
      }
    }
  }

  useEffect(() => { refresh() }, [session, section])

  const rows = payload[rowKey[section]] || []
  const filteredRows = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())), [rows, search])

  async function createRecord(event) {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    setBusy(true)
    setError('')
    try {
      if (section === 'projects') await agencyApi.admin.createProject({ ...values, budget: Number(values.budget || 0), progress: 0 })
      if (section === 'case-studies') await agencyApi.admin.createCaseStudy({
        ...values,
        image: caseStudyCover,
        images: caseStudyGallery,
        deliverables: String(values.deliverables || '').split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
      })
      if (section === 'clients') await agencyApi.admin.createClient(values)
      if (section === 'team') await agencyApi.admin.createTeamMember(values)
      if (section === 'invoices') await agencyApi.admin.createInvoice({ ...values, amount: Number(values.amount) })
      if (section === 'messages') await agencyApi.admin.sendMessage(values)
      form.reset()
      if (section === 'case-studies') {
        setCaseStudyCover('')
        setCaseStudyGallery([])
      }
      await refresh()
    } catch (requestError) {
      setError(requestError.message || 'Unable to save this record.')
    } finally {
      setBusy(false)
    }
  }

  async function uploadCaseStudyCover(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      setCaseStudyCover(await agencyApi.uploadCaseStudyImage(file))
    } catch (requestError) {
      setError(requestError.message || 'Unable to upload the cover image.')
      input.value = ''
    } finally {
      setBusy(false)
    }
  }

  async function uploadCaseStudyGallery(event) {
    const input = event.currentTarget
    const files = Array.from(input.files || [])
    if (!files.length) return
    if (files.length + caseStudyGallery.length > 12) {
      setError('You can add up to 12 gallery images.')
      input.value = ''
      return
    }
    setBusy(true)
    setError('')
    try {
      const uploaded = await Promise.all(files.map((file) => agencyApi.uploadCaseStudyImage(file)))
      setCaseStudyGallery((images) => [...images, ...uploaded])
    } catch (requestError) {
      setError(requestError.message || 'Unable to upload gallery images.')
    } finally {
      input.value = ''
      setBusy(false)
    }
  }

  async function sendReply(event, clientEmail) {
    event.preventDefault()
    const form = event.currentTarget
    const message = String(new FormData(form).get('reply') || '')
    setBusy(true)
    setError('')
    try {
      await agencyApi.admin.sendMessage({ clientEmail, message })
      setReplyTo(null)
      await refresh()
    } catch (requestError) {
      setError(requestError.message || 'Unable to send the reply.')
    } finally {
      setBusy(false)
    }
  }

  async function updateStatus(row, status) {
    const update = {
      projects: agencyApi.admin.updateProject,
      clients: agencyApi.admin.updateClient,
      team: agencyApi.admin.updateTeamMember,
      invoices: agencyApi.admin.updateInvoice,
      inquiries: agencyApi.admin.updateInquiry,
    }[section]
    if (!update) return
    setError('')
    try {
      await update(row.id, { status })
      await refresh()
    } catch (requestError) {
      setError(requestError.message || 'Unable to update this record.')
    }

  }

  async function deleteCaseStudy(id) {
    if (!window.confirm('Remove this case study from the website?')) return
    setBusy(true)
    setError('')
    try {
      await agencyApi.admin.deleteCaseStudy(id)
      await refresh()
    } catch (requestError) {
      setError(requestError.message || 'Unable to remove the case study.')
    } finally {
      setBusy(false)
    }
  }

  async function replyToInquiry(event, id) {
    event.preventDefault()
    const form = event.currentTarget
    const message = String(new FormData(form).get('reply') || '')
    setBusy(true)
    setError('')
    try {
      await agencyApi.admin.replyToInquiry(id, message)
      await refresh()
    } catch (requestError) {
      setError(requestError.message || 'Unable to send the inquiry response.')
    } finally {
      setBusy(false)
    }
  }

  async function saveSettings(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    setBusy(true)
    try {
      const { notifications, ...settings } = payload.settings
      await agencyApi.admin.updateSettings({
        ...settings,
        ...values,
        notifications: { ...notifications },
      })
      await refresh()
    } catch (requestError) {
      setError(requestError.message || 'Unable to save settings.')
    } finally {
      setBusy(false)
    }
  }

  if (authMode) return <AdminAuth mode={authMode} />
  if (!session) return <main className="agency-admin-loading">Loading admin workspace…</main>

  const createFields = {
    projects: [['name', 'Project name'], ['client', 'Client name'], ['clientEmail', 'Client email'], ['service', 'Service'], ['due', 'Due date'], ['budget', 'Budget']],
    'case-studies': [['name', 'Case study title'], ['client', 'Client or brand'], ['type', 'Project type'], ['alt', 'Cover image description'], ['summary', 'Short summary'], ['description', 'Case study description', 'textarea'], ['result', 'Result / impact'], ['deliverables', 'Deliverables (one per line)', 'textarea']],
    clients: [['name', 'Client name'], ['company', 'Company'], ['email', 'Email']],
    team: [['name', 'Member name'], ['role', 'Role'], ['email', 'Email']],
    invoices: [['client', 'Client name'], ['clientEmail', 'Client email'], ['amount', 'Amount']],
    messages: [['clientEmail', 'Client email'], ['message', 'Message']],
  }[section]
  const selectedInquiry = inquiryId ? (payload.inquiries || []).find((inquiry) => inquiry.id === inquiryId) : null

  return (
    <div className="agency-admin-shell">
      <aside className="agency-admin-sidebar">
        <a className="agency-admin-wordmark" href="/admin">NOVA <small>ADMIN</small></a>
        <nav>{sections.map(([id, title, Icon]) => <a key={id} className={section === id ? 'active' : ''} href={id === 'overview' ? '/admin' : `/admin/${id}`}><Icon size={16} />{title}</a>)}</nav>
        <button className="agency-admin-signout" onClick={() => { clearAgencySession(); window.location.assign('/admin/login') }}><LogOut size={16} />Sign out</button>
      </aside>
      <main className="agency-admin-main">
        <header className="agency-admin-topbar">
          <div><small>WORKSPACE</small><h1>{sectionTitles[section]}</h1></div>
          <div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page" aria-label="Search current page" /><span>{session.user.name}</span></div>
        </header>
        <div className="agency-admin-content">
          {error && <p className="agency-admin-error" role="alert">{error}</p>}
          {section === 'overview' && <Overview data={payload} />}
          {section === 'settings' && payload.settings && <form className="agency-admin-settings" onSubmit={saveSettings}>
            {['studioName', 'email', 'website', 'description'].map((key) => <label key={key}>{key === 'studioName' ? 'Studio name' : key[0].toUpperCase() + key.slice(1)}{key === 'description' ? <textarea name={key} defaultValue={payload.settings[key]} /> : <input name={key} defaultValue={payload.settings[key]} required={key !== 'website'} />}</label>)}
            <button className="agency-admin-primary-button" disabled={busy}>Save settings</button>
          </form>}
          {createFields && <form className={`agency-admin-create-form${section === 'case-studies' ? ' agency-admin-case-study-form' : ''}`} onSubmit={createRecord}>
            <div className="agency-admin-form-heading"><h2>{section === 'case-studies' ? 'Publish a case study' : `Add ${section === 'messages' ? 'message' : section === 'team' ? 'team member' : section.slice(0, -1)}`}</h2><p>{section === 'case-studies' ? 'Share the project details and image assets shown on your public website.' : 'Complete the fields below to add this to your workspace.'}</p></div>
            {section === 'case-studies' && <section className="agency-admin-upload-panel">
              <div><strong>Case study images</strong><small>Upload a cover image and up to 12 gallery images. Images are resized and saved in this browser’s local storage.</small></div>
              <label className="agency-admin-upload-field">Cover image<input key={caseStudyCover ? 'uploaded' : 'empty'} type="file" accept="image/*" required={!caseStudyCover} onChange={uploadCaseStudyCover} /><small>Maximum file size: 10 MB</small></label>
              {caseStudyCover && <div className="agency-admin-image-preview"><img src={caseStudyCover} alt="Case study cover preview" /><button type="button" onClick={() => setCaseStudyCover('')}>Remove cover</button></div>}
              <label className="agency-admin-upload-field">Gallery images<input type="file" accept="image/*" multiple onChange={uploadCaseStudyGallery} /><small>{caseStudyGallery.length} of 12 images uploaded · Maximum 10 MB each</small></label>
              {caseStudyGallery.length > 0 && <div className="agency-admin-gallery-previews">{caseStudyGallery.map((image, index) => <div key={image}><img src={image} alt={`Gallery preview ${index + 1}`} /><button type="button" aria-label={`Remove gallery image ${index + 1}`} onClick={() => setCaseStudyGallery((images) => images.filter((item) => item !== image))}>Remove</button></div>)}</div>}
            </section>}
            {createFields.map(([name, label, type]) => <label className={type === 'textarea' ? 'agency-admin-field-wide' : ''} key={name}>{label}{type === 'textarea' || name === 'message' ? <textarea name={name} required maxLength={name === 'description' ? 4000 : 2000} /> : <input name={name} type={name === 'amount' || name === 'budget' ? 'number' : name.toLowerCase().includes('email') ? 'email' : 'text'} min={name === 'amount' || name === 'budget' ? '0' : undefined} required={!['budget', 'clientEmail'].includes(name)} />}</label>)}
            <button className="agency-admin-primary-button" disabled={busy}>{busy ? 'Please wait…' : section === 'messages' ? 'Send message' : section === 'case-studies' ? 'Publish case study' : `Add ${section === 'team' ? 'team' : section.slice(0, -1)}`}</button>
          </form>}
          {inquiryId && selectedInquiry && <section className="agency-admin-inquiry-detail">
            <a className="agency-admin-back-link" href="/admin/inquiries">← Back to inquiries</a>
            <article className="agency-admin-inquiry-card">
              <div><span className="agency-admin-kicker">PROJECT INQUIRY</span>{selectedInquiry.isSample && <small className="agency-admin-sample-label">Sample record · saved in this browser</small>}<h2>{selectedInquiry.name}</h2><p>{selectedInquiry.company || 'Independent client'} · {new Date(selectedInquiry.createdAt).toLocaleString()}</p></div>
              <dl><div><dt>Email</dt><dd><a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a></dd></div><div><dt>Phone</dt><dd><a href={`tel:${selectedInquiry.phone || ''}`}>{selectedInquiry.phone || 'Not provided'}</a></dd></div><div><dt>Budget</dt><dd>{selectedInquiry.budget}</dd></div><div><dt>Status</dt><dd>{selectedInquiry.status}</dd></div></dl>
              <section><h3>Project details</h3><p>{selectedInquiry.project}</p></section>
              {selectedInquiry.response && <section><h3>Latest response sent to client</h3><p>{selectedInquiry.response}</p><small>{selectedInquiry.respondedAt ? new Date(selectedInquiry.respondedAt).toLocaleString() : ''}</small></section>}
              <form className="agency-admin-inquiry-reply" onSubmit={(event) => replyToInquiry(event, selectedInquiry.id)}><label htmlFor="inquiry-reply">Respond to {selectedInquiry.name}</label><textarea id="inquiry-reply" name="reply" maxLength={2000} placeholder="Write a response. It will appear in the client's messages." required /><button className="agency-admin-primary-button" disabled={busy}>{busy ? 'Sending…' : 'Send response to client'}</button></form>
            </article>
          </section>}
          {inquiryId && !selectedInquiry && <p className="agency-admin-empty">{payload.inquiries ? 'Inquiry not found.' : 'Loading inquiry…'}</p>}
          {rowKey[section] && !(section === 'inquiries' && inquiryId) && <section className="agency-admin-list">
            {filteredRows.map((row) => <article className="agency-admin-record" key={row.id}>
              <div><strong>{row.name || row.client || row.title || row.id}</strong><p>{section === 'inquiries' ? row.email : row.email || row.clientEmail || row.service || row.body || row.project || row.detail || row.company}</p>{section === 'inquiries' && <><small>{row.phone || 'Phone not provided'}</small><small>{row.project}</small></>}<small>{row.createdAt ? new Date(row.createdAt).toLocaleString() : row.date || row.due || ''}</small>{row.isSample && <small className="agency-admin-sample-label">Sample record · saved in this browser</small>}</div>
              {section === 'messages' && <div className="agency-admin-message-actions"><span>{row.sender} · {row.read ? 'Read' : 'Unread'}</span>{!row.read && <button type="button" onClick={async () => { await agencyApi.admin.markMessageRead(row.id); refresh() }}>Mark read</button>}</div>}
              {section === 'messages' && row.sender === 'client' && <button className="agency-admin-reply-toggle" type="button" onClick={() => setReplyTo(replyTo === row.id ? null : row.id)}>{replyTo === row.id ? 'Cancel reply' : 'Reply'}</button>}
              {section === 'messages' && replyTo === row.id && <form className="agency-admin-reply-form" onSubmit={(event) => sendReply(event, row.clientEmail)}><label>Reply to {row.client}<textarea name="reply" maxLength={2000} required placeholder="Write your reply…" /></label><button className="agency-admin-primary-button" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reply'}</button></form>}
              {statusChoices[section] && <label className="agency-admin-status-label">Status<select value={row.status} onChange={(event) => updateStatus(row, event.target.value)}>{statusChoices[section].map((status) => <option key={status}>{status}</option>)}</select></label>}
              {section === 'invoices' && <strong>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(row.amount)}</strong>}
              {section === 'inquiries' && <small>{row.budget}</small>}
              {section === 'inquiries' && <a className="agency-admin-inquiry-open" href={`/admin/inquiries/${encodeURIComponent(row.id)}`}>Open inquiry <ArrowRight size={14} /></a>}
              {section === 'case-studies' && <button className="agency-admin-remove-case-study" type="button" onClick={() => deleteCaseStudy(row.id)} disabled={busy}>Remove from website</button>}
            </article>)}
            {!filteredRows.length && <p className="agency-admin-empty">No {section} records yet.</p>}
          </section>}
        </div>
      </main>
    </div>
  )
}

function Overview({ data }) {
  const metrics = data.metrics || {}
  return <section className="agency-admin-overview">
    {data.hasSampleData && <p className="agency-admin-sample-note">Sample workspace records are stored in this browser. You can edit or remove them as you add real work.</p>}
    <div className="agency-admin-metrics">
      {[['Active projects', metrics.activeProjects || 0], ['Paid revenue', new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(metrics.monthlyRevenue || 0)], ['Active clients', metrics.activeClients || 0], ['Pending approvals', metrics.pendingApprovals || 0]].map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong></article>)}
    </div>
    <div className="agency-admin-overview-grid">
      <section><h2>Recent projects</h2>{(data.projects || []).map((project) => <p key={project.id}><strong>{project.name}</strong><span>{project.status}</span></p>)}{!data.projects?.length && <p className="agency-admin-empty">No projects yet. Add one from Projects.</p>}</section>
      <section><h2>Recent activity</h2>{(data.activity || []).map((activity) => <p key={activity.id}><strong>{activity.title}</strong><span>{activity.detail}</span></p>)}{!data.activity?.length && <p className="agency-admin-empty">New workspace activity will appear here.</p>}</section>
    </div>
  </section>
}
