import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../src/index.css";
import "../src/components/CreatorHub.css";

export const metadata: Metadata = {
  title: "CreatorHub — One link for your entire creator business",
  description:
    "Link-in-bio, newsletter, and digital products — all on one creatorhub.com. Free to start.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
