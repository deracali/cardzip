# Nexara AI — Next.js

This is the Next.js, TypeScript, and Tailwind CSS version of the Nexara AI React/Vite site. The UI is organized into individual TSX page components in `src/pages`, shared components in `src/components`, and reusable hooks in `src/hooks`.

## Run locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run `npm run build` for a production build and `npm run typecheck` to check the TypeScript app-router files.

## Pages

The optional catch-all route serves the page components at `/`, `/features`, `/integrations`, `/pricing`, `/faq`, `/docs`, `/demo`, `/signup`, `/login`, `/contact`, `/checkout`, `/privacy`, and `/terms`. Unrecognized paths render the custom not-found page.

The original forms and checkout remain front-end previews and do not create accounts or process payments.
