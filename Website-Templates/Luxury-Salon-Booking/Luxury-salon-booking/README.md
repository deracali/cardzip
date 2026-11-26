# Lumière Salon & Spa — Vite

The Vite application is a standalone local preview of the salon storefront and portals. It does not call the Express/MongoDB API; demo accounts, appointments, and editable prices are stored in the browser's local storage. The stylist roster and sample marketing content are static.

## Run locally

Run `npm install` and `npm run dev`.

The demo administrator can sign in at `/admin/login` with `admin@lumiere.local` / `LumiereAdmin2026!`. This client-side demo login and its local storage are not secure and must not be used for real salon operations.

## Pages

- `/` — salon storefront
- `/services`, `/stylists`, `/packages`, `/reviews` — dedicated public pages
- `/book` — local demo appointment requests
- `/login` and `/signup` — client access
- `/dashboard`, `/dashboard/appointments`, `/dashboard/profile` — local client dashboard pages
- `/admin/login`, `/admin`, `/admin/appointments`, `/admin/clients`, `/admin/services` — local admin demo pages

All Vite data is browser-local and persists only in that browser. Use the Next.js version for API-backed admin data and Paystack checkout.
