import type { Metadata, Viewport } from "next";
import "../src/index.css";
import "../src/App.css";

export const metadata: Metadata = {
  title: "Escapes | Extraordinary stays & travel experiences",
  description: "Discover handpicked stays, retreats and memorable travel experiences with Escapes.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
