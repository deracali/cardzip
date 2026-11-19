import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docs = path.dirname(fileURLToPath(import.meta.url))
const root = path.dirname(docs)
const require = createRequire(path.join(root, 'Creator-hub', 'package.json'))
const { jsPDF } = require('jspdf')
const logo = fs.readFileSync(path.join(docs, 'assets', 'cardzip-logo.jpg'))
const signature = fs.readFileSync(path.join(docs, 'assets', 'cardzip-signature.jpg'))
const output = path.join(docs, 'CARDZIP-CREATOR-HUB-BUYER-GUIDE.pdf')
const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
const W = 612
const H = 792
const L = 54
const R = W - L
const CW = R - L
const C = { ink: [31, 26, 40], muted: [108, 101, 117], accent: [123, 75, 215], deep: [50, 34, 86], pale: [243, 238, 251], line: [225, 219, 234], white: [255, 255, 255], warning: [255, 247, 229] }

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
  pdf.text('CREATOR HUB BUYER GUIDE', L + 37, 47)
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
  pdf.text('CARDZIP SERVICES LIMITED  |  CREATOR HUB', L, 765)
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
  box(L, y, CW, height, [36, 31, 48], 7)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(239, 230, 255)
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

pdf.setProperties({ title: 'Cardzip Creator Hub Buyer Guide', author: 'Cardzip Services Limited', subject: 'Creator Hub setup, workflows, deployment and buyer license summary' })
pdf.setFillColor(...C.deep)
pdf.rect(0, 0, W, H, 'F')
pdf.setFillColor(...C.accent)
pdf.circle(535, 93, 150, 'F')
pdf.setFillColor(78, 51, 120)
pdf.circle(535, 93, 119, 'F')
pdf.addImage(logo, 'JPEG', L, 52, 126, 60)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(10)
pdf.setTextColor(221, 207, 255)
pdf.text('CARDZIP SERVICES LIMITED', L, 148)
pdf.setFontSize(36)
pdf.setTextColor(...C.white)
pdf.text('Creator Hub', L, 223)
pdf.setFontSize(20)
pdf.text('Buyer guide', L, 255)
paragraph('A practical handover for the creator storefront, connected Next.js application, Express API, MongoDB data, and Paystack-enabled commerce workflow.', L, 288, 430, 11, 16, [226, 218, 237])
box(L, 385, CW, 138, [67, 45, 102], 12)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(221, 207, 255)
pdf.text('NINE-PAGE PROJECT GUIDE', L + 18, 412)
paragraph('Compare the editions, map the folders, start the services, follow creator and admin workflows, and review launch limits and the purchase-specific license terms.', L + 18, 438, CW - 36, 10, 15, [240, 235, 248])
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8.5)
pdf.setTextColor(222, 213, 235)
pdf.text('Prepared 17 November 2026  |  Version 1.1', L, 724)
pdf.text('CARDZIP SERVICES LIMITED', R, 724, { align: 'right' })
footer(1)

pdf.addPage()
let y = pageHeader('01 / package comparison', 'Choose the included edition', 'The order record determines which source files and rights are included. These folders are separate editions, not a single combined frontend.')
const gap = 14
const cardW = (CW - gap) / 2
box(L, y, cardW, 226, C.pale, 9)
box(L + cardW + gap, y, cardW, 226, [233, 244, 237], 9)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(...C.accent)
pdf.text('VITE PREVIEW', L + 15, y + 23)
pdf.setTextColor(8, 111, 76)
pdf.text('CONNECTED PLATFORM', L + cardW + gap + 15, y + 23)
let cy = y + 48
for (const item of ['React + Vite public showcase and sample creator pages.', 'Login, signup, storefront and content are preview UI; this edition is not connected to the API.', 'Use its local scripts for visual review and styling changes.']) {
  pdf.setFillColor(...C.accent)
  pdf.circle(L + 18, cy - 3, 2, 'F')
  cy = paragraph(item, L + 28, cy, cardW - 40, 8.2, 11.5, C.ink) + 9
}
cy = y + 48
for (const item of ['Next.js public site, creator workspace and platform admin.', 'Express and MongoDB persist accounts, creator content, product listings, subscribers and payment records.', 'Paystack checkout requires merchant credentials and configuration.']) {
  pdf.setFillColor(8, 111, 76)
  pdf.circle(L + cardW + gap + 18, cy - 3, 2, 'F')
  cy = paragraph(item, L + cardW + gap + 28, cy, cardW - 40, 8.2, 11.5, C.ink) + 9
}
box(L, y + 244, CW, 101, C.warning, 8)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(151, 94, 20)
pdf.text('Purchase scope', L + 14, y + 268)
paragraph('Confirm the exact frontend, backend, assets and support scope against the invoice or signed agreement. Buying a template is not an automatic copyright assignment or exclusive-rights transfer.', L + 14, y + 290, CW - 28, 8.7, 12, C.ink)
footer(2)

contentPage(3, '02 / project map', 'Folders and prerequisites', 'Creator Hub combines a preview-only Vite site with the connected Next.js application and a separately run API.', [
  { title: 'Project folders', text: 'Creator-hub/ contains the React + Vite preview. nextjs/ contains the connected public site, creator dashboard and admin pages. backend/ holds the Express API and Mongoose models. docs/ contains this Markdown guide, the PDF generator and local brand assets.' },
  { type: 'code', lines: ['Creator-Hub/', '  Creator-hub/   Vite preview', '  nextjs/        connected Next.js site', '  backend/       Express API + MongoDB', '  docs/          guide, generator, assets'] },
  { title: 'Tools and services', text: 'Use Node.js 20.19 or later, npm and a reachable MongoDB instance. A live checkout additionally needs an approved Paystack business account. Keep backend and Next.js terminals running separately during local testing.' },
  { title: 'Secrets', text: 'Configure MONGODB_URI, a unique JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env. Paystack secret values stay on the server. Never commit .env files or expose private values through NEXT_PUBLIC variables.' },
])

contentPage(4, '03 / backend setup', 'Start Express and MongoDB', 'The connected site depends on the API for authentication, saved creator content, product data, subscriptions and payment verification.', [
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Creator-Hub\\backend"', 'copy .env.example .env', 'notepad .env', 'npm install', 'npm run dev'] },
  { title: 'Set private values', text: 'Use a production-safe MongoDB connection string and a random JWT secret of at least 32 characters. Set administrator credentials before the first database startup. ALLOWED_ORIGINS should contain the exact website origin. Set Paystack keys, currency and plan code only when your merchant account is configured.' },
  { title: 'Check the service', text: 'The API defaults to port 5100. Use http://localhost:5100/health to confirm the service is responding. If startup fails, check MongoDB access, the environment file and the backend terminal output.' },
  { title: 'Payment configuration', text: 'Creator Pro subscriptions and digital-product transactions are initialized and verified by the API. Live checkout requires correct Paystack keys, currency and (for Creator Pro) a matching Paystack plan. Test provider callbacks and webhooks in a non-production environment first.' },
])

contentPage(5, '04 / frontend setup', 'Run the website you need', 'Use Next.js for live creator, admin and payment workflows. The Vite edition remains a separate visual preview.', [
  { title: 'Next.js connected edition', text: 'Copy nextjs/.env.example to nextjs/.env.local if you need to change the API address. The default is http://localhost:5100/api. Ensure the backend ALLOWED_ORIGINS includes the frontend origin.' },
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Creator-Hub\\nextjs"', 'copy .env.example .env.local', 'npm install', 'npm run dev'] },
  { title: 'Vite preview', text: 'The Vite package provides the visual sample site and preview routes. It does not create accounts, publish backend content or process storefront payments; use it for design review rather than connected operations.' },
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Creator-Hub\\Creator-hub"', 'npm install', 'npm run dev'] },
])

contentPage(6, '05 / creator walkthrough', 'Publish a creator presence', 'Creator Hub combines public profiles, audience content and a digital storefront. Use only material and media that you are authorized to publish.', [
  { title: 'Public discovery', text: 'Visitors browse the home page, creator directory, Explore cards, resources, blog and storefront. A creator profile is reached by its public handle when the profile is visible.' },
  { title: 'Creator workspace', text: 'Sign up or sign in, choose a public handle, then use /dashboard to edit the creator page, publish blog/video/podcast/link entries, manage products, review newsletter subscribers and inspect product payment totals.' },
  { title: 'Digital product listing', text: 'Provide a clear title, description, price, currency, image and delivery URL, then preview the listing before publishing. Delivery links may be shared by recipients; use private, expiring links where appropriate.' },
  { title: 'Audience care', text: 'Email subscriptions are stored for the creator audience view. Publish a clear privacy notice, collect only necessary information, and provide appropriate unsubscribe and data-handling processes before using addresses for marketing.' },
])

contentPage(7, '06 / admin and creator operations', 'Review content and commerce', 'Creators manage their own pages and products; the platform administrator controls platform-level visibility, moderation and configuration.', [
  { title: 'Creator tasks', text: 'Use the dashboard to maintain profile details, publish or hide creator content and products, review audience subscriptions, and check product payment summaries. Verify public pages after each publish-state change.' },
  { title: 'Platform administrator', text: 'Sign in separately at /admin/login with the backend-configured administrator account. The admin workspace reviews creator access and visibility, moderates content, manages platform blog posts and Explore cards, and checks product and payment configuration.' },
  { title: 'Storefront operations', text: 'Admins can configure product listings for creators and check payment status. Paystack must be configured before checkout works; the API verifies the transaction reference and amount before recording payment or returning delivery access.' },
  { title: 'Support and handover', text: 'Keep support details accurate, define refund and cancellation procedures, reconcile payment reports, and make changes only through authorized accounts. The Vite sample screens are not a live admin console.' },
])

contentPage(8, '07 / limitations and deployment', 'Prepare before launch', 'The template supplies application workflows, not a complete hosted service or legal, privacy, tax or payment-provider approval.', [
  { title: 'Security checklist', text: 'Use HTTPS and secure production cookies; protect MongoDB with least-privilege credentials; restrict CORS to exact origins; keep JWT and Paystack secrets in a managed secret store; rotate exposed credentials; back up data and test restoration.' },
  { title: 'Payments and content', text: 'Payment initiation and verification use Paystack when configured, but merchant approval, settlement, refunds and consumer disclosures remain buyer responsibilities. Confirm prices, currencies, plan terms and delivery links before enabling live checkout.' },
  { title: 'Privacy and deployment', text: 'Set production frontend/API origins, configure domain and TLS, review privacy and retention practices for creator accounts and subscribers, and add suitable audit, monitoring, export and deletion processes.' },
  { title: 'Known boundaries', text: 'Cardzip does not provide hosting, a Paystack account, guaranteed sales, legal compliance or uninterrupted provider availability unless separately stated in the purchase agreement. Review dependency and third-party asset licenses before launch.' },
])

pdf.addPage()
y = pageHeader('08 / license summary', 'Buyer license and handover', 'This summary is informational only. The buyer’s order and executed purchase agreement define the actual scope and rights.')
y = section('Purchase-specific grant', 'Use and modification rights apply only to the files and end-product scope expressly included in the confirmed purchase terms. Do not assume that backend source, support, hosting, payment accounts or other services are included unless the order says so.', y)
y = section('Restrictions and ownership', 'No copyright assignment, exclusive right or ownership transfer is implied by an ordinary template purchase. Do not resell or redistribute the source as a standalone competing template. Cardzip pre-existing work and third-party components remain subject to their applicable ownership and license terms.', y)
y = section('Final agreement controls', 'The accepted invoice, order terms and signed agreement control if they differ from this guide. Confirm third-party package, font, image and media permissions separately. Have buyer-specific legal and payment terms reviewed before launch.', y)
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
paragraph('Informational guide, not a substitute for the buyer-specific executed agreement. Confirm the contracting entity, purchased files and final terms against the transaction record.', L, 716, CW, 7.4, 9.5, C.muted)
footer(9)

fs.writeFileSync(output, Buffer.from(pdf.output('arraybuffer')))
console.log(`Created ${output} (${pdf.getNumberOfPages()} pages).`)
