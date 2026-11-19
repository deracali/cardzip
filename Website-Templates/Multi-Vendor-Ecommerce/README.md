# MarketHub multi-vendor ecommerce

MarketHub is organized as three independent projects:

- [`vite/`](vite/README.md) — React/Vite storefront.
- [`nextjs/`](nextjs/README.md) — native Next.js App Router storefront.
- [`backend/`](backend/README.md) — Express API and MongoDB marketplace state.
- [`docs/MARKETHUB-BUYER-GUIDE.pdf`](docs/MARKETHUB-BUYER-GUIDE.pdf) — printable buyer guide. The Markdown source is [`docs/BUYER-GUIDE.md`](docs/BUYER-GUIDE.md).

## Local setup

1. Start MongoDB and configure `backend/.env` from `backend/.env.example`.
2. In `backend/`, run `npm install` and `npm run dev`.
3. Configure the selected storefront's API URL using its `.env.example`.
4. In either `vite/` or `nextjs/`, run `npm install` and `npm run dev`.

The API listens on port `5500` by default. Configure a strong `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ALLOWED_ORIGINS` before deployment. Do not commit local `.env` files.

## Order and access notes

Customer, seller, and administrator access is enforced by backend role middleware. Seller applications remain pending until approved. The API validates stock and computes totals. Hosted Paystack and Stripe checkout are available when backend-only credentials are configured for USD, with provider verification and signed webhooks. Delivery, refunds, and transactional email are not included.
