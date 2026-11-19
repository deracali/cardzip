# Kindred NGO — Next.js

Native Next.js App Router frontend for the Kindred NGO template. It uses its own routes and components rather than wrapping the Vite application.

## Start

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_NGO_API_URL` to the backend `/api` URL if it is not `http://localhost:5000/api`. Start the separate API in `../backend` first.

Pages include campaign browsing, donor sign-in and registration, donor `/dashboard`, administrator `/admin` and pledge checkout. The API enforces the same donor/admin role permissions regardless of frontend route. Pledges are records only; no payments are processed.

Run `npm run typecheck` and `npm run build` before deployment.
