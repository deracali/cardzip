export const stays = [
  {
    slug: 'azure-breeze',
    name: 'Azure Breeze Luxury Resort & Spa',
    shortName: 'Azure Cliff Villa',
    area: 'Uluwatu, Bali',
    price: 180,
    rating: '4.98',
    reviews: 128,
    type: 'Beachfront',
    categories: ['Beachfront', 'Luxury Villas', 'Boutique Hotels'],
    image: 'photo-1571896349842-33c89424de2d',
    room: 'Deluxe Ocean Suite',
    description: 'A serene clifftop hideaway with a private infinity pool, warm Balinese hospitality, and sweeping views of the Indian Ocean.',
  },
  {
    slug: 'palm-jungle-retreat',
    name: 'Palm Jungle Retreat',
    shortName: 'Palm Jungle Retreat',
    area: 'Ubud, Bali',
    price: 142,
    rating: '4.95',
    reviews: 86,
    type: 'Private pool',
    categories: ['Luxury Villas', 'Cabins', 'Boutique Hotels'],
    image: 'photo-1533105079780-92b9be482077',
    room: 'Jungle Pool Villa',
    description: 'Wake up to birdsong in a leafy private villa, tucked between tropical gardens and the green heart of Ubud.',
  },
  {
    slug: 'lagoon-ocean-suite',
    name: 'Lagoon Oceanview Suite',
    shortName: 'Lagoon Oceanview Suite',
    area: 'Nusa Dua, Bali',
    price: 220,
    rating: '4.97',
    reviews: 104,
    type: 'Beachfront',
    categories: ['Beachfront', 'Luxury Villas', 'Boutique Hotels'],
    image: 'photo-1520250497591-112f2f40a3f4',
    room: 'Oceanview Suite',
    description: 'A bright, spacious resort suite just steps from turquoise water and the soft white sand of Nusa Dua.',
  },
  {
    slug: 'bamboo-hideaway',
    name: 'Bamboo Hideaway',
    shortName: 'Bamboo Hideaway',
    area: 'Ubud, Bali',
    price: 96,
    rating: '4.91',
    reviews: 72,
    type: 'Eco stay',
    categories: ['Cabins', 'City Apartments'],
    image: 'photo-1510798831971-661eb04b3739',
    room: 'Garden Room',
    description: 'Slow down in a thoughtfully designed eco stay surrounded by lush greenery and the sounds of the forest.',
  },
]

export const imageUrl = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

export function getDefaultDates() {
  const checkIn = new Date()
  checkIn.setDate(checkIn.getDate() + 17)
  const checkOut = new Date(checkIn)
  checkOut.setDate(checkOut.getDate() + 2)
  const toISO = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return { checkIn: toISO(checkIn), checkOut: toISO(checkOut) }
}
