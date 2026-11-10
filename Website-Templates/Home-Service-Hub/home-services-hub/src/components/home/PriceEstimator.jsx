import { ArrowRight, CheckCircle2, Clock3, Flame, Zap } from 'lucide-react'
import { useState } from 'react'
import { repairOptions } from '../../data/homeServices'

const urgencyOptions = [
  { id: 'standard', label: 'Standard', detail: '2–3 days', surcharge: 0 },
  { id: 'emergency', label: 'Emergency', detail: 'Under 80 min', surcharge: 60 },
  { id: 'weekend', label: 'Weekend', detail: 'Sat / Sun', surcharge: 30 },
]

function PriceEstimator({ selectedRepair, onRepairChange }) {
  const [urgencyId, setUrgencyId] = useState(urgencyOptions[0].id)

  const repair = repairOptions.find((option) => option.id === selectedRepair) ?? repairOptions[0]
  const urgency = urgencyOptions.find((option) => option.id === urgencyId) ?? urgencyOptions[0]
  const total = repair.price + urgency.surcharge

  return (
    <section className="ff-container ff-estimator-section" id="estimate" aria-labelledby="ff-estimate-title">
      <div className="ff-estimator-heading">
        <div>
          <span className="ff-kicker">INSTANT COST ESTIMATOR</span>
          <h2 id="ff-estimate-title">See your flat rate in 30 seconds</h2>
        </div>
        <span className="ff-estimator-note">No phone call needed · Price locked for 14 days</span>
      </div>

      <div className="ff-estimator">
        <fieldset className="ff-estimator-step ff-repair-step">
          <legend><span>Step 1</span> What's the issue?</legend>
          <div className="ff-repair-options">
            {repairOptions.map(({ id, label, icon: Icon }) => (
              <button
                className={`ff-choice${selectedRepair === id ? ' is-selected' : ''}`}
                type="button"
                key={id}
                aria-pressed={selectedRepair === id}
                onClick={() => onRepairChange(id)}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="ff-estimator-step ff-urgency-step">
          <legend><span>Step 2</span> How urgent is it?</legend>
          <div className="ff-urgency-options">
            {urgencyOptions.map(({ id, label, detail }) => (
              <button
                className={`ff-urgency-choice${urgencyId === id ? ' is-selected' : ''}`}
                type="button"
                key={id}
                aria-pressed={urgencyId === id}
                onClick={() => setUrgencyId(id)}
              >
                {id === 'emergency' && <Flame size={13} />}
                <strong>{label}</strong>
                <small>{detail}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <aside className="ff-quote-card" aria-live="polite">
          <span className="ff-quote-step"><Zap size={12} /> STEP 3 — INSTANT QUOTE</span>
          <div className="ff-quote-price">${total}<small>${total + 40}</small></div>
          <p>{repair.shortLabel} · {urgency.label.toLowerCase()} visit</p>
          <span className="ff-quote-promise"><CheckCircle2 size={12} /> Price locked for 14 days · No hidden fees</span>
          <a className="ff-button ff-button-orange ff-quote-button" href="tel:+18005550199">Book this price <ArrowRight size={14} /></a>
        </aside>
      </div>
      <p className="ff-estimate-disclaimer"><Clock3 size={12} /> Estimates are based on the selected repair and visit time. Your technician confirms the flat rate before work begins.</p>
    </section>
  )
}

export default PriceEstimator
