# PulseLive API

The Express API persists PulseLive accounts, events, booking requests, and platform settings in MongoDB. Its controllers contain request handling, `routes/api-routes.js` maps endpoints, `src/models/` defines MongoDB documents, and `src/middleware/` handles authenticated role access.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to a MongoDB database URL and `JWT_SECRET` to a random secret of at least 32 characters.
3. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to seed the first administrator. The password must be 12-128 characters.
4. Set `ALLOWED_ORIGINS` to the exact frontend origins, separated by commas.
5. Run `npm install` and `npm run dev`.

The API listens on port `5400` by default. It requires MongoDB and refuses to start without `MONGODB_URI` or a sufficiently long `JWT_SECRET`. If system DNS refuses a MongoDB Atlas SRV lookup, startup retries using `MONGODB_DNS_SERVERS` (Cloudflare and Google DNS by default); override those with DNS resolvers permitted by your network. If your network blocks external DNS, use an Atlas standard `mongodb://` connection string or allow the configured resolvers. In production, set `NODE_ENV=production` and configure `ALLOWED_ORIGINS` without localhost origins.

## API routes

| Area | Routes |
| --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Public events | `GET /api/events`, `GET /api/events/:slug` |
| Attendee bookings | `POST /api/bookings/checkout`, `POST /api/bookings/verify`, `GET /api/bookings/mine` |
| Payment configuration | `GET /api/payments/providers` |
| Payment webhooks | `POST /api/webhooks/paystack`, `POST /api/webhooks/stripe` |
| Organizer workspace | `GET /api/organizer/events`, `GET /api/organizer/bookings`, `POST /api/organizer/events` |
| Admin workspace | `GET /api/admin/summary`, plus event, booking, organizer, attendee, and settings management endpoints |

Authentication uses an HTTP-only session cookie. Organizer tools require an approved organizer account; administrative tools require the seeded admin account.

## Frontend connection

Both `../event-hub` (Vite) and `../nextjs` (Next.js) use the same PulseLive React app. They run in local demo mode by default. Add `?mode=api` to the frontend URL to connect to this API; set `VITE_API_BASE_URL` for Vite or `NEXT_PUBLIC_EVENT_HUB_API_URL` for Next.js when using a non-default API URL.

## Online ticket payments

The Next.js checkout uses hosted Paystack or Stripe checkout. Configure the provider credentials only in this backend's private `.env`; never expose them in Next.js `NEXT_PUBLIC_*` variables. Set `EVENT_HUB_FRONTEND_URL` to the exact Next.js site origin, then configure:

- Paystack: `PAYSTACK_SECRET_KEY`, optional `PAYSTACK_WEBHOOK_SECRET` (defaults to the Paystack secret key), and `PAYSTACK_SUPPORTED_CURRENCIES=USD` only if the merchant account accepts USD.
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_SUPPORTED_CURRENCIES=USD`.

Provider checkout is offered only when all required secrets and an explicit USD support declaration are present. Event prices are stored in dollars and charged in USD cents. The backend derives the amount from the event, ticket type, and quantity; verifies provider status, reference, amount, and currency before confirming a booking; and verifies signed webhooks. Browser redirects alone never confirm tickets. Vite remains a localStorage-only demo and does not collect payment.
