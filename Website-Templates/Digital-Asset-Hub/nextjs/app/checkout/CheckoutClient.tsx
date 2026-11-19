"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Checkout = dynamic(
  () => import("../../src/PortalApp.jsx").then((module) => module.Checkout),
  { ssr: false },
);

export default function CheckoutClient() {
  const [authorized, setAuthorized] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_DAH_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    let active = true;
    fetch(`${apiBaseUrl}/auth/me`, { credentials: "include" })
      .then((response) => {
        if (response.ok) {
          if (active) setAuthorized(true);
          return;
        }
        const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.replace(`/login?next=${next}`);
      })
      .catch(() => {
        if (active) window.location.replace("/login?next=%2Fcheckout");
      });
    return () => { active = false; };
  }, [apiBaseUrl]);

  if (!authorized) return <div className="shell">Checking your account…</div>;
  return <Checkout />;
}
