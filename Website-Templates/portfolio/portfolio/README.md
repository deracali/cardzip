# CreatorHub portfolio

A responsive creator storefront and newsletter archive built with React and Vite.

## Run locally

```sh
npm install
npm run dev
```

## Pages

- `/` — creator shop, newsletter issues, product filters, and signup form
- `/creator/maya-chen` — creator profile and featured links
- `/free-resources` and `/free-resources/:slug` — free resource library and guides
- `/products/:slug` — product details
- `/newsletters` and `/newsletters/issue-:id` — newsletter archive and issues
- `/search?q=...` — product and newsletter search results
- `/services/portfolio-review` — portfolio review details and booking preview
- `/login`, `/signup`, and `/dashboard` — account and dashboard previews
- `/checkout/:slug` — checkout preview

The checkout is a UI demo only. It does not collect card details or process payments. Connect a payment provider and a backend before accepting real orders.

## Validate

```sh
npm run build
npx eslint src/App.jsx
```
