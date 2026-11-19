# MarketHub API

Express API for the separate MarketHub Vite and Next.js storefronts. It stores users, products, and orders in MongoDB.

## Run locally

1. Start MongoDB.
2. Copy `.env.example` to `.env` and set `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Payment provider values are optional.
3. Run:

   ```sh
   npm install
   npm run dev
   ```

The API listens on `http://localhost:5500` by default. `MONGODB_URI` is required. `ALLOWED_ORIGINS` is a comma-separated list of storefront origins; add deployed origins explicitly.

## Roles and routes

- Public: `GET /api/health`, `/api/products`, `/api/shops`; signup accepts customer or seller accounts only.
- Customer: `/api/client/*`; customers can start provider checkout and access only their own dashboard/orders.
- Seller: `/api/vendor/*`; seller applications start pending and must be approved before product management is enabled.
- Administrator: `/api/admin/*`; an administrator is bootstrapped from environment credentials, never from public signup.

Every protected route checks the signed bearer token and role on the server. Passwords are hashed; tokens expire after eight hours. Configure a random `JWT_SECRET` of at least 32 characters for production.

## Payments

The API supports server-initialized Paystack and Stripe checkout for USD orders. `GET /api/payments/providers` reports which providers are enabled. A provider stays disabled unless its secret and an explicit matching currency are configured; Stripe additionally requires its webhook signing secret. Set `PAYSTACK_CURRENCY=USD` or `STRIPE_CURRENCY=USD` only when the corresponding merchant account can charge USD. Prices, shipping, tax, currency, and stock are computed and checked by the API, never accepted from the browser.

Set the optional values in `backend/.env`:

```env
MARKETHUB_FRONTEND_URL=http://localhost:3000
PAYSTACK_SECRET_KEY=
PAYSTACK_CURRENCY=
STRIPE_SECRET_KEY=
STRIPE_CURRENCY=
STRIPE_WEBHOOK_SECRET=
```

Keep all secret values private. Configure Paystack's webhook URL as `https://your-api.example/api/payments/paystack/webhook` and Stripe's webhook URL as `https://your-api.example/api/payments/stripe/webhook`; Stripe should send Checkout Session completion, asynchronous payment failure, and expiration events. Do not mark an order paid based on a browser redirect: the API verifies each transaction/session and validates its amount, currency, order, and provider signature. Stock reservations expire after 30 minutes. Orders paid after their reservation expires are retained for inventory review.

No payment is enabled in a fresh install because the provider credentials and currencies are blank. A live charge or merchant-account currency was not tested; configure provider test credentials and webhooks before launch. The API does not include delivery, refunds, or transactional email integrations.

## Tests

```sh
npm test
```

Tests use the in-memory store and do not require a running MongoDB instance.
