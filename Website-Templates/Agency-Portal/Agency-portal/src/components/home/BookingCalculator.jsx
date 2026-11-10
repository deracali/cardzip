import { useState } from 'react'
import { ArrowRight, CalendarDays, Check, Clock3, MapPin, Minus, Plus, Sparkles } from 'lucide-react'
import { estimatePrice, isValidZipCode, isZipCodeCovered, servicePackages } from './serviceData'

const frequencyOptions = [
  { value: 'once', label: 'Just once', discount: '' },
  { value: 'monthly', label: 'Monthly', discount: '5% off' },
  { value: 'biweekly', label: 'Every 2 weeks', discount: '10% off' },
  { value: 'weekly', label: 'Weekly', discount: '15% off' },
]

function BookingCalculator({ zipCode, selectedPackage, onZipCodeChange, onAvailabilityCheck, onSelectPackage }) {
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(1)
  const [frequency, setFrequency] = useState('once')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const today = new Date()
  const earliestDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const price = estimatePrice({ packageId: selectedPackage, bedrooms, bathrooms, frequency })
  const activeService = servicePackages.find((service) => service.id === selectedPackage)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isValidZipCode(zipCode)) {
      setBookingMessage('Enter a valid 5-digit ZIP code to check availability.')
      return
    }

    onAvailabilityCheck(zipCode)
    if (!isZipCodeCovered(zipCode)) {
      setBookingMessage('This ZIP is outside our sample service area. Try a covered ZIP to preview a booking.')
      return
    }

    if (!date || !time) {
      setBookingMessage('Choose a preferred date and time to preview your booking.')
      return
    }

    setBookingMessage(`Preview ready: ${activeService?.name} on ${date} at ${time}. Your estimated total is $${price}. No reservation has been made.`)
  }

  return (
    <section className="home-section estimate-section" id="estimate" aria-labelledby="estimate-title">
      <div className="estimate-intro" id="how-it-works">
        <span className="section-kicker">YOUR SPACE, YOUR SCHEDULE</span>
        <h2 id="estimate-title">Good clean.<br /><span>No guesswork.</span></h2>
        <p>Tell us a little about your home. Get a clear, instant estimate and choose a time that works for you.</p>
        <ol className="booking-steps">
          <li><span>01</span><div><strong>Pick your clean</strong><small>Choose the service that fits your space.</small></div></li>
          <li><span>02</span><div><strong>Set the details</strong><small>Home size and frequency shape your estimate.</small></div></li>
          <li><span>03</span><div><strong>Choose a time</strong><small>Preview your preferred visit in seconds.</small></div></li>
        </ol>
      </div>

      <form className="estimate-card" onSubmit={handleSubmit}>
        <div className="estimate-card-heading">
          <span><Sparkles size={15} /> QUICK ESTIMATE</span>
          <small>1 min · No commitment</small>
        </div>

        <label className="estimate-label" htmlFor="estimate-package">Choose a service</label>
        <select id="estimate-package" value={selectedPackage} onChange={(event) => {
          setBookingMessage('')
          onSelectPackage(event.target.value)
        }}>
          {servicePackages.map((service) => <option value={service.id} key={service.id}>{service.name} · from ${service.price}</option>)}
        </select>

        <div className="estimate-room-grid">
          <RoomCounter label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
          <RoomCounter label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
        </div>

        <label className="estimate-label" htmlFor="estimate-frequency">How often?</label>
        <select id="estimate-frequency" value={frequency} onChange={(event) => setFrequency(event.target.value)}>
          {frequencyOptions.map((option) => <option value={option.value} key={option.value}>{option.label}{option.discount ? ` · ${option.discount}` : ''}</option>)}
        </select>

        <div className="estimate-room-grid">
          <label className="estimate-label" htmlFor="estimate-date"><CalendarDays size={14} /> Preferred date</label>
          <label className="estimate-label" htmlFor="estimate-time"><Clock3 size={14} /> Preferred time</label>
          <input id="estimate-date" type="date" min={earliestDate} value={date} onChange={(event) => setDate(event.target.value)} />
          <select id="estimate-time" value={time} onChange={(event) => setTime(event.target.value)}>
            <option value="">Select a time</option><option>8:00 AM</option><option>10:00 AM</option><option>12:00 PM</option><option>2:00 PM</option>
          </select>
        </div>

        <label className="estimate-label" htmlFor="estimate-zip"><MapPin size={14} /> Service ZIP code</label>
        <input
          id="estimate-zip"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          placeholder="Enter ZIP code"
          value={zipCode}
          onChange={(event) => {
            onZipCodeChange(event.target.value.replace(/\D/g, '').slice(0, 5))
            setBookingMessage('')
          }}
        />

        <div className="estimate-total">
          <span><small>YOUR ESTIMATED TOTAL</small><strong>${price}<sup> USD</sup></strong></span>
          <span className="estimate-includes"><Check size={13} /> Supplies included</span>
        </div>
        <button className="button-primary estimate-submit" type="submit">Preview my booking <ArrowRight size={16} /></button>
        <p className="estimate-disclaimer">Illustrative estimate. Booking is not confirmed until availability is verified by our team.</p>
        {bookingMessage && <p className="booking-message" role="status">{bookingMessage}</p>}
      </form>
    </section>
  )
}

function RoomCounter({ label, value, onChange }) {
  return (
    <div className="room-counter">
      <span>{label}</span>
      <div>
        <button type="button" aria-label={`Remove one ${label.toLowerCase()}`} disabled={value <= 1} onClick={() => onChange((count) => Math.max(1, count - 1))}><Minus size={13} /></button>
        <strong aria-live="polite">{value}</strong>
        <button type="button" aria-label={`Add one ${label.toLowerCase()}`} disabled={value >= 8} onClick={() => onChange((count) => Math.min(8, count + 1))}><Plus size={13} /></button>
      </div>
    </div>
  )
}

export default BookingCalculator
