import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const docsRoot = path.resolve(projectRoot, "..", "docs");
const projectRequire = createRequire(path.join(projectRoot, "package.json"));
const { jsPDF } = projectRequire("jspdf");
const output = path.join(docsRoot, "CREATORHUB-PORTFOLIO-BUYER-GUIDE.pdf");
const logo = fs.readFileSync(path.join(docsRoot, "assets", "cardzip-logo.jpg"));
const signature = fs.readFileSync(path.join(docsRoot, "assets", "cardzip-signature.jpg"));

const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
const pageWidth = 612;
const pageHeight = 792;
const left = 54;
const right = pageWidth - 54;
const width = right - left;
const colors = {
  ink: [31, 26, 43],
  muted: [99, 94, 111],
  purple: [112, 62, 207],
  dark: [38, 24, 64],
  lavender: [220, 204, 255],
  pale: [247, 243, 255],
  line: [228, 222, 237],
  white: [255, 255, 255],
  code: [29, 26, 35],
  codeText: [244, 238, 255],
  warning: [255, 247, 229],
};

pdf.setProperties({
  title: "CreatorHub Portfolio — Cardzip Buyer Guide",
  subject: "Setup, client/admin workflows, project structure and template license",
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

function roundedBox(x, y, w, h, color, radius = 9) {
  fill(color);
  pdf.roundedRect(x, y, w, h, radius, radius, "F");
}

function paragraph(text, x, y, maxWidth, options = {}) {
  const { size = 9.5, color = colors.muted, leading = size * 1.45, font = "normal" } = options;
  pdf.setFont("helvetica", font);
  pdf.setFontSize(size);
  textColor(color);
  const lines = pdf.splitTextToSize(text, maxWidth);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function label(text, x, y, color = colors.purple) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  textColor(color);
  pdf.text(text.toUpperCase(), x, y);
}

function heading(text, x, y, size = 16, color = colors.ink) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(size);
  textColor(color);
  pdf.text(text, x, y);
}

function bullet(text, x, y, maxWidth, options = {}) {
  fill(options.bulletColor || colors.purple);
  pdf.circle(x + 3, y - 3, 2, "F");
  return paragraph(text, x + 13, y, maxWidth - 13, {
    size: options.size || 9,
    leading: options.leading || 12.5,
    color: options.color || colors.muted,
  });
}

function codePanel(lines, x, y, panelWidth, options = {}) {
  const size = options.size || 8;
  const lineHeight = options.lineHeight || 12;
  const panelHeight = 20 + lines.length * lineHeight;
  roundedBox(x, y, panelWidth, panelHeight, colors.code, 7);
  fill(colors.lavender);
  pdf.roundedRect(x, y, 4, panelHeight, 2, 2, "F");
  pdf.setFont("courier", "normal");
  pdf.setFontSize(size);
  textColor(colors.codeText);
  pdf.text(lines, x + 13, y + 16, { lineHeightFactor: lineHeight / size });
  return panelHeight;
}

function pageHeader(section, title, intro) {
  pdf.addImage(logo, "JPEG", left, 26, 29, 29);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text("CARDZIP", left + 37, 38);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  textColor(colors.muted);
  pdf.text("CREATORHUB PORTFOLIO BUYER GUIDE", left + 37, 50);
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, 68, right, 68);
  label(section, left, 97);
  heading(title, left, 125, 22);
  paragraph(intro, left, 148, width, { size: 9.5, leading: 13.5 });
}

function footer(pageNumber) {
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, pageHeight - 42, right, pageHeight - 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text("CARDZIP SERVICES LIMITED  |  CREATORHUB PORTFOLIO  |  GUIDE v1.0", left, pageHeight - 26);
  pdf.text(String(pageNumber).padStart(2, "0"), right, pageHeight - 26, { align: "right" });
}

function addSectionTitle(text, y) {
  heading(text, left, y, 12);
}

// Cover
fill(colors.dark);
pdf.rect(0, 0, pageWidth, pageHeight, "F");
fill(colors.purple);
pdf.circle(568, 70, 154, "F");
fill(colors.dark);
pdf.circle(568, 70, 119, "F");
pdf.addImage(logo, "JPEG", left, 57, 70, 70);
label("Cardzip  /  Buyer documentation", left, 165, colors.lavender);
heading("CreatorHub", left, 229, 38, colors.white);
heading("Portfolio buyer guide", left, 273, 28, colors.white);
paragraph(
  "A practical guide to installing and customizing the creator storefront, connecting its client and administrator portals, and understanding the included project folders and buyer license.",
  left,
  311,
  450,
  { size: 12, leading: 18, color: [230, 222, 242] },
);
roundedBox(left, 438, width, 126, [56, 38, 81], 13);
label("One product · three separate apps", left + 21, 468, colors.lavender);
heading("Vite  /  Next.js  /  Express API", left + 21, 495, 17, colors.white);
paragraph(
  "Choose one frontend. Start the API separately for account access, client review requests, and administrator workflows.",
  left + 21,
  521,
  width - 42,
  { size: 9.5, leading: 14, color: [230, 222, 242] },
);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(9);
textColor([230, 222, 242]);
pdf.text("Prepared for Cardzip buyers  |  Version 1.0", left, 727);
textColor(colors.lavender);
pdf.text("CARDZIP SERVICES LIMITED", right, 727, { align: "right" });

// Product contents and package scope
pdf.addPage();
pageHeader(
  "01  /  PRODUCT OVERVIEW",
  "What is included?",
  "CreatorHub Portfolio is a creator storefront and portfolio-review starter. Its frontend demonstrations are separate from live account workflows, which are handled by the included API.",
);
const cardY = 192;
const gap = 14;
const cardWidth = (width - gap) / 2;
roundedBox(left, cardY, cardWidth, 224, colors.pale);
label("Public experience", left + 16, cardY + 27);
heading("Storefront & portfolio", left + 16, cardY + 51, 15);
let y = cardY + 78;
y = bullet("Creator profile, product catalogue, newsletter archive, free-resource library, and search.", left + 16, y, cardWidth - 32);
y += 8;
y = bullet("Portfolio-review request form connected to a signed-in client account.", left + 16, y, cardWidth - 32);
y += 8;
bullet("Checkout is a preview only; it does not collect card data or process payments.", left + 16, y, cardWidth - 32);

const secondX = left + cardWidth + gap;
roundedBox(secondX, cardY, cardWidth, 224, [239, 232, 255]);
label("Private portals", secondX + 16, cardY + 27);
heading("Client & admin", secondX + 16, cardY + 51, 15);
y = cardY + 78;
y = bullet("Clients create accounts and see only their own review requests.", secondX + 16, y, cardWidth - 32);
y += 8;
y = bullet("Administrators review requests, update statuses, and view registered clients.", secondX + 16, y, cardWidth - 32);
y += 8;
bullet("The API enforces account roles on protected endpoints; hiding a page is not the security boundary.", secondX + 16, y, cardWidth - 32);

roundedBox(left, 447, width, 120, colors.warning);
label("Purchase scope", left + 17, 472, [151, 94, 20]);
paragraph(
  "The delivered project has Vite and Next.js frontend folders plus a separate backend. The order and its invoice determine which parts are licensed. A full-stack purchase includes the backend files; a frontend-only purchase does not add backend rights.",
  left + 17,
  496,
  width - 34,
  { size: 9.2, leading: 13.5, color: colors.ink },
);
paragraph("Project folders: vite (React/Vite), nextjs (Next.js App Router), backend (Express/MongoDB), and docs (buyer guide and assets).", left, 603, width, { size: 9 });
footer(2);

// Prerequisites and folder map
pdf.addPage();
pageHeader(
  "02  /  PREPARE",
  "Before installation",
  "Unzip the project and keep the three applications in their own folders. Use separate terminals for the API and the frontend you choose.",
);
addSectionTitle("You will need", 202);
let bulletY = 228;
bulletY = bullet("Node.js 20.19 or later and npm. Check with node --version and npm --version.", left, bulletY, width);
bulletY += 11;
bulletY = bullet("MongoDB, local or hosted, for accounts and review-request data.", left, bulletY, width);
bulletY += 11;
bulletY = bullet("A unique JWT secret (32+ characters), administrator email/password, and a frontend URL.", left, bulletY, width);

addSectionTitle("Top-level folders", 326);
const folderRows = [
  ["vite", "React storefront + Vite API client", "5173"],
  ["nextjs", "Native Next.js App Router frontend", "3000"],
  ["backend", "Express API + MongoDB store", "5700"],
  ["docs", "Markdown guide, PDF, logo + signature", "—"],
];
let rowY = 345;
for (const [folder, purpose, port] of folderRows) {
  roundedBox(left, rowY, width, 42, colors.pale, 7);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text(folder, left + 12, rowY + 18);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  textColor(colors.muted);
  pdf.text(purpose, left + 102, rowY + 18);
  pdf.text(`Local port: ${port}`, left + 102, rowY + 32);
  rowY += 50;
}
roundedBox(left, 556, width, 78, colors.warning, 8);
label("Keep secrets private", left + 14, 579, [151, 94, 20]);
paragraph(
  "Never commit .env files, database credentials, admin passwords, or JWT secrets. Browser-visible VITE_ and NEXT_PUBLIC_ variables must contain only public settings such as the API URL.",
  left + 14,
  600,
  width - 28,
  { size: 8.7, leading: 12, color: colors.ink },
);
footer(3);

// Backend setup
pdf.addPage();
pageHeader(
  "03  /  START THE BACKEND",
  "Configure the Portfolio API",
  "The backend stores accounts and review requests in MongoDB. It has no demo-data fallback: configure the database and administrator before starting it.",
);
addSectionTitle("1. Configure the environment", 203);
paragraph("From a Windows PowerShell terminal in the project root:", left, 227, width, { size: 9 });
codePanel(
  [
    'Set-Location ".\\backend"',
    "Copy-Item .env.example .env",
    "notepad .env",
  ],
  left,
  248,
  width,
  { size: 8.5, lineHeight: 13 },
);
paragraph(
  "Set MONGODB_URI and MONGODB_DATABASE, choose a private JWT_SECRET of at least 32 characters, and supply ADMIN_EMAIL and ADMIN_PASSWORD. Configure CORS_ORIGINS for the frontend origin(s) you will use.",
  left,
  321,
  width,
  { size: 9.2, leading: 13.5, color: colors.ink },
);
addSectionTitle("2. Install and run", 390);
codePanel(["npm install", "npm run dev"], left, 412, width, { size: 9, lineHeight: 14 });
paragraph(
  "The API listens on port 5700 by default. On startup it creates or updates the configured administrator account. There is no public administrator-signup endpoint.",
  left,
  481,
  width,
  { size: 9.2, leading: 13.5 },
);
roundedBox(left, 548, width, 87, colors.warning, 8);
label("If the API will not start", left + 14, 571, [151, 94, 20]);
paragraph(
  "Check MongoDB connectivity and the required environment variables first. Review the backend terminal for startup errors; do not copy private values into a public frontend environment file.",
  left + 14,
  592,
  width - 28,
  { size: 8.8, leading: 12.3, color: colors.ink },
);
footer(4);

// Frontend setup
pdf.addPage();
pageHeader(
  "04  /  CHOOSE A FRONTEND",
  "Run Vite or Next.js",
  "The two frontends implement the same experience. Use one at a time for development, or allow both local origins in the backend CORS_ORIGINS setting.",
);
roundedBox(left, 190, width, 195, colors.pale, 9);
label("Option A", left + 16, 215);
heading("React + Vite", left + 16, 239, 15);
paragraph(
  "Set VITE_PORTFOLIO_API_URL to the backend /api address. The default is http://localhost:5700/api.",
  left + 16,
  260,
  width - 32,
  { size: 8.8, leading: 12.4 },
);
codePanel(["Set-Location .\\vite", "Copy-Item .env.example .env.local", "npm install", "npm run dev"], left + 16, 304, width - 32, { size: 7.8, lineHeight: 11.5 });

roundedBox(left, 401, width, 195, [239, 232, 255], 9);
label("Option B", left + 16, 426);
heading("Next.js App Router", left + 16, 450, 15);
paragraph(
  "Set NEXT_PUBLIC_PORTFOLIO_API_URL to the backend /api address. The default is http://localhost:5700/api.",
  left + 16,
  471,
  width - 32,
  { size: 8.8, leading: 12.4 },
);
codePanel(["Set-Location .\\nextjs", "Copy-Item .env.example .env.local", "npm install", "npm run dev"], left + 16, 515, width - 32, { size: 7.8, lineHeight: 11.5 });
paragraph("Open the local URL printed by the frontend terminal. Keep the backend terminal running separately.", left, 627, width, { size: 9 });
footer(5);

// Client workflow and API routes
pdf.addPage();
pageHeader(
  "05  /  CLIENT WORKFLOW",
  "Accounts and review requests",
  "Clients register a creator name, handle, email, and password. The API hashes passwords and links each submitted request to the authenticated account.",
);
const workflow = [
  ["Create an account", "Use /signup. Handles are normalized and must be unique; public signup always creates a client role."],
  ["Sign in", "Use /login. The client dashboard calls the API with a signed bearer token and shows only that client’s requests."],
  ["Request a review", "From /services/portfolio-review, submit goals and an optional HTTP(S) portfolio URL. The request starts as requested."],
  ["Track progress", "The dashboard lists the status and submission time. Administrators may confirm, decline, or complete a request."],
];
let flowY = 198;
for (const [title, body] of workflow) {
  roundedBox(left, flowY, width, 68, colors.pale, 8);
  heading(title, left + 14, flowY + 22, 10.5);
  paragraph(body, left + 145, flowY + 20, width - 159, { size: 8.6, leading: 11.8, color: colors.ink });
  flowY += 77;
}
roundedBox(left, 525, width, 104, colors.warning, 8);
label("Main API routes", left + 14, 549, [151, 94, 20]);
paragraph(
  "POST /api/auth/signup and /api/auth/login · GET /api/client/dashboard · POST /api/client/review-requests · GET /api/admin/dashboard · PATCH /api/admin/review-requests/:id",
  left + 14,
  570,
  width - 28,
  { size: 9, leading: 13, color: colors.ink },
);
paragraph("All private routes require a valid Bearer token. The API returns 401 for missing/expired authentication and 403 for the wrong role.", left + 14, 606, width - 28, { size: 8.5, leading: 11.5, color: colors.ink });
footer(6);

// Dashboard roles and administration
pdf.addPage();
pageHeader(
  "06  /  PRIVATE DASHBOARDS",
  "Client and administrator access",
  "Frontend routing improves navigation, but authorization is enforced by the API on every private request. Changing local storage or opening a URL does not grant another role.",
);
roundedBox(left, 190, (width - 12) / 2, 267, colors.pale, 9);
label("Client role", left + 15, 215);
heading("Own requests only", left + 15, 239, 14);
let roleY = 265;
roleY = bullet("Reads their profile and their own review request list.", left + 15, roleY, (width - 12) / 2 - 30, { size: 8.7, leading: 12 });
roleY += 9;
roleY = bullet("Creates a request associated with their account ID; the server ignores client-supplied identity fields.", left + 15, roleY, (width - 12) / 2 - 30, { size: 8.7, leading: 12 });
roleY += 9;
bullet("Cannot view admin metrics, other clients, or update statuses.", left + 15, roleY, (width - 12) / 2 - 30, { size: 8.7, leading: 12 });

const roleRight = left + (width - 12) / 2 + 12;
roundedBox(roleRight, 190, (width - 12) / 2, 267, [239, 232, 255], 9);
label("Admin role", roleRight + 15, 215);
heading("Review and manage", roleRight + 15, 239, 14);
roleY = 265;
roleY = bullet("Is seeded from backend-only ADMIN_EMAIL and ADMIN_PASSWORD settings.", roleRight + 15, roleY, (width - 12) / 2 - 30, { size: 8.7, leading: 12 });
roleY += 9;
roleY = bullet("Views registered client accounts and all review requests.", roleRight + 15, roleY, (width - 12) / 2 - 30, { size: 8.7, leading: 12 });
roleY += 9;
bullet("Updates request status through a validated administrator-only endpoint.", roleRight + 15, roleY, (width - 12) / 2 - 30, { size: 8.7, leading: 12 });

roundedBox(left, 484, width, 138, colors.warning, 8);
label("Authentication notes", left + 15, 508, [151, 94, 20]);
let authY = 531;
authY = bullet("Passwords are stored as salted scrypt hashes; the API issues signed tokens that expire after eight hours.", left + 15, authY, width - 30, { size: 8.8, leading: 12 });
authY += 7;
authY = bullet("The backend looks up the current account and role for each protected request, so role claims are not trusted from the browser.", left + 15, authY, width - 30, { size: 8.8, leading: 12 });
authY += 7;
bullet("For production, use HTTPS and consider secure, HttpOnly cookie sessions rather than browser localStorage tokens.", left + 15, authY, width - 30, { size: 8.8, leading: 12 });
footer(7);

// Customization, launch, and limitations
pdf.addPage();
pageHeader(
  "07  /  CUSTOMIZE & LAUNCH",
  "Prepare the template for your brand",
  "The supplied storefront content is illustrative. Replace the creator name, products, prices, copy, contact information, and sample activity before presenting the site as your own.",
);
addSectionTitle("Before production", 203);
let checklistY = 229;
checklistY = bullet("Update the profile, product catalogue, newsletter issues, resource cards, and branding in the frontend source.", left, checklistY, width);
checklistY += 10;
checklistY = bullet("Use a production MongoDB database, strong private secrets, explicit CORS origins, and HTTPS for both API and frontend.", left, checklistY, width);
checklistY += 10;
checklistY = bullet("Run the API tests and build the selected frontend. Test signup, role restrictions, request creation, and admin status changes.", left, checklistY, width);
checklistY += 10;
checklistY = bullet("Create backups and choose an operational process for moderating client requests and handling user-data deletion.", left, checklistY, width);

roundedBox(left, 365, width, 121, colors.pale, 8);
label("Current scope", left + 15, 390);
paragraph(
  "Portfolio reviews are requests, not confirmed calendar bookings. The product checkout is a UI preview only; no appointment is scheduled, no card fields are collected, and no payment is processed. Connect trusted scheduling and payment providers before enabling those services.",
  left + 15,
  414,
  width - 30,
  { size: 9, leading: 13, color: colors.ink },
);
roundedBox(left, 513, width, 111, colors.warning, 8);
label("Quick troubleshooting", left + 15, 538, [151, 94, 20]);
paragraph(
  "Cannot connect: verify the API is running, its URL is correct, and the frontend origin is in CORS_ORIGINS. Sign-in fails: check the email, password, role, and database connection. Admin sign-in fails: confirm ADMIN_EMAIL/ADMIN_PASSWORD are set on the backend, not the browser.",
  left + 15,
  561,
  width - 30,
  { size: 8.9, leading: 12.5, color: colors.ink },
);
footer(8);

// Detailed folder map and buyer license
pdf.addPage();
pageHeader(
  "08  /  FILE MAP & LICENSE",
  "Project files and buyer terms",
  "Use this map to find the frontend, API, guide, and tests. Your purchase confirmation controls which packages are included with your order.",
);
codePanel(
  [
    "portfolio/",
    "  vite/       storefront, PortalPages, portfolioApi.js, scripts/",
    "  nextjs/     app routes, PortfolioScreens, portal-components/",
    "  backend/    server.js, routes, middleware, services, models, tests",
    "  docs/       BUYER-GUIDE.md, assets/, signed 9-page PDF",
    "API roles: client -> own requests; admin -> all requests + status updates",
  ],
  left,
  185,
  width,
  { size: 7.6, lineHeight: 11.5 },
);
label("Cardzip buyer license", left, 300);
let licenseY = 324;
licenseY = bullet("After confirmed payment, the buyer receives the non-exclusive right to use and modify the files included in the purchased package for one end product, subject to the purchase terms.", left, licenseY, width, { size: 8.3, leading: 11.4 });
licenseY += 6;
licenseY = bullet("A frontend-only package covers its purchased frontend files only; a full-stack purchase includes the backend only when the order says so.", left, licenseY, width, { size: 8.3, leading: 11.4 });
licenseY += 6;
licenseY = bullet("Do not resell, sublicense, publish, or redistribute the template source as a standalone product. Keep third-party components under their own licenses.", left, licenseY, width, { size: 8.3, leading: 11.4 });
licenseY += 6;
bullet("Copyright and exclusive ownership are not transferred by an ordinary template purchase. Any buyout or assignment requires a separate written agreement.", left, licenseY, width, { size: 8.3, leading: 11.4 });

roundedBox(left, 421, width, 53, colors.pale, 7);
label("Buyer / order reference", left + 12, 442);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8.5);
textColor(colors.ink);
pdf.text("____________________________________________________________", left + 140, 442);
pdf.text("Purchase date: ______________________________________________", left + 12, 461);

pdf.setFont("helvetica", "bold");
pdf.setFontSize(9);
textColor(colors.ink);
pdf.text("For Cardzip Services Limited", left, 505);
pdf.addImage(signature, "JPEG", left, 512, 122, 54);
stroke(colors.line);
pdf.setLineWidth(0.8);
pdf.line(left, 569, left + 151, 569);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8);
textColor(colors.muted);
pdf.text("Company signature", left, 583);
pdf.text("Date: ________________________", left + 205, 568);
paragraph(
  "This plain-language summary does not replace the terms shown on the buyer’s order or any separately signed agreement. Confirm purchase scope and applicable terms against the Cardzip sales record.",
  left,
  625,
  width,
  { size: 8, leading: 11, color: colors.muted },
);
footer(9);

fs.mkdirSync(docsRoot, { recursive: true });
fs.writeFileSync(output, Buffer.from(pdf.output("arraybuffer")));
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`);
