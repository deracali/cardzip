import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const docsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRequire = createRequire(path.join(docsDirectory, "..", "vite", "package.json"));
const { jsPDF } = projectRequire("jspdf");
const cardzipLogo = readFileSync(path.join(docsDirectory, "assets", "cardzip-logo.jpg"));
const cardzipSignature = readFileSync(path.join(docsDirectory, "assets", "cardzip-signature.jpg"));
const outputPath = path.join(docsDirectory, "KINDRED-NGO-BUYER-GUIDE.pdf");
const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
const pageWidth = 612;
const pageHeight = 792;
const left = 52;
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
  title: "Kindred NGO Hub Buyer Guide",
  subject: "Installation, access control, pledge workflow and buyer information",
  author: "Kindred NGO Hub",
  creator: "Kindred NGO Hub documentation",
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

function addParagraph(text, x, y, width, { size = 9.5, leading = 13.5, color = colors.muted, font = "normal" } = {}) {
  pdf.setFont("helvetica", font);
  pdf.setFontSize(size);
  textColor(color);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function addLabel(text, x, y, color = colors.green) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  textColor(color);
  pdf.text(text.toUpperCase(), x, y);
}

function addHeading(text, x, y, size = 16, color = colors.ink) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(size);
  textColor(color);
  pdf.text(text, x, y);
}

function addBullet(text, x, y, width, options = {}) {
  fill(options.bulletColor || colors.green);
  pdf.circle(x + 3, y - 3, 2, "F");
  return addParagraph(text, x + 13, y, width - 13, {
    size: options.size || 9.2,
    leading: options.leading || 13,
    color: options.color || colors.muted,
  });
}

function addCodePanel(lines, x, y, width, { fontSize = 8.5, lineHeight = 12.5 } = {}) {
  const panelHeight = 20 + lines.length * lineHeight;
  roundedBox(x, y, width, panelHeight, colors.code, 7);
  pdf.setFont("courier", "normal");
  pdf.setFontSize(fontSize);
  textColor(colors.codeText);
  pdf.text(lines, x + 13, y + 16, { lineHeightFactor: lineHeight / fontSize });
  return panelHeight;
}

function addPageHeader(section, title, intro) {
  pdf.addImage(cardzipLogo, "JPEG", left, 25, 27, 27);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text("CARDZIP", left + 36, 36);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  textColor(colors.muted);
  pdf.text("KINDRED NGO HUB BUYER GUIDE", left + 36, 48);
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, 55, right, 55);
  addLabel(section, left, 82);
  addHeading(title, left, 109, 21);
  addParagraph(intro, left, 130, contentWidth, { size: 9.5, leading: 13.5 });
}

let pageNumber = 1;
function addFooter() {
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, pageHeight - 42, right, pageHeight - 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text("KINDRED NGO HUB  |  BUYER GUIDE v1.0", left, pageHeight - 26);
  pdf.text(String(pageNumber).padStart(2, "0"), right, pageHeight - 26, { align: "right" });
}

function nextPage(section, title, intro) {
  addFooter();
  pdf.addPage();
  pageNumber += 1;
  addPageHeader(section, title, intro);
}

// Cover
fill(colors.darkGreen);
pdf.rect(0, 0, pageWidth, pageHeight, "F");
fill(colors.green);
pdf.circle(550, 76, 148, "F");
fill(colors.darkGreen);
pdf.circle(550, 76, 117, "F");
pdf.addImage(cardzipLogo, "JPEG", left, 60, 62, 62);
pdf.setFont("helvetica", "bold");
pdf.setFontSize(10);
textColor(colors.lime);
pdf.text("KINDRED  /  BUYER DOCUMENTATION", left, 150);
addHeading("NGO Hub", left, 213, 38, colors.white);
addHeading("buyer guide", left, 255, 29, colors.white);
addParagraph(
  "Install and operate the Vite or Next.js storefront, connect the shared API, understand the donor and administrator experience, and prepare the template for launch.",
  left,
  293,
  435,
  { size: 11.5, leading: 17, color: [224, 238, 230] },
);
roundedBox(left, 425, contentWidth, 134, [16, 75, 57], 13);
addLabel("Three independent applications", left + 20, 455, colors.lime);
addHeading("React / Vite   Next.js   Express API", left + 20, 484, 16, colors.white);
addParagraph("Choose one frontend. Either can connect to the same role-protected backend and MongoDB database.", left + 20, 510, contentWidth - 40, { size: 9.5, leading: 13.5, color: [224, 238, 230] });
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8);
textColor([224, 238, 230]);
pdf.text("Version 1.0  |  Setup, usage and buyer notes", left, 727);
textColor(colors.lime);
pdf.text("KINDRED NGO HUB", right, 727, { align: "right" });

// 01 / Choose your package
pdf.addPage();
pageNumber += 1;
addPageHeader("01 / Choose your package", "What did you purchase?", "The repository separates two frontend choices from the backend. The order record determines the delivered files and license scope.");
const cardY = 174;
const cardGap = 14;
const cardWidth = (contentWidth - cardGap) / 2;
roundedBox(left, cardY, cardWidth, 221, colors.pale, 10);
addLabel("Frontend package", left + 16, cardY + 27);
addHeading("Frontend files", left + 16, cardY + 52, 16);
let y = cardY + 78;
y = addBullet("Use the Vite or Next.js frontend identified in your order.", left + 16, y, cardWidth - 32);
y += 9;
y = addBullet("Customize the included pages, layout and brand for your product.", left + 16, y, cardWidth - 32);
y += 9;
addBullet("The separate API and database source are included only if the order says so.", left + 16, y, cardWidth - 32);
const fullX = left + cardWidth + cardGap;
roundedBox(fullX, cardY, cardWidth, 221, [230, 244, 235], 10);
addLabel("Full template", fullX + 16, cardY + 27);
addHeading("Frontend + API", fullX + 16, cardY + 52, 16);
y = cardY + 78;
y = addBullet("Includes the selected frontend and backend source when stated in the order.", fullX + 16, y, cardWidth - 32);
y += 9;
y = addBullet("Configure MongoDB, private server settings and allowed origins.", fullX + 16, y, cardWidth - 32);
y += 9;
addBullet("Use the files within the scope of the applicable purchase terms.", fullX + 16, y, cardWidth - 32);
roundedBox(left, 416, contentWidth, 116, colors.warning, 9);
addLabel("Important distinction", left + 16, 441, [151, 94, 20]);
addParagraph("The buyer's order and applicable license determine the included package. A template purchase is not an ownership transfer or permission to redistribute source as a standalone product.", left + 16, 464, contentWidth - 32, { size: 9.5, leading: 14, color: colors.ink });
addParagraph("This guide is informational; review the terms supplied with your purchase for the definitive scope.", left, 559, contentWidth, { size: 9, leading: 13 });

// 02 / Prepare
nextPage("02 / Prepare", "Before you run anything", "Open a terminal in the project folder. Run the backend and selected frontend in separate terminals.");
addHeading("You will need", left, 184, 12);
let prepY = 208;
prepY = addBullet("Node.js 20.19 or later and npm.", left, prepY, contentWidth);
prepY += 7;
prepY = addBullet("MongoDB (local or hosted) for the full-template backend.", left, prepY, contentWidth);
prepY += 7;
addBullet("A private JWT secret (at least 32 characters) and administrator invitation code.", left, prepY, contentWidth);
addHeading("Project folders", left, 302, 12);
const rows = [
  ["vite/src/pages", "Storefront screens and Vite path router"],
  ["vite/src/components", "Shared header, footer and campaign UI"],
  ["vite/src/data + services", "Campaign content, API client and session"],
  ["vite/public", "Campaign images, icons and buyer-guide.pdf"],
  ["nextjs/app", "Native URL routes, metadata and app layout"],
  ["nextjs/src/page-components + components", "Reusable screens and shared UI"],
  ["nextjs/src/data + services", "Campaign content, API client and session"],
  ["nextjs/public", "Images, icons and buyer-guide.pdf"],
  ["backend/routes + controllers", "Public, donor and admin API endpoints"],
  ["backend/models + middleware + services + utils", "MongoDB store, role checks and auth helpers"],
  ["docs", "Markdown, PDF generator and Cardzip assets"],
];
let rowY = 322;
for (const [folder, purpose] of rows) {
  roundedBox(left, rowY, contentWidth, 27, colors.pale, 5);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(7.5);
  textColor(colors.ink);
  pdf.text(folder, left + 10, rowY + 17);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text(purpose, left + 254, rowY + 17);
  rowY += 29;
}
roundedBox(left, 652, contentWidth, 58, [230, 244, 235], 8);
addLabel("Keep secrets private", left + 14, 673);
addParagraph("Never publish .env files, database credentials, admin codes or JWT secrets. Frontend variables contain public settings only.", left + 14, 692, contentWidth - 28, { size: 8.2, leading: 11, color: colors.ink });

// 03 / Start the backend
nextPage("03 / Full template", "Start the backend API", "The backend is required for sign-in, donor dashboards and pledge records. It needs a reachable MongoDB database.");
addHeading("1. Configure the API", left, 183, 12);
addParagraph("From the project folder, open a terminal in backend/ and copy the environment example. Fill in your own private settings.", left, 204, contentWidth, { size: 9.2, leading: 13 });
addCodePanel(["Set-Location .\\backend", "Copy-Item .env.example .env"], left, 244, contentWidth);
addParagraph("In .env, set MONGODB_URI, JWT_SECRET and ADMIN_SIGNUP_CODE. Set ALLOWED_ORIGINS to your exact frontend origins. Do not copy backend secrets into frontend environment files.", left, 309, contentWidth, { size: 9.2, leading: 13 });
addHeading("2. Install and run", left, 388, 12);
addCodePanel(["npm install", "npm run dev"], left, 409, contentWidth);
addParagraph("Keep the API terminal open. The default local API URL is http://localhost:5000/api. Start only one frontend in a second terminal.", left, 466, contentWidth, { size: 9.2, leading: 13 });
addLabel("API route groups", left, 520);
addParagraph("Public campaigns and account creation; donor dashboard and pledge creation; administrator dashboard, pledge review and status updates. The API checks bearer tokens and roles on protected endpoints.", left, 539, contentWidth, { size: 8.7, leading: 12, color: colors.ink });
roundedBox(left, 588, contentWidth, 75, colors.warning, 8);
addLabel("If the server will not start", left + 14, 610, [151, 94, 20]);
addParagraph("Check MongoDB connectivity and .env values. The backend requires valid database settings and does not fall back to demo-only storage.", left + 14, 630, contentWidth - 28, { size: 8.5, leading: 11.5, color: colors.ink });

// 04 / Choose a frontend
nextPage("04 / Choose one frontend", "Run Vite or Next.js", "The frontends are alternatives, not one combined application. Use a separate terminal from the backend.");
const frontendCardY = 166;
roundedBox(left, frontendCardY, contentWidth, 211, colors.pale, 10);
addLabel("Option A", left + 16, frontendCardY + 25);
addHeading("React + Vite", left + 16, frontendCardY + 49, 15);
addParagraph("For the standalone React version. The environment example points to the local API; edit VITE_NGO_API_URL if needed.", left + 16, frontendCardY + 70, contentWidth - 32, { size: 8.9, leading: 12.5 });
addCodePanel(["Set-Location .\\vite", "Copy-Item .env.example .env", "npm install", "npm run dev"], left + 16, frontendCardY + 112, contentWidth - 32, { fontSize: 8.1, lineHeight: 11.5 });
const nextY = 392;
roundedBox(left, nextY, contentWidth, 211, [230, 244, 235], 10);
addLabel("Option B", left + 16, nextY + 25);
addHeading("Next.js", left + 16, nextY + 49, 15);
addParagraph("For the native App Router version. Its environment example points to the same API; override NEXT_PUBLIC_NGO_API_URL if needed.", left + 16, nextY + 70, contentWidth - 32, { size: 8.9, leading: 12.5 });
addCodePanel(["Set-Location .\\nextjs", "Copy-Item .env.example .env.local", "npm install", "npm run dev"], left + 16, nextY + 112, contentWidth - 32, { fontSize: 8.1, lineHeight: 11.5 });
addParagraph("Vite normally opens on port 5173; Next.js on port 3000. Routes include /causes, /signin, /signup, /checkout, /dashboard, /admin/login, /admin/signup and /admin. Use the dev-server address.", left, 626, contentWidth, { size: 8.2, leading: 11.5 });

// 05 / Customize and launch
nextPage("05 / Make it yours", "Customize and launch checklist", "Replace the demonstration content and validate the live setup before sharing the site with donors.");
roundedBox(left, 164, contentWidth, 135, colors.pale, 9);
addLabel("What this template provides", left + 15, 188);
addParagraph("A campaign storefront, donor authentication, private donor pledge history and an invitation-protected administrator dashboard. Vite maps paths through src/App.jsx; Next.js uses native app/ routes and reusable screens in src/page-components. Campaign copy and imagery are samples to replace.", left + 15, 212, contentWidth - 30, { size: 9, leading: 12.5, color: colors.ink });
addHeading("Before production", left, 327, 12);
let checklistY = 351;
for (const item of [
  "Verify campaign descriptions, impact figures, imagery and organization details.",
  "Use HTTPS and set CORS to exact production frontend origins.",
  "Configure server-side secrets, MongoDB backups and administrator onboarding.",
  "Test protected donor/admin API routes with accounts of both roles.",
  "Run backend tests, Vite lint/build and Next.js typecheck/build.",
]) {
  checklistY = addBullet(item, left, checklistY, contentWidth, { size: 9, leading: 12.5 });
  checklistY += 9;
}
roundedBox(left, 494, contentWidth, 98, colors.warning, 9);
addLabel("Pledges are not payments", left + 15, 518, [151, 94, 20]);
addParagraph("Checkout saves a pledge record only. No card details are collected, no payment is processed, and paymentStatus remains Not processed. Integrate a suitable provider and review applicable obligations before collecting real funds.", left + 15, 541, contentWidth - 30, { size: 8.6, leading: 11.8, color: colors.ink });
roundedBox(left, 609, contentWidth, 62, [230, 244, 235], 8);
addLabel("Quick checks", left + 14, 631);
addParagraph("API unavailable: check the server and URL. CORS error: check ALLOWED_ORIGINS. Sign-in error: check role, MongoDB and server logs.", left + 14, 650, contentWidth - 28, { size: 8, leading: 10.5, color: colors.ink });

// 06 / Buyer license
nextPage("06 / Buyer license", "Purchase scope and permitted use", "This page is a buyer-facing summary only. The order and applicable license terms govern.");
let licenseY = 181;
for (const item of [
  "The purchase record determines which frontend and backend files are included in the buyer's package.",
  "Use, modification, commercial deployment and redistribution are governed by the license supplied with the order.",
  "Do not resell, sublicense or redistribute source as a standalone template unless the applicable terms expressly allow it.",
  "Third-party packages, fonts and other assets remain subject to their own licenses and terms.",
  "A template purchase does not itself assign copyright or exclusive ownership. A different rights transfer requires a separate explicit written agreement.",
]) {
  licenseY = addBullet(item, left, licenseY, contentWidth, { size: 9.4, leading: 13.5, color: colors.ink });
  licenseY += 12;
}
roundedBox(left, 465, contentWidth, 112, colors.pale, 9);
addLabel("Buyer record", left + 16, 490);
addParagraph("Order reference: ______________________________________________", left + 16, 516, contentWidth - 32, { size: 9.3, leading: 14, color: colors.ink });
addParagraph("Purchase date: _________________________________________________", left + 16, 543, contentWidth - 32, { size: 9.3, leading: 14, color: colors.ink });
addLabel("For Cardzip Services Limited", left, 595);
pdf.addImage(cardzipSignature, "JPEG", left, 600, 128, 48);
stroke(colors.line);
pdf.setLineWidth(0.8);
pdf.line(left, 650, left + 158, 650);
addParagraph("Authorized company signature", left, 663, 158, { size: 8, leading: 10, color: colors.muted });
pdf.setFont("helvetica", "normal");
pdf.setFontSize(8);
textColor(colors.muted);
pdf.text("Date: ____________________", left + 220, 650);
roundedBox(left, 686, contentWidth, 43, colors.warning, 8);
addParagraph("This guide does not create, replace or amend a license agreement. Refer to the terms tied to the buyer's transaction.", left + 13, 704, contentWidth - 26, { size: 8.2, leading: 11, color: colors.ink });

// 07 / Project walkthrough
nextPage("07 / Project walkthrough", "How Kindred is organized", "The public campaign pages, donor portal and administrator screens support separate parts of the giving workflow.");
addLabel("Project purpose", left, 183);
let walkthroughY = 207;
walkthroughY = addBullet("Visitors can explore campaign stories and start a pledge from the campaign page or general fund.", left, walkthroughY, contentWidth);
walkthroughY += 9;
walkthroughY = addBullet("Donors create an account, submit a pledge and review their own pledge history.", left, walkthroughY, contentWidth);
walkthroughY += 9;
addBullet("Admins review pledge activity and update the status; server role checks protect the API.", left, walkthroughY, contentWidth);
roundedBox(left, 322, contentWidth, 123, colors.pale, 9);
addLabel("Donor journey", left + 15, 347);
addParagraph("Campaign page  →  Sign in or create account  →  Pledge checkout  →  Donor dashboard", left + 15, 374, contentWidth - 30, { size: 10, leading: 15, color: colors.ink });
addParagraph("A donor dashboard shows only the authenticated donor's own pledge records.", left + 15, 408, contentWidth - 30, { size: 9, leading: 13, color: colors.muted });
roundedBox(left, 464, contentWidth, 123, colors.warning, 9);
addLabel("Administrator journey", left + 15, 489, [151, 94, 20]);
addParagraph("Invitation signup  →  Admin sign in  →  Review pledge queue  →  Acknowledge or cancel", left + 15, 516, contentWidth - 30, { size: 10, leading: 15, color: colors.ink });
addParagraph("An admin invitation code is configured only on the backend; the frontend never grants roles.", left + 15, 550, contentWidth - 30, { size: 9, leading: 13, color: colors.muted });

// 08 / Admin usage
nextPage("08 / Admin usage", "Use the administrator screens", "The admin dashboard is intended for reviewing campaign and donor pledge activity.");
const adminSections = [
  ["Overview", "Review donor accounts, active campaigns, pledge totals and pending review."],
  ["Pledge queue", "Inspect donor, campaign, amount, frequency, date and optional note."],
  ["Status updates", "Pledge received can become Acknowledged or Cancelled; neither confirms payment."],
  ["Donor privacy", "Donors see only their own history; admins review the shared queue."],
  ["Access control", "Each protected endpoint requires a valid token and matching client/admin role."],
];
let adminY = 174;
for (const [title, body] of adminSections) {
  roundedBox(left, adminY, contentWidth, 55, colors.pale, 7);
  addHeading(title, left + 13, adminY + 21, 10.5);
  addParagraph(body, left + 135, adminY + 20, contentWidth - 150, { size: 8.6, leading: 11.5, color: colors.ink });
  adminY += 63;
}
roundedBox(left, 503, contentWidth, 87, colors.warning, 9);
addLabel("Do not treat a pledge as a receipt", left + 14, 527, [151, 94, 20]);
addParagraph("The API does not process payments or confirm funds received. Verify any payment with your payment provider before issuing receipts or describing it as completed.", left + 14, 548, contentWidth - 28, { size: 8.8, leading: 12.2, color: colors.ink });
addParagraph("Commands: backend npm test  |  Vite npm run lint / npm run build  |  Next.js npm run typecheck / npm run build", left, 621, contentWidth, { size: 8.2, leading: 11, color: colors.muted });
addFooter();

await writeFile(outputPath, Buffer.from(pdf.output("arraybuffer")));
console.log(`Created ${outputPath} (${pdf.getNumberOfPages()} pages).`);
