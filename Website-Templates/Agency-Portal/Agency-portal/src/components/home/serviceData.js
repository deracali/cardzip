export const servicePackages = [
  {
    id: 'essential',
    name: 'Essential Clean',
    description: 'A thoughtful refresh for the spaces you use every day.',
    price: 89,
    duration: '2–3 hours',
    features: ['Kitchen and bathrooms', 'Dusting and surfaces', 'Vacuum and mop floors'],
  },
  {
    id: 'signature',
    name: 'Signature Clean',
    description: 'Our most-loved top-to-bottom clean for a fresh start.',
    price: 129,
    duration: '3–4 hours',
    featured: true,
    features: ['Everything in Essential', 'Detailed fixtures and surfaces', 'Fresh linens on request'],
  },
  {
    id: 'deep',
    name: 'Deep Clean',
    description: 'Extra detail for the corners, buildup, and hard-to-reach spots.',
    price: 189,
    duration: '4–6 hours',
    features: ['Everything in Signature', 'Baseboards and extra detail', 'Inside microwave and oven'],
  },
]

export const sampleCoveredZipCodes = ['10001', '10002', '10003', '10009', '10011', '10012', '10013', '10014']

export const isValidZipCode = (zipCode) => /^\d{5}$/.test(zipCode.trim())

export const isZipCodeCovered = (zipCode) => sampleCoveredZipCodes.includes(zipCode.trim())

export const estimatePrice = ({ packageId, bedrooms, bathrooms, frequency }) => {
  const selectedService = servicePackages.find((service) => service.id === packageId)

  if (!selectedService) {
    return 0
  }

  const roomTotal = selectedService.price + Math.max(0, bedrooms - 1) * 20 + Math.max(0, bathrooms - 1) * 15
  const discounts = { once: 0, monthly: 0.05, biweekly: 0.1, weekly: 0.15 }

  return Math.round(roomTotal * (1 - (discounts[frequency] ?? 0)))
}
