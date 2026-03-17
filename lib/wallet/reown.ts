import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { astar, mainnet, moonbeam, moonriver, paseoPassetHub, sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient } from "@tanstack/react-query";

const reownProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() ?? "";

export const hasReownProjectId = reownProjectId.length > 0;

export const reownNetworks = [mainnet, sepolia, moonbeam, moonriver, astar, paseoPassetHub] as const;

const fallbackProjectId = "REOWN_PROJECT_ID_MISSING";

export const wagmiAdapter = new WagmiAdapter({
  projectId: hasReownProjectId ? reownProjectId : fallbackProjectId,
  networks: reownNetworks,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
export const queryClient = new QueryClient();

declare global {
  var __constellationReownReady__: boolean | undefined;
}

if (hasReownProjectId && !globalThis.__constellationReownReady__) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: reownNetworks,
    projectId: reownProjectId,
    metadata: {
      name: "Constantlation",
      description: "Constantlation vault controls and on-chain strategy access",
      url: "https://constantlation.app",
      icons: ["https://constantlation.app/icon.png"],
    },
  });
  globalThis.__constellationReownReady__ = true;
} else if (!hasReownProjectId && typeof window !== "undefined") {
  console.warn(
    "NEXT_PUBLIC_REOWN_PROJECT_ID is missing. Wallet connect is disabled until this value is set.",
  );
}
