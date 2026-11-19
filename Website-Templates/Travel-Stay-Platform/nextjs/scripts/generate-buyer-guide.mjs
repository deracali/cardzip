import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..", "..");
const require = createRequire(path.join(here, "..", "package.json"));
const { jsPDF } = require("jspdf");
const docsDir = path.join(projectRoot, "docs");
const logo = fs.readFileSync(path.join(docsDir, "assets", "cardzip-logo.jpg"));
const signature = fs.readFileSync(path.join(docsDir, "assets", "cardzip-signature.jpg"));
const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });

const pageWidth = 612;
const pageHeight = 792;
const margin = 52;
const contentWidth = pageWidth - margin * 2;
const colors = {
  ink: [25, 43, 40],
  muted: [91, 109, 104],
  green: [8, 111, 92],
  dark: [9, 54, 46],
  lime: [208, 235, 87],
  pale: [237, 247, 243],
  line: [218, 230, 224],
  white: [255, 255, 255],
  code: [22, 32, 29],
  codeText: [230, 245, 236],
  warning: [255, 247, 229],
};

pdf.setProperties({
  title: "Cardzip Escapes Travel Stay Buyer Guide",
  subject: "Installation, authentication, reservations, payment setup and license overview",
  author: "Cardzip Services Limited",
  creator: "Cardzip Services Limited",
});

function setFill(color) {
  pdf.setFillColor(...color);
}

function setText(color) {
  pdf.setTextColor(...color);
}

function addParagraph(text, x, y, width, options = {}) {
  const { size = 10, leading = size * 1.45, color = colors.muted, font = "normal" } = options;
  pdf.setFont("helvetica", font);
  pdf.setFontSize(size);
  setText(color);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function addLabel(text, x, y, color = colors.green) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setText(color);
  pdf.text(text.toUpperCase(), x, y);
}

function addHeading(text, x, y, size = 19, color = colors.ink) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(size);
  setText(color);
  pdf.text(text, x, y);
}

function addBullet(text, x, y, width) {
  setFill(colors.green);
  pdf.circle(x + 3, y - 3, 2, "F");
  return addParagraph(text, x + 13, y, width - 13, { size: 9.5, leading: 14 });
}

function addCode(lines, x, y, width) {
  const lineHeight = 13;
  const height = 22 + lines.length * lineHeight;
  setFill(colors.code);
  pdf.roundedRect(x, y, width, height, 8, 8, "F");
  setFill(colors.lime);
  pdf.roundedRect(x, y, 4, height, 2, 2, "F");
  pdf.setFont("courier", "normal");
  pdf.setFontSize(8.5);
  setText(colors.codeText);
  pdf.text(lines, x + 14, y + 18, { lineHeightFactor: lineHeight / 8.5 });
  return y + height;
}

function addHeader(section, title, intro) {
  pdf.addImage(logo, "JPEG", margin, 25, 28, 28);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setText(colors.ink);
  pdf.text("CARDZIP", margin + 36, 36);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(colors.muted);
  pdf.text("ESCAPES TRAVEL STAY BUYER GUIDE", margin + 36, 49);
  pdf.setDrawColor(...colors.line);
  pdf.line(margin, 65, pageWidth - margin, 65);
  addLabel(section, margin, 94);
  addHeading(title, margin, 122, 22);
  const y = addParagraph(intro, margin, 147, contentWidth, { size: 10, leading: 14 });
  if (y > 190) throw new Error(`Intro overlaps content on page "${title}".`);
}

function addFooter(pageNumber) {
  pdf.setDrawColor(...colors.line);
  pdf.line(margin, pageHeight - 42, pageWidth - margin, pageHeight - 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  setText(colors.muted);
  pdf.text("CARDZIP SERVICES LIMITED  |  GUIDE v1.0", margin, pageHeight - 26);
  pdf.text(String(pageNumber).padStart(2, "0"), pageWidth - margin, pageHeight - 26, { align: "right" });
}

function addContentPage(pageNumber, section, title, intro, blocks) {
  pdf.addPage();
  addHeader(section, title, intro);
  let y = 192;
  for (const block of blocks) {
    if (block.kind === "heading") {
      addHeading(block.text, margin, y, 12);
      y += 22;
    } else if (block.kind === "paragraph") {
      y = addParagraph(block.text, margin, y, contentWidth, { size: 9.4, leading: 13.5, color: colors.ink }) + 8;
    } else if (block.kind === "bullet") {
      y = addBullet(block.text, margin + 2, y, contentWidth - 4) + 6;
    } else if (block.kind === "code") {
      y = addCode(block.lines, margin, y, contentWidth) + 12;
    } else if (block.kind === "callout") {
      const lines = pdf.splitTextToSize(block.text, contentWidth - 32);
      const height = 30 + lines.length * 13;
      setFill(block.warning ? colors.warning : colors.pale);
      pdf.roundedRect(margin, y, contentWidth, height, 8, 8, "F");
      addLabel(block.label, margin + 14, y + 18, block.warning ? [151, 94, 20] : colors.green);
      addParagraph(block.text, margin + 14, y + 37, contentWidth - 28, { size: 8.8, leading: 12.5, color: colors.ink });
      y += height + 12;
    }
    if (y > pageHeight - 66) throw new Error(`Content overflows page ${pageNumber} ("${title}") at y=${y}.`);
  }
  addFooter(pageNumber);
}

// Cover
setFill(colors.dark);
pdf.rect(0, 0, pageWidth, pageHeight, "F");
setFill(colors.green);
pdf.circle(570, 86, 155, "F");
setFill(colors.dark);
pdf.circle(570, 86, 122, "F");
pdf.addImage(logo, "JPEG", margin, 58, 68, 68);
addLabel("CARDZIP  /  BUYER DOCUMENTATION", margin, 163, colors.lime);
addHeading("Escapes Travel Stay", margin, 226, 31, colors.white);
addHeading("buyer guide", margin, 268, 29, colors.white);
addParagraph(
  "Set up the Next.js or React storefront, connect the secure MVC API, configure customer and admin access, and prepare hosted Paystack or Stripe checkout.",
  margin,
  309,
  430,
  { size: 12, leading: 18, color: [224, 238, 230] },
);
setFill([16, 75, 62]);
pdf.roundedRect(margin, 438, contentWidth, 135, 14, 14, "F");
addLabel("A separated full-stack template", margin + 20, 467, colors.lime);
addHeading("Next.js  /  Vite  /  Express API", margin + 20, 496, 16, colors.white);
addParagraph(
  "Choose one independent frontend. Run the backend separately for authentication, reservations, payment verification, and admin operations.",
  margin + 20,
  521,
  contentWidth - 40,
  { size: 10, leading: 14, color: [224, 238, 230] },
);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(9);
setText([224, 238, 230]);
pdf.text("Prepared for Cardzip customers  |  Version 1.0", margin, 726);
setText(colors.lime);
pdf.text("CARDZIP SERVICES LIMITED", pageWidth - margin, 726, { align: "right" });

addContentPage(1, "01  /  INCLUDED FILES", "What is in your purchase?", "Three separate applications work together. Use the frontend and backend files included in your order.", [
  { kind: "heading", text: "Choose your package" },
  { kind: "bullet", text: "Frontend package: use the purchased Next.js or Vite application. The two frontends are independent alternatives." },
  { kind: "bullet", text: "Full template: includes the chosen frontend plus the MVC Express API, subject to your order confirmation." },
  { kind: "bullet", text: "The API provides authentication, customer reservations, payment-provider verification, and protected admin operations." },
  { kind: "heading", text: "Project folders" },
  { kind: "code", lines: ["nextjs/                 Next.js App Router", "travel-stay-platform/   React + Vite storefront", "backend/                Express MVC API", "docs/                   Buyer guide and PDF assets"] },
  { kind: "callout", label: "Before launch", text: "The stay names, pricing and images are sample content. Confirm rates, availability, currency, policies, and brand assets before accepting real bookings." },
]);

addContentPage(2, "02  /  PREPARE", "Install and configure safely", "Prepare a local development environment before adding payment credentials or publishing the site.", [
  { kind: "heading", text: "Prerequisites" },
  { kind: "bullet", text: "Install Node.js 20.19 or newer and npm. Verify both commands in PowerShell." },
  { kind: "bullet", text: "Provide a reachable MongoDB instance for the API and create a database user with only the permissions the app needs." },
  { kind: "bullet", text: "Keep one terminal for the API and another for the selected frontend." },
  { kind: "code", lines: ["node --version", "npm --version", "Set-Location .\\backend", "Copy-Item .env.example .env"] },
  { kind: "heading", text: "Keep private values private" },
  { kind: "bullet", text: "Never commit .env files, database credentials, admin invitation codes, payment keys, or webhook secrets." },
  { kind: "bullet", text: "VITE_ and NEXT_PUBLIC_ variables are browser-visible. Store private credentials only in backend environment settings." },
  { kind: "callout", label: "Configuration", text: "Set MONGODB_URI, a high-entropy JWT_SECRET, ADMIN_SIGNUP_CODE, and ALLOWED_ORIGINS in backend/.env before starting the API.", warning: true },
]);

addContentPage(3, "03  /  API SETUP", "Start the Express backend", "The backend uses a structured MVC layout. Configure the API before opening either frontend.", [
  { kind: "heading", text: "First run" },
  { kind: "code", lines: ["Set-Location .\\backend", "Copy-Item .env.example .env", "notepad .env", "npm install", "npm run dev"] },
  { kind: "paragraph", text: "Set PORT if needed (default 5000). Fill in MONGODB_URI, JWT_SECRET and ADMIN_SIGNUP_CODE. Set ALLOWED_ORIGINS to exact local or production frontend origins, separated by commas." },
  { kind: "heading", text: "Verify service health" },
  { kind: "bullet", text: "Open http://localhost:5000/api/health and expect a JSON status response." },
  { kind: "bullet", text: "Keep the API terminal open and check its logs for MongoDB connectivity or configuration errors." },
  { kind: "heading", text: "Architecture map" },
  { kind: "bullet", text: "routes/ maps HTTP endpoints to controllers; controllers/ validates requests and coordinates work." },
  { kind: "bullet", text: "middleware/ verifies tokens, roles, and request constraints; services/ handles auth, pricing and provider interactions." },
  { kind: "bullet", text: "models/ and data/ isolate persistent and development storage from HTTP route code." },
]);

addContentPage(4, "04  /  FRONTENDS", "Run Next.js or Vite", "Start only the frontend you purchased or intend to deploy. Each frontend has its own pages and reusable components.", [
  { kind: "heading", text: "Next.js App Router" },
  { kind: "code", lines: ["Set-Location .\\nextjs", "Copy-Item .env.example .env.local", "npm install", "npm run dev"] },
  { kind: "paragraph", text: "Open http://localhost:3000. The independent route pages live in nextjs/app; reusable UI and route screens are maintained in nextjs/src." },
  { kind: "heading", text: "React + Vite" },
  { kind: "code", lines: ["Set-Location .\\travel-stay-platform", "Copy-Item .env.example .env", "npm install", "npm run dev"] },
  { kind: "paragraph", text: "Open the local address Vite prints, normally http://localhost:5173." },
  { kind: "callout", label: "API URL", text: "Next.js uses NEXT_PUBLIC_API_BASE_URL; Vite uses VITE_API_BASE_URL. Both default to http://localhost:5000/api. These are public endpoint addresses, not places for secrets." },
]);

addContentPage(5, "05  /  CUSTOMER FLOW", "Accounts, booking and access", "A booking is not confirmed just because a browser returned to the storefront.", [
  { kind: "bullet", text: "A guest browses the sample catalog, chooses dates and guest count, and signs up or signs in before checkout." },
  { kind: "bullet", text: "The backend calculates prices from its own stay catalog and fees; client-submitted totals are not authoritative." },
  { kind: "bullet", text: "The guest email must match the signed-in customer account. Reservation records are scoped to that account." },
  { kind: "bullet", text: "The API starts a pending reservation and creates a hosted provider session. The payment return page asks the API to verify it." },
  { kind: "bullet", text: "Only successful provider verification confirms payment. The customer dashboard shows only that customer's reservations." },
  { kind: "heading", text: "Access boundaries" },
  { kind: "paragraph", text: "The client dashboard requires a customer token. Admin dashboard and mutation endpoints require an administrator token. Frontend redirects improve navigation but the backend remains the authorization boundary." },
  { kind: "callout", label: "Admin setup", text: "Use the private ADMIN_SIGNUP_CODE for administrator onboarding. Never put the code in frontend source or public environment configuration.", warning: true },
]);

addContentPage(6, "06  /  PAYMENTS", "Configure Paystack and Stripe", "The checkout page requests only server-configured providers and redirects customers to provider-hosted checkout.", [
  { kind: "heading", text: "Private backend settings" },
  { kind: "code", lines: ["PAYSTACK_SECRET_KEY=", "PAYSTACK_SUPPORTED_CURRENCIES=USD", "STRIPE_SECRET_KEY=", "STRIPE_WEBHOOK_SECRET=", "STRIPE_SUPPORTED_CURRENCIES=USD"] },
  { kind: "heading", text: "Webhook destinations" },
  { kind: "bullet", text: "Paystack: https://<your-api-host>/api/webhooks/paystack" },
  { kind: "bullet", text: "Stripe: https://<your-api-host>/api/webhooks/stripe" },
  { kind: "paragraph", text: "Use test credentials and provider test mode for development. Keep credentials only on the API host. The server verifies payment status, amount, currency, reservation and provider reference before confirmation." },
  { kind: "callout", label: "Currency warning", text: "Sample prices are USD. Confirm Paystack USD availability for your merchant account and settlement region. If unavailable, select a supported currency and update the server catalog and provider configuration together.", warning: true },
]);

addContentPage(7, "07  /  ADMIN & LAUNCH", "Admin, launch and support", "Administrator access is role-restricted by API middleware. Complete the production checks before opening the booking flow to customers.", [
  { kind: "heading", text: "Admin workflow" },
  { kind: "bullet", text: "Create an authorized admin account through the admin signup page using the private invitation code." },
  { kind: "bullet", text: "Sign in at /admin/login and inspect reservation states in /admin/dashboard." },
  { kind: "bullet", text: "Update only eligible booking states. The server blocks manually confirming an unpaid reservation." },
  { kind: "heading", text: "Protect the operation" },
  { kind: "bullet", text: "Use unique long JWT and admin-code values in production; rotate exposed credentials immediately." },
  { kind: "bullet", text: "Limit admin account creation and review database users, API logs, and provider webhook deliveries." },
  { kind: "bullet", text: "Ensure production CORS allows only the frontend origins you control." },
  { kind: "heading", text: "Production checks" },
  { kind: "bullet", text: "Replace sample stay names, pictures, rates, host details, content, and cancellation terms with accurate information." },
  { kind: "bullet", text: "Configure database backups, HTTPS, exact CORS origins, frontend API URL, and private server secrets." },
  { kind: "bullet", text: "Test provider success, failure, browser return, webhook replay, and verification paths using test mode." },
  { kind: "paragraph", text: "API connection failure: check health, API URL and ALLOWED_ORIGINS. Provider missing: check backend keys and supported currency. Pending payment: inspect provider test events and API logs; never mark it paid manually." },
  { kind: "callout", label: "Important", text: "Never grant admin role from client-controlled form fields. Keep authorization checks and payment decisions in the backend." },
]);

// License and signature
pdf.addPage();
addHeader("09  /  BUYER LICENSE", "Template license summary", "A plain-language overview for buyers; the terms shown with the applicable Cardzip purchase control.");
let licenseY = 194;
licenseY = addBullet("A standard purchase grants the non-exclusive rights stated in the applicable purchase terms for the files included in that order.", margin, licenseY, contentWidth) + 8;
licenseY = addBullet("A frontend-only order does not include the separate backend unless the order expressly includes it.", margin, licenseY, contentWidth) + 8;
licenseY = addBullet("Do not redistribute, sublicense, or resell the source as a standalone template. Follow all third-party dependency and asset licenses.", margin, licenseY, contentWidth) + 8;
licenseY = addBullet("Exclusive ownership or copyright transfer is not implied by a standard template purchase; it requires a separate written agreement.", margin, licenseY, contentWidth) + 18;
setFill(colors.pale);
pdf.roundedRect(margin, licenseY, contentWidth, 61, 8, 8, "F");
addLabel("Purchase record", margin + 14, licenseY + 21);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(9);
setText(colors.ink);
pdf.text("Buyer / order reference: __________________________________________", margin + 14, licenseY + 42);
pdf.text("Purchase date: __________________________", margin + 14, licenseY + 56);
licenseY += 87;
addLabel("For Cardzip Services Limited", margin, licenseY + 11);
pdf.addImage(signature, "JPEG", margin, licenseY + 17, 128, 52);
pdf.setDrawColor(...colors.line);
pdf.line(margin, licenseY + 72, margin + 162, licenseY + 72);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8);
setText(colors.muted);
pdf.text("Company signature", margin, licenseY + 86);
setFill(colors.warning);
pdf.roundedRect(margin, 687, contentWidth, 43, 8, 8, "F");
addParagraph("This guide is informational and does not replace your order terms or legal advice. Confirm current Cardzip terms before distribution.", margin + 12, 706, contentWidth - 24, { size: 7.7, leading: 10.5, color: colors.ink });
addFooter(9);

const outputName = "CARDZIP-ESCAPES-TRAVEL-STAY-BUYER-GUIDE.pdf";
const output = Buffer.from(pdf.output("arraybuffer"));
const outputs = [
  path.join(docsDir, outputName),
  path.join(projectRoot, "nextjs", "public", outputName),
  path.join(projectRoot, "travel-stay-platform", "public", outputName),
];
for (const outputPath of outputs) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}
console.log(`Generated ${outputName} (${pdf.getNumberOfPages()} pages) in docs and both frontends.`);
