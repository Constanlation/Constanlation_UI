import { useEffect, useMemo, useState } from "react";
import { formatUnits, type PublicClient } from "viem";

import { paraVaultAbi } from "@/lib/contracts/registry";
import { isValidEthereumAddress } from "@/lib/utils";

const erc20DecimalsAbi = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

interface UseUserVaultPositionArgs {
  address?: `0x${string}`;
  vaultAddress?: string;
  publicClient?: PublicClient;
  refreshKey?: number;
}

interface UserVaultPosition {
  shares: bigint;
  assets: bigint;
  walletAssetBalance: bigint;
  sharesFormatted: number;
  assetsFormatted: number;
  walletAssetBalanceFormatted: number;
  shareDecimals: number;
  assetDecimals: number;
  isLoading: boolean;
  error: string | null;
  source: "onchain" | "estimate" | "none";
}

const ZERO_POSITION: Omit<UserVaultPosition, "isLoading" | "error" | "source"> = {
  shares: BigInt(0),
  assets: BigInt(0),
  walletAssetBalance: BigInt(0),
  sharesFormatted: 0,
  assetsFormatted: 0,
  walletAssetBalanceFormatted: 0,
  shareDecimals: 18,
  assetDecimals: 18,
};

export function useUserVaultPosition({
  address,
  vaultAddress,
  publicClient,
  refreshKey,
}: UseUserVaultPositionArgs): UserVaultPosition {
  const [position, setPosition] = useState(ZERO_POSITION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"onchain" | "estimate" | "none">("none");

  const canQuery = useMemo(() => {
    return Boolean(address && vaultAddress && publicClient && isValidEthereumAddress(vaultAddress));
  }, [address, publicClient, vaultAddress]);

  useEffect(() => {
    let cancelled = false;

    if (!canQuery || !address || !vaultAddress || !publicClient) {
      setPosition(ZERO_POSITION);
      setError(null);
      setSource("none");
      setIsLoading(false);
      return;
    }

    const readPosition = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [sharesRaw, shareDecimalsRaw, assetAddressRaw] = await Promise.all([
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: paraVaultAbi,
            functionName: "balanceOf",
            args: [address],
          }),
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: paraVaultAbi,
            functionName: "decimals",
            args: [],
          }),
          publicClient.readContract({
            address: vaultAddress as `0x${string}`,
            abi: paraVaultAbi,
            functionName: "asset",
            args: [],
          }),
        ]);

        const shares = sharesRaw as bigint;
        const shareDecimals = Number(shareDecimalsRaw);
        const assetAddress = assetAddressRaw as `0x${string}`;

        const [assetDecimalsRaw, walletAssetBalanceRaw] = await Promise.all([
          publicClient.readContract({
            address: assetAddress,
            abi: erc20DecimalsAbi,
            functionName: "decimals",
            args: [],
          }),
          publicClient.readContract({
            address: assetAddress,
            abi: erc20DecimalsAbi,
            functionName: "balanceOf",
            args: [address],
          }),
        ]);
        const assetDecimals = Number(assetDecimalsRaw);
        const walletAssetBalance = walletAssetBalanceRaw as bigint;

        if (shares === BigInt(0)) {
          if (cancelled) {
            return;
          }

          setPosition({
            shares,
            assets: BigInt(0),
            walletAssetBalance,
            sharesFormatted: 0,
            assetsFormatted: 0,
            walletAssetBalanceFormatted: Number(formatUnits(walletAssetBalance, assetDecimals)),
            shareDecimals,
            assetDecimals,
          });
          setSource("onchain");
          return;
        }

        const assetsRaw = await publicClient.readContract({
          address: vaultAddress as `0x${string}`,
          abi: paraVaultAbi,
          functionName: "convertToAssets",
          args: [shares],
        });
        const assets = assetsRaw as bigint;

        if (cancelled) {
          return;
        }

        setPosition({
          shares,
          assets,
          walletAssetBalance,
          sharesFormatted: Number(formatUnits(shares, shareDecimals)),
          assetsFormatted: Number(formatUnits(assets, assetDecimals)),
          walletAssetBalanceFormatted: Number(formatUnits(walletAssetBalance, assetDecimals)),
          shareDecimals,
          assetDecimals,
        });
        setSource("onchain");
      } catch (readError) {
        if (cancelled) {
          return;
        }

        setPosition(ZERO_POSITION);
        setSource("none");
        setError(readError instanceof Error ? readError.message : "Unable to read wallet position.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void readPosition();

    return () => {
      cancelled = true;
    };
  }, [address, canQuery, publicClient, refreshKey, vaultAddress]);

  return {
    ...position,
    isLoading,
    error,
    source,
  };
}
