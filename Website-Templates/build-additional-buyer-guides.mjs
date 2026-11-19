import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const templatesRoot = path.dirname(fileURLToPath(import.meta.url));

const guides = {
  food: {
    project: "Food-Delivery-Hub",
    product: "Sizzle&Smile",
    pdfName: "CARDZIP-FOOD-DELIVERY-BUYER-GUIDE.pdf",
    viteFolder: "Food-Delivery-Hub",
    port: "5000",
    viteApi: "VITE_API_BASE_URL",
    nextApi: "NEXT_PUBLIC_FOOD_API_URL",
    routes: [
      ["/, /restaurant", "Discover restaurants, menus, item details, and cart options."],
      ["/checkout", "Submit an authenticated demo order; no payment is requested."],
      ["/reserve, /track", "Preview table reservations and order tracking; these are not live dispatch integrations."],
      ["/login, /signup, /dashboard", "Client account access and the signed-in customer order history."],
      ["/admin/login, /admin", "Seeded administrator login, summary metrics, and order-management workspace."],
    ],
    clientSteps: [
      "Create a client account or sign in; public registration does not grant administrator access.",
      "Browse restaurants and menus, select items, and submit an order through the demo checkout.",
      "Review the account's own order history and status from the client dashboard.",
    ],
    adminSteps: [
      "Use the administrator configured by the backend environment; do not use public signup for admin setup.",
      "Review dashboard order summaries and update the status of demo orders.",
      "Protected endpoints require a valid session and admin role verified by the API.",
    ],
    workflowIntro: "The ordering UI demonstrates a customer-to-operations flow. Reservation and delivery tracking views are previews rather than live scheduling or dispatch systems.",
    limitations: "Orders are demo records. The API calculates totals against its server-side menu but does not accept or store card numbers, CVVs, or payment data. No payment is processed. Table reservation and tracking pages do not connect to a live restaurant calendar or courier.",
    launchItems: [
      "Integrate and test a payment provider using provider-hosted or tokenized payment flows; never collect raw card details in this frontend.",
      "Connect kitchen preparation, restaurant acceptance, courier assignment, delivery location updates, and customer notifications.",
      "Make menus, stock, tax, prices, cancellation, refund, and order-state rules authoritative on the server.",
    ],
  },
  home: {
    project: "Home-Service-Hub",
    product: "FixFlow Pro",
    pdfName: "CARDZIP-FIXFLOW-PRO-BUYER-GUIDE.pdf",
    viteFolder: "home-services-hub",
    port: "5200",
    viteApi: "VITE_HOME_SERVICE_API_URL",
    nextApi: "NEXT_PUBLIC_HOME_SERVICE_API_URL",
    routes: [
      ["/", "Browse plumbing, HVAC, and repair services and estimate options."],
      ["/book-now", "Submit a service request with service, urgency, location, and preferred timing details."],
      ["/login, /signup, /dashboard", "Client access and the signed-in client's own appointment-request history."],
      ["/admin/login, /admin", "Seeded administrator sign-in and service-request management."],
    ],
    clientSteps: [
      "Create a client account or sign in; set up the first administrator through private backend environment values.",
      "Choose an offered service and urgency, then provide preferred schedule, address, and issue details.",
      "Review the submitted request and its current status from the client dashboard.",
    ],
    adminSteps: [
      "Sign in with the administrator account seeded from backend configuration.",
      "Review incoming service requests and update status through the administrator workspace.",
      "The API independently verifies client ownership and the admin role for protected operations.",
    ],
    workflowIntro: "The core workflow connects a customer's service request with a server-validated estimate and an administrator review.",
    limitations: "A request is not a confirmed appointment and does not guarantee availability. The template does not connect to a live technician calendar, collect payment, dispatch a technician, or supply real-time job tracking. The API calculates estimate values from its own service catalog.",
    launchItems: [
      "Connect technician schedules, service-area rules, travel times, and conflict-safe slot availability.",
      "Define operational price, quote, cancellation, payment, invoice, and refund policies on the server.",
      "Add dispatch, customer communication, job completion, incident escalation, and privacy/data-retention processes.",
    ],
  },
  salon: {
    project: "Luxury-Salon-Booking",
    product: "Lumière Salon & Spa",
    pdfName: "CARDZIP-LUMIERE-SALON-BUYER-GUIDE.pdf",
    viteFolder: "Luxury-salon-booking",
    port: "5600",
    viteApi: "VITE_SALON_API_URL",
    nextApi: "NEXT_PUBLIC_SALON_API_URL",
    routes: [
      ["/", "Introduce the salon and browse its service catalog."],
      ["/book", "Request an appointment with selected service, stylist, preferred date/time, and optional notes."],
      ["/login, /signup, /dashboard", "Client access and each client's appointment requests and statuses."],
      ["/admin/login, /admin", "Privately seeded administrator access and studio appointment management."],
    ],
    clientSteps: [
      "Sign up or sign in as a client; public signup cannot create an administrator.",
      "Select a service and preferred stylist/time, add optional notes, and submit an appointment request.",
      "Use the client dashboard to review the request status after studio review.",
    ],
    adminSteps: [
      "Configure and use the administrator account seeded from the backend environment.",
      "Review appointment and client summaries, then update each request to the appropriate status.",
      "The API checks client ownership and admin roles, and validates service/stylist/time values against its catalog.",
    ],
    workflowIntro: "The salon experience collects a preferred appointment request for studio review; it is not an instant reservation.",
    limitations: "Submitting a request does not confirm the appointment or reserve a live slot. The template does not synchronize with a salon calendar, collect online payments, or send appointment email notifications. A request remains pending until studio staff review it.",
    launchItems: [
      "Integrate a calendar and implement race-safe availability checks across services, stylists, and appointment durations.",
      "Define payment, deposits, cancellations, rescheduling, refunds, and notification behavior before accepting live bookings.",
      "Protect customer contact details, configure production origins and secrets, and test role boundaries, backup, monitoring, and retention.",
    ],
  },
};

const colors = {
  ink: [27, 36, 55],
  muted: [91, 104, 126],
  primary: [92, 81, 213],
  accent: [64, 190, 201],
  dark: [21, 29, 49],
  pale: [241, 243, 253],
  green: [230, 245, 235],
  line: [222, 227, 238],
  white: [255, 255, 255],
  warning: [255, 247, 232],
};

const pageWidth = 612;
const pageHeight = 792;
const left = 54;
const right = pageWidth - left;
const contentWidth = right - left;

function box(pdf, x, y, width, height, color, radius = 8) {
  pdf.setFillColor(...color);
  pdf.roundedRect(x, y, width, height, radius, radius, "F");
}

function label(pdf, text, x, y, color = colors.primary) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...color);
  pdf.text(text.toUpperCase(), x, y);
}

function heading(pdf, text, x, y, size = 14, color = colors.ink) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
  pdf.text(text, x, y);
}

function paragraph(pdf, text, x, y, width, size = 9, leading = 13, color = colors.muted) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function bullet(pdf, text, x, y, width, color = colors.primary) {
  pdf.setFillColor(...color);
  pdf.circle(x + 3, y - 3, 2, "F");
  return paragraph(pdf, text, x + 13, y, width - 13, 8.7, 12, colors.ink) + 6;
}

function codePanel(pdf, lines, x, y, width, options = {}) {
  const lineHeight = options.lineHeight || 14;
  const fontSize = options.fontSize || 8;
  const height = 20 + lines.length * lineHeight;
  box(pdf, x, y, width, height, colors.dark, 7);
  pdf.setFillColor(...colors.accent);
  pdf.roundedRect(x, y, 4, height, 2, 2, "F");
  pdf.setFont("courier", "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(...colors.white);
  pdf.text(lines, x + 13, y + 17, { lineHeightFactor: lineHeight / fontSize });
}

function pageHeader(pdf, config, logo, pageNumber, sectionName, title, intro) {
  pdf.addPage();
  pdf.addImage(logo, "JPEG", left, 23, 28, 28);
  label(pdf, "CARDZIP", left + 38, 35, colors.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.muted);
  pdf.text(`${config.product.toUpperCase()}  /  BUYER GUIDE`, left + 38, 47);
  pdf.setDrawColor(...colors.line);
  pdf.line(left, 63, right, 63);
  label(pdf, sectionName, left, 91);
  heading(pdf, title, left, 119, 22);
  paragraph(pdf, intro, left, 141, contentWidth, 9.5, 13);
  pdf.setDrawColor(...colors.line);
  pdf.line(left, 750, right, 750);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.muted);
  pdf.text(`CARDZIP SERVICES LIMITED  |  ${config.product.toUpperCase()} BUYER GUIDE`, left, 766);
  pdf.text(String(pageNumber).padStart(2, "0"), right, 766, { align: "right" });
}

function renderGuide(pdf, config, logo, signature) {
  const vitePath = config.viteFolder;
  const projectPath = config.project;
  const apiUrl = `http://localhost:${config.port}/api`;

  // 1 — cover
  pdf.setFillColor(...colors.dark);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.setFillColor(...colors.primary);
  pdf.circle(550, 93, 150, "F");
  pdf.setFillColor(...colors.dark);
  pdf.circle(550, 93, 117, "F");
  pdf.addImage(logo, "JPEG", left, 61, 68, 68);
  label(pdf, "CARDZIP  /  BUYER DOCUMENTATION", left, 164, colors.accent);
  heading(pdf, config.product, left, 225, 33, colors.white);
  heading(pdf, "Buyer guide", left, 266, 21, colors.white);
  paragraph(
    pdf,
    `A detailed setup and handover for the ${config.product} storefront, its native Next.js edition, and the separate API-backed account and operations workflows.`,
    left,
    307,
    435,
    11,
    16,
    [224, 231, 245],
  );
  box(pdf, left, 431, contentWidth, 132, [31, 45, 70], 13);
  label(pdf, "TWO FRONTENDS  /  ONE API", left + 20, 461, colors.accent);
  heading(pdf, "Vite  /  Next.js  /  Express + MongoDB", left + 20, 490, 16, colors.white);
  paragraph(
    pdf,
    "Choose one frontend. Start and configure the backend separately for persisted accounts and role-protected operations.",
    left + 20,
    515,
    contentWidth - 40,
    9.2,
    13,
    [224, 231, 245],
  );
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.accent);
  pdf.text("CARDZIP SERVICES LIMITED", right, 731, { align: "right" });

  // 2 — package comparison
  pageHeader(pdf, config, logo, 2, "01  /  PACKAGE COMPARISON", "Choose the included stack", "The product includes separate browser frontends and a separately run API. Confirm the components and license included in your order before installation.");
  const gap = 14;
  const column = (contentWidth - gap) / 2;
  box(pdf, left, 184, column, 212, colors.pale);
  label(pdf, "OPTION A", left + 16, 209);
  heading(pdf, "React + Vite", left + 16, 234, 15);
  let y = 259;
  for (const text of [
    `Application folder: ${vitePath}/.`,
    "Standalone frontend with the product storefront and browser interface.",
    "Can run separately from the Next.js edition.",
  ]) {
    y = bullet(pdf, text, left + 16, y, column - 32);
  }
  box(pdf, left + column + gap, 184, column, 212, colors.green);
  label(pdf, "OPTION B", left + column + gap + 16, 209, colors.accent);
  heading(pdf, "Native Next.js", left + column + gap + 16, 234, 15);
  y = 259;
  for (const text of [
    "Application folder: nextjs/, with its own App Router routes and UI.",
    "A separate frontend application; install and run it independently.",
    "Uses the same separately configured API service.",
  ]) {
    y = bullet(pdf, text, left + column + gap + 16, y, column - 32, colors.accent);
  }
  box(pdf, left, 420, contentWidth, 98, colors.warning);
  label(pdf, "Package boundary", left + 16, 445, [151, 94, 20]);
  paragraph(
    pdf,
    `${projectPath}/backend is the separate Express service; the React and Next.js frontend folders are not a combined app. The purchase record determines which components and support are included.`,
    left + 16,
    468,
    contentWidth - 32,
    9,
    13,
    colors.ink,
  );
  label(pdf, "Core workflow", left, 561);
  paragraph(pdf, config.workflowIntro, left, 584, contentWidth, 9.2, 13, colors.ink);

  // 3 — files, prerequisites, and project map
  pageHeader(pdf, config, logo, 3, "02  /  PROJECT MAP", "Find the files you need", "Install dependencies in the application folder you choose and in the backend folder when using persistent API-backed workflows.");
  const rows = [
    [projectPath + "/", `${config.product} project and top-level documentation`],
    [vitePath + "/", "Standalone React + Vite frontend"],
    ["nextjs/", "Native Next.js pages, components, and API client"],
    ["backend/", "Express routes/controllers, authorization, and MongoDB models"],
    ["docs/", "Buyer guide, PDF generator/output, and local Cardzip images"],
  ];
  let rowY = 184;
  for (const [folder, purpose] of rows) {
    box(pdf, left, rowY, contentWidth, 46, rowY % 2 ? colors.pale : [249, 250, 252], 6);
    pdf.setFont("courier", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...colors.ink);
    pdf.text(folder, left + 12, rowY + 19);
    paragraph(pdf, purpose, left + 165, rowY + 19, contentWidth - 178, 8.3, 11, colors.ink);
    rowY += 53;
  }
  box(pdf, left, 466, contentWidth, 94, colors.green);
  label(pdf, "Prerequisites", left + 15, 491, [33, 117, 75]);
  paragraph(
    pdf,
    `Use a Node.js/npm version supported by the included manifests. The API requires a reachable MongoDB instance, private backend environment settings, and allowed origins for the frontend you run. The API default is ${apiUrl}.`,
    left + 15,
    513,
    contentWidth - 30,
    8.8,
    12.5,
    colors.ink,
  );
  box(pdf, left, 579, contentWidth, 75, colors.warning);
  label(pdf, "Keep private values server-side", left + 15, 603, [151, 94, 20]);
  paragraph(
    pdf,
    "Keep database credentials, admin passwords, and JWT secrets in backend/.env. Browser-visible VITE_ and NEXT_PUBLIC_ variables are not secret storage.",
    left + 15,
    625,
    contentWidth - 30,
    8.5,
    12,
    colors.ink,
  );

  // 4 — backend installation
  pageHeader(pdf, config, logo, 4, "03  /  BACKEND SETUP", "Configure the API", "Use the backend only when you need persisted accounts and protected operations. Start MongoDB before launching the API.");
  label(pdf, "1. Prepare private environment values", left, 184);
  codePanel(pdf, [
    `cd /d "C:\\path\\to\\${projectPath}\\backend"`,
    "copy .env.example .env",
    "notepad .env",
  ], left, 200, contentWidth, { lineHeight: 15 });
  paragraph(
    pdf,
    `Set MONGODB_URI, a unique random JWT_SECRET of at least 32 characters, administrator credentials, and ALLOWED_ORIGINS for your local Vite and Next.js origins. Do not copy production secrets into a frontend environment file.`,
    left,
    283,
    contentWidth,
    9.2,
    14,
    colors.ink,
  );
  label(pdf, "2. Install and start the backend", left, 362);
  codePanel(pdf, ["npm install", "npm run dev"], left, 379, contentWidth, { lineHeight: 16 });
  paragraph(
    pdf,
    `The API listens on port ${config.port} by default. Keep the terminal open while testing. The initial administrator is configured from the private backend environment; public signup does not grant admin access.`,
    left,
    457,
    contentWidth,
    9.1,
    13,
    colors.ink,
  );
  box(pdf, left, 534, contentWidth, 98, colors.warning);
  label(pdf, "If API startup fails", left + 15, 559, [151, 94, 20]);
  paragraph(
    pdf,
    `Check MongoDB connectivity, required backend settings, and ALLOWED_ORIGINS. The frontend API base is ${apiUrl}; change it only when the API is configured to listen at a different location.`,
    left + 15,
    582,
    contentWidth - 30,
    8.9,
    13,
    colors.ink,
  );

  // 5 — frontend setup
  pageHeader(pdf, config, logo, 5, "04  /  FRONTEND SETUP", "Run one frontend", "The backend runs in its own terminal. Select either Vite or Next.js as the web frontend for your local session.");
  box(pdf, left, 183, contentWidth, 205, colors.pale);
  label(pdf, "OPTION A  /  REACT + VITE", left + 16, 208);
  heading(pdf, "Standalone Vite application", left + 16, 232, 14);
  paragraph(
    pdf,
    `Vite's API setting is ${config.viteApi}. Point it to ${apiUrl} when using the API, then start the application from its own folder.`,
    left + 16,
    253,
    contentWidth - 32,
    8.7,
    12,
    colors.ink,
  );
  codePanel(pdf, [
    `cd /d "C:\\path\\to\\${projectPath}\\${vitePath}"`,
    "npm install",
    "npm run dev",
  ], left + 16, 304, contentWidth - 32, { fontSize: 7.8, lineHeight: 13 });
  box(pdf, left, 406, contentWidth, 205, colors.green);
  label(pdf, "OPTION B  /  NEXT.JS", left + 16, 431, colors.accent);
  heading(pdf, "Native Next.js application", left + 16, 455, 14);
  paragraph(
    pdf,
    `Next.js uses ${config.nextApi} and defaults to ${apiUrl}. Configure .env.local only when you need to override the API URL.`,
    left + 16,
    476,
    contentWidth - 32,
    8.7,
    12,
    colors.ink,
  );
  codePanel(pdf, [
    `cd /d "C:\\path\\to\\${projectPath}\\nextjs"`,
    "npm install",
    "npm run dev",
  ], left + 16, 527, contentWidth - 32, { fontSize: 7.8, lineHeight: 13 });
  paragraph(
    pdf,
    "Open the localhost URL printed by the development server. Keep each app in its own terminal; build the selected frontend before deployment.",
    left,
    644,
    contentWidth,
    8.7,
    12,
    colors.muted,
  );

  // 6 — product-specific route guide
  pageHeader(pdf, config, logo, 6, "05  /  PRODUCT WALKTHROUGH", "Explore the main screens", "Use these areas to navigate the product; exact route availability can differ by frontend edition.");
  let routeY = 184;
  for (const [route, description] of config.routes) {
    box(pdf, left, routeY, contentWidth, 68, routeY % 2 ? colors.pale : [249, 250, 252], 7);
    pdf.setFont("courier", "bold");
    pdf.setFontSize(8.4);
    pdf.setTextColor(...colors.primary);
    pdf.text(route, left + 13, routeY + 21);
    paragraph(pdf, description, left + 13, routeY + 41, contentWidth - 26, 8.6, 12, colors.ink);
    routeY += 77;
  }
  box(pdf, left, 594, contentWidth, 60, colors.warning);
  paragraph(
    pdf,
    "Confirm route behavior in the frontend you purchased. Demo or preview screens may not persist changes to the API.",
    left + 13,
    618,
    contentWidth - 26,
    8.5,
    12,
    colors.ink,
  );

  // 7 — role-specific workflows
  pageHeader(pdf, config, logo, 7, "06  /  CLIENT + ADMIN WORKFLOW", "Who uses which area?", "The API—not a hidden page or frontend redirect—must enforce authorization on protected requests.");
  const workflowGap = 14;
  const workflowColumn = (contentWidth - workflowGap) / 2;
  box(pdf, left, 185, workflowColumn, 277, colors.pale);
  label(pdf, "CLIENT / CUSTOMER", left + 15, 211);
  heading(pdf, "Submit and follow up", left + 15, 237, 13);
  let workflowY = 263;
  for (const step of config.clientSteps) workflowY = bullet(pdf, step, left + 15, workflowY, workflowColumn - 30);
  box(pdf, left + workflowColumn + workflowGap, 185, workflowColumn, 277, colors.green);
  label(pdf, "ADMINISTRATOR", left + workflowColumn + workflowGap + 15, 211, colors.accent);
  heading(pdf, "Review and manage", left + workflowColumn + workflowGap + 15, 237, 13);
  workflowY = 263;
  for (const step of config.adminSteps) workflowY = bullet(pdf, step, left + workflowColumn + workflowGap + 15, workflowY, workflowColumn - 30, colors.accent);
  box(pdf, left, 484, contentWidth, 91, colors.warning);
  label(pdf, "Authorization boundary", left + 15, 508, [151, 94, 20]);
  paragraph(
    pdf,
    "Keep the first admin account private, verify access using distinct client and admin accounts, and test protected endpoints as well as the visible pages. A UI redirect alone does not secure data.",
    left + 15,
    531,
    contentWidth - 30,
    8.7,
    12.5,
    colors.ink,
  );
  label(pdf, "Workflow context", left, 611);
  paragraph(pdf, config.workflowIntro, left, 634, contentWidth, 8.9, 12.5, colors.ink);

  // 8 — demo boundaries and production planning
  pageHeader(pdf, config, logo, 8, "07  /  PRODUCTION READINESS", "Understand the boundaries", "The template is a starting point for integration. Review its limitations before accepting real orders or bookings.");
  box(pdf, left, 182, contentWidth, 130, colors.warning);
  label(pdf, "Current product limitations", left + 16, 208, [151, 94, 20]);
  paragraph(pdf, config.limitations, left + 16, 232, contentWidth - 32, 9, 13, colors.ink);
  label(pdf, "Before a live launch", left, 344);
  let launchY = 369;
  for (const item of [
    "Deploy the frontend and API as separate services and set exact HTTPS production origins.",
    "Keep admin credentials, MongoDB configuration, and JWT secrets in protected server settings.",
    ...config.launchItems,
    "Plan database backups, monitoring, incident response, data retention, customer support, and accessibility testing.",
  ]) {
    launchY = bullet(pdf, item, left, launchY, contentWidth);
    launchY += 4;
  }
  box(pdf, left, 608, contentWidth, 56, colors.green);
  paragraph(
    pdf,
    "Run the Next.js typecheck/build and the backend test suite. Validate authorization and error states with non-production test accounts.",
    left + 13,
    631,
    contentWidth - 26,
    8.5,
    12,
    colors.ink,
  );

  // 9 — buyer license and signature
  pageHeader(pdf, config, logo, 9, "08  /  PURCHASE TERMS", "Buyer license summary", "This plain-language summary is informational only; the purchase terms and license supplied with your order govern.");
  let licenseY = 187;
  for (const item of [
    "Confirm which frontend, backend/API, documentation, and support are included in your order before deployment.",
    "Use, modification, and redistribution rights are limited to the applicable purchase terms and license.",
    "An ordinary template purchase does not automatically transfer copyright, exclusive rights, or ownership.",
    "Do not redistribute the source as a standalone competing template; review third-party components under their own licenses.",
    "This guide is not a substitute for the buyer's order, executed agreement, or legal advice.",
  ]) {
    licenseY = bullet(pdf, item, left, licenseY, contentWidth);
    licenseY += 6;
  }
  box(pdf, left, 381, contentWidth, 69, colors.pale);
  label(pdf, "Purchase record reference", left + 14, 406);
  paragraph(
    pdf,
    "Buyer / order reference: __________________________________     Purchase date: __________________",
    left + 14,
    430,
    contentWidth - 28,
    8.3,
    12,
    colors.ink,
  );
  heading(pdf, "For Cardzip Services Limited", left, 487, 10);
  pdf.addImage(signature, "JPEG", left, 498, 124, 54);
  pdf.setDrawColor(...colors.line);
  pdf.line(left, 558, left + 160, 558);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.muted);
  pdf.text("Company signature", left, 572);
  pdf.text("Date: ________________________", left + 210, 558);
  box(pdf, left, 610, contentWidth, 62, colors.warning);
  paragraph(
    pdf,
    "No rights beyond the purchase terms are represented or granted by this buyer-guide summary. Confirm the order record for the license that applies.",
    left + 13,
    634,
    contentWidth - 26,
    8.3,
    11.5,
    colors.ink,
  );
}

export async function buildGuide(name) {
  const config = guides[name];
  if (!config) throw new Error(`Unknown buyer guide "${name}". Choose: ${Object.keys(guides).join(", ")}.`);
  const projectRoot = path.join(templatesRoot, config.project);
  const docs = path.join(projectRoot, "docs");
  const require = createRequire(path.join(projectRoot, config.viteFolder, "package.json"));
  const { jsPDF } = require("jspdf");
  const logoPath = path.join(docs, "assets", "cardzip-logo.jpg");
  const signaturePath = path.join(docs, "assets", "cardzip-signature.jpg");
  if (!fs.existsSync(logoPath) || !fs.existsSync(signaturePath)) {
    throw new Error(`Missing local Cardzip logo or signature under ${path.join(docs, "assets")}.`);
  }
  const logo = fs.readFileSync(logoPath);
  const signature = fs.readFileSync(signaturePath);
  const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });

  pdf.setProperties({
    title: `Cardzip ${config.product} Buyer Guide`,
    subject: `${config.product} setup, product workflows, production boundaries, and buyer license summary`,
    author: "Cardzip Services Limited",
    creator: "Cardzip Services Limited",
  });
  renderGuide(pdf, config, logo, signature);
  if (pdf.getNumberOfPages() !== 9) {
    throw new Error(`Expected nine pages for ${config.product}; generated ${pdf.getNumberOfPages()}.`);
  }
  const output = path.join(docs, config.pdfName);
  fs.writeFileSync(output, Buffer.from(pdf.output("arraybuffer")));
  console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`);
}

const requestedGuide = process.argv[2];
if (requestedGuide) await buildGuide(requestedGuide);
