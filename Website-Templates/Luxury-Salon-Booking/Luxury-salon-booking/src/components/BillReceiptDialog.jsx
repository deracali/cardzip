import { CheckCircle2, Clock3, Download, Printer, X } from 'lucide-react'
import { useState } from 'react'
import { addCardzipLogo } from '../utils/receiptPdf'

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString('en-NG')}`
const formatBillDate = (date) => date ? new Date(date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

export default function BillReceiptDialog({ bill, status, message, onClose }) {
  const [downloadError, setDownloadError] = useState('')
  if (!bill) return null

  const succeeded = status === 'success' || status === 'completed'
  const pending = status === 'pending' || status === 'processing'
  const resultStatus = succeeded ? 'successful' : pending ? 'processing' : 'failed'
  const failureReason = bill.failureReason || message || ''
  const close = onClose || (() => {})

  const handleDownload = async () => {
    setDownloadError('')
    let jsPDF
    try {
      ({ jsPDF } = await import('jspdf'))
    } catch (error) {
      console.error('Bill receipt PDF could not be loaded:', error)
      setDownloadError('Could not prepare the PDF receipt. Please try again.')
      return
    }

    const rows = [
      ['Reference', bill.reference],
      ['Provider reference', bill.providerReference],
      ['Service', `${bill.category || 'Bill'} - ${bill.serviceName || ''}`],
      ['Account', bill.billersCode],
      ['Customer', bill.customerName],
      ['Address', bill.customerAddress],
      ['Package', bill.packageName],
      ['Phone', bill.phone],
      ['Payment method', bill.paymentMethod],
      ['Quantity', Number(bill.quantity) > 1 ? bill.quantity : ''],
      ['Amount', `NGN ${Number(bill.amount || 0).toLocaleString('en-NG')}`],
      ['Electricity token', bill.token],
      ['Date', formatBillDate(bill.createdAt)],
      ['Status', String(bill.status || resultStatus).toUpperCase()],
      ['Reason', !succeeded && !pending ? failureReason : ''],
    ].filter(([, value]) => value)

    const document = new jsPDF({ unit: 'mm', format: 'a4' })
    const left = 20
    const right = 190
    let y = 24
    try {
      await addCardzipLogo(document, left, y - 8)
    } catch (error) {
      console.error('Bill receipt logo could not be loaded:', error)
      setDownloadError('Could not load the Cardzip logo for this receipt. Please try again.')
      return
    }
    document.setFont('helvetica', 'bold')
    document.setFontSize(20)
    document.setTextColor(4, 120, 87)
    document.text('Cardzip', left + 15, y)
    document.setFontSize(9)
    document.setTextColor(100, 116, 139)
    document.text('PAYMENT RECEIPT', left + 15, y + 6)
    const statusColor = succeeded ? [4, 120, 87] : pending ? [180, 83, 9] : [185, 28, 28]
    document.setFont('helvetica', 'bold')
    document.setFontSize(10)
    document.setTextColor(...statusColor)
    document.text(`PAYMENT ${resultStatus.toUpperCase()}`, right, y, { align: 'right' })
    y += 20
    document.setDrawColor(226, 232, 240)
    document.line(left, y, right, y)
    y += 12
    document.setFontSize(9)
    document.setTextColor(100, 116, 139)
    document.text(`${bill.category || 'Bill'} payment`.toUpperCase(), left, y)
    y += 8
    document.setFontSize(18)
    document.setTextColor(15, 23, 42)
    document.text(succeeded ? 'Payment complete' : pending ? 'Payment processing' : 'Payment failed', left, y)
    y += 14
    document.setFillColor(11, 17, 32)
    document.roundedRect(left, y, right - left, 24, 3, 3, 'F')
    document.setFontSize(9)
    document.setTextColor(148, 163, 184)
    document.text(succeeded ? 'Total paid' : 'Payment amount', left + 5, y + 8)
    document.setFont('helvetica', 'bold')
    document.setFontSize(17)
    document.setTextColor(52, 211, 153)
    document.text(`NGN ${Number(bill.amount || 0).toLocaleString('en-NG')}`, left + 5, y + 18)
    y += 34

    rows.forEach(([label, value]) => {
      const textLines = document.splitTextToSize(String(value), right - left - 62)
      const rowHeight = Math.max(9, textLines.length * 5 + 4)
      if (y + rowHeight > 275) {
        document.addPage()
        y = 20
      }
      document.setDrawColor(237, 241, 244)
      document.line(left, y + rowHeight, right, y + rowHeight)
      document.setFont('helvetica', 'normal')
      document.setFontSize(9)
      document.setTextColor(100, 116, 139)
      document.text(String(label), left + 2, y + 6)
      document.setFont('helvetica', 'bold')
      document.setTextColor(15, 23, 42)
      document.text(textLines, right - 2, y + 6, { align: 'right' })
      y += rowHeight
    })

    document.setFont('helvetica', 'normal')
    document.setFontSize(8)
    document.setTextColor(100, 116, 139)
    document.text('Thank you for choosing Cardzip. Keep this receipt for your records.', 105, Math.min(y + 12, 285), { align: 'center' })
    const category = String(bill.category || 'bill').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bill'
    const reference = String(bill.reference || '').replace(/[^a-z0-9_-]/gi, '')
    document.save(`cardzip-${category}-payment${reference ? `-${reference}` : ''}.pdf`)
  }

  return (
    <div className="payment-choice-backdrop bill-result-backdrop">
      <section className="payment-choice-dialog bill-result-dialog" role="dialog" aria-modal="true" aria-labelledby="bill-receipt-title">
        <button type="button" className="bill-payment-close" aria-label="Close payment receipt" onClick={close}><X size={18} /></button>
        <div className={`bill-result-icon ${succeeded ? 'success' : pending ? 'pending' : 'failed'}`}>
          {succeeded ? <CheckCircle2 size={22} /> : pending ? <Clock3 size={22} /> : <X size={22} />}
        </div>
        <h2 id="bill-receipt-title">{succeeded ? 'Payment successful' : pending ? 'Payment processing' : 'Payment failed'}</h2>
        <p>{succeeded ? 'Your bill payment is complete. Keep this receipt for your records.' : failureReason || 'The bill payment could not be completed.'}</p>
        <article className={`bill-receipt-card ${succeeded ? 'success' : pending ? 'pending' : 'failed'}`}>
          <header className="bill-receipt-header">
            <div className="bill-receipt-brand">
              <img className="bill-receipt-mark" src="/cardzip-logo.jpg" alt="Cardzip logo" />
              <span><strong>Cardzip</strong><small>PAYMENT RECEIPT</small></span>
            </div>
            <span className="bill-receipt-status">{succeeded ? 'PAID' : pending ? 'PROCESSING' : 'FAILED'}</span>
          </header>
          <div className="bill-receipt-body">
            <p className="bill-receipt-eyebrow">{bill.category} · {bill.serviceName}</p>
            <div className="bill-receipt-total"><span>{succeeded ? 'Total paid' : 'Payment amount'}</span><strong>{formatNaira(bill.amount)}</strong></div>
            <div className="bill-receipt-details">
              <div><span>Reference</span><strong>{bill.reference || '—'}</strong></div>
              {bill.providerReference && <div><span>Provider reference</span><strong>{bill.providerReference}</strong></div>}
              <div><span>Account / recipient</span><strong>{bill.billersCode || '—'}</strong></div>
              {bill.customerName && <div><span>Customer</span><strong>{bill.customerName}</strong></div>}
              {bill.customerAddress && <div><span>Address</span><strong>{bill.customerAddress}</strong></div>}
              {bill.packageName && <div><span>Package</span><strong>{bill.packageName}</strong></div>}
              {bill.phone && <div><span>Delivery phone</span><strong>{bill.phone}</strong></div>}
              {Number(bill.quantity) > 1 && <div><span>Quantity</span><strong>{bill.quantity}</strong></div>}
              {succeeded && bill.token && <div className="bill-receipt-token"><span>Electricity token</span><strong>{bill.token}</strong></div>}
              {!succeeded && !pending && failureReason && <div className="bill-receipt-failure-reason"><span>Reason</span><strong>{failureReason}</strong></div>}
              <div><span>Payment method</span><strong>{bill.paymentMethod || '—'}</strong></div>
              <div><span>Status</span><strong>{String(bill.status || resultStatus).toUpperCase()}</strong></div>
              {bill.refundStatus && bill.refundStatus !== 'not_required' && <div><span>Refund</span><strong>{bill.refundStatus === 'pending' ? 'Refund requested' : bill.refundStatus === 'completed' ? 'Wallet refunded' : 'Contact support'}</strong></div>}
              <div><span>Date</span><strong>{formatBillDate(bill.createdAt)}</strong></div>
            </div>
            <p className="bill-receipt-footer">Thank you for choosing Cardzip. Keep this receipt for your records.</p>
          </div>
        </article>
        {downloadError && <p className="field-hint" role="alert">{downloadError}</p>}
        <div className="bill-result-actions">
          <button type="button" className="btn-copy-num" onClick={() => window.print()}><Printer size={15} /> Print receipt</button>
          <button type="button" className="btn-copy-num" onClick={handleDownload}><Download size={15} /> Download PDF</button>
        </div>
        <button type="button" className="btn-emerald-submit" onClick={close}>Close</button>
      </section>
    </div>
  )
}
