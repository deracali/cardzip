import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRequire = createRequire(path.join(here, '..', 'ai-saas-landingpage', 'package.json'));
const { jsPDF } = projectRequire('jspdf');

const output = path.join(here, 'CARDZIP-AI-SAAS-BUYER-GUIDE.pdf');
const logo = fs.readFileSync(path.join(here, '..', 'nextjs', 'public', 'cardzip-logo.jpg'));
const signature = fs.readFileSync(path.join(here, '..', '..', '..', 'cardzip-admin', 'admin', 'public', 'cardzip-signature.jpg'));

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
  title: 'Cardzip AI SaaS Buyer Guide',
  subject: 'Nexara Next.js website, MongoDB API, secure admin, and customer dashboard',
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

function roundedBox(x, y, w, h, color, radius = 9) {
  fill(color);
  pdf.roundedRect(x, y, w, h, radius, radius, 'F');
}

function addParagraph(text, x, y, width, options = {}) {
  const { size = 9.5, color = colors.muted, leading = size * 1.45, font = 'normal' } = options;
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

function addBullet(text, x, y, width, options = {}) {
  fill(options.bulletColor ?? colors.green);
  pdf.circle(x + 3, y - 3, 2, 'F');
  return addParagraph(text, x + 13, y, width - 13, {
    size: options.size ?? 9,
    leading: options.leading ?? 13,
    color: options.color ?? colors.muted,
  });
}

function addCodePanel(lines, x, y, w, options = {}) {
  const fontSize = options.fontSize ?? 8.5;
  const lineHeight = options.lineHeight ?? 13;
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
  pdf.text('AI SAAS WEBSITE BUYER GUIDE', left + 36, 51);
  stroke(colors.line);
  pdf.setLineWidth(0.7);
  pdf.line(left, 69, right, 69);
  addLabel(section, left, 98);
  addHeading(title, left, 126, 23);
  addParagraph(intro, left, 151, contentWidth, { size: 9.5, leading: 14 });
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
pdf.text('AI SaaS', left, 225);
pdf.text('website guide', left, 266);
addParagraph(
  'Install the Nexara Next.js website and MongoDB API, configure secure customer and administrator access, manage the live site, and reply to customer inquiries through the dashboard.',
  left,
  304,
  445,
  { size: 12, leading: 18, color: [224, 238, 230] },
);
roundedBox(left, 435, contentWidth, 125, [16, 75, 57], 14);
addLabel('One connected website', left + 22, 466, colors.lime);
addHeading('Next.js  /  MongoDB API  /  Admin', left + 22, 492, 17, colors.white);
addParagraph(
  'Public pages, pricing, sign-in and inquiries connect to the API. Admin replies appear in the signed-in customer dashboard.',
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

// Package map
pdf.addPage();
addPageHeader(
  '01  /  PACKAGE OVERVIEW',
  'A complete, database-backed site',
  'This delivery includes the Next.js website and a separate Node.js API. The Vite/React storefront is a separate preview project, not the database-connected Next.js site.',
);
const folderRows = [
  ['nextjs', 'Next.js website, customer dashboard and /admin'],
  ['backend', 'MongoDB-backed Node.js API and admin/customer routes'],
  ['ai-saas-landingpage', 'Separate React + Vite storefront demo'],
];
let y = 206;
for (const [folder, purpose] of folderRows) {
  roundedBox(left, y, contentWidth, 57, colors.pale, 8);
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(9.5);
  textColor(colors.ink);
  pdf.text(folder, left + 15, y + 23);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  textColor(colors.muted);
  pdf.text(purpose, left + 190, y + 23);
  y += 67;
}
addLabel('Included workflows', left, 438);
let bulletY = 462;
bulletY = addBullet('Visitors can create an account, sign in, browse the site and pricing, and submit contact or plan inquiries.', left, bulletY, contentWidth);
bulletY += 10;
bulletY = addBullet('Administrators can manage website pages, navigation, plans, inquiry status and replies, and user accounts.', left, bulletY, contentWidth);
bulletY += 10;
addBullet('Signed-in customers can review their own submitted inquiries and the administrator replies in their client dashboard.', left, bulletY, contentWidth);
roundedBox(left, 572, contentWidth, 59, colors.warning);
addParagraph(
  'The configured database has no preloaded pages or pricing plans. Create and publish them from the admin panel after connecting the API.',
  left + 15,
  597,
  contentWidth - 30,
  { size: 9, leading: 13, color: colors.ink },
);
addFooter(1);

// Backend setup
pdf.addPage();
addPageHeader(
  '02  /  DATABASE & API',
  'Connect the backend',
  'Use a separate Windows Command Prompt for the API. Before starting, make sure your MongoDB database is reachable.',
);
addLabel('1. Configure the private environment', left, 207);
addParagraph(
  'In the backend folder, create .env from the example if needed. If you already have a configured .env, keep it and edit that file instead. Never paste secrets into the website .env.local.',
  left,
  231,
  contentWidth,
  { size: 9.3, leading: 14 },
);
addCodePanel(
  [
    'cd /d "C:\\path\\to\\Ai-Saas-Landingpage\\backend"',
    'copy .env.example .env',
    'notepad .env',
  ],
  left,
  278,
  contentWidth,
  { fontSize: 8.3, lineHeight: 13 },
);
addParagraph(
  'Set MONGODB_URI and MONGODB_DB_NAME. Also set ADMIN_EMAIL, ADMIN_PASSWORD (at least 12 characters), and AUTH_SECRET (at least 32 characters). Replace every example placeholder with private production values.',
  left,
  352,
  contentWidth,
  { size: 9.2, leading: 14 },
);
addLabel('2. Install and start the API', left, 415);
addCodePanel(['npm install', 'npm run dev'], left, 438, contentWidth);
addParagraph(
  'Keep this terminal open. The API listens at http://localhost:5001 by default. It requires MongoDB and will not save website data to an in-memory or demo fallback.',
  left,
  501,
  contentWidth,
  { size: 9.3, leading: 14 },
);
roundedBox(left, 563, contentWidth, 69, [230, 244, 235]);
addLabel('Protect credentials', left + 15, 586);
addParagraph(
  'Do not commit .env or publish database credentials, admin passwords or AUTH_SECRET. Never set MONGODB_URI in a NEXT_PUBLIC_ variable.',
  left + 15,
  608,
  contentWidth - 30,
  { size: 8.7, leading: 12, color: colors.ink },
);
addFooter(2);

// Next.js setup
pdf.addPage();
addPageHeader(
  '03  /  WEBSITE',
  'Start the Next.js site',
  'Start the API first. Open a second Command Prompt for the frontend so both processes can keep running.',
);
addLabel('Configure the API address', left, 211);
addParagraph(
  'In the nextjs folder, create .env.local from .env.example. For local development, the default points to the local API at port 5001.',
  left,
  235,
  contentWidth,
  { size: 9.3, leading: 14 },
);
addCodePanel(
  [
    'cd /d "C:\\path\\to\\Ai-Saas-Landingpage\\nextjs"',
    'copy .env.example .env.local',
    'notepad .env.local',
    'npm install',
    'npm run dev',
  ],
  left,
  279,
  contentWidth,
  { fontSize: 8.2, lineHeight: 13 },
);
addParagraph(
  'Open the address printed in the terminal (normally http://localhost:3000). Set NEXT_PUBLIC_NEXARA_API_URL only when the API is hosted at a different address.',
  left,
  382,
  contentWidth,
  { size: 9.3, leading: 14 },
);
addLabel('Quick troubleshooting', left, 438);
let troubleshootingY = 462;
troubleshootingY = addBullet('API connection error: check that the backend is running and the URL in .env.local is correct.', left, troubleshootingY, contentWidth);
troubleshootingY += 9;
troubleshootingY = addBullet('API reports a server error: check backend/.env, MongoDB access, and the backend terminal output.', left, troubleshootingY, contentWidth);
troubleshootingY += 9;
addBullet('Browser blocks an API request: allow the exact website origin in backend ALLOWED_ORIGINS.', left, troubleshootingY, contentWidth);
addFooter(3);

// Auth and customer experience
pdf.addPage();
addPageHeader(
  '04  /  CUSTOMER EXPERIENCE',
  'Accounts, inquiries & replies',
  'The public Next.js site uses the API for signup, login and inquiry forms. Inquiry replies are shown to the customer in their account.',
);
addLabel('Visitor journey', left, 207);
const journey = [
  ['01', 'Create an account', 'Sign up at /signup or sign in at /login. Passwords are hashed by the backend.'],
  ['02', 'Send a request', 'Submit /contact or a pricing inquiry while signed in to attach the inquiry to that account.'],
  ['03', 'Get a reply', 'An administrator saves a response in Admin → Inquiries. The response is stored with the inquiry.'],
  ['04', 'View the answer', 'The customer signs in and opens /dashboard to read their inquiry, status and reply.'],
];
let stepY = 231;
for (const [number, title, copy] of journey) {
  fill(colors.green);
  pdf.circle(left + 15, stepY - 5, 12, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  textColor(colors.white);
  pdf.text(number, left + 15, stepY - 2, { align: 'center' });
  addHeading(title, left + 39, stepY - 1, 10.5);
  addParagraph(copy, left + 39, stepY + 17, contentWidth - 45, { size: 8.7, leading: 12 });
  stepY += 80;
}
roundedBox(left, 562, contentWidth, 72, colors.warning);
addLabel('Guest inquiry privacy', left + 15, 585, [151, 94, 20]);
addParagraph(
  'A guest inquiry is not automatically linked to an account later, even if the email matches. Sign in before submitting when you want responses to appear in your dashboard. Dashboard replies are not emailed.',
  left + 15,
  607,
  contentWidth - 30,
  { size: 8.5, leading: 12, color: colors.ink },
);
addFooter(4);

// Admin overview
pdf.addPage();
addPageHeader(
  '05  /  ADMIN CONTROL CENTER',
  'Manage your live website',
  'Open /admin on your Next.js website. Sign in with ADMIN_EMAIL and ADMIN_PASSWORD from the backend environment file.',
);
const adminSections = [
  ['Overview', 'See inquiry, follow-up, page and customer totals, plus recent customer messages and quick actions.'],
  ['Inquiries', 'Search by customer or company; filter by status; review the request; update its status; write or edit the reply shown on the customer dashboard.'],
  ['Website pages', 'Create, edit and delete page records. Page content uses the editor’s JSON fields; choose whether a page appears in site navigation.'],
  ['Plans & pricing', 'Create, edit and delete plans. Public pricing cards read saved plans from MongoDB.'],
  ['Customers', 'Review registered accounts, update a customer’s name or email, and remove accounts when appropriate.'],
];
let sectionY = 203;
for (const [title, body] of adminSections) {
  roundedBox(left, sectionY, contentWidth, 59, colors.pale, 7);
  addHeading(title, left + 14, sectionY + 21, 10.5);
  addParagraph(body, left + 135, sectionY + 20, contentWidth - 150, { size: 8.4, leading: 11 });
  sectionY += 68;
}
roundedBox(left, 557, contentWidth, 74, [230, 244, 235]);
addLabel('Safe content operations', left + 14, 580);
addParagraph(
  'Pages and plans do not appear on the website until they are saved in the database. Review page paths, prices, and navigation settings before publishing; the database does not include demo records.',
  left + 14,
  602,
  contentWidth - 28,
  { size: 8.5, leading: 12, color: colors.ink },
);
addFooter(5);

// Dynamic pages and production
pdf.addPage();
addPageHeader(
  '06  /  CONTENT & LAUNCH',
  'Publish pages and go live',
  'Use the admin page editor to store public copy and page sections. Published routes are rendered by the Next.js website from the API.',
);
addLabel('Example page record', left, 205);
addParagraph(
  'Use this shape in the admin’s page JSON editor. A saved page at /about is available from the public site; turn on the navigation option to show its title in the site menu.',
  left,
  228,
  contentWidth,
  { size: 9, leading: 13 },
);
addCodePanel(
  [
    '{',
    '  "slug": "/about",',
    '  "title": "About our team",',
    '  "eyebrow": "OUR STORY",',
    '  "description": "A short introduction.",',
    '  "showInNavigation": true,',
    '  "sections": [{',
    '    "title": "What we do",',
    '    "body": "Describe your work here.",',
    '    "items": []',
    '  }]',
    '}',
  ],
  left,
  270,
  contentWidth,
  { fontSize: 7.7, lineHeight: 11.5 },
);
addLabel('Production checklist', left, 450);
let launchY = 474;
launchY = addBullet('Use production MongoDB, a unique strong ADMIN_PASSWORD and an unpredictable AUTH_SECRET.', left, launchY, contentWidth);
launchY += 8;
launchY = addBullet('Set ALLOWED_ORIGINS to your exact public website origin, and set NEXT_PUBLIC_NEXARA_API_URL to the deployed API URL.', left, launchY, contentWidth);
launchY += 8;
launchY = addBullet('Use HTTPS, review every public page and pricing plan, and run npm run build in the Next.js project before deployment.', left, launchY, contentWidth);
launchY += 8;
addBullet('Never expose .env secrets, publish private content, or use example credentials in production.', left, launchY, contentWidth);
addFooter(6);

// Buyer license
pdf.addPage();
addPageHeader(
  '07  /  BUYER LICENSE',
  'Cardzip AI SaaS template license',
  'Plain-language summary for this website template. Review the applicable purchase record and complete the effective date before issuing to a buyer.',
);
let licenseY = 204;
licenseY = addBullet(
  'Grant: following confirmed payment, Cardzip grants the buyer a non-exclusive, non-transferable license to use and modify the files in the purchased package to build one end product, subject to these restrictions.',
  left,
  licenseY,
  contentWidth,
  { size: 8.7, leading: 12.5 },
);
licenseY += 7;
licenseY = addBullet(
  'Template-only purchase: the license covers the purchased website template files. It does not include separate backend/API or other source files unless the order expressly includes them.',
  left,
  licenseY,
  contentWidth,
  { size: 8.7, leading: 12.5 },
);
licenseY += 7;
licenseY = addBullet(
  'Full-template purchase: the license covers the purchased template together with the included backend/API source and permits modification and commercial operation as one end product.',
  left,
  licenseY,
  contentWidth,
  { size: 8.7, leading: 12.5 },
);
licenseY += 7;
licenseY = addBullet(
  'Restrictions: do not resell, sublicense, publish or redistribute the template source as a standalone product, or claim Cardzip’s pre-existing work as your own. Third-party components remain subject to their own licenses.',
  left,
  licenseY,
  contentWidth,
  { size: 8.7, leading: 12.5 },
);
licenseY += 7;
licenseY = addBullet(
  'Outright rights transfer: neither a template-only nor a full-template purchase transfers exclusive ownership or copyright. A full/exclusive rights transfer requires a separate outright purchase and written agreement that expressly identifies the rights granted.',
  left,
  licenseY,
  contentWidth,
  { size: 8.7, leading: 12.5 },
);

roundedBox(left, licenseY + 4, contentWidth, 56, colors.pale, 8);
addLabel('Purchase record', left + 14, licenseY + 23);
pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8.5);
textColor(colors.ink);
pdf.text('Buyer / order reference: __________________________________________', left + 14, licenseY + 42);
pdf.text('Effective purchase date: __________________________________________', left + 14, licenseY + 55);

const signatureY = licenseY + 79;
pdf.setFont('helvetica', 'bold');
pdf.setFontSize(9);
textColor(colors.ink);
pdf.text('For Cardzip Services Limited', left, signatureY + 11);
pdf.addImage(signature, 'JPEG', left, signatureY + 14, 122, 54);
stroke(colors.line);
pdf.setLineWidth(0.8);
pdf.line(left, signatureY + 69, left + 154, signatureY + 69);
pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);
textColor(colors.muted);
pdf.text('Company signature', left, signatureY + 82);
pdf.text('Date: ________________________', left + 210, signatureY + 68);
roundedBox(left, 682, contentWidth, 46, colors.warning, 8);
addParagraph(
  'Template terms for review before distribution. The effective date is left blank for completion from the purchase record; this PDF does not update itself at checkout. Confirm the signature image and governing law with Cardzip before use.',
  left + 12,
  701,
  contentWidth - 24,
  { size: 7.3, leading: 10, color: colors.ink },
);
addFooter(7);

pdf.addPage();
addPageHeader(
  '08  /  PROJECT WALKTHROUGH',
  'What the project does',
  'The AI SaaS site is a marketing and product website for an AI-powered platform. It combines public landing pages, a pricing section, customer sign-up, inquiry handling, and an admin area for managing the live website content and customer requests.',
);
addLabel('Project purpose', left, 205);
let walkthroughY = 229;
walkthroughY = addBullet('Visitors can review pricing, browse the brand site, and submit inquiries or sign up for the platform.', left, walkthroughY, contentWidth);
walkthroughY += 10;
walkthroughY = addBullet('Signed-in customers can open their dashboard to review submitted requests, account details, and suitable admin responses.', left, walkthroughY, contentWidth);
walkthroughY += 10;
walkthroughY = addBullet('Administrators can create and update pages, plans, navigation items, and customer inquiry records from the admin dashboard.', left, walkthroughY, contentWidth);
walkthroughY += 10;
addBullet('The backend stores data in MongoDB and keeps the public site and admin actions connected to the same data source.', left, walkthroughY, contentWidth);

const flowBoxY = 380;
const flowTextX = left + 16;
const flowTextWidth = contentWidth - 32;
const navigationText = 'Open the public homepage to view the pricing and product overview. Move through the page sections or navigation links, then create an account or sign in to reach the customer dashboard. When you want to manage the live site, open the admin route and use the dashboard to edit pages, plans, and customer inquiries.';
const typicalFlowText = 'Home → Pricing or Contact → Sign up / Sign in → Dashboard → Review inquiry or update account → Admin → Manage pages, plans, or replies. The public site and admin share the same backend.';
const flowTextY = flowBoxY + 50;
const navigationHeight = paragraphHeight(navigationText, flowTextWidth, 9.1, 13);
const typicalLabelY = flowTextY + navigationHeight + 12;
const typicalTextY = typicalLabelY + 20;
const typicalFlowHeight = paragraphHeight(typicalFlowText, flowTextWidth, 9.1, 13);
const flowBoxHeight = typicalTextY + typicalFlowHeight + 14 - flowBoxY;
roundedBox(left, flowBoxY, contentWidth, flowBoxHeight, colors.pale, 9);
addLabel('How to navigate it', flowTextX, flowBoxY + 25);
addParagraph(navigationText, flowTextX, flowTextY, flowTextWidth, { size: 9.1, leading: 13, color: colors.ink });
addLabel('Typical flow', flowTextX, typicalLabelY);
addParagraph(typicalFlowText, flowTextX, typicalTextY, flowTextWidth, { size: 9.1, leading: 13, color: colors.ink });

const signInBoxY = flowBoxY + flowBoxHeight + 12;
const signInText = 'Use the public /login or /signup route for customer access, and the /admin route for the management side. The admin account is configured in the backend environment file using ADMIN_EMAIL and ADMIN_PASSWORD. If login fails, check that MongoDB is connected and the backend is running from the correct folder.';
const signInTextHeight = paragraphHeight(signInText, flowTextWidth, 9, 12.5);
const signInBoxHeight = 46 + signInTextHeight + 14;
roundedBox(left, signInBoxY, contentWidth, signInBoxHeight, colors.warning, 9);
addLabel('How to sign in', flowTextX, signInBoxY + 24, [151, 94, 20]);
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
  '09  /  ADMIN USAGE',
  'How to use the admin screens',
  'The admin dashboard is the operational area for the website. It controls site content, plans, navigation, customer accounts, and inquiry status so the public site can stay consistent and up to date.',
);
const adminGuideSections = [
  ['Overview', 'Review key counts, recent customer activity, and the current state of inquiries and website records.'],
  ['Pages', 'Create, edit, or remove public page sections and navigation items before publishing them to the site.'],
  ['Plans & pricing', 'Set pricing options, customer package details, and changes to the public rates on the landing page.'],
  ['Inquiries', 'Review, filter, and reply to submitted requests so the customer can see the status and answer in their dashboard.'],
  ['Customers', 'Review registered users, manage account records, and keep the customer data secure and current.'],
];
let adminGuideY = 210;
for (const [title, body] of adminGuideSections) {
  roundedBox(left, adminGuideY, contentWidth, 53, colors.pale, 8);
  addHeading(title, left + 14, adminGuideY + 20, 10.5);
  addParagraph(body, left + 150, adminGuideY + 19, contentWidth - 160, { size: 8.4, leading: 11.2, color: colors.ink });
  adminGuideY += 61;
}
roundedBox(left, 548, contentWidth, 89, colors.warning, 9);
addLabel('Best practice', left + 16, 572, [151, 94, 20]);
addParagraph(
  'Review the page data, pricing, and inquiry replies before making them live. Publish only complete and verified information, and confirm the public site reflects the final content after each save.',
  left + 16,
  594,
  contentWidth - 32,
  { size: 8.9, leading: 12.5, color: colors.ink },
);
addFooter(9);

fs.writeFileSync(output, Buffer.from(pdf.output('arraybuffer')));
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`);
