import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { adminApi } from '../services/api'

export default function KycDocumentNumber({ userId, documentLastFour }) {
  const [documentNumber, setDocumentNumber] = useState('')
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleVisibility = async () => {
    if (visible) {
      setVisible(false)
      return
    }
    if (documentNumber) {
      setVisible(true)
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await adminApi.userKycDocument(userId)
      setDocumentNumber(result.data.documentNumber)
      setVisible(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="kyc-document-number">
      <span className="kyc-document-number-value">
        {visible ? documentNumber : documentLastFour ? `•••• ${documentLastFour}` : 'Not provided'}
      </span>
      <button
        type="button"
        className="kyc-document-number-toggle"
        disabled={loading}
        onClick={() => void toggleVisibility()}
        aria-label={visible ? 'Hide full ID number' : 'Reveal full ID number'}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        {loading ? 'Loading…' : visible ? 'Hide' : 'Show full number'}
      </button>
      {error && <span className="kyc-document-number-error" role="alert">{error}</span>}
    </div>
  )
}
