# CreatorHub

CreatorHub is a responsive creator landing site with a public creator profile, sign-in screen, and sign-up flow.

## Run locally

```sh
npm install
npm run dev
```

## Pages

- `/` — landing page with features, examples, pricing, and creator links
- `/maya-chen` — sample creator profile and latest drops
- `/login` — sign-in form
- `/signup` — account creation form; `?handle=name` pre-fills the creator handle

The homepage is composed from focused components in `src/components/`. Shared responsive styles live in `src/components/CreatorHub.css`.
