import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowEasy CSV Importer — AI-Powered CRM Data Import",
  description:
    "Upload any CSV file and let AI intelligently extract, map, and convert your lead data into GrowEasy CRM format. Supports Facebook Lead Exports, Google Ads, Excel sheets, and more.",
  keywords: "CSV importer, CRM, GrowEasy, AI, lead import, data mapping",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
