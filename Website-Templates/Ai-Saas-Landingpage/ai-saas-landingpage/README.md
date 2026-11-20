# Nexara Vite preview

This Vite app includes a browser-local demo of the Nexara AI SaaS landing page.

## Run locally

```sh
npm install
npm run dev
```

The Nexara landing page does not call the Nexara backend. Accounts, inquiries, admin replies, and uploaded docs are stored in the browser's `localStorage` for the current origin and browser profile. This is useful for a local preview, but it does not sync inquiries between different visitors, devices, or browsers.

Visit `/admin` to set up a local admin account on first sign-in. Use the same browser profile to review inquiries and publish PDF, TXT, or Markdown documents. Vite document uploads are limited to 1 MB to fit browser storage. Clearing site data removes these demo records.

After local admin sign-in, the Vite admin seeds four sample inquiries and three sample product guides only when their respective browser collections are empty. They are labeled as samples, and existing inquiries or documents are preserved.

The admin also includes example AI agents, workflows, and integrations; these catalogs are static previews, not live integrations. Analytics counts reflect inquiries and documents stored in this browser, while its sample chart is illustrative.

The existing `VITE_API_BASE_URL` and Paystack callback settings in `.env.example` belong to separate marketplace routes in this template; they are not used by the Nexara landing page or its local inquiry/document flows.

For shared customer accounts, admin inquiries, and published documents, use the Next.js app and its configured backend API.
