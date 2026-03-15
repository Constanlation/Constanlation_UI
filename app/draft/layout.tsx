import type { Metadata } from "next";

import { SiteChrome } from "@/app/draft/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Constantlation",
    template: "%s | Constantlation",
  },
  description:
    "Constantlation — Curated vault registry, governed strategies, cross-chain ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
