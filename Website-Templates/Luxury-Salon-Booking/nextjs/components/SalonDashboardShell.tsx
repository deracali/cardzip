"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clearSession, type SalonUser } from "../lib/salonApi";

type DashboardLink = { label: string; href: string; view: string };

export default function SalonDashboardShell({
  user,
  title,
  navigation,
  activeView,
  admin = false,
  children,
}: {
  user: SalonUser;
  title: string;
  navigation: DashboardLink[];
  activeView: string;
  admin?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  function signOut() {
    clearSession();
    router.replace("/");
  }

  const initials = user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className={`salon-dashboard${admin ? " salon-dashboard-admin" : ""}`}>
    <aside className="salon-dashboard-sidebar">
      <Link className="salon-brand" href="/"><span className="salon-brand-mark">L</span><span className="salon-brand-copy"><strong>Lumière</strong><small>SALON · SPA · WELLNESS</small></span></Link>
      <span className="salon-dashboard-label">{admin ? "STUDIO WORKSPACE" : "YOUR ACCOUNT"}</span>
      <nav className="salon-dashboard-nav" aria-label="Dashboard navigation">{navigation.map((item) => <Link className={activeView === item.view ? "is-active" : ""} href={item.href} key={item.view}>{item.label}</Link>)}</nav>
      {!admin && <Link className="salon-dashboard-book" href="/book">＋ Book an appointment</Link>}
      <div className="salon-dashboard-sidebar-bottom"><Link href="/">← Back to salon</Link><button type="button" onClick={signOut}>Sign out</button></div>
    </aside>
    <div className="salon-dashboard-main-wrap">
      <header className="salon-dashboard-topbar"><div><span className="salon-kicker">{admin ? "LUMIÈRE · ADMIN" : "LUMIÈRE · CLIENT"}</span><h1>{title}</h1></div><div className="salon-dashboard-user"><span>{initials}</span><div><strong>{user.name}</strong><small>{admin ? "Administrator" : "Client account"}</small></div></div></header>
      <main className="salon-dashboard-content">{children}</main>
    </div>
  </div>;
}
