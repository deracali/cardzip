import { useState } from 'react'
import { CalendarDays, MapPin, Search, Users } from 'lucide-react'

export default function SearchBar({ compact = false }) {
  const [destination, setDestination] = useState('Bali, Indonesia')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2 guests')
  function submit(event) {
    event.preventDefault()
    const params = new URLSearchParams({ destination, checkIn, checkOut, guests })
    window.location.href = `/stays?${params.toString()}`
  }
  return (
    <form className={`search-bar${compact ? ' search-bar-compact' : ''}`} onSubmit={submit}>
      <label className="search-field destination-field"><span>Destination</span><span className="search-input"><MapPin size={15} /><input value={destination} onChange={(event) => setDestination(event.target.value)} aria-label="Destination" placeholder="Where are you going?" /></span></label>
      <label className="search-field"><span>Check in</span><span className="search-input"><CalendarDays size={15} /><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} aria-label="Check in" /></span></label>
      <label className="search-field"><span>Check out</span><span className="search-input"><CalendarDays size={15} /><input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} aria-label="Check out" /></span></label>
      <label className="search-field guest-field"><span>Guests</span><span className="search-input"><Users size={15} /><select value={guests} onChange={(event) => setGuests(event.target.value)} aria-label="Guests"><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4 guests</option><option>5+ guests</option></select></span></label>
      <button className="button button-primary search-submit" type="submit"><Search size={16} /> Search stays</button>
    </form>
  )
}
