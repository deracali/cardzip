# Lumière Salon API

The API stores client accounts and appointment requests in MongoDB. Client signup always creates a client account. Admin access is seeded from private environment configuration; public signup cannot create administrators. Client ownership and admin permissions are checked by the API on every protected request.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI`, `JWT_SECRET` (at least 32 characters in production), `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD` (at least 12 characters), and `PAYMENT_PROOF_SECRET` (a random secret of at least 32 characters, shared with the Next.js app).
3. Start MongoDB, then run `npm install` and `npm run dev`.

The API listens on port `5600` by default. Configure `ALLOWED_ORIGINS` for the Next.js website origin. If the configured admin email already belongs to a client, startup stops rather than silently elevating that account. The admin password is only used when the admin account is first seeded. Default services and stylists are inserted when the API initializes their catalogues; later admin edits are preserved.

If Node's system resolver refuses a MongoDB Atlas SRV lookup (`querySrv ECONNREFUSED`), startup retries once using Cloudflare and Google DNS (`1.1.1.1` and `8.8.8.8`). This sends the Atlas hostname lookup to those public DNS providers. To use different trusted resolvers, set `MONGODB_DNS_SERVERS` to comma-separated resolver IPs in `.env`; an explicit setting disables the automatic fallback. Other connection errors are reported without retrying.

## API endpoints

- `POST /api/auth/signup`, `POST /api/auth/login`, and `GET /api/auth/me`
- `GET /api/services` and `GET /api/stylists` return the active public catalogues.
- `POST /api/client/appointments` and `GET /api/client/dashboard` require a client bearer token. Appointment creation additionally requires a valid server-signed Paystack payment proof.
- `GET /api/admin/dashboard`, `PATCH /api/admin/appointments/:id`, `/api/admin/services`, and `/api/admin/stylists` require an admin bearer token. Admins can add and edit services, prices, stylists, and appointment statuses.

Appointment service and stylist details are read from the database catalogue. The API tests use an isolated in-memory store and do not require MongoDB.

Run `npm test` for authorization, client isolation, price validation, and status-update tests.
