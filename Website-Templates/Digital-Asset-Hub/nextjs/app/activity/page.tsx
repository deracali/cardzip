import type { Metadata } from "next";
import { ActivityPage } from "../../src/PortalApp.jsx";

export const metadata: Metadata = { title: "Activity history | Digital Asset Hub" };

export default function Page() {
  return <ActivityPage />;
}
