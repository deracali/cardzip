# CreatorHub

CreatorHub is the Vite preview edition of the creator landing site. It is not connected to the Creator Hub Express/MongoDB service; use the [Next.js edition](../nextjs/README.md) for connected registration, creator/admin dashboards, public creator data, and Paystack checkout.

## Run locally

```sh
npm install
npm run dev
```

## Pages

- `/` — landing page with features, examples, pricing, and creator links
- `/maya-chen` — sample creator profile and latest drops
- `/features`, `/creators`, `/resources`, `/about`, and `/help` — product information, sample creator directory, guides, company information and support
- `/resources/[slug]` — in-depth creator guides
- `/terms` and `/privacy` — draft legal pages; replace and review before launch
- `/login` — sign-in form
- `/signup` — account creation form; `?handle=name` pre-fills the creator handle

The homepage is composed from focused components in `src/components/`. Shared responsive styles live in `src/components/CreatorHub.css`.

The sign-in and sign-up forms and sample creator profiles in this Vite edition are visual previews; they do not create accounts, save newsletter subscribers, or process payments. Use the Next.js edition for the connected Express/MongoDB and Paystack flows.
