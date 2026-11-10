# Kindred NGO

A responsive nonprofit giving site built with React and Vite.

## Run locally

```sh
npm install
npm run dev
```

## Pages

- `/` — home page, impact statistics, campaigns, and donation widget
- `/causes` — searchable, filterable campaign list
- `/causes/clean-water-schools`, `/causes/classrooms-teachers`, `/causes/mobile-clinics` — project details, updates, volunteer form, and donation widget
- `/checkout` and `/donate` — donation checkout preview
- `/signin`, `/signup`, `/about`, `/impact`, `/ways-to-give`, `/volunteer`, `/support`, `/privacy` — account and information pages

## Project structure

- `src/pages/` contains individual route page components.
- `src/components/` contains shared navigation, footer, donation, and campaign components.
- `src/data/campaigns.js` contains project data and shared donation formatting.
- `src/App.jsx` maps browser paths to their page components.

## Payment integration

Checkout is a front-end preview. Payment fields are disabled and no payment or donation is submitted. Connect a payment provider and donation service before accepting real donations. Campaign photographs are bundled locally in `public/`.
