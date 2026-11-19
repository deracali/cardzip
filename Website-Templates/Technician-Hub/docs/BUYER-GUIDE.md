# Cardzip Technician Hub Buyer Guide

## 1. Product overview

PolarFlow HVAC is a responsive heating and cooling service website with service catalog pages, an estimate calculator, appointment requests, a customer portal, administrator operations pages and an annual maintenance membership. The package includes a Vite storefront, an independent Next.js frontend and an Express/MongoDB API.

The customer experience covers service discovery, ZIP-code entry, appointment request review, customer account creation and private request history. The Home Comfort Plan is a separate USD 199 annual membership with two seasonal tune-ups and priority scheduling. The annual membership is paid once for a 365-day term and does not automatically renew. Individual service appointments are still paid after completed work; this template does not charge for service appointments online.

## 2. Package contents

- `technician-hub/` is the React + Vite storefront.
- `nextjs/` is the independent Next.js App Router frontend using the same product UI and API.
- `backend/` is the Express API, organized into MVC controllers, routes, middleware, models, services and HTTP utilities.
- `docs/` contains this guide, the PDF generator and the generated Cardzip-branded PDF.

The Next.js app uses its own route entry points and React components. It does not embed or run the Vite development server.

## 3. Development setup

Install Node.js and provide a reachable MongoDB database. In `backend/`, copy `.env.example` to `.env`, set `MONGODB_URI`, set a random `JWT_SECRET` with at least 32 characters, and set a private `ADMIN_SIGNUP_CODE`. Install dependencies and run `npm run dev`; the API listens on port `5000` by default.

For Vite, copy `technician-hub/.env.example` to `.env.local`, install dependencies and run `npm run dev`. For Next.js, copy `nextjs/.env.example` to `.env.local`, install dependencies and run `npm run dev`. Both frontends default to `http://localhost:5000/api`; set `VITE_TECHNICIAN_API_URL` or `NEXT_PUBLIC_TECHNICIAN_API_URL` if the API uses another URL.

Set API `ALLOWED_ORIGINS` to the exact frontend origins. When using Next.js for the payment-return flow, set the API's `FRONTEND_URL` to the Next.js origin. Do not copy real production secrets into a frontend environment file.

## 4. Authentication and access control

Customer registration creates a customer role only. The API hashes passwords using scrypt, signs expiring HMAC tokens and checks the account's current role on each protected request. Customer accounts can see their own dashboard data and membership orders. Administrators must use the private invitation code for registration; the API does not expose a public admin bootstrap.

`GET /api/client/dashboard` and all membership endpoints require a customer token. `GET /api/admin/dashboard` and `PATCH /api/admin/bookings/:id` require an admin token. These checks are enforced at the API boundary, not just by hiding frontend pages. Appointment requests submitted while signed in are linked to that customer account. Guest bookings are not linked to any customer based on the submitted email address alone.

## 5. Membership checkout

The API owns the plan price (USD 199) and creates hosted checkouts with either Stripe or Paystack. It verifies the provider reference, membership identifier, amount and USD currency before activating the membership. Signed provider callbacks are accepted at `/api/webhooks/stripe` and `/api/webhooks/paystack`. The UI never collects or stores card details.

Provider credentials are intentionally blank in `backend/.env.example`. For Stripe, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `STRIPE_SUPPORTED_CURRENCIES=USD`. For Paystack, configure `PAYSTACK_SECRET_KEY` and declare `PAYSTACK_SUPPORTED_CURRENCIES=USD` only if the merchant account supports USD settlement. A provider remains unavailable until its key and currency configuration are present; Stripe additionally requires its webhook signing secret. Verify these account settings with the merchant before enabling live checkout.

Membership lasts 365 days from verified payment and is not automatically renewed. The service appointment flow remains a request: final pricing is confirmed before work and the customer pays after completion. No appointment payment processor or dispatch integration is included.

## 6. Main routes and operations

Public routes include `/`, `/services`, `/services/:serviceId`, `/maintenance`, `/about`, `/contact`, `/privacy`, `/terms`, `/warranty`, `/book`, `/checkout` and `/booking-confirmation`. Customer routes include `/portal/login`, `/portal/signup`, `/portal/dashboard` and `/membership/checkout`. Administrator routes include `/admin/login`, `/admin/signup` and `/admin/dashboard`.

Administrators can review appointment contact details, estimates, requested dates and status, then update each request to requested, confirmed, completed or cancelled. The operations dashboard summarizes customers, bookings and active memberships. Customers see only their own appointments and membership.

## 7. Customize the template

Update the service names, descriptions, categories and starting prices in each frontend's `src/TechnicianApp.jsx` (Next.js) and `technician-hub/src/App.jsx` (Vite). Keep service identifiers and server-side price mappings in `backend/controllers/booking-controller.js` aligned. Membership name, currency and amount are server-owned in `backend/services/payment-service.js`; update that source and related tests together if changing the plan price.

Adjust branding and layouts in each frontend's `src/App.css` and `src/Portal.css`. Update service area, telephone, warranty statements and legal copy before launch. The current website content references Austin, TX and sample contact details; replace them with accurate business information.

## 8. Production checklist and limitations

- Configure production MongoDB, a strong `JWT_SECRET`, a private invite code, exact CORS origins, and TLS.
- Configure and verify provider account currency support before enabling either payment option.
- Register Stripe and Paystack webhooks at the documented API paths and test signature verification using provider test accounts.
- Run backend `npm test`; run Vite `npm run lint` and `npm run build`; run Next.js `npm run typecheck` and `npm run build`.
- Replace sample business details, policy, warranty and service-area content. Obtain appropriate legal, tax and privacy review.
- Add production email, password recovery, dispatch scheduling and service invoicing integrations if required; those integrations are not included.

No live provider keys or transactions are supplied or tested by this template. The `.env.example` files contain placeholders only.

## 9. Buyer handover and Cardzip

The template is delivered as source code for the frontend choice and backend components included in the applicable purchase. Confirm the specific order and Cardzip license terms for package scope, permitted deployment and redistribution before resale or production use. Configure the buyer's own infrastructure, domains, MongoDB and merchant accounts; this guide does not transfer third-party provider credentials or accounts.

For support, provide the purchased package name, the failing route or API endpoint, sanitized error details, and the relevant runtime/build versions. Never include API keys, passwords, customer personal data or production payment references in support requests.

**Cardzip Services Limited**
