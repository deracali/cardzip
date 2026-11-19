import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">Pulse<span>Live</span></Link>
      <nav aria-label="Main navigation">
        <Link href="/events">Explore events</Link>
        <Link href="/schedule">Schedule</Link>
        <Link href="/host">Host an event</Link>
        <Link href="/dashboard">Your bookings</Link>
        <Link className="button button-primary" href="/login">Sign in</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand" href="/">Pulse<span>Live</span></Link>
      <p>Make room for a night worth remembering.</p>
      <nav><Link href="/events">Explore events</Link><Link href="/about">About</Link><Link href="/host">Host an event</Link></nav>
      <small>© 2027 PulseLive. Booking requests do not include payment or ticket issuance.</small>
    </footer>
  );
}
