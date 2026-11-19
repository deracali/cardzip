import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";


export const metadata: Metadata = {
  title: "PulseLive - Find your next favorite",
  description: "Discover live music, festivals, conferences, and unforgettable experiences with PulseLive.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1222",
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
