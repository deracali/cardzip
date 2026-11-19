# MarketHub Buyer Guide

![Cardzip logo](assets/cardzip-logo.jpg)

## 01 / Choose your storefront

MarketHub includes two separate frontend choices and one shared API:

- `vite/` is the React + Vite storefront. Its local development URL is usually `http://localhost:5173`.
- `nextjs/` is the native Next.js App Router storefront. Its local development URL is usually `http://localhost:3000`.
- `backend/` contains the Express API and MongoDB integration. It listens on `http://localhost:5500` by default.

Choose one frontend to run locally. Both frontends connect to the same API. Check the buyer's order record or separate written agreement for package inclusion and license terms; this guide does not grant or change a license.

## 02 / Prepare

Install Node.js 20.19 or later and npm. Start a reachable MongoDB instance, and have private values ready for `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Paystack and Stripe checkout are available when configured for the storefront's USD catalog.

Never publish `.env` files, database credentials, admin passwords, or JWT secrets. Do not put backend secrets in `VITE_` or `NEXT_PUBLIC_` variables because those values are exposed to browsers.

### Folder map

| Path | Responsibility |
| --- | --- |
| `vite/src/pages/` | Vite route screens for the storefront and account workflows. |
| `vite/src/components/` | Shared storefront, campaign, navigation and portal UI. |
| `vite/src/services/` | MarketHub API client and marketplace-specific session handling. |
| `vite/src/data/` | Catalog presentation data and product display helpers. |
| `nextjs/app/` | Native App Router pages and layout. |
| `nextjs/components/` | Reusable Next.js storefront and portal components. |
| `nextjs/lib/` | Next.js API client, token/session handling and shared helpers. |
| `backend/routes/` and `backend/controllers/` | Public, customer, seller and admin endpoints and request handling. |
| `backend/models/` | MongoDB data store and seeded marketplace state. |
| `backend/middleware/`, `services/`, and `utils/` | Token/role checks, password and token helpers, validation and HTTP errors. |
| `docs/` | This guide, PDF generator, final PDF and Cardzip branding assets. |

## 03 / API setup

In a Windows Command Prompt:

```bat
cd /d "C:\path\to\Multi-Vendor-Ecommerce\backend"
copy .env.example .env
notepad .env
npm install
npm run dev
```

Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`. Add each local or deployed storefront origin to `ALLOWED_ORIGINS`. To enable a payment provider, set its backend-only secret and set its currency to `USD` only if that merchant account supports USD. Stripe also requires its webhook signing secret. Set `MARKETHUB_FRONTEND_URL` to the canonical storefront origin. Keep this API terminal open while using a storefront.

The `.env.example` payment values are intentionally blank; checkout remains disabled until configured. Never put provider secrets in Vite or Next.js environment variables.

## 04 / Choose one frontend

### React + Vite

```bat
cd /d "C:\path\to\Multi-Vendor-Ecommerce\vite"
copy .env.example .env
npm install
npm run dev
```

`VITE_MARKETPLACE_API_URL` defaults to `http://localhost:5500/api`.

### Next.js

```bat
cd /d "C:\path\to\Multi-Vendor-Ecommerce\nextjs"
copy .env.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_MARKETHUB_API_URL` defaults to `http://localhost:5500/api`.

## 05 / Project walkthrough

- **Shop:** Browse public products and open product details at `/products`.
- **Customer:** Create an account, pay through an enabled provider, and review personal order history at `/dashboard`.
- **Seller:** Apply for a shop, wait for approval, publish listings, and review related orders at `/vendor/dashboard`.
- **Administrator:** Review pending seller applications, view marketplace metrics, and update order statuses at `/admin`.

The backend verifies signed sessions and roles for protected API routes. A frontend redirect or hidden page is not the security boundary.

## 06 / Buyer workflow

1. Browse the catalog and choose a product.
2. Create a customer account or sign in. Seller and admin accounts cannot place customer orders.
3. Enter the quantity and shipping address, then choose an enabled Paystack or Stripe option. The API holds available stock for up to 30 minutes while checkout is pending.
4. Complete payment on the provider's hosted checkout. Card and bank details are not handled by the storefront.
5. The backend verifies the provider response and amount before marking the order paid. Check `/dashboard` for order status.

When both provider credentials are blank, checkout is unavailable and no charge is attempted. A paid order arriving after its stock reservation expires is flagged for inventory review. The template does not arrange delivery, send transactional email, or issue refunds.

## 07 / Seller and administrator

Seller signup creates a pending application. An administrator must approve it before the seller can publish listings. Approved sellers use their protected dashboard to manage products and view orders containing those products.

Administrators are provisioned with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the backend environment. There is no public admin signup. The backend checks the admin role on every `/api/admin` request and refuses to elevate an existing non-admin account.

## 08 / Launch checklist

- Use strong production secrets, a private MongoDB deployment, backups, and HTTPS.
- Set `ALLOWED_ORIGINS` to the exact deployed storefront origins.
- Set up provider test credentials and signed webhooks before launch; switch to live credentials only after end-to-end testing.
- Configure Paystack and Stripe webhooks at `/api/payments/paystack/webhook` and `/api/payments/stripe/webhook`.
- Replace sample product details and imagery with accurate listings and assets you have rights to use.
- Configure delivery, customer support, refunds, and transactional notifications separately before accepting real orders.
- Review your order record or separate written agreement for package inclusion and license terms.

### Quick checks

- **Storefront cannot reach API:** confirm the API is running, the API URL is correct, and `ALLOWED_ORIGINS` includes the storefront origin.
- **API cannot start:** verify MongoDB connectivity and the backend environment values.
- **Dashboard access is denied:** sign in with the account role that matches the portal.
- **Provider unavailable:** check that its backend secret is set, its currency is `USD`, the merchant supports USD, and (for Stripe) the webhook secret is configured.
- **Payment not confirmed:** check server logs and provider dashboard/webhook delivery; a redirect alone does not mark an order paid.

## 09 / Buyer license summary

The buyer's order and applicable license terms determine package inclusion and permitted use. This summary does not replace or expand those terms. A template purchase is not an ownership transfer; follow the applicable license for modification, commercial use, redistribution and third-party components.

![Approved Cardzip company signature](assets/cardzip-signature.jpg)
