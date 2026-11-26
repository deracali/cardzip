# Sizzle&Smile Food Delivery — Buyer Guide

[Open the designed, nine-page PDF](./CARDZIP-FOOD-DELIVERY-BUYER-GUIDE.pdf). This guide documents the included restaurant storefronts, separate API, and demo-order boundaries.

## 1. Package choices

- `Food-Delivery-Hub/` — React/Vite browser-only restaurant storefront and local demo portals.
- `nextjs/` — separate native Next.js App Router storefront, components, and API client.
- `backend/` — Express API with MongoDB persistence, client accounts, demo orders, and protected admin operations.
- `docs/` — this guide, its PDF builder and output, plus local approved brand assets.

Choose either frontend. The backend runs separately and the two frontend applications do not share one running server. Check your purchase terms to confirm which package components are included.

## 2. Folder map and prerequisites

Use a supported Node.js/npm version and a reachable MongoDB service for API-backed use. Install dependencies separately in the selected frontend and in `backend/`.

| Folder | Purpose |
| --- | --- |
| `Food-Delivery-Hub/` | Vite menu, delivery and deals pages, cart, reservations, and local demo portals |
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

The Vite frontend is self-contained and does not call the API. It seeds sample customers and orders for the dashboards; sign-in, cart, and demo-order changes stay in the current browser and are not secure or shared. For the API-backed Next.js frontend:

```sh
cd nextjs
npm install
npm run dev
```

Next.js reads `NEXT_PUBLIC_FOOD_API_URL`, also defaulting to `http://localhost:5000/api`. Start MongoDB and the API before using its account and order workflows. `npm run build` and `npm run typecheck` are available in the Next.js project.

## 5. Product walkthrough

Browse dishes and restaurant details on `/` and `/restaurant`; use `/delivery` and `/deals` for delivery details and featured offers. Next.js `/checkout` redirects to Paystack-hosted payment; `/reserve` and `/track` remain demo experiences. Both frontends include account and administrator pages; only the Next.js frontend authenticates and stores orders through the API.

The Next.js app has its own `app/`, `components/`, and `lib/` folders and corresponding pages; it is not a mount of the Vite app. Food photography is loaded from Unsplash.

## 6. Client and administrator workflows

- **Vite preview:** any valid-looking email and password open a local demo session; dashboards start with sample data, and changes remain in browser storage rather than using secure authentication.
- **Next.js:** clients register or sign in, pay for orders through Paystack, and review history at `/dashboard`; administrators sign in at `/admin/login` and manage paid orders at `/admin`.
- The API checks bearer-token sessions and account roles for Next.js protected endpoints; the UI alone does not grant access.

Reservations and tracking are preview flows and should not be mistaken for connected scheduling or live delivery operations.

## 7. Limitations, security, and deployment

Next.js checkout redirects to Paystack-hosted payment. The backend calculates the total from its own menu, keeps the order pending, and marks it paid only after server-side transaction verification. Configure the backend Paystack secret, NGN currency, callback URL, and `/api/payments/paystack/webhook`; the secret must never be exposed to Next.js. Existing numeric menu prices are charged as NGN without exchange-rate conversion. Vite remains a local demo and does not process payments.

The API-backed Next.js frontend and API should be deployed as separate services. Use Paystack test credentials and HTTPS in a test deployment before enabling live credentials. The Vite version is a local-storage demo and is not suitable for real accounts or orders. Configure HTTPS, production origins, private credentials, backups, monitoring, and data retention for API-backed deployments.

## 8. Buyer license summary

This guide is an informational summary only; it is not a license grant or an expansion of buyer rights. The purchase terms and license supplied with the order control use, modification, redistribution, and included components. Verify those terms for the specific order before deployment; no rights beyond them are claimed here.

## 9. Build the PDF

The PDF generator and approved Cardzip logo and company signature are local to `docs/`. From the project root:

```sh
node docs/build-buyer-guide.mjs
```

The output is `docs/CARDZIP-FOOD-DELIVERY-BUYER-GUIDE.pdf`. The script reports its output path and page count and is designed to produce exactly nine pages.
