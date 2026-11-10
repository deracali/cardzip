import type { Metadata } from "next";
import { Api } from "../../src/PortalApp.jsx";

export const metadata: Metadata = {
  title: "Payments API | Digital Asset Hub",
};

export default function Page() {
  return <Api />;
}
