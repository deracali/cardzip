import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../src/index.css";
import "../src/App.css";

export const metadata: Metadata = {
  title: "VOLTIGO | Car Rental & Logistics",
  description: "Rent cars, SUVs and cargo vans with doorstep delivery from Voltigo.",
  icons: {
    icon: "/voltigo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
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
