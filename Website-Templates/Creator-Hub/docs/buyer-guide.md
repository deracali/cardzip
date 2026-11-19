# Creator Hub buyer guide

This guide covers the Creator Hub files in `Website-Templates/Creator-Hub`. It describes the current project layout and its demonstrated behavior; the buyer's order and executed purchase agreement define what was actually purchased.

## 1. Product and package choices

Creator Hub combines public creator pages, a creator workspace, platform content, a product storefront and administrative tools.

| Folder | Edition | Current behavior |
| --- | --- | --- |
| `Creator-hub/` | React + Vite | Visual preview with sample creator, blog, Explore and storefront routes. Its forms do not create connected accounts, save subscribers or process payments. |
| `nextjs/` | Next.js | Connected public website, creator dashboard and platform-admin interface. Uses the API for persistent accounts and content. |
| `backend/` | Express + MongoDB | API for sessions, creator data, content, products, subscribers and Paystack-backed payment flows. |
| `docs/` | Buyer documentation | Markdown guide, PDF generator and local Cardzip images. |

These are separate frontends, not two halves of one runtime. Confirm from the invoice or signed terms whether your package includes one frontend, the backend, setup assistance or other deliverables.

## 2. Prerequisites and folder map

For local development, install Node.js 20.19 or later and npm. The connected edition also needs an accessible MongoDB database. Paystack is required only if you intend to activate checkout and have the necessary merchant account.

```text
Creator-Hub/
  Creator-hub/   React + Vite preview
  nextjs/        Next.js application
  backend/       Express API and Mongoose models
  docs/          buyer-guide.md, PDF builder, assets/, generated PDF
```

The backend runs separately from Next.js. Keep each process in its own terminal. The Vite edition can run by itself for visual review.

## 3. Backend setup

From the project directory, create the private backend environment file:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and the exact `ALLOWED_ORIGINS`. The example sets the default API port to `5100`. Paystack settings are `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_CURRENCY`, `PAYSTACK_PRO_PLAN_CODE`, and `CREATOR_PRO_PRICE_MINOR`. Keep secret values only on the server; do not commit `.env` or expose provider credentials in `NEXT_PUBLIC_` variables.

Install and start the API:

```powershell
npm install
npm run dev
```

The health endpoint is `http://localhost:5100/health`. Keep the API terminal open while using the connected website.

## 4. Frontend setup

In a second terminal, start Next.js. Its example API URL is `http://localhost:5100/api`; copy `nextjs/.env.example` to `.env.local` only when you need to override it.

```powershell
cd nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open the address printed by Next.js (normally `http://localhost:3000`). Run the Vite preview separately when needed:

```powershell
cd Creator-hub
npm install
npm run dev
```

The Vite edition is not connected to the Express API. Its sign-up, sign-in and sample public pages are visual demonstrations.

## 5. Creator and storefront walkthrough

Visitors can explore the public home page, creator pages, directory, Explore cards, resources, blog and storefront. A creator account can select a public handle and use `/dashboard` to update its profile, publish blog/video/podcast/link entries, manage products, review newsletter subscribers and view product-payment totals.

For a product, enter a clear title, description, price, currency, image and delivery URL. Preview the public listing before publishing. Delivery links can be shared by recipients; use appropriately private, expiring links for sensitive downloads.

Visitors may subscribe to a creator's newsletter. Provide a clear notice and lawful basis, minimize collected details, and implement a working unsubscribe process before using subscriber addresses for marketing.

## 6. Creator and administrator workflows

Creators use the public account flow and the dashboard. The platform administrator signs in separately at `/admin/login` with the account configured through backend environment settings. The admin interface supports creator access/visibility controls, content moderation, payment configuration status, platform blog content and featured Explore cards.

Administrators can create or maintain storefront products for a selected creator. Published items can appear in the public store and on that creator's page. Verify the public view after changing publication or visibility settings.

Paystack is required for live Creator Pro subscription and product checkout. Creator Pro requires an existing Paystack plan whose amount and currency agree with backend configuration. The API initializes and verifies transactions and checks signed webhook requests. Keep payment secrets server-side and confirm provider settings with test transactions before production.

## 7. Limitations, security and deployment

The template does not supply hosting, a Paystack merchant account, guaranteed provider approval, sales, settlement, refunds or legal compliance. Define customer support, refunds, cancellation, privacy and tax procedures for your business.

Before deploying:

- Configure production MongoDB, exact frontend origins, HTTPS, secure cookies and private secrets in the hosting environment.
- Restrict database network access and credentials; back up data and test restoration.
- Verify Paystack callbacks and webhooks, reconcile payment records, and document refund and subscription-cancellation handling.
- Review data collection, retention, access, export and deletion processes for creator profiles and subscribers.
- Replace sample branding and content only with materials you may use; check each package, font, image and media license.

The React local preview is not an access-control boundary. Do not rely on its browser storage or sample login for real administration.

## 8. Buyer license summary

This guide is not a license grant. The confirmed order and executed purchase agreement control the files, usage scope, support and other rights included in a transaction. Do not assume hosting, backend source, payment services or third-party assets are included unless the purchase terms say so.

An ordinary template purchase does not automatically transfer copyright, exclusive rights or ownership. Do not redistribute the source as a standalone competing template. Cardzip pre-existing work and third-party components remain subject to their own ownership and license terms. The PDF's purchase record is for documenting the buyer-specific transaction; it does not replace the agreement.

## Build the designed PDF

The PDF generator reads the local files in `docs/assets/` and writes `CARDZIP-CREATOR-HUB-BUYER-GUIDE.pdf` beside this guide:

```powershell
node docs/build-buyer-guide.mjs
```

The generator reports its output path and page count. The designed guide has nine pages and includes the Cardzip logo, company signature image and buyer-license summary.
