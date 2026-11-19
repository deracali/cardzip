# MarketHub marketplace preview

A responsive, multi-page marketplace storefront built with React and Vite. It includes a storefront, search and category results, product details and reviews, seller shops, deals, a wishlist, a shopping bag, checkout, account forms, and help pages.

## Run locally

```sh
npm install
npm run dev
```

The Vite storefront uses the separate MarketHub API for account, seller, and order workflows. Start the API in [`../backend`](../backend/README.md) and set `VITE_MARKETPLACE_API_URL` in `.env` if it is not at `http://localhost:5500/api`. `VITE_API_BASE_URL` is for the unrelated Cardzip services used by other parts of this larger Vite template.

## Marketplace roles

- Customers can sign up, pay through an enabled provider's hosted checkout, and view their own orders.
- Sellers apply through signup; an administrator must approve them before they can publish products.
- Administrators sign in at `/admin/login`. The backend admin is provisioned with `ADMIN_EMAIL` and `ADMIN_PASSWORD`; public signup cannot create an administrator.

The API recalculates order totals, reserves inventory and verifies payment server-side. Paystack or Stripe is enabled only when the backend has its secret and an explicit matching USD currency configuration; Stripe also requires a webhook signing secret. Checkout never collects card details in the storefront. See [`../backend/README.md`](../backend/README.md) for provider setup.

## Available checks

```sh
npm run lint
npm run build
```

## Buyer guide

The printable guide is in [`../docs/MARKETHUB-BUYER-GUIDE.pdf`](../docs/MARKETHUB-BUYER-GUIDE.pdf). To regenerate it after editing the Markdown source, run `npm run docs:buyer-guide`.

Product photography is loaded from Unsplash. A production deployment should use licensed, locally managed product imagery.
