import { useState } from 'react'
import { ArrowRight, CalendarDays, Check, Clock3, Sparkles, X } from 'lucide-react'
import { appointmentDays, appointmentTimes, services as defaultServices, stylists } from './salonData'
import { getSalonServices } from '../../services/salonLocalStore'

function BookingSection() {
  const [services] = useState(() => {
    const activeServices = getSalonServices().filter((service) => service.active !== false)
    return activeServices.length ? activeServices : defaultServices
  })
  const [selectedService, setSelectedService] = useState(services[0])
  const [selectedDay, setSelectedDay] = useState(appointmentDays[0].label)
  const [selectedTime, setSelectedTime] = useState(appointmentTimes[2])
  const [selectedStylist, setSelectedStylist] = useState(stylists[0])

  return (
    <section className="salon-booking-section" id="booking" aria-labelledby="booking-title">
      <div className="salon-booking-copy">
        <span className="salon-kicker">INSTANT PRICING & SLOTS</span>
        <h2 id="booking-title">See price &amp; time before you commit</h2>
        <p>Explore a ritual, compare starting prices and send an appointment request. The studio will confirm availability.</p>
        <ul className="salon-booking-benefits">
          <li><span><Check size={14} /></span><div><strong>Appointment requests</strong><small>Choose a preferred date and time online</small></div></li>
          <li><span><Check size={14} /></span><div><strong>Upfront service pricing</strong><small>See starting prices before speaking with your stylist</small></div></li>
          <li><span><Check size={14} /></span><div><strong>Studio confirmation</strong><small>Your visit is confirmed after the team reviews your request</small></div></li>
        </ul>
        <a className="salon-button salon-button-dark" href="/book">Start a booking request <ArrowRight size={14} /></a>
      </div>

      <div className="salon-booking-card">
        <span className="salon-booking-close" aria-hidden="true"><X size={14} /></span>
        <span className="salon-kicker">INSTANT BOOKING</span>
        <label className="salon-select-label" htmlFor="salon-service-select">Choose a service</label>
        <select id="salon-service-select" value={selectedService.id} onChange={(event) => setSelectedService(services.find((service) => service.id === event.target.value))}>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name} — ${service.price}</option>)}
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
        <a className="salon-button salon-button-primary salon-confirm-button" href="/book">Continue to appointment request <ArrowRight size={14} /></a>
        <small className="salon-booking-note">Preview prices are saved in this browser. Sign in is required to send a local demo request.</small>
      </div>
    </section>
  )
}

export default BookingSection
