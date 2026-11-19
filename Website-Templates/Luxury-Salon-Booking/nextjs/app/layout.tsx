import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./salon.css";
import "./account.css";
import "./native.css";

export const metadata: Metadata = {
  title: "Lumière Salon & Spa | Beauty, thoughtfully done",
  description: "Discover expert hair, skin and wellness rituals at Lumière Salon & Spa.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
