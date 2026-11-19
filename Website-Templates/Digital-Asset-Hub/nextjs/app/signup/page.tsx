import type { Metadata } from "next";
import { ClientSignupApp } from "../../src/ClientApp.jsx";

export const metadata: Metadata = {
  title: "Create account | Digital Asset Hub",
};

export default function Page() {
  return <ClientSignupApp />;
}
