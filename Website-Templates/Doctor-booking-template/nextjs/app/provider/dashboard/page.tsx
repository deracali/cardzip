import type { Metadata } from "next";
import AppClient from "../../AppClient";

export const metadata: Metadata = { title: "Provider dashboard | Carewell" };

export default function ProviderDashboardPage() {
  return <AppClient />;
}