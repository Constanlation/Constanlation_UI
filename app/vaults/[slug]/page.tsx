"use client";

import { ArrowRightLeft, Landmark, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { AppPageFrame, KpiStrip, StatusPill, VaultLocalSubnav } from "@/components/app/AppPrimitives";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { polkadotTestnetContractDefaults } from "@/lib/contracts/registry";
import { RoleSlug, resolveWalletRoles } from "@/lib/profile/roles";
import { formatUsd, isValidEthereumAddress } from "@/lib/utils";
import type {
  GovernanceProposal,
  GuardianControl,
  QueueEntry,
  VaultDetailData,
} from "@/lib/vaults/types";
import { useUserVaultPosition } from "@/lib/vaults/useUserVaultPosition";
import { normalizeWalletError } from "@/lib/wallet/error-display";
import {
  allocateToStrategy,
  claimWithdrawalById,
  depositAssets,
  executeKeeperAllocate,
  executeKeeperHarvest,
  executeKeeperRecall,
  executeKeeperSettleWithdrawals,
  harvestStrategy,
  panicVaultStrategy,
  pauseVault,
  recallAllFromStrategy,
  recallFromStrategyAssets,
  requestWithdrawAssets,
  setControllerAutomationPaused,
  unpauseVault,
  withdrawAssets,
  type VaultActionContext,
} from "@/lib/wallet/vault-actions";

type ActionTab = "deposit" | "withdraw";
type ActionStatus = { tone: "neutral" | "good" | "warn"; text: string; technicalText?: string };

function extractQueueId(value: string): bigint | null {
  const normalized = value.trim();
  if (/^\d+$/.test(normalized)) {
    return BigInt(normalized);
  }

  const digits = normalized.match(/\d+/g)?.join("") ?? "";
  if (!digits) {
    return null;
  }

  try {
    return BigInt(digits);
  } catch {
    return null;
  }
}

export default function VaultDetailPage() {
  const params = useParams<{ slug: string }>();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [tab, setTab] = useState<ActionTab>("deposit");
  const [withdrawMode, setWithdrawMode] = useState<"instant" | "queue">("instant");
  const [amount, setAmount] = useState("");
  const [claimingQueueId, setClaimingQueueId] = useState<string | null>(null);
  const [claimedQueueIds, setClaimedQueueIds] = useState<string[]>([]);
  const [actionStatus, setActionStatus] = useState<ActionStatus | null>(null);
  const [dbVaultState, setDbVaultState] = useState<{
    slug: string;
    vault: VaultDetailData;
    strategyNotes: Array<{ time: string; note: string }>;
    proposals: GovernanceProposal[];
    guardianControls: GuardianControl[];
    queue: QueueEntry[];
  } | null>(null);
  const [dbQueueState, setDbQueueState] = useState<{ slug: string; queue: QueueEntry[] } | null>(null);
  const [dbWarnings, setDbWarnings] = useState<{ slug: string; warnings: string[] } | null>(null);
  const [isVaultLoading, setIsVaultLoading] = useState(true);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [positionRefreshNonce, setPositionRefreshNonce] = useState(0);
  const [selectedRole, setSelectedRole] = useState<VaultActionRole | null>(null);
  const [roleStrategyAddress, setRoleStrategyAddress] = useState(polkadotTestnetContractDefaults.strategy ?? "");
  const [roleControllerAddress, setRoleControllerAddress] = useState(polkadotTestnetContractDefaults.controller ?? "");
  const [roleAmount, setRoleAmount] = useState("");
  const [roleSettleCount, setRoleSettleCount] = useState("5");
  const [roleActionStatus, setRoleActionStatus] = useState<ActionStatus | null>(null);

  const vault = dbVaultState && dbVaultState.slug === params.slug ? dbVaultState.vault : null;
  const strategyNotes =
    dbVaultState && dbVaultState.slug === params.slug
      ? dbVaultState.strategyNotes
      : [];
  const proposals =
    dbVaultState && dbVaultState.slug === params.slug
      ? dbVaultState.proposals
      : [];
  const guardianControls =
    dbVaultState && dbVaultState.slug === params.slug
      ? dbVaultState.guardianControls
      : [];
  const queue =
    dbVaultState && dbVaultState.slug === params.slug
      ? dbVaultState.queue
      : dbQueueState && dbQueueState.slug === params.slug
      ? dbQueueState.queue
      : [];
  const dbWarningsForSlug = dbWarnings && dbWarnings.slug === params.slug ? dbWarnings.warnings : [];
  const hasValidVaultAddress = Boolean(vault?.contractAddress && isValidEthereumAddress(vault.contractAddress));
  const expectedChainId = polkadotTestnetContractDefaults.chainId;
  const connectedChainId = publicClient?.chain?.id ?? null;
  const isChainMismatch = connectedChainId !== null && connectedChainId !== expectedChainId;
  const userVaultPosition = useUserVaultPosition({
    address,
    vaultAddress: vault?.contractAddress,
    publicClient,
    refreshKey: positionRefreshNonce,
  });
  const roleCandidates = resolveWalletRoles(address, isConnected).filter(isVaultActionRole);

  useEffect(() => {
    if (roleCandidates.length === 0) {
      setSelectedRole(null);
      return;
    }

    setSelectedRole((current) => {
      if (current && roleCandidates.includes(current)) {
        return current;
      }
      return roleCandidates[0] ?? null;
    });
  }, [roleCandidates]);

  useEffect(() => {
    let active = true;

    const loadVault = async () => {
      try {
        const response = await fetch(`/api/vaults/${params.slug}`, { cache: "no-store" });
        if (!response.ok) {
          if (active) {
            setVaultError("Unable to load vault details from indexed data.");
            setDbVaultState(null);
            setDbWarnings({ slug: params.slug, warnings: [] });
          }
          return;
        }

        const payload = (await response.json()) as {
          vault?: VaultDetailData | null;
          strategyNotes?: Array<{ time: string; note: string }>;
          proposals?: GovernanceProposal[];
          guardianControls?: GuardianControl[];
          queue?: QueueEntry[];
          warnings?: string[];
        };

        if (!active) {
          return;
        }

        setDbWarnings({ slug: params.slug, warnings: payload.warnings ?? [] });

        if (!payload.vault) {
          setVaultError("Vault not found in indexed data.");
          setDbVaultState(null);
          return;
        }

        setDbVaultState({
          slug: params.slug,
          vault: payload.vault,
          strategyNotes: payload.strategyNotes ?? [],
          proposals: payload.proposals ?? [],
          guardianControls: payload.guardianControls ?? [],
          queue: payload.queue ?? [],
        });
        setVaultError(null);
      } catch {
        if (active) {
          setVaultError("Unable to load vault details from indexed data.");
          setDbVaultState(null);
          setDbWarnings({ slug: params.slug, warnings: [] });
        }
      }
    };

    const loadQueue = async () => {
      try {
        const response = await fetch(`/api/vaults/${params.slug}/queue`, { cache: "no-store" });
        if (!response.ok) {
          if (active) {
            setDbQueueState(null);
          }
          return;
        }

        const payload = (await response.json()) as { queue?: QueueEntry[] };
        if (!active || !payload.queue) {
          return;
        }

        setDbQueueState({ slug: params.slug, queue: payload.queue });
      } catch {
        if (active) {
          setDbQueueState(null);
        }
      }
    };

    setIsVaultLoading(true);
    setVaultError(null);
    void Promise.allSettled([loadVault(), loadQueue()]).finally(() => {
      if (active) {
        setIsVaultLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [params.slug]);

  if (isVaultLoading) {
    return (
      <AppPageFrame title="Loading Vault" subtitle="Fetching indexed vault details.">
        <div className="g-glass p-6 text-slate-300">
          <p>Loading vault details...</p>
        </div>
      </AppPageFrame>
    );
  }

  if (vaultError) {
    return (
      <AppPageFrame title="Vault Unavailable" subtitle={vaultError}>
        <div className="g-glass p-6 text-slate-300">
          <p>Try the directory and pick another vault, then retry.</p>
          <Link href="/vaults" className="mt-3 inline-flex text-accent hover:underline">
            Back to vault directory
          </Link>
        </div>
      </AppPageFrame>
    );
  }

  if (!vault) {
    return (
      <AppPageFrame title="Vault Not Found" subtitle="This vault is unavailable in the current indexed dataset.">
        <div className="g-glass p-6 text-slate-300">
          <p>Try the directory and pick one of the available vaults.</p>
          <Link href="/vaults" className="mt-3 inline-flex text-accent hover:underline">
            Back to vault directory
          </Link>
        </div>
      </AppPageFrame>
    );
  }

  const numericAmount = Number(amount || "0");
  const estimatedDisplayValue =
    tab === "deposit"
      ? numericAmount * (vault.apyNow / 100)
      : withdrawMode === "instant"
      ? numericAmount
      : numericAmount * vault.sharePrice;
  const amountUnit = tab === "withdraw" && withdrawMode === "queue" ? vault.symbol : vault.asset;
  const maxAmount =
    tab === "deposit"
      ? userVaultPosition.walletAssetBalance
      : withdrawMode === "instant"
      ? userVaultPosition.assets
      : userVaultPosition.shares;
  const maxAmountDecimals =
    tab === "deposit" || withdrawMode === "instant"
      ? userVaultPosition.assetDecimals
      : userVaultPosition.shareDecimals;
  const maxAmountForInput = maxAmount ? trimTokenAmount(formatUnits(maxAmount, maxAmountDecimals)) : "0";

  const isClaimable = (status: string) => status === "Ready to Claim";

  const canWrite = Boolean(
    isConnected &&
      address &&
      publicClient &&
        hasValidVaultAddress &&
        !isChainMismatch,
  );

  const buildActionContext = (): VaultActionContext => {
    if (!address || !publicClient || !hasValidVaultAddress) {
      throw new Error("Wallet or vault address is not ready for transaction.");
    }
    if (publicClient.chain?.id !== expectedChainId) {
      throw new Error(`Wrong network. Switch wallet to chain ${expectedChainId}.`);
    }

    return {
      publicClient,
      writeContractAsync,
      userAddress: address,
      vaultAddress: vault.contractAddress as `0x${string}`,
    };
  };

  const ensureVaultContractCode = async (context: VaultActionContext) => {
    const bytecode = await context.publicClient.getCode({ address: context.vaultAddress });
    if (!bytecode || bytecode === "0x") {
      throw new Error("Vault contract not found on the connected network.");
    }
  };

  const validateAmount = () => {
    const normalized = amount.trim();
    if (!normalized) {
      throw new Error("Enter an amount greater than 0.");
    }

    if (userVaultPosition.isLoading || userVaultPosition.error || userVaultPosition.source !== "onchain") {
      return;
    }

    if (tab === "deposit") {
      const requestedAssets = parseUnits(normalized, userVaultPosition.assetDecimals);
      if (requestedAssets > userVaultPosition.walletAssetBalance) {
        throw new Error(`Amount exceeds your wallet ${vault.asset} balance.`);
      }
      return;
    }

    if (tab === "withdraw") {
      if (withdrawMode === "instant") {
        const requestedAssets = parseUnits(normalized, userVaultPosition.assetDecimals);
        if (requestedAssets > userVaultPosition.assets) {
          throw new Error("Amount exceeds your available underlying assets.");
        }
      } else {
        const requestedShares = parseUnits(normalized, userVaultPosition.shareDecimals);
        if (requestedShares > userVaultPosition.shares) {
          throw new Error("Amount exceeds your vault share balance.");
        }
      }
    }
  };

  const refreshVaultData = async () => {
    try {
      const [vaultResponse, queueResponse] = await Promise.all([
        fetch(`/api/vaults/${params.slug}`, { cache: "no-store" }),
        fetch(`/api/vaults/${params.slug}/queue`, { cache: "no-store" }),
      ]);

      if (vaultResponse.ok) {
        const payload = (await vaultResponse.json()) as {
          vault?: VaultDetailData | null;
          strategyNotes?: Array<{ time: string; note: string }>;
          proposals?: GovernanceProposal[];
          guardianControls?: GuardianControl[];
          queue?: QueueEntry[];
          warnings?: string[];
        };

        setDbWarnings({ slug: params.slug, warnings: payload.warnings ?? [] });

        if (payload.vault) {
          setDbVaultState({
            slug: params.slug,
            vault: payload.vault,
            strategyNotes: payload.strategyNotes ?? [],
            proposals: payload.proposals ?? [],
            guardianControls: payload.guardianControls ?? [],
            queue: payload.queue ?? [],
          });
        }
      }

      if (queueResponse.ok) {
        const payload = (await queueResponse.json()) as { queue?: QueueEntry[] };
        if (payload.queue) {
          setDbQueueState({ slug: params.slug, queue: payload.queue });
        }
      }
    } catch {
      // Ignore refresh failures and keep current data in view.
    }
  };

  const handlePrimaryAction = async () => {
    if (!canWrite) {
      setActionStatus({
        tone: "warn",
        text: isChainMismatch
          ? `Wrong network. Switch wallet to chain ${expectedChainId}.`
          : "Connect wallet and ensure vault contract address is valid.",
      });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setActionStatus({ tone: "warn", text: "Enter an amount greater than 0." });
      return;
    }

    try {
      setActionStatus({ tone: "neutral", text: "Submitting transaction..." });
      const context = buildActionContext();
      await ensureVaultContractCode(context);
      validateAmount();

      if (tab === "deposit") {
        const hash = await depositAssets(context, amount);
        setActionStatus({ tone: "good", text: `Deposit confirmed: ${formatTxHashShort(hash)}` });
      } else if (withdrawMode === "instant") {
        const hash = await withdrawAssets(context, amount);
        setActionStatus({ tone: "good", text: `Withdraw confirmed: ${formatTxHashShort(hash)}` });
      } else {
        const hash = await requestWithdrawAssets(context, amount);
        setActionStatus({ tone: "good", text: `Queued withdraw request confirmed: ${formatTxHashShort(hash)}` });
      }

      setAmount("");
      setPositionRefreshNonce((current) => current + 1);
      await refreshVaultData();
    } catch (error) {
      const normalized = normalizeWalletError(error);
      setActionStatus({
        tone: "warn",
        text: normalized.publicMessage,
        technicalText: normalized.technicalMessage,
      });
    }
  };

  const handleClaim = (queueId: string) => {
    if (!canWrite) {
      setActionStatus({
        tone: "warn",
        text: isChainMismatch
          ? `Wrong network. Switch wallet to chain ${expectedChainId}.`
          : "Connect wallet and ensure vault contract address is valid.",
      });
      return;
    }

    const parsedQueueId = extractQueueId(queueId);
    if (parsedQueueId === null) {
      setActionStatus({ tone: "warn", text: `Invalid queue id: ${queueId}` });
      return;
    }

    setClaimingQueueId(queueId);
    setActionStatus({ tone: "neutral", text: "Submitting claim transaction..." });
    void (async () => {
      try {
        const context = buildActionContext();
        await ensureVaultContractCode(context);
        const hash = await claimWithdrawalById(context, parsedQueueId);
        setClaimedQueueIds((current) => (current.includes(queueId) ? current : [...current, queueId]));
        const persistResponse = await fetch("/api/profile/depositor", {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            address,
            queueId,
            vaultKey: params.slug,
            status: "claimed",
          }),
        });

        if (!persistResponse.ok) {
          setActionStatus({
            tone: "warn",
            text: "Claim confirmed, but local DB sync failed. It will update after index sync.",
          });
        } else {
          setActionStatus({ tone: "good", text: `Claim confirmed: ${formatTxHashShort(hash)}` });
        }
        setPositionRefreshNonce((current) => current + 1);
        await refreshVaultData();
      } catch (error) {
        const normalized = normalizeWalletError(error);
        setActionStatus({
          tone: "warn",
          text: normalized.publicMessage,
          technicalText: normalized.technicalMessage,
        });
      } finally {
        setClaimingQueueId(null);
      }
    })();
  };

  const runRoleAction = async (
    label: string,
    action: (context: VaultActionContext) => Promise<`0x${string}`>,
  ) => {
    if (!canWrite) {
      setRoleActionStatus({
        tone: "warn",
        text: isChainMismatch
          ? `Wrong network. Switch wallet to chain ${expectedChainId}.`
          : "Connect wallet and ensure vault contract address is valid.",
      });
      return;
    }

    try {
      setRoleActionStatus({ tone: "neutral", text: `${label} transaction submitted...` });
      const context = buildActionContext();
      await ensureVaultContractCode(context);
      const hash = await action(context);
      setRoleActionStatus({ tone: "good", text: `${label} confirmed: ${formatTxHashShort(hash)}` });
      setPositionRefreshNonce((current) => current + 1);
      await refreshVaultData();
    } catch (error) {
      const normalized = normalizeWalletError(error);
      setRoleActionStatus({
        tone: "warn",
        text: normalized.publicMessage,
        technicalText: normalized.technicalMessage,
      });
    }
  };

  return (
    <AppPageFrame title={vault.name} subtitle={vault.description}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
        <Link href="/vaults" className="hover:text-white">
          Vaults
        </Link>
        <span>/</span>
        <span className="text-slate-200">{vault.symbol}</span>
      </div>

      <VaultLocalSubnav />

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <KpiStrip
            items={[
              { label: "Total Deposits", value: formatUsd(vault.tvl), tone: "accent" },
              { label: "Liquidity", value: formatUsd(vault.liquidityUsd) },
              { label: "Exposure", value: `${vault.exposurePct}%` },
              { label: "Net APY", value: `${vault.apyNow.toFixed(2)}%` },
            ]}
          />

          <section className="g-glass p-4 md:p-6" id="overview">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">APY Breakdown</p>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>Vault Net APY</span>
                    <strong className="text-emerald-300">{vault.apyNow.toFixed(2)}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Performance Fee</span>
                    <strong>{vault.performanceFeePct.toFixed(2)}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Share Price</span>
                    <strong>{vault.sharePrice.toFixed(6)}</strong>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Returns</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <ReturnStat label="Instant APY" value={`${vault.apyNow.toFixed(2)}%`} />
                  <ReturnStat label="7D APY" value={`${vault.apy7d.toFixed(2)}%`} />
                  <ReturnStat label="30D APY" value={`${vault.apy30d.toFixed(2)}%`} />
                  <ReturnStat label="90D APY" value={`${vault.apy90d.toFixed(2)}%`} />
                </div>
              </div>
            </div>
          </section>

          <div className="g-glass p-4 md:p-6" id="performance">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">Performance</h2>
              <StatusPill text={`${vault.riskScore}/5 Risk`} tone={vault.riskScore <= 2 ? "good" : "warn"} />
            </div>
            <div className="vault-chart mt-4">
              {vault.performance.map((point) => (
                <div key={point.label} className="vault-chart__column">
                  <div
                    className="vault-chart__bar"
                    style={{ height: `${Math.max(point.value, 0.8) * 10}px` }}
                    aria-label={`${point.label}: ${point.value.toFixed(2)}%`}
                  />
                  <span>{point.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="g-glass p-4 md:p-6" id="actions">
          <div className="mb-4 flex items-center gap-2 text-white">
            <ArrowRightLeft className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-bold">Vault Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            <button type="button" className={tabClass(tab === "deposit")} onClick={() => setTab("deposit")}>
              Deposit
            </button>
            <button type="button" className={tabClass(tab === "withdraw")} onClick={() => setTab("withdraw")}>
              Withdraw
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">Amount ({amountUnit})</label>
            {isConnected ? (
              <button
                type="button"
                onClick={() => setAmount(maxAmountForInput)}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent hover:opacity-90"
              >
                Max
              </button>
            ) : null}
          </div>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-accent"
          />

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            <p>{tab === "deposit" ? "Estimated annual return" : "Estimated unlock value"}</p>
            <p className="mt-1 text-xl font-bold text-accent">{amount ? `${estimatedDisplayValue.toFixed(4)} ${vault.asset}` : "-"}</p>
            {tab === "withdraw" && withdrawMode === "queue" ? (
              <p className="mt-1 text-xs text-slate-400">Queue mode input is in shares ({vault.symbol}).</p>
            ) : null}
          </div>

          {isConnected ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Your Position</p>
              {userVaultPosition.isLoading ? (
                <p className="mt-2 text-slate-300">Loading wallet balance...</p>
              ) : (
                <>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-slate-400">Shares</span>
                    <strong>{formatTokenAmount(userVaultPosition.sharesFormatted)} {vault.symbol}</strong>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-slate-400">Underlying</span>
                    <strong>{formatTokenAmount(userVaultPosition.assetsFormatted)} {vault.asset}</strong>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-slate-400">Wallet Balance</span>
                    <strong>{formatTokenAmount(userVaultPosition.walletAssetBalanceFormatted)} {vault.asset}</strong>
                  </div>
                  {tab === "withdraw" ? (
                    <p className="mt-2 text-xs text-slate-400">
                      Available to withdraw approx {formatTokenAmount(userVaultPosition.assetsFormatted)} {vault.asset} ({formatTokenAmount(userVaultPosition.sharesFormatted)} {vault.symbol}).
                    </p>
                  ) : null}
                  {userVaultPosition.error ? (
                    <p className="mt-2 text-xs text-amber-200/90">Unable to read live position right now. You can still submit transactions.</p>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          {!hasValidVaultAddress ? (
            <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
              <p className="text-xs font-semibold text-amber-100">
                Vault contract address is unavailable for this run. Transactions are disabled until a valid address is registered.
              </p>
              {dbWarningsForSlug.length ? (
                <p className="mt-1 text-[11px] text-amber-200/80">{dbWarningsForSlug.join(" ")}</p>
              ) : null}
            </div>
          ) : null}

          {isConnected && isChainMismatch ? (
            <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
              <p className="text-xs font-semibold text-amber-100">
                Wrong network detected. Connected chain {connectedChainId ?? "unknown"}, expected {expectedChainId}.
              </p>
            </div>
          ) : null}

          {tab === "withdraw" ? (
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                className={tabClass(withdrawMode === "instant")}
                onClick={() => setWithdrawMode("instant")}
              >
                Instant
              </button>
              <button
                type="button"
                className={tabClass(withdrawMode === "queue")}
                onClick={() => setWithdrawMode("queue")}
              >
                Queue
              </button>
            </div>
          ) : null}

          {!isConnected ? (
            <ConnectWalletButton
              actionLabel={tab === "deposit" ? "Deposit" : withdrawMode === "instant" ? "Withdraw" : "Redeem"}
            />
          ) : (
            <button
              type="button"
              onClick={() => void handlePrimaryAction()}
              disabled={!canWrite}
              className="mt-4 w-full rounded-full border border-accent bg-accent px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] g-on-accent transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {tab === "deposit" ? "Deposit" : withdrawMode === "instant" ? "Withdraw" : "Request Withdraw"}
            </button>
          )}

          {actionStatus ? (
            <div className="mt-3">
              {actionStatus.tone === "warn" ? (
                <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
                  <p className="text-xs font-semibold text-amber-100">{actionStatus.text}</p>
                  {actionStatus.technicalText ? (
                    <details className="mt-2 text-[11px] text-amber-200/80">
                      <summary className="cursor-pointer select-none uppercase tracking-[0.12em]">Details</summary>
                      <p className="mt-1 break-words">{actionStatus.technicalText}</p>
                    </details>
                  ) : null}
                </div>
              ) : (
                <StatusPill text={actionStatus.text} tone={actionStatus.tone} />
              )}
            </div>
          ) : null}

          {roleCandidates.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Role Operations</p>
              <p className="mt-1 text-xs text-slate-300">Run privileged actions for your connected role on this vault.</p>

              <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-slate-400">Role</label>
              <select
                value={selectedRole ?? ""}
                onChange={(event) => setSelectedRole(event.target.value as VaultActionRole)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
              >
                {roleCandidates.map((role) => (
                  <option key={role} value={role}>
                    {humanizeRoleLabel(role)}
                  </option>
                ))}
              </select>

              {(selectedRole === "strategist" || selectedRole === "guardian" || selectedRole === "keeper") ? (
                <>
                  <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-slate-400">Strategy Address</label>
                  <input
                    value={roleStrategyAddress}
                    onChange={(event) => setRoleStrategyAddress(event.target.value)}
                    placeholder="0x..."
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
                  />
                </>
              ) : null}

              {(selectedRole === "strategist" || selectedRole === "keeper") ? (
                <>
                  <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-slate-400">Amount (asset units)</label>
                  <input
                    value={roleAmount}
                    onChange={(event) => setRoleAmount(event.target.value)}
                    placeholder="0.0"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
                  />
                </>
              ) : null}

              {(selectedRole === "keeper" || selectedRole === "controller-admin") ? (
                <>
                  <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-slate-400">Controller Address</label>
                  <input
                    value={roleControllerAddress}
                    onChange={(event) => setRoleControllerAddress(event.target.value)}
                    placeholder="0x..."
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
                  />
                </>
              ) : null}

              {selectedRole === "strategist" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidEthereumAddress(roleStrategyAddress)) {
                        setRoleActionStatus({ tone: "warn", text: "Provide a valid strategy address." });
                        return;
                      }
                      void runRoleAction("Allocate", (context) =>
                        allocateToStrategy(context, roleStrategyAddress as `0x${string}`, roleAmount),
                      );
                    }}
                    className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
                  >
                    Allocate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidEthereumAddress(roleStrategyAddress)) {
                        setRoleActionStatus({ tone: "warn", text: "Provide a valid strategy address." });
                        return;
                      }
                      void runRoleAction("Recall", (context) =>
                        recallFromStrategyAssets(context, roleStrategyAddress as `0x${string}`, roleAmount),
                      );
                    }}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
                  >
                    Recall
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidEthereumAddress(roleStrategyAddress)) {
                        setRoleActionStatus({ tone: "warn", text: "Provide a valid strategy address." });
                        return;
                      }
                      void runRoleAction("Recall all", (context) =>
                        recallAllFromStrategy(context, roleStrategyAddress as `0x${string}`),
                      );
                    }}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
                  >
                    Recall All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidEthereumAddress(roleStrategyAddress)) {
                        setRoleActionStatus({ tone: "warn", text: "Provide a valid strategy address." });
                        return;
                      }
                      void runRoleAction("Harvest", (context) =>
                        harvestStrategy(context, roleStrategyAddress as `0x${string}`),
                      );
                    }}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
                  >
                    Harvest
                  </button>
                </div>
              ) : null}

              {selectedRole === "guardian" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void runRoleAction("Pause vault", (context) => pauseVault(context))}
                    className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-100"
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => void runRoleAction("Unpause vault", (context) => unpauseVault(context))}
                    className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100"
                  >
                    Unpause
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidEthereumAddress(roleStrategyAddress)) {
                        setRoleActionStatus({ tone: "warn", text: "Provide a valid strategy address." });
                        return;
                      }
                      void runRoleAction("Panic strategy", (context) =>
                        panicVaultStrategy(context, roleStrategyAddress as `0x${string}`),
                      );
                    }}
                    className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-300"
                  >
                    Panic Strategy
                  </button>
                </div>
              ) : null}

              {selectedRole === "keeper" ? (
                <>
                  <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-slate-400">Settle Max Count</label>
                  <input
                    value={roleSettleCount}
                    onChange={(event) => setRoleSettleCount(event.target.value)}
                    placeholder="5"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isValidEthereumAddress(roleControllerAddress) || !isValidEthereumAddress(roleStrategyAddress)) {
                          setRoleActionStatus({ tone: "warn", text: "Provide valid controller and strategy addresses." });
                          return;
                        }
                        void runRoleAction("Execute harvest", (context) =>
                          executeKeeperHarvest(
                            context,
                            roleControllerAddress as `0x${string}`,
                            roleStrategyAddress as `0x${string}`,
                          ),
                        );
                      }}
                      className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
                    >
                      Harvest
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isValidEthereumAddress(roleControllerAddress) || !isValidEthereumAddress(roleStrategyAddress)) {
                          setRoleActionStatus({ tone: "warn", text: "Provide valid controller and strategy addresses." });
                          return;
                        }
                        void runRoleAction("Execute allocate", (context) =>
                          executeKeeperAllocate(
                            context,
                            roleControllerAddress as `0x${string}`,
                            roleStrategyAddress as `0x${string}`,
                            roleAmount,
                          ),
                        );
                      }}
                      className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
                    >
                      Allocate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isValidEthereumAddress(roleControllerAddress) || !isValidEthereumAddress(roleStrategyAddress)) {
                          setRoleActionStatus({ tone: "warn", text: "Provide valid controller and strategy addresses." });
                          return;
                        }
                        void runRoleAction("Execute recall", (context) =>
                          executeKeeperRecall(
                            context,
                            roleControllerAddress as `0x${string}`,
                            roleStrategyAddress as `0x${string}`,
                            roleAmount,
                          ),
                        );
                      }}
                      className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
                    >
                      Recall
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isValidEthereumAddress(roleControllerAddress)) {
                          setRoleActionStatus({ tone: "warn", text: "Provide a valid controller address." });
                          return;
                        }
                        void runRoleAction("Settle withdrawals", (context) =>
                          executeKeeperSettleWithdrawals(
                            context,
                            roleControllerAddress as `0x${string}`,
                            Number(roleSettleCount),
                          ),
                        );
                      }}
                      className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
                    >
                      Settle
                    </button>
                  </div>
                </>
              ) : null}

              {selectedRole === "controller-admin" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidEthereumAddress(roleControllerAddress)) {
                        setRoleActionStatus({ tone: "warn", text: "Provide a valid controller address." });
                        return;
                      }
                      void runRoleAction("Pause automation", (context) =>
                        setControllerAutomationPaused(context, roleControllerAddress as `0x${string}`, true),
                      );
                    }}
                    className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-100"
                  >
                    Pause Automation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValidEthereumAddress(roleControllerAddress)) {
                        setRoleActionStatus({ tone: "warn", text: "Provide a valid controller address." });
                        return;
                      }
                      void runRoleAction("Resume automation", (context) =>
                        setControllerAutomationPaused(context, roleControllerAddress as `0x${string}`, false),
                      );
                    }}
                    className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100"
                  >
                    Resume Automation
                  </button>
                </div>
              ) : null}

              {(selectedRole === "governance-admin" || selectedRole === "vault-admin") ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
                  Advanced actions for this role are available in the dedicated workspace.
                  <Link href={`/profile/${selectedRole}`} className="ml-1 font-semibold text-accent hover:underline">
                    Open {humanizeRoleLabel(selectedRole)} workspace
                  </Link>
                  .
                </div>
              ) : null}

              {roleActionStatus ? (
                <div className="mt-3">
                  {roleActionStatus.tone === "warn" ? (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
                      <p className="text-xs font-semibold text-amber-100">{roleActionStatus.text}</p>
                      {roleActionStatus.technicalText ? (
                        <details className="mt-2 text-[11px] text-amber-200/80">
                          <summary className="cursor-pointer select-none uppercase tracking-[0.12em]">Details</summary>
                          <p className="mt-1 break-words">{roleActionStatus.technicalText}</p>
                        </details>
                      ) : null}
                    </div>
                  ) : (
                    <StatusPill text={roleActionStatus.text} tone={roleActionStatus.tone} />
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Guardian state: {vault.guardianState}
            </p>
            <p className="flex items-center gap-2">
              <Landmark className="h-3.5 w-3.5 text-accent" />
              Curator: {vault.curator}
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="g-glass p-4 md:p-6" id="strategies">
          <h3 className="text-lg font-bold text-white">Strategy Allocation</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="vault-table min-w-full">
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th>Allocation</th>
                  <th>Amount</th>
                  <th>APY</th>
                </tr>
              </thead>
              <tbody>
                {vault.allocations.map((allocation) => (
                  <tr key={allocation.strategy}>
                    <td>{allocation.strategy}</td>
                    <td>{allocation.allocationPct}%</td>
                    <td>{formatUsd(allocation.amountUsd)}</td>
                    <td className="text-emerald-300">{allocation.apy.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2">
            {strategyNotes.length ? (
              strategyNotes.map((note, index) => (
                <div key={`${note.time}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{note.time}</p>
                  <p className="mt-1">{note.note}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">No recent strategy notes.</p>
            )}
          </div>
        </section>

        <section className="g-glass p-4 md:p-6">
          <h3 className="text-lg font-bold text-white">Market Exposure</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="vault-table min-w-full">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Allocation</th>
                  <th>Amount</th>
                  <th>Supply Cap</th>
                  <th>APY</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {vault.exposureMarkets.map((market) => (
                  <tr key={market.market}>
                    <td>{market.market}</td>
                    <td>{market.vaultAllocationPct}%</td>
                    <td>{formatUsd(market.amountUsd)}</td>
                    <td>{formatUsd(market.supplyCapUsd)}</td>
                    <td className="text-emerald-300">{market.apy.toFixed(2)}%</td>
                    <td>{market.utilizationPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="g-glass p-4 md:p-6" id="risk">
          <h3 className="text-lg font-bold text-white">Risk Disclosure</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <MetaStat label="Curator TVL" value={formatUsd(vault.curatorTvl)} />
            <MetaStat label="Owner" value={vault.owner} />
            <MetaStat label="Guardian" value={vault.guardian} />
            <MetaStat label="Timelock" value={vault.timelockDuration} />
            <MetaStat label="Deployment Date" value={vault.deploymentDate} />
            <MetaStat label="Vault Version" value={vault.vaultVersion} />
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {vault.risks.map((risk) => (
              <li key={risk} className="rounded-xl border border-white/10 bg-white/5 p-3">
                {risk}
              </li>
            ))}
          </ul>
        </section>

        <section className="g-glass p-4 md:p-6" id="governance">
          <h3 className="text-lg font-bold text-white">Governance</h3>
          <div className="mt-4 space-y-3">
            {proposals.length ? (
              proposals.map((proposal) => (
                <div key={proposal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{proposal.id} · {proposal.title}</p>
                    <StatusPill text={proposal.status} tone={proposal.status === "Active" ? "warn" : "good"} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>{proposal.eta}</span>
                    <span>Participation: {proposal.participationPct}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">No proposals available.</p>
            )}
          </div>
        </section>

        <section className="g-glass p-4 md:p-6" id="guardian">
          <h3 className="text-lg font-bold text-white">Guardian Controls</h3>
          <div className="mt-4 grid gap-3">
            {guardianControls.length ? (
              guardianControls.map((control) => (
                <div key={control.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{control.label}</p>
                    <StatusPill
                      text={control.state}
                      tone={control.state === "Unpaused" || control.state === "Ready" ? "good" : "warn"}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Updated: {control.updatedAt}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">No guardian controls available.</p>
            )}
          </div>
        </section>
      </div>

      <section className="g-glass mt-4 p-4 md:p-6" id="activity">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        <div className="mt-4 space-y-2">
          {vault.activity.map((event, index) => (
            <div key={`${event.event}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <strong className="text-white">{event.event}</strong>
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{event.time}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{event.actor} • {event.tx}</p>
              <p className="mt-1 text-sm text-accent">{event.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="g-glass mt-4 p-4 md:p-6" id="queue">
        <h3 className="text-lg font-bold text-white">Withdrawal Queue</h3>
        <p className="mt-2 text-sm text-slate-300">
          Claim becomes available once your request is settled. Ready requests can be claimed directly from this table.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <MetaStat label="Queue Depth" value={`${vault.queueDepthHours}h`} />
          <MetaStat label="Open Requests" value={String(queue.length)} />
          <MetaStat label="Liquidity" value={formatUsd(vault.liquidityUsd)} />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="vault-table min-w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Request</th>
                <th>Position</th>
                <th>ETA</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{entry.requester}</td>
                  <td>{formatUsd(entry.requestUsd)}</td>
                  <td>#{entry.position}</td>
                  <td>{entry.eta}</td>
                  <td>
                    <StatusPill text={claimedQueueIds.includes(entry.id) ? "Claimed" : entry.status} tone={queueStatusTone(claimedQueueIds.includes(entry.id) ? "Claimed" : entry.status)} />
                  </td>
                  <td>
                    {claimedQueueIds.includes(entry.id) ? (
                      <span className="text-xs uppercase tracking-[0.14em] text-emerald-300">Claimed</span>
                    ) : isClaimable(entry.status) ? (
                      <button
                        type="button"
                        className="rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleClaim(entry.id)}
                        disabled={!isConnected || claimingQueueId === entry.id}
                      >
                        {claimingQueueId === entry.id ? "Claiming..." : "Claim"}
                      </button>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Waiting</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isConnected ? <ConnectWalletButton actionLabel="Claim" variant="compact" className="mt-4" /> : null}
      </section>

      <section className="g-glass mt-4 p-4 md:p-6" id="info">
        <h3 className="text-lg font-bold text-white">More Info</h3>
        <details className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300" open>
          <summary className="cursor-pointer font-semibold text-white">Vault Metadata</summary>
          <div className="mt-3 space-y-2">
            <p>Contract: {vault.contractAddress}</p>
            <p>Fee model: {vault.feeModel}</p>
            <p>Fee recipient: {vault.feeRecipient}</p>
            <p>Chain: {vault.chain}</p>
          </div>
        </details>
      </section>
    </AppPageFrame>
  );
}

type VaultActionRole = "governance-admin" | "vault-admin" | "strategist" | "guardian" | "keeper" | "controller-admin";

function isVaultActionRole(role: RoleSlug): role is VaultActionRole {
  return (
    role === "governance-admin" ||
    role === "vault-admin" ||
    role === "strategist" ||
    role === "guardian" ||
    role === "keeper" ||
    role === "controller-admin"
  );
}

function humanizeRoleLabel(role: VaultActionRole): string {
  return role
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function tabClass(active: boolean) {
  return [
    "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
    active ? "bg-accent g-on-accent" : "text-slate-300 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

function ReturnStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function queueStatusTone(status: "Pending" | "Partially Filled" | "Ready to Claim" | "Claimed") {
  if (status === "Claimed" || status === "Ready to Claim") {
    return "good" as const;
  }

  return "warn" as const;
}

function formatTxHashShort(hash: string): string {
  if (hash.length <= 14) {
    return hash;
  }

  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function formatTokenAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  if (value >= 1_000_000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  if (value >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function trimTokenAmount(value: string): string {
  const trimmed = value.replace(/\.?0+$/, "");
  return trimmed.length > 0 ? trimmed : "0";
}
