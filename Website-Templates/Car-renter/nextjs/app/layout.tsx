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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
