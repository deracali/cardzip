export const services = [
  {
    name: 'Signature Silk Blowout',
    category: 'Hair',
    description: 'Cleanse, gloss + sculpted finish with our heat-safe ritual.',
    duration: '60 min',
    price: 85,
    image: '/images/salon/silk-blowout.jpg',
    badge: 'Most booked',
  },
  {
    name: 'Rose Quartz Manicure',
    category: 'Nails',
    description: 'Sculpt, cuticle care + soft shine in a clean room.',
    duration: '45 min',
    price: 65,
    image: '/images/salon/nail-ritual.jpg',
  },
  {
    name: 'Lumière Glow Facial',
    category: 'Skincare',
    description: 'Double cleanse, lymphatic sculpt + LED brightening.',
    duration: '75 min',
    price: 140,
    image: '/images/salon/glow-facial.jpg',
    badge: 'New',
  },
  {
    name: 'Deep Calm Massage',
    category: 'Massage',
    description: 'Warm oil, deep tissue + aromatherapy wind-down.',
    duration: '60 min',
    price: 120,
    image: '/images/salon/deep-tissue.jpg',
  },
]

export const stylists = ['Maya R.', 'Jonas K.', 'Sofia M.']
export const appointmentTimes = ['9:00 AM', '10:30 AM', '12:00 PM', '2:15 PM', '4:00 PM', '5:30 PM']

export const appointmentDays = Array.from({ length: 3 }, (_, offset) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)

  return {
    label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }
})
