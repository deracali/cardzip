import { ArrowRight, ShieldCheck } from 'lucide-react'
import PageShell from '../components/PageShell'

export default function PaymentCallbackPage() {
  return (
    <PageShell>
      <main className="page-main payment-result">
        <section className="payment-result-card">
          <ShieldCheck size={30} />
          <span className="eyebrow payment-result-eyebrow">ESCAPES LOCAL DEMO</span>
          <h1>Payments are handled in the Next.js edition.</h1>
          <p>This Vite preview stores reservation requests in your browser and does not process or verify payments.</p>
          <div className="payment-result-actions">
            <a className="button button-primary" href="/client/dashboard">View my trips <ArrowRight size={15} /></a>
            <a className="outline-button" href="/stays">Browse stays</a>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
