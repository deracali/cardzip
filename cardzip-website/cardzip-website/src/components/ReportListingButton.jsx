import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Flag, X } from 'lucide-react'
import { getUserToken, userApi } from '../services/api'
import './ReportListingButton.css'

const reasons = [
  { value: 'scam', label: 'Fraud or scam' },
  { value: 'counterfeit', label: 'Counterfeit or stolen goods' },
  { value: 'misleading', label: 'Misleading information' },
  { value: 'prohibited', label: 'Prohibited or unsafe item' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Other concern' },
]

export default function ReportListingButton({ targetType, targetId, targetTitle, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const openForm = () => {
    if (!getUserToken()) {
      const redirect = `${window.location.pathname}${window.location.search}`
      onNavigate?.(`/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }
    setError('')
    setNotice('')
    setOpen(true)
  }

  const submitReport = async (event) => {
    event.preventDefault()
    if (!reason || (reason === 'other' && details.trim().length < 10)) {
      setError(reason ? 'Please explain your concern in at least 10 characters.' : 'Choose a reason for this report.')
      return
    }
    setSending(true)
    setError('')
    try {
      await userApi.reportListing({ targetType, targetId, reason, details: details.trim() })
      setOpen(false)
      setReason('')
      setDetails('')
      setNotice('Thank you. Your report has been sent to Cardzip for review.')
    } catch (requestError) {
      setError(requestError.message || 'Could not submit your report.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button type="button" className="report-listing-button" onClick={openForm}>
        <Flag size={14} /> Report {targetType === 'shop' ? 'business' : 'listing'}
      </button>
      {notice && <p className="report-listing-notice" role="status">{notice}</p>}
      {open && createPortal(
        <div className="report-listing-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !sending) setOpen(false) }}>
          <section className="report-listing-dialog" role="dialog" aria-modal="true" aria-labelledby="report-listing-title">
            <header>
              <div><span>HELP KEEP CARDZIP SAFE</span><h2 id="report-listing-title">Report this {targetType === 'shop' ? 'business' : 'listing'}</h2></div>
              <button type="button" aria-label="Close report form" disabled={sending} onClick={() => setOpen(false)}><X size={18} /></button>
            </header>
            <p className="report-listing-target">{targetTitle}</p>
            <form onSubmit={(event) => void submitReport(event)}>
              <label>Reason
                <select value={reason} onChange={(event) => setReason(event.target.value)} required>
                  <option value="">Choose a reason</option>
                  {reasons.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label><span>Additional details{reason === 'other' && ' (required)'}</span>
                <textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={4} maxLength={1000} placeholder="Share details that can help us review your report." />
              </label>
              {error && <p className="report-listing-error" role="alert">{error}</p>}
              <p className="report-listing-privacy">Your report is private and will only be reviewed by Cardzip administrators.</p>
              <button type="submit" disabled={sending}>{sending ? 'Sending report…' : 'Submit report'}</button>
            </form>
          </section>
        </div>,
        document.body,
      )}
    </>
  )
}
