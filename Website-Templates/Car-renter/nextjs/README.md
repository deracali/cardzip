# Voltigo Rental — Next.js

Next.js, TypeScript, and Tailwind CSS port of the Voltigo React/Vite car rental UI. Screen components are split into `src/pages`, shared UI is in `src/components`, booking state is in `src/hooks`, and vehicle data is in `src/data`.

## Run locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run `npm run build` for a production build and `npm run typecheck` to check the TypeScript app.

## Routes

- `/` — Home and featured vehicles
- `/fleet` — Filterable vehicle fleet
- `/book` — Booking details and trip summary
- `/checkout` — Demo reservation checkout
- `/login` and `/signin` — Account sign-in preview
- `/signup` and `/register` — Account registration preview

Sign-up forms and checkout are front-end previews; no accounts or payments are processed.
