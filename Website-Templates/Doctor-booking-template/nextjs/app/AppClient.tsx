"use client";

import dynamic from "next/dynamic";

const CarewellApp = dynamic(() => import("../../doctor-booking-template/src/App.jsx"), {
  ssr: false,
});

export default function AppClient() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_CAREWELL_API_URL || "http://localhost:5200/api";
  return (
    <div className="min-h-screen">
      <CarewellApp mode="api" apiBaseUrl={apiBaseUrl} />
    </div>
  );
}
