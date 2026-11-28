# Escapes Travel Stay — Next.js

Independent Next.js App Router frontend for the Escapes Travel Stay template. Each route in `app/` selects its own screen; reusable components are in `src/components/` and screen modules are in `src/screens/`. This app does not import the Vite router or Vite app entry point.

## Run locally

1. Start the API in `../backend` after configuring its `.env`.
2. Copy `.env.example` to `.env.local`.
3. Run `npm install` and `npm run dev`.

The default API URL is `http://localhost:5000/api`; set `NEXT_PUBLIC_API_BASE_URL` when the API uses another origin. Browser-dependent screens are loaded on the client to avoid server-rendering `window` access. Screen files stay outside the reserved `pages/` directory so this project uses only the App Router.

The frontend includes stay discovery, booking checkout, guest signup/sign-in, and API-backed client and invitation-only admin dashboards. Guest overview, reservations, saved stays, and profile are separate routes. Admin overview, reservations, property listings, guest accounts, payments, reports, and settings are separate routes under `/admin`. Administrators can add properties with a nightly rate and HTTPS photo URL; the API stores them and exposes them in stay discovery and detail/booking routes. Reservation reads and admin changes are authorized by the backend, not only by frontend route visibility.

Paystack hosted checkout is initialized and verified by the backend. Set `PAYSTACK_SECRET_KEY` and `PAYSTACK_SUPPORTED_CURRENCIES=USD` in the Travel Stay backend’s private `.env` (see `../backend/.env.example`), then set `FRONTEND_URL` and `ALLOWED_ORIGINS` for the deployed Next.js site. Never put the Paystack secret in `.env.local` or a `NEXT_PUBLIC_` variable. The browser only receives the hosted checkout URL; payment return and webhook signatures are verified server-side.

Run `npm run typecheck` and `npm run build` before deployment. See the parent README and `../docs/BUYER-GUIDE.md` for complete setup and buyer details.
