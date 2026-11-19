import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./native.css";

export const metadata: Metadata = {
  title: "Sizzle&Smile | Delicious food, delivered",
  description: "Order delicious food from neighborhood restaurants and get it delivered fresh with Sizzle&Smile.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf8",
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
