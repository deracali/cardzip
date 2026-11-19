import type { Metadata } from "next";
import ClientDashboardApp from "../../src/ClientApp.jsx";

export const metadata: Metadata = {
  title: "My account | Digital Asset Hub",
};

export default function DashboardPage() {
  return <ClientDashboardApp />;
}