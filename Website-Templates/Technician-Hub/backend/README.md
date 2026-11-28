# PolarFlow HVAC API

Express API organized using MVC. It persists accounts, appointment requests and memberships in MongoDB. Provider secrets are read only by the API and are never sent to either frontend.

## Structure

- `models/store.js` — MongoDB application-state persistence and an in-memory test store
- `controllers/` — Authentication, booking and membership handlers
- `routes/api-routes.js` — API route mapping and role middleware
- `middleware/auth.js` — Signed-token authentication and customer/admin authorization
- `services/` — Password hashing, token signing and payment-provider communication
- `utils/http.js` — Request validation, rate limiting and HTTP errors
- `server.js` — CORS, raw webhook routes, JSON handling and server startup

## Configure and run

Copy `.env.example` to `.env`; do not commit `.env`. Set:

- `MONGODB_URI` to the production MongoDB connection string.
- `JWT_SECRET` to a random secret of at least 32 characters.
- `ADMIN_SIGNUP_CODE` to a private, high-entropy invitation code.
- `ALLOWED_ORIGINS` to the exact Vite and/or Next.js browser origins.
- `FRONTEND_URL` to the frontend origin used for payment return URLs.

`npm install` and `npm run dev` start the API on port `5001` by default, keeping it separate from other local template APIs. A legacy `PORT=5000` setting is remapped to port `5001`. The API refuses to start without MongoDB and a signing secret.

## Roles and routes

Public customer signup creates only the `client` role. Admin signup requires `ADMIN_SIGNUP_CODE`; there is no public admin bootstrap. Every client dashboard and membership operation requires a valid customer token. Admin dashboards and booking status changes require the admin role.

- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/admin-signup`
- `POST /api/public/bookings`
- `GET /api/client/dashboard`
- `GET /api/client/membership/providers`
- `POST /api/client/membership/checkout`, `POST /api/client/membership/verify`
- `GET /api/admin/dashboard`, `PATCH /api/admin/bookings/:id`
- `POST /api/webhooks/stripe`, `POST /api/webhooks/paystack`

Bookings submitted with a valid customer token are linked to that account. Guest bookings are not linked to an account based only on the submitted email. Customer dashboard responses include only explicitly linked bookings; the admin API can view and update all requests.

## Membership payments

The annual Home Comfort Plan is fixed server-side at USD 199. The browser cannot set the amount. The API initializes hosted Stripe/Paystack checkout and activates membership only after server-side provider verification of the reference, amount, currency and membership order. Signed webhooks provide an additional confirmation path. Membership lasts 365 days from verified payment and is not set to renew automatically.

Keep all secret fields in `.env` server-only. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_SUPPORTED_CURRENCIES=USD` for Stripe. Configure `PAYSTACK_SECRET_KEY` and `PAYSTACK_SUPPORTED_CURRENCIES=USD` only if the merchant account is approved to accept USD. All provider key fields in `.env.example` are intentionally empty. Test against provider sandbox accounts before using live mode.

Run `npm test` for API authorization, booking-price, provider-availability and payment-verification tests.
