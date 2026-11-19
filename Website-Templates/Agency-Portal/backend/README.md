# NOVA Studio API

The API persists account, project, client, team, invoice, inquiry, settings, and message data in MongoDB. It does not seed demo records or fall back to a local JSON file.

## Backend structure

- `models/store.js` owns MongoDB and test-store persistence.
- `controllers/` contains auth, client, public, and admin request handlers.
- `routes/api-routes.js` maps API paths to controllers.
- `middleware/auth.js` provides authenticated-user and admin access checks.
- `services/` contains password hashing and token operations.
- `utils/http.js` contains request validation and shared HTTP helpers.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to your MongoDB connection string, `JWT_SECRET` to a random secret of at least 32 characters, and `ADMIN_SIGNUP_CODE` to a private invitation code. If system DNS refuses Atlas SRV requests, the API retries SRV and cluster-host lookups with Cloudflare and Google DNS. Set `MONGODB_DNS_SERVERS` to a comma-separated list if your network requires specific resolvers.
3. Start MongoDB, then run `npm install` and `npm run dev`.

The API refuses to start if `MONGODB_URI` is missing or MongoDB cannot be reached. Client registration is available at `/api/auth/signup`. Admin registration at `/api/auth/admin-signup` requires the invitation code. Password reset email delivery requires the optional SMTP settings.

The Next.js app uses `NEXT_PUBLIC_AGENCY_API_URL` to locate this API; its default is `http://localhost:5000/api`.
