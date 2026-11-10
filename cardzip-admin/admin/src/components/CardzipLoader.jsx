import { LoaderCircle } from 'lucide-react'

export default function CardzipLoader({ label = 'Loading Cardzip…', compact = false }) {
  if (compact) {
    return (
      <span className="cardzip-loader-inline" role="status" aria-label={label}>
        <LoaderCircle size={16} className="cardzip-loader-icon" />
      </span>
    )
  }

  return (
    <div className="cardzip-loader" role="status">
      <span className="cardzip-loader-mark"><LoaderCircle size={25} className="cardzip-loader-icon" /></span>
      <strong>CARDZIP</strong>
      <span>{label}</span>
    </div>
  )
}
