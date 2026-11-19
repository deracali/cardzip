# Sizzle&Smile Food Delivery

A responsive restaurant discovery and ordering experience built with React and Vite. Includes food discovery, a restaurant menu and cart, table reservations, demo orders, client order history, and a role-protected administrator workspace.

See the [buyer guide](../docs/buyer-guide.md) for the Vite and Next.js setup, API configuration, protected workflows, and demo-order limitations.

## Development

```sh
npm install
npm run dev
```

## Backend

The Express API and MongoDB setup are documented in [`../backend/README.md`](../backend/README.md). Configure `VITE_API_BASE_URL` in `.env.local`, start the API, and use `/signup` or `/login` for client access. Admin accounts are seeded from backend environment variables and sign in at `/admin/login`.

The `/dashboard` client portal and `/admin` workspace require matching API roles. Checkout stores a demo order without requesting or accepting payment details.

## Checks

```sh
npm run lint
npm run build
```

Routes include `/`, `/restaurant`, `/reserve`, `/track`, `/login`, `/signup`, and `/checkout`. Checkout is a front-end demo only and does not process payments. Food photography is loaded from Unsplash.
