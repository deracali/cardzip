# Escapes Travel Stay - Buyer Guide

This guide covers the Travel Stay template's separate Vite storefront, Next.js App Router frontend, and MVC Express API. Choose one frontend; both use the same backend contract. The included sample listings and prices are demonstration content and must be replaced or confirmed before launch.

## 1. Included folders

- `travel-stay-platform/` - React + Vite storefront.
- `nextjs/` - independent Next.js frontend with dedicated App Router pages and reusable UI components.
- `backend/` - Express API organized into routes, controllers, middleware, services, and data stores.
- `docs/` - this guide, its PDF, branded assets, and the PDF generator.

The frontends are alternatives, not one combined application. The backend is required for customer authentication, reservations, payment verification, and the protected admin dashboard.

## 2. Prerequisites

Install Node.js 20.19 or newer and npm. The API requires MongoDB. For production, provision HTTPS hosting, a database with backups, and private environment-variable storage.

```powershell
node --version
npm --version
```

Keep the API and selected frontend in separate terminals. Do not copy real secrets into public frontend environment variables or commit `.env` files.

## 3. Configure and run the API

From PowerShell:

```powershell
Set-Location .\backend
Copy-Item .env.example .env
```

Edit `backend/.env` and set `MONGODB_URI`, a strong private `JWT_SECRET`, and `ADMIN_SIGNUP_CODE`. Set `ALLOWED_ORIGINS` to the exact origins of the frontend(s) you will run, and set `FRONTEND_URL` to the selected storefront origin so hosted-checkout returns to the correct app. For local Next.js, use `http://localhost:3000`; for Vite, use `http://localhost:5173`. The API defaults to port `5000`.

```powershell
npm install
npm run dev
```

Check `http://localhost:5000/api/health`. Keep the API terminal open. The service intentionally reports configuration or database errors instead of falling back to demo data.

## 4. Run one frontend

### Next.js

```powershell
Set-Location .\nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The default `NEXT_PUBLIC_API_BASE_URL` is `http://localhost:5000/api`. The App Router has independent route entry points for the home page, stay search/details, reservation, checkout, payment return, authentication, and dashboards. Its UI components live inside `nextjs/src`.

### React + Vite

```powershell
Set-Location .\travel-stay-platform
Copy-Item .env.example .env
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). Configure `VITE_API_BASE_URL` to the API origin if it differs from the default. Vite variables are public; never place provider credentials there.

## 5. Customer and reservation flow

1. A visitor browses the sample stays and selects dates and guest count.
2. The visitor signs in or creates a customer account before checkout.
3. The API calculates the amount from its server-owned stay catalog and fees. It requires the guest email to match the authenticated account.
4. The API creates a pending reservation and initializes the chosen hosted payment provider.
5. The browser returns to `/payment/callback`; the frontend asks the API to verify the provider reference.
6. Only a verified payment can confirm the reservation. Customers can view only their own reservation data in `/client/dashboard`.

The client dashboard and admin dashboard require backend-issued bearer-token sessions. Hiding a link in the frontend is not the security boundary; API middleware checks identity and role on every protected request.

## 6. Paystack and Stripe

Checkout supports hosted Paystack and Stripe sessions. Provider choices are listed only when the corresponding server configuration is complete. Copy `backend/.env.example` to `.env`; keep the example's secret values blank and configure actual credentials only in the private server environment.

```dotenv
PAYSTACK_SECRET_KEY=
PAYSTACK_SUPPORTED_CURRENCIES=USD
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUPPORTED_CURRENCIES=USD
```

Configure the provider webhook destinations to:

- `https://<your-api-host>/api/webhooks/paystack`
- `https://<your-api-host>/api/webhooks/stripe`

Use the webhook secret from the provider dashboard for Stripe. Webhook requests and browser returns are verified server-side; never trust a success redirect alone. The sample catalog is priced in USD. Confirm that Paystack has enabled USD for your merchant account and settlement region before exposing it; otherwise configure a supported currency and update the server catalog consistently. Do not test live transactions with production credentials during development.

## 7. Admin access and operations

Create the first administrator through the admin signup flow using the private `ADMIN_SIGNUP_CODE`, then sign in at `/admin/login`. Do not distribute that code or expose it in browser configuration. Admin APIs are role-protected and can review reservations and update eligible reservation states. Unpaid reservations cannot be marked paid or confirmed by an administrator.

Customer signup is separate from administrator signup. The API signs access tokens with `JWT_SECRET`; use a long random value and rotate it if exposed. Keep MongoDB credentials, payment keys, invitation codes, and webhook secrets on the server only.

## 8. Production checklist and troubleshooting

- Replace all sample listings, imagery, host details, legal copy, and prices with accurate business data.
- Configure production API and frontend URLs, CORS origins, database backups, HTTPS, and private environment variables.
- Use a unique production JWT secret and admin invitation code; restrict who can access the admin signup flow.
- Configure real provider webhook URLs and secrets; confirm currency and merchant account eligibility.
- Build and test the selected frontend; test signup, login, owner-only reservation access, admin-only routes, payment failure, payment success, and webhook retries in provider test mode.
- Monitor API logs and provider events. Keep dependencies updated and do not treat frontend route protection as API authorization.

If a page cannot reach the API, check that the API is running, the base URL is correct, and the frontend origin is in `ALLOWED_ORIGINS`. If MongoDB fails, verify the URI and network access. If a provider is missing from checkout, check its server-side key and supported-currency configuration. If a return page is pending, inspect provider test events and API logs; do not manually mark the booking as paid.

## 9. License and support

The buyer receives the non-exclusive rights stated in the applicable Cardzip purchase terms for the files included in that purchase. A template-only order does not include the separate backend unless the order expressly says so. Do not redistribute or resell the source as a standalone template. Third-party dependencies and assets remain subject to their own licenses. An exclusive transfer or copyright buyout is not implied by a standard template purchase and requires a separate written agreement.

This guide summarizes setup and does not replace the terms shown at purchase or legal advice. Contact Cardzip through the support channel included with your order for delivery questions. The PDF version includes the Cardzip logo and signature mark.
