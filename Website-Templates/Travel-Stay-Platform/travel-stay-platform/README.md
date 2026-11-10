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
- `/destinations`, `/experiences`, `/list-property`, `/support`, and `/about` — linked discovery and information pages

Property pages are also available for `palm-jungle-retreat`, `lagoon-ocean-suite`, and `bamboo-hideaway`.

## Source structure

- `src/pages/` contains the home, stays, property detail, reservation, checkout, account, and explore pages.
- `src/components/` contains shared navigation, footer, page shell, search, logo, and stay-card components.
- `src/data/stays.js` contains stay listings, image helpers, and reservation date defaults.
- `src/App.jsx` maps browser paths to page components.

## Integration notes

Checkout is a front-end preview only. Payment card inputs are disabled and no payment or reservation is submitted. Connect a payment provider and booking service before accepting real payments or bookings. The hero image is bundled locally at `public/hero-resort.jpg`; property gallery photos load from Unsplash.
