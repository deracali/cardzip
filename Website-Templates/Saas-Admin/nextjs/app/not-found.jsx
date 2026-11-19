import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="brand-icon">S</span>
      <h1>Page not found</h1>
      <p>This page doesn&apos;t exist in your workspace.</p>
      <Link className="button button-primary" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
