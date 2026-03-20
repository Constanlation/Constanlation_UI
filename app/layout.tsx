import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import Script from "next/script";

import { Web3Providers } from "@/components/providers/Web3Providers";
import { cn } from "@/lib/utils";
import "./globals.css";

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
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="font-sans antialiased">
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
