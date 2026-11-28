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
- `/client/dashboard`, `/client/reservations`, `/client/saved`, and `/client/profile` — separate guest pages
- `/admin/dashboard`, `/admin/reservations`, `/admin/stays`, `/admin/guests`, `/admin/payments`, `/admin/reports`, and `/admin/settings` — separate operations pages
- `/destinations`, `/experiences`, `/list-property`, `/support`, and `/about` — linked discovery and information pages

Property pages are also available for `palm-jungle-retreat`, `lagoon-ocean-suite`, and `bamboo-hideaway`.

## Source structure

- `src/pages/` contains the home, stays, property detail, reservation, checkout, account, and explore pages.
- `src/components/` contains shared navigation, footer, page shell, search, logo, and stay-card components.
- `src/data/stays.js` contains stay listings, image helpers, and reservation date defaults.
- `src/App.jsx` maps browser paths to page components.

## Local demo data

Vite runs entirely from bundled sample content and browser localStorage; it does not call the API or collect payments. Demo guest: `guest@escapes.demo` / `EscapesDemoGuest2026!`. Demo admin: `admin@escapes.demo` / `EscapesDemoAdmin2026!`. The first additional admin signup invitation is `ESCAPES-LOCAL-ADMIN`. These browser-only accounts are for preview only, not production access control. New guest accounts receive clearly labeled sample reservations. Admin-created stays and status changes remain in the browser. The Next.js app uses the API for live accounts, stays, reservations, and payment checkout. The hero image is bundled locally at `public/hero-resort.jpg`; property gallery photos load from Unsplash.
