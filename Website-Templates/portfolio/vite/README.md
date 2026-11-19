# CreatorHub Portfolio — Vite

The Vite frontend for the CreatorHub portfolio template. Public storefront pages share their visual system with the native Next.js app; account features use the Portfolio API in `../backend`.

## Run locally

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `VITE_PORTFOLIO_API_URL` to the backend `/api` URL if it is not `http://localhost:5700/api`. Start the API and MongoDB before using sign-in, dashboards, or review requests.

## Pages

- `/` — creator shop, newsletter, and product listings
- `/creator/maya-chen` — creator profile
- `/free-resources` and `/free-resources/:slug` — resource library
- `/products/:slug` and `/checkout/:slug` — product details and non-payment checkout preview
- `/newsletters` and `/newsletters/issue-:id` — newsletter archive
- `/search?q=...` — product and newsletter search
- `/services/portfolio-review` — authenticated client review-request form
- `/login` and `/signup` — client auth
- `/dashboard` — client-only review request dashboard
- `/admin/login` and `/admin` — administrator sign-in and protected dashboard

Admin registration is disabled in the UI. The backend creates its administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; authorization is enforced by backend roles, not by hidden frontend routes. Review requests do not create bookings or process payments.

## Validate

```powershell
npm run lint
npm run build
npm run docs:buyer-guide
```
