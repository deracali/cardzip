# CreatorHub Portfolio buyer guide

This nine-page guide covers the CreatorHub Portfolio storefront, its two frontend choices, the separate backend, client/admin workflows, project layout, setup, launch limitations, and Cardzip buyer license summary. The generated PDF includes the Cardzip logo on every page and the approved Cardzip signature on the final page.

## What is included

- **Vite frontend** — React storefront and custom route handling under `vite/`.
- **Next.js frontend** — native App Router pages under `nextjs/`, using the same creator storefront presentation.
- **Backend** — Express and MongoDB API under `backend/`, including client and admin roles, account handling, review requests, and tests.
- **Documentation** — this source, generated PDF, and `assets/` containing the Cardzip logo and signature.

Choose one frontend and run the backend separately. A database is required for account and request features; the API does not silently substitute sample data when MongoDB is unavailable.

## Client and administrator workflows

Clients register at `/signup`, sign in at `/login`, and use `/dashboard` to submit and track their own portfolio review requests. Each request can include an optional portfolio URL and a description of the feedback they want.

Administrators sign in at `/admin/login` and use `/admin` to review requests, see the registered client list, and mark a request confirmed, declined, or completed. The backend seeds the initial administrator from the private `ADMIN_EMAIL` and `ADMIN_PASSWORD` values; there is no public admin signup. The backend checks the user’s role for every protected API request.

The portfolio review form records a request only; it does not create a calendar booking. The product checkout remains a preview and does not collect card details or process payment.

## Setup summary

1. Install MongoDB and configure `backend/.env` from `.env.example`.
2. Set `MONGODB_URI`, a private `JWT_SECRET` of at least 32 characters, administrator credentials, and exact frontend origins in `CORS_ORIGINS`.
3. Run `npm install` and `npm run dev` from `backend/`.
4. Choose either `vite/` or `nextjs/`, copy its `.env.example`, set its public API URL if needed, install dependencies, and run its development server.
5. Use HTTPS, production database credentials, and secure session handling before launch.

The complete guide is [`CREATORHUB-PORTFOLIO-BUYER-GUIDE.pdf`](./CREATORHUB-PORTFOLIO-BUYER-GUIDE.pdf). After changing the guide, regenerate it from `vite/` with `npm run docs:buyer-guide`.

## Cardzip buyer license summary

The buyer’s order and sale record determine which project packages are included. A frontend-only order covers the purchased frontend; a full-stack order includes the backend only when expressly listed. The ordinary license permits use and modification of the included files for one end product, subject to the purchase terms. It does not grant resale or redistribution of the source as a standalone template, nor transfer copyright or exclusive ownership. A buyout or assignment requires a separate written agreement. Third-party dependencies remain subject to their own licenses.
