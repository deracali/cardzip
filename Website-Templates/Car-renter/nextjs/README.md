# Voltigo Rental — Next.js

Next.js, TypeScript, and Tailwind CSS frontend for Voltigo Rental. Authentication, fleet listings, administrator-managed Cloudinary vehicle photos, and renter reservations use the separate Node.js Express and MongoDB service in `../backend`.

## Run locally

1. Configure and start the Express API using [the backend README](../backend/README.md).
2. In Command Prompt, configure and start the Next.js website:

```bat
cd /d "C:\path\to\Car-renter\nextjs"
copy .env.example .env.local
notepad .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in `.env.local`. Open [http://localhost:3000](http://localhost:3000). Keep the backend and website running in separate terminals. Run `npm run build` and `npm run typecheck` to validate the website.

## Pages

- `/` and `/fleet` — public website and complete live fleet
- `/delivery` — delivery cargo vans
- `/long-term` — long-term sedan and SUV rentals
- `/book` and `/checkout` — renter reservation request flow
- `/login` and `/signup` — renter sign-in and registration
- `/dashboard` — renter trip and reservation history
- `/admin/login` and `/admin` — administrator sign-in and fleet, booking, and customer management

The Next.js app has no API or database of its own. It calls the standalone Express API configured through `NEXT_PUBLIC_API_URL`; the backend manages MongoDB records, authentication cookies, administrator authorization, and signed Cloudinary uploads. Reservations are requests only, and the demo does not process payments.

The buyer guide is served at `/buyer-guide.pdf`. From the Vite project, run `npm run guide:build` to regenerate the PDF for both website variants.
