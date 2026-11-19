import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRequire = createRequire(path.join(here, "..", "..", "Agency-Portal", "Agency-portal", "package.json"));
const { jsPDF } = projectRequire("jspdf");

const output = path.join(here, "CARDZIP-TECHNICIAN-HUB-BUYER-GUIDE.pdf");
const logo = fs.readFileSync(path.join(here, "..", "nextjs", "public", "cardzip-logo.jpg"));
const signature = fs.readFileSync(path.join(here, "..", "..", "..", "cardzip-admin", "admin", "public", "cardzip-signature.jpg"));
const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
const pageWidth = 612;
const pageHeight = 792;
const left = 54;
const right = pageWidth - 54;
const width = right - left;
const colors = {
  ink: [24, 39, 35],
  muted: [91, 108, 101],
  green: [8, 111, 76],
  darkGreen: [8, 57, 43],
  lime: [208, 235, 87],
  pale: [241, 247, 243],
  line: [219, 229, 222],
  white: [255, 255, 255],
  code: [22, 32, 29],
  codeText: [230, 245, 236],
  warning: [255, 247, 229],
};

pdf.setProperties({
  title: "Cardzip Technician Hub Buyer Guide",
  subject: "PolarFlow HVAC setup, authentication, payment integration and buyer handover",
  author: "Cardzip Services Limited",
  creator: "Cardzip Services Limited",
});

function fill(color) {
  pdf.setFillColor(...color);
}

function stroke(color) {
  pdf.setDrawColor(...color);
}

function textColor(color) {
  pdf.setTextColor(...color);
}

function box(x, y, w, h, color, radius = 9) {
  fill(color);
  pdf.roundedRect(x, y, w, h, radius, radius, "F");
}

function paragraph(text, x, y, maxWidth, { size = 9.5, color = colors.muted, leading = size * 1.45, font = "normal" } = {}) {
  pdf.setFont("helvetica", font);
  pdf.setFontSize(size);
  textColor(color);
  const lines = pdf.splitTextToSize(text, maxWidth);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function label(text, x, y, color = colors.green) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  textColor(color);
  pdf.text(text.toUpperCase(), x, y);
}

function heading(text, x, y, size = 15, color = colors.ink) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(size);
  textColor(color);
  pdf.text(text, x, y);
}

function bullet(text, x, y, maxWidth, options = {}) {
  fill(options.bulletColor || colors.green);
  pdf.circle(x + 3, y - 3, 2, "F");
  return paragraph(text, x + 13, y, maxWidth - 13, {
    size: options.size || 9.2,
    leading: options.leading || 13.2,
    color: options.color || colors.muted,
  }) + (options.gap ?? 4);
}

function codePanel(lines, x, y, w, h) {
  box(x, y, w, h, colors.code, 7);
  fill(colors.lime);
  pdf.roundedRect(x, y, 4, h, 2, 2, "F");
  pdf.setFont("courier", "normal");
  pdf.setFontSize(8.5);
  textColor(colors.codeText);
  pdf.text(lines, x + 14, y + 18, { lineHeightFactor: 1.5 });
}

function pageHeader(section, title, intro) {
  pdf.addImage(logo, "JPEG", left, 25, 27, 27);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text("CARDZIP", left + 36, 36);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  textColor(colors.muted);
  pdf.text("TECHNICIAN HUB BUYER GUIDE", left + 36, 48);
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, 65, right, 65);
  label(section, left, 91);
  heading(title, left, 118, 22);
  paragraph(intro, left, 141, width, { size: 9.5, leading: 13.2 });
}

function footer(pageNumber) {
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, pageHeight - 39, right, pageHeight - 39);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text("CARDZIP SERVICES LIMITED  |  POLARFLOW HVAC  |  GUIDE v1.0", left, pageHeight - 24);
  pdf.text(`${String(pageNumber).padStart(2, "0")} / 09`, right, pageHeight - 24, { align: "right" });
}

function startContentPage(section, title, intro, pageNumber) {
  pdf.addPage();
  pageHeader(section, title, intro);
  footer(pageNumber);
  return 172;
}

function sectionTitle(text, y) {
  heading(text, left, y, 12);
  return y + 18;
}

function paragraphBlock(title, text, y, options = {}) {
  y = sectionTitle(title, y);
  return paragraph(text, left, y, width, { size: options.size || 9.2, leading: options.leading || 13 }) + (options.gap || 12);
}

function bulletBlock(title, items, y, options = {}) {
  y = sectionTitle(title, y);
  for (const item of items) y = bullet(item, left, y, width, options);
  return y + (options.sectionGap || 6);
}

function callout(title, body, y, options = {}) {
  const h = options.height || 72;
  box(left, y, width, h, options.background || colors.pale, 8);
  label(title, left + 15, y + 20, options.labelColor || colors.green);
  paragraph(body, left + 15, y + 39, width - 30, { size: 8.8, leading: 12, color: options.color || colors.muted });
  return y + h + 14;
}

// Cover
fill(colors.darkGreen);
pdf.rect(0, 0, pageWidth, pageHeight, "F");
fill(colors.green);
pdf.circle(548, 82, 150, "F");
fill(colors.darkGreen);
pdf.circle(548, 82, 120, "F");
pdf.addImage(logo, "JPEG", left, 58, 68, 68);
label("CARDZIP  /  BUYER DOCUMENTATION", left, 166, colors.lime);
heading("Technician Hub", left, 229, 32, colors.white);
heading("buyer guide", left, 269, 32, colors.white);
paragraph(
  "Install, configure and launch PolarFlow HVAC with the React/Vite or Next.js frontend and the separate MVC API. Set up customer and admin access, appointment requests and the annual membership checkout.",
  left,
  309,
  445,
  { size: 11.5, leading: 17, color: [224, 238, 230] },
);
box(left, 438, width, 128, [16, 75, 57], 13);
label("Three separately run applications", left + 21, 469, colors.lime);
heading("Vite  /  Next.js  /  Express API", left + 21, 495, 16, colors.white);
paragraph(
  "One API owns MongoDB data, role permissions and payment verification. Choose either frontend and run the backend separately.",
  left + 21,
  520,
  width - 42,
  { size: 9.5, leading: 13.5, color: [224, 238, 230] },
);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8.5);
textColor([224, 238, 230]);
pdf.text(`Prepared ${new Date().toLocaleDateString("en-GB")}  |  Version 1.0`, left, 727);
textColor(colors.lime);
pdf.text("CARDZIP SERVICES LIMITED", right, 727, { align: "right" });

// 02 Product map
let y = startContentPage(
  "01  /  PRODUCT SCOPE",
  "What is included?",
  "PolarFlow combines a responsive HVAC marketing site with operational customer and administrator portals. The two frontend choices connect to the same API contract.",
  2,
);
y = bulletBlock("Customer experience", [
  "Service catalog, detail pages, ZIP checker and a starting-price calculator for common HVAC jobs.",
  "Appointment flow with service, date, arrival window, customer contact, ZIP and optional notes.",
  "Customer registration, sign-in and a private dashboard for the customer's own requests and membership.",
  "Home Comfort Plan membership checkout at USD 199 for one year, with two tune-ups and priority scheduling.",
], y);
y = bulletBlock("Operations and data", [
  "Administrator dashboard summarizes customer accounts, appointment requests and membership payments.",
  "Administrators can update appointment state: requested, confirmed, completed or cancelled.",
  "MongoDB persists accounts, bookings and membership orders; in-memory storage is used only by automated tests.",
], y);
callout("Scope boundary", "Service visits are appointment requests, not paid online orders. The customer approves the final service price and pays after the work is completed. Membership checkout is separate.", y, { height: 72 });

// 03 Project structure
y = startContentPage(
  "02  /  ARCHITECTURE",
  "Three projects, one workflow",
  "Keep frontend runtime, backend environment and database credentials separate. The Next.js app is not an alias for the Vite source tree.",
  3,
);
y = paragraphBlock("Vite frontend: technician-hub/", "React components in src/App.jsx render the marketing pages, customer portal, administrator dashboard and membership flow. src/services/technicianApi.js sends bearer-token requests to the API.", y);
y = paragraphBlock("Next.js frontend: nextjs/", "An independent Next.js App Router project with its own app entry routes, components, styles and API client. It serves the same PolarFlow experience and can be deployed separately from Vite.", y);
y = paragraphBlock("Express API: backend/", "server.js configures CORS, JSON parsing and raw-body webhook endpoints. controllers/ owns request behavior; routes/ maps endpoints; middleware/ enforces role permissions; services/ handles password and payment operations; models/ persists data.", y);
y = paragraphBlock("Documentation: docs/", "BUYER-GUIDE.md contains setup and operating notes. build-buyer-guide.mjs generates the nine-page Cardzip-branded PDF from the included source and approved logo/signature artwork.", y);
codePanel([
  "Technician-Hub/",
  "  technician-hub/    # Vite frontend",
  "  nextjs/             # Next.js frontend",
  "  backend/            # Express MVC API",
  "  docs/               # Guide and PDF",
], left, y + 2, width, 97);

// 04 Local setup
y = startContentPage(
  "03  /  LOCAL DEVELOPMENT",
  "Install and start the apps",
  "Run the API first. Each frontend has its own package manifest and can be developed independently against the configured API URL.",
  4,
);
y = bulletBlock("1. Configure the backend", [
  "Copy backend/.env.example to backend/.env. Set MONGODB_URI, a random JWT_SECRET with at least 32 characters, ADMIN_SIGNUP_CODE and ALLOWED_ORIGINS.",
  "Run npm install and npm run dev from backend/. Confirm GET /api/health returns status ok.",
], y);
codePanel([
  "Set-Location backend",
  "Copy-Item .env.example .env",
  "npm install",
  "npm run dev",
], left, y, width, 89);
y += 104;
y = bulletBlock("2. Choose a frontend", [
  "Vite: copy technician-hub/.env.example to .env.local and run npm install, then npm run dev in technician-hub/.",
  "Next.js: copy nextjs/.env.example to .env.local and run npm install, then npm run dev in nextjs/.",
  "Both default to http://localhost:5000/api. Update VITE_TECHNICIAN_API_URL or NEXT_PUBLIC_TECHNICIAN_API_URL for a different API host.",
], y);
callout("Next.js payment return", "Set the backend FRONTEND_URL to the selected frontend origin before starting a checkout. For a Next.js run on localhost:3000, set that exact URL and allow it in ALLOWED_ORIGINS.", y, { height: 64 });

// 05 Authentication
y = startContentPage(
  "04  /  ACCOUNTS AND PERMISSIONS",
  "Customer and admin access",
  "The API is the security boundary. A route hidden by the frontend is not treated as authorization; each private endpoint checks the signed-in user and role.",
  5,
);
y = bulletBlock("Customer role", [
  "Public registration creates only a client account. Passwords are stored as scrypt hashes, never as plain text.",
  "GET /api/client/dashboard requires a valid bearer token and returns bookings linked to that customer's account email and memberships owned by that account.",
  "Membership checkout and verification endpoints reject admin accounts and require that the order belongs to the current customer.",
], y);
y = bulletBlock("Administrator role", [
  "Register through /admin/signup with the private ADMIN_SIGNUP_CODE. The API does not expose an unauthenticated first-admin bootstrap.",
  "GET /api/admin/dashboard and PATCH /api/admin/bookings/:id require the admin role. Customer tokens receive HTTP 403.",
  "Change the invitation code after initial setup and restrict backend environment-file access to operators.",
], y);
codePanel([
  "POST /api/auth/signup             # client only",
  "POST /api/auth/admin-signup       # private invite required",
  "GET  /api/client/dashboard        # client role",
  "GET  /api/admin/dashboard         # admin role",
  "PATCH /api/admin/bookings/:id     # admin role",
], left, y, width, 100);

// 06 Payment flow
y = startContentPage(
  "05  /  MEMBERSHIP PAYMENT",
  "Hosted Stripe and Paystack checkout",
  "The annual Home Comfort Plan is server-priced in USD. The buyer's browser never supplies the amount and never receives provider secrets.",
  6,
);
y = bulletBlock("Payment lifecycle", [
  "The signed-in customer chooses a provider. The API creates a pending membership and initializes hosted checkout for exactly USD 199.",
  "The provider sends the customer back to membership/checkout. The frontend submits the provider reference to the API.",
  "The API independently retrieves the provider transaction/session and checks status, reference, membership ID, amount and currency before activation.",
  "Signed Stripe and Paystack webhooks provide an additional server-to-server confirmation path. Repeated confirmations do not extend an already activated membership.",
], y);
y = sectionTitle("Environment keys (secret values stay empty until configured)", y);
codePanel([
  "PAYSTACK_SECRET_KEY=",
  "PAYSTACK_SUPPORTED_CURRENCIES=USD",
  "STRIPE_SECRET_KEY=",
  "STRIPE_WEBHOOK_SECRET=",
  "STRIPE_SUPPORTED_CURRENCIES=USD",
], left, y, width, 105);
y += 119;
callout("Merchant configuration", "Enable USD only when the merchant account is authorized to process USD. Stripe is hidden until its secret, webhook secret and currency declaration are set; Paystack requires its secret and supported-currency declaration. No live credentials or transactions are included.", y, { background: colors.warning, height: 80, labelColor: [139, 90, 0] });

// 07 Customization
y = startContentPage(
  "06  /  CUSTOMIZATION",
  "Adapt the site to your HVAC business",
  "Replace sample business details and align client-visible content with the operational API before launch.",
  7,
);
y = bulletBlock("Catalog and plan", [
  "Edit names, descriptions, categories, display prices and service identifiers in each frontend's TechnicianApp.jsx or Vite App.jsx.",
  "Keep backend/controllers/booking-controller.js service identifiers and server-side starting-price values aligned with the public catalog.",
  "The Home Comfort Plan price and USD currency are owned by backend/services/payment-service.js. Update pricing, tests and buyer documentation together.",
], y);
y = bulletBlock("Brand and business content", [
  "Update layout and responsive styles in each frontend's App.css and Portal.css; replace the PolarFlow brand mark and color tokens as needed.",
  "Review phone number, city, service area, appointment availability, warranty language, policy copy and contact details.",
  "Update page titles, metadata, footer links and the buyer-guide descriptions after renaming or changing product features.",
], y);
y = bulletBlock("Request operations", [
  "The public appointment endpoint calculates its estimate on the server and ignores client-supplied prices.",
  "Booking status transitions are admin-controlled. Add dispatch, email notifications or invoicing only after selecting the production provider and operational workflow.",
], y);
callout("Keep the API authoritative", "Do not move provider keys into VITE_ or NEXT_PUBLIC_ variables. Those values are bundled into browser code and are not suitable for secrets.", y, { height: 67 });

// 08 Deployment
y = startContentPage(
  "07  /  DEPLOYMENT AND TESTING",
  "Launch readiness checklist",
  "Deploy the API and one frontend, or deploy both frontends to separate domains. Configure origins and payment return URLs to match the chosen deployment.",
  8,
);
y = bulletBlock("Infrastructure and operations", [
  "Use HTTPS, managed MongoDB backups, a strong unique JWT_SECRET, a private admin invitation and exact ALLOWED_ORIGINS values.",
  "Keep backend .env on the server only. Restrict its file permissions and rotate any credential that is exposed.",
  "Configure provider sandbox and production webhook URLs at /api/webhooks/stripe and /api/webhooks/paystack. Confirm event signatures and delivery status with each provider.",
  "Set FRONTEND_URL to the exact active storefront origin; allow both Vite and Next.js only if both are deployed.",
], y);
y = bulletBlock("Validation commands", [
  "Backend: npm test from backend/.",
  "Vite: npm run lint and npm run build from technician-hub/.",
  "Next.js: npm run typecheck and npm run build from nextjs/.",
  "Before live mode, verify account role rejection, customer data isolation, server-calculated booking prices, provider amount/currency checks, failed/cancelled checkout and webhook signatures.",
], y);
callout("Not included", "No live provider secrets or completed live transaction are supplied. Email password recovery, automatic membership renewal, service dispatch, online service invoicing and tax calculation require additional configuration or implementation.", y, { background: colors.warning, height: 78, labelColor: [139, 90, 0] });

// 09 Handover and signature
y = startContentPage(
  "08  /  BUYER HANDOVER",
  "Delivery, license and support",
  "Confirm package scope and applicable usage rights against the buyer's order and current Cardzip license terms.",
  9,
);
y = bulletBlock("Included in the source package", [
  "Vite and Next.js frontend choices, an Express MVC API, MongoDB persistence model, role-protected customer/admin API, annual hosted membership checkout and focused API tests.",
  "A setup README, backend environment example, frontend API URL examples and this buyer guide in Markdown and PDF.",
], y);
y = bulletBlock("Buyer responsibilities", [
  "Provide hosting, domain names, MongoDB and approved merchant accounts. Configure private secrets and verify provider currency availability.",
  "Replace sample company details, review applicable law and tax rules, complete privacy and warranty review, and operate backups and access controls.",
  "Follow the purchased package's license for production use, modification, redistribution and resale. Order-specific terms govern if they differ from this general guide.",
], y);
y = paragraphBlock("Support handover", "Include the purchased package name, affected route or endpoint, sanitized error message and runtime versions in a support request. Do not send passwords, API keys, payment card information, full customer records or production payment references.", y);
box(left, y + 4, 230, 104, colors.pale, 8);
pdf.addImage(signature, "JPEG", left + 14, y + 14, 122, 49);
stroke(colors.line);
pdf.line(left + 14, y + 69, left + 155, y + 69);
paragraph("Cardzip Services Limited", left + 14, y + 84, 200, { size: 8, color: colors.ink, font: "bold" });
paragraph("Cardzip signature", left + 14, y + 98, 200, { size: 7.5 });
paragraph("Prepared by Cardzip Services Limited for the PolarFlow HVAC buyer. Confirm the applicable order and license terms at purchase.", left + 255, y + 33, width - 255, { size: 8.4, leading: 12 });

fs.writeFileSync(output, Buffer.from(pdf.output("arraybuffer")));
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`);
