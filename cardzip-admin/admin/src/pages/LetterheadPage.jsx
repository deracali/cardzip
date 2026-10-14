import { useRef, useState } from 'react'
import { Building2, Download, Eye, FileText, Mail, MapPin, PenLine, Phone, Printer, Stamp, X } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'

const STORAGE_KEY = 'cardzip-company-letterhead'
const LETTER_FONTS = {
  Inter: '"Inter", Arial, sans-serif',
  Lato: '"Lato", Arial, sans-serif',
  Merriweather: '"Merriweather", Georgia, serif',
  'Playfair Display': '"Playfair Display", Georgia, serif',
  'Source Sans 3': '"Source Sans 3", Arial, sans-serif',
}
const letterFontOptions = Object.keys(LETTER_FONTS).map((font) => ({ value: font, label: font }))
const alignmentOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'justify', label: 'Justified' },
]
const DEFAULT_DOCUMENT = {
  companyName: 'Cardzip',
  address: '',
  phone: '',
  email: '',
  headerNote: '',
  footerText: '',
  headerColor: '#059669',
  watermarkText: 'CARDZIP',
  stampText: 'OFFICIAL',
  stampColor: '#059669',
  signature: '',
  signatureTitle: '',
  body: '',
  bodyFont: 'Merriweather',
  bodyFontSize: 12,
  bodyAlignment: 'left',
  lineSpacing: 1.7,
  paragraphSpacing: 12,
  sectionGap: 24,
}

const loadDocument = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULT_DOCUMENT, ...JSON.parse(saved) } : DEFAULT_DOCUMENT
  } catch (error) {
    console.error('Could not load saved company letterhead:', error)
    return DEFAULT_DOCUMENT
  }
}

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]))

const safeColor = (value) => /^#[0-9a-f]{6}$/i.test(value) ? value : '#059669'
const safeFont = (value) => LETTER_FONTS[value] ? value : DEFAULT_DOCUMENT.bodyFont
const safeNumber = (value, min, max, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}
const safeAlignment = (value) => ['left', 'center', 'right', 'justify'].includes(value) ? value : 'left'
const bodyParagraphs = (value) => String(value || '').split(/\n\s*\n/).filter((paragraph) => paragraph.trim())
const getDocumentName = (document) => (document.companyName || 'company-letter')
  .trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'company-letter'
const getContactLine = (document) => [document.phone, document.email].filter(Boolean).join('  |  ')
const getToday = () => new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
const wrapPdfText = (value, maxCharacters = 92) => {
  const lines = []
  for (const paragraph of String(value || '').split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      if (!word) continue
      if (line && `${line} ${word}`.length <= maxCharacters) {
        line += ` ${word}`
      } else {
        if (line) lines.push(line)
        if (word.length <= maxCharacters) {
          line = word
        } else {
          for (let offset = 0; offset < word.length; offset += maxCharacters) {
            const part = word.slice(offset, offset + maxCharacters)
            if (offset + maxCharacters < word.length) lines.push(part)
            else line = part
          }
        }
      }
    }
    lines.push(line)
  }
  return lines
}

const pdfSafeText = (value) => String(value || '')
  .replace(/\u20a6/g, 'NGN ')
  .replace(/[^\x20-\x7e]/g, '?')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)')

const makeLetterHtml = (document) => {
  const name = escapeHtml(document.companyName || 'Company name')
  const address = escapeHtml(document.address).replace(/\n/g, '<br>')
  const contact = escapeHtml(getContactLine(document))
  const note = escapeHtml(document.headerNote)
  const footer = escapeHtml(document.footerText)
  const watermark = escapeHtml(document.watermarkText || document.companyName || 'CARDZIP')
  const bodyFontSize = safeNumber(document.bodyFontSize, 10, 18, DEFAULT_DOCUMENT.bodyFontSize)
  const bodyFont = LETTER_FONTS[safeFont(document.bodyFont)]
  const bodyAlignment = safeAlignment(document.bodyAlignment)
  const lineSpacing = safeNumber(document.lineSpacing, 1.3, 2.2, DEFAULT_DOCUMENT.lineSpacing)
  const paragraphSpacing = safeNumber(document.paragraphSpacing, 0, 32, DEFAULT_DOCUMENT.paragraphSpacing)
  const sectionGap = safeNumber(document.sectionGap, 0, 48, DEFAULT_DOCUMENT.sectionGap)
  const paragraphs = bodyParagraphs(document.body).map((paragraph) =>
    `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('')
  const signature = escapeHtml(document.signature)
  const signatureTitle = escapeHtml(document.signatureTitle)
  const stamp = escapeHtml(document.stampText)
  const headerColor = safeColor(document.headerColor)
  const stampColor = safeColor(document.stampColor)

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <title>${name} letter</title>
  <style>
    @page { size: A4; margin: 22mm 20mm 24mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #1f2937; font: 11pt/1.65 Arial, sans-serif; }
    body::before { content: "${watermark}"; position: fixed; top: 42%; left: 8%; color: #0f766e; font-size: 48pt; font-weight: 800; letter-spacing: .12em; opacity: .055; transform: rotate(-31deg); pointer-events: none; }
    .letterhead { border-bottom: 2px solid ${headerColor}; padding: 0 0 12px; margin-bottom: 24px; }
    .ornament { position: fixed; top: 0; right: 0; width: 45%; height: 42mm; color: ${headerColor}; opacity: .5; }
    .ornament-bottom { top: auto; right: auto; bottom: 0; left: 0; transform: rotate(180deg); }
    .company { color: ${headerColor}; font-size: 22pt; font-weight: 700; letter-spacing: .02em; }
    .address, .contact, .note { color: #475569; font-size: 9pt; }
    .letter-date { margin: 0 0 28px; text-align: right; color: #64748b; font-size: 9pt; }
    .body { min-height: 160mm; overflow-wrap: anywhere; font-family: ${bodyFont}; font-size: ${bodyFontSize}pt; line-height: ${lineSpacing}; text-align: ${bodyAlignment}; }
    .body p { margin: 0 0 ${paragraphSpacing}pt; }
    .stamp { float: right; margin: 18px 0 12px 16px; width: 34mm; height: 20mm; border: 1.5px solid ${stampColor}; border-radius: 50%; color: ${stampColor}; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9pt; font-weight: 700; transform: rotate(-10deg); }
    .signature-block { clear: both; margin-top: ${sectionGap}pt; }
    .signature { color: #0f172a; font: italic 20pt/1.2 Georgia, serif; min-height: 9mm; }
    .signature-title { color: #64748b; font-size: 9pt; }
    footer { position: fixed; bottom: -15mm; left: 0; right: 0; padding-top: 8px; border-top: 1px solid #dbe4ee; text-align: center; color: #64748b; font-size: 8pt; }
  </style>
</head>
<body>
  <svg class="ornament" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true"><path d="M40 0 C105 40 118 96 190 67 S290 21 360 64" fill="none" stroke="currentColor" stroke-width="2"/><path d="M120 0 C175 35 188 71 247 49 S320 24 360 40" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/></svg>
  <svg class="ornament ornament-bottom" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true"><path d="M40 0 C105 40 118 96 190 67 S290 21 360 64" fill="none" stroke="currentColor" stroke-width="2"/><path d="M120 0 C175 35 188 71 247 49 S320 24 360 40" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/></svg>
  <header class="letterhead">
    <div class="company">${name}</div>
    ${address ? `<div class="address">${address}</div>` : ''}
    ${contact ? `<div class="contact">${contact}</div>` : ''}
    ${note ? `<div class="note">${note}</div>` : ''}
  </header>
  <div class="letter-date">${getToday()}</div>
  <div class="body">${paragraphs}</div>
  ${signature || signatureTitle ? `<div class="signature-block"><div class="signature">${signature}</div>${signatureTitle ? `<div class="signature-title">${signatureTitle}</div>` : ''}</div>` : ''}
  ${stamp ? `<div class="stamp">${stamp}</div>` : ''}
  ${footer ? `<footer>${footer}</footer>` : ''}
</body>
</html>`
}

const downloadPdf = (document) => {
  const pageWidth = 595.28
  const pageHeight = 841.89
  const margin = 56
  const headerColor = safeColor(document.headerColor).slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255)
  const stampColor = safeColor(document.stampColor)
  const stampRgb = stampColor.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255)
  const bodyAlignment = safeAlignment(document.bodyAlignment)
  const lineSpacing = safeNumber(document.lineSpacing, 1.3, 2.2, DEFAULT_DOCUMENT.lineSpacing)
  const paragraphSpacing = safeNumber(document.paragraphSpacing, 0, 32, DEFAULT_DOCUMENT.paragraphSpacing) * 0.75
  const sectionGap = safeNumber(document.sectionGap, 0, 48, DEFAULT_DOCUMENT.sectionGap) * 0.75
  const bodyFont = ['Merriweather', 'Playfair Display'].includes(safeFont(document.bodyFont)) ? 'F3' : 'F1'
  const bodySize = safeNumber(document.bodyFontSize, 10, 18, DEFAULT_DOCUMENT.bodyFontSize)
  const lineAdvance = bodySize * lineSpacing
  const watermark = pdfSafeText(document.watermarkText || document.companyName || 'CARDZIP').toUpperCase()
  const pages = []
  let commands = []
  let y = margin
  const text = (content, x, top, size, font = 'F1', color = '0.122 0.161 0.216', alignment = 'left') => {
    const estimatedWidth = content.length * size * 0.5
    const alignedX = alignment === 'right' ? x - estimatedWidth : alignment === 'center' ? x - estimatedWidth / 2 : x
    const baseline = pageHeight - top - size
    commands.push(`BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${alignedX.toFixed(2)} ${baseline.toFixed(2)} Tm (${pdfSafeText(content)}) Tj ET`)
  }
  const drawHeader = () => {
    const headerRgb = headerColor.map((value) => value.toFixed(3)).join(' ')
    const muted = '0.278 0.333 0.412'
    let headerY = margin
    text(document.companyName || 'Company name', margin, headerY, 23, 'F1', headerRgb)
    headerY += 33
    for (const line of wrapPdfText(document.address, 90)) {
      text(line, margin, headerY, 9, 'F1', muted)
      headerY += 13
    }
    for (const line of wrapPdfText(getContactLine(document), 90)) {
      text(line, margin, headerY, 9, 'F1', muted)
      headerY += 13
    }
    for (const line of wrapPdfText(document.headerNote, 90)) {
      text(line, margin, headerY, 9, 'F1', muted)
      headerY += 13
    }
    const ruleY = pageHeight - headerY - 5
    commands.push(`${headerRgb} RG 1.5 w ${margin} ${ruleY.toFixed(2)} m ${pageWidth - margin} ${ruleY.toFixed(2)} l S`)
    commands.push(`${headerRgb} RG 1.2 w 360 790 m 405 765 450 800 526 768 c S`)
    commands.push(`${headerRgb} RG 0.6 w 390 812 m 435 785 478 814 540 790 c S`)
    return headerY + 16
  }
  const drawFooter = () => {
    if (!document.footerText) return
    const yFromTop = pageHeight - 48
    commands.push(`0.86 0.89 0.92 RG 0.6 w ${margin} ${(pageHeight - yFromTop).toFixed(2)} m ${pageWidth - margin} ${(pageHeight - yFromTop).toFixed(2)} l S`)
    text(document.footerText, margin, yFromTop + 8, 8, 'F1', '0.392 0.455 0.545')
  }
  const startPage = (firstPage = false) => {
    commands = []
    pages.push(commands)
    y = drawHeader()
    commands.push(`BT /F1 46 Tf 0.94 0.96 0.96 rg 0.866 0.5 -0.5 0.866 174 376 Tm (${watermark}) Tj ET`)
    if (firstPage) {
      text(getToday(), pageWidth - margin - 150, y + 7, 9, 'F1', '0.392 0.455 0.545')
      y += 29
    } else {
      y += 8
    }
  }
  const addPageIfNeeded = (height) => {
    if (y + height > pageHeight - margin - 18) {
      drawFooter()
      startPage()
    }
  }

  startPage(true)
  const paragraphs = bodyParagraphs(document.body)
  for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
    const maxCharacters = Math.max(30, Math.floor(88 * 11 / bodySize))
    for (const line of wrapPdfText(paragraph, maxCharacters)) {
      addPageIfNeeded(lineAdvance)
      const textX = bodyAlignment === 'center' ? pageWidth / 2 : bodyAlignment === 'right' ? pageWidth - margin : margin
      text(line, textX, y, bodySize, bodyFont, '0.122 0.161 0.216', bodyAlignment)
      y += lineAdvance
    }
    if (paragraphIndex < paragraphs.length - 1) y += paragraphSpacing
  }
  if (document.signature || document.signatureTitle) {
    addPageIfNeeded(sectionGap + 52)
    y += sectionGap
    if (document.signature) {
      text(document.signature, margin, y, 21, 'F2', '0.059 0.090 0.165')
      y += 28
    }
    if (document.signatureTitle) text(document.signatureTitle, margin, y, 9, 'F1', '0.392 0.455 0.545')
    y += 20
  }
  if (document.stampText) {
    addPageIfNeeded(60)
    const centerX = pageWidth - margin - 48
    const centerY = pageHeight - y - 25
    const stampRgbString = stampRgb.map((value) => value.toFixed(3)).join(' ')
    commands.push(`${stampRgbString} RG 1.2 w ${centerX - 39} ${centerY} m ${centerX - 39} ${centerY + 10.77} ${centerX - 21.54} ${centerY + 19.5} ${centerX} ${centerY + 19.5} c ${centerX + 21.54} ${centerY + 19.5} ${centerX + 39} ${centerY + 10.77} ${centerX + 39} ${centerY} c ${centerX + 39} ${centerY - 10.77} ${centerX + 21.54} ${centerY - 19.5} ${centerX} ${centerY - 19.5} c ${centerX - 21.54} ${centerY - 19.5} ${centerX - 39} ${centerY - 10.77} ${centerX - 39} ${centerY} c S`)
    text(document.stampText, centerX - 36, y + 13, 9, 'F1', stampRgbString)
  }
  drawFooter()

  const objects = []
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  const pageObjectIds = pages.map((_, index) => 6 + index * 2)
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>'
  objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>'
  pages.forEach((pageCommands, index) => {
    const pageId = pageObjectIds[index]
    const streamId = pageId + 1
    const stream = pageCommands.join('\n')
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${streamId} 0 R >>`
    objects[streamId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  })
  let pdfContents = '%PDF-1.4\n'
  const offsets = [0]
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdfContents.length
    pdfContents += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }
  const crossReferenceOffset = pdfContents.length
  pdfContents += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let id = 1; id < objects.length; id += 1) {
    pdfContents += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  }
  pdfContents += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`
  const blob = new Blob([pdfContents], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = `${getDocumentName(document)}-letter.pdf`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const downloadDocx = async (document) => {
  const { AlignmentType, BorderStyle, Document, Footer, Header, Packer, Paragraph, TextRun } = await import('docx')
  const headerColor = safeColor(document.headerColor).slice(1)
  const stampColor = safeColor(document.stampColor).slice(1)
  const bodyFont = safeFont(document.bodyFont)
  const bodyFontSize = safeNumber(document.bodyFontSize, 10, 18, DEFAULT_DOCUMENT.bodyFontSize)
  const bodyAlignment = safeAlignment(document.bodyAlignment)
  const alignment = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    justify: AlignmentType.JUSTIFIED,
  }[bodyAlignment]
  const lineSpacing = safeNumber(document.lineSpacing, 1.3, 2.2, DEFAULT_DOCUMENT.lineSpacing)
  const paragraphSpacing = safeNumber(document.paragraphSpacing, 0, 32, DEFAULT_DOCUMENT.paragraphSpacing)
  const sectionGap = safeNumber(document.sectionGap, 0, 48, DEFAULT_DOCUMENT.sectionGap)
  const header = new Header({
    children: [
      new Paragraph({
        border: { bottom: { color: headerColor, style: BorderStyle.SINGLE, size: 12, space: 7 } },
        children: [new TextRun({ text: document.companyName || 'Company name', bold: true, color: headerColor, size: 36 })],
      }),
      ...(document.address ? [new Paragraph({ children: [new TextRun({ text: document.address, color: '475569', size: 18 })] })] : []),
      ...(getContactLine(document) ? [new Paragraph({ children: [new TextRun({ text: getContactLine(document), color: '475569', size: 18 })] })] : []),
      ...(document.headerNote ? [new Paragraph({ children: [new TextRun({ text: document.headerNote, color: '475569', size: 18 })] })] : []),
    ],
  })
  const footer = new Footer({
    children: document.footerText
      ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: document.footerText, color: '64748B', size: 16 })] })]
      : [],
  })
  const letterBodyParagraphs = bodyParagraphs(document.body).map((paragraph) =>
    new Paragraph({
      alignment,
      spacing: { after: Math.round(paragraphSpacing * 15), line: Math.round(lineSpacing * 240) },
      children: [new TextRun({ text: paragraph, font: bodyFont, size: bodyFontSize * 2 })],
    }))
  const watermark = document.watermarkText || document.companyName || 'CARDZIP'
  const paragraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 700, after: 700 },
      children: [new TextRun({ text: watermark.toUpperCase(), bold: true, color: 'E7EFED', size: 44, characterSpacing: 120 })],
    }),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 400 }, children: [new TextRun({ text: getToday(), color: '64748B', size: 18 })] }),
    ...letterBodyParagraphs,
    ...(document.signature || document.signatureTitle ? [
      new Paragraph({ spacing: { before: Math.round(sectionGap * 15) }, children: [new TextRun({ text: document.signature || '', italics: true, font: 'Segoe Script', size: 30 })] }),
      ...(document.signatureTitle ? [new Paragraph({ children: [new TextRun({ text: document.signatureTitle, color: '64748B', size: 18 })] })] : []),
    ] : []),
    ...(document.stampText ? [new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 300 },
      children: [new TextRun({ text: `[ ${document.stampText} ]`, bold: true, color: stampColor, size: 18 })],
    })] : []),
  ]
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1000, right: 1134, bottom: 1134, left: 1134 } } },
      headers: { default: header },
      footers: { default: footer },
      children: paragraphs,
    }],
  })
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = `${getDocumentName(document)}-letter.docx`
  link.click()
  URL.revokeObjectURL(url)
}

function LetterPaper({ document, contactLine, preview = false }) {
  const accent = safeColor(document.headerColor)
  const watermark = document.watermarkText || document.companyName || 'CARDZIP'
  const fontFamily = LETTER_FONTS[safeFont(document.bodyFont)]
  const bodyFontSize = safeNumber(document.bodyFontSize, 10, 18, DEFAULT_DOCUMENT.bodyFontSize)
  const lineSpacing = safeNumber(document.lineSpacing, 1.3, 2.2, DEFAULT_DOCUMENT.lineSpacing)
  const paragraphSpacing = safeNumber(document.paragraphSpacing, 0, 32, DEFAULT_DOCUMENT.paragraphSpacing)
  const sectionGap = safeNumber(document.sectionGap, 0, 48, DEFAULT_DOCUMENT.sectionGap)
  const alignment = safeAlignment(document.bodyAlignment)
  return (
    <article
      className={`letterhead-paper${preview ? ' letterhead-preview-paper' : ''}`}
      aria-label="Letter preview"
      style={{ '--letterhead-accent': accent, '--letterhead-section-gap': `${sectionGap}px` }}
    >
      <svg className="letterhead-paper-ornament" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M40 0 C105 40 118 96 190 67 S290 21 360 64" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M120 0 C175 35 188 71 247 49 S320 24 360 40" fill="none" stroke="currentColor" strokeWidth="1" opacity=".55" />
      </svg>
      <svg className="letterhead-paper-ornament letterhead-paper-ornament-bottom" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M40 0 C105 40 118 96 190 67 S290 21 360 64" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M120 0 C175 35 188 71 247 49 S320 24 360 40" fill="none" stroke="currentColor" strokeWidth="1" opacity=".55" />
      </svg>
      <div className="letterhead-paper-watermark" aria-hidden="true">{watermark}</div>
      <div className="letterhead-paper-header">
        <strong style={{ color: accent }}>{document.companyName || 'Company name'}</strong>
        {document.address && <span>{document.address}</span>}
        {contactLine && <span>{contactLine}</span>}
        {document.headerNote && <span>{document.headerNote}</span>}
      </div>
      <div className="letterhead-paper-date">{getToday()}</div>
      <div className="letterhead-paper-body" style={{ fontFamily, fontSize: `${bodyFontSize}px`, lineHeight: lineSpacing, textAlign: alignment }}>
        {document.body
          ? bodyParagraphs(document.body).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 16)}`} style={{ marginBottom: `${paragraphSpacing}px` }}>{paragraph}</p>)
          : <span className="letterhead-paper-placeholder">Your letter body will appear here.</span>}
      </div>
      {(document.signature || document.signatureTitle) && (
        <div className="letterhead-paper-signature" style={{ marginTop: `${sectionGap}px` }}>
          {document.signature && <strong>{document.signature}</strong>}
          {document.signatureTitle && <span>{document.signatureTitle}</span>}
        </div>
      )}
      {document.stampText && <div className="letterhead-paper-stamp" style={{ color: safeColor(document.stampColor), borderColor: safeColor(document.stampColor) }}>{document.stampText}</div>}
      {document.footerText && <div className="letterhead-paper-footer">{document.footerText}</div>}
    </article>
  )
}

export default function LetterheadPage() {
  const [document, setDocument] = useState(loadDocument)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [exporting, setExporting] = useState('')
  const exportLock = useRef(false)
  const [error, setError] = useState('')

  const updateField = (field, value) => {
    const nextDocument = { ...document, [field]: value }
    setDocument(nextDocument)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDocument))
      setError('')
    } catch (storageError) {
      console.error('Could not save company letterhead locally:', storageError)
      setError('Changes could not be saved on this device. Check available browser storage.')
    }
  }
  const handlePdfDownload = () => {
    if (exportLock.current) return
    exportLock.current = true
    setExporting('pdf')
    try {
      setError('')
      downloadPdf(document)
    } catch (downloadError) {
      console.error('Could not create the company letter PDF:', downloadError)
      setError('Could not create the PDF. Please try again.')
    } finally {
      window.setTimeout(() => {
        exportLock.current = false
        setExporting('')
      }, 500)
    }
  }
  const handleDocxDownload = async () => {
    if (exportLock.current) return
    exportLock.current = true
    setExporting('docx')
    setError('')
    try {
      await downloadDocx(document)
    } catch (downloadError) {
      console.error('Could not create the company letter DOCX:', downloadError)
      setError('Could not create the Word document. Please try again.')
    } finally {
      exportLock.current = false
      setExporting('')
    }
  }
  const handlePrint = () => {
    if (exportLock.current) return
    exportLock.current = true
    setExporting('print')
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setError('Allow pop-ups for this site to open the print-ready letter.')
      exportLock.current = false
      setExporting('')
      return
    }
    setError('')
    printWindow.document.open()
    printWindow.document.write(makeLetterHtml(document))
    printWindow.document.close()
    window.setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      window.setTimeout(() => {
        exportLock.current = false
        setExporting('')
      }, 500)
    }, 250)
  }

  const contactLine = getContactLine(document)

  return (
    <div className="letterhead-page">
      <header className="page-header letterhead-page-header">
        <div>
          <span className="letterhead-kicker"><FileText size={14} /> DOCUMENT STUDIO</span>
          <h1 className="page-title">Company letterhead</h1>
          <p className="page-subtitle">Customize the company header, stamp, signature and footer. Your writing stays in the letter body.</p>
        </div>
        <div className="letterhead-actions">
          <button type="button" className="btn-secondary" onClick={() => setPreviewOpen(true)}><Eye size={16} /> Preview</button>
          <button type="button" className="btn-secondary" disabled={Boolean(exporting)} onClick={handlePrint}><Printer size={16} /> {exporting === 'print' ? 'Preparing…' : 'Print'}</button>
          <button type="button" className="btn-secondary" disabled={Boolean(exporting)} onClick={handlePdfDownload}><Download size={16} /> {exporting === 'pdf' ? 'Preparing…' : 'Download PDF'}</button>
          <button type="button" className="btn-primary" disabled={Boolean(exporting)} onClick={handleDocxDownload}>
            <Download size={16} /> {exporting ? 'Preparing…' : 'Download DOCX'}
          </button>
        </div>
      </header>

      {error && <div className="letterhead-alert" role="alert">{error}</div>}

      <div className="letterhead-layout">
        <div className="letterhead-editor-column">
          <section className="section-card letterhead-settings-card">
            <div className="letterhead-section-heading">
              <div className="letterhead-section-icon"><Building2 size={17} /></div>
              <div><h2>Letterhead details</h2><p>These details appear in the document header, not in your letter body.</p></div>
            </div>
            <div className="letterhead-fields-grid">
              <label className="letterhead-field letterhead-field-wide"><span>Company name</span><input value={document.companyName} onChange={(event) => updateField('companyName', event.target.value)} maxLength={100} /></label>
              <label className="letterhead-field letterhead-field-wide"><span><MapPin size={13} /> Company address</span><textarea value={document.address} onChange={(event) => updateField('address', event.target.value)} rows={2} maxLength={240} placeholder="Street, city, state, country" /></label>
              <label className="letterhead-field"><span><Phone size={13} /> Phone number</span><input type="tel" value={document.phone} onChange={(event) => updateField('phone', event.target.value)} maxLength={40} placeholder="+234 ..." /></label>
              <label className="letterhead-field"><span><Mail size={13} /> Company email</span><input type="email" value={document.email} onChange={(event) => updateField('email', event.target.value)} maxLength={120} placeholder="hello@company.com" /></label>
              <label className="letterhead-field"><span>Header note</span><input value={document.headerNote} onChange={(event) => updateField('headerNote', event.target.value)} maxLength={160} placeholder="Optional tagline or registration details" /></label>
              <label className="letterhead-field"><span>Header color</span><div className="letterhead-color-input"><input type="color" value={safeColor(document.headerColor)} onChange={(event) => updateField('headerColor', event.target.value)} /><span>{document.headerColor}</span></div></label>
              <label className="letterhead-field"><span>Watermark text</span><input value={document.watermarkText} onChange={(event) => updateField('watermarkText', event.target.value)} maxLength={40} placeholder="Company name or CONFIDENTIAL" /></label>
              <label className="letterhead-field letterhead-field-wide"><span>Footer text</span><input value={document.footerText} onChange={(event) => updateField('footerText', event.target.value)} maxLength={180} placeholder="Website, tagline or other footer information" /></label>
            </div>
          </section>

          <section className="section-card letterhead-body-card">
            <div className="letterhead-section-heading">
              <div className="letterhead-section-icon"><PenLine size={17} /></div>
              <div><h2>Letter body</h2><p>Type your letter here. Contact details are kept in the letterhead above.</p></div>
              <span className="letterhead-word-count">{document.body.length.toLocaleString()} characters</span>
            </div>
            <textarea
              className="letterhead-body-input"
              value={document.body}
              style={{
                fontFamily: LETTER_FONTS[safeFont(document.bodyFont)],
                fontSize: `${safeNumber(document.bodyFontSize, 10, 18, DEFAULT_DOCUMENT.bodyFontSize)}px`,
                lineHeight: safeNumber(document.lineSpacing, 1.3, 2.2, DEFAULT_DOCUMENT.lineSpacing),
                textAlign: safeAlignment(document.bodyAlignment),
              }}
              onChange={(event) => updateField('body', event.target.value)}
              maxLength={30000}
              placeholder={'Type the body of your letter here…\n\nYour company address, phone and email are added separately in the letterhead.'}
              aria-label="Letter body"
            />
            <div className="letterhead-fields-grid letterhead-typography-controls">
              <label className="letterhead-field"><span>Body font</span>
                <CustomSelect className="letterhead-font-select" ariaLabel="Letter body font" value={safeFont(document.bodyFont)} options={letterFontOptions} onChange={(font) => updateField('bodyFont', font)} />
              </label>
              <label className="letterhead-field"><span>Text alignment</span>
                <CustomSelect className="letterhead-font-select" ariaLabel="Letter body text alignment" value={safeAlignment(document.bodyAlignment)} options={alignmentOptions} onChange={(alignment) => updateField('bodyAlignment', alignment)} />
              </label>
              <label className="letterhead-field letterhead-range-field"><span>Font size <output>{safeNumber(document.bodyFontSize, 10, 18, DEFAULT_DOCUMENT.bodyFontSize)} px</output></span>
                <input className="letterhead-range-control" type="range" min="10" max="18" step="1" value={safeNumber(document.bodyFontSize, 10, 18, DEFAULT_DOCUMENT.bodyFontSize)} onChange={(event) => updateField('bodyFontSize', Number(event.target.value))} />
              </label>
              <label className="letterhead-field letterhead-range-field"><span>Line spacing <output>{safeNumber(document.lineSpacing, 1.3, 2.2, DEFAULT_DOCUMENT.lineSpacing).toFixed(1)}</output></span>
                <input className="letterhead-range-control" type="range" min="1.3" max="2.2" step="0.1" value={safeNumber(document.lineSpacing, 1.3, 2.2, DEFAULT_DOCUMENT.lineSpacing)} onChange={(event) => updateField('lineSpacing', Number(event.target.value))} />
              </label>
              <label className="letterhead-field letterhead-range-field"><span>Paragraph spacing <output>{safeNumber(document.paragraphSpacing, 0, 32, DEFAULT_DOCUMENT.paragraphSpacing)} px</output></span>
                <input className="letterhead-range-control" type="range" min="0" max="32" step="2" value={safeNumber(document.paragraphSpacing, 0, 32, DEFAULT_DOCUMENT.paragraphSpacing)} onChange={(event) => updateField('paragraphSpacing', Number(event.target.value))} />
              </label>
              <label className="letterhead-field letterhead-range-field"><span>Gap before signature <output>{safeNumber(document.sectionGap, 0, 48, DEFAULT_DOCUMENT.sectionGap)} px</output></span>
                <input className="letterhead-range-control" type="range" min="0" max="48" step="2" value={safeNumber(document.sectionGap, 0, 48, DEFAULT_DOCUMENT.sectionGap)} onChange={(event) => updateField('sectionGap', Number(event.target.value))} />
              </label>
            </div>
          </section>

          <section className="section-card letterhead-signature-card">
            <div className="letterhead-section-heading">
              <div className="letterhead-section-icon"><Stamp size={17} /></div>
              <div><h2>Signature and stamp</h2><p>Enter the signature text and customize the stamp shown on the letter.</p></div>
            </div>
            <div className="letterhead-fields-grid">
              <label className="letterhead-field"><span>Signature</span><input value={document.signature} onChange={(event) => updateField('signature', event.target.value)} maxLength={100} placeholder="Type a name or signature" /></label>
              <label className="letterhead-field"><span>Signature title</span><input value={document.signatureTitle} onChange={(event) => updateField('signatureTitle', event.target.value)} maxLength={100} placeholder="Director, Manager, etc." /></label>
              <label className="letterhead-field"><span>Stamp text</span><input value={document.stampText} onChange={(event) => updateField('stampText', event.target.value)} maxLength={36} placeholder="OFFICIAL" /></label>
              <label className="letterhead-field"><span>Stamp color</span><div className="letterhead-color-input"><input type="color" value={safeColor(document.stampColor)} onChange={(event) => updateField('stampColor', event.target.value)} /><span>{document.stampColor}</span></div></label>
            </div>
          </section>
        </div>

        <aside className="letterhead-live-panel">
          <div className="letterhead-live-heading"><div><strong>Live document</strong><span>Changes save automatically on this device</span></div><button type="button" onClick={() => setPreviewOpen(true)} aria-label="Open document preview"><Eye size={17} /></button></div>
          <LetterPaper document={document} contactLine={contactLine} />
          <div className="letterhead-autosave"><span /> Draft is saved automatically on this device</div>
        </aside>
      </div>

      {previewOpen && (
        <div className="letterhead-preview-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewOpen(false) }}>
          <section className="letterhead-preview-modal" role="dialog" aria-modal="true" aria-labelledby="letterhead-preview-title">
            <header><div><h2 id="letterhead-preview-title">Letter preview</h2><p>Review your letter before downloading or printing.</p></div><button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview"><X size={19} /></button></header>
            <div className="letterhead-preview-scroll" tabIndex="0" aria-label="Scrollable letter preview">
              <LetterPaper document={document} contactLine={contactLine} preview />
            </div>
            <footer>
              <button type="button" className="btn-secondary" onClick={() => setPreviewOpen(false)}>Close</button>
              <button type="button" className="btn-secondary" disabled={Boolean(exporting)} onClick={handlePrint}><Printer size={15} /> {exporting === 'print' ? 'Preparing…' : 'Print'}</button>
              <button type="button" className="btn-secondary" disabled={Boolean(exporting)} onClick={handlePdfDownload}><Download size={15} /> {exporting === 'pdf' ? 'Preparing…' : 'PDF'}</button>
              <button type="button" className="btn-primary" disabled={Boolean(exporting)} onClick={handleDocxDownload}><Download size={15} /> DOCX</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
