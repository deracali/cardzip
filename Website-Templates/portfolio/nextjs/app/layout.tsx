import type { Metadata, Viewport } from "next";
import "../src/App.css";

export const metadata: Metadata = {
  title: "CreatorHub — Maya Chen’s digital shop",
  description: "A creator storefront, portfolio, newsletter archive, and private creator dashboard.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#8852f6",
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
