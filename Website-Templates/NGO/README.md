# Kindred NGO Hub

Kindred is an NGO fundraising and campaign template. The Vite and Next.js frontends are independent applications, each connected to the Express API in `backend/`.

## Project structure

- `vite/` — React + Vite storefront
- `nextjs/` — native Next.js App Router storefront
- `backend/` — Express API and MongoDB persistence
- `docs/` — buyer guide source, PDF and generator

## Run locally

1. Configure and start MongoDB.
2. In `backend/`, copy `.env.example` to `.env`, set a private `JWT_SECRET` and `ADMIN_SIGNUP_CODE`, then run `npm install` and `npm run dev`.
3. In either `vite/` or `nextjs/`, copy `.env.example` to `.env` or `.env.local`, run `npm install`, then start with `npm run dev`.
4. Open the frontend on `http://localhost:5173` (Vite) or `http://localhost:3000` (Next.js). The API allows those local origins by default.

Run one frontend at a time unless both origins are needed. Both frontends use the same API and data.

## Authentication and pledges

- Public registration creates donor (`client`) accounts only.
- Administrator registration requires the private server-side `ADMIN_SIGNUP_CODE`; dashboard routes are also protected by API role middleware.
- Donors can only view their own pledge records. Administrators can review pledges and acknowledge or cancel them.
- Campaign checkout saves a pledge record; it does not collect card details or process payments. Payment status remains `Not processed`.
- Do not use the sample campaigns or impact figures as verified real-world claims without review.

See [the buyer guide](docs/buyer-guide.md) and its [PDF version](docs/KINDRED-NGO-BUYER-GUIDE.pdf) for setup, operations, customization and deployment notes.
