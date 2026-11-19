# Website project

This folder contains a Next.js website and a separate React/Vite storefront.

See the Cardzip-branded [AI SaaS buyer guide](./docs/CARDZIP-AI-SAAS-BUYER-GUIDE.pdf) for step-by-step installation, admin, and customer dashboard instructions.

- `nextjs/` and `backend/` form the MongoDB-backed website and admin application. Website pages, pricing plans, inquiries, and accounts use the backend API and MongoDB. The admin CRUD dashboard is available at `/admin`.
- `ai-saas-landingpage/` is the separate React/Vite storefront. It remains unchanged and continues to use browser local storage.

## Run the Next.js website and admin

1. In `backend/`, copy `.env.example` to `.env`. Set `MONGODB_URI` to your MongoDB connection string, then configure the database name, admin credentials, `AUTH_SECRET`, and `ALLOWED_ORIGINS`. Never put the MongoDB connection string in a `NEXT_PUBLIC_` variable.
2. Run `npm install` and `npm run dev` from `backend/`.
3. In `nextjs/`, copy `.env.example` to `.env.local`, configure `NEXT_PUBLIC_NEXARA_API_URL` if needed, then run `npm install` and `npm run dev`.
4. Open `http://localhost:3000/admin` and sign in with the configured admin email and password to manage pages, plans, inquiries, and accounts. Create pages and plans before publishing; the database is not pre-seeded.
5. Visitors can sign up or log in, send inquiries, and review admin responses at `http://localhost:3000/dashboard`.

Run API tests from `backend/` with `npm test`. See [backend/README.md](./backend/README.md) for the API routes and MVC structure.
