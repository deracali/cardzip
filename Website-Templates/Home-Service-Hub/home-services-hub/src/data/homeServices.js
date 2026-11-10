import { AirVent, Flame, Pipette, ShowerHead } from 'lucide-react'

export const repairOptions = [
  { id: 'pipe', label: 'Leaky Pipe / Burst', shortLabel: 'Pipe repair', price: 129, icon: Pipette },
  { id: 'drain', label: 'Clogged Drain', shortLabel: 'Drain cleaning', price: 99, icon: ShowerHead },
  { id: 'cooling', label: 'AC Not Cooling', shortLabel: 'AC maintenance', price: 149, icon: AirVent },
  { id: 'heating', label: 'No Heat / Furnace', shortLabel: 'Heating', price: 159, icon: Flame },
]

export const serviceCards = [
  {
    name: 'Pipe Repair',
    description: 'Leak detection, repiping & burst fixes.',
    price: 89,
    response: '45 min response',
    issue: 'pipe',
    icon: Pipette,
  },
  {
    name: 'AC Maintenance',
    description: 'Tune-ups, refrigerant & full installs.',
    price: 79,
    response: 'Same-day slots',
    issue: 'cooling',
    icon: AirVent,
  },
  {
    name: 'Drain Cleaning',
    description: 'Hydro-jetting & camera inspection.',
    price: 99,
    response: '50 min response',
    issue: 'drain',
    icon: ShowerHead,
  },
  {
    name: 'Heating',
    description: 'Furnace repair & heat-pump service.',
    price: 109,
    response: 'Same-day slots',
    issue: 'heating',
    icon: Flame,
  },
]

export const customerReviews = [
  {
    quote: '“Water everywhere at 2am. Tech arrived in 38 minutes and had it sealed before sunrise. Flat price, zero surprise.”',
    name: 'Marcus T.',
    service: 'Pipe burst · Denver, CO',
    initials: 'MT',
  },
  {
    quote: '“Two other companies quoted me double. These guys showed photos, explained everything, and were done in one day.”',
    name: 'Linda K.',
    service: 'AC replacement · Aurora, CO',
    initials: 'LK',
  },
  {
    quote: '“Booked online in 60 seconds, tracking link showed the van live. Cleanest crew I have had in the house.”',
    name: 'Priya S.',
    service: 'Drain cleaning · Boulder, CO',
    initials: 'PS',
  },
]
