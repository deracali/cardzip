import Link from "next/link";
import { Globe2 } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Link className="brand brand-inverse" href="/"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span><strong>Remote<span>.ly</span></strong></Link>
          <p>The global marketplace for remote tech jobs and world-class talent.</p>
          <span><Globe2 size={13} /> Built for work without borders.</span>
        </div>
        <div><strong>Job seekers</strong><Link href="/jobs">Find Jobs</Link><Link href="/signup?role=candidate">Create a profile</Link><Link href="/talent">Browse talent</Link></div>
        <div><strong>Employers</strong><Link href="/post-job">Post a job</Link><Link href="/pricing">Pricing plans</Link><Link href="/talent">Browse talent</Link></div>
        <div><strong>Company</strong><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/security">Security</Link></div>
        <div><strong>Legal</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>
      <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Remote.ly. All rights reserved.</span><span>Find great work. Hire great people.</span></div>
    </footer>
  );
}
