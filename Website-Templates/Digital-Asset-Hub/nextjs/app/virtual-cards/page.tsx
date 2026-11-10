import type { Metadata } from "next";
import { Cards } from "../../src/PortalApp.jsx";

export const metadata: Metadata = {
  title: "Virtual cards | Digital Asset Hub",
};

export default function Page() {
  return <Cards />;
}
