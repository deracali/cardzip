import type { Metadata } from "next";
import { Home } from "../src/PortalApp.jsx";

export const metadata: Metadata = {
  title: "Digital Asset Hub | Digital money, made simple",
};

export default function Page() {
  return <Home />;
}
