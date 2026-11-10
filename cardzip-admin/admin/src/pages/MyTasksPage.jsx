import { useEffect, useState } from 'react'
import { ExternalLink, Send } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'

const taskStatusOptions = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-NG') : 'No due date'

export default function MyTasksPage({ onViewOrder }) {
  const [tasks, setTasks] = useState([])
  const [supportReplies, setSupportReplies] = useState({})
  const [replySending, setReplySending] = useState('')
  const [giftCardDrafts, setGiftCardDrafts] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadTasks = () => adminApi.tasks()
    .then((result) => setTasks(Array.isArray(result.data) ? result.data : []))
    .catch((requestError) => setError(requestError.message))
    .finally(() => setLoading(false))

  useEffect(() => { void loadTasks() }, [])

  const updateStatus = async (task, status) => {
    setError('')
    try {
      const result = await adminApi.updateTask(task._id, { status })
      setTasks((current) => current.map((item) => item._id === result.data._id ? {
        ...item,
        status: result.data.status,
        ...(item.relatedSupportRequest ? {
          relatedSupportRequest: {
            ...item.relatedSupportRequest,
            status: status === 'completed' ? 'resolved'
              : status === 'cancelled' ? 'open'
                : status === 'in_progress' ? 'in_progress' : item.relatedSupportRequest.status,
          },
        } : {}),
      } : item))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const replyToSupport = async (task) => {
    const request = task.relatedSupportRequest
    const message = String(supportReplies[task._id] || '').trim()
    if (!request || !message) return
    if (replySending === task._id) return
    setReplySending(task._id)
    setError('')
    try {
      const result = await adminApi.updateSupportRequest(request._id, { message, status: 'in_progress' })
      setTasks((current) => current.map((item) => item._id === task._id
        ? { ...item, relatedSupportRequest: { ...request, ...result.data, user: request.user } }
        : item))
      setSupportReplies((current) => ({ ...current, [task._id]: '' }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setReplySending('')
    }
  }

  const reviewGiftCard = async (task) => {
    const trade = task.relatedGiftCard
    const draft = giftCardDrafts[task._id] || { status: 'successful', amount: trade?.ngnAmount || '', feedback: '' }
    if (!trade) return
    if (draft.status === 'failed' && !draft.feedback.trim()) {
      setError('Provide a reason before rejecting this gift-card trade.')
      return
    }
    setError('')
    try {
      await adminApi.reviewGiftCardTrade(trade._id, {
        status: draft.status,
        ...(draft.status === 'successful' ? { ngnAmount: Number(draft.amount) } : {}),
        ...(draft.feedback.trim() ? { companyFeedback: draft.feedback.trim() } : {}),
      })
      const result = await adminApi.updateTask(task._id, { status: 'completed' })
      setTasks((current) => current.map((item) => item._id === task._id ? { ...item, status: result.data.status } : item))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const changeGiftCardDraft = (taskId, key, value, trade) => setGiftCardDrafts((current) => ({
    ...current,
    [taskId]: {
      ...(current[taskId] || { status: 'successful', amount: trade?.ngnAmount || '', feedback: '' }),
      [key]: value,
    },
  }))

  return (
    <section className="staff-page staff-tasks-page">
      <header className="page-header">
        <div><h1 className="page-title">My assigned tasks</h1><p className="page-subtitle">Review your assigned work and keep its status up to date.</p></div>
      </header>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="section-card staff-task-list">
        {loading ? <p className="staff-empty-row"><CardzipLoader compact label="Loading your tasks" /></p> : tasks.length === 0 ? <p className="staff-empty-row">No tasks are currently assigned to you.</p> : tasks.map((task) => {
          const giftCard = task.relatedGiftCard
          const storeOrder = task.relatedStoreOrder
          const supportRequest = task.relatedSupportRequest
          const draft = giftCardDrafts[task._id] || { status: 'successful', amount: giftCard?.ngnAmount || '', feedback: '' }
          const linkedType = giftCard ? 'Gift-card trade' : storeOrder ? 'E-commerce order' : supportRequest ? 'User support' : 'General task'
          const canUpdate = ['todo', 'in_progress'].includes(task.status)
          return (
            <article className="staff-task-card" key={task._id}>
              <header className="staff-task-card-header">
                <div><span className="staff-task-type">{linkedType}</span><h2>{task.title}</h2></div>
                <span className={`staff-task-status ${task.status}`}>{task.status.replace('_', ' ')}</span>
              </header>
              <p className="staff-task-description">{task.description || 'No extra task details.'}</p>
              <div className="staff-task-meta"><span>Assigned by {task.assignedBy?.name || 'Admin'}</span><span>Due {formatDate(task.dueAt)}</span></div>

              {giftCard && <div className="staff-task-work">
                <strong>{giftCard.type} · {giftCard.currency} {Number(giftCard.amount || 0).toLocaleString()}</strong>
                <span>Customer: {giftCard.user?.name || giftCard.user?.email || 'Customer'} · Status: {giftCard.status}</span>
                {giftCard.imageUrls?.length
                  ? <div className="staff-gift-card-images">{giftCard.imageUrls.map((url, index) => <a href={url} target="_blank" rel="noreferrer" key={`${url}-${index}`}><img src={url} alt={`${giftCard.type} submission ${index + 1}`} /><span>View image {index + 1}</span></a>)}</div>
                  : <span>No card images were attached to this submission.</span>}
                {canUpdate && <div className="staff-gift-review-form">
                  <label>Review outcome
                    <CustomSelect
                      ariaLabel="Gift-card review outcome"
                      value={draft.status}
                      options={[{ value: 'successful', label: 'Approve trade' }, { value: 'failed', label: 'Reject trade' }]}
                      onChange={(value) => changeGiftCardDraft(task._id, 'status', value, giftCard)}
                    />
                  </label>
                  {draft.status === 'successful'
                    ? <label>Final naira payout<input type="number" min="0.01" step="0.01" value={draft.amount} onChange={(event) => changeGiftCardDraft(task._id, 'amount', event.target.value, giftCard)} /></label>
                    : <label>Reason for rejection<textarea required value={draft.feedback} onChange={(event) => changeGiftCardDraft(task._id, 'feedback', event.target.value, giftCard)} /></label>}
                  <button type="button" className="btn-primary" onClick={() => void reviewGiftCard(task)}>Submit trade review</button>
                </div>}
              </div>}

              {storeOrder && <div className="staff-task-work">
                <strong>{storeOrder.orderNumber} · ₦{Number(storeOrder.total || 0).toLocaleString('en-NG')}</strong>
                <span>Customer: {storeOrder.user?.name || storeOrder.shippingAddress?.name || 'Customer'} · Status: {storeOrder.status}</span>
                <button type="button" className="btn-secondary" onClick={() => onViewOrder?.(storeOrder)}>Open order details <ExternalLink size={14} /></button>
              </div>}

              {supportRequest && <div className="staff-task-work">
                <strong>{supportRequest.subject} · {supportRequest.user?.name || supportRequest.user?.email || 'Customer'}</strong>
                <p>{supportRequest.description}</p>
                <div className="staff-support-thread">
                  {(supportRequest.messages || []).map((message) => (
                    <div className={`staff-support-message ${message.senderRole}`} key={message._id}>
                      <strong>{message.senderRole === 'user' ? 'Customer' : 'Cardzip staff'}</strong>
                      <p>{message.message}</p>
                    </div>
                  ))}
                </div>
                {canUpdate && <>
                  <label>Reply to customer<textarea value={supportReplies[task._id] || ''} onChange={(event) => setSupportReplies((current) => ({ ...current, [task._id]: event.target.value }))} rows={3} maxLength={4000} /></label>
                  <button type="button" className="btn-primary" disabled={replySending === task._id || !String(supportReplies[task._id] || '').trim()} onClick={() => void replyToSupport(task)}><Send size={14} /> {replySending === task._id ? 'Sending…' : 'Send reply'}</button>
                </>}
              </div>}

              <div className="staff-task-update">
                <span>Update task status</span>
                <CustomSelect
                  ariaLabel={`Update ${task.title} status`}
                  value={task.status}
                  options={giftCard && canUpdate ? taskStatusOptions.filter((option) => option.value !== 'completed') : taskStatusOptions}
                  disabled={!canUpdate}
                  onChange={(status) => void updateStatus(task, status)}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
