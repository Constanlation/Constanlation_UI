import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-next",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading-next",
});

export const metadata: Metadata = {
  title: {
    default: "Constantlation",
    template: "%s | Constantlation",
  },
  description:
    "Constantlation is a curated vault registry with governed strategies, visible guardian controls, transparent withdrawal queues, and cross-chain-ready product framing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, sora.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
