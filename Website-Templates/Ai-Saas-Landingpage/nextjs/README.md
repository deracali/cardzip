# Next.js website

The Next.js app reads website pages and pricing plans from the backend API. Page copy, navigation, pricing, inquiries, and accounts are managed through MongoDB-backed admin endpoints. The admin dashboard is available at `/admin`; customers can sign up or log in and see inquiry replies at `/dashboard`.

## Run locally

1. Start the API and MongoDB as described in [`../backend/README.md`](../backend/README.md).
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_NEXARA_API_URL` to the backend API URL. Keep `MONGODB_URI` in the backend only.
3. Run `npm install` and `npm run dev`, then open [http://localhost:3000](http://localhost:3000).

Sign-up and login create and authenticate database-backed accounts. Contact and plan inquiry forms save to MongoDB. When the customer is signed in while submitting an inquiry, admin replies are shown in that account's client dashboard; guest inquiries are never automatically attached to a later account based solely on matching email. The dashboard does not send email.

Use the admin page to create website pages and plans. Pages marked for navigation are added to the site navigation, and saved pages render from the API at their configured paths. Pricing cards read published plans from the database. Preview pricing is shown only when the API cannot be reached and is accompanied by a warning. The React/Vite storefront in `../ai-saas-landingpage/` is separate and continues to use browser local storage.
