import prisma from "@/lib/prisma";
import type { PortfolioPosition, PortfolioWithdrawalRequest } from "@/lib/profile/portfolio";
import { etaForQueueStatus, mapQueueStatus } from "@/lib/server/queue-status";

interface DepositorPortfolioResult {
  runId: string | null;
  queryState: "ok" | "no_run";
  positions: PortfolioPosition[];
  withdrawalRequests: PortfolioWithdrawalRequest[];
}

function toFiniteNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getDepositorPortfolioFromDb(address: string): Promise<DepositorPortfolioResult> {
  const run = await prisma.deploymentRun.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!run) {
    return { runId: null, queryState: "no_run", positions: [], withdrawalRequests: [] };
  }

  const [vaults, deposits, withdrawals, queueStatuses] = await Promise.all([
    prisma.vault.findMany({
      where: { runId: run.id },
      select: {
        vaultKey: true,
        vaultName: true,
      },
    }),
    prisma.depositEvent.findMany({
      where: {
        runId: run.id,
        OR: [{ actor: { equals: address, mode: "insensitive" } }, { receiver: { equals: address, mode: "insensitive" } }],
      },
      select: {
        vaultKey: true,
        amount: true,
      },
    }),
    prisma.withdrawalEvent.findMany({
      where: {
        runId: run.id,
        OR: [{ actor: { equals: address, mode: "insensitive" } }, { receiver: { equals: address, mode: "insensitive" } }],
      },
      select: {
        vaultKey: true,
        netAssets: true,
      },
    }),
    prisma.queueEntryStatus.findMany({
      where: {
        OR: [{ owner: { equals: address, mode: "insensitive" } }, { receiver: { equals: address, mode: "insensitive" } }],
      },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        queueId: true,
        vaultKey: true,
        netAssets: true,
        status: true,
      },
    }),
  ]);

  const vaultNameByKey = new Map<string, string>();
  for (const vault of vaults) {
    vaultNameByKey.set(vault.vaultKey, vault.vaultName ?? vault.vaultKey);
  }

  const depositedByVault = new Map<string, number>();
  for (const entry of deposits) {
    depositedByVault.set(entry.vaultKey, (depositedByVault.get(entry.vaultKey) ?? 0) + toFiniteNumber(entry.amount));
  }

  const withdrawnByVault = new Map<string, number>();
  for (const entry of withdrawals) {
    withdrawnByVault.set(
      entry.vaultKey,
      (withdrawnByVault.get(entry.vaultKey) ?? 0) + toFiniteNumber(entry.netAssets),
    );
  }

  const pendingByVault = new Map<string, number>();
  for (const queue of queueStatuses) {
    const status = mapQueueStatus(queue.status);
    if (status === "Claimed") {
      continue;
    }
    pendingByVault.set(queue.vaultKey, (pendingByVault.get(queue.vaultKey) ?? 0) + toFiniteNumber(queue.netAssets));
  }

  const vaultKeys = new Set<string>([
    ...depositedByVault.keys(),
    ...withdrawnByVault.keys(),
    ...pendingByVault.keys(),
  ]);

  const netDepositsByVault = new Map<string, number>();
  let totalNetDeposits = 0;
  for (const vaultKey of vaultKeys) {
    const net = Math.max(0, (depositedByVault.get(vaultKey) ?? 0) - (withdrawnByVault.get(vaultKey) ?? 0));
    netDepositsByVault.set(vaultKey, net);
    totalNetDeposits += net;
  }

  const positions: PortfolioPosition[] = [...vaultKeys]
    .map((vaultKey) => {
      const depositedUsd = netDepositsByVault.get(vaultKey) ?? 0;
      const pendingWithdrawUsd = pendingByVault.get(vaultKey) ?? 0;
      return {
        slug: vaultKey,
        vault: vaultNameByKey.get(vaultKey) ?? vaultKey,
        depositedUsd,
        unrealizedPnlUsd: 0,
        allocationPct: totalNetDeposits > 0 ? Math.round((depositedUsd / totalNetDeposits) * 100) : 0,
        pendingWithdrawUsd,
      };
    })
    .sort((a, b) => b.depositedUsd - a.depositedUsd);

  const withdrawalRequests: PortfolioWithdrawalRequest[] = queueStatuses.map((queue) => {
    const status = mapQueueStatus(queue.status);
    return {
      id: queue.queueId,
      slug: queue.vaultKey,
      vault: vaultNameByKey.get(queue.vaultKey) ?? queue.vaultKey,
      requestUsd: toFiniteNumber(queue.netAssets),
      eta: etaForQueueStatus(status),
      status,
    };
  });

  return {
    runId: run.id,
    queryState: "ok",
    positions,
    withdrawalRequests,
  };
}