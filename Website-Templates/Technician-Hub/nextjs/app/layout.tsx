import type { Metadata, Viewport } from "next";
import "../src/index.css";
import "../src/App.css";
import "../src/Portal.css";

export const metadata: Metadata = {
  title: "PolarFlow HVAC | Comfort, on your terms.",
  description: "Schedule reliable heating and cooling service and manage your home comfort plan.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1729",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
