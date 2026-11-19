import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../../doctor-booking-template/src/index.css";
import "../../doctor-booking-template/src/App.css";

export const metadata: Metadata = {
  title: "Carewell | Find and book trusted doctors",
  description: "Find a trusted specialist and request a care appointment with Carewell.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f8f6",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
