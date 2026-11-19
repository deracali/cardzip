# Saasapp Admin - Next.js

Native Next.js App Router version of the Saasapp Admin Console. It has its own route pages and UI components; it does not import or embed the React/Vite application.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. No environment file or backend is required for the included demo.

## Routes

- `/dashboard`
- `/analytics`
- `/users`
- `/billing`
- `/system-logs`
- `/settings`
- `/activity`
- `/checkout`
- `/login`
- `/signup`

## Important demo limitations

The interface uses sample data and local interactions. Sign-in and sign-up do not authenticate against a server. User changes are not persisted. Billing, API keys, notifications, and checkout are demonstrations only: no payment processor is connected, no payment is charged, and card details are not stored. Add a real backend, authorization, database, and payment provider before using this as a production service.

## Build and buyer guide

Run `npm run typecheck` and `npm run build` before deployment. See [`../docs/SAAS-ADMIN-BUYER-GUIDE.pdf`](../docs/SAAS-ADMIN-BUYER-GUIDE.pdf) for setup, route, customization, and deployment guidance.
