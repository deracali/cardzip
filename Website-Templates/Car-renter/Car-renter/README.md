# Voltigo Rental + Logistics (Vite)

A responsive vehicle-rental site with a renter account, reservation dashboard, and a multi-page admin workspace for bookings, fleet, customers, and settings.

## Development

```sh
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm run build
```

The app uses `/`, `/fleet`, `/book`, `/checkout`, `/login`, and `/signup` routes. Vehicle photography is loaded from Unsplash. Checkout is a front-end demo and does not process payments.

## Local demo accounts and routes

- Admin: `/admin/login` — `admin@voltigo.local` / `Admin123!`
- Renter sign in / registration: `/login` and `/signup`
- Renter trips: `/dashboard`
- Admin workspace: `/admin`

The Vite edition stores demo users, fleet changes, and reservations in this browser's `localStorage`. This is not secure authentication or shared server storage; use only demo data and never enter real passwords, identity details, or payment information. Admin and renter changes are visible to one another in the same browser profile. For production/shared data, use the Next.js website with the Express/MongoDB backend in `../backend`.

To upload fleet photos from the Vite admin page, set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env`. Configure that Cloudinary unsigned preset with a fixed `voltigo/vehicles` folder, image-only formats, and restrictive size/transform limits. The browser uploads the photo to Cloudinary and stores its secure URL with the local fleet listing.

Reservations are requests only. No payment is collected or processed.

## Buyer guide

The buyer guide is available at `/buyer-guide.pdf`. Rebuild the PDF, documentation copy, and both app copies with:

```sh
npm run guide:build
```

The generated guide is also saved as `../docs/CARDZIP-CAR-RENTER-BUYER-GUIDE.pdf` and `../BUYER-GUIDE.pdf`. It includes Express/MongoDB and website installation steps, Cloudinary configuration, the Cardzip logo and signature, a template license draft, and renter-facing rental-term/privacy checklists. The included legal documents are drafts and require review for the actual sale, rental operator, jurisdiction, and deployment.
