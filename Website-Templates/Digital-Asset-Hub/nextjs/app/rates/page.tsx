import type { Metadata } from "next";
import { Rates } from "../../src/PortalApp.jsx";

export const metadata: Metadata = {
  title: "Live exchange rates | Digital Asset Hub",
};

export default function Page() {
  return <Rates />;
}
