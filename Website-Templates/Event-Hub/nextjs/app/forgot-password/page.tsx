import Link from "next/link";

export default function Page() {
  return <main className="auth-page"><section className="auth-card"><span className="brand">Pulse<span>Live</span></span><h1>Password help</h1><p>Password reset is not configured in this package. Contact the platform administrator to restore account access.</p><Link href="/login">Back to sign in</Link></section></main>;
}
