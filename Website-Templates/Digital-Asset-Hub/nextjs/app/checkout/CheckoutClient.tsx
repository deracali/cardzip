"use client";

import dynamic from "next/dynamic";

const Checkout = dynamic(
  () => import("../../src/PortalApp.jsx").then((module) => module.Checkout),
  { ssr: false },
);

export default function CheckoutClient() {
  return <Checkout />;
}
