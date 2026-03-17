"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { queryClient, wagmiConfig } from "@/lib/wallet/reown";

type Web3ProvidersProps = {
  children: ReactNode;
};

export function Web3Providers({ children }: Web3ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
