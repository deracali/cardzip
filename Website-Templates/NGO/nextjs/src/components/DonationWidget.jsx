import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { donationPresets } from '../data/campaigns'

export default function DonationWidget({ campaign }) {
  const [frequency, setFrequency] = useState('once')
  const [amount, setAmount] = useState(50)
  const [custom, setCustom] = useState('')
  const donation = custom ? Number(custom) : amount

  function continueToCheckout(event) {
    event.preventDefault()
    if (!Number.isFinite(donation) || donation < 1) return
    const params = new URLSearchParams({ amount: String(donation), frequency })
    if (campaign) params.set('campaign', campaign.slug)
    window.location.href = `/checkout?${params.toString()}`
  }

  return (
    <form className="donation-widget" onSubmit={continueToCheckout}>
      <div className="frequency-toggle" role="group" aria-label="Donation frequency">
        <button type="button" className={frequency === 'once' ? 'is-active' : ''} aria-pressed={frequency === 'once'} onClick={() => setFrequency('once')}>One-time</button>
        <button type="button" className={frequency === 'monthly' ? 'is-active' : ''} aria-pressed={frequency === 'monthly'} onClick={() => setFrequency('monthly')}>Monthly <span className="save-label">Monthly gift</span></button>
      </div>
      <div className="preset-grid">{donationPresets.map((preset) => <button className={amount === preset && !custom ? 'is-selected' : ''} type="button" key={preset} onClick={() => { setAmount(preset); setCustom('') }}>${preset}</button>)}</div>
      <label className="custom-donation">Or choose an amount<input type="number" min="1" step="1" inputMode="numeric" placeholder="Other amount ($)" value={custom} onChange={(event) => setCustom(event.target.value)} /></label>
      <p className="tax-note"><Check size={13} /> Your donation may be tax-deductible.</p>
      <button className="button button-green full-button" type="submit">Continue to checkout</button>
      <p className="secure-note"><ShieldCheck size={13} /> Secure giving · No hidden fees</p>
    </form>
  )
}
