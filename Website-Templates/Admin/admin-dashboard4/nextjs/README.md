# Nexus Market Seller Central

A responsive seller administration dashboard for marketplace orders, inventory, vendors, payouts, marketing, analytics, and account settings.

## Development

```sh
npm install
npm run dev
```

Run `npm run build` to create a production build and `npm run preview` to serve it locally.

## Dashboard pages

- `/dashboard` — marketplace overview and fulfillment pipeline
- `/orders` — order list and status views
- `/inventory` — product and stock management
- `/vendors` — seller accounts and payout summaries
- `/payouts` — commission settlement and vendor transfers
- `/checkout` — demo payment checkout
- `/marketing`, `/analytics`, `/settings`, `/help`, and `/api-docs`

Checkout is intentionally in demo mode: it does not collect card details or transfer money. Connect a payment provider through a secure server integration before enabling live payments.
