# PolarFlow HVAC

PolarFlow is an HVAC service and customer portal template, organized as two independent frontends plus a separate MVC API:

- `technician-hub/` — React + Vite storefront
- `nextjs/` — Native Next.js App Router frontend
- `backend/` — Express API with MVC controllers, MongoDB persistence, role authorization and payment verification
- `docs/` — Setup documentation and the Cardzip buyer-guide PDF

## Start the API

```powershell
Set-Location backend
Copy-Item .env.example .env
npm install
npm run dev
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and a private `ADMIN_SIGNUP_CODE` in the API `.env`. Leave provider credentials blank until the merchant accounts are configured.

## Start one frontend

Vite:

```powershell
Set-Location technician-hub
Copy-Item .env.example .env.local
npm install
npm run dev
```

Next.js:

```powershell
Set-Location nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

Both frontends use `http://localhost:5000/api` by default. Configure `ALLOWED_ORIGINS` on the API for the frontend origins you deploy. For Next.js, also set the API's `FRONTEND_URL` to the Next.js origin so payment callbacks return to that app.

## Accounts and payment

Customers create accounts and sign in at `/portal/signup` and `/portal/login`. Administrator registration is invitation-only at `/admin/signup`; the API rejects admin access without the configured invite code. Both dashboards call role-protected API endpoints.

The Home Comfort Plan is priced at USD 199 for one year and is a one-time annual payment, not an automatically renewing subscription. Checkout is hosted by Stripe or Paystack. Each provider is shown only when its secret key is set and `*_SUPPORTED_CURRENCIES` includes `USD`. Stripe also requires `STRIPE_WEBHOOK_SECRET`. Set up provider webhook endpoints at `/api/webhooks/stripe` and `/api/webhooks/paystack`; the API verifies the provider payment before activating a membership. Appointment services remain payable after work is completed and are not charged online by this template.

The full route, architecture, setup, payment, deployment and buyer information is in [`docs/BUYER-GUIDE.md`](docs/BUYER-GUIDE.md). Regenerate the nine-page branded PDF with:

```powershell
Set-Location docs
node build-buyer-guide.mjs
```

Backend tests: `Set-Location backend; npm test`. Frontend checks: use `npm run lint`, `npm run build` in `technician-hub`, and `npm run typecheck`, `npm run build` in `nextjs`.
