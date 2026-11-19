# Sizzle&Smile Food Delivery — Buyer Guide

[Open the designed, nine-page PDF](./CARDZIP-FOOD-DELIVERY-BUYER-GUIDE.pdf). This guide documents the included restaurant storefronts, separate API, and demo-order boundaries.

## 1. Package choices

- `Food-Delivery-Hub/` — React/Vite restaurant storefront and portal UI.
- `nextjs/` — separate native Next.js App Router storefront, components, and API client.
- `backend/` — Express API with MongoDB persistence, client accounts, demo orders, and protected admin operations.
- `docs/` — this guide, its PDF builder and output, plus local approved brand assets.

Choose either frontend. The backend runs separately and the two frontend applications do not share one running server. Check your purchase terms to confirm which package components are included.

## 2. Folder map and prerequisites

Use a supported Node.js/npm version and a reachable MongoDB service for API-backed use. Install dependencies separately in the selected frontend and in `backend/`.

| Folder | Purpose |
| --- | --- |
| `Food-Delivery-Hub/` | Vite menu, cart, reservations, and client/admin screens |
| `nextjs/` | Native Next.js routes, components, and API client |
| `backend/` | API controllers, role middleware, data models, and tests |
| `docs/` | Buyer guide, PDF generator/output, and `assets/` |

Keep the backend `.env` private. Do not put database credentials, admin passwords, or JWT secrets in frontend environment variables.

## 3. Backend setup

1. Start MongoDB and copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, a unique `ADMIN_PASSWORD` (12–128 characters), and exact frontend origins in `ALLOWED_ORIGINS`.
3. Start the API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

The API listens on port `5000`. It seeds the administrator from environment settings. Public registration creates client accounts only; there is no public admin signup. API tests can be run with `npm test` and do not require MongoDB.

## 4. Frontend setup

Start Vite:

```sh
cd Food-Delivery-Hub
npm install
npm run dev
```

Vite reads `VITE_API_BASE_URL`, defaulting to `http://localhost:5000/api`. For the Next.js frontend:

```sh
cd nextjs
npm install
npm run dev
```

Next.js reads `NEXT_PUBLIC_FOOD_API_URL`, also defaulting to `http://localhost:5000/api`. Start MongoDB and the API before using account and order workflows. `npm run build` and `npm run typecheck` are available in the Next.js project.

## 5. Product walkthrough

Browse dishes and restaurant details on `/` and `/restaurant`; use `/checkout` for the authenticated demo-order flow. `/reserve` and `/track` are front-end preview experiences. The Vite app also exposes `/login`, `/signup`, `/dashboard`, `/admin/login`, and `/admin`.

The Next.js app has its own `app/`, `components/`, and `lib/` folders and corresponding pages; it is not a mount of the Vite app. Food photography is loaded from Unsplash.

## 6. Client and administrator workflows

- **Client:** register or sign in, browse the menu, place a demo order, and review order history at `/dashboard`.
- **Administrator:** sign in at `/admin/login`, then review dashboard metrics and manage orders at `/admin`.
- The API checks bearer-token sessions and the current account role for protected client/admin endpoints; the UI alone does not grant access.

Reservations and tracking are preview flows and should not be mistaken for connected scheduling or live delivery operations.

## 7. Limitations, security, and deployment

Orders are demo records. The API calculates totals using its server-side menu and does not accept or store card numbers, CVVs, or payment data. No payment is processed. Integrate and validate a payment provider, kitchen operations, delivery dispatch, and customer notifications before using this as a live ordering service.

Deploy one frontend and the API as separate services. Configure HTTPS, production origins, private credentials, backups, monitoring, and data retention. The Vite `.env.example` points to the default backend port, `5000`; maintain that match if the API port changes.

## 8. Buyer license summary

This guide is an informational summary only; it is not a license grant or an expansion of buyer rights. The purchase terms and license supplied with the order control use, modification, redistribution, and included components. Verify those terms for the specific order before deployment; no rights beyond them are claimed here.

## 9. Build the PDF

The PDF generator and approved Cardzip logo and company signature are local to `docs/`. From the project root:

```sh
node docs/build-buyer-guide.mjs
```

The output is `docs/CARDZIP-FOOD-DELIVERY-BUYER-GUIDE.pdf`. The script reports its output path and page count and is designed to produce exactly nine pages.
