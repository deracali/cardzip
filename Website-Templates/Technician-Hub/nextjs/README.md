# PolarFlow HVAC — Next.js

Native Next.js App Router frontend for the PolarFlow HVAC template. The interface uses its own Next.js routes and components and calls the separate PolarFlow API.

## Run locally

1. Start the API in `../backend` after configuring its `.env`.
2. Copy `.env.example` to `.env.local`.
3. Run `npm install` and `npm run dev`.

The default API URL is `http://localhost:5000/api`. Set `NEXT_PUBLIC_TECHNICIAN_API_URL` if the API runs elsewhere.

Customer pages include service booking, the customer portal and the annual Home Comfort Plan checkout. Administrator pages include sign-in, invitation-only account registration and an operations dashboard. API role checks protect dashboard data and mutations regardless of frontend route.

Run `npm run typecheck` and `npm run build` before deployment. See the parent README for the full backend, payment-provider and setup guide.
