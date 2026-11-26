# Sizzle&Smile Food Delivery

A responsive restaurant discovery and ordering experience built with React and Vite. Includes food discovery, delivery and deals pages, a restaurant menu and cart, table reservations, demo orders, client order history, and an administrator workspace.

See the [buyer guide](../docs/buyer-guide.md) for Vite and Next.js setup and demo-order limitations.

## Development

```sh
npm install
npm run dev
```

## Vite demo

The Vite version is a browser-only demo and does not call the API. It seeds sample customers and orders so the dashboards have data on first use; sign-in, carts, and demo-order changes stay in local browser storage. Any valid-looking email and password open a local demo session. This is not real authentication or shared order storage.

## Checks

```sh
npm run lint
npm run build
```

Routes include `/`, `/delivery`, `/deals`, `/restaurant`, `/reserve`, `/track`, `/login`, `/signup`, `/checkout`, `/dashboard`, and `/admin`. Checkout is a front-end demo only and does not process payments. Food photography is loaded from Unsplash.
