# Lumière Salon & Spa — Next.js

Standalone native Next.js App Router application. Route pages live under `app/`, salon-specific UI under `components/`, and API access in `lib/`. It does not import or mount the Vite app.

## Run locally

```sh
npm install
npm run dev
```

Copy `env.example` to `.env.local`, configure the Paystack secret, USD-to-NGN rate, app URL, API URL, and payment proof secret. Set the same `PAYMENT_PROOF_SECRET` in the backend `.env`; keep `PAYSTACK_SECRET_KEY` server-only (never prefix it with `NEXT_PUBLIC_`). Start the API first; see `../backend/README.md`. Run `npm run build` for a production build and `npm run typecheck` for the TypeScript app.

## Pages

- `/` — salon storefront with API-backed services
- `/services`, `/stylists`, `/packages`, `/reviews` — dedicated public pages
- `/book` — authenticated appointment and full-price Paystack checkout (NGN)
- `/payment/callback` — server-verified Paystack payment confirmation
- `/login` and `/signup` — client authentication
- `/dashboard`, `/dashboard/appointments`, `/dashboard/profile` — client pages
- `/admin/login`, `/admin`, `/admin/appointments`, `/admin/clients`, `/admin/services`, `/admin/stylists` — protected studio workspace

The API independently enforces roles and accepts bookings only with a server-signed payment proof. Service prices and stylist profiles are API-backed and editable by admins. Set `PAYSTACK_USD_TO_NGN_RATE` to the current conversion rate; the displayed USD service price is converted to the full NGN amount before Paystack checkout.

See the [buyer guide](../docs/buyer-guide.md) for product setup and limitations.
