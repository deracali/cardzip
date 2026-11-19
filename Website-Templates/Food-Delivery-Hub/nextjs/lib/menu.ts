export type Dish = {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  rating: string;
  category: string;
  time: string;
  badge: string;
  photo: string;
  description: string;
};

export const dishes: Dish[] = [
  { id: "burger", name: "Smoky Truffle Burger", restaurant: "Burger Barn · American", price: 14.99, rating: "4.8", category: "Burgers", time: "20-30 min", badge: "20% OFF", photo: "photo-1568901346375-23c9450c58cd", description: "Smoked cheddar, truffle aioli, crisp lettuce and house brioche." },
  { id: "sushi", name: "Salmon Sushi Set (16 pc)", restaurant: "Tokyo House · Japanese", price: 22.5, rating: "4.9", category: "Sushi", time: "25-35 min", badge: "", photo: "photo-1579871494447-9811cf80d66c", description: "Fresh salmon nigiri and signature rolls with ginger and wasabi." },
  { id: "pizza", name: "Margherita Artigianale", restaurant: "Forno Antico · Italian", price: 13.99, rating: "4.7", category: "Pizza", time: "15-25 min", badge: "Popular", photo: "photo-1574071318508-1cdbab80d002", description: "San Marzano tomato, fior di latte, basil and olive oil." },
  { id: "bowl", name: "Rainbow Buddha Bowl", restaurant: "Verdant · Healthy", price: 11.49, rating: "4.8", category: "Healthy", time: "10-20 min", badge: "", photo: "photo-1512621776951-a57141f2eefd", description: "Quinoa, avocado, roasted vegetables, chickpeas and lemon tahini." },
  { id: "curry", name: "Butter Chicken + Naan", restaurant: "Spice Route · Indian", price: 15.99, rating: "4.9", category: "Asian", time: "25-35 min", badge: "", photo: "photo-1603894584373-5ac82b2ae398", description: "Slow-simmered tomato curry with warm garlic naan." },
  { id: "cake", name: "Molten Lava Cake", restaurant: "Sugar Rush · Desserts", price: 7.99, rating: "4.8", category: "Desserts", time: "15-20 min", badge: "Bestseller", photo: "photo-1606313564200-e75d5e30476c", description: "Warm dark chocolate cake with a gooey center and vanilla cream." },
  { id: "shrimp", name: "Shrimp Pad Thai", restaurant: "Bangkok Nights · Thai", price: 13.49, rating: "4.6", category: "Asian", time: "20-30 min", badge: "", photo: "photo-1559314809-0d155014e29e", description: "Rice noodles, wok-fried shrimp, peanuts, lime and bean sprouts." },
  { id: "tacos", name: "Baja Chicken Tacos (3)", restaurant: "Casa Lola · Mexican", price: 10.99, rating: "4.7", category: "Asian", time: "15-25 min", badge: "", photo: "photo-1551504734-5ee1c4a1479b", description: "Grilled chicken, avocado crema, cabbage and pico de gallo." },
  { id: "truffle-pasta", name: "Truffle Tagliatelle", restaurant: "Forno Antico · Italian", price: 19.5, rating: "4.9", category: "Main Courses", time: "20-30 min", badge: "", photo: "photo-1473093295043-cdd812d0e601", description: "Hand-cut pasta, black truffle cream and parmesan." },
  { id: "lasagna", name: "Nonna's Lasagna", restaurant: "Forno Antico · Italian", price: 16.99, rating: "4.8", category: "Main Courses", time: "25-35 min", badge: "", photo: "photo-1574894709920-11b28e7367e3", description: "Slow-braised ragù, béchamel and a golden cheese crust." },
  { id: "salmon", name: "Grilled Salmon Limone", restaurant: "Forno Antico · Italian", price: 21.99, rating: "4.8", category: "Main Courses", time: "25-35 min", badge: "", photo: "photo-1467003909585-2f8a72700288", description: "Fresh salmon, charred lemon, herbs and grilled asparagus." },
  { id: "eggplant", name: "Eggplant Parmigiana", restaurant: "Forno Antico · Italian", price: 14.5, rating: "4.7", category: "Main Courses", time: "20-30 min", badge: "Vegan", photo: "photo-1476124369491-e7addf5db371", description: "Roasted eggplant, house marinara and basil." },
  { id: "diavola", name: "Diavola + Hot Honey", restaurant: "Forno Antico · Italian", price: 15.99, rating: "4.8", category: "Main Courses", time: "15-25 min", badge: "", photo: "photo-1571407970349-bc81e7e96d47", description: "Spicy salami, calabrian chili, hot honey and mozzarella." },
];

export const imageUrl = (photo: string, width = 720) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`;
