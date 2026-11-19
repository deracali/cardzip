import type { Metadata, Viewport } from "next";
import "../src/index.css";
import "../src/App.css";

export const metadata: Metadata = {
  title: "Remote.ly | Remote tech jobs & global talent",
  description: "Discover remote tech jobs, meet global talent, and build your next great team with Remote.ly.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#5146e5",
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
