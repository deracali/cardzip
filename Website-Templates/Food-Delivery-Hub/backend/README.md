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
3. Set `ALLOWED_ORIGINS` to the exact Vite and Next.js frontend origins.
4. Start MongoDB, then run `npm install` and `npm run dev`.

The API listens on port `5000`. The first administrator is seeded from the environment; there is no public admin signup route. Client signup is open, but newly registered accounts can only access client routes.

## Protected routes

- `GET /api/client/dashboard` and `POST /api/client/orders` require a signed-in client.
- `GET /api/admin/dashboard`, `GET /api/admin/orders`, and `PATCH /api/admin/orders/:id` require a signed-in administrator.
- `GET /api/auth/me` and `POST /api/auth/logout` require a valid session token.

Orders are demo records. The API calculates prices from its server-side menu list and never accepts card numbers, CVVs, or payment data. No payment is processed.

## Frontends

Vite and Next.js use the same React UI. Vite reads `VITE_API_BASE_URL`; Next.js reads `NEXT_PUBLIC_FOOD_API_URL`. Both default to `http://localhost:5000/api`.

Run backend tests with `npm test`. Tests use a temporary file store and do not require MongoDB.
