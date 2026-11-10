import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../src/index.css";
import "../src/App.css";

export const metadata: Metadata = {
  title: "NOVA Studio | Creative Agency for Ambitious Brands",
  description:
    "NOVA Studio is a full-stack creative agency building digital experiences, brands, and motion for ambitious creators and teams.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080d13",
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
