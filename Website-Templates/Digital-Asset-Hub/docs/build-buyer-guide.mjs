import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docs = path.dirname(fileURLToPath(import.meta.url))
const root = path.dirname(docs)
const require = createRequire(path.join(root, 'digital-asset-hub', 'package.json'))
const { jsPDF } = require('jspdf')
const logo = fs.readFileSync(path.join(docs, 'assets', 'cardzip-logo.jpg'))
const signature = fs.readFileSync(path.join(docs, 'assets', 'cardzip-signature.jpg'))
const output = path.join(docs, 'CARDZIP-DIGITAL-ASSET-HUB-BUYER-GUIDE.pdf')
const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
const W = 612
const H = 792
const L = 54
const R = W - L
const CW = R - L
const C = { ink: [25, 42, 34], muted: [99, 115, 105], accent: [8, 111, 76], dark: [11, 37, 28], lime: [208, 235, 87], pale: [241, 247, 243], line: [219, 229, 222], white: [255, 255, 255], warning: [255, 247, 229] }

function paragraph(text, x, y, width, size = 9, leading = size * 1.4, color = C.muted) {
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(size)
  pdf.setTextColor(...color)
  const lines = pdf.splitTextToSize(text, width)
  pdf.text(lines, x, y, { lineHeightFactor: leading / size })
  return y + lines.length * leading
}

function box(x, y, w, h, color, radius = 8) {
  pdf.setFillColor(...color)
  pdf.roundedRect(x, y, w, h, radius, radius, 'F')
}

function pageHeader(label, title, intro) {
  pdf.addImage(logo, 'JPEG', L, 23, 28, 28)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(...C.ink)
  pdf.text('CARDZIP', L + 37, 35)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(...C.muted)
  pdf.text('DIGITAL ASSET HUB BUYER GUIDE', L + 37, 47)
  pdf.setDrawColor(...C.line)
  pdf.line(L, 62, R, 62)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(...C.accent)
  pdf.text(label.toUpperCase(), L, 88)
  pdf.setFontSize(22)
  pdf.setTextColor(...C.ink)
  pdf.text(title, L, 116)
  return paragraph(intro, L, 140, CW, 9.2, 13, C.muted) + 10
}

function footer(page) {
  pdf.setDrawColor(...C.line)
  pdf.line(L, 748, R, 748)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  pdf.setTextColor(...C.muted)
  pdf.text('CARDZIP SERVICES LIMITED  |  DIGITAL ASSET HUB', L, 765)
  pdf.text(String(page).padStart(2, '0'), R, 765, { align: 'right' })
}

function section(title, text, y) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(...C.ink)
  pdf.text(title, L, y)
  return paragraph(text, L, y + 15, CW, 8.7, 12) + 11
}

function bullet(text, y) {
  pdf.setFillColor(...C.accent)
  pdf.circle(L + 3, y - 3, 2, 'F')
  return paragraph(text, L + 13, y, CW - 13, 8.5, 11.8) + 6
}

function code(lines, y) {
  const lineHeight = 14
  const height = 20 + lines.length * lineHeight
  box(L, y, CW, height, [21, 33, 28], 7)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(231, 244, 235)
  pdf.text(lines, L + 13, y + 17, { lineHeightFactor: lineHeight / 8 })
  return y + height + 12
}

function contentPage(page, label, title, intro, blocks) {
  pdf.addPage()
  let y = pageHeader(label, title, intro)
  for (const block of blocks) {
    if (block.type === 'code') y = code(block.lines, y)
    else if (block.type === 'bullets') {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(...C.ink)
      pdf.text(block.title, L, y)
      y += 18
      for (const item of block.items) y = bullet(item, y)
      y += 5
    } else y = section(block.title, block.text, y)
  }
  footer(page)
}

pdf.setProperties({ title: 'Cardzip Digital Asset Hub Buyer Guide', author: 'Cardzip Services Limited', subject: 'Digital Asset Hub setup, workflows, deployment and buyer license summary' })
pdf.setFillColor(...C.dark)
pdf.rect(0, 0, W, H, 'F')
pdf.setFillColor(...C.accent)
pdf.circle(540, 92, 152, 'F')
pdf.setFillColor(...C.dark)
pdf.circle(540, 92, 122, 'F')
pdf.addImage(logo, 'JPEG', L, 54, 118, 57)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(10)
pdf.setTextColor(...C.lime)
pdf.text('CARDZIP SERVICES LIMITED', L, 149)
pdf.setFontSize(34)
pdf.setTextColor(...C.white)
pdf.text('Digital Asset Hub', L, 222)
pdf.setFontSize(20)
pdf.text('Buyer guide', L, 254)
paragraph('A hands-on guide to the React demo, connected Next.js administration experience, Express API and MongoDB setup for the Digital Asset Hub template.', L, 287, 430, 11, 16, [224, 238, 230])
box(L, 381, CW, 140, [18, 68, 49], 12)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(...C.lime)
pdf.text('NINE-PAGE PROJECT GUIDE', L + 18, 409)
paragraph('Compare purchase editions, locate each application, start the services, follow client and admin tasks, and review the limits that matter before deployment.', L + 18, 436, CW - 36, 10, 15, [232, 241, 234])
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8.5)
pdf.setTextColor(222, 235, 226)
pdf.text('Prepared 17 November 2026  |  Version 1.1', L, 724)
pdf.text('CARDZIP SERVICES LIMITED', R, 724, { align: 'right' })
footer(1)

pdf.addPage()
let y = pageHeader('01 / package comparison', 'Understand the two modes', 'Digital Asset Hub has a local React operations demo and a separate Next.js application connected to the Express API.')
const gap = 14
const cardW = (CW - gap) / 2
box(L, y, cardW, 226, C.pale, 9)
box(L + cardW + gap, y, cardW, 226, [230, 244, 235], 9)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(...C.accent)
pdf.text('REACT + VITE', L + 15, y + 23)
pdf.setTextColor(8, 111, 76)
pdf.text('NEXT.JS + API', L + cardW + gap + 15, y + 23)
let cy = y + 48
for (const item of ['Runs in digital-asset-hub/ with local browser demo records.', 'Admin operations are saved in this browser profile, not shared with other users.', 'Use for interface review; local storage is not secure authentication.']) {
  pdf.setFillColor(...C.accent)
  pdf.circle(L + 18, cy - 3, 2, 'F')
  cy = paragraph(item, L + 28, cy, cardW - 40, 8.2, 11.5, C.ink) + 9
}
cy = y + 48
for (const item of ['nextjs/ provides protected client and admin application routes.', 'backend/ and MongoDB persist accounts, operational records and platform settings.', 'Checkout and rate displays are not connected to financial providers or live markets.']) {
  pdf.setFillColor(8, 111, 76)
  pdf.circle(L + cardW + gap + 18, cy - 3, 2, 'F')
  cy = paragraph(item, L + cardW + gap + 28, cy, cardW - 40, 8.2, 11.5, C.ink) + 9
}
box(L, y + 244, CW, 101, C.warning, 8)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(151, 94, 20)
pdf.text('Purchase scope', L + 14, y + 268)
paragraph('The files supplied and rights granted are determined by the order or executed agreement. Confirm whether the selected frontend, API, deployment work and support are part of your purchase.', L + 14, y + 290, CW - 28, 8.7, 12, C.ink)
footer(2)

contentPage(3, '02 / project map', 'Folders and prerequisites', 'Use the connected edition for stored account and administration workflows; the Vite version is a separate local demonstration.', [
  { title: 'Project folders', text: 'digital-asset-hub/ contains the React + Vite app and its admin demo. nextjs/ contains the connected website, client pages and administration routes. backend/ contains the Express API and persistence layer. docs/ contains this guide, its PDF builder and local Cardzip images.' },
  { type: 'code', lines: ['Digital-Asset-Hub/', '  digital-asset-hub/  React + Vite demo', '  nextjs/             Next.js application', '  backend/            Express API + MongoDB', '  docs/               guide, generator, assets'] },
  { title: 'Prerequisites', text: 'Install Node.js and npm, and provide a reachable MongoDB instance for the connected service. The Vite demo can be viewed without a backend. Keep the API and Next.js frontend open in separate terminals when testing connected pages.' },
  { title: 'Private configuration', text: 'In backend/.env set MONGODB_URI, a random JWT_SECRET of at least 32 characters, unique ADMIN_EMAIL and ADMIN_PASSWORD values, and exact ALLOWED_ORIGINS. Do not place server secrets in browser-visible environment variables.' },
])

contentPage(4, '03 / backend setup', 'Configure the connected API', 'The Express service supplies client/admin sessions and persists operational records for the Next.js edition.', [
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Digital-Asset-Hub\\backend"', 'copy .env.example .env', 'notepad .env', 'npm install', 'npm run dev'] },
  { title: 'Environment values', text: 'Set a production MongoDB URI, strong unique JWT secret, administrator credentials and exact frontend origins. The API defaults to port 5000. Use the example file as a key list; replace example credentials with private deployment values.' },
  { title: 'Check API health', text: 'Open http://localhost:5000/health after startup. If MongoDB is unavailable or the service does not start, inspect backend/.env and the terminal output before launching the website.' },
  { title: 'Optional local seed data', text: 'SEED_DEMO_DATA is false by default. Enable it only against a disposable local database when you want sample operational records. Do not seed demo data in production.' },
])

contentPage(5, '04 / frontend setup', 'Start React or Next.js', 'Choose one interface for the task at hand. They have different persistence and security properties.', [
  { title: 'Next.js connected mode', text: 'Set nextjs/.env.local from the included example when changing the API address. Its default API base is http://localhost:5000/api. Start the API first and ensure its CORS list contains the local frontend origin.' },
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Digital-Asset-Hub\\nextjs"', 'copy .env.example .env.local', 'npm install', 'npm run dev'] },
  { title: 'React local demo', text: 'The Vite edition stores its sample operational records, statuses, rates and preferences in browser localStorage. Visit /admin and open the demo workspace. Clearing that browser site data resets the sample; it does not affect the API database.' },
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Digital-Asset-Hub\\digital-asset-hub"', 'npm install', 'npm run dev'] },
])

contentPage(6, '05 / client walkthrough', 'Explore the client workspace', 'The connected site supports account access and client-specific activity views; use demonstration values only until the service is configured for a real operation.', [
  { title: 'Account access', text: 'Create a client account at /signup or use /login, then open /dashboard. In connected mode the API issues an HTTP-only session and returns records associated with the signed-in account.' },
  { title: 'Pages and navigation', text: 'The website includes dashboard, checkout, bills, rates and virtual-card experiences alongside the public pages. Use the dashboard to review account activity and the relevant service screens to explore the interface.' },
  { title: 'Checkout boundary', text: 'Checkout is a template workflow, not a payment processor. Do not enter real payment details or imply that a purchase, payout, bill payment or card issuance has been completed.' },
  { title: 'React preview boundary', text: 'The Vite edition is a browser-local demo with editable sample records. It does not share state with the Next.js database and its login/demo workspace is not an authentication boundary.' },
])

contentPage(7, '06 / admin workflow', 'Review platform operations', 'The admin console organizes records for review, but it does not itself fulfill financial or utility services.', [
  { title: 'Overview and queues', text: 'The overview summarizes activity. Use Trades, Bills, Virtual cards, Customers and Support to search the sample or connected records and review their current status before editing.' },
  { title: 'Record maintenance', text: 'In connected mode, authorized administrators can update operational statuses, customer access and settings through the API. In the Vite demo, edits remain in browser localStorage and can be changed by the browser user.' },
  { title: 'Rates and settings', text: 'Reference rates and settings are platform display values, not live market data or provider-backed configuration. Confirm the displayed support contact and maintenance notice before a deployment.' },
  { title: 'Admin access', text: 'Use the separately configured admin account in Next.js. Client roles do not grant admin access. Never share administrator credentials or use demo localStorage as an access-control mechanism.' },
])

contentPage(8, '07 / limitations and deployment', 'Treat finance screens as a demo', 'No live trade, bill-payment, transfer, virtual-card, market-rate or payment-provider service is connected by this template.', [
  { title: 'Security', text: 'Protect MongoDB and JWT credentials, restrict CORS to exact origins, use HTTPS and secure cookies in production, apply least-privilege database access, rotate exposed secrets and maintain tested backups.' },
  { title: 'Business limitations', text: 'Rates are illustrative, records do not trigger settlement, and checkout does not charge a payment method. Connect licensed service providers and build reconciliation, audit trails, fraud controls and support processes before real use.' },
  { title: 'Production checklist', text: 'Set deployment-specific API and frontend URLs, TLS, allowed origins, private secrets, monitoring, recovery backups, customer disclosures, data retention and access reviews. Test role boundaries in the deployed environment.' },
  { title: 'Buyer responsibilities', text: 'The buyer supplies hosting, financial-provider approvals, operational policies, data-protection review and any required legal or regulatory analysis. Third-party dependencies and media remain subject to their own terms.' },
])

pdf.addPage()
y = pageHeader('08 / license summary', 'Buyer license and handover', 'This plain-language summary does not expand the rights in a buyer’s order or signed purchase agreement.')
y = section('Purchase-specific grant', 'Use, modification and deployment rights extend only to the files and project scope expressly covered by the confirmed purchase terms. Confirm whether the frontend, backend, hosting or support are included before handover.', y)
y = section('Ownership and restrictions', 'An ordinary template purchase does not by itself assign copyright or exclusive ownership. Do not resell or redistribute the template source as a standalone competing product. Cardzip marks, pre-existing materials and third-party components keep their applicable ownership and license terms.', y)
y = section('Controlling agreement', 'The accepted order, invoice and executed agreement control if they differ from this guide. Obtain any third-party permissions needed for packages, fonts, images or other included media, and seek qualified advice for buyer-specific terms.', y)
box(L, y + 2, CW, 49, C.pale, 7)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(8)
pdf.setTextColor(...C.accent)
pdf.text('PURCHASE RECORD', L + 12, y + 19)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8)
pdf.setTextColor(...C.ink)
pdf.text('Buyer / order reference: ___________________________', L + 12, y + 38)
pdf.text('Effective date: ___________________________', L + 310, y + 38)
const sigY = y + 73
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(...C.ink)
pdf.text('For Cardzip Services Limited', L, sigY)
pdf.addImage(signature, 'JPEG', L, sigY + 8, 126, 50)
pdf.setDrawColor(...C.line)
pdf.line(L, sigY + 63, L + 170, sigY + 63)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8)
pdf.setTextColor(...C.muted)
pdf.text('Company signature image', L, sigY + 77)
pdf.text('Date: ________________________', L + 230, sigY + 63)
paragraph('Informational guide only. Confirm the purchased files and final legal terms against the buyer-specific transaction record.', L, 716, CW, 7.4, 9.5, C.muted)
footer(9)

fs.writeFileSync(output, Buffer.from(pdf.output('arraybuffer')))
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`)
