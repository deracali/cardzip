# Kindred NGO Hub — Buyer Guide

This buyer guide follows the Agency Portal guide's package-comparison, preparation, startup, walkthrough, admin-usage and buyer-license sections. All examples and policies below are specific to Kindred; this guide does not replace the terms attached to a purchase.

![Cardzip logo](assets/cardzip-logo.jpg)

## 01 / Choose your package

This repository separates two frontend choices from the backend. The purchase record determines which delivered files and license scope apply. The Vite frontend is a browser-local demo; the Next.js frontend is the dynamic version connected to the API.

| Package scope | Includes |
| --- | --- |
| Frontend | The Vite or Next.js frontend identified by the order. The API and database source are separate project areas and are included only when the order says so. |
| Full template | The selected frontend plus the Express API source, if the order expressly includes the backend. Configure MongoDB and private server settings before enabling live data. |

Use one frontend at a time; both connect to the same API. A template purchase is not an ownership transfer or permission to redistribute source.

## 02 / Prepare

### Requirements

- Node.js 20.19+ and npm
- MongoDB (local or hosted) for the API
- A private JWT secret of at least 32 characters
- A private admin invitation code

### Project folders

| Folder | Purpose | Local address |
| --- | --- | --- |
| `vite/` | React + Vite frontend | `http://localhost:5173` |
| `nextjs/` | Native Next.js App Router frontend | `http://localhost:3000` |
| `backend/` | Express API + MongoDB | `http://localhost:5000` |
| `docs/` | Buyer guide source, PDF and generator | — |

Never publish `.env` files, MongoDB credentials, Paystack secret keys, admin codes or JWT secrets. The Vite frontend does not use API or payment environment variables. `NEXT_PUBLIC_` variables are sent to browsers and must contain only public settings such as the API URL.

## 03 / Full template: start the backend API

From the project folder, configure the backend environment and start MongoDB before launching the server:

```powershell
Set-Location .\backend
Copy-Item .env.example .env
```

In `backend/.env`, set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SIGNUP_CODE`, `ALLOWED_ORIGINS`, `PAYSTACK_SECRET_KEY` and `PAYSTACK_CALLBACK_URL`. Set `PAYSTACK_CURRENCY=USD` to match the campaign prices. Keep the Paystack secret only on the backend; the example secret is intentionally blank. Then run:

```powershell
npm install
npm run dev
```

The API listens on port `5000` by default. Keep the terminal open. The server requires MongoDB and does not fall back to browser-only storage for live data.

## 04 / Choose one frontend

### Option A — React + Vite

From the project folder:

```powershell
Set-Location .\vite
npm install
npm run dev
```

The Vite version uses localStorage for demo sessions and preview pledges, and includes clearly labeled static sample entries in the donor and admin dashboards. It does not call the backend, process payments, or provide production authentication. No API environment file is required.

### Option B — Next.js

From the project folder:

```powershell
Set-Location .\nextjs
Copy-Item .env.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_NGO_API_URL` defaults to `http://localhost:5000/api`. Paystack checkout and payment verification are handled through the backend; no Paystack secret or public key is placed in Next.js. The Vite and Next.js projects are independent, native applications, not a wrapper around one another.

## 05 / Customize and launch

- Replace the Kindred demo name, campaigns, images, impact figures and organization details with approved, verified material.
- Keep campaign seed data and frontend presentation in sync.
- Use HTTPS, exact production `ALLOWED_ORIGINS`, MongoDB backups and server-side secret storage.
- Check API availability, browser origin, MongoDB connectivity and server logs when sign-in or dashboards fail.
- Run backend tests, Vite lint/build, and Next.js typecheck/build before release.

### Payments and pledge records

The Vite version stores demo pledges in the current browser only; these are not payments or secure financial records. In the Next.js version, checkout redirects to Paystack-hosted checkout. The backend initializes the transaction, verifies its reference, amount and USD currency with Paystack, validates signed webhooks, and only then marks the gift as paid. Donors and admins can review payment history; admins can acknowledge only verified payments.

The monthly selection is charged once and saved as a monthly gift preference. It does not automatically renew. Paystack availability for USD depends on the merchant account and must be confirmed before launch. Configure the backend callback URL to the deployed Next.js `/payment/callback` route and configure the Paystack webhook to `https://<your-api-host>/api/payments/paystack/webhook`. Keep `PAYSTACK_SECRET_KEY` private and set it in the backend environment only. Review nonprofit, tax, privacy and security obligations before accepting real donations.

## 06 / Buyer license summary

This guide is informational and does not amend the purchase terms. The order and applicable license determine whether the buyer may use a frontend alone or the complete frontend/backend source. Follow those terms for commercial use, modification, redistribution and third-party components. A template purchase does not itself transfer copyright or exclusive ownership; any different rights require an explicit written agreement.

![Approved Cardzip company signature](assets/cardzip-signature.jpg)

## 07 / Project walkthrough

Kindred is a nonprofit campaign and giving-site starter. Public visitors can browse campaign pages and begin the giving flow. Next.js donors register or sign in, complete hosted Paystack checkout and review verified payment history. The Next.js administrator portal provides overview, gift-record, payment-history, campaign and settings sections. The Vite version provides a localStorage-only design and workflow preview.

Typical journey:

`Campaign page → Sign in / Create donor account → Paystack checkout → Server verification → Donor payment history`

Administrator journey:

`Admin invitation signup → Admin sign in → Review verified gift/payment history → Acknowledge or cancel`

## 08 / Admin usage

- **Overview:** review donor, campaign, gift and verified payment counts.
- **Payment history:** inspect only transactions confirmed by Paystack on the backend.
- **Gift records:** review donor/campaign details and notes; acknowledge or cancel only a verified payment.
- **Access:** create admin accounts only with the server-side invitation code. API middleware checks roles on each protected endpoint.
- **Donor privacy:** donor dashboards return only pledges owned by the authenticated account.
- **Monthly gifts:** the current monthly choice charges once; it is not a recurring subscription.
- **Payment status:** only a server-verified Paystack transaction is marked `Paid`; browser redirects alone are not proof of receipt or settlement.

Useful commands:

| Project | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm test` | API authorization, pledge validation and CORS tests |
| `vite/` | `npm run lint` / `npm run build` | Lint and production build |
| `nextjs/` | `npm run typecheck` / `npm run build` | Typecheck and production build |

The project is a customizable software template, not legal, tax or fundraising advice.
