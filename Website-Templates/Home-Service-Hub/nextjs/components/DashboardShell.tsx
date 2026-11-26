"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { type HomeRole, type HomeSession } from "../lib/homeServiceApi";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/requests", label: "Service requests" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];
const clientLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/requests", label: "My requests" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function DashboardShell({
  role,
  session,
  onSignOut,
  children,
}: {
  role: HomeRole;
  session: HomeSession | null;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const links = role === "admin" ? adminLinks : clientLinks;
  const pathname = usePathname();
  return (
    <main className={`workspace-shell workspace-${role}`}>
      <aside className="workspace-sidebar">
        <Link className="workspace-brand" href="/"><span className="brand-mark">F</span><span>FixFlow Pro<small>{role === "admin" ? "OPERATIONS" : "CLIENT PORTAL"}</small></span></Link>
        <span className="workspace-label">WORKSPACE</span>
        <nav aria-label={`${role} dashboard`}>
          {links.map((item) => <Link className={item.href === pathname ? "active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
        <div className="workspace-help"><strong>{role === "admin" ? "Operations workspace" : "Need service?"}</strong><p>{role === "admin" ? "Stay on top of incoming service requests and client updates." : "Book a trusted local professional whenever your home needs help."}</p>{role === "client" && <Link href="/book-now">Request service →</Link>}</div>
        <Link className="workspace-back" href="/">← Back to website</Link>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar"><span>{role === "admin" ? "Service operations" : "Your FixFlow account"}</span><div><span className="workspace-avatar">{session?.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("") || "F"}</span><strong>{session?.user.name || "FixFlow account"}</strong><button type="button" onClick={onSignOut}>Sign out</button></div></header>
        <section className="workspace-content">{children}</section>
      </div>
    </main>
  );
}
