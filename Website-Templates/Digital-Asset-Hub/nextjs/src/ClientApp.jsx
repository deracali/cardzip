"use client";

import ClientConsole, { AccountAccess } from "../../digital-asset-hub/src/admin/ClientConsole.jsx";

const apiBaseUrl = process.env.NEXT_PUBLIC_DAH_API_URL || "http://localhost:5000/api";

export function ClientLoginApp() {
  return <AccountAccess apiBaseUrl={apiBaseUrl} />;
}

export function ClientSignupApp() {
  return <AccountAccess apiBaseUrl={apiBaseUrl} signup />;
}

export default function ClientDashboardApp() {
  return <ClientConsole apiBaseUrl={apiBaseUrl} />;
}