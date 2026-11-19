# Creator Hub Express API

Standalone Node.js/Express API for the Creator Hub Next.js website. MongoDB stores account data, creator profiles, content, products, subscribers, and payment records. The Vite edition is a separate local preview.

## Local setup

Requirements: Node.js 20.19+, npm, and MongoDB Community Server or MongoDB Atlas.

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Before starting, update `.env` with:

- `MONGODB_URI` — the database connection string
- `JWT_SECRET` — a random secret with at least 32 characters
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — initial platform administrator; password must be 12–128 characters
- `ALLOWED_ORIGINS` and `FRONTEND_URL` — the exact frontend origin

The first successful database startup creates the administrator when no admin account exists. The health endpoint is `http://localhost:5100/health`.

## Public publishing and administration

The Next.js admin sign-in is `/admin/login`; the admin dashboard and all `/api/admin/*` routes require an active administrator session. Admins can create, edit, publish, unpublish and delete platform blog posts, manage Explore destinations, and publish storefront products associated with a creator. Published posts are available at `/blog` and `/blog/:slug`, Explore cards at `/explore`, and admin-managed products at `/store`. Creator content and creator storefront items remain separately managed in the creator dashboard.

Public content endpoints are `GET /api/site/blog`, `GET /api/site/blog/:slug`, `GET /api/site/explore`, and `GET /api/site/store`. Administrative publishing endpoints are under `/api/admin/blog`, `/api/admin/explore`, and `/api/admin/products`; each requires admin authentication.

## Paystack

Paystack settings are intentionally blank in `.env.example`. Set `PAYSTACK_SECRET_KEY`, currency, and the monthly Creator Pro amount in minor units. Create a matching monthly Paystack plan and set its code in `PAYSTACK_PRO_PLAN_CODE`. Product checkout uses the same configured currency. The backend verifies transactions server-side and checks webhook signatures.

Configure the webhook URL as `https://YOUR-API-HOST/api/payments/webhooks/paystack`. Use test keys before enabling live checkout. Do not expose Paystack secret keys to the browser or commit `.env`.

## Production

Set `NODE_ENV=production`, HTTPS origins, secure session cookie settings, a production database with restricted network access, and deployment-managed secrets. Use TLS for all API traffic and back up the database.
