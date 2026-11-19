import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docs = path.dirname(fileURLToPath(import.meta.url))
const root = path.dirname(docs)
const require = createRequire(path.join(root, 'E-Learning', 'package.json'))
const { jsPDF } = require('jspdf')
const logo = fs.readFileSync(path.join(docs, 'assets', 'cardzip-logo.jpg'))
const signature = fs.readFileSync(path.join(docs, 'assets', 'cardzip-signature.jpg'))
const output = path.join(docs, 'CARDZIP-E-LEARNING-BUYER-GUIDE.pdf')
const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
const W = 612
const H = 792
const L = 54
const R = W - L
const CW = R - L
const C = { ink: [34, 34, 59], muted: [111, 111, 133], accent: [98, 87, 217], dark: [24, 23, 45], lavender: [225, 222, 255], pale: [245, 244, 255], line: [226, 225, 238], white: [255, 255, 255], warning: [255, 247, 229] }

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
  pdf.text('SKILLORA LEARNING BUYER GUIDE', L + 37, 47)
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
  pdf.text('CARDZIP SERVICES LIMITED  |  SKILLORA LEARNING', L, 765)
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
  box(L, y, CW, height, [34, 33, 54], 7)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(239, 238, 250)
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

pdf.setProperties({ title: 'Cardzip Skillora E-Learning Buyer Guide', author: 'Cardzip Services Limited', subject: 'Skillora setup, student and instructor workflows, deployment and buyer license summary' })
pdf.setFillColor(...C.dark)
pdf.rect(0, 0, W, H, 'F')
pdf.setFillColor(...C.accent)
pdf.circle(540, 92, 152, 'F')
pdf.setFillColor(...C.dark)
pdf.circle(540, 92, 122, 'F')
pdf.addImage(logo, 'JPEG', L, 54, 118, 57)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(10)
pdf.setTextColor(...C.lavender)
pdf.text('CARDZIP SERVICES LIMITED', L, 149)
pdf.setFontSize(34)
pdf.setTextColor(...C.white)
pdf.text('Skillora Learning', L, 222)
pdf.setFontSize(20)
pdf.text('Buyer guide', L, 254)
paragraph('A hands-on guide to the course catalog, learner experience, instructor review, admin tools, and the separate API-backed version of Skillora.', L, 287, 430, 11, 16, [226, 225, 244])
box(L, 381, CW, 140, [50, 47, 91], 12)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(...C.lavender)
pdf.text('NINE-PAGE PROJECT GUIDE', L + 18, 409)
paragraph('Map the folders, start the services, follow student and instructor tasks, review admin workflows, and understand the payment, content and deployment boundaries.', L + 18, 436, CW - 36, 10, 15, [240, 239, 250])
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8.5)
pdf.setTextColor(229, 228, 245)
pdf.text('Prepared 17 November 2026  |  Version 1.1', L, 724)
pdf.text('CARDZIP SERVICES LIMITED', R, 724, { align: 'right' })
footer(1)

pdf.addPage()
let y = pageHeader('01 / package comparison', 'Choose the right learning mode', 'Skillora includes a local React demo and a separate Next.js application that uses the backend for connected accounts and content.')
const gap = 14
const cardW = (CW - gap) / 2
box(L, y, cardW, 226, C.pale, 9)
box(L + cardW + gap, y, cardW, 226, [236, 235, 250], 9)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(...C.accent)
pdf.text('REACT + VITE', L + 15, y + 23)
pdf.setTextColor(75, 67, 171)
pdf.text('NEXT.JS + API', L + cardW + gap + 15, y + 23)
let cy = y + 48
for (const item of ['Explore the course catalog, lessons, quizzes and admin sample.', 'Sample admin records and learner progress use browser localStorage.', 'Local preview only; browser storage is not secure authentication.']) {
  pdf.setFillColor(...C.accent)
  pdf.circle(L + 18, cy - 3, 2, 'F')
  cy = paragraph(item, L + 28, cy, cardW - 40, 8.2, 11.5, C.ink) + 9
}
cy = y + 48
for (const item of ['Student, instructor and admin routes use role-checked API sessions.', 'Express and MongoDB persist the catalog, accounts, enrollments and progress.', 'Paid course enrollment is blocked until verified payments are implemented.']) {
  pdf.setFillColor(98, 87, 217)
  pdf.circle(L + cardW + gap + 18, cy - 3, 2, 'F')
  cy = paragraph(item, L + cardW + gap + 28, cy, cardW - 40, 8.2, 11.5, C.ink) + 9
}
box(L, y + 244, CW, 101, C.warning, 8)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(151, 94, 20)
pdf.text('Purchase scope', L + 14, y + 268)
paragraph('Check the buyer’s order for the selected frontend, API, media and support. Course content and third-party assets must be licensed for the buyer’s intended distribution.', L + 14, y + 290, CW - 28, 8.7, 12, C.ink)
footer(2)

contentPage(3, '02 / project map', 'Folders and requirements', 'The project separates its preview UI, connected web app, backend and buyer documentation.', [
  { title: 'Project folders', text: 'E-Learning/ contains the React + Vite catalog and local demo. nextjs/ contains the Next.js edition and connected learner/admin routes. backend/ contains the Express API, role middleware and MongoDB models. docs/ contains the Markdown guide, PDF generator and local Cardzip images.' },
  { type: 'code', lines: ['E-Learning/', '  E-Learning/  React + Vite preview', '  nextjs/      Next.js connected edition', '  backend/     Express API + MongoDB', '  docs/        guide, generator, assets'] },
  { title: 'Prerequisites', text: 'Install Node.js and npm. A connected site also needs a reachable MongoDB instance, random JWT secret, private administrator credentials and exact allowed website origins.' },
  { title: 'Content readiness', text: 'Review the sample course descriptions, instructor details and media before publishing. Replace example content with materials you have permission to distribute, and define the learner privacy and support policies.' },
])

contentPage(4, '03 / backend setup', 'Configure the learning API', 'The backend stores the course catalog, accounts, enrollments, lesson progress, instructor approvals and platform settings.', [
  { type: 'code', lines: ['cd /d "C:\\path\\to\\E-Learning\\backend"', 'copy .env.example .env', 'notepad .env', 'npm install', 'npm run dev'] },
  { title: 'Set private values', text: 'Configure MONGODB_URI, a random JWT_SECRET of at least 32 characters, unique ADMIN_EMAIL and ADMIN_PASSWORD values, and ALLOWED_ORIGINS for local or production sites. Keep .env private and server-side.' },
  { title: 'Health check', text: 'The service defaults to port 5300. Open http://localhost:5300/health after startup. On first startup, the API seeds its starter course catalog and creates the admin account from the private environment values.' },
  { title: 'Failure checks', text: 'If the API will not start, verify MongoDB connectivity, the copied environment file and backend terminal output. Keep the API process running while testing connected website pages.' },
])

contentPage(5, '04 / frontend setup', 'Run the learning site', 'Start the backend first for connected enrollment, progress and administration. The Vite edition can be run on its own as a local visual demo.', [
  { title: 'Next.js connected mode', text: 'The nextjs/.env.example uses NEXT_PUBLIC_SKILLORA_API_URL=http://localhost:5300/api. Copy it to .env.local if an override is required. The exact frontend origin must also be allowed by the backend.' },
  { type: 'code', lines: ['cd /d "C:\\path\\to\\E-Learning\\nextjs"', 'copy .env.example .env.local', 'npm install', 'npm run dev'] },
  { title: 'Vite preview', text: 'Run the E-Learning app to explore the sample landing page, catalog, lesson player, quizzes, learner dashboard and demo admin. Its progress and workspace data are stored in the browser, not shared with the API.' },
  { type: 'code', lines: ['cd /d "C:\\path\\to\\E-Learning\\E-Learning"', 'npm install', 'npm run dev'] },
])

contentPage(6, '05 / learner and instructor walkthrough', 'Discover courses and learn', 'Skillora connects catalog discovery to a learner dashboard and lesson sequence in the connected edition.', [
  { title: 'Explore the catalog', text: 'Browse /categories, /courses and instructor listings. Open a course to review its description, level, duration and curriculum, then continue to lessons or the quiz flow.' },
  { title: 'Student account', text: 'Register at /signup as a Student, sign in at /login and open /dashboard to review enrollments and progress. Free courses can be enrolled in connected mode; protected learning routes save completed-module progress.' },
  { title: 'Instructor application', text: 'Select Instructor / Creator at signup. New instructor accounts remain pending until an administrator approves them. Once approved, /instructor/dashboard shows assigned courses and learner enrollment information.' },
  { title: 'Local demo note', text: 'In React + Vite, sample dashboard, enrollment and progress state is held in localStorage. Do not treat that local profile as an authenticated learner account or use it for real student records.' },
])

contentPage(7, '06 / admin workflow', 'Maintain courses and learners', 'The connected administration pages focus on course publication, instructor approval and enrollment review.', [
  { title: 'Catalog and lessons', text: 'Admins can create or edit course metadata, instructor assignment, pricing, level, image, description and curriculum, then publish or unpublish the listing. Lessons provides a focused view of course module outlines.' },
  { title: 'Instructor approvals', text: 'Review instructor signup requests and approve or reject access. Assign courses to approved instructors through the course editor, and check the public course page after publishing.' },
  { title: 'Students and enrollments', text: 'Review student accounts, suspend or reactivate access, inspect enrollment status and view learner progress. Password hashes are not included in admin-facing account data.' },
  { title: 'Platform settings', text: 'Review platform name, support email, instructor application setting and announcement before launch. The React admin workspace is a local preview; use the API-connected Next.js admin for persistent changes.' },
])

contentPage(8, '07 / limitations and deployment', 'Prepare a responsible launch', 'The template supplies course and account workflows but does not provide a verified payment integration or ready-made learning content license.', [
  { title: 'Payment boundary', text: 'The backend rejects paid-course enrollment until payment verification is implemented. No membership or course payment is charged. Connect an approved provider and verify payment server-side before granting paid access.' },
  { title: 'Privacy and content', text: 'Use only authorized course text, media and instructor images. Collect learner information only as needed, publish privacy and retention notices, provide support and define account export/deletion procedures.' },
  { title: 'Security checklist', text: 'Deploy with HTTPS, unique secrets, exact CORS origins, protected MongoDB credentials, least-privilege access, reliable backups and monitoring. Review role access and restore procedures before production.' },
  { title: 'Operational scope', text: 'Hosting, payment-provider onboarding, tax treatment, refunds, learner support and legal compliance are buyer responsibilities unless separately included in the purchase agreement. Review dependency and media licenses.' },
])

pdf.addPage()
y = pageHeader('08 / license summary', 'Buyer license and handover', 'This summary is informational only and does not add rights beyond the buyer-specific purchase terms.')
y = section('Purchase-specific grant', 'Use and modification rights apply only to the project files and purpose expressly covered by the confirmed purchase order or executed agreement. Confirm whether the selected frontend, backend, course media, hosting or support are included.', y)
y = section('Ownership and limits', 'An ordinary template purchase does not automatically transfer copyright, exclusive rights or ownership. Do not resell or redistribute the source as a standalone competing template. Third-party packages, course content, fonts and media retain their respective license terms.', y)
y = section('Controlling terms', 'The accepted order, invoice and signed agreement control if they differ from this guide. Obtain any third-party permissions required for your planned course content and have buyer-specific terms reviewed before launch.', y)
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
