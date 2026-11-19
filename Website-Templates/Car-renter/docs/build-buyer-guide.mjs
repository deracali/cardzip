import { createRequire } from 'node:module'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(here, '..')
const projectRequire = createRequire(path.join(projectRoot, 'Car-renter', 'package.json'))
const { jsPDF } = projectRequire('jspdf')

const logo = await fs.readFile(path.join(projectRoot, 'Car-renter', 'public', 'cardzip-logo.jpg'))
const signature = await fs.readFile(path.join(projectRoot, '..', '..', 'cardzip-admin', 'admin', 'public', 'cardzip-signature.jpg'))
const outputs = [
  path.join(here, 'CARDZIP-CAR-RENTER-BUYER-GUIDE.pdf'),
  path.join(projectRoot, 'BUYER-GUIDE.pdf'),
  path.join(projectRoot, 'Car-renter', 'public', 'buyer-guide.pdf'),
  path.join(projectRoot, 'nextjs', 'public', 'buyer-guide.pdf'),
]

const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
const pageWidth = 612
const pageHeight = 792
const left = 54
const right = pageWidth - 54
const contentWidth = right - left
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
}

pdf.setProperties({
  title: 'Cardzip Car Renter Buyer Guide and Legal Documents',
  subject: 'Voltigo Car Renter setup, installation, Express and MongoDB deployment, Cloudinary and buyer license',
  author: 'Cardzip Services Limited',
  creator: 'Cardzip Services Limited',
})

function fill(color) {
  pdf.setFillColor(...color)
}

function stroke(color) {
  pdf.setDrawColor(...color)
}

function textColor(color) {
  pdf.setTextColor(...color)
}

function roundedBox(x, y, width, height, color, radius = 10) {
  fill(color)
  pdf.roundedRect(x, y, width, height, radius, radius, 'F')
}

function addParagraph(text, x, y, width, options = {}) {
  const { size = 10, color = colors.muted, leading = size * 1.45, font = 'normal' } = options
  pdf.setFont('helvetica', font)
  pdf.setFontSize(size)
  textColor(color)
  const lines = pdf.splitTextToSize(text, width)
  pdf.text(lines, x, y, { lineHeightFactor: leading / size })
  return y + lines.length * leading
}

function paragraphHeight(text, width, size, leading) {
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(size)
  return pdf.splitTextToSize(text, width).length * leading
}

function addLabel(text, x, y, color = colors.green) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  textColor(color)
  pdf.text(text.toUpperCase(), x, y)
}

function addHeading(text, x, y, size = 18, color = colors.ink) {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(size)
  textColor(color)
  pdf.text(text, x, y)
}

function addCodePanel(lines, x, y, width, options = {}) {
  const fontSize = options.fontSize ?? 9
  const lineHeight = options.lineHeight ?? 14
  const height = 22 + lines.length * lineHeight
  roundedBox(x, y, width, height, colors.code, 8)
  fill(colors.lime)
  pdf.roundedRect(x, y, 4, height, 2, 2, 'F')
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(fontSize)
  textColor(colors.codeText)
  pdf.text(lines, x + 15, y + 20, { lineHeightFactor: lineHeight / fontSize })
  return height
}

function addPageHeader(section, title, intro) {
  pdf.addImage(logo, 'JPEG', left, 27, 29, 29)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  textColor(colors.ink)
  pdf.text('CARDZIP', left + 38, 39)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  textColor(colors.muted)
  pdf.text('CAR RENTER BUYER GUIDE', left + 38, 51)
  stroke(colors.line)
  pdf.setLineWidth(0.7)
  pdf.line(left, 69, right, 69)
  addLabel(section, left, 98)
  addHeading(title, left, 127, 22)
  addParagraph(intro, left, 150, contentWidth, { size: 9.5, leading: 13.5 })
}

function addFooter(pageNumber) {
  stroke(colors.line)
  pdf.setLineWidth(0.7)
  pdf.line(left, pageHeight - 42, right, pageHeight - 42)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  textColor(colors.muted)
  pdf.text('CARDZIP SERVICES LIMITED  |  BUYER GUIDE v1.0', left, pageHeight - 26)
  pdf.text(String(pageNumber).padStart(2, '0'), right, pageHeight - 26, { align: 'right' })
}

function addSectionTitle(title, x, y) {
  addHeading(title, x, y, 12)
}

function addBullet(text, x, y, width, options = {}) {
  fill(options.bulletColor ?? colors.green)
  pdf.circle(x + 3, y - 3, 2, 'F')
  return addParagraph(text, x + 13, y, width - 13, {
    size: options.size ?? 9.2,
    leading: options.leading ?? 13.2,
    color: options.color ?? colors.muted,
  })
}

function addFooterAndNewPage(pageNumber) {
  addFooter(pageNumber)
  pdf.addPage()
}

function addStandardPage(pageNumber, section, title, intro, draw) {
  if (pageNumber > 1) pdf.addPage()
  addPageHeader(section, title, intro)
  draw()
  addFooter(pageNumber)
}

// Cover
fill(colors.darkGreen)
pdf.rect(0, 0, pageWidth, pageHeight, 'F')
fill(colors.green)
pdf.circle(548, 86, 150, 'F')
fill(colors.darkGreen)
pdf.circle(548, 86, 120, 'F')
pdf.addImage(logo, 'JPEG', left, 55, 74, 74)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(11)
textColor(colors.lime)
pdf.text('CARDZIP  /  BUYER DOCUMENTATION', left, 163)
pdf.setFontSize(32)
textColor(colors.white)
pdf.text('Car Renter', left, 220)
pdf.text('buyer guide', left, 259)
addParagraph(
  'Install, configure, and launch the Voltigo React/Vite or Next.js website with the Node.js Express and MongoDB backend. Set up Cloudinary vehicle photos, follow the buyer license, and review the included draft policy documents.',
  left,
  297,
  438,
  { size: 11.5, leading: 17, color: [224, 238, 230] },
)
roundedBox(left, 422, contentWidth, 133, [16, 75, 57], 14)
addLabel('Three connected project folders', left + 22, 452, colors.lime)
addHeading('React / Next.js / Express + MongoDB', left + 22, 480, 15, colors.white)
addParagraph(
  'Use one website at a time. Both website options connect to the separate API; the Vite version also supports localStorage-only demo data.',
  left + 22,
  505,
  contentWidth - 44,
  { size: 9.5, leading: 13.5, color: [224, 238, 230] },
)
pdf.addImage(logo, 'JPEG', left, 684, 25, 25)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8.5)
textColor([224, 238, 230])
pdf.text('Installation | backend | website | buyer terms | signature', left + 34, 700)
textColor(colors.lime)
pdf.text('CARDZIP SERVICES LIMITED', right, 700, { align: 'right' })
addFooter(1)

addStandardPage(2, '01  /  YOUR PURCHASE', 'Choose your package', 'The Car Renter delivery contains two website choices and a separate backend service. Verify your sales order to confirm which files and license options you purchased.', () => {
  const cardY = 192
  const gap = 14
  const cardWidth = (contentWidth - gap) / 2
  roundedBox(left, cardY, cardWidth, 222, colors.pale)
  addLabel('Website template', left + 17, cardY + 27)
  addHeading('Vite or Next.js', left + 17, cardY + 52, 16)
  let y = cardY + 78
  y = addBullet('Select one included website: React with Vite or Next.js.', left + 17, y, cardWidth - 34)
  y += 7
  y = addBullet('Customize pages, copy, colors, and fleet content for one end product.', left + 17, y, cardWidth - 34)
  y += 7
  addBullet('Use Vite localStorage for the browser-only demo; it is not shared or secure backend storage.', left + 17, y, cardWidth - 34)

  const fullX = left + cardWidth + gap
  roundedBox(fullX, cardY, cardWidth, 222, [230, 244, 235])
  addLabel('Full template stack', fullX + 17, cardY + 27)
  addHeading('Website + API', fullX + 17, cardY + 52, 16)
  y = cardY + 78
  y = addBullet('Adds the separate Node.js Express API and MongoDB data store.', fullX + 17, y, cardWidth - 34)
  y += 7
  y = addBullet('Connect renter accounts, administrator tools, bookings, and fleet data across users.', fullX + 17, y, cardWidth - 34)
  y += 7
  addBullet('Configure Cloudinary, production secrets, and hosting before live use.', fullX + 17, y, cardWidth - 34)

  roundedBox(left, 444, contentWidth, 117, colors.warning)
  addLabel('Purchase and intellectual-property distinction', left + 17, 469, [151, 94, 20])
  addParagraph(
    "A full-template purchase includes the listed source files; it is not an intellectual-property buyout or exclusive rights transfer. Copyright in Cardzip's pre-existing work remains with its owner. An outright assignment or exclusive transfer requires a separate written agreement that expressly identifies the rights granted.",
    left + 17,
    493,
    contentWidth - 34,
    { size: 9.2, leading: 13.2, color: colors.ink },
  )
  addParagraph(
    'Folders: Car-renter (React/Vite), nextjs (Next.js), and backend (Express + MongoDB). The React/Vite and Next.js websites are alternatives; start one frontend at a time.',
    left,
    587,
    contentWidth,
    { size: 9.2, leading: 13.5 },
  )
})

addStandardPage(3, '02  /  PREPARE', 'Before you run anything', 'Unzip the project first. Use Windows Command Prompt in the indicated folder, and keep each long-running service open in a separate terminal.', () => {
  addSectionTitle('Required tools and services', left, 202)
  let y = 228
  y = addBullet('Node.js 20.19 or later and npm. Verify with node --version and npm --version.', left, y, contentWidth)
  y += 11
  y = addBullet('MongoDB: a local Community Server or a MongoDB Atlas database, plus its connection URI.', left, y, contentWidth)
  y += 11
  y = addBullet('Cloudinary account for persistent vehicle photos; API credentials are required by the Express backend.', left, y, contentWidth)
  y += 11
  y = addBullet('Network access for installing npm packages and reaching MongoDB and Cloudinary.', left, y, contentWidth)

  addSectionTitle('Project folders and default addresses', left, 352)
  const rows = [
    ['backend', 'Express API + MongoDB', 'http://localhost:5000'],
    ['Car-renter', 'React + Vite website', 'http://localhost:5173'],
    ['nextjs', 'Next.js website (alternative)', 'http://localhost:3000'],
  ]
  let rowY = 371
  for (const [folder, purpose, url] of rows) {
    roundedBox(left, rowY, contentWidth, 45, colors.pale, 7)
    pdf.setFont('courier', 'bold')
    pdf.setFontSize(9)
    textColor(colors.ink)
    pdf.text(folder, left + 13, rowY + 19)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    textColor(colors.muted)
    pdf.text(purpose, left + 151, rowY + 19)
    pdf.text(url, left + 151, rowY + 33)
    rowY += 53
  }
  roundedBox(left, 549, contentWidth, 84, [230, 244, 235], 9)
  addLabel('Keep private values on the server', left + 15, 572)
  addParagraph(
    'Do not publish .env files, database credentials, Cloudinary API secrets, signing secrets, or admin passwords. Never put server secrets in VITE_ or NEXT_PUBLIC_ variables.',
    left + 15,
    594,
    contentWidth - 30,
    { size: 8.8, leading: 12.5, color: colors.ink },
  )
})

addStandardPage(4, '03  /  API + DATABASE', 'Install and start Express', 'The Node.js API connects the websites to MongoDB, renter and administrator accounts, reservations, fleet listings, and signed Cloudinary uploads.', () => {
  addSectionTitle('1. Create your server configuration', left, 201)
  addParagraph('Open Command Prompt. Change the sample path to the folder where you unzipped the template:', left, 224, contentWidth, { size: 9, leading: 13 })
  addCodePanel([
    'cd /d "C:\\path\\to\\Car-renter\\backend"',
    'copy .env.example .env',
    'notepad .env',
  ], left, 259, contentWidth)
  addParagraph(
    'Set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ALLOWED_ORIGINS, and the Cloudinary credentials described on the upload setup page. Replace all example values with your own private settings.',
    left,
    341,
    contentWidth,
    { size: 9, leading: 13.5, color: colors.ink },
  )

  addSectionTitle('2. Install dependencies and launch the API', left, 404)
  addCodePanel(['npm install', 'npm run dev'], left, 428, contentWidth)
  addParagraph(
    'Keep this API terminal open. The service listens on port 5000 by default. It should report successful MongoDB connectivity before you try signing in or loading reservations; missing credentials or an unreachable database must be fixed, not bypassed.',
    left,
    491,
    contentWidth,
    { size: 9, leading: 13.5 },
  )
  roundedBox(left, 570, contentWidth, 77, colors.warning, 9)
  addLabel('Seed the first administrator securely', left + 15, 593, [151, 94, 20])
  addParagraph(
    "Create or seed the admin account using the backend's documented setup. Change any sample password before use. Do not expose an administrator invitation code or password in website code or screenshots.",
    left + 15,
    615,
    contentWidth - 30,
    { size: 8.7, leading: 12.5, color: colors.ink },
  )
})

addStandardPage(5, '04  /  CHOOSE ONE WEBSITE', 'Install and start the frontend', 'Open a second Command Prompt for the website you selected. Next.js uses the Express API; the Vite version is a browser-only localStorage demo.', () => {
  const firstY = 189
  roundedBox(left, firstY, contentWidth, 210, colors.pale, 10)
  addLabel('OPTION A / REACT + VITE', left + 17, firstY + 25)
  addHeading('Vite website', left + 17, firstY + 49, 16)
  addParagraph(
    'Vite stores demo users, vehicles, and reservations in this browser profile only. It does not connect to Express or MongoDB.',
    left + 17,
    firstY + 69,
    contentWidth - 34,
    { size: 8.8, leading: 12.3, color: colors.ink },
  )
  addCodePanel([
    'cd /d "C:\\path\\to\\Car-renter\\Car-renter"',
    'npm install',
    'npm run dev',
  ], left + 17, firstY + 119, contentWidth - 34, { fontSize: 8, lineHeight: 11.5 })

  const secondY = 418
  roundedBox(left, secondY, contentWidth, 196, [230, 244, 235], 10)
  addLabel('OPTION B / NEXT.JS', left + 17, secondY + 25)
  addHeading('Next.js website', left + 17, secondY + 49, 16)
  addParagraph(
    'Set NEXT_PUBLIC_API_URL=http://localhost:5000/api in nextjs/.env.local. The browser calls the separate Express service; Next.js does not host the rental API or MongoDB.',
    left + 17,
    secondY + 69,
    contentWidth - 34,
    { size: 8.8, leading: 12.3, color: colors.ink },
  )
  addCodePanel([
    'cd /d "C:\\path\\to\\Car-renter\\nextjs"',
    'copy .env.example .env.local',
    'notepad .env.local',
    'npm install',
    'npm run dev',
  ], left + 17, secondY + 119, contentWidth - 34, { fontSize: 8, lineHeight: 11.5 })
  addParagraph(
    'Open the local address printed in the terminal. Use a public browser API URL for deployed websites; localhost works only on your own computer.',
    left,
    641,
    contentWidth,
    { size: 8.4, leading: 11.5 },
  )
})

addStandardPage(6, '05  /  ADMIN + RENTER FLOW', 'Test a complete reservation', 'Use separate test accounts to verify the whole flow before adding real listings or inviting customers.', () => {
  addSectionTitle('Administrator setup', left, 201)
  let y = 226
  y = addBullet('Open the administrator sign-in page and sign in with the account seeded by the Express backend.', left, y, contentWidth)
  y += 9
  y = addBullet('Open Fleet, add a vehicle, enter its daily price and details, and upload a vehicle image through Cloudinary.', left, y, contentWidth)
  y += 9
  y = addBullet('Review incoming reservations, confirm or change their status, and verify customers, revenue, and inventory in the admin pages.', left, y, contentWidth)

  addSectionTitle('Renter test', left, 338)
  y = 363
  y = addBullet('Create a test renter account, browse the public fleet, choose a vehicle, and select pickup and return locations and dates.', left, y, contentWidth)
  y += 9
  y = addBullet('Submit a reservation request. The API checks that the vehicle is available for the requested period; no payment is processed.', left, y, contentWidth)
  y += 9
  y = addBullet('Open the renter dashboard in the same API environment. Verify the request and its pending or confirmed status.', left, y, contentWidth)
  y += 9
  addBullet('Switch back to the administrator account and update the status. Confirm the renter can see the same server-backed booking.', left, y, contentWidth)

  roundedBox(left, 508, contentWidth, 110, colors.warning, 9)
  addLabel('Vite localStorage mode is intentionally separate', left + 15, 533, [151, 94, 20])
  addParagraph(
    'When Vite uses its browser-only mode, its sample renter, admin demo, vehicles, and reservations are stored only in localStorage. They are not shared across browsers or synchronized with MongoDB. Configure the API for shared live data; never use localStorage demo credentials for real customer accounts.',
    left + 15,
    555,
    contentWidth - 30,
    { size: 8.8, leading: 12.6, color: colors.ink },
  )
})

addStandardPage(7, '06  /  VEHICLE PHOTOS', 'Configure Cloudinary uploads', 'Vehicle images are uploaded to Cloudinary and their secure URLs are saved with the fleet listing, so they can be displayed to renters on the public website.', () => {
  const cardY = 191
  roundedBox(left, cardY, contentWidth, 156, colors.pale, 10)
  addLabel('Next.js website / upload through Express', left + 16, cardY + 25)
  let y = cardY + 48
  y = addBullet('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET only in backend/.env.', left + 16, y, contentWidth - 32, { size: 8.8, leading: 12.5 })
  y += 7
  y = addBullet('The administrator submits a photo to the admin-only Express upload endpoint. The server signs the upload and never sends its API secret to the browser.', left + 16, y, contentWidth - 32, { size: 8.8, leading: 12.5 })
  y += 7
  addBullet('The backend saves the returned Cloudinary HTTPS URL with the vehicle. Public fleet cards use that saved URL.', left + 16, y, contentWidth - 32, { size: 8.8, leading: 12.5 })

  roundedBox(left, 367, contentWidth, 161, [230, 244, 235], 10)
  addLabel('Vite browser demo / restricted unsigned preset', left + 16, 392)
  y = 416
  y = addBullet('Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Car-renter/.env. This setup uses a public unsigned preset and does not provide production-grade upload authorization.', left + 16, y, contentWidth - 32, { size: 8.8, leading: 12.5 })
  y += 7
  addBullet('Restrict the preset to images, a fixed voltigo/vehicles folder, permitted formats, size limits, and transformations in Cloudinary. Never use a signed API secret in VITE_ variables.', left + 16, y, contentWidth - 32, { size: 8.8, leading: 12.5 })

  roundedBox(left, 549, contentWidth, 79, colors.warning, 9)
  addLabel('Photo requirements', left + 15, 573, [151, 94, 20])
  addParagraph(
    'The admin form accepts JPEG, PNG, WebP, or AVIF images up to 10 MB. Do not upload images you do not have the right to use, identifiable renter documents, or private information.',
    left + 15,
    595,
    contentWidth - 30,
    { size: 8.7, leading: 12.2, color: colors.ink },
  )
})

addStandardPage(8, '07  /  LAUNCH + SUPPORT', 'Go-live and troubleshooting', 'Verify configuration, security, and business policies before exposing the service publicly. Replace all sample text, credentials, origins, and localhost URLs.', () => {
  addSectionTitle('Before production', left, 202)
  let y = 227
  y = addBullet('Use a managed production MongoDB database, network restrictions, backups, and a least-privilege database account.', left, y, contentWidth)
  y += 9
  y = addBullet('Set a high-entropy JWT_SECRET, a unique administrator password, correct CORS allow-listed origins, HTTPS, and secure production cookies.', left, y, contentWidth)
  y += 9
  y = addBullet('Configure the production Cloudinary account and API secrets only on the backend. Set upload limits and storage policies.', left, y, contentWidth)
  y += 9
  y = addBullet('Replace all demo images, vehicle facts, contact details, pricing, insurance claims, legal terms, and admin seed credentials.', left, y, contentWidth)
  y += 9
  y = addBullet('Run the production build and test renter registration, admin permissions, date availability, image uploads, booking status, and data separation.', left, y, contentWidth)
  y += 9
  addBullet('Arrange appropriate insurance, payment processing, consumer notices, data protection, and local transportation/rental compliance before launch.', left, y, contentWidth)

  addSectionTitle('Quick checks', left, 432)
  const issues = [
    ['Website cannot reach API', 'Check the API terminal, base URL, port, and ALLOWED_ORIGINS; localhost is not a public production host.'],
    ['Database or sign-in fails', 'Check MongoDB connectivity, environment names, backend errors, and whether the admin account was seeded.'],
    ['Fleet image is missing', 'Confirm Cloudinary settings, file type and size, upload permission, saved HTTPS URL, and delivery status.'],
    ['Vite data is not shared', 'This is expected in localStorage demo mode. Use the Express/MongoDB API for server-backed data.'],
  ]
  let rowY = 452
  for (const [issue, resolution] of issues) {
    roundedBox(left, rowY, contentWidth, 49, colors.pale, 7)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.8)
    textColor(colors.ink)
    pdf.text(issue, left + 12, rowY + 18)
    addParagraph(resolution, left + 170, rowY + 16, contentWidth - 182, { size: 8, leading: 10.5, color: colors.muted })
    rowY += 56
  }
})

addStandardPage(9, '08  /  BUYER LICENSE', 'Cardzip template license', 'Plain-language template license draft for the Car Renter files. Confirm your order scope and the final signed sales terms; legal review is recommended before distribution.', () => {
  const clauses = [
    ['1. License grant.', 'After cleared payment, Cardzip grants the buyer a non-exclusive, non-transferable license to use and modify the source files included in the purchased package to create and operate one end product. No additional royalty is due for use in that permitted end product.'],
    ['2. Package scope.', 'A website-only purchase covers the selected React/Vite or Next.js website files only and does not include Express/MongoDB backend source unless the order expressly includes it. A full-stack purchase includes the identified website and backend source files.'],
    ['3. Permitted use.', 'The buyer may customize the purchased files and use the modified end product for one personal or commercial business. The purchased files may not be used to create multiple unrelated end products without an additional license.'],
    ['4. Restrictions.', 'Do not resell, sublicense, publish, share, or redistribute the template source or substantially reusable portions as a standalone product, competing template, source bundle, or service that lets others extract the source.'],
    ['5. Ownership and third parties.', 'Cardzip and its licensors retain rights in pre-existing template materials. This license does not transfer copyright, exclusive rights, or ownership. Third-party packages, fonts, images, and services remain subject to their own terms and licenses.'],
    ['6. Separate rights transfer.', 'An outright purchase, full assignment, or exclusive rights transfer is not included in an ordinary template purchase. It is effective only under a separate written agreement that specifically describes the assigned rights.'],
    ['7. Payment and termination.', 'The license takes effect after confirmed payment. A material breach that is not cured after reasonable written notice may result in termination to the extent allowed by applicable law. Upon termination, stop using and remove unlicensed copies, subject to mandatory legal retention requirements.'],
    ['8. No warranty; support.', 'Except for non-excludable statutory rights or separate written guarantees, the files are provided as a configurable starting point, without a promise of error-free operation, business results, third-party uptime, or fitness for a particular purpose. Maintenance and support are included only when stated in the purchase agreement.'],
    ['9. Liability and governing law.', 'To the extent permitted by law, liability is limited to direct loss and will not exclude rights or remedies that cannot legally be excluded. Insert the correct contracting Cardzip entity, governing law, venue, dispute process, and any negotiated cap before sale; do not rely on this draft to supply them.'],
  ]
  let y = 198
  for (const [heading, text] of clauses) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.8)
    textColor(colors.ink)
    pdf.text(heading, left, y)
    y = addParagraph(text, left + 13, y + 13, contentWidth - 13, { size: 8, leading: 10.5 })
    y += 5
  }
  roundedBox(left, 681, contentWidth, 48, colors.warning, 8)
  addParagraph('Draft for Cardzip legal review. The purchase receipt, order scope, negotiated terms, and mandatory consumer law take precedence as applicable.', left + 12, 700, contentWidth - 24, { size: 7.7, leading: 10.5, color: colors.ink })
})

addStandardPage(10, '09  /  PROJECT WALKTHROUGH', 'What the project does', 'The Car Renter platform is a rental marketplace for browsing available vehicles, creating reservation requests, and managing rental operations from an admin dashboard. It is designed for car rental businesses that want a branded booking flow with operational control.', () => {
  addLabel('Project purpose', left, 202)
  let walkthroughY = 226
  walkthroughY = addBullet('Customers can browse the fleet, view vehicle details, choose dates, and submit reservation requests through the public website.', left, walkthroughY, contentWidth)
  walkthroughY += 11
  walkthroughY = addBullet('The admin area lets staff manage fleet details, add vehicles, confirm availability, and review renter requests from a central dashboard.', left, walkthroughY, contentWidth)
  walkthroughY += 11
  walkthroughY = addBullet('The Express API stores and serves real booking data, while the website uses that data for a live reservation flow.', left, walkthroughY, contentWidth)
  walkthroughY += 11
  addBullet('The Vite version is a browser-only demo and should not be used for real customer data without a real backend setup.', left, walkthroughY, contentWidth)

  const flowBoxY = 382
  const flowTextX = left + 15
  const flowTextWidth = contentWidth - 30
  const navigationText = 'Open the public homepage, choose a vehicle, and move through the booking flow using the selected dates and pickup information. The renter submits a request; the administrator reviews it and updates the booking status in the backend dashboard.'
  const typicalFlowText = 'Browse vehicles → Select dates → Create renter account or sign in → Submit reservation → Admin review → Update status → Renter sees confirmation.'
  const flowTextY = flowBoxY + 47
  const navigationHeight = paragraphHeight(navigationText, flowTextWidth, 9.1, 13)
  const typicalLabelY = flowTextY + navigationHeight + 12
  const typicalTextY = typicalLabelY + 20
  const typicalFlowHeight = paragraphHeight(typicalFlowText, flowTextWidth, 9.1, 13)
  const flowBoxHeight = typicalTextY + typicalFlowHeight + 14 - flowBoxY
  roundedBox(left, flowBoxY, contentWidth, flowBoxHeight, colors.pale, 9)
  addLabel('How to navigate it', flowTextX, flowBoxY + 24)
  addParagraph(navigationText, flowTextX, flowTextY, flowTextWidth, { size: 9.1, leading: 13, color: colors.ink })
  addLabel('Typical flow', flowTextX, typicalLabelY)
  addParagraph(typicalFlowText, flowTextX, typicalTextY, flowTextWidth, { size: 9.1, leading: 13, color: colors.ink })

  const signInBoxY = flowBoxY + flowBoxHeight + 12
  const signInText = 'Use the public sign-in or sign-up pages for renter access and the admin sign-in route for staff. If login fails, verify the API is running, the database is connected, and the credentials and permissions are configured on the backend.'
  const signInTextHeight = paragraphHeight(signInText, flowTextWidth, 9, 12.5)
  const signInBoxHeight = 46 + signInTextHeight + 14
  roundedBox(left, signInBoxY, contentWidth, signInBoxHeight, colors.warning, 9)
  addLabel('How to sign in', flowTextX, signInBoxY + 24, [151, 94, 20])
  addParagraph(
    signInText,
    flowTextX,
    signInBoxY + 46,
    flowTextWidth,
    { size: 9, leading: 12.5, color: colors.ink },
  )
})

addStandardPage(11, '10  /  ADMIN USAGE', 'How to use the admin screens', 'The admin area is where the rental team manages the fleet, reviews bookings, and keeps the public website aligned with real availability and customer requests.', () => {
  const adminSections = [
    ['Dashboard overview', 'Review live rental demand, booking activity, and overall fleet status in one place.'],
    ['Fleet management', 'Add or edit cars, manage photos, pricing, features, and availability times for each listing.'],
    ['Reservations', 'Review requests, confirm or deny bookings, and update status as the renter moves through the process.'],
    ['Customers', 'Check renter records, account details, and any operational notes that affect service delivery.'],
    ['Settings and compliance', 'Update business settings, policies, and support details before sending the site live to the public.'],
  ]
  let adminY = 202
  for (const [title, body] of adminSections) {
    roundedBox(left, adminY, contentWidth, 52, colors.pale, 8)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10.5)
    textColor(colors.ink)
    pdf.text(title, left + 14, adminY + 20)
    addParagraph(body, left + 150, adminY + 19, contentWidth - 160, { size: 8.4, leading: 11.2, color: colors.ink })
    adminY += 60
  }
  roundedBox(left, 546, contentWidth, 90, colors.warning, 9)
  addLabel('Best practice', left + 15, 570, [151, 94, 20])
  addParagraph(
    'Always review vehicle availability before confirming bookings, and verify the live booking state after any admin update. A clean overview, correct capacity data, and reliable sign-in flow are the keys to keeping the rental operation trustworthy.',
    left + 15,
    592,
    contentWidth - 30,
    { size: 8.9, leading: 12.4, color: colors.ink },
  )
})

addStandardPage(12, '11  /  RENTAL TERMS APPENDIX', 'Customer rental terms checklist', 'This sample operational checklist is not a substitute for a complete vehicle hire agreement. A rental operator must supply legally reviewed, locally compliant customer terms before accepting real reservations.', () => {
  const clauses = [
    ['1. Booking request and confirmation.', 'Submitting a request does not reserve a vehicle. A reservation is confirmed only when the rental operator accepts it and sends written confirmation identifying the vehicle, rental period, and total charges.'],
    ['2. Eligibility and documents.', 'Before handover, disclose the minimum driver age, licence tenure, accepted licences and identity documents, additional-driver process, and any legitimate eligibility checks. Collect only information necessary for a lawful rental.'],
    ['3. Prices, deposit, and payment.', 'Show the full rental rate, taxes, delivery charges, protection options, deposits, payment timing, refunds, and any extra fees before confirmation. Use an approved payment provider; do not collect card security codes or store full payment-card details in this application.'],
    ['4. Cancellation and changes.', 'Publish clear cancellation, refund, no-show, late pickup, extension, vehicle-change, and operator-cancellation rules before checkout. State the time limits, calculation method, and process to request a change.'],
    ['5. Vehicle condition and use.', 'Document condition and fuel/charge level at pickup and return. Disclose mileage, territory, prohibited uses, smoking, pets, maintenance, breakdown, accident, theft, reporting, and assistance procedures.'],
    ['6. Protection and liability.', 'Precisely state the insurance, damage waiver, excess/deductible, exclusions, claims steps, and who provides each protection product. Do not describe a vehicle as insured or covered unless the operator can substantiate that claim.'],
    ['7. Delivery, return, and disputes.', 'Set the pickup and return locations, delivery windows, handover evidence, key-return process, damage review, complaint contact, and dispute-resolution process.'],
    ['8. Local disclosures and acceptance.', 'Identify the contracting rental company and contact details, applicable law, privacy notice, consent/acceptance mechanism, accessible formats, required statutory disclosures, and effective date. Get local legal and insurance review before launch.'],
  ]
  let y = 202
  for (const [heading, text] of clauses) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    textColor(colors.ink)
    pdf.text(heading, left, y)
    y = addParagraph(text, left + 13, y + 13, contentWidth - 13, { size: 8.2, leading: 11 })
    y += 8
  }
  roundedBox(left, 653, contentWidth, 73, colors.warning, 8)
  addParagraph('The supplied checkout is a reservation-request demo. It does not collect payments, verify driver licences, supply insurance, or confirm actual vehicle availability. Replace these sample terms and features before accepting customers.', left + 12, 674, contentWidth - 24, { size: 8.1, leading: 11, color: colors.ink })
})

addStandardPage(11, '10  /  PRIVACY NOTICE APPENDIX', 'Customer privacy notice checklist', 'The following is a data-handling draft, not a final privacy policy. Verify actual hosting, vendors, retention, lawful bases, data transfers, and local privacy obligations before publication.', () => {
  const clauses = [
    ['1. Who is responsible.', 'Insert the legal name and contact details of the rental operator that determines how renter information is used. Identify a privacy contact and, where required, a data-protection representative.'],
    ['2. Information collected.', 'List the information the live service actually collects, such as name, email, account credentials (stored as salted password hashes), trip dates, pickup and return locations, reservation status, uploaded vehicle photos, support correspondence, and essential service logs.'],
    ['3. Why it is used.', 'Explain the specific purposes: create and secure accounts, provide the website, manage vehicle listings and rental requests, communicate about trips, prevent abuse, answer support requests, meet legal duties, and improve service. Identify the applicable legal basis for each purpose when required.'],
    ['4. Payments and identity.', 'The included demo does not process payments or verify licences. If the deployed service adds either feature, name the payment or identity provider, explain what it receives, and publish the relevant processing and retention details. Never claim payment data is collected if it is not.'],
    ['5. Recipients and service providers.', 'Name or describe the real hosting, MongoDB, Cloudinary, email, analytics, support, and payment vendors used by the deployed service. Explain what each provider processes, the purpose, and the relevant contractual safeguards.'],
    ['6. Cookies and security.', 'Describe the actual authentication session cookie, its purpose, lifetime, security attributes, and any analytics or tracking cookies. Explain appropriate safeguards without promising that any system is completely secure.'],
    ['7. Retention and deletion.', 'Set and publish specific retention periods or practical criteria for accounts, reservations, customer messages, image uploads, backups, and audit records. Explain how account closure and legally required records are handled.'],
    ['8. International processing.', 'Identify countries or regions where the real service or its providers store or access personal information, and describe applicable transfer safeguards where required.'],
    ['9. User rights and contact.', 'Describe the privacy rights and choices available under the applicable law, how to make a request, how identity is verified proportionately, response timelines, and how to complain to the relevant supervisory authority.'],
    ['10. Children and changes.', "Specify the service's intended audience and age requirements. Provide a process for updating this notice, its effective date, and how material changes will be communicated."],
  ]
  let y = 198
  for (const [heading, text] of clauses) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.6)
    textColor(colors.ink)
    pdf.text(heading, left, y)
    y = addParagraph(text, left + 13, y + 12, contentWidth - 13, { size: 7.7, leading: 9.7 })
    y += 4
  }
  roundedBox(left, 698, contentWidth, 32, colors.warning, 7)
  addParagraph('Remove placeholders and obtain privacy review before publishing this notice.', left + 10, 718, contentWidth - 20, { size: 7.6, leading: 9.4, color: colors.ink })
})

// Purchase record and company signature
pdf.addPage()
addPageHeader(
  '11  /  PURCHASE RECORD + SIGNATURE',
  'License record and acceptance',
  "Complete this page against the buyer's actual Cardzip order. The applicable purchase agreement and mandatory legal rights govern if they differ from this draft.",
)
addSectionTitle('Buyer and order details', left, 203)
roundedBox(left, 218, contentWidth, 92, colors.pale, 8)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(9)
textColor(colors.ink)
pdf.text('Buyer / legal entity: __________________________________________________', left + 14, 244)
pdf.text('Purchase order / receipt reference: ______________________________________', left + 14, 267)
pdf.text('Purchased package:  [ ] Website template   [ ] Full template + backend', left + 14, 290)

addSectionTitle('Acknowledgement', left, 347)
let y = 371
y = addBullet("The buyer confirms that the package above matches the order receipt and understands that an ordinary template license does not transfer Cardzip's copyright or exclusive ownership.", left, y, contentWidth, { size: 9, leading: 13 })
y += 9
y = addBullet('The buyer has reviewed the scope, restrictions, third-party license notice, and draft terms, and will complete legal review and production configuration before launching a rental service.', left, y, contentWidth, { size: 9, leading: 13 })
y += 9
addBullet('The buyer understands that customer-facing rental terms and the privacy notice must be completed for the actual operator, territory, payment setup, insurance arrangements, and deployed vendors.', left, y, contentWidth, { size: 9, leading: 13 })

addSectionTitle('Cardzip company signature', left, 494)
pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
textColor(colors.ink)
pdf.text('For Cardzip Services Limited', left, 517)
pdf.addImage(signature, 'JPEG', left, 526, 132, 59)
stroke(colors.line)
pdf.setLineWidth(0.8)
pdf.line(left, 590, left + 158, 590)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8)
textColor(colors.muted)
pdf.text('Company signature', left, 604)
pdf.text('Date: ________________________', left + 214, 590)

pdf.setFont('helvetica', 'bold')
pdf.setFontSize(9)
textColor(colors.ink)
pdf.text('Buyer acceptance', left + 296, 517)
stroke(colors.line)
pdf.line(left + 296, 584, right, 584)
pdf.setFont('helvetica', 'normal')
pdf.setFontSize(8)
textColor(colors.muted)
pdf.text('Buyer signature', left + 296, 599)
pdf.text('Date: ________________________', left + 296, 621)
pdf.text('Print name: ____________________', left + 296, 643)

roundedBox(left, 677, contentWidth, 55, colors.warning, 8)
addParagraph(
  "Draft for Cardzip legal and business review before distribution. Confirm company signature-image approval, sales scope, governing law, privacy and rental terms. The effective purchase date must match the buyer's transaction record; this general PDF does not update automatically.",
  left + 12,
  698,
  contentWidth - 24,
  { size: 7.5, leading: 10, color: colors.ink },
)
addFooter(12)

const bytes = Buffer.from(pdf.output('arraybuffer'))
await Promise.all(outputs.map(async (output) => {
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, bytes)
}))
console.log(`Created Cardzip Car Renter buyer guide (${pdf.getNumberOfPages()} pages; ${bytes.length.toLocaleString()} bytes).`)
