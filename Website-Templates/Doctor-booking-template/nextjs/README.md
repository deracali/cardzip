# Carewell Next.js

Next.js edition of the Carewell doctor-booking template. Public doctor pages and booking workflows use the same Carewell UI as the React edition and connect to the Express/MongoDB API.

## Run locally

```sh
copy .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_CAREWELL_API_URL` if the API is not at `http://localhost:5200/api`. Start the API first; see `../backend/README.md`. Run `npm run build` for a production build and `npm run typecheck` to check the TypeScript app-router files.

## Pages

- `/` — Carewell homepage
- `/doctors` and `/doctors/:slug` — provider directory and appointment requests
- `/login` and `/signup` — patient/provider authentication
- `/dashboard` — authenticated patient appointments
- `/provider/dashboard` — approved provider schedule
- `/admin` and `/admin/login` — authenticated admin console

Admin, patient, and provider access are checked by the backend. Provider accounts require admin approval and doctor-profile assignment before the provider schedule is available. The checkout UI is a preview and does not process payments.
