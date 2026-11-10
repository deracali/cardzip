import type { Metadata } from "next";
import { Bills } from "../../src/PortalApp.jsx";

export const metadata: Metadata = {
  title: "Pay utility bills | Digital Asset Hub",
};

export default function Page() {
  return <Bills />;
}
