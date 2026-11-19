import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRequire = createRequire(path.join(here, "..", "nextjs", "package.json"));
const { jsPDF } = projectRequire("jspdf");
const logo = fs.readFileSync(path.join(here, "assets", "cardzip-logo.jpg"));
const signature = fs.readFileSync(path.join(here, "assets", "cardzip-signature.jpg"));
const output = path.join(here, "SAAS-ADMIN-BUYER-GUIDE.pdf");

const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
const pageWidth = 612;
const pageHeight = 792;
const left = 54;
const right = pageWidth - left;
const width = right - left;
const colors = {
  ink: [27, 38, 55],
  muted: [91, 105, 125],
  purple: [113, 74, 205],
  dark: [12, 21, 38],
  green: [16, 153, 120],
  pale: [243, 240, 252],
  line: [222, 226, 234],
  white: [255, 255, 255],
  code: [17, 29, 48],
  codeText: [234, 239, 248],
  warning: [255, 247, 232],
};

pdf.setProperties({
  title: "Cardzip Saasapp Admin Buyer Guide",
  subject: "Setup, routes, customization, demo scope, and deployment guidance",
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
    size: options.size || 9.2,
    leading: options.leading || 13,
    color: options.color || colors.muted,
  });
}

function codePanel(lines, x, y, panelWidth, options = {}) {
  const fontSize = options.fontSize || 8.5;
  const lineHeight = options.lineHeight || 13;
  const height = 20 + lines.length * lineHeight;
  box(x, y, panelWidth, height, colors.code, 7);
  fill(colors.purple);
  pdf.roundedRect(x, y, 4, height, 2, 2, "F");
  pdf.setFont("courier", "normal");
  pdf.setFontSize(fontSize);
  textColor(colors.codeText);
  pdf.text(lines, x + 14, y + 18, { lineHeightFactor: lineHeight / fontSize });
  return height;
}

function pageHeader(section, title, intro) {
  pdf.addImage(logo, "JPEG", left, 25, 28, 28);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text("CARDZIP", left + 37, 37);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  textColor(colors.muted);
  pdf.text("SAASAPP ADMIN BUYER GUIDE", left + 37, 49);
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, 67, right, 67);
  label(section, left, 96);
  heading(title, left, 124, 22);
  return paragraph(intro, left, 147, width, { size: 9.5, leading: 13.5 });
}

function footer(pageNumber) {
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, pageHeight - 42, right, pageHeight - 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text("CARDZIP SERVICES LIMITED  |  SAASAPP ADMIN  |  GUIDE v1.0", left, pageHeight - 26);
  pdf.text(String(pageNumber).padStart(2, "0"), right, pageHeight - 26, { align: "right" });
}

function startContentPage(section, title, intro, pageNumber) {
  pdf.addPage();
  pageHeader(section, title, intro);
  footer(pageNumber);
}

function sectionTitle(text, y) {
  heading(text, left, y, 12);
}

function infoCard(title, body, x, y, cardWidth, cardHeight, background = colors.pale) {
  box(x, y, cardWidth, cardHeight, background);
  label(title, x + 15, y + 23);
  paragraph(body, x + 15, y + 44, cardWidth - 30, { size: 9, leading: 13, color: colors.ink });
}

// Cover
fill(colors.dark);
pdf.rect(0, 0, pageWidth, pageHeight, "F");
fill(colors.purple);
pdf.circle(568, 75, 152, "F");
fill(colors.dark);
pdf.circle(568, 75, 119, "F");
pdf.addImage(logo, "JPEG", left, 58, 68, 68);
label("CARDZIP  /  BUYER DOCUMENTATION", left, 166, [195, 176, 255]);
heading("Saasapp Admin", left, 223, 34, colors.white);
heading("buyer guide", left, 264, 29, colors.white);
paragraph(
  "Install, understand, and customize the standalone Next.js admin console. This guide maps the included routes and components and explains what remains demo-only before production.",
  left,
  304,
  438,
  { size: 11, leading: 17, color: [221, 228, 241] },
);
box(left, 432, width, 124, [26, 40, 63], 13);
label("Two independent frontends", left + 20, 463, [195, 176, 255]);
heading("Next.js App Router  /  React + Vite", left + 20, 490, 16, colors.white);
paragraph(
  "This guide focuses on the native Next.js version. The Vite app remains in its own folder and is not embedded by the Next.js routes.",
  left + 20,
  515,
  width - 40,
  { size: 9.5, leading: 14, color: [221, 228, 241] },
);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(9);
textColor([221, 228, 241]);
pdf.text("Prepared for template buyers  |  Version 1.0", left, 726);
textColor([195, 176, 255]);
pdf.text("CARDZIP SERVICES LIMITED", right, 726, { align: "right" });

// Product scope
startContentPage(
  "01  /  PRODUCT SCOPE",
  "What is included?",
  "Saasapp Admin is a responsive dashboard template for SaaS teams. It provides front-end screens and sample interactions, not a hosted admin service or ready-made production backend.",
  2,
);
infoCard(
  "Next.js frontend",
  "A native App Router implementation with dedicated route files, shared console components, a responsive layout, and local sample data.",
  left,
  188,
  243,
  142,
);
infoCard(
  "React + Vite frontend",
  "The original standalone Vite implementation remains in saas-admin/. It is a separate choice; do not run it as a dependency of the Next.js app.",
  left + 257,
  188,
  247,
  142,
  [235, 246, 242],
);
sectionTitle("Included interface areas", 369);
let y = 394;
for (const item of [
  "Revenue dashboard, analytics charts, workspace activity, and acquisition summaries.",
  "User management with search, role and status filters, invitations, CSV export, and demo bulk actions.",
  "Billing and invoice screens, settings, system logs, a demo checkout, and login/sign-up pages.",
  "Responsive navigation, reusable dashboard styling, and Lucide icons.",
]) {
  y = bullet(item, left, y, width);
  y += 10;
}
box(left, 542, width, 96, colors.warning);
label("Not included unless separately supplied", left + 16, 568, [151, 94, 20]);
paragraph(
  "No SaaS backend, database, production authentication, payment processing, hosted analytics, or customer data migration is included in this frontend template.",
  left + 16,
  591,
  width - 32,
  { size: 9.3, leading: 14, color: colors.ink },
);

// Directory map and route list
startContentPage(
  "02  /  PROJECT MAP",
  "Folders and routes",
  "The Next.js app is self-contained in nextjs/. Use these entry points to find the screens, shared UI, styling, and documentation.",
  3,
);
sectionTitle("Top-level folders", 190);
const folderRows = [
  ["nextjs/app/", "App Router pages and root metadata"],
  ["nextjs/src/components/", "Console shell, interactions, and reusable screens"],
  ["nextjs/src/App.css", "Dashboard, layout, and responsive styles"],
  ["nextjs/src/index.css", "Global typography and base styles"],
  ["saas-admin/", "Independent React + Vite version"],
  ["docs/", "This PDF guide, generator, and branding assets"],
];
let rowY = 207;
for (const [folder, purpose] of folderRows) {
  box(left, rowY, width, 36, rowY % 2 ? colors.pale : [248, 249, 251], 5);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(8.7);
  textColor(colors.ink);
  pdf.text(folder, left + 12, rowY + 22);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  textColor(colors.muted);
  pdf.text(purpose, left + 170, rowY + 22);
  rowY += 42;
}
sectionTitle("App Router paths", 482);
const routes = [
  ["/dashboard", "Revenue and workspace overview"],
  ["/analytics", "Growth and performance insights"],
  ["/users", "Workspace user management"],
  ["/billing", "Plan, invoices, and payment UI"],
  ["/system-logs", "Security and event log table"],
  ["/settings", "Workspace preferences and integrations"],
  ["/activity", "Recent workspace activity"],
  ["/checkout", "Non-payment demo checkout"],
  ["/login  /  /signup", "Demo account entry screens"],
];
let routeY = 500;
for (const [route, description] of routes) {
  pdf.setFont("courier", "bold");
  pdf.setFontSize(8.2);
  textColor(colors.purple);
  pdf.text(route, left + 4, routeY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.3);
  textColor(colors.muted);
  pdf.text(description, left + 170, routeY);
  routeY += 20;
}

// Local setup
startContentPage(
  "03  /  LOCAL SETUP",
  "Run the Next.js app",
  "Use a current Node.js LTS release and npm. No API server or environment file is required for the included sample screens.",
  4,
);
sectionTitle("Windows PowerShell", 191);
paragraph("Open a terminal in the project folder, then run:", left, 214, width, { size: 9.3, leading: 13 });
codePanel(
  [
    'Set-Location "C:\\path\\to\\Saas-Admin\\nextjs"',
    "npm install",
    "npm run dev",
  ],
  left,
  240,
  width,
  { fontSize: 9, lineHeight: 15 },
);
paragraph(
  "When the server is ready, open http://localhost:3000. Keep the terminal open while using the app; stop the development server with Ctrl+C.",
  left,
  318,
  width,
  { size: 9.3, leading: 14, color: colors.ink },
);
sectionTitle("Before a deployment", 382);
codePanel(
  [
    "npm run typecheck",
    "npm run build",
    "npm start",
  ],
  left,
  405,
  width,
  { fontSize: 9, lineHeight: 15 },
);
paragraph(
  "Run the type check and production build from nextjs/. Fix reported errors before publishing. npm start serves the production build after it has been created.",
  left,
  482,
  width,
  { size: 9.3, leading: 14, color: colors.ink },
);
box(left, 550, width, 86, [235, 246, 242]);
label("Choose one frontend", left + 16, 576, colors.green);
paragraph(
  "The Next.js app uses port 3000 by default. The separate Vite app normally uses port 5173. They can run independently in separate terminals.",
  left + 16,
  599,
  width - 32,
  { size: 9.1, leading: 13.5, color: colors.ink },
);

// Architecture and customization
startContentPage(
  "04  /  APP STRUCTURE",
  "How the Next.js UI is organized",
  "Each URL has an App Router page. Shared navigation and page components are maintained in the Next.js project rather than imported from Vite.",
  5,
);
const architecture = [
  ["app/", "Contains route folders such as dashboard, analytics, users, and billing. Each page selects its own screen inside the shared console shell."],
  ["src/components/SaasAdminUI.jsx", "Contains the dashboard screens, small UI components, sample data, and shared admin navigation used by the route pages."],
  ["src/App.css", "Styles the dark dashboard, cards, tables, dialogs, mobile navigation, and responsive page grids."],
  ["src/index.css", "Sets global base styles, font stack, focus treatment, and selection color."],
];
let archY = 190;
for (const [name, description] of architecture) {
  box(left, archY, width, 89, archY % 2 ? colors.pale : [248, 249, 251]);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(8.5);
  textColor(colors.purple);
  pdf.text(name, left + 14, archY + 21);
  paragraph(description, left + 14, archY + 42, width - 28, { size: 8.7, leading: 12.5 });
  archY += 98;
}
sectionTitle("Safe customization sequence", 602);
paragraph(
  "Update visible labels and sample content first. Then change colors and spacing in the CSS. For new screens, add a route under app/ and a matching component in the Next.js source. Keep API credentials on the server; never expose secrets in browser code.",
  left,
  625,
  width,
  { size: 8.8, leading: 12.5, color: colors.ink },
);

// Screen guide
startContentPage(
  "05  /  SCREEN GUIDE",
  "What each screen demonstrates",
  "The routes are designed as a working prototype for review and customization. Several controls update local component state only.",
  6,
);
const features = [
  ["/dashboard", "KPI cards, revenue chart, activity feed, acquisition channels, and plan mix."],
  ["/analytics", "Revenue trend, growth insights, conversions, retention, and session metrics."],
  ["/users", "Searchable user table, filters, invite dialog, CSV download, and sample bulk controls."],
  ["/billing", "Plan summary, seat usage, invoice list, saved-card display, and demo key controls."],
  ["/system-logs", "Sample event metrics and severity/search filters for audit-style log entries."],
  ["/settings", "Workspace profile, member list, security options, API key and webhook examples."],
  ["/activity", "A feed of sample signups, upgrades, payments, and security events."],
  ["/checkout", "A visual upgrade flow with a clear warning that no payment is processed."],
  ["/login, /signup", "Presentation-only admin login and workspace creation screens."],
];
let featureY = 183;
for (const [route, description] of features) {
  pdf.setFont("courier", "bold");
  pdf.setFontSize(8.2);
  textColor(colors.purple);
  pdf.text(route, left + 3, featureY);
  const nextY = paragraph(description, left + 142, featureY, width - 146, { size: 8.6, leading: 11.5 });
  featureY = Math.max(featureY + 27, nextY + 5);
}
box(left, 620, width, 50, colors.warning);
paragraph(
  "Sample names, dates, locations, revenues, and activity are illustrative template content. Replace them with authorized data before a public launch.",
  left + 13,
  642,
  width - 26,
  { size: 8.7, leading: 12.5, color: colors.ink },
);

// Demo boundaries
startContentPage(
  "06  /  DEMO BOUNDARIES",
  "Know what is not connected",
  "The UI intentionally communicates a prototype experience. Do not treat visible screens or success messages as proof of server-side security or a completed transaction.",
  7,
);
const limits = [
  ["Authentication", "Login and registration are client-side demonstrations. There is no identity provider, password storage, session, or server authorization."],
  ["Data persistence", "User edits, workspace settings, and sample actions are local UI state. They are not written to a database and may reset on navigation or reload."],
  ["Billing", "Invoices and the saved card are sample display data. Checkout is not connected to Stripe or another processor; no charge is made and card details are not stored."],
  ["Security controls", "Two-factor toggles, sessions, API keys, and logs demonstrate UI states only. They do not create or revoke credentials or enforce access."],
];
let limitY = 190;
for (const [title, body] of limits) {
  box(left, limitY, width, 91, limitY % 2 ? colors.pale : [248, 249, 251]);
  label(title, left + 14, limitY + 22);
  paragraph(body, left + 14, limitY + 43, width - 28, { size: 8.9, leading: 13, color: colors.ink });
  limitY += 101;
}
box(left, 605, width, 64, colors.warning);
label("Production requires", left + 14, 628, [151, 94, 20]);
paragraph(
  "A backend API, database, server-side authorization, validated payment-provider integration, secure session design, and operational monitoring.",
  left + 14,
  648,
  width - 28,
  { size: 8.8, leading: 12.5, color: colors.ink },
);

// Customize and deploy
startContentPage(
  "07  /  CUSTOMIZE AND DEPLOY",
  "Production-readiness checklist",
  "Treat the template as the interface layer. Complete the following work with your product requirements and hosting provider before using real customer accounts or payments.",
  8,
);
let checklistY = 190;
for (const item of [
  "Replace the Saasapp brand, sample accounts, dates, financial values, notification text, and support address.",
  "Choose an authentication design and enforce roles in server-side code; hiding a page or button is not access control.",
  "Connect data through validated API calls and define loading, empty, error, and unauthorized states.",
  "Integrate billing only through a reputable payment provider. Never collect or store raw card numbers in this frontend.",
  "Move private keys and server credentials to protected deployment environment variables; do not use NEXT_PUBLIC_ for secrets.",
  "Review user-generated content, CSV exports, input validation, session expiration, logging, and rate limits.",
  "Test keyboard access, focus order, small screens, current browsers, and all error paths with realistic data.",
  "Build and smoke-test the production app, configure HTTPS and headers, and verify monitoring and backups for the connected services.",
]) {
  checklistY = bullet(item, left, checklistY, width, { size: 9, leading: 13 });
  checklistY += 13;
}
box(left, 584, width, 72, [235, 246, 242]);
label("Release gate", left + 15, 608, colors.green);
paragraph(
  "Do not represent demo login, API-key, security, or payment interactions as production features until the corresponding backend behavior has been implemented and tested.",
  left + 15,
  630,
  width - 30,
  { size: 8.8, leading: 12.5, color: colors.ink },
);

// Troubleshooting, license, and signature
startContentPage(
  "08  /  SUPPORT AND TERMS",
  "Troubleshooting and buyer notes",
  "Use these checks to distinguish local setup issues from features that are intentionally mock-only in this frontend template.",
  9,
);
const supportRows = [
  ["Install/build fails", "Check the Node.js version, rerun npm install in nextjs/, then read the first error from npm run typecheck or npm run build."],
  ["A route looks blank", "Confirm the URL matches the route list, check the browser console, and check the development terminal for a component or import error."],
  ["A change disappears", "Sample actions are not persistent. Connect the screen to a backend and save/update data through a controlled API."],
  ["Checkout or login seems real", "It is not connected. Do not enter real card data or rely on demo authentication for access control."],
];
let supportY = 182;
for (const [topic, answer] of supportRows) {
  label(topic, left, supportY);
  const nextY = paragraph(answer, left + 133, supportY, width - 133, { size: 8.5, leading: 12 });
  supportY = Math.max(supportY + 38, nextY + 9);
}
sectionTitle("License reminder", supportY + 4);
paragraph(
  "Use the template under the Cardzip license and purchase terms supplied with your order. A template purchase does not by itself transfer copyright or exclusive ownership. Consult the terms that apply to your specific purchase for permitted end products, redistribution limits, and support coverage.",
  left,
  supportY + 27,
  width,
  { size: 8.7, leading: 12.5, color: colors.ink },
);
stroke(colors.line);
pdf.line(left, 628, right, 628);
pdf.addImage(signature, "JPEG", left, 638, 116, 46);
pdf.setFont("helvetica", "bold");
pdf.setFontSize(9);
textColor(colors.ink);
pdf.text("Cardzip Services Limited", left + 128, 655);
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8);
textColor(colors.muted);
pdf.text("Buyer documentation and template support", left + 128, 670);

if (pdf.getNumberOfPages() !== 9) {
  throw new Error(`Expected a 9-page buyer guide, generated ${pdf.getNumberOfPages()} pages.`);
}

fs.writeFileSync(output, Buffer.from(pdf.output("arraybuffer")));
console.log(`Generated ${output} (${pdf.getNumberOfPages()} pages).`);
