# Sizzle&Smile API

The Express API manages client accounts, demo orders, and the admin dashboard. Client and admin access is enforced by bearer-token middleware on the server; the dashboard UI is not treated as an access control boundary.

See the [buyer guide](../docs/buyer-guide.md) for the full product overview, frontend setup, and demo-order limitations.

## Structure

- `models/store.js` stores application state in MongoDB and provides an isolated file store for tests.
- `controllers/` contains auth, client, admin, and public request handlers.
- `routes/api-routes.js` maps endpoints and applies role middleware.
- `middleware/auth.js` verifies tokens against current users and enforces the `client` and `admin` roles.
- `services/auth-service.js` hashes passwords and signs/verifies short-lived tokens.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI`, `JWT_SECRET` (at least 32 random characters), `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (12-128 characters).
3. Set `ALLOWED_ORIGINS` to the exact frontend origins.
4. Set `PAYSTACK_SECRET_KEY` to a Paystack test or live secret, `PAYSTACK_CURRENCY=NGN`, and `PAYSTACK_CALLBACK_URL` to the Next.js `/payment/return` URL. Keep the secret key only in the backend environment.
5. Start MongoDB, then run `npm install` and `npm run dev`.

For Atlas `mongodb+srv://` connections, `MONGODB_DNS_SERVERS` can optionally be set to comma-separated DNS server IPs if the machine's configured resolver refuses SRV lookups. Leave it empty to use the system DNS settings.

The API listens on port `5000`. The first administrator is seeded from the environment; there is no public admin signup route. Client signup is open, but newly registered accounts can only access client routes.

## Protected routes

- `GET /api/client/dashboard`, `POST /api/client/payments/initialize`, and `POST /api/client/payments/verify` require a signed-in client.
- `GET /api/admin/dashboard`, `GET /api/admin/orders`, and `PATCH /api/admin/orders/:id` require a signed-in administrator.
- `GET /api/auth/me` and `POST /api/auth/logout` require a valid session token.
- `POST /api/payments/paystack/webhook` accepts signed Paystack events and verifies each transaction before marking its order paid. Configure this URL in Paystack and subscribe to `charge.success`.

The API calculates prices from its server-side menu and keeps orders pending until Paystack confirms the exact amount, currency, reference, and customer. Card data is entered only on Paystack-hosted checkout and is never handled or stored by this API. Admin fulfillment updates are limited to paid orders.

## Frontends

Vite is a local-only demo. Next.js reads `NEXT_PUBLIC_FOOD_API_URL` (default `http://localhost:5000/api`) and `NEXT_PUBLIC_PAYSTACK_CURRENCY=NGN` to match the backend. Menu values are charged as NGN at the same numeric amounts; no foreign-exchange conversion is performed. Use HTTPS and Paystack live credentials only after testing the callback and webhook flow.

Run backend tests with `npm test`. Tests use a temporary file store and do not require MongoDB or a live Paystack account.
