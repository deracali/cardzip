"use client";

import dynamic from "next/dynamic";

const SkilloraApp = dynamic(() => import("../../E-Learning/src/App.jsx"), {
  ssr: false,
});

export default function AppClient() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_SKILLORA_API_URL || "http://localhost:5300/api";
  return (
    <div className="min-h-screen">
      <SkilloraApp mode="api" apiBaseUrl={apiBaseUrl} />
    </div>
  );
}
