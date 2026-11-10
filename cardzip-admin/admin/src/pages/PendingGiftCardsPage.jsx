import { useEffect, useState } from 'react'
import { CheckCircle2, Copy, Eye, X, XCircle } from 'lucide-react'
import { adminApi } from '../services/api'
import { subscribeToGiftCardTradeChanges } from '../services/giftCardRealtime'
import CardzipLoader from '../components/CardzipLoader'

const naira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

async function copyGiftCardImages(imageUrls) {
  if (!navigator.clipboard?.write || !window.ClipboardItem) {
    throw new Error('This browser does not support copying images to the clipboard.')
  }

  const images = await Promise.all(imageUrls.map(async (url) => {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' })
    if (!response.ok) throw new Error('Could not retrieve a gift-card image.')
    const imageBlob = await response.blob()
    if (!imageBlob.type.startsWith('image/')) throw new Error('A submitted file is not a supported image.')
    return createImageBitmap(imageBlob)
  }))

  try {
    const gap = 16
    const maxWidth = 1600
    const sizes = images.map((image) => {
      const scale = Math.min(1, maxWidth / image.width)
      return { width: Math.round(image.width * scale), height: Math.round(image.height * scale) }
    })
    const width = Math.max(...sizes.map(({ width: imageWidth }) => imageWidth))
    const height = sizes.reduce((total, { height: imageHeight }) => total + imageHeight, 0) + gap * (images.length - 1)
    if (height > 30000) throw new Error('The selected images are too large to copy together.')

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare the images for copying.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)

    let top = 0
    images.forEach((image, index) => {
      context.drawImage(image, 0, top, sizes[index].width, sizes[index].height)
      top += sizes[index].height + gap
    })

    const png = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not encode the images for copying.'))
      }, 'image/png')
    })
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
  } finally {
    images.forEach((image) => image.close())
  }
}

export default function PendingGiftCardsPage() {
  const [cards, setCards] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [selectedCard, setSelectedCard] = useState(null)
  const [declineReason, setDeclineReason] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [copyError, setCopyError] = useState(false)
  const [copyingImage, setCopyingImage] = useState(null)

  useEffect(() => {
    let active = true
    adminApi.pendingGiftCardTrades(`?page=${pagination.page}&limit=20`)
      .then((result) => {
        if (!active) return
        setError('')
        setCards(result.data)
        setPagination(result.pagination)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [pagination.page, refreshKey])

  useEffect(() => subscribeToGiftCardTradeChanges(
    () => setRefreshKey((current) => current + 1),
    () => setRefreshKey((current) => current + 1),
  ), [])

  const reviewCard = async (status) => {
    if (!selectedCard) return
    if (status === 'successful' && (!Number.isFinite(Number(payoutAmount)) || Number(payoutAmount) <= 0)) {
      setError('Enter the final naira payout before marking this trade successful.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await adminApi.reviewGiftCardTrade(selectedCard._id, {
        status,
        ...(status === 'successful' ? { ngnAmount: Number(payoutAmount) } : {}),
        ...(status === 'failed' ? { companyFeedback: declineReason } : {}),
      })
      setRefreshKey((current) => current + 1)
      setSelectedCard(null)
      setDeclineReason('')
      setPayoutAmount('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const copyImages = async (imageUrls, imageKey) => {
    setCopyingImage(imageKey)
    setCopyStatus('')
    setCopyError(false)
    try {
      await copyGiftCardImages(imageUrls)
      setCopyStatus(imageUrls.length === 1 ? 'Image copied to clipboard.' : `${imageUrls.length} images copied together as one image.`)
    } catch (requestError) {
      setCopyStatus(`Unable to copy images: ${requestError.message}`)
      setCopyError(true)
    } finally {
      setCopyingImage(null)
    }
  }

  const referralReward = Math.round((Number(payoutAmount) || 0) * 0.02 * 100) / 100
  const referralRewardPreview = Number(payoutAmount) > 0 ? naira(referralReward) : 'Enter payout to calculate'
  const selectedImageUrls = selectedCard?.imageUrls || []

  return (
    <div className="pending-gc-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Gift Card Reviews</h1>
          <p className="page-subtitle">Review customer submissions and record their trade status.</p>
        </div>
      </div>

      {error && <p className="wallet-notice error" role="alert">{error}</p>}
      <div className="section-card">
        <div className="card-header flex-between"><h3>Verification Queue ({pagination.totalItems})</h3></div>
        {loading && <p><CardzipLoader compact label="Loading pending reviews" /></p>}
        <div className="table-responsive">
          <table className="pending-gc-table">
            <thead><tr><th>Trade Ref</th><th>Brand & Region</th><th>Face Value</th><th>Payout Value</th><th>Customer</th><th>Submitted</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {!loading && cards.map((card) => (
                <tr key={card._id}>
                  <td className="font-mono">{card._id}</td>
                  <td className="font-bold">
                    <span className="pending-gc-brand">
                      {card.cardLogo && <img src={card.cardLogo} alt="" />}
                      <span>{card.type}</span>
                    </span>
                  </td>
                  <td>{Number(card.amount).toLocaleString()} {card.currency}</td>
                  <td className="font-bold text-emerald">{card.ngnAmount ? `₦${Number(card.ngnAmount).toLocaleString('en-NG')}` : '—'}</td>
                  <td>{card.user?.name || card.user?.email || 'Unknown user'}</td>
                  <td className="text-muted">{new Date(card.createdAt).toLocaleString()}</td>
                  <td className="text-right"><button type="button" className="btn-review" onClick={() => { setSelectedCard(card); setDeclineReason(''); setPayoutAmount(card.ngnAmount ? String(card.ngnAmount) : ''); setCopyStatus(''); setCopyError(false) }}><Eye size={13} /> Review Card</button></td>
                </tr>
              ))}
              {!loading && cards.length === 0 && <tr><td colSpan="7" className="empty-state">No pending gift cards requiring review.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="trade-history-footer">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="pagination-controls">
            <button type="button" className="btn-page giftcards-page-button" disabled={loading || pagination.page <= 1} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })) }}>Previous</button>
            <button type="button" className="btn-page giftcards-page-button" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })) }}>Next</button>
          </div>
        </div>
      </div>

      {selectedCard && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content gc-modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
            <div className="modal-header">
              <h3 id="review-title">Review Trade #{selectedCard._id}</h3>
              <button type="button" className="btn-close" disabled={saving} onClick={() => setSelectedCard(null)} aria-label="Close review"><X size={18} /></button>
            </div>
            <div className="modal-body gc-review-grid">
              <div className="review-images">
                <div className="review-images-header">
                  <h4>Submitted images ({selectedImageUrls.length})</h4>
                  <button type="button" className="copy-images-button" disabled={!selectedImageUrls.length || copyingImage !== null} onClick={() => copyImages(selectedImageUrls, 'all')}>
                    <Copy size={14} /> {copyingImage === 'all' ? 'Copying…' : 'Copy all images'}
                  </button>
                </div>
                <div className="card-image-preview">
                  {selectedImageUrls.length
                    ? selectedImageUrls.map((url, index) => (
                      <div className="card-image-item" key={`${url}-${index}`}>
                        <img src={url} alt={`${selectedCard.type} gift card submission ${index + 1}`} />
                        <button type="button" className="copy-images-button" disabled={copyingImage !== null} onClick={() => copyImages([url], String(index))}>
                          <Copy size={13} /> {copyingImage === String(index) ? 'Copying…' : `Copy image ${index + 1}`}
                        </button>
                      </div>
                    ))
                    : <p>No card images were attached to this submission.</p>}
                </div>
                {copyStatus && <p className={`copy-image-status${copyError ? ' error' : ''}`} role={copyError ? 'alert' : 'status'}>{copyStatus}</p>}
              </div>
              <div className="review-details">
                <div className="review-row"><span>Brand:</span><strong>{selectedCard.type}</strong></div>
                <div className="review-row"><span>Face Value:</span><strong>{Number(selectedCard.amount).toLocaleString()} {selectedCard.currency}</strong></div>
                <div className="review-row"><span>Estimated payout:</span><strong className="text-emerald">{selectedCard.ngnAmount != null ? `₦${Number(selectedCard.ngnAmount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Not provided'}</strong></div>
                <div className="review-row"><span>Customer:</span><strong>{selectedCard.user?.name || selectedCard.user?.email || 'Unknown user'}</strong></div>
                <div className="review-row"><span>Referrer reward (2%):</span><strong className={selectedCard.user?.referrer ? 'text-emerald' : ''}>{selectedCard.user?.referrer ? referralRewardPreview : 'No referral reward'}</strong></div>
                <label className="decline-box" htmlFor="trade-payout-amount">
                  Final payout (NGN)
                  <input id="trade-payout-amount" type="number" min="0.01" step="0.01" value={payoutAmount} onChange={(event) => setPayoutAmount(event.target.value)} placeholder="Enter final naira payout" />
                  <small>Prefilled from the customer’s catalog rate. You may adjust it after checking the card. Approval credits the final payout to the customer’s wallet and the displayed 2% reward to their referrer.</small>
                </label>
                <div className="decline-box">
                  <label htmlFor="decline-reason">Reason for rejection:</label>
                  <input id="decline-reason" type="text" maxLength="500" placeholder="Explain why this trade is being rejected" value={declineReason} onChange={(event) => setDeclineReason(event.target.value)} />
                </div>
                <p role="note">Approval credits the final naira payout to the customer’s Cardzip wallet. It does not initiate a bank transfer.</p>
                <div className="modal-actions-stacked">
                  <button type="button" className="btn-approve" disabled={saving} onClick={() => reviewCard('successful')}><CheckCircle2 size={16} /> {saving ? 'Processing…' : 'Approve and credit wallet'}</button>
                  <button type="button" className="btn-decline" disabled={saving || !declineReason.trim()} onClick={() => reviewCard('failed')}><XCircle size={16} /> Reject trade</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
