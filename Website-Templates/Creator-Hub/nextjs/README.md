# Creator Hub — Next.js website

The Next.js site connects to the standalone Express/MongoDB service in `../backend`. The Vite edition in `../Creator-hub` remains a local preview and is not connected to this API.

## Requirements

- Node.js 20.19 or later and npm
- MongoDB Community Server or a MongoDB Atlas database
- Paystack merchant account and a monthly plan for Creator Pro (optional until checkout is enabled)

## Run locally

Start the backend in one terminal:

```powershell
cd ..\backend
Copy-Item .env.example .env
npm install
npm run dev
```

Edit `backend/.env` before startup. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and `ADMIN_EMAIL` / `ADMIN_PASSWORD`. The first startup seeds the platform administrator if no admin account exists. Keep `.env` private.

In another terminal:

```powershell
cd ..\nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API health check is [http://localhost:5100/health](http://localhost:5100/health).

## Routes

- `/signup` and `/login` — creator registration and sign-in
- `/features`, `/creators`, `/explore`, `/store`, `/blog`, `/resources`, `/about`, and `/help` — product information, live public creator directory, admin-published destinations, products and stories, guides, company information and support
- `/blog/[slug]` — published platform stories created by an administrator
- `/resources/[slug]` — in-depth creator guides
- `/terms` and `/privacy` — draft legal pages; replace and review before launch
- `/[handle]` — live creator profile loaded from the API
- `/dashboard` — creator Overview, Content, Products, Audience, and Settings
- `/[handle]` — public creator page and newsletter/product storefront
- `/admin/login` and `/admin` — platform admin sign-in and Overview, Creators, Content moderation, Blog publishing, Explore destinations, Store products, Payments, and Settings
- `/payment/return` — verified Paystack checkout result

## Paystack setup

The backend `.env.example` intentionally leaves `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, and `PAYSTACK_PRO_PLAN_CODE` empty. Add Paystack test credentials to the backend `.env` to test checkout. Configure `PAYSTACK_CURRENCY` and `CREATOR_PRO_PRICE_MINOR`, then create a matching monthly plan in Paystack and set its code as `PAYSTACK_PRO_PLAN_CODE`. Creator Pro checkout remains disabled until both the secret key and plan code exist. Never put a secret key in a `NEXT_PUBLIC_*` setting.

Set the Paystack webhook to `https://YOUR-API-HOST/api/payments/webhooks/paystack`. In production, set `FRONTEND_URL` and `ALLOWED_ORIGINS` to the exact HTTPS website origin, configure secure cookie settings, and expose the API over HTTPS. Product prices and payments must use the backend-configured currency.

## Buyer guide and validation

From the Vite Creator Hub project folder, run `npm run guide:build` to generate the buyer guide in `docs/` and copy it to both project public folders.

```sh
npm run typecheck
npm run build
```

Run the backend with `npm test` for its Node test suite.
