# Kindred NGO — Next.js

Native Next.js App Router frontend for the Kindred NGO template. It uses its own routes and components rather than wrapping the Vite application.

## Start

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_NGO_API_URL` to the backend `/api` URL if it is not `http://localhost:5000/api`. Start the separate API in `../backend` first.

Pages include campaign browsing, donor sign-in and registration, separate donor `/dashboard` and `/dashboard/payments` pages, administrator `/admin`, Paystack checkout and the `/payment/callback` verification page. The API enforces donor/admin role permissions and owns all Paystack requests. Configure `PAYSTACK_SECRET_KEY`, `PAYSTACK_CURRENCY=USD` and `PAYSTACK_CALLBACK_URL` in the backend environment; never put the secret in Next.js or browser configuration. Monthly gifts are charged once and do not renew automatically.

Run `npm run typecheck` and `npm run build` before deployment.
