# Kindred NGO API

Express API for the Vite and Next.js Kindred frontends. It stores donor accounts, campaigns and pledge records in MongoDB.

## Configure and run

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to a MongoDB database you control.
3. Replace `JWT_SECRET` with a private random value of at least 32 characters.
4. Set a private `ADMIN_SIGNUP_CODE` and keep it on the server only.
5. Set `ALLOWED_ORIGINS` to the exact deployed Vite/Next frontend origins.
6. Run `npm install`, then `npm run dev`.

The API listens on `PORT` (default `5000`) and exposes endpoints under `/api`. For local development, the default allowed origins are `http://localhost:5173` and `http://localhost:3000`.

## Role-protected endpoints

- Public: `GET /api/health`, `GET /api/public/campaigns`, donor signup/login
- Donor: `GET /api/client/dashboard`, `POST /api/client/donations`
- Admin: `GET /api/admin/dashboard`, `GET /api/admin/donations`, `PATCH /api/admin/donations/:id`

Donor records are scoped to the authenticated user. Admin creation requires the invitation code, and server middleware protects dashboard and pledge-management endpoints. Run `npm test` for API authorization, pledge validation and CORS tests.

## Payment limitation

Donation submissions are stored as pledges with `paymentStatus: "Not processed"`. The API does not accept or store payment-card details and does not charge donors. Connect a compliant payment provider and review required nonprofit, privacy and financial controls before accepting real donations.
