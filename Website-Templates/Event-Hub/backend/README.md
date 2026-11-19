# PulseLive API

The Express API persists PulseLive accounts, events, booking requests, and platform settings in MongoDB. Its controllers contain request handling, `routes/api-routes.js` maps endpoints, `src/models/` defines MongoDB documents, and `src/middleware/` handles authenticated role access.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to a MongoDB database URL and `JWT_SECRET` to a random secret of at least 32 characters.
3. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to seed the first administrator. The password must be 12-128 characters.
4. Set `ALLOWED_ORIGINS` to the exact frontend origins, separated by commas.
5. Run `npm install` and `npm run dev`.

The API listens on port `5400` by default. It requires MongoDB and refuses to start without `MONGODB_URI` or a sufficiently long `JWT_SECRET`. In production, set `NODE_ENV=production` and configure `ALLOWED_ORIGINS` without localhost origins.

## API routes

| Area | Routes |
| --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Public events | `GET /api/events`, `GET /api/events/:slug` |
| Attendee bookings | `POST /api/bookings`, `GET /api/bookings/mine` |
| Organizer workspace | `GET /api/organizer/events`, `GET /api/organizer/bookings`, `POST /api/organizer/events` |
| Admin workspace | `GET /api/admin/summary`, plus event, booking, organizer, attendee, and settings management endpoints |

Authentication uses an HTTP-only session cookie. Organizer tools require an approved organizer account; administrative tools require the seeded admin account.

## Frontend connection

Both `../event-hub` (Vite) and `../nextjs` (Next.js) use the same PulseLive React app. They run in local demo mode by default. Add `?mode=api` to the frontend URL to connect to this API; set `VITE_API_BASE_URL` for Vite or `NEXT_PUBLIC_EVENT_HUB_API_URL` for Next.js when using a non-default API URL.

The current checkout records a booking request only. It does not collect payment or issue a ticket; connect a payment provider and ticket issuer before using the platform for live sales.
