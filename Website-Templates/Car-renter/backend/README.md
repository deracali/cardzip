# Voltigo Express + MongoDB API

The shared backend for the Voltigo Next.js website. The Vite website can run in its separate browser-only localStorage demo mode.

## Requirements

- Node.js 20.19 or later and npm
- MongoDB Community Server or MongoDB Atlas
- Cloudinary account for administrator vehicle-photo uploads

## Configure and run

In Windows Command Prompt:

```bat
cd /d "C:\path\to\Car-renter\backend"
copy .env.example .env
notepad .env
npm install
npm run dev
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, an `ADMIN_EMAIL`, an `ADMIN_PASSWORD` of at least 12 characters, and the website origins in `ALLOWED_ORIGINS`. `MONGODB_DNS_SERVERS` optionally specifies DNS servers for MongoDB Atlas SRV records and server-host lookups; the backend uses these resolvers for both SRV discovery and MongoDB socket connections rather than relying solely on Windows `getaddrinfo`. Use resolvers approved for your network. If the configured Atlas SRV record returns a host that those DNS servers cannot resolve, copy a fresh connection string from the Atlas Connect dialog and verify the cluster is active. The first successful database connection seeds an administrator but does not add demo vehicles. It disables any legacy static Unsplash vehicle listings while preserving their reservation records. Add real fleet listings from the administrator portal using Cloudinary photos. Keep `.env` private.

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for uploads. The server validates and limits uploaded images and creates signed Cloudinary uploads on behalf of administrators.

## Routes

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/vehicles`, `POST /api/vehicles`, `PATCH /api/vehicles/:id`, `DELETE /api/vehicles/:id`
- `POST /api/vehicles/upload` — administrator-only signed Cloudinary photo upload
- `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/:id`
- `GET /api/admin/summary`
- `GET /health`

Authentication uses an HTTP-only JWT cookie. Passwords are stored as bcrypt hashes. Administrator-only operations check the database role. Keep HTTPS enabled, set exact production website origins, use secure cookie settings, and store secrets in the hosting provider's secret manager.

## Important

This starter's MongoDB availability check is suitable for the reservation-request demo; it is not a guaranteed atomic booking lock for simultaneous production traffic. Before accepting real bookings or payments, implement transactional/atomic vehicle reservations, payment-provider integration, audited authorization, and locally reviewed rental agreements, insurance, cancellation, and privacy terms.
