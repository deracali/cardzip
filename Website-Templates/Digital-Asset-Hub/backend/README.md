# Digital Asset Hub API

## Local setup

```powershell
copy .env.example .env
notepad .env
npm install
npm run dev
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12 to 128 characters), and the exact local origins in `ALLOWED_ORIGINS`. Never commit `.env` or expose these values to browser code.

The API listens on port 5000 by default. Check `http://localhost:5000/health` for database status. Set `SEED_DEMO_DATA=true` only for local testing before first startup to seed sample operations; leave it false or unset for production.

## Accounts and access

- `POST /api/auth/register` and `POST /api/auth/login` create and authenticate client accounts.
- `GET /api/client/overview` returns records associated with the authenticated client email.
- `/api/admin/*` requires the separately seeded administrator account.
- Client and administrator sessions use separate HTTP-only cookies and role checks.

This template does not connect to payment, gift-card, bill-provider, or virtual-card processors. Do not treat demo records or rates as live financial data.