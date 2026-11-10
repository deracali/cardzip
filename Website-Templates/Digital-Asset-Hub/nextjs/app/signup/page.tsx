import type { Metadata } from "next";
import { Auth } from "../../src/PortalApp.jsx";

export const metadata: Metadata = {
  title: "Create account | Digital Asset Hub",
};

export default function Page() {
  return <Auth signup />;
}
