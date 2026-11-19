import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRequire = createRequire(path.join(here, '..', 'Agency-portal', 'package.json'));
const { jsPDF } = projectRequire('jspdf');

const output = path.join(here, 'CARDZIP-AGENCY-PORTAL-BUYER-GUIDE.pdf');
const logoPath = path.join(here, '..', 'nextjs', 'public', 'cardzip-logo.jpg');
const signaturePath = path.join(here, '..', '..', '..', 'cardzip-admin', 'admin', 'public', 'cardzip-signature.jpg');
const logo = fs.readFileSync(logoPath);
const signature = fs.readFileSync(signaturePath);

const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
const pageWidth = 612;
const pageHeight = 792;
const left = 54;
const right = pageWidth - 54;
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
  title: 'Cardzip Agency Portal Buyer Guide',
  subject: 'Installation, startup, package comparison and Cardzip template license',
  author: 'Cardzip Services Limited',
  creator: 'Cardzip Services Limited',
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

function roundedBox(x, y, w, h, color, radius = 10) {
  fill(color);
  pdf.roundedRect(x, y, w, h, radius, radius, 'F');
}

function addParagraph(text, x, y, width, options = {}) {
  const { size = 10, color = colors.muted, leading = size * 1.45, font = 'normal' } = options;
  pdf.setFont('helvetica', font);
  pdf.setFontSize(size);
  textColor(color);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function paragraphHeight(text, width, size, leading) {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(size);
  return pdf.splitTextToSize(text, width).length * leading;
}

function addLabel(text, x, y, color = colors.green) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  textColor(color);
  pdf.text(text.toUpperCase(), x, y);
}

function addHeading(text, x, y, size = 18, color = colors.ink) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(size);
  textColor(color);
  pdf.text(text, x, y);
}

function addCodePanel(lines, x, y, w, options = {}) {
  const fontSize = options.fontSize ?? 9;
  const lineHeight = options.lineHeight ?? 14;
  const height = 22 + lines.length * lineHeight;
  roundedBox(x, y, w, height, colors.code, 8);
  fill(colors.lime);
  pdf.roundedRect(x, y, 4, height, 2, 2, 'F');
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(fontSize);
  textColor(colors.codeText);
  pdf.text(lines, x + 15, y + 20, { lineHeightFactor: lineHeight / fontSize });
  return height;
}

function addPageHeader(section, title, intro) {
  pdf.addImage(logo, 'JPEG', left, 28, 27, 27);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  textColor(colors.ink);
  pdf.text('CARDZIP', left + 36, 39);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  textColor(colors.muted);
  pdf.text('AGENCY PORTAL BUYER GUIDE', left + 36, 51);
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
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  textColor(colors.muted);
  pdf.text('CARDZIP SERVICES LIMITED  |  GUIDE v1.0  |  13 NOVEMBER 2026', left, pageHeight - 26);
  pdf.text(String(pageNumber).padStart(2, '0'), right, pageHeight - 26, { align: 'right' });
}

function addSectionTitle(title, x, y) {
  addHeading(title, x, y, 12);
}

function addBullet(text, x, y, width, options = {}) {
  fill(options.bulletColor ?? colors.green);
  pdf.circle(x + 3, y - 3, 2, 'F');
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

// Cover
fill(colors.darkGreen);
pdf.rect(0, 0, pageWidth, pageHeight, 'F');
fill(colors.green);
pdf.circle(548, 86, 150, 'F');
fill(colors.darkGreen);
pdf.circle(548, 86, 120, 'F');
pdf.addImage(logo, 'JPEG', left, 62, 66, 66);
pdf.setFont('helvetica', 'bold');
pdf.setFontSize(11);
textColor(colors.lime);
pdf.text('CARDZIP  /  BUYER DOCUMENTATION', left, 166);
pdf.setFontSize(34);
textColor(colors.white);
pdf.text('Agency Portal', left, 225);
pdf.text('buyer guide', left, 266);
addParagraph(
  'Install, configure and launch the React or Next.js frontend with the included Node.js backend. Understand what each purchase includes and how the Cardzip license works.',
  left,
  304,
  430,
  { size: 12, leading: 18, color: [224, 238, 230] },
);
roundedBox(left, 435, contentWidth, 125, [16, 75, 57], 14);
addLabel('Three separate apps', left + 22, 466, colors.lime);
addHeading('React  /  Next.js  /  Express API', left + 22, 492, 17, colors.white);
addParagraph(
  'Choose one frontend. Start the API separately when your chosen pages need live data.',
  left + 22,
  517,
  contentWidth - 44,
  { size: 10, leading: 14, color: [224, 238, 230] },
);
pdf.setFont('helvetica', 'normal');
pdf.setFontSize(9);
textColor([224, 238, 230]);
pdf.text('Prepared 13 November 2026  |  Version 1.0', left, 726);
textColor(colors.lime);
pdf.text('CARDZIP SERVICES LIMITED', right, 726, { align: 'right' });

// Package comparison
addFooterAndNewPage(1);
addPageHeader(
  '01  /  CHOOSE YOUR PACKAGE',
  'What did you purchase?',
  'This repository contains two frontend choices and a separate backend. Your order determines which files and license rights are included.',
);
const cardY = 192;
const cardGap = 14;
const cardWidth = (contentWidth - cardGap) / 2;
roundedBox(left, cardY, cardWidth, 221, colors.pale);
addLabel('Template only', left + 18, cardY + 28);
addHeading('Frontend files', left + 18, cardY + 54, 17);
let y = cardY + 82;
y = addBullet('Choose the React/Vite or Next.js frontend delivered with your order.', left + 18, y, cardWidth - 36);
y += 9;
y = addBullet('Customize the included pages, layout and brand for one end product.', left + 18, y, cardWidth - 36);
y += 9;
addBullet('The separate Express API and database are not included unless your order says otherwise.', left + 18, y, cardWidth - 36);

const fullX = left + cardWidth + cardGap;
roundedBox(fullX, cardY, cardWidth, 221, [230, 244, 235]);
addLabel('Full template', fullX + 18, cardY + 28);
addHeading('Frontend + backend', fullX + 18, cardY + 54, 17);
y = cardY + 82;
y = addBullet('Includes the selected frontend plus the Express API source in the backend folder.', fullX + 18, y, cardWidth - 36);
y += 9;
y = addBullet('Configure MongoDB and private server settings before enabling live data.', fullX + 18, y, cardWidth - 36);
y += 9;
addBullet('Use commercially in one end product under the Cardzip license; this is not an IP buyout.', fullX + 18, y, cardWidth - 36);

roundedBox(left, 438, contentWidth, 120, colors.warning);
addLabel('Important distinction', left + 18, 464, [151, 94, 20]);
addParagraph(
  'A full-template purchase gives you the complete included stack. It does not transfer copyright or exclusive ownership. A full or exclusive rights transfer is available only through a separate, expressly agreed outright purchase documented in writing by Cardzip.',
  left + 18,
  489,
  contentWidth - 36,
  { size: 10, leading: 15, color: colors.ink },
);
addParagraph(
  'The product files are in separate folders: Agency-portal (React/Vite), nextjs (Next.js), and backend (Express/MongoDB).',
  left,
  594,
  contentWidth,
  { size: 9.5, leading: 14 },
);
addFooter(2);

// Prerequisites and folder map
pdf.addPage();
addPageHeader(
  '02  /  PREPARE',
  'Before you run anything',
  'Unzip the delivered project first. Open Command Prompt in the project folder, and keep each app running in its own terminal window.',
);
addSectionTitle('You will need', left, 203);
let bulletY = 229;
bulletY = addBullet('Node.js 20.19 or later and npm. Verify with node --version and npm --version.', left, bulletY, contentWidth);
bulletY += 12;
bulletY = addBullet('A MongoDB database (local or hosted) for the full-template backend.', left, bulletY, contentWidth);
bulletY += 12;
bulletY = addBullet('The connection string, a private JWT secret (at least 32 characters), and an admin invitation code.', left, bulletY, contentWidth);

addSectionTitle('Project folders', left, 323);
const folderRows = [
  ['Agency-portal', 'React + Vite frontend', 'http://localhost:5173'],
  ['nextjs', 'Next.js frontend (use instead of React)', 'http://localhost:3000'],
  ['backend', 'Express API + MongoDB', 'http://localhost:5000'],
];
let rowY = 342;
for (const [folder, purpose, url] of folderRows) {
  roundedBox(left, rowY, contentWidth, 48, colors.pale, 7);
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(9.5);
  textColor(colors.ink);
  pdf.text(folder, left + 13, rowY + 20);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  textColor(colors.muted);
  pdf.text(purpose, left + 147, rowY + 20);
  pdf.text(url, left + 147, rowY + 35);
  rowY += 57;
}
roundedBox(left, 535, contentWidth, 74, [230, 244, 235], 9);
addLabel('Keep secrets private', left + 16, 559);
addParagraph(
  'Never publish .env files, database credentials, admin codes or JWT secrets. Do not put backend secrets in a VITE_ or NEXT_PUBLIC_ variable; those values are exposed to browsers.',
  left + 16,
  581,
  contentWidth - 32,
  { size: 9, leading: 13, color: colors.ink },
);
addFooter(3);

// Backend setup
pdf.addPage();
addPageHeader(
  '03  /  FULL TEMPLATE',
  'Start the backend API',
  'The backend is required for sign-in, project, client, inquiry and other live data features. It requires a reachable MongoDB database and does not silently fall back to demo data.',
);
addSectionTitle('1. Configure the API', left, 204);
addParagraph(
  'Open a new Windows Command Prompt. Replace the sample path with the folder where you unzipped the template:',
  left,
  227,
  contentWidth,
  { size: 9.5, leading: 14 },
);
addCodePanel(
  [
    'cd /d "C:\\path\\to\\Agency-Portal\\backend"',
    'copy .env.example .env',
    'notepad .env',
  ],
  left,
  269,
  contentWidth,
);
addParagraph(
  'In .env, set MONGODB_URI, JWT_SECRET and ADMIN_SIGNUP_CODE. Use your own private values; replace every example placeholder. Leave optional mail and image-upload fields empty unless you configure those services.',
  left,
  346,
  contentWidth,
  { size: 9.5, leading: 14 },
);
addSectionTitle('2. Install and run', left, 405);
addCodePanel(
  [
    'npm install',
    'npm run dev',
  ],
  left,
  430,
  contentWidth,
);
addParagraph(
  'Keep this terminal open. The API listens on port 5000 by default. Start only one frontend in a second Command Prompt. The frontend calls http://localhost:5000/api unless you change its API URL.',
  left,
  498,
  contentWidth,
  { size: 9.5, leading: 14 },
);
roundedBox(left, 570, contentWidth, 74, colors.warning, 9);
addLabel('If the server will not start', left + 16, 595, [151, 94, 20]);
addParagraph(
  'Check MongoDB connectivity and the .env values first. The backend deliberately exits when its required database settings are missing or MongoDB cannot be reached.',
  left + 16,
  617,
  contentWidth - 32,
  { size: 9, leading: 13, color: colors.ink },
);
addFooter(4);

// Frontend setup
pdf.addPage();
addPageHeader(
  '04  /  CHOOSE ONE FRONTEND',
  'Run React or Next.js',
  'The two frontends are alternatives, not a single combined app. Use a separate Command Prompt from the backend terminal.',
);
const frontendCardY = 190;
const frontendCardH = 204;
roundedBox(left, frontendCardY, contentWidth, frontendCardH, colors.pale, 10);
addLabel('Option A', left + 17, frontendCardY + 26);
addHeading('React + Vite', left + 17, frontendCardY + 51, 16);
addParagraph(
  'For the standalone React version. Its .env.example includes the local API URL; edit the copied .env if your API runs elsewhere.',
  left + 17,
  frontendCardY + 73,
  contentWidth - 34,
  { size: 9, leading: 13 },
);
addCodePanel(
  [
    'cd /d "C:\\path\\to\\Agency-Portal\\Agency-portal"',
    'copy .env.example .env',
    'notepad .env',
    'npm install',
    'npm run dev',
  ],
  left + 17,
  frontendCardY + 121,
  contentWidth - 34,
  { fontSize: 8.3, lineHeight: 12 },
);

const nextY = 409;
roundedBox(left, nextY, contentWidth, 190, [230, 244, 235], 10);
addLabel('Option B', left + 17, nextY + 26);
addHeading('Next.js', left + 17, nextY + 51, 16);
addParagraph(
  'For the Next.js version. Its API URL defaults to http://localhost:5000/api. Set the environment variable below only if you need to override that default.',
  left + 17,
  nextY + 73,
  contentWidth - 34,
  { size: 9, leading: 13 },
);
addCodePanel(
  [
    'cd /d "C:\\path\\to\\Agency-Portal\\nextjs"',
    'set NEXT_PUBLIC_AGENCY_API_URL=http://localhost:5000/api',
    'npm install',
    'npm run dev',
  ],
  left + 17,
  nextY + 121,
  contentWidth - 34,
  { fontSize: 8.3, lineHeight: 12 },
);
addParagraph(
  'Open the local address printed in the terminal. The Vite frontend normally uses port 5173; Next.js normally uses port 3000.',
  left,
  623,
  contentWidth,
  { size: 9, leading: 13 },
);
addFooter(5);

// About and production
pdf.addPage();
addPageHeader(
  '05  /  MAKE IT YOURS',
  'About page and launch checklist',
  'This is a branded starting point. Replace the sample NOVA Studio story, imagery and contact details with your own before publishing.',
);
roundedBox(left, 190, contentWidth, 137, colors.pale);
addLabel('What the About page communicates', left + 17, 216);
addParagraph(
  'The supplied NOVA Studio About page introduces an independent creative studio, explains its creator-led and outcome-minded approach, and describes open collaboration. Treat that copy as sample content: update the studio name, story, values, images and calls to action to match your business.',
  left + 17,
  241,
  contentWidth - 34,
  { size: 9.5, leading: 14, color: colors.ink },
);
addSectionTitle('Before production', left, 367);
let checklistY = 393;
checklistY = addBullet('Build the selected frontend with npm run build and fix any reported errors.', left, checklistY, contentWidth);
checklistY += 11;
checklistY = addBullet('Configure production MongoDB, JWT_SECRET, ADMIN_SIGNUP_CODE, CORS allowed origins and frontend URL on the server.', left, checklistY, contentWidth);
checklistY += 11;
checklistY = addBullet('Use HTTPS, replace sample OAuth settings, and configure optional SMTP or Cloudinary values only if needed.', left, checklistY, contentWidth);
checklistY += 11;
checklistY = addBullet('Deploy the backend and frontend to your chosen hosts; localhost URLs are for local development only.', left, checklistY, contentWidth);
roundedBox(left, 536, contentWidth, 84, [230, 244, 235], 9);
addLabel('Quick checks', left + 16, 561);
addParagraph(
  'Frontend cannot reach API: confirm the API is running and the URL is correct. Browser blocks requests: check backend ALLOWED_ORIGINS. Sign-in or database errors: inspect the backend terminal and verify MongoDB and secrets.',
  left + 16,
  584,
  contentWidth - 32,
  { size: 9, leading: 13, color: colors.ink },
);
addFooter(6);

// License summary / signature page
pdf.addPage();
addPageHeader(
  '06  /  BUYER LICENSE',
  'Cardzip template license',
  'Buyer-facing license terms for the Agency Portal files. This is a plain-language draft for review and should be aligned with Cardzip’s sale records and final legal terms.',
);
let legalY = 205;
legalY = addBullet(
  'Grant: after confirmed payment, Cardzip grants the buyer a non-exclusive, non-transferable license to use and modify the files included in the purchased package to create one end product. No additional royalty is due for permitted end-product use.',
  left,
  legalY,
  contentWidth,
  { size: 9, leading: 13 },
);
legalY += 8;
legalY = addBullet(
  'Template-only: the grant covers the purchased frontend files only. It does not include the separate backend or database source unless the order expressly includes them.',
  left,
  legalY,
  contentWidth,
  { size: 9, leading: 13 },
);
legalY += 8;
legalY = addBullet(
  'Full template: the grant covers the purchased frontend and included backend/API source for one commercial end product. The buyer may configure, modify and operate that product.',
  left,
  legalY,
  contentWidth,
  { size: 9, leading: 13 },
);
legalY += 8;
legalY = addBullet(
  'Restrictions: do not resell, sublicense, publish or redistribute the template source as a standalone product, or claim Cardzip’s pre-existing work as your own. Keep third-party components subject to their own licenses.',
  left,
  legalY,
  contentWidth,
  { size: 9, leading: 13 },
);
legalY += 8;
legalY = addBullet(
  'Outright buyout: full, exclusive or assigned rights are not included in either ordinary purchase. They may be granted only by a separate outright purchase and a written agreement expressly describing the rights transferred.',
  left,
  legalY,
  contentWidth,
  { size: 9, leading: 13 },
);

roundedBox(left, legalY + 5, contentWidth, 55, colors.pale, 8);
addLabel('Purchase record', left + 14, legalY + 25);
pdf.setFont('helvetica', 'normal');
pdf.setFontSize(9);
textColor(colors.ink);
pdf.text('Buyer / order reference: __________________________________________', left + 14, legalY + 45);
pdf.text('Effective purchase date: __________________________________________', left + 14, legalY + 59);

const signatureY = legalY + 80;
pdf.setFont('helvetica', 'bold');
pdf.setFontSize(9);
textColor(colors.ink);
pdf.text('For Cardzip Services Limited', left, signatureY + 13);
pdf.addImage(signature, 'JPEG', left, signatureY + 19, 124, 54);
stroke(colors.line);
pdf.setLineWidth(0.8);
pdf.line(left, signatureY + 78, left + 154, signatureY + 78);
pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);
textColor(colors.muted);
pdf.text('Company signature', left, signatureY + 92);
pdf.text('Date: ________________________', left + 210, signatureY + 76);

roundedBox(left, 682, contentWidth, 47, colors.warning, 8);
addParagraph(
  'Draft for Cardzip review before distribution. The purchase date is intentionally blank for completion from the buyer’s transaction record; this general PDF cannot update itself at checkout. Obtain legal review for the governing jurisdiction and confirm the signature image is approved for this use.',
  left + 12,
  701,
  contentWidth - 24,
  { size: 7.6, leading: 10.5, color: colors.ink },
);
addFooter(7);

pdf.addPage();
addPageHeader(
  '07  /  PROJECT WALKTHROUGH',
  'What the project does',
  'The Agency Portal is a client and operations portal used to present agency services, manage client access, and support internal project workflows. It is designed as a branded starting point for a digital service business.',
);
addLabel('Project purpose', left, 205);
let walkthroughY = 229;
walkthroughY = addBullet('Clients can browse the agency, review offerings, and view service or project information through the public-facing site.', left, walkthroughY, contentWidth);
walkthroughY += 10;
walkthroughY = addBullet('The admin area lets company staff manage projects, people, pages, services, and client-facing content from a single workflow.', left, walkthroughY, contentWidth);
walkthroughY += 10;
walkthroughY = addBullet('The backend handles authentication, account access, secure project data, and live configuration for the frontend.', left, walkthroughY, contentWidth);
walkthroughY += 10;
addBullet('The app is designed to be customized into a real agency site with your own brand, team, services, and client flow.', left, walkthroughY, contentWidth);

const flowBoxY = 378;
const flowTextX = left + 16;
const flowTextWidth = contentWidth - 32;
const navigationText = 'Start on the public landing page. Move to the main service or project pages and then sign in through the protected area when you need administrative functionality. In the admin area, review the dashboard summary, open the relevant section, and update the content or records tied to that module.';
const typicalFlowText = 'Home → Services / Projects → Sign in → Dashboard → Manage content or client records → Publish or save updates. Route names may differ slightly in your custom build.';
const flowTextY = flowBoxY + 47;
const navigationHeight = paragraphHeight(navigationText, flowTextWidth, 9.1, 13);
const typicalLabelY = flowTextY + navigationHeight + 12;
const typicalTextY = typicalLabelY + 20;
const typicalFlowHeight = paragraphHeight(typicalFlowText, flowTextWidth, 9.1, 13);
const flowBoxHeight = typicalTextY + typicalFlowHeight + 14 - flowBoxY;
roundedBox(left, flowBoxY, contentWidth, flowBoxHeight, colors.pale, 9);
addLabel('How to navigate it', flowTextX, flowBoxY + 24);
addParagraph(navigationText, flowTextX, flowTextY, flowTextWidth, { size: 9.1, leading: 13, color: colors.ink });
addLabel('Typical flow', flowTextX, typicalLabelY);
addParagraph(typicalFlowText, flowTextX, typicalTextY, flowTextWidth, { size: 9.1, leading: 13, color: colors.ink });

const signInBoxY = flowBoxY + flowBoxHeight + 12;
const signInText = 'Open the login page, enter the authorized admin email and password, and continue only after the backend confirms the account. If access is blocked, verify the database is reachable, the JWT secret is set, and the account has been created with the correct roles and admin signup code.';
const signInTextHeight = paragraphHeight(signInText, flowTextWidth, 9, 12.5);
const signInBoxHeight = 46 + signInTextHeight + 14;
roundedBox(left, signInBoxY, contentWidth, signInBoxHeight, colors.warning, 9);
addLabel('How to sign in', flowTextX, signInBoxY + 25, [151, 94, 20]);
addParagraph(
  signInText,
  flowTextX,
  signInBoxY + 46,
  flowTextWidth,
  { size: 9, leading: 12.5, color: colors.ink },
);
addFooter(8);

pdf.addPage();
addPageHeader(
  '08  /  ADMIN USAGE',
  'How to use the admin screens',
  'Once you are signed in, the admin experience is intended to keep daily operations simple: review, update, and publish only the content relevant to the current project or client area.',
);
const adminSections = [
  ['Overview', 'Review the main dashboard, recent activity, and status indicators for the business or project queue.'],
  ['Projects and services', 'Create or update service packages, client project data, timelines, and the visible business content on the storefront.'],
  ['Content and pages', 'Edit landing-page content, service pages, about content, and any structured data that should appear publicly.'],
  ['Client access and accounts', 'Manage authorized staff, approved users, and roles that are allowed to update accounts or sensitive project information.'],
  ['Settings and records', 'Review logs, update defaults, and keep the project configuration aligned with the live deployment.'],
];
let adminY = 210;
for (const [title, body] of adminSections) {
  roundedBox(left, adminY, contentWidth, 52, colors.pale, 8);
  addHeading(title, left + 14, adminY + 20, 10.5);
  addParagraph(body, left + 150, adminY + 19, contentWidth - 160, { size: 8.4, leading: 11.2, color: colors.ink });
  adminY += 60;
}
roundedBox(left, 548, contentWidth, 92, colors.warning, 9);
addLabel('Best practice', left + 16, 572, [151, 94, 20]);
addParagraph(
  'Always review the published state before launch. Update the correct record, confirm the public page reflects the final copy, and validate the sign-in flow on the deployed site before sharing access with clients or staff.',
  left + 16,
  594,
  contentWidth - 32,
  { size: 8.9, leading: 12.5, color: colors.ink },
);
addFooter(9);

fs.writeFileSync(output, Buffer.from(pdf.output('arraybuffer')));
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`);
