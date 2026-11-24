import type { Metadata } from "next";
import { SupportPage } from "../../src/PortalApp.jsx";

export const metadata: Metadata = { title: "Support | Digital Asset Hub" };

export default function Page() {
  return <SupportPage />;
}
