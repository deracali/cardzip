import { useState } from 'react'
import { ArrowRight, CalendarDays, Check, Clock3, Sparkles, X } from 'lucide-react'
import { appointmentDays, appointmentTimes, services, stylists } from './salonData'

function BookingSection() {
  const [selectedService, setSelectedService] = useState(services[0])
  const [selectedDay, setSelectedDay] = useState(appointmentDays[0].label)
  const [selectedTime, setSelectedTime] = useState(appointmentTimes[2])
  const [selectedStylist, setSelectedStylist] = useState(stylists[0])

  return (
    <section className="salon-booking-section" id="booking" aria-labelledby="booking-title">
      <div className="salon-booking-copy">
        <span className="salon-kicker">INSTANT PRICING & SLOTS</span>
        <h2 id="booking-title">See price &amp; time before you commit</h2>
        <p>Explore a ritual, compare starting prices and choose a preferred time. Call the studio to confirm your stylist and appointment.</p>
        <ul className="salon-booking-benefits">
          <li><span><Check size={14} /></span><div><strong>Current openings</strong><small>Call to confirm the latest availability at either studio</small></div></li>
          <li><span><Check size={14} /></span><div><strong>Upfront service pricing</strong><small>See starting prices before speaking with your stylist</small></div></li>
          <li><span><Check size={14} /></span><div><strong>Flexible scheduling</strong><small>Call us to ask about changing an appointment</small></div></li>
        </ul>
        <a className="salon-button salon-button-dark" href="tel:+12125550148">Call to check availability <ArrowRight size={14} /></a>
      </div>

      <div className="salon-booking-card">
        <span className="salon-booking-close" aria-hidden="true"><X size={14} /></span>
        <span className="salon-kicker">INSTANT BOOKING</span>
        <label className="salon-select-label" htmlFor="salon-service-select">Choose a service</label>
        <select id="salon-service-select" value={selectedService.name} onChange={(event) => setSelectedService(services.find((service) => service.name === event.target.value))}>
          {services.map((service) => <option key={service.name} value={service.name}>{service.name} — ${service.price}</option>)}
        </select>

        <div className="salon-booking-field">
          <span className="salon-select-label"><CalendarDays size={13} /> Choose a day</span>
          <div className="salon-stylist-options">
            {appointmentDays.map((day) => (
              <button className={selectedDay === day.label ? 'is-selected' : ''} type="button" key={day.label} onClick={() => setSelectedDay(day.label)}>
                <strong>{day.label}</strong><small>{day.date}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="salon-booking-field" id="stylists">
          <span className="salon-select-label"><Sparkles size={13} /> Choose your stylist</span>
          <div className="salon-stylist-options">
            {stylists.map((stylist) => (
              <button className={selectedStylist === stylist ? 'is-selected' : ''} type="button" key={stylist} onClick={() => setSelectedStylist(stylist)}>
                <strong>{stylist}</strong><small>{stylist === 'Maya R.' ? 'Color expert' : stylist === 'Jonas K.' ? 'Stylist' : 'Senior artist'}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="salon-time-grid" aria-label="Available appointment times">
          {appointmentTimes.map((time) => (
            <button className={selectedTime === time ? 'is-selected' : ''} type="button" key={time} onClick={() => setSelectedTime(time)}><Clock3 size={12} /> {time}</button>
          ))}
        </div>
        <div className="salon-booking-total"><span>{selectedService.name}<small>{selectedDay}, {selectedTime} · {selectedStylist}</small></span><strong>${selectedService.price}.00</strong></div>
        <a className="salon-button salon-button-primary salon-confirm-button" href="tel:+12125550148">Call to book this slot <ArrowRight size={14} /></a>
        <small className="salon-booking-note">Call to confirm your selected appointment time.</small>
      </div>
    </section>
  )
}

export default BookingSection
