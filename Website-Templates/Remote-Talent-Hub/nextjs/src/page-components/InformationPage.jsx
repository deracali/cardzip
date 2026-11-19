import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageShell from "../components/PageShell";

const pages = {
  about: ["About Remote.ly", "A global marketplace for work without borders.", "We help people find meaningful remote work and help thoughtful teams find great talent wherever they are."],
  contact: ["Contact us", "We are here to help.", "Questions about a listing, hiring, or your profile? Contact your product administrator to connect a support service."],
  privacy: ["Privacy policy", "Your data belongs to you.", "Remote.ly uses account and application data to operate the marketplace. Configure your own privacy notice, retention period, and deletion process before production."],
  terms: ["Terms of service", "A marketplace built on trust.", "Job listings must describe genuine opportunities. Candidates control what they submit. Add your legal terms and jurisdiction-specific policies before launch."],
  security: ["Security", "Your trust matters.", "Use HTTPS, strong unique passwords, private server credentials, and a production CORS allowlist. Review database access and backups before launch."],
  "reset-password": ["Password support", "Password reset is not connected.", "Contact your administrator to recover access. Add an email delivery and token verification workflow before offering self-service password resets."],
};

export default function InformationPage({ slug }) {
  const page = pages[slug];
  if (!page) return null;
  return <PageShell><main className="wrap simple-page"><section className="info-panel"><span className="eyebrow">{page[0]}</span><h1>{page[1]}</h1><p>{page[2]}</p>{slug === "contact" && <p className="api-notice">The contact form service is not configured in this template.</p>}</section><Link className="text-link" href="/">Back to homepage <ArrowRight size={14} /></Link></main></PageShell>;
}
