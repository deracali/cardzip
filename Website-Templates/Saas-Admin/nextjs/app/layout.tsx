import type { Metadata, Viewport } from "next";
import "../src/index.css";
import "../src/App.css";

export const metadata: Metadata = {
  title: {
    default: "Saasapp Admin Console",
    template: "%s | Saasapp Admin",
  },
  description:
    "Manage SaaS revenue, users, billing, analytics, and workspace activity.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1526",
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
