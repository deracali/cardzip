# CreatorHub Portfolio — Next.js

Native Next.js App Router frontend for the CreatorHub portfolio template. It uses dedicated routes and shares its storefront design with the Vite version.

## Run locally

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_PORTFOLIO_API_URL` to the backend `/api` URL if it is not `http://localhost:5700/api`. Start the API and MongoDB before using sign-in, dashboards, or review requests.

## Routes

The Next.js app includes the same storefront, creator profile, resources, products, newsletter archive, search, portfolio-review request, client auth, client dashboard, and admin portal routes as the Vite app. Client-only routes make authenticated API calls, and the API verifies client/admin roles on every protected request.

Admin registration is intentionally unavailable publicly. Configure the initial administrator through the backend environment. Checkout remains a preview and does not process payments.

## Validate

```powershell
npm run typecheck
npm run build
```
