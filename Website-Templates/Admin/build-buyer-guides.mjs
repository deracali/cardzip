import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const adminRoot = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(adminRoot, 'admin-dashboard1', 'react', 'package.json'));
const { jsPDF } = require('jspdf');
const logo = fs.readFileSync(path.join(adminRoot, '..', 'Agency-Portal', 'nextjs', 'public', 'cardzip-logo.jpg'));
const signature = fs.readFileSync(path.join(adminRoot, '..', '..', 'cardzip-admin', 'admin', 'public', 'cardzip-signature.jpg'));
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
  warning: [255, 247, 229],
};

const dashboards = [
  {
    number: 1,
    title: 'Workspace Admin',
    summary: 'Manage team access, workspace settings, billing, audit activity and API keys from one administration console.',
    highlights: ['Team members, invitations and role permissions', 'Workspace directory and organization settings', 'Billing usage, invoice history and audit records'],
    projectPurpose: 'This dashboard is a workspace operations control center for managing the company’s internal structure, users, access permissions, billing, and compliance activity. It gives administrators a single place to monitor performance while maintaining secure operational oversight.',
    navigationSteps: [
      'Open the app and land on the main dashboard overview.',
      'Use the left-side navigation or top modules to switch between Team, Billing, Workspace, and Audit views.',
      'Select a user, team, invoice, or workspace record to review detailed information and edit settings.',
      'Use the action buttons in each section to invite members, update roles, download records, or trigger workflow tasks.',
    ],
    signinSteps: [
      'Open the login screen and enter the administrator email and password assigned for the workspace.',
      'If account access is protected by a role-based system, select the correct organization or workspace before continuing.',
      'After successful sign-in, the dashboard loads with the overview screen and the user-access information for the current workspace.',
      'If access is denied, confirm role permissions and verify that the account is assigned to the correct admin team.',
    ],
    adminModules: ['Overview and KPI summary', 'Team members and role permissions', 'Billing and invoice management', 'Workspace settings and compliance records', 'Audit logs and activity trail'],
  },
  {
    number: 2,
    title: 'AI Operations',
    summary: 'Monitor AI model usage and organize prompts, knowledge sources, workspaces, credentials and audit activity.',
    highlights: ['Model consumption, latency and spend overview', 'Prompt playground and knowledge base screens', 'Workspace, API key, billing and audit views'],
    projectPurpose: 'This dashboard is built for AI operations teams that need to track usage, control access, manage knowledge assets, and review admin activity across AI workspaces and connected models. It centralizes the operational view needed to keep deployments running safely and efficiently.',
    navigationSteps: [
      'Open the dashboard landing page to see model usage, key metrics, and performance summaries.',
      'Move through model, workspace, knowledge-base, and billing screens from the main navigation menu.',
      'Open a workspace or project to review prompts, token usage, connected sources, and credentials.',
      'Use the configuration screens to manage access, quotas, keys, and approval workflows.',
    ],
    signinSteps: [
      'Sign in with the AI operations or platform admin account created for your workspace.',
      'Choose the correct workspace or tenant if multiple projects are active.',
      'After login, the landing screen loads the real-time usage overview, which highlights quotas, requests, cost, and health metrics.',
      'If you cannot access a workspace, check whether your role includes AI admin or workspace manager permissions.',
    ],
    adminModules: ['AI overview and activity metrics', 'Prompts and playground management', 'Knowledge base and document sources', 'Workspace and API key controls', 'Usage auditing and billing review'],
  },
  {
    number: 3,
    title: 'Financial Operations',
    summary: 'Review ledger activity, virtual cards, payouts, wallets and customer verification in a finance operations console.',
    highlights: ['Transaction ledger, settlement and payout views', 'Virtual card management and wallet balances', 'KYC review queue, compliance and audit tools'],
    projectPurpose: 'This dashboard supports finance operations by bringing together wallet balances, payment flows, payouts, virtual cards, and customer verification checks. It is designed to help operations teams keep transactions reconciled, monitor risk, and improve approval speed.',
    navigationSteps: [
      'Start at the financial overview to review balances, transactions, and risk indicators.',
      'Switch to the ledger, wallets, payouts, or KYC sections to inspect transaction details and approvals.',
      'Use the filter controls to narrow data by date, status, customer, or card account.',
      'Review each transaction or verification case before approving, flagging, or escalating it.',
    ],
    signinSteps: [
      'Sign in to the finance or admin portal using the designated operations account.',
      'Confirm the access scope covers financial controls, virtual cards, and compliance workflows.',
      'The dashboard loads with the transactions and balance summary for the current business context.',
      'If a transaction appears unavailable, confirm permissions and check whether the account is assigned to finance or compliance roles.',
    ],
    adminModules: ['Finance overview and balances', 'Ledger and settlements', 'Wallet and virtual cards', 'Payout approvals', 'Customer verification and KYC review'],
  },
  {
    number: 4,
    title: 'Marketplace Operations',
    summary: 'Coordinate marketplace orders, inventory, vendors, payouts, marketing, analytics and support workflows.',
    highlights: ['Order tracking and inventory controls', 'Vendor directory, commissions and payouts', 'Marketing, analytics and marketplace settings'],
    projectPurpose: 'This dashboard is a marketplace command center for coordinating product ordering, vendor management, payouts, inventory, promotions, and operational reporting. It helps a marketplace team manage both front-end demand and back-end fulfillment from a single view.',
    navigationSteps: [
      'Navigate to the marketplace overview to see order volume, inventory alerts, and campaign status.',
      'Use the Orders, Inventory, Vendors, and Marketing pages to monitor live marketplace activity.',
      'Select a product, vendor, or order to review details, track fulfillment, and resolve issues quickly.',
      'Use analytics and support panels to manage resolution workflows and measure campaign performance.',
    ],
    signinSteps: [
      'Enter the marketplace admin credentials to access the operations dashboard.',
      'Confirm the correct marketplace or region is selected before making changes to inventory or payouts.',
      'After login, the overview screen loads with top orders, inventory issues, payouts, and campaign indicators.',
      'If a vendor or order is missing, verify permissions and refresh the data source or workspace filter.',
    ],
    adminModules: ['Marketplace overview and metrics', 'Orders and fulfillment', 'Inventory and stock controls', 'Vendor and commission management', 'Marketing analytics and support tools'],
  },
  {
    number: 5,
    title: 'Service Operations',
    summary: 'Coordinate a service team across sales pipeline, bookings, client records, support requests and reporting.',
    highlights: ['Deal pipeline with Kanban and table views', 'Appointments, clients and support desk', 'Proposals, reports and workflow automation'],
    projectPurpose: 'This dashboard organizes service operations around sales pipeline tracking, client records, appointment scheduling, support handling, and reporting. It helps staff coordinate each client interaction from first inquiry to completed service delivery.',
    navigationSteps: [
      'Open the operations overview to see active deals, bookings, and service requests.',
      'Move between Sales, Bookings, Clients, and Support views to track a customer from first contact to completion.',
      'Open a deal or service request to review status, notes, communication history, and assignment details.',
      'Use the reporting screen to export summaries and review service delivery performance.',
    ],
    signinSteps: [
      'Sign in with the operations or management account created for the business.',
      'Select the correct business unit or team if the platform supports multiple teams or regions.',
      'The dashboard opens to the live service pipeline with client and appointment activity details.',
      'If a record is missing, check whether it is assigned to another team or still awaiting approval.',
    ],
    adminModules: ['Pipeline and opportunities', 'Bookings and schedule management', 'Client records and communication', 'Support tickets and service requests', 'Reports and workflow automation'],
  },
];

function paragraph(pdf, text, x, y, maxWidth, options = {}) {
  const { size = 10, color = colors.muted, leading = size * 1.45, font = 'normal' } = options;
  pdf.setFont('helvetica', font);
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
  const lines = pdf.splitTextToSize(text, maxWidth);
  pdf.text(lines, x, y, { lineHeightFactor: leading / size });
  return y + lines.length * leading;
}

function paragraphHeight(pdf, text, maxWidth, size, leading) {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(size);
  return pdf.splitTextToSize(text, maxWidth).length * leading;
}

function heading(pdf, text, x, y, size = 18, color = colors.ink) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
  pdf.text(text, x, y);
}

function label(pdf, text, x, y, color = colors.green) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...color);
  pdf.text(text.toUpperCase(), x, y);
}

function box(pdf, x, y, width, height, color, radius = 8) {
  pdf.setFillColor(...color);
  pdf.roundedRect(x, y, width, height, radius, radius, 'F');
}

function codePanel(pdf, lines, x, y, width) {
  const lineHeight = 15;
  const panelHeight = 22 + lines.length * lineHeight;
  box(pdf, x, y, width, panelHeight, [22, 32, 29], 8);
  pdf.setFillColor(...colors.lime);
  pdf.roundedRect(x, y, 4, panelHeight, 2, 2, 'F');
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(230, 245, 236);
  pdf.text(lines, x + 15, y + 19, { lineHeightFactor: lineHeight / 8.5 });
  return panelHeight;
}

function pageHeader(pdf, dashboard, section, title, intro) {
  pdf.addImage(logo, 'JPEG', left, 28, 27, 27);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(...colors.ink);
  pdf.text('CARDZIP', left + 36, 39);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.muted);
  pdf.text(`ADMIN DASHBOARD ${dashboard.number} BUYER GUIDE`, left + 36, 51);
  pdf.setDrawColor(...colors.line);
  pdf.line(left, 69, right, 69);
  label(pdf, section, left, 99);
  heading(pdf, title, left, 127, 22);
  paragraph(pdf, intro, left, 151, contentWidth, { size: 10, leading: 14 });
}

function footer(pdf, dashboard, pageNumber) {
  pdf.setDrawColor(...colors.line);
  pdf.line(left, pageHeight - 42, right, pageHeight - 42);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.muted);
  pdf.text(`CARDZIP SERVICES LIMITED  |  GUIDE v1.0  |  DASHBOARD ${dashboard.number}`, left, pageHeight - 26);
  pdf.text(String(pageNumber).padStart(2, '0'), right, pageHeight - 26, { align: 'right' });
}

function bullet(pdf, text, x, y, maxWidth) {
  pdf.setFillColor(...colors.green);
  pdf.circle(x + 3, y - 3, 2, 'F');
  return paragraph(pdf, text, x + 13, y, maxWidth - 13, { size: 9.5, leading: 13.5 });
}

function buildGuide(dashboard) {
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  pdf.setProperties({
    title: `Cardzip Admin Dashboard ${dashboard.number} Buyer Guide - ${dashboard.title}`,
    subject: 'Dashboard setup and buyer license',
    author: 'Cardzip Services Limited',
    creator: 'Cardzip Services Limited',
  });

  pdf.setFillColor(...colors.darkGreen);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  pdf.setFillColor(...colors.green);
  pdf.circle(548, 86, 150, 'F');
  pdf.setFillColor(...colors.darkGreen);
  pdf.circle(548, 86, 120, 'F');
  pdf.addImage(logo, 'JPEG', left, 62, 66, 66);
  label(pdf, `Cardzip  /  Admin Dashboard ${dashboard.number}`, left, 166, colors.lime);
  heading(pdf, dashboard.title, left, 225, 34, colors.white);
  heading(pdf, 'buyer guide', left, 266, 34, colors.white);
  paragraph(pdf, dashboard.summary, left, 304, 435, { size: 12, leading: 18, color: [224, 238, 230] });
  box(pdf, left, 435, contentWidth, 125, [16, 75, 57], 14);
  label(pdf, 'Two separate frontend projects', left + 22, 466, colors.lime);
  heading(pdf, 'React + Vite  /  Next.js', left + 22, 492, 17, colors.white);
  paragraph(pdf, 'Choose one framework folder. Both versions use this dashboard design; start only the version you plan to customize.', left + 22, 517, contentWidth - 44, { size: 10, leading: 14, color: [224, 238, 230] });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(224, 238, 230);
  pdf.text('Prepared 16 November 2026  |  Version 1.0', left, 726);
  pdf.setTextColor(...colors.lime);
  pdf.text('CARDZIP SERVICES LIMITED', right, 726, { align: 'right' });

  pdf.addPage();
  pageHeader(pdf, dashboard, '01  /  INCLUDED EXPERIENCE', 'Dashboard overview', dashboard.summary);
  label(pdf, 'Main workflows', left, 204);
  let y = 230;
  for (const item of dashboard.highlights) {
    y = bullet(pdf, item, left, y, contentWidth);
    y += 14;
  }
  box(pdf, left, 345, contentWidth, 91, colors.pale, 8);
  label(pdf, 'Preview data', left + 16, 370);
  paragraph(pdf, 'The dashboard is a frontend template. Sample metrics and interactions are for preview; live authentication, payments, APIs and databases require separately configured services.', left + 16, 394, contentWidth - 32, { size: 9, leading: 13, color: colors.ink });
  box(pdf, left, 458, contentWidth, 90, colors.warning, 8);
  label(pdf, 'Package scope', left + 16, 483, [151, 94, 20]);
  paragraph(pdf, 'The React and Next.js frontends are delivered in separate folders. A backend or database is included only when your order explicitly says so.', left + 16, 507, contentWidth - 32, { size: 9, leading: 13, color: colors.ink });
  footer(pdf, dashboard, 1);

  pdf.addPage();
  pageHeader(pdf, dashboard, '02  /  INSTALL AND RUN', 'Start the frontend', 'Use Node.js 20.19 or later and npm. Replace the sample path with the folder where you unzipped the template.');
  label(pdf, 'Option A  /  React + Vite', left, 204);
  codePanel(pdf, [
    `cd /d "C:\\path\\to\\admin-dashboard${dashboard.number}\\react"`,
    'copy .env.example .env',
    'npm install',
    'npm run dev',
  ], left, 224, contentWidth);
  paragraph(pdf, 'Open the Vite address printed in the terminal, normally http://localhost:5173.', left, 318, contentWidth, { size: 8.8, leading: 12 });
  label(pdf, 'Option B  /  Next.js', left, 363);
  codePanel(pdf, [
    `cd /d "C:\\path\\to\\admin-dashboard${dashboard.number}\\nextjs"`,
    'copy .env.example .env',
    'npm install',
    'npm run dev',
  ], left, 383, contentWidth);
  paragraph(pdf, 'Open the Next.js address printed in the terminal, normally http://localhost:3000.', left, 477, contentWidth, { size: 8.8, leading: 12 });
  box(pdf, left, 522, contentWidth, 103, colors.pale, 8);
  label(pdf, 'Environment settings', left + 16, 547);
  paragraph(pdf, 'For API-connected features, set the API URL in the selected .env file. React uses VITE_API_BASE_URL; Next.js uses NEXT_PUBLIC_API_BASE_URL. Browser-visible variables must never contain private secrets. Restart the dev server after changing values.', left + 16, 571, contentWidth - 32, { size: 8.6, leading: 12, color: colors.ink });
  footer(pdf, dashboard, 2);

  pdf.addPage();
  pageHeader(pdf, dashboard, '03  /  LAUNCH AND LICENSE', 'Production checklist', 'Customize the sample workspace and review the included buyer license before publishing your end product.');
  let checklistY = 204;
  checklistY = bullet(pdf, 'Replace sample names, metrics, content and branding with your product information.', left, checklistY, contentWidth);
  checklistY += 10;
  checklistY = bullet(pdf, 'Run npm run build in the selected React or Next.js project and resolve any reported errors.', left, checklistY, contentWidth);
  checklistY += 10;
  checklistY = bullet(pdf, 'Configure production API URLs, authentication, CORS, HTTPS and provider settings for your deployment.', left, checklistY, contentWidth);
  checklistY += 10;
  checklistY = bullet(pdf, 'Review third-party package licenses and deploy backend services separately when required.', left, checklistY, contentWidth);
  box(pdf, left, 325, contentWidth, 176, colors.pale, 9);
  label(pdf, 'Buyer license summary', left + 16, 350);
  let legalY = paragraph(pdf, 'After confirmed payment, Cardzip grants a non-exclusive, non-transferable license to use and modify the files included in the purchased package to create one end product. The package scope is determined by the buyer’s order.', left + 16, 375, contentWidth - 32, { size: 8.7, leading: 12.5, color: colors.ink });
  legalY += 8;
  paragraph(pdf, 'Do not resell, sublicense, publish or redistribute the template source as a standalone product, or claim Cardzip’s pre-existing work as your own. Third-party components remain subject to their own licenses. Ordinary template purchases do not transfer copyright or exclusive ownership.', left + 16, legalY, contentWidth - 32, { size: 8.7, leading: 12.5, color: colors.ink });
  box(pdf, left, 521, contentWidth, 73, colors.warning, 8);
  label(pdf, 'Rights transfer', left + 16, 545, [151, 94, 20]);
  paragraph(pdf, 'An outright purchase, exclusive rights or assignment requires a separate written agreement that expressly describes the rights transferred.', left + 16, 568, contentWidth - 32, { size: 8.5, leading: 11.5, color: colors.ink });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...colors.ink);
  pdf.text('For Cardzip Services Limited', left, 624);
  pdf.addImage(signature, 'JPEG', left, 631, 100, 43);
  pdf.setDrawColor(...colors.line);
  pdf.line(left, 680, left + 145, 680);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.muted);
  pdf.text('Company signature', left, 692);
  pdf.text('Purchase date: ____________________', left + 220, 680);
  footer(pdf, dashboard, 3);

  pdf.addPage();
  pageHeader(pdf, dashboard, '04  /  PROJECT WALKTHROUGH', 'What the project does', dashboard.projectPurpose);
  label(pdf, 'Viewer journey', left, 204);
  let walkthroughY = 228;
  for (const [index, step] of dashboard.navigationSteps.entries()) {
    walkthroughY = bullet(pdf, `${index + 1}. ${step}`, left, walkthroughY, contentWidth);
    walkthroughY += 12;
  }
  const navigationBoxY = 330;
  const navigationTextX = left + 16;
  const navigationTextWidth = contentWidth - 32;
  const navigationText = 'Most admin dashboards start at the home or overview screen, then branch into the feature modules. Use the main navigation to move between summary, detail, and management records. The same flow remains consistent across React and Next.js versions, even though the folders are split by framework.';
  const routeText = 'Home / Overview → Login or Register → Dashboard → Feature detail → Admin settings → Audit or reporting. Exact route names may vary in a custom deployment.';
  const navigationTextY = navigationBoxY + 49;
  const navigationTextHeight = paragraphHeight(pdf, navigationText, navigationTextWidth, 9.1, 13);
  const routeLabelY = navigationTextY + navigationTextHeight + 13;
  const routeTextY = routeLabelY + 20;
  const routeTextHeight = paragraphHeight(pdf, routeText, navigationTextWidth, 9.1, 13);
  const navigationBoxHeight = routeTextY + routeTextHeight + 14 - navigationBoxY;
  box(pdf, left, navigationBoxY, contentWidth, navigationBoxHeight, colors.pale, 10);
  label(pdf, 'Navigation map', navigationTextX, navigationBoxY + 25);
  paragraph(pdf, navigationText, navigationTextX, navigationTextY, navigationTextWidth, { size: 9.1, leading: 13, color: colors.ink });
  label(pdf, 'Typical route flow', navigationTextX, routeLabelY);
  paragraph(pdf, routeText, navigationTextX, routeTextY, navigationTextWidth, { size: 9.1, leading: 13, color: colors.ink });

  const guidanceBoxY = navigationBoxY + navigationBoxHeight + 12;
  const guidanceText = 'Think of the dashboard as a command center: overview first, detail second, and action third. Review the summary screen, then drill into the relevant module, then make the needed change or export the data you need.';
  const guidanceTextHeight = paragraphHeight(pdf, guidanceText, navigationTextWidth, 8.9, 12.5);
  const guidanceBoxHeight = 46 + guidanceTextHeight + 14;
  box(pdf, left, guidanceBoxY, contentWidth, guidanceBoxHeight, colors.warning, 10);
  label(pdf, 'How to understand the app quickly', navigationTextX, guidanceBoxY + 24, [151, 94, 20]);
  paragraph(pdf, guidanceText, navigationTextX, guidanceBoxY + 46, navigationTextWidth, { size: 8.9, leading: 12.5, color: colors.ink });
  footer(pdf, dashboard, 4);

  pdf.addPage();
  pageHeader(pdf, dashboard, '05  /  SIGN-IN AND ACCESS', 'How to sign in and use the project', 'The dashboard is designed for login-based access. Use the project account credentials, then open the right module for your role.');
  label(pdf, 'Sign-in flow', left, 204);
  let signinY = 228;
  for (const [index, step] of dashboard.signinSteps.entries()) {
    signinY = bullet(pdf, `${index + 1}. ${step}`, left, signinY, contentWidth);
    signinY += 12;
  }
  box(pdf, left, 362, contentWidth, 110, colors.pale, 10);
  label(pdf, 'Recommended login path', left + 16, 386);
  paragraph(pdf, 'Open the app URL, go to /login or /register if a guest is entering for the first time, then sign in with the assigned admin account. After login, the system usually redirects to the overview or dashboard home page, where you can access the modules for your role.', left + 16, 408, contentWidth - 32, { size: 9.1, leading: 13, color: colors.ink });
  box(pdf, left, 488, contentWidth, 90, colors.warning, 10);
  label(pdf, 'What to do if access is blocked', left + 16, 512, [151, 94, 20]);
  paragraph(pdf, 'If sign-in fails, check the login email, password, organization, and assigned role. In production, the admin account should be stored securely and protected behind the correct auth rules, environment settings, and network restrictions.', left + 16, 535, contentWidth - 32, { size: 8.9, leading: 12.5, color: colors.ink });
  footer(pdf, dashboard, 5);

  pdf.addPage();
  pageHeader(pdf, dashboard, '06  /  ADMIN PAGES', 'How to use the admin screens', 'Once you are signed in, the admin experience is about finding the right page, reviewing the data, and making changes in the correct module.');
  label(pdf, 'Core admin modules', left, 204);
  let moduleY = 228;
  for (const [index, moduleName] of dashboard.adminModules.entries()) {
    moduleY = bullet(pdf, `${index + 1}. ${moduleName}`, left, moduleY, contentWidth);
    moduleY += 12;
  }
  box(pdf, left, 370, contentWidth, 116, colors.pale, 10);
  label(pdf, 'Operational workflow', left + 16, 395);
  paragraph(pdf, 'Use the overview first to identify issues or opportunities. Open a detail view to inspect records. Update default values, permissions, pricing, requests, or tasks. Then review the final result in the summary or report screen before closing the task or moving to the next workflow.', left + 16, 419, contentWidth - 32, { size: 9.1, leading: 13, color: colors.ink });
  box(pdf, left, 500, contentWidth, 76, colors.warning, 10);
  label(pdf, 'Best practice', left + 16, 524, [151, 94, 20]);
  paragraph(pdf, 'Keep the overview screen clean, update records using the correct admin form, and verify the final state before exporting files, sending messages, or approving changes.', left + 16, 548, contentWidth - 32, { size: 8.9, leading: 12.2, color: colors.ink });
  footer(pdf, dashboard, 6);

  pdf.addPage();
  pageHeader(pdf, dashboard, '07  /  BUYER LICENSE', 'Cardzip Admin Dashboard Template License', 'Plain-language license draft for the Admin Dashboard files. Confirm the purchased package and have the final terms reviewed before distribution.');
  const licenseClauses = [
    ['1. License grant.', 'After confirmed payment, Cardzip grants the buyer a non-exclusive, non-transferable license to use and modify the files included in the purchased package to create and operate one end product.'],
    ['2. Package scope.', 'The license covers the React/Vite and/or Next.js dashboard files expressly identified in the buyer’s order. Backend, database, hosted services, and third-party products are excluded unless the order specifically includes them.'],
    ['3. Permitted use.', 'The buyer may customize the included files, deploy the resulting dashboard as part of one personal or commercial end product, and allow its employees or contractors to use that end product for the buyer.'],
    ['4. Restrictions.', 'The buyer may not resell, sublicense, publish, share, or redistribute the template source as a standalone product, competing template, source bundle, or service that lets others extract or reuse the source.'],
    ['5. Ownership and third parties.', 'Cardzip and its licensors retain ownership of pre-existing template materials. This license does not transfer copyright or exclusive rights. Third-party packages, fonts, images, and services remain subject to their own licenses and terms.'],
    ['6. Separate rights transfer.', 'An outright purchase, full assignment, or exclusive rights transfer is not included in an ordinary template purchase. It is effective only under a separate written agreement that specifically describes the rights granted.'],
    ['7. Payment, warranty, and governing terms.', 'The license takes effect after confirmed payment. Except for rights that cannot legally be excluded or separate written guarantees, the files are provided as a configurable starting point; support and maintenance are included only when stated in the purchase agreement. The signed sales agreement and applicable law govern.'],
  ];
  let licenseY = 194;
  for (const [clauseTitle, clauseText] of licenseClauses) {
    heading(pdf, clauseTitle, left, licenseY, 8.7);
    licenseY = paragraph(pdf, clauseText, left + 13, licenseY + 13, contentWidth - 13, { size: 8.1, leading: 10.5, color: colors.ink });
    licenseY += 5;
  }
  box(pdf, left, licenseY + 3, contentWidth, 48, colors.pale, 8);
  label(pdf, 'Purchase record', left + 14, licenseY + 22);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.ink);
  pdf.text('Buyer / order reference: ____________________________', left + 14, licenseY + 39);
  pdf.text('Effective date: ____________________________', left + 278, licenseY + 39);

  const licenseSignatureY = licenseY + 62;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...colors.ink);
  pdf.text('For Cardzip Services Limited', left, licenseSignatureY + 10);
  pdf.addImage(signature, 'JPEG', left, licenseSignatureY + 14, 92, 39);
  pdf.setDrawColor(...colors.line);
  pdf.line(left, licenseSignatureY + 56, left + 140, licenseSignatureY + 56);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.muted);
  pdf.text('Company signature', left, licenseSignatureY + 67);
  pdf.setDrawColor(...colors.line);
  pdf.line(left + 280, licenseSignatureY + 56, right, licenseSignatureY + 56);
  pdf.text('Buyer signature / date', left + 280, licenseSignatureY + 67);
  footer(pdf, dashboard, 7);

  const docsDirectory = path.join(adminRoot, `admin-dashboard${dashboard.number}`, 'docs');
  fs.mkdirSync(docsDirectory, { recursive: true });
  const output = path.join(docsDirectory, `CARDZIP-ADMIN-DASHBOARD-${dashboard.number}-BUYER-GUIDE.pdf`);
  pdf.save(output);
  console.log(`Created ${output}`);
}

for (const dashboard of dashboards) buildGuide(dashboard);
