import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { astar, mainnet, moonbeam, moonriver, paseoPassetHub, sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient } from "@tanstack/react-query";

const defaultPolkadotRpcUrl = "https://eth-rpc-testnet.polkadot.io/";
const polkadotTestnetExplorerUrl = "https://blockscout-testnet.polkadot.io/";

const parseRpcUrls = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const dedupeRpcUrls = (urls: string[]) => Array.from(new Set(urls));

const configuredPolkadotRpcUrls = parseRpcUrls(process.env.NEXT_PUBLIC_POLKADOT_TESTNET_RPC_URLS);
const baseDefaultRpcUrls = paseoPassetHub.rpcUrls.default.http;

const polkadotTestnetRpcUrls = dedupeRpcUrls([
  ...configuredPolkadotRpcUrls,
  defaultPolkadotRpcUrl,
  ...baseDefaultRpcUrls,
]);

const polkadotTestnet = {
  ...paseoPassetHub,
  id: 420420417,
  name: "Polkadot Hub TestNet",
  rpcUrls: {
    ...paseoPassetHub.rpcUrls,
    default: {
      http: polkadotTestnetRpcUrls,
    },
    public: {
      http: polkadotTestnetRpcUrls,
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: polkadotTestnetExplorerUrl,
    },
  },
};

const reownProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() ?? "";

export const hasReownProjectId = reownProjectId.length > 0;

export const reownNetworks = [mainnet, sepolia, moonbeam, moonriver, astar, polkadotTestnet];

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
    networks: reownNetworks as [typeof reownNetworks[number], ...typeof reownNetworks[number][]],
    defaultNetwork: polkadotTestnet,
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
