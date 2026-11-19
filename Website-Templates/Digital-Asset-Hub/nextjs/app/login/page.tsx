import type { Metadata } from "next";
import { ClientLoginApp } from "../../src/ClientApp.jsx";

export const metadata: Metadata = {
  title: "Sign in | Digital Asset Hub",
};

export default function Page() {
  return <ClientLoginApp />;
}
