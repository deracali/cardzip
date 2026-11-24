# Carewell Booking API

## Local setup

```powershell
copy .env.example .env
notepad .env
npm install
npm run dev
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12 to 128 characters), and exact local website origins in `ALLOWED_ORIGINS`. Never commit `.env` or expose these values to browser code.

The API listens on port 5200 by default. Check `http://localhost:5200/health` for database status. It seeds the starter Carewell doctors on first startup and creates the administrator from the private environment values. If the machine's DNS resolver refuses MongoDB Atlas SRV lookups, startup retries with the fallback servers in `MONGODB_DNS_SERVERS` (Cloudflare and Google DNS by default); override that list with resolvers allowed by your network.

For Next.js paid appointments, set `CAREWELL_PAYMENT_FULFILLMENT_SECRET` to the same long random value used by the Next.js server. Keep it private; do not use a `NEXT_PUBLIC_` prefix.

## Roles and routes

- Patient accounts register at `/api/auth/register`, sign in at `/api/auth/login`, and view their own appointments at `/api/appointments/mine`.
- Appointment requests are created through `POST /api/appointments` and require a patient session.
- Providers create or update a doctor listing at `GET/PUT /api/providers/profile`; their schedule and public listing remain unavailable until an administrator approves the profile in `/api/admin/providers`.
- Provider profile photos are sent as JPG, PNG, or WebP data URLs up to 1.5 MB. Other API request bodies retain the 100 KB limit.
- `/api/admin/*` requires the separately seeded administrator role.
- Sessions use an HTTP-only cookie; credentials are stored as bcrypt password hashes.
- Patient reviews are accepted only from signed-in patients with a completed appointment.
- Paid appointment fulfillment is restricted to the Next.js server and requires the shared private secret.

This template stores basic appointment scheduling details only. Do not store diagnoses, treatment notes, insurance data, or other sensitive clinical records. It is not an electronic health record, payment processor, or healthcare compliance product. Obtain security, privacy, and regulatory review before any real-patient deployment.