# PolarFlow HVAC — Vite

Vite storefront for PolarFlow HVAC. The React interface connects to the separate MVC API in `../backend`.

## Run locally

1. Start the API. Follow `../backend/README.md` and configure its `.env`.
2. Copy `.env.example` to `.env.local` and set `VITE_TECHNICIAN_API_URL` if the API is not at `http://localhost:5000/api`.
3. Run `npm install` and `npm run dev`.

Run `npm run lint` and `npm run build` to validate the frontend.

## Main routes

- `/` — Service overview and estimate calculator
- `/services` and `/services/:serviceId` — Service catalog and details
- `/maintenance` and `/membership/checkout` — Annual membership information and secure hosted checkout
- `/book`, `/checkout`, `/booking-confirmation` — Appointment request and confirmation
- `/portal/login`, `/portal/signup`, `/portal/dashboard` — Customer account and private dashboard
- `/admin/login`, `/admin/signup`, `/admin/dashboard` — Invitation-only administrator access and operations dashboard

Appointment requests are persisted by the API; no payment is collected for service visits. The Home Comfort Plan is $199 for one year, paid once through Stripe or Paystack when configured. It does not automatically renew.

See `../docs/BUYER-GUIDE.md` and the generated PDF for setup, API, payment, deployment and buyer information.
