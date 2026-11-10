import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../src/index.css";
import "../src/App.css";

export const metadata: Metadata = {
  title: "Nexara AI | Workflow intelligence, on autopilot",
  description:
    "Connect your tools, build AI workflows, and automate your team's repetitive work with Nexara AI.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080b14",
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
