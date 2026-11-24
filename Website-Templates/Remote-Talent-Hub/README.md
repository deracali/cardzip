# Remote Talent Hub

Remote.ly is a remote-work marketplace with two separate frontends and a shared Express/MongoDB API:

| Folder | Application | Local address |
| --- | --- | --- |
| `vite/` | React + Vite frontend | `http://localhost:5173` |
| `nextjs/` | Next.js App Router frontend | `http://localhost:3000` |
| `backend/` | Express API + MongoDB | `http://localhost:5000/api` |
| `docs/` | Buyer guide and guide generator | — |

Choose either frontend. Both call the same backend; do not run the two frontends on the same port.

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

Set `MONGODB_URI`, a private `JWT_SECRET` of at least 32 characters, and the initial `ADMIN_EMAIL` / `ADMIN_PASSWORD` (at least 12 characters). The API creates that admin account once if it does not already exist. There is no public admin registration endpoint. Never commit `.env` or expose backend secrets through frontend variables.

The server exits with a clear error if required configuration is unavailable. In non-production environments, a MongoDB connection failure is reported and the API starts with temporary in-memory data so local pages remain usable; that data is lost when the process restarts. Production still requires MongoDB. For durable local development data, fix MongoDB DNS/network access and confirm the Atlas network allowlist rather than relying on memory mode. The default CORS list permits the local Vite and Next.js origins; update `CORS_ORIGINS` for production.

## Start one frontend

Run either Vite:

```powershell
cd ..\vite
Copy-Item .env.example .env
npm install
npm run dev
```

Or Next.js in another terminal:

```powershell
cd ..\nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

The API URL defaults to `http://localhost:5000/api`. Override it with `VITE_API_URL` in the Vite `.env` or `NEXT_PUBLIC_API_URL` in `nextjs/.env.local`.

## Accounts and access

- Candidates and employers register at `/signup`. Select the correct role when signing in at `/login`.
- Candidate dashboards list only the signed-in candidate's applications.
- Employer dashboards list only the employer's jobs and applications for their approved listings. New listings wait for admin review.
- The API seeds the admin from backend environment variables. Admins sign in at `/admin/login`; `/admin` and all admin API routes require an admin token.
- API role checks are authoritative; hiding a page in the frontend is not used as an access control.

## API routes

- `GET /api/health`
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/public/jobs`, `GET /api/public/jobs/:id`
- `GET /api/client/dashboard`, `POST /api/client/applications`, `POST /api/client/jobs`
- `PATCH /api/client/applications/:id`
- `GET /api/admin/dashboard`, `POST /api/admin/jobs`, `PATCH /api/admin/jobs/:id`, `PATCH /api/admin/applications/:id`

Run backend tests with `npm test` from `backend/`. Run the Vite frontend with `npm run lint` and `npm run build`; run Next.js with `npm run typecheck` and `npm run build`.

## Payment limitation

The plan and checkout screens are previews. No card data is collected and no payment or paid listing activation occurs. Connect a payment provider before enabling paid listings in production.

See [the buyer guide](./docs/REMOTE-TALENT-HUB-BUYER-GUIDE.pdf) for setup, folder structure, role workflows, deployment preparation, and the Cardzip template license summary.
