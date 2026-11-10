import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Secure checkout | Digital Asset Hub",
};

export default function Page() {
  return <CheckoutClient />;
}
