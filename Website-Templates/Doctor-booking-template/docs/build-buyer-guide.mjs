import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docs = path.dirname(fileURLToPath(import.meta.url))
const root = path.dirname(docs)
const require = createRequire(path.join(root, 'doctor-booking-template', 'package.json'))
const { jsPDF } = require('jspdf')
const logo = fs.readFileSync(path.join(docs, 'assets', 'cardzip-logo.jpg'))
const signature = fs.readFileSync(path.join(docs, 'assets', 'cardzip-signature.jpg'))
const output = path.join(docs, 'CARDZIP-DOCTOR-BOOKING-BUYER-GUIDE.pdf')
const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
const W = 612
const H = 792
const L = 54
const R = W - L
const CW = R - L
const C = { ink: [30, 52, 45], muted: [103, 121, 112], accent: [8, 127, 119], dark: [23, 52, 46], mint: [206, 239, 225], pale: [239, 247, 243], line: [218, 231, 224], white: [255, 255, 255], warning: [255, 247, 229] }

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
  pdf.text('CAREWELL DOCTOR BOOKING GUIDE', L + 37, 47)
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
  pdf.text('CARDZIP SERVICES LIMITED  |  CAREWELL DOCTOR BOOKING', L, 765)
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
  box(L, y, CW, height, [25, 45, 39], 7)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(235, 246, 239)
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

pdf.setProperties({ title: 'Cardzip Carewell Doctor Booking Buyer Guide', author: 'Cardzip Services Limited', subject: 'Carewell setup, patient and provider workflows, deployment and buyer license summary' })
pdf.setFillColor(...C.dark)
pdf.rect(0, 0, W, H, 'F')
pdf.setFillColor(...C.accent)
pdf.circle(540, 92, 152, 'F')
pdf.setFillColor(...C.dark)
pdf.circle(540, 92, 122, 'F')
pdf.addImage(logo, 'JPEG', L, 54, 118, 57)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(10)
pdf.setTextColor(...C.mint)
pdf.text('CARDZIP SERVICES LIMITED', L, 149)
pdf.setFontSize(33)
pdf.setTextColor(...C.white)
pdf.text('Doctor Booking', L, 222)
pdf.setFontSize(20)
pdf.text('Buyer guide', L, 254)
paragraph('A hands-on guide to the Carewell doctor directory, appointment requests, patient and provider access, admin review, and the separate API-backed edition.', L, 287, 432, 11, 16, [221, 239, 229])
box(L, 381, CW, 140, [31, 76, 65], 12)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(...C.mint)
pdf.text('NINE-PAGE PROJECT GUIDE', L + 18, 409)
paragraph('Compare the demo and connected modes, set up the folders, walk through scheduling and approvals, and review the boundaries before any real-world use.', L + 18, 436, CW - 36, 10, 15, [233, 245, 238])
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8.5)
pdf.setTextColor(224, 238, 230)
pdf.text('Prepared 17 November 2026  |  Version 1.1', L, 724)
pdf.text('CARDZIP SERVICES LIMITED', R, 724, { align: 'right' })
footer(1)

pdf.addPage()
let y = pageHeader('01 / package comparison', 'Two ways to explore Carewell', 'The React demo and Next.js product share a scheduling theme but differ in persistence and access controls.')
const gap = 14
const cardW = (CW - gap) / 2
box(L, y, cardW, 226, C.pale, 9)
box(L + cardW + gap, y, cardW, 226, [230, 244, 235], 9)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(...C.accent)
pdf.text('REACT + VITE DEMO', L + 15, y + 23)
pdf.setTextColor(8, 111, 76)
pdf.text('NEXT.JS + API', L + cardW + gap + 15, y + 23)
let cy = y + 48
for (const item of ['Browse sample doctors, specialties and appointment screens.', 'Admin edits and appointment examples are stored in browser localStorage.', 'Suitable for visual trials; no secure patient or provider accounts.']) {
  pdf.setFillColor(...C.accent)
  pdf.circle(L + 18, cy - 3, 2, 'F')
  cy = paragraph(item, L + 28, cy, cardW - 40, 8.2, 11.5, C.ink) + 9
}
cy = y + 48
for (const item of ['Patient, provider and admin flows use the Express service.', 'MongoDB persists accounts, appointment requests, doctor records and settings.', 'Provider access requires administrator review and doctor assignment.']) {
  pdf.setFillColor(8, 111, 76)
  pdf.circle(L + cardW + gap + 18, cy - 3, 2, 'F')
  cy = paragraph(item, L + cardW + gap + 28, cy, cardW - 40, 8.2, 11.5, C.ink) + 9
}
box(L, y + 244, CW, 101, C.warning, 8)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
pdf.setTextColor(151, 94, 20)
pdf.text('Purchase scope', L + 14, y + 268)
paragraph('Use the order or executed agreement to confirm which edition, API source, support and deployment services were purchased. The guide does not grant medical or regulatory certification.', L + 14, y + 290, CW - 28, 8.7, 12, C.ink)
footer(2)

contentPage(3, '02 / project map', 'Folders and prerequisites', 'Carewell separates its Vite preview, connected Next.js application and API service into sibling project folders.', [
  { title: 'Project folders', text: 'doctor-booking-template/ contains the React + Vite appointment demo. nextjs/ contains the Next.js site with patient, provider and admin experiences. backend/ contains the Express API, Mongoose models and role middleware. docs/ contains the buyer guide, PDF generator and local Cardzip images.' },
  { type: 'code', lines: ['Doctor-booking-template/', '  doctor-booking-template/  React + Vite demo', '  nextjs/                   Next.js site', '  backend/                  Express API + MongoDB', '  docs/                     guide, generator, assets'] },
  { title: 'What you need', text: 'Install Node.js and npm. The connected mode also requires a reachable MongoDB instance. Configure a random JWT secret, private administrator credentials and exact CORS origins before starting the API.' },
  { title: 'Sensitive information', text: 'This is an appointment scheduling starter, not a medical-record system. Do not copy diagnoses, treatment details, insurance identifiers or confidential documents into demo fields.' },
])

contentPage(4, '03 / backend setup', 'Configure Express and MongoDB', 'The API stores appointment requests, account roles, provider approvals, doctor listing state and clinic preferences.', [
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Doctor-booking-template\\backend"', 'copy .env.example .env', 'notepad .env', 'npm install', 'npm run dev'] },
  { title: 'Environment configuration', text: 'Set MONGODB_URI, a random JWT_SECRET of at least 32 characters, unique ADMIN_EMAIL and ADMIN_PASSWORD values, and ALLOWED_ORIGINS for the exact local site origins. Keep .env private and outside version control.' },
  { title: 'API check', text: 'The service defaults to port 5200. Open http://localhost:5200/health after startup. The API seeds the starter doctor directory and initializes the admin from backend environment values.' },
  { title: 'Persistence', text: 'MongoDB is required for the connected mode. If the service fails, verify the database connection, environment values and backend terminal output before continuing.' },
])

contentPage(5, '04 / frontend setup', 'Start the scheduling site', 'Run the API first for connected workflows. Use React for an isolated local preview or Next.js for stored accounts and role-specific pages.', [
  { title: 'Next.js connected mode', text: 'The included nextjs/.env.example sets NEXT_PUBLIC_CAREWELL_API_URL to http://localhost:5200/api. Copy it to .env.local only when setting or overriding the frontend API URL. Keep the matching origin in backend ALLOWED_ORIGINS.' },
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Doctor-booking-template\\nextjs"', 'copy .env.example .env.local', 'npm install', 'npm run dev'] },
  { title: 'Vite demo mode', text: 'The React edition can run independently. Its appointment requests and admin edits stay in the current browser profile. Clearing site data resets the examples; the browser can alter them.' },
  { type: 'code', lines: ['cd /d "C:\\path\\to\\Doctor-booking-template\\doctor-booking-template"', 'npm install', 'npm run dev'] },
])

contentPage(6, '05 / patient and provider walkthrough', 'Follow the appointment path', 'The public workflow is designed around finding a doctor and requesting an appointment, not diagnosis or treatment.', [
  { title: 'Browse and request', text: 'Visitors can explore doctor profiles, specialties and locations. Select a doctor, choose an available date and time, and submit an appointment request. The connected API stores the request for review.' },
  { title: 'Patient account', text: 'Register as a patient at /signup, sign in at /login and open /dashboard to review appointments associated with the signed-in patient. A patient session is required for connected appointment requests.' },
  { title: 'Provider application', text: 'Select the doctor/provider option during signup. Provider access begins in a pending state and remains limited until an administrator assigns a doctor listing and approves the account.' },
  { title: 'Provider workspace', text: 'After approval, the provider can open /provider/dashboard to view appointments tied to the assigned doctor profile. Patient or provider pages are protected by backend role checks in connected mode.' },
])

contentPage(7, '06 / admin workflow', 'Coordinate appointments and access', 'The admin pages provide scheduling operations and account review. They are not a substitute for clinical oversight or credential verification.', [
  { title: 'Appointment queue', text: 'Review incoming requests, check the selected patient, doctor, date and time, then update the request status using the available workflow states. Keep schedule changes consistent with the clinic’s real booking process.' },
  { title: 'Provider review', text: 'Inspect provider applications, assign each approved provider to the appropriate doctor listing and approve or reject access. An approved provider can access only appointments associated with the assigned listing.' },
  { title: 'Doctors and patients', text: 'Manage doctor listing visibility and displayed visit fees. Review patient access and suspend/reactivate accounts when needed. Update clinic name, support email and appointment notice in Settings.' },
  { title: 'Demo vs connected admin', text: 'The Vite /admin workspace uses localStorage and does not authenticate securely. Use the Next.js admin login and backend-issued role checks for connected operations.' },
])

contentPage(8, '07 / limitations and deployment', 'Protect patient trust', 'Carewell is a scheduling template. It is not a certified electronic health record, payment platform or compliance product.', [
  { title: 'Data limits', text: 'Keep clinical notes, diagnoses, prescriptions, insurance details and medical attachments out of the system. Collect only basic scheduling and account information necessary for the workflow.' },
  { title: 'Security setup', text: 'Use HTTPS, strong unique secrets, exact CORS origins, secure session settings, restricted database access and tested backups. Limit staff access, monitor errors and review changes to provider and patient accounts.' },
  { title: 'Production requirements', text: 'Configure hosting, domain/DNS, API URLs, MongoDB and operational monitoring. Add audit logging, retention and deletion controls, verified provider credentials, notifications and locally reviewed privacy disclosures before live use.' },
  { title: 'No payment processing', text: 'The appointment preview does not charge a payment method. Connect an approved provider and add verified payment handling separately if the business requires fees or deposits.' },
])

pdf.addPage()
y = pageHeader('08 / license summary', 'Buyer license and handover', 'This summary is informational. The confirmed order and executed purchase agreement define the actual rights and package.')
y = section('Purchase-specific rights', 'Use and modification rights apply only to the project files and end-product scope covered by the buyer’s confirmed purchase terms. Do not assume hosting, clinical services, payment processing, support or regulatory approval is included unless the order expressly says so.', y)
y = section('No implied transfer', 'An ordinary template purchase does not automatically transfer copyright, exclusive rights or ownership. Do not resell or redistribute the source as a standalone competing template. Cardzip pre-existing work and third-party materials remain subject to their own ownership and license terms.', y)
y = section('Agreement and third parties', 'If this summary differs from the accepted order or signed agreement, the executed terms control. Review third-party packages, fonts, images and media separately, and obtain any permissions required for your intended use.', y)
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
