# Carewell Booking API

## Local setup

```powershell
copy .env.example .env
notepad .env
npm install
npm run dev
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12 to 128 characters), and exact local website origins in `ALLOWED_ORIGINS`. Never commit `.env` or expose these values to browser code.

The API listens on port 5200 by default. Check `http://localhost:5200/health` for database status. It seeds the starter Carewell doctors on first startup and creates the administrator from the private environment values.

## Roles and routes

- Patient accounts register at `/api/auth/register`, sign in at `/api/auth/login`, and view their own appointments at `/api/appointments/mine`.
- Appointment requests are created through `POST /api/appointments` and require a patient session.
- Provider accounts require administrator approval and assignment to a doctor profile before their schedule is available.
- `/api/admin/*` requires the separately seeded administrator role.
- Sessions use an HTTP-only cookie; credentials are stored as bcrypt password hashes.

This template stores basic appointment scheduling details only. Do not store diagnoses, treatment notes, insurance data, or other sensitive clinical records. It is not an electronic health record, payment processor, or healthcare compliance product. Obtain security, privacy, and regulatory review before any real-patient deployment.