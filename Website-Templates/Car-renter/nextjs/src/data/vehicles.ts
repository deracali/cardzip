export type Vehicle = {
  id?: string;
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

export const imageUrl = (id: string, width = 1000): string => {
  if (!id) return "";
  if (id.startsWith("https://res.cloudinary.com/")) return id;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
};
