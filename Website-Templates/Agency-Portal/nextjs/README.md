# NOVA Studio — Next.js

This is the Next.js, TypeScript, and Tailwind CSS version of the NOVA Studio React/Vite site. The UI is organized into individual TSX page components in `src/pages`, shared components in `src/components`, and reusable hooks in `src/hooks`.

## Run locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run `npm run build` for a production build and `npm run typecheck` to check the TypeScript app-router files.

## Pages

The optional catch-all route serves the original page experience at `/`, `/work`, `/services`, `/case-studies`, `/about`, `/quote`, `/login`, `/signup`, and `/dashboard`, including case-study detail routes.

The original front-end forms and dashboard remain previews and do not submit data to a backend.
