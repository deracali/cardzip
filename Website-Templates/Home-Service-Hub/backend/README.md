# FixFlow Pro API

The Express API manages client accounts, home-service requests, and administrator status updates. Access control is enforced on the server for every protected client or admin endpoint.

See the [buyer guide](../docs/buyer-guide.md) for the product overview, frontend setup, role access, and limitations.

## Structure

- `models/store.js` owns MongoDB persistence and the isolated file-backed test store.
- `controllers/` contains auth, client, admin, and public handlers.
- `routes/api-routes.js` maps API paths to the controllers and role middleware.
- `middleware/auth.js` verifies tokens against current users and checks roles.
- `services/auth-service.js` hashes passwords and signs/verifies short-lived tokens.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI`, `JWT_SECRET` (at least 32 random characters), `ADMIN_EMAIL`, a unique `ADMIN_PASSWORD` (12-128 characters), and `ALLOWED_ORIGINS` to the exact Next.js frontend origin. Paystack is optional; for hosted payments configure `PAYSTACK_SECRET_KEY` privately, `PAYSTACK_CURRENCY=USD`, and `PAYSTACK_CALLBACK_URL` to the Next.js `/payment/return` URL.
3. Start MongoDB, then run `npm install` and `npm run dev`.

For `mongodb+srv://` connections, the backend uses public DNS resolvers to resolve Atlas records. Set `MONGODB_DNS_SERVERS` to a comma-separated DNS server list to override them.

The API listens on port `5200` by default and refuses to start without a valid MongoDB connection, JWT secret, and administrator configuration. Public signup creates client accounts only; administrator accounts are seeded from the backend environment.

## Protected routes

- `GET /api/client/dashboard` and `POST /api/client/appointments` require a signed-in client.
- `POST /api/client/payments/initialize` and `POST /api/client/payments/verify` require the owning client session.
- `POST /api/payments/paystack/webhook` validates the Paystack signature and verifies successful transactions server-side.
- `GET /api/admin/dashboard` and `PATCH /api/admin/appointments/:id` require a signed-in administrator.
- `GET /api/auth/me` and `POST /api/auth/logout` require a valid session token.

The server validates service types and visit urgency and calculates estimates from its own service catalog; clients cannot set their own account role or quoted price. Paystack amounts are calculated from the saved server-side estimate in minor units, and transaction amount, currency, reference, status, and customer email are checked before payment is marked paid. The API does not process or store card details.

## Frontends and tests

The Vite edition is a standalone localStorage demo and does not use this API. Next.js reads `NEXT_PUBLIC_HOME_SERVICE_API_URL`, defaulting to `http://localhost:5200/api`. Use USD for Paystack while the UI displays dollar-denominated quotes; production callback URLs must use HTTPS. Never expose the Paystack secret to the Next.js browser bundle.

Run API tests with `npm test`. Tests use a temporary file store and do not require MongoDB.
