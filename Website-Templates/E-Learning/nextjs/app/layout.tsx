import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../../E-Learning/src/index.css";
import "../../E-Learning/src/App.css";

export const metadata: Metadata = {
  title: "Skillora | Learn anything. Teach anything.",
  description: "Discover practical courses, learn at your own pace, and grow your skills with Skillora.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fb",
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
