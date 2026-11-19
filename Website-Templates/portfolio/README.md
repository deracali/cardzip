# CreatorHub Portfolio

CreatorHub is a React portfolio storefront with separate Vite and native Next.js frontends, a shared role-protected Express/MongoDB API, and a nine-page buyer guide.

## Project layout

- `vite/` — Vite storefront, client auth, dashboards, and API client
- `nextjs/` — native Next.js App Router with the same storefront and portal workflows
- `backend/` — Express API, MongoDB state store, client/admin authorization, and tests
- `docs/` — buyer guide source, generated PDF, Cardzip logo, and approved signature assets

## Start the API

1. Install and start MongoDB.
2. In `backend/`, copy `.env.example` to `.env` and set `MONGODB_URI`, a unique `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. Run:

   ```powershell
   npm install
   npm run dev
   ```

The backend seeds the configured administrator on startup; no public admin signup endpoint exists. The API defaults to `http://localhost:5700`.

## Start a frontend

Choose one frontend, configure its API URL using its `.env.example`, then run `npm install` and `npm run dev`. Vite defaults to `http://localhost:5173`; Next.js defaults to `http://localhost:3000`. Add both origins to `CORS_ORIGINS` when using both.

The backend authorizes client dashboard and review-request routes separately from admin routes. Review submissions are requests only: this starter does not schedule appointments, take payment, or collect card details. For production, use HTTPS and move browser tokens to secure, HttpOnly cookies.

## Buyer guide and checks

The signed, branded nine-page guide is available at `docs/CREATORHUB-PORTFOLIO-BUYER-GUIDE.pdf` and from both frontends at `/docs/buyer-guide.pdf`.

```powershell
Set-Location backend; npm test
Set-Location ..\vite; npm run lint; npm run build
Set-Location ..\nextjs; npm run typecheck; npm run build
```
