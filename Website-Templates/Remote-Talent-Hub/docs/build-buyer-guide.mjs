import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRequire = createRequire(path.join(here, "..", "..", "Agency-Portal", "Agency-portal", "package.json"));
const { jsPDF } = projectRequire("jspdf");
const logo = fs.readFileSync(path.join(here, "assets", "cardzip-logo.jpg"));
const signature = fs.readFileSync(path.join(here, "assets", "cardzip-signature.jpg"));
const output = path.join(here, "REMOTE-TALENT-HUB-BUYER-GUIDE.pdf");

const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
const pageWidth = 612;
const pageHeight = 792;
const left = 54;
const right = pageWidth - left;
const contentWidth = right - left;
const colors = {
  ink: [24, 39, 35],
  muted: [91, 108, 101],
  purple: [81, 70, 229],
  dark: [24, 27, 62],
  lime: [208, 235, 87],
  pale: [244, 245, 252],
  line: [223, 227, 237],
  white: [255, 255, 255],
  code: [22, 32, 29],
  codeText: [230, 245, 236],
  warning: [255, 247, 229],
};

pdf.setProperties({
  title: "Cardzip Remote Talent Hub Buyer Guide",
  subject: "Remote.ly setup, folder structure, role workflows and template license summary",
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

function roundedBox(x, y, width, height, color, radius = 9) {
  fill(color);
  pdf.roundedRect(x, y, width, height, radius, radius, "F");
}

function addParagraph(text, x, y, width, options = {}) {
  const { size = 9.5, color = colors.muted, leading = size * 1.45, font = "normal" } = options;
  pdf.setFont("helvetica", font);
  pdf.setFontSize(size);
  textColor(color);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function addLabel(text, x, y, color = colors.purple) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  textColor(color);
  pdf.text(text.toUpperCase(), x, y);
}

function addHeading(text, x, y, size = 19, color = colors.ink) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(size);
  textColor(color);
  pdf.text(text, x, y);
}

function addSectionTitle(text, x, y) {
  addHeading(text, x, y, 12);
}

function addBullet(text, x, y, width, options = {}) {
  fill(options.bulletColor || colors.purple);
  pdf.circle(x + 3, y - 3, 2, "F");
  return addParagraph(text, x + 13, y, width - 13, {
    size: options.size || 9.3,
    leading: options.leading || 13.2,
    color: options.color || colors.muted,
  });
}

function addBullets(items, x, y, width, options = {}) {
  let currentY = y;
  for (const item of items) {
    currentY = addBullet(item, x, currentY, width, options) + (options.gap ?? 8);
  }
  return currentY;
}

function addCodePanel(lines, x, y, width, options = {}) {
  const fontSize = options.fontSize || 8.5;
  const lineHeight = options.lineHeight || 12;
  const height = 20 + lines.length * lineHeight;
  roundedBox(x, y, width, height, colors.code, 7);
  fill(colors.lime);
  pdf.roundedRect(x, y, 4, height, 2, 2, "F");
  pdf.setFont("courier", "normal");
  pdf.setFontSize(fontSize);
  textColor(colors.codeText);
  pdf.text(lines, x + 14, y + 17, { lineHeightFactor: lineHeight / fontSize });
  return height;
}

function addPageHeader(section, title, intro) {
  pdf.addImage(logo, "JPEG", left, 26, 28, 28);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text("CARDZIP", left + 37, 38);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text("REMOTE TALENT HUB BUYER GUIDE", left + 37, 50);
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, 67, right, 67);
  addLabel(section, left, 94);
  addHeading(title, left, 121, 21);
  addParagraph(intro, left, 144, contentWidth, { size: 9.5, leading: 13.5 });
}

function addFooter(pageNumber) {
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, pageHeight - 42, right, pageHeight - 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text("CARDZIP SERVICES LIMITED  |  GUIDE v1.0", left, pageHeight - 26);
  pdf.text(String(pageNumber).padStart(2, "0"), right, pageHeight - 26, { align: "right" });
}

function nextPage(pageNumber) {
  addFooter(pageNumber);
  pdf.addPage();
}

function addFolderRow(y, folder, role, address) {
  roundedBox(left, y, contentWidth, 47, colors.pale, 7);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text(folder, left + 13, y + 18);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.3);
  textColor(colors.muted);
  pdf.text(role, left + 158, y + 18);
  pdf.text(address, left + 158, y + 33);
}

// Cover
fill(colors.dark);
pdf.rect(0, 0, pageWidth, pageHeight, "F");
fill(colors.purple);
pdf.circle(568, 74, 145, "F");
fill(colors.dark);
pdf.circle(568, 74, 111, "F");
pdf.addImage(logo, "JPEG", left, 58, 68, 68);
addLabel("CARDZIP  /  BUYER DOCUMENTATION", left, 164, colors.lime);
addHeading("Remote Talent Hub", left, 224, 31, colors.white);
addHeading("buyer guide", left, 264, 31, colors.white);
addParagraph(
  "Install, configure and launch the Remote.ly React/Vite or Next.js frontend with its separate Express/MongoDB API. Follow candidate, employer and administrator workflows, and understand the included template license.",
  left,
  303,
  445,
  { size: 11.5, leading: 17, color: [225, 232, 247] },
);
roundedBox(left, 435, contentWidth, 126, [37, 39, 83], 13);
addLabel("Three separately run applications", left + 20, 463, colors.lime);
addHeading("Vite  /  Next.js  /  Express API", left + 20, 490, 17, colors.white);
addParagraph(
  "Choose one frontend. Start the API separately for authentication, dashboards, job moderation and live listings.",
  left + 20,
  516,
  contentWidth - 40,
  { size: 9.5, leading: 14, color: [225, 232, 247] },
);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8.5);
textColor([225, 232, 247]);
pdf.text("Version 1.0  |  Prepared for Cardzip buyers", left, 727);
textColor(colors.lime);
pdf.text("CARDZIP SERVICES LIMITED", right, 727, { align: "right" });

// 1. Package and folder map
nextPage(1);
addPageHeader(
  "01  /  PACKAGE CONTENTS",
  "Three folders, one marketplace",
  "The project separates the two alternative frontends from their shared API. Keep the directory layout intact so local scripts, environment examples and buyer documentation remain easy to find.",
);
addFolderRow(190, "vite/", "React + Vite frontend", "http://localhost:5173");
addFolderRow(248, "nextjs/", "Next.js App Router frontend", "http://localhost:3000");
addFolderRow(306, "backend/", "Express API + MongoDB", "http://localhost:5000/api");
addFolderRow(364, "docs/", "Buyer guide, generator and assets", "PDF and approved Cardzip artwork");
addSectionTitle("Choose the frontend included in your order", left, 448);
addBullets([
  "Vite is a client-rendered React application with the full marketplace interface and local development server.",
  "Next.js provides the same screens through a native App Router entry point. It is an alternative, not a second API.",
  "The backend source is in its own folder and may be run alongside either frontend. Both clients use the same API and MongoDB database.",
], left, 472, contentWidth, { size: 9.2, leading: 13, gap: 5 });
roundedBox(left, 610, contentWidth, 64, colors.warning, 8);
addLabel("Purchase scope", left + 14, 632, [151, 94, 20]);
addParagraph(
  "Confirm whether your order includes frontend files only or the complete frontend and backend package. A template purchase is not an exclusive copyright or IP buyout.",
  left + 14,
  651,
  contentWidth - 28,
  { size: 8.8, leading: 12, color: colors.ink },
);

// 2. Prerequisites and configuration
nextPage(2);
addPageHeader(
  "02  /  PREPARE",
  "Requirements and private settings",
  "Use a separate terminal for each app. Install only the dependencies for the API and frontend you chose. Node.js and MongoDB must be available before using authenticated features.",
);
addSectionTitle("You will need", left, 203);
addBullets([
  "Node.js 20.19 or later and npm for the Vite frontend; use the supported Node release listed by your installed Next.js version.",
  "A reachable MongoDB instance, either local or hosted. The backend does not silently fall back to in-memory production data.",
  "A private JWT signing secret of at least 32 characters and an initial administrator email and strong password.",
], left, 228, contentWidth, { size: 9.2, leading: 13, gap: 6 });
addSectionTitle("Environment files", left, 355);
addParagraph("Copy the example file in each selected folder and replace its values with your own configuration:", left, 377, contentWidth, { size: 9.2, leading: 13 });
addCodePanel([
  'cd /d "C:\\path\\to\\Remote-Talent-Hub\\backend"',
  "copy .env.example .env",
  "notepad .env",
], left, 403, contentWidth);
addParagraph(
  "Backend settings: MONGODB_URI, MONGODB_DB, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, PORT and CORS_ORIGINS. The server seeds the configured admin on first start; there is no public admin signup.",
  left,
  473,
  contentWidth,
  { size: 9, leading: 13 },
);
roundedBox(left, 548, contentWidth, 82, colors.warning, 8);
addLabel("Keep secrets on the server", left + 14, 571, [151, 94, 20]);
addParagraph(
  "Do not commit .env files, database credentials or JWT secrets. Never put backend secrets in VITE_API_URL or NEXT_PUBLIC_API_URL; frontend environment variables are shipped to browsers.",
  left + 14,
  591,
  contentWidth - 28,
  { size: 8.8, leading: 12, color: colors.ink },
);

// 3. Backend architecture and startup
nextPage(3);
addPageHeader(
  "03  /  BACKEND",
  "Start the MVC API",
  "The backend is organized by responsibility. server.js starts the app; request handling is separated into routes, controllers, middleware and the MongoDB data-store model.",
);
addSectionTitle("Backend source map", left, 203);
addBullets([
  "src/routes/api-routes.js maps HTTP paths and role guards to controller actions.",
  "src/controllers/ contains authentication, client marketplace and admin operations.",
  "src/middleware/auth.js validates signed access tokens and enforces candidate, employer or admin roles.",
  "src/models/store.js provides the MongoDB store; server.test.js uses an isolated in-memory test store.",
], left, 228, contentWidth, { size: 9.1, leading: 12.8, gap: 5 });
addSectionTitle("Install and run", left, 326);
addCodePanel([
  'cd /d "C:\\path\\to\\Remote-Talent-Hub\\backend"',
  "npm install",
  "npm run dev",
], left, 350, contentWidth);
addParagraph(
  "The API listens on port 5000 by default. Keep the terminal open. Missing MongoDB configuration, an invalid JWT secret, or an unreachable database produces a startup error instead of demo data.",
  left,
  421,
  contentWidth,
  { size: 9.1, leading: 13 },
);
addSectionTitle("API capabilities", left, 486);
addBullets([
  "Candidate and employer registration and sign-in; admin accounts are seeded from private server configuration.",
  "Candidate-owned applications, employer-owned jobs and applications, and an admin-wide moderation dashboard.",
  "Admin job approval and rejection. Public job listings require approval and a paid status; checkout is currently a preview and does not mark a listing paid.",
], left, 510, contentWidth, { size: 9, leading: 12.5, gap: 5 });

// 4. Vite frontend
nextPage(4);
addPageHeader(
  "04  /  REACT + VITE",
  "Run the Vite frontend",
  "The Vite folder contains the original client-side marketplace UI, route handling, styles and its own frontend environment example. It connects to the API through VITE_API_URL.",
);
addSectionTitle("Install and run", left, 203);
addCodePanel([
  'cd /d "C:\\path\\to\\Remote-Talent-Hub\\vite"',
  "copy .env.example .env",
  "npm install",
  "npm run dev",
], left, 228, contentWidth);
addParagraph(
  "The development server normally opens at http://localhost:5173. To use another API host, change VITE_API_URL in vite/.env. This variable is public configuration, not a secret.",
  left,
  320,
  contentWidth,
  { size: 9, leading: 13 },
);
addSectionTitle("Marketplace routes", left, 386);
addBullets([
  "/ and /jobs provide the public job marketplace; /jobs/:id shows a listing.",
  "/talent and /talent/:id show the sample talent directory and profiles.",
  "/post-job and /pricing guide an employer through a listing plan; /checkout is a non-payment preview.",
  "/login and /signup connect to candidate or employer accounts; /dashboard loads role-specific data from the API.",
  "/admin/login and /admin expose the protected operations workspace.",
], left, 410, contentWidth, { size: 9, leading: 12.8, gap: 5 });
roundedBox(left, 592, contentWidth, 62, colors.pale, 8);
addLabel("Quality checks", left + 14, 614);
addParagraph("Run npm run lint and npm run build from vite/ before deploying the client-rendered app.", left + 14, 635, contentWidth - 28, { size: 8.8, leading: 12, color: colors.ink });

// 5. Next.js frontend
nextPage(5);
addPageHeader(
  "05  /  NEXT.JS",
  "Run the Next.js frontend",
  "The Next.js directory has its own App Router entry point and uses the same Remote.ly page components and API contract as Vite. Choose this frontend instead of running Vite when it matches your deployment.",
);
addSectionTitle("Install and run", left, 203);
addCodePanel([
  'cd /d "C:\\path\\to\\Remote-Talent-Hub\\nextjs"',
  "copy .env.example .env.local",
  "npm install",
  "npm run dev",
], left, 228, contentWidth);
addParagraph(
  "Next.js normally opens at http://localhost:3000. Set NEXT_PUBLIC_API_URL in nextjs/.env.local only when the API is hosted elsewhere. It is intentionally public and must contain only the API base URL.",
  left,
  320,
  contentWidth,
  { size: 9, leading: 13 },
);
addSectionTitle("Rendering and checks", left, 386);
addBullets([
  "The App Router uses a catch-all route to map the existing marketplace URLs to the shared Remote.ly page components.",
  "Browser storage is read after hydration; authentication and dashboard data are loaded on the client from the backend.",
  "API role checks still protect data if a visitor types a dashboard URL directly.",
  "Run npm run typecheck and npm run build from nextjs/.",
], left, 410, contentWidth, { size: 9, leading: 12.8, gap: 6 });
roundedBox(left, 566, contentWidth, 86, colors.warning, 8);
addLabel("Do not combine the frontends", left + 14, 589, [151, 94, 20]);
addParagraph(
  "Vite and Next.js are separate alternatives, not sub-applications of one frontend. Keep their dependency installs and dev servers separate, and run only one frontend on each local port.",
  left + 14,
  610,
  contentWidth - 28,
  { size: 8.8, leading: 12, color: colors.ink },
);

// 6. Role and data workflows
nextPage(6);
addPageHeader(
  "06  /  ACCOUNT WORKFLOWS",
  "Who can see and manage what?",
  "Every private API route checks the bearer token and role on the server. Client-side navigation improves the experience but is not the security boundary.",
);
const roleRows = [
  ["Candidate", "Register and sign in; submit an application; view only their own applications."],
  ["Employer", "Register and sign in; submit job listings; view only their own jobs and their listings' applications."],
  ["Administrator", "Seeded from backend environment configuration; review accounts, applications and submitted jobs."],
];
let roleY = 194;
for (const [role, description] of roleRows) {
  roundedBox(left, roleY, contentWidth, 64, role === "Administrator" ? [235, 236, 252] : colors.pale, 8);
  addHeading(role, left + 14, roleY + 22, 11, colors.ink);
  addParagraph(description, left + 125, roleY + 21, contentWidth - 140, { size: 8.8, leading: 12, color: colors.muted });
  roleY += 75;
}
addSectionTitle("Important access behavior", left, 434);
addBullets([
  "A candidate token cannot post jobs or open the admin dashboard. An employer token cannot read another employer's records.",
  "Only the API owner creates the initial admin using ADMIN_EMAIL and ADMIN_PASSWORD; public registration rejects the admin role.",
  "Passwords are stored as salted scrypt hashes. API access tokens are signed and expire after eight hours.",
  "The UI stores the access token in browser local storage. Use HTTPS in production and configure an appropriate data-retention policy.",
], left, 458, contentWidth, { size: 9, leading: 12.5, gap: 6 });
roundedBox(left, 620, contentWidth, 48, colors.pale, 8);
addParagraph("Use a unique, strong admin password and rotate the JWT secret carefully; changing it invalidates existing sessions.", left + 14, 640, contentWidth - 28, { size: 8.8, leading: 12, color: colors.ink });

// 7. Customization and production
nextPage(7);
addPageHeader(
  "07  /  CUSTOMIZE AND DEPLOY",
  "Prepare your own launch",
  "Remote.ly is a starting point. Replace sample listings, profile data, copy and contact details, then deploy the backend and one frontend to your chosen hosts.",
);
addSectionTitle("Before production", left, 203);
addBullets([
  "Configure a production MongoDB database, a new private JWT_SECRET, and a strong server-seeded admin password.",
  "Set CORS_ORIGINS to the exact production frontend origins. Do not leave localhost as the only or sole production origin.",
  "Use HTTPS, review logs and database access, and establish backups, monitoring and a process for security updates.",
  "Review user privacy, data retention, deletion requests and candidate/employer terms for your jurisdiction.",
  "Verify account signup, wrong-role access, dashboard ownership, job review and public listing behavior in the deployed environment.",
], left, 228, contentWidth, { size: 9, leading: 12.5, gap: 6 });
roundedBox(left, 488, contentWidth, 92, colors.warning, 9);
addLabel("Payments are not connected", left + 15, 512, [151, 94, 20]);
addParagraph(
  "The plan and checkout pages are previews only. No card details are collected, no charge is made, and a job remains unavailable publicly until a payment integration records a paid status. Add a compliant payment provider and server-side payment verification before offering paid listings.",
  left + 15,
  533,
  contentWidth - 30,
  { size: 8.8, leading: 12, color: colors.ink },
);
addSectionTitle("Troubleshooting", left, 617);
addParagraph(
  "API connection error: check that MongoDB and the backend are running and the frontend API URL is correct. Browser CORS error: add the exact frontend origin to CORS_ORIGINS. Sign-in fails: confirm the selected role, email and API database. Build fails: install dependencies from the affected app folder and inspect the first compiler error.",
  left,
  639,
  contentWidth,
  { size: 8.6, leading: 11.5 },
);

// 8. License summary and signature
nextPage(8);
addPageHeader(
  "08  /  BUYER LICENSE",
  "Cardzip template license summary",
  "This plain-language summary describes the typical template license and is not a substitute for the terms attached to your specific order. Confirm the purchased package and applicable sale record.",
);
let licenseY = 194;
licenseY = addBullets([
  "After confirmed payment, the buyer receives a non-exclusive, non-transferable license to use and modify the files in the purchased package to create one end product.",
  "A frontend-only order covers only the purchased frontend files. The separate backend/API is included only when the order says so.",
  "A full-template order may include the selected frontend and included backend/API source for one commercial end product.",
  "Do not resell, sublicense, publish or redistribute the template source as a standalone product. Third-party components remain subject to their own licenses.",
  "Exclusive ownership or assignment of Cardzip's pre-existing intellectual property is not included in an ordinary purchase; it requires a separate written outright-purchase agreement.",
], left, licenseY, contentWidth, { size: 8.8, leading: 12, gap: 5 });

roundedBox(left, 485, contentWidth, 61, colors.pale, 8);
addLabel("Purchase record", left + 14, 507);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8.5);
textColor(colors.ink);
pdf.text("Buyer / order reference: __________________________________________", left + 14, 527);
pdf.text("Effective purchase date: __________________________________________", left + 14, 539);

pdf.setFont("helvetica", "bold");
pdf.setFontSize(9);
textColor(colors.ink);
pdf.text("For Cardzip Services Limited", left, 572);
pdf.addImage(signature, "JPEG", left, 579, 124, 54);
stroke(colors.line);
pdf.setLineWidth(0.8);
pdf.line(left, 639, left + 154, 639);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8);
textColor(colors.muted);
pdf.text("Company signature", left, 653);
pdf.text("Date: ________________________", left + 210, 639);

roundedBox(left, 680, contentWidth, 43, colors.warning, 7);
addParagraph(
  "Plain-language buyer reference; the order record and final Cardzip terms govern. Complete the purchase date from the transaction record and obtain legal review where required.",
  left + 12,
  699,
  contentWidth - 24,
  { size: 7.8, leading: 10.5, color: colors.ink },
);
addFooter(8);

if (pdf.getNumberOfPages() !== 9) {
  throw new Error(`Expected a nine-page buyer guide, generated ${pdf.getNumberOfPages()} pages.`);
}

fs.writeFileSync(output, Buffer.from(pdf.output("arraybuffer")));
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`);
