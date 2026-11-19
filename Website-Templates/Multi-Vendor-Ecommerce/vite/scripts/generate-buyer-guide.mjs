import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../../docs/MARKETHUB-BUYER-GUIDE.pdf");
const logo = await readFile(path.resolve(here, "../../docs/assets/cardzip-logo.jpg"));
const signature = await readFile(path.resolve(here, "../../docs/assets/cardzip-signature.jpg"));
const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
const pageWidth = 612;
const pageHeight = 792;
const left = 54;
const right = pageWidth - left;
const contentWidth = right - left;
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
  title: "MarketHub Buyer Guide",
  subject: "Setup, marketplace workflows, and buyer guidance",
  author: "Cardzip",
  creator: "Cardzip",
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

function roundedBox(x, y, width, height, color, radius = 10) {
  fill(color);
  pdf.roundedRect(x, y, width, height, radius, radius, "F");
}

function addParagraph(text, x, y, width, options = {}) {
  const { size = 10, color = colors.muted, leading = size * 1.45, font = "normal" } = options;
  pdf.setFont("helvetica", font);
  pdf.setFontSize(size);
  textColor(color);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function paragraphHeight(text, width, size, leading) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(size);
  return pdf.splitTextToSize(text, width).length * leading;
}

function addLabel(text, x, y, color = colors.green) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  textColor(color);
  pdf.text(text.toUpperCase(), x, y);
}

function addHeading(text, x, y, size = 18, color = colors.ink) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(size);
  textColor(color);
  pdf.text(text, x, y);
}

function addCodePanel(lines, x, y, width, options = {}) {
  const fontSize = options.fontSize ?? 9;
  const lineHeight = options.lineHeight ?? 14;
  const height = 22 + lines.length * lineHeight;
  roundedBox(x, y, width, height, colors.code, 8);
  fill(colors.lime);
  pdf.roundedRect(x, y, 4, height, 2, 2, "F");
  pdf.setFont("courier", "normal");
  pdf.setFontSize(fontSize);
  textColor(colors.codeText);
  pdf.text(lines, x + 15, y + 20, { lineHeightFactor: lineHeight / fontSize });
  return height;
}

function addPageHeader(section, title, intro) {
  pdf.addImage(logo, "JPEG", left, 28, 27, 27);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text("CARDZIP", left + 36, 39);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  textColor(colors.muted);
  pdf.text("MARKETHUB BUYER GUIDE", left + 36, 51);
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, 69, right, 69);
  addLabel(section, left, 99);
  addHeading(title, left, 127, 23);
  addParagraph(intro, left, 151, contentWidth, { size: 10, leading: 14 });
}

function addFooter(pageNumber) {
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, pageHeight - 42, right, pageHeight - 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text("CARDZIP  |  MARKETHUB  |  BUYER GUIDE v1.0", left, pageHeight - 26);
  pdf.text(String(pageNumber).padStart(2, "0"), right, pageHeight - 26, { align: "right" });
}

function addSectionTitle(title, x, y) {
  addHeading(title, x, y, 12);
}

function addBullet(text, x, y, width, options = {}) {
  fill(options.bulletColor ?? colors.green);
  pdf.circle(x + 3, y - 3, 2, "F");
  return addParagraph(text, x + 13, y, width - 13, {
    size: options.size ?? 9.5,
    leading: options.leading ?? 13.5,
    color: options.color ?? colors.muted,
  });
}

function addFooterAndNewPage(pageNumber) {
  addFooter(pageNumber);
  pdf.addPage();
}

function addFolderRow(folder, purpose, url, y) {
  roundedBox(left, y, contentWidth, 48, colors.pale, 7);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(9.5);
  textColor(colors.ink);
  pdf.text(folder, left + 13, y + 20);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  textColor(colors.muted);
  pdf.text(purpose, left + 155, y + 20);
  pdf.text(url, left + 155, y + 35);
}

// Cover
fill(colors.darkGreen);
pdf.rect(0, 0, pageWidth, pageHeight, "F");
fill(colors.green);
pdf.circle(548, 86, 150, "F");
fill(colors.darkGreen);
pdf.circle(548, 86, 120, "F");
pdf.addImage(logo, "JPEG", left, 62, 66, 66);
pdf.setFont("helvetica", "bold");
pdf.setFontSize(11);
textColor(colors.lime);
pdf.text("CARDZIP  /  BUYER DOCUMENTATION", left, 166);
pdf.setFontSize(34);
textColor(colors.white);
pdf.text("MarketHub", left, 225);
pdf.text("buyer guide", left, 266);
addParagraph(
  "Set up the Vite or Next.js storefront with its separate API. Learn how customer orders, seller applications and administrator access work before using the marketplace.",
  left,
  304,
  430,
  { size: 12, leading: 18, color: [224, 238, 230] },
);
roundedBox(left, 435, contentWidth, 125, [16, 75, 57], 14);
addLabel("Three separate apps", left + 22, 466, colors.lime);
addHeading("Vite  /  Next.js  /  Express API", left + 22, 492, 17, colors.white);
addParagraph(
  "Choose one storefront. Run the backend separately when you need account, seller or order data.",
  left + 22,
  517,
  contentWidth - 44,
  { size: 10, leading: 14, color: [224, 238, 230] },
);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(9);
textColor([224, 238, 230]);
pdf.text("Version 1.0", left, 726);
textColor(colors.lime);
pdf.text("CARDZIP", right, 726, { align: "right" });

// Storefront choices and project layout
addFooterAndNewPage(1);
addPageHeader(
  "01  /  CHOOSE YOUR STOREFRONT",
  "Two frontends. One marketplace API.",
  "The Vite and Next.js projects are separate storefront choices. Both connect to the same MarketHub backend and use the same customer, seller and administrator roles.",
);
const cardY = 192;
const cardGap = 14;
const cardWidth = (contentWidth - cardGap) / 2;
roundedBox(left, cardY, cardWidth, 221, colors.pale);
addLabel("Option A", left + 18, cardY + 28);
addHeading("React + Vite", left + 18, cardY + 54, 17);
let y = cardY + 82;
y = addBullet("Standalone React storefront in the vite folder.", left + 18, y, cardWidth - 36);
y += 9;
y = addBullet("Local development normally uses http://localhost:5173.", left + 18, y, cardWidth - 36);
y += 9;
addBullet("Start with npm run dev from the vite folder.", left + 18, y, cardWidth - 36);

const nextX = left + cardWidth + cardGap;
roundedBox(nextX, cardY, cardWidth, 221, [230, 244, 235]);
addLabel("Option B", nextX + 18, cardY + 28);
addHeading("Next.js", nextX + 18, cardY + 54, 17);
y = cardY + 82;
y = addBullet("Native Next.js App Router storefront in the nextjs folder.", nextX + 18, y, cardWidth - 36);
y += 9;
y = addBullet("Local development normally uses http://localhost:3000.", nextX + 18, y, cardWidth - 36);
y += 9;
addBullet("Start with npm run dev from the nextjs folder.", nextX + 18, y, cardWidth - 36);

roundedBox(left, 438, contentWidth, 120, colors.warning);
addLabel("Shared backend", left + 18, 464, [151, 94, 20]);
addParagraph(
  "The backend folder contains the Express API and MongoDB integration. It normally listens at http://localhost:5500. Keep it running in its own terminal while using either storefront.",
  left + 18,
  489,
  contentWidth - 36,
  { size: 10, leading: 15, color: colors.ink },
);
addParagraph(
  "This guide covers the project files. License scope and purchase-specific inclusions are determined by the buyer's order record or separate written agreement.",
  left,
  594,
  contentWidth,
  { size: 9.5, leading: 14 },
);
addFooter(2);

// Prerequisites and folder map
pdf.addPage();
addPageHeader(
  "02  /  PREPARE",
  "Before you run anything",
  "Open the extracted project in File Explorer. Use a separate Command Prompt for the API and the storefront you choose.",
);
addSectionTitle("You will need", left, 203);
let bulletY = 229;
bulletY = addBullet("Node.js 20.19 or later and npm. Verify with node --version and npm --version.", left, bulletY, contentWidth);
bulletY += 12;
bulletY = addBullet("A reachable MongoDB instance and its connection string.", left, bulletY, contentWidth);
bulletY += 12;
addBullet("Private values for JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD. Optional payments need provider secrets and USD support.", left, bulletY, contentWidth);

addSectionTitle("Project folders", left, 323);
addFolderRow("vite/", "src/pages, components, services and data", "public/ images and icons; port 5173", 342);
addFolderRow("nextjs/", "app/ routes, components/ and lib/ API client", "public/ assets; port 3000", 399);
addFolderRow("backend/", "routes/, controllers/ and models/", "middleware/, services/ and utils/; port 5500", 456);
addFolderRow("docs/", "Buyer source, PDF generator and brand assets", "MARKETHUB-BUYER-GUIDE.pdf", 513);
roundedBox(left, 579, contentWidth, 74, [230, 244, 235], 9);
addLabel("Keep secrets private", left + 16, 603);
addParagraph(
  "Never publish .env files, database credentials, admin passwords or JWT secrets. Do not put backend secrets in VITE_ or NEXT_PUBLIC_ variables; those values are exposed to browsers.",
  left + 16,
  625,
  contentWidth - 32,
  { size: 9, leading: 13, color: colors.ink },
);
addFooter(3);

// Backend setup
pdf.addPage();
addPageHeader(
  "03  /  API SETUP",
  "Start the backend API",
  "The API provides authentication, product data, vendor approval, payment checkout and protected dashboards. MongoDB must be reachable before the server starts.",
);
addSectionTitle("1. Configure the API", left, 204);
addParagraph(
  "Open a Windows Command Prompt in the extracted project and copy the sample settings:",
  left,
  227,
  contentWidth,
  { size: 9.5, leading: 14 },
);
addCodePanel(
  [
    'cd /d "C:\\path\\to\\Multi-Vendor-Ecommerce\\backend"',
    "copy .env.example .env",
    "notepad .env",
  ],
  left,
  269,
  contentWidth,
);
addParagraph(
  "Set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD in .env. Keep the admin password and signing secret private. Add payment secrets only on the backend; set provider currency to USD only when the merchant account supports it. Stripe also needs its webhook signing secret.",
  left,
  346,
  contentWidth,
  { size: 9.5, leading: 14 },
);
addSectionTitle("2. Install and run", left, 405);
addCodePanel(
  [
    "npm install",
    "npm run dev",
  ],
  left,
  430,
  contentWidth,
);
addParagraph(
  "Keep this terminal open. The API listens on port 5500 by default. Both storefronts use http://localhost:5500/api unless their environment setting is changed.",
  left,
  498,
  contentWidth,
  { size: 9.5, leading: 14 },
);
roundedBox(left, 570, contentWidth, 74, colors.warning, 9);
addLabel("If the server will not start", left + 16, 595, [151, 94, 20]);
addParagraph(
  "Check MongoDB connectivity and the .env values first. The API exits when MONGODB_URI or the required production admin settings are missing or invalid.",
  left + 16,
  617,
  contentWidth - 32,
  { size: 9, leading: 13, color: colors.ink },
);
addFooter(4);

// Frontend setup
pdf.addPage();
addPageHeader(
  "04  /  CHOOSE ONE FRONTEND",
  "Run Vite or Next.js",
  "Use a separate terminal from the API. Choose one storefront for local testing; each one can be built and deployed independently.",
);
roundedBox(left, 190, contentWidth, 204, colors.pale, 10);
addLabel("Option A", left + 17, 216);
addHeading("React + Vite", left + 17, 241, 16);
addParagraph(
  "Copy .env.example to .env and keep VITE_MARKETPLACE_API_URL set to the MarketHub API. Then install and start the app:",
  left + 17,
  263,
  contentWidth - 34,
  { size: 9, leading: 13 },
);
addCodePanel(
  [
    'cd /d "C:\\path\\to\\Multi-Vendor-Ecommerce\\vite"',
    "copy .env.example .env",
    "npm install",
    "npm run dev",
  ],
  left + 17,
  310,
  contentWidth - 34,
  { fontSize: 8.3, lineHeight: 12 },
);

roundedBox(left, 409, contentWidth, 204, [230, 244, 235], 10);
addLabel("Option B", left + 17, 435);
addHeading("Next.js", left + 17, 460, 16);
addParagraph(
  "Copy .env.example to .env.local if you need to change NEXT_PUBLIC_MARKETHUB_API_URL. Then install and start the app:",
  left + 17,
  482,
  contentWidth - 34,
  { size: 9, leading: 13 },
);
addCodePanel(
  [
    'cd /d "C:\\path\\to\\Multi-Vendor-Ecommerce\\nextjs"',
    "copy .env.example .env.local",
    "npm install",
    "npm run dev",
  ],
  left + 17,
  529,
  contentWidth - 34,
  { fontSize: 8.3, lineHeight: 12 },
);
addParagraph(
  "Open the local URL printed by the selected frontend terminal. Keep the API terminal running at the same time.",
  left,
  638,
  contentWidth,
  { size: 9, leading: 13 },
);
addFooter(5);

// Marketplace walkthrough
pdf.addPage();
addPageHeader(
  "05  /  PROJECT WALKTHROUGH",
  "What the marketplace does",
  "MarketHub is a multi-vendor storefront template. Product browsing is public, while customer checkout, seller and administrator actions use authenticated API routes.",
);
addLabel("Main experiences", left, 205);
const experienceRows = [
  ["Shop", "Browse active products, open product details and pay through an enabled provider.", "/products"],
  ["Customer", "Create an account, complete hosted checkout and review your order history.", "/dashboard"],
  ["Seller", "Apply for a shop, wait for approval, publish listings and review related orders.", "/vendor/dashboard"],
  ["Administrator", "Review seller applications, view marketplace metrics and update order statuses.", "/admin"],
];
let experienceY = 223;
for (const [title, body, route] of experienceRows) {
  roundedBox(left, experienceY, contentWidth, 58, colors.pale, 8);
  addHeading(title, left + 14, experienceY + 21, 10.5);
  addParagraph(body, left + 112, experienceY + 19, contentWidth - 195, { size: 8.4, leading: 11.2, color: colors.ink });
  pdf.setFont("courier", "normal");
  pdf.setFontSize(8);
  textColor(colors.green);
  pdf.text(route, right - 12, experienceY + 43, { align: "right" });
  experienceY += 67;
}
roundedBox(left, 508, contentWidth, 108, colors.warning, 9);
addLabel("Access is checked by the API", left + 16, 534, [151, 94, 20]);
addParagraph(
  "A hidden page or frontend redirect is not the security boundary. The backend verifies each signed session and role before returning protected customer, seller or administrator data.",
  left + 16,
  557,
  contentWidth - 32,
  { size: 9, leading: 13, color: colors.ink },
);
addFooter(6);

// Buyer order flow
pdf.addPage();
addPageHeader(
  "06  /  BUYER WORKFLOW",
  "Pay and follow your order",
  "Use a customer account for shopping. Available providers open hosted checkout; the API verifies payment before confirming the order.",
);
addSectionTitle("Typical customer flow", left, 203);
const flowRows = [
  ["1", "Browse", "Open the catalog or a product page. Product listings are available without signing in."],
  ["2", "Sign in", "Create a customer account or sign in. Seller and administrator accounts cannot place customer orders."],
  ["3", "Provide details", "Enter quantity and shipping address, then choose an enabled provider. Stock is reserved for up to 30 minutes."],
  ["4", "Pay securely", "Complete hosted checkout. The API validates the provider, amount, currency and order before confirming payment."],
  ["5", "Track status", "Keep the order reference and check My orders in the customer dashboard for updates."],
];
let flowY = 226;
for (const [number, title, body] of flowRows) {
  fill(colors.green);
  pdf.circle(left + 12, flowY - 3, 11, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  textColor(colors.white);
  pdf.text(number, left + 12, flowY, { align: "center" });
  addHeading(title, left + 34, flowY, 10.5);
  const nextY = addParagraph(body, left + 34, flowY + 18, contentWidth - 42, { size: 9, leading: 12.5, color: colors.muted });
  flowY = nextY + 17;
}
roundedBox(left, 575, contentWidth, 70, colors.warning, 9);
addLabel("Providers are optional", left + 16, 599, [151, 94, 20]);
addParagraph(
  "Blank provider credentials keep checkout disabled. Enable Paystack or Stripe only when configured for USD; signed webhooks and server verification confirm payments. Delivery, refunds and transactional email are not included.",
  left + 16,
  620,
  contentWidth - 32,
  { size: 8.7, leading: 12, color: colors.ink },
);
addFooter(7);

// Seller and administrator usage
pdf.addPage();
addPageHeader(
  "07  /  SELLER AND ADMIN",
  "Manage shops and marketplace orders",
  "Seller and administrator portals are separate from customer accounts. Public signup cannot create an administrator.",
);
const sellerBoxY = 190;
const halfWidth = (contentWidth - 14) / 2;
roundedBox(left, sellerBoxY, halfWidth, 230, colors.pale, 10);
addLabel("Seller workspace", left + 16, sellerBoxY + 27);
addHeading("Apply, then list", left + 16, sellerBoxY + 53, 16);
let sellerY = sellerBoxY + 79;
sellerY = addBullet("Choose Open a shop or select seller signup.", left + 16, sellerY, halfWidth - 32);
sellerY += 7;
sellerY = addBullet("The application starts pending until an administrator reviews it.", left + 16, sellerY, halfWidth - 32);
sellerY += 7;
addBullet("After approval, use the seller dashboard to publish products and review orders containing your listings.", left + 16, sellerY, halfWidth - 32);

const adminX = left + halfWidth + 14;
roundedBox(adminX, sellerBoxY, halfWidth, 230, [230, 244, 235], 10);
addLabel("Administrator workspace", adminX + 16, sellerBoxY + 27);
addHeading("Review and manage", adminX + 16, sellerBoxY + 53, 16);
let adminY = sellerBoxY + 79;
adminY = addBullet("Open /admin/login and sign in with the account provisioned from backend environment settings.", adminX + 16, adminY, halfWidth - 32);
adminY += 7;
adminY = addBullet("Review pending seller applications and approve or reject them.", adminX + 16, adminY, halfWidth - 32);
adminY += 7;
addBullet("Review marketplace metrics and update order statuses from the protected dashboard.", adminX + 16, adminY, halfWidth - 32);

roundedBox(left, 445, contentWidth, 146, colors.warning, 9);
addLabel("Administrator setup", left + 16, 471, [151, 94, 20]);
addParagraph(
  "Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before starting the API. The server creates or verifies that administrator during initialization. Signup rejects admin roles, and the API checks the admin role for every /api/admin route.",
  left + 16,
  494,
  contentWidth - 32,
  { size: 9, leading: 13, color: colors.ink },
);
addParagraph(
  "If the configured email already belongs to a non-admin account, the API refuses to elevate it. Use a dedicated administrator email.",
  left + 16,
  553,
  contentWidth - 32,
  { size: 8.7, leading: 12, color: colors.ink },
);
addFooter(8);

// Launch checklist and buyer notes
pdf.addPage();
addPageHeader(
  "08  /  LAUNCH CHECKLIST",
  "Before using a live deployment",
  "The included setup is a foundation, not a fully operated marketplace. Review each item before exposing it to real customers or sellers.",
);
addSectionTitle("Production checklist", left, 203);
let checklistY = 229;
checklistY = addBullet("Set a strong JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD on the server; never commit .env files.", left, checklistY, contentWidth);
checklistY += 11;
checklistY = addBullet("Use a production MongoDB deployment, private network rules, backups and a tested recovery process.", left, checklistY, contentWidth);
checklistY += 11;
checklistY = addBullet("Set ALLOWED_ORIGINS to the exact deployed storefront origins and serve all sites over HTTPS.", left, checklistY, contentWidth);
checklistY += 11;
checklistY = addBullet("Configure provider test keys, USD merchant support and signed webhooks; test checkout before using live keys.", left, checklistY, contentWidth);
checklistY += 11;
checklistY = addBullet("Set webhook endpoints at /api/payments/paystack/webhook and /api/payments/stripe/webhook.", left, checklistY, contentWidth);
checklistY += 11;
addBullet("Arrange delivery, customer support, refunds and notifications separately; replace sample products and imagery.", left, checklistY, contentWidth);

roundedBox(left, 470, contentWidth, 92, [230, 244, 235], 9);
addLabel("Quick checks", left + 16, 495);
addParagraph(
  "Storefront cannot reach API: check the API URL and ALLOWED_ORIGINS. API cannot start: verify MongoDB and server values. Provider unavailable: check its backend secret, USD currency and merchant support. Payment not confirmed: inspect webhook delivery; a redirect alone is not proof.",
  left + 16,
  518,
  contentWidth - 32,
  { size: 8.8, leading: 12.5, color: colors.ink },
);
roundedBox(left, 580, contentWidth, 67, colors.warning, 9);
addLabel("Purchase and license", left + 16, 604, [151, 94, 20]);
addParagraph(
  "Check your order record or separate written agreement for package inclusion and license terms. This guide explains setup and workflows; it does not grant, expand or replace a license.",
  left + 16,
  625,
  contentWidth - 32,
  { size: 8.7, leading: 12, color: colors.ink },
);
addLabel("For Cardzip Services Limited", left, 674);
pdf.addImage(signature, "JPEG", left, 679, 118, 44);
stroke(colors.line);
pdf.setLineWidth(0.8);
pdf.line(left, 724, left + 150, 724);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(7.5);
textColor(colors.muted);
pdf.text("Authorized company signature", left, 735);
pdf.text("Date: __________________", left + 205, 724);
addFooter(9);

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, Buffer.from(pdf.output("arraybuffer")));
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`);
