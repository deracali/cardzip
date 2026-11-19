"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearMarketplaceSession, getMarketplaceSession, type MarketUser } from "../lib/marketplaceApi";

export default function MarketShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<MarketUser | null>(null);

  useEffect(() => {
    const refresh = () => setUser(getMarketplaceSession()?.user || null);
    refresh();
    window.addEventListener("markethub-session-change", refresh);
    return () => window.removeEventListener("markethub-session-change", refresh);
  }, []);

  const accountHref = user?.role === "admin" ? "/admin" : user?.role === "vendor" ? "/vendor/dashboard" : user ? "/dashboard" : "/login";
  const signOut = () => {
    clearMarketplaceSession();
    router.push("/");
  };

  return <div className="market-app">
    <div className="market-utility"><span>Thoughtful finds from independent shops</span><Link href="/vendor/dashboard">Seller studio</Link></div>
    <header className="market-header">
      <Link className="market-brand" href="/">Market<span>Hub</span></Link>
      <nav aria-label="Main navigation">
        <Link href="/products">Shop all</Link>
        <Link href="/signup?accountType=vendor">Open a shop</Link>
        <Link href="/dashboard">My orders</Link>
      </nav>
      <div className="market-header-actions">
        <Link className="market-account-link" href={accountHref}>{user ? user.name : "Sign in"}</Link>
        {user ? <button type="button" onClick={signOut}>Sign out</button> : <Link href="/signup">Create account</Link>}
        <Link href="/admin/login">Admin</Link>
      </div>
    </header>
    {children}
    <footer className="market-footer">
      <Link className="market-brand" href="/">Market<span>Hub</span></Link>
      <span>Independent shops, thoughtful finds. Order requests only; payments are not processed.</span>
      <Link href="/admin/login">Administrator sign in</Link>
    </footer>
  </div>;
}
