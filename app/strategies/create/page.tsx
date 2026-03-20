"use client";

import Link from "next/link";
import { useState } from "react";
import { keccak256, toBytes } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { AppPageFrame, StatusPill } from "@/components/app/AppPrimitives";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { accessControlAbi, polkadotTestnetContractDefaults } from "@/lib/contracts/registry";
import { isValidEthereumAddress, toChecksumAddress } from "@/lib/utils";

type StatusTone = "info" | "success" | "error";

type PageStatus = {
  tone: StatusTone;
  message: string;
};

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;
const STRATEGIST_ROLE = keccak256(toBytes("STRATEGIST_ROLE"));

function statusClass(tone: StatusTone) {
  if (tone === "success") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (tone === "error") {
    return "border-red-500/40 bg-red-500/10 text-red-300";
  }
  return "border-sky-400/30 bg-sky-400/10 text-sky-200";
}

export default function StrategyCreationPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [governanceManager, setGovernanceManager] = useState(
    polkadotTestnetContractDefaults.governanceManager ?? "",
  );
  const [vaultAddress, setVaultAddress] = useState(
    polkadotTestnetContractDefaults.vault ?? "",
  );
  const [assetAddress, setAssetAddress] = useState(
    polkadotTestnetContractDefaults.asset ?? "",
  );
  const [deployedStrategyAddress, setDeployedStrategyAddress] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<PageStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isStrategist, setIsStrategist] = useState<boolean | null>(null);

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const normalizeAddress = (
    value: string,
    setValue: (next: string) => void,
    field: string,
    required: boolean,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) {
      if (required) {
        setError(field, "This field is required.");
      } else {
        clearError(field);
      }
      return false;
    }

    const checksummed = toChecksumAddress(trimmed);
    if (!checksummed) {
      setError(field, "Invalid address format.");
      return false;
    }

    setValue(checksummed);
    clearError(field);
    return true;
  };

  const checkAuthority = async () => {
    if (!isConnected || !address) {
      setStatus({ tone: "error", message: "Connect wallet first." });
      return;
    }

    const governanceValid = isValidEthereumAddress(governanceManager);
    const vaultValid = isValidEthereumAddress(vaultAddress);

    if (!governanceValid) {
      setError("governanceManager", "Valid governance manager address is required.");
    }
    if (!vaultValid) {
      setError("vaultAddress", "Valid vault address is required.");
    }

    if (!governanceValid || !vaultValid) {
      setStatus({ tone: "error", message: "Fix address errors before authority check." });
      return;
    }

    setStatus({ tone: "info", message: "Checking on-chain authority..." });

    if (!publicClient) {
      setStatus({ tone: "error", message: "No active public client. Check wallet network and try again." });
      return;
    }

    try {
      const [adminRoleResult, strategistRoleResult] = await Promise.all([
        publicClient.readContract({
          address: governanceManager as `0x${string}`,
          abi: accessControlAbi,
          functionName: "hasRole",
          args: [DEFAULT_ADMIN_ROLE, address],
        }),
        publicClient.readContract({
          address: vaultAddress as `0x${string}`,
          abi: accessControlAbi,
          functionName: "hasRole",
          args: [STRATEGIST_ROLE, address],
        }),
      ]);

      const admin = Boolean(adminRoleResult);
      const strategist = Boolean(strategistRoleResult);

      setIsAdmin(admin);
      setIsStrategist(strategist);

      if (admin || strategist) {
        setStatus({
          tone: "success",
          message: "Authority confirmed. You can operate strategy creation in this UI.",
        });
      } else {
        setStatus({
          tone: "error",
          message:
            "Unauthorized in UI policy. Wallet must be Governance Admin or Strategist for the selected contracts.",
        });
      }
    } catch {
      setIsAdmin(null);
      setIsStrategist(null);
      setStatus({ tone: "error", message: "Authority check failed. Verify addresses and network." });
    }
  };

  const submitStrategyRecord = () => {
    const governanceOk = normalizeAddress(governanceManager, setGovernanceManager, "governanceManager", true);
    const vaultOk = normalizeAddress(vaultAddress, setVaultAddress, "vaultAddress", true);
    const assetOk = normalizeAddress(assetAddress, setAssetAddress, "assetAddress", true);
    const strategyOk = normalizeAddress(
      deployedStrategyAddress,
      setDeployedStrategyAddress,
      "deployedStrategyAddress",
      true,
    );

    if (!governanceOk || !vaultOk || !assetOk || !strategyOk) {
      setStatus({ tone: "error", message: "Resolve highlighted errors before saving strategy details." });
      return;
    }

    if (!isAdmin && !isStrategist) {
      setStatus({
        tone: "error",
        message: "Run authority check and use an authorized wallet before recording strategy details.",
      });
      return;
    }

    setStatus({
      tone: "success",
      message: "Strategy details recorded. Continue to registration and governance approval steps.",
    });
  };

  return (
    <AppPageFrame
      title="Strategy Creation"
      subtitle="Create strategy instances independently from vault registration, then use the deployed address for governance approval and automation config."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
        <Link href="/vaults" className="hover:text-white">
          Vaults
        </Link>
        <span>/</span>
        <span className="text-slate-200">Strategies</span>
        <span>/</span>
        <span className="text-slate-200">Create</span>
      </div>

      <section className="g-glass p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill text="Policy: Governance Admin OR Strategist" tone="warn" />
          <StatusPill text="Strategy Type: MockYieldStrategy" tone="neutral" />
        </div>

        <p className="mt-4 text-sm text-slate-300">
          Protocol note: strategy deployment is currently permissionless on-chain. This UI enforces operational policy
          so only governance admin or strategist wallets can proceed here.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Governance Manager Address</span>
            <input
              type="text"
              placeholder="0x..."
              value={governanceManager}
              onChange={(event) => {
                setGovernanceManager(event.target.value);
                clearError("governanceManager");
              }}
              onBlur={() => normalizeAddress(governanceManager, setGovernanceManager, "governanceManager", true)}
              className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                errors.governanceManager ? "border-red-500/90 focus:border-red-500" : "border-white/15 focus:border-accent"
              }`}
            />
            {errors.governanceManager ? <p className="text-xs text-red-500">{errors.governanceManager}</p> : null}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Vault Address</span>
            <input
              type="text"
              placeholder="0x..."
              value={vaultAddress}
              onChange={(event) => {
                setVaultAddress(event.target.value);
                clearError("vaultAddress");
              }}
              onBlur={() => normalizeAddress(vaultAddress, setVaultAddress, "vaultAddress", true)}
              className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                errors.vaultAddress ? "border-red-500/90 focus:border-red-500" : "border-white/15 focus:border-accent"
              }`}
            />
            {errors.vaultAddress ? <p className="text-xs text-red-500">{errors.vaultAddress}</p> : null}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Asset Address</span>
            <input
              type="text"
              placeholder="0x..."
              value={assetAddress}
              onChange={(event) => {
                setAssetAddress(event.target.value);
                clearError("assetAddress");
              }}
              onBlur={() => normalizeAddress(assetAddress, setAssetAddress, "assetAddress", true)}
              className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                errors.assetAddress ? "border-red-500/90 focus:border-red-500" : "border-white/15 focus:border-accent"
              }`}
            />
            {errors.assetAddress ? <p className="text-xs text-red-500">{errors.assetAddress}</p> : null}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Deployed Strategy Address</span>
            <input
              type="text"
              placeholder="0x..."
              value={deployedStrategyAddress}
              onChange={(event) => {
                setDeployedStrategyAddress(event.target.value);
                clearError("deployedStrategyAddress");
              }}
              onBlur={() =>
                normalizeAddress(
                  deployedStrategyAddress,
                  setDeployedStrategyAddress,
                  "deployedStrategyAddress",
                  true,
                )
              }
              className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 ${
                errors.deployedStrategyAddress
                  ? "border-red-500/90 focus:border-red-500"
                  : "border-white/15 focus:border-accent"
              }`}
            />
            {errors.deployedStrategyAddress ? (
              <p className="text-xs text-red-500">{errors.deployedStrategyAddress}</p>
            ) : null}
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={checkAuthority}
            className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
          >
            Check Authority
          </button>
          <button
            type="button"
            onClick={submitStrategyRecord}
            className="rounded-full border border-accent bg-accent px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] g-on-accent transition duration-300 hover:border-[rgba(255,246,75,0.7)] hover:bg-[rgba(255,246,75,0.9)]"
          >
            Save Strategy Details
          </button>
        </div>

        {status ? <div className={`mt-4 rounded-xl border px-3 py-2 text-xs ${statusClass(status.tone)}`}>{status.message}</div> : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            Governance Admin role: {isAdmin === null ? "Unknown" : isAdmin ? "Yes" : "No"}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            Strategist role on vault: {isStrategist === null ? "Unknown" : isStrategist ? "Yes" : "No"}
          </div>
        </div>

        {!isConnected ? <ConnectWalletButton actionLabel="Create Strategy" className="mt-5" /> : null}

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          Next step after deployment: go to{" "}
          <Link href="/vaults/register" className="font-semibold text-accent hover:underline">
            /vaults/register
          </Link>
          {" "}
          and use the deployed strategy address in approval/config steps.
        </div>
      </section>
    </AppPageFrame>
  );
}
