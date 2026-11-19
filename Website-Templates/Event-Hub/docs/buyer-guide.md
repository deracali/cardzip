# PulseLive Event Hub — Buyer Guide

[Open the designed, nine-page PDF](./CARDZIP-EVENT-HUB-BUYER-GUIDE.pdf). This guide describes the files in this package; use the setup path for the frontend and backend included with your order.

## 1. Package choices

The project has two frontend applications and one separate API:

- `event-hub/` — React with Vite; includes a local browser-storage preview.
- `nextjs/` — a native Next.js App Router application.
- `backend/` — Express API with MongoDB persistence and role-protected attendee, organizer, and administrator operations.

Choose one frontend. Both can work with the API, but the frontend folders are separate applications. The API and database are a separate part of the package; verify your purchase contents.

## 2. Folder map and prerequisites

Use Node.js and npm versions supported by the included package manifests. The API also requires a reachable MongoDB instance.

| Folder | Purpose |
| --- | --- |
| `event-hub/` | Vite storefront, event pages, local demo, and admin UI |
| `nextjs/` | Native Next.js pages, components, and API client |
| `backend/` | Express routes, controllers, models, and environment configuration |
| `docs/` | This guide, the PDF builder, PDF, and `assets/` brand images |

Keep `.env` files and backend credentials private. Never expose database credentials or server secrets through browser-side `VITE_` or `NEXT_PUBLIC_` variables.

## 3. Backend setup

1. Start MongoDB.
2. In `backend/`, copy `.env.example` to `.env`.
3. Configure `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, a unique `ADMIN_PASSWORD` (12–128 characters), and `ALLOWED_ORIGINS` for the frontend origins.
4. Install and start the API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

The API listens on port `5400` by default and requires MongoDB and the configured secret. The first admin is seeded from the environment. Organizer tools require an approved organizer account.

## 4. Frontend setup

Run either frontend in a separate terminal. For Vite's local preview:

```sh
cd event-hub
npm install
npm run dev
```

Vite starts in browser-local demo mode by default. To use the API, set `VITE_API_BASE_URL=http://localhost:5400/api` in the Vite environment, or switch to API mode with `?mode=api`. For Next.js:

```sh
cd nextjs
npm install
npm run dev
```

Next.js reads `NEXT_PUBLIC_EVENT_HUB_API_URL` and defaults to `http://localhost:5400/api`. Start the API first for persistent account and booking workflows. Run `npm run build` in the selected frontend for a production build; Next.js also provides `npm run typecheck`.

## 5. Product walkthrough

Explore `/` and `/events` for event discovery and search, then open `/events/:slug` for the event description and schedule. `/schedule` presents agenda content. `/checkout/:slug` starts a booking request, and `/host` presents the organizer inquiry flow. Public information also includes `/about`.

The Vite demo keeps demo changes in browser storage. API-backed activity uses the separately configured backend. The Next.js app has native App Router pages and is not simply a Vite server.

## 6. Client and operations workflows

- **Attendee:** register or sign in at `/signup` or `/login`, browse events, submit a booking request, then review it at `/dashboard`.
- **Organizer:** submit an organizer application; after administrator approval, use `/organizer/dashboard` to manage event listings and review relevant bookings.
- **Administrator:** use `/admin` to review and manage events, bookings, organizers, attendees, and settings. The first admin is configured on the backend, not through public signup.

API endpoints enforce roles on protected requests. Frontend navigation or a hidden screen is not the security boundary.

## 7. Limitations, security, and deployment

Checkout records a booking request only. It does not collect payment, reserve inventory, issue a real ticket, handle refunds, or scan entry passes. Add and test payment, ticketing, inventory, and event-day operations before using the package for live sales.

Deploy one frontend and the API as separate services. Set production origins and secrets, use HTTPS, validate authentication and data handling, and plan backups and monitoring. The Vite `.env.example` has an API URL placeholder; ensure it points to the actual API port (`5400`) when connecting to this backend.

## 8. Buyer license summary

This guide is informational and does not grant, enlarge, or replace license rights. The purchase terms and license supplied with the buyer's order govern permitted use, modification, redistribution, and any included package files. Confirm the purchased package and applicable terms before deployment; no rights beyond those terms are represented here.

## 9. Build the PDF

The builder and the approved Cardzip logo and company signature are stored locally under `docs/`. From the project root, run:

```sh
node docs/build-buyer-guide.mjs
```

The builder writes `docs/CARDZIP-EVENT-HUB-BUYER-GUIDE.pdf` and reports the output path and page count. The intended output is exactly nine designed pages.
