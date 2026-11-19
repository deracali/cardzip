# Lumière Salon API

The API stores client accounts and appointment requests in MongoDB. Client signup always creates a client account. Admin access is seeded from private environment configuration; public signup cannot create administrators. Client ownership and admin permissions are checked by the API on every protected request.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI`, `JWT_SECRET` (at least 32 characters in production), `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` (at least 12 characters).
3. Start MongoDB, then run `npm install` and `npm run dev`.

The API listens on port `5600` by default. Configure `ALLOWED_ORIGINS` for the Vite and Next.js website origins. If the configured admin email already belongs to a client, startup stops rather than silently elevating that account. The admin password is only used when the admin account is first seeded.

## Protected endpoints

- `POST /api/auth/signup`, `POST /api/auth/login`, and `GET /api/auth/me`
- `POST /api/client/appointments` and `GET /api/client/dashboard` require a client bearer token.
- `GET /api/admin/dashboard` and `PATCH /api/admin/appointments/:id` require an admin bearer token.

Appointment prices and accepted service/stylist/time values come from the API catalog. Submitted requests are not confirmed until an administrator changes their status. The API tests use an isolated in-memory store and do not require MongoDB.

Run `npm test` for authorization, client isolation, price validation, and status-update tests.
