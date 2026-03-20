import type {
    ChainName,
    GovernanceProposal,
    GuardianControl,
    QueueEntry,
    VaultDetailData,
    VaultListRow,
} from "@/lib/mock-data";
import prisma from "@/lib/prisma";
import { etaForQueueStatus, isClaimedQueueStatus, mapQueueStatus } from "@/lib/server/queue-status";

interface VaultRowsFromDbResult {
  runId: string | null;
  rows: VaultListRow[];
  warnings: string[];
  provisionalFields: string[];
}

interface VaultDetailFromDbResult {
  runId: string | null;
  detail: VaultDetailData | null;
  strategyNotes: Array<{ time: string; note: string }>;
  proposals: GovernanceProposal[];
  guardianControls: GuardianControl[];
  queue: QueueEntry[];
}

function toFiniteNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeChain(network: string): ChainName {
  const lower = network.toLowerCase();
  if (lower.includes("base")) {
    return "Base";
  }
  if (lower.includes("eth")) {
    return "Ethereum";
  }
  return "Polkadot";
}

function shortAddress(address: string): string {
  if (address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatRelativeTime(input: Date): string {
  const diffMinutes = Math.max(0, Math.round((Date.now() - input.getTime()) / 60000));
  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${Math.round(diffHours / 24)}d ago`;
}


function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function unixSeconds(value: bigint | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  return Number.isFinite(value) ? value : 0;
}

function calculateApyFromSnapshots(
  snapshots: Array<{ pricePerShare: string; blockTimestamp: bigint }>,
  fallbackPricePerShare: string,
): number {
  const points = snapshots
    .map((snapshot) => ({
      pps: toFiniteNumber(snapshot.pricePerShare),
      ts: unixSeconds(snapshot.blockTimestamp),
    }))
    .filter((point) => point.pps > 0 && point.ts > 0)
    .sort((a, b) => a.ts - b.ts);

  if (points.length < 2) {
    return 0;
  }

  const start = points[0];
  const end = points[points.length - 1];
  const elapsedSeconds = Math.max(0, end.ts - start.ts);
  if (elapsedSeconds <= 0) {
    return 0;
  }

  const growth = end.pps / start.pps - 1;
  if (!Number.isFinite(growth)) {
    return 0;
  }

  const years = elapsedSeconds / (365 * 24 * 60 * 60);
  if (years <= 0) {
    return 0;
  }

  const annualized = growth / years;
  if (!Number.isFinite(annualized)) {
    return 0;
  }

  const fallbackPps = toFiniteNumber(fallbackPricePerShare);
  const dampener = fallbackPps > 0 ? 1 : 0.8;
  return Number(clamp(annualized * 100 * dampener, 0, 200).toFixed(2));
}

function calculateRiskScore(args: {
  paused: boolean;
  panickedStrategies: number;
  maxStrategyConcentrationPct: number;
  idleCoveragePct: number;
  openQueueItems: number;
}): number {
  let risk = 1;

  if (args.paused) {
    risk += 2;
  }

  risk += Math.min(2, args.panickedStrategies * 0.8);

  if (args.maxStrategyConcentrationPct >= 80) {
    risk += 1.2;
  } else if (args.maxStrategyConcentrationPct >= 60) {
    risk += 0.6;
  }

  if (args.idleCoveragePct < 8) {
    risk += 0.9;
  } else if (args.idleCoveragePct < 15) {
    risk += 0.4;
  }

  if (args.openQueueItems >= 25) {
    risk += 0.9;
  } else if (args.openQueueItems >= 10) {
    risk += 0.4;
  }

  return Math.round(clamp(risk, 1, 5));
}

function estimateQueueDepthHours(
  statuses: Array<{ status: string; updatedAt: Date }>,
  openQueueItems: number,
): number {
  if (openQueueItems === 0) {
    return 0;
  }

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const settledLastDay = statuses.filter(
    (status) => isClaimedQueueStatus(status.status) && status.updatedAt.getTime() >= oneDayAgo,
  ).length;

  const hoursPerItem = settledLastDay > 0 ? 24 / settledLastDay : 2;
  return Math.round(clamp(openQueueItems * hoursPerItem, 1, 168));
}

export async function getVaultRowsFromDb(runId?: string): Promise<VaultRowsFromDbResult> {
  const run = runId
    ? await prisma.deploymentRun.findUnique({
        where: { id: runId },
        select: { id: true, network: true },
      })
    : await prisma.deploymentRun.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, network: true },
      });

  if (!run) {
    return {
      runId: null,
      rows: [],
      warnings: ["No deployment run found in the database."],
      provisionalFields: ["apy", "riskScore", "queueDepthHours", "curator"],
    };
  }

  const [vaults, strategies] = await Promise.all([
    prisma.vault.findMany({
      where: { runId: run.id },
      orderBy: { createdAt: "desc" },
      select: {
        vaultKey: true,
        vaultName: true,
        governanceManager: true,
        assetSymbol: true,
        paused: true,
        totalAssets: true,
        idleAssets: true,
        pricePerShare: true,
      },
    }),
    prisma.strategy.findMany({
      where: { runId: run.id },
      select: {
        vaultKey: true,
        label: true,
        isPanicked: true,
        totalManagedAssets: true,
      },
    }),
  ]);

  const vaultKeys = vaults.map((vault) => vault.vaultKey);
  const [queueStatuses, priceSnapshots, roleMembers] = await Promise.all([
    vaultKeys.length
      ? prisma.queueEntryStatus.findMany({
          where: {
            vaultKey: { in: vaultKeys },
          },
          select: {
            vaultKey: true,
            status: true,
            updatedAt: true,
          },
        })
      : Promise.resolve([]),
    vaultKeys.length
      ? prisma.pricePerShareSnapshot.findMany({
          where: {
            runId: run.id,
            vaultKey: { in: vaultKeys },
          },
          orderBy: { blockTimestamp: "asc" },
          select: {
            vaultKey: true,
            pricePerShare: true,
            blockTimestamp: true,
          },
        })
      : Promise.resolve([]),
    vaults.length
      ? prisma.roleMember.findMany({
          where: {
            contractAddress: { in: vaults.map((vault) => vault.governanceManager.toLowerCase()) },
            isActive: true,
            roleName: {
              in: ["DEFAULT_ADMIN_ROLE", "ADMIN_ROLE", "OWNER_ROLE"],
            },
          },
          orderBy: { grantedAtBlock: "desc" },
          select: {
            contractAddress: true,
            account: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const strategiesByVault = new Map<string, string[]>();
  const strategyRiskStatsByVault = new Map<string, { panicked: number; maxAllocationUsd: number }>();
  for (const strategy of strategies) {
    const existing = strategiesByVault.get(strategy.vaultKey) ?? [];
    if (strategy.label) {
      existing.push(strategy.label);
    }
    strategiesByVault.set(strategy.vaultKey, existing);

    const riskStats = strategyRiskStatsByVault.get(strategy.vaultKey) ?? { panicked: 0, maxAllocationUsd: 0 };
    strategyRiskStatsByVault.set(strategy.vaultKey, {
      panicked: riskStats.panicked + (strategy.isPanicked ? 1 : 0),
      maxAllocationUsd: Math.max(riskStats.maxAllocationUsd, toFiniteNumber(strategy.totalManagedAssets)),
    });
  }

  const queueByVault = new Map<string, Array<{ status: string; updatedAt: Date }>>();
  for (const queueStatus of queueStatuses) {
    const existing = queueByVault.get(queueStatus.vaultKey) ?? [];
    existing.push({ status: queueStatus.status, updatedAt: queueStatus.updatedAt });
    queueByVault.set(queueStatus.vaultKey, existing);
  }

  const snapshotsByVault = new Map<string, Array<{ pricePerShare: string; blockTimestamp: bigint }>>();
  for (const snapshot of priceSnapshots) {
    const existing = snapshotsByVault.get(snapshot.vaultKey) ?? [];
    existing.push({ pricePerShare: snapshot.pricePerShare, blockTimestamp: snapshot.blockTimestamp });
    snapshotsByVault.set(snapshot.vaultKey, existing);
  }

  const curatorByManager = new Map<string, string>();
  for (const roleMember of roleMembers) {
    const key = roleMember.contractAddress.toLowerCase();
    if (!curatorByManager.has(key)) {
      curatorByManager.set(key, shortAddress(roleMember.account));
    }
  }

  const rows: VaultListRow[] = vaults.map((vault) => {
    const tvl = toFiniteNumber(vault.totalAssets);
    const idle = toFiniteNumber(vault.idleAssets);
    const exposurePct = tvl > 0 ? Math.min(100, Math.max(0, Math.round(((tvl - idle) / tvl) * 100))) : 0;
    const idleCoveragePct = tvl > 0 ? (idle / tvl) * 100 : 100;
    const strategyLabels = strategiesByVault.get(vault.vaultKey) ?? [];
    const strategyRiskStats = strategyRiskStatsByVault.get(vault.vaultKey) ?? { panicked: 0, maxAllocationUsd: 0 };
    const queueStatusesForVault = queueByVault.get(vault.vaultKey) ?? [];
    const openQueueItems = queueStatusesForVault.filter((status) => !isClaimedQueueStatus(status.status)).length;
    const maxStrategyConcentrationPct = tvl > 0 ? (strategyRiskStats.maxAllocationUsd / tvl) * 100 : 0;
    const riskScore = calculateRiskScore({
      paused: vault.paused,
      panickedStrategies: strategyRiskStats.panicked,
      maxStrategyConcentrationPct,
      idleCoveragePct,
      openQueueItems,
    });
    const apy = calculateApyFromSnapshots(snapshotsByVault.get(vault.vaultKey) ?? [], vault.pricePerShare);
    const queueDepthHours = estimateQueueDepthHours(queueStatusesForVault, openQueueItems);
    const managerKey = vault.governanceManager.toLowerCase();
    const curator = curatorByManager.get(managerKey) ?? shortAddress(vault.governanceManager);

    return {
      slug: vault.vaultKey,
      name: vault.vaultName ?? `${vault.assetSymbol} Vault`,
      asset: vault.assetSymbol,
      chain: normalizeChain(run.network),
      curator,
      guardianState: vault.paused ? "Watch" : "Healthy",
      apy,
      tvl,
      liquidityUsd: idle,
      exposurePct,
      riskScore,
      strategyPreview:
        strategyLabels.length > 0 ? strategyLabels.slice(0, 2).join(" + ") : `Run ${shortAddress(run.id)}`,
      queueDepthHours,
    };
  });

  return {
    runId: run.id,
    rows,
    warnings: [],
    provisionalFields: ["apy", "riskScore", "queueDepthHours", "curator"],
  };
}

export async function getVaultDetailFromDb(slug: string, runId?: string): Promise<VaultDetailFromDbResult> {
  const run = runId
    ? await prisma.deploymentRun.findUnique({
        where: { id: runId },
        select: { id: true, network: true },
      })
    : await prisma.deploymentRun.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, network: true },
      });

  if (!run) {
    return {
      runId: null,
      detail: null,
      strategyNotes: [],
      proposals: [],
      guardianControls: [],
      queue: [],
    };
  }

  const vault = await prisma.vault.findFirst({
    where: {
      runId: run.id,
      OR: [{ vaultKey: slug }, { address: slug }],
    },
    select: {
      vaultKey: true,
      vaultName: true,
      vaultSymbol: true,
      address: true,
      assetSymbol: true,
      paused: true,
      totalAssets: true,
      idleAssets: true,
      pricePerShare: true,
      governanceManager: true,
      createdAt: true,
      withdrawalFeeBps: true,
      shareSymbol: true,
    },
  });

  if (!vault) {
    return {
      runId: run.id,
      detail: null,
      strategyNotes: [],
      proposals: [],
      guardianControls: [],
      queue: [],
    };
  }

  const [strategies, snapshots, queueStatuses, deposits, withdrawals] = await Promise.all([
    prisma.strategy.findMany({
      where: { runId: run.id, vaultKey: vault.vaultKey },
      orderBy: { createdAt: "desc" },
      select: {
        label: true,
        capBps: true,
        totalManagedAssets: true,
        autoManaged: true,
        isPanicked: true,
      },
    }),
    prisma.pricePerShareSnapshot.findMany({
      where: { runId: run.id, vaultKey: vault.vaultKey },
      orderBy: { blockNumber: "asc" },
      take: 12,
      select: {
        blockNumber: true,
        pricePerShare: true,
      },
    }),
    prisma.queueEntryStatus.findMany({
      where: { vaultKey: vault.vaultKey },
      orderBy: [{ createdAt: "asc" }],
      select: {
        queueId: true,
        owner: true,
        netAssets: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.depositEvent.findMany({
      where: { runId: run.id, vaultKey: vault.vaultKey },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        actor: true,
        amount: true,
        note: true,
        createdAt: true,
      },
    }),
    prisma.withdrawalEvent.findMany({
      where: { runId: run.id, vaultKey: vault.vaultKey },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        actor: true,
        netAssets: true,
        queued: true,
        note: true,
        createdAt: true,
      },
    }),
  ]);

  const tvl = toFiniteNumber(vault.totalAssets);
  const idleAssets = toFiniteNumber(vault.idleAssets);
  const exposurePct = tvl > 0 ? Math.min(100, Math.max(0, Math.round(((tvl - idleAssets) / tvl) * 100))) : 0;
  const feePct = vault.withdrawalFeeBps / 100;

  const allocations =
    strategies.length > 0
      ? strategies.map((strategy) => {
          const amountUsd = toFiniteNumber(strategy.totalManagedAssets);
          return {
            strategy: strategy.label,
            allocationPct: tvl > 0 ? Math.min(100, Math.round((amountUsd / tvl) * 100)) : 0,
            apy: strategy.autoManaged ? 8.5 : 6.2,
            amountUsd,
          };
        })
      : [
          {
            strategy: "Idle Liquidity Buffer",
            allocationPct: 100,
            apy: 0,
            amountUsd: idleAssets,
          },
        ];

  const queue = queueStatuses.map((status, index) => {
    const mappedStatus = mapQueueStatus(status.status);
    return {
      id: status.queueId,
      requester: shortAddress(status.owner),
      requestUsd: toFiniteNumber(status.netAssets),
      position: index + 1,
      eta: etaForQueueStatus(mappedStatus),
      status: mappedStatus,
    };
  });

  const openQueueCount = queue.filter((entry) => entry.status !== "Claimed").length;

  const snapshotValues = snapshots
    .map((snapshot) => toFiniteNumber(snapshot.pricePerShare))
    .filter((value) => value > 0);

  const baselinePps = snapshotValues.length > 0 ? snapshotValues[0] : toFiniteNumber(vault.pricePerShare);
  const latestPps =
    snapshotValues.length > 0 ? snapshotValues[snapshotValues.length - 1] : toFiniteNumber(vault.pricePerShare);
  const changePct = baselinePps > 0 ? ((latestPps - baselinePps) / baselinePps) * 100 : 0;
  const apyNow = Number.isFinite(changePct) ? Math.max(changePct, 0) : 0;

  const performance =
    snapshotValues.length > 0
      ? snapshotValues.map((value, index) => {
          const pointChange = baselinePps > 0 ? ((value - baselinePps) / baselinePps) * 100 : 0;
          return {
            label: `P${index + 1}`,
            value: Number.isFinite(pointChange) ? Number(pointChange.toFixed(2)) : 0,
          };
        })
      : [
          { label: "P1", value: 0 },
          { label: "P2", value: apyNow },
        ];

  const strategyNotes = strategies.slice(0, 3).map((strategy) => ({
    time: "recent",
    note: `${strategy.label}: cap ${Number(strategy.capBps / 100).toFixed(2)}%, ${
      strategy.isPanicked ? "panicked" : "active"
    }`,
  }));

  const activity = [
    ...deposits.map((entry) => ({
      time: formatRelativeTime(entry.createdAt),
      event: "Deposit",
      actor: shortAddress(entry.actor),
      value: `${toFiniteNumber(entry.amount).toFixed(2)} ${vault.assetSymbol}`,
      tx: entry.note || "from indexer",
    })),
    ...withdrawals.map((entry) => ({
      time: formatRelativeTime(entry.createdAt),
      event: entry.queued ? "Withdrawal Requested" : "Withdrawal",
      actor: shortAddress(entry.actor),
      value: `${toFiniteNumber(entry.netAssets).toFixed(2)} ${vault.assetSymbol}`,
      tx: entry.note || "from indexer",
    })),
  ]
    .sort((a, b) => (a.time < b.time ? -1 : 1))
    .slice(0, 8);

  const detail: VaultDetailData = {
    slug: vault.vaultKey,
    name: vault.vaultName ?? `${vault.assetSymbol} Vault`,
    symbol: vault.vaultSymbol ?? vault.shareSymbol,
    chain: normalizeChain(run.network),
    asset: vault.assetSymbol,
    curator: "Protocol",
    guardianState: vault.paused ? "Watch" : "Healthy",
    apyNow,
    apy7d: Math.max(apyNow - 0.2, 0),
    apy30d: Math.max(apyNow - 0.5, 0),
    apy90d: apyNow + 0.3,
    tvl,
    liquidityUsd: idleAssets,
    exposurePct,
    riskScore: vault.paused ? 4 : 2,
    queueDepthHours: openQueueCount * 2,
    description: "DB-backed vault telemetry and activity feed.",
    performance,
    exposureMarkets: allocations.map((allocation) => ({
      market: allocation.strategy,
      vaultAllocationPct: allocation.allocationPct,
      amountUsd: allocation.amountUsd,
      supplyCapUsd: tvl,
      apy: allocation.apy,
      utilizationPct: allocation.allocationPct,
    })),
    allocations,
    risks: [
      "On-chain state can lag while indexers process finality.",
      "Queue settlement depends on strategy recall and idle liquidity.",
    ],
    activity,
    sharePrice: toFiniteNumber(vault.pricePerShare),
    performanceFeePct: feePct,
    feeRecipient: shortAddress(vault.governanceManager),
    curatorTvl: tvl,
    owner: shortAddress(vault.governanceManager),
    guardian: "Role-assigned guardian",
    timelockDuration: "Configured by governance",
    deploymentDate: vault.createdAt.toISOString().slice(0, 10),
    vaultVersion: "v1",
    contractAddress: vault.address,
    feeModel: `${feePct.toFixed(2)}% withdrawal fee`,
  };

  const proposals: GovernanceProposal[] = [];
  const guardianControls: GuardianControl[] = [
    {
      label: "Pause State",
      state: vault.paused ? "Paused" : "Unpaused",
      updatedAt: "recent",
    },
  ];

  return {
    runId: run.id,
    detail,
    strategyNotes,
    proposals,
    guardianControls,
    queue,
  };
}
