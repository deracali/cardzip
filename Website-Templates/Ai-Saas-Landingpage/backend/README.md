# Nexara API

The Node.js API uses a MongoDB database for website pages, plans, inquiries, and user accounts. The backend follows an MVC layout: MongoDB models in `models/`, request controllers in `controllers/`, API routing in `routes/`, and token authorization in `middleware/`. Passwords are stored as scrypt hashes.

## Configure and run

```powershell
Copy-Item .env.example .env
```

Set `MONGODB_URI` to your MongoDB connection string in `backend/.env` (for example, `mongodb://127.0.0.1:27017` for local MongoDB), and set `MONGODB_DB_NAME` if you want a database name other than `nexara`. Also configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), `AUTH_SECRET` (at least 32 characters), and the exact frontend origins in `ALLOWED_ORIGINS`. Never use the example admin credentials in a deployed environment.

For Atlas SRV DNS lookup failures, the backend retries using Cloudflare and Google DNS. If your network permits other resolvers instead, set `MONGODB_DNS_SERVERS` to a comma-separated list of DNS server IPs. If DNS queries are blocked by your network or VPN, allow outbound DNS or use Atlas's standard `mongodb://` driver connection string. Never share or expose the connection string.

```sh
npm install
npm run dev
```

The API listens on `http://127.0.0.1:5001` by default. Set `HOST=0.0.0.0` only when the deployment environment requires external binding. The MongoDB URL belongs only in the backend environment file; never expose it with a `NEXT_PUBLIC_` variable.

## API

- `GET /api/health`
- `GET /api/pages`, `GET /api/pages/:slug` — published website content
- `GET /api/plans` — published pricing data
- `GET /api/docs`, `GET /api/docs/:slug` — published documentation and document contents
- `POST /api/leads` — contact, demo, and plan inquiries
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/leads`
- `POST /api/admin/login`
- `GET|POST /api/admin/pages`, `PATCH|DELETE /api/admin/pages/:id`
- `GET|POST /api/admin/plans`, `PATCH|DELETE /api/admin/plans/:id`
- `GET|POST /api/admin/docs`, `DELETE /api/admin/docs/:id` — publish or remove PDF, TXT, and Markdown files (up to 2 MB)
- `GET|POST /api/admin/leads`, `PATCH|DELETE /api/admin/leads/:id`
- `GET /api/admin/users`, `PATCH|DELETE /api/admin/users/:id`
- `GET|POST /api/admin/agents`, `PATCH|DELETE /api/admin/agents/:id`
- `GET|POST /api/admin/workflows`, `PATCH|DELETE /api/admin/workflows/:id`
- `GET|POST /api/admin/integrations`, `PATCH|DELETE /api/admin/integrations/:id`
- `GET /api/admin/analytics` — collection totals and seven-day saved-record activity

The Next.js admin dashboard manages pages, plans, inquiries, accounts, and uploaded docs through this API. The Vite AI SaaS preview intentionally uses browser `localStorage` instead: its demo accounts, inquiries, replies, and uploaded docs stay in the same browser profile and are not shared with this backend or across devices. The Next.js app uses `NEXT_PUBLIC_NEXARA_API_URL=http://localhost:5001/api`; allow its local origin in `ALLOWED_ORIGINS`. The Vite project's separate marketplace routes may use `VITE_API_BASE_URL`, but that setting is not used by the Nexara landing-page flows.

The admin's pages, plans, inquiries, customers, documentation, agent definitions, workflow definitions, and integration-provider metadata are API-backed and persisted in MongoDB. Agent and workflow records are catalog definitions only; they do not execute AI or workflows. Integration records describe providers only; OAuth authorization and live provider connections are not included. Analytics returns current collection totals and daily record-creation activity for the last seven days, plus page and plan updates. The chart measures saved-record activity, not AI or workflow executions. Settings are informational and do not change server configuration.

Next.js admins can update an inquiry's status and save a response; the response appears in `/dashboard` for the account that was signed in when the inquiry was submitted. Sales inquiries require sign-in so they can be tracked in the client dashboard. Guest trial-setup requests are still sent to the admin inbox but are not attached to an account. Admins can upload PDF, TXT, and Markdown reference docs from the Documentation section; published docs appear on the website `/docs` page. Replies are displayed in the dashboard and are not emailed. Vite demo inquiries and document uploads use local storage and are visible only in that browser.

There are no bundled page or plan records in the Next.js API: add website pages and plans through the dashboard after connecting MongoDB. Next.js public pages and navigation, pricing, sign-up/login, contact and plan inquiry submissions, and client inquiry responses are connected to MongoDB. Missing pages or plans show an empty state; backend connection failures are surfaced in the website rather than silently treated as saved. The Vite landing page has static content and local-storage demo flows.

`npm test` runs API CRUD, authentication, validation, and CORS tests against an isolated in-memory test store; application data is only persisted to MongoDB.
