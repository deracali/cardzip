"use client";

import AdminConsole from "../../digital-asset-hub/src/admin/AdminConsole.jsx";

const apiBaseUrl = process.env.NEXT_PUBLIC_DAH_API_URL || "http://localhost:5000/api";

export default function AdminApp() {
  return <AdminConsole mode="api" apiBaseUrl={apiBaseUrl} />;
}