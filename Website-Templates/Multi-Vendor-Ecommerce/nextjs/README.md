# MarketHub — Next.js

Native Next.js App Router storefront for the MarketHub multi-vendor marketplace. It connects the customer, seller, and administrator experiences to the separate MarketHub API.

## Run locally

```sh
Copy-Item .env.example .env.local
npm install
npm run dev
```

Start the API first; see [`../backend/README.md`](../backend/README.md). Set `NEXT_PUBLIC_MARKETHUB_API_URL` if it is not at `http://localhost:5500/api`. Run `npm run build` for a production build and `npm run typecheck` to check the app-router files.

## Pages

- `/` and `/products` — marketplace home and catalog
- `/products/:slug` — product details and hosted Paystack or Stripe checkout
- `/payment/return` — verify the provider result with the backend
- `/login` and `/signup` — customer or seller account access
- `/dashboard` — signed-in customer's order history
- `/vendor/dashboard` — seller listings and orders
- `/admin/login` and `/admin` — administrator sign-in and protected marketplace dashboard

The backend enforces roles independently of page redirects. Checkout is enabled only when the backend has provider credentials and an explicit USD currency configuration; secrets never belong in this Next.js app. Card and bank details are entered on the provider's hosted checkout. See [`../backend/README.md`](../backend/README.md) for provider setup and webhook configuration.
