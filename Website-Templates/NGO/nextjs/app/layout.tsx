import type { Metadata, Viewport } from "next";
import "../src/App.css";

export const metadata: Metadata = {
  title: "Kindred | Give hope. Change lives.",
  description: "Support community-led clean water, education and healthcare projects with Kindred.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#079b6c",
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
