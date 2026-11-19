"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("../src/App"), { ssr: false });

export default function DashboardClient() {
  return <Dashboard />;
}
