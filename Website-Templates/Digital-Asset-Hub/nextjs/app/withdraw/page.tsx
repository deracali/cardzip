import type { Metadata } from "next";
import { WalletPage } from "../../src/PortalApp.jsx";

export const metadata: Metadata = { title: "Withdraw money | Digital Asset Hub" };

export default function Page() {
  return <WalletPage action="withdraw" />;
}
