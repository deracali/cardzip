"use client";

import dynamic from "next/dynamic";

const TechnicianApp = dynamic(() => import("../TechnicianApp"), { ssr: false });

export default function TechnicianClient() {
  return <TechnicianApp />;
}
