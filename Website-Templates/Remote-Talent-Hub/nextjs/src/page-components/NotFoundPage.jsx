import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageShell from "../components/PageShell";

export default function NotFoundPage() {
  return <PageShell><main className="wrap empty-card not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>Looks like this opportunity moved.</h1><p>Head back to the marketplace to find your next remote role.</p><Link className="button button-purple" href="/">Explore remote jobs <ArrowRight size={14} /></Link></main></PageShell>;
}
