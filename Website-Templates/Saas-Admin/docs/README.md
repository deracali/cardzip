# Saasapp Admin buyer guide

- [`SAAS-ADMIN-BUYER-GUIDE.pdf`](./SAAS-ADMIN-BUYER-GUIDE.pdf) is the nine-page Cardzip-branded setup and customization guide.
- [`build-buyer-guide.mjs`](./build-buyer-guide.mjs) regenerates the PDF using the `jspdf` development dependency in `nextjs/`.
- `assets/` contains the Cardzip logo and signature used in the guide.

From `nextjs/`, run `npm install` if needed, then from `docs/` run:

```powershell
node .\build-buyer-guide.mjs
```
