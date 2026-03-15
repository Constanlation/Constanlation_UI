import type { Metadata } from "next";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
