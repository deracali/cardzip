export type Vehicle = {
  name: string;
  category: string;
  label: string;
  price: number;
  details: string;
  seats: number;
  fuel: string;
  image: string;
};

export type Booking = {
  vehicle: Vehicle;
  pickup: string;
  dropoff: string;
  start: string;
  end: string;
  days: number;
  coverage: boolean;
};
export const vehicles: Vehicle[] = [
  {
    name: 'Apex Cruiser X5',
    category: 'SUV',
    label: 'Most rented',
    price: 89,
    details: '2024 · Hybrid · 4-person ready',
    seats: 5,
    fuel: 'Auto',
    image: 'photo-1492144534655-ae79c964c9d7',
  },
  {
    name: 'City Swift Sedan',
    category: 'Sedan',
    label: '',
    price: 64,
    details: '2024 · Hybrid · Airport ready',
    seats: 5,
    fuel: 'Auto',
    image: 'photo-1552519507-da3b142c6e3d',
  },
  {
    name: 'Metro Cargo Van',
    category: 'Cargo Van',
    label: 'Logistics pick',
    price: 98,
    details: '2024 · Hybrid · Airport ready',
    seats: 2,
    fuel: 'Auto',
    image: 'photo-1566933293069-b55c7f326dd4',
  },
  {
    name: 'Volt Urban EV',
    category: 'Sedan',
    label: 'Electric',
    price: 62,
    details: '2024 · Hybrid · Airport ready',
    seats: 5,
    fuel: 'Electric',
    image: 'photo-1503376780353-7e6692767b70',
  },
  {
    name: 'Trailblazer 4x4',
    category: 'SUV',
    label: '',
    price: 112,
    details: '2024 · Hybrid · 4-person ready',
    seats: 5,
    fuel: 'Auto',
    image: 'photo-1519641471654-76ce0107ad1b',
  },
  {
    name: 'Hauler Max XL',
    category: 'Cargo Van',
    label: 'High volume',
    price: 124,
    details: '2024 · Hybrid · Airport ready',
    seats: 3,
    fuel: 'Auto',
    image: 'photo-1601584115197-04ecc0da31d7',
  },
]

export const imageUrl = (id: string, width = 1000): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`
