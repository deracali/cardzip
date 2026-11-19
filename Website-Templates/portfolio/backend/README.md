# CreatorHub Portfolio API

Express API for client accounts, portfolio review requests, and administrator review workflows.

## Configure and run

Copy `.env.example` to `.env`, then set the MongoDB URI, a unique `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Run `npm install` and `npm run dev`. The API listens on port `5700` by default.

The configured administrator is seeded at startup. There is no public admin registration route. CORS is restricted to the comma-separated origins in `CORS_ORIGINS`; local defaults allow the Vite and Next.js development servers.

## API

- `POST /api/auth/signup` — create a client account
- `POST /api/auth/login` — client sign-in; send `role: "admin"` for administrator sign-in
- `GET /api/auth/me` — current authenticated account
- `GET /api/client/dashboard` — client profile and that client’s own review requests
- `POST /api/client/review-requests` — submit a review request as the signed-in client
- `GET /api/admin/dashboard` — administrator-only account and request overview
- `PATCH /api/admin/review-requests/:id` — administrator-only request status update

Passwords are stored as salted scrypt hashes. Eight-hour signed bearer tokens are rechecked against current database roles on every protected request. Review requests are records only; the API does not book sessions or process payments.

## Test

```powershell
npm test
```
