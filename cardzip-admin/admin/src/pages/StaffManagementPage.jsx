import { useEffect, useState } from 'react'
import { Download, Pencil, RefreshCw, Search, UserCheck, UserPlus, UserX, X } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const assignablePages = [
  'Overview', 'Users', 'Treasury', 'Admin Wallet', 'Add Money', 'Withdrawals',
  'Trade History', 'Bill Payments', 'Virtual Numbers', 'E-Commerce', 'Store Products',
  'Digital Submissions', 'Shop Verification', 'Marketplace Promotions', 'Banner Ads', 'Gift Cards',
  'Pending Gift Card Reviews', 'My Attendance',
]

const emptyStaffForm = { name: '', email: '', password: '', department: 'Operations', phone: '', visiblePages: [] }
const assignmentOptions = [
  { value: 'general', label: 'General task' },
  { value: 'gift_card', label: 'Gift-card trade' },
  { value: 'store_order', label: 'E-commerce order' },
  { value: 'support_request', label: 'User support request' },
]
const taskStatusOptions = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const loadActiveStaff = async () => {
  const activeStaff = []
  let page = 1
  let hasNextPage = true
  while (hasNextPage) {
    const result = await adminApi.staff(`?status=active&page=${page}&limit=100`)
    activeStaff.push(...(Array.isArray(result.data) ? result.data : []))
    hasNextPage = page < Math.max(1, Number(result.pagination?.totalPages) || 1)
    page += 1
  }
  return activeStaff
}

const loadAllPages = async (fetchPage, getRows, getPagination = (result) => result.pagination) => {
  const rows = []
  let page = 1
  let hasNextPage = true
  while (hasNextPage) {
    const result = await fetchPage(page)
    rows.push(...(getRows(result) || []))
    hasNextPage = page < Math.max(1, Number(getPagination(result)?.totalPages) || 1)
    page += 1
  }
  return rows
}

const formatDuration = (minutes = 0) => {
  const hours = Math.floor(Number(minutes) / 60)
  const remainder = Number(minutes) % 60
  return `${hours}h ${remainder}m`
}

const formatLagosTime = (value) => value
  ? new Date(value).toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })
  : '—'

const getLagosToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date())

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const loadAttendanceReport = async (from, to) => {
  let page = 1
  let stats = { presentToday: 0, absent: 0, notClockedIn: 0 }
  const records = []
  let hasNextPage = true
  while (hasNextPage) {
    const result = await adminApi.staffAttendance(`?from=${from}&to=${to}&page=${page}&limit=200`)
    records.push(...(Array.isArray(result.data) ? result.data : []))
    if (page === 1) stats = result.stats || stats
    hasNextPage = page < Math.max(1, Number(result.pagination?.totalPages) || 1)
    page += 1
  }
  return { records, stats }
}

const loadStaffManagementData = async (page, search, attendanceFrom, attendanceTo) => {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (search.trim()) params.set('search', search.trim())
  const [staffResult, staffOptions, taskRows, pendingTradeRows, orderRows, supportRows, attendanceResult] = await Promise.all([
    adminApi.staff(`?${params.toString()}`),
    loadActiveStaff(),
    loadAllPages((currentPage) => adminApi.tasks(`?page=${currentPage}&limit=100`), (result) => result.data),
    loadAllPages((currentPage) => adminApi.pendingGiftCardTrades(`?page=${currentPage}&limit=50`), (result) => result.data),
    loadAllPages(
      (currentPage) => adminApi.storeDashboard(`?page=${currentPage}&limit=50`),
      (result) => result.data?.orders,
      (result) => result.data?.pagination,
    ),
    loadAllPages((currentPage) => adminApi.supportRequests(`?page=${currentPage}&limit=200`), (result) => result.data),
    loadAttendanceReport(attendanceFrom, attendanceTo),
  ])
  return { staffResult, staffOptions, taskRows, pendingTradeRows, orderRows, supportRows, attendanceResult }
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([])
  const [activeStaff, setActiveStaff] = useState([])
  const [tasks, setTasks] = useState([])
  const [orders, setOrders] = useState([])
  const [supportRequests, setSupportRequests] = useState([])
  const [attendance, setAttendance] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({ presentToday: 0, absent: 0, notClockedIn: 0 })
  const [attendancePage, setAttendancePage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [savingStaffId, setSavingStaffId] = useState('')
  const [savingStaffForm, setSavingStaffForm] = useState(false)
  const [savingTask, setSavingTask] = useState(false)
  const [savingTaskStatusId, setSavingTaskStatusId] = useState('')
  const [searching, setSearching] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyStaffForm)
  const [task, setTask] = useState({ title: '', description: '', assignedTo: '', assignmentType: 'general', relatedId: '', dueAt: '' })
  const [pendingTrades, setPendingTrades] = useState([])
  const [attendanceFrom, setAttendanceFrom] = useState(getLagosToday)
  const [attendanceTo, setAttendanceTo] = useState(getLagosToday)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (page = pagination.page) => {
    try {
      const { staffResult, staffOptions, taskRows, pendingTradeRows, orderRows, supportRows, attendanceResult } =
        await loadStaffManagementData(page, search, attendanceFrom, attendanceTo)
      setError('')
      setStaff(staffResult.data)
      setPagination(staffResult.pagination)
      setActiveStaff(staffOptions)
      setTasks(taskRows)
      setPendingTrades(pendingTradeRows)
      setOrders(orderRows)
      setSupportRequests(supportRows)
      setAttendance(attendanceResult.records)
      setAttendanceStats(attendanceResult.stats)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const from = getLagosToday()
    const to = getLagosToday()
    loadStaffManagementData(1, '', from, to)
      .then(({ staffResult, staffOptions, taskRows, pendingTradeRows, orderRows, supportRows, attendanceResult }) => {
        if (!mounted) return
        setStaff(staffResult.data)
        setPagination(staffResult.pagination)
        setActiveStaff(staffOptions)
        setTasks(taskRows)
        setPendingTrades(pendingTradeRows)
        setOrders(orderRows)
        setSupportRequests(supportRows)
        setAttendance(attendanceResult.records)
        setAttendanceStats(attendanceResult.stats)
        setError('')
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const refresh = (page = pagination.page) => {
    setLoading(true)
    setError('')
    return load(page)
  }

  const attendancePageSize = 15
  const attendanceTotalPages = Math.max(1, Math.ceil(attendance.length / attendancePageSize))
  const attendancePageRows = attendance.slice((attendancePage - 1) * attendancePageSize, attendancePage * attendancePageSize)
  const downloadAttendance = () => {
    const rows = [
      ['Staff member', 'Email', 'Department', 'Work date', 'Status', 'Clock in', 'Clock out', 'Duration'],
      ...attendance.map((record) => [
        record.staff?.name || '',
        record.staff?.email || '',
        record.staff?.department || '',
        record.attendanceDate,
        record.status === 'not_clocked_in' ? 'Not clocked in' : record.status.replace('_', ' '),
        formatLagosTime(record.clockIn),
        formatLagosTime(record.clockOut),
        record.status === 'absent' || record.status === 'not_clocked_in' ? '' : formatDuration(record.durationMinutes),
      ]),
    ]
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = `staff-attendance-${attendanceFrom}-to-${attendanceTo}.csv`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const activeCount = activeStaff.length
  const staffSelectOptions = activeStaff.map((person) => ({
    value: person.id,
    label: `${person.name} · ${person.department || 'Operations'}`,
  }))
  const linkedRecords = task.assignmentType === 'gift_card'
    ? pendingTrades
    : task.assignmentType === 'store_order'
      ? orders.filter((order) => order.paymentStatus === 'paid' && !['delivered', 'cancelled'].includes(order.status))
      : task.assignmentType === 'support_request'
        ? supportRequests.filter((request) => request.status === 'open')
        : []
  const linkedRecordOptions = linkedRecords.map((record) => {
    if (task.assignmentType === 'gift_card') {
      return {
        value: record._id,
        label: `${record.type} · ${record.currency} ${Number(record.amount || 0).toLocaleString()} · ${record.user?.name || record.user?.email || 'Customer'}`,
      }
    }
    if (task.assignmentType === 'store_order') {
      return {
        value: record._id,
        label: `${record.orderNumber} · ${record.user?.name || record.user?.email || 'Customer'} · ${record.status}`,
      }
    }
    return {
      value: record._id,
      label: `${record.subject} · ${record.user?.name || record.user?.email || 'Customer'}`,
    }
  })

  const selectAssignmentType = (assignmentType) => setTask((current) => ({
    ...current,
    assignmentType,
    relatedId: '',
  }))

  const selectLinkedRecord = (relatedId) => {
    const record = linkedRecords.find((item) => item._id === relatedId)
    if (!record) {
      setTask((current) => ({ ...current, relatedId }))
      return
    }
    const title = task.assignmentType === 'gift_card'
      ? `Review gift-card trade ${record._id.slice(-6)}`
      : task.assignmentType === 'store_order'
        ? `Process ecommerce order ${record.orderNumber}`
        : `Respond to support request: ${record.subject}`
    const description = task.assignmentType === 'gift_card'
      ? `${record.type} · ${record.currency} ${Number(record.amount || 0).toLocaleString()} · ${record.user?.name || record.user?.email || 'Customer'}`
      : task.assignmentType === 'store_order'
        ? `${record.orderNumber} · ${record.user?.name || record.user?.email || 'Customer'} · ${record.status}`
        : `${record.subject}\n${record.description}`
    setTask((current) => ({ ...current, relatedId, title, description }))
  }

  const submitStaff = async (event) => {
    event.preventDefault()
    if (savingStaffForm) return
    setSavingStaffForm(true)
    setError('')
    try {
      const result = editing
        ? await adminApi.updateStaff(editing.id, {
          name: form.name,
          department: form.department,
          phone: form.phone,
          visiblePages: form.visiblePages,
        })
        : await adminApi.createStaff(form)
      if (editing) {
        setStaff((current) => current.map((person) => String(person.id) === String(result.data.id) ? result.data : person))
      } else {
        setStaff((current) => [result.data, ...current])
      }
      setModalOpen(false)
      setEditing(null)
      setForm(emptyStaffForm)
      if (!editing) setPagination((current) => ({ ...current, totalItems: current.totalItems + 1 }))
      else await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingStaffForm(false)
    }
  }

  const openEdit = (person) => {
    setEditing(person)
    setForm({
      name: person.name,
      email: person.email,
      password: '',
      department: person.department || 'Operations',
      phone: person.phone || '',
      visiblePages: person.visiblePages || [],
    })
    setModalOpen(true)
  }

  const togglePage = (pageName) => setForm((current) => ({
    ...current,
    visiblePages: current.visiblePages.includes(pageName)
      ? current.visiblePages.filter((page) => page !== pageName)
      : [...current.visiblePages, pageName],
  }))

  const setAccess = async (person) => {
    if (savingStaffId) return
    setSavingStaffId(person.id)
    setError('')
    try {
      const result = await adminApi.updateStaff(person.id, { isActive: !person.isActive })
      setStaff((current) => current.map((row) => row.id === person.id ? result.data : row))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingStaffId('')
    }
  }

  const submitTask = async (event) => {
    event.preventDefault()
    if (savingTask) return
    setSavingTask(true)
    setError('')
    try {
      await adminApi.createTask(task)
      setTask({ title: '', description: '', assignedTo: '', assignmentType: 'general', relatedId: '', dueAt: '' })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingTask(false)
    }
  }

  const updateTaskStatus = async (selectedTask, status) => {
    if (savingTaskStatusId) return
    setSavingTaskStatusId(selectedTask._id)
    setError('')
    try {
      const result = await adminApi.updateTask(selectedTask._id, { status })
      setTasks((current) => current.map((row) => row._id === result.data._id ? { ...row, status: result.data.status } : row))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingTaskStatusId('')
    }
  }

  return (
    <section className="staff-page">
      <header className="page-header">
        <div><h1 className="page-title">Staff & task management</h1><p className="page-subtitle">Create staff accounts, grant page access, and assign tracked tasks.</p></div>
        <button className="btn-primary" type="button" onClick={() => { setEditing(null); setForm(emptyStaffForm); setModalOpen(true) }}>
          <UserPlus size={15} /> Add staff
        </button>
      </header>
      {error && <p role="alert" className="form-error">{error}</p>}

      <div className="staff-stats-grid">
        <div className="stat-card"><span className="stat-label">Total staff</span><span className="stat-value">{pagination.totalItems}</span></div>
        <div className="stat-card"><span className="stat-label">Active staff</span><span className="stat-value">{activeCount}</span></div>
        <div className="stat-card"><span className="stat-label">Open tasks</span><span className="stat-value">{tasks.filter((item) => ['todo', 'in_progress'].includes(item.status)).length}</span></div>
        <div className="stat-card"><span className="stat-label">Clocked in today</span><span className="stat-value">{attendanceStats.presentToday}</span></div>
        <div className="stat-card"><span className="stat-label">Absent in period</span><span className="stat-value">{attendanceStats.absent}</span></div>
        <div className="stat-card"><span className="stat-label">Not clocked in today</span><span className="stat-value">{attendanceStats.notClockedIn}</span></div>
      </div>

      <div className="section-card">
        <div className="card-header flex-between">
          <h3>Staff accounts</h3>
          <form className="search-box-sm" onSubmit={(event) => { event.preventDefault(); setSearching(true); Promise.resolve(refresh(1)).finally(() => setSearching(false)) }}>
            <Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search staff" />
            <button type="submit" disabled={searching || loading}>{searching ? <><RefreshCw size={13} className="staff-spin" /> Searching…</> : 'Search'}</button>
          </form>
        </div>
        {loading ? <p><CardzipLoader compact label="Loading staff" /></p> : (
          <div className="table-responsive">
            <table className="staff-table">
              <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Page access</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{staff.map((person) => (
                <tr key={person.id}>
                  <td className="font-bold">{person.name}</td><td>{person.email}</td><td>{person.department}</td>
                  <td>{person.visiblePages?.length ? person.visiblePages.join(', ') : 'Tasks only'}</td>
                  <td>{person.isActive ? 'Active' : 'Suspended'}</td>
                  <td className="staff-account-actions-cell"><div className="staff-account-actions">
                    <button type="button" className="btn-secondary" disabled={Boolean(savingStaffId) || savingStaffForm} onClick={() => openEdit(person)}><Pencil size={13} /> Edit access</button>
                    <button type="button" className={`btn-secondary ${person.isActive ? 'staff-suspend-action' : 'staff-reactivate-action'}`} disabled={Boolean(savingStaffId) || savingStaffForm} onClick={() => void setAccess(person)}>
                      {savingStaffId === person.id ? <RefreshCw size={13} className="staff-spin" /> : person.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                      {savingStaffId === person.id ? 'Saving…' : person.isActive ? 'Suspend' : 'Reactivate'}
                    </button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
            {!staff.length && <p>No staff accounts match this search.</p>}
          </div>
        )}
        <div className="pagination-controls">
          <button type="button" disabled={pagination.page <= 1 || loading} onClick={() => refresh(pagination.page - 1)}>Previous</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button type="button" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => refresh(pagination.page + 1)}>Next</button>
        </div>
      </div>

      <section className="section-card staff-attendance-card">
        <div className="card-header staff-attendance-header">
          <div><h3>Staff attendance</h3><p>Clock-in, clock-out and completed-day absences · Africa/Lagos</p></div>
          <form className="staff-attendance-period" onSubmit={(event) => { event.preventDefault(); setAttendancePage(1); setSearching(true); Promise.resolve(refresh(1)).finally(() => setSearching(false)) }}>
            <label>From<input aria-label="Attendance from date" type="date" value={attendanceFrom} onChange={(event) => setAttendanceFrom(event.target.value)} /></label>
            <label>To<input aria-label="Attendance to date" type="date" value={attendanceTo} onChange={(event) => setAttendanceTo(event.target.value)} /></label>
            <button type="submit" className="btn-secondary" disabled={loading || searching}>{searching ? <CardzipLoader compact label="Loading staff" /> : <><RefreshCw size={14} /> Refresh</>}</button>
            <button type="button" className="btn-secondary staff-attendance-download" onClick={downloadAttendance} disabled={loading || attendance.length === 0}><Download size={14} /> Download CSV</button>
          </form>
        </div>
        <div className="table-responsive">
          <table className="staff-table staff-attendance-table">
            <thead><tr><th>Staff member</th><th>Work date</th><th>Status</th><th>Clock in</th><th>Clock out</th><th>Duration</th></tr></thead>
            <tbody>
              {attendancePageRows.map((record) => (
                <tr key={record._id}>
                  <td><strong>{record.staff?.name || 'Staff member'}</strong><small>{record.staff?.department || record.staff?.email}</small></td>
                  <td>{record.attendanceDate}</td>
                  <td><span className={`staff-attendance-status ${record.status}`}>{record.status === 'not_clocked_in' ? 'Not clocked in' : record.status.replace('_', ' ')}</span></td>
                  <td>{formatLagosTime(record.clockIn)}</td>
                  <td>{formatLagosTime(record.clockOut)}</td>
                  <td>{record.status === 'absent' || record.status === 'not_clocked_in' ? '—' : formatDuration(record.durationMinutes)}</td>
                </tr>
              ))}
              {!attendance.length && <tr><td colSpan="6" className="staff-empty-row">{loading ? <CardzipLoader compact label="Loading attendance" /> : 'No attendance records in this period.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pagination-controls staff-attendance-pagination">
          <button type="button" disabled={attendancePage <= 1 || loading} onClick={() => setAttendancePage((page) => page - 1)}>Previous</button>
          <span>Page {attendancePage} of {attendanceTotalPages} · {attendance.length} records</span>
          <button type="button" disabled={attendancePage >= attendanceTotalPages || loading} onClick={() => setAttendancePage((page) => page + 1)}>Next</button>
        </div>
      </section>

      <div className="section-card staff-assignment-card">
        <div className="card-header"><h3>Assign a task</h3></div>
        <form className="modal-body staff-assignment-form" onSubmit={submitTask}>
          <label>Assignment type
            <CustomSelect
              className="staff-assignment-select"
              ariaLabel="Choose an assignment type"
              value={task.assignmentType}
              options={assignmentOptions}
              onChange={selectAssignmentType}
            />
          </label>
          {task.assignmentType !== 'general' && <label>
            {task.assignmentType === 'gift_card' ? 'Pending gift-card trade' : task.assignmentType === 'store_order' ? 'Paid ecommerce order' : 'Open user support request'}
            <CustomSelect
              className="staff-assignment-select"
              ariaLabel="Choose a work record"
              value={task.relatedId}
              options={linkedRecordOptions}
              onChange={selectLinkedRecord}
              disabled={!linkedRecordOptions.length}
            />
            {!linkedRecordOptions.length && <small className="staff-field-hint">There are no available records to assign in this category.</small>}
          </label>}
          <label>Task title<input required maxLength={160} value={task.title} onChange={(event) => setTask({ ...task, title: event.target.value })} /></label>
          <label>Details<textarea maxLength={2000} value={task.description} onChange={(event) => setTask({ ...task, description: event.target.value })} /></label>
          <label>Assign to staff
            <CustomSelect
              className="staff-assignment-select"
              ariaLabel="Select active staff member"
              value={task.assignedTo}
              options={staffSelectOptions}
              onChange={(assignedTo) => setTask({ ...task, assignedTo })}
              disabled={!activeStaff.length}
            />
          </label>
          <label>Due date<input type="date" value={task.dueAt} onChange={(event) => setTask({ ...task, dueAt: event.target.value })} /></label>
          <button className="btn-primary" type="submit" disabled={savingTask || !activeStaff.length || (task.assignmentType !== 'general' && !task.relatedId)}>{savingTask ? <><RefreshCw size={14} className="staff-spin" /> Assigning…</> : 'Assign task'}</button>
        </form>
        <div className="table-responsive">
          <table className="staff-table"><thead><tr><th>Task</th><th>Linked work</th><th>Assigned to</th><th>Status</th><th>Update status</th></tr></thead>
            <tbody>{tasks.map((item) => <tr key={item._id}>
              <td><strong>{item.title}</strong><small>{item.description || '—'}</small></td>
              <td>
                <span className="staff-task-type">{assignmentOptions.find((option) => option.value === item.assignmentType)?.label || 'General task'}</span>
                <small>{item.relatedGiftCard ? `${item.relatedGiftCard.type} · ${item.relatedGiftCard.user?.name || 'Customer'}` : item.relatedStoreOrder?.orderNumber || item.relatedSupportRequest?.subject || 'No linked record'}</small>
              </td>
              <td>{item.assignedTo?.name || 'Staff member'}</td>
              <td><span className={`staff-task-status ${item.status}`}>{item.status.replace('_', ' ')}</span></td>
              <td><div className="staff-task-status-control">
                {savingTaskStatusId === item._id && <RefreshCw size={13} className="staff-spin" aria-label="Saving task status" />}
                <CustomSelect className="staff-task-status-select" ariaLabel={`Update ${item.title} status`} value={item.status} options={taskStatusOptions} disabled={Boolean(savingTaskStatusId)} onChange={(status) => updateTaskStatus(item, status)} />
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>

      {modalOpen && <div className="modal-backdrop staff-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}><section className="modal-content staff-modal-content" role="dialog" aria-modal="true" aria-labelledby="staff-dialog-title">
        <header className="modal-header staff-modal-header"><div><span>TEAM MANAGEMENT</span><h3 id="staff-dialog-title">{editing ? 'Edit staff access' : 'Create staff account'}</h3><p>Set up a secure account and choose which admin pages this staff member can access.</p></div><button className="btn-close" type="button" aria-label="Close" onClick={() => setModalOpen(false)}><X size={18} /></button></header>
        <form className="modal-body staff-modal-form" onSubmit={submitStaff}>
          {error && <p className="form-error staff-modal-error" role="alert">{error}</p>}
          <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Work email<input required type="email" disabled={Boolean(editing)} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          {!editing && <label>Initial password (12+ characters)<input required minLength={12} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" /></label>}
          <label>Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></label>
          <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <fieldset className="staff-modal-pages"><legend>Allowed pages <span>Staff access cannot be delegated</span></legend>
            {assignablePages.map((pageName) => <label key={pageName}><input type="checkbox" checked={form.visiblePages.includes(pageName)} onChange={() => togglePage(pageName)} /> {pageName === 'My Attendance' ? 'Clock In / Out' : pageName}</label>)}
          </fieldset>
          <div className="staff-modal-actions"><button className="btn-secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button>          <button className="btn-primary" type="submit" disabled={savingStaffForm}>{savingStaffForm ? <><RefreshCw size={14} className="staff-spin" /> Saving…</> : editing ? 'Save access' : 'Create staff account'}</button></div>
        </form>
      </section></div>}
    </section>
  )
}
