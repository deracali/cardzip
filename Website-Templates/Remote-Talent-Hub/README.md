# Remote Talent Hub

Remote.ly is a remote-work marketplace with two separate frontends:

| Folder | Application | Local address |
| --- | --- | --- |
| `vite/` | React + Vite local demo; browser localStorage only | `http://localhost:5173` |
| `nextjs/` | Next.js App Router frontend connected to the API | `http://localhost:3000` |
| `backend/` | Express API + MongoDB, including Paystack integration | `http://localhost:5000/api` |
| `docs/` | Buyer guide and guide generator | — |

Choose either frontend. Vite is a standalone localStorage demo; Next.js uses the shared backend. Do not run both frontends on the same port.

## Requirements

- Node.js 20.19 or later and npm
- MongoDB, local or hosted

## Start the API

Open a terminal in `backend/`:

```powershell
Copy-Item .env.example .env
notepad .env
npm install
npm run dev
```

Set `MONGODB_URI`, a private `JWT_SECRET` of at least 32 characters, and the initial `ADMIN_EMAIL` / `ADMIN_PASSWORD` (at least 12 characters). The API creates that admin account once if it does not already exist. There is no public admin registration endpoint. For Next.js job checkout, set the backend-only `PAYSTACK_SECRET_KEY` and `PAYSTACK_CALLBACK_URL`; never expose the Paystack secret through frontend variables or commit `.env`.

The server exits with a clear error if required configuration is unavailable. In non-production environments, a MongoDB connection failure (including Atlas SRV DNS errors) is reported and the API starts with temporary in-memory data so local pages remain usable; that data is lost when the process restarts. Production still requires MongoDB and never falls back to memory. For durable local development data, fix MongoDB DNS/network access and confirm the Atlas network allowlist rather than relying on memory mode. The default CORS list permits the local Vite and Next.js origins; update `CORS_ORIGINS` for production.

## Start one frontend

Run either Vite:

```powershell
cd ..\vite
Copy-Item .env.example .env
npm install
npm run dev
```

Or Next.js in another terminal (start the API first):

```powershell
cd ..\nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

The Next.js API URL defaults to `http://localhost:5000/api`. Override it with `NEXT_PUBLIC_API_URL` in `nextjs/.env.local`. Vite does not call the API and requires no API configuration; its demo users, jobs, applications, and moderation state stay in browser localStorage.

## Accounts and access

- Candidates and employers register at `/signup`. Select the correct role when signing in at `/login`.
- Candidate dashboards have overview, applications, and profile pages. Employer dashboards have overview, job listings, applications, and profile pages.
- Vite's dashboards use localStorage-only demo data. Next.js dashboards load account-scoped data from the backend API.
- The API seeds the admin from backend environment variables. Admins sign in at `/admin/login`; `/admin` and all admin API routes require an admin token.
- API role checks are authoritative; hiding a page in the frontend is not used as an access control.

## API routes

- `GET /api/health`
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/public/jobs`, `GET /api/public/jobs/:id`
- `GET /api/client/dashboard`, `POST /api/client/applications`, `POST /api/client/jobs`
- `PATCH /api/client/applications/:id`
- `GET /api/payments/quote?plan=standard|featured`
- `POST /api/payments/paystack/initialize`, `GET /api/payments/paystack/verify?reference=...` (authenticated employer routes)
- `GET /api/admin/dashboard`, `POST /api/admin/jobs`, `PATCH /api/admin/jobs/:id`, `PATCH /api/admin/applications/:id`

Run backend tests with `npm test` from `backend/`. Run the Vite frontend with `npm run lint` and `npm run build`; run Next.js with `npm run typecheck` and `npm run build`.

## Next.js payments

Next.js supports Paystack checkout in NGN. The Standard and Featured plans have USD base prices of $99 and $249, converted using a live USD/NGN rate retrieved by the backend and cached for up to 10 minutes. The backend recalculates the total at initialization and verifies Paystack's transaction, currency, amount, reference, owner, and listing before marking it paid. Listings still require administrator approval before becoming public.

Configure `PAYSTACK_SECRET_KEY` and `PAYSTACK_CALLBACK_URL` only in the backend environment. Use a Paystack test secret for testing, and set the deployed callback URL to the HTTPS checkout page. Vite checkout is intentionally local-only and does not collect payment.

See [the buyer guide](./docs/REMOTE-TALENT-HUB-BUYER-GUIDE.pdf) for setup, folder structure, role workflows, deployment preparation, and the Cardzip template license summary.
