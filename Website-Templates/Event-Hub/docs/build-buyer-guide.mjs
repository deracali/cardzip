import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const config = {
  product: 'PulseLive',
  guideTitle: 'Event Hub Buyer Guide',
  pdfName: 'CARDZIP-EVENT-HUB-BUYER-GUIDE.pdf',
  viteDir: 'event-hub',
  viteLabel: 'React + Vite',
  apiPort: '5400',
  viteApi: 'VITE_API_BASE_URL',
  nextApi: 'NEXT_PUBLIC_EVENT_HUB_API_URL',
  primary: [92, 81, 213],
  accent: [64, 190, 201],
  dark: [21, 29, 49],
  pale: [241, 243, 253],
  tagline: 'An event discovery, attendee, organizer, and administration platform.',
  viteDetails: 'Vite opens in browser-local demo mode. Set VITE_API_BASE_URL=http://localhost:5400/api to use the API, or choose API mode with ?mode=api. The Vite .env.example URL is a placeholder; match the backend port.',
  nextDetails: 'Next.js is a native App Router application. Set NEXT_PUBLIC_EVENT_HUB_API_URL=http://localhost:5400/api when you need to override its default.',
  walk: [
    ['Discover', 'Browse / and /events, search the event catalogue, open /events/:slug for event details, and review agenda content at /schedule.'],
    ['Request a booking', 'Open /checkout/:slug to submit an attendee booking request. /host presents the organizer inquiry path; /about contains public brand information.'],
    ['Run the platform', 'The backend stores accounts, events, booking requests, and settings. Organizer operations require approval; administrators manage platform records.'],
  ],
  client: ['Register or sign in at /signup or /login.', 'Browse events and submit a booking request.', 'Review your own booking history from /dashboard.'],
  admin: ['Seed the first admin using private backend settings.', 'Review events, bookings, organizers, and attendees at /admin.', 'Approve organizers before they use /organizer/dashboard to manage listings and relevant bookings.'],
  limit: 'Checkout creates a booking request only: no payment is collected, inventory is not reserved, and real tickets are not issued. Refunds, ticket generation, and entry scanning are not included.',
  security: 'The API protects attendee, organizer, and admin endpoints; organizer access requires approval. Keep database and JWT settings on the server and configure exact production origins.',
};

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRequire = createRequire(path.join(here, '..', config.viteDir, 'package.json'));
const { jsPDF } = projectRequire('jspdf');
const logo = fs.readFileSync(path.join(here, 'assets', 'cardzip-logo.jpg'));
const signature = fs.readFileSync(path.join(here, 'assets', 'cardzip-signature.jpg'));
const output = path.join(here, config.pdfName);
const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
const W = 612; const H = 792; const L = 54; const R = 558; const CW = R - L;
const c = { ink: [27, 36, 55], muted: [91, 104, 126], primary: config.primary, accent: config.accent, dark: config.dark, pale: config.pale, line: [222, 227, 238], white: [255, 255, 255], warning: [255, 247, 232] };

pdf.setProperties({ title: `Cardzip ${config.guideTitle}`, subject: 'Package overview, setup, workflows, limitations, and buyer license summary', author: 'Cardzip Services Limited', creator: 'Cardzip Services Limited' });
function fill(color) { pdf.setFillColor(...color); }
function ink(color) { pdf.setTextColor(...color); }
function box(x, y, w, h, color, radius = 9) { fill(color); pdf.roundedRect(x, y, w, h, radius, radius, 'F'); }
function label(text, x, y, color = c.primary) { pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); ink(color); pdf.text(text.toUpperCase(), x, y); }
function heading(text, x, y, size = 14, color = c.ink) { pdf.setFont('helvetica', 'bold'); pdf.setFontSize(size); ink(color); pdf.text(text, x, y); }
function para(text, x, y, width, size = 9.2, leading = 13, color = c.muted, font = 'normal') {
  pdf.setFont('helvetica', font); pdf.setFontSize(size); ink(color);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}
function bullet(text, x, y, width, size = 8.8) {
  fill(c.primary); pdf.circle(x + 3, y - 3, 2, 'F');
  return para(text, x + 12, y, width - 12, size, 12, c.ink) + 5;
}
function code(lines, x, y, width, height) {
  box(x, y, width, height, c.dark, 8); fill(c.accent); pdf.roundedRect(x, y, 4, height, 2, 2, 'F');
  pdf.setFont('courier', 'normal'); pdf.setFontSize(8.5); ink(c.white);
  pdf.text(lines, x + 14, y + 20, { lineHeightFactor: 1.55 });
}
function footer(n) {
  pdf.setDrawColor(...c.line); pdf.line(L, 750, R, 750);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); ink(c.muted);
  pdf.text(`CARDZIP SERVICES LIMITED  |  ${config.product.toUpperCase()} BUYER GUIDE`, L, 766);
  pdf.text(String(n).padStart(2, '0'), R, 766, { align: 'right' });
}
function page(n, section, title, intro) {
  pdf.addPage();
  pdf.addImage(logo, 'JPEG', L, 23, 28, 28);
  label('CARDZIP', L + 38, 35, c.ink); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); ink(c.muted);
  pdf.text(`${config.product.toUpperCase()}  /  BUYER GUIDE`, L + 38, 47);
  pdf.setDrawColor(...c.line); pdf.line(L, 63, R, 63);
  label(section, L, 91); heading(title, L, 119, 22); para(intro, L, 141, CW, 9.5, 13, c.muted);
  footer(n);
}

// 1 — cover
fill(c.dark); pdf.rect(0, 0, W, H, 'F');
fill(c.primary); pdf.circle(550, 93, 150, 'F'); fill(c.dark); pdf.circle(550, 93, 117, 'F');
pdf.addImage(logo, 'JPEG', L, 61, 68, 68);
label('CARDZIP  /  BUYER DOCUMENTATION', L, 164, c.accent);
heading(config.product, L, 225, 36, c.white); heading(config.guideTitle, L, 266, 21, c.white);
para(config.tagline, L, 307, 430, 11.5, 17, [224, 231, 245]);
box(L, 431, CW, 132, [31, 45, 70], 13);
label('TWO FRONTENDS  /  ONE API', L + 20, 461, c.accent);
heading('Vite  /  Next.js  /  Express + MongoDB', L + 20, 490, 16, c.white);
para('Choose one frontend. Start the backend separately when you need persistent accounts and operations.', L + 20, 515, CW - 40, 9.2, 13, [224, 231, 245]);
para('A buyer guide to setup, product workflows, production limits, and purchase-term references.', L, 630, 400, 9, 14, [224, 231, 245]);
pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); ink(c.accent); pdf.text('CARDZIP SERVICES LIMITED', R, 731, { align: 'right' });

// 2 — package comparison
page(2, '01  /  PACKAGE COMPARISON', 'Choose the included stack', 'Two frontend options pair with a separately run API. Select one frontend; verify your order for the components it includes.');
const gap = 14; const col = (CW - gap) / 2;
box(L, 184, col, 230, c.pale); label('Option A', L + 16, 210); heading('React + Vite', L + 16, 237, 15);
let y = 263; y = bullet('Folder: event-hub/.', L + 16, y, col - 32); y = bullet('Local browser-storage preview for event discovery and demo workflows.', L + 16, y, col - 32); bullet('Use API mode for persistent accounts and requests.', L + 16, y, col - 32);
box(L + col + gap, 184, col, 230, [230, 245, 245]); label('Option B', L + col + gap + 16, 210, c.accent); heading('Native Next.js', L + col + gap + 16, 237, 15);
y = 263; y = bullet('Folder: nextjs/, with App Router pages and API client.', L + col + gap + 16, y, col - 32); y = bullet('Separate frontend app; install and run it independently.', L + col + gap + 16, y, col - 32); bullet('Uses the same separate Express/MongoDB service.', L + col + gap + 16, y, col - 32);
box(L, 435, CW, 111, c.warning); label('Separate backend', L + 17, 460, [151, 94, 20]);
para('backend/ contains API routes, controllers, models, and environment setup. MongoDB-backed persistence, organizer approval, and administrator tools depend on the backend being configured and running.', L + 17, 482, CW - 34, 9.2, 14, c.ink);
para('Do not treat the repository layout as a statement of what your order includes. Refer to your purchase record and terms.', L, 575, CW, 9, 13);

// 3 — folder map
page(3, '02  /  PROJECT MAP', 'Find the files you need', 'Each application has its own dependencies and start command. Install packages in the application folder you choose.');
const rows = [
  ['event-hub/', 'Vite app, local demo, public event and admin screens'],
  ['nextjs/', 'Native App Router pages, components, and API connection'],
  ['backend/', 'Express API, MongoDB models, auth, and role-protected routes'],
  ['docs/', 'Buyer guide, PDF builder/output, and local assets/ brand images'],
];
let ry = 188;
for (const [name, desc] of rows) {
  box(L, ry, CW, 51, ry % 2 ? c.pale : [249, 250, 252], 7);
  pdf.setFont('courier', 'bold'); pdf.setFontSize(9); ink(c.ink); pdf.text(name, L + 13, ry + 21);
  para(desc, L + 152, ry + 20, CW - 168, 8.4, 11, c.ink); ry += 61;
}
box(L, 447, CW, 91, [230, 245, 235]); label('Prerequisites', L + 16, 472, [33, 117, 75]);
para('Node.js and npm supported by the included manifests, plus MongoDB for persistent API-backed use. Keep the frontend and backend terminals separate.', L + 16, 494, CW - 32, 9, 13, c.ink);
box(L, 556, CW, 76, c.warning); label('Keep secrets server-side', L + 16, 580, [151, 94, 20]);
para('Do not publish database credentials, admin passwords, or JWT_SECRET. Browser-visible VITE_ and NEXT_PUBLIC_ settings are not secret storage.', L + 16, 601, CW - 32, 8.6, 12, c.ink);

// 4 — backend setup
page(4, '03  /  BACKEND SETUP', 'Configure the API', 'The backend is a separate Express service backed by MongoDB. Configure private values before starting it.');
label('1. Copy the environment template', L, 187);
code(['cd /d "C:\\path\\to\\Event-Hub\\backend"', 'copy .env.example .env', 'notepad .env'], L, 201, CW, 65);
label('2. Set private backend values', L, 293);
para('Configure MONGODB_URI, a random JWT_SECRET of at least 32 characters, ADMIN_EMAIL, ADMIN_PASSWORD (12–128 characters), and ALLOWED_ORIGINS. The API listens on port 5400 by default.', L, 314, CW, 9.3, 14, c.ink);
label('3. Install and start', L, 374);
code(['npm install', 'npm run dev'], L, 389, CW, 55);
box(L, 470, CW, 113, c.pale); label('Seeded access and approval', L + 16, 495);
para('The first administrator is seeded from backend configuration. Public registration does not create an administrator. Organizer tools require an approved organizer account. MongoDB and a valid server secret are required for API-backed use.', L + 16, 517, CW - 32, 9, 13, c.ink);
para('Leave this terminal open while the selected frontend is running.', L, 617, CW, 9, 13);

// 5 — frontend setup
page(5, '04  /  FRONTEND SETUP', 'Run one frontend', 'Keep the API running in its own terminal. Use either Vite or Next.js, not both as one combined application.');
box(L, 184, CW, 207, c.pale); label('OPTION A  /  REACT + VITE', L + 16, 210); heading('Local demo or API mode', L + 16, 235, 14);
para(config.viteDetails, L + 16, 256, CW - 32, 8.8, 12, c.ink);
code(['cd /d "C:\\path\\to\\Event-Hub\\event-hub"', 'npm install', 'npm run dev'], L + 16, 320, CW - 32, 56);
box(L, 408, CW, 207, [230, 245, 245]); label('OPTION B  /  NEXT.JS', L + 16, 434, c.accent); heading('Native App Router frontend', L + 16, 459, 14);
para(config.nextDetails, L + 16, 480, CW - 32, 8.8, 12, c.ink);
code(['cd /d "C:\\path\\to\\Event-Hub\\nextjs"', 'npm install', 'npm run dev'], L + 16, 544, CW - 32, 56);
para('Build the selected frontend with npm run build. Next.js also includes a TypeScript check.', L, 654, CW, 8.8, 12);

// 6 — product walkthrough
page(6, '05  /  PRODUCT WALKTHROUGH', 'Explore PulseLive', 'The public experience connects event discovery with attendee requests and organizer operations.');
let wy = 184;
for (const [title, body] of config.walk) {
  box(L, wy, CW, 101, wy === 184 ? c.pale : (wy === 299 ? [230, 245, 245] : [249, 250, 252]));
  label(title, L + 16, wy + 24); para(body, L + 16, wy + 46, CW - 32, 9, 13, c.ink); wy += 115;
}
box(L, 541, CW, 78, c.warning); label('Request, not ticket issuance', L + 16, 566, [151, 94, 20]);
para('The booking flow records a request. It is not a paid ticket, inventory reservation, or event-entry credential.', L + 16, 587, CW - 32, 8.8, 12, c.ink);

// 7 — client and admin workflows
page(7, '06  /  CLIENT + ADMIN WORKFLOW', 'Who uses which area?', 'The API is the authorization boundary for protected operations; frontend redirects are only navigation behavior.');
const half = (CW - 14) / 2;
box(L, 187, half, 304, c.pale); label('ATTENDEE', L + 15, 213); heading('Browse and request', L + 15, 239, 13);
y = 266; for (const item of config.client) y = bullet(item, L + 15, y, half - 30, 8.5);
box(L + half + 14, 187, half, 304, [230, 245, 245]); label('ORGANIZER / ADMIN', L + half + 29, 213, c.accent); heading('Review and manage', L + half + 29, 239, 13);
y = 266; for (const item of config.admin) y = bullet(item, L + half + 29, y, half - 30, 8.5);
box(L, 516, CW, 92, c.warning); label('Access note', L + 16, 541, [151, 94, 20]);
para('The API checks signed-in account roles on protected endpoints. Keep admin credentials private, approve organizers deliberately, and review role behavior before deployment.', L + 16, 563, CW - 32, 8.8, 12, c.ink);

// 8 — limitations, security, deployment
page(8, '07  /  PRODUCTION READINESS', 'Plan for the live service', 'The package is a starting point for integration. Verify operational and security requirements before opening it to customers.');
box(L, 184, CW, 137, c.warning); label('Demo and ticketing limits', L + 16, 209, [151, 94, 20]);
para(config.limit, L + 16, 232, CW - 32, 9.2, 14, c.ink);
label('Security checklist', L, 359);
let sy = 381; sy = bullet(config.security, L, sy, CW); sy = bullet('Use HTTPS, strong production-only secrets, exact ALLOWED_ORIGINS, database backups, and monitoring.', L, sy, CW);
label('Deployment checklist', L, 474);
sy = bullet('Deploy one chosen frontend and the API as separate services; replace localhost URLs with deployment URLs.', L, 496, CW);
sy = bullet('Review privacy notices, data retention, authentication, payment/ticketing integration, and your own compliance needs.', L, sy, CW);
box(L, 604, CW, 44, c.pale); para('Never place server credentials in frontend environment variables.', L + 14, 631, CW - 28, 9, 12, c.ink, 'bold');

// 9 — buyer license summary and signature
page(9, '08  /  PURCHASE TERMS', 'Buyer license summary', 'This plain-language summary is informational only. The license and purchase terms supplied with your order govern.');
let ly = 186;
ly = bullet('Use only the files and rights included in the confirmed purchase; confirm whether the order includes frontend, backend, or both.', L, ly, CW, 8.8);
ly = bullet('The buyer’s order terms control permitted use, modification, redistribution, and any restrictions.', L, ly, CW, 8.8);
ly = bullet('This guide does not transfer copyright, grant exclusivity, or authorize standalone resale or redistribution beyond the applicable terms.', L, ly, CW, 8.8);
ly = bullet('For a conflict or uncertainty, refer to the order record and applicable license terms; this page does not expand them.', L, ly, CW, 8.8);
box(L, 402, CW, 65, c.pale); label('Purchase record reference', L + 14, 426);
para('Buyer / order reference: __________________________________     Purchase date: __________________', L + 14, 449, CW - 28, 8.5, 12, c.ink);
heading('For Cardzip Services Limited', L, 503, 10);
pdf.addImage(signature, 'JPEG', L, 514, 124, 54);
pdf.setDrawColor(...c.line); pdf.line(L, 573, L + 158, 573);
pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); ink(c.muted);
pdf.text('Company signature', L, 587); pdf.text('Date: ________________________', L + 211, 573);
box(L, 626, CW, 59, c.warning);
para('This guide is not a substitute for the buyer’s actual license or purchase terms. No rights beyond those terms are represented or granted here.', L + 13, 649, CW - 26, 8.2, 11, c.ink);

if (pdf.getNumberOfPages() !== 9) throw new Error(`Expected 9 pages, generated ${pdf.getNumberOfPages()}`);
pdf.save(output);
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`);
