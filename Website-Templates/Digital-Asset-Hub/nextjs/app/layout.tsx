import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../src/Portal.css";

export const metadata: Metadata = {
  title: "Digital Asset Hub | Digital money, made simple",
  description:
    "Exchange digital assets, pay bills, and manage virtual cards with Digital Asset Hub.",
  icons: {
    icon: "/digital-asset-hub-mark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080d16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
