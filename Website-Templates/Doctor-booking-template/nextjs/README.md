# Carewell Next.js

Next.js edition of the Carewell doctor-booking template. Public doctor pages and booking workflows use the same Carewell UI as the React edition and connect to the Express/MongoDB API.

## Run locally

```sh
copy .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_CAREWELL_API_URL` if the API is not at `http://localhost:5200/api`. Start the API first; see `../backend/README.md`. To enable online checkout, set the server-only `STRIPE_SECRET_KEY` and/or `PAYSTACK_SECRET_KEY` in `.env.local` and set `CAREWELL_PAYMENT_FULFILLMENT_SECRET` to the same private value configured in the API's `.env`. Never prefix payment secrets with `NEXT_PUBLIC_`. Checkout charges the appointment fee in USD; the Paystack account must support USD transactions. Pay at visit remains available without payment credentials. Run `npm run build` for a production build and `npm run typecheck` to check the TypeScript app-router files.

## Pages

- `/` — Carewell homepage
- `/doctors` and `/doctors/:slug` — provider directory and appointment requests
- `/login` and `/signup` — patient/provider authentication
- `/dashboard` — patient overview, upcoming visits, and appointment history
- `/dashboard/appointments` and `/dashboard/profile` — patient appointment filters and account details
- `/provider/dashboard` — provider overview and approval status
- `/provider/dashboard/schedule` and `/provider/dashboard/patients` — approved-provider schedule and appointment-linked patients
- `/provider/dashboard/profile` — edit the public doctor listing, upload a profile photo, and submit details for administrator review
- `/admin` and `/admin/login` — authenticated admin console

Admin, patient, and provider access are checked by the backend. Provider profile submissions and photos are stored by the API; only administrator-approved listings appear in the public directory and receive appointments. Dashboard requests use the API's HTTP-only session cookie. Patient ratings and comments are stored by the API and require a completed appointment. Stripe Checkout and Paystack are enabled independently when their server-only keys and the shared fulfillment secret are configured; successful payments are verified server-side before the appointment is saved.
