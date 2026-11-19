# Remote.ly — Next.js frontend

Native Next.js App Router frontend for the Remote Talent Hub. Start the shared API from `../backend` first, then run `npm install` and `npm run dev` in this folder.

Set `NEXT_PUBLIC_API_URL` in `.env.local` only when the API is not at `http://localhost:5000/api`. The API authoritatively enforces candidate, employer, and admin permissions.

Run `npm run typecheck` and `npm run build` before deployment. For full setup instructions, see the [project README](../README.md).
