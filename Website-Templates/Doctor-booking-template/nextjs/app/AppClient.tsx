"use client";

import dynamic from "next/dynamic";

const LegacyApp = dynamic(() => import("../src/App.jsx"), {
  ssr: false,
});

export default function AppClient() {
  return (
    <div className="min-h-screen">
      <LegacyApp />
    </div>
  );
}
