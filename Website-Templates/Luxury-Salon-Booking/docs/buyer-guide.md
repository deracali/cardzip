# Lumière Salon & Spa — Buyer Guide

[Open the designed, nine-page PDF](./CARDZIP-LUMIERE-SALON-BUYER-GUIDE.pdf). The package provides separate salon frontends, an API-backed appointment-request workflow, and a studio administration area.

## 1. Package choices

- `Luxury-salon-booking/` — React/Vite storefront, service catalog, booking request, and portals.
- `nextjs/` — standalone native Next.js App Router app with salon components and API client.
- `backend/` — Express/MongoDB API for client accounts, appointment requests, and admin status updates.
- `docs/` — this guide, its PDF builder/output, and local approved Cardzip logo and signature assets.

Choose one frontend and run the API separately for persistent accounts and requests. Check the purchase terms to confirm which project components are included.

## 2. Folder map and prerequisites

Use a supported Node.js/npm version and a reachable MongoDB service for API-backed use. Install dependencies in the selected frontend and backend independently.

| Folder | Purpose |
| --- | --- |
| `Luxury-salon-booking/` | Vite storefront, service catalog, `/book`, and client/admin areas |
| `nextjs/` | Native Next.js pages, components, and `lib/` API client |
| `backend/` | Auth, role middleware, appointment controllers, and MongoDB models |
| `docs/` | Guide, generator/output, and local `assets/` |

Protect `.env` files and server credentials. Do not expose MongoDB settings, admin passwords, or `JWT_SECRET` in client-side environment variables.

## 3. Backend setup

1. Start MongoDB and copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI`, `MONGODB_DB_NAME` (the example uses `lumiere_salon`), a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD`, and exact frontend origins in `ALLOWED_ORIGINS`.
3. Install and start the API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

The API listens on port `5600`. Admin access is seeded from backend environment settings; public signup always creates a client account. If the configured admin email already belongs to a client, startup stops rather than elevating that account. Run `npm test` for API authorization, ownership, pricing, and status tests.

## 4. Frontend setup

For Vite:

```sh
cd Luxury-salon-booking
npm install
npm run dev
```

Vite reads `VITE_SALON_API_URL`, defaulting to `http://localhost:5600/api`. To start the separate Next.js frontend:

```sh
cd nextjs
npm install
npm run dev
```

Next.js reads `NEXT_PUBLIC_SALON_API_URL`, with the same default. Start MongoDB and the API before using authenticated appointment flows. The Next.js package includes `npm run build` and `npm run typecheck`.

## 5. Product walkthrough

The storefront introduces the salon and service catalog. Clients can create an account, sign in, choose service, stylist, preferred date and time, add optional notes, and submit an appointment request at `/book`. `/dashboard` displays the signed-in client's own appointment requests.

The standalone Next.js app has its own `app/`, `components/`, and `lib/` folders; it does not mount the Vite application.

## 6. Client and studio workflows

- **Client:** sign up or log in, select a service and preferred stylist/time, send a request, then review its status in `/dashboard`.
- **Administrator:** sign in at `/admin/login` and use `/admin` to review appointment/client summaries and update request status.
- Available status updates include `Requested`, `Confirmed`, `Completed`, and `Cancelled`. The API enforces client ownership and admin roles on protected routes.

Public signup cannot create an administrator; configure the initial admin privately through backend environment settings.

## 7. Limitations, security, and deployment

Appointment availability is not synchronized to a live salon calendar. A request remains `Requested` until an administrator reviews and changes its status; submitting it does not confirm a salon booking or reserve a live slot. Online payment, email notifications, and calendar integrations are not included.

Deploy one frontend and the API as separate services. Use HTTPS, a strong persistent JWT secret, exact production origins, private admin credentials, MongoDB backups, and appropriate privacy/data-retention controls. Add and test any required calendar, payment, and notification integrations before launch.

## 8. Buyer license summary

This guide is an informational summary, not a license grant or an expansion of buyer rights. The license and purchase terms supplied with the buyer's order control permitted use, modification, redistribution, and included components. Refer to those terms for the actual rights purchased; no broader rights are represented here.

## 9. Build the PDF

The builder and approved logo/signature images are held locally in `docs/`; regeneration does not depend on the original asset locations. From the project root:

```sh
node docs/build-buyer-guide.mjs
```

The script writes `docs/CARDZIP-LUMIERE-SALON-BUYER-GUIDE.pdf`, reports the output path and page count, and is designed to output exactly nine pages.
