import { LoaderCircle } from 'lucide-react'

export default function CardzipLoader({ label = 'Loading Cardzip…' }) {
  return (
    <div className="cardzip-loader" role="status">
      <span className="cardzip-loader-mark"><LoaderCircle size={25} className="cardzip-loader-icon" /></span>
      <strong>CARDZIP</strong>
      <span>{label}</span>
    </div>
  )
}
