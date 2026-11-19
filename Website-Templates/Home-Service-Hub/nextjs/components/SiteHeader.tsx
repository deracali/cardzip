import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">F</span>
        <span>FixFlow Pro<small>PLUMBING · HVAC · REPAIR</small></span>
      </Link>
      <nav aria-label="Main navigation">
        <a href="/#services">Services</a>
        <a href="/#estimate">Pricing</a>
        <Link href="/dashboard">Client portal</Link>
        <Link href="/admin/login">Admin</Link>
        <Link className="button button-orange" href="/book-now">Request service</Link>
      </nav>
    </header>
  );
}
