# Escapes Travel Stay

A responsive travel booking experience built with React and Vite.

## Run locally

```sh
npm install
npm run dev
```

## Pages

- `/` — home, stay styles, featured properties, and destination search
- `/stays` — searchable and filterable stay results
- `/stays/azure-breeze` — property details and room choices
- `/reserve/azure-breeze` — date selection and reservation estimate
- `/checkout` — guest details and checkout preview
- `/signin` and `/signup` — account form previews
- `/admin/login` and `/admin/signup` — administrator authentication
- `/admin/dashboard`, `/admin/reservations`, `/admin/stays`, and `/admin/guests` — separate operations pages
- `/destinations`, `/experiences`, `/list-property`, `/support`, and `/about` — linked discovery and information pages

Property pages are also available for `palm-jungle-retreat`, `lagoon-ocean-suite`, and `bamboo-hideaway`.

## Source structure

- `src/pages/` contains the home, stays, property detail, reservation, checkout, account, and explore pages.
- `src/components/` contains shared navigation, footer, page shell, search, logo, and stay-card components.
- `src/data/stays.js` contains stay listings, image helpers, and reservation date defaults.
- `src/App.jsx` maps browser paths to page components.

## Local demo data

Vite stores demo accounts, reservation requests, property listings, and admin updates in localStorage. The first admin signup invitation is `ESCAPES-LOCAL-ADMIN`; it is a client-side demo check, not production access control. Admins can add stays from `/admin/stays` with an HTTPS image URL. Reservation requests remain unconfirmed and no payment is collected. This browser-only demo is not suitable for real customer data or production bookings. The Next.js app stores property listings through the API. The hero image is bundled locally at `public/hero-resort.jpg`; property gallery photos load from Unsplash.
