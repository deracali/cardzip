# FixFlow Pro — Buyer Guide

[Open the designed, nine-page PDF](./CARDZIP-FIXFLOW-PRO-BUYER-GUIDE.pdf). FixFlow Pro presents a service-request workflow for plumbing, HVAC, and repair businesses, with a separate API for persistent accounts and operations.

## 1. Package choices

- `home-services-hub/` — standalone Vite showcase with seeded demo records and localStorage state (not production authentication).
- `nextjs/` — separate native Next.js App Router pages, components, and API client.
- `backend/` — Express API, MongoDB persistence, service catalog, and protected client/admin operations.
- `docs/` — this guide, PDF generator/output, and local approved brand assets.

The Vite and Next.js applications are separate frontend choices. Vite is a local demonstration; Next.js is the API-backed edition intended for a connected deployment. The API is a separate service. Confirm which components are included in your order.

## 2. Folder map and prerequisites

Use a supported Node.js/npm version. API-backed workflows require a reachable MongoDB service.

| Folder | Purpose |
| --- | --- |
| `home-services-hub/` | Vite demo storefront, estimate options, local demo signup/login, and request screens |
| `nextjs/` | Native Next.js routes, screens, and API client |
| `backend/` | Auth, client/admin controllers, service catalog, and API |
| `docs/` | Guide, builder/output, and `assets/` branding |

Keep server credentials in the backend environment only. Do not expose `MONGODB_URI`, administrator credentials, `JWT_SECRET`, or the Paystack secret key to the browser.

## 3. Backend setup

1. Start MongoDB and copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, a unique `ADMIN_PASSWORD` (12–128 characters), and the exact Next.js origin in `ALLOWED_ORIGINS`. For Paystack, configure `PAYSTACK_SECRET_KEY` only on the API, use `PAYSTACK_CURRENCY=USD` for the displayed estimates, and set `PAYSTACK_CALLBACK_URL` to the Next.js `/payment/return` URL.
3. Install and run the API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

The API listens on port `5200` by default. Admin credentials are seeded from private backend settings; public signup creates clients only. Run API tests with `npm test`; the tests use an isolated store and do not need MongoDB.

## 4. Frontend setup

For Vite:

```sh
cd home-services-hub
npm install
npm run dev
```

The Vite demo works without an API and uses browser localStorage. Demo accounts are listed in its README. Start the standalone Next.js app with:

```sh
cd nextjs
npm install
npm run dev
```

Next.js reads `NEXT_PUBLIC_HOME_SERVICE_API_URL`, defaulting to `http://localhost:5200/api`. Start the API before using authenticated request workflows. The Next.js package also has `npm run build` and `npm run typecheck`.

## 5. Product walkthrough

Review the plumbing, HVAC, and repair services and their estimate options on the storefront. A signed-in client submits a request through `/book-now`; `/login` and `/signup` provide client access. Use `/dashboard` to review the client's own request history.

The Next.js frontend has native routes under `app/` and reusable UI under `components/`; the API client is in `lib/`. It does not mount the Vite application.

## 6. Client and administrator workflows

- **Client:** select a service and urgency, provide preferred timing, address, and issue details, then submit a request. The client dashboard shows that client's requests and status.
- **Administrator:** sign in at `/admin/login`; `/admin` provides an operations overview, request queue, client directory, and workspace settings.
- API middleware verifies the account and role for protected client and admin requests. Client-submitted prices and roles are not trusted as authorization or quote inputs.

The API validates service and urgency against its own catalog and calculates the estimate server-side.

## 7. Limitations, security, and deployment

A submitted request is not a confirmed appointment and does not guarantee availability. The Next.js dashboard can initiate a payment for the backend-calculated estimate through Paystack hosted checkout; it does not dispatch a technician. Configure Paystack only with server-side credentials, test with Paystack test credentials and a non-production API before launch, and confirm the business currency and actual service-payment terms before collecting live payments. The Vite edition does not perform payments.

Deploy one frontend and the API as separate services. Use HTTPS, exact production `ALLOWED_ORIGINS`, strong private secrets, database backups, monitoring, and appropriate privacy/data-retention controls. Ensure the frontend API URL points to the backend's port `5200`.

## 8. Buyer license summary

This buyer guide is informational and does not itself grant or enlarge rights. The license and purchase terms supplied with the buyer's order govern permitted use, modification, redistribution, and included files. Check the actual order terms; this guide makes no claim to rights beyond them.

## 9. Build the PDF

The PDF builder and approved Cardzip logo and company signature are stored inside `docs/` and use those local assets. From the project root:

```sh
node docs/build-buyer-guide.mjs
```

The generated file is `docs/CARDZIP-FIXFLOW-PRO-BUYER-GUIDE.pdf`. The builder prints the output path and page count and is intended to produce exactly nine designed pages.
