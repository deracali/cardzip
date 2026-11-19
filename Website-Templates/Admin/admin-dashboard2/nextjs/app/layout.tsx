import type { Metadata } from "next";
import "../src/index.css";
import "../src/App.css";

export const metadata: Metadata = {
  title: "Cardzip Admin Dashboard 2",
  description: "Cardzip administration dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}