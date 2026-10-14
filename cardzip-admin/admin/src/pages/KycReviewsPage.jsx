import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink, XCircle } from 'lucide-react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'
import './KycReviewsPage.css'

export default function KycReviewsPage({ onViewUser }) {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [savingUserId, setSavingUserId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const result = await adminApi.users(`?kycStatus=pending&page=${pagination.page}&limit=20`)
        if (!active) return
        setError('')
        setUsers(result.data || [])
        setPagination(result.pagination || { page: pagination.page, totalPages: 1, totalItems: 0 })
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [pagination.page])

  const review = async (userId, status) => {
    setSavingUserId(userId)
    setError('')
    try {
      await adminApi.updateUser(userId, { kycStatus: status })
      setUsers((current) => current.filter((user) => user._id !== userId))
      setPagination((current) => ({
        ...current,
        totalItems: Math.max(0, current.totalItems - 1),
      }))
      if (users.length === 1 && pagination.page > 1) {
        setLoading(true)
        setPagination((current) => ({ ...current, page: current.page - 1 }))
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingUserId('')
    }
  }

  return (
    <section className="kyc-review-page">
      <header className="kyc-review-header">
        <div>
          <p className="kyc-review-eyebrow">IDENTITY & COMPLIANCE</p>
          <h1>Pending KYC reviews</h1>
          <p>Review the submitted identity details and approve or reject each request.</p>
        </div>
        <div className="kyc-review-count"><Clock3 size={18} /><span>{pagination.totalItems} awaiting review</span></div>
      </header>

      {error && <p className="kyc-review-error" role="alert">{error}</p>}
      {loading ? <CardzipLoader label="Loading KYC reviews…" /> : users.length === 0 ? (
        <div className="kyc-review-empty"><CheckCircle2 size={28} /><h2>All caught up</h2><p>There are no pending KYC requests to review.</p></div>
      ) : (
        <div className="kyc-review-list">
          {users.map((user) => {
            const kyc = user.kyc || {}
            return (
              <article className="kyc-review-card" key={user._id}>
                <div className="kyc-review-person">
                  <div className="kyc-review-avatar">{String(user.name || 'U').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div>
                  <div>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <span className="kyc-review-status"><Clock3 size={12} /> Pending review</span>
                  </div>
                </div>
                <dl className="kyc-review-details">
                  <div><dt>Legal name</dt><dd>{kyc.legalName || 'Not provided'}</dd></div>
                  <div><dt>Document</dt><dd>{kyc.documentType?.replaceAll('_', ' ') || 'Not provided'}</dd></div>
                  <div><dt>Document ending</dt><dd>{kyc.documentLastFour ? `•••• ${kyc.documentLastFour}` : 'Not available'}</dd></div>
                  <div><dt>Submitted</dt><dd>{kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString() : 'Date unavailable'}</dd></div>
                </dl>
                <p className="kyc-review-note">Document images are not stored for this KYC submission; only the details above are available for review.</p>
                <div className="kyc-review-actions">
                  <button type="button" className="kyc-review-open" onClick={() => onViewUser?.(user._id)}><ExternalLink size={15} /> User details</button>
                  <button type="button" className="kyc-review-reject" disabled={savingUserId === user._id} onClick={() => void review(user._id, 'rejected')}><XCircle size={15} /> Reject</button>
                  <button type="button" className="kyc-review-approve" disabled={savingUserId === user._id} onClick={() => void review(user._id, 'approved')}><CheckCircle2 size={15} /> Approve</button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <footer className="kyc-review-pagination">
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <div>
          <button type="button" aria-label="Previous page" disabled={loading || pagination.page <= 1} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })) }}><ChevronLeft size={17} /> Previous</button>
          <button type="button" aria-label="Next page" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Next <ChevronRight size={17} /></button>
        </div>
      </footer>
    </section>
  )
}
