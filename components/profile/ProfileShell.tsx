import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { AppPageFrame, KpiStrip, StatusPill } from "@/components/app/AppPrimitives";
import { ProfileRoleSwitcher } from "@/components/profile/ProfileRoleSwitcher";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { polkadotTestnetContractDefaults } from "@/lib/contracts/registry";
import { getVaultBySlug, portfolioPositions, portfolioWithdrawalRequests } from "@/lib/mock-data";
import {
  type PortfolioPosition,
  type PortfolioWithdrawalRequest,
} from "@/lib/profile/portfolio";
import { RoleProfile, RoleSlug, humanizeRole } from "@/lib/profile/roles";
import { formatUsd, isValidEthereumAddress } from "@/lib/utils";
import type { QueueEntry, VaultDetailData, VaultListRow } from "@/lib/vaults/types";
import {
  allocateToStrategy,
  claimWithdrawalById,
  executeKeeperAllocate,
  executeKeeperHarvest,
  executeKeeperRecall,
  executeKeeperSettleWithdrawals,
  governanceApproveStrategy,
  governanceDisableStrategy,
  governanceGrantRole,
  governanceRevokeGuardian,
  governanceRevokeRole,
  governanceRevokeStrategist,
  governanceSetGuardian,
  governanceSetStrategist,
  governanceSetStrategyAutomationConfig,
  governanceSetStrategyCap,
  governanceSetTreasury,
  governanceSetWithdrawalFeeBps,
  grantControllerKeeperRole,
  grantVaultRole,
  harvestStrategy,
  mintVaultShares,
  panicVaultStrategy,
  pauseVault,
  rebalanceStrategies,
  recallAllFromStrategy,
  recallFromStrategyAssets,
  redeemVaultShares,
  rescueVaultToken,
  revokeControllerKeeperRole,
  revokeVaultRole,
  setControllerAutomationPaused,
  setControllerStrategyPolicy,
  setVaultIdlePolicy,
  unpauseVault,
  type VaultActionContext,
} from "@/lib/wallet/vault-actions";

type ActionStatus = { tone: "neutral" | "good" | "warn"; text: string };
  const isDemoPortfolioModeEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_PORTFOLIO === "true";

export function ProfileShell({
  role,
  ownedRoles,
  walletAddress,
}: {
  role: RoleProfile;
  ownedRoles: RoleSlug[];
  walletAddress?: string;
}) {
  return (
    <AppPageFrame title={role.title} subtitle={role.subtitle}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
        <Link href="/profile" className="hover:text-white">
          Profile
        </Link>
        <span>/</span>
        <span className="text-slate-200">{humanizeRole(role.slug)}</span>
      </div>

      {ownedRoles.length > 1 ? <ProfileRoleSwitcher activeRole={role.slug} roles={ownedRoles} /> : null}

      <KpiStrip items={role.kpis} />

      {role.slug === "depositor" ? <DepositorWorkspace walletAddress={walletAddress} /> : null}

      {role.slug !== "depositor" ? (
        <>
          {isActionRole(role.slug) ? <RoleActionWorkspace role={role.slug} /> : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <RoleSection title="Responsibilities" items={[role.responsibilities]} />
            <RoleSection title="What You Can Operate" items={role.canDo} />
          </div>

          <section className="g-glass mt-4 p-4 md:p-6">
            <h2 className="text-lg font-bold text-white">Current Operations Queue</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="vault-table min-w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Summary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {role.queue.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.summary}</td>
                      <td>
                        <StatusPill
                          text={item.state}
                          tone={item.state === "Ready" ? "good" : item.state === "Blocked" ? "warn" : "neutral"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="g-glass mt-4 p-4 md:p-6">
            <h2 className="text-lg font-bold text-white">Decision Flow</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <DecisionCard label="Approve" text={role.decisions.approve} tone="good" />
              <DecisionCard label="Reject" text={role.decisions.reject} tone="warn" />
              <DecisionCard label="Add" text={role.decisions.add} tone="neutral" />
            </div>
          </section>
        </>
      ) : null}
    </AppPageFrame>
  );
}

function isActionRole(role: RoleSlug): role is "governance-admin" | "vault-admin" | "strategist" | "guardian" | "keeper" | "controller-admin" {
  return (
    role === "governance-admin" ||
    role === "vault-admin" ||
    role === "strategist" ||
    role === "guardian" ||
    role === "keeper" ||
    role === "controller-admin"
  );
}

function RoleActionWorkspace({ role }: { role: "governance-admin" | "vault-admin" | "strategist" | "guardian" | "keeper" | "controller-admin" }) {
  if (role === "governance-admin") {
    return <GovernanceAdminWorkspace />;
  }
  if (role === "vault-admin") {
    return <VaultAdminWorkspace />;
  }
  if (role === "strategist") {
    return <StrategistWorkspace />;
  }
  if (role === "guardian") {
    return <GuardianWorkspace />;
  }
  if (role === "controller-admin") {
    return <ControllerAdminWorkspace />;
  }
  return <KeeperWorkspace />;
}

function parseAddressList(value: string): Array<`0x${string}`> {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => isValidEthereumAddress(entry)) as Array<`0x${string}`>;
}

function isValidRoleHash(value: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value.trim());
}

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

interface RoleVaultContextState {
  vaultRows: VaultListRow[];
  selectedVaultSlug: string;
  setSelectedVaultSlug: (next: string) => void;
  detail: VaultDetailData | null;
  queue: QueueEntry[];
  isLoading: boolean;
  error: string | null;
}

function useRoleVaultContext(): RoleVaultContextState {
  const [vaultRows, setVaultRows] = useState<VaultListRow[]>([]);
  const [selectedVaultSlug, setSelectedVaultSlug] = useState("");
  const [detail, setDetail] = useState<VaultDetailData | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadVaultRows = async () => {
      try {
        const response = await fetch("/api/vaults", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load vault list.");
        }

        const payload = (await response.json()) as { vaults?: VaultListRow[] };
        if (!active) {
          return;
        }

        const rows = Array.isArray(payload.vaults) ? payload.vaults : [];
        setVaultRows(rows);
        setSelectedVaultSlug((current) => current || rows[0]?.slug || "");
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to load vault list.");
      }
    };

    void loadVaultRows();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!selectedVaultSlug) {
      return;
    }

    const loadVaultDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/vaults/${selectedVaultSlug}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load vault context.");
        }

        const payload = (await response.json()) as {
          vault?: VaultDetailData | null;
          queue?: QueueEntry[];
          error?: string;
        };

        if (!active) {
          return;
        }

        if (!payload.vault) {
          throw new Error(payload.error || "Vault context is unavailable.");
        }

        setDetail(payload.vault);
        setQueue(Array.isArray(payload.queue) ? payload.queue : []);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to load vault context.");
        setDetail(null);
        setQueue([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadVaultDetail();

    return () => {
      active = false;
    };
  }, [selectedVaultSlug]);

  return {
    vaultRows,
    selectedVaultSlug,
    setSelectedVaultSlug,
    detail,
    queue,
    isLoading,
    error,
  };
}

function shortAddress(address: string) {
  if (!address) {
    return "N/A";
  }
  if (address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function RoleVaultContextPanel({
  title,
  state,
}: {
  title: string;
  state: RoleVaultContextState;
}) {
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-100">{title}</h3>
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-slate-400">
          Vault
          <select
            value={state.selectedVaultSlug}
            onChange={(event) => state.setSelectedVaultSlug(event.target.value)}
            className="rounded-lg border border-white/15 bg-slate-950/70 px-2 py-1 text-xs text-white outline-none focus:border-accent"
          >
            {state.vaultRows.map((row) => (
              <option key={row.slug} value={row.slug}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.error ? (
        <div className="mt-3">
          <StatusPill text={state.error} tone="warn" />
        </div>
      ) : null}

      {state.isLoading ? <p className="mt-3 text-sm text-slate-300">Loading vault context...</p> : null}

      {state.detail ? (
        <>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
              <p className="uppercase tracking-[0.12em] text-slate-400">Vault Address</p>
              <p className="mt-1 font-mono text-slate-100">{shortAddress(state.detail.contractAddress)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
              <p className="uppercase tracking-[0.12em] text-slate-400">Governance / Controller</p>
              <p className="mt-1 font-mono text-slate-100">
                {shortAddress(state.detail.governanceManagerAddress)} / {shortAddress(state.detail.automationControllerAddress)}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <section className="rounded-xl border border-white/10 bg-slate-950/40 p-3 lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Current Strategy Allocation</h4>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full text-xs text-slate-200">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="px-2 py-1 text-left">Strategy</th>
                      <th className="px-2 py-1 text-right">Managed</th>
                      <th className="px-2 py-1 text-right">Cap</th>
                      <th className="px-2 py-1 text-right">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.detail.strategyRows.map((row) => (
                      <tr key={row.address}>
                        <td className="px-2 py-1">{row.label}</td>
                        <td className="px-2 py-1 text-right">{formatUsd(row.managedAssetsUsd)}</td>
                        <td className="px-2 py-1 text-right">{(row.capBps / 100).toFixed(2)}%</td>
                        <td className="px-2 py-1 text-right">{(row.targetBps / 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                    {state.detail.strategyRows.length === 0 ? (
                      <tr>
                        <td className="px-2 py-2 text-slate-400" colSpan={4}>
                          No indexed strategy rows for this vault.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-200">
                <h4 className="font-semibold uppercase tracking-[0.12em] text-slate-300">Queue / Liquidity</h4>
                <p className="mt-1">Liquidity: {formatUsd(state.detail.liquidityUsd)}</p>
                <p>Queue depth: {state.detail.queueDepthHours}h</p>
                <p>Open requests: {state.queue.filter((item) => item.status !== "Claimed").length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-200">
                <h4 className="font-semibold uppercase tracking-[0.12em] text-slate-300">Role Membership</h4>
                <p className="mt-1">Curator: {state.detail.curator}</p>
                <p>Guardian: {state.detail.guardian}</p>
                <p>Governance owner: {state.detail.owner}</p>
                <p>Strategist/Keeper: Not indexed in current payload</p>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StrategistWorkspace() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [vaultAddress, setVaultAddress] = useState(polkadotTestnetContractDefaults.vault ?? "");
  const [strategyAddress, setStrategyAddress] = useState(polkadotTestnetContractDefaults.strategy ?? "");
  const [amount, setAmount] = useState("");
  const [recallOrder, setRecallOrder] = useState(polkadotTestnetContractDefaults.strategy ?? "");
  const [allocateOrder, setAllocateOrder] = useState(polkadotTestnetContractDefaults.strategy ?? "");
  const [status, setStatus] = useState<ActionStatus | null>(null);
  const vaultContext = useRoleVaultContext();

  useEffect(() => {
    if (!vaultContext.detail) {
      return;
    }

    const timer = setTimeout(() => {
      setVaultAddress(vaultContext.detail!.contractAddress);

      const strategyAddresses = vaultContext.detail!.strategyRows
        .map((row) => row.address)
        .filter((value) => isValidEthereumAddress(value));

      if (strategyAddresses[0]) {
        setStrategyAddress(strategyAddresses[0]);
        setRecallOrder(strategyAddresses.join(","));
        setAllocateOrder(strategyAddresses.join(","));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [vaultContext.detail]);

  const canWrite = Boolean(isConnected && address && publicClient && isValidEthereumAddress(vaultAddress));

  const buildContext = (): VaultActionContext => {
    if (!address || !publicClient || !isValidEthereumAddress(vaultAddress)) {
      throw new Error("Wallet or vault address is not ready.");
    }

    return {
      publicClient,
      writeContractAsync,
      userAddress: address,
      vaultAddress: vaultAddress as `0x${string}`,
    };
  };

  const withStatus = async (label: string, action: (context: VaultActionContext) => Promise<`0x${string}`>) => {
    if (!canWrite) {
      setStatus({ tone: "warn", text: "Connect wallet and provide a valid vault address." });
      return;
    }

    try {
      setStatus({ tone: "neutral", text: `${label} transaction submitted...` });
      const hash = await action(buildContext());
      setStatus({ tone: "good", text: `${label} confirmed: ${hash}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : `${label} failed`;
      setStatus({ tone: "warn", text: message });
    }
  };

  return (
    <section className="g-glass mt-4 p-4 md:p-6">
      <h2 className="text-lg font-bold text-white">Strategist Action Console</h2>
      <p className="mt-2 text-sm text-slate-300">Execute allocate, recall, harvest, and rebalance directly on ParaVault.</p>

      <RoleVaultContextPanel title="Strategist Vault Context" state={vaultContext} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Vault Address</span>
          <input
            value={vaultAddress}
            onChange={(event) => setVaultAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Strategy Address</span>
          <input
            value={strategyAddress}
            onChange={(event) => setStrategyAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Amount (asset units)</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.0"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            void withStatus("Allocate", (context) =>
              allocateToStrategy(context, strategyAddress as `0x${string}`, amount),
            )
          }
          className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
        >
          Allocate
        </button>
        <button
          type="button"
          onClick={() =>
            void withStatus("Recall", (context) =>
              recallFromStrategyAssets(context, strategyAddress as `0x${string}`, amount),
            )
          }
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Recall
        </button>
        <button
          type="button"
          onClick={() => void withStatus("Recall all", (context) => recallAllFromStrategy(context, strategyAddress as `0x${string}`))}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Recall All
        </button>
        <button
          type="button"
          onClick={() => void withStatus("Harvest", (context) => harvestStrategy(context, strategyAddress as `0x${string}`))}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Harvest
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Recall Order (comma-separated)</span>
          <input
            value={recallOrder}
            onChange={(event) => setRecallOrder(event.target.value)}
            placeholder="0x...,0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Allocate Order (comma-separated)</span>
          <input
            value={allocateOrder}
            onChange={(event) => setAllocateOrder(event.target.value)}
            placeholder="0x...,0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() =>
          void withStatus("Rebalance", (context) =>
            rebalanceStrategies(context, parseAddressList(recallOrder), parseAddressList(allocateOrder)),
          )
        }
        className="mt-4 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
      >
        Execute Rebalance
      </button>

      {status ? (
        <div className="mt-3">
          <StatusPill text={status.text} tone={status.tone} />
        </div>
      ) : null}

      {!isConnected ? <ConnectWalletButton actionLabel="Run Strategist Action" variant="compact" className="mt-4" /> : null}
    </section>
  );
}

function GovernanceAdminWorkspace() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [vaultAddress, setVaultAddress] = useState(polkadotTestnetContractDefaults.vault ?? "");
  const [governanceManagerAddress, setGovernanceManagerAddress] = useState(
    polkadotTestnetContractDefaults.governanceManager ?? "",
  );
  const [strategyAddress, setStrategyAddress] = useState(polkadotTestnetContractDefaults.strategy ?? "");
  const [strategistAddress, setStrategistAddress] = useState("");
  const [guardianAddress, setGuardianAddress] = useState("");
  const [treasuryAddress, setTreasuryAddress] = useState("");
  const [roleHash, setRoleHash] = useState("");
  const [roleAccountAddress, setRoleAccountAddress] = useState("");
  const [capBps, setCapBps] = useState("3500");
  const [targetBps, setTargetBps] = useState("3000");
  const [withdrawalFeeBps, setWithdrawalFeeBps] = useState("50");
  const [autoManaged, setAutoManaged] = useState(true);
  const [status, setStatus] = useState<ActionStatus | null>(null);
  const vaultContext = useRoleVaultContext();

  useEffect(() => {
    if (!vaultContext.detail) {
      return;
    }

    const timer = setTimeout(() => {
      setVaultAddress(vaultContext.detail!.contractAddress);
      if (isValidEthereumAddress(vaultContext.detail!.governanceManagerAddress)) {
        setGovernanceManagerAddress(vaultContext.detail!.governanceManagerAddress);
      }

      if (vaultContext.detail!.strategyRows[0]?.address && isValidEthereumAddress(vaultContext.detail!.strategyRows[0].address)) {
        setStrategyAddress(vaultContext.detail!.strategyRows[0].address);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [vaultContext.detail]);

  const canWrite = Boolean(
    isConnected &&
      address &&
      publicClient &&
      isValidEthereumAddress(vaultAddress) &&
      isValidEthereumAddress(governanceManagerAddress),
  );

  const buildContext = (): VaultActionContext => {
    if (!address || !publicClient || !isValidEthereumAddress(vaultAddress)) {
      throw new Error("Wallet or vault address is not ready.");
    }

    return {
      publicClient,
      writeContractAsync,
      userAddress: address,
      vaultAddress: vaultAddress as `0x${string}`,
    };
  };

  const withStatus = async (label: string, action: (context: VaultActionContext) => Promise<`0x${string}`>) => {
    if (!canWrite) {
      setStatus({ tone: "warn", text: "Connect wallet and provide valid vault/governance addresses." });
      return;
    }

    try {
      setStatus({ tone: "neutral", text: `${label} transaction submitted...` });
      const hash = await action(buildContext());
      setStatus({ tone: "good", text: `${label} confirmed: ${hash}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : `${label} failed`;
      setStatus({ tone: "warn", text: message });
    }
  };

  return (
    <section className="g-glass mt-4 p-4 md:p-6">
      <h2 className="text-lg font-bold text-white">Governance Admin Console</h2>
      <p className="mt-2 text-sm text-slate-300">Manage strategist/guardian assignment, strategy lifecycle, treasury, fee, and governance roles.</p>

      <RoleVaultContextPanel title="Governance Vault Context" state={vaultContext} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Vault Address</span>
          <input
            value={vaultAddress}
            onChange={(event) => setVaultAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Governance Manager Address</span>
          <input
            value={governanceManagerAddress}
            onChange={(event) => setGovernanceManagerAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Strategist Address</span>
          <input
            value={strategistAddress}
            onChange={(event) => setStrategistAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Guardian Address</span>
          <input
            value={guardianAddress}
            onChange={(event) => setGuardianAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (!isValidEthereumAddress(strategistAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid strategist address." });
              return;
            }
            void withStatus("Set strategist", (context) =>
              governanceSetStrategist(
                context,
                governanceManagerAddress as `0x${string}`,
                strategistAddress as `0x${string}`,
              ),
            );
          }}
          className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
        >
          Set Strategist
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isValidEthereumAddress(strategistAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid strategist address." });
              return;
            }
            void withStatus("Revoke strategist", (context) =>
              governanceRevokeStrategist(
                context,
                governanceManagerAddress as `0x${string}`,
                strategistAddress as `0x${string}`,
              ),
            );
          }}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Revoke Strategist
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isValidEthereumAddress(guardianAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid guardian address." });
              return;
            }
            void withStatus("Set guardian", (context) =>
              governanceSetGuardian(
                context,
                governanceManagerAddress as `0x${string}`,
                guardianAddress as `0x${string}`,
              ),
            );
          }}
          className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
        >
          Set Guardian
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isValidEthereumAddress(guardianAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid guardian address." });
              return;
            }
            void withStatus("Revoke guardian", (context) =>
              governanceRevokeGuardian(
                context,
                governanceManagerAddress as `0x${string}`,
                guardianAddress as `0x${string}`,
              ),
            );
          }}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Revoke Guardian
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Strategy Address</span>
          <input
            value={strategyAddress}
            onChange={(event) => setStrategyAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Cap BPS</span>
          <input
            value={capBps}
            onChange={(event) => setCapBps(event.target.value)}
            placeholder="3500"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (!isValidEthereumAddress(strategyAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid strategy address." });
              return;
            }
            void withStatus("Approve strategy", (context) =>
              governanceApproveStrategy(
                context,
                governanceManagerAddress as `0x${string}`,
                strategyAddress as `0x${string}`,
                Number(capBps),
              ),
            );
          }}
          className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
        >
          Approve Strategy
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isValidEthereumAddress(strategyAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid strategy address." });
              return;
            }
            void withStatus("Disable strategy", (context) =>
              governanceDisableStrategy(
                context,
                governanceManagerAddress as `0x${string}`,
                strategyAddress as `0x${string}`,
              ),
            );
          }}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Disable Strategy
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isValidEthereumAddress(strategyAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid strategy address." });
              return;
            }
            void withStatus("Set strategy cap", (context) =>
              governanceSetStrategyCap(
                context,
                governanceManagerAddress as `0x${string}`,
                strategyAddress as `0x${string}`,
                Number(capBps),
              ),
            );
          }}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Set Strategy Cap
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Target BPS</span>
          <input
            value={targetBps}
            onChange={(event) => setTargetBps(event.target.value)}
            placeholder="3000"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Automation Mode</span>
          <select
            value={autoManaged ? "true" : "false"}
            onChange={(event) => setAutoManaged(event.target.value === "true")}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            <option value="true">Auto managed</option>
            <option value="false">Manual</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!isValidEthereumAddress(strategyAddress)) {
            setStatus({ tone: "warn", text: "Provide a valid strategy address." });
            return;
          }
          void withStatus("Set automation config", (context) =>
            governanceSetStrategyAutomationConfig(
              context,
              governanceManagerAddress as `0x${string}`,
              strategyAddress as `0x${string}`,
              {
                targetBps: Number(targetBps),
                autoManaged,
              },
            ),
          );
        }}
        className="mt-4 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
      >
        Set Strategy Automation
      </button>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Treasury Address</span>
          <input
            value={treasuryAddress}
            onChange={(event) => setTreasuryAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Withdrawal Fee BPS</span>
          <input
            value={withdrawalFeeBps}
            onChange={(event) => setWithdrawalFeeBps(event.target.value)}
            placeholder="50"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (!isValidEthereumAddress(treasuryAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid treasury address." });
              return;
            }
            void withStatus("Set treasury", (context) =>
              governanceSetTreasury(
                context,
                governanceManagerAddress as `0x${string}`,
                treasuryAddress as `0x${string}`,
              ),
            );
          }}
          className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
        >
          Set Treasury
        </button>
        <button
          type="button"
          onClick={() =>
            void withStatus("Set withdrawal fee", (context) =>
              governanceSetWithdrawalFeeBps(
                context,
                governanceManagerAddress as `0x${string}`,
                Number(withdrawalFeeBps),
              ),
            )
          }
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Set Withdrawal Fee
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Role Hash (bytes32)</span>
          <input
            value={roleHash}
            onChange={(event) => setRoleHash(event.target.value)}
            placeholder="0x...64 hex chars"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Role Account Address</span>
          <input
            value={roleAccountAddress}
            onChange={(event) => setRoleAccountAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (!isValidRoleHash(roleHash)) {
              setStatus({ tone: "warn", text: "Provide a valid bytes32 role hash." });
              return;
            }
            if (!isValidEthereumAddress(roleAccountAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid role account address." });
              return;
            }
            void withStatus("Grant governance role", (context) =>
              governanceGrantRole(
                context,
                governanceManagerAddress as `0x${string}`,
                roleHash as `0x${string}`,
                roleAccountAddress as `0x${string}`,
              ),
            );
          }}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Grant Role
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isValidRoleHash(roleHash)) {
              setStatus({ tone: "warn", text: "Provide a valid bytes32 role hash." });
              return;
            }
            if (!isValidEthereumAddress(roleAccountAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid role account address." });
              return;
            }
            void withStatus("Revoke governance role", (context) =>
              governanceRevokeRole(
                context,
                governanceManagerAddress as `0x${string}`,
                roleHash as `0x${string}`,
                roleAccountAddress as `0x${string}`,
              ),
            );
          }}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Revoke Role
        </button>
      </div>

      {status ? (
        <div className="mt-3">
          <StatusPill text={status.text} tone={status.tone} />
        </div>
      ) : null}

      {!isConnected ? <ConnectWalletButton actionLabel="Run Governance Admin Action" variant="compact" className="mt-4" /> : null}
    </section>
  );
}

function VaultAdminWorkspace() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [vaultAddress, setVaultAddress] = useState(polkadotTestnetContractDefaults.vault ?? "");
  const [minIdleBps, setMinIdleBps] = useState("1200");
  const [rebalanceSlackBps, setRebalanceSlackBps] = useState("300");
  const [roleHash, setRoleHash] = useState("");
  const [roleAccountAddress, setRoleAccountAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [rescueAmount, setRescueAmount] = useState("0");
  const [shareAmount, setShareAmount] = useState("0");
  const [status, setStatus] = useState<ActionStatus | null>(null);
  const vaultContext = useRoleVaultContext();

  useEffect(() => {
    if (!vaultContext.detail) {
      return;
    }

    const timer = setTimeout(() => {
      setVaultAddress(vaultContext.detail!.contractAddress);
    }, 0);

    return () => clearTimeout(timer);
  }, [vaultContext.detail]);

  const canWrite = Boolean(isConnected && address && publicClient && isValidEthereumAddress(vaultAddress));

  const buildContext = (): VaultActionContext => {
    if (!address || !publicClient || !isValidEthereumAddress(vaultAddress)) {
      throw new Error("Wallet or vault address is not ready.");
    }

    return {
      publicClient,
      writeContractAsync,
      userAddress: address,
      vaultAddress: vaultAddress as `0x${string}`,
    };
  };

  const withStatus = async (label: string, action: (context: VaultActionContext) => Promise<`0x${string}`>) => {
    if (!canWrite) {
      setStatus({ tone: "warn", text: "Connect wallet and provide a valid vault address." });
      return;
    }

    try {
      setStatus({ tone: "neutral", text: `${label} transaction submitted...` });
      const hash = await action(buildContext());
      setStatus({ tone: "good", text: `${label} confirmed: ${hash}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : `${label} failed`;
      setStatus({ tone: "warn", text: message });
    }
  };

  return (
    <section className="g-glass mt-4 p-4 md:p-6">
      <h2 className="text-lg font-bold text-white">Vault Admin Console</h2>
      <p className="mt-2 text-sm text-slate-300">Manage idle policy, role assignment, rescue operation, and ERC4626 mint/redeem flows.</p>

      <RoleVaultContextPanel title="Vault Admin Context" state={vaultContext} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Vault Address</span>
          <input
            value={vaultAddress}
            onChange={(event) => setVaultAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Min Idle BPS</span>
          <input
            value={minIdleBps}
            onChange={(event) => setMinIdleBps(event.target.value)}
            placeholder="1200"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Rebalance Slack BPS</span>
          <input
            value={rebalanceSlackBps}
            onChange={(event) => setRebalanceSlackBps(event.target.value)}
            placeholder="300"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() =>
          void withStatus("Set idle policy", (context) =>
            setVaultIdlePolicy(context, Number(minIdleBps), Number(rebalanceSlackBps)),
          )
        }
        className="mt-4 rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
      >
        Set Idle Policy
      </button>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Role Hash (bytes32)</span>
          <input
            value={roleHash}
            onChange={(event) => setRoleHash(event.target.value)}
            placeholder="0x...64 hex chars"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Role Account Address</span>
          <input
            value={roleAccountAddress}
            onChange={(event) => setRoleAccountAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (!isValidRoleHash(roleHash)) {
              setStatus({ tone: "warn", text: "Provide a valid bytes32 role hash." });
              return;
            }
            if (!isValidEthereumAddress(roleAccountAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid role account address." });
              return;
            }
            void withStatus("Grant vault role", (context) =>
              grantVaultRole(context, roleHash as `0x${string}`, roleAccountAddress as `0x${string}`),
            );
          }}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Grant Vault Role
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isValidRoleHash(roleHash)) {
              setStatus({ tone: "warn", text: "Provide a valid bytes32 role hash." });
              return;
            }
            if (!isValidEthereumAddress(roleAccountAddress)) {
              setStatus({ tone: "warn", text: "Provide a valid role account address." });
              return;
            }
            void withStatus("Revoke vault role", (context) =>
              revokeVaultRole(context, roleHash as `0x${string}`, roleAccountAddress as `0x${string}`),
            );
          }}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Revoke Vault Role
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Rescue Token Address</span>
          <input
            value={tokenAddress}
            onChange={(event) => setTokenAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Rescue Recipient</span>
          <input
            value={recipientAddress}
            onChange={(event) => setRecipientAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Rescue Amount (asset units)</span>
          <input
            value={rescueAmount}
            onChange={(event) => setRescueAmount(event.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!isValidEthereumAddress(tokenAddress) || !isValidEthereumAddress(recipientAddress)) {
            setStatus({ tone: "warn", text: "Provide valid token and recipient addresses." });
            return;
          }
          void withStatus("Rescue token", (context) =>
            rescueVaultToken(
              context,
              tokenAddress as `0x${string}`,
              recipientAddress as `0x${string}`,
              rescueAmount,
            ),
          );
        }}
        className="mt-4 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-300"
      >
        Rescue Token
      </button>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Shares Amount</span>
          <input
            value={shareAmount}
            onChange={(event) => setShareAmount(event.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void withStatus("Mint shares", (context) => mintVaultShares(context, shareAmount))}
          className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
        >
          Mint
        </button>
        <button
          type="button"
          onClick={() => void withStatus("Redeem shares", (context) => redeemVaultShares(context, shareAmount))}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Redeem
        </button>
      </div>

      {status ? (
        <div className="mt-3">
          <StatusPill text={status.text} tone={status.tone} />
        </div>
      ) : null}

      {!isConnected ? <ConnectWalletButton actionLabel="Run Vault Admin Action" variant="compact" className="mt-4" /> : null}
    </section>
  );
}

function GuardianWorkspace() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [vaultAddress, setVaultAddress] = useState(polkadotTestnetContractDefaults.vault ?? "");
  const [strategyAddress, setStrategyAddress] = useState(polkadotTestnetContractDefaults.strategy ?? "");
  const [status, setStatus] = useState<ActionStatus | null>(null);
  const vaultContext = useRoleVaultContext();
  const expectedChainId = polkadotTestnetContractDefaults.chainId;
  const connectedChainId = publicClient?.chain?.id ?? null;
  const isChainMismatch = connectedChainId !== null && connectedChainId !== expectedChainId;

  useEffect(() => {
    if (!vaultContext.detail) {
      return;
    }

    const timer = setTimeout(() => {
      setVaultAddress(vaultContext.detail!.contractAddress);
      if (vaultContext.detail!.strategyRows[0]?.address && isValidEthereumAddress(vaultContext.detail!.strategyRows[0].address)) {
        setStrategyAddress(vaultContext.detail!.strategyRows[0].address);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [vaultContext.detail]);

  const canWrite = Boolean(
    isConnected &&
      address &&
      publicClient &&
      isValidEthereumAddress(vaultAddress.trim()) &&
      !isChainMismatch,
  );

  const buildContext = (): VaultActionContext => {
    const normalizedVaultAddress = vaultAddress.trim();
    if (!address || !publicClient || !isValidEthereumAddress(normalizedVaultAddress)) {
      throw new Error("Wallet or vault address is not ready.");
    }
    if (publicClient.chain?.id !== expectedChainId) {
      throw new Error(`Wrong network. Switch wallet to chain ${expectedChainId}.`);
    }

    return {
      publicClient,
      writeContractAsync,
      userAddress: address,
      vaultAddress: normalizedVaultAddress as `0x${string}`,
    };
  };

  const ensureContractCode = async (context: VaultActionContext, contractAddress: `0x${string}`) => {
    const bytecode = await context.publicClient.getCode({ address: contractAddress });
    if (!bytecode || bytecode === "0x") {
      throw new Error("Target contract was not found on the connected network.");
    }
  };

  const withStatus = async (label: string, action: (context: VaultActionContext) => Promise<`0x${string}`>) => {
    if (!canWrite) {
      setStatus({
        tone: "warn",
        text: isChainMismatch
          ? `Wrong network. Switch wallet to chain ${expectedChainId}.`
          : "Connect wallet and provide a valid vault address.",
      });
      return;
    }

    try {
      setStatus({ tone: "neutral", text: `${label} transaction submitted...` });
      const context = buildContext();
      await ensureContractCode(context, context.vaultAddress);
      const hash = await action(context);
      setStatus({ tone: "good", text: `${label} confirmed: ${hash}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : `${label} failed`;
      setStatus({ tone: "warn", text: message });
    }
  };

  return (
    <section className="g-glass mt-4 p-4 md:p-6">
      <h2 className="text-lg font-bold text-white">Guardian Safety Console</h2>
      <p className="mt-2 text-sm text-slate-300">Trigger pause and panic controls for incident handling and recovery.</p>

      <RoleVaultContextPanel title="Guardian Vault Context" state={vaultContext} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Vault Address</span>
          <input
            value={vaultAddress}
            onChange={(event) => setVaultAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Strategy Address (panic)</span>
          <input
            value={strategyAddress}
            onChange={(event) => setStrategyAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void withStatus("Pause", (context) => pauseVault(context))}
          className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-100"
        >
          Pause Vault
        </button>
        <button
          type="button"
          onClick={() => void withStatus("Unpause", (context) => unpauseVault(context))}
          className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100"
        >
          Unpause Vault
        </button>
        <button
          type="button"
          onClick={() =>
            void withStatus("Panic strategy", (context) =>
              panicVaultStrategy(context, strategyAddress as `0x${string}`),
            )
          }
          className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-300"
        >
          Panic Strategy
        </button>
      </div>

      {status ? (
        <div className="mt-3">
          <StatusPill text={status.text} tone={status.tone} />
        </div>
      ) : null}

      {!isConnected ? <ConnectWalletButton actionLabel="Run Guardian Action" variant="compact" className="mt-4" /> : null}
    </section>
  );
}

function KeeperWorkspace() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [vaultAddress, setVaultAddress] = useState(polkadotTestnetContractDefaults.vault ?? "");
  const [controllerAddress, setControllerAddress] = useState(polkadotTestnetContractDefaults.controller ?? "");
  const [strategyAddress, setStrategyAddress] = useState(polkadotTestnetContractDefaults.strategy ?? "");
  const [amount, setAmount] = useState("");
  const [maxCount, setMaxCount] = useState("5");
  const [status, setStatus] = useState<ActionStatus | null>(null);
  const vaultContext = useRoleVaultContext();

  useEffect(() => {
    if (!vaultContext.detail) {
      return;
    }

    const timer = setTimeout(() => {
      setVaultAddress(vaultContext.detail!.contractAddress);
      if (isValidEthereumAddress(vaultContext.detail!.automationControllerAddress)) {
        setControllerAddress(vaultContext.detail!.automationControllerAddress);
      }
      if (vaultContext.detail!.strategyRows[0]?.address && isValidEthereumAddress(vaultContext.detail!.strategyRows[0].address)) {
        setStrategyAddress(vaultContext.detail!.strategyRows[0].address);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [vaultContext.detail]);

  const canWrite = Boolean(
    isConnected &&
      address &&
      publicClient &&
      isValidEthereumAddress(vaultAddress) &&
      isValidEthereumAddress(controllerAddress),
  );

  const buildContext = (): VaultActionContext => {
    if (!address || !publicClient || !isValidEthereumAddress(vaultAddress)) {
      throw new Error("Wallet or vault address is not ready.");
    }

    return {
      publicClient,
      writeContractAsync,
      userAddress: address,
      vaultAddress: vaultAddress as `0x${string}`,
    };
  };

  const withStatus = async (label: string, action: (context: VaultActionContext) => Promise<`0x${string}`>) => {
    if (!canWrite) {
      setStatus({ tone: "warn", text: "Connect wallet and provide valid vault/controller addresses." });
      return;
    }

    try {
      setStatus({ tone: "neutral", text: `${label} transaction submitted...` });
      const hash = await action(buildContext());
      setStatus({ tone: "good", text: `${label} confirmed: ${hash}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : `${label} failed`;
      setStatus({ tone: "warn", text: message });
    }
  };

  return (
    <section className="g-glass mt-4 p-4 md:p-6">
      <h2 className="text-lg font-bold text-white">Keeper Execution Console</h2>
      <p className="mt-2 text-sm text-slate-300">Execute controller-scoped harvest, allocate, recall, and queue settlement jobs.</p>

      <RoleVaultContextPanel title="Keeper Vault Context" state={vaultContext} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Vault Address</span>
          <input
            value={vaultAddress}
            onChange={(event) => setVaultAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Controller Address</span>
          <input
            value={controllerAddress}
            onChange={(event) => setControllerAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Strategy Address</span>
          <input
            value={strategyAddress}
            onChange={(event) => setStrategyAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Amount (asset units)</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.0"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            void withStatus("Execute harvest", (context) =>
              executeKeeperHarvest(context, controllerAddress as `0x${string}`, strategyAddress as `0x${string}`),
            )
          }
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Harvest
        </button>
        <button
          type="button"
          onClick={() =>
            void withStatus("Execute allocate", (context) =>
              executeKeeperAllocate(
                context,
                controllerAddress as `0x${string}`,
                strategyAddress as `0x${string}`,
                amount,
              ),
            )
          }
          className="rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
        >
          Allocate
        </button>
        <button
          type="button"
          onClick={() =>
            void withStatus("Execute recall", (context) =>
              executeKeeperRecall(
                context,
                controllerAddress as `0x${string}`,
                strategyAddress as `0x${string}`,
                amount,
              ),
            )
          }
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Recall
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Settle max count</span>
          <input
            value={maxCount}
            onChange={(event) => setMaxCount(event.target.value)}
            placeholder="5"
            className="w-40 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={() =>
            void withStatus("Execute settle", (context) =>
              executeKeeperSettleWithdrawals(
                context,
                controllerAddress as `0x${string}`,
                Number(maxCount),
              ),
            )
          }
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Settle Withdrawals
        </button>
      </div>

      {status ? (
        <div className="mt-3">
          <StatusPill text={status.text} tone={status.tone} />
        </div>
      ) : null}

      {!isConnected ? <ConnectWalletButton actionLabel="Run Keeper Action" variant="compact" className="mt-4" /> : null}
    </section>
  );
}

function ControllerAdminWorkspace() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [vaultAddress, setVaultAddress] = useState(polkadotTestnetContractDefaults.vault ?? "");
  const [controllerAddress, setControllerAddress] = useState(polkadotTestnetContractDefaults.controller ?? "");
  const [strategyAddress, setStrategyAddress] = useState(polkadotTestnetContractDefaults.strategy ?? "");
  const [keeperAddress, setKeeperAddress] = useState("");
  const [minHarvestInterval, setMinHarvestInterval] = useState("3600");
  const [minRebalanceInterval, setMinRebalanceInterval] = useState("3600");
  const [maxAllocatePerExec, setMaxAllocatePerExec] = useState("100");
  const [maxRecallPerExec, setMaxRecallPerExec] = useState("100");
  const [policyEnabled, setPolicyEnabled] = useState(true);
  const [status, setStatus] = useState<ActionStatus | null>(null);
  const vaultContext = useRoleVaultContext();
  const expectedChainId = polkadotTestnetContractDefaults.chainId;
  const connectedChainId = publicClient?.chain?.id ?? null;
  const isChainMismatch = connectedChainId !== null && connectedChainId !== expectedChainId;

  useEffect(() => {
    if (!vaultContext.detail) {
      return;
    }

    const timer = setTimeout(() => {
      setVaultAddress(vaultContext.detail!.contractAddress);
      if (isValidEthereumAddress(vaultContext.detail!.automationControllerAddress)) {
        setControllerAddress(vaultContext.detail!.automationControllerAddress);
      }
      if (vaultContext.detail!.strategyRows[0]?.address && isValidEthereumAddress(vaultContext.detail!.strategyRows[0].address)) {
        setStrategyAddress(vaultContext.detail!.strategyRows[0].address);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [vaultContext.detail]);

  const canWrite = Boolean(
    isConnected &&
      address &&
      publicClient &&
      isValidEthereumAddress(vaultAddress.trim()) &&
      isValidEthereumAddress(controllerAddress.trim()) &&
      !isChainMismatch,
  );

  const buildContext = (): VaultActionContext => {
    const normalizedVaultAddress = vaultAddress.trim();
    if (!address || !publicClient || !isValidEthereumAddress(normalizedVaultAddress)) {
      throw new Error("Wallet or vault address is not ready.");
    }
    if (publicClient.chain?.id !== expectedChainId) {
      throw new Error(`Wrong network. Switch wallet to chain ${expectedChainId}.`);
    }

    return {
      publicClient,
      writeContractAsync,
      userAddress: address,
      vaultAddress: normalizedVaultAddress as `0x${string}`,
    };
  };

  const ensureContractCode = async (context: VaultActionContext, contractAddress: `0x${string}`) => {
    const bytecode = await context.publicClient.getCode({ address: contractAddress });
    if (!bytecode || bytecode === "0x") {
      throw new Error("Target contract was not found on the connected network.");
    }
  };

  const withStatus = async (
    label: string,
    action: (context: VaultActionContext) => Promise<`0x${string}`>,
    targetAddress?: `0x${string}`,
  ) => {
    if (!canWrite) {
      setStatus({
        tone: "warn",
        text: isChainMismatch
          ? `Wrong network. Switch wallet to chain ${expectedChainId}.`
          : "Connect wallet and provide valid vault/controller addresses.",
      });
      return;
    }

    try {
      setStatus({ tone: "neutral", text: `${label} transaction submitted...` });
      const context = buildContext();
      await ensureContractCode(context, targetAddress ?? context.vaultAddress);
      const hash = await action(context);
      setStatus({ tone: "good", text: `${label} confirmed: ${hash}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : `${label} failed`;
      setStatus({ tone: "warn", text: message });
    }
  };

  const submitPolicy = () => {
    if (!isValidEthereumAddress(strategyAddress)) {
      setStatus({ tone: "warn", text: "Provide a valid strategy address." });
      return;
    }

    const harvest = Number(minHarvestInterval);
    const rebalance = Number(minRebalanceInterval);
    if (!Number.isFinite(harvest) || harvest < 0 || !Number.isFinite(rebalance) || rebalance < 0) {
      setStatus({ tone: "warn", text: "Intervals must be non-negative numbers." });
      return;
    }

    void withStatus("Set strategy policy", (context) =>
      setControllerStrategyPolicy(
        context,
        controllerAddress.trim() as `0x${string}`,
        strategyAddress.trim() as `0x${string}`,
        {
          enabled: policyEnabled,
          minHarvestInterval: harvest,
          minRebalanceInterval: rebalance,
          maxAllocatePerExec,
          maxRecallPerExec,
        },
      ),
      controllerAddress.trim() as `0x${string}`,
    );
  };

  const grantKeeper = () => {
    if (!isValidEthereumAddress(keeperAddress)) {
      setStatus({ tone: "warn", text: "Provide a valid keeper address." });
      return;
    }

    void withStatus("Grant keeper role", (context) =>
      grantControllerKeeperRole(
        context,
        controllerAddress.trim() as `0x${string}`,
        keeperAddress.trim() as `0x${string}`,
      ),
      controllerAddress.trim() as `0x${string}`,
    );
  };

  const revokeKeeper = () => {
    if (!isValidEthereumAddress(keeperAddress)) {
      setStatus({ tone: "warn", text: "Provide a valid keeper address." });
      return;
    }

    void withStatus("Revoke keeper role", (context) =>
      revokeControllerKeeperRole(
        context,
        controllerAddress.trim() as `0x${string}`,
        keeperAddress.trim() as `0x${string}`,
      ),
      controllerAddress.trim() as `0x${string}`,
    );
  };

  return (
    <section className="g-glass mt-4 p-4 md:p-6">
      <h2 className="text-lg font-bold text-white">Controller Admin Console</h2>
      <p className="mt-2 text-sm text-slate-300">Manage automation pause state, strategy policy bounds, and controller keeper access.</p>

      <RoleVaultContextPanel title="Controller Vault Context" state={vaultContext} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Vault Address</span>
          <input
            value={vaultAddress}
            onChange={(event) => setVaultAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Controller Address</span>
          <input
            value={controllerAddress}
            onChange={(event) => setControllerAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            void withStatus("Pause automation", (context) =>
              setControllerAutomationPaused(context, controllerAddress.trim() as `0x${string}`, true),
              controllerAddress.trim() as `0x${string}`,
            )
          }
          className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-100"
        >
          Pause Automation
        </button>
        <button
          type="button"
          onClick={() =>
            void withStatus("Resume automation", (context) =>
              setControllerAutomationPaused(context, controllerAddress.trim() as `0x${string}`, false),
              controllerAddress.trim() as `0x${string}`,
            )
          }
          className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100"
        >
          Resume Automation
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Strategy Address</span>
          <input
            value={strategyAddress}
            onChange={(event) => setStrategyAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Policy Enabled</span>
          <select
            value={policyEnabled ? "true" : "false"}
            onChange={(event) => setPolicyEnabled(event.target.value === "true")}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Min Harvest Interval (s)</span>
          <input
            value={minHarvestInterval}
            onChange={(event) => setMinHarvestInterval(event.target.value)}
            placeholder="3600"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Min Rebalance Interval (s)</span>
          <input
            value={minRebalanceInterval}
            onChange={(event) => setMinRebalanceInterval(event.target.value)}
            placeholder="3600"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Max Allocate Per Exec (asset units)</span>
          <input
            value={maxAllocatePerExec}
            onChange={(event) => setMaxAllocatePerExec(event.target.value)}
            placeholder="100"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Max Recall Per Exec (asset units)</span>
          <input
            value={maxRecallPerExec}
            onChange={(event) => setMaxRecallPerExec(event.target.value)}
            placeholder="100"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={submitPolicy}
        className="mt-4 rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent"
      >
        Set Strategy Policy
      </button>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Keeper Address</span>
          <input
            value={keeperAddress}
            onChange={(event) => setKeeperAddress(event.target.value)}
            placeholder="0x..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={grantKeeper}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Grant Keeper
        </button>
        <button
          type="button"
          onClick={revokeKeeper}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200"
        >
          Revoke Keeper
        </button>
      </div>

      {status ? (
        <div className="mt-3">
          <StatusPill text={status.text} tone={status.tone} />
        </div>
      ) : null}

      {!isConnected ? <ConnectWalletButton actionLabel="Run Controller Admin Action" variant="compact" className="mt-4" /> : null}
    </section>
  );
}

function RoleSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="g-glass p-4 md:p-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-200">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-white/10 bg-white/5 p-3">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function DecisionCard({
  label,
  text,
  tone,
}: {
  label: "Approve" | "Reject" | "Add";
  text: string;
  tone: "good" | "warn" | "neutral";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        <StatusPill text={label} tone={tone} />
      </div>
      <p className="mt-2 text-sm text-slate-300">{text}</p>
    </div>
  );
}

export function ProfileNotFound({ role }: { role: string }) {
  return (
    <AppPageFrame
      title="Role Profile Not Found"
      subtitle="This role slug is not configured in the current profile workspace registry."
    >
      <section className="g-glass p-4 md:p-6">
        <p className="text-sm text-slate-300">
          The role <span className="font-semibold text-white">{role}</span> is unavailable. Open your profile home to access permitted workspaces.
        </p>
        <Link href="/profile" className="mt-4 inline-flex rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent transition hover:brightness-105">
          Open Profile Home
        </Link>
      </section>
    </AppPageFrame>
  );
}

export function ProfileLandingCards({ preferredRoles }: { preferredRoles: RoleSlug[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {preferredRoles.map((role) => (
        <Link
          key={role}
          href={`/profile/${role}`}
          className="g-glass rounded-2xl border border-white/10 p-4 transition hover:border-white/30"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Your Workspace</p>
          <h2 className="mt-2 text-lg font-bold text-white">{humanizeRole(role)}</h2>
          <p className="mt-3 text-sm text-slate-300">Open role-specific operations, decisions, and activity for this workspace.</p>
        </Link>
      ))}
    </div>
  );
}

function DepositorWorkspace({ walletAddress }: { walletAddress?: string }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [dbPositions, setDbPositions] = useState<PortfolioPosition[]>([]);
  const [dbWithdrawalRequests, setDbWithdrawalRequests] = useState<PortfolioWithdrawalRequest[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [portfolioQueryState, setPortfolioQueryState] = useState<string | null>(null);
  const [vaultAddressBySlug, setVaultAddressBySlug] = useState<Record<string, string>>({});
  const [claimingRequestId, setClaimingRequestId] = useState<string | null>(null);
  const [locallyCompletedRequestIds, setLocallyCompletedRequestIds] = useState<string[]>([]);
  const [actionStatus, setActionStatus] = useState<{ tone: "neutral" | "good" | "warn"; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    const loadPortfolio = async () => {
      setPortfolioLoading(true);
      setPortfolioError(null);

      if (!walletAddress) {
        setDbPositions([]);
        setDbWithdrawalRequests([]);
        setPortfolioQueryState(null);
        setPortfolioLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams({ address: walletAddress });
        const response = await fetch(`/api/profile/depositor?${query.toString()}`, { cache: "no-store" });
        if (!response.ok) {
          if (active) {
            setPortfolioError("Unable to load depositor portfolio from database.");
            setDbPositions([]);
            setDbWithdrawalRequests([]);
            setPortfolioQueryState(null);
          }
          return;
        }

        const payload = (await response.json()) as {
          positions?: PortfolioPosition[];
          withdrawalRequests?: PortfolioWithdrawalRequest[];
          queryState?: string;
          error?: string;
        };

        if (!active) {
          return;
        }

        setDbPositions(Array.isArray(payload.positions) ? payload.positions : []);
        setDbWithdrawalRequests(Array.isArray(payload.withdrawalRequests) ? payload.withdrawalRequests : []);
        setPortfolioQueryState(payload.queryState ?? null);
        setPortfolioError(payload.error ?? null);
      } catch {
        if (active) {
          setPortfolioError("Unable to load depositor portfolio from database.");
          setDbPositions([]);
          setDbWithdrawalRequests([]);
          setPortfolioQueryState(null);
        }
      } finally {
        if (active) {
          setPortfolioLoading(false);
        }
      }
    };

    loadPortfolio();

    return () => {
      active = false;
    };
  }, [walletAddress]);

  const useMockFallback =
    isDemoPortfolioModeEnabled &&
    !portfolioLoading &&
    !portfolioError &&
    dbPositions.length === 0 &&
    dbWithdrawalRequests.length === 0;

  const positions = useMockFallback ? portfolioPositions : dbPositions;
  const withdrawalRequests = useMockFallback ? portfolioWithdrawalRequests : dbWithdrawalRequests;

  useEffect(() => {
    let active = true;

    const fetchVaultAddresses = async () => {
      const uniqueSlugs = [...new Set(withdrawalRequests.map((item) => item.slug))];
      const addressEntries = await Promise.all(
        uniqueSlugs.map(async (slug) => {
          try {
            const response = await fetch(`/api/vaults/${slug}`, { cache: "no-store" });
            if (!response.ok) {
              return [slug, getVaultBySlug(slug)?.contractAddress ?? ""] as const;
            }
            const payload = (await response.json()) as { vault?: { contractAddress?: string } };
            return [slug, payload.vault?.contractAddress ?? getVaultBySlug(slug)?.contractAddress ?? ""] as const;
          } catch {
            return [slug, getVaultBySlug(slug)?.contractAddress ?? ""] as const;
          }
        }),
      );

      if (!active) {
        return;
      }

      setVaultAddressBySlug((current) => {
        const next = { ...current };
        for (const [slug, contractAddress] of addressEntries) {
          if (contractAddress) {
            next[slug] = contractAddress;
          }
        }
        return next;
      });
    };

    void fetchVaultAddresses();

    return () => {
      active = false;
    };
  }, [withdrawalRequests]);

  const reloadPortfolio = async () => {
    if (!walletAddress) {
      return;
    }

    try {
      const query = new URLSearchParams({ address: walletAddress });
      const response = await fetch(`/api/profile/depositor?${query.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        setActionStatus({ tone: "warn", text: "Unable to refresh portfolio data from database." });
        return;
      }

      const payload = (await response.json()) as {
        positions?: PortfolioPosition[];
        withdrawalRequests?: PortfolioWithdrawalRequest[];
        queryState?: string;
        error?: string;
      };

      setDbPositions(Array.isArray(payload.positions) ? payload.positions : []);
      setDbWithdrawalRequests(Array.isArray(payload.withdrawalRequests) ? payload.withdrawalRequests : []);
      setPortfolioQueryState(payload.queryState ?? null);
      setPortfolioError(payload.error ?? null);
    } catch {
      setActionStatus({ tone: "warn", text: "Unable to refresh portfolio data from database." });
    }
  };

  const buildActionContext = (vaultAddress: string): VaultActionContext => {
    if (!address || !publicClient || !isValidEthereumAddress(vaultAddress)) {
      throw new Error("Wallet or vault address is not ready for claim action.");
    }

    return {
      publicClient,
      writeContractAsync,
      userAddress: address,
      vaultAddress: vaultAddress as `0x${string}`,
    };
  };

  const handleClaim = async (request: PortfolioWithdrawalRequest) => {
    if (!isConnected) {
      setActionStatus({ tone: "warn", text: "Connect wallet before claiming." });
      return;
    }

    const vaultAddress = vaultAddressBySlug[request.slug];
    if (!isValidEthereumAddress(vaultAddress ?? "")) {
      setActionStatus({ tone: "warn", text: `Missing vault contract address for ${request.slug}.` });
      return;
    }

    const queueId = extractQueueId(request.id);
    if (queueId === null) {
      setActionStatus({ tone: "warn", text: `Invalid queue id from portfolio data: ${request.id}` });
      return;
    }

    try {
      setClaimingRequestId(request.id);
      setActionStatus({ tone: "neutral", text: "Submitting claim transaction..." });
      const context = buildActionContext(vaultAddress);
      const hash = await claimWithdrawalById(context, queueId);
      await fetch("/api/profile/depositor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: walletAddress ?? address,
          queueId: request.id,
          vaultKey: request.slug,
          status: "claimed",
        }),
      });
      setLocallyCompletedRequestIds((current) =>
        current.includes(request.id) ? current : [...current, request.id],
      );
      setActionStatus({ tone: "good", text: `Claim confirmed: ${hash}` });
      await reloadPortfolio();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Claim failed";
      setActionStatus({ tone: "warn", text: message });
    } finally {
      setClaimingRequestId(null);
    }
  };

  const totalDeposited = positions.reduce((sum, row) => sum + row.depositedUsd, 0);
  const totalPnl = positions.reduce((sum, row) => sum + row.unrealizedPnlUsd, 0);
  const pending = positions.reduce((sum, row) => sum + row.pendingWithdrawUsd, 0);
  const hasNoPortfolioData =
    !portfolioLoading && !portfolioError && !useMockFallback && positions.length === 0 && withdrawalRequests.length === 0;

  return (
    <>
      {portfolioLoading ? <p className="mt-4 text-sm text-slate-300">Loading portfolio data from database...</p> : null}
      {portfolioError ? (
        <div className="mt-2">
          <StatusPill text={portfolioError} tone="warn" />
        </div>
      ) : null}
      {useMockFallback ? (
        <div className="mt-2">
          <StatusPill text="Demo portfolio mode is enabled; showing synthetic balances." tone="neutral" />
        </div>
      ) : null}

      <section className="g-glass mt-4 p-4 md:p-6">
        <h2 className="text-lg font-bold text-white">My Positions</h2>
        {hasNoPortfolioData ? (
          <p className="mt-2 text-sm text-slate-300">
            {portfolioQueryState === "no_run"
              ? "No indexed deployment run found yet. Portfolio data will appear after first index sync."
              : "No positions or withdrawal requests found for this wallet yet."}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-slate-300">
          Deposited {formatUsd(totalDeposited)} across active vault positions with {formatUsd(totalPnl)} unrealized performance and {formatUsd(pending)} pending exits.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="vault-table min-w-full">
            <thead>
              <tr>
                <th>Vault</th>
                <th>Deposited</th>
                <th>PnL</th>
                <th>Allocation</th>
                <th>Pending Withdraw</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.slug}>
                  <td>{position.vault}</td>
                  <td>{formatUsd(position.depositedUsd)}</td>
                  <td className={position.unrealizedPnlUsd >= 0 ? "text-emerald-300" : "text-rose-300"}>
                    {formatUsd(position.unrealizedPnlUsd)}
                  </td>
                  <td>{position.allocationPct}%</td>
                  <td>{formatUsd(position.pendingWithdrawUsd)}</td>
                  <td>
                    <Link href={`/vaults/${position.slug}`} className="text-accent hover:underline">
                      Open Vault
                    </Link>
                  </td>
                </tr>
              ))}
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-400">
                    No active positions.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="g-glass mt-4 p-4 md:p-6">
        <h2 className="text-lg font-bold text-white">Withdrawal Requests</h2>
        {actionStatus ? (
          <div className="mt-2">
            <StatusPill text={actionStatus.text} tone={actionStatus.tone} />
          </div>
        ) : null}
        <div className="mt-4 overflow-x-auto">
          <table className="vault-table min-w-full">
            <thead>
              <tr>
                <th>Request</th>
                <th>Vault</th>
                <th>Amount</th>
                <th>ETA</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawalRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>
                    <Link href={`/vaults/${request.slug}`} className="text-accent hover:underline">
                      {request.vault}
                    </Link>
                  </td>
                  <td>{formatUsd(request.requestUsd)}</td>
                  <td>{request.eta}</td>
                  <td>{locallyCompletedRequestIds.includes(request.id) ? "Claimed" : request.status}</td>
                  <td>
                    {request.status === "Ready to Claim" && !locallyCompletedRequestIds.includes(request.id) ? (
                      <button
                        type="button"
                        className="rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] g-on-accent transition hover:brightness-105"
                        onClick={() => void handleClaim(request)}
                        disabled={claimingRequestId === request.id}
                      >
                        {claimingRequestId === request.id ? "Claiming..." : "Claim"}
                      </button>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        {locallyCompletedRequestIds.includes(request.id) ? "Claimed" : "Waiting"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawalRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-400">
                    No withdrawal requests.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <ConnectWalletButton actionLabel="Claim" variant="compact" className="mt-4" />
      </section>
    </>
  );
}
