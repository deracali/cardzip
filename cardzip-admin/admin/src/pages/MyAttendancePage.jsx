import { useCallback, useEffect, useState } from 'react'
import { CalendarClock, Clock3, LogIn, LogOut, RefreshCw } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const formatTime = (value) => value
  ? new Date(value).toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })
  : '—'

const formatDuration = (minutes = 0) => {
  const hours = Math.floor(Number(minutes) / 60)
  const remainder = Number(minutes) % 60
  return `${hours}h ${remainder}m`
}

const labelStatus = (status) => status === 'not_clocked_in'
  ? 'Not clocked in'
  : String(status || '—').replace('_', ' ')

export default function MyAttendancePage() {
  const [attendance, setAttendance] = useState({ today: null, history: [], todayDate: '' })
  const [historyPage, setHistoryPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadAttendance = useCallback(async () => {
    try {
      const result = await adminApi.myStaffAttendance()
      setAttendance(result.data)
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Could not load your attendance.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    adminApi.myStaffAttendance()
      .then((result) => {
        if (!mounted) return
        setAttendance(result.data)
        setError('')
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || 'Could not load your attendance.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const recordPunch = async (action) => {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice('Your attendance has been recorded.')
      await loadAttendance()
    } catch (requestError) {
      setError(requestError.message || 'Could not record your attendance.')
    } finally {
      setSaving(false)
    }
  }

  const today = attendance.today
  const canClockIn = !today || ['absent', 'not_clocked_in'].includes(today.status)
  const canClockOut = today?.status === 'present' && !today.clockOut
  const historyPageSize = 7
  const historyTotalPages = Math.max(1, Math.ceil(attendance.history.length / historyPageSize))
  const historyRows = attendance.history.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize)

  return (
    <section className="staff-page my-attendance-page">
      <header className="page-header">
        <div><span className="staff-attendance-kicker"><CalendarClock size={15} /> MY WORKDAY · AFRICA/LAGOS</span><h1 className="page-title">Clock in and out</h1><p className="page-subtitle">Record your workday start and finish. Your attendance history is visible to Admin.</p></div>
        <button type="button" className="btn-secondary" onClick={() => { setLoading(true); void loadAttendance() }} disabled={loading || saving}>
          <RefreshCw size={15} className={loading ? 'staff-spin' : ''} /> Refresh
        </button>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="staff-attendance-notice" role="status">{notice}</p>}

      <section className="section-card staff-clock-card">
        <div className="staff-clock-copy">
          <span className={`staff-attendance-status ${today?.status || 'not_clocked_in'}`}>{labelStatus(today?.status)}</span>
          <h2>{attendance.todayDate || 'Today'}</h2>
          <p>{today?.status === 'present' ? `Started at ${formatTime(today.clockIn)}` : today?.status === 'completed' ? `Workday completed at ${formatTime(today.clockOut)}` : 'You have not started today’s workday yet.'}</p>
          {today?.status === 'completed' && <small>Total time: {formatDuration(today.durationMinutes)}</small>}
        </div>
        <div className="staff-clock-actions">
          {canClockIn && <button type="button" className="btn-primary" disabled={saving || loading} onClick={() => void recordPunch(adminApi.clockIn)}>
            <LogIn size={16} /> {saving ? 'Recording…' : 'Clock in'}
          </button>}
          {canClockOut && <button type="button" className="staff-clock-out" disabled={saving || loading} onClick={() => void recordPunch(adminApi.clockOut)}>
            <LogOut size={16} /> {saving ? 'Recording…' : 'Clock out'}
          </button>}
          {!canClockIn && !canClockOut && <span className="staff-clock-complete"><Clock3 size={16} /> Attendance complete for today</span>}
        </div>
      </section>

      <section className="section-card staff-attendance-history-card">
        <div className="card-header"><h3>Recent attendance</h3><span>Last 30 days</span></div>
        <div className="table-responsive">
          <table className="staff-table staff-attendance-table">
            <thead><tr><th>Date</th><th>Status</th><th>Clock in</th><th>Clock out</th><th>Duration</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="5" className="staff-empty-row"><CardzipLoader compact label="Loading attendance" /></td></tr> : historyRows.map((record) => (
                <tr key={record._id}>
                  <td>{record.attendanceDate}</td>
                  <td><span className={`staff-attendance-status ${record.status}`}>{labelStatus(record.status)}</span></td>
                  <td>{formatTime(record.clockIn)}</td>
                  <td>{formatTime(record.clockOut)}</td>
                  <td>{['absent', 'not_clocked_in'].includes(record.status) ? '—' : formatDuration(record.durationMinutes)}</td>
                </tr>
              ))}
              {!loading && attendance.history.length === 0 && <tr><td colSpan="5" className="staff-empty-row">No attendance history yet.</td></tr>}
            </tbody>
          </table>
        </div>
        {attendance.history.length > 0 && <div className="pagination-controls staff-my-attendance-pagination">
          <button type="button" disabled={historyPage <= 1 || loading} onClick={() => setHistoryPage((page) => page - 1)}>Previous</button>
          <span>Page {historyPage} of {historyTotalPages} · {attendance.history.length} records</span>
          <button type="button" disabled={historyPage >= historyTotalPages || loading} onClick={() => setHistoryPage((page) => page + 1)}>Next</button>
        </div>}
      </section>
    </section>
  )
}
