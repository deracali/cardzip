# Digital Asset Hub — Next.js

The Next.js, TypeScript, and Tailwind CSS version of the Digital Asset Hub React UI.

## Run locally

```sh
npm install
copy .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_DAH_API_URL` in `.env.local` if the API is not at `http://localhost:5000/api`.

Run `npm run typecheck` to check TypeScript and `npm run build` for a production build.

## Pages

- `/` — Exchange dashboard
- `/rates` — Asset rates
- `/bills` — Utility payments
- `/virtual-cards` — Virtual cards
- `/api` — Payments API overview
- `/checkout` — Checkout
- `/login` and `/signup` — Account screens
- `/dashboard` — Authenticated client account and activity
- `/admin` and `/admin/login` — Authenticated operations console

The admin and client pages use separate backend sessions. See `../docs/CARDZIP-DIGITAL-ASSET-HUB-BUYER-GUIDE.pdf` for Express/MongoDB setup and the demo-versus-production boundaries.
